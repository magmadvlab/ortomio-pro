'use client'

import React, { useState, useEffect } from 'react'
import { X, Sun, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Garden } from '@/types'
import { MonthlySunChart, MonthlySunHours } from './MonthlySunChart'
import { InfoTooltip } from '@/components/shared/InfoTooltip'
import SeasonalWindowsChart from './SeasonalWindowsChart'
import PlantingWindowSuggestions from './PlantingWindowSuggestions'
import { SeasonalSunWindow, GardenClassification } from '@/services/seasonalSunWindows'
import { PlantingWindow } from '@/services/plantingWindowOptimizer'
import { PlantSuggestionForWindow } from '@/services/seasonalPlantSuggestions'

interface SunExposureDetailModalProps {
  garden: Garden
  onClose: () => void
}

export function SunExposureDetailModal({ garden, onClose }: SunExposureDetailModalProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlySunHours[]>([])
  const [optimalPeriod, setOptimalPeriod] = useState<{ start: Date; end: Date } | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDateHours, setSelectedDateHours] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDate, setLoadingDate] = useState(false)
  const [seasonalWindows, setSeasonalWindows] = useState<SeasonalSunWindow[]>([])
  const [classification, setClassification] = useState<GardenClassification | null>(null)
  const [plantingWindows, setPlantingWindows] = useState<PlantingWindow[]>([])
  const [plantSuggestions, setPlantSuggestions] = useState<PlantSuggestionForWindow[]>([])
  const [loadingSeasonal, setLoadingSeasonal] = useState(false)

  useEffect(() => {
    loadMonthlyData()
    loadOptimalPeriod()
    loadSeasonalWindows()
    loadPlantingWindows()
    loadPlantSuggestions()
  }, [garden])

  const loadMonthlyData = async () => {
    if (!garden.coordinates) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/garden/sun-exposure/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gardenId: garden.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setMonthlyData(data.monthlySunHours || [])
      }
    } catch (error) {
      console.error('Error loading monthly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOptimalPeriod = async () => {
    if (!garden.coordinates) return

    try {
      const response = await fetch('/api/garden/sun-exposure/optimal-period', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gardenId: garden.id, minSunHours: 6 }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.bestPeriod) {
          setOptimalPeriod({
            start: new Date(data.bestPeriod.start),
            end: new Date(data.bestPeriod.end),
          })
        }
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Error loading optimal period:', error)
    }
  }

  const loadDateHours = async (date: Date) => {
    if (!garden.coordinates) return

    setLoadingDate(true)
    try {
      const response = await fetch(
        `/api/garden/sun-exposure?gardenId=${garden.id}&date=${date.toISOString().split('T')[0]}`
      )

      if (response.ok) {
        const data = await response.json()
        setSelectedDateHours(data.dailySunHours)
      }
    } catch (error) {
      console.error('Error loading date hours:', error)
    } finally {
      setLoadingDate(false)
    }
  }

  useEffect(() => {
    loadDateHours(selectedDate)
  }, [selectedDate])

  const loadSeasonalWindows = async () => {
    if (!garden.coordinates) return

    setLoadingSeasonal(true)
    try {
      const response = await fetch('/api/garden/sun-exposure/seasonal-windows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gardenId: garden.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setSeasonalWindows(data.windows || [])
        setClassification(data.classification || null)
      }
    } catch (error) {
      console.error('Error loading seasonal windows:', error)
    } finally {
      setLoadingSeasonal(false)
    }
  }

  const loadPlantingWindows = async () => {
    if (!garden.coordinates) return

    try {
      const response = await fetch('/api/garden/sun-exposure/planting-windows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gardenId: garden.id }),
      })

      if (response.ok) {
        const data = await response.json()
        // Converti date da string a Date
        const windows = (data.plantingWindows || []).map((w: any) => ({
          ...w,
          startDate: new Date(w.startDate),
          endDate: new Date(w.endDate),
        }))
        setPlantingWindows(windows)
      }
    } catch (error) {
      console.error('Error loading planting windows:', error)
    }
  }

  const loadPlantSuggestions = async () => {
    if (!garden.coordinates) return

    try {
      const response = await fetch(
        `/api/garden/sun-exposure/plant-suggestions?gardenId=${garden.id}`
      )

      if (response.ok) {
        const data = await response.json()
        // Converti date da string a Date
        const suggestions = (data.suggestions || []).map((s: any) => ({
          ...s,
          plantingWindow: {
            start: new Date(s.plantingWindow.start),
            end: new Date(s.plantingWindow.end),
          },
        }))
        setPlantSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Error loading plant suggestions:', error)
    }
  }

  const getExposureType = (hours: number) => {
    if (hours >= 8) return { type: 'FullSun', label: 'Pieno Sole', color: 'text-yellow-600' }
    if (hours >= 5) return { type: 'PartialSun', label: 'Sole Parziale', color: 'text-orange-600' }
    if (hours >= 3) return { type: 'PartialShade', label: 'Mezz\'Ombra', color: 'text-blue-600' }
    return { type: 'FullShade', label: 'Ombra', color: 'text-gray-600' }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Sun className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Esposizione Solare Dettagliata</h2>
            <InfoTooltip
              content="Visualizza l'esposizione solare del tuo orto mese per mese, il periodo ottimale per coltivare e suggerimenti basati sulle ore di sole disponibili."
              size="sm"
            />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Chiudi"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : (
            <>
              {/* Grafico Mensile */}
              {monthlyData.length > 0 && (
                <MonthlySunChart
                  data={monthlyData}
                  optimalPeriod={optimalPeriod || undefined}
                />
              )}

              {/* Finestre Stagionali */}
              {seasonalWindows.length > 0 && classification && (
                <div className="mt-6">
                  <SeasonalWindowsChart
                    windows={seasonalWindows}
                    classification={classification}
                  />
                </div>
              )}

              {/* Finestre Impianto e Suggerimenti Piante */}
              {plantingWindows.length > 0 && plantSuggestions.length > 0 && classification && (
                <div className="mt-6">
                  <PlantingWindowSuggestions
                    plantingWindows={plantingWindows}
                    plantSuggestions={plantSuggestions}
                    classification={classification}
                    gardenId={garden.id}
                  />
                </div>
              )}

              {/* Calcolo Giorno Specifico */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="text-gray-600" size={20} />
                  <h3 className="font-semibold text-gray-900">Calcola Ore di Sole per un Giorno Specifico</h3>
                  <InfoTooltip
                    content="Seleziona una data per vedere quante ore di sole diretto riceverà il tuo orto quel giorno, considerando tutti gli ostacoli configurati."
                    size="sm"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  {loadingDate ? (
                    <Loader2 className="animate-spin text-gray-400" size={20} />
                  ) : selectedDateHours !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">Ore di sole:</span>
                      <span className={`text-xl font-bold ${getExposureType(selectedDateHours).color}`}>
                        {selectedDateHours.toFixed(1)}h
                      </span>
                      <span className="text-sm text-gray-600">
                        ({getExposureType(selectedDateHours).label})
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Periodo Ottimale */}
              {optimalPeriod && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-2">Periodo Ottimale</h3>
                      <p className="text-sm text-green-800 mb-2">
                        Il periodo migliore per coltivare va da{' '}
                        <strong>
                          {optimalPeriod.start.toLocaleDateString('it-IT', { month: 'long', day: 'numeric' })}
                        </strong>{' '}
                        a{' '}
                        <strong>
                          {optimalPeriod.end.toLocaleDateString('it-IT', { month: 'long', day: 'numeric' })}
                        </strong>
                        . In questo periodo il tuo orto riceve almeno 6 ore di sole diretto al giorno.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Raccomandazioni */}
              {recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2">Suggerimenti Colture</h3>
                      <ul className="space-y-1">
                        {recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Ostacoli */}
              {garden.obstacles && garden.obstacles.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Ostacoli Configurati ({garden.obstacles.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    Il calcolo considera {garden.obstacles.length} ostacolo{garden.obstacles.length !== 1 ? 'i' : ''}{' '}
                    (palazzi, alberi, ecc.) che possono ombreggiare il tuo orto.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

