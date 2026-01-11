'use client'

import React, { useState, useEffect } from 'react'
import { CloudRain, Wind, Thermometer, AlertTriangle, Calendar, Check, X } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import {
  checkTomorrowTasksWeather,
  RescheduleNotification,
  rescheduleTasksBasedOnWeather
} from '@/services/weatherAwareTaskScheduler'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface WeatherTaskAlertProps {
  garden: Garden
  tasks: GardenTask[]
  onTaskUpdate?: (task: GardenTask) => void
  autoCheck?: boolean // Se true, controlla automaticamente ogni giorno
}

export function WeatherTaskAlert({
  garden,
  tasks,
  onTaskUpdate,
  autoCheck = true
}: WeatherTaskAlertProps) {
  const [notifications, setNotifications] = useState<RescheduleNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Check automatico al mount
  useEffect(() => {
    if (autoCheck && garden.coordinates) {
      checkWeather()
    }
  }, [garden.id, tasks.length])

  const checkWeather = async () => {
    setLoading(true)
    try {
      // Controlla task di domani
      const tomorrowAlerts = await checkTomorrowTasksWeather(garden, tasks)
      setNotifications(tomorrowAlerts)
    } catch (error) {
      console.error('Error checking weather for tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async (taskId: string, newDate: string) => {
    if (!onTaskUpdate) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedTask: GardenTask = {
      ...task,
      nextDueDate: newDate,
      notes: (task.notes || '') + `\n[Riprogrammato da ${task.nextDueDate || task.date} per meteo sfavorevole]`
    }

    await onTaskUpdate(updatedTask)

    // Rimuovi notifica
    setDismissed(prev => new Set(prev).add(taskId))
  }

  const handleDismiss = (taskId: string) => {
    setDismissed(prev => new Set(prev).add(taskId))
  }

  // Filtra notifiche già dismissate
  const activeNotifications = notifications.filter(n => !dismissed.has(n.taskId))

  if (activeNotifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {activeNotifications.map((notification) => (
        <div
          key={notification.taskId}
          className={`rounded-xl border-2 p-4 ${
            notification.severity === 'warning'
              ? 'bg-orange-50 border-orange-300'
              : 'bg-blue-50 border-blue-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {notification.severity === 'warning' ? (
                <AlertTriangle className="text-orange-600" size={24} />
              ) : (
                <CloudRain className="text-blue-600" size={24} />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-gray-900">{notification.taskName}</h4>
                <button
                  onClick={() => handleDismiss(notification.taskId)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-700 mb-3">
                {notification.reason}
              </p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-3.5">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-gray-600">
                    Previsto: <span className="line-through">{notification.originalDate}</span>
                  </span>
                </div>

                {notification.newDate !== 'Da decidere' && (
                  <div className="flex items-center gap-3.5">
                    <Calendar size={16} className="text-green-600" />
                    <span className="text-green-700 font-semibold">
                      Suggerito: {notification.newDate}
                    </span>
                  </div>
                )}
              </div>

              {notification.newDate !== 'Da decidere' && onTaskUpdate && (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => handleReschedule(notification.taskId, notification.newDate)}
                    className="flex items-center gap-3.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    <Check size={16} />
                    Riprogramma
                  </button>
                  <button
                    onClick={() => handleDismiss(notification.taskId)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    Mantieni data originale
                  </button>
                </div>
              )}

              {notification.newDate === 'Da decidere' && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  ⚠️ Meteo sfavorevole per più giorni. Riprogramma manualmente quando migliora.
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Componente Widget compatto per dashboard
 */
export function WeatherTaskWidget({
  garden,
  tasks,
  onTaskUpdate
}: WeatherTaskAlertProps) {
  const [count, setCount] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const checkCount = async () => {
      if (!garden.coordinates) return
      const alerts = await checkTomorrowTasksWeather(garden, tasks)
      setCount(alerts.length)
    }
    checkCount()
  }, [garden.id, tasks.length])

  if (count === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Check className="text-green-600" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Meteo Favorevole</h4>
            <p className="text-xs text-gray-600">
              Tutti i task programmati compatibili con previsioni
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-600" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Attenzione Meteo
              </h4>
              <p className="text-xs text-gray-600">
                {count} task da riprogrammare per meteo sfavorevole
              </p>
            </div>
          </div>
          <span className="text-orange-600 text-lg">
            {expanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="mt-4">
          <WeatherTaskAlert
            garden={garden}
            tasks={tasks}
            onTaskUpdate={onTaskUpdate}
            autoCheck={false}
          />
        </div>
      )}
    </div>
  )
}
