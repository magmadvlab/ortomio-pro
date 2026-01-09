'use client'

import React from 'react'
import { format, isToday, addDays, subDays } from 'date-fns'
import { it } from 'date-fns/locale'
import { GardenTask } from '@/types'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface DayViewProps {
  currentDate: Date
  tasks: GardenTask[]
  onDateChange: (date: Date) => void
  onTaskClick?: (task: GardenTask) => void
}

export function DayView({ currentDate, tasks, onDateChange, onTaskClick }: DayViewProps) {
  const handlePrevDay = () => {
    onDateChange(subDays(currentDate, 1))
  }

  const handleNextDay = () => {
    onDateChange(addDays(currentDate, 1))
  }

  const dayStr = format(currentDate, 'yyyy-MM-dd')
  const dayTasks = tasks.filter(task => {
    const taskDate = task.suggestedDate || task.date
    return taskDate === dayStr && !task.completed
  })

  // Group tasks by time (if they have suggestedTime)
  const tasksByTime = dayTasks.reduce((acc, task) => {
    const time = task.suggestedTime || '--:--'
    if (!acc[time]) {
      acc[time] = []
    }
    acc[time].push(task)
    return acc
  }, {} as Record<string, GardenTask[]>)

  const sortedTimes = Object.keys(tasksByTime).sort()

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'Sowing':
        return '🌱'
      case 'Transplant':
        return '🌿'
      case 'Harvest':
        return '🍅'
      case 'Irrigation':
        return '💧'
      case 'Treatment':
        return '⚗️'
      case 'Pruning':
        return '✂️'
      default:
        return '📋'
    }
  }

  return (
    <div className="space-y-4">
      {/* Day Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePrevDay}>
          <ChevronLeft size={20} />
        </Button>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">
            {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
          </h3>
          {isToday(currentDate) && (
            <span className="text-sm text-ortomio-green-600 font-medium">Oggi</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleNextDay}>
          <ChevronRight size={20} />
        </Button>
      </div>

      {/* Timeline */}
      {sortedTimes.length > 0 ? (
        <div className="space-y-4">
          {sortedTimes.map((time) => (
            <Card key={time} variant="default" className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 min-w-[80px]">
                  <Clock size={18} className="text-gray-400" />
                  <span className="font-semibold text-gray-700">{time}</span>
                </div>
                <div className="flex-1 space-y-2">
                  {tasksByTime[time].map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onTaskClick?.(task)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTaskIcon(task.taskType)}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {task.plantName} {task.variety && `(${task.variety})`}
                          </p>
                          <p className="text-sm text-gray-600">{task.taskType}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="default" className="p-8 text-center">
          <p className="text-gray-500">Nessun task programmato per oggi</p>
        </Card>
      )}
    </div>
  )
}

