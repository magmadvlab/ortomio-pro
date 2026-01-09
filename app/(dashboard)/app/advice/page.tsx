'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { HealthDashboard } from '@/components/health/HealthDashboard'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'

function AdvicePageContent() {
  const { storageProvider } = useStorage()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  
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
  
  return <HealthDashboard garden={garden} tasks={tasks} />
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

