'use client'

import React from 'react'
import { Garden, GardenTask } from '@/types'
import DailyGardenReport from '../garden/DailyGardenReport'

interface GardenCardProps {
  garden: Garden
  tasks: GardenTask[]
}

export function GardenCard({ garden, tasks }: GardenCardProps) {
  const handleTaskClick = (taskId: string) => {
    // Naviga al task specifico o apri modal
    console.log('Task clicked:', taskId)
    // Potresti implementare navigazione o apertura modal qui
  }
  
  return (
    <DailyGardenReport 
      garden={garden} 
      tasks={tasks}
      onTaskClick={handleTaskClick}
    />
  )
}
