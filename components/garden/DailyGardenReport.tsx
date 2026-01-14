'use client'

import React, { useState, useEffect } from 'react'
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
  Sparkles
} from 'lucide-react'
import { Garden, GardenTask } from '@/types'

interface DailyGardenReportProps {
  garden: Garden
  tasks?: GardenTask[]
  onTaskClick?: (taskId: string) => void
}

interface GardenStats {
  plantsCount: number
  tasksToday: number
  tasksOverdue: number
  healthScore: number
  wateringNeeded: number
  harvestReady: number
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
  onTaskClick
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [gardenStats, setGardenStats] = useState<GardenStats>({
    plantsCount: 0,
    tasksToday: 0,
    tasksOverdue: 0,
    healthScore: 85,
    wateringNeeded: 0,
    harvestReady: 0
  })
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Calcola statistiche giardino e genera suggerimenti intelligenti
  useEffect(() => {
    const today = new Date().toDateString()
    const todayTasks = tasks.filter(task => {
      const taskDate = task.scheduledDate || task.date
      return taskDate && new Date(taskDate).toDateString() === today && !task.completed
    })
    const overdueTasks = tasks.filter(task => {
      const taskDate = task.scheduledDate || task.date
      return taskDate && new Date(taskDate) < new Date() && !task.completed
    })

    // Simula dati dinamici basati su orario e stagione
    const hour = currentTime.getHours()
    const month = currentTime.getMonth() + 1
    
    // Calcola health score dinamico
    let healthScore = 85
    if (overdueTasks.length > 0) healthScore -= overdueTasks.length * 5
    if (hour >= 6 && hour <= 18) healthScore += 5 // Bonus ore diurne
    if (month >= 3 && month <= 10) healthScore += 10 // Bonus stagione crescita

    setGardenStats({
      plantsCount: tasks.filter(t => t.plantName && !t.completed).length || 0,
      tasksToday: todayTasks.length,
      tasksOverdue: overdueTasks.length,
      healthScore: Math.min(100, Math.max(0, healthScore)),
      wateringNeeded: Math.floor(Math.random() * 3) + (hour > 16 ? 2 : 0), // Più probabile sera
      harvestReady: Math.floor(Math.random() * 2) + (month >= 6 && month <= 9 ? 1 : 0) // Più probabile estate
    })

    // Usa il servizio di suggerimenti intelligenti
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
      // Fallback con suggerimenti semplici
      setSuggestedTasks([
        {
          id: 'simple-check',
          type: 'optimal',
          title: 'Controllo giornaliero',
          description: 'Verifica lo stato delle tue piante e annaffia se necessario',
          priority: 'medium',
          estimatedMinutes: 15,
          icon: '🌱'
        }
      ])
    })
  }, [garden.id, tasks.length]) // Use stable dependencies

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

  const getHealthColor = (score: number) => {
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
                <span className="truncate">{formatTime(currentTime)} • Report in tempo reale</span>
              </p>
            </div>
          </div>
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${getHealthColor(gardenStats.healthScore)}`}>
            {gardenStats.healthScore}% Salute
          </div>
        </div>
      </div>

      {/* Statistiche Rapide */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3">
          <div className="text-center p-3 sm:p-0">
            <div className="text-base sm:text-lg font-bold text-green-600">{gardenStats.plantsCount}</div>
            <div className="text-xs text-gray-500">Piante</div>
          </div>
          <div className="text-center p-3 sm:p-0">
            <div className="text-base sm:text-lg font-bold text-blue-600">{gardenStats.tasksToday}</div>
            <div className="text-xs text-gray-500">Task oggi</div>
          </div>
          <div className="text-center p-3 sm:p-0">
            <div className="text-base sm:text-lg font-bold text-orange-600">{gardenStats.wateringNeeded}</div>
            <div className="text-xs text-gray-500">Da innaffiare</div>
          </div>
          <div className="text-center p-3 sm:p-0">
            <div className="text-base sm:text-lg font-bold text-purple-600">{gardenStats.harvestReady}</div>
            <div className="text-xs text-gray-500">Da raccogliere</div>
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
          {suggestedTasks.map((task) => (
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

        {suggestedTasks.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <CheckCircle size={20} className="sm:hidden mx-auto mb-2 text-green-500" />
            <CheckCircle size={24} className="hidden sm:block mx-auto mb-2 text-green-500" />
            <p className="text-sm">Tutto sotto controllo! 🌱</p>
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