'use client'

import React, { useState } from 'react'
import { Calendar, Grid3X3, List, Filter, Clock } from 'lucide-react'
import { TimelineView } from '@/components/garden/TimelineView'
import { PlantLifecycleTimeline } from '@/components/planner/PlantLifecycleTimeline'

interface PlannerCalendarProps {
  garden: any
  tasks: any[]
  onAddToJournal: (plantName: string, notes: string, variety?: string, method?: 'Seed' | 'Seedling', date?: string, taskType?: any, additionalData?: any) => void
  onUpdateTask: (task: any) => void
}

type ViewMode = 'timeline' | 'lifecycle' | 'list'

export default function PlannerCalendar({ garden, tasks, onUpdateTask }: PlannerCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'completed'>('all')
  const [filterPlant, setFilterPlant] = useState<string>('all')

  // Filtra tasks
  const filteredTasks = tasks.filter(task => {
    if (filterType === 'pending' && task.completed) return false
    if (filterType === 'completed' && !task.completed) return false
    if (filterPlant !== 'all' && task.plantName !== filterPlant) return false
    return true
  })

  // Ottieni piante uniche per il filtro
  const uniquePlants = [...new Set(tasks.map(task => task.plantName).filter(Boolean))]

  const renderListView = () => {
    const groupedTasks = filteredTasks.reduce((acc, task) => {
      const date = task.date || 'Nessuna data'
      if (!acc[date]) acc[date] = []
      acc[date].push(task)
      return acc
    }, {} as Record<string, any[]>)

    const sortedDates = Object.keys(groupedTasks).sort()

    return (
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={16} />
              {date === 'Nessuna data' ? 'Task senza data' : new Date(date).toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            
            <div className="space-y-3">
              {groupedTasks[date].map((task: any) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    task.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.completed ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {task.taskType} - {task.plantName}
                      </p>
                      {task.variety && (
                        <p className="text-sm text-gray-600">Varietà: {task.variety}</p>
                      )}
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.completed 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {task.completed ? 'Completato' : 'In attesa'}
                    </span>
                    
                    {!task.completed && (
                      <button
                        onClick={() => onUpdateTask({ ...task, completed: true })}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Completa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {sortedDates.length === 0 && (
          <div className="text-center py-12">
            <List className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun task trovato</h3>
            <p className="text-gray-600">Modifica i filtri o aggiungi nuovi task al tuo piano</p>
          </div>
        )}
      </div>
    )
  }

  const renderLifecycleView = () => {
    return (
      <div className="space-y-6">
        {uniquePlants.map(plantName => (
          <PlantLifecycleTimeline
            key={plantName}
            plantName={plantName}
            sowingMonths={[0, 1, 2]} // Esempio: Gen-Mar
            transplantMonths={[2, 3, 4]} // Esempio: Mar-Mag
            harvestMonths={[5, 6, 7]} // Esempio: Giu-Ago
          />
        ))}
        
        {uniquePlants.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna pianta nel piano</h3>
            <p className="text-gray-600">Aggiungi piante per visualizzare i cicli colturali</p>
          </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'timeline':
        return (
          <TimelineView
            garden={garden}
            tasks={filteredTasks}
            onUpdateTask={onUpdateTask}
          />
        )
      case 'lifecycle':
        return renderLifecycleView()
      case 'list':
        return renderListView()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-500" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Calendario e Timeline</h2>
              <p className="text-gray-600">Visualizza la pianificazione temporale usando i componenti esistenti</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 size={14} />
              Timeline
            </button>
            <button
              onClick={() => setViewMode('lifecycle')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'lifecycle'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={14} />
              Cicli
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={14} />
              Lista
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtri:</span>
          </div>

          {/* Status Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti i task</option>
            <option value="pending">In attesa</option>
            <option value="completed">Completati</option>
          </select>

          {/* Plant Filter */}
          <select
            value={filterPlant}
            onChange={(e) => setFilterPlant(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutte le piante</option>
            {uniquePlants.map(plant => (
              <option key={plant} value={plant}>{plant}</option>
            ))}
          </select>

          {/* Stats */}
          <div className="flex items-center gap-4 ml-auto text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Totale: {filteredTasks.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>In attesa: {filteredTasks.filter(t => !t.completed).length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Completati: {filteredTasks.filter(t => t.completed).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Reusing existing timeline components */}
      {renderContent()}
    </div>
  )
}