'use client'

import React from 'react'
import { Info } from 'lucide-react'
import { SeasonalSunWindow, GardenClassification } from '@/services/seasonalSunWindows'

interface SeasonalWindowsChartProps {
  windows: SeasonalSunWindow[]
  classification: GardenClassification
}

export default function SeasonalWindowsChart({ windows, classification }: SeasonalWindowsChartProps) {
  const maxHours = Math.max(...windows.map(w => w.maxHours), 12)
  const chartHeight = 200
  const barWidth = 60
  const spacing = 20
  const totalWidth = windows.length * (barWidth + spacing) - spacing

  const getBarColor = (period: string, avgHours: number): string => {
    if (period === 'Giu-Lug') {
      return avgHours >= 6 ? '#10b981' : avgHours >= 4 ? '#f59e0b' : '#ef4444'
    }
    if (period === 'Feb-Mar' || period === 'Apr-Mag') {
      return avgHours >= 3 ? '#10b981' : avgHours >= 2 ? '#f59e0b' : '#ef4444'
    }
    return avgHours >= 5 ? '#10b981' : avgHours >= 3 ? '#f59e0b' : '#ef4444'
  }

  const getTypeBadgeColor = (type: string): string => {
    switch (type) {
      case 'Estivo':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'NonEstivo':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Misto':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const periodLabels: Record<string, string> = {
    'Feb-Mar': 'Feb-Mar\nAvvio Primaverile',
    'Apr-Mag': 'Apr-Mag\nCrescita Vegetativa',
    'Giu-Lug': 'Giu-Lug\nMassimo Solare',
    'Ago-Set': 'Ago-Set\nMaturazione + Stress',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Finestre Stagionali Solari</h3>
          <p className="text-sm text-gray-600 mt-1">
            Analisi delle 4 finestre stagionali per classificare il tipo di orto
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getTypeBadgeColor(classification.type)}`}>
          {classification.type === 'Estivo' && '🌞 Orto Estivo'}
          {classification.type === 'NonEstivo' && '🌱 Orto Primaverile/Autunnale'}
          {classification.type === 'Misto' && '🌍 Orto Misto'}
        </div>
      </div>

      <div className="relative" style={{ height: chartHeight + 60 }}>
        <svg width="100%" height={chartHeight + 60} viewBox={`0 0 ${totalWidth} ${chartHeight + 60}`}>
          {/* Griglia orizzontale */}
          {[0, 3, 6, 9, 12].map((hours) => {
            const y = chartHeight - (hours / maxHours) * chartHeight
            return (
              <g key={hours}>
                <line
                  x1={0}
                  y1={y}
                  x2={totalWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={-5}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {hours}h
                </text>
              </g>
            )
          })}

          {/* Barre */}
          {windows.map((window, index) => {
            const x = index * (barWidth + spacing)
            const barHeight = (window.avgHours / maxHours) * chartHeight
            const minHeight = (window.minHours / maxHours) * chartHeight
            const maxHeight = (window.maxHours / maxHours) * chartHeight
            const color = getBarColor(window.period, window.avgHours)

            return (
              <g key={window.period}>
                {/* Range min-max (sottile) */}
                <rect
                  x={x + barWidth / 2 - 2}
                  y={chartHeight - maxHeight}
                  width={4}
                  height={maxHeight - minHeight}
                  fill={color}
                  opacity={0.3}
                />
                
                {/* Barra principale (media) */}
                <rect
                  x={x}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  rx={4}
                  opacity={0.8}
                />

                {/* Valore medio */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - barHeight - 5}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#1f2937"
                >
                  {window.avgHours.toFixed(1)}h
                </text>

                {/* Etichetta periodo */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#4b5563"
                  fontWeight="500"
                >
                  {periodLabels[window.period]?.split('\n')[0] || window.period}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {periodLabels[window.period]?.split('\n')[1] || ''}
                </text>

                {/* Peak hours se disponibile */}
                {window.peakHours && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 50}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#059669"
                    fontWeight="500"
                  >
                    Sole: {Math.floor(window.peakHours.start)}:00-{Math.floor(window.peakHours.end)}:00
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legenda e informazioni */}
      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 mb-1">Classificazione:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              {classification.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-medium text-gray-700">Score Estivo:</span>{' '}
            <span className={`font-bold ${classification.summerScore >= 0.7 ? 'text-orange-600' : 'text-gray-600'}`}>
              {(classification.summerScore * 100).toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Score Primaverile/Autunnale:</span>{' '}
            <span className={`font-bold ${classification.springAutumnScore >= 0.7 ? 'text-green-600' : 'text-gray-600'}`}>
              {(classification.springAutumnScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

