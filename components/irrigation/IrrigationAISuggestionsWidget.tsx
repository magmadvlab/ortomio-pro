/**
 * Irrigation AI Suggestions Widget
 * Widget per suggerimenti AI sul risparmio idrico
 */

'use client'

import { useState, useEffect } from 'react'
import { Droplets, TrendingDown, CheckCircle, XCircle, Eye, Lightbulb } from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { collaborativeAIService } from '@/services/collaborativeAIService'
import AITransparencyPanel from '@/components/ai/AITransparencyPanel'
import type { AISuggestion, AITransparencyLog } from '@/types/aiFeedback'

interface IrrigationAISuggestionsWidgetProps {
  garden?: any
  maxItems?: number
}

export default function IrrigationAISuggestionsWidget({ 
  garden: propGarden,
  maxItems = 2 
}: IrrigationAISuggestionsWidgetProps) {
  const { activeGarden } = useGarden()
  const { user } = useAuth()
  const garden = propGarden || activeGarden
  
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null)
  const [transparencyLog, setTransparencyLog] = useState<AITransparencyLog | null>(null)
  const [showTransparency, setShowTransparency] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (garden && user) {
      loadSuggestions()
    }
  }, [garden, user])

  const loadSuggestions = async () => {
    if (!garden || !user?.id) return
    
    try {
      setLoading(true)
      const suggs = await collaborativeAIService.getSuggestions(user.id, {
        statuses: ['PENDING'],
        types: ['RESOURCE_SAVING', 'IRRIGATION'],
        priorities: ['CRITICAL', 'HIGH', 'MEDIUM'],
        gardenId: garden.id
      })
      
      setSuggestions(suggs.slice(0, maxItems))
    } catch (error) {
      console.error('Error loading irrigation suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (suggestionId: string) => {
    if (!garden) return
    
    await collaborativeAIService.acceptSuggestion(
      garden.user_id,
      suggestionId,
      'Accettato da Irrigazione'
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

  const extractSavings = (suggestion: AISuggestion) => {
    try {
      const outcomes = JSON.parse(suggestion.expected_outcomes as any)
      const waterSaving = outcomes.find((o: any) => 
        o.metric.toLowerCase().includes('acqua') || 
        o.metric.toLowerCase().includes('risparmio')
      )
      if (waterSaving) {
        return {
          value: waterSaving.expectedValue,
          unit: waterSaving.unit,
          timeframe: waterSaving.timeframe
        }
      }
    } catch (e) {}
    return null
  }

  if (!garden) return null
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Droplets className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">💡 Suggerimenti AI Irrigazione</h3>
        </div>
        <div className="text-center py-4">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-2" />
          <p className="text-gray-600 text-sm">Irrigazione ottimizzata! Nessun suggerimento al momento</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">💡 Suggerimenti AI Irrigazione</h3>
              <p className="text-sm text-gray-600">Ottimizza il consumo d'acqua</p>
            </div>
          </div>
          <span className="text-sm text-blue-600 font-medium">{suggestions.length} suggerimenti</span>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion) => {
            const savings = extractSavings(suggestion)
            const isExpanded = expandedId === suggestion.id
            
            return (
              <div
                key={suggestion.id}
                className="bg-white rounded-lg p-4 border-2 border-blue-200 hover:border-blue-300 transition-all"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <TrendingDown className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{suggestion.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        suggestion.action_priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        suggestion.action_priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {suggestion.action_priority}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-700 mb-2">{suggestion.description}</p>

                    {/* Risparmio Evidenziato */}
                    {savings && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplets className="text-blue-600" size={16} />
                          <span className="text-xs font-medium text-gray-700">Risparmio Stimato:</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-blue-600">{savings.value}</span>
                          <span className="text-sm text-gray-600">{savings.unit}</span>
                          <span className="text-xs text-gray-500">in {savings.timeframe}</span>
                        </div>
                      </div>
                    )}

                    {/* Espandi Dettagli */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-blue-100">
                        <p className="text-xs text-gray-700 mb-2">
                          <strong>Azione:</strong> {suggestion.suggested_action}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>Confidenza: {(suggestion.confidence_score * 100).toFixed(0)}%</span>
                          {suggestion.action_deadline && (
                            <span>• Entro: {new Date(suggestion.action_deadline).toLocaleDateString('it-IT')}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Azioni */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(suggestion.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={14} />
                        Accetta
                      </button>
                      
                      <button
                        onClick={() => handleReject(suggestion.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
                      >
                        <XCircle size={14} />
                        Rifiuta
                      </button>
                      
                      <button
                        onClick={() => handleViewTransparency(suggestion)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        <Eye size={14} />
                        Dettagli
                      </button>
                      
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                        className="ml-auto text-xs text-blue-600 hover:text-blue-800"
                      >
                        {isExpanded ? 'Comprimi' : 'Espandi'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <Lightbulb size={14} className="text-blue-600" />
            L'AI analizza meteo, umidità suolo e consumi per ottimizzare l'irrigazione
          </p>
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
