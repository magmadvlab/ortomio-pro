'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { ArrowRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Photo {
  id: string
  url: string
  date: Date
  plantName?: string
}

interface PhotoComparisonProps {
  beforePhoto: Photo
  afterPhoto: Photo
  daysDifference: number
}

export function PhotoComparison({
  beforePhoto,
  afterPhoto,
  daysDifference,
}: PhotoComparisonProps) {
  return (
    <Card variant="elevated" className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
        Confronto Crescita
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Before */}
        <div className="space-y-2">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={beforePhoto.url}
              alt="Prima"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Calendar size={14} />
              {format(beforePhoto.date, 'd MMM yyyy', { locale: it })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Prima</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ArrowRight className="text-ortomio-green-600" size={32} />
        </div>

        {/* After */}
        <div className="space-y-2">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={afterPhoto.url}
              alt="Dopo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Calendar size={14} />
              {format(afterPhoto.date, 'd MMM yyyy', { locale: it })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Dopo</p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Differenza: <span className="font-semibold text-ortomio-green-600">{daysDifference} giorni</span>
        </p>
      </div>
    </Card>
  )
}

