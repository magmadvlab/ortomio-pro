'use client'

import React from 'react'
import { Sun, Leaf, Globe } from 'lucide-react'
import { GardenClassification } from '@/services/seasonalSunWindows'

interface SolarClassificationBadgeProps {
  classification: GardenClassification
}

export default function SolarClassificationBadge({
  classification,
}: SolarClassificationBadgeProps) {
  const getIcon = () => {
    switch (classification.type) {
      case 'Estivo':
        return <Sun className="text-orange-500" size={20} />
      case 'NonEstivo':
        return <Leaf className="text-green-500" size={20} />
      case 'Misto':
        return <Globe className="text-blue-500" size={20} />
      default:
        return <Sun size={20} />
    }
  }

  const getColorClasses = () => {
    switch (classification.type) {
      case 'Estivo':
        return 'bg-orange-50 border-orange-200 text-orange-900'
      case 'NonEstivo':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'Misto':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const getTypeLabel = () => {
    switch (classification.type) {
      case 'Estivo':
        return 'Orto Estivo'
      case 'NonEstivo':
        return 'Orto Primaverile/Autunnale'
      case 'Misto':
        return 'Orto Misto'
      default:
        return 'Orto'
    }
  }

  return (
    <div
      className={`p-3 rounded-lg border ${getColorClasses()} flex items-start gap-3`}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <div className="font-semibold text-sm mb-1">{getTypeLabel()}</div>
        {classification.recommendations && classification.recommendations.length > 0 && (
          <p className="text-xs opacity-80">
            {classification.recommendations[0]}
          </p>
        )}
      </div>
    </div>
  )
}

