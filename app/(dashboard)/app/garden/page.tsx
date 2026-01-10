'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { GardenView } from '@/components/garden/GardenView'
import { Garden, GardenTask } from '@/types'

function GardenContent() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [garden, setGarden] = useState<Garden | null>(null)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get active tab from URL params, default to 'timeline'
  const activeTab = searchParams.get('tab') || 'timeline'
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const gardens = await storageProvider.getGardens()
        if (gardens.length > 0) {
          const activeGarden = gardens[0]
          setGarden(activeGarden)
          const gardenTasks = await storageProvider.getTasks(activeGarden.id)
          setTasks(gardenTasks || [])
        } else {
          setError('Nessun orto trovato. Crea un orto dalla Dashboard per iniziare.')
        }
      } catch (err: any) {
        console.error('Error loading garden data:', err)
        setError(err.message || 'Errore nel caricamento dei dati')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])
  
  const handleTabChange = (tab: 'timeline' | 'calendar' | 'plants' | 'harvest' | 'structure') => {
    router.push(`/app/garden?tab=${tab}`)
  }
  
  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (task) {
      const newCompletedStatus = !task.completed
      const updates: any = { completed: newCompletedStatus }
      
      if (newCompletedStatus) {
        updates.actualCompletedDate = new Date().toISOString()
      } else {
        updates.actualCompletedDate = null
      }
      
      await storageProvider.updateTask(id, updates)
      const updatedTasks = await storageProvider.getTasks(garden?.id)
      setTasks(updatedTasks || [])
    }
  }
  
  const handleAddTask = async (task: Omit<GardenTask, 'id' | 'completed' | 'gardenId'>) => {
    try {
      if (!garden?.id) {
        console.error('Garden ID mancante')
        alert('Errore: giardino non selezionato')
        return
      }
      
      const newTask = await storageProvider.createTask({ 
        ...task, 
        gardenId: garden.id,
        completed: false
      })
      
      const updatedTasks = await storageProvider.getTasks(garden.id)
      setTasks(updatedTasks || [])
    } catch (error) {
      console.error('Errore aggiunta task:', error)
      alert('Errore durante il salvataggio del task: ' + (error as Error).message)
    }
  }
  
  const handleDeleteTask = async (id: string) => {
    await storageProvider.deleteTask(id)
    const updatedTasks = await storageProvider.getTasks(garden?.id)
    setTasks(updatedTasks || [])
  }
  
  const handleUpdateTask = async (task: GardenTask) => {
    await storageProvider.updateTask(task.id, task)
    const updatedTasks = await storageProvider.getTasks(garden?.id)
    setTasks(updatedTasks || [])
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }
  
  if (error || !garden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Nessun orto trovato'}</p>
          <a href="/app" className="text-green-600 hover:text-green-800 font-medium">
            Vai alla Dashboard per creare un orto
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <GardenView
      garden={garden}
      tasks={tasks}
      activeTab={activeTab as 'timeline' | 'calendar' | 'plants' | 'harvest' | 'structure'}
      onTabChange={handleTabChange}
      onToggleTask={handleToggleTask}
      onAddTask={handleAddTask}
      onDeleteTask={handleDeleteTask}
      onUpdateTask={handleUpdateTask}
    />
  )
}

export default function GardenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    }>
      <GardenContent />
    </Suspense>
  )
}

