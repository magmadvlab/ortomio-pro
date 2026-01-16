'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Advice from '@/components/Advice'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'

function AdvicePageContent() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  
  // Get initial tab from URL params
  const initialTab = (searchParams.get('tab') as 'diagnosis' | 'consultations' | 'agronomists') || 'diagnosis'
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const gardens = await storageProvider.getGardens()
        if (gardens.length > 0) {
          const activeGarden = gardens[0]
          setGarden(activeGarden)
          const gardenTasks = await storageProvider.getTasks(activeGarden.id)
          setTasks(gardenTasks || [])
        }
      } catch (error) {
        console.error('Error loading health data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])
  
  const handleAddToJournal = async (title: string, notes: string, date: string) => {
    try {
      if (garden) {
        await storageProvider.createTask({
          gardenId: garden.id,
          plantName: 'Trattamento',
          taskType: 'Treatment',
          date: date,
          notes: `${title}\n\n${notes}`,
          completed: false
        })
        
        // Ricarica i task
        const updatedTasks = await storageProvider.getTasks(garden.id)
        setTasks(updatedTasks || [])
      }
    } catch (error) {
      console.error('Error adding treatment to journal:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }
  
  if (!garden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nessun orto trovato</p>
          <a href="/app" className="text-green-600 hover:text-green-800 font-medium">
            Vai alla Dashboard per creare un orto
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <Advice 
      onAddToJournal={handleAddToJournal}
      initialTab={initialTab}
    />
  )
}

export default function AdvicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    }>
      <AdvicePageContent />
    </Suspense>
  )
}

