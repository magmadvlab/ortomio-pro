'use client'

import { useState, useEffect } from 'react'
import { Brain, RefreshCw, Calendar, TrendingUp, Droplets, Zap } from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import DiseasePredictionsCard from './DiseasePredictionsCard'
import YieldPredictionsCard from './YieldPredictionsCard'
import ResourceOptimizationCard from './ResourceOptimizationCard'
import type { DiseasePredicition, YieldPrediction, ResourceOptimization } from '@/services/aiPredictiveEngine'

interface PredictionsData {
  diseasePredicitions: DiseasePredicition[]
  yieldPredictions: YieldPrediction[]
  resourceOptimizations: ResourceOptimization[]
  generatedAt: string
}

export default function AIPredictionsDashboard() {
  const { activeGarden } = useGarden()
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState<PredictionsData | null>(null)
  const [activeTab, setActiveTab] = useState<'diseases' | 'yield' | 'resources'>('diseases')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (activeGarden) {
      loadPredictions()
    }
  }, [activeGarden])

  const loadPredictions = async () => {
    if (!activeGarden) return
    
    try {
      setLoading(true)
      // TODO: Implementare API endpoint
      // const response = await fetch(`/api/ai/predictions?gardenId=${activeGarden.id}`)
      // const result = await response.json()
      
      // Mock data per ora
      const mockData: PredictionsData = {
        diseasePredicitions: [],
        yieldPredictions: [],
        resourceOptimizations: [],
        generatedAt: new Date().toISOString()
      }
      
      setPredictions(mockData)
    } catch (error) {
      console.error('Error loading AI predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPredictions()
    setRefreshing(false)
  }

  if (!activeGarden) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seleziona un Orto
          </h2>
          <p className="text-gray-600">
            Seleziona un orto per visualizzare le predizioni AI.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Caricamento predizioni AI...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'diseases' as const, label: 'Malattie', icon: Brain, count: predictions?.diseasePredicitions.length || 0 },
    { id: 'yield' as const, label: 'Resa', icon: TrendingUp, count: predictions?.yieldPredictions.length || 0 },
    { id: 'resources' as const, label: 'Risorse', icon: Droplets, count: predictions?.resourceOptimizations.length || 0 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Predictions
                </h1>
                <p className="text-sm text-gray-600">
                  Predizioni intelligenti per {activeGarden.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {predictions && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Aggiornato: {new Date(predictions.generatedAt).toLocaleString('it-IT')}
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Aggiorna
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                    ${activeTab === tab.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${activeTab === tab.id
                        ? 'bg-blue-200 text-blue-900'
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'diseases' && (
          <DiseasePredictionsCard predictions={predictions?.diseasePredicitions || []} />
        )}
        {activeTab === 'yield' && (
          <YieldPredictionsCard predictions={predictions?.yieldPredictions || []} />
        )}
        {activeTab === 'resources' && (
          <ResourceOptimizationCard optimizations={predictions?.resourceOptimizations || []} />
        )}
      </div>
    </div>
  )
}
