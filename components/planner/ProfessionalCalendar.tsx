'use client'

import React, { useState } from 'react'
import { Garden, GardenTask } from '@/types'
import { Calendar, ChevronLeft, ChevronRight, Moon, Sprout, Droplets, Scissors, Plus } from 'lucide-react'
import { translateTaskType } from '@/utils/taskTranslations'
import { calculateMoonPhase, type MoonPhaseInfo as MoonPhase } from '@/logic/lunarCalendar'

interface ProfessionalCalendarProps {
  garden: Garden
  tasks: GardenTask[]
  onTaskUpdate: (task: GardenTask) => Promise<void>
  onTaskCreate: (task: Omit<GardenTask, 'id'>) => Promise<void>
  onTaskDelete: (taskId: string) => Promise<void>
}

export default function ProfessionalCalendar({ 
  garden, 
  tasks, 
  onTaskUpdate, 
  onTaskCreate, 
  onTaskDelete 
}: ProfessionalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Generate calendar days
  const calendarDays = []
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const getTasksForDate = (day: number) => {
    if (!tasks || tasks.length === 0) return []
    
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]

    return tasks.filter(task => {
      const taskDate = new Date(task.date).toISOString().split('T')[0]
      const nextDueDate = task.nextDueDate ? new Date(task.nextDueDate).toISOString().split('T')[0] : null

      return taskDate === dateStr || nextDueDate === dateStr
    })
  }

  const getTaskPriority = (task: GardenTask, day: number) => {
    const taskDate = new Date(task.date)
    const currentDayDate = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    currentDayDate.setHours(0, 0, 0, 0)

    if (task.completed) return 'completed'
    if (currentDayDate < today) return 'overdue'
    if (currentDayDate.getTime() === today.getTime()) return 'today'
    return 'future'
  }

  const getTaskIcon = (taskType: string, priority: string) => {
    const baseIconClasses = priority === 'completed' ? 'opacity-50' :
                           priority === 'overdue' ? 'text-red-600' :
                           priority === 'today' ? 'font-bold' : ''

    switch (taskType) {
      case 'Sowing': return <Sprout size={12} className={`text-green-600 ${baseIconClasses}`} />
      case 'Transplant': return <Sprout size={12} className={`text-blue-600 ${baseIconClasses}`} />
      case 'Fertilize': return <Droplets size={12} className={`text-purple-600 ${baseIconClasses}`} />
      case 'Prune': return <Scissors size={12} className={`text-orange-600 ${baseIconClasses}`} />
      default: return <Droplets size={12} className={`text-gray-600 ${baseIconClasses}`} />
    }
  }

  const getMoonPhaseForDate = (day: number) => {
    const date = new Date(year, month, day)
    const moonPhase = calculateMoonPhase(date)
    
    return {
      emoji: moonPhase.isWaxing ? '🌒' : moonPhase.isWaning ? '🌘' : 
             moonPhase.phase === 'Full' ? '🌕' : 
             moonPhase.phase === 'New' ? '🌑' : '🌓',
      name: moonPhase.name,
      phase: moonPhase
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    const newDate = isSelected(day) ? null : date
    setSelectedDate(newDate)
  }

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year
  }

  const isSelected = (day: number) => {
    return selectedDate?.getDate() === day && 
           selectedDate?.getMonth() === month && 
           selectedDate?.getFullYear() === year
  }

  const getLunarAdvice = (moonPhase: MoonPhase, taskType: string) => {
    if (taskType === 'Sowing') {
      if (moonPhase.isWaxing || moonPhase.phase === 'New') {
        return { ideal: true, advice: '🌱 Ideale per semina (Luna Crescente)' }
      } else {
        return { ideal: false, advice: '⏳ Meglio aspettare Luna Crescente per semina' }
      }
    }
    if (taskType === 'Transplant') {
      if (moonPhase.isWaxing || moonPhase.phase === 'New') {
        return { ideal: true, advice: '🌱 Ideale per trapianto (Luna Crescente)' }
      } else {
        return { ideal: false, advice: '⏳ Meglio aspettare Luna Crescente per trapianto' }
      }
    }
    if (taskType === 'Harvest') {
      if (moonPhase.isWaning) {
        return { ideal: true, advice: '🌾 Ideale per raccolta (Luna Calante)' }
      } else {
        return { ideal: false, advice: '⏳ Meglio aspettare Luna Calante per raccolta' }
      }
    }
    return { ideal: true, advice: '🌙 Fase lunare accettabile' }
  }

  return (
    <div className="space-y-6">
      {/* Professional Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <Calendar size={24} className="text-green-600" />
                📅 Calendario PRO
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Calendario professionale con consigli lunari e gestione avanzata task
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-semibold text-gray-800 min-w-[140px] text-center">
                {currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
              <div key={day} className="text-center text-sm font-bold text-gray-500 py-3">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-20"></div>
              }

              const dayTasks = getTasksForDate(day)
              const moonInfo = getMoonPhaseForDate(day)
              const hasOverdueTasks = dayTasks.some(t => getTaskPriority(t, day) === 'overdue')
              const todayClass = isToday(day) ? 'bg-green-100 border-green-300 ring-2 ring-green-400' : ''
              const selectedClass = isSelected(day) ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-400' : ''
              const overdueClass = hasOverdueTasks && !isSelected(day) && !isToday(day) ? 'bg-red-50 border-red-200' : ''

              return (
                <div
                  key={`day-${year}-${month}-${day}-${index}`}
                  onClick={() => handleDateClick(day)}
                  className={`h-20 border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-all ${todayClass} ${selectedClass} ${overdueClass}`}
                >
                  <div className="flex justify-between items-start h-full">
                    <span className={`text-sm font-medium ${isToday(day) ? 'text-green-700' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    
                    {/* Moon phase for important days */}
                    {(moonInfo.name.includes('Nuova') || moonInfo.name.includes('Piena')) && (
                      <span className="text-xs" title={moonInfo.name}>
                        {moonInfo.emoji}
                      </span>
                    )}
                  </div>

                  {/* Task indicators */}
                  {dayTasks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayTasks.slice(0, 3).map((task, idx) => {
                        const priority = getTaskPriority(task, day)
                        const borderColor = priority === 'overdue' ? 'border-red-300' :
                                           priority === 'today' ? 'border-green-400' :
                                           priority === 'completed' ? 'border-gray-300' : 'border-gray-200'
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-center w-5 h-5 bg-white rounded-full border shadow-sm ${borderColor}`}
                            title={`${translateTaskType(task.taskType)}: ${task.plantName}${task.completed ? ' (completato)' : ''}`}
                          >
                            {getTaskIcon(task.taskType, priority)}
                          </div>
                        )
                      })}
                      {dayTasks.length > 3 && (
                        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">+</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected date info */}
        {selectedDate && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-4">
              {selectedDate.toLocaleDateString('it-IT', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
            
            {(() => {
              const dayTasks = getTasksForDate(selectedDate.getDate())
              const moonInfo = getMoonPhaseForDate(selectedDate.getDate())
              
              return (
                <div className="space-y-4">
                  {/* Moon phase info */}
                  <div className="flex items-center gap-3 text-sm">
                    <Moon size={16} className="text-purple-600" />
                    <span className="font-medium text-purple-700">
                      {moonInfo.emoji} {moonInfo.name}
                    </span>
                  </div>

                  {/* Tasks for selected date */}
                  {dayTasks.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Attività programmate ({dayTasks.length}):
                      </p>
                      {dayTasks.map((task, idx) => {
                        const priority = getTaskPriority(task, selectedDate.getDate())
                        const lunarAdvice = getLunarAdvice(moonInfo.phase, task.taskType)
                        const statusBadge = priority === 'overdue' ? '⚠️ In ritardo' :
                                           priority === 'completed' ? '✅ Completato' :
                                           priority === 'today' ? '🔔 Oggi' : ''
                        return (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              {getTaskIcon(task.taskType, priority)}
                              <span className="flex-1 font-medium">
                                {translateTaskType(task.taskType)}: {task.plantName} 
                                {task.variety && ` (${task.variety})`}
                              </span>
                              {statusBadge && <span className="text-xs">{statusBadge}</span>}
                            </div>
                            
                            {/* Lunar advice */}
                            <div className={`text-xs px-2 py-1 rounded ${
                              lunarAdvice.ideal ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {lunarAdvice.advice}
                            </div>
                            
                            {/* Zone and row info */}
                            {(task.zoneId || task.rowNumber) && (
                              <div className="flex gap-2 mt-2">
                                {task.zoneId && (
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded">
                                    Zona: {task.zoneId}
                                  </span>
                                )}
                                {task.rowNumber && (
                                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded">
                                    Fila {task.rowNumber}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500 mb-3">Nessuna attività programmata</p>
                      <button
                        onClick={() => {
                          // Apri il form di creazione task del calendario esistente
                          // Per ora, reindirizza alla lista task
                          window.location.hash = '#list'
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                      >
                        <Plus size={16} />
                        Aggiungi Task
                      </button>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Lunar Calendar Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Moon size={20} className="text-purple-600" />
          Consigli Lunari per l'Orto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">🌒 Luna Crescente (ideale per):</h4>
            <ul className="space-y-1 text-gray-600 ml-4">
              <li>• Semina di piante da foglia e frutto</li>
              <li>• Trapianto di piantine</li>
              <li>• Innesti e potature di formazione</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">🌘 Luna Calante (ideale per):</h4>
            <ul className="space-y-1 text-gray-600 ml-4">
              <li>• Semina di piante da radice</li>
              <li>• Raccolta per conservazione</li>
              <li>• Potature di produzione</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}