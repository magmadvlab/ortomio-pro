/**
 * Tillage Recommendation Component
 * Mostra suggerimenti lavorazioni terra con timing ottimale
 */

import React, { useState, useEffect } from 'react';
import { Garden } from '../../types';
import { suggestTillageWork, TillageWork } from '../../logic/tillageEngine';
import { getSoilState } from '../../services/soilStateService';
import { Shovel, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface TillageRecommendationProps {
  garden: Garden;
  zoneId?: string;
  plannedPlanting?: { plantName: string; date: Date };
}

const TillageRecommendation: React.FC<TillageRecommendationProps> = ({
  garden,
  zoneId,
  plannedPlanting,
}) => {
  const [recommendation, setRecommendation] = useState<TillageWork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendation();
  }, [garden.id, zoneId, plannedPlanting]);

  const loadRecommendation = async () => {
    setLoading(true);
    try {
      const soilState = zoneId ? await getSoilState(garden.id, zoneId) : null;
      const rec = await suggestTillageWork(garden, zoneId || garden.id, soilState || undefined, plannedPlanting);
      setRecommendation(rec);
    } catch (error) {
      console.error('Error loading tillage recommendation:', error);
    } finally {
      setLoading(false);
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
        <p>Nessuna lavorazione consigliata al momento</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Shovel size={20} className="text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">{recommendation.workType}</h3>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            recommendation.priority === 'high'
              ? 'bg-red-100 text-red-700'
              : recommendation.priority === 'medium'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {recommendation.priority === 'high' ? 'Alta' : recommendation.priority === 'medium' ? 'Media' : 'Bassa'}
        </span>
      </div>

      <p className="text-sm text-gray-700">{recommendation.message}</p>
      <p className="text-xs text-gray-600">{recommendation.reason}</p>

      {/* Timing */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Finestra Ottimale</span>
        </div>
        <p className="text-sm text-blue-700">
          {recommendation.optimalWindow.start.toLocaleDateString('it-IT')} -{' '}
          {recommendation.optimalWindow.end.toLocaleDateString('it-IT')}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Data suggerita: {recommendation.suggestedDate.toLocaleDateString('it-IT')}
        </p>
      </div>

      {/* Dettagli */}
      {recommendation.depth && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Profondità:</span> {recommendation.depth} cm
        </div>
      )}

      {recommendation.area && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Area:</span> {recommendation.area} m²
        </div>
      )}

      {/* Istruzioni */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-sm font-medium text-gray-800 mb-2">Istruzioni</div>
        <ul className="space-y-1">
          {recommendation.instructions.map((instruction, idx) => (
            <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
              <CheckCircle size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>{instruction}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weather Warning */}
      {recommendation.weatherWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
          <p className="text-sm text-yellow-800">{recommendation.weatherWarning}</p>
        </div>
      )}
    </div>
  );
};

export default TillageRecommendation;

