'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/packages/core/hooks/useAuth';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Garden } from '@/types';
import NDVIDashboard from '@/components/ndvi/NDVIDashboard';
import { Satellite, ChevronDown, MapPin } from 'lucide-react';

export default function NDVIPage() {
  const { user } = useAuth();
  const { storageProvider } = useStorage();
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGardenSelector, setShowGardenSelector] = useState(false);

  useEffect(() => {
    loadGardens();
  }, [user]);

  const loadGardens = async () => {
    if (!user) return;
    
    try {
      const gardensData = await storageProvider.getGardens();
      setGardens(gardensData);
      
      // Seleziona il primo garden se disponibile
      if (gardensData.length > 0 && !selectedGarden) {
        setSelectedGarden(gardensData[0]);
      }
    } catch (error) {
      console.error('Errore caricamento gardens:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Satellite className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (gardens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Satellite className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nessun Garden Disponibile</h2>
          <p className="text-gray-600 mb-6">
            Crea il tuo primo garden per iniziare a monitorare la vegetazione con i dati satellitari NDVI.
          </p>
          <button
            onClick={() => window.location.href = '/app/gardens'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crea Garden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Satellite className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Monitoraggio NDVI</h1>
                  <p className="text-sm text-gray-500">Analisi satellitare della vegetazione</p>
                </div>
              </div>
            </div>

            {/* Garden Selector */}
            {gardens.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowGardenSelector(!showGardenSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {selectedGarden?.name || 'Seleziona Garden'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showGardenSelector && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      {gardens.map(garden => (
                        <button
                          key={garden.id}
                          onClick={() => {
                            setSelectedGarden(garden);
                            setShowGardenSelector(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedGarden?.id === garden.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="font-medium">{garden.name}</div>
                          <div className="text-sm text-gray-500">
                            {garden.coordinates ? `${garden.coordinates.latitude.toFixed(3)}, ${garden.coordinates.longitude.toFixed(3)}` : 'Posizione non definita'} • {(garden.sizeSqMeters / 10000).toFixed(2)} ha
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedGarden ? (
          <NDVIDashboard garden={selectedGarden} />
        ) : (
          <div className="text-center py-12">
            <Satellite className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Seleziona un Garden</h3>
            <p className="text-gray-500">Scegli un garden per visualizzare i dati NDVI satellitari</p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border-t border-blue-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Satellite className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Cos'è l'NDVI?</h3>
              <p className="text-blue-800 text-sm leading-relaxed mb-3">
                L'<strong>Indice di Vegetazione a Differenza Normalizzata (NDVI)</strong> è un indicatore che misura 
                la salute e la densità della vegetazione utilizzando dati satellitari. Valori più alti indicano 
                vegetazione più sana e densa.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium text-blue-900 mb-1">📡 Fonte Dati</div>
                  <div className="text-blue-700">Sentinel-2 ESA • Risoluzione 10m • Aggiornamento ogni 5 giorni</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium text-blue-900 mb-1">📊 Range Valori</div>
                  <div className="text-blue-700">-1.0 (acqua) • 0.0-0.2 (suolo) • 0.2-0.8 (vegetazione) • 0.8+ (ottimale)</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium text-blue-900 mb-1">🎯 Applicazioni</div>
                  <div className="text-blue-700">Stress idrico • Carenze nutrizionali • Malattie • Pianificazione irrigazione</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}