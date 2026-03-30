'use client'

import React, { useEffect, useState } from 'react'
import { 
  FileText, Download, Calendar, TrendingUp, Award, 
  Leaf, Droplets, Bug, Scissors, DollarSign, BarChart3,
  CheckCircle, AlertTriangle, Camera, MapPin, Filter
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts'
import {
  buildAgronomicQualityLearningAdjustment,
  getAgronomicProfileLearningSnapshots,
  type AgronomicQualityLearningAdjustment,
} from '@/services/agronomicProfileLearningService'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useStorage } from '@/packages/core/hooks/useStorage'

// Sistema export PDF: lib/reports/exportReportPDF.ts (dynamic import)

type QualityBenchmarkStatus = 'above_target' | 'watch' | 'below_target'

const getQualityBenchmarkStatus = (
  quality: number,
  target: number,
  alertFloor: number
): QualityBenchmarkStatus => {
  if (quality >= target) {
    return 'above_target'
  }

  if (quality < alertFloor) {
    return 'below_target'
  }

  return 'watch'
}

const getQualityBenchmarkCopy = (status: QualityBenchmarkStatus) => {
  switch (status) {
    case 'above_target':
      return {
        badge: 'Sopra target sito',
        badgeClassName: 'bg-green-100 text-green-700',
        textClassName: 'text-green-700',
      }
    case 'watch':
      return {
        badge: 'In osservazione',
        badgeClassName: 'bg-yellow-100 text-yellow-800',
        textClassName: 'text-yellow-700',
      }
    default:
      return {
        badge: 'Sotto soglia sito',
        badgeClassName: 'bg-red-100 text-red-700',
        textClassName: 'text-red-700',
      }
  }
}

