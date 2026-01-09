'use client'

import React from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns'
import { it } from 'date-fns/locale'
import { GardenTask } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface WeekViewProps {
  currentDate: Date
  tasks: GardenTask[]
  onDateChange: (date: Date) => void
  onTaskClick?: (task: GardenTask) => void
}

export function WeekView({ currentDate, tasks, onDateChange, onTaskClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handlePrevWeek = () => {
    onDateChange(subWeeks(currentDate, 1))
  }

  const handleNextWeek = () => {
    onDateChange(addWeeks(currentDate, 1))
  }

  const getTasksForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return tasks.filter(task => {
      const taskDate = task.suggestedDate || task.date
      return taskDate === dayStr && !task.completed
    })
  }

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
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePrevWeek}>
          <ChevronLeft size={20} />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900">
          {format(weekStart, 'd MMM', { locale: it })} - {format(weekEnd, 'd MMM yyyy', { locale: it })}
        </h3>
        <Button variant="ghost" size="sm" onClick={handleNextWeek}>
          <ChevronRight size={20} />
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day)
          const isCurrentDay = isToday(day)
          
          return (
            <Card
              key={day.toISOString()}
              variant={isCurrentDay ? 'elevated' : 'default'}
              className={`p-3 min-h-[120px] ${
                isCurrentDay ? 'border-2 border-ortomio-green-500' : ''
              }`}
            >
              <div className="mb-2">
                <div className={`text-xs font-semibold uppercase ${
                  isCurrentDay ? 'text-ortomio-green-600' : 'text-gray-500'
                }`}>
                  {format(day, 'EEE', { locale: it })}
                </div>
                <div className={`text-lg font-bold ${
                  isCurrentDay ? 'text-ortomio-green-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
              
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className="w-full text-left p-1.5 bg-gray-50 hover:bg-gray-100 rounded text-xs transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{getTaskIcon(task.taskType)}</span>
                      <span className="truncate">{task.plantName}</span>
                    </div>
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayTasks.length - 3} altri
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

