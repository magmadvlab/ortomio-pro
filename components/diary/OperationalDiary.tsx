/**
 * Operational Diary - Diario Operativo Intelligente
 * Sistema unificato per memorizzare e visualizzare tutti i risultati nel tempo
 * 
 * Funzionalità:
 * - Timeline unificata di tutte le operazioni
 * - Memorizzazione automatica dei risultati
 * - Analisi trend e correlazioni
 * - Integrazione con Planner AI
 * - Export per compliance e certificazioni
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Thermometer,
  Droplets,
  Leaf,
  Bug,
  Scissors,
  Eye,
  Download,
  Filter,
  Search,
  Plus,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  ArrowRight,
  Calendar as CalendarIcon,
  FileText,
  Camera,
  MessageSquare
} from 'lucide-react'
import DiaryPlannerIntegration from './DiaryPlannerIntegration'
import LazyLoader from '../shared/LazyLoader'

export interface DiaryEntry {
  id: string
  date: string
  time: string
  type: 'operation' | 'observation' | 'result' | 'issue' | 'milestone' | 'weather' | 'ai_suggestion'
  category: 'seeding' | 'growth' | 'care' | 'protection' | 'harvest' | 'analysis' | 'planning'
  title: string
  description: string
  
  // Dati operazione
  operationData?: {
    plantId?: string
    plantName?: string
    area?: string
    duration?: number // minuti
    cost?: number
    materials?: string[]
    weather?: {
      temperature: number
      humidity: number
      conditions: string
    }
  }
  
  // Risultati misurabili
  results?: {
    quantitative?: {
      yield?: number // kg
      quality?: number // 1-5
      healthScore?: number // 0-100
      growth?: number // cm
      survival?: number // %
    }
    qualitative?: {
      appearance?: string
      issues?: string[]
      improvements?: string[]
      notes?: string
    }
  }
  
  // Metadati
  gpsLocation?: { lat: number; lng: number }
  photos?: string[]
  verified: boolean
  aiGenerated?: boolean
  correlatedEntries?: string[] // IDs di entry correlate
  tags?: string[]
  
  // Performance tracking
  performance?: {
    efficiency: number // 0-100
    effectiveness: number // 0-100
    roi: number // %
    timeToResult: number // giorni
  }
}

interface OperationalDiaryProps {
  gardenId: string
  onEntryAdded?: (entry: DiaryEntry) => void
}

export default function OperationalDiary({ gardenId, onEntryAdded }: OperationalDiaryProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'analytics' | 'trends'>('timeline')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    // Caricamento rapido iniziale
    loadDiaryEntries()
    
    // Calcola analytics in background dopo il render
    setTimeout(() => {
      calculateAnalytics()
    }, 100)
  }, [gardenId])

  useEffect(() => {
    applyFilters()
  }, [entries, filterType, filterCategory, searchQuery, dateRange])

  const loadDiaryEntries = async () => {
    // Carica entries dal database - per ora mock data
    const mockEntries: DiaryEntry[] = [
      {
        id: '1',
        date: '2026-01-12',
        time: '09:30',
        type: 'operation',
        category: 'seeding',
        title: 'Semina Pomodori San Marzano',
        description: 'Seminati 24 semi di pomodoro San Marzano in semenzaio riscaldato',
        operationData: {
          plantName: 'Pomodoro San Marzano',
          area: 'Semenzaio A',
          duration: 45,
          cost: 12.50,
          materials: ['Semi San Marzano', 'Terriccio bio', 'Vasetti 8cm'],
          weather: { temperature: 18, humidity: 65, conditions: 'Nuvoloso' }
        },
        results: {
          quantitative: { survival: 100 },
          qualitative: { 
            appearance: 'Semi di ottima qualità, terriccio ben preparato',
            notes: 'Temperatura semenzaio mantenuta a 22°C'
          }
        },
        verified: true,
        tags: ['pomodori', 'semina', 'biologico'],
        performance: { efficiency: 95, effectiveness: 90, roi: 0, timeToResult: 7 }
      },
      {
        id: '2',
        date: '2026-01-10',
        time: '14:15',
        type: 'observation',
        category: 'growth',
        title: 'Controllo Germinazione Lattuga',
        description: 'Verifica stato germinazione lattuga seminata il 5 gennaio',
        operationData: {
          plantName: 'Lattuga Romana',
          area: 'Aiuola B',
          duration: 15
        },
        results: {
          quantitative: { survival: 85, healthScore: 88 },
          qualitative: {
            appearance: 'Germinazione uniforme, piantine vigorose',
            improvements: ['Aumentare irrigazione nelle ore serali'],
            notes: 'Alcune piantine mostrano crescita più lenta nel settore nord'
          }
        },
        verified: true,
        tags: ['lattuga', 'germinazione', 'controllo'],
        performance: { efficiency: 88, effectiveness: 85, roi: 0, timeToResult: 5 }
      },
      {
        id: '3',
        date: '2026-01-08',
        time: '16:45',
        type: 'result',
        category: 'harvest',
        title: 'Raccolto Spinaci Invernali',
        description: 'Primo raccolto degli spinaci seminati a novembre',
        operationData: {
          plantName: 'Spinaci Gigante d\'Inverno',
          area: 'Tunnel 1',
          duration: 60,
          cost: 0
        },
        results: {
          quantitative: { yield: 3.2, quality: 4, healthScore: 92 },
          qualitative: {
            appearance: 'Foglie tenere e saporite, colore verde intenso',
            notes: 'Resa superiore alle aspettative grazie al tunnel'
          }
        },
        verified: true,
        tags: ['spinaci', 'raccolto', 'tunnel', 'inverno'],
        performance: { efficiency: 92, effectiveness: 95, roi: 280, timeToResult: 65 }
      },
      {
        id: '4',
        date: '2026-01-07',
        time: '11:20',
        type: 'ai_suggestion',
        category: 'planning',
        title: 'Suggerimento AI: Rotazione Colture',
        description: 'L\'AI ha analizzato i dati storici e suggerisce una rotazione ottimale',
        results: {
          qualitative: {
            improvements: [
              'Piantare leguminose nell\'aiuola A dopo i pomodori',
              'Preparare l\'aiuola B per brassicacee in marzo',
              'Considerare sovescio con senape nell\'aiuola C'
            ],
            notes: 'Analisi basata su 3 anni di dati storici del giardino'
          }
        },
        verified: false,
        aiGenerated: true,
        tags: ['ai', 'rotazione', 'pianificazione'],
        performance: { efficiency: 0, effectiveness: 0, roi: 0, timeToResult: 0 }
      },
      {
        id: '5',
        date: '2026-01-05',
        time: '08:00',
        type: 'issue',
        category: 'protection',
        title: 'Problema: Afidi su Fave',
        description: 'Rilevata presenza di afidi neri sulle fave in tunnel',
        operationData: {
          plantName: 'Fave Aguadulce',
          area: 'Tunnel 2',
          duration: 30
        },
        results: {
          quantitative: { healthScore: 65 },
          qualitative: {
            appearance: 'Colonie di afidi sui germogli apicali',
            issues: ['Infestazione afidi', 'Stress idrico'],
            improvements: ['Trattamento con sapone molle', 'Regolare irrigazione']
          }
        },
        verified: true,
        tags: ['fave', 'afidi', 'problema', 'tunnel'],
        performance: { efficiency: 70, effectiveness: 60, roi: -15, timeToResult: 1 }
      }
    ]
    
    setEntries(mockEntries)
  }

  const calculateAnalytics = () => {
    // Calcola analytics sui dati del diario
    const analytics = {
      totalEntries: entries.length,
      operationsCount: entries.filter(e => e.type === 'operation').length,
      resultsCount: entries.filter(e => e.type === 'result').length,
      issuesCount: entries.filter(e => e.type === 'issue').length,
      
      averageEfficiency: entries
        .filter(e => e.performance?.efficiency)
        .reduce((sum, e) => sum + (e.performance?.efficiency || 0), 0) / 
        entries.filter(e => e.performance?.efficiency).length || 0,
        
      totalROI: entries
        .filter(e => e.performance?.roi)
        .reduce((sum, e) => sum + (e.performance?.roi || 0), 0),
        
      topPerformingOperations: entries
        .filter(e => e.performance?.effectiveness && e.performance.effectiveness > 85)
        .sort((a, b) => (b.performance?.effectiveness || 0) - (a.performance?.effectiveness || 0))
        .slice(0, 5),
        
      recentTrends: {
        efficiency: calculateTrend(entries, 'efficiency'),
        effectiveness: calculateTrend(entries, 'effectiveness'),
        issues: calculateIssueTrend(entries)
      }
    }
    
    setAnalytics(analytics)
  }

  const calculateTrend = (entries: DiaryEntry[], metric: 'efficiency' | 'effectiveness') => {
    const recent = entries
      .filter(e => e.performance?.[metric])
      .slice(-10)
      .map(e => e.performance?.[metric] || 0)
    
    if (recent.length < 2) return 0
    
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2))
    const secondHalf = recent.slice(Math.floor(recent.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    
    return secondAvg - firstAvg
  }

  const calculateIssueTrend = (entries: DiaryEntry[]) => {
    const recent = entries
      .filter(e => e.type === 'issue')
      .slice(-30)
    
    const thisWeek = recent.filter(e => 
      new Date(e.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    
    const lastWeek = recent.filter(e => {
      const date = new Date(e.date)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      return date <= weekAgo && date > twoWeeksAgo
    }).length
    
    return thisWeek - lastWeek
  }

  const applyFilters = () => {
    let filtered = entries

    // Filtro per tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType)
    }

    // Filtro per categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter(e => e.category === filterCategory)
    }

    // Filtro per ricerca
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filtro per data
    filtered = filtered.filter(e => {
      const entryDate = new Date(e.date)
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      return entryDate >= startDate && entryDate <= endDate
    })

    // Ordina per data (più recenti prima)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })

    setFilteredEntries(filtered)
  }

  const getEntryIcon = (entry: DiaryEntry) => {
    switch (entry.type) {
      case 'operation':
        switch (entry.category) {
          case 'seeding': return <Leaf className="text-green-600" size={20} />
          case 'care': return <Droplets className="text-blue-600" size={20} />
          case 'protection': return <Bug className="text-red-600" size={20} />
          case 'harvest': return <Award className="text-orange-600" size={20} />
          default: return <Activity className="text-gray-600" size={20} />
        }
      case 'observation': return <Eye className="text-purple-600" size={20} />
      case 'result': return <Target className="text-green-600" size={20} />
      case 'issue': return <AlertTriangle className="text-red-600" size={20} />
      case 'milestone': return <Star className="text-yellow-600" size={20} />
      case 'ai_suggestion': return <Zap className="text-indigo-600" size={20} />
      default: return <FileText className="text-gray-600" size={20} />
    }
  }

  const getEntryColor = (entry: DiaryEntry) => {
    switch (entry.type) {
      case 'operation': return 'border-l-blue-500 bg-blue-50'
      case 'observation': return 'border-l-purple-500 bg-purple-50'
      case 'result': return 'border-l-green-500 bg-green-50'
      case 'issue': return 'border-l-red-500 bg-red-50'
      case 'milestone': return 'border-l-yellow-500 bg-yellow-50'
      case 'ai_suggestion': return 'border-l-indigo-500 bg-indigo-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatPerformance = (performance?: DiaryEntry['performance']) => {
    if (!performance) return null
    
    return (
      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Efficienza:</span>
          <span className={`font-medium ${
            performance.efficiency >= 80 ? 'text-green-600' :
            performance.efficiency >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {performance.efficiency}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Efficacia:</span>
          <span className={`font-medium ${
            performance.effectiveness >= 80 ? 'text-green-600' :
            performance.effectiveness >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {performance.effectiveness}%
          </span>
        </div>
        {performance.roi !== 0 && (
          <div className="flex items-center gap-1 col-span-2">
            <span className="text-gray-600">ROI:</span>
            <span className={`font-medium ${
              performance.roi > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {performance.roi > 0 ? '+' : ''}{performance.roi}%
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-blue-900">
                📖 Diario Operativo Intelligente
              </h2>
              <p className="text-blue-700">
                Memorizza e analizza tutti i risultati nel tempo
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Nuova Registrazione
          </button>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalEntries}</div>
              <div className="text-sm text-gray-600">Registrazioni Totali</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(analytics.averageEfficiency)}%
              </div>
              <div className="text-sm text-gray-600">Efficienza Media</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analytics.totalROI > 0 ? '+' : ''}{Math.round(analytics.totalROI)}%
              </div>
              <div className="text-sm text-gray-600">ROI Totale</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.issuesCount}</div>
              <div className="text-sm text-gray-600">Problemi Risolti</div>
            </div>
          </div>
        )}
      </div>

      {/* View Mode Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'trends', label: 'Trend', icon: TrendingUp }
        ].map(mode => {
          const Icon = mode.icon
          const isActive = viewMode === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} />
              {mode.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti</option>
              <option value="operation">Operazioni</option>
              <option value="observation">Osservazioni</option>
              <option value="result">Risultati</option>
              <option value="issue">Problemi</option>
              <option value="ai_suggestion">Suggerimenti AI</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutte</option>
              <option value="seeding">Semina</option>
              <option value="growth">Crescita</option>
              <option value="care">Cura</option>
              <option value="protection">Protezione</option>
              <option value="harvest">Raccolto</option>
              <option value="analysis">Analisi</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ricerca
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periodo
            </label>
            <select
              onChange={(e) => {
                const days = parseInt(e.target.value)
                setDateRange({
                  start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0]
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Ultima settimana</option>
              <option value="30">Ultimo mese</option>
              <option value="90">Ultimi 3 mesi</option>
              <option value="365">Ultimo anno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {/* AI Integration con lazy loading */}
          <LazyLoader delay={100}>
            <DiaryPlannerIntegration
              gardenId={gardenId}
              garden={{ id: gardenId, name: 'Il Mio Orto' }}
              tasks={[]}
            />
          </LazyLoader>
          
          {/* Timeline Entries */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Cronologia Dettagliata</h3>
            </div>
            
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={`bg-white rounded-xl border-l-4 ${getEntryColor(entry)} p-6 hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getEntryIcon(entry)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                      {entry.aiGenerated && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          AI
                        </span>
                      )}
                      {entry.verified && (
                        <CheckCircle className="text-green-600" size={16} />
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{entry.description}</p>
                    
                    {/* Operation Data */}
                    {entry.operationData && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        {entry.operationData.plantName && (
                          <div className="flex items-center gap-1">
                            <Leaf size={14} className="text-green-600" />
                            <span className="text-gray-600">Pianta:</span>
                            <span className="font-medium">{entry.operationData.plantName}</span>
                          </div>
                        )}
                        {entry.operationData.area && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-blue-600" />
                            <span className="text-gray-600">Area:</span>
                            <span className="font-medium">{entry.operationData.area}</span>
                          </div>
                        )}
                        {entry.operationData.duration && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-purple-600" />
                            <span className="text-gray-600">Durata:</span>
                            <span className="font-medium">{entry.operationData.duration}min</span>
                          </div>
                        )}
                        {entry.operationData.cost && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Costo:</span>
                            <span className="font-medium">€{entry.operationData.cost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Results */}
                    {entry.results && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        {entry.results.quantitative && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 text-sm">
                            {entry.results.quantitative.yield && (
                              <div>
                                <span className="text-gray-600">Resa:</span>
                                <span className="ml-1 font-medium text-green-600">
                                  {entry.results.quantitative.yield}kg
                                </span>
                              </div>
                            )}
                            {entry.results.quantitative.quality && (
                              <div>
                                <span className="text-gray-600">Qualità:</span>
                                <span className="ml-1 font-medium text-yellow-600">
                                  {entry.results.quantitative.quality}/5 ⭐
                                </span>
                              </div>
                            )}
                            {entry.results.quantitative.healthScore && (
                              <div>
                                <span className="text-gray-600">Salute:</span>
                                <span className="ml-1 font-medium text-blue-600">
                                  {entry.results.quantitative.healthScore}%
                                </span>
                              </div>
                            )}
                            {entry.results.quantitative.survival && (
                              <div>
                                <span className="text-gray-600">Sopravvivenza:</span>
                                <span className="ml-1 font-medium text-purple-600">
                                  {entry.results.quantitative.survival}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {entry.results.qualitative?.improvements && (
                          <div className="text-sm">
                            <span className="text-gray-600 font-medium">Miglioramenti:</span>
                            <ul className="list-disc list-inside ml-2 text-green-700">
                              {entry.results.qualitative.improvements.map((improvement, idx) => (
                                <li key={idx}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Performance */}
                    {formatPerformance(entry.performance)}
                    
                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {entry.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500 flex-shrink-0">
                  <div>{new Date(entry.date).toLocaleDateString('it-IT')}</div>
                  <div>{entry.time}</div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nessuna registrazione trovata</p>
              <p className="text-sm">Modifica i filtri o aggiungi una nuova registrazione</p>
            </div>
          )}
            </div>
          </div>
        </div>
      )}

      {/* Other view modes placeholder */}
      {viewMode !== 'timeline' && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            {viewMode === 'calendar' && <CalendarIcon size={48} className="mx-auto" />}
            {viewMode === 'analytics' && <BarChart3 size={48} className="mx-auto" />}
            {viewMode === 'trends' && <TrendingUp size={48} className="mx-auto" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Vista {viewMode} in sviluppo
          </h3>
          <p className="text-gray-600">
            Questa funzionalità sarà disponibile nella prossima versione
          </p>
        </div>
      )}
    </div>
  )
}