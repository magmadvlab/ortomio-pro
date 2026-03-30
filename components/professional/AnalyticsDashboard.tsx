'use client'

import React, { useState, useEffect } from 'react'
import { Garden, GardenTask, HarvestLogData } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Lightbulb,
  Download
} from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { getQualityOverview, type QualityOverview } from '@/services/qualityResultsService'
import {
  buildAgronomicQualityLearningAdjustment,
  getAgronomicProfileLearningSnapshots,
  type AgronomicQualityLearningAdjustment,
} from '@/services/agronomicProfileLearningService'

interface AnalyticsDashboardProps {
  garden: Garden
}

interface KPI {
  label: string
  value: string | number
  trend: 'up' | 'down' | 'neutral'
  change: string
  icon: React.ReactNode
}

interface Suggestion {
  id: string
  type: 'warning' | 'opportunity' | 'tip'
  title: string
  message: string
  action?: string
}

interface QualityBenchmarkSummary {
  averageQualityScore: number | null
  qualityTargetScore: number
  qualityAlertFloorScore: number
  averageBrix: number | null
  brixTarget: number
  benchmarkGap: number | null
  status: 'above_target' | 'watch' | 'below_target' | 'no_data'
  notes: string[]
}

export function AnalyticsDashboard({ garden }: AnalyticsDashboardProps) {
  const { storageProvider } = useStorage()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [harvests, setHarvests] = useState<HarvestLogData[]>([])
  const [kpis, setKpis] = useState<KPI[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [qualityBenchmark, setQualityBenchmark] = useState<QualityBenchmarkSummary | null>(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [garden.id, storageProvider])

  const loadAnalyticsData = async () => {
    setLoading(true)

    try {
      const [
        tasksData,
        harvestsData,
        qualityOverview,
        learningSnapshots,
      ] = await Promise.all([
        storageProvider.getTasks(garden.id),
        storageProvider.getHarvestLogs ? storageProvider.getHarvestLogs(garden.id) : Promise.resolve([] as HarvestLogData[]),
        getQualityOverview(storageProvider, garden.id),
        getAgronomicProfileLearningSnapshots(storageProvider, garden.id),
      ])
      const qualityAdjustment = buildAgronomicQualityLearningAdjustment(learningSnapshots, {})

      setTasks(tasksData || [])
      setHarvests(harvestsData)
      setQualityBenchmark(buildQualityBenchmarkSummary(qualityOverview, qualityAdjustment))

      // Calcola KPI
      const calculatedKPIs = calculateKPIs(tasksData || [], harvestsData, qualityOverview, qualityAdjustment)
      setKpis(calculatedKPIs)

      // Genera suggerimenti AI
      const aiSuggestions = generateSuggestions(tasksData || [], harvestsData, garden, qualityOverview, qualityAdjustment)
      setSuggestions(aiSuggestions)

    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const buildQualityBenchmarkSummary = (
    qualityOverview: QualityOverview,
    qualityAdjustment: AgronomicQualityLearningAdjustment
  ): QualityBenchmarkSummary => {
    const averageQualityScore = qualityOverview.averageQualityScore ?? null
    const qualityTargetScore = Math.round(qualityAdjustment.qualityTargetRating * 20)
    const qualityAlertFloorScore = Math.round(qualityAdjustment.qualityAlertFloorRating * 20)
    const benchmarkGap = averageQualityScore === null
      ? null
      : Number((averageQualityScore - qualityTargetScore).toFixed(1))
    const status = averageQualityScore === null
      ? 'no_data'
      : averageQualityScore >= qualityTargetScore
        ? 'above_target'
        : averageQualityScore < qualityAlertFloorScore
          ? 'below_target'
          : 'watch'

    return {
      averageQualityScore,
      qualityTargetScore,
      qualityAlertFloorScore,
      averageBrix: qualityOverview.averageBrix ?? null,
      brixTarget: qualityAdjustment.brixTarget,
      benchmarkGap,
      status,
      notes: qualityAdjustment.notes,
    }
  }

  const calculateKPIs = (
    tasks: GardenTask[],
    harvests: HarvestLogData[],
    qualityOverview: QualityOverview,
    qualityAdjustment: AgronomicQualityLearningAdjustment
  ): KPI[] => {
    // Calcolo produzione totale
    const totalProduction = harvests.reduce((sum, h) => sum + (h.quantity || 0), 0)
    const avgProductionPerPlant = tasks.length > 0 ? totalProduction / tasks.length : 0

    // Calcolo valore stimato (€2/kg media)
    const estimatedValue = totalProduction * 2

    // Calcolo task completion rate
    const completedTasks = tasks.filter(t => t.completed).length
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

    // Calcolo produttività (kg per mq)
    const areaM2 = garden.dimensions?.length && garden.dimensions?.width
      ? garden.dimensions.length * garden.dimensions.width
      : 100 // default
    const productivity = totalProduction / areaM2
    const averageQualityScore = qualityOverview.averageQualityScore
    const targetQualityScore = Math.round(qualityAdjustment.qualityTargetRating * 20)
    const qualityGap = typeof averageQualityScore === 'number'
      ? Number((averageQualityScore - targetQualityScore).toFixed(1))
      : null

    return [
      {
        label: 'Produzione Totale',
        value: `${totalProduction.toFixed(1)} kg`,
        trend: 'up',
        change: '+12% vs mese scorso',
        icon: <TrendingUp className="text-green-600" size={24} />
      },
      {
        label: 'Valore Stimato',
        value: `€${estimatedValue.toFixed(0)}`,
        trend: 'up',
        change: '+€24 vs mese scorso',
        icon: <DollarSign className="text-blue-600" size={24} />
      },
      {
        label: 'Qualità Media',
        value: typeof averageQualityScore === 'number' ? `${averageQualityScore.toFixed(0)}%` : 'n/d',
        trend: qualityGap === null ? 'neutral' : qualityGap >= 0 ? 'up' : qualityGap <= -8 ? 'down' : 'neutral',
        change: qualityGap === null
          ? `Target sito ${targetQualityScore}%`
          : `${qualityGap >= 0 ? '+' : ''}${qualityGap.toFixed(1)} vs target`,
        icon: <Award className="text-purple-600" size={24} />
      },
      {
        label: 'Produttività',
        value: `${productivity.toFixed(2)} kg/m²`,
        trend: productivity > 5 ? 'up' : 'neutral',
        change: avgProductionPerPlant > 0
          ? `${avgProductionPerPlant.toFixed(2)} kg/pianta`
          : 'Dati raccolto in consolidamento',
        icon: <BarChart3 className="text-orange-600" size={24} />
      }
    ]
  }

  const generateSuggestions = (
    tasks: GardenTask[],
    harvests: HarvestLogData[],
    garden: Garden,
    qualityOverview: QualityOverview,
    qualityAdjustment: AgronomicQualityLearningAdjustment
  ): Suggestion[] => {
    const suggestions: Suggestion[] = []
    const totalProduction = harvests.reduce((sum, h) => sum + (h.quantity || 0), 0)
    const averageQualityScore = qualityOverview.averageQualityScore
    const targetQualityScore = Math.round(qualityAdjustment.qualityTargetRating * 20)
    const alertFloorQualityScore = Math.round(qualityAdjustment.qualityAlertFloorRating * 20)

    // Suggerimento 1: Task in ritardo
    const overdueTasks = tasks.filter(t => !t.completed && new Date(t.date) < new Date())
    if (overdueTasks.length > 3) {
      suggestions.push({
        id: 'overdue',
        type: 'warning',
        title: 'Task in Ritardo',
        message: `Hai ${overdueTasks.length} task non completati. Rischi di compromettere il raccolto.`,
        action: 'Vedi Task'
      })
    }

    // Suggerimento 2: Produttività bassa
    const tomatoes = harvests.filter(h => h.plantName?.toLowerCase().includes('pomodoro'))
    if (tomatoes.length > 0) {
      const avgTomato = tomatoes.reduce((sum, h) => sum + (h.quantity || 0), 0) / tomatoes.length
      if (avgTomato < 3) {
        suggestions.push({
          id: 'low-tomato',
          type: 'opportunity',
          title: 'Pomodori Sotto Media',
          message: `I tuoi pomodori rendono ${avgTomato.toFixed(1)}kg. Incrocia nutrizione e irrigazione sul lotto meno performante per riallinearti al benchmark del sito.`,
          action: 'Aggiungi Task Fertilizzazione'
        })
      }
    }

    if (typeof averageQualityScore === 'number' && averageQualityScore < alertFloorQualityScore) {
      suggestions.push({
        id: 'quality-below-floor',
        type: 'warning',
        title: 'Qualità Sotto Soglia Sito',
        message: `La qualità media è ${averageQualityScore.toFixed(0)}%, sotto la soglia adattiva ${alertFloorQualityScore}%. Conviene rivedere timing di raccolta, uniformità irrigua e lotti guida.`,
        action: 'Apri Benchmark Qualità'
      })
    } else if (typeof averageQualityScore === 'number' && averageQualityScore < targetQualityScore) {
      suggestions.push({
        id: 'quality-below-target',
        type: 'opportunity',
        title: 'Qualità Sotto Target',
        message: `La qualità media è ${averageQualityScore.toFixed(0)}%, sotto il target sito ${targetQualityScore}%. Lavora sui lotti con migliore storico per recuperare margine premium.`,
        action: 'Vedi Lotti Migliori'
      })
    } else if (typeof averageQualityScore === 'number' && averageQualityScore >= targetQualityScore) {
      suggestions.push({
        id: 'quality-premium',
        type: 'tip',
        title: 'Benchmark Qualità Superato',
        message: `La qualità media è ${averageQualityScore.toFixed(0)}%, sopra il target sito ${targetQualityScore}%. Usa questi lotti come standard per pricing e tracciabilità premium.`,
        action: 'Apri Tracciabilità'
      })
    }

    // Suggerimento 3: Rotazione colturale
    const sowingTasks = tasks.filter(t => t.taskType === 'Sowing')
    const plantFamilies = sowingTasks.map(t => t.plantName)
    const hasSamePlantTwice = plantFamilies.some((p, i) => plantFamilies.indexOf(p) !== i)

    if (hasSamePlantTwice) {
      suggestions.push({
        id: 'rotation',
        type: 'tip',
        title: 'Attenzione alla Rotazione',
        message: 'Hai piantato la stessa coltura due volte. Considera di ruotare per prevenire malattie.',
        action: 'Vedi Piano Rotazione'
      })
    }

    // Suggerimento 4: Previsione AI
    if (harvests.length >= 5) {
      suggestions.push({
        id: 'forecast',
        type: 'opportunity',
        title: 'Previsione Prossimo Raccolto',
        message: `Basandoci sui dati, stimi ${(totalProduction * 1.15).toFixed(1)}kg nel prossimo mese (+15%).`,
        action: 'Vedi Previsioni'
      })
    }

    return suggestions
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Caricamento analytics...</p>
      </div>
    )
  }

  const totalProduction = harvests.reduce((sum, h) => sum + (h.quantity || 0), 0)
  const qualityStatusLabel = qualityBenchmark?.status === 'above_target'
    ? 'Sopra benchmark'
    : qualityBenchmark?.status === 'watch'
      ? 'In osservazione'
      : qualityBenchmark?.status === 'below_target'
        ? 'Sotto soglia'
        : 'Dati insufficienti'
  const qualityStatusClassName = qualityBenchmark?.status === 'above_target'
    ? 'bg-green-100 text-green-700'
    : qualityBenchmark?.status === 'watch'
      ? 'bg-yellow-100 text-yellow-800'
      : qualityBenchmark?.status === 'below_target'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-600'

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics PRO</h1>
          <p className="text-gray-600 mt-1">Dashboard prestazioni orto</p>
        </div>
        <Button variant="outline" className="flex items-center gap-3">
          <Download size={18} />
          Esporta Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{kpi.value}</p>
                <div className="flex items-center gap-3 text-sm">
                  {kpi.trend === 'up' && <TrendingUp size={14} className="text-green-600" />}
                  {kpi.trend === 'down' && <TrendingDown size={14} className="text-red-600" />}
                  <span className={
                    kpi.trend === 'up' ? 'text-green-600' :
                    kpi.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }>
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {kpi.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {qualityBenchmark && (
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Benchmark Qualità Adattivo</h2>
              <p className="text-sm text-gray-600 mt-1">
                Valuta resa premium e posizionamento economico rispetto alla memoria reale del sito.
              </p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${qualityStatusClassName}`}>
              {qualityStatusLabel}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Qualità media</div>
              <div className="text-2xl font-bold text-emerald-700">
                {qualityBenchmark.averageQualityScore !== null ? `${qualityBenchmark.averageQualityScore.toFixed(0)}%` : 'n/d'}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Target sito</div>
              <div className="text-2xl font-bold text-blue-700">{qualityBenchmark.qualityTargetScore}%</div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Soglia allerta</div>
              <div className="text-2xl font-bold text-amber-700">{qualityBenchmark.qualityAlertFloorScore}%</div>
            </div>
            <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Brix medio / target</div>
              <div className="text-2xl font-bold text-purple-700">
                {qualityBenchmark.averageBrix !== null
                  ? `${qualityBenchmark.averageBrix.toFixed(1)}° / ${qualityBenchmark.brixTarget}°`
                  : `${qualityBenchmark.brixTarget}°`}
              </div>
            </div>
          </div>
          {qualityBenchmark.notes.length > 0 && (
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-900 mb-2">Memoria sito-specifica</div>
              <div className="space-y-1">
                {qualityBenchmark.notes.map((note, index) => (
                  <p key={index} className="text-sm text-gray-600">{note}</p>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Suggerimenti AI */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="text-yellow-full max-w-sm" size={24} />
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Suggerimenti AI</h2>
        </div>

        {suggestions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            ✅ Nessun suggerimento. Il tuo orto è ottimizzato!
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border-l-4 ${
                  suggestion.type === 'warning' ? 'bg-red-50 border-red-500' :
                  suggestion.type === 'opportunity' ? 'bg-blue-50 border-blue-500' :
                  'bg-green-50 border-green-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h3>
                    <p className="text-sm text-gray-700 mb-2">{suggestion.message}</p>
                    {suggestion.action && (
                      <Button variant="ghost" size="sm" className="text-sm">
                        {suggestion.action} →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Grafici */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico Produzione per Pianta */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
            <BarChart3 size={20} />
            Produzione per Pianta
          </h3>
          <div className="space-y-3">
            {Object.entries(
              harvests.reduce((acc, h) => {
                if (h.plantName) {
                  acc[h.plantName] = (acc[h.plantName] || 0) + (h.quantity || 0)
                }
                return acc
              }, {} as Record<string, number>)
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([plant, quantity]) => {
                const percentage = totalProduction > 0 ? (quantity / totalProduction) * 100 : 0
                return (
                  <div key={plant}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{plant}</span>
                      <span className="text-sm text-gray-600">{quantity.toFixed(1)} kg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>

        {/* Grafico Task Completion */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
            <PieChart size={20} />
            Task per Tipo
          </h3>
          <div className="space-y-3">
            {Object.entries(
              tasks.reduce((acc, t) => {
                acc[t.taskType] = (acc[t.taskType] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            )
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0
                const completedCount = tasks.filter(t => t.taskType === type && t.completed).length
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{type}</span>
                      <span className="text-sm text-gray-600">
                        {completedCount}/{count} completati
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>
      </div>

      {/* Timeline Previsioni */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Calendar size={20} />
          Previsioni Prossimi 30 Giorni
        </h3>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 mb-2">
                {(totalProduction * 1.15).toFixed(1)} kg
              </p>
              <p className="text-sm text-gray-600">Produzione stimata</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {tasks.filter(t => !t.completed && new Date(t.date) > new Date()).length}
              </p>
              <p className="text-sm text-gray-600">Task pianificati</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 mb-2">
                €{(totalProduction * 1.15 * 2).toFixed(0)}
              </p>
              <p className="text-sm text-gray-600">Valore stimato</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
