'use client'

import { TrendingUp, Calendar, Target, Star } from 'lucide-react'
import type { YieldPrediction } from '@/services/aiPredictiveEngine'

interface Props {
  predictions: YieldPrediction[]
}

export default function YieldPredictionsCard({ predictions }: Props) {
  if (predictions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Nessuna Predizione Resa
        </h3>
        <p className="text-gray-600">
          Aggiungi piante al tuo orto per vedere le predizioni di resa.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {predictions.map((prediction) => (
        <div
          key={prediction.id}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {prediction.plantName}
              </h3>
              <p className="text-sm text-gray-600">
                Varietà: {prediction.variety}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {prediction.expectedYield.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">
                kg/m²
              </div>
            </div>
          </div>

          {/* Yield Range */}
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Range Resa</span>
              <span className="text-sm text-gray-600">
                Confidence: {Math.round(prediction.yieldRange.confidence * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 rounded-full"
                    style={{ 
                      width: `${(prediction.expectedYield / prediction.yieldRange.max) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-600">
                Min: {prediction.yieldRange.min.toFixed(1)} kg/m²
              </span>
              <span className="text-gray-600">
                Max: {prediction.yieldRange.max.toFixed(1)} kg/m²
              </span>
            </div>
          </div>

          {/* Harvest Window */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Finestra Raccolta</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-gray-600 mb-1">Inizio</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(prediction.harvestWindow.start).toLocaleDateString('it-IT')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Ottimale</div>
                <div className="text-sm font-medium text-blue-600">
                  {new Date(prediction.harvestWindow.optimal).toLocaleDateString('it-IT')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Fine</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(prediction.harvestWindow.end).toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
          </div>

          {/* Quality Score */}
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Qualità Prevista</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-yellow-600">
                  {prediction.qualityScore}
                </div>
                <span className="text-sm text-gray-600">/100</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-600 rounded-full"
                  style={{ width: `${prediction.qualityScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {prediction.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Raccomandazioni
              </h4>
              <ul className="space-y-1">
                {prediction.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
