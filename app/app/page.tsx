'use client'

import { useStorage } from '@/packages/core/hooks/useStorage'
import { useState, useEffect } from 'react'
import { Garden, GardenTask } from '@/types'
import HomeDashboard from '@/components/shared/HomeDashboard'
import { UserOnboardingWizard, OnboardingData } from '@/components/onboarding/UserOnboardingWizard'

export default function AppPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

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
        } else {
          // Nessun orto trovato - mostra wizard
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      // Crea il primo orto con i dati del wizard
      const newGarden: Partial<Garden> = {
        name: data.gardenName || 'Il mio orto',
        type: data.gardenTypes?.[0] || 'orto',
        location: data.location,
        size: 0, // Da configurare dopo
        notes: `Creato tramite wizard - Tipo utente: ${data.userType}`,
      }
      
      const createdGarden = await storageProvider.createGarden(newGarden as Garden)
      
      // Ricarica i dati
      const loadedGardens = await storageProvider.getGardens()
      setGardens(loadedGardens)
      setActiveGarden(createdGarden)
      setShowOnboarding(false)
    } catch (error) {
      console.error('Error creating garden from onboarding:', error)
    }
  }

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

  // Se non ci sono giardini, mostra wizard di onboarding
  if (gardens.length === 0 || showOnboarding) {
    return (
      <UserOnboardingWizard
        onComplete={handleOnboardingComplete}
        allowSkip={false}
      />
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