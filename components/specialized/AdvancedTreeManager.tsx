'use client'

import { useState, useEffect } from 'react'
import { 
  TreePine, 
  Plus, 
  Edit, 
  Camera, 
  BarChart3, 
  Calendar, 
  MapPin,
  Scissors,
  Droplets,
  Bug,
  Target,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Leaf,
  Upload,
  Download,
  Filter,
  Search,
  X,
  Save,
  Trash2
} from 'lucide-react'

interface TreeData {
  id: string
  treeNumber: string
  variety: string
  rootstock?: string
  plantingDate: Date
  position: { x: number, y: number }
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  lastInspection: Date
  notes: string
  photos: TreePhoto[]
  operations: TreeOperation[]
  yield: YieldRecord[]
  measurements?: TreeMeasurement[]
}

interface TreePhoto {
  id: string
  url: string
  date: Date
  description?: string
  type: 'general' | 'disease' | 'pest' | 'fruit' | 'pruning'
}

interface TreeMeasurement {
  id: string
  date: Date
  height?: number
  diameter?: number
  canopyWidth?: number
  healthScore: number
  notes?: string
}

interface TreeOperation {
  id: string
  type: 'pruning' | 'treatment' | 'fertilization' | 'irrigation' | 'harvest' | 'inspection'
  date: Date
  description: string
  operator: string
  cost?: number
  photos?: TreePhoto[]
  products?: string[]
  duration?: number
  weather?: string
}

interface YieldRecord {
  id: string
  date: Date
  quantity: number
  quality: 'premium' | 'standard' | 'low'
  notes?: string
}

interface AdvancedTreeManagerProps {
  orchardId: string
  orchardType: 'vineyard' | 'olive' | 'orchard'
  onTreeSelect?: (tree: TreeData) => void
}

