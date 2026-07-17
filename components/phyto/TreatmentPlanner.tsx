/**
 * Treatment Planner Component
 * Pianificazione trattamento completo con verifica timing meteo
 */

import React, { useState, useEffect } from 'react';
import { PlantMasterSheet, Garden, UserProfile } from '../../types';
import { suggestPhytoProduct, checkTreatmentTiming, PhytoRecommendation } from '../../logic/phytoEngine';
import { registerTreatment } from '../../services/treatmentRegistryService';
import { getWeatherForecast } from '../../services/weatherService';
import { AlertTriangle, CheckCircle, Calendar, Wind, Droplets } from 'lucide-react';
import { useStorage } from '@/packages/core/hooks/useStorage';

interface TreatmentPlannerProps {
  plant: PlantMasterSheet;
  problem: string;
  garden: Garden;
  userProfile?: UserProfile;
  harvestDate?: Date;
}

const TreatmentPlanner: React.FC<TreatmentPlannerProps> = ({
  plant,
  problem,
  garden,
  userProfile,
  harvestDate,
}) => {
  const { storageProvider } = useStorage();
  const [recommendation, setRecommendation] = useState<PhytoRecommendation | null>(null);
  const [timingCheck, setTimingCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weatherForecast, setWeatherForecast] = useState<any>(null);

  useEffect(() => {
    loadRecommendation();
  }, [problem, plant, garden.id, storageProvider]);

  const loadRecommendation = async () => {
    setLoading(true);
    try {
      // Carica previsioni meteo
      if (garden.coordinates) {
        const forecast = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude);
        setWeatherForecast(forecast);
      }

      // Suggerisci prodotto
      const rec = await suggestPhytoProduct(problem, plant, weatherForecast, userProfile);
      setRecommendation(rec);

      // Verifica timing
      if (rec && harvestDate) {
        const check = await checkTreatmentTiming(rec.product, weatherForecast, harvestDate);
        setTimingCheck(check);
      }
    } catch (error) {
      console.error('Error loading treatment recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTreatment = async () => {
    if (!recommendation) return;

    try {
      await registerTreatment(storageProvider, garden.id, {
        product: recommendation.product,
        plantName: plant.commonName,
        treatmentDate: new Date(),
        dosage: `${recommendation.dosage.amount} ${recommendation.dosage.unit}`,
        applicationMethod: recommendation.method,
        targetPestDisease: problem,
        weatherConditions: weatherForecast
          ? {
              temp: weatherForecast.tempMin || 0,
              humidity: 0,
              wind: weatherForecast.wind || 0,
            }
          : undefined,
      });
      alert('Trattamento registrato con successo');
    } catch (error) {
      console.error('Error registering treatment:', error);
      alert('Errore durante registrazione trattamento');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
        <p>Nessun prodotto disponibile per questo problema</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Pianificazione Trattamento</h3>

      {/* Prodotto Consigliato */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle size={18} className="text-green-600" />
          <span className="font-semibold text-green-800">{recommendation.product.name}</span>
          <span className="text-xs px-2 py-1 bg-white rounded-full text-green-700">
            {recommendation.product.type === 'bio' ? 'Bio' : 'Convenzionale'}
          </span>
        </div>
        <p className="text-sm text-green-700">{recommendation.reason}</p>
      </div>

      {/* Dosaggio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-600">Dosaggio</div>
          <div className="font-semibold text-gray-800">
            {recommendation.dosage.amount} {recommendation.dosage.unit}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Metodo</div>
          <div className="font-semibold text-gray-800 capitalize">{recommendation.method}</div>
        </div>
      </div>

      {/* Timing Check */}
      {timingCheck && timingCheck.conflict && (
        <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-4">
          <div className="flex items-start gap-3 mb-2">
            <AlertTriangle size={18} className="text-yellow-full max-w-sm mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-yellow-full max-w-sm mb-1">Conflitto Rilevato</div>
              <p className="text-sm text-yellow-full max-w-sm mb-3">{timingCheck.message}</p>
              <div className="space-y-2">
                {timingCheck.options.map((option: any, idx: number) => (
                  <div key={idx} className="text-sm text-yellow-full max-w-sm bg-white rounded p-3">
                    {idx + 1}. {option.action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weather Conditions */}
      {weatherForecast && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs font-medium text-blue-800 mb-2">Condizioni Meteo</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-700">
            <div className="flex items-center gap-3">
              <Droplets size={12} />
              <span>Pioggia: {weatherForecast.precipitation || 0}mm</span>
            </div>
            <div className="flex items-center gap-3">
              <Wind size={12} />
              <span>Vento: {weatherForecast.wind || 0} km/h</span>
            </div>
            <div>
              <span>Temp: {weatherForecast.tempMin || 0}°C - {weatherForecast.tempMax || 0}°C</span>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {recommendation.warnings && recommendation.warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-xs font-medium text-red-800 mb-1">Avvertenze</div>
          <ul className="text-xs text-red-700 space-y-1">
            {recommendation.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Register Button */}
      <button
        onClick={handleRegisterTreatment}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
      >
        Registra Trattamento
      </button>
    </div>
  );
};

export default TreatmentPlanner;