export default function PlantReportsPage() {
  const { activeGarden } = useGarden()
  const { storageProvider } = useStorage()
  const [selectedReport, setSelectedReport] = useState<'summary' | 'detailed' | 'comparison'>('summary')
  const [selectedCrop, setSelectedCrop] = useState('pomodoro')
  const [showFilters, setShowFilters] = useState(false)
  const [qualityAdjustment, setQualityAdjustment] = useState<AgronomicQualityLearningAdjustment | null>(null)
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    minQuality: 0,
    minYield: 0,
    operationType: 'all'
  })

  // DATI MOCK REALISTICI (continua...)

  const mockData = {
    pomodoro: {
      name: 'Pomodoro San Marzano',
      variety: 'San Marzano DOP',
      location: 'Zona Nord - Filare 3',
      plantingDate: '15/01/2026',
      harvestDate: '15/03/2026',
      duration: 60,
      
      operations: [
        { date: '10/01/2026', type: 'Lavorazione', title: 'Fresatura Terreno', details: 'Motozappa, 30m², 60min, €30', icon: Scissors, color: 'blue' },
        { date: '15/01/2026', type: 'Trapianto', title: 'Trapianto 10 Piantine', details: 'Distanza 50cm, da semenzaio', icon: Leaf, color: 'green' },
        { date: '21/01/2026', type: 'Fertilizzazione', title: 'Nitrato di Calcio', details: '1.08kg via fertirrigazione, 30m²', icon: Droplets, color: 'purple' },
        { date: '21/01/2026', type: 'Irrigazione', title: 'Irrigazione a Goccia', details: '150L, 45min, con fertirrigazione', icon: Droplets, color: 'blue' },
        { date: '28/01/2026', type: 'Problema', title: 'Afidi Rilevati', details: 'Afidi neri su foglie giovani', icon: Bug, color: 'red' },
        { date: '29/01/2026', type: 'Trattamento', title: 'Sapone Molle', details: '200ml spray fogliare contro afidi', icon: Bug, color: 'orange' },
        { date: '15/03/2026', type: 'Raccolta', title: 'Primo Raccolto', details: '18.5kg, qualità 4.5/5, brix 6.2', icon: Award, color: 'yellow' }
      ],
      
      results: { totalYield: 18.5, yieldPerPlant: 1.85, quality: 4.5, brix: 6.2, defects: 5, marketValue: 240 },
      costs: { preparation: 30, plants: 20, fertilizers: 15, treatments: 10, irrigation: 10, total: 85 },
      roi: { revenue: 240, costs: 85, profit: 155, percentage: 182 },
      issues: [{ date: '28/01/2026', problem: 'Afidi neri', severity: 'Media', solution: 'Sapone molle', resolved: true, daysToResolve: 1 }],
      photos: 5,
      weather: { avgTemp: 16, totalRain: 45, sunnyDays: 42 },
      
      // Dati per grafici
      growthData: [
        { day: 0, height: 10, leaves: 4, health: 85 },
        { day: 10, height: 25, leaves: 8, health: 90 },
        { day: 20, height: 45, leaves: 12, health: 88 },
        { day: 30, height: 70, leaves: 18, health: 92 },
        { day: 40, height: 95, leaves: 24, health: 95 },
        { day: 50, height: 110, leaves: 28, health: 93 },
        { day: 60, height: 120, leaves: 30, health: 94 }
      ],
      
      costBreakdown: [
        { name: 'Preparazione', value: 30, percentage: 35 },
        { name: 'Piantine', value: 20, percentage: 24 },
        { name: 'Fertilizzanti', value: 15, percentage: 18 },
        { name: 'Trattamenti', value: 10, percentage: 12 },
        { name: 'Irrigazione', value: 10, percentage: 12 }
      ],
      
      weeklyYield: [
        { week: 'Sett 1-4', yield: 0 },
        { week: 'Sett 5', yield: 2.5 },
        { week: 'Sett 6', yield: 4.8 },
        { week: 'Sett 7', yield: 6.2 },
        { week: 'Sett 8', yield: 5.0 }
      ]
    },
    lattuga: {
      name: 'Lattuga Romana',
      variety: 'Romana Verde',
      location: 'Zona Sud - Aiuola B',
      plantingDate: '05/01/2026',
      harvestDate: '05/03/2026',
      duration: 60,
      operations: [
        { date: '03/01/2026', type: 'Lavorazione', title: 'Vangatura', details: '20m², manuale', icon: Scissors, color: 'blue' },
        { date: '05/01/2026', type: 'Semina', title: 'Semina Diretta', details: '100 semi, file 30cm', icon: Leaf, color: 'green' },
        { date: '10/01/2026', type: 'Osservazione', title: 'Germinazione', details: '85% germinazione', icon: CheckCircle, color: 'green' },
        { date: '05/03/2026', type: 'Raccolta', title: 'Raccolta Scalare', details: '12kg, qualità 4/5', icon: Award, color: 'yellow' }
      ],
      results: { totalYield: 12, yieldPerPlant: 0.12, quality: 4, brix: 0, defects: 8, marketValue: 96 },
      costs: { preparation: 15, plants: 5, fertilizers: 8, treatments: 5, irrigation: 7, total: 40 },
      roi: { revenue: 96, costs: 40, profit: 56, percentage: 140 },
      issues: [],
      photos: 3,
      weather: { avgTemp: 14, totalRain: 35, sunnyDays: 45 },
      
      growthData: [
        { day: 0, height: 2, leaves: 2, health: 80 },
        { day: 10, height: 5, leaves: 4, health: 85 },
        { day: 20, height: 10, leaves: 8, health: 90 },
        { day: 30, height: 15, leaves: 12, health: 92 },
        { day: 40, height: 20, leaves: 16, health: 90 },
        { day: 50, height: 22, leaves: 18, health: 88 },
        { day: 60, height: 25, leaves: 20, health: 85 }
      ],
      
      costBreakdown: [
        { name: 'Preparazione', value: 15, percentage: 38 },
        { name: 'Semi', value: 5, percentage: 13 },
        { name: 'Fertilizzanti', value: 8, percentage: 20 },
        { name: 'Trattamenti', value: 5, percentage: 13 },
        { name: 'Irrigazione', value: 7, percentage: 18 }
      ],
      
      weeklyYield: [
        { week: 'Sett 1-7', yield: 0 },
        { week: 'Sett 8', yield: 3.0 },
        { week: 'Sett 9', yield: 5.5 },
        { week: 'Sett 10', yield: 3.5 }
      ]
    }
  }

  // Dati per confronto cicli
  const comparisonData = {
    pomodoro: [
      { cycle: 'Ciclo 1\n(Gen-Mar)', yield: 18.5, quality: 4.5, costs: 85, roi: 182, duration: 60 },
      { cycle: 'Ciclo 2\n(Apr-Giu)', yield: 22.0, quality: 4.8, costs: 90, roi: 210, duration: 58 },
      { cycle: 'Ciclo 3\n(Lug-Set)', yield: 16.0, quality: 4.2, costs: 80, roi: 150, duration: 62 }
    ],
    lattuga: [
      { cycle: 'Ciclo 1\n(Gen-Mar)', yield: 12.0, quality: 4.0, costs: 40, roi: 140, duration: 60 },
      { cycle: 'Ciclo 2\n(Apr-Giu)', yield: 14.5, quality: 4.3, costs: 42, roi: 165, duration: 55 },
      { cycle: 'Ciclo 3\n(Lug-Set)', yield: 10.5, quality: 3.8, costs: 38, roi: 120, duration: 58 }
    ]
  }

  const currentData = mockData[selectedCrop as keyof typeof mockData]
  const currentComparison = comparisonData[selectedCrop as keyof typeof comparisonData]
  const qualityTargetRating = qualityAdjustment?.qualityTargetRating ?? 4
  const qualityAlertFloorRating = qualityAdjustment?.qualityAlertFloorRating ?? 3
  const qualityBenchmarkStatus = getQualityBenchmarkStatus(
    currentData.results.quality,
    qualityTargetRating,
    qualityAlertFloorRating
  )
  const qualityBenchmarkCopy = getQualityBenchmarkCopy(qualityBenchmarkStatus)
  const qualityBenchmarkGap = Number((currentData.results.quality - qualityTargetRating).toFixed(1))
  const averageComparisonQuality = currentComparison.reduce((sum, cycle) => sum + cycle.quality, 0) / currentComparison.length
  const averageComparisonQualityGap = Number((averageComparisonQuality - qualityTargetRating).toFixed(1))
  const adaptiveQualityNotes = qualityAdjustment?.notes || []

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

  useEffect(() => {
    const loadQualityAdjustment = async () => {
      if (!activeGarden?.id || !storageProvider?.getUserPreference) {
        setQualityAdjustment(buildAgronomicQualityLearningAdjustment([], { plantName: currentData.name }))
        return
      }

      try {
        const snapshots = await getAgronomicProfileLearningSnapshots(storageProvider, activeGarden.id)
        setQualityAdjustment(
          buildAgronomicQualityLearningAdjustment(snapshots, { plantName: currentData.name })
        )
      } catch (error) {
        console.error('Errore caricamento benchmark qualità report:', error)
        setQualityAdjustment(buildAgronomicQualityLearningAdjustment([], { plantName: currentData.name }))
      }
    }

    void loadQualityAdjustment()
  }, [activeGarden?.id, currentData.name, storageProvider])

  // Funzione Export PDF con sistema reale
  const exportToPDF = async () => {
    try {
      // Dynamic import del sistema export
      const { downloadPlantReportPDF } = await import('@/lib/reports/exportReportPDF')
      
      const currentData = mockData[selectedCrop as keyof typeof mockData]
      
      // Prepara dati per export
      const reportData = {
        plantName: currentData.name,
        variety: currentData.variety,
        plantingDate: currentData.plantingDate,
        harvestDate: currentData.harvestDate,
        location: currentData.location,
        
        // KPI
        totalCost: currentData.costs.total,
        totalYield: currentData.results.totalYield,
        qualityScore: currentData.results.quality,
        cycleLength: currentData.duration,
        
        // Timeline operazioni (converti formato)
        operations: currentData.operations.map(op => ({
          date: op.date,
          type: op.type,
          description: op.title,
          cost: 0 // Mock - in produzione verrà dal database
        })),
        
        // Analisi costi
        costBreakdown: {
          seeds: currentData.costs.plants,
          fertilizers: currentData.costs.fertilizers,
          treatments: currentData.costs.treatments,
          labor: currentData.costs.preparation,
          water: currentData.costs.irrigation,
          other: 0
        },
        
        // Riepilogo economico
        economicSummary: {
          totalRevenue: currentData.roi.revenue,
          totalCosts: currentData.roi.costs,
          netProfit: currentData.roi.profit,
          roi: currentData.roi.percentage
        }
      }
      
      await downloadPlantReportPDF(reportData)
    } catch (error) {
      console.error('Errore export PDF:', error)
      alert('Errore durante l\'export PDF. Riprova.')
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">📊 Report Storico Piante</h1>
              <p className="text-green-100">Analisi completa delle colture con dati reali</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                <Filter size={18} />
                Filtri
              </button>
              <button 
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                <Download size={18} />
                Esporta PDF
              </button>
            </div>
          </div>
          
          {/* Selettore Coltura */}
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedCrop('pomodoro')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCrop === 'pomodoro'
                  ? 'bg-white text-green-600 font-medium'
                  : 'bg-green-500 text-white hover:bg-green-400'
              }`}
            >
              🍅 Pomodoro San Marzano
            </button>
            <button
              onClick={() => setSelectedCrop('lattuga')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCrop === 'lattuga'
                  ? 'bg-white text-green-600 font-medium'
                  : 'bg-green-500 text-white hover:bg-green-400'
              }`}
            >
              🥬 Lattuga Romana
            </button>
          </div>
        </div>

        {/* FILTRI AVANZATI */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtri Avanzati</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Inizio</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, start: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fine</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, end: e.target.value}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualità Minima</label>
                <select
                  value={filters.minQuality}
                  onChange={(e) => setFilters({...filters, minQuality: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={0}>Tutte</option>
                  <option value={3}>3+ stelle</option>
                  <option value={4}>4+ stelle</option>
                  <option value={qualityTargetRating}>{qualityTargetRating.toFixed(1)}+ target sito</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Operazione</label>
                <select
                  value={filters.operationType}
                  onChange={(e) => setFilters({...filters, operationType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Tutte</option>
                  <option value="Lavorazione">Lavorazioni</option>
                  <option value="Irrigazione">Irrigazioni</option>
                  <option value="Fertilizzazione">Fertilizzazioni</option>
                  <option value="Trattamento">Trattamenti</option>
                  <option value="Raccolta">Raccolti</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFilters({ dateRange: { start: '', end: '' }, minQuality: 0, minYield: 0, operationType: 'all' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filtri
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Applica Filtri
              </button>
            </div>
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-2 bg-white rounded-lg p-2 border border-gray-200">
          {[
            { id: 'summary', label: 'Riepilogo', icon: FileText },
            { id: 'detailed', label: 'Dettagliato', icon: BarChart3 },
            { id: 'comparison', label: 'Confronto', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedReport === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* RIEPILOGO TAB */}
        {selectedReport === 'summary' && (
          <div className="space-y-6">
            
            {/* INFO COLTURA */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Informazioni Coltura</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Coltura</div>
                  <div className="font-semibold text-gray-900">{currentData.name}</div>
                  <div className="text-sm text-gray-500">{currentData.variety}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Posizione</div>
                  <div className="font-semibold text-gray-900 flex items-center gap-1">
                    <MapPin size={14} className="text-green-600" />
                    {currentData.location}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Periodo</div>
                  <div className="font-semibold text-gray-900">{currentData.plantingDate}</div>
                  <div className="text-sm text-gray-500">→ {currentData.harvestDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Durata Ciclo</div>
                  <div className="font-semibold text-gray-900">{currentData.duration} giorni</div>
                  <div className="text-sm text-gray-500">{(currentData.duration / 7).toFixed(1)} settimane</div>
                </div>
              </div>
            </div>

            {/* KPI PRINCIPALI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Award className="text-green-600" size={24} />
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Resa</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{currentData.results.totalYield} kg</div>
                <div className="text-sm text-gray-600">{currentData.results.yieldPerPlant} kg/pianta</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-yellow-600" size={24} />
                  <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Qualità</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{currentData.results.quality}/5 ⭐</div>
                <div className="text-sm text-gray-600">
                  {currentData.results.brix > 0
                    ? `Brix ${currentData.results.brix}°`
                    : 'Benchmark qualità senza Brix'}
                </div>
                <div className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${qualityBenchmarkCopy.badgeClassName}`}>
                  {qualityBenchmarkCopy.badge}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="text-blue-600" size={24} />
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Ricavi</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">€{currentData.results.marketValue}</div>
                <div className="text-sm text-gray-600">€{(currentData.results.marketValue / currentData.results.totalYield).toFixed(1)}/kg</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="text-purple-600" size={24} />
                  <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">ROI</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">+{currentData.roi.percentage}%</div>
                <div className="text-sm text-gray-600">Profitto €{currentData.roi.profit}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Benchmark Qualità Adattivo</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-sm text-gray-600 mb-1">Target sito</div>
                  <div className="text-2xl font-bold text-emerald-700">{qualityTargetRating.toFixed(1)}/5</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="text-sm text-gray-600 mb-1">Soglia allerta</div>
                  <div className="text-2xl font-bold text-amber-700">{qualityAlertFloorRating.toFixed(1)}/5</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Gap attuale</div>
                  <div className={`text-2xl font-bold ${qualityBenchmarkGap >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {qualityBenchmarkGap >= 0 ? '+' : ''}{qualityBenchmarkGap.toFixed(1)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Target Brix</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {qualityAdjustment?.brixTarget ? `${qualityAdjustment.brixTarget}°` : 'n/d'}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${qualityBenchmarkCopy.badgeClassName}`}>
                  {qualityBenchmarkCopy.badge}
                </span>
                <span className={`text-sm font-medium ${qualityBenchmarkCopy.textClassName}`}>
                  {qualityBenchmarkGap >= 0
                    ? `La campagna corrente e allineata o sopra benchmark di ${Math.abs(qualityBenchmarkGap).toFixed(1)} stelle.`
                    : `La campagna corrente e sotto benchmark di ${Math.abs(qualityBenchmarkGap).toFixed(1)} stelle.`}
                </span>
              </div>
              {adaptiveQualityNotes.length > 0 && (
                <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Memoria sito-specifica</div>
                  <div className="space-y-1">
                    {adaptiveQualityNotes.map((note, index) => (
                      <p key={index} className="text-sm text-gray-600">{note}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* TIMELINE OPERAZIONI */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Timeline Operazioni</h2>
              <div className="space-y-3">
                {currentData.operations
                  .filter(op => filters.operationType === 'all' || op.type === filters.operationType)
                  .map((op, idx) => {
                    const Icon = op.icon
                    return (
                      <div key={idx} className={`flex items-start gap-4 p-4 rounded-lg border-l-4 bg-${op.color}-50 border-${op.color}-500`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${op.color}-100 flex items-center justify-center`}>
                          <Icon className={`text-${op.color}-600`} size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{op.title}</h3>
                            <span className="text-sm text-gray-500">{op.date}</span>
                          </div>
                          <p className="text-sm text-gray-600">{op.details}</p>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-${op.color}-100 text-${op.color}-700`}>
                            {op.type}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* ANALISI COSTI E RIEPILOGO ECONOMICO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Analisi Costi</h2>
                <div className="space-y-3">
                  {Object.entries(currentData.costs).map(([key, value]) => {
                    if (key === 'total') return null
                    const labels: Record<string, string> = {
                      preparation: 'Preparazione Terreno',
                      plants: 'Piantine/Semi',
                      fertilizers: 'Fertilizzanti',
                      treatments: 'Trattamenti',
                      irrigation: 'Irrigazione'
                    }
                    const percentage = ((value / currentData.costs.total) * 100).toFixed(0)
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{labels[key]}</span>
                          <span className="font-semibold text-gray-900">€{value}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Totale Costi</span>
                      <span className="text-xl font-bold text-gray-900">€{currentData.costs.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Riepilogo Economico</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Ricavi Totali</span>
                    <span className="text-xl font-bold text-blue-600">€{currentData.roi.revenue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Costi Totali</span>
                    <span className="text-xl font-bold text-red-600">€{currentData.roi.costs}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="font-semibold text-gray-900">Profitto Netto</span>
                    <span className="text-2xl font-bold text-green-600">€{currentData.roi.profit}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <span className="font-semibold text-gray-900">ROI</span>
                    <span className="text-2xl font-bold text-purple-600">+{currentData.roi.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PROBLEMI E SOLUZIONI */}
            {currentData.issues.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🐛 Problemi e Soluzioni</h2>
                <div className="space-y-3">
                  {currentData.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <AlertTriangle className="text-orange-600 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{issue.problem}</h3>
                          <span className="text-sm text-gray-500">{issue.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Gravità:</span>
                            <span className="ml-2 font-medium text-orange-600">{issue.severity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Soluzione:</span>
                            <span className="ml-2 font-medium text-gray-900">{issue.solution}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risolto in:</span>
                            <span className="ml-2 font-medium text-green-600">{issue.daysToResolve} giorno</span>
                          </div>
                        </div>
                        {issue.resolved && (
                          <div className="mt-2 flex items-center gap-2 text-green-600">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Problema Risolto</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATISTICHE AGGIUNTIVE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Camera className="text-blue-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Documentazione</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{currentData.photos}</div>
                <div className="text-sm text-gray-600">Foto Timeline</div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="text-purple-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Operazioni</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{currentData.operations.length}</div>
                <div className="text-sm text-gray-600">Registrazioni Totali</div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="text-green-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Meteo Medio</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{currentData.weather.avgTemp}°C</div>
                <div className="text-sm text-gray-600">{currentData.weather.sunnyDays} giorni sole</div>
              </div>
            </div>

          </div>
        )}

        {/* DETTAGLIATO TAB - CON GRAFICI */}
        {selectedReport === 'detailed' && (
          <div className="space-y-6">
            
            {/* GRAFICO CRESCITA NEL TEMPO */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Crescita nel Tempo</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentData.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Giorni', position: 'insideBottom', offset: -5 }} />
                  <YAxis yAxisId="left" label={{ value: 'Altezza (cm)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Salute (%)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="height" stroke="#10b981" strokeWidth={2} name="Altezza (cm)" />
                  <Line yAxisId="left" type="monotone" dataKey="leaves" stroke="#3b82f6" strokeWidth={2} name="Foglie" />
                  <Line yAxisId="right" type="monotone" dataKey="health" stroke="#f59e0b" strokeWidth={2} name="Salute (%)" />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4">
                Questo grafico mostra l'evoluzione della pianta durante il ciclo di crescita, tracciando altezza, numero di foglie e stato di salute generale.
              </p>
            </div>

            {/* DISTRIBUZIONE COSTI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Distribuzione Costi</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentData.costBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name} ${entry.percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {currentData.costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {currentData.costBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">€{item.value} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESA SETTIMANALE */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🌾 Resa Settimanale</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentData.weeklyYield}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis label={{ value: 'Kg', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="yield" fill="#10b981" name="Resa (kg)" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-4">
                  Distribuzione della resa durante il periodo di raccolta. Utile per pianificare raccolte future.
                </p>
              </div>
            </div>

            {/* TREND QUALITÀ */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⭐ Trend Qualità e Salute</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currentData.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Giorni', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Salute (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="health" stroke="#10b981" fill="#10b98133" name="Salute (%)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Salute Media</div>
                  <div className="text-2xl font-bold text-green-600">
                    {(currentData.growthData.reduce((sum, d) => sum + d.health, 0) / currentData.growthData.length).toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Salute Massima</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.max(...currentData.growthData.map(d => d.health))}%
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Target Qualità Sito</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {qualityTargetRating.toFixed(1)}/5
                  </div>
                </div>
              </div>
            </div>

            {/* METRICHE AVANZATE */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Metriche Avanzate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Efficienza Spazio</div>
                  <div className="text-2xl font-bold text-green-600">
                    {(currentData.results.totalYield / 30).toFixed(2)} kg/m²
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Resa per metro quadro</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Costo per Kg</div>
                  <div className="text-2xl font-bold text-blue-600">
                    €{(currentData.costs.total / currentData.results.totalYield).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Costo di produzione</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Margine Profitto</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {((currentData.roi.profit / currentData.roi.revenue) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Profitto su ricavi</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                  <div className="text-sm text-gray-600 mb-1">Giorni per Kg</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {(currentData.duration / currentData.results.totalYield).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Tempo di produzione</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* CONFRONTO TAB - CONFRONTO TRA CICLI */}
        {selectedReport === 'comparison' && (
          <div className="space-y-6">
            
            {/* INTRO */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">🔄 Confronto Cicli Colturali</h2>
              <p className="text-gray-700">
                Analizza le performance di {currentData.name} attraverso diversi cicli di coltivazione per identificare trend, miglioramenti e aree di ottimizzazione.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg bg-white/70 p-3 border border-blue-100">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Target sito</div>
                  <div className="text-lg font-semibold text-gray-900">{qualityTargetRating.toFixed(1)}/5</div>
                </div>
                <div className="rounded-lg bg-white/70 p-3 border border-blue-100">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Media cicli</div>
                  <div className={`text-lg font-semibold ${averageComparisonQualityGap >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {(averageComparisonQuality).toFixed(1)}/5
                  </div>
                </div>
                <div className="rounded-lg bg-white/70 p-3 border border-blue-100">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Gap medio vs target</div>
                  <div className={`text-lg font-semibold ${averageComparisonQualityGap >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {averageComparisonQualityGap >= 0 ? '+' : ''}{averageComparisonQualityGap.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* TABELLA COMPARATIVA */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Tabella Comparativa</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Ciclo</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-semibold">Resa (kg)</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-semibold">Qualità</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-semibold">Costi (€)</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-semibold">ROI (%)</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-semibold">Durata (gg)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentComparison.map((cycle, idx) => {
                    const isCurrentCycle = idx === 0
                    return (
                      <tr key={idx} className={`border-b border-gray-100 ${isCurrentCycle ? 'bg-green-50' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {isCurrentCycle && <span className="text-green-600">→</span>}
                            <span className="font-medium text-gray-900">{cycle.cycle}</span>
                            {isCurrentCycle && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Attuale</span>}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-gray-900">{cycle.yield}</span>
                          {idx > 0 && (
                            <span className={`ml-2 text-xs ${cycle.yield > currentComparison[0].yield ? 'text-red-600' : 'text-green-600'}`}>
                              {cycle.yield > currentComparison[0].yield ? '↓' : '↑'} {Math.abs(cycle.yield - currentComparison[0].yield).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-gray-900">{cycle.quality}/5</span>
                          <div className={`mt-1 text-xs ${
                            cycle.quality >= qualityTargetRating
                              ? 'text-green-700'
                              : cycle.quality < qualityAlertFloorRating
                                ? 'text-red-700'
                                : 'text-yellow-700'
                          }`}>
                            vs target {cycle.quality >= qualityTargetRating
                              ? `+${(cycle.quality - qualityTargetRating).toFixed(1)}`
                              : `-${(qualityTargetRating - cycle.quality).toFixed(1)}`}
                          </div>
                          {idx > 0 && (
                            <span className={`ml-2 text-xs ${cycle.quality > currentComparison[0].quality ? 'text-red-600' : 'text-green-600'}`}>
                              {cycle.quality > currentComparison[0].quality ? '↓' : '↑'} {Math.abs(cycle.quality - currentComparison[0].quality).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-gray-900">{cycle.costs}</span>
                          {idx > 0 && (
                            <span className={`ml-2 text-xs ${cycle.costs < currentComparison[0].costs ? 'text-red-600' : 'text-green-600'}`}>
                              {cycle.costs < currentComparison[0].costs ? '↑' : '↓'} {Math.abs(cycle.costs - currentComparison[0].costs)}
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-gray-900">+{cycle.roi}%</span>
                          {idx > 0 && (
                            <span className={`ml-2 text-xs ${cycle.roi > currentComparison[0].roi ? 'text-red-600' : 'text-green-600'}`}>
                              {cycle.roi > currentComparison[0].roi ? '↓' : '↑'} {Math.abs(cycle.roi - currentComparison[0].roi)}%
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-gray-900">{cycle.duration}</span>
                          {idx > 0 && (
                            <span className={`ml-2 text-xs ${cycle.duration < currentComparison[0].duration ? 'text-green-600' : 'text-red-600'}`}>
                              {cycle.duration < currentComparison[0].duration ? '↓' : '↑'} {Math.abs(cycle.duration - currentComparison[0].duration)}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* GRAFICI COMPARATIVI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CONFRONTO RESA E QUALITÀ */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🌾 Resa e Qualità</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cycle" />
                    <YAxis yAxisId="left" label={{ value: 'Resa (kg)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Qualità', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="yield" fill="#10b981" name="Resa (kg)" />
                    <Bar yAxisId="right" dataKey="quality" fill="#f59e0b" name="Qualità" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* CONFRONTO COSTI E ROI */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Costi e ROI</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cycle" />
                    <YAxis yAxisId="left" label={{ value: 'Costi (€)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'ROI (%)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="costs" fill="#ef4444" name="Costi (€)" />
                    <Bar yAxisId="right" dataKey="roi" fill="#8b5cf6" name="ROI (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* ANALISI DIFFERENZE */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Analisi Differenze e Miglioramenti</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* MIGLIORAMENTI */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Miglioramenti Rispetto a Benchmark e Best Cycle
                  </h4>
                  <div className="space-y-2">
                    {(() => {
                      const bestCycle = currentComparison.reduce((best, cycle) => cycle.roi > best.roi ? cycle : best, currentComparison[0])
                      const current = currentComparison[0]
                      
                      return (
                        <>
                          {current.yield >= bestCycle.yield && (
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle size={16} />
                              <span>Resa uguale o superiore al miglior ciclo</span>
                            </div>
                          )}
                          {current.quality >= bestCycle.quality && (
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle size={16} />
                              <span>Qualità uguale o superiore al miglior ciclo</span>
                            </div>
                          )}
                          {current.quality >= qualityTargetRating && (
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle size={16} />
                              <span>Qualità sopra il target adattivo del sito</span>
                            </div>
                          )}
                          {current.costs <= bestCycle.costs && (
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle size={16} />
                              <span>Costi ridotti rispetto al miglior ciclo</span>
                            </div>
                          )}
                          {current.roi >= bestCycle.roi && (
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle size={16} />
                              <span>ROI uguale o superiore al miglior ciclo</span>
                            </div>
                          )}
                          {current.duration <= bestCycle.duration && (
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle size={16} />
                              <span>Durata ridotta rispetto al miglior ciclo</span>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* AREE DI OTTIMIZZAZIONE */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Aree di Ottimizzazione
                  </h4>
                  <div className="space-y-2">
                    {(() => {
                      const bestCycle = currentComparison.reduce((best, cycle) => cycle.roi > best.roi ? cycle : best, currentComparison[0])
                      const current = currentComparison[0]
                      const suggestions = []
                      
                      if (current.yield < bestCycle.yield) {
                        suggestions.push(`Resa inferiore di ${(bestCycle.yield - current.yield).toFixed(1)}kg rispetto al miglior ciclo`)
                      }
                      if (current.quality < qualityTargetRating) {
                        suggestions.push(`Qualità sotto target adattivo di ${(qualityTargetRating - current.quality).toFixed(1)} stelle`)
                      }
                      if (current.quality < qualityAlertFloorRating) {
                        suggestions.push(`Qualità sotto la soglia di allerta sito (${qualityAlertFloorRating.toFixed(1)}/5)`)
                      }
                      if (current.quality < bestCycle.quality) {
                        suggestions.push(`Qualità inferiore di ${(bestCycle.quality - current.quality).toFixed(1)} stelle`)
                      }
                      if (current.costs > bestCycle.costs) {
                        suggestions.push(`Costi superiori di €${(current.costs - bestCycle.costs)} rispetto al miglior ciclo`)
                      }
                      if (current.duration > bestCycle.duration) {
                        suggestions.push(`Durata superiore di ${(current.duration - bestCycle.duration)} giorni`)
                      }
                      
                      if (suggestions.length === 0) {
                        return (
                          <div className="text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle size={16} />
                            <span>Questo è il miglior ciclo finora! 🎉</span>
                          </div>
                        )
                      }
                      
                      return suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-yellow-700">
                          <span className="mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </div>
                      ))
                    })()}
                  </div>
                </div>

              </div>
            </div>

            {/* STATISTICHE AGGREGATE */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Statistiche Aggregate</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Resa Media</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(currentComparison.reduce((sum, c) => sum + c.yield, 0) / currentComparison.length).toFixed(1)} kg
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Qualità Media</div>
                  <div className={`text-2xl font-bold ${averageComparisonQuality >= qualityTargetRating ? 'text-green-700' : 'text-gray-900'}`}>
                    {(currentComparison.reduce((sum, c) => sum + c.quality, 0) / currentComparison.length).toFixed(1)}/5
                  </div>
                  <div className={`text-xs mt-1 ${averageComparisonQualityGap >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {averageComparisonQualityGap >= 0 ? '+' : ''}{averageComparisonQualityGap.toFixed(1)} vs target
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Costi Medi</div>
                  <div className="text-2xl font-bold text-gray-900">
                    €{(currentComparison.reduce((sum, c) => sum + c.costs, 0) / currentComparison.length).toFixed(0)}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">ROI Medio</div>
                  <div className="text-2xl font-bold text-gray-900">
                    +{(currentComparison.reduce((sum, c) => sum + c.roi, 0) / currentComparison.length).toFixed(0)}%
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Durata Media</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(currentComparison.reduce((sum, c) => sum + c.duration, 0) / currentComparison.length).toFixed(0)} gg
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
