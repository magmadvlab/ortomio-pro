'use client'

import React from 'react'
import { Garden, GardenTask } from '@/types'
import IntegratedCalendarWithChallenges from '@/components/calendar/IntegratedCalendarWithChallenges'

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
  const handleChallengeComplete = (challenge: any) => {
    // Handle challenge completion - could integrate with user progress system
    console.log('Challenge completed:', challenge)
    // You could add XP tracking, badge unlocking, etc. here
  }

  return (
    <div className="space-y-4">
      <IntegratedCalendarWithChallenges
        tasks={tasks}
        onTaskUpdate={onUpdateTask}
        onChallengeComplete={handleChallengeComplete}
        onDateClick={onDateClick}
      />
    </div>
  )
}







