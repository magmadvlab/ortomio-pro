'use client'

import React from 'react'
import { Garden, GardenTask } from '@/types'
import DailyGardenReport from '../garden/DailyGardenReport'
import type { WeatherAlert } from '@/services/weatherService'

interface GardenCardProps {
  garden: Garden
  tasks: GardenTask[]
  weatherAlerts?: WeatherAlert[]
}

export function GardenCard({ garden, tasks, weatherAlerts = [] }: GardenCardProps) {
  const handleTaskClick = (taskId: string) => {
    // Naviga al task specifico o apri modal
    console.log('Task clicked:', taskId)
    // Potresti implementare navigazione o apertura modal qui
  }
  
  return (
    <DailyGardenReport 
      garden={garden} 
      tasks={tasks}
      weatherAlerts={weatherAlerts}
      onTaskClick={handleTaskClick}
    />
  )
}
