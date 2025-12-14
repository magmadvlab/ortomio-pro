'use client'

import React from 'react'
import HarvestLog from '@/components/HarvestLog'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'

export default function HarvestPage() {
  const { storageProvider } = useStorage()
  const { tier, isConsumer, isProfessional } = useTier()
  const [garden, setGarden] = React.useState<any>(null)
  const [harvestLogs, setHarvestLogs] = React.useState<any[]>([])
  
  React.useEffect(() => {
    const loadData = async () => {
      const gardens = await storageProvider.getGardens()
      if (gardens.length > 0) {
        setGarden(gardens[0])
        const logs = await storageProvider.getHarvestLogs(gardens[0].id)
        setHarvestLogs(logs)
      }
    }
    loadData()
  }, [storageProvider])
  
  if (!garden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen">
      {isConsumer && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🍳 Ricette per i tuoi raccolti
          </h2>
          <p className="text-gray-600">Sezione ricette (da implementare)</p>
        </div>
      )}
      
      {isProfessional && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Analytics Avanzate
          </h2>
          <p className="text-gray-600">Analytics professionali (da implementare)</p>
        </div>
      )}
      
      <HarvestLog
        tasks={[]}
        onAddHarvest={async (plantName, data, season) => {
          await storageProvider.createHarvestLog({
            ...data,
            plantName,
            season,
            gardenId: garden.id,
          } as any)
          const logs = await storageProvider.getHarvestLogs(garden.id)
          setHarvestLogs(logs)
        }}
        onUpdateTask={async (task) => {
          await storageProvider.updateTask(task.id, task)
        }}
      />
    </div>
  )
}

