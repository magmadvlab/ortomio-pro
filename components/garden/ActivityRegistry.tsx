/**
 * ActivityRegistry - Registro completo delle attività dell'orto
 * Sistema per visualizzare, filtrare e analizzare tutte le attività registrate
 */

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  Edit3, 
  Trash2,
  Clock,
  MapPin,
  User,
  Camera,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  Leaf,
  Droplets,
  Scissors,
  Package,
  Bug,
  Thermometer,
  X,
  ChefHat,
  Sparkles
} from 'lucide-react'
import { GardenTask } from '@/types'
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import { it } from 'date-fns/locale'

interface ActivityRecord {
  id: string
  date: string
  type: 'task' | 'observation' | 'harvest' | 'treatment' | 'photo' | 'note'
  category: string
  title: string
  description: string
  plantName?: string
  location?: string
  weather?: {
    temperature: number
    humidity: number
    conditions: string
  }
  photos?: string[]
  quantity?: number
  unit?: string
  cost?: number
  duration?: number // minuti
  operator?: string
  notes?: string
  completed: boolean
  completedAt?: string
  linkedTaskId?: string
}

interface ActivityRegistryProps {
  tasks?: GardenTask[]
  onTaskUpdate?: (task: GardenTask) => void
  onExportData?: () => void
}

