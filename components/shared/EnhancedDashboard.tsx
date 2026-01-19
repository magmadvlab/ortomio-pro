'use client'

import React, { useState, useEffect } from 'react'
import { Garden, GardenTask } from '@/types'
import { 
  Clock, AlertTriangle, CheckCircle, Sprout, Calendar, ShoppingBasket,
  Droplets, Sun, CloudRain, ThermometerSun, ArrowRight, Plus
} from 'lucide-react'
import { QuickActions } from './QuickActions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface EnhancedDashboardProps {
  garden?: Garden
  tasks?: GardenTask[]
  userName?: string
  onUpdateTask?: (task: GardenTask) => void
  onNavigateToPlanner?: () => void
}

export function EnhancedDashboard({
  garden,
  tasks = [],
  userName,
  onUpdateTask,
  onNavigateToPlanner,
}: EnhancedDashboardProps) {
  const [weather, setWeather] = useState<{
    temp: number
    condition: string
    icon: string
  } | null>(null)
  const [todayTasks, setTodayTasks] = useState<GardenTask[]>([])
  const [urgentAlerts, setUrgentAlerts] = useState<string[]>([])

  // Get user name from storage or use default
  useEffect(() => {
    const storedName = localStorage.getItem('ortomio_user_name')
    if (storedName && !userName) {
      // userName prop takes precedence
    }
  }, [userName])

  // Load weather data
  useEffect(() => {
    if (garden?.coordinates) {
      // Simulate weather fetch - replace with actual API call
      setWeather({
        temp: 18,
        condition: 'soleggiato',
        icon: '☀️',
      })
    }
  }, [garden])

  // Filter today's tasks
  useEffect(() => {
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    
    const todayTasksList = tasks.filter(task => {
      const taskDate = task.suggestedDate || task.date
      return taskDate === todayStr && !task.completed
    }).slice(0, 3) // Show max 3 tasks
    
    setTodayTasks(todayTasksList)

    // Generate alerts
    const alerts: string[] = []
    if (weather && weather.temp < 5) {
      alerts.push(`⚠️ Attenzione: Rischio gelate domani notte (${weather.temp}°C)`)
    }
    setUrgentAlerts(alerts)
  }, [tasks, weather])

  // Calculate statistics
  const activePlants = (tasks || []).filter(t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')).length
  const monthlyTasks = (tasks || []).filter(t => {
    const taskDate = new Date(t.date)
    const now = new Date()
    return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear()
  }).length
  const monthlyHarvests = (tasks || []).filter(t => t.taskType === 'Harvest' && t.completed).length

  const displayName = userName || 'Coltivatore'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl md:text-2xl sm:text-3xl font-bold text-gray-900">
                🌤️ Buongiorno {displayName}!
              </h1>
              {weather && (
                <p className="text-gray-600 mt-1">
                  Oggi: {weather.temp}°C, {weather.condition} - Perfetto per trapiantare!
                </p>
              )}
            </div>
            {garden && (
              <div className="text-right">
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white">
                  <option>{garden.name}</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TODAY Section */}
        {todayTasks.length > 0 && (
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-3">
                <Clock className="text-ortomio-green-600" size={24} />
                OGGI
              </h2>
              <Link href="/app/garden?tab=calendar" className="text-sm text-ortomio-green-600 hover:underline">
                Vedi tutti
              </Link>
            </div>
            <div className="space-y-3">
              {todayTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm text-gray-500">
                      {idx === 0 ? '09:00' : idx === 1 ? '11:00' : '--:--'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {task.taskType === 'Sowing' && '🌱'} 
                        {task.taskType === 'Irrigation' && '💧'}
                        {task.taskType === 'Harvest' && '🍅'}
                        {task.taskType === 'Photo' && '📷'}
                        {' '}
                        {task.plantName} {task.variety && `(${task.variety})`}
                      </p>
                      {task.zoneId && (
                        <p className="text-sm text-gray-500">📍 {task.zoneId}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      if (onUpdateTask) {
                        onUpdateTask({ ...task, completed: true })
                      }
                    }}
                  >
                    ✓ Fatto
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Alert Section */}
        {urgentAlerts.length > 0 && (
          <Card variant="elevated" status="warning" className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-semantic-warning flex-shrink-0 mt-0.5" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">ALLERTA</h3>
                {urgentAlerts.map((alert, idx) => (
                  <p key={idx} className="text-gray-700">
                    {alert}
                  </p>
                ))}
                <p className="text-sm text-gray-600 mt-2">
                  → Proteggi le piantine di peperone
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="default" className="p-6 text-center">
            <div className="text-3xl font-bold text-ortomio-green-600 mb-1">
              {activePlants}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-3">
              <Sprout size={16} />
              Piante attive
            </div>
          </Card>
          <Card variant="default" className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {monthlyTasks}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-3">
              <Calendar size={16} />
              Task questo mese
            </div>
          </Card>
          <Card variant="default" className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {monthlyHarvests}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-3">
              <ShoppingBasket size={16} />
              Raccolto questo mese
            </div>
          </Card>
        </div>

        {/* What to Plant Now */}
        <Card variant="elevated" className="p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            COSA PIANTARE ORA
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Basato sulla tua zona ({garden?.coordinates ? 'Basilicata' : 'Italia'}) e stagione
          </p>
          <div className="flex flex-wrap gap-3">
            {['🥬 Lattuga', '🥕 Carote', '🧅 Cipolle'].map((plant, idx) => (
              <button
                key={idx}
                className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium text-green-900"
                onClick={() => {
                  if (onNavigateToPlanner) {
                    onNavigateToPlanner()
                  } else {
                    window.location.href = '/app/garden?tab=timeline'
                  }
                }}
              >
                {plant}
              </button>
            ))}
            <Link
              href="/app/garden?tab=timeline"
              className="px-4 py-2 text-sm font-medium text-ortomio-green-600 hover:text-ortomio-green-700 flex items-center gap-3"
            >
              + Vedi tutti <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </main>

      {/* Quick Actions FAB */}
      <QuickActions gardenId={garden?.id} />
    </div>
  )
}

