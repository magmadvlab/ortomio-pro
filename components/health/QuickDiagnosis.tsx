'use client'

import React, { useState } from 'react'
import { Garden, GardenTask } from '@/types'
import { Camera, Sparkles } from 'lucide-react'
import DiseaseDiagnosis from '@/components/DiseaseDiagnosis'

interface QuickDiagnosisProps {
  garden: Garden
  tasks: GardenTask[]
}

export function QuickDiagnosis({ garden, tasks }: QuickDiagnosisProps) {
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [selectedTask, setSelectedTask] = useState<GardenTask | null>(null)
  
  // Trova piante attive per la diagnosi
  const activePlants = tasks.filter(
    t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
  )
  
  if (activePlants.length === 0) {
    return null
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-purple-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">Diagnosi Rapida</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Hai un dubbio sulla salute di una pianta? Scatta una foto per una diagnosi AI immediata.
      </p>
      
      {!showDiagnosis ? (
        <div className="space-y-3">
          {/* Seleziona pianta */}
          {activePlants.length > 1 && (
            <select
              onChange={(e) => {
                const task = activePlants.find(t => t.id === e.target.value)
                setSelectedTask(task || null)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Seleziona una pianta...</option>
              {activePlants.map(task => (
                <option key={task.id} value={task.id}>
                  {task.plantName}{task.variety ? ` (${task.variety})` : ''}
                </option>
              ))}
            </select>
          )}
          
          <button
            onClick={() => {
              if (activePlants.length === 1) {
                setSelectedTask(activePlants[0])
              }
              setShowDiagnosis(true)
            }}
            disabled={activePlants.length > 1 && !selectedTask}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera size={20} />
            <span>Scatta Foto per Diagnosi</span>
          </button>
        </div>
      ) : selectedTask ? (
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowDiagnosis(false)
              setSelectedTask(null)
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Torna indietro
          </button>
          <DiseaseDiagnosis
            plant={{
              commonName: selectedTask.plantName,
              variety: selectedTask.variety
            } as any}
            garden={garden}
          />
        </div>
      ) : null}
    </div>
  )
}



