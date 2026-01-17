'use client'

import { useState, useEffect } from 'react'
import { Garden } from '@/types'
import { 
  Package, Plus, X, Edit2, Trash2, AlertTriangle, CheckCircle, 
  Filter, Search, Calendar, TrendingDown, Box, ExternalLink
} from 'lucide-react'
import { seedInventoryService } from '@/services/seedInventoryService'
import { SeedPacket } from '@/types/seedInventory'

interface SeedInventoryProps {
  garden: Garden
  plantName?: string
  variety?: string
}

export default function SeedInventory({ garden, plantName, variety }: SeedInventoryProps) {
  const [packets, setPackets] = useState<SeedPacket[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'expiring' | 'low' | 'expired'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newPacket, setNewPacket] = useState<Partial<SeedPacket>>({
    varietyName: plantName || '',
    speciesName: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryYear: new Date().getFullYear() + 2,
    isOpen: false,
    quantityRemaining: 'High',
    gardenId: garden.id
  })

  useEffect(() => {
    loadPackets()
  }, [garden.id])

  useEffect(() => {
    if (plantName) {
      setNewPacket(prev => ({ ...prev, varietyName: plantName }))
    }
    if (variety) {
      setNewPacket(prev => ({ ...prev, speciesName: variety }))
    }
  }, [plantName, variety])

  const loadPackets = async () => {
    try {
      setLoading(true)
      const loaded = await seedInventoryService.getSeedPackets(garden.id)
      setPackets(loaded)
    } catch (error) {
      console.error('Error loading seed packets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newPacket.varietyName || !newPacket.speciesName) return
    
    try {
      const packet: Omit<SeedPacket, 'id'> = {
        varietyId: newPacket.varietyName.toLowerCase().replace(/\s+/g, '_'),
        varietyName: newPacket.varietyName,
        speciesName: newPacket.speciesName,
        purchaseDate: newPacket.purchaseDate || new Date().toISOString().split('T')[0],
        expiryYear: newPacket.expiryYear || new Date().getFullYear() + 2,
        isOpen: newPacket.isOpen || false,
        quantityRemaining: newPacket.quantityRemaining || 'High',
        source: newPacket.source || 'purchased',
        supplier: newPacket.supplier,
        notes: newPacket.notes,
        gardenId: garden.id
      }
      
      await seedInventoryService.addSeedPacket(packet)
      await loadPackets()
      setIsAdding(false)
      setNewPacket({
        varietyName: '',
        speciesName: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryYear: new Date().getFullYear() + 2,
        isOpen: false,
        quantityRemaining: 'High',
        gardenId: garden.id
      })
    } catch (error) {
      console.error('Error adding seed packet:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo pacchetto di semi?')) return
    
    try {
      await seedInventoryService.deleteSeedPacket(id)
      await loadPackets()
    } catch (error) {
      console.error('Error deleting seed packet:', error)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<SeedPacket>) => {
    try {
      await seedInventoryService.updateSeedPacket(id, updates)
      await loadPackets()
      setEditingId(null)
    } catch (error) {
      console.error('Error updating seed packet:', error)
    }
  }

  const getFilteredPackets = () => {
    let filtered = packets

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(packet => 
        packet.varietyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        packet.speciesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        packet.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    switch (filter) {
      case 'expiring':
        filtered = filtered.filter(packet => {
          const currentYear = new Date().getFullYear()
          return packet.expiryYear <= currentYear + 1
        })
        break
      case 'low':
        filtered = filtered.filter(packet => 
          packet.quantityRemaining === 'Low' || packet.quantityRemaining === 'Empty'
        )
        break
      case 'expired':
        filtered = filtered.filter(packet => {
          const currentYear = new Date().getFullYear()
          return packet.expiryYear < currentYear
        })
        break
    }

    return filtered
  }

  const getQuantityBadge = (quantity: string) => {
    const colors = {
      High: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-orange-100 text-orange-800',
      Empty: 'bg-red-100 text-red-800'
    }
    return colors[quantity as keyof typeof colors] || colors.High
  }

  const getExpiryStatus = (expiryYear: number) => {
    const currentYear = new Date().getFullYear()
    if (expiryYear < currentYear) return { status: 'expired', color: 'text-red-600', icon: '❌' }
    if (expiryYear === currentYear) return { status: 'expiring', color: 'text-orange-600', icon: '⚠️' }
    if (expiryYear === currentYear + 1) return { status: 'soon', color: 'text-yellow-600', icon: '⏰' }
    return { status: 'good', color: 'text-green-600', icon: '✅' }
  }

  const filteredPackets = getFilteredPackets()

  // Statistics
  const stats = {
    total: packets.length,
    expiring: packets.filter(p => {
      const currentYear = new Date().getFullYear()
      return p.expiryYear <= currentYear + 1
    }).length,
    low: packets.filter(p => p.quantityRemaining === 'Low' || p.quantityRemaining === 'Empty').length,
    expired: packets.filter(p => {
      const currentYear = new Date().getFullYear()
      return p.expiryYear < currentYear
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento banca semi...</p>
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
              <Package className="text-green-600" />
              Banca dei Semi
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Gestisci l'inventario dei tuoi semi, varietà e scadenze
            </p>
          </div>
          
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Aggiungi Semi
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Totale Pacchetti</p>
                <p className="text-xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Box className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">In Scadenza</p>
                <p className="text-xl font-bold text-yellow-900">{stats.expiring}</p>
              </div>
              <Calendar className="text-yellow-500" size={24} />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Scorte Basse</p>
                <p className="text-xl font-bold text-orange-900">{stats.low}</p>
              </div>
              <TrendingDown className="text-orange-500" size={24} />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Scaduti</p>
                <p className="text-xl font-bold text-red-900">{stats.expired}</p>
              </div>
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cerca per varietà, specie o fornitore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {(['all', 'expiring', 'low', 'expired'] as const).map((filterType) => (
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
                {filterType === 'expiring' && 'In Scadenza'}
                {filterType === 'low' && 'Scorte Basse'}
                {filterType === 'expired' && 'Scaduti'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Seed Packets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {filteredPackets.length > 0 ? (
            <div className="space-y-4">
              {filteredPackets.map((packet) => {
                const expiryStatus = getExpiryStatus(packet.expiryYear)
                
                return (
                  <div key={packet.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{packet.varietyName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuantityBadge(packet.quantityRemaining)}`}>
                            {packet.quantityRemaining}
                          </span>
                          <span className={`text-sm ${expiryStatus.color}`}>
                            {expiryStatus.icon} {packet.expiryYear}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Specie:</strong> {packet.speciesName}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Acquisto:</span>
                            <p className="font-medium">{new Date(packet.purchaseDate).toLocaleDateString('it-IT')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Fonte:</span>
                            <p className="font-medium">{packet.source === 'purchased' ? 'Acquistato' : 'Raccolto'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Stato:</span>
                            <p className="font-medium">{packet.isOpen ? 'Aperto' : 'Sigillato'}</p>
                          </div>
                          {packet.supplier && (
                            <div>
                              <span className="text-gray-500">Fornitore:</span>
                              <p className="font-medium">{packet.supplier}</p>
                            </div>
                          )}
                        </div>
                        
                        {packet.notes && (
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
                            {packet.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setEditingId(packet.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(packet.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filter !== 'all' ? 'Nessun risultato' : 'Nessun pacchetto di semi'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia aggiungendo il tuo primo pacchetto di semi'
                }
              </p>
              {!searchTerm && filter === 'all' && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aggiungi Primi Semi
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
                {isAdding ? 'Aggiungi Pacchetto Semi' : 'Modifica Pacchetto'}
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
                  varietyName: formData.get('varietyName') as string,
                  speciesName: formData.get('speciesName') as string,
                  purchaseDate: formData.get('purchaseDate') as string,
                  expiryYear: parseInt(formData.get('expiryYear') as string),
                  quantityRemaining: formData.get('quantityRemaining') as 'High' | 'Medium' | 'Low' | 'Empty',
                  source: formData.get('source') as 'purchased' | 'harvested',
                  supplier: formData.get('supplier') as string,
                  isOpen: formData.get('isOpen') === 'on',
                  notes: formData.get('notes') as string
                }
                handleUpdate(editingId, updates)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Varietà *</label>
                  <input
                    name="varietyName"
                    type="text"
                    defaultValue={isAdding ? newPacket.varietyName : packets.find(p => p.id === editingId)?.varietyName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specie *</label>
                  <input
                    name="speciesName"
                    type="text"
                    defaultValue={isAdding ? newPacket.speciesName : packets.find(p => p.id === editingId)?.speciesName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Acquisto</label>
                    <input
                      name="purchaseDate"
                      type="date"
                      defaultValue={isAdding ? newPacket.purchaseDate : packets.find(p => p.id === editingId)?.purchaseDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anno Scadenza</label>
                    <input
                      name="expiryYear"
                      type="number"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 10}
                      defaultValue={isAdding ? newPacket.expiryYear : packets.find(p => p.id === editingId)?.expiryYear}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantità</label>
                    <select
                      name="quantityRemaining"
                      defaultValue={isAdding ? newPacket.quantityRemaining : packets.find(p => p.id === editingId)?.quantityRemaining}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="High">Alta</option>
                      <option value="Medium">Media</option>
                      <option value="Low">Bassa</option>
                      <option value="Empty">Vuoto</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
                    <select
                      name="source"
                      defaultValue={isAdding ? newPacket.source : packets.find(p => p.id === editingId)?.source}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="purchased">Acquistato</option>
                      <option value="harvested">Raccolto</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornitore</label>
                  <input
                    name="supplier"
                    type="text"
                    defaultValue={isAdding ? newPacket.supplier : packets.find(p => p.id === editingId)?.supplier}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      name="isOpen"
                      type="checkbox"
                      defaultChecked={isAdding ? newPacket.isOpen : packets.find(p => p.id === editingId)?.isOpen}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Pacchetto aperto</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={isAdding ? newPacket.notes : packets.find(p => p.id === editingId)?.notes}
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