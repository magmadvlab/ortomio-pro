'use client'

import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Minus,
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  ShoppingCart,
  Warehouse,
  Clock,
  MapPin
} from 'lucide-react'
import { Garden } from '@/types'
import { 
  ProductInventory, 
  StockMovement,
  FertilizerProduct,
  TreatmentProduct
} from '@/types/nutrition'
import { advancedNutritionService } from '@/services/advancedNutritionService'
import { format, parseISO, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'

interface InventoryManagerProps {
  garden: Garden
}

type ViewMode = 'inventory' | 'movements' | 'alerts'
type StockLevel = 'all' | 'low' | 'empty' | 'expiring'

export default function InventoryManager({ garden }: InventoryManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('inventory')
  const [inventory, setInventory] = useState<ProductInventory[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<(FertilizerProduct | TreatmentProduct)[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState<StockLevel>('all')
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null)

  useEffect(() => {
    loadInventoryData()
  }, [garden.id])

  const loadInventoryData = async () => {
    try {
      setLoading(true)
      
      const [inventoryData, productsData] = await Promise.all([
        advancedNutritionService.getProductInventory(garden.id),
        Promise.all([
          advancedNutritionService.getFertilizerProducts(garden.id),
          advancedNutritionService.getTreatmentProducts(garden.id)
        ])
      ])
      
      setInventory(inventoryData)
      setProducts([...productsData[0], ...productsData[1]])
      
    } catch (error) {
      console.error('Error loading inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockUpdate = async (productId: string, quantity: number, type: 'purchase' | 'usage' | 'adjustment', notes?: string) => {
    try {
      await advancedNutritionService.updateProductStock(productId, quantity, type, notes)
      await loadInventoryData()
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const getStockStatus = (item: ProductInventory) => {
    const stock = item.currentStock
    const minStock = item.minimumStock
    
    if (stock <= 0) {
      return { status: 'empty', color: 'text-red-600 bg-red-100', label: 'Esaurito', priority: 'critical' }
    } else if (stock <= minStock) {
      return { status: 'low', color: 'text-yellow-600 bg-yellow-100', label: 'Scorte basse', priority: 'high' }
    } else if (stock <= minStock * 1.5) {
      return { status: 'medium', color: 'text-blue-600 bg-blue-100', label: 'Scorte medie', priority: 'medium' }
    } else {
      return { status: 'good', color: 'text-green-600 bg-green-100', label: 'Disponibile', priority: 'low' }
    }
  }

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null
    
    const daysToExpiry = differenceInDays(parseISO(expiryDate), new Date())
    
    if (daysToExpiry < 0) {
      return { status: 'expired', color: 'text-red-600 bg-red-100', label: 'Scaduto', days: Math.abs(daysToExpiry) }
    } else if (daysToExpiry <= 30) {
      return { status: 'expiring', color: 'text-yellow-600 bg-yellow-100', label: 'In scadenza', days: daysToExpiry }
    } else if (daysToExpiry <= 90) {
      return { status: 'warning', color: 'text-blue-600 bg-blue-100', label: 'Attenzione', days: daysToExpiry }
    }
    
    return null
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    switch (stockFilter) {
      case 'low':
        return item.currentStock <= item.minimumStock
      case 'empty':
        return item.currentStock <= 0
      case 'expiring':
        const expiryStatus = getExpiryStatus(item.expiryDate)
        return expiryStatus && (expiryStatus.status === 'expiring' || expiryStatus.status === 'expired')
      default:
        return true
    }
  })

  const lowStockCount = inventory.filter(item => item.currentStock <= item.minimumStock).length
  const emptyStockCount = inventory.filter(item => item.currentStock <= 0).length
  const expiringCount = inventory.filter(item => {
    const expiryStatus = getExpiryStatus(item.expiryDate)
    return expiryStatus && (expiryStatus.status === 'expiring' || expiryStatus.status === 'expired')
  }).length

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <Warehouse className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione Inventario</h1>
              <p className="text-gray-600">Monitora scorte e movimenti di magazzino</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStockModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Carico Merce
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={16} />
              Esporta
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              <p className="text-sm text-gray-600">Prodotti Totali</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              lowStockCount > 0 ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <AlertTriangle className={`${
                lowStockCount > 0 ? 'text-yellow-600' : 'text-green-600'
              }`} size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
              <p className="text-sm text-gray-600">Scorte Basse</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              emptyStockCount > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <TrendingDown className={`${
                emptyStockCount > 0 ? 'text-red-600' : 'text-green-600'
              }`} size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{emptyStockCount}</p>
              <p className="text-sm text-gray-600">Esauriti</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">€{totalValue.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Valore Totale</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setViewMode('inventory')}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                viewMode === 'inventory'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package size={16} />
              Inventario ({inventory.length})
            </button>
            <button
              onClick={() => setViewMode('movements')}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                viewMode === 'movements'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 size={16} />
              Movimenti
            </button>
            <button
              onClick={() => setViewMode('alerts')}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                viewMode === 'alerts'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertTriangle size={16} />
              Alert ({lowStockCount + emptyStockCount + expiringCount})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cerca prodotti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            {viewMode === 'inventory' && (
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockLevel)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tutti i livelli</option>
                <option value="low">Scorte basse</option>
                <option value="empty">Esauriti</option>
                <option value="expiring">In scadenza</option>
              </select>
            )}
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              Filtri
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : viewMode === 'inventory' ? (
            <InventoryView 
              inventory={filteredInventory}
              onStockUpdate={handleStockUpdate}
              getStockStatus={getStockStatus}
              getExpiryStatus={getExpiryStatus}
            />
          ) : viewMode === 'movements' ? (
            <MovementsView movements={movements} />
          ) : (
            <AlertsView 
              inventory={inventory}
              getStockStatus={getStockStatus}
              getExpiryStatus={getExpiryStatus}
            />
          )}
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && (
        <StockUpdateModal
          products={products}
          onClose={() => setShowStockModal(false)}
          onUpdate={handleStockUpdate}
        />
      )}
    </div>
  )
}

// Inventory View Component
interface InventoryViewProps {
  inventory: ProductInventory[]
  onStockUpdate: (productId: string, quantity: number, type: 'purchase' | 'usage' | 'adjustment', notes?: string) => void
  getStockStatus: (item: ProductInventory) => any
  getExpiryStatus: (expiryDate?: string) => any
}

function InventoryView({ inventory, onStockUpdate, getStockStatus, getExpiryStatus }: InventoryViewProps) {
  if (inventory.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun prodotto trovato</h3>
        <p className="text-gray-600">Inizia aggiungendo prodotti al tuo inventario</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {inventory.map((item) => {
        const stockStatus = getStockStatus(item)
        const expiryStatus = getExpiryStatus(item.expiryDate)
        
        return (
          <div key={item.productId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">
                  <Package className={`${
                    item.productType === 'fertilizer' ? 'text-green-600' : 'text-blue-600'
                  }`} size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{item.productName}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.productType === 'fertilizer' ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100'
                    }`}>
                      {item.productType === 'fertilizer' ? 'Fertilizzante' : 'Trattamento'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BarChart3 size={12} />
                      {item.currentStock} / {item.maximumStock} {item.stockUnit}
                    </span>
                    
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />
                      €{item.costPerUnit} per {item.stockUnit}
                    </span>
                    
                    {item.supplier && (
                      <span className="flex items-center gap-1">
                        <ShoppingCart size={12} />
                        {item.supplier}
                      </span>
                    )}
                    
                    {item.storageLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {item.storageLocation}
                      </span>
                    )}
                  </div>
                  
                  {expiryStatus && (
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${expiryStatus.color}`}>
                        <Clock size={10} className="mr-1" />
                        {expiryStatus.label} ({expiryStatus.days} giorni)
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.label}
                  </span>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    Valore: €{item.totalValue.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onStockUpdate(item.productId, 10, 'purchase', 'Carico manuale')}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Aggiungi stock"
                >
                  <Plus size={16} />
                </button>
                
                <button
                  onClick={() => onStockUpdate(item.productId, 5, 'usage', 'Uso manuale')}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Rimuovi stock"
                >
                  <Minus size={16} />
                </button>
                
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit size={16} />
                </button>
              </div>
            </div>
            
            {/* Stock Level Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    stockStatus.status === 'empty' ? 'bg-red-500' :
                    stockStatus.status === 'low' ? 'bg-yellow-500' :
                    stockStatus.status === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min((item.currentStock / item.maximumStock) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min: {item.minimumStock}</span>
                <span>Attuale: {item.currentStock}</span>
                <span>Max: {item.maximumStock}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Movements View Component
function MovementsView({ movements }: { movements: StockMovement[] }) {
  return (
    <div className="text-center py-12">
      <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Movimenti di Magazzino</h3>
      <p className="text-gray-600">Funzionalità in sviluppo - Storico movimenti e analisi</p>
    </div>
  )
}

// Alerts View Component
interface AlertsViewProps {
  inventory: ProductInventory[]
  getStockStatus: (item: ProductInventory) => any
  getExpiryStatus: (expiryDate?: string) => any
}

function AlertsView({ inventory, getStockStatus, getExpiryStatus }: AlertsViewProps) {
  const alerts = inventory.map(item => {
    const stockStatus = getStockStatus(item)
    const expiryStatus = getExpiryStatus(item.expiryDate)
    
    const itemAlerts = []
    
    if (stockStatus.status === 'empty') {
      itemAlerts.push({
        type: 'stock_empty',
        priority: 'critical',
        message: `${item.productName} è esaurito`,
        action: 'Riordina immediatamente',
        item
      })
    } else if (stockStatus.status === 'low') {
      itemAlerts.push({
        type: 'stock_low',
        priority: 'high',
        message: `${item.productName} ha scorte basse`,
        action: 'Considera il riordino',
        item
      })
    }
    
    if (expiryStatus) {
      if (expiryStatus.status === 'expired') {
        itemAlerts.push({
          type: 'expired',
          priority: 'critical',
          message: `${item.productName} è scaduto da ${expiryStatus.days} giorni`,
          action: 'Rimuovi dal magazzino',
          item
        })
      } else if (expiryStatus.status === 'expiring') {
        itemAlerts.push({
          type: 'expiring',
          priority: 'high',
          message: `${item.productName} scade tra ${expiryStatus.days} giorni`,
          action: 'Usa prioritariamente',
          item
        })
      }
    }
    
    return itemAlerts
  }).flat()

  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical')
  const highAlerts = alerts.filter(alert => alert.priority === 'high')

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun alert attivo</h3>
        <p className="text-gray-600">Tutti i prodotti sono in buone condizioni</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {criticalAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={20} />
            Alert Critici ({criticalAlerts.length})
          </h3>
          <div className="space-y-3">
            {criticalAlerts.map((alert, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">{alert.message}</p>
                    <p className="text-sm text-red-700 mt-1">{alert.action}</p>
                  </div>
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    Risolvi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {highAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-yellow-600" size={20} />
            Alert Importanti ({highAlerts.length})
          </h3>
          <div className="space-y-3">
            {highAlerts.map((alert, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-900">{alert.message}</p>
                    <p className="text-sm text-yellow-700 mt-1">{alert.action}</p>
                  </div>
                  <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
                    Gestisci
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Stock Update Modal Component
interface StockUpdateModalProps {
  products: (FertilizerProduct | TreatmentProduct)[]
  onClose: () => void
  onUpdate: (productId: string, quantity: number, type: 'purchase' | 'usage' | 'adjustment', notes?: string) => void
}

function StockUpdateModal({ products, onClose, onUpdate }: StockUpdateModalProps) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [movementType, setMovementType] = useState<'purchase' | 'usage' | 'adjustment'>('purchase')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProductId && quantity > 0) {
      onUpdate(selectedProductId, quantity, movementType, notes)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Aggiorna Stock</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prodotto
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Seleziona prodotto...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({('fertilizerType' in product) ? 'Fertilizzante' : 'Trattamento'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Movimento
            </label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="purchase">Carico (Acquisto)</option>
              <option value="usage">Scarico (Utilizzo)</option>
              <option value="adjustment">Rettifica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantità
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              min="0"
              step="0.1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (opzionale)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              rows={3}
              placeholder="Aggiungi note sul movimento..."
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Aggiorna Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}