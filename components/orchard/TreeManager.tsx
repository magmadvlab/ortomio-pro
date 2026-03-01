'use client'

import React, { useState, useEffect } from 'react'
import { OrchardTree, TreePhoto, TreeSearchCriteria, TreeHealthStatus, TreeVigorLevel } from '@/types/orchard'
import { orchardService } from '@/services/orchardService'
import { 
  TreePine, 
  Plus, 
  Search, 
  Filter, 
  Camera, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  QrCode,
  Ruler,
  Activity,
  TrendingUp,
  X
} from 'lucide-react'

interface TreeManagerProps {
  orchardId: string
  gardenId: string
  onTreeSelect?: (tree: OrchardTree) => void
}

export default function TreeManager({ orchardId, gardenId, onTreeSelect }: TreeManagerProps) {
  const [trees, setTrees] = useState<OrchardTree[]>([])
  const [filteredTrees, setFilteredTrees] = useState<OrchardTree[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<TreeSearchCriteria>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTree, setSelectedTree] = useState<OrchardTree | null>(null)
  const [showTreeModal, setShowTreeModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')

  useEffect(() => {
    loadTrees()
  }, [orchardId])

  useEffect(() => {
    applyFilters()
  }, [trees, searchTerm, filters])

  const loadTrees = async () => {
    try {
      setLoading(true)
      const treesData = await orchardService.getOrchardTrees(orchardId)
      setTrees(treesData)
    } catch (error) {
      console.error('Error loading trees:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...trees]

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(tree => 
        tree.treeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tree.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tree.rootstock && tree.rootstock.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Health status filter
    if (filters.healthStatus && filters.healthStatus.length > 0) {
      filtered = filtered.filter(tree => filters.healthStatus!.includes(tree.healthStatus))
    }

    // Vigor level filter
    if (filters.vigorLevel && filters.vigorLevel.length > 0) {
      filtered = filtered.filter(tree => filters.vigorLevel!.includes(tree.vigorLevel))
    }

    // Needs attention filters
    if (filters.needsPruning !== undefined) {
      filtered = filtered.filter(tree => tree.needsPruning === filters.needsPruning)
    }
    if (filters.needsTreatment !== undefined) {
      filtered = filtered.filter(tree => tree.needsTreatment === filters.needsTreatment)
    }

    // Location filters
    if (filters.location?.zoneId) {
      filtered = filtered.filter(tree => tree.zoneId === filters.location!.zoneId)
    }
    if (filters.location?.fieldRowId) {
      filtered = filtered.filter(tree => tree.fieldRowId === filters.location!.fieldRowId)
    }
    if (filters.location?.rowNumber) {
      filtered = filtered.filter(tree => tree.rowNumber === filters.location!.rowNumber)
    }

    setFilteredTrees(filtered)
  }

  const getHealthStatusColor = (status: TreeHealthStatus) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'stressed': return 'text-yellow-600 bg-yellow-100'
      case 'diseased': return 'text-red-600 bg-red-100'
      case 'pest_damage': return 'text-orange-600 bg-orange-100'
      case 'weather_damage': return 'text-purple-600 bg-purple-100'
      case 'dead': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthStatusIcon = (status: TreeHealthStatus) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} />
      case 'stressed': return <AlertTriangle size={16} />
      case 'diseased': return <AlertTriangle size={16} />
      case 'pest_damage': return <AlertTriangle size={16} />
      case 'weather_damage': return <AlertTriangle size={16} />
      case 'dead': return <X size={16} />
      default: return <AlertTriangle size={16} />
    }
  }

  const getVigorColor = (vigor: TreeVigorLevel) => {
    switch (vigor) {
      case 'very_low': return 'text-red-600'
      case 'low': return 'text-orange-600'
      case 'normal': return 'text-green-600'
      case 'high': return 'text-blue-600'
      case 'excessive': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const handleTreeClick = (tree: OrchardTree) => {
    setSelectedTree(tree)
    setShowTreeModal(true)
    onTreeSelect?.(tree)
  }

  const handleAddTree = async (treeData: Partial<OrchardTree>) => {
    try {
      const newTree = await orchardService.createTree({
        ...treeData,
        orchardId,
        gardenId,
        isActive: true,
        needsPruning: false,
        needsTreatment: false,
        needsReplacement: false,
        cumulativeYieldKg: 0
      } as Omit<OrchardTree, 'id' | 'createdAt' | 'updatedAt'>)
      
      setTrees(prev => [...prev, newTree])
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding tree:', error)
    }
  }

  const handleBatchAddTrees = async (batchData: {
    rowNumber: number
    startPosition: number
    count: number
    variety: string
    rootstock: string
    plantingDate: string
    prefix: string
  }) => {
    try {
      const treesToCreate: Omit<OrchardTree, 'id' | 'createdAt' | 'updatedAt'>[] = []
      for (let i = 0; i < batchData.count; i++) {
        const pos = batchData.startPosition + i
        treesToCreate.push({
          orchardId,
          gardenId,
          treeNumber: `${batchData.prefix}${batchData.rowNumber}-${pos}`,
          variety: batchData.variety,
          rootstock: batchData.rootstock || undefined,
          plantingDate: batchData.plantingDate || undefined,
          rowNumber: batchData.rowNumber,
          positionInRow: pos,
          healthStatus: 'healthy' as const,
          vigorLevel: 'normal' as const,
          productivityStatus: 'productive' as const,
          isActive: true,
          needsPruning: false,
          needsTreatment: false,
          needsReplacement: false,
          cumulativeYieldKg: 0,
        } as any)
      }
      const created = await orchardService.bulkCreateTrees(treesToCreate as any)
      setTrees(prev => [...prev, ...created])
      setShowBatchModal(false)
    } catch (error) {
      console.error('Error batch creating trees:', error)
      alert('Errore nella creazione batch. Riprova.')
    }
  }

  const renderFilters = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stato Salute
          </label>
          <select
            multiple
            value={filters.healthStatus || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value) as TreeHealthStatus[]
              setFilters(prev => ({ ...prev, healthStatus: values }))
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
            size={3}
          >
            <option value="healthy">Sano</option>
            <option value="stressed">Stressato</option>
            <option value="diseased">Malato</option>
            <option value="pest_damage">Danni Parassiti</option>
            <option value="weather_damage">Danni Climatici</option>
            <option value="dead">Morto</option>
          </select>
        </div>

        {/* Vigor Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vigoria
          </label>
          <select
            multiple
            value={filters.vigorLevel || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value) as TreeVigorLevel[]
              setFilters(prev => ({ ...prev, vigorLevel: values }))
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
            size={3}
          >
            <option value="very_low">Molto Bassa</option>
            <option value="low">Bassa</option>
            <option value="normal">Normale</option>
            <option value="high">Alta</option>
            <option value="excessive">Eccessiva</option>
          </select>
        </div>

        {/* Attention Needed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Necessita Attenzione
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.needsPruning === true}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  needsPruning: e.target.checked ? true : undefined 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Necessita Potatura</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.needsTreatment === true}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  needsTreatment: e.target.checked ? true : undefined 
                }))}
                className="mr-2"
              />
              <span className="text-sm">Necessita Trattamento</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilters({})}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Pulisci Filtri
        </button>
        <button
          onClick={() => setShowFilters(false)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Applica
        </button>
      </div>
    </div>
  )

  const renderTreeCard = (tree: OrchardTree) => (
    <div
      key={tree.id}
      onClick={() => handleTreeClick(tree)}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TreePine className="text-green-600" size={20} />
          <div>
            <h3 className="font-semibold text-gray-900">{tree.treeNumber}</h3>
            <p className="text-sm text-gray-600">{tree.variety}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getHealthStatusColor(tree.healthStatus)}`}>
          {getHealthStatusIcon(tree.healthStatus)}
          {tree.healthStatus === 'healthy' ? 'Sano' : 
           tree.healthStatus === 'stressed' ? 'Stressato' :
           tree.healthStatus === 'diseased' ? 'Malato' :
           tree.healthStatus === 'pest_damage' ? 'Parassiti' :
           tree.healthStatus === 'weather_damage' ? 'Danni Clima' : 'Morto'}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {tree.rootstock && (
          <div className="flex items-center gap-2">
            <TreePine size={14} />
            <span>Portinnesto: {tree.rootstock}</span>
          </div>
        )}
        
        {tree.rowNumber && tree.positionInRow && (
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>Fila {tree.rowNumber}, Pos. {tree.positionInRow}</span>
          </div>
        )}

        {tree.treeAgeYears && (
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{tree.treeAgeYears} anni</span>
          </div>
        )}

        {tree.lastHarvestKg && (
          <div className="flex items-center gap-2">
            <TrendingUp size={14} />
            <span>Ultima raccolta: {tree.lastHarvestKg} kg</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Activity size={14} />
          <span className={getVigorColor(tree.vigorLevel)}>
            Vigoria: {tree.vigorLevel === 'very_low' ? 'Molto Bassa' :
                     tree.vigorLevel === 'low' ? 'Bassa' :
                     tree.vigorLevel === 'normal' ? 'Normale' :
                     tree.vigorLevel === 'high' ? 'Alta' : 'Eccessiva'}
          </span>
        </div>
      </div>

      {(tree.needsPruning || tree.needsTreatment || tree.needsReplacement) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-1">
            {tree.needsPruning && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                Potatura
              </span>
            )}
            {tree.needsTreatment && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                Trattamento
              </span>
            )}
            {tree.needsReplacement && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                Sostituzione
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderTreeList = (tree: OrchardTree) => (
    <div
      key={tree.id}
      onClick={() => handleTreeClick(tree)}
      className="bg-white border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TreePine className="text-green-600" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900">{tree.treeNumber}</h3>
            <p className="text-sm text-gray-600">{tree.variety}</p>
            {tree.rootstock && (
              <p className="text-xs text-gray-500">Portinnesto: {tree.rootstock}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            {tree.rowNumber && tree.positionInRow && (
              <p className="text-gray-600">Fila {tree.rowNumber}, Pos. {tree.positionInRow}</p>
            )}
            {tree.treeAgeYears && (
              <p className="text-gray-500">{tree.treeAgeYears} anni</p>
            )}
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getHealthStatusColor(tree.healthStatus)}`}>
            {getHealthStatusIcon(tree.healthStatus)}
            {tree.healthStatus === 'healthy' ? 'Sano' : 
             tree.healthStatus === 'stressed' ? 'Stressato' :
             tree.healthStatus === 'diseased' ? 'Malato' :
             tree.healthStatus === 'pest_damage' ? 'Parassiti' :
             tree.healthStatus === 'weather_damage' ? 'Danni Clima' : 'Morto'}
          </div>

          {(tree.needsPruning || tree.needsTreatment) && (
            <div className="flex gap-1">
              {tree.needsPruning && (
                <span className="w-2 h-2 bg-orange-500 rounded-full" title="Necessita Potatura"></span>
              )}
              {tree.needsTreatment && (
                <span className="w-2 h-2 bg-red-500 rounded-full" title="Necessita Trattamento"></span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

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
          <h2 className="text-2xl font-bold text-gray-900">Gestione Alberi</h2>
          <p className="text-gray-600">
            {filteredTrees.length} di {trees.length} alberi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={16} />
            Crea Fila
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Aggiungi Albero
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per numero albero, varietà, portinnesto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filtri
          </button>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Griglia
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Lista
            </button>
          </div>
        </div>

        {showFilters && renderFilters()}
      </div>

      {/* Trees Display */}
      {filteredTrees.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {trees.length === 0 ? 'Nessun albero registrato' : 'Nessun albero trovato'}
          </h3>
          <p className="text-gray-600 mb-4">
            {trees.length === 0 
              ? 'Inizia aggiungendo il primo albero al frutteto'
              : 'Prova a modificare i filtri di ricerca'
            }
          </p>
          {trees.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Aggiungi Primo Albero
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTrees.map(renderTreeCard)}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTrees.map(renderTreeList)}
            </div>
          )}
        </div>
      )}

      {/* Tree Detail Modal */}
      {showTreeModal && selectedTree && (
        <TreeDetailModal
          tree={selectedTree}
          onClose={() => {
            setShowTreeModal(false)
            setSelectedTree(null)
          }}
          onUpdate={(updatedTree) => {
            setTrees(prev => prev.map(t => t.id === updatedTree.id ? updatedTree : t))
            setSelectedTree(updatedTree)
          }}
        />
      )}

      {/* Add Tree Modal */}
      {showAddModal && (
        <AddTreeModal
          orchardId={orchardId}
          gardenId={gardenId}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTree}
        />
      )}

      {/* Batch Add Trees Modal */}
      {showBatchModal && (
        <BatchAddTreeModal
          existingTrees={trees}
          onClose={() => setShowBatchModal(false)}
          onBatchAdd={handleBatchAddTrees}
        />
      )}
    </div>
  )
}

