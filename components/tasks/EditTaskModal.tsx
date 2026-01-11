'use client'

import React, { useState, useEffect } from 'react'
import { GardenTask, GrowingLocation } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { X, Edit3, Calendar, MapPin, FileText } from 'lucide-react'

interface EditTaskModalProps {
  task: GardenTask | null
  isOpen: boolean
  onClose: () => void
  onTaskUpdated: (updatedTask: GardenTask) => void
}

export function EditTaskModal({ task, isOpen, onClose, onTaskUpdated }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    notes: '',
    quantity: 1,
    plantName: '',
    variety: '',
    locationType: '',
    bedName: '',
    rowName: ''
  })
  const [loading, setSaving] = useState(false)
  const { storageProvider } = useStorage()

  // Popola il form quando il task cambia
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.plantName || '', // Usa plantName come title
        description: task.notes || '', // Usa notes come description
        scheduledDate: task.nextDueDate ? task.nextDueDate.split('T')[0] : task.date,
        priority: 'Medium', // Default priority
        notes: task.notes || '',
        quantity: task.quantity || 1,
        plantName: task.plantName || '',
        variety: task.variety || '',
        locationType: task.locationType || '',
        bedName: '', // Non disponibile in GardenTask
        rowName: '' // Non disponibile in GardenTask
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    setSaving(true)
    try {
      const updatedTask: GardenTask = {
        ...task,
        notes: formData.notes,
        quantity: formData.quantity,
        plantName: formData.plantName,
        variety: formData.variety || undefined,
        locationType: (formData.locationType as GrowingLocation) || undefined,
        nextDueDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().split('T')[0] : task.nextDueDate
      }

      await storageProvider.updateTask(task.id, updatedTask)
      onTaskUpdated(updatedTask)
      onClose()
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Errore durante l\'aggiornamento del task')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setFormData({
      title: '',
      description: '',
      scheduledDate: '',
      priority: 'Medium',
      notes: '',
      quantity: 1,
      plantName: '',
      variety: '',
      locationType: '',
      bedName: '',
      rowName: ''
    })
  }

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Edit3 className="text-blue-600" size={24} />
              Modifica Task
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informazioni Base */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-3">
                <FileText size={16} />
                Informazioni Base
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data programmata
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorità
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Bassa</option>
                      <option value="Medium">Media</option>
                      <option value="High">Alta</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Informazioni Pianta (se applicabile) */}
            {(task.taskType === 'Sowing' || task.taskType === 'Transplant' || task.plantName) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-4">Informazioni Pianta</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome pianta
                      </label>
                      <input
                        type="text"
                        value={formData.plantName}
                        onChange={(e) => setFormData(prev => ({ ...prev, plantName: e.target.value }))}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="es. Pomodoro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Varietà
                      </label>
                      <input
                        type="text"
                        value={formData.variety}
                        onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="es. San Marzano"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantità
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Posizione */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <MapPin size={16} />
                Posizione
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo posizione
                  </label>
                  <input
                    type="text"
                    value={formData.locationType}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationType: e.target.value }))}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="es. Aiuola, Serra, Vaso"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome aiuola
                    </label>
                    <input
                      type="text"
                      value={formData.bedName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedName: e.target.value }))}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="es. Aiuola Nord"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome filare
                    </label>
                    <input
                      type="text"
                      value={formData.rowName}
                      onChange={(e) => setFormData(prev => ({ ...prev, rowName: e.target.value }))}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="es. Filare 1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note aggiuntive
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Note, osservazioni, promemoria..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salva Modifiche'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}