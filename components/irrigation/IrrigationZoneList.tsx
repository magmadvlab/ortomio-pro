'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Edit, Trash2, Play, MapPin, Droplets, Clock } from 'lucide-react'
import { IrrigationZone } from '@/types/irrigation'

interface IrrigationZoneListProps {
  zones: IrrigationZone[]
  onEditZone: (zone: IrrigationZone) => void
  onDeleteZone: (zone: IrrigationZone) => void
  onWaterZone: (zone: IrrigationZone) => void
}

export function IrrigationZoneList({ zones, onEditZone, onDeleteZone, onWaterZone }: IrrigationZoneListProps) {
  const methodLabels = {
    Manual: 'Manuale',
    Hose: 'Tubo',
    Dripline: 'Ala Gocciolante',
    Drippers: 'Gocciolatori',
    MicroSprinkler: 'Micro-sprinkler',
    Sprinkler: 'Irrigatori',
    Mixed: 'Misto'
  }

  const getDaysSinceLastWatering = (lastWatered: string | null) => {
    if (!lastWatered) return null
    const days = Math.floor((Date.now() - new Date(lastWatered).getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const getWateringStatus = (zone: IrrigationZone) => {
    const days = getDaysSinceLastWatering(zone.lastWateredAt || null)
    if (days === null) return { color: 'gray', text: 'Mai irrigata', bg: 'bg-gray-100' }
    if (days === 0) return { color: 'green', text: 'Irrigata oggi', bg: 'bg-green-100' }
    if (days <= 2) return { color: 'blue', text: `${days} giorni fa`, bg: 'bg-blue-100' }
    if (days <= 5) return { color: 'yellow', text: `${days} giorni fa`, bg: 'bg-yellow-100' }
    return { color: 'red', text: `${days} giorni fa!`, bg: 'bg-red-100' }
  }

  if (zones.length === 0) {
    return (
      <Card className="p-32 text-center">
        <div className="text-gray-400 mb-3">
          <Droplets size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Nessuna zona irrigua</h3>
        <p className="text-gray-600">Crea la tua prima zona per iniziare</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {zones.map((zone) => {
        const status = getWateringStatus(zone)
        const plants = Array.isArray(zone.plantTypes) ? zone.plantTypes : []

        const hasArea = typeof zone.areaSqm === 'number' && !Number.isNaN(zone.areaSqm)
        const canComputeMinutesPer5mm = hasArea && zone.flowRateLph > 0

        // Determine status indicator color and pulse animation
        const isAlert = status.color === 'red' || status.color === 'yellow'
        const statusDotClass = {
          green: 'bg-green-500',
          blue: 'bg-blue-500',
          yellow: 'bg-amber-500',
          red: 'bg-red-500',
          gray: 'bg-gray-400'
        }[status.color]

        return (
          <Card
            key={zone.id}
            className="relative overflow-hidden hover:shadow-lg transition-shadow"
            variant="elevated"
          >
            {/* Status Indicator Dot */}
            <div className="absolute top-4 right-4">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${statusDotClass}`} />
                {isAlert && (
                  <div className={`absolute inset-0 w-3 h-3 rounded-full ${statusDotClass} animate-ping opacity-75`} />
                )}
              </div>
            </div>

            {/* Card Header with Icon */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Droplets className="text-blue-600" size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{zone.name}</h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-medium text-gray-600">
                      {methodLabels[zone.method]}
                    </span>
                    {zone.isAutomated && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        Auto
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Readings Grid */}
            <div className="p-6 space-y-4">
              {/* Status Banner */}
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${status.bg} text-${status.color}-700`}>
                {status.text}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hasArea && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-1">
                      <MapPin className="text-gray-400" size={14} />
                      <span className="text-xs text-gray-600">Area</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{zone.areaSqm} m²</div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-1">
                    <Droplets className="text-blue-400" size={14} />
                    <span className="text-xs text-gray-600">Portata</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{zone.flowRateLph} L/h</div>
                </div>

                {canComputeMinutesPer5mm && (
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <div className="flex items-center gap-3 mb-1">
                      <Clock className="text-purple-400" size={14} />
                      <span className="text-xs text-gray-600">Durata per 5mm</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {Math.round(((zone.areaSqm as number) * 5) / zone.flowRateLph)} minuti
                    </div>
                  </div>
                )}
              </div>

              {/* Plants */}
              {plants.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">Piante</div>
                  <div className="flex flex-wrap gap-3.5">
                    {plants.slice(0, 4).map((plant, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md"
                      >
                        {plant}
                      </span>
                    ))}
                    {plants.length > 4 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                        +{plants.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Schedule */}
              {zone.schedule && (
                <div className="text-xs text-gray-500 bg-purple-50 p-3 rounded">
                  <div className="font-medium text-purple-700 mb-1">Programmazione</div>
                  {zone.schedule.days?.join(', ')} alle {zone.schedule.time} per {zone.schedule.duration} min
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <Button
                onClick={() => onWaterZone(zone)}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play size={14} className="mr-1" />
                Irriga
              </Button>
              <Button onClick={() => onEditZone(zone)} variant="outline" size="sm">
                <Edit size={14} />
              </Button>
              <Button
                onClick={() => onDeleteZone(zone)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
