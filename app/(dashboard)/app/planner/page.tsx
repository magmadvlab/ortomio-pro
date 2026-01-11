'use client'

import React, { useState } from 'react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useTasksOptimized } from '@/packages/core/hooks/useTasksOptimized'
import Planner from '@/components/Planner'
import IntegratedCalendarWithChallenges from '@/components/calendar/IntegratedCalendarWithChallenges'
import { Bot, Sparkles, Calendar, Grid3X3, Target } from 'lucide-react'
import { GardenTask } from '@/types'

export default function PlannerPage() {
  const { activeGarden } = useGarden()
  const { tasks: gardenTasks, updateTask } = useTasksOptimized({ 
    gardenId: activeGarden?.id,
    limit: 100 
  })
  
  const [viewMode, setViewMode] = useState<'calendar' | 'planner'>('calendar')

  const handleAddToJournal = (plantName: string, notes: string, variety?: string, method?: 'Seed' | 'Seedling' | 'Sapling', date?: string, taskType?: any, additionalData?: any) => {
    // Handle adding to journal
    console.log('Adding to journal:', { plantName, notes, variety, method, date, taskType, additionalData })
  }

  const handleTaskUpdate = (task: GardenTask) => {
    if (updateTask) {
      updateTask(task)
    }
  }

  const handleChallengeComplete = (challenge: any) => {
    console.log('Challenge completed:', challenge)
    // TODO: Integrate with badge system
  }

  if (!activeGarden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento planner...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header con AI Badge e View Toggle */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                🌱 Planner Intelligente
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Bot size={16} />
                  AI Powered
                  <Sparkles size={14} className="animate-pulse" />
                </span>
              </h1>
              <p className="text-gray-600 mt-1">
                {viewMode === 'calendar' 
                  ? 'Calendario integrato con challenge giornaliere e task intelligenti'
                  : 'Pianifica il tuo orto con l\'assistenza dell\'intelligenza artificiale'
                }
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar size={16} />
                Calendario + Challenge
              </button>
              <button
                onClick={() => setViewMode('planner')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'planner'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 size={16} />
                Planner Classico
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          {viewMode === 'calendar' && (
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Target className="text-purple-600" size={16} />
                <span className="text-gray-600">
                  Challenge integrate con il calendario per un'esperienza unificata
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'calendar' ? (
          <IntegratedCalendarWithChallenges
            tasks={gardenTasks || []}
            onTaskUpdate={handleTaskUpdate}
            onChallengeComplete={handleChallengeComplete}
          />
        ) : (
          <Planner 
            onAddToJournal={handleAddToJournal}
            garden={activeGarden}
            tasks={gardenTasks || []}
          />
        )}
      </div>
    </div>
  )
}
