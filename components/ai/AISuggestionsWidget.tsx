/**
 * AI Suggestions Widget - Dashboard
 * Widget compatto per suggerimenti AI urgenti
 */

'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Lightbulb, CheckCircle, XCircle, Edit3, Eye, ArrowRight } from 'lucide-react'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { collaborativeAIService } from '@/services/collaborativeAIService'
import AITransparencyPanel from './AITransparencyPanel'
import type { AISuggestion, AITransparencyLog } from '@/types/aiFeedback'
import type { Garden } from '@/types'

interface AISuggestionsWidgetProps {
  garden: Garden
  maxItems?: number
  priorities?: Array<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>
  types?: string[]
  compact?: boolean
}

export default function AISuggestionsWidget({
  garden,
  maxItems = 3,
  priorities = ['CRITICAL', 'HIGH'],
  types,
  compact = true
}: AISuggestionsWidgetProps) {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null)
  const [transparencyLog, setTransparencyLog] = useState<AITransparencyLog | null>(null)
  const [showTransparency, setShowTransparency] = useState(false)

  useEffect(() => {
    if (user) {
      loadSuggestions()
    }
  }, [garden.id, user?.id])

  const loadSuggestions = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setLoadError(false)
      const suggs = await collaborativeAIService.getSuggestions(user.id, {
        statuses: ['PENDING'],
        priorities,
        types: types as any,
        gardenId: garden.id
      })
      
      setSuggestions(suggs.slice(0, maxItems))
    } catch (error) {
      console.error('Error loading suggestions:', error)
      setSuggestions([])
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (suggestionId: string) => {
    if (!user) return
    
    await collaborativeAIService.acceptSuggestion(
      user.id,
      suggestionId,
      'Accettato dalla dashboard'
    )
    
    loadSuggestions()
  }

  const handleReject = async (suggestionId: string) => {
    if (!user) return
    
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

  if (!user) return null
  
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

  if (loadError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="text-amber-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Suggerimenti AI non disponibili</h3>
        </div>
        <p className="text-sm text-gray-600">
          Non e' stato possibile leggere i suggerimenti per {garden.name}. Riprova più tardi.
        </p>
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
          <p className="text-gray-600 text-sm">Nessun suggerimento urgente registrato per {garden.name}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Lightbulb className="text-purple-600" size={20} />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Suggerimenti AI</h3>
          </div>
          <span className="text-xs sm:text-sm text-gray-500 bg-purple-50 px-2 py-1 rounded-full">
            {suggestions.length} urgenti
          </span>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
              className={`border rounded-lg p-3 sm:p-4 transition-all cursor-pointer hover:shadow-md touch-manipulation ${
                expandedId === suggestion.id ? 'ring-2 ring-purple-200' : ''
              } ${getPriorityColor(suggestion.action_priority)}`}
            >
              {/* Header compatto */}
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getPriorityIcon(suggestion.action_priority)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base line-clamp-2 pr-2">
                        {suggestion.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${
                        suggestion.action_priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        suggestion.action_priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {suggestion.action_priority === 'CRITICAL' ? 'CRITICO' :
                         suggestion.action_priority === 'HIGH' ? 'ALTO' :
                         suggestion.action_priority === 'MEDIUM' ? 'MEDIO' : 'BASSO'}
                      </span>
                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-2">
                    {suggestion.description}
                  </p>

                  {/* Espandi/Comprimi */}
                  {expandedId === suggestion.id && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                      <p className="text-xs sm:text-sm text-gray-700 mb-2">
                        <strong>Azione:</strong> {suggestion.suggested_action}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Confidenza: {(suggestion.confidence_score * 100).toFixed(0)}%
                        </span>
                        {suggestion.action_deadline && (
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Entro: {new Date(suggestion.action_deadline).toLocaleDateString('it-IT')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Azioni - Mobile Optimized */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAccept(suggestion.id)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors touch-manipulation"
                    >
                      <CheckCircle size={12} />
                      <span className="hidden sm:inline">Accetta</span>
                      <span className="sm:hidden">✓</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReject(suggestion.id)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors touch-manipulation"
                    >
                      <XCircle size={12} />
                      <span className="hidden sm:inline">Rifiuta</span>
                      <span className="sm:hidden">✗</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewTransparency(suggestion)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors touch-manipulation"
                    >
                      <Eye size={12} />
                      <span className="hidden sm:inline">Dettagli</span>
                      <span className="sm:hidden">👁</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Show more button if there are more suggestions */}
        {suggestions.length >= maxItems && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                // Navigate to full suggestions page
                window.location.href = '/app/advice?tab=suggestions';
              }}
              className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
            >
              Vedi tutti i suggerimenti →
            </button>
          </div>
        )}
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
