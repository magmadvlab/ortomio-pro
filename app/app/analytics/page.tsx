'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart3, TrendingUp, Target, Award, Leaf, Droplets, Sun, DollarSign, Activity, Shield, Euro, Clock, Users, Zap } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { GardenTask, HarvestLogData } from '@/types'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import { useGarden } from '@/packages/core/hooks/useGarden'
import ActivityRegistry from '@/components/garden/ActivityRegistry'
import { getQualityOverview, type QualityOverview } from '@/services/qualityResultsService'
import {
  buildAgronomicQualityLearningAdjustment,
  getAgronomicProfileLearningSnapshots,
  type AgronomicQualityLearningAdjustment,
} from '@/services/agronomicProfileLearningService'
import { getMarketPrice } from '@/data/marketPrices'
import {
  calculateAdaptiveQualityPrice,
  resolveAdaptiveQualityPricingBenchmark,
} from '@/services/adaptiveMarketPricingService'
import { environmentalEvidenceLedgerService } from '@/services/environmentalEvidenceLedgerService'
import {
  buildOperationalAnalytics,
  type AnalyticsTimeRange,
} from '@/lib/analytics/operationalStats'

interface HarvestPricingSummary {
  baseHarvestValue: number
  adaptiveHarvestValue: number
  baseRevenuePerKg: number
  adaptiveRevenuePerKg: number
  premiumRate: number
}

type AnalyticsTab = 'overview' | 'productivity' | 'efficiency' | 'sustainability'

const TIME_RANGES: Array<{ id: AnalyticsTimeRange; label: string }> = [
  { id: 'month', label: 'Ultimo Mese' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'year', label: 'Anno' },
]

const ANALYTICS_TABS: Array<{
  id: AnalyticsTab
  label: string
  icon: typeof DollarSign
}> = [
  { id: 'overview', label: 'ROI & Performance', icon: DollarSign },
  { id: 'productivity', label: 'Produttività', icon: TrendingUp },
  { id: 'efficiency', label: 'Efficienza', icon: Target },
  { id: 'sustainability', label: 'Sostenibilità', icon: Leaf },
]

async function calculateHarvestPricingSummary(
  storageProvider: IStorageProvider,
  harvestLogs: HarvestLogData[],
  gardenId: string,
  taskData: GardenTask[]
): Promise<HarvestPricingSummary> {
  const benchmarkCache = new Map<string, Awaited<ReturnType<typeof resolveAdaptiveQualityPricingBenchmark>>>()
  let baseHarvestValue = 0
  let adaptiveHarvestValue = 0
  let totalKg = 0

  for (const harvest of harvestLogs) {
    const quantityKg = harvest.unit === 'g' ? harvest.quantity / 1000 : harvest.quantity
    totalKg += quantityKg

    const plantName = harvest.plantName?.trim()
    const month = new Date(harvest.date).getMonth()
    const season = month >= 5 && month <= 8 ? 'Summer' : 'Winter'
    const basePrice = getMarketPrice((plantName || 'GENERIC').toUpperCase(), season)
    baseHarvestValue += quantityKg * basePrice

    if (!storageProvider.getUserPreference || !plantName) {
      adaptiveHarvestValue += quantityKg * basePrice
      continue
    }

    const linkedTask = taskData.find((task) => task.id === harvest.taskId)
    const cacheKey = `${plantName.toLowerCase()}::${linkedTask?.zoneId || 'garden'}`
    let benchmark = benchmarkCache.get(cacheKey)

    if (!benchmark) {
      benchmark = await resolveAdaptiveQualityPricingBenchmark(storageProvider, gardenId, {
        plantName,
        zoneId: linkedTask?.zoneId,
      })
      benchmarkCache.set(cacheKey, benchmark)
    }

    adaptiveHarvestValue += quantityKg * calculateAdaptiveQualityPrice(basePrice, {
      qualityScore: harvest.rating * 20,
      benchmark,
    }).adjustedPrice
  }

  return {
    baseHarvestValue: Number(baseHarvestValue.toFixed(0)),
    adaptiveHarvestValue: Number(adaptiveHarvestValue.toFixed(0)),
    baseRevenuePerKg: totalKg > 0 ? Number((baseHarvestValue / totalKg).toFixed(2)) : 0,
    adaptiveRevenuePerKg: totalKg > 0 ? Number((adaptiveHarvestValue / totalKg).toFixed(2)) : 0,
    premiumRate: baseHarvestValue > 0
      ? Number(((adaptiveHarvestValue - baseHarvestValue) / baseHarvestValue).toFixed(3))
      : 0,
  }
}

