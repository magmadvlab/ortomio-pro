/**
 * AI Suggestions Widget - Dashboard
 * Widget compatto per suggerimenti AI urgenti
 */

'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Lightbulb, CheckCircle, XCircle, Edit3, Eye, ArrowRight } from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { collaborativeAIService } from '@/services/collaborativeAIService'
import AITransparencyPanel from './AITransparencyPanel'
import type { AISuggestion, AITransparencyLog } from '@/types/aiFeedback'

interface AISuggestionsWidgetProps {
  maxItems?: number
  priorities?: Array<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>
  types?: string[]
  compact?: boolean
}

export default function AISuggestionsWidget({
  maxItems = 3,
  priorities = ['CRITICAL', 'HIGH'],
  types,
  compact = true
}: AISuggestionsWidgetProps) {
  const { activeGarden } = useGarden()
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null)
  const [transparencyLog, setTransparencyLog] = useState<AITransparencyLog | null>(null)
  const [showTransparency, setShowTransparency] = useState(false)

  useEffect(() => {
    if (activeGarden && user) {
      loadSuggestions()
    }
  }, [activeGarden, user])

  const loadSuggestions = async () => {
    if (!activeGarden || !user) return
    
    try {
      setLoading(true)
      const suggs = await collaborativeAIService.getSuggestions(user.id, {
        statuses: ['PENDING'],
        priorities,
        types: types as any,
        gardenId: activeGarden.id
      })
      
      setSuggestions(suggs.slice(0, maxItems))
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (suggestionId: string) => {
    if (!activeGarden || !user) return
    
    await collaborativeAIService.acceptSuggestion(
      user.id,
      suggestionId,
      'Accettato dalla dashboard'
    )
    
    loadSuggestions()
  }

  const handleReject = async (suggestionId: string) => {
    if (!activeGarden || !user) return
    
    const reason = prompt('Perché rifiuti questo suggerimento?')
    if (!reason) return
    
    await collaborativeAIService.rejectSuggestion(
      user.id,
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
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200'
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle size={20} />
      default:
        return <Lightbulb size={20} />
    }
  }

  if (!activeGarden || !user) return null
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Suggerimenti AI</h3>
        </div>
        <div className="text-center py-4">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-2" />
          <p className="text-gray-600 text-sm">Nessun suggerimento urgente al momento</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Suggerimenti AI</h3>
          </div>
          <span className="text-sm text-gray-500">{suggestions.length} urgenti</span>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
              className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                expandedId === suggestion.id ? 'ring-2 ring-purple-200' : ''
              } ${getPriorityColor(suggestion.action_priority)}`}
            >
              {/* Header compatto */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(suggestion.action_priority)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {suggestion.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        suggestion.action_priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        suggestion.action_priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {suggestion.action_priority}
                      </span>
                      <ArrowRight size={20} className="text-gray-400" />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                    {suggestion.description}
                  </p>

                  {/* Espandi/Comprimi */}
                  {expandedId === suggestion.id && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAccept(suggestion.id)
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={14} />
                      Accetta
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReject(suggestion.id)
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                    >
                      <XCircle size={14} />
                      Rifiuta
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewTransparency(suggestion)
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                    >
                      <Eye size={14} />
                      Dettagli
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
