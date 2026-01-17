'use client'

import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  Leaf,
  Beaker,
  Shield,
  Clock,
  Euro,
  Droplets
} from 'lucide-react'
import { Garden } from '@/types'
import { 
  FertilizerProduct, 
  TreatmentProduct, 
  NutritionFilters 
} from '@/types/nutrition'
import { advancedNutritionService } from '@/services/advancedNutritionService'

interface ProductManagerProps {
  garden: Garden
}

type ProductType = 'fertilizer' | 'treatment'

export default function ProductManager({ garden }: ProductManagerProps) {
  const [activeTab, setActiveTab] = useState<ProductType>('fertilizer')
  const [fertilizers, setFertilizers] = useState<FertilizerProduct[]>([])
  const [treatments, setTreatments] = useState<TreatmentProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedProduct, setSelectedProduct] = useState<FertilizerProduct | TreatmentProduct | null>(null)
  const [filters, setFilters] = useState<NutritionFilters>({})

  useEffect(() => {
    loadProducts()
  }, [garden.id, activeTab])

  const loadProducts = async () => {
    try {
      setLoading(true)
      if (activeTab === 'fertilizer') {
        const data = await advancedNutritionService.getFertilizerProducts(garden.id, filters)
        setFertilizers(data)
      } else {
        const data = await advancedNutritionService.getTreatmentProducts(garden.id, filters)
        setTreatments(data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEditProduct = (product: FertilizerProduct | TreatmentProduct) => {
    setSelectedProduct(product)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleViewProduct = (product: FertilizerProduct | TreatmentProduct) => {
    setSelectedProduct(product)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return
    
    try {
      if (activeTab === 'fertilizer') {
        await advancedNutritionService.deleteFertilizerProduct(productId)
      } else {
        await advancedNutritionService.deleteTreatmentProduct(productId)
      }
      await loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = (activeTab === 'fertilizer' ? fertilizers : treatments).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'organic': return <Leaf className="text-green-600" size={16} />
      case 'mineral': return <Beaker className="text-blue-600" size={16} />
      case 'chemical': return <Beaker className="text-red-600" size={16} />
      case 'pesticide': return <Shield className="text-red-600" size={16} />
      case 'fungicide': return <Shield className="text-orange-600" size={16} />
      case 'herbicide': return <Shield className="text-yellow-600" size={16} />
      default: return <Package className="text-gray-600" size={16} />
    }
  }

  const getStockStatus = (product: FertilizerProduct | TreatmentProduct) => {
    if (!product.currentStock || !product.stockUnit) return null
    
    const stock = product.currentStock
    if (stock <= 0) {
      return { status: 'empty', color: 'text-red-600 bg-red-100', label: 'Esaurito' }
    } else if (stock <= 10) {
      return { status: 'low', color: 'text-yellow-600 bg-yellow-100', label: 'Scorte basse' }
    } else {
      return { status: 'good', color: 'text-green-600 bg-green-100', label: 'Disponibile' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione Prodotti</h1>
              <p className="text-gray-600">Catalogo fertilizzanti e trattamenti fitosanitari</p>
            </div>
          </div>
          <button
            onClick={handleCreateProduct}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Nuovo Prodotto
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('fertilizer')}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'fertilizer'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Leaf size={16} />
              Fertilizzanti ({fertilizers.length})
            </button>
            <button
              onClick={() => setActiveTab('treatment')}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'treatment'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield size={16} />
              Trattamenti ({treatments.length})
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={`Cerca ${activeTab === 'fertilizer' ? 'fertilizzanti' : 'trattamenti'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              Filtri
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun {activeTab === 'fertilizer' ? 'fertilizzante' : 'trattamento'} trovato
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Prova a modificare i criteri di ricerca' : 'Inizia aggiungendo il primo prodotto'}
              </p>
              <button
                onClick={handleCreateProduct}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Aggiungi Prodotto
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product)
                const isFertilizer = 'fertilizerType' in product
                
                return (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {isFertilizer 
                            ? getProductTypeIcon((product as FertilizerProduct).fertilizerType)
                            : getProductTypeIcon((product as TreatmentProduct).treatmentType)
                          }
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                            {product.organicApproved && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Leaf size={12} className="mr-1" />
                                Bio
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {product.brand && (
                              <span className="flex items-center gap-1">
                                <Package size={12} />
                                {product.brand}
                              </span>
                            )}
                            
                            {isFertilizer && (product as FertilizerProduct).npkRatio && (
                              <span className="flex items-center gap-1">
                                <Beaker size={12} />
                                NPK {(product as FertilizerProduct).npkRatio}
                              </span>
                            )}
                            
                            {!isFertilizer && (product as TreatmentProduct).activeIngredient && (
                              <span className="flex items-center gap-1">
                                <Beaker size={12} />
                                {(product as TreatmentProduct).activeIngredient}
                              </span>
                            )}
                            
                            {product.costPerUnit && (
                              <span className="flex items-center gap-1">
                                <Euro size={12} />
                                €{product.costPerUnit}/{product.stockUnit}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {stockStatus && (
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              {product.currentStock} {product.stockUnit}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Visualizza dettagli"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Modifica"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          mode={modalMode}
          productType={activeTab}
          product={selectedProduct}
          garden={garden}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            loadProducts()
          }}
        />
      )}
    </div>
  )
}

// Product Modal Component
interface ProductModalProps {
  mode: 'create' | 'edit' | 'view'
  productType: ProductType
  product: FertilizerProduct | TreatmentProduct | null
  garden: Garden
  onClose: () => void
  onSave: () => void
}

function ProductModal({ mode, productType, product, garden, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData(product)
    } else {
      // Initialize with default values
      setFormData({
        gardenId: garden.id,
        name: '',
        brand: '',
        organicApproved: false,
        isActive: true,
        ...(productType === 'fertilizer' ? {
          fertilizerType: 'organic',
          category: 'base',
          recommendedDosage: 0,
          dosageUnit: 'g_per_sqm',
          applicationMethod: 'soil'
        } : {
          treatmentType: 'pesticide',
          activeIngredient: '',
          concentration: 0,
          concentrationUnit: 'percentage',
          recommendedDosage: 0,
          dosageUnit: 'ml_per_liter',
          applicationMethod: 'spray',
          preharvest_interval_days: 0,
          reentry_interval_hours: 0,
          beeHazard: false,
          aquaticHazard: false
        })
      })
    }
  }, [product, productType, garden.id])

  const handleSave = async () => {
    try {
      setSaving(true)
      
      if (productType === 'fertilizer') {
        if (mode === 'create') {
          await advancedNutritionService.createFertilizerProduct(formData)
        } else {
          await advancedNutritionService.updateFertilizerProduct(formData.id, formData)
        }
      } else {
        if (mode === 'create') {
          await advancedNutritionService.createTreatmentProduct(formData)
        } else {
          await advancedNutritionService.updateTreatmentProduct(formData.id, formData)
        }
      }
      
      onSave()
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setSaving(false)
    }
  }

  const isReadOnly = mode === 'view'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {mode === 'create' ? 'Nuovo' : mode === 'edit' ? 'Modifica' : 'Dettagli'} {' '}
              {productType === 'fertilizer' ? 'Fertilizzante' : 'Trattamento'}
            </h2>
            <p className="text-sm text-gray-600">
              {mode === 'create' ? 'Aggiungi un nuovo prodotto al catalogo' : 
               mode === 'edit' ? 'Modifica le informazioni del prodotto' :
               'Visualizza i dettagli del prodotto'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Prodotto *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                placeholder="Es: NPK 20-20-20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                placeholder="Es: Compo, Valagro"
              />
            </div>
          </div>

          {/* Type-specific fields */}
          {productType === 'fertilizer' ? (
            <FertilizerFields 
              formData={formData} 
              setFormData={setFormData} 
              isReadOnly={isReadOnly} 
            />
          ) : (
            <TreatmentFields 
              formData={formData} 
              setFormData={setFormData} 
              isReadOnly={isReadOnly} 
            />
          )}

          {/* Organic Certification */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="organicApproved"
              checked={formData.organicApproved || false}
              onChange={(e) => setFormData(prev => ({ ...prev, organicApproved: e.target.checked }))}
              disabled={isReadOnly}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="organicApproved" className="text-sm font-medium text-gray-700">
              Approvato per agricoltura biologica
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isReadOnly ? 'Chiudi' : 'Annulla'}
          </button>
          
          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={saving || !formData.name}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salva
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Fertilizer-specific fields
function FertilizerFields({ formData, setFormData, isReadOnly }: any) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo Fertilizzante
          </label>
          <select
            value={formData.fertilizerType || 'organic'}
            onChange={(e) => setFormData(prev => ({ ...prev, fertilizerType: e.target.value }))}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          >
            <option value="organic">Organico</option>
            <option value="mineral">Minerale</option>
            <option value="chemical">Chimico</option>
            <option value="mixed">Misto</option>
            <option value="bio_stimulant">Biostimolante</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rapporto NPK
          </label>
          <input
            type="text"
            value={formData.npkRatio || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, npkRatio: e.target.value }))}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            placeholder="Es: 20-20-20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dosaggio Raccomandato
          </label>
          <input
            type="number"
            value={formData.recommendedDosage || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, recommendedDosage: parseFloat(e.target.value) || 0 }))}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            min="0"
            step="0.1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unità Dosaggio
          </label>
          <select
            value={formData.dosageUnit || 'g_per_sqm'}
            onChange={(e) => setFormData(prev => ({ ...prev, dosageUnit: e.target.value }))}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          >
            <option value="g_per_sqm">g/m²</option>
            <option value="ml_per_liter">ml/L</option>
            <option value="kg_per_ha">kg/ha</option>
            <option value="l_per_ha">L/ha</option>
          </select>
        </div>
      </div>
    </>
  )
}

// Treatment-specific fields
function TreatmentFields({ formData, setFormData, isReadOnly }: any) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo Trattamento
          </label>
          <select
            value={formData.treatmentType || 'pesticide'}
            onChange={(e) => setFormData(prev => ({ ...prev, treatmentType: e.target.value }))}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          >
            <option value="pesticide">Pesticida</option>
            <option value="fungicide">Fungicida</option>
            <option value="herbicide">Erbicida</option>
            <option value="insecticide">Insetticida</option>
            <option value="bactericide">Battericida</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Principio Attivo
          </label>
          <input
            type="text"
            value={formData.activeIngredient || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, activeIngredient: e.target.value }))}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            placeholder="Es: Rame ossicloruro"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giorni di Carenza
          </label>
          <input
            type="number"
            value={formData.preharvest_interval_days || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, preharvest_interval_days: parseInt(e.target.value) || 0 }))}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ore di Rientro
          </label>
          <input
            type="number"
            value={formData.reentry_interval_hours || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, reentry_interval_hours: parseInt(e.target.value) || 0 }))}
            disabled={isReadOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="beeHazard"
            checked={formData.beeHazard || false}
            onChange={(e) => setFormData(prev => ({ ...prev, beeHazard: e.target.checked }))}
            disabled={isReadOnly}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="beeHazard" className="text-sm font-medium text-gray-700">
            Pericoloso per le api
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="aquaticHazard"
            checked={formData.aquaticHazard || false}
            onChange={(e) => setFormData(prev => ({ ...prev, aquaticHazard: e.target.checked }))}
            disabled={isReadOnly}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="aquaticHazard" className="text-sm font-medium text-gray-700">
            Pericoloso per ambiente acquatico
          </label>
        </div>
      </div>
    </>
  )
}