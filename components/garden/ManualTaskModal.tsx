'use client'

import React, { useState } from 'react'
import { GardenTask } from '@/types'
import { X } from 'lucide-react'

interface ManualTaskModalProps {
  gardenId: string
  isOpen: boolean
  onClose: () => void
  onAddTask: (task: Omit<GardenTask, 'id' | 'completed' | 'gardenId'>) => void
}

type TaskType = 'Fertilize' | 'Treatment' | 'Prune' | 'Harvest'

const taskTypeLabels: Record<TaskType, string> = {
  'Fertilize': 'Concimazione',
  'Treatment': 'Trattamento',
  'Prune': 'Potatura',
  'Harvest': 'Raccolta'
}

const taskTypeIcons: Record<TaskType, string> = {
  'Fertilize': '🌱',
  'Treatment': '🛡️',
  'Prune': '✂️',
  'Harvest': '🛒'
}

export function ManualTaskModal({ gardenId, isOpen, onClose, onAddTask }: ManualTaskModalProps) {
  const [formData, setFormData] = useState({
    taskType: 'Fertilize' as TaskType,
    plantName: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.plantName.trim()) {
      alert('Inserisci il nome della pianta')
      return
    }

    onAddTask({
      plantName: formData.plantName,
      taskType: formData.taskType,
      date: formData.date,
      notes: formData.notes || undefined,
      isSuggested: false
    })

    // Reset form
    setFormData({
      taskType: 'Fertilize',
      plantName: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nuovo Task Manuale</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di Task
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(taskTypeLabels) as TaskType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, taskType: type })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.taskType === type
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{taskTypeIcons[type]}</div>
                    <div className="text-sm font-medium">{taskTypeLabels[type]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Plant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Pianta
              </label>
              <input
                type="text"
                value={formData.plantName}
                onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
                placeholder="es. Pomodoro San Marzano"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (opzionali)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Aggiungi dettagli sul task..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Crea Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
