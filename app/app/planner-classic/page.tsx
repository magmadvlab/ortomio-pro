'use client'

import { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'
import { Calendar, List, BarChart3, Clock, Leaf } from 'lucide-react'
import TaskCalendar from '@/components/planner/TaskCalendar'
import TaskList from '@/components/planner/TaskList'
import ClassicPlannerWithRotation from '@/components/planner/ClassicPlannerWithRotation'

export default function PlannerClassicPage() {
  const { storageProvider } = useStorage()
  const [activeTab, setActiveTab] = useState<'planner' | 'calendar' | 'list' | 'timeline' | 'stats'>('planner')
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)

  // Carica giardini e task
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        
        if (loadedGardens.length > 0) {
          const firstGarden = loadedGardens[0]
          setActiveGarden(firstGarden)
          
          const gardenTasks = await storageProvider.getTasks(firstGarden.id)
          setTasks(gardenTasks || [])
        }
      } catch (error) {
        console.error('Error loading planner data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [storageProvider])

  // Cambia giardino attivo
  const handleGardenChange = async (garden: Garden) => {
    setActiveGarden(garden)
    try {
      const gardenTasks = await storageProvider.getTasks(garden.id)
      setTasks(gardenTasks || [])
    } catch (error) {
      console.error('Error loading tasks for garden:', error)
      setTasks([])
    }
  }

  // Gestione task
  const handleTaskUpdate = async (task: GardenTask) => {
    try {
      await storageProvider.updateTask(task.id, task)
      if (activeGarden) {
        const updatedTasks = await storageProvider.getTasks(activeGarden.id)
        setTasks(updatedTasks || [])
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskCreate = async (taskData: Omit<GardenTask, 'id'>) => {
    try {
      await storageProvider.createTask(taskData)
      if (activeGarden) {
        const updatedTasks = await storageProvider.getTasks(activeGarden.id)
        setTasks(updatedTasks || [])
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      await storageProvider.deleteTask(taskId)
      if (activeGarden) {
        const updatedTasks = await storageProvider.getTasks(activeGarden.id)
        setTasks(updatedTasks || [])
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento planner...</p>
        </div>
      </div>
    )
  }

  if (!activeGarden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun orto trovato</h3>
          <p className="text-gray-600">Crea il tuo primo orto per iniziare a pianificare.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'planner' as const, label: '🌱 Pianifica Coltivazioni', icon: Leaf },
    { id: 'calendar' as const, label: '📅 Calendario', icon: Calendar },
    { id: 'list' as const, label: 'Lista Task', icon: List },
    { id: 'timeline' as const, label: 'Timeline', icon: Clock },
    { id: 'stats' as const, label: 'Statistiche', icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📅 Planner Classico</h1>
              <p className="text-sm text-gray-600">Pianifica coltivazioni con rotazione intelligente</p>
            </div>
            
            {/* Selettore Giardino */}
            {gardens.length > 1 && (
              <select
                value={activeGarden.id}
                onChange={(e) => {
                  const garden = gardens.find(g => g.id === e.target.value)
                  if (garden) handleGardenChange(garden)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {gardens.map(garden => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: Single row */}
          <nav className="hidden md:flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Mobile: Two rows */}
          <div className="md:hidden">
            {/* First row - Main tabs */}
            <nav className="flex space-x-4 border-b border-gray-100">
              {tabs.slice(0, 3).map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate">{tab.label.replace('🌱 ', '').replace('📅 ', '')}</span>
                  </button>
                )
              })}
            </nav>

            {/* Second row - Additional tabs */}
            <nav className="flex space-x-4">
              {tabs.slice(3).map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'planner' && (
          <ClassicPlannerWithRotation />
        )}

        {activeTab === 'calendar' && (
          <TaskCalendar
            garden={activeGarden}
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={handleTaskCreate}
            onTaskDelete={handleTaskDelete}
          />
        )}

        {activeTab === 'list' && (
          <TaskList
            garden={activeGarden}
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={handleTaskCreate}
            onTaskDelete={handleTaskDelete}
          />
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline in Sviluppo</h3>
            <p className="text-gray-600">
              La vista timeline sarà disponibile presto per visualizzare l'evoluzione temporale delle tue operazioni.
            </p>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Statistiche in Sviluppo</h3>
            <p className="text-gray-600">
              Le statistiche dettagliate sui task e le operazioni saranno disponibili presto.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}