'use client'

import { useStorage } from '@/packages/core/hooks/useStorage'
import { useState, useEffect } from 'react'
import { Garden, GardenTask } from '@/types'
import HomeDashboard from '@/components/shared/HomeDashboard'
import { GardenTypeWizard } from '@/components/GardenTypeWizard'

export default function AppPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showGardenWizard, setShowGardenWizard] = useState(false)

  // Helper function: Refresh gardens with retry logic
  const refreshGardensWithRetry = async (expectedGardenId?: string) => {
    const maxRetries = 3
    const delayMs = 200
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Refresh attempt ${attempt}/${maxRetries}`)
        
        // Wait before retry (except first attempt)
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
        
        const updatedGardens = await storageProvider.getGardens()
        console.log(`✅ Refresh successful: ${updatedGardens.length} gardens found`)
        
        // Verify expected garden is present if ID provided
        if (expectedGardenId) {
          const found = updatedGardens.find(g => g.id === expectedGardenId)
          if (found) {
            console.log(`✅ Confirmed garden ${expectedGardenId} in database`)
            setGardens(updatedGardens)
            return
          } else if (attempt < maxRetries) {
            console.log(`⚠️ Garden ${expectedGardenId} not yet visible, retrying...`)
            continue
          }
        }
        
        // Update state with fresh data
        setGardens(updatedGardens)
        return
      } catch (error) {
        console.error(`❌ Refresh attempt ${attempt} failed:`, error)
        if (attempt === maxRetries) {
          console.log('⚠️ All refresh attempts failed, keeping optimistic state')
        }
      }
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Loading gardens...')
        const loadedGardens = await storageProvider.getGardens()
        console.log('✅ Gardens loaded:', loadedGardens.length, loadedGardens)
        setGardens(loadedGardens)
        
        if (loadedGardens.length > 0) {
          const firstGarden = loadedGardens[0]
          console.log('✅ Setting active garden:', firstGarden.name, firstGarden.id)
          setActiveGarden(firstGarden)
          
          // Load tasks for the first garden
          const gardenTasks = await storageProvider.getTasks(firstGarden.id)
          console.log('✅ Tasks loaded:', gardenTasks?.length || 0)
          setTasks(gardenTasks || [])
        } else {
          console.log('❌ No gardens found!')
        }
      } catch (error) {
        console.error('❌ Error loading data:', error)
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
    console.log('⚠️ Rendering: No gardens found, showing create garden message')
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Benvenuto in OrtoMio PRO!</h2>
            <p className="text-gray-600 mb-6">Crea il tuo primo orto per iniziare</p>
            <button 
              onClick={() => setShowGardenWizard(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Crea il tuo orto
            </button>
          </div>
        </div>

        {/* Garden Creation Wizard */}
        {showGardenWizard && (
          <GardenTypeWizard
            onComplete={async (garden) => {
              try {
                console.log('✅ Garden created from wizard:', garden)
                console.log('📊 Storage provider available:', storageProvider.isAvailable())
                console.log('🔐 About to save garden to database...')
                
                // CRITICAL: Save garden to database FIRST
                const savedGarden = await storageProvider.createGarden(garden)
                console.log('💾 Garden saved to database successfully:', savedGarden.id)
                
                // OPTIMISTIC UPDATE: Add garden to state immediately
                console.log('🚀 Optimistic update: Adding garden to state')
                setGardens(prev => [...prev, savedGarden])
                setActiveGarden(savedGarden)
                setShowGardenWizard(false)
                
                // Background refresh with retry logic to confirm
                console.log('🔄 Starting background refresh with retry...')
                await refreshGardensWithRetry(savedGarden.id)
              } catch (error) {
                console.error('❌ CRITICAL ERROR: Failed to save garden to database:', error)
                console.error('Error details:', {
                  message: error instanceof Error ? error.message : 'Unknown error',
                  stack: error instanceof Error ? error.stack : undefined,
                  error
                })
                
                // Show error to user
                alert(`Errore nel salvare il giardino: ${error instanceof Error ? error.message : 'Errore sconosciuto'}. Riprova.`)
                
                // Don't close wizard on error - let user try again
              }
            }}
            onCancel={() => setShowGardenWizard(false)}
          />
        )}
      </>
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