'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Leaf,
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  Eye,
  PieChart,
  Activity,
  Award,
  Zap
} from 'lucide-react'
import { Garden } from '@/types'
import { 
  NutritionAnalytics as NutritionAnalyticsType,
  TreatmentTypeAnalytics,
  MonthlyTrend,
  AnalyticsRecommendation
} from '@/types/nutrition'
import { advancedNutritionService } from '@/services/advancedNutritionService'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { it } from 'date-fns/locale'

interface NutritionAnalyticsProps {
  garden: Garden
}

type TimePeriod = 'week' | 'month' | 'quarter' | 'year'
type AnalyticsView = 'overview' | 'treatments' | 'costs' | 'effectiveness' | 'compliance'

export default function NutritionAnalytics({ garden }: NutritionAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<NutritionAnalyticsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const [activeView, setActiveView] = useState<AnalyticsView>('overview')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [garden.id, timePeriod])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await advancedNutritionService.getNutritionAnalytics(garden.id, timePeriod)
      setAnalyticsData(data)
    } catch (err) {
      console.error('Error loading nutrition analytics:', err)
      setError('Errore nel caricamento delle analisi')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadAnalytics()
    } finally {
      setRefreshing(false)
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export analytics data')
  }

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'week': return 'Ultima settimana'
      case 'month': return 'Ultimo mese'
      case 'quarter': return 'Ultimo trimestre'
      case 'year': return 'Ultimo anno'
      default: return 'Periodo'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'cost_optimization': return <DollarSign className="text-green-600" size={16} />
      case 'effectiveness_improvement': return <Target className="text-blue-600" size={16} />
      case 'organic_transition': return <Leaf className="text-green-600" size={16} />
      case 'timing_optimization': return <Calendar className="text-purple-600" size={16} />
      default: return <Zap className="text-yellow-600" size={16} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Errore nel caricamento</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun dato disponibile</h3>
          <p className="text-gray-600">Inizia registrando alcuni trattamenti per vedere le analisi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Nutrizione</h1>
              <p className="text-gray-600">Analisi dettagliate di trattamenti ed efficacia</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="week">Ultima settimana</option>
              <option value="month">Ultimo mese</option>
              <option value="quarter">Ultimo trimestre</option>
              <option value="year">Ultimo anno</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
              Aggiorna
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download size={16} />
              Esporta
            </button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: 'overview', label: 'Panoramica', icon: BarChart3 },
              { id: 'treatments', label: 'Trattamenti', icon: Activity },
              { id: 'costs', label: 'Costi', icon: DollarSign },
              { id: 'effectiveness', label: 'Efficacia', icon: Target },
              { id: 'compliance', label: 'Conformità', icon: Award }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as AnalyticsView)}
                  className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                    activeView === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeView === 'overview' && (
            <OverviewAnalytics analyticsData={analyticsData} timePeriod={timePeriod} />
          )}
          
          {activeView === 'treatments' && (
            <TreatmentAnalytics analyticsData={analyticsData} />
          )}
          
          {activeView === 'costs' && (
            <CostAnalytics analyticsData={analyticsData} />
          )}
          
          {activeView === 'effectiveness' && (
            <EffectivenessAnalytics analyticsData={analyticsData} />
          )}
          
          {activeView === 'compliance' && (
            <ComplianceAnalytics analyticsData={analyticsData} />
          )}
        </div>
      </div>

      {/* Recommendations */}
      {analyticsData.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Raccomandazioni AI</h2>
          <div className="space-y-4">
            {analyticsData.recommendations.map((recommendation, index) => (
              <RecommendationCard
                key={index}
                recommendation={recommendation}
                getRecommendationIcon={getRecommendationIcon}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Overview Analytics Component
interface OverviewAnalyticsProps {
  analyticsData: NutritionAnalyticsType
  timePeriod: TimePeriod
}

function OverviewAnalytics({ analyticsData, timePeriod }: OverviewAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-blue-900">{analyticsData.totalTreatments}</p>
              <p className="text-sm text-blue-700">Trattamenti Totali</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-green-900">€{analyticsData.totalCost.toFixed(0)}</p>
              <p className="text-sm text-green-700">Costo Totale</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <Target className="text-purple-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-purple-900">{analyticsData.averageEffectiveness.toFixed(1)}%</p>
              <p className="text-sm text-purple-700">Efficacia Media</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            <Leaf className="text-orange-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-orange-900">{analyticsData.organicPercentage.toFixed(0)}%</p>
              <p className="text-sm text-orange-700">Biologico</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Costo per Trattamento</h3>
          <p className="text-2xl font-bold text-gray-900">€{analyticsData.costPerTreatment.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Media del periodo</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Costo per m²</h3>
          <p className="text-2xl font-bold text-gray-900">€{analyticsData.costPerSqm.toFixed(3)}</p>
          <p className="text-sm text-gray-600">Efficienza spaziale</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Score Conformità</h3>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.complianceScore.toFixed(0)}%</p>
          <p className="text-sm text-gray-600">Rispetto normative</p>
        </div>
      </div>
    </div>
  )
}

// Treatment Analytics Component
function TreatmentAnalytics({ analyticsData }: { analyticsData: NutritionAnalyticsType }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Analisi per Tipo di Trattamento</h3>
      
      {analyticsData.treatmentsByType.length === 0 ? (
        <div className="text-center py-8">
          <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Nessun dato sui trattamenti disponibile</p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyticsData.treatmentsByType.map((treatment, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 capitalize">{treatment.type}</h4>
                <span className="text-sm text-gray-600">{treatment.count} trattamenti</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Costo Totale</p>
                  <p className="text-lg font-bold text-gray-900">€{treatment.totalCost.toFixed(2)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Efficacia Media</p>
                  <p className="text-lg font-bold text-gray-900">{treatment.averageEffectiveness.toFixed(1)}%</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">% Biologico</p>
                  <p className="text-lg font-bold text-gray-900">{treatment.organicPercentage.toFixed(0)}%</p>
                </div>
              </div>
              
              {/* Progress bar for relative usage */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ 
                      width: `${(treatment.count / Math.max(...analyticsData.treatmentsByType.map(t => t.count))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Cost Analytics Component
function CostAnalytics({ analyticsData }: { analyticsData: NutritionAnalyticsType }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Analisi dei Costi</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-4">Distribuzione Costi</h4>
          <div className="space-y-3">
            {analyticsData.treatmentsByType.map((treatment, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-green-800 capitalize">{treatment.type}</span>
                <span className="font-medium text-green-900">€{treatment.totalCost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-4">Metriche di Efficienza</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Costo medio per trattamento</span>
              <span className="font-medium text-blue-900">€{analyticsData.costPerTreatment.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Costo per m²</span>
              <span className="font-medium text-blue-900">€{analyticsData.costPerSqm.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">ROI stimato</span>
              <span className="font-medium text-blue-900">+{(analyticsData.averageEffectiveness * 1.2).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Effectiveness Analytics Component
function EffectivenessAnalytics({ analyticsData }: { analyticsData: NutritionAnalyticsType }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Analisi dell'Efficacia</h3>
      
      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-4">Performance per Tipo</h4>
        <div className="space-y-4">
          {analyticsData.treatmentsByType.map((treatment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900 capitalize">{treatment.type}</h5>
                <p className="text-sm text-gray-600">{treatment.count} applicazioni</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-900">{treatment.averageEffectiveness.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">efficacia</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {analyticsData.averageEffectiveness > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Benchmark di Settore</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">La tua efficacia media</span>
              <span className="font-medium text-gray-900">{analyticsData.averageEffectiveness.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Media di settore</span>
              <span className="font-medium text-gray-900">75.0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Differenza</span>
              <span className={`font-medium ${
                analyticsData.averageEffectiveness >= 75 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analyticsData.averageEffectiveness >= 75 ? '+' : ''}{(analyticsData.averageEffectiveness - 75).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compliance Analytics Component
function ComplianceAnalytics({ analyticsData }: { analyticsData: NutritionAnalyticsType }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Analisi della Conformità</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-4">Conformità Biologica</h4>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-900">{analyticsData.organicPercentage.toFixed(0)}%</p>
            <p className="text-sm text-green-700">Trattamenti biologici</p>
          </div>
          <div className="mt-4 w-full bg-green-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full"
              style={{ width: `${analyticsData.organicPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-4">Score Generale</h4>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-900">{analyticsData.complianceScore.toFixed(0)}%</p>
            <p className="text-sm text-blue-700">Conformità normative</p>
          </div>
          <div className="mt-4 w-full bg-blue-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${analyticsData.complianceScore}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-4">Aree di Miglioramento</h4>
        <div className="space-y-2">
          {analyticsData.organicPercentage < 80 && (
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle size={16} />
              <span className="text-sm">Aumenta l'uso di prodotti biologici per migliorare la sostenibilità</span>
            </div>
          )}
          {analyticsData.averageEffectiveness < 70 && (
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle size={16} />
              <span className="text-sm">L'efficacia media è sotto la soglia ottimale del 70%</span>
            </div>
          )}
          {analyticsData.complianceScore < 90 && (
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle size={16} />
              <span className="text-sm">Rivedi le procedure per migliorare la conformità normativa</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Recommendation Card Component
interface RecommendationCardProps {
  recommendation: AnalyticsRecommendation
  getRecommendationIcon: (type: string) => React.ReactNode
  getPriorityColor: (priority: string) => string
}

function RecommendationCard({ 
  recommendation, 
  getRecommendationIcon, 
  getPriorityColor 
}: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getRecommendationIcon(recommendation.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
              {recommendation.priority === 'high' ? 'Alta' :
               recommendation.priority === 'medium' ? 'Media' : 'Bassa'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
          
          {(recommendation.potentialSavings || recommendation.potentialImprovement) && (
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              {recommendation.potentialSavings && (
                <span className="flex items-center gap-1">
                  <DollarSign size={12} />
                  Risparmio: €{recommendation.potentialSavings}
                </span>
              )}
              {recommendation.potentialImprovement && (
                <span className="flex items-center gap-1">
                  <TrendingUp size={12} />
                  Miglioramento: +{recommendation.potentialImprovement}%
                </span>
              )}
            </div>
          )}
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <Eye size={12} />
            {expanded ? 'Nascondi dettagli' : 'Mostra azioni'}
          </button>
          
          {expanded && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Azioni consigliate:</h5>
              <ul className="space-y-1">
                {recommendation.actionItems.map((action, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}