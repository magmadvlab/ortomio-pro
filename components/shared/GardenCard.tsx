'use client'

import React from 'react'
import { Garden, GardenTask } from '@/types'
import { Sprout, MapPin, Calendar, Sun } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface GardenCardProps {
  garden: Garden
  tasks: GardenTask[]
}

export function GardenCard({ garden, tasks }: GardenCardProps) {
  const activePlants = tasks.filter(
    t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
  ).length
  
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(
    t => !t.completed && t.date === today
  ).length
  
  const avgSunHours = garden.dailySunHours ?? 0
  const locationLabel = garden.coordinates
    ? `${garden.coordinates.latitude.toFixed(3)}, ${garden.coordinates.longitude.toFixed(3)}`
    : null
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex gap-5">
        {/* Garden Icon */}
        <div className="w-15 h-15 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sprout className="text-green-600" size={28} />
        </div>
        
        {/* Garden Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {garden.name}
          </h3>
          
          {/* Location */}
          {garden.coordinates && locationLabel ? (
            <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
              <MapPin size={14} />
              {locationLabel}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mb-3">Posizione non impostata</p>
          )}
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Sprout size={14} />
              {activePlants} piante
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {todayTasks} task oggi
            </span>
            {avgSunHours > 0 && (
              <span className="flex items-center gap-1">
                <Sun size={14} />
                {avgSunHours.toFixed(1)}h sole
              </span>
            )}
            {garden.sizeSqMeters && (
              <span className="flex items-center gap-1">
                📐 {garden.sizeSqMeters} m²
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
