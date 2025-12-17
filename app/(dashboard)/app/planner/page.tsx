'use client'

import React from 'react'
import Planner from '@/components/Planner'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'

export default function PlannerPage() {
  const { storageProvider } = useStorage()
  const { tier } = useTier()
  const [garden, setGarden] = React.useState<any>(null)
  const [tasks, setTasks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    // Load garden and tasks
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const gardens = await storageProvider.getGardens()
        if (gardens.length > 0) {
          setGarden(gardens[0])
          const gardenTasks = await storageProvider.getTasks(gardens[0].id)
          setTasks(gardenTasks)
        } else {
          setError('Nessun orto trovato. Crea un orto dalla Dashboard per iniziare.')
        }
      } catch (err: any) {
        console.error('Error loading planner data:', err)
        setError(err.message || 'Errore nel caricamento dei dati')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])
  
  const handleAddToJournal = async (
    plantName: string,
    notes: string,
    variety?: string,
    method?: 'Seed' | 'Seedling',
    date?: string,
    taskType?: any,
    additionalData?: any
  ) => {
    // Implementation
  }
  
  const handleUpdateTask = async (task: any) => {
    await storageProvider.updateTask(task.id, task)
    const updatedTasks = await storageProvider.getTasks(garden?.id)
    setTasks(updatedTasks)
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
    <div className="min-h-screen">
      <ProFeatureGate
        feature="visual-planner"
        title="Visual Garden Planner"
        description="Pianifica il tuo orto con layout visivo interattivo"
        requiredTier="PLUS"
        showPreview={tier === 'FREE'}
      >
        <Planner
          garden={garden}
          tasks={tasks}
          onAddToJournal={handleAddToJournal}
          onUpdateTask={handleUpdateTask}
        />
      </ProFeatureGate>
    </div>
  )
}

