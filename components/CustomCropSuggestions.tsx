'use client'

import React from 'react';
import { CustomCrop } from '@/types/customCrop';
import { generateSuggestions, calculatePlantingTiming, calculateHarvestTiming } from '@/services/learningEngine';
import { Calendar, TrendingUp, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface CustomCropSuggestionsProps {
  crop: CustomCrop;
  showDetails?: boolean;
}

const CustomCropSuggestions: React.FC<CustomCropSuggestionsProps> = ({ crop, showDetails = false }) => {
  const suggestions = generateSuggestions(crop);
  const plantingTiming = calculatePlantingTiming(crop);
  const harvestTiming = calculateHarvestTiming(crop);

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.7) {
      return <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Alta</span>;
    }
    if (confidence >= 0.4) {
      return <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">Media</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">Bassa</span>;
  };

  if (!suggestions.planting && !suggestions.harvest && 
      (!suggestions.works || suggestions.works.length === 0) &&
      (!suggestions.treatments || suggestions.treatments.length === 0)) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2">
          <Info className="text-gray-400 mt-0.5" size={16} />
          <div>
            <p className="text-sm text-gray-600">
              Basandoti sulla tua storia con questa coltura, non ci sono ancora dati sufficienti per suggerimenti.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Continua a registrare semine, raccolti e lavorazioni per ricevere suggerimenti personalizzati.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Suggerimento Semina */}
      {plantingTiming.confidence > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Calendar className="text-blue-600 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold text-blue-900">Quando Seminare</div>
                {getConfidenceBadge(plantingTiming.confidence)}
              </div>
              <p className="text-sm text-blue-700">{plantingTiming.message}</p>
              {showDetails && plantingTiming.bestMonth !== undefined && (
                <div className="mt-2 text-xs text-blue-600">
                  Mese consigliato: {['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'][plantingTiming.bestMonth]}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggerimento Raccolta */}
      {harvestTiming.confidence > 0 && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-green-600 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold text-green-900">Quando Raccogliere</div>
                {getConfidenceBadge(harvestTiming.confidence)}
              </div>
              <p className="text-sm text-green-700">{harvestTiming.message}</p>
              {showDetails && harvestTiming.avgDays && (
                <div className="mt-2 text-xs text-green-600">
                  Giorni medi dalla semina: {harvestTiming.avgDays} giorni
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lavorazioni Efficaci */}
      {suggestions.works && suggestions.works.length > 0 && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-purple-600 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-purple-900 mb-2">Lavorazioni che Hanno Funzionato</div>
              <ul className="space-y-1">
                {suggestions.works.map((work, idx) => (
                  <li key={idx} className="text-sm text-purple-700 flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{work}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Trattamenti Efficaci */}
      {suggestions.treatments && suggestions.treatments.length > 0 && (
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-orange-600 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-orange-900 mb-2">Trattamenti che Hanno Risolto Problemi</div>
              <ul className="space-y-1">
                {suggestions.treatments.map((treatment, idx) => (
                  <li key={idx} className="text-sm text-orange-700 flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>{treatment}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Problemi Ricorrenti */}
      {suggestions.problems && suggestions.problems.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-900 mb-2">Problemi Ricorrenti</div>
              <ul className="space-y-1">
                {suggestions.problems.map((problem, idx) => (
                  <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCropSuggestions;

