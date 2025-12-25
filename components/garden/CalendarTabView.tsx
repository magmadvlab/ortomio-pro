'use client'

import React from 'react'
import { Garden, GardenTask } from '@/types'
import CalendarAlmanac from '@/components/CalendarAlmanac'

interface CalendarTabViewProps {
  garden: Garden
  tasks: GardenTask[]
  onUpdateTask: (task: GardenTask) => void
  onDateClick?: (date: Date) => void
}

export function CalendarTabView({ 
  garden, 
  tasks, 
  onUpdateTask,
  onDateClick 
}: CalendarTabViewProps) {
  return (
    <div className="space-y-4">
      <CalendarAlmanac
        tasks={tasks}
        onDateClick={onDateClick}
        onUpdateTask={onUpdateTask}
      />
    </div>
  )
}