// Batch Add Trees Modal Component
interface BatchAddTreeModalProps {
  existingTrees: OrchardTree[]
  onClose: () => void
  onBatchAdd: (data: {
    rowNumber: number
    startPosition: number
    count: number
    variety: string
    rootstock: string
    plantingDate: string
    prefix: string
  }) => void
}

function BatchAddTreeModal({ existingTrees, onClose, onBatchAdd }: BatchAddTreeModalProps) {
  const [rowNumber, setRowNumber] = useState(1)
  const [count, setCount] = useState(10)
  const [variety, setVariety] = useState('')
  const [rootstock, setRootstock] = useState('')
  const [plantingDate, setPlantingDate] = useState('')
  const [prefix, setPrefix] = useState('')
  const [loading, setLoading] = useState(false)

  // Calcola la prossima fila disponibile
  useEffect(() => {
    if (existingTrees.length > 0) {
      const maxRow = Math.max(...existingTrees.map(t => t.rowNumber || 0))
      setRowNumber(maxRow + 1)
    }
  }, [existingTrees])

  // Calcola la posizione di partenza per la fila selezionata
  const startPosition = (() => {
    const treesInRow = existingTrees.filter(t => t.rowNumber === rowNumber)
    if (treesInRow.length === 0) return 1
    return Math.max(...treesInRow.map(t => t.positionInRow || 0)) + 1
  })()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!variety.trim()) {
      alert('Inserisci la varietà')
      return
    }
    if (count < 1 || count > 500) {
      alert('Numero alberi deve essere tra 1 e 500')
      return
    }
    setLoading(true)
    onBatchAdd({
      rowNumber,
      startPosition,
      count,
      variety: variety.trim(),
      rootstock: rootstock.trim(),
      plantingDate,
      prefix: prefix.trim(),
    })
  }

  // Existing rows summary
  const rowSummary = new Map<number, number>()
  existingTrees.forEach(t => {
    if (t.rowNumber) {
      rowSummary.set(t.rowNumber, (rowSummary.get(t.rowNumber) || 0) + 1)
    }
  })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Crea Fila di Alberi</h2>
            <p className="text-blue-100 text-sm">Genera automaticamente una fila intera</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Riepilogo file esistenti */}
          {rowSummary.size > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">File esistenti:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(rowSummary.entries()).sort((a, b) => a[0] - b[0]).map(([row, count]) => (
                  <span key={row} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Fila {row}: {count} alberi
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Numero Fila */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero Fila *</label>
              <input type="number" required value={rowNumber}
                onChange={(e) => setRowNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1" />
              <p className="text-xs text-gray-500 mt-1">
                {existingTrees.filter(t => t.rowNumber === rowNumber).length > 0
                  ? `Fila ${rowNumber} ha già ${existingTrees.filter(t => t.rowNumber === rowNumber).length} alberi (si aggiunge da pos. ${startPosition})`
                  : `Nuova fila ${rowNumber}`}
              </p>
            </div>

            {/* Numero Alberi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero Alberi *</label>
              <input type="number" required value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1" max="500" />
            </div>

            {/* Varietà */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Varietà *</label>
              <input type="text" required value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="es. Golden Delicious, Frantoio, Sangiovese" />
            </div>

            {/* Portinnesto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portinnesto</label>
              <input type="text" value={rootstock}
                onChange={(e) => setRootstock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="es. M9, M26, Franco" />
            </div>

            {/* Data Impianto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Impianto</label>
              <input type="date" value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Prefisso Numerazione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prefisso (opzionale)</label>
              <input type="text" value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="es. A, F1-" />
              <p className="text-xs text-gray-500 mt-1">Esempio: prefisso "A" → A1-1, A1-2, A1-3...</p>
            </div>
          </div>

          {/* Anteprima */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Anteprima creazione</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Verranno creati <strong>{count}</strong> alberi nella <strong>Fila {rowNumber}</strong></p>
              <p>Posizioni: da <strong>{startPosition}</strong> a <strong>{startPosition + count - 1}</strong></p>
              <p>Numerazione: <strong>{prefix}{rowNumber}-{startPosition}</strong> → <strong>{prefix}{rowNumber}-{startPosition + count - 1}</strong></p>
              <p>Varietà: <strong>{variety || '(da specificare)'}</strong>{rootstock ? ` su ${rootstock}` : ''}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Annulla
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {loading ? 'Creazione...' : `Crea ${count} Alberi`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Tree Detail Modal Component
interface TreeDetailModalProps {
  tree: OrchardTree
  onClose: () => void
  onUpdate: (tree: OrchardTree) => void
}

function TreeDetailModal({ tree, onClose, onUpdate }: TreeDetailModalProps) {
  const [photos, setPhotos] = useState<TreePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'history'>('info')

  useEffect(() => {
    loadTreePhotos()
  }, [tree.id])

  const loadTreePhotos = async () => {
    try {
      setLoading(true)
      const photosData = await orchardService.getTreePhotos(tree.id)
      setPhotos(photosData)
    } catch (error) {
      console.error('Error loading tree photos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Albero {tree.treeNumber}</h2>
            <p className="text-green-100">{tree.variety}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'info' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Informazioni
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'photos' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Foto ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'history' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Storico
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <TreeInfoTab tree={tree} onUpdate={onUpdate} />
          )}
          {activeTab === 'photos' && (
            <TreePhotosTab tree={tree} photos={photos} onPhotosUpdate={setPhotos} />
          )}
          {activeTab === 'history' && (
            <TreeHistoryTab tree={tree} />
          )}
        </div>
      </div>
    </div>
  )
}

// Tree Info Tab Component
function TreeInfoTab({ tree, onUpdate }: { tree: OrchardTree; onUpdate: (tree: OrchardTree) => void }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState(tree)

  const handleSave = async () => {
    try {
      const updatedTree = await orchardService.updateTree(tree.id, formData)
      onUpdate(updatedTree)
      setEditing(false)
    } catch (error) {
      console.error('Error updating tree:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Informazioni Albero</h3>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {editing ? <CheckCircle size={16} /> : <Edit size={16} />}
          {editing ? 'Salva' : 'Modifica'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Informazioni Base</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero Albero
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.treeNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, treeNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{tree.treeNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Varietà
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.variety}
                onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{tree.variety}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portinnesto
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.rootstock || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rootstock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{tree.rootstock || 'Non specificato'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Impianto
            </label>
            {editing ? (
              <input
                type="date"
                value={formData.plantingDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">
                {tree.plantingDate ? new Date(tree.plantingDate).toLocaleDateString('it-IT') : 'Non specificata'}
              </p>
            )}
          </div>
        </div>

        {/* Status and Health */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Stato e Salute</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stato Salute
            </label>
            {editing ? (
              <select
                value={formData.healthStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, healthStatus: e.target.value as TreeHealthStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              >
                <option value="healthy">Sano</option>
                <option value="stressed">Stressato</option>
                <option value="diseased">Malato</option>
                <option value="pest_damage">Danni Parassiti</option>
                <option value="weather_damage">Danni Climatici</option>
                <option value="dead">Morto</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {tree.healthStatus === 'healthy' ? 'Sano' : 
                 tree.healthStatus === 'stressed' ? 'Stressato' :
                 tree.healthStatus === 'diseased' ? 'Malato' :
                 tree.healthStatus === 'pest_damage' ? 'Danni Parassiti' :
                 tree.healthStatus === 'weather_damage' ? 'Danni Climatici' : 'Morto'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigoria
            </label>
            {editing ? (
              <select
                value={formData.vigorLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, vigorLevel: e.target.value as TreeVigorLevel }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              >
                <option value="very_low">Molto Bassa</option>
                <option value="low">Bassa</option>
                <option value="normal">Normale</option>
                <option value="high">Alta</option>
                <option value="excessive">Eccessiva</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {tree.vigorLevel === 'very_low' ? 'Molto Bassa' :
                 tree.vigorLevel === 'low' ? 'Bassa' :
                 tree.vigorLevel === 'normal' ? 'Normale' :
                 tree.vigorLevel === 'high' ? 'Alta' : 'Eccessiva'}
              </p>
            )}
          </div>

          {/* Attention Flags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Necessita Attenzione
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editing ? formData.needsPruning : tree.needsPruning}
                  onChange={(e) => editing && setFormData(prev => ({ ...prev, needsPruning: e.target.checked }))}
                  disabled={!editing}
                  className="mr-2"
                />
                <span className="text-sm">Necessita Potatura</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editing ? formData.needsTreatment : tree.needsTreatment}
                  onChange={(e) => editing && setFormData(prev => ({ ...prev, needsTreatment: e.target.checked }))}
                  disabled={!editing}
                  className="mr-2"
                />
                <span className="text-sm">Necessita Trattamento</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editing ? formData.needsReplacement : tree.needsReplacement}
                  onChange={(e) => editing && setFormData(prev => ({ ...prev, needsReplacement: e.target.checked }))}
                  disabled={!editing}
                  className="mr-2"
                />
                <span className="text-sm">Necessita Sostituzione</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Production Data */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Dati Produttivi</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">Resa Attesa</div>
            <div className="text-2xl font-bold text-green-900">
              {tree.expectedYieldKg || 0} kg
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">Ultima Raccolta</div>
            <div className="text-2xl font-bold text-blue-900">
              {tree.lastHarvestKg || 0} kg
            </div>
            {tree.lastHarvestDate && (
              <div className="text-xs text-blue-600 mt-1">
                {new Date(tree.lastHarvestDate).toLocaleDateString('it-IT')}
              </div>
            )}
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 mb-1">Totale Cumulativo</div>
            <div className="text-2xl font-bold text-purple-900">
              {tree.cumulativeYieldKg || 0} kg
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note
        </label>
        {editing ? (
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
            rows={4}
            placeholder="Note sull'albero..."
          />
        ) : (
          <p className="text-gray-900 bg-gray-50 p-3 rounded">
            {tree.notes || 'Nessuna nota'}
          </p>
        )}
      </div>
    </div>
  )
}

// Tree Photos Tab Component
function TreePhotosTab({ tree, photos, onPhotosUpdate }: { 
  tree: OrchardTree; 
  photos: TreePhoto[]; 
  onPhotosUpdate: (photos: TreePhoto[]) => void 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Foto Albero</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Camera size={16} />
          Aggiungi Foto
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Camera className="mx-auto text-gray-400 mb-4" size={48} />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Nessuna foto</h4>
          <p className="text-gray-600 mb-4">Aggiungi foto per documentare lo stato dell'albero</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Camera size={20} />
            Scatta Prima Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <Camera className="text-gray-400" size={32} />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {photo.photoType === 'overview' ? 'Panoramica' :
                   photo.photoType === 'trunk' ? 'Tronco' :
                   photo.photoType === 'canopy' ? 'Chioma' :
                   photo.photoType === 'fruit' ? 'Frutti' :
                   photo.photoType === 'disease' ? 'Malattia' : 'Altro'}
                </div>
                <div className="text-xs text-gray-600">
                  {new Date(photo.takenDate).toLocaleDateString('it-IT')}
                </div>
                {photo.notes && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {photo.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Tree History Tab Component
function TreeHistoryTab({ tree }: { tree: OrchardTree }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Storico Interventi</h3>
      
      <div className="text-center py-12 border border-gray-200 rounded-lg">
        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Nessuno storico</h4>
        <p className="text-gray-600">Gli interventi su questo albero appariranno qui</p>
      </div>
    </div>
  )
}

// Add Tree Modal Component
interface AddTreeModalProps {
  orchardId: string
  gardenId: string
  onClose: () => void
  onAdd: (tree: Partial<OrchardTree>) => void
}

function AddTreeModal({ orchardId, gardenId, onClose, onAdd }: AddTreeModalProps) {
  const [formData, setFormData] = useState<Partial<OrchardTree>>({
    treeNumber: '',
    variety: '',
    rootstock: '',
    healthStatus: 'healthy',
    vigorLevel: 'normal',
    productivityStatus: 'productive'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Aggiungi Nuovo Albero</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
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
                onChange={(e) => setFormData(prev => ({ ...prev, treeNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                placeholder="es. A001, 1-1, ..."
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
                onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                placeholder="es. Golden Delicious"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portinnesto
              </label>
              <input
                type="text"
                value={formData.rootstock || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rootstock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                placeholder="es. M9, M26, Franco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Impianto
              </label>
              <input
                type="date"
                value={formData.plantingDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fila
              </label>
              <input
                type="number"
                value={formData.rowNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rowNumber: parseInt(e.target.value) || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                placeholder="1"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posizione in Fila
              </label>
              <input
                type="number"
                value={formData.positionInRow || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, positionInRow: parseInt(e.target.value) || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Note sull'albero..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Aggiungi Albero
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}