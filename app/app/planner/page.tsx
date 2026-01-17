'use client'

import SmartPlanner from '@/components/planner/SmartPlanner'
import TaskCalendar from '@/components/planner/TaskCalendar'
import TaskList from '@/components/planner/TaskList'
import PlannerAISuggestions from '@/components/planner/tabs/PlannerAISuggestions'
import PlannerHealthSuggestions from '@/components/planner/tabs/PlannerHealthSuggestions'
import CropRotationPlanner from '@/components/advice/CropRotationPlanner'
import BiologicalControlDashboard from '@/components/advice/BiologicalControlDashboard'
import MobileTabNavigation from '@/components/shared/MobileTabNavigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useState, useEffect } from 'react'
import { Garden, GardenTask } from '@/types'
import { Calendar, Clock, Activity, Target, CheckCircle, AlertTriangle, TrendingUp, List, Lightbulb, RefreshCw, Bug, Stethoscope } from 'lucide-react'
import { isSameDay, addDays, parseISO, format } from 'date-fns'

export default function PlannerPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'planner' | 'calendar' | 'timeline' | 'list' | 'ai-suggestions' | 'health-monitoring' | 'rotation' | 'biological'>('planner')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedGardens, loadedTasks] = await Promise.all([
          storageProvider.getGardens(),
          storageProvider.getTasks()
        ])
        setGardens(loadedGardens)
        setTasks(loadedTasks)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  const handleTasksUpdate = async (updatedTasks: GardenTask[]) => {
    try {
      // Aggiorna i task nel storage
      for (const task of updatedTasks) {
        const existingTask = tasks.find(t => t.id === task.id)
        if (!existingTask) {
          // Nuovo task - rimuovi l'id per createTask
          const { id, ...taskWithoutId } = task
          await storageProvider.createTask(taskWithoutId)
        } else {
          // Task esistente - usa updateTask
          await storageProvider.updateTask(task.id, task)
        }
      }
      setTasks(updatedTasks)
    } catch (error) {
      console.error('Error updating tasks:', error)
    }
  }

  // Genera dati timeline basati sui task reali
  const generateTimelineData = () => {
    const now = new Date()
    const completedTasks = tasks.filter(task => task.completed)
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))
      
      const dayTasks = completedTasks.filter(task => {
        const taskDate = new Date(task.completedAt || task.actualCompletedDate || task.date)
        return taskDate.toDateString() === date.toDateString()
      })
      
      return {
        date: date,
        label: date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }),
        count: dayTasks.length,
        tasks: dayTasks,
        percentage: Math.max((dayTasks.length / Math.max(completedTasks.length / 7, 1)) * 100, 0)
      }
    })
  }

  // Ottieni task per i prossimi 7 giorni
  const getUpcomingTasks = () => {
    const today = new Date()
    const upcoming = []
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i)
      const dayTasks = tasks.filter(task => {
        if (task.completed) return false
        const taskDate = task.nextDueDate ? parseISO(task.nextDueDate) : parseISO(task.date)
        return isSameDay(taskDate, date)
      })
      
      if (dayTasks.length > 0) {
        upcoming.push({
          date: date,
          label: i === 0 ? 'Oggi' : i === 1 ? 'Domani' : date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' }),
          tasks: dayTasks,
          isToday: i === 0,
          isTomorrow: i === 1
        })
      }
    }
    
    return upcoming
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (gardens.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nessun orto trovato</h2>
          <p className="text-gray-600 mb-6">Crea il tuo primo orto per usare la Centrale Operativa</p>
          <a 
            href="/app/garden" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Crea il tuo orto
          </a>
        </div>
      </div>
    )
  }

  const defaultGarden = gardens[0]
  const timelineData = generateTimelineData()
  const upcomingTasks = getUpcomingTasks()

  // Configurazione tab per il componente mobile
  const plannerTabs = [
    { id: 'planner', label: 'Planner AI', emoji: '🎯', icon: Target },
    { id: 'health-monitoring', label: 'Salute Piante', emoji: '🩺', icon: Stethoscope, badge: upcomingTasks.length },
    { id: 'ai-suggestions', label: 'Suggerimenti AI', emoji: '💡', icon: Lightbulb },
    { id: 'rotation', label: 'Rotazione Colture', emoji: '🔄', icon: RefreshCw },
    { id: 'biological', label: 'Controllo Biologico', emoji: '🐛', icon: Bug },
    { id: 'calendar', label: 'Calendario', emoji: '📅', icon: Calendar },
    { id: 'list', label: 'Lista Task', emoji: '📋', icon: List, badge: tasks.filter(t => !t.completed).length },
    { id: 'timeline', label: 'Timeline', emoji: '📊', icon: Activity }
  ]

  // Configurazione tab per NDVI
  const ndviTabs = [
    { id: 'overview', label: 'Panoramica', emoji: '📊', icon: BarChart3 },
    { id: 'map', label: 'Mappa NDVI', emoji: '🗺️', icon: Map },
    { id: 'zones', label: 'Zone', emoji: '📍', icon: MapPin },
    { id: 'trend', label: 'Trend Storico', emoji: '📈', icon: TrendingUp },
    { id: 'stress', label: 'Aree Stress', emoji: '⚠️', icon: AlertTriangle, badge: stressAreas.length }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Target className="text-green-600" size={28} />
          Centrale Operativa
        </h1>
        <p className="text-gray-600 mt-1">Pianificazione, calendario e timeline delle attività</p>
      </div>

      {/* Mobile-Friendly Tab Navigation */}
      <MobileTabNavigation
        tabs={plannerTabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
        className="mb-6"
      />

      {/* Contenuto Tabs */}
      {activeTab === 'planner' && (
        <SmartPlanner 
          garden={defaultGarden}
          tasks={tasks}
          onTasksUpdate={handleTasksUpdate}
        />
      )}

      {activeTab === 'health-monitoring' && (
        <PlannerHealthSuggestions
          garden={defaultGarden}
          tasks={tasks}
          onCreateTask={async (taskData) => {
            try {
              await storageProvider.createTask(taskData)
              const updatedTasks = await storageProvider.getTasks()
              setTasks(updatedTasks)
            } catch (error) {
              console.error('Error creating health task:', error)
            }
          }}
        />
      )}

      {activeTab === 'ai-suggestions' && (
        <PlannerAISuggestions
          garden={defaultGarden}
          tasks={tasks}
          onCreateTasks={async (newTasks) => {
            try {
              for (const task of newTasks) {
                await storageProvider.createTask(task)
              }
              const updatedTasks = await storageProvider.getTasks()
              setTasks(updatedTasks)
            } catch (error) {
              console.error('Error creating tasks:', error)
            }
          }}
        />
      )}

      {activeTab === 'rotation' && (
        <CropRotationPlanner />
      )}

      {activeTab === 'biological' && (
        <BiologicalControlDashboard />
      )}

      {activeTab === 'calendar' && (
        <TaskCalendar
          garden={defaultGarden}
          tasks={tasks}
          onTaskUpdate={async (task) => {
            try {
              await storageProvider.updateTask(task.id, task)
              const updatedTasks = await storageProvider.getTasks()
              setTasks(updatedTasks)
            } catch (error) {
              console.error('Error updating task:', error)
            }
          }}
          onTaskCreate={async (taskData) => {
            try {
              await storageProvider.createTask(taskData)
              const updatedTasks = await storageProvider.getTasks()
              setTasks(updatedTasks)
            } catch (error) {
              console.error('Error creating task:', error)
            }
          }}
          onTaskDelete={async (taskId) => {
            try {
              await storageProvider.deleteTask(taskId)
              const updatedTasks = await storageProvider.getTasks()
              setTasks(updatedTasks)
            } catch (error) {
              console.error('Error deleting task:', error)
            }
          }}
        />
      )}

      {activeTab === 'list' && (
        <TaskList
          garden={defaultGarden}
          tasks={tasks}
          onTaskUpdate={async (task) => {
            try {
              await storageProvider.updateTask(task.id, task)
              const updatedTasks = await storageProvider.getTasks()
              setTasks(updatedTasks)
            } catch (error) {
              console.error('Error updating task:', error)
            }
          }}
          onTaskCreate={async (taskData) => {
            try {
              await storageProvider.createTask(taskData)
              const updatedTasks = await storageProvider.getTasks()
              setTasks(updatedTasks)
            } catch (error) {
              console.error('Error creating task:', error)
            }
          }}
          onTaskDelete={async (taskId) => {
            try {
              await storageProvider.deleteTask(taskId)
              const updatedTasks = await storageProvider.getTasks()
              setTasks(updatedTasks)
            } catch (error) {
              console.error('Error deleting task:', error)
            }
          }}
        />
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Timeline Attività */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="text-green-600" size={20} />
                Andamento Attività (Ultimi 7 giorni)
              </h2>
              <div className="text-sm text-gray-500">
                {tasks.filter(t => t.completed).length} operazioni completate
              </div>
            </div>
            
            {tasks.length > 0 ? (
              <div className="space-y-6">
                {/* Grafico Timeline */}
                <div className="h-64 flex items-end justify-between gap-2">
                  {timelineData.map((dataPoint, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div 
                        className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600 cursor-pointer relative"
                        style={{ height: `${Math.max(dataPoint.percentage, 5)}%` }}
                        title={`${dataPoint.label}: ${dataPoint.count} operazioni`}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {dataPoint.count} operazioni
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 text-center">
                        {dataPoint.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Dettaglio Attività Recenti */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="text-blue-600" size={18} />
                    Attività Recenti
                  </h3>
                  
                  <div className="space-y-3">
                    {tasks
                      .filter(task => task.completed)
                      .sort((a, b) => {
                        const dateA = new Date(a.completedAt || a.actualCompletedDate || a.date)
                        const dateB = new Date(b.completedAt || b.actualCompletedDate || b.date)
                        return dateB.getTime() - dateA.getTime()
                      })
                      .slice(0, 10)
                      .map((task) => {
                        const completedDate = new Date(task.completedAt || task.actualCompletedDate || task.date)
                        return (
                          <div key={task.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{task.plantName}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {task.taskType}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{task.notes}</p>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {completedDate.toLocaleDateString('it-IT', { 
                                day: 'numeric', 
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Activity className="mx-auto mb-4" size={48} />
                  <p className="text-lg font-medium">Nessuna attività registrata</p>
                  <p className="text-sm">Inizia a completare operazioni per vedere la timeline</p>
                </div>
              </div>
            )}
          </div>

          {/* Statistiche Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completate</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.completed).length}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">Questa settimana</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Programma</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => !t.completed).length}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-orange-600">
                <AlertTriangle size={16} />
                <span className="text-sm">Da completare</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Efficienza</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}