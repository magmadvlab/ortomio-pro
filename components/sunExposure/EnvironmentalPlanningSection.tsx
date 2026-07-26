'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Loader2 } from 'lucide-react'
import { Garden, GardenTask, SolarClassificationData } from '@/types'
import { calculateGardenSolarClassification } from '@/logic/solarClassificationHelper'
import SolarClassificationBadge from './SolarClassificationBadge'
import { SunExposureWidget } from './SunExposureWidget'
import PlantingWindowSuggestions from './PlantingWindowSuggestions'
import { SuccessionSuggestionsPanel } from './SuccessionSuggestionsPanel'

interface EnvironmentalPlanningSectionProps {
  garden: Garden
  tasks: GardenTask[]
}

export function EnvironmentalPlanningSection({ garden, tasks }: EnvironmentalPlanningSectionProps) {
  const [classificationData, setClassificationData] = useState<SolarClassificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!garden.coordinates) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setFailed(false)

    calculateGardenSolarClassification(garden)
      .then(result => {
        if (cancelled) return
        setClassificationData(result)
        setFailed(result === null)
      })
      .catch(error => {
        if (cancelled) return
        console.error('Error calculating garden solar classification:', error)
        setFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [garden])

  if (!garden.coordinates) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
        <MapPin className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-amber-900">Posizione non configurata</h3>
          <p className="text-sm text-amber-800 mt-1">
            Aggiungi le coordinate del tuo orto per vedere esposizione solare, finestre di semina ottimali e suggerimenti di successione.
          </p>
          <Link
            href="/app/settings"
            className="inline-block mt-3 text-sm font-medium text-amber-900 underline hover:no-underline"
          >
            Vai a Impostazioni → Gestisci
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600 p-4">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Calcolo pianificazione ambientale...</span>
      </div>
    )
  }

  if (failed || !classificationData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600">
        Dati insufficienti per calcolare la pianificazione ambientale di questo orto.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SolarClassificationBadge classification={classificationData.classification} />
      <SunExposureWidget garden={garden} />
      <PlantingWindowSuggestions
        plantingWindows={classificationData.plantingWindows}
        plantSuggestions={classificationData.optimizedSuggestions}
        classification={classificationData.classification}
        gardenId={garden.id}
      />
      <SuccessionSuggestionsPanel garden={garden} tasks={tasks} />
    </div>
  )
}
