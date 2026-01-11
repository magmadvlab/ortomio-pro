'use client'

import React, { useState, useEffect } from 'react';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { CustomCrop } from '@/types/customCrop';
import { generateSuggestions } from '@/services/learningEngine';
import { Sprout, TrendingUp, Calendar, AlertCircle, CheckCircle, X, Info } from 'lucide-react';

interface CustomCropsDashboardProps {
  gardenId?: string;
}

const CustomCropsDashboard: React.FC<CustomCropsDashboardProps> = ({ gardenId }) => {
  const { storageProvider } = useStorage();
  const [crops, setCrops] = useState<CustomCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<CustomCrop | null>(null);

  useEffect(() => {
    loadCrops();
  }, [gardenId]);

  const loadCrops = async () => {
    try {
      setLoading(true);
      const cropsList = await storageProvider.getCustomCrops(gardenId);
      setCrops(cropsList);
    } catch (error) {
      console.error('Error loading custom crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLearningStatus = (crop: CustomCrop): { label: string; color: string; icon: React.ReactNode } => {
    const totalEvents = crop.stats.totalPlantings + crop.stats.totalHarvests;
    if (totalEvents < 3) {
      return {
        label: 'In Apprendimento',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: <Info size={16} />
      };
    } else {
      return {
        label: 'Appresa',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <CheckCircle size={16} />
      };
    }
  };

  const getConfidenceLevel = (confidence: number): string => {
    if (confidence >= 0.7) return 'Alta';
    if (confidence >= 0.4) return 'Media';
    return 'Bassa';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (crops.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Sprout className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessuna Coltura Personalizzata</h3>
          <p className="text-sm text-gray-500">
            Aggiungi colture personalizzate per far imparare il sistema dai tuoi lavori
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Sprout className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Le Mie Colture Personalizzate</h3>
            <p className="text-xs text-gray-600">{crops.length} {crops.length === 1 ? 'coltura' : 'colture'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {crops.map((crop) => {
          const status = getLearningStatus(crop);
          const suggestions = generateSuggestions(crop);
          
          return (
            <div
              key={crop.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCrop(selectedCrop?.id === crop.id ? null : crop)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{crop.common_name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${status.color} flex items-center gap-1`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                  
                  {crop.scientific_name && (
                    <p className="text-xs text-gray-500 italic mb-1">{crop.scientific_name}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    <span className="flex items-center gap-3">
                      <Calendar size={14} />
                      {crop.stats.totalPlantings} semine
                    </span>
                    <span className="flex items-center gap-3">
                      <TrendingUp size={14} />
                      {crop.stats.totalHarvests} raccolti
                    </span>
                    {crop.stats.successRate > 0 && (
                      <span className="flex items-center gap-3">
                        <CheckCircle size={14} />
                        {Math.round(crop.stats.successRate * 100)}% successo
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedCrop?.id === crop.id ? (
                  <X className="text-gray-400" size={20} />
                ) : (
                  <div className="text-gray-400">▼</div>
                )}
              </div>

              {selectedCrop?.id === crop.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {/* Suggerimenti */}
                  {suggestions.planting && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Calendar className="text-blue-600 mt-0.5" size={16} />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-blue-700 mb-1">Suggerimento Semina</div>
                          <p className="text-sm text-blue-600">{suggestions.planting}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {suggestions.harvest && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="text-green-600 mt-0.5" size={16} />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-green-700 mb-1">Suggerimento Raccolta</div>
                          <p className="text-sm text-green-600">{suggestions.harvest}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {suggestions.works && suggestions.works.length > 0 && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs font-semibold text-purple-700 mb-2">Lavorazioni Efficaci</div>
                      <ul className="space-y-1">
                        {suggestions.works.map((work, idx) => (
                          <li key={idx} className="text-sm text-purple-600">• {work}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestions.treatments && suggestions.treatments.length > 0 && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-xs font-semibold text-orange-700 mb-2">Trattamenti Efficaci</div>
                      <ul className="space-y-1">
                        {suggestions.treatments.map((treatment, idx) => (
                          <li key={idx} className="text-sm text-orange-600">• {treatment}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestions.problems && suggestions.problems.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-600 mt-0.5" size={16} />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-red-700 mb-2">Problemi Ricorrenti</div>
                          <ul className="space-y-1">
                            {suggestions.problems.map((problem, idx) => (
                              <li key={idx} className="text-sm text-red-600">• {problem}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {!suggestions.planting && !suggestions.harvest && 
                   (!suggestions.works || suggestions.works.length === 0) &&
                   (!suggestions.treatments || suggestions.treatments.length === 0) && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <p className="text-sm text-gray-600">
                        Continua a registrare lavori e raccolti per ricevere suggerimenti personalizzati
                      </p>
                    </div>
                  )}

                  {/* Pattern appresi */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Pattern Appresi</div>
                    <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Confidenza Semina:</span>
                        <span className="ml-2 font-semibold">
                          {getConfidenceLevel(crop.learned_patterns.plantingTiming.confidence)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Confidenza Raccolta:</span>
                        <span className="ml-2 font-semibold">
                          {getConfidenceLevel(crop.learned_patterns.harvestTiming.confidence)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCropsDashboard;

