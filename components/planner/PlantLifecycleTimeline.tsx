'use client'

import React from 'react'
import { Calendar, Sprout, Leaf, ShoppingBasket } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface PlantLifecycleTimelineProps {
  sowingMonths: number[] // 0-11 (Jan-Dec)
  transplantMonths: number[]
  harvestMonths: number[]
  plantName: string
  variety?: string
}

export function PlantLifecycleTimeline({
  sowingMonths,
  transplantMonths,
  harvestMonths,
  plantName,
  variety,
}: PlantLifecycleTimelineProps) {
  const monthLabels = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D']
  const currentMonth = new Date().getMonth()

  return (
    <Card variant="default" className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="text-ortomio-green-600" size={20} />
        <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
          Ciclo Colturale
        </h4>
      </div>

      {/* Month Labels */}
      <div className="mb-2 grid grid-cols-1 md:grid-cols-12 gap-3">
        {monthLabels.map((label, idx) => (
          <div
            key={idx}
            className={`text-center text-xs font-bold ${
              idx === currentMonth
                ? 'text-ortomio-green-600 underline scale-110'
                : 'text-gray-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Timeline Rows */}
      <div className="space-y-3">
        {/* Sowing Row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 min-w-[100px]">
            <Sprout size={16} className="text-orange-500" />
            <span className="text-xs text-gray-600">Semina</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
            {monthLabels.map((_, idx) => (
              <div
                key={idx}
                className={`h-3 rounded-sm transition-all ${
                  sowingMonths.includes(idx)
                    ? 'bg-orange-400'
                    : 'bg-gray-100'
                }`}
                title={
                  sowingMonths.includes(idx)
                    ? `Semina possibile a ${monthLabels[idx]}`
                    : ''
                }
              />
            ))}
          </div>
        </div>

        {/* Transplant Row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 min-w-[100px]">
            <Leaf size={16} className="text-green-500" />
            <span className="text-xs text-gray-600">Trapianto</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
            {monthLabels.map((_, idx) => (
              <div
                key={idx}
                className={`h-3 rounded-sm transition-all ${
                  transplantMonths.includes(idx)
                    ? 'bg-green-500'
                    : 'bg-gray-100'
                }`}
                title={
                  transplantMonths.includes(idx)
                    ? `Trapianto possibile a ${monthLabels[idx]}`
                    : ''
                }
              />
            ))}
          </div>
        </div>

        {/* Harvest Row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 min-w-[100px]">
            <ShoppingBasket size={16} className="text-red-500" />
            <span className="text-xs text-gray-600">Raccolto</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
            {monthLabels.map((_, idx) => (
              <div
                key={idx}
                className={`h-3 rounded-sm transition-all ${
                  harvestMonths.includes(idx)
                    ? 'bg-red-500'
                    : 'bg-gray-100'
                }`}
                title={
                  harvestMonths.includes(idx)
                    ? `Raccolto possibile a ${monthLabels[idx]}`
                    : ''
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-orange-400 rounded" />
            <span>Semina</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Trapianto</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Raccolto</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Helper function to parse month ranges from text (e.g., "Mar-Apr" -> [2, 3])
export function parseMonthsFromText(text: string): number[] {
  const monthMap: Record<string, number> = {
    gen: 0, feb: 1, mar: 2, apr: 3, mag: 4, giu: 5,
    lug: 6, ago: 7, set: 8, ott: 9, nov: 10, dic: 11,
  }

  const months: number[] = []
  const parts = text.toLowerCase().split(/[-,\s]+/)

  for (const part of parts) {
    const trimmed = part.trim()
    if (monthMap[trimmed] !== undefined) {
      months.push(monthMap[trimmed])
    } else {
      // Try to match partial names
      for (const [key, value] of Object.entries(monthMap)) {
        if (key.startsWith(trimmed) || trimmed.startsWith(key)) {
          months.push(value)
          break
        }
      }
    }
  }

  return [...new Set(months)].sort((a, b) => a - b)
}

