'use client'

import { useState, useEffect } from 'react'
import { Garden } from '@/types'
import { 
  TreePine, Plus, X, Edit2, Trash2, Calendar, MapPin, 
  Package, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react'
import { saplingService } from '@/services/saplingService'
import { Sapling } from '@/types/sapling'

interface SaplingDashboardProps {
  garden: Garden
  plantName?: string
  variety?: string
}

export default function SaplingDashboard({ garden, plantName, variety }: SaplingDashboardProps) {
  const [saplings, setSaplings] = useState<Sapling[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'nursery' | 'planted' | 'ready'>('all')
  
  const [newSapling, setNewSapling] = useState<Partial<Sapling>>({
    plantName: plantName || '',
    variety: variety || '',
    source: 'nursery',
    status: 'nursery',
    purchaseDate: new Date().toISOString().split('T')[0],
    quantity: 1,
    gardenId: garden.id
  })

  useEffect(() => {
    loadSaplings()
  }, [garden.id])

  useEffect(() => {
    if (plantName) {
      setNewSapling(prev => ({ ...prev, plantName }))
    }
    if (variety) {
      setNewSapling(prev => ({ ...prev, variety }))
    }
  }, [plantName, variety])

  const loadSaplings = async () => {
    try {
      setLoading(true)
      const loaded = await saplingService.getSaplings(garden.id)
      setSaplings(loaded)
    } catch (error) {
      console.error('Error loading saplings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newSapling.plantName) return
    
    try {
      const sapling: Omit<Sapling, 'id'> = {
        plantName: newSapling.plantName,
        variety: newSapling.variety || '',
        source: newSapling.source || 'nursery',
        status: newSapling.status || 'nursery',
        purchaseDate: newSapling.purchaseDate || new Date().toISOString().split('T')[0],
        quantity: newSapling.quantity || 1,
        supplier: newSapling.supplier,
        rootstockType: newSapling.rootstockType,
        plantingDate: newSapling.plantingDate,
        location: newSapling.location,
        notes: newSapling.notes,
        gardenId: garden.id
      }
      
      await saplingService.addSapling(sapling)
      await loadSaplings()
      setIsAdding(false)
      setNewSapling({
        plantName: '',
        variety: '',
        source: 'nursery',
        status: 'nursery',
        purchaseDate: new Date().toISOString().split('T')[0],
        quantity: 1,
        gardenId: garden.id
      })
    } catch (error) {
      console.error('Error adding sapling:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo alberello?')) return
    
    try {
      await saplingService.deleteSapling(id)
      await loadSaplings()
    } catch (error) {
      console.error('Error deleting sapling:', error)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Sapling>) => {
    try {
      await saplingService.updateSapling(id, updates)
      await loadSaplings()
      setEditingId(null)
    } catch (error) {
      console.error('Error updating sapling:', error)
    }
  }

  const getFilteredSaplings = () => {
    switch (filter) {
      case 'nursery':
        return saplings.filter(s => s.status === 'nursery')
      case 'planted':
        return saplings.filter(s => s.status === 'planted')
      case 'ready':
        return saplings.filter(s => s.status === 'ready_to_plant')
      default:
        return saplings
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      nursery: { label: 'In Vivaio', color: 'bg-blue-100 text-blue-800', icon: '🏪' },
      ready_to_plant: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: '✅' },
      planted: { label: 'Piantato', color: 'bg-gray-100 text-gray-800', icon: '🌳' }
    }
    return badges[status as keyof typeof badges] || badges.nursery
  }

  const filteredSaplings = getFilteredSaplings()

  // Statistics
  const stats = {
    total: saplings.length,
    nursery: saplings.filter(s => s.status === 'nursery').length,
    ready: saplings.filter(s => s.status === 'ready_to_plant').length,
    planted: saplings.filter(s => s.status === 'planted').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento alberelli...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TreePine className="text-green-600" />
              Gestione Alberelli
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Alberelli da vivaio, portinnesti e preparazione impianti
            </p>
          </div>
          
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Aggiungi Alberello
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Totale</p>
                <p className="text-xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <TreePine className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">In Vivaio</p>
                <p className="text-xl font-bold text-orange-900">{stats.nursery}</p>
              </div>
              <Package className="text-orange-500" size={24} />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Pronti</p>
                <p className="text-xl font-bold text-green-900">{stats.ready}</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Piantati</p>
                <p className="text-xl font-bold text-gray-900">{stats.planted}</p>
              </div>
              <MapPin className="text-gray-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'nursery', 'ready', 'planted'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterType === 'all' && 'Tutti'}
              {filterType === 'nursery' && 'In Vivaio'}
              {filterType === 'ready' && 'Pronti'}
              {filterType === 'planted' && 'Piantati'}
            </button>
          ))}
        </div>
      </div>

      {/* Saplings List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {filteredSaplings.length > 0 ? (
            <div className="space-y-4">
              {filteredSaplings.map((sapling) => {
                const statusBadge = getStatusBadge(sapling.status)
                
                return (
                  <div key={sapling.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{sapling.plantName}</h3>
                          {sapling.variety && (
                            <span className="text-sm text-gray-600">({sapling.variety})</span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.icon} {statusBadge.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Quantità:</span>
                            <p className="font-medium">{sapling.quantity}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Fonte:</span>
                            <p className="font-medium">{sapling.source === 'nursery' ? 'Vivaio' : 'Proprio'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Acquisto:</span>
                            <p className="font-medium">{new Date(sapling.purchaseDate).toLocaleDateString('it-IT')}</p>
                          </div>
                          {sapling.supplier && (
                            <div>
                              <span className="text-gray-500">Fornitore:</span>
                              <p className="font-medium">{sapling.supplier}</p>
                            </div>
                          )}
                        </div>
                        
                        {sapling.rootstockType && (
                          <div className="mb-2">
                            <span className="text-gray-500 text-sm">Portinnesto:</span>
                            <span className="ml-2 text-sm font-medium">{sapling.rootstockType}</span>
                          </div>
                        )}
                        
                        {sapling.plantingDate && (
                          <div className="mb-2">
                            <span className="text-gray-500 text-sm">Data impianto:</span>
                            <span className="ml-2 text-sm font-medium">{new Date(sapling.plantingDate).toLocaleDateString('it-IT')}</span>
                          </div>
                        )}
                        
                        {sapling.location && (
                          <div className="mb-2">
                            <span className="text-gray-500 text-sm">Posizione:</span>
                            <span className="ml-2 text-sm font-medium">{sapling.location}</span>
                          </div>
                        )}
                        
                        {sapling.notes && (
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
                            {sapling.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setEditingId(sapling.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sapling.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Action buttons based on status */}
                    {sapling.status === 'nursery' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleUpdate(sapling.id, { status: 'ready_to_plant' })}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Segna come Pronto
                        </button>
                      </div>
                    )}
                    
                    {sapling.status === 'ready_to_plant' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                        <button
                          onClick={() => handleUpdate(sapling.id, { 
                            status: 'planted',
                            plantingDate: new Date().toISOString().split('T')[0]
                          })}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Segna come Piantato
                        </button>
                        <button
                          onClick={() => handleUpdate(sapling.id, { status: 'nursery' })}
                          className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          Rimetti in Vivaio
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter !== 'all' ? 'Nessun alberello in questa categoria' : 'Nessun alberello'}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter !== 'all' 
                  ? 'Prova a cambiare filtro per vedere altri alberelli'
                  : 'Inizia aggiungendo il tuo primo alberello da vivaio'
                }
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aggiungi Primo Alberello
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {isAdding ? 'Aggiungi Alberello' : 'Modifica Alberello'}
              </h3>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setEditingId(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              if (isAdding) {
                handleAdd()
              } else if (editingId) {
                const formData = new FormData(e.currentTarget)
                const updates = {
                  plantName: formData.get('plantName') as string,
                  variety: formData.get('variety') as string,
                  source: formData.get('source') as 'nursery' | 'own',
                  status: formData.get('status') as 'nursery' | 'ready_to_plant' | 'planted',
                  purchaseDate: formData.get('purchaseDate') as string,
                  quantity: parseInt(formData.get('quantity') as string),
                  supplier: formData.get('supplier') as string,
                  rootstockType: formData.get('rootstockType') as string,
                  plantingDate: formData.get('plantingDate') as string || undefined,
                  location: formData.get('location') as string,
                  notes: formData.get('notes') as string
                }
                handleUpdate(editingId, updates)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pianta *</label>
                  <input
                    name="plantName"
                    type="text"
                    defaultValue={isAdding ? newSapling.plantName : saplings.find(s => s.id === editingId)?.plantName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Varietà</label>
                  <input
                    name="variety"
                    type="text"
                    defaultValue={isAdding ? newSapling.variety : saplings.find(s => s.id === editingId)?.variety}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
                    <select
                      name="source"
                      defaultValue={isAdding ? newSapling.source : saplings.find(s => s.id === editingId)?.source}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="nursery">Vivaio</option>
                      <option value="own">Proprio</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                    <select
                      name="status"
                      defaultValue={isAdding ? newSapling.status : saplings.find(s => s.id === editingId)?.status}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="nursery">In Vivaio</option>
                      <option value="ready_to_plant">Pronto per Impianto</option>
                      <option value="planted">Piantato</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Acquisto</label>
                    <input
                      name="purchaseDate"
                      type="date"
                      defaultValue={isAdding ? newSapling.purchaseDate : saplings.find(s => s.id === editingId)?.purchaseDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantità</label>
                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      defaultValue={isAdding ? newSapling.quantity : saplings.find(s => s.id === editingId)?.quantity}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornitore</label>
                  <input
                    name="supplier"
                    type="text"
                    defaultValue={isAdding ? newSapling.supplier : saplings.find(s => s.id === editingId)?.supplier}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Portinnesto</label>
                  <input
                    name="rootstockType"
                    type="text"
                    defaultValue={isAdding ? newSapling.rootstockType : saplings.find(s => s.id === editingId)?.rootstockType}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Es. M9, M26, Franco..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Impianto</label>
                  <input
                    name="plantingDate"
                    type="date"
                    defaultValue={isAdding ? newSapling.plantingDate : saplings.find(s => s.id === editingId)?.plantingDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posizione</label>
                  <input
                    name="location"
                    type="text"
                    defaultValue={isAdding ? newSapling.location : saplings.find(s => s.id === editingId)?.location}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Es. Filare A, Settore Nord..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={isAdding ? newSapling.notes : saplings.find(s => s.id === editingId)?.notes}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Note opzionali..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingId(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isAdding ? 'Aggiungi' : 'Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}