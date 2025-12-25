'use client'

import React from 'react'
import { GardenTask } from '@/types'
import { MapPin, ShoppingBasket } from 'lucide-react'
import { isPlantMature } from '@/utils/plantMaturityDetector'

interface PlantCardProps {
  plant: {
    task: GardenTask
    status: 'growing' | 'ready' | 'new'
    progress: number
    zone: string
    daysActive: number
  }
  onHarvest: (task: GardenTask) => void
  onViewDetails: (task: GardenTask) => void
}

export function PlantCard({ plant, onHarvest, onViewDetails }: PlantCardProps) {
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'ready': return '🥗'
      case 'growing': return '🌱'
      case 'new': return '🌿'
      default: return '🌱'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Pronto!'
      case 'growing': return 'In crescita'
      case 'new': return 'Appena seminato'
      default: return 'In crescita'
    }
  }

  // Verifica se la pianta è realmente matura usando isPlantMature
  const isMature = isPlantMature(plant.task)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getStatusEmoji(plant.status)}</span>
            <h3 className="font-bold text-gray-900">{plant.task.plantName}</h3>
          </div>
          {plant.task.variety && (
            <p className="text-sm text-gray-500">{plant.task.variety}</p>
          )}
        </div>
      </div>

      {/* Zone */}
      <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
        <MapPin size={14} />
        <span>{plant.zone}</span>
      </div>

      {/* Status */}
      <div className="mb-3">
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          plant.status === 'ready'
            ? 'bg-green-100 text-green-700'
            : plant.status === 'growing'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {getStatusLabel(plant.status)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progresso</span>
          <span>{plant.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              plant.progress >= 100
                ? 'bg-green-500'
                : plant.progress >= 50
                ? 'bg-blue-500'
                : 'bg-yellow-500'
            }`}
            style={{ width: `${plant.progress}%` }}
          />
        </div>
      </div>

      {/* Days Active Info */}
      <div className="mb-4 text-xs text-gray-500">
        {plant.daysActive} giorni dalla semina
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Mostra button Raccogli solo se pianta è matura (usando isPlantMature) */}
        {isMature && !plant.task.harvestLogId && (
          <button
            onClick={() => onHarvest(plant.task)}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-1 transition-colors"
          >
            <ShoppingBasket size={16} />
            Raccogli ora
          </button>
        )}
        <button
          onClick={() => onViewDetails(plant.task)}
          className={`py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors ${
            isMature && !plant.task.harvestLogId ? '' : 'flex-1'
          }`}
        >
          Dettagli
        </button>
      </div>
    </div>
  )
}
