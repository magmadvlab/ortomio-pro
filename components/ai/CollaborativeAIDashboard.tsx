/**
 * Collaborative AI Dashboard
 * Sistema "4 mani" - Dashboard principale per interazione AI-Utente
 */

import React, { useState, useEffect } from 'react'
import {
  Brain,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Filter
} from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import AISuggestionCard from './AISuggestionCard'
import AITransparencyPanel from './AITransparencyPanel'
import { collaborativeAIService } from '@/services/collaborativeAIService'
import type {
  AISuggestion,
  AITransparencyLog,
  AIPerformanceScore,
  SuggestionFilter
} from '@/types/aiFeedback'

export default function CollaborativeAIDashboard() {
  const { activeGarden } = useGarden()
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [performanceScore, setPerformanceScore] = useState<AIPerformanceScore | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null)
  const [transparencyLog, setTransparencyLog] = useState<AITransparencyLog | null>(null)
  const [showTransparency, setShowTransparency] = useState(false)
  const [filter, setFilter] = useState<SuggestionFilter>({
    statuses: ['PENDING']
  })
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'performance'>('active')

  useEffect(() => {
    if (activeGarden) {
      loadData()
    }
  }, [activeGarden, filter])

  const loadData = async () => {
    if (!activeGarden) return
    
    try {
      setLoading(true)
      
      // Carica suggerimenti
      const userId = "mock-user-id"
      const suggs = await collaborativeAIService.getSuggestions(userId, {
        ...filter,
        gardenId: activeGarden.id
      })
      setSuggestions(suggs)
      
      // Carica performance score
      const score = await collaborativeAIService.getAIPerformanceScore(userId)
      setPerformanceScore(score)
      
    } catch (error) {
      console.error('Error loading collaborative AI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (suggestionId: string) => {
    if (!activeGarden) return
    
    const decision = await collaborativeAIService.acceptSuggestion(
      "mock-user-id",
      suggestionId,
      'Accettato dall\'utente'
    )
    
    if (decision) {
      // Ricarica suggerimenti
      loadData()
      
      // Mostra feedback positivo
      alert('✅ Suggerimento accettato! L\'AI imparerà dalle tue preferenze.')
    }
  }

  const handleReject = async (suggestionId: string, reason?: string) => {
    if (!activeGarden) return
    
    const decision = await collaborativeAIService.rejectSuggestion(
      "mock-user-id",
      suggestionId,
      reason || 'Rifiutato dall\'utente'
    )
    
    if (decision) {
      // Ricarica suggerimenti
      loadData()
      
      // Mostra feedback
      alert('❌ Suggerimento rifiutato. L\'AI adatterà i futuri suggerimenti.')
    }
  }

  const handleModify = async (suggestionId: string, modifications: Record<string, any>) => {
    if (!activeGarden) return
    
    const suggestion = suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return
    
    const decision = await collaborativeAIService.modifySuggestion(
      "mock-user-id",
      suggestionId,
      suggestion.suggested_parameters,
      modifications,
      'Modificato dall\'utente'
    )
    
    if (decision) {
      // Ricarica suggerimenti
      loadData()
      
      // Mostra feedback
      alert('✏️ Suggerimento modificato! L\'AI imparerà dalle tue preferenze.')
    }
  }

  const handleViewTransparency = async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return
    
    setSelectedSuggestion(suggestion)
    
    // Carica transparency log
    const log = await collaborativeAIService.getTransparencyLog(suggestionId)
    if (log) {
      setTransparencyLog(log)
      setShowTransparency(true)
    } else {
      alert('Log di trasparenza non disponibile per questo suggerimento')
    }
  }

  if (!activeGarden) {
    return (
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Brain className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seleziona un Orto
          </h2>
          <p className="text-gray-600">
            Seleziona un orto per accedere al sistema collaborativo AI
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento sistema collaborativo AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Sistema Collaborativo AI
                </h1>
                <p className="text-gray-600">
                  Lavoriamo insieme "a 4 mani" per ottimizzare {activeGarden.name}
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw size={16} />
              Aggiorna
            </button>
          </div>

          {/* AI Performance Banner */}
          {performanceScore && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-1">
                    🤝 Performance Collaborazione AI-Utente
                  </h3>
                  <p className="text-sm text-purple-800">
                    Come stiamo lavorando insieme
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-purple-600">
                    {performanceScore.performance_score.toFixed(0)}
                  </div>
                  <div className="text-sm text-purple-700">Score Globale</div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceScore.acceptance_rate.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">Tasso Accettazione</div>
                </div>
                
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {performanceScore.average_accuracy.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">Accuratezza Media</div>
                </div>
                
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {performanceScore.average_satisfaction.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">Soddisfazione</div>
                </div>
                
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-600">
                    {performanceScore.total_suggestions}
                  </div>
                  <div className="text-xs text-gray-600">Suggerimenti Totali</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
            {[
              { id: 'active', label: 'Suggerimenti Attivi', icon: Lightbulb },
              { id: 'history', label: 'Storico', icon: BarChart3 },
              { id: 'performance', label: 'Performance', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Suggestions Tab */}
        {activeTab === 'active' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center gap-4">
                <Filter size={20} className="text-gray-600" />
                <div className="flex gap-2">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setFilter({
                        ...filter,
                        priorities: filter.priorities?.includes(priority as any)
                          ? filter.priorities.filter(p => p !== priority)
                          : [...(filter.priorities || []), priority as any]
                      })}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filter.priorities?.includes(priority as any)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions List */}
            {suggestions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Nessun Suggerimento Attivo
                </h3>
                <p className="text-gray-600">
                  L'AI sta analizzando i dati. Torna più tardi per nuovi suggerimenti!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {suggestions.map((suggestion) => (
                  <AISuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onModify={handleModify}
                    onViewTransparency={handleViewTransparency}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Storico Suggerimenti
            </h3>
            <p className="text-gray-600">
              Visualizza tutti i suggerimenti passati e le tue decisioni
            </p>
            <button
              onClick={() => setFilter({ statuses: ['ACCEPTED', 'REJECTED', 'MODIFIED', 'COMPLETED'] })}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Carica Storico
            </button>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && performanceScore && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Accettati</h3>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {performanceScore.accepted_suggestions}
                </div>
                <div className="text-sm text-gray-600">
                  {performanceScore.acceptance_rate.toFixed(1)}% del totale
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Edit3 className="h-8 w-8 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Modificati</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {performanceScore.modified_suggestions}
                </div>
                <div className="text-sm text-gray-600">
                  Personalizzati da te
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <h3 className="font-semibold text-gray-900">Rifiutati</h3>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {performanceScore.rejected_suggestions}
                </div>
                <div className="text-sm text-gray-600">
                  L'AI sta imparando
                </div>
              </div>
            </div>

            {/* Learning Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">
                🧠 Cosa sta Imparando l'AI
              </h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Pattern identificato:</strong> Preferisci soluzioni biologiche rispetto a quelle chimiche
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    Confidenza: 85% • Basato su 12 decisioni
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Pattern identificato:</strong> Tendi a modificare le quantità suggerite del 20-30%
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    Confidenza: 72% • Basato su 8 modifiche
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Adattamento:</strong> I futuri suggerimenti terranno conto delle tue preferenze
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    Sistema in continuo apprendimento
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  )
}
