'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Cloud, 
  Droplets, 
  Wind, 
  Sun, 
  Moon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Zap
} from 'lucide-react'
import { dailyDiaryService, DailyDiaryEntry } from '@/services/dailyDiaryService'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface AutomatedDiaryViewerProps {
  gardenId: string
  gardenName?: string
}

export default function AutomatedDiaryViewer({ gardenId, gardenName }: AutomatedDiaryViewerProps) {
  const [entries, setEntries] = useState<DailyDiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [selectedEntry, setSelectedEntry] = useState<DailyDiaryEntry | null>(null)

  useEffect(() => {
    loadDiaryEntries()
  }, [gardenId, selectedPeriod])

  const loadDiaryEntries = async () => {
    try {
      setLoading(true)
      
      const endDate = new Date().toISOString().split('T')[0]
      let startDate = ''
      
      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'month':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'year':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
      }
      
      const data = await dailyDiaryService.getDiaryEntries(gardenId, startDate, endDate)
      setEntries(data)
    } catch (error) {
      console.error('Error loading diary entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMoonPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'new_moon': return '🌑'
      case 'waxing_crescent': return '🌒'
      case 'first_quarter': return '🌓'
      case 'waxing_gibbous': return '🌔'
      case 'full_moon': return '🌕'
      case 'waning_gibbous': return '🌖'
      case 'last_quarter': return '🌗'
      case 'waning_crescent': return '🌘'
      default: return '🌙'
    }
  }

  const getWeatherIcon = (conditions: string) => {
    switch (conditions) {
      case 'rainy': return '🌧️'
      case 'light_rain': return '🌦️'
      case 'hot': return '🌡️'
      case 'cold': return '❄️'
      case 'frost': return '🧊'
      case 'clear': return '☀️'
      default: return '☁️'
    }
  }

  const getStressColor = (index: number) => {
    if (index < 30) return 'text-green-600 bg-green-50'
    if (index < 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Calendar className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Caricamento diario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Diario Automatico</h2>
              <p className="text-gray-600">
                Registro giornaliero meteo e calcoli agronomici
                {gardenName && ` - ${gardenName}`}
              </p>
            </div>
          </div>
          
          {/* Period selector */}
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 giorni
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              30 giorni
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              1 anno
            </button>
          </div>
        </div>

        {/* Summary stats */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="text-red-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Temp Media</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {(entries.reduce((sum, e) => sum + (e.weather_data?.temp_avg || 0), 0) / entries.length).toFixed(1)}°C
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Pioggia Tot</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {entries.reduce((sum, e) => sum + (e.weather_data?.precipitation_mm || 0), 0).toFixed(0)} mm
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-green-600" size={16} />
                <span className="text-sm font-medium text-gray-700">GDD Tot</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {entries.reduce((sum, e) => sum + (e.agronomic_data?.gdd_base_10 || 0), 0).toFixed(0)}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-orange-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Alert</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {entries.reduce((sum, e) => sum + (e.automated_events?.alerts?.length || 0), 0)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nessun dato disponibile
          </h3>
          <p className="text-gray-600">
            Il diario automatico inizierà a registrare dati dal prossimo aggiornamento giornaliero
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {getWeatherIcon(entry.weather_data?.conditions || 'clear')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(new Date(entry.date), 'EEEE, d MMMM yyyy', { locale: it })}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {entry.weather_data?.conditions === 'rainy' && 'Giornata piovosa'}
                      {entry.weather_data?.conditions === 'hot' && 'Giornata calda'}
                      {entry.weather_data?.conditions === 'cold' && 'Giornata fredda'}
                      {entry.weather_data?.conditions === 'frost' && 'Gelata'}
                      {entry.weather_data?.conditions === 'clear' && 'Giornata serena'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {getMoonPhaseIcon(entry.lunar_phase?.phase || 'new_moon')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {entry.lunar_phase?.illumination}%
                  </div>
                </div>
              </div>

              {/* Weather data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="text-red-600" size={16} />
                  <div>
                    <div className="text-xs text-gray-600">Temperatura</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {entry.weather_data?.temp_min?.toFixed(1)}° / {entry.weather_data?.temp_max?.toFixed(1)}°C
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Droplets className="text-blue-600" size={16} />
                  <div>
                    <div className="text-xs text-gray-600">Pioggia</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {entry.weather_data?.precipitation_mm?.toFixed(1)} mm
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Wind className="text-gray-600" size={16} />
                  <div>
                    <div className="text-xs text-gray-600">Vento</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {entry.weather_data?.wind_speed_avg?.toFixed(0)} km/h
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Sun className="text-yellow-600" size={16} />
                  <div>
                    <div className="text-xs text-gray-600">UV Index</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {entry.weather_data?.uv_index_max?.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agronomic data */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="text-xs text-green-700 mb-1">GDD Base 10°C</div>
                  <div className="text-lg font-bold text-green-900">
                    {entry.agronomic_data?.gdd_base_10?.toFixed(1)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-green-700 mb-1">Ore Freddo</div>
                  <div className="text-lg font-bold text-green-900">
                    {entry.agronomic_data?.chill_hours || 0}h
                  </div>
                </div>

                <div>
                  <div className="text-xs text-green-700 mb-1">Stress Idrico</div>
                  <div className={`text-lg font-bold px-2 py-1 rounded ${getStressColor(entry.agronomic_data?.water_stress_index || 0)}`}>
                    {entry.agronomic_data?.water_stress_index || 0}
                  </div>
                </div>
              </div>

              {/* Automated events */}
              {(entry.automated_events?.irrigations || entry.automated_events?.treatments || entry.automated_events?.alerts?.length) && (
                <div className="mt-4 flex items-center gap-4 text-sm">
                  {entry.automated_events.irrigations > 0 && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Droplets size={14} />
                      {entry.automated_events.irrigations} irrigazioni
                    </span>
                  )}
                  {entry.automated_events.treatments > 0 && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} />
                      {entry.automated_events.treatments} trattamenti
                    </span>
                  )}
                  {entry.automated_events.alerts && entry.automated_events.alerts.length > 0 && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <AlertTriangle size={14} />
                      {entry.automated_events.alerts.length} alert
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detailed view modal */}
      {selectedEntry && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal content - detailed view */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Dettagli {format(new Date(selectedEntry.date), 'd MMMM yyyy', { locale: it })}
              </h3>
              
              {/* Full details here */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Dati Meteo Completi</h4>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(selectedEntry.weather_data, null, 2)}
                  </pre>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Calcoli Agronomici</h4>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(selectedEntry.agronomic_data, null, 2)}
                  </pre>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Fase Lunare</h4>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(selectedEntry.lunar_phase, null, 2)}
                  </pre>
                </div>
              </div>

              <button
                onClick={() => setSelectedEntry(null)}
                className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
