'use client'

import React from 'react'
import { InfoTooltip } from '@/components/shared/InfoTooltip'

export interface MonthlySunHours {
  month: number
  avgHours: number
  minHours?: number
  maxHours?: number
}

interface MonthlySunChartProps {
  data: MonthlySunHours[]
  optimalPeriod?: {
    start: Date
    end: Date
  }
  className?: string
}

const monthNames = [
  'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
  'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
]

export function MonthlySunChart({ data, optimalPeriod, className = '' }: MonthlySunChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        Nessun dato disponibile
      </div>
    )
  }

  const maxHours = Math.max(...data.map(d => d.avgHours), 12)
  const chartHeight = 200
  const chartWidth = 600
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  // Trova mesi del periodo ottimale
  const optimalMonths = optimalPeriod
    ? (() => {
        const startMonth = optimalPeriod.start.getMonth() + 1
        const endMonth = optimalPeriod.end.getMonth() + 1
        const months: number[] = []
        
        if (startMonth <= endMonth) {
          for (let m = startMonth; m <= endMonth; m++) {
            months.push(m)
          }
        } else {
          // Periodo che attraversa l'anno (dicembre-gennaio)
          for (let m = startMonth; m <= 12; m++) {
            months.push(m)
          }
          for (let m = 1; m <= endMonth; m++) {
            months.push(m)
          }
        }
        return months
      })()
    : []

  const getX = (month: number) => {
    return padding.left + ((month - 1) / 11) * innerWidth
  }

  const getY = (hours: number) => {
    return padding.top + innerHeight - (hours / maxHours) * innerHeight
  }

  // Crea path per la linea
  const pathData = data
    .map((d, i) => {
      const x = getX(d.month)
      const y = getY(d.avgHours)
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  // Crea area sotto la linea
  const areaPath = `${pathData} L ${getX(12)} ${padding.top + innerHeight} L ${getX(1)} ${padding.top + innerHeight} Z`

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ore di Sole Mensili</h3>
        <InfoTooltip
          content="Questo grafico mostra le ore medie di sole diretto per ogni mese dell'anno. Il periodo ottimale (evidenziato in verde) indica i mesi con almeno 6 ore di sole, ideali per la maggior parte delle colture."
          size="sm"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight + 60}
          className="w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight + 60}`}
        >
          {/* Griglia */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

          {/* Linee orizzontali per ore */}
          {[0, 3, 6, 9, 12].map(hours => {
            const y = getY(hours)
            return (
              <g key={hours}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#d1d5db"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                >
                  {hours}h
                </text>
              </g>
            )
          })}

          {/* Periodo ottimale evidenziato */}
          {optimalMonths.length > 0 && (
            <g>
              {optimalMonths.map(month => {
                const x = getX(month)
                const monthData = data.find(d => d.month === month)
                if (!monthData) return null
                
                return (
                  <rect
                    key={month}
                    x={x - (innerWidth / 11) / 2}
                    y={padding.top}
                    width={innerWidth / 11}
                    height={innerHeight}
                    fill="#10b981"
                    fillOpacity="0.1"
                  />
                )
              })}
            </g>
          )}

          {/* Area sotto la linea */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            fillOpacity="0.3"
          />

          {/* Gradiente per l'area */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Linea principale */}
          <path
            d={pathData}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Punti dati */}
          {data.map(d => {
            const x = getX(d.month)
            const y = getY(d.avgHours)
            const isOptimal = optimalMonths.includes(d.month)
            
            return (
              <g key={d.month}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={isOptimal ? "#10b981" : "#f59e0b"}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Tooltip area */}
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  fill="transparent"
                  className="cursor-pointer"
                >
                  <title>
                    {monthNames[d.month - 1]}: {d.avgHours.toFixed(1)}h/giorno
                    {isOptimal && ' (Periodo ottimale)'}
                  </title>
                </circle>
              </g>
            )
          })}

          {/* Etichette mesi */}
          {data.map(d => {
            const x = getX(d.month)
            return (
              <text
                key={d.month}
                x={x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-gray-700 font-medium"
              >
                {monthNames[d.month - 1]}
              </text>
            )
          })}

          {/* Linea periodo ottimale */}
          <line
            x1={padding.left}
            y1={getY(6)}
            x2={chartWidth - padding.right}
            y2={getY(6)}
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <text
            x={chartWidth - padding.right + 5}
            y={getY(6) + 4}
            className="text-xs fill-green-600 font-medium"
          >
            Minimo 6h (ottimale)
          </text>
        </svg>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-yellow-full max-w-sm rounded-full"></div>
            <span className="text-gray-700">Ore di sole</span>
          </div>
          {optimalMonths.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Periodo ottimale</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

