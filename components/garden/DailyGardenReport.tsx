'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Droplets, 
  Sun, 
  Thermometer,
  Leaf,
  Target,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import type { WeatherAlert } from '@/services/weatherService'
import { calculateDashboardGardenStats } from '@/services/dashboardGardenStatsService'

interface DailyGardenReportProps {
  garden: Garden
  tasks?: GardenTask[]
  weatherAlerts?: WeatherAlert[]
  onTaskClick?: (taskId: string) => void
}

interface SuggestedTask {
  id: string
  type: 'urgent' | 'optimal' | 'seasonal'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedMinutes: number
  icon: string
}

export const DailyGardenReport: React.FC<DailyGardenReportProps> = ({
  garden,
  tasks = [],
  weatherAlerts = [],
  onTaskClick
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([])
  const [suggestionsError, setSuggestionsError] = useState(false)
  const gardenStats = useMemo(
    () => calculateDashboardGardenStats(tasks, currentTime),
    [tasks, currentTime],
  )

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Calcola statistiche giardino e genera suggerimenti intelligenti
  useEffect(() => {
    if (tasks.length === 0) {
      setSuggestedTasks([])
      setSuggestionsError(false)
      return
    }

    // Usa il servizio di suggerimenti intelligenti
    setSuggestionsError(false)
    import('../../services/gardenSuggestionsService').then(({ GardenSuggestionsService }) => {
      const smartSuggestions = GardenSuggestionsService.generateSmartSuggestions(
        garden,
        tasks,
        currentTime
      )
      
      // Converte in formato compatibile
      const convertedSuggestions: SuggestedTask[] = smartSuggestions.map(suggestion => ({
        id: suggestion.id,
        type: suggestion.type as 'urgent' | 'optimal' | 'seasonal',
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        estimatedMinutes: suggestion.estimatedMinutes,
        icon: suggestion.icon
      }))
      
      setSuggestedTasks(convertedSuggestions)
    }).catch(error => {
      console.warn('Could not load garden suggestions:', error)
      setSuggestedTasks([])
      setSuggestionsError(true)
    })
  }, [garden, tasks, currentTime])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getHealthColor = (score: number | null) => {
    if (score === null) return 'text-gray-600 bg-gray-100'
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const weatherSuggestions: SuggestedTask[] = weatherAlerts.map((alert, index) => ({
    id: `weather-${alert.type}-${index}`,
    type: 'urgent',
    title: alert.message,
    description: `${alert.action} ${alert.steps.join(' ')}`,
    priority: alert.severity === 'HIGH' ? 'high' : 'medium',
    estimatedMinutes: alert.estimatedMinutes,
    icon:
      alert.type === 'temperature' ? '🌡️' :
      alert.type === 'rain' ? '🌧️' :
      alert.type === 'wind' ? '💨' : '⚠️'
  }))
  const displayedSuggestions = [...weatherSuggestions, ...suggestedTasks]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header con Data e Ora */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-col md:flex-row sm:items-center sm:justify-between gap-3 sm:gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="sm:hidden text-white" />
              <Calendar size={20} className="hidden sm:block text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-800 capitalize text-sm sm:text-base truncate">
                {formatDate(currentTime)}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-3">
                <Clock size={12} className="sm:hidden" />
                <Clock size={14} className="hidden sm:block" />
                <span className="truncate">{formatTime(currentTime)} • Dati operativi registrati</span>
              </p>
            </div>
          </div>
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${getHealthColor(gardenStats.healthScore)}`}>
            {gardenStats.healthScore === null ? 'Salute: dati insufficienti' : `${gardenStats.healthScore}% Salute`}
          </div>
        </div>
      </div>

      {/* Statistiche Rapide */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3">
          <div className="text-center p-3 sm:p-0">
            <div className="text-base sm:text-lg font-bold text-green-600">{gardenStats.plantsCount ?? '—'}</div>
            <div className="text-xs text-gray-500">Piante censite</div>
          </div>
          <div className="text-center p-3 sm:p-0">
            <div className="text-base sm:text-lg font-bold text-blue-600">{gardenStats.tasksToday}</div>
            <div className="text-xs text-gray-500">Task oggi</div>
          </div>
          <div className="text-center p-3 sm:p-0">
            <div className="text-base sm:text-lg font-bold text-orange-600">{gardenStats.openIrrigationTasks}</div>
            <div className="text-xs text-gray-500">Irrigazioni aperte</div>
          </div>
          <div className="text-center p-3 sm:p-0">
            <div className="text-base sm:text-lg font-bold text-purple-600">{gardenStats.openHarvestTasks}</div>
            <div className="text-xs text-gray-500">Raccolte aperte</div>
          </div>
        </div>
      </div>

      {/* Alert Urgenti */}
      {gardenStats.tasksOverdue > 0 && (
        <div className="p-3 sm:p-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="text-sm font-medium">
              {gardenStats.tasksOverdue} task in ritardo richiedono attenzione
            </span>
          </div>
        </div>
      )}

      {/* Task Suggeriti Dinamici */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={16} className="text-purple-600 flex-shrink-0" />
          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Suggerimenti per Oggi</h4>
        </div>
        
        <div className="space-y-2">
          {displayedSuggestions.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-shadow min-h-[44px] ${getPriorityColor(task.priority)}`}
              onClick={() => onTaskClick?.(task.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-col md:flex-row sm:items-center gap-3 sm:gap-3 mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base sm:text-lg flex-shrink-0">{task.icon}</span>
                      <span className="font-medium text-gray-800 text-sm truncate">{task.title}</span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">~{task.estimatedMinutes}min</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-3">{task.description}</p>
                </div>
                <ArrowRight size={14} className="text-gray-400 mt-1 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {suggestionsError && weatherSuggestions.length === 0 && (
          <div className="text-center py-4 text-amber-700 bg-amber-50 rounded-lg">
            <AlertCircle size={24} className="mx-auto mb-2" />
            <p className="text-sm font-medium">Suggerimenti non disponibili</p>
            <p className="text-xs mt-1">I dati operativi restano consultabili; riprova più tardi.</p>
          </div>
        )}

        {!suggestionsError && displayedSuggestions.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Info size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Nessun suggerimento disponibile dai dati registrati.</p>
          </div>
        )}
      </div>

      {/* Footer con Prossimo Aggiornamento */}
      <div className="px-3 sm:px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Prossimo aggiornamento: {formatTime(new Date(currentTime.getTime() + 60000))}
        </p>
      </div>
    </div>
  )
}

export default DailyGardenReport
