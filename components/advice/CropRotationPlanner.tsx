'use client'

import React, { useState, useEffect } from 'react'
import {
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Leaf,
  Target,
  Info,
  ThumbsUp,
  ThumbsDown,
  History,
  Sparkles
} from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { cropRotationService, isVirtualCropRotationPlanId } from '@/services/cropRotationService'
import { CropRotationHistory, CropRotationPlan, SuggestedCrop } from '@/types/activeAIAdvice'
import type { FieldRow } from '@/types/fieldRow'

export default function CropRotationPlanner() {
  const { activeGarden } = useGarden()
  const { storageProvider } = useStorage()
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<CropRotationHistory[]>([])
  const [plans, setPlans] = useState<CropRotationPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<CropRotationPlan | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [readOnlyFallback, setReadOnlyFallback] = useState(false)
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([])
  const [selectedFieldRowId, setSelectedFieldRowId] = useState('')

  useEffect(() => {
    if (activeGarden) {
      loadFieldRows()
    }
  }, [activeGarden?.id])

  useEffect(() => {
    if (activeGarden?.id) {
      loadData(selectedFieldRowId || undefined)
    }
  }, [activeGarden?.id, selectedFieldRowId])

  const loadFieldRows = async () => {
    if (!activeGarden) return
    try {
      const rows = storageProvider.getFieldRows
        ? await storageProvider.getFieldRows(activeGarden.id).catch(() => [])
        : []
      setFieldRows(rows || [])
      setSelectedFieldRowId((current) => current || rows?.[0]?.id || '')
    } catch (error) {
      console.error('Error loading field rows for rotation planner:', error)
      setFieldRows([])
    }
  }

  const loadData = async (fieldRowId?: string) => {
    if (!activeGarden) return
    
    try {
      setLoading(true)
      const [historyData, plansData] = await Promise.all([
        cropRotationService.getHistory(activeGarden.id, fieldRowId),
        cropRotationService.getPlans(activeGarden.id, 'SUGGESTED')
      ])
      setHistory(historyData)
      setPlans(plansData)
      setReadOnlyFallback(plansData.some((plan) => isVirtualCropRotationPlanId(plan.id)))
    } catch (error) {
      console.error('Error loading crop rotation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptPlan = async (planId: string, cropName: string) => {
    try {
      await cropRotationService.acceptPlan(planId, cropName)
      await loadData(selectedFieldRowId || undefined)
      setSelectedPlan(null)
    } catch (error) {
      console.error('Error accepting plan:', error)
    }
  }

  const handleRejectPlan = async (planId: string) => {
    try {
      await cropRotationService.rejectPlan(planId)
      await loadData(selectedFieldRowId || undefined)
      setSelectedPlan(null)
    } catch (error) {
      console.error('Error rejecting plan:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-orange-600 bg-orange-100'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-blue-600'
    return 'text-yellow-600'
  }

  if (!activeGarden) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Leaf className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Seleziona un Orto
        </h2>
        <p className="text-gray-600">
          Seleziona un orto per gestire la rotazione delle colture
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento dati rotazione...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <RefreshCw className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Rotazione Colture
            </h1>
            <p className="text-gray-600">
              Pianificazione intelligente per {activeGarden.name}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <History size={16} />
          {showHistory ? 'Nascondi' : 'Mostra'} Storia
        </button>
      </div>

      {fieldRows.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filare / area da analizzare
          </label>
          <select
            value={selectedFieldRowId}
            onChange={(e) => setSelectedFieldRowId(e.target.value)}
            className="w-full md:w-96 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {fieldRows.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}{row.cultivar ? ` - ${row.cultivar}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* AI Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">
              🧠 AI Rotazione Intelligente
            </h3>
            <p className="text-sm text-green-800">
              Analisi storia colture • Regole famiglie botaniche • Prevenzione malattie • 
              Ottimizzazione fertilità suolo • Confidenza {Math.round((plans[0]?.confidenceScore || 0.5) * 100)}%
            </p>
          </div>
        </div>
      </div>

      {readOnlyFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            I suggerimenti mostrati ora sono derivati dallo storico filari disponibile nel database.
            Non sono ancora piani persistiti: usali come supporto decisionale e passa dal Planner Classico per creare la pianificazione effettiva.
          </p>
        </div>
      )}

      {/* History Section */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Storia Colture</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600">Nessuna storia disponibile</p>
              <p className="text-sm text-gray-500 mt-1">
                Inizia a registrare le tue colture per ricevere suggerimenti AI
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{item.plantName}</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {item.plantFamily}
                      </span>
                      <span className="text-xs text-gray-500">{item.season} {item.year}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📅 Piantato: {new Date(item.plantedDate).toLocaleDateString('it-IT')}</span>
                      {item.harvestDate && (
                        <span>🌾 Raccolto: {new Date(item.harvestDate).toLocaleDateString('it-IT')}</span>
                      )}
                      {item.yieldKg && (
                        <span>⚖️ Resa: {item.yieldKg} kg</span>
                      )}
                      {item.qualityScore && (
                        <span>⭐ Qualità: {item.qualityScore}/100</span>
                      )}
                    </div>
                    {(item.diseases && item.diseases.length > 0) && (
                      <div className="mt-2 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-orange-500" />
                        <span className="text-xs text-orange-600">
                          Malattie: {item.diseases.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rotation Plans */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Piani di Rotazione Suggeriti</h2>
        
        {plans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nessun Piano Disponibile
            </h3>
            <p className="text-gray-600 mb-4">
              Registra le tue colture per ricevere suggerimenti di rotazione
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dopo {plan.currentCrop}
                        </h3>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {plan.currentFamily}
                        </span>
                        <div className={`flex items-center gap-1 text-sm ${getConfidenceColor(plan.confidenceScore)}`}>
                          <Info size={14} />
                          Confidenza: {Math.round(plan.confidenceScore * 100)}%
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{plan.reasoning}</p>
                    </div>
                  </div>

                  {/* Benefits & Risks */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Benefici
                      </h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        {plan.benefits.map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Rischi da Evitare
                      </h4>
                      <ul className="text-sm text-orange-800 space-y-1">
                        {plan.risksToAvoid.map((risk, index) => (
                          <li key={index}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Suggested Crops */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Colture Consigliate (Top {Math.min(5, plan.suggestedNextCrops.length)})
                    </h4>
                    <div className="grid gap-3">
                      {plan.suggestedNextCrops.slice(0, 5).map((crop, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">🌱</span>
                              <div>
                                <h5 className="font-semibold text-gray-900">{crop.plantName}</h5>
                                <span className="text-xs text-gray-500">{crop.plantFamily}</span>
                              </div>
                            </div>
                            <div className="ml-10">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${crop.score}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(crop.score)}`}>
                                  {crop.score}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                <strong>Benefici:</strong> {crop.benefits.join(', ')}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isVirtualCropRotationPlanId(plan.id)) {
                                handleAcceptPlan(plan.id, crop.plantName)
                              }
                            }}
                            disabled={isVirtualCropRotationPlanId(plan.id)}
                            className={`ml-4 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                              isVirtualCropRotationPlanId(plan.id)
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            <ThumbsUp size={16} />
                            {isVirtualCropRotationPlanId(plan.id) ? 'Solo consultivo' : 'Accetta'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Vedi tutti i suggerimenti ({plan.suggestedNextCrops.length})
                    </button>
                    <button
                      onClick={() => {
                        if (!isVirtualCropRotationPlanId(plan.id)) {
                          handleRejectPlan(plan.id)
                        }
                      }}
                      disabled={isVirtualCropRotationPlanId(plan.id)}
                      className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                        isVirtualCropRotationPlanId(plan.id)
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <ThumbsDown size={16} />
                      {isVirtualCropRotationPlanId(plan.id) ? 'Piano non persistito' : 'Non interessato'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Plan Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Tutti i Suggerimenti per {selectedPlan.currentCrop}
                </h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-3">
                {selectedPlan.suggestedNextCrops.map((crop, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🌱</span>
                        <div>
                          <h5 className="font-semibold text-gray-900">{crop.plantName}</h5>
                          <span className="text-xs text-gray-500">{crop.plantFamily}</span>
                        </div>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${getScoreColor(crop.score)}`}>
                          Score: {crop.score}
                        </span>
                      </div>
                      
                      <div className="ml-10 space-y-2">
                        <div>
                          <strong className="text-sm text-gray-700">Benefici:</strong>
                          <ul className="text-sm text-gray-600 mt-1">
                            {crop.benefits.map((benefit, i) => (
                              <li key={i}>• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-sm text-gray-700">Requisiti:</strong>
                          <ul className="text-sm text-gray-600 mt-1">
                            {crop.requirements.map((req, i) => (
                              <li key={i}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (!isVirtualCropRotationPlanId(selectedPlan.id)) {
                          handleAcceptPlan(selectedPlan.id, crop.plantName)
                        }
                      }}
                      disabled={isVirtualCropRotationPlanId(selectedPlan.id)}
                      className={`ml-4 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        isVirtualCropRotationPlanId(selectedPlan.id)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <ThumbsUp size={16} />
                      {isVirtualCropRotationPlanId(selectedPlan.id) ? 'Solo consultivo' : 'Scegli'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
