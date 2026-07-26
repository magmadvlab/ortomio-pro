'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Sparkles, CalendarCheck, CheckCircle, ArrowRight } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { findAllSuccessionOpportunities } from '@/logic/successionEngine'

interface SuccessionSuggestionsPanelProps {
  garden: Garden
  tasks: GardenTask[]
}

export function SuccessionSuggestionsPanel({ garden, tasks }: SuccessionSuggestionsPanelProps) {
  const opportunities = useMemo(() => {
    const gardenTasks = tasks.filter(task => task.gardenId === garden.id)
    return findAllSuccessionOpportunities(gardenTasks, garden)
  }, [tasks, garden])

  if (opportunities.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
        <Sparkles size={20} className="text-purple-600" />
        Prossime Successioni
      </h3>
      <div className="space-y-3">
        {opportunities.map((suggestion, idx) => {
          const startSowingStr = suggestion.startSowingDate.toLocaleDateString('it-IT')
          const transplantStr = suggestion.transplantDate.toLocaleDateString('it-IT')

          return (
            <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-800 mb-1">
                    {suggestion.removedPlantName.toLowerCase()} → {suggestion.plant.commonName.toLowerCase()}
                  </h4>
                  <p className="text-sm text-gray-600">{suggestion.reason}</p>
                </div>
                <span className="text-xs font-bold uppercase bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {suggestion.daysUntilSpaceFree} giorni
                </span>
              </div>

              <div className="bg-white/60 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarCheck size={16} className="text-purple-600" />
                  <span className="font-medium text-gray-700">
                    Semina: <span className="font-bold text-purple-700">{startSowingStr}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm mt-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-medium text-gray-700">
                    Trapianto: <span className="font-bold text-green-700">{transplantStr}</span>
                  </span>
                </div>
              </div>

              <Link
                href="/app/planner"
                className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-3 text-sm"
              >
                <ArrowRight size={16} />
                Pianifica Successione
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
