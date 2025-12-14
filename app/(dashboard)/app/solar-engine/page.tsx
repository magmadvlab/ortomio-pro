/**
 * Solar Engine Page
 * Vista completa del Solar Engine con mappa punti, score, rotazioni e confronti
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Garden } from '@/types';
import { useGarden } from '@/packages/core/hooks/useGarden';
import GardenPointScoreCard from '@/components/sunExposure/GardenPointScoreCard';
import RotationCalendar from '@/components/sunExposure/RotationCalendar';
import NaiveComparison from '@/components/sunExposure/NaiveComparison';
import { calculateGardenPointScores, GardenPoint } from '@/services/gardenPointScorer';
import { generatePointRotation } from '@/services/pointRotationGenerator';
import { compareNaiveVsOptimized } from '@/services/naiveComparisonService';
import { calculateSeasonalWindows } from '@/services/seasonalSunWindows';
import { getAllHistoricalWeather } from '@/services/historicalWeatherService';
import { Sun, Plus, MapPin, Calendar, BarChart3, ArrowLeft } from 'lucide-react';

export default function SolarEnginePage() {
  const router = useRouter();
  const { activeGarden } = useGarden();
  const [selectedPoint, setSelectedPoint] = useState<GardenPoint | null>(null);
  const [pointScore, setPointScore] = useState<any>(null);
  const [pointRotation, setPointRotation] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeGarden) {
      router.push('/app/dashboard');
      return;
    }

    // Carica punti esistenti o inizializza
    if (activeGarden.points && activeGarden.points.length > 0) {
      // Calcola score per tutti i punti
      loadPointData(activeGarden.points[0]);
    }
  }, [activeGarden]);

  const loadPointData = async (point: GardenPoint) => {
    if (!activeGarden || !activeGarden.coordinates) return;

    setLoading(true);
    setSelectedPoint(point);

    try {
      const lat = activeGarden.coordinates.latitude;
      const lng = activeGarden.coordinates.longitude;
      const obstacles = activeGarden.obstacles || [];
      const year = new Date().getFullYear();

      // Calcola finestre stagionali
      const windows = calculateSeasonalWindows(
        lat,
        lng,
        obstacles,
        year,
        activeGarden.altitudeMeters,
        activeGarden.soilType
      );

      // Recupera dati meteo storici
      const historicalWeather = await getAllHistoricalWeather(lat, lng, year);
      const validWeather = historicalWeather.filter((w): w is NonNullable<typeof w> => w !== null);

      // Calcola score per il punto
      const score = calculateGardenPointScores(
        point,
        windows,
        validWeather.length > 0 ? validWeather : undefined,
        activeGarden.soilType,
        activeGarden.altitudeMeters
      );
      setPointScore(score);

      // Genera rotazione
      const rotation = generatePointRotation(
        point,
        score,
        windows,
        activeGarden.soilType,
        activeGarden.altitudeMeters
      );
      setPointRotation(rotation);

      // Genera confronto naive (esempio con pomodoro)
      if (score.scores.ortoEstivo < 70) {
        const naiveComparison = compareNaiveVsOptimized(
          point,
          'Pomodoro',
          score,
          rotation
        );
        setComparison(naiveComparison);
      }
    } catch (error) {
      console.error('Error loading point data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!activeGarden) {
    return (
      <div className="p-6">
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <Sun size={24} className="text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Solar Engine</h1>
            <p className="text-sm text-gray-600">
              Analisi solare e rotazioni ottimizzate per {activeGarden.name}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            // TODO: Apri modal per creare nuovo punto
            alert('Funzionalità di creazione punto in sviluppo');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={18} />
          Nuovo Punto
        </button>
      </div>

      {/* Punti Disponibili */}
      {activeGarden.points && activeGarden.points.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Lista Punti */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <MapPin size={18} />
              Punti Mappati
            </h2>
            <div className="space-y-2">
              {activeGarden.points.map((point) => (
                <button
                  key={point.id}
                  onClick={() => loadPointData(point)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedPoint?.id === point.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-800">{point.name}</div>
                  {point.score && (
                    <div className="text-xs text-gray-600 mt-1">
                      Score max: {Math.max(
                        point.score.scores.ortoEstivo,
                        point.score.scores.fogliaPrimavera,
                        point.score.scores.fogliaEstate,
                        point.score.scores.aromatiche
                      )}%
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Calcolo score e rotazioni...</p>
              </div>
            ) : (
              <>
                {/* Score Card */}
                {pointScore && selectedPoint && (
                  <GardenPointScoreCard score={pointScore} showDetails={true} />
                )}

                {/* Rotation Calendar */}
                {pointRotation.length > 0 && (
                  <RotationCalendar
                    rotation={pointRotation}
                    pointName={selectedPoint?.name}
                  />
                )}

                {/* Naive Comparison */}
                {comparison && (
                  <NaiveComparison comparison={comparison} />
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <MapPin size={48} className="text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nessun punto mappato
          </h3>
          <p className="text-gray-600 mb-4">
            Crea il primo punto dell'orto per iniziare l'analisi solare.
          </p>
          <button
            onClick={() => {
              // TODO: Apri modal per creare nuovo punto
              alert('Funzionalità di creazione punto in sviluppo');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Crea Primo Punto
          </button>
        </div>
      )}
    </div>
  );
}

