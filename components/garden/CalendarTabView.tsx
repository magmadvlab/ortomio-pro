'use client'

import React, { useState } from 'react'
import { Garden, GardenTask } from '@/types'
import CalendarAlmanac from '@/components/CalendarAlmanac'
import { AddItemModal } from './AddItemModal'

interface CalendarTabViewProps {
  garden: Garden
  tasks: GardenTask[]
  onUpdateTask: (task: GardenTask) => void
  onDateClick?: (date: Date) => void
  onAddTask?: (task: Omit<GardenTask, 'id' | 'completed' | 'gardenId'>) => void
}

export function CalendarTabView({ 
  garden, 
  tasks, 
  onUpdateTask,
  onDateClick,
  onAddTask
}: CalendarTabViewProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowAddModal(true)
    if (onDateClick) {
      onDateClick(date)
    }
  }

  const handleAddTask = (taskData: Omit<GardenTask, 'id' | 'completed' | 'gardenId'>) => {
    if (onAddTask) {
      // Se abbiamo una data selezionata, la usiamo come data del task
      const taskWithDate = selectedDate ? {
        ...taskData,
        date: selectedDate.toISOString().split('T')[0]
      } : taskData
      
      onAddTask(taskWithDate)
    }
    setShowAddModal(false)
    setSelectedDate(null)
  }

  return (
    <div className="space-y-6">
      {/* Guida per l'utente */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Come usare il calendario</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Clicca su una data</strong> per vedere i dettagli del giorno</li>
              <li>• <strong>Usa il pulsante "Aggiungi Task"</strong> per creare nuove operazioni</li>
              <li>• <strong>Doppio click su una data</strong> per aggiungere rapidamente un task</li>
              <li>• I task suggeriti dall'AI appaiono in blu 💡</li>
              <li>• I task completati appaiono barrati ✅</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Calendario principale */}
      <CalendarAlmanac
        tasks={tasks}
        onDateClick={handleDateClick}
        onUpdateTask={onUpdateTask}
      />
      
      {/* Modal per aggiungere task */}
      <AddItemModal
        garden={garden}
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setSelectedDate(null)
        }}
        onAddTask={handleAddTask}
        selectedDate={selectedDate}
      />
      
      {/* Nota: Challenge integrate nella vista Operations per professionisti */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="font-semibold text-green-900 mb-1">Modalità Professionale Attiva</h3>
            <p className="text-sm text-green-800">
              Le challenge sono state spostate nella sezione <strong>Operations</strong> per un'esperienza più focalizzata sui task operativi. 
              Usa il <strong>Planner AI</strong> per pianificazioni avanzate con intelligenza artificiale.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}







