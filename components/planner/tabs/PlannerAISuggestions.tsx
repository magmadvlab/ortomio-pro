/**
 * Planner AI Suggestions Tab
 * Suggerimenti AI filtrati per pianificazione
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Lightbulb, Filter, Calendar, CheckCircle, XCircle, Eye, AlertTriangle, TrendingUp } from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { collaborativeAIService } from '@/services/collaborativeAIService'
import AITransparencyPanel from '@/components/ai/AITransparencyPanel'
import type { AISuggestion, AITransparencyLog } from '@/types/aiFeedback'

interface PlannerAISuggestionsProps {
  garden: any
  tasks: any[]
  onCreateTasks?: (tasks: any[]) => Promise<void>
}

export default function PlannerAISuggestions({ garden, tasks, onCreateTasks }: PlannerAISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null)
  const [transparencyLog, setTransparencyLog] = useState<AITransparencyLog | null>(null)
  const [showTransparency, setShowTransparency] = useState(false)
  
  // Filtri
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Tipi di suggerimenti rilevanti per il planner
  const planningTypes: Array<'PLANTING_PLAN' | 'HARVEST_TIMING' | 'ROTATION_PLAN'> = [
    'PLANTING_PLAN',
    'HARVEST_TIMING',
    'ROTATION_PLAN'
  ]

  useEffect(() => {
    if (garden) {
      loadSuggestions()
    }
  }, [garden])

  const loadSuggestions = async () => {
    if (!garden) return
    
    try {
      setLoading(true)
      const suggs = await collaborativeAIService.getSuggestions(garden.user_id, {
        statuses: ['PENDING'],
        types: planningTypes,
        gardenId: garden.id
      })
      
      setSuggestions(suggs)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (suggestionId: string) => {
    if (!garden) return
    
    await collaborativeAIService.acceptSuggestion(
      garden.user_id,
      suggestionId,
      'Accettato dal Planner'
    )
    
    loadSuggestions()
  }

  const handleReject = async (suggestionId: string) => {
    if (!garden) return
    
    const reason = prompt('Perché rifiuti questo suggerimento?')
    if (!reason) return
    
    await collaborativeAIService.rejectSuggestion(
      garden.user_id,
      suggestionId,
      reason
    )
    
    loadSuggestions()
  }

  const handleViewTransparency = async (suggestion: AISuggestion) => {
    setSelectedSuggestion(suggestion)
    const log = await collaborativeAIService.getTransparencyLog(suggestion.id)
    if (log) {
      setTransparencyLog(log)
      setShowTransparency(true)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-red-200 bg-red-50'
      case 'HIGH': return 'border-orange-200 bg-orange-50'
      case 'MEDIUM': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700'
      case 'HIGH': return 'bg-orange-100 text-orange-700'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PLANTING_PLAN': 'Pianificazione Semina',
      'HARVEST_TIMING': 'Tempistica Raccolta',
      'ROTATION_PLAN': 'Piano Rotazione',
      'DISEASE_PREVENTION': 'Prevenzione Malattie',
      'YIELD_OPTIMIZATION': 'Ottimizzazione Resa',
      'RESOURCE_SAVING': 'Risparmio Risorse',
      'TREATMENT': 'Trattamenti',
      'IRRIGATION': 'Irrigazione',
      'FERTILIZATION': 'Fertilizzazione'
    }
    return labels[type] || type
  }

  // Filtra suggerimenti
  const filteredSuggestions = suggestions.filter(s => {
    if (typeFilter !== 'ALL' && s.suggestion_type !== typeFilter) return false
    if (priorityFilter !== 'ALL' && s.action_priority !== priorityFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return s.title.toLowerCase().includes(query) || 
             s.description.toLowerCase().includes(query)
    }
    return true
  })

  // Raggruppa per tipo
  const groupedSuggestions = filteredSuggestions.reduce((acc, s) => {
    const type = s.suggestion_type
    if (!acc[type]) acc[type] = []
    acc[type].push(s)
    return acc
  }, {} as Record<string, AISuggestion[]>)

  if (!garden) return null

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-100 rounded"></div>
          <div className="h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header e Filtri */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Lightbulb className="text-purple-600" size={28} />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Suggerimenti AI per Pianificazione</h2>
                <p className="text-sm text-gray-600">Ottimizza la tua pianificazione con l'intelligenza artificiale</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{filteredSuggestions.length} suggerimenti</span>
          </div>

          {/* Filtri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Cerca
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca suggerimenti..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">Tutti i tipi</option>
                <option value="PLANTING_PLAN">Pianificazione Semina</option>
                <option value="HARVEST_TIMING">Tempistica Raccolta</option>
                <option value="ROTATION_PLAN">Piano Rotazione</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorità</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">Tutte le priorità</option>
                <option value="CRITICAL">Critica</option>
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Media</option>
                <option value="LOW">Bassa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Suggerimenti Raggruppati */}
        {filteredSuggestions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun suggerimento al momento</h3>
            <p className="text-gray-600">L'AI sta analizzando i tuoi dati per generare nuovi suggerimenti di pianificazione</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSuggestions).map(([type, typeSuggestions]) => (
              <div key={type} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-purple-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">{getTypeLabel(type)}</h3>
                  <span className="text-sm text-gray-500">({typeSuggestions.length})</span>
                </div>

                <div className="space-y-4">
                  {typeSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`border-2 rounded-lg p-5 transition-all ${getPriorityColor(suggestion.action_priority)}`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(suggestion.action_priority)}`}>
                              {suggestion.action_priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{suggestion.description}</p>
                        </div>
                        
                        {suggestion.action_deadline && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                            <Calendar size={14} />
                            Entro: {new Date(suggestion.action_deadline).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </div>

                      {/* Azione Suggerita */}
                      <div className="bg-white/50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Azione Suggerita:</p>
                        <p className="text-sm text-gray-700">{suggestion.suggested_action}</p>
                      </div>

                      {/* Metriche */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={14} />
                          Confidenza: {(suggestion.confidence_score * 100).toFixed(0)}%
                        </div>
                        {suggestion.expected_outcomes && (
                          <div>
                            Risultati attesi: {JSON.parse(suggestion.expected_outcomes as any).length} metriche
                          </div>
                        )}
                      </div>

                      {/* Azioni */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(suggestion.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={16} />
                          Accetta
                        </button>
                        
                        <button
                          onClick={() => handleReject(suggestion.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <XCircle size={16} />
                          Rifiuta
                        </button>
                        
                        <button
                          onClick={() => handleViewTransparency(suggestion)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Eye size={16} />
                          Dettagli
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Come funziona?</p>
              <p>L'AI analizza i tuoi dati (meteo, suolo, storico) e genera suggerimenti personalizzati per ottimizzare la pianificazione. 
              Puoi accettare, rifiutare o modificare ogni suggerimento. Il sistema impara dalle tue decisioni per migliorare nel tempo.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Panel */}
      {showTransparency && selectedSuggestion && transparencyLog && (
        <AITransparencyPanel
          suggestion={selectedSuggestion}
          transparencyLog={transparencyLog}
          onClose={() => {
            setShowTransparency(false)
            setSelectedSuggestion(null)
            setTransparencyLog(null)
          }}
        />
      )}
    </>
  )
}
