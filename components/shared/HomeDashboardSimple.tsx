'use client'

import { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'
import { 
  MapPin, Calendar, Wrench, Plus, CheckCircle, Loader2, ArrowRight, Package
} from 'lucide-react'
import Link from 'next/link'
import { isSameDay, addDays, parseISO, format } from 'date-fns'
import { GardenTypeWizard } from '@/components/GardenTypeWizard'

interface HomeDashboardProps {
  garden?: Garden
  tasks?: GardenTask[]
  onUpdateGarden?: (garden: Garden) => void
  onUpdateTask?: (task: GardenTask) => void
}

export function HomeDashboardSimple({ garden }: HomeDashboardProps) {
  const { storageProvider } = useStorage()

  // States
  const [activeGarden, setActiveGarden] = useState<Garden | null>(garden || null)
  const [gardenTasks, setGardenTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showGardenWizard, setShowGardenWizard] = useState(false)

  // Load gardens on mount
  useEffect(() => {
    const loadGardens = async () => {
      try {
        console.log('🔍 Loading gardens...')
        const loadedGardens = await storageProvider.getGardens()
        console.log('🔍 Loaded gardens:', loadedGardens.length)
        
        if (loadedGardens.length > 0 && !activeGarden) {
          setActiveGarden(loadedGardens[0])
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      } finally {
        setLoading(false)
      }
    }
    loadGardens()
  }, [storageProvider, activeGarden])

  // Load tasks when active garden changes
  useEffect(() => {
    const loadTasksForGarden = async () => {
      if (activeGarden) {
        try {
          console.log('🔍 Loading tasks for garden:', activeGarden.id)
          const loadedTasks = await storageProvider.getTasks(activeGarden.id)
          console.log('🔍 Loaded tasks:', loadedTasks?.length || 0)
          setGardenTasks(loadedTasks || [])
        } catch (error) {
          console.error('Error loading tasks for garden:', error)
          setGardenTasks([])
        }
      } else {
        setGardenTasks([])
      }
    }
    loadTasksForGarden()
  }, [activeGarden, storageProvider])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (!activeGarden) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="bg-white rounded-xl border-2 border-green-200 p-8 max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Benvenuto in OrtoMio!</h2>
              <p className="text-gray-600 mb-6">Crea il tuo primo orto per iniziare</p>
              <button 
                onClick={() => setShowGardenWizard(true)}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                Crea il tuo orto
              </button>
            </div>
          </div>
        </div>

        {/* Garden Creation Wizard */}
        {showGardenWizard && (
          <GardenTypeWizard
            onComplete={async (garden) => {
              try {
                console.log('✅ Garden created:', garden)
                setActiveGarden(garden)
                setShowGardenWizard(false)
              } catch (error) {
                console.error('Error after garden creation:', error)
              }
            }}
            onCancel={() => setShowGardenWizard(false)}
          />
        )}
      </>
    )
  }

  const todayTasks = (gardenTasks || []).filter(t => {
    if (t.completed) return false
    const taskDate = t.nextDueDate ? parseISO(t.nextDueDate) : parseISO(t.date)
    return isSameDay(taskDate, new Date())
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Garden Card */}
        <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <MapPin size={24} className="text-green-600" />
              {activeGarden.name}
            </h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {activeGarden.gardenType || 'Orto'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{gardenTasks.length}</div>
              <div className="text-sm text-gray-600">Task Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todayTasks.length}</div>
              <div className="text-sm text-gray-600">Oggi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(gardenTasks || []).filter(t => t.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completati</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(gardenTasks || []).filter(t => !t.completed).length}
              </div>
              <div className="text-sm text-gray-600">Da Fare</div>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar size={20} className="text-green-600" />
              Cosa Fare Oggi
            </h2>
            {todayTasks.length > 0 && (
              <Link
                href="/app/garden?tab=list"
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
              >
                Vedi tutti
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
              <p className="text-gray-600 font-medium">Nessun task per oggi!</p>
              <p className="text-sm text-gray-500 mt-1">Goditi il tuo orto 🌱</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayTasks.slice(0, 6).map(task => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{task.plantName}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {task.taskType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.notes}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const updatedTask = { ...task, completed: true }
                        await storageProvider.updateTask(task.id, updatedTask)
                        const updatedTasks = await storageProvider.getTasks(activeGarden.id)
                        setGardenTasks(updatedTasks || [])
                      }}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Completa
                    </button>
                    <button
                      onClick={async () => {
                        const newDate = addDays(new Date(), 1)
                        const updatedTask = { ...task, nextDueDate: format(newDate, 'yyyy-MM-dd') }
                        await storageProvider.updateTask(task.id, updatedTask)
                        const updatedTasks = await storageProvider.getTasks(activeGarden.id)
                        setGardenTasks(updatedTasks || [])
                      }}
                      className="px-3 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Rimanda
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Wrench size={20} className="text-green-600" />
            Azioni Rapide
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/app/garden/create"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus size={24} className="text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Nuovo Task</span>
            </Link>
            
            <Link
              href="/app/garden?tab=calendar"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Calendario</span>
            </Link>
            
            <Link
              href="/app/garden?tab=list"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package size={24} className="text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Tutti i Task</span>
            </Link>
            
            <Link
              href="/app/settings"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Wrench size={24} className="text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Impostazioni</span>
            </Link>

            <Link
              href="/farm"
              className="flex flex-col items-center p-4 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl mb-2">🌾</span>
              <span className="text-sm font-medium text-green-900">Command Center</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}