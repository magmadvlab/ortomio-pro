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
    // I suggerimenti non hanno un task/route reale a cui puntare (id statici
    // generati da GardenSuggestionsService/WeatherAlert, non riferimenti a
    // GardenTask esistenti): il click espande la card in DailyGardenReport.
    console.log('Task clicked:', taskId)
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
