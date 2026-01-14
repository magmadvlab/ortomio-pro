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
    <div className="space-y-6">
      {/* Calendario principale */}
      <CalendarAlmanac
        tasks={tasks}
        onDateClick={onDateClick}
        onUpdateTask={onUpdateTask}
      />
      
      {/* Nota: Challenge integrate nella vista Operations per professionisti */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Modalità Professionale:</strong> Le challenge sono state spostate nella sezione Operations 
          per un'esperienza più focalizzata sui task operativi.
        </p>
      </div>
    </div>
  )
}