export default function AnalyticsPage() {
  const { storageProvider } = useStorage()
  const { activeGarden } = useGarden()
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [harvests, setHarvests] = useState<HarvestLogData[]>([])
  const [qualityOverview, setQualityOverview] = useState<QualityOverview | null>(null)
  const [qualityAdjustment, setQualityAdjustment] = useState<AgronomicQualityLearningAdjustment | null>(null)
  const [harvestPricing, setHarvestPricing] = useState<HarvestPricingSummary>({
    baseHarvestValue: 0,
    adaptiveHarvestValue: 0,
    baseRevenuePerKg: 0,
    adaptiveRevenuePerKg: 0,
    premiumRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('month')
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')
  const [environmentalEvidenceSummary, setEnvironmentalEvidenceSummary] = useState(() =>
    environmentalEvidenceLedgerService.summarize(activeGarden?.id)
  )

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedTasks = await storageProvider.getTasks()
        setTasks(loadedTasks)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider])

  const activeGardenTasks = useMemo(
    () => activeGarden?.id
      ? tasks.filter(task => task.gardenId === activeGarden.id)
      : tasks,
    [activeGarden?.id, tasks]
  )
  const { periodTasks, periodHarvests, stats } = useMemo(
    () => buildOperationalAnalytics(activeGardenTasks, harvests, timeRange),
    [activeGardenTasks, harvests, timeRange]
  )

  useEffect(() => {
    const loadQualityContext = async () => {
      if (!activeGarden?.id) {
        setHarvests([])
        setQualityOverview(null)
        setQualityAdjustment(buildAgronomicQualityLearningAdjustment([], {}))
        return
      }

      try {
        const [loadedHarvests, loadedQualityOverview, snapshots] = await Promise.all([
          storageProvider.getHarvestLogs ? storageProvider.getHarvestLogs(activeGarden.id) : Promise.resolve([] as HarvestLogData[]),
          getQualityOverview(storageProvider, activeGarden.id),
          getAgronomicProfileLearningSnapshots(storageProvider, activeGarden.id),
        ])

        setHarvests(loadedHarvests)
        setQualityOverview(loadedQualityOverview)
        setQualityAdjustment(buildAgronomicQualityLearningAdjustment(snapshots, {}))
      } catch (error) {
        console.error('Error loading adaptive quality analytics:', error)
        setHarvests([])
        setQualityOverview(null)
        setQualityAdjustment(buildAgronomicQualityLearningAdjustment([], {}))
      }
    }

    void loadQualityContext()
  }, [activeGarden?.id, storageProvider])

  useEffect(() => {
    setEnvironmentalEvidenceSummary(environmentalEvidenceLedgerService.summarize(activeGarden?.id))
  }, [activeGarden?.id])

  useEffect(() => {
    const loadHarvestPricing = async () => {
      if (!activeGarden?.id || periodHarvests.length === 0) {
        setHarvestPricing({
          baseHarvestValue: 0,
          adaptiveHarvestValue: 0,
          baseRevenuePerKg: 0,
          adaptiveRevenuePerKg: 0,
          premiumRate: 0,
        })
        return
      }

      try {
        setHarvestPricing(await calculateHarvestPricingSummary(
          storageProvider,
          periodHarvests,
          activeGarden.id,
          periodTasks
        ))
      } catch (error) {
        console.error('Error loading adaptive harvest pricing analytics:', error)
        setHarvestPricing({
          baseHarvestValue: 0,
          adaptiveHarvestValue: 0,
          baseRevenuePerKg: 0,
          adaptiveRevenuePerKg: 0,
          premiumRate: 0,
        })
      }
    }

    void loadHarvestPricing()
  }, [activeGarden?.id, periodHarvests, periodTasks, storageProvider])

  // Calcolo statistiche business
  const averageQualityScore = qualityOverview?.averageQualityScore ?? null
  const qualityTargetScore = Math.round((qualityAdjustment?.qualityTargetRating ?? 4) * 20)
  const qualityAlertFloorScore = Math.round((qualityAdjustment?.qualityAlertFloorRating ?? 3) * 20)
  const averageBrix = qualityOverview?.averageBrix ?? null
  const qualityGap = averageQualityScore === null
    ? null
    : Number((averageQualityScore - qualityTargetScore).toFixed(1))
  const averageYieldPerSqm =
    activeGarden?.sizeSqMeters && stats.harvestWeight > 0
      ? Number((stats.harvestWeight / activeGarden.sizeSqMeters).toFixed(2))
      : null
  const averageMinutesPerCompletedTask =
    stats.laborHours !== null && stats.completedTasks > 0
      ? Math.round((stats.laborHours * 60) / stats.completedTasks)
      : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento analytics...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="text-blue-500" size={28} />
          Business Intelligence
        </h1>
        <p className="text-gray-600 mt-1">
          Analisi ROI, efficienza e performance aziendali
          {activeGarden ? ` per ${activeGarden.name}` : ''}
        </p>
      </div>

      {/* Filtro Temporale */}
      <div className="mb-6">
        <div className="flex gap-2">
          {TIME_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          {/* Desktop: Single row */}
          <nav className="hidden md:flex -mb-px space-x-8">
            {ANALYTICS_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Mobile: Two rows */}
          <div className="md:hidden">
            {/* First row - Main tabs */}
            <nav className="flex space-x-4 border-b border-gray-100 -mb-px">
              {ANALYTICS_TABS.slice(0, 2).map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Second row - Additional tabs */}
            <nav className="flex space-x-4 -mb-px">
              {ANALYTICS_TABS.slice(2).map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenuto Tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {activeGarden && qualityAdjustment && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Benchmark Qualità Adattivo</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    ROI e posizionamento premium letti rispetto alla memoria reale del sito.
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  qualityGap === null
                    ? 'bg-gray-100 text-gray-600'
                    : qualityGap >= 0
                      ? 'bg-green-100 text-green-700'
                      : averageQualityScore !== null && averageQualityScore < qualityAlertFloorScore
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {qualityGap === null
                    ? 'Dati insufficienti'
                    : qualityGap >= 0
                      ? 'Sopra benchmark'
                      : averageQualityScore !== null && averageQualityScore < qualityAlertFloorScore
                        ? 'Sotto soglia'
                        : 'In osservazione'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-900 mb-2">Qualità media</h3>
                  <p className="text-2xl font-bold text-emerald-700">
                    {averageQualityScore !== null ? `${averageQualityScore.toFixed(0)}%` : 'n/d'}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Target sito</h3>
                  <p className="text-2xl font-bold text-blue-700">{qualityTargetScore}%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Brix medio / target</h3>
                  <p className="text-2xl font-bold text-purple-700">
                    {averageBrix !== null
                      ? `${averageBrix.toFixed(1)}° / ${qualityAdjustment.brixTarget}°`
                      : `${qualityAdjustment.brixTarget}°`}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-2">Valore kg adattivo</h3>
                  <p className="text-2xl font-bold text-amber-700">
                    {stats.harvestWeight > 0 ? `€${harvestPricing.adaptiveRevenuePerKg.toFixed(2)}` : 'n/d'}
                  </p>
                  <p className="text-xs text-amber-800 mt-1">
                    {stats.harvestWeight > 0
                      ? `base €${harvestPricing.baseRevenuePerKg.toFixed(2)}/kg`
                      : 'Nessun raccolto nel periodo'}
                  </p>
                </div>
              </div>
              {qualityAdjustment.notes.length > 0 && (
                <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Memoria sito-specifica</div>
                  <div className="space-y-1">
                    {qualityAdjustment.notes.map((note, index) => (
                      <p key={index} className="text-sm text-gray-600">{note}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KPI Finanziari */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Euro className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.roi === null ? 'n/d' : `${stats.roi}%`}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Richiede costi e ricavi completi
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risparmio Costi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.costSavings === null ? 'n/d' : `€${stats.costSavings}`}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Nessuna baseline costi disponibile
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Produzione</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.harvestWeight} kg</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Somma dei raccolti registrati nel periodo
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ore Lavoro</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.laborHours === null ? 'n/d' : `${stats.laborHours} h`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Zap size={16} />
                <span className="text-sm">
                  {stats.efficiency === null ? 'Nessuna operazione nel periodo' : `Efficienza ${stats.efficiency}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="text-green-600" size={28} />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {stats.efficiency === null ? 'n/d' : `${stats.efficiency}%`}
                </p>
                <p className="text-sm text-gray-600">Efficienza Operativa</p>
                <p className="text-xs text-gray-500 mt-1">Task completati sul totale del periodo</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="text-blue-600" size={28} />
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.completedTasks}</p>
                <p className="text-sm text-gray-600">Operazioni Completate</p>
                <p className="text-xs text-gray-500 mt-1">Su {stats.totalTasks} totali</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="text-orange-600" size={28} />
                </div>
                <p className="text-3xl font-bold text-orange-600">{stats.plantsGrown}</p>
                <p className="text-sm text-gray-600">Semine e trapianti completati</p>
                <p className="text-xs text-gray-500 mt-1">Operazioni registrate nel periodo</p>
              </div>
            </div>
          </div>

          {activeGarden && (
            <ActivityRegistry
              tasks={periodTasks}
              gardenId={activeGarden.id}
              storageProvider={storageProvider}
            />
          )}
        </div>
      )}

      {activeTab === 'productivity' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <TrendingUp className="mx-auto mb-4 text-blue-500" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analisi Produttività</h2>
              <p className="text-gray-600 mb-6">
                Metriche avanzate su rese, tempi di ciclo e performance per coltura
              </p>
              
              {/* Metriche Produttività */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Resa Media</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {averageYieldPerSqm === null ? 'n/d' : `${averageYieldPerSqm} kg/m²`}
                  </p>
                  <p className="text-sm text-blue-700">
                    {averageYieldPerSqm === null
                      ? 'Richiede raccolti e superficie registrati'
                      : 'Raccolti del periodo / superficie del garden'}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Tempo Ciclo</h3>
                  <p className="text-2xl font-bold text-green-600">n/d</p>
                  <p className="text-sm text-green-700">Cicli semina-raccolto non riconciliati</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Qualità</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {averageQualityScore !== null ? `${averageQualityScore.toFixed(0)}%` : 'n/d'}
                  </p>
                  <p className="text-sm text-purple-700">
                    {qualityGap === null
                      ? 'In attesa di rilievi qualità'
                      : `${qualityGap >= 0 ? '+' : ''}${qualityGap.toFixed(1)} vs target sito`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <Target className="mx-auto mb-4 text-green-500" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Efficienza Operativa</h2>
              <p className="text-gray-600 mb-6">
                Ottimizzazione risorse, tempi di lavoro e costi operativi
              </p>
              
              {/* Metriche Efficienza */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Utilizzo Risorse</h3>
                  <p className="text-2xl font-bold text-green-600">n/d</p>
                  <p className="text-sm text-green-700">Nessuna telemetria risorse disponibile</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Tempo/Operazione</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {averageMinutesPerCompletedTask === null ? 'n/d' : `${averageMinutesPerCompletedTask} min`}
                  </p>
                  <p className="text-sm text-blue-700">Da durate registrate sui task completati</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Valore/kg adattivo</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.harvestWeight > 0 ? `€${harvestPricing.adaptiveRevenuePerKg.toFixed(2)}` : 'n/d'}
                  </p>
                  <p className="text-sm text-orange-700">
                    {stats.harvestWeight === 0
                      ? 'Nessun raccolto registrato nel periodo'
                      : harvestPricing.premiumRate > 0
                      ? `Premium qualità +${Math.round(harvestPricing.premiumRate * 100)}%`
                      : harvestPricing.premiumRate < 0
                        ? `Pricing difensivo ${Math.round(harvestPricing.premiumRate * 100)}%`
                        : 'Prezzo base senza premium'}
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Automazione</h3>
                  <p className="text-2xl font-bold text-purple-600">n/d</p>
                  <p className="text-sm text-purple-700">Processi automatizzati</p>
                  <p className="text-xs text-purple-700 mt-1">Telemetria automazioni non disponibile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sustainability' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <Leaf className="mx-auto mb-4 text-green-500" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Impatto Ambientale</h2>
              <p className="text-gray-600 mb-6">
                Indicatori orientativi da usare come supporto operativo, non come report ESG certificato
              </p>
              
              {/* Metriche Sostenibilità */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sun className="text-green-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.co2Offset === null ? 'n/d' : `${stats.co2Offset} kg`}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">CO₂ stimata</p>
                  <p className="text-xs text-green-700">Baseline ed evidenze insufficienti</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Droplets className="text-blue-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.waterSaved === null ? 'n/d' : `${stats.waterSaved} L`}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">Acqua stimata</p>
                  <p className="text-xs text-blue-700">Da validare con baseline aziendale</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="text-purple-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">n/d</p>
                  <p className="text-sm text-gray-600 mb-2">Readiness</p>
                  <p className="text-xs text-purple-700">Solo se registrata nei moduli certificazioni</p>
                </div>
              </div>

              <div className="mt-8 text-left bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">Ledger evidenze ambientali</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Record</p>
                    <p className="font-semibold text-gray-900">{environmentalEvidenceSummary.count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Confidenza media</p>
                    <p className="font-semibold text-gray-900">{environmentalEvidenceSummary.avgConfidence}%</p>
                  </div>
                </div>
                {environmentalEvidenceSummary.latest && (
                  <p className="mt-3 text-xs text-gray-600">
                    Ultimo segnale: {environmentalEvidenceSummary.latest.kind} - {environmentalEvidenceSummary.latest.summary}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
