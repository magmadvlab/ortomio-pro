'use client'

import { useState } from 'react'
import { X, Calendar, Clock, MapPin, Camera, FileText, AlertTriangle, CheckCircle, Leaf, Bug, Droplets, Zap } from 'lucide-react'

interface QuickEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: QuickEvent) => void
  gardenId: string
}

export interface QuickEvent {
  type: 'observation' | 'issue' | 'action' | 'milestone' | 'weather_event'
  title: string
  description: string
  date: string
  time: string
  location?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  photos?: File[]
  tags?: string[]
}

export default function QuickEventModal({ isOpen, onClose, onSave, gardenId }: QuickEventModalProps) {
  const [event, setEvent] = useState<QuickEvent>({
    type: 'observation',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    tags: []
  })

  if (!isOpen) return null

  const eventTypes = [
    { value: 'observation', label: 'Osservazione', icon: CheckCircle, color: 'blue' },
    { value: 'issue', label: 'Problema', icon: AlertTriangle, color: 'red' },
    { value: 'action', label: 'Azione', icon: Zap, color: 'green' },
    { value: 'milestone', label: 'Traguardo', icon: CheckCircle, color: 'purple' },
    { value: 'weather_event', label: 'Evento Meteo', icon: Droplets, color: 'cyan' },
  ]

  const quickTags = [
    'Malattia', 'Parassiti', 'Crescita', 'Fioritura', 'Fruttificazione',
    'Irrigazione', 'Concimazione', 'Potatura', 'Raccolta', 'Emergenza'
  ]

  const handleSave = () => {
    if (!event.title || !event.description) {
      alert('Compila almeno titolo e descrizione')
      return
    }
    onSave(event)
    onClose()
    // Reset form
    setEvent({
      type: 'observation',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      tags: []
    })
  }

  const toggleTag = (tag: string) => {
    setEvent(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Aggiungi Evento Rapido</h2>
            <p className="text-sm text-gray-600">Registra osservazioni, problemi o azioni improvvise</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tipo Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo Evento
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {eventTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => setEvent({ ...event, type: type.value as any })}
                    className={`
                      p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                      ${event.type === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${event.type === type.value ? `text-${type.color}-600` : 'text-gray-600'}`} />
                    <span className={`text-xs font-medium ${event.type === type.value ? `text-${type.color}-900` : 'text-gray-700'}`}>
                      {type.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Titolo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titolo *
            </label>
            <input
              type="text"
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              placeholder="Es: Foglie gialle su pomodori, Grandinata improvvisa..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione *
            </label>
            <textarea
              value={event.description}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              placeholder="Descrivi cosa hai osservato, il problema riscontrato o l'azione intrapresa..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Data e Ora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data
              </label>
              <input
                type="date"
                value={event.date}
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Ora
              </label>
              <input
                type="time"
                value={event.time}
                onChange={(e) => setEvent({ ...event, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Posizione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Posizione (opzionale)
            </label>
            <input
              type="text"
              value={event.location || ''}
              onChange={(e) => setEvent({ ...event, location: e.target.value })}
              placeholder="Es: Aiuola A, Filare 3, Serra..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Severità (solo per problemi) */}
          {event.type === 'issue' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gravità
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'low', label: 'Bassa', color: 'green' },
                  { value: 'medium', label: 'Media', color: 'yellow' },
                  { value: 'high', label: 'Alta', color: 'orange' },
                  { value: 'critical', label: 'Critica', color: 'red' },
                ].map((severity) => (
                  <button
                    key={severity.value}
                    onClick={() => setEvent({ ...event, severity: severity.value as any })}
                    className={`
                      px-4 py-2 rounded-lg border-2 transition-all
                      ${event.severity === severity.value
                        ? `border-${severity.color}-500 bg-${severity.color}-50 text-${severity.color}-900`
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    {severity.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag (opzionali)
            </label>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    px-3 py-1 rounded-full text-sm transition-all
                    ${event.tags?.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Salva Evento
          </button>
        </div>
      </div>
    </div>
  )
}