export default function ActivityRegistry({
  tasks = [],
  onTaskUpdate,
  onExportData
}: ActivityRegistryProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'))
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'stats'>('list')

  // Converti tasks in activity records
  useEffect(() => {
    const activityRecords: ActivityRecord[] = tasks.map(task => ({
      id: task.id,
      date: task.actualCompletedDate || task.date,
      type: 'task',
      category: getTaskCategory(task.taskType),
      title: `${task.taskType} - ${task.plantName}`,
      description: task.notes || `${task.taskType} per ${task.plantName}`,
      plantName: task.plantName,
      location: (task as any).location || 'Non specificata',
      quantity: (task as any).quantity,
      unit: (task as any).unit,
      duration: (task as any).estimatedDuration,
      operator: (task as any).assignedTo || 'Utente',
      notes: task.notes,
      completed: task.completed,
      completedAt: task.actualCompletedDate,
      linkedTaskId: task.id
    }))

    // Aggiungi attività simulate per demo
    const simulatedActivities: ActivityRecord[] = [
      {
        id: 'obs-1',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'observation',
        category: 'Monitoraggio',
        title: 'Controllo stato piante',
        description: 'Controllo generale dello stato di salute delle piante',
        plantName: 'Pomodori',
        location: 'Aiuola A',
        weather: {
          temperature: 22,
          humidity: 65,
          conditions: 'Soleggiato'
        },
        photos: ['/api/placeholder/300/200'],
        duration: 30,
        operator: 'Utente',
        notes: 'Piante in buona salute, crescita regolare',
        completed: true,
        completedAt: new Date().toISOString()
      },
      {
        id: 'harvest-1',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'harvest',
        category: 'Raccolta',
        title: 'Raccolta lattuga',
        description: 'Prima raccolta di lattuga della stagione',
        plantName: 'Lattuga',
        location: 'Aiuola B',
        quantity: 2.5,
        unit: 'kg',
        duration: 45,
        operator: 'Utente',
        notes: 'Qualità ottima, foglie croccanti',
        completed: true,
        completedAt: new Date().toISOString()
      }
    ]

    setActivities([...activityRecords, ...simulatedActivities])
  }, [tasks])

  // Filtra attività
  useEffect(() => {
    let filtered = activities

    // Filtro per tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType)
    }

    // Filtro per mese
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-')
      const monthStart = startOfMonth(new Date(parseInt(year), parseInt(month) - 1))
      const monthEnd = endOfMonth(new Date(parseInt(year), parseInt(month) - 1))
      
      filtered = filtered.filter(activity => {
        const activityDate = parseISO(activity.date)
        return isWithinInterval(activityDate, { start: monthStart, end: monthEnd })
      })
    }

    // Filtro per ricerca
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.plantName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Ordina per data (più recenti prima)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredActivities(filtered)
  }, [activities, selectedType, selectedMonth, searchQuery])

  const getTaskCategory = (taskType: string): string => {
    const categories: Record<string, string> = {
      'Sowing': 'Semina',
      'Transplant': 'Trapianto',
      'Irrigation': 'Irrigazione',
      'Fertilization': 'Concimazione',
      'Pruning': 'Potatura',
      'Harvest': 'Raccolta',
      'Treatment': 'Trattamento',
      'Weeding': 'Diserbo',
      'Mulching': 'Pacciamatura',
      'Tilling': 'Lavorazione'
    }
    return categories[taskType] || taskType
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'task': Activity,
      'observation': Eye,
      'harvest': Package,
      'treatment': Bug,
      'photo': Camera,
      'note': FileText
    }
    const Icon = icons[type] || Activity
    return <Icon size={16} />
  }

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'task': 'bg-blue-100 text-blue-700',
      'observation': 'bg-green-100 text-green-700',
      'harvest': 'bg-orange-100 text-orange-700',
      'treatment': 'bg-red-100 text-red-700',
      'photo': 'bg-purple-100 text-purple-700',
      'note': 'bg-gray-100 text-gray-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const calculateStats = () => {
    const stats = {
      totalActivities: filteredActivities.length,
      completedTasks: filteredActivities.filter(a => a.completed).length,
      totalHarvest: filteredActivities
        .filter(a => a.type === 'harvest' && a.quantity)
        .reduce((sum, a) => sum + (a.quantity || 0), 0),
      totalDuration: filteredActivities
        .filter(a => a.duration)
        .reduce((sum, a) => sum + (a.duration || 0), 0),
      byType: activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
    return stats
  }

  const stats = calculateStats()

  const handleActivityClick = (activity: ActivityRecord) => {
    setSelectedActivity(activity)
    setShowDetails(true)
  }

  const handleExport = () => {
    if (onExportData) {
      onExportData()
    } else {
      // Export CSV semplice
      const csvData = filteredActivities.map(activity => ({
        Data: format(parseISO(activity.date), 'dd/MM/yyyy'),
        Tipo: activity.type,
        Categoria: activity.category,
        Titolo: activity.title,
        Pianta: activity.plantName || '',
        Ubicazione: activity.location || '',
        Quantità: activity.quantity || '',
        Unità: activity.unit || '',
        Durata: activity.duration ? `${activity.duration} min` : '',
        Operatore: activity.operator || '',
        Note: activity.notes || ''
      }))
      
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registro-attivita-${selectedMonth}.csv`
      a.click()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              📋 Registro Attività
            </h2>
            <p className="text-gray-600 mt-1">
              Cronologia completa di tutte le attività dell'orto
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'list', icon: FileText, label: 'Lista' },
                { id: 'timeline', icon: Clock, label: 'Timeline' },
                { id: 'stats', icon: BarChart3, label: 'Statistiche' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <mode.icon size={16} />
                  {mode.label}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={16} />
              Esporta
            </button>
          </div>
        </div>

        {/* Filtri */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cerca attività..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtro Tipo */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Tutti i tipi</option>
            <option value="task">Task</option>
            <option value="observation">Osservazioni</option>
            <option value="harvest">Raccolti</option>
            <option value="treatment">Trattamenti</option>
            <option value="photo">Foto</option>
            <option value="note">Note</option>
          </select>

          {/* Filtro Mese */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          {/* Statistiche rapide */}
          <div className="text-sm text-gray-600">
            <div className="font-semibold">{stats.totalActivities} attività</div>
            <div>{stats.completedTasks} completate</div>
          </div>
        </div>
      </div>

      {/* Statistiche */}
      {viewMode === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Activity className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-blue-600">Attività Totali</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalActivities}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-green-600">Raccolto Totale</p>
                <p className="text-2xl font-bold text-green-700">{stats.totalHarvest.toFixed(1)} kg</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="text-orange-600" size={20} />
              <div>
                <p className="text-sm text-orange-600">Tempo Investito</p>
                <p className="text-2xl font-bold text-orange-700">{Math.round(stats.totalDuration / 60)}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-purple-600" size={20} />
              <div>
                <p className="text-sm text-purple-600">Completamento</p>
                <p className="text-2xl font-bold text-purple-700">
                  {Math.round((stats.completedTasks / stats.totalActivities) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista Attività */}
      {(viewMode === 'list' || viewMode === 'timeline') && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attività Registrate ({filteredActivities.length})
            </h3>
            
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nessuna attività trovata</p>
                <p className="text-sm">Modifica i filtri per vedere più risultati</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map(activity => (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                            {getTypeIcon(activity.type)}
                            {activity.category}
                          </span>
                          
                          <span className="text-sm text-gray-500">
                            {format(parseISO(activity.date), 'dd MMM yyyy', { locale: it })}
                          </span>
                          
                          {activity.completed && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Completata
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {activity.plantName && (
                            <span className="flex items-center gap-1">
                              <Leaf size={12} />
                              {activity.plantName}
                            </span>
                          )}
                          
                          {activity.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {activity.location}
                            </span>
                          )}
                          
                          {activity.quantity && (
                            <span className="flex items-center gap-1">
                              <Package size={12} />
                              {activity.quantity} {activity.unit}
                            </span>
                          )}
                          
                          {activity.duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {activity.duration} min
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {activity.photos && activity.photos.length > 0 && (
                          <Camera size={16} className="text-gray-400" />
                        )}
                        <Eye size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Dettagli Attività */}
      {showDetails && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedActivity.title}</h3>
                  <p className="text-gray-600 mt-1">
                    {format(parseISO(selectedActivity.date), 'EEEE d MMMM yyyy', { locale: it })}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Descrizione</h4>
                  <p className="text-gray-700">{selectedActivity.description}</p>
                </div>
                
                {selectedActivity.plantName && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Pianta</h4>
                    <p className="text-gray-700">{selectedActivity.plantName}</p>
                  </div>
                )}
                
                {selectedActivity.location && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ubicazione</h4>
                    <p className="text-gray-700">{selectedActivity.location}</p>
                  </div>
                )}
                
                {selectedActivity.weather && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Condizioni Meteo</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Thermometer size={16} className="text-blue-600" />
                          {selectedActivity.weather.temperature}°C
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplets size={16} className="text-blue-600" />
                          {selectedActivity.weather.humidity}%
                        </span>
                        <span>{selectedActivity.weather.conditions}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedActivity.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Note</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedActivity.notes}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedActivity.quantity && (
                    <div>
                      <span className="font-medium text-gray-900">Quantità:</span>
                      <span className="ml-2 text-gray-700">{selectedActivity.quantity} {selectedActivity.unit}</span>
                    </div>
                  )}
                  
                  {selectedActivity.duration && (
                    <div>
                      <span className="font-medium text-gray-900">Durata:</span>
                      <span className="ml-2 text-gray-700">{selectedActivity.duration} minuti</span>
                    </div>
                  )}
                  
                  {selectedActivity.operator && (
                    <div>
                      <span className="font-medium text-gray-900">Operatore:</span>
                      <span className="ml-2 text-gray-700">{selectedActivity.operator}</span>
                    </div>
                  )}
                  
                  {selectedActivity.completedAt && (
                    <div>
                      <span className="font-medium text-gray-900">Completata:</span>
                      <span className="ml-2 text-gray-700">
                        {format(parseISO(selectedActivity.completedAt), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}