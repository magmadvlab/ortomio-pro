'use client'

import React, { useMemo } from 'react'
import { Garden, GardenTask } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { format, parseISO, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'
import { GanttChart, Calendar as CalendarIcon } from 'lucide-react'

interface TimelineViewProps {
  garden: Garden
  tasks: GardenTask[]
  onUpdateTask: (task: GardenTask) => void
}

export function TimelineView({ garden, tasks, onUpdateTask }: TimelineViewProps) {
  // Filter tasks to show in timeline (Sowing, Transplant, Harvest)
  const timelineTasks = useMemo(() => {
    return tasks.filter(task => 
      ['Sowing', 'Transplant', 'Harvest'].includes(task.taskType) && !task.completed
    )
  }, [tasks])
  
  // Group tasks by plant
  const tasksByPlant = useMemo(() => {
    const grouped = new Map<string, GardenTask[]>()
    timelineTasks.forEach(task => {
      const plantName = task.plantName
      if (!grouped.has(plantName)) {
        grouped.set(plantName, [])
      }
      grouped.get(plantName)!.push(task)
    })
    return grouped
  }, [timelineTasks])
  
  // Calculate timeline dates
  const getTimelineRange = () => {
    if (timelineTasks.length === 0) {
      const today = new Date()
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
      }
    }
    
    const dates = timelineTasks
      .map(t => t.date ? parseISO(t.date) : new Date())
      .filter(d => !isNaN(d.getTime()))
    
    if (dates.length === 0) {
      const today = new Date()
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
      }
    }
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    
    // Extend range by 3 months
    return {
      start: new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1),
      end: new Date(maxDate.getFullYear(), maxDate.getMonth() + 3, 0)
    }
  }
  
  const timelineRange = getTimelineRange()
  const totalDays = differenceInDays(timelineRange.end, timelineRange.start)
  
  const getTaskPosition = (task: GardenTask) => {
    if (!task.date) return { left: 0, width: 0 }
    
    const taskDate = parseISO(task.date)
    const daysFromStart = differenceInDays(taskDate, timelineRange.start)
    const leftPercent = (daysFromStart / totalDays) * 100
    
    // Calculate width based on task type
    let widthDays = 7 // Default width
    const master = getMasterSheetSync(task.plantName)
    
    if (task.taskType === 'Sowing' && master?.daysToMaturity) {
      widthDays = master.daysToMaturity
    } else if (task.taskType === 'Harvest') {
      widthDays = 14 // Harvest window
    }
    
    const widthPercent = (widthDays / totalDays) * 100
    
    return {
      left: Math.max(0, Math.min(100, leftPercent)),
      width: Math.min(100 - leftPercent, widthPercent)
    }
  }
  
  const getTaskColor = (task: GardenTask) => {
    if (task.completed) {
      return 'bg-gray-400 border-2 border-gray-600'
    }
    switch (task.taskType) {
      case 'Sowing':
        return 'bg-green-500'
      case 'Transplant':
        return 'bg-blue-500'
      case 'Harvest':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }
  
  const getTaskPhase = (task: GardenTask) => {
    if (task.completed) return 'Completato'
    switch (task.taskType) {
      case 'Sowing':
        return 'Semina'
      case 'Transplant':
        return 'Crescita'
      case 'Harvest':
        return 'Raccolta'
      default:
        return 'Attività'
    }
  }
  
  const getTaskLabel = (task: GardenTask) => {
    const master = getMasterSheetSync(task.plantName)
    const variety = task.variety ? ` (${task.variety})` : ''
    
    switch (task.taskType) {
      case 'Sowing':
        return `Semina ${task.plantName}${variety}`
      case 'Transplant':
        return `Trapianto ${task.plantName}${variety}`
      case 'Harvest':
        return `Raccolta ${task.plantName}${variety}`
      default:
        return task.plantName
    }
  }
  
  // Generate month markers
  const monthMarkers = useMemo(() => {
    const markers: { date: Date; label: string; position: number }[] = []
    let current = new Date(timelineRange.start)
    
    while (current <= timelineRange.end) {
      const daysFromStart = differenceInDays(current, timelineRange.start)
      const position = (daysFromStart / totalDays) * 100
      
      markers.push({
        date: new Date(current),
        label: format(current, 'MMM yyyy', { locale: it }),
        position
      })
      
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
    }
    
    return markers
  }, [timelineRange, totalDays])
  
  if (timelineTasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <GanttChart size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nessun task nella timeline
        </h3>
        <p className="text-gray-600">
          Aggiungi semine, trapianti o raccolte per visualizzarli nella timeline
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-col md:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Timeline Coltivazioni</h2>
          {/* Legenda Migliorata */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-3 px-2 py-1 bg-green-50 rounded">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-700 font-medium">Semina</span>
            </div>
            <div className="flex items-center gap-3 px-2 py-1 bg-blue-50 rounded">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-gray-700 font-medium">Crescita</span>
            </div>
            <div className="flex items-center gap-3 px-2 py-1 bg-orange-50 rounded">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className="text-gray-700 font-medium">Raccolta</span>
            </div>
            <div className="flex items-center gap-3 px-2 py-1 bg-gray-100 rounded">
              <div className="w-4 h-4 rounded bg-gray-400 border-2 border-gray-600"></div>
              <span className="text-gray-700 font-medium">Completato</span>
            </div>
          </div>
        </div>
        
        {/* Timeline Container */}
        <div className="relative" style={{ minHeight: `${tasksByPlant.size * 80 + 60}px` }}>
          {/* Month Markers */}
          <div className="absolute top-0 left-0 right-0 h-8 border-b border-gray-300">
            {monthMarkers.map((marker, idx) => (
              <div
                key={idx}
                className="absolute top-0 h-full border-l border-gray-300"
                style={{ left: `${marker.position}%` }}
              >
                <span className="absolute -top-6 left-0 text-xs text-gray-600 whitespace-nowrap">
                  {marker.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Today Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{
              left: `${(differenceInDays(new Date(), timelineRange.start) / totalDays) * 100}%`
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-red-600 whitespace-nowrap">
              Oggi
            </div>
          </div>
          
          {/* Tasks by Plant */}
          {Array.from(tasksByPlant.entries()).map(([plantName, plantTasks], plantIdx) => {
            const rowTop = 60 + plantIdx * 80
            
            return (
              <div key={plantName} className="absolute left-0 right-0" style={{ top: `${rowTop}px` }}>
                {/* Plant Label */}
                <div className="absolute left-0 w-32 text-sm font-medium text-gray-900 pr-2">
                  {plantName}
                </div>
                
                {/* Task Bars */}
                <div className="ml-32 relative h-12">
                  {plantTasks.map((task, taskIdx) => {
                    const { left, width } = getTaskPosition(task)
                    const color = getTaskColor(task)
                    
                    return (
                      <div
                        key={task.id}
                        className={`absolute rounded px-2 py-1 text-xs cursor-pointer hover:opacity-90 transition-opacity shadow-sm ${
                          task.completed 
                            ? 'bg-gray-300 border-2 border-gray-500 text-gray-700' 
                            : 'text-white ' + color
                        }`}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          minWidth: '60px'
                        }}
                        title={`${getTaskPhase(task)}: ${getTaskLabel(task)}${task.date ? ` - ${format(parseISO(task.date), 'dd/MM/yyyy')}` : ''}`}
                        onClick={() => {
                          // Could open task details modal
                        }}
                      >
                        <div className="truncate font-medium">{getTaskPhase(task)}</div>
                        {task.date && (
                          <div className={`text-[10px] ${task.completed ? 'text-gray-600' : 'opacity-90'}`}>
                            {format(parseISO(task.date), 'dd/MM')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Legenda Completa in Fondo */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-orange-50 rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Legenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-700"><strong>Semina</strong> - Inizio coltivazione</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-gray-700"><strong>Crescita</strong> - Trapianto e sviluppo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-gray-700"><strong>Raccolta</strong> - Finestra raccolta</span>
              </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-gray-400 border-2 border-gray-600"></div>
            <span className="text-gray-700"><strong>Completato</strong> - Attività conclusa</span>
            </div>
        </div>
      </div>
    </div>
  )
}
