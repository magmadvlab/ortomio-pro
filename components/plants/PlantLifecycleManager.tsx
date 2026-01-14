/**
 * Plant Lifecycle Manager
 * Gestione completa del ciclo di vita di ogni singola pianta
 * 
 * Funzionalità:
 * - Tracciamento operazioni per pianta (irrigazione, fertilizzazione, trattamenti)
 * - Cronologia completa interventi
 * - Calcolo automatico fabbisogni
 * - Programmazione operazioni future
 * - Analisi performance individuale
 * - Integrazione con monitoraggio continuo
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Droplets,
  Leaf,
  Bug,
  Scissors,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  MapPin,
  Camera,
  FileText,
  Zap,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Calculator,
  Target,
  Award,
  Thermometer,
  Sun,
  CloudRain
} from 'lucide-react'
import { GardenPlant, PlantOperation, PlantHarvest } from '@/types/individualPlant'
import { calculateResourceNeeds, analyzeFieldPerformance } from '@/services/individualPlantService'

interface PlantLifecycleManagerProps {
  plant: GardenPlant
  operations: PlantOperation[]
  harvests: PlantHarvest[]
  onUpdatePlant: (updates: Partial<GardenPlant>) => void
  onAddOperation: (operation: Omit<PlantOperation, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateOperation: (operationId: string, updates: Partial<PlantOperation>) => void
  onDeleteOperation: (operationId: string) => void
  onAddHarvest: (harvest: Omit<PlantHarvest, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose?: () => void
}

interface OperationTemplate {
  id: string
  name: string
  type: PlantOperation['operationType']
  category: PlantOperation['operationCategory']
  defaultQuantity: number
  unit: string
  description: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'seasonal' | 'as_needed'
  seasonalTiming?: string[]
  estimatedDuration: number // minuti
  cost?: number
  materials?: string[]
}

const OPERATION_TEMPLATES: OperationTemplate[] = [
  {
    id: 'watering_regular',
    name: 'Irrigazione Regolare',
    type: 'watering',
    category: 'irrigation',
    defaultQuantity: 2,
    unit: 'L',
    description: 'Irrigazione standard per mantenere umidità ottimale',
    frequency: 'daily',
    estimatedDuration: 5,
    cost: 0.002 // €0.002 per litro
  },
  {
    id: 'watering_deep',
    name: 'Irrigazione Profonda',
    type: 'watering',
    category: 'irrigation',
    defaultQuantity: 5,
    unit: 'L',
    description: 'Irrigazione abbondante per periodi secchi',
    frequency: 'weekly',
    estimatedDuration: 10,
    cost: 0.002
  },
  {
    id: 'fertilizing_base',
    name: 'Concimazione Base',
    type: 'fertilizing',
    category: 'nutrition',
    defaultQuantity: 30,
    unit: 'g',
    description: 'Concime NPK bilanciato per crescita generale',
    frequency: 'biweekly',
    estimatedDuration: 15,
    cost: 0.05, // €0.05 per grammo
    materials: ['Concime NPK 10-10-10', 'Annaffiatoio', 'Guanti']
  },
  {
    id: 'fertilizing_bloom',
    name: 'Concimazione Fioritura',
    type: 'fertilizing',
    category: 'nutrition',
    defaultQuantity: 25,
    unit: 'g',
    description: 'Concime ricco di fosforo per stimolare fioritura',
    frequency: 'weekly',
    seasonalTiming: ['spring', 'summer'],
    estimatedDuration: 15,
    cost: 0.08,
    materials: ['Concime PK', 'Annaffiatoio', 'Guanti']
  },
  {
    id: 'treatment_preventive',
    name: 'Trattamento Preventivo',
    type: 'treatment',
    category: 'protection',
    defaultQuantity: 10,
    unit: 'ml',
    description: 'Trattamento preventivo contro malattie fungine',
    frequency: 'biweekly',
    estimatedDuration: 20,
    cost: 0.50,
    materials: ['Fungicida biologico', 'Spruzzatore', 'Guanti', 'Mascherina']
  },
  {
    id: 'pruning_maintenance',
    name: 'Potatura Manutenzione',
    type: 'pruning',
    category: 'maintenance',
    defaultQuantity: 1,
    unit: 'sessione',
    description: 'Rimozione rami secchi e foglie danneggiate',
    frequency: 'monthly',
    estimatedDuration: 30,
    materials: ['Forbici da potatura', 'Guanti', 'Disinfettante']
  },
  {
    id: 'staking',
    name: 'Tutoraggio',
    type: 'staking',
    category: 'maintenance',
    defaultQuantity: 1,
    unit: 'sessione',
    description: 'Installazione o regolazione tutori',
    frequency: 'as_needed',
    estimatedDuration: 20,
    materials: ['Tutori', 'Legacci', 'Martello']
  }
]

export default function PlantLifecycleManager({
  plant,
  operations,
  harvests,
  onUpdatePlant,
  onAddOperation,
  onUpdateOperation,
  onDeleteOperation,
  onAddHarvest,
  onClose
}: PlantLifecycleManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'schedule' | 'analytics' | 'settings'>('overview')
  const [showAddOperation, setShowAddOperation] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<OperationTemplate | null>(null)
  const [newOperation, setNewOperation] = useState<Partial<PlantOperation>>({})
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  // Calcola statistiche pianta
  const plantStats = React.useMemo(() => {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const recentOperations = operations.filter(op => 
      new Date(op.operationDate) >= last30Days
    )
    
    const operationsByType = recentOperations.reduce((acc, op) => {
      acc[op.operationType] = (acc[op.operationType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const totalCost = recentOperations.reduce((sum, op) => {
      const template = OPERATION_TEMPLATES.find(t => t.type === op.operationType)
      return sum + (template?.cost || 0) * (op.quantity || 0)
    }, 0)
    
    const totalHarvest = harvests.reduce((sum, h) => sum + h.quantityKg, 0)
    const avgHarvestQuality = harvests.length > 0 
      ? harvests.reduce((sum, h) => sum + (h.qualityScore || 0), 0) / harvests.length 
      : 0
    
    const lastWatering = operations
      .filter(op => op.operationType === 'watering')
      .sort((a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime())[0]
    
    const lastFertilizing = operations
      .filter(op => op.operationType === 'fertilizing')
      .sort((a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime())[0]
    
    const daysSinceWatering = lastWatering 
      ? Math.floor((now.getTime() - new Date(lastWatering.operationDate).getTime()) / (1000 * 60 * 60 * 24))
      : null
    
    const daysSinceFertilizing = lastFertilizing
      ? Math.floor((now.getTime() - new Date(lastFertilizing.operationDate).getTime()) / (1000 * 60 * 60 * 24))
      : null
    
    return {
      recentOperations: recentOperations.length,
      operationsByType,
      totalCost: Math.round(totalCost * 100) / 100,
      totalHarvest: Math.round(totalHarvest * 100) / 100,
      avgHarvestQuality: Math.round(avgHarvestQuality * 10) / 10,
      daysSinceWatering,
      daysSinceFertilizing,
      healthTrend: plant.healthScore >= 80 ? 'excellent' : plant.healthScore >= 60 ? 'good' : plant.healthScore >= 40 ? 'warning' : 'critical'
    }
  }, [plant, operations, harvests])

  // Filtra operazioni
  const filteredOperations = operations.filter(op => {
    if (filterType !== 'all' && op.operationType !== filterType) return false
    if (searchQuery && !op.productName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !op.notes?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    const opDate = new Date(op.operationDate)
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    
    return opDate >= startDate && opDate <= endDate
  }).sort((a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime())

  // Calcola prossime operazioni suggerite
  const suggestedOperations = React.useMemo(() => {
    const suggestions: Array<{
      template: OperationTemplate
      urgency: 'high' | 'medium' | 'low'
      reason: string
      dueDate: string
    }> = []
    
    const now = new Date()
    
    // Controllo irrigazione
    if (plantStats.daysSinceWatering === null || plantStats.daysSinceWatering >= 3) {
      suggestions.push({
        template: OPERATION_TEMPLATES.find(t => t.id === 'watering_regular')!,
        urgency: plantStats.daysSinceWatering === null || plantStats.daysSinceWatering >= 5 ? 'high' : 'medium',
        reason: plantStats.daysSinceWatering === null 
          ? 'Nessuna irrigazione registrata' 
          : `Ultima irrigazione ${plantStats.daysSinceWatering} giorni fa`,
        dueDate: now.toISOString().split('T')[0]
      })
    }
    
    // Controllo fertilizzazione
    if (plantStats.daysSinceFertilizing === null || plantStats.daysSinceFertilizing >= 14) {
      suggestions.push({
        template: OPERATION_TEMPLATES.find(t => t.id === 'fertilizing_base')!,
        urgency: plantStats.daysSinceFertilizing === null || plantStats.daysSinceFertilizing >= 21 ? 'high' : 'medium',
        reason: plantStats.daysSinceFertilizing === null 
          ? 'Nessuna fertilizzazione registrata' 
          : `Ultima fertilizzazione ${plantStats.daysSinceFertilizing} giorni fa`,
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    }
    
    // Controllo salute
    if (plant.healthScore < 70) {
      suggestions.push({
        template: OPERATION_TEMPLATES.find(t => t.id === 'treatment_preventive')!,
        urgency: plant.healthScore < 50 ? 'high' : 'medium',
        reason: `Punteggio salute basso: ${plant.healthScore}/100`,
        dueDate: now.toISOString().split('T')[0]
      })
    }
    
    return suggestions.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })
  }, [plant, plantStats])

  const handleAddOperation = () => {
    if (!selectedTemplate || !newOperation.operationDate) return
    
    const operation: Omit<PlantOperation, 'id' | 'createdAt' | 'updatedAt'> = {
      plantId: plant.id,
      gardenId: plant.gardenId,
      operationType: selectedTemplate.type,
      operationCategory: selectedTemplate.category,
      operationDate: newOperation.operationDate,
      quantity: newOperation.quantity || selectedTemplate.defaultQuantity,
      unit: selectedTemplate.unit,
      productName: newOperation.productName || selectedTemplate.name,
      notes: newOperation.notes || selectedTemplate.description,
      photos: newOperation.photos || []
    }
    
    onAddOperation(operation)
    setShowAddOperation(false)
    setSelectedTemplate(null)
    setNewOperation({})
  }

  const handleQuickOperation = (template: OperationTemplate) => {
    const operation: Omit<PlantOperation, 'id' | 'createdAt' | 'updatedAt'> = {
      plantId: plant.id,
      gardenId: plant.gardenId,
      operationType: template.type,
      operationCategory: template.category,
      operationDate: new Date().toISOString().split('T')[0],
      quantity: template.defaultQuantity,
      unit: template.unit,
      productName: template.name,
      notes: template.description,
      photos: []
    }
    
    onAddOperation(operation)
  }

  const getOperationIcon = (type: PlantOperation['operationType']) => {
    switch (type) {
      case 'watering': return <Droplets className="text-blue-600" size={16} />
      case 'fertilizing': return <Leaf className="text-green-600" size={16} />
      case 'treatment': return <Bug className="text-red-600" size={16} />
      case 'pruning': return <Scissors className="text-purple-600" size={16} />
      case 'harvest': return <Award className="text-orange-600" size={16} />
      default: return <Activity className="text-gray-600" size={16} />
    }
  }

  const getUrgencyColor = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Leaf className="text-green-600" size={28} />
                Gestione Pianta: {plant.plantCode}
              </h2>
              <p className="text-gray-600 mt-1">
                {plant.plantName} • {plant.variety || 'Varietà standard'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status pianta */}
              <div className={`px-3 py-1 rounded-full border ${
                plant.status === 'healthy' ? 'text-green-600 bg-green-50 border-green-200' :
                plant.status === 'warning' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                plant.status === 'critical' ? 'text-red-600 bg-red-50 border-red-200' :
                'text-gray-600 bg-gray-50 border-gray-200'
              }`}>
                <span className="text-sm font-medium">
                  {plant.status} • {plant.healthScore}/100
                </span>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex gap-6 mt-4">
            {[
              { id: 'overview', label: 'Panoramica', icon: Activity },
              { id: 'operations', label: `Operazioni (${operations.length})`, icon: FileText },
              { id: 'schedule', label: 'Programmazione', icon: Calendar },
              { id: 'analytics', label: 'Analisi', icon: BarChart3 },
              { id: 'settings', label: 'Impostazioni', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'text-green-600 border-green-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistiche rapide */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Droplets className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-blue-600">Ultima Irrigazione</p>
                      <p className="text-lg font-bold text-blue-700">
                        {plantStats.daysSinceWatering !== null ? `${plantStats.daysSinceWatering}g fa` : 'Mai'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Leaf className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-green-600">Ultima Concimazione</p>
                      <p className="text-lg font-bold text-green-700">
                        {plantStats.daysSinceFertilizing !== null ? `${plantStats.daysSinceFertilizing}g fa` : 'Mai'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="text-orange-600" size={20} />
                    <div>
                      <p className="text-sm text-orange-600">Raccolto Totale</p>
                      <p className="text-lg font-bold text-orange-700">{plantStats.totalHarvest} kg</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-purple-600">Costo (30g)</p>
                      <p className="text-lg font-bold text-purple-700">€{plantStats.totalCost}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operazioni suggerite */}
              {suggestedOperations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Operazioni Suggerite
                  </h3>
                  <div className="space-y-3">
                    {suggestedOperations.map((suggestion, index) => (
                      <div key={index} className={`border rounded-lg p-3 ${getUrgencyColor(suggestion.urgency)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getOperationIcon(suggestion.template.type)}
                            <div>
                              <p className="font-medium">{suggestion.template.name}</p>
                              <p className="text-sm opacity-75">{suggestion.reason}</p>
                              <p className="text-xs opacity-60">
                                Scadenza: {new Date(suggestion.dueDate).toLocaleDateString('it-IT')} • 
                                Durata: {suggestion.template.estimatedDuration} min
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleQuickOperation(suggestion.template)}
                            className="px-3 py-1 bg-white text-current rounded text-sm hover:bg-opacity-80 transition-colors"
                          >
                            Esegui Ora
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operazioni recenti */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Operazioni Recenti</h3>
                  <button
                    onClick={() => setShowAddOperation(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    <Plus size={16} />
                    Aggiungi
                  </button>
                </div>
                
                <div className="space-y-2">
                  {operations.slice(0, 5).map(operation => (
                    <div key={operation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        {getOperationIcon(operation.operationType)}
                        <div>
                          <p className="font-medium">{operation.productName}</p>
                          <p className="text-sm text-gray-600">
                            {operation.quantity} {operation.unit} • {new Date(operation.operationDate).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {operation.operationType}
                      </span>
                    </div>
                  ))}
                  
                  {operations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Nessuna operazione registrata</p>
                      <p className="text-sm">Inizia registrando la prima operazione</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Azioni rapide */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {OPERATION_TEMPLATES.slice(0, 4).map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleQuickOperation(template)}
                      className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {getOperationIcon(template.type)}
                      <span className="text-sm font-medium">{template.name}</span>
                      <span className="text-xs text-gray-500">
                        {template.defaultQuantity} {template.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Operations Tab */}
          {activeTab === 'operations' && (
            <div className="space-y-4">
              {/* Filtri e controlli */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cerca operazioni..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Tutti i tipi</option>
                  <option value="watering">Irrigazione</option>
                  <option value="fertilizing">Fertilizzazione</option>
                  <option value="treatment">Trattamenti</option>
                  <option value="pruning">Potatura</option>
                  <option value="harvest">Raccolta</option>
                </select>
                
                <button
                  onClick={() => setShowAddOperation(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Aggiungi
                </button>
              </div>

              {/* Range date */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Da:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">A:</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lista operazioni */}
              <div className="space-y-3">
                {filteredOperations.map(operation => (
                  <div key={operation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getOperationIcon(operation.operationType)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{operation.productName}</span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {operation.operationType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {operation.quantity} {operation.unit} • {new Date(operation.operationDate).toLocaleDateString('it-IT')}
                          </p>
                          {operation.notes && (
                            <p className="text-sm text-gray-700 mb-2">{operation.notes}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Registrata: {new Date(operation.createdAt).toLocaleString('it-IT')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // TODO: Implementare modifica operazione
                            console.log('Edit operation:', operation.id)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteOperation(operation.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredOperations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nessuna operazione trovata</p>
                    <p className="text-sm">Modifica i filtri o aggiungi nuove operazioni</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Altri tab... */}
          {activeTab === 'schedule' && (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Programmazione Operazioni</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Analisi Performance</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="text-center py-8 text-gray-500">
              <Settings size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Impostazioni Pianta</p>
              <p className="text-sm">Funzionalità in sviluppo</p>
            </div>
          )}
        </div>

        {/* Modal per aggiungere operazione */}
        {showAddOperation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Aggiungi Operazione</h3>
                <button
                  onClick={() => {
                    setShowAddOperation(false)
                    setSelectedTemplate(null)
                    setNewOperation({})
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Selezione template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo Operazione
                  </label>
                  <select
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const template = OPERATION_TEMPLATES.find(t => t.id === e.target.value)
                      setSelectedTemplate(template || null)
                      if (template) {
                        setNewOperation({
                          quantity: template.defaultQuantity,
                          productName: template.name
                        })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleziona tipo...</option>
                    {OPERATION_TEMPLATES.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplate && (
                  <>
                    {/* Data */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Operazione
                      </label>
                      <input
                        type="date"
                        value={newOperation.operationDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setNewOperation(prev => ({ ...prev, operationDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Quantità */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantità ({selectedTemplate.unit})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newOperation.quantity || selectedTemplate.defaultQuantity}
                        onChange={(e) => setNewOperation(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Prodotto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prodotto/Nome
                      </label>
                      <input
                        type="text"
                        value={newOperation.productName || selectedTemplate.name}
                        onChange={(e) => setNewOperation(prev => ({ ...prev, productName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note (opzionale)
                      </label>
                      <textarea
                        value={newOperation.notes || ''}
                        onChange={(e) => setNewOperation(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={selectedTemplate.description}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Info template */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Durata stimata:</strong> {selectedTemplate.estimatedDuration} minuti
                      </p>
                      {selectedTemplate.cost && (
                        <p className="text-sm text-blue-800">
                          <strong>Costo stimato:</strong> €{(selectedTemplate.cost * (newOperation.quantity || selectedTemplate.defaultQuantity)).toFixed(2)}
                        </p>
                      )}
                      {selectedTemplate.materials && (
                        <div className="mt-2">
                          <p className="text-sm text-blue-800 font-medium">Materiali necessari:</p>
                          <ul className="text-xs text-blue-700 mt-1">
                            {selectedTemplate.materials.map((material, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-blue-600 rounded-full" />
                                {material}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddOperation(false)
                    setSelectedTemplate(null)
                    setNewOperation({})
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddOperation}
                  disabled={!selectedTemplate || !newOperation.operationDate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aggiungi Operazione
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}