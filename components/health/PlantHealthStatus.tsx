'use client'

import React, { useMemo } from 'react'
import { Garden, GardenTask } from '@/types'
import { CheckCircle, AlertCircle, Heart } from 'lucide-react'

interface PlantHealthStatusProps {
  garden: Garden
  tasks: GardenTask[]
}

export function PlantHealthStatus({ garden, tasks }: PlantHealthStatusProps) {
  // Calcola stato piante
  const healthStats = useMemo(() => {
    const activePlants = tasks.filter(
      t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
    )
    
    // Per ora consideriamo tutte le piante sane
    // In futuro potremmo analizzare foto o sintomi
    const healthyCount = activePlants.length
    const needsAttentionCount = 0 // TODO: Calcolare da sintomi/foto
    
    return {
      healthy: healthyCount,
      needsAttention: needsAttentionCount,
      total: activePlants.length
    }
  }, [tasks])
  
  if (healthStats.total === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <Heart className="mx-auto text-gray-400 mb-3" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nessuna pianta attiva
        </h3>
        <p className="text-gray-600">
          Aggiungi semine o trapianti per monitorare la loro salute
        </p>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Stato Piante</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Piante Sane */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Piante Sane</p>
              <p className="text-2xl font-bold text-gray-900">
                {healthStats.healthy}
              </p>
            </div>
          </div>
        </div>
        
        {/* Bisogno Attenzione */}
        <div className={`border rounded-lg p-4 ${
          healthStats.needsAttention > 0
            ? 'bg-orange-50 border-orange-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle
              className={healthStats.needsAttention > 0 ? 'text-orange-600' : 'text-gray-400'}
              size={24}
            />
            <div>
              <p className="text-sm text-gray-600">Bisogno Attenzione</p>
              <p className={`text-2xl font-bold ${
                healthStats.needsAttention > 0 ? 'text-orange-900' : 'text-gray-500'
              }`}>
                {healthStats.needsAttention}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {healthStats.needsAttention === 0 && healthStats.healthy > 0 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-900 flex items-center gap-2">
            <CheckCircle size={16} />
            Tutte le tue piante sono in buona salute!
          </p>
        </div>
      )}
    </div>
  )
}







