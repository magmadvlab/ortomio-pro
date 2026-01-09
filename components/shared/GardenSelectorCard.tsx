'use client'

import React, { useState, useMemo } from 'react'
import { Garden, GardenTask } from '@/types'
import { ChevronDown, MapPin, Sprout, Calendar, Sun, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface GardenSelectorCardProps {
  gardens: Garden[]
  activeGarden: Garden
  tasks: GardenTask[]
  onGardenChange: (garden: Garden) => void
  onAddGarden?: () => void
}

export function GardenSelectorCard({
  gardens,
  activeGarden,
  tasks,
  onGardenChange,
  onAddGarden
}: GardenSelectorCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Calcola statistiche per il giardino attivo
  const stats = useMemo(() => {
    const activePlants = tasks.filter(
      t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
    ).length
    
    const today = new Date().toISOString().split('T')[0]
    const todayTasks = tasks.filter(
      t => !t.completed && t.date === today
    ).length
    
    // Calcola ore sole medio (placeholder - dovrebbe venire da garden data)
    const avgSunHours = activeGarden.dailySunHours ?? 0
    
    return {
      activePlants,
      todayTasks,
      avgSunHours: avgSunHours > 0 ? avgSunHours.toFixed(1) : null
    }
  }, [tasks, activeGarden])
  
  return (
    <div className="relative">
      {/* Main Card */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-xl border-2 border-gray-200 p-4 cursor-pointer hover:border-green-300 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Garden Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Sprout className="text-green-600" size={24} />
            </div>
            
            {/* Garden Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {activeGarden.name}
              </h2>
              
              {/* Stats Row */}
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Sprout size={14} />
                  <span>{stats.activePlants} piante</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Calendar size={14} />
                  <span>{stats.todayTasks} task oggi</span>
                </div>
                {stats.avgSunHours && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Sun size={14} />
                    <span>{stats.avgSunHours}h sole</span>
                  </div>
                )}
              </div>
              
              {/* Location */}
              {activeGarden.coordinates && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin size={12} />
                  <span>Localizzato</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Dropdown Arrow */}
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-96 overflow-y-auto">
          {gardens.map(garden => {
            const gardenTasks = tasks.filter(t => t.gardenId === garden.id)
            const gardenActivePlants = gardenTasks.filter(
              t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
            ).length
            
            return (
              <button
                key={garden.id}
                onClick={() => {
                  onGardenChange(garden)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                  garden.id === activeGarden.id ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sprout className="text-green-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{garden.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-600">
                        {garden.sizeSqMeters} m²
                      </p>
                      {gardenActivePlants > 0 && (
                        <p className="text-xs text-gray-600">
                          {gardenActivePlants} piante attive
                        </p>
                      )}
                    </div>
                  </div>
                  {garden.id === activeGarden.id && (
                    <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </button>
            )
          })}
          
          {/* Add Garden Button */}
          {onAddGarden && (
            <div className="border-t border-gray-200">
              <button
                onClick={() => {
                  onAddGarden()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-3 hover:bg-green-50 text-green-600 font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Aggiungi Nuovo Orto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}