export default function AdvancedTreeManager({ 
  orchardId, 
  orchardType, 
  onTreeSelect 
}: AdvancedTreeManagerProps) {
  const [trees, setTrees] = useState<TreeData[]>([])
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'list'>('grid')
  const [filterHealth, setFilterHealth] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedTrees, setSelectedTrees] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'number' | 'variety' | 'health' | 'lastInspection'>('number')

  useEffect(() => {
    loadTrees()
  }, [orchardId])

  const loadTrees = async () => {
    try {
      setLoading(true)
      // Simulate loading trees data with more realistic data
      const mockTrees: TreeData[] = Array.from({ length: 50 }, (_, i) => ({
        id: `tree-${i + 1}`,
        treeNumber: `${orchardType.charAt(0).toUpperCase()}${String(i + 1).padStart(3, '0')}`,
        variety: getRandomVariety(),
        rootstock: getRandomRootstock(),
        plantingDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        position: { x: (i % 10) * 5, y: Math.floor(i / 10) * 4 },
        health: getRandomHealth(),
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        notes: '',
        photos: generateMockPhotos(),
        operations: generateMockOperations(),
        yield: generateMockYield(),
        measurements: generateMockMeasurements()
      }))
      setTrees(mockTrees)
    } catch (error) {
      console.error('Error loading trees:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockPhotos = (): TreePhoto[] => {
    const photoCount = Math.floor(Math.random() * 5) + 1
    return Array.from({ length: photoCount }, (_, i) => ({
      id: `photo-${i + 1}`,
      url: `/api/placeholder/400/300?tree=${i}`,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      description: `Foto ${i + 1}`,
      type: ['general', 'disease', 'pest', 'fruit', 'pruning'][Math.floor(Math.random() * 5)] as TreePhoto['type']
    }))
  }

  const generateMockOperations = (): TreeOperation[] => {
    const operations: TreeOperation[] = []
    const operationTypes: TreeOperation['type'][] = ['pruning', 'treatment', 'fertilization', 'irrigation', 'harvest', 'inspection']
    
    for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
      operations.push({
        id: `op-${i + 1}`,
        type: operationTypes[Math.floor(Math.random() * operationTypes.length)],
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        description: `Operazione ${i + 1}`,
        operator: ['Mario Rossi', 'Luigi Bianchi', 'Giuseppe Verdi'][Math.floor(Math.random() * 3)],
        cost: Math.floor(Math.random() * 100) + 20,
        duration: Math.floor(Math.random() * 4) + 1,
        weather: ['Soleggiato', 'Nuvoloso', 'Piovoso'][Math.floor(Math.random() * 3)]
      })
    }
    
    return operations.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const generateMockYield = (): YieldRecord[] => {
    const yields: YieldRecord[] = []
    
    for (let year = 2022; year <= 2025; year++) {
      if (Math.random() > 0.3) { // Not all trees produce every year
        yields.push({
          id: `yield-${year}`,
          date: new Date(year, 8 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 30) + 1),
          quantity: Math.floor(Math.random() * 50) + 10,
          quality: ['premium', 'standard', 'low'][Math.floor(Math.random() * 3)] as YieldRecord['quality'],
          notes: `Raccolta ${year}`
        })
      }
    }
    
    return yields.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const generateMockMeasurements = (): TreeMeasurement[] => {
    const measurements: TreeMeasurement[] = []
    
    for (let i = 0; i < Math.floor(Math.random() * 6) + 2; i++) {
      measurements.push({
        id: `measure-${i + 1}`,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        height: 2.5 + Math.random() * 2,
        diameter: 15 + Math.random() * 10,
        canopyWidth: 2 + Math.random() * 1.5,
        healthScore: Math.floor(Math.random() * 40) + 60,
        notes: `Misurazione ${i + 1}`
      })
    }
    
    return measurements.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const getRandomVariety = () => {
    const varieties = {
      vineyard: ['Sangiovese', 'Merlot', 'Cabernet Sauvignon', 'Pinot Grigio', 'Chardonnay'],
      olive: ['Frantoio', 'Leccino', 'Pendolino', 'Moraiolo', 'Taggiasca'],
      orchard: ['Golden Delicious', 'Gala', 'Fuji', 'Red Delicious', 'Granny Smith']
    }
    const varietyList = varieties[orchardType]
    return varietyList[Math.floor(Math.random() * varietyList.length)]
  }

  const getRandomRootstock = () => {
    const rootstocks = {
      vineyard: ['SO4', '1103P', '140Ru', '41B', '3309C'],
      olive: ['Selvatico', 'Frantoio', 'Leccino'],
      orchard: ['M9', 'M26', 'MM106', 'M7', 'MM111']
    }
    const rootstockList = rootstocks[orchardType]
    return rootstockList[Math.floor(Math.random() * rootstockList.length)]
  }

  const getRandomHealth = (): TreeData['health'] => {
    const healthOptions: TreeData['health'][] = ['excellent', 'good', 'fair', 'poor', 'critical']
    const weights = [0.3, 0.4, 0.2, 0.08, 0.02] // Most trees are healthy
    const random = Math.random()
    let cumulative = 0
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return healthOptions[i]
      }
    }
    return 'good'
  }

  const getHealthColor = (health: TreeData['health']) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-green-500 bg-green-50'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (health: TreeData['health']) => {
    switch (health) {
      case 'excellent': return <CheckCircle size={16} />
      case 'good': return <CheckCircle size={16} />
      case 'fair': return <Clock size={16} />
      case 'poor': return <AlertTriangle size={16} />
      case 'critical': return <AlertTriangle size={16} />
      default: return <Eye size={16} />
    }
  }

  const getTreeIcon = () => {
    switch (orchardType) {
      case 'vineyard': return '🍇'
      case 'olive': return '🫒'
      case 'orchard': return '🍎'
      default: return '🌳'
    }
  }

  const filteredTrees = trees
    .filter(tree => filterHealth === 'all' || tree.health === filterHealth)
    .filter(tree => 
      searchTerm === '' || 
      tree.treeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tree.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tree.rootstock && tree.rootstock.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'number':
          return a.treeNumber.localeCompare(b.treeNumber)
        case 'variety':
          return a.variety.localeCompare(b.variety)
        case 'health':
          const healthOrder = { excellent: 5, good: 4, fair: 3, poor: 2, critical: 1 }
          return healthOrder[b.health] - healthOrder[a.health]
        case 'lastInspection':
          return b.lastInspection.getTime() - a.lastInspection.getTime()
        default:
          return 0
      }
    })

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} on trees:`, selectedTrees)
    // Implement bulk actions like bulk operations, bulk health updates, etc.
    setSelectedTrees([])
    setShowBulkActions(false)
  }

  const handleTreeSelect = (treeId: string, selected: boolean) => {
    if (selected) {
      setSelectedTrees([...selectedTrees, treeId])
    } else {
      setSelectedTrees(selectedTrees.filter(id => id !== treeId))
    }
  }

  const exportTreeData = () => {
    const csvData = trees.map(tree => ({
      numero: tree.treeNumber,
      varieta: tree.variety,
      portinnesto: tree.rootstock || '',
      salute: tree.health,
      ultimoControllo: tree.lastInspection.toLocaleDateString('it-IT'),
      posizione: `${tree.position.x}m, ${tree.position.y}m`,
      note: tree.notes
    }))
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alberi_${orchardType}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const healthStats = {
    excellent: trees.filter(t => t.health === 'excellent').length,
    good: trees.filter(t => t.health === 'good').length,
    fair: trees.filter(t => t.health === 'fair').length,
    poor: trees.filter(t => t.health === 'poor').length,
    critical: trees.filter(t => t.health === 'critical').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <TreePine className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Caricamento alberi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-3xl">{getTreeIcon()}</span>
            Gestione Alberi Avanzata
          </h2>
          <p className="text-gray-600">
            {trees.length} alberi • {healthStats.excellent + healthStats.good} in salute • 
            {healthStats.poor + healthStats.critical} necessitano attenzione
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Nuovo Albero
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-900">Eccellente</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{healthStats.excellent}</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-500" size={16} />
            <span className="text-sm font-medium text-green-800">Buono</span>
          </div>
          <div className="text-2xl font-bold text-green-500">{healthStats.good}</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-yellow-600" size={16} />
            <span className="text-sm font-medium text-yellow-900">Discreto</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{healthStats.fair}</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-orange-600" size={16} />
            <span className="text-sm font-medium text-orange-900">Scarso</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{healthStats.poor}</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-red-600" size={16} />
            <span className="text-sm font-medium text-red-900">Critico</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{healthStats.critical}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cerca alberi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-64"
            />
          </div>

          {/* View Mode */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={16} className="inline mr-2" />
              Griglia
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapPin size={16} className="inline mr-2" />
              Mappa
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Lista
            </button>
          </div>

          {/* Health Filter */}
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tutti gli stati</option>
            <option value="excellent">Eccellente</option>
            <option value="good">Buono</option>
            <option value="fair">Discreto</option>
            <option value="poor">Scarso</option>
            <option value="critical">Critico</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="number">Ordina per Numero</option>
            <option value="variety">Ordina per Varietà</option>
            <option value="health">Ordina per Salute</option>
            <option value="lastInspection">Ordina per Ultimo Controllo</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {selectedTrees.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedTrees.length} selezionati</span>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Azioni Multiple
              </button>
            </div>
          )}

          {/* Export */}
          <button
            onClick={exportTreeData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <Download size={16} />
            Esporta
          </button>

          <div className="text-sm text-gray-600">
            {filteredTrees.length} di {trees.length} alberi
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedTrees.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">Azioni Multiple ({selectedTrees.length} alberi)</h3>
            <button
              onClick={() => setShowBulkActions(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('schedule-inspection')}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Programma Ispezione
            </button>
            <button
              onClick={() => handleBulkAction('schedule-pruning')}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
            >
              Programma Potatura
            </button>
            <button
              onClick={() => handleBulkAction('schedule-treatment')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Programma Trattamento
            </button>
            <button
              onClick={() => handleBulkAction('update-health')}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Aggiorna Salute
            </button>
            <button
              onClick={() => handleBulkAction('export-selected')}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
            >
              Esporta Selezionati
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTrees.map((tree) => (
            <div
              key={tree.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative"
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedTrees.includes(tree.id)}
                  onChange={(e) => handleTreeSelect(tree.id, e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
              </div>

              <div 
                onClick={() => {
                  setSelectedTree(tree)
                  onTreeSelect?.(tree)
                }}
                className="ml-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTreeIcon()}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tree.treeNumber}</h3>
                      <p className="text-sm text-gray-600">{tree.variety}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(tree.health)}`}>
                    {getHealthIcon(tree.health)}
                    <span className="capitalize">{tree.health}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {tree.rootstock && (
                    <div className="flex items-center gap-2">
                      <Leaf size={14} />
                      <span>Portinnesto: {tree.rootstock}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Piantato: {tree.plantingDate.toLocaleDateString('it-IT')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>Pos: {tree.position.x}m, {tree.position.y}m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={14} />
                    <span>Ultimo controllo: {tree.lastInspection.toLocaleDateString('it-IT')}</span>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Camera size={12} />
                        {tree.photos.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        {tree.operations.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={12} />
                        {tree.yield.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        // Open camera/photo modal
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Camera size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        // Open pruning modal
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Scissors size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        // Open irrigation modal
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Droplets size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        // Open treatment modal
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Bug size={14} />
                    </button>
                  </div>
                  <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                    Dettagli →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'map' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-12">
            <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vista Mappa</h3>
            <p className="text-gray-600">Visualizzazione mappa degli alberi in sviluppo</p>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTrees.length === filteredTrees.length && filteredTrees.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTrees(filteredTrees.map(t => t.id))
                        } else {
                          setSelectedTrees([])
                        }
                      }}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Albero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Varietà
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portinnesto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ultimo Controllo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrees.map((tree) => (
                  <tr key={tree.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTrees.includes(tree.id)}
                        onChange={(e) => handleTreeSelect(tree.id, e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getTreeIcon()}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tree.treeNumber}</div>
                          <div className="text-sm text-gray-500">Pos: {tree.position.x}m, {tree.position.y}m</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tree.variety}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tree.rootstock || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(tree.health)}`}>
                        {getHealthIcon(tree.health)}
                        <span className="capitalize">{tree.health}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tree.lastInspection.toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTree(tree)
                            onTreeSelect?.(tree)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Camera size={16} />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          <BarChart3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tree Detail Modal */}
      {selectedTree && (
        <TreeDetailModal
          tree={selectedTree}
          orchardType={orchardType}
          onClose={() => setSelectedTree(null)}
          onUpdate={(updatedTree) => {
            setTrees(trees.map(t => t.id === updatedTree.id ? updatedTree : t))
            setSelectedTree(updatedTree)
          }}
        />
      )}

      {/* Add Tree Modal */}
      {showAddModal && (
        <AddTreeModal
          orchardType={orchardType}
          onClose={() => setShowAddModal(false)}
          onAdd={(newTree) => {
            setTrees([...trees, newTree])
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

// Add Tree Modal Component
interface AddTreeModalProps {
  orchardType: 'vineyard' | 'olive' | 'orchard'
  onClose: () => void
  onAdd: (tree: TreeData) => void
}

function AddTreeModal({ orchardType, onClose, onAdd }: AddTreeModalProps) {
  const [formData, setFormData] = useState({
    treeNumber: '',
    variety: '',
    rootstock: '',
    plantingDate: new Date().toISOString().split('T')[0],
    positionX: 0,
    positionY: 0,
    health: 'good' as TreeData['health'],
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newTree: TreeData = {
      id: `tree-${Date.now()}`,
      treeNumber: formData.treeNumber,
      variety: formData.variety,
      rootstock: formData.rootstock || undefined,
      plantingDate: new Date(formData.plantingDate),
      position: { x: formData.positionX, y: formData.positionY },
      health: formData.health,
      lastInspection: new Date(),
      notes: formData.notes,
      photos: [],
      operations: [],
      yield: [],
      measurements: []
    }
    
    onAdd(newTree)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Aggiungi Nuovo Albero</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero Albero *
              </label>
              <input
                type="text"
                required
                value={formData.treeNumber}
                onChange={(e) => setFormData({ ...formData, treeNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="es. V001, O001, F001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Varietà *
              </label>
              <input
                type="text"
                required
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Nome varietà"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portinnesto
              </label>
              <input
                type="text"
                value={formData.rootstock}
                onChange={(e) => setFormData({ ...formData, rootstock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Portinnesto (opzionale)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Impianto *
              </label>
              <input
                type="date"
                required
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posizione X (m)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.positionX}
                onChange={(e) => setFormData({ ...formData, positionX: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posizione Y (m)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.positionY}
                onChange={(e) => setFormData({ ...formData, positionY: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stato Salute
              </label>
              <select
                value={formData.health}
                onChange={(e) => setFormData({ ...formData, health: e.target.value as TreeData['health'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="excellent">Eccellente</option>
                <option value="good">Buono</option>
                <option value="fair">Discreto</option>
                <option value="poor">Scarso</option>
                <option value="critical">Critico</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Note aggiuntive sull'albero..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Aggiungi Albero
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Tree Detail Modal Component
interface TreeDetailModalProps {
  tree: TreeData
  orchardType: 'vineyard' | 'olive' | 'orchard'
  onClose: () => void
  onUpdate: (tree: TreeData) => void
}

function TreeDetailModal({ tree, orchardType, onClose, onUpdate }: TreeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'operations' | 'yield' | 'photos' | 'measurements'>('info')
  const [editMode, setEditMode] = useState(false)
  const [editedTree, setEditedTree] = useState<TreeData>(tree)

  const getTreeIcon = () => {
    switch (orchardType) {
      case 'vineyard': return '🍇'
      case 'olive': return '🫒'
      case 'orchard': return '🍎'
      default: return '🌳'
    }
  }

  const handleSave = () => {
    onUpdate(editedTree)
    setEditMode(false)
  }

  const handleCancel = () => {
    setEditedTree(tree)
    setEditMode(false)
  }

  const addNewOperation = () => {
    const newOperation: TreeOperation = {
      id: `op-${Date.now()}`,
      type: 'inspection',
      date: new Date(),
      description: '',
      operator: '',
      duration: 1,
      weather: 'Soleggiato'
    }
    setEditedTree({
      ...editedTree,
      operations: [newOperation, ...editedTree.operations]
    })
  }

  const addNewYield = () => {
    const newYield: YieldRecord = {
      id: `yield-${Date.now()}`,
      date: new Date(),
      quantity: 0,
      quality: 'standard',
      notes: ''
    }
    setEditedTree({
      ...editedTree,
      yield: [newYield, ...editedTree.yield]
    })
  }

  const addNewMeasurement = () => {
    const newMeasurement: TreeMeasurement = {
      id: `measure-${Date.now()}`,
      date: new Date(),
      healthScore: 80,
      notes: ''
    }
    setEditedTree({
      ...editedTree,
      measurements: [newMeasurement, ...(editedTree.measurements || [])]
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getTreeIcon()}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{editedTree.treeNumber}</h2>
              <p className="text-gray-600">{editedTree.variety} • {editedTree.rootstock}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save size={16} />
                  Salva
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annulla
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                Modifica
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'info', label: 'Informazioni', icon: FileText },
              { id: 'operations', label: 'Operazioni', icon: Scissors },
              { id: 'yield', label: 'Rese', icon: Target },
              { id: 'photos', label: 'Foto', icon: Camera },
              { id: 'measurements', label: 'Misurazioni', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.id === 'operations' && <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{editedTree.operations.length}</span>}
                  {tab.id === 'yield' && <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{editedTree.yield.length}</span>}
                  {tab.id === 'photos' && <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{editedTree.photos.length}</span>}
                  {tab.id === 'measurements' && <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{editedTree.measurements?.length || 0}</span>}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dettagli Albero</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Varietà</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedTree.variety}
                          onChange={(e) => setEditedTree({ ...editedTree, variety: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{editedTree.variety}</p>
                      )}
                    </div>
                    {editedTree.rootstock && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Portinnesto</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={editedTree.rootstock}
                            onChange={(e) => setEditedTree({ ...editedTree, rootstock: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-gray-900">{editedTree.rootstock}</p>
                        )}
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Data Impianto</label>
                      {editMode ? (
                        <input
                          type="date"
                          value={editedTree.plantingDate.toISOString().split('T')[0]}
                          onChange={(e) => setEditedTree({ ...editedTree, plantingDate: new Date(e.target.value) })}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{editedTree.plantingDate.toLocaleDateString('it-IT')}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Posizione</label>
                      {editMode ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="X (m)"
                            value={editedTree.position.x}
                            onChange={(e) => setEditedTree({ 
                              ...editedTree, 
                              position: { ...editedTree.position, x: parseFloat(e.target.value) || 0 }
                            })}
                            className="flex-1 mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="number"
                            placeholder="Y (m)"
                            value={editedTree.position.y}
                            onChange={(e) => setEditedTree({ 
                              ...editedTree, 
                              position: { ...editedTree.position, y: parseFloat(e.target.value) || 0 }
                            })}
                            className="flex-1 mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      ) : (
                        <p className="text-gray-900">{editedTree.position.x}m, {editedTree.position.y}m</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Stato Salute</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Stato Attuale</label>
                      {editMode ? (
                        <select
                          value={editedTree.health}
                          onChange={(e) => setEditedTree({ ...editedTree, health: e.target.value as TreeData['health'] })}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="excellent">Eccellente</option>
                          <option value="good">Buono</option>
                          <option value="fair">Discreto</option>
                          <option value="poor">Scarso</option>
                          <option value="critical">Critico</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            editedTree.health === 'excellent' ? 'text-green-600 bg-green-100' : 
                            editedTree.health === 'good' ? 'text-green-500 bg-green-50' : 
                            editedTree.health === 'fair' ? 'text-yellow-600 bg-yellow-100' : 
                            editedTree.health === 'poor' ? 'text-orange-600 bg-orange-100' : 
                            'text-red-600 bg-red-100'
                          }`}>
                            <CheckCircle size={16} />
                            <span className="capitalize">{editedTree.health}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Ultimo Controllo</label>
                      {editMode ? (
                        <input
                          type="date"
                          value={editedTree.lastInspection.toISOString().split('T')[0]}
                          onChange={(e) => setEditedTree({ ...editedTree, lastInspection: new Date(e.target.value) })}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{editedTree.lastInspection.toLocaleDateString('it-IT')}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Note</label>
                      <textarea
                        value={editedTree.notes}
                        onChange={(e) => setEditedTree({ ...editedTree, notes: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="Aggiungi note sull'albero..."
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Registro Operazioni</h3>
                <button
                  onClick={addNewOperation}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Nuova Operazione
                </button>
              </div>
              
              <div className="space-y-3">
                {editedTree.operations.map((operation) => (
                  <div key={operation.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            operation.type === 'pruning' ? 'bg-orange-100 text-orange-700' :
                            operation.type === 'treatment' ? 'bg-red-100 text-red-700' :
                            operation.type === 'harvest' ? 'bg-green-100 text-green-700' :
                            operation.type === 'irrigation' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {operation.type}
                          </span>
                          <span className="text-sm text-gray-600">
                            {operation.date.toLocaleDateString('it-IT')}
                          </span>
                          {operation.operator && (
                            <span className="text-sm text-gray-600">• {operation.operator}</span>
                          )}
                        </div>
                        <p className="text-gray-900 mb-2">{operation.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {operation.duration && <span>Durata: {operation.duration}h</span>}
                          {operation.cost && <span>Costo: €{operation.cost}</span>}
                          {operation.weather && <span>Meteo: {operation.weather}</span>}
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-800 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'yield' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Registro Rese</h3>
                <button
                  onClick={addNewYield}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Nuova Resa
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editedTree.yield.map((yieldRecord) => (
                  <div key={yieldRecord.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        {yieldRecord.date.toLocaleDateString('it-IT')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        yieldRecord.quality === 'premium' ? 'bg-green-100 text-green-700' :
                        yieldRecord.quality === 'standard' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {yieldRecord.quality}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {yieldRecord.quantity} kg
                    </div>
                    {yieldRecord.notes && (
                      <p className="text-sm text-gray-600">{yieldRecord.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Galleria Foto</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Upload size={16} />
                  Carica Foto
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {editedTree.photos.map((photo) => (
                  <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <Camera className="text-gray-400" size={32} />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          photo.type === 'general' ? 'bg-gray-100 text-gray-700' :
                          photo.type === 'disease' ? 'bg-red-100 text-red-700' :
                          photo.type === 'pest' ? 'bg-orange-100 text-orange-700' :
                          photo.type === 'fruit' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {photo.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {photo.date.toLocaleDateString('it-IT')}
                      </p>
                      {photo.description && (
                        <p className="text-xs text-gray-800 mt-1">{photo.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Misurazioni</h3>
                <button
                  onClick={addNewMeasurement}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Nuova Misurazione
                </button>
              </div>
              
              <div className="space-y-3">
                {(editedTree.measurements || []).map((measurement) => (
                  <div key={measurement.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        {measurement.date.toLocaleDateString('it-IT')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        measurement.healthScore >= 80 ? 'bg-green-100 text-green-700' :
                        measurement.healthScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        Salute: {measurement.healthScore}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      {measurement.height && (
                        <div>
                          <span className="text-xs text-gray-600">Altezza</span>
                          <div className="font-medium">{measurement.height.toFixed(1)}m</div>
                        </div>
                      )}
                      {measurement.diameter && (
                        <div>
                          <span className="text-xs text-gray-600">Diametro</span>
                          <div className="font-medium">{measurement.diameter.toFixed(1)}cm</div>
                        </div>
                      )}
                      {measurement.canopyWidth && (
                        <div>
                          <span className="text-xs text-gray-600">Chioma</span>
                          <div className="font-medium">{measurement.canopyWidth.toFixed(1)}m</div>
                        </div>
                      )}
                    </div>
                    
                    {measurement.notes && (
                      <p className="text-sm text-gray-700">{measurement.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}