/**
 * AI Suggestion Card
 * Card interattiva per suggerimenti AI con azioni utente
 */

import React, { useState } from 'react'
import {
  Brain,
  CheckCircle,
  XCircle,
  Edit3,
  Clock,
  AlertTriangle,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Calendar
} from 'lucide-react'
import type { AISuggestion } from '@/types/aiFeedback'

interface AISuggestionCardProps {
  suggestion: AISuggestion
  onAccept: (suggestionId: string) => void
  onReject: (suggestionId: string, reason?: string) => void
  onModify: (suggestionId: string, modifications: Record<string, any>) => void
  onViewTransparency: (suggestionId: string) => void
}

export default function AISuggestionCard({
  suggestion,
  onAccept,
  onReject,
  onModify,
  onViewTransparency
}: AISuggestionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [modifiedParams, setModifiedParams] = useState(suggestion.suggested_parameters)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <AlertTriangle size={16} />
      case 'HIGH': return <TrendingUp size={16} />
      case 'MEDIUM': return <Target size={16} />
      case 'LOW': return <Clock size={16} />
      default: return <Clock size={16} />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'DISEASE_PREVENTION': 'Prevenzione Malattie',
      'YIELD_OPTIMIZATION': 'Ottimizzazione Resa',
      'RESOURCE_SAVING': 'Risparmio Risorse',
      'PLANTING_PLAN': 'Piano di Semina',
      'TREATMENT': 'Trattamento',
      'IRRIGATION': 'Irrigazione',
      'FERTILIZATION': 'Fertilizzazione',
      'HARVEST_TIMING': 'Timing Raccolta',
      'ROTATION_PLAN': 'Piano Rotazione'
    }
    return labels[type] || type
  }

  const handleAccept = () => {
    onAccept(suggestion.id)
  }

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(suggestion.id, rejectReason)
      setShowRejectDialog(false)
      setRejectReason('')
    }
  }

  const handleModify = () => {
    onModify(suggestion.id, modifiedParams)
    setShowModifyDialog(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-purple-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                  AI
                </span>
              </div>
              <p className="text-sm text-gray-600">{getTypeLabel(suggestion.suggestion_type)}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.action_priority)}`}>
            {getPriorityIcon(suggestion.action_priority)}
            {suggestion.action_priority}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        <p className="text-gray-700 mb-4">{suggestion.description}</p>

        {/* Confidence & Prediction */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Confidenza AI</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(suggestion.confidence_score * 100)}%
            </div>
          </div>
          
          {suggestion.prediction_data.probability !== undefined && (
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target size={16} className="text-orange-600" />
                <span className="text-xs font-medium text-orange-900">Probabilità</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(suggestion.prediction_data.probability * 100)}%
              </div>
            </div>
          )}
          
          {suggestion.prediction_data.expectedSavings !== undefined && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-xs font-medium text-green-900">Risparmio Previsto</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                €{suggestion.prediction_data.expectedSavings.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4">
          <h4 className="font-medium text-purple-900 mb-2">🎯 Azione Suggerita</h4>
          <p className="text-sm text-purple-800">{suggestion.suggested_action}</p>
          
          {suggestion.action_deadline && (
            <div className="flex items-center gap-2 mt-2 text-xs text-purple-700">
              <Calendar size={14} />
              <span>Entro: {new Date(suggestion.action_deadline).toLocaleDateString('it-IT')}</span>
            </div>
          )}
        </div>

        {/* Expandable Details */}
        {expanded && (
          <div className="space-y-4 mb-4">
            {/* Reasoning */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">🧠 Ragionamento AI</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestion.reasoning}</p>
            </div>

            {/* Data Sources */}
            {suggestion.data_sources && suggestion.data_sources.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">📊 Fonti Dati</h4>
                <div className="space-y-2">
                  {suggestion.data_sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{source.type}</span>
                      <span className="text-gray-500">
                        Affidabilità: {Math.round(source.reliability * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Outcomes */}
            {suggestion.expected_outcomes && suggestion.expected_outcomes.length > 0 && (
              <div className="bg-green-50 rounded-lg p-3">
                <h4 className="font-medium text-green-900 mb-2">✅ Risultati Attesi</h4>
                <div className="space-y-2">
                  {suggestion.expected_outcomes.map((outcome, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 font-medium">{outcome.metric}</span>
                        <span className="text-green-600">
                          {outcome.expectedValue} {outcome.unit}
                        </span>
                      </div>
                      <div className="text-xs text-green-700">
                        Timeframe: {outcome.timeframe} • Confidenza: {Math.round(outcome.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {suggestion.alternatives && suggestion.alternatives.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">🔄 Alternative Considerate</h4>
                <div className="space-y-3">
                  {suggestion.alternatives.map((alt, index) => (
                    <div key={index} className="border-l-2 border-blue-300 pl-3">
                      <h5 className="font-medium text-blue-800 text-sm">{alt.title}</h5>
                      <p className="text-xs text-blue-700 mb-2">{alt.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-green-700 font-medium">Pro:</span>
                          <ul className="list-disc list-inside text-green-600">
                            {alt.pros.map((pro, i) => (
                              <li key={i}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-red-700 font-medium">Contro:</span>
                          <ul className="list-disc list-inside text-red-600">
                            {alt.cons.map((con, i) => (
                              <li key={i}>{con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} />
              Mostra meno
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Mostra dettagli completi
            </>
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <CheckCircle size={16} />
            Accetta
          </button>
          
          <button
            onClick={() => setShowModifyDialog(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Edit3 size={16} />
            Modifica
          </button>
          
          <button
            onClick={() => setShowRejectDialog(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <XCircle size={16} />
            Rifiuta
          </button>
        </div>
        
        <button
          onClick={() => onViewTransparency(suggestion.id)}
          className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 py-2"
        >
          <Eye size={14} />
          Vedi come l'AI è arrivata a questa conclusione
        </button>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Perché rifiuti questo suggerimento?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Il tuo feedback aiuta l'AI a migliorare i suggerimenti futuri
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Es: Non applicabile alla mia situazione, troppo costoso, già implementato..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4 min-h-[100px]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Conferma Rifiuto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Dialog */}
      {showModifyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Modifica Parametri</h3>
            <p className="text-sm text-gray-600 mb-4">
              Adatta il suggerimento alle tue esigenze
            </p>
            
            <div className="space-y-3 mb-4">
              {Object.entries(suggestion.suggested_parameters).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={modifiedParams[key]}
                    onChange={(e) => setModifiedParams({
                      ...modifiedParams,
                      [key]: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowModifyDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={handleModify}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Applica Modifiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
