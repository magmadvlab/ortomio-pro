'use client'

import React from 'react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useTasksOptimized } from '@/packages/core/hooks/useTasksOptimized'
import Planner from '@/components/Planner'
import { Bot, Sparkles } from 'lucide-react'

export default function PlannerPage() {
  const { activeGarden } = useGarden()
  const { tasks: gardenTasks } = useTasksOptimized({ 
    gardenId: activeGarden?.id,
    limit: 100 
  })

  const handleAddToJournal = (plantName: string, notes: string, variety?: string, method?: 'Seed' | 'Seedling' | 'Sapling', date?: string, taskType?: any, additionalData?: any) => {
    // Handle adding to journal
    console.log('Adding to journal:', { plantName, notes, variety, method, date, taskType, additionalData })
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
      {/* Header con AI Badge */}
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
              <p className="text-gray-600 mt-1">Pianifica il tuo orto con l'assistenza dell'intelligenza artificiale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Planner Component */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Planner 
          onAddToJournal={handleAddToJournal}
          garden={activeGarden}
          tasks={gardenTasks || []}
        />
      </div>
    </div>
  )
}
