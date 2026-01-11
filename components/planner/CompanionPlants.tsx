'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Sprout, AlertTriangle } from 'lucide-react'

interface CompanionPlantsProps {
  friendlyPlants?: Array<{ name: string; emoji: string }>
  avoidPlants?: Array<{ name: string; emoji: string }>
}

export function CompanionPlants({ 
  friendlyPlants = [], 
  avoidPlants = [] 
}: CompanionPlantsProps) {
  // Default companion plants se non forniti
  const defaultFriendly = [
    { name: 'Basilico', emoji: '🌿' },
    { name: 'Carote', emoji: '🥕' },
    { name: 'Cipolle', emoji: '🧅' },
    { name: 'Sedano', emoji: '🥬' },
  ]

  const defaultAvoid = [
    { name: 'Patate', emoji: '🥔' },
    { name: 'Cetrioli', emoji: '🥒' },
  ]

  const friendly = friendlyPlants.length > 0 ? friendlyPlants : defaultFriendly
  const avoid = avoidPlants.length > 0 ? avoidPlants : defaultAvoid

  return (
    <Card variant="default" className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sprout className="text-ortomio-green-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-900">Piante Amiche</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Coltiva vicino a queste piante per risultati migliori:
      </p>

      {/* Friendly Plants */}
      <div className="flex flex-wrap gap-3 mb-4">
        {friendly.map((plant, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center px-4 py-3 text-base bg-ortomio-green-50 rounded-lg border border-ortomio-green-200"
          >
            <span className="text-lg md:text-xl mb-1">{plant.emoji}</span>
            <span className="text-xs font-medium text-ortomio-green-700">{plant.name}</span>
          </div>
        ))}
      </div>

      {/* Avoid Plants */}
      {avoid.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="text-red-500" size={16} />
            <span className="text-sm font-semibold text-red-600">Da evitare vicino</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {avoid.map((plant, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center px-4 py-3 text-base bg-red-50 rounded-lg border border-red-200"
              >
                <span className="text-lg md:text-xl mb-1">{plant.emoji}</span>
                <span className="text-xs font-medium text-red-700">{plant.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}







