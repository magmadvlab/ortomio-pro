'use client'

import { Droplets, Leaf, Users, Zap, TrendingDown, Calendar } from 'lucide-react'
import type { ResourceOptimization } from '@/services/aiPredictiveEngine'

interface Props {
  optimizations: ResourceOptimization[]
}

export default function ResourceOptimizationCard({ optimizations }: Props) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'WATER': return <Droplets className="w-5 h-5" />
      case 'FERTILIZER': return <Leaf className="w-5 h-5" />
      case 'LABOR': return <Users className="w-5 h-5" />
      case 'ENERGY': return <Zap className="w-5 h-5" />
      default: return null
    }
  }

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'WATER': return 'bg-blue-100 text-blue-900 border-blue-200'
      case 'FERTILIZER': return 'bg-green-100 text-green-900 border-green-200'
      case 'LABOR': return 'bg-purple-100 text-purple-900 border-purple-200'
      case 'ENERGY': return 'bg-yellow-100 text-yellow-900 border-yellow-200'
      default: return 'bg-gray-100 text-gray-900 border-gray-200'
    }
  }

  const getResourceLabel = (type: string) => {
    switch (type) {
      case 'WATER': return 'Acqua'
      case 'FERTILIZER': return 'Fertilizzanti'
      case 'LABOR': return 'Lavoro'
      case 'ENERGY': return 'Energia'
      default: return type
    }
  }

  if (optimizations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">💡</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Nessuna Ottimizzazione Disponibile
        </h3>
        <p className="text-gray-600">
          Continua a registrare le tue attività per ricevere suggerimenti di ottimizzazione.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {optimizations.map((optimization) => (
        <div
          key={optimization.id}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${getResourceColor(optimization.type)}`}>
                {getResourceIcon(optimization.type)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {getResourceLabel(optimization.type)}
                </h3>
                <p className="text-sm text-gray-600">
                  Ottimizzazione Risorse
                </p>
              </div>
            </div>
          </div>

          {/* Savings */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600 mb-1">Risparmio</div>
              <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                <TrendingDown className="w-5 h-5" />
                {optimization.savings.percentage.toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Quantità</div>
              <div className="text-lg font-bold text-gray-900">
                {optimization.savings.amount.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Costo</div>
              <div className="text-lg font-bold text-gray-900">
                €{optimization.savings.cost.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Current vs Optimized */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Uso Attuale</span>
              <span className="text-lg font-bold text-gray-900">
                {optimization.currentUsage.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Uso Ottimizzato</span>
              <span className="text-lg font-bold text-green-600">
                {optimization.optimizedUsage.toFixed(1)}
              </span>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 rounded-full"
                  style={{ 
                    width: `${(optimization.optimizedUsage / optimization.currentUsage) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {optimization.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Come Ottimizzare
              </h4>
              <ul className="space-y-2">
                {optimization.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
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
