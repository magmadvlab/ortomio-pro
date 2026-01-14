/**
 * Unified Timeline Diary - Diario con Timeline Esistenti
 * 
 * Riutilizza i componenti timeline già ben progettati:
 * - TimelineView per operazioni agricole
 * - PhotoTimeline per documentazione fotografica  
 * - PlantLifecycleTimeline per cicli colturali
 * - Integrazione intelligente con AI e analytics
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Eye,
  Camera,
  BarChart3,
  MessageSquare,
  Clock,
  Target,
  Leaf,
  Activity,
  FileText,
  Download
} from 'lucide-react'
import { TimelineView } from '@/components/garden/TimelineView'
import { PhotoTimeline } from '@/components/photo/PhotoTimeline'
import { PlantLifecycleTimeline } from '@/components/planner/PlantLifecycleTimeline'
import DiaryPlannerIntegration from './DiaryPlannerIntegration'
import { operationalDiaryService } from '@/services/operationalDiaryService'

interface UnifiedTimelineDiaryProps {
  gardenId: string
  garden?: any
  tasks?: any[]
}

interface DiaryEntry {
  id: string
  date: string
  type: 'operation' | 'observation' | 'result' | 'issue'
  category: string
  title: string
  description: string
  plantName?: string
  location?: string
  weather?: any
  photos?: string[]
  performance?: {
    effectiveness: number
    efficiency: number
    quality: number
  }
  correlations?: string[]
  aiInsights?: string[]
}

export default function UnifiedTimelineDiary({ 
  gardenId, 
  garden, 
  tasks = [] 
}: UnifiedTimelineDiaryProps) {
  const [activeView, setActiveView] = useState<'timeline' | 'photos' | 'lifecycle' | 'analytics'>('timeline')
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateRange: 'last30',
    category: 'all',
    plantName: 'all'
  })

  useEffect(() => {
    loadDiaryData()
  }, [gardenId, filters])

  const loadDiaryData = async () => {
    setLoading(true)
    try {
      // Carica entries dal servizio esistente
      const diaryEntries = await operationalDiaryService.getEntries(gardenId, {
        dateRange: getDateRangeFromFilter(filters.dateRange),
        category: filters.category !== 'all' ? filters.category : undefined,
        plantName: filters.plantName !== 'all' ? filters.plantName : undefined
      })
      
      setEntries(diaryEntries)
      
      // Estrai foto dalle entries
      const photoEntries = diaryEntries
        .filter(entry => entry.photos && entry.photos.length > 0)
        .flatMap(entry => 
          entry.photos!.map(photoUrl => ({
            id: `${entry.id}-${photoUrl}`,
            url: photoUrl,
            date: new Date(entry.date),
            plantName: entry.plantName,
            notes: entry.title
          }))
        )
      
      setPhotos(photoEntries)
      
    } catch (error) {
      console.error('Error loading diary data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRangeFromFilter = (filter: string) => {
    const today = new Date()
    const ranges: Record<string, { start: string; end: string }> = {
      last7: {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      last30: {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      last90: {
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    }
    return ranges[filter] || ranges.last30
  }

  // Converti entries in tasks per TimelineView
  const convertEntriesToTasks = () => {
    return entries
      .filter(entry => entry.type === 'operation')
      .map(entry => ({
        id: entry.id,
        plantName: entry.plantName || 'Generico',
        taskType: mapCategoryToTaskType(entry.category),
        date: entry.date,
        completed: entry.performance ? entry.performance.effectiveness > 80 : false,
        variety: '',
        description: entry.description
      }))
  }

  const mapCategoryToTaskType = (category: string) => {
    const mapping: Record<string, string> = {
      'seeding': 'Sowing',
      'transplant': 'Transplant', 
      'harvest': 'Harvest',
      'irrigation': 'Watering',
      'fertilization': 'Fertilizing',
      'treatment': 'Treatment',
      'pruning': 'Pruning'
    }
    return mapping[category] || 'Other'
  }

  // Ottieni piante uniche per lifecycle timeline
  const getUniqueePlants = () => {
    const plants = [...new Set(entries.map(e => e.plantName).filter(Boolean))]
    return plants.slice(0, 3) // Mostra solo le prime 3 piante
  }

  const renderViewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Caricamento diario...</span>
        </div>
      )
    }

    switch (activeView) {
      case 'timeline':
        return (
          <TimelineView
            garden={garden}
            tasks={convertEntriesToTasks()}
            onUpdateTask={() => {}}
          />
        )
      
      case 'photos':
        return <PhotoTimeline photos={photos} />
      
      case 'lifecycle':
        return (
          <div className="space-y-6">
            {getUniqueePlants().map(plantName => (
              <PlantLifecycleTimeline
                key={plantName}
                plantName={plantName}
                sowingMonths={[2, 3, 4]} // Esempio: Mar-Apr-Mag
                transplantMonths={[4, 5]} // Esempio: Mag-Giu
                harvestMonths={[7, 8, 9]} // Esempio: Ago-Set-Ott
              />
            ))}
            {getUniqueePlants().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Leaf size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nessuna pianta registrata nel diario</p>
              </div>
            )}
          </div>
        )
      
      case 'analytics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Analytics Cards */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="text-green-600" size={20} />
                <h3 className="font-semibold text-gray-900">Performance Operazioni</h3>
              </div>
              <div className="space-y-3">
                {entries.slice(0, 5).map(entry => (
                  <div key={entry.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{entry.title}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${entry.performance?.effectiveness || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {entry.performance?.effectiveness || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-blue-600" size={20} />
                <h3 className="font-semibold text-gray-900">Attività Recenti</h3>
              </div>
              <div className="space-y-3">
                {entries.slice(0, 5).map(entry => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString('it-IT')}
                        {entry.plantName && ` • ${entry.plantName}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="text-green-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Diario Operativo</h2>
              <p className="text-sm text-gray-600">Timeline unificata e intelligente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus size={16} />
              Nuova Entry
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'timeline', label: 'Timeline', icon: Calendar },
            { key: 'photos', label: 'Foto', icon: Camera },
            { key: 'lifecycle', label: 'Cicli', icon: Leaf },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === key
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="last7">Ultimi 7 giorni</option>
            <option value="last30">Ultimi 30 giorni</option>
            <option value="last90">Ultimi 90 giorni</option>
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tutte le categorie</option>
            <option value="seeding">Semine</option>
            <option value="irrigation">Irrigazione</option>
            <option value="fertilization">Fertilizzazione</option>
            <option value="treatment">Trattamenti</option>
            <option value="harvest">Raccolti</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {renderViewContent()}
      </div>

      {/* AI Integration */}
      <DiaryPlannerIntegration
        gardenId={gardenId}
        garden={garden}
        tasks={tasks}
      />
    </div>
  )
}