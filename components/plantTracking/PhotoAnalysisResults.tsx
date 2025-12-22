/**
 * Photo Analysis Results Component
 * Mostra risultati analisi AI dopo upload foto con confronto crescita
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Leaf } from 'lucide-react';
import { PlantPhotoLog } from '@/types';

interface PhotoAnalysisResultsProps {
  photoLog: PlantPhotoLog;
  className?: string;
}

export const PhotoAnalysisResults: React.FC<PhotoAnalysisResultsProps> = ({
  photoLog,
  className = ''
}) => {
  const analysisResult = photoLog.analysisResult;
  const growthComparison = photoLog.growthComparison;
  const fertilizationSuggestion = photoLog.fertilizationSuggestion;

  if (!analysisResult) {
    return null;
  }

  const getGrowthIcon = () => {
    if (!growthComparison) return null;
    
    switch (growthComparison.growthRateChange) {
      case 'improved':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'declined':
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <Minus size={16} className="text-gray-600" />;
    }
  };

  const getHealthIcon = () => {
    if (!growthComparison) {
      return analysisResult.isHealthy 
        ? <CheckCircle size={16} className="text-green-600" />
        : <AlertTriangle size={16} className="text-yellow-600" />;
    }
    
    switch (growthComparison.healthChange) {
      case 'improved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'worsened':
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Minus size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Analisi Base */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Leaf size={18} />
          Analisi Foto
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Salute</p>
            <div className="flex items-center gap-2">
              {getHealthIcon()}
              <span className={`text-sm font-medium ${
                analysisResult.isHealthy ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {analysisResult.isHealthy ? 'Sana' : 'Attenzione'}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Tasso Crescita</p>
            <span className={`text-sm font-medium ${
              analysisResult.growthRate === 'fast' ? 'text-green-700' :
              analysisResult.growthRate === 'slow' ? 'text-red-700' :
              'text-gray-700'
            }`}>
              {analysisResult.growthRate === 'fast' ? 'Rapida' :
               analysisResult.growthRate === 'slow' ? 'Lenta' :
               'Normale'}
            </span>
          </div>
          
          {analysisResult.leafCount !== undefined && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Foglie Vere</p>
              <span className="text-sm font-medium text-gray-700">
                {analysisResult.leafCount}
              </span>
            </div>
          )}
          
          {analysisResult.phase && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Fase Rilevata</p>
              <span className="text-sm font-medium text-gray-700">
                {analysisResult.phase}
              </span>
            </div>
          )}
        </div>

        {analysisResult.issues && analysisResult.issues.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Problemi Rilevati</p>
            <ul className="text-sm text-yellow-700">
              {analysisResult.issues.map((issue, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confronto con Foto Precedente */}
      {growthComparison && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            {getGrowthIcon()}
            Confronto con Foto Precedente
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Giorni tra le foto:</span>
              <span className="font-medium text-blue-900">{growthComparison.daysBetween} giorni</span>
            </div>
            
            {growthComparison.leafCountDelta !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Variazione foglie:</span>
                <span className={`font-medium ${
                  growthComparison.leafCountDelta > 0 ? 'text-green-700' :
                  growthComparison.leafCountDelta < 0 ? 'text-red-700' :
                  'text-blue-900'
                }`}>
                  {growthComparison.leafCountDelta > 0 ? '+' : ''}{growthComparison.leafCountDelta}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Tendenza crescita:</span>
              <span className={`font-medium ${
                growthComparison.growthRateChange === 'improved' ? 'text-green-700' :
                growthComparison.growthRateChange === 'declined' ? 'text-red-700' :
                'text-blue-900'
              }`}>
                {growthComparison.growthRateChange === 'improved' ? 'Migliorata' :
                 growthComparison.growthRateChange === 'declined' ? 'Rallentata' :
                 'Stabile'}
              </span>
            </div>
          </div>

          {growthComparison.recommendations && growthComparison.recommendations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs font-medium text-blue-900 mb-2">Raccomandazioni:</p>
              <ul className="space-y-1">
                {growthComparison.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-blue-700 flex items-start gap-1">
                    <span className="mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Suggerimento Fertilizzazione */}
      {fertilizationSuggestion && fertilizationSuggestion.needed && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-300 p-4">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertTriangle size={18} />
            Suggerimento Fertilizzazione
          </h4>
          
          <p className="text-sm text-yellow-800 mb-3">
            {fertilizationSuggestion.reason}
          </p>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-yellow-700 font-medium">Priorità: </span>
              <span className={`font-semibold ${
                fertilizationSuggestion.priority === 'high' ? 'text-red-700' :
                fertilizationSuggestion.priority === 'medium' ? 'text-orange-700' :
                'text-yellow-700'
              }`}>
                {fertilizationSuggestion.priority === 'high' ? 'Alta' :
                 fertilizationSuggestion.priority === 'medium' ? 'Media' :
                 'Bassa'}
              </span>
            </div>
            
            <div>
              <span className="text-yellow-700 font-medium">Nutrienti consigliati: </span>
              <span className="text-yellow-800">
                {Object.entries(fertilizationSuggestion.recommendedNutrients)
                  .filter(([_, needed]) => needed)
                  .map(([nutrient, _]) => {
                    const names: Record<string, string> = {
                      nitrogen: 'Azoto (N)',
                      phosphorus: 'Fosforo (P)',
                      potassium: 'Potassio (K)',
                      micro: 'Microelementi'
                    };
                    return names[nutrient] || nutrient;
                  })
                  .join(', ')}
              </span>
            </div>
            
            <div>
              <span className="text-yellow-700 font-medium">Dosaggio: </span>
              <span className="text-yellow-800">
                {fertilizationSuggestion.dosage.amount}g/m², {fertilizationSuggestion.dosage.frequency}
              </span>
            </div>
            
            <div>
              <span className="text-yellow-700 font-medium">Metodo: </span>
              <span className="text-yellow-800">
                {fertilizationSuggestion.dosage.method === 'foliar' ? 'Fogliare' :
                 fertilizationSuggestion.dosage.method === 'fertigation' ? 'Fertirrigazione' :
                 'Al terreno'}
              </span>
            </div>
            
            <div>
              <span className="text-yellow-700 font-medium">Timing: </span>
              <span className={`font-semibold ${
                fertilizationSuggestion.timing.urgency === 'immediate' ? 'text-red-700' :
                fertilizationSuggestion.timing.urgency === 'soon' ? 'text-orange-700' :
                'text-yellow-700'
              }`}>
                {fertilizationSuggestion.timing.bestTime}
              </span>
            </div>
          </div>

          {fertilizationSuggestion.notes && fertilizationSuggestion.notes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-xs font-medium text-yellow-900 mb-1">Note:</p>
              <ul className="space-y-1">
                {fertilizationSuggestion.notes.map((note, idx) => (
                  <li key={idx} className="text-xs text-yellow-800">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoAnalysisResults;

