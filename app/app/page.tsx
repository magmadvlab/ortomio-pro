'use client'

import { useStorage } from '@/packages/core/hooks/useStorage'
import { useState, useEffect } from 'react'
import { Garden, GardenTask } from '@/types'
import HomeDashboard from '@/components/shared/HomeDashboard'

export default function AppPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        
        if (loadedGardens.length > 0) {
          const firstGarden = loadedGardens[0]
          setActiveGarden(firstGarden)
          
          // Load tasks for the first garden
          const gardenTasks = await storageProvider.getTasks(firstGarden.id)
          setTasks(gardenTasks || [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  const refreshTasks = async () => {
    if (activeGarden) {
      try {
        const gardenTasks = await storageProvider.getTasks(activeGarden.id)
        setTasks(gardenTasks || [])
      } catch (error) {
        console.error('Error refreshing tasks:', error)
      }
    }
  }

  const handleUpdateTask = async (task: GardenTask) => {
    try {
      await storageProvider.updateTask(task.id, task)
      await refreshTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleUpdateGarden = async (garden: Garden) => {
    try {
      await storageProvider.updateGarden(garden.id, garden)
      setActiveGarden(garden)
      // Update gardens list
      const updatedGardens = await storageProvider.getGardens()
      setGardens(updatedGardens)
    } catch (error) {
      console.error('Error updating garden:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento OrtoMio PRO...</p>
        </div>
      </div>
    )
  }

  // Se non ci sono giardini, mostra un messaggio per crearne uno
  if (gardens.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Benvenuto in OrtoMio PRO!</h2>
          <p className="text-gray-600 mb-6">Crea il tuo primo orto per iniziare</p>
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

  // Dashboard completa professionale
  return (
    <HomeDashboard 
      garden={activeGarden || undefined}
      tasks={tasks}
      onUpdateGarden={handleUpdateGarden}
      onUpdateTask={handleUpdateTask}
      onRefreshTasks={refreshTasks}
    />
  )
}