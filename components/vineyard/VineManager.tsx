'use client'

import React, { useState, useEffect } from 'react'
import { VineyardVine, VineSearchCriteria, VineHealthStatus, VineVigorLevel, VineProductivityStatus } from '@/types/vineyard'
import { vineyardService } from '@/services/vineyardService'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { createUnifiedOperationsService } from '@/services/unifiedOperationsService'
import { createOperationContextService } from '@/services/operationContextService'
import { 
  Grape, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Camera, 
  Edit, 
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Droplets,
  Scissors,
  Info,
  QrCode,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface VineManagerProps {
  vineyardId: string
  onCreateVine: () => void
  onEditVine: (vine: VineyardVine) => void
}

export default function VineManager({ vineyardId, onCreateVine, onEditVine }: VineManagerProps) {
  const [vines, setVines] = useState<VineyardVine[]>([])
  const [filteredVines, setFilteredVines] = useState<VineyardVine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVine, setSelectedVine] = useState<VineyardVine | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { storageProvider } = useStorage()
  const unifiedOperationsService = createUnifiedOperationsService(storageProvider)
  const operationContextService = createOperationContextService()
  const [detailTab, setDetailTab] = useState<'info' | 'history'>('info')
  const [operationsLoading, setOperationsLoading] = useState(false)
  const [vineOperations, setVineOperations] = useState<any[]>([])
  const [activeOperationTab, setActiveOperationTab] = useState<'all' | 'watering' | 'fertilizing' | 'treatment' | 'work'>('all')
  const [showQuickEntry, setShowQuickEntry] = useState(false)
  const [entryMode, setEntryMode] = useState<'manual' | 'iot'>('manual')
  const [entryType, setEntryType] = useState<'watering' | 'fertilizing' | 'treatment' | 'work'>('watering')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [entryTime, setEntryTime] = useState(new Date().toTimeString().slice(0, 5))
  const [entryQuantity, setEntryQuantity] = useState('')
  const [entryUnit, setEntryUnit] = useState('L')
  const [entryDurationMinutes, setEntryDurationMinutes] = useState('')
  const [entryProduct, setEntryProduct] = useState('')
  const [entrySubtype, setEntrySubtype] = useState('')
  const [entryNotes, setEntryNotes] = useState('')
  const [savingEntry, setSavingEntry] = useState(false)

  const [filters, setFilters] = useState<VineSearchCriteria>({
    healthStatus: [],
    vigorLevel: [],
    productivityStatus: [],
    needsPruning: undefined,
    needsTreatment: undefined,
    harvestReady: undefined
  })

  useEffect(() => {
    loadVines()
  }, [vineyardId])

  useEffect(() => {
    applyFilters()
  }, [vines, searchTerm, filters])

  useEffect(() => {
    if (!selectedVine?.id) return
    loadVineOperations(selectedVine.id)
  }, [selectedVine?.id])

  useEffect(() => {
    if (entryType === 'watering') {
      setEntryUnit('L')
      return
    }
    if (entryType === 'fertilizing') {
      setEntryUnit('g')
      return
    }
    if (entryType === 'treatment') {
      setEntryUnit('ml')
      return
    }
    setEntryUnit('sessione')
  }, [entryType])

  const loadVines = async () => {
    try {
      setLoading(true)
      const vinesData = await vineyardService.getVineyardVines(vineyardId, filters)
      setVines(vinesData)
    } catch (error) {
      console.error('Error loading vines:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...vines]

    // Filtro per testo di ricerca
    if (searchTerm) {
      filtered = filtered.filter(vine =>
        vine.vineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vine.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vine.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtri per stato
    if (filters.healthStatus && filters.healthStatus.length > 0) {
      filtered = filtered.filter(vine => filters.healthStatus!.includes(vine.healthStatus))
    }

    if (filters.vigorLevel && filters.vigorLevel.length > 0) {
      filtered = filtered.filter(vine => filters.vigorLevel!.includes(vine.vigorLevel))
    }

    if (filters.productivityStatus && filters.productivityStatus.length > 0) {
      filtered = filtered.filter(vine => filters.productivityStatus!.includes(vine.productivityStatus))
    }

    if (filters.needsPruning !== undefined) {
      filtered = filtered.filter(vine => vine.needsPruning === filters.needsPruning)
    }

    if (filters.needsTreatment !== undefined) {
      filtered = filtered.filter(vine => vine.needsTreatment === filters.needsTreatment)
    }

    // Filtro per viti pronte per la vendemmia (basato su Brix)
    if (filters.harvestReady !== undefined) {
      filtered = filtered.filter(vine => {
        if (!vine.sugarContentBrix) return !filters.harvestReady
        return filters.harvestReady ? vine.sugarContentBrix >= 18 : vine.sugarContentBrix < 18
      })
    }

    setFilteredVines(filtered)
  }

  const getHealthStatusIcon = (status: VineHealthStatus) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="text-green-600" size={16} />
      case 'stressed': return <AlertCircle className="text-yellow-600" size={16} />
      case 'diseased': return <AlertCircle className="text-red-600" size={16} />
      case 'pest_damage': return <AlertCircle className="text-orange-600" size={16} />
      case 'weather_damage': return <AlertCircle className="text-blue-600" size={16} />
      case 'dead': return <AlertCircle className="text-gray-600" size={16} />
      default: return <AlertCircle className="text-gray-400" size={16} />
    }
  }

  const getHealthStatusColor = (status: VineHealthStatus) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'stressed': return 'text-yellow-600 bg-yellow-100'
      case 'diseased': return 'text-red-600 bg-red-100'
      case 'pest_damage': return 'text-orange-600 bg-orange-100'
      case 'weather_damage': return 'text-blue-600 bg-blue-100'
      case 'dead': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-400 bg-gray-100'
    }
  }

  const getVigorIcon = (vigor: VineVigorLevel) => {
    switch (vigor) {
      case 'very_low': return <TrendingDown className="text-red-600" size={16} />
      case 'low': return <TrendingDown className="text-orange-600" size={16} />
      case 'normal': return <Activity className="text-green-600" size={16} />
      case 'high': return <TrendingUp className="text-blue-600" size={16} />
      case 'excessive': return <TrendingUp className="text-purple-600" size={16} />
      default: return <Activity className="text-gray-400" size={16} />
    }
  }

  const getProductivityIcon = (status: VineProductivityStatus) => {
    switch (status) {
      case 'young': return <Target className="text-blue-600" size={16} />
      case 'establishing': return <TrendingUp className="text-green-600" size={16} />
      case 'productive': return <CheckCircle className="text-green-600" size={16} />
      case 'peak': return <BarChart3 className="text-purple-600" size={16} />
      case 'declining': return <TrendingDown className="text-orange-600" size={16} />
      case 'senescent': return <TrendingDown className="text-red-600" size={16} />
      default: return <Activity className="text-gray-400" size={16} />
    }
  }

  const handleDeleteVine = async (vineId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa vite?')) {
      try {
        await vineyardService.deleteVine(vineId)
        await loadVines()
      } catch (error) {
        console.error('Error deleting vine:', error)
      }
    }
  }

  const clearFilters = () => {
    setFilters({
      healthStatus: [],
      vigorLevel: [],
      productivityStatus: [],
      needsPruning: undefined,
      needsTreatment: undefined,
      harvestReady: undefined
    })
    setSearchTerm('')
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.healthStatus && filters.healthStatus.length > 0) count++
    if (filters.vigorLevel && filters.vigorLevel.length > 0) count++
    if (filters.productivityStatus && filters.productivityStatus.length > 0) count++
    if (filters.needsPruning !== undefined) count++
    if (filters.needsTreatment !== undefined) count++
    if (filters.harvestReady !== undefined) count++
    return count
  }

  const parseNumber = (value?: string | number | null): number | undefined => {
    if (value === null || value === undefined) return undefined
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
    const normalized = Number(String(value).replace(',', '.'))
    return Number.isFinite(normalized) ? normalized : undefined
  }

  const formatOperationDate = (value?: string) => {
    if (!value) return 'Data non disponibile'
    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return value
    const includeTime = value.includes('T')
    return includeTime
      ? parsedDate.toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : parsedDate.toLocaleDateString('it-IT')
  }

  const getSourceBadge = (operation: any) => {
    const sourceType = operation?.sourceType
      || (operation?.parentOperationTable === 'iot_sensor' ? 'iot' : undefined)
      || (operation?.parentOperationTable === 'manual_orchestrator' ? 'manual' : undefined)
      || (operation?.parentOperationTable === 'orchestrator_auto' ? 'orchestrator_auto' : undefined)
      || (operation?.parentOperationTable === 'watering_logs' ? 'orchestrator_sync' : undefined)
      || (operation?.parentOperationTable === 'fertilizer_logs' ? 'orchestrator_sync' : undefined)
      || (operation?.parentOperationTable === 'treatment_logs' ? 'orchestrator_sync' : undefined)

    if (sourceType === 'iot') return { label: 'IOT', className: 'bg-violet-100 text-violet-700' }
    if (sourceType === 'orchestrator_auto' || sourceType === 'orchestrator_sync') {
      return { label: 'Orchestratore', className: 'bg-indigo-100 text-indigo-700' }
    }
    return { label: 'Manuale', className: 'bg-emerald-100 text-emerald-700' }
  }

  const getOperationIcon = (type: string) => {
    if (type === 'watering') return <Droplets className="text-blue-600" size={18} />
    if (type === 'fertilizing') return <TrendingUp className="text-green-700" size={18} />
    if (type === 'work') return <Scissors className="text-slate-700" size={18} />
    return <AlertCircle className="text-orange-600" size={18} />
  }

  const getOperationLabel = (type: string) => {
    if (type === 'watering') return 'Irrigazione'
    if (type === 'fertilizing') return 'Fertilizzazione'
    if (type === 'treatment') return 'Trattamento'
    if (type === 'work') return 'Lavorazione'
    return 'Intervento'
  }

  const loadVineOperations = async (vineId: string) => {
    try {
      setOperationsLoading(true)
      const operations = await storageProvider?.getPlantOperations?.(vineId) || []
      setVineOperations(operations)
    } catch (error) {
      console.error('Error loading vine operations:', error)
      setVineOperations([])
    } finally {
      setOperationsLoading(false)
    }
  }

  const registerVineOperation = async () => {
    if (!selectedVine) return
    if (!entryDate) {
      alert('Inserisci la data intervento')
      return
    }

    const normalizedQuantity = parseNumber(entryQuantity)
    const normalizedDuration = parseNumber(entryDurationMinutes)
    const normalizedProduct = entryProduct.trim()
    const normalizedSubtype = entrySubtype.trim()
    const normalizedNotes = entryNotes.trim()

    if (entryType === 'watering' && normalizedQuantity === undefined && normalizedDuration === undefined) {
      alert('Per irrigazione inserisci almeno quantità oppure durata')
      return
    }
    if ((entryType === 'fertilizing' || entryType === 'treatment') && !normalizedProduct) {
      alert('Specifica il prodotto/tipo per fertilizzazione o trattamento')
      return
    }

    try {
      setSavingEntry(true)

      const garden = await storageProvider?.getGarden?.(selectedVine.gardenId)
      const timestamp = new Date(`${entryDate}T${entryTime || '12:00'}:00`)
      const validTimestamp = Number.isNaN(timestamp.getTime()) ? new Date() : timestamp

      const vineCoordinates = selectedVine.gpsLatitude !== undefined && selectedVine.gpsLongitude !== undefined
        ? { latitude: Number(selectedVine.gpsLatitude), longitude: Number(selectedVine.gpsLongitude), source: 'vine_gps' as const }
        : undefined

      const gardenCoordinates = garden?.coordinates
        ? {
            latitude: parseNumber(garden.coordinates.latitude ?? garden.coordinates.lat),
            longitude: parseNumber(garden.coordinates.longitude ?? garden.coordinates.lng ?? garden.coordinates.lon),
            source: 'garden_coordinates' as const,
          }
        : undefined

      const coordinates = vineCoordinates || (
        gardenCoordinates?.latitude !== undefined && gardenCoordinates?.longitude !== undefined
          ? { latitude: gardenCoordinates.latitude, longitude: gardenCoordinates.longitude, source: gardenCoordinates.source }
          : undefined
      )

      const context = coordinates
        ? await operationContextService.getOperationContext(coordinates.latitude, coordinates.longitude, validTimestamp)
        : undefined

      const operationDetails: Record<string, any> = {
        durationMinutes: normalizedDuration,
        subtype: normalizedSubtype || undefined,
      }

      const composedNotes = [
        normalizedNotes || undefined,
        normalizedDuration !== undefined ? `Durata ${normalizedDuration} min` : undefined,
      ].filter(Boolean).join(' | ') || undefined

      const result = await unifiedOperationsService.executeUnifiedOperation({
        level: 'plant',
        gardenId: selectedVine.gardenId,
        plantIds: [selectedVine.id],
        operationType: entryType,
        operationDate: entryDate,
        operationTime: entryTime || undefined,
        quantity: normalizedQuantity,
        unit: entryUnit.trim() || undefined,
        productName: normalizedProduct || undefined,
        notes: composedNotes,
        sourceType: entryMode,
        actorType: entryMode,
        propagateToPlants: false,
        contextSnapshot: context
          ? ({ ...context, operationDetails } as any)
          : ({ timestamp: validTimestamp.toISOString(), operationDetails } as any),
        weatherConditions: context
          ? ({
              temp: context.weather.temperature,
              humidity: context.weather.humidity,
              wind: `${context.weather.windSpeed} km/h`,
              condition: context.weather.condition,
              precipitation: context.weather.precipitation,
              pressure: context.weather.pressure,
            } as any)
          : undefined,
        geoSnapshot: {
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          altitudeMeters: garden?.altitudeMeters,
          sunExposure: garden?.sunExposure,
          aspectDirection: garden?.aspectDirection,
          obstacles: Array.isArray(garden?.obstacles) ? garden.obstacles : undefined,
          source: coordinates?.source || 'not_available',
        },
      })

      if (!result.success) {
        alert(`Errore registrazione intervento:\n${(result.errors || ['Errore sconosciuto']).join('\n')}`)
        return
      }

      setEntryMode('manual')
      setEntryType('watering')
      setEntryDate(new Date().toISOString().split('T')[0])
      setEntryTime(new Date().toTimeString().slice(0, 5))
      setEntryQuantity('')
      setEntryDurationMinutes('')
      setEntryProduct('')
      setEntrySubtype('')
      setEntryNotes('')
      setShowQuickEntry(false)
      await loadVineOperations(selectedVine.id)
    } catch (error) {
      console.error('Error registering vine operation:', error)
      alert('Errore nel salvataggio intervento')
    } finally {
      setSavingEntry(false)
    }
  }

  const operationStats = {
    watering: vineOperations.filter(op => op.operationType === 'watering').length,
    fertilizing: vineOperations.filter(op => op.operationType === 'fertilizing').length,
    treatment: vineOperations.filter(op => op.operationType === 'treatment').length,
    work: vineOperations.filter(op => op.operationType === 'work').length,
  }

  const filteredOperations = activeOperationTab === 'all'
    ? vineOperations
    : vineOperations.filter(op => op.operationType === activeOperationTab)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con controlli */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Viti</h2>
          <p className="text-gray-600">
            {filteredVines.length} di {vines.length} viti
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
              </div>
            </button>
          </div>
          
          <button
            onClick={onCreateVine}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus size={16} />
            Nuova Vite
          </button>
        </div>
      </div>

      {/* Barra di ricerca e filtri */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cerca per numero vite, varietà o note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters || getActiveFiltersCount() > 0
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              Filtri
              {getActiveFiltersCount() > 0 && (
                <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
            
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Pulisci
              </button>
            )}
          </div>
        </div>

        {/* Pannello filtri */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Stato di salute */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stato di Salute
                </label>
                <div className="space-y-2">
                  {(['healthy', 'stressed', 'diseased', 'pest_damage', 'weather_damage'] as VineHealthStatus[]).map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.healthStatus?.includes(status) || false}
                        onChange={(e) => {
                          const newHealthStatus = e.target.checked
                            ? [...(filters.healthStatus || []), status]
                            : (filters.healthStatus || []).filter(s => s !== status)
                          setFilters(prev => ({ ...prev, healthStatus: newHealthStatus }))
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {status === 'healthy' ? 'Sana' :
                         status === 'stressed' ? 'Stressata' :
                         status === 'diseased' ? 'Malata' :
                         status === 'pest_damage' ? 'Danni da Parassiti' :
                         'Danni Meteorici'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Vigore */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Livello di Vigore
                </label>
                <div className="space-y-2">
                  {(['very_low', 'low', 'normal', 'high', 'excessive'] as VineVigorLevel[]).map((vigor) => (
                    <label key={vigor} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.vigorLevel?.includes(vigor) || false}
                        onChange={(e) => {
                          const newVigorLevel = e.target.checked
                            ? [...(filters.vigorLevel || []), vigor]
                            : (filters.vigorLevel || []).filter(v => v !== vigor)
                          setFilters(prev => ({ ...prev, vigorLevel: newVigorLevel }))
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {vigor === 'very_low' ? 'Molto Basso' :
                         vigor === 'low' ? 'Basso' :
                         vigor === 'normal' ? 'Normale' :
                         vigor === 'high' ? 'Alto' :
                         'Eccessivo'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Azioni necessarie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Azioni Necessarie
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.needsPruning === true}
                      onChange={(e) => {
                        setFilters(prev => ({ 
                          ...prev, 
                          needsPruning: e.target.checked ? true : undefined 
                        }))
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Necessita Potatura</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.needsTreatment === true}
                      onChange={(e) => {
                        setFilters(prev => ({ 
                          ...prev, 
                          needsTreatment: e.target.checked ? true : undefined 
                        }))
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Necessita Trattamento</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.harvestReady === true}
                      onChange={(e) => {
                        setFilters(prev => ({ 
                          ...prev, 
                          harvestReady: e.target.checked ? true : undefined 
                        }))
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pronta per Vendemmia</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista/Griglia viti */}
      {filteredVines.length === 0 ? (
        <div className="text-center py-12">
          <Grape className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {vines.length === 0 ? 'Nessuna Vite Registrata' : 'Nessuna Vite Trovata'}
          </h3>
          <p className="text-gray-600 mb-4">
            {vines.length === 0 
              ? 'Inizia registrando la tua prima vite'
              : 'Prova a modificare i filtri di ricerca'
            }
          </p>
          {vines.length === 0 && (
            <button
              onClick={onCreateVine}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus size={20} />
              Registra Prima Vite
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredVines.map((vine) => (
            <div
              key={vine.id}
              className={`bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'p-4' : 'p-6'
              }`}
            >
              {viewMode === 'grid' ? (
                // Vista a griglia
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Grape className="text-purple-600" size={24} />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Vite {vine.vineNumber}
                        </h3>
                        <p className="text-sm text-gray-600">{vine.variety}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditVine(vine)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteVine(vine.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Stato di salute */}
                  <div className="flex items-center gap-2">
                    {getHealthStatusIcon(vine.healthStatus)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(vine.healthStatus)}`}>
                      {vine.healthStatus === 'healthy' ? 'Sana' :
                       vine.healthStatus === 'stressed' ? 'Stressata' :
                       vine.healthStatus === 'diseased' ? 'Malata' :
                       vine.healthStatus === 'pest_damage' ? 'Parassiti' :
                       vine.healthStatus === 'weather_damage' ? 'Danni Meteo' :
                       'Morta'}
                    </span>
                  </div>

                  {/* Informazioni principali */}
                  <div className="space-y-2 text-sm">
                    {vine.rowNumber && vine.positionInRow && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          Filare {vine.rowNumber}, Pos. {vine.positionInRow}
                        </span>
                      </div>
                    )}
                    
                    {vine.plantingDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          Piantata: {format(new Date(vine.plantingDate), 'dd/MM/yyyy', { locale: it })}
                        </span>
                      </div>
                    )}
                    
                    {vine.lastHarvestKg && (
                      <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          Ultima raccolta: {vine.lastHarvestKg} kg
                        </span>
                      </div>
                    )}
                    
                    {vine.sugarContentBrix && (
                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          Brix: {vine.sugarContentBrix}°
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Azioni necessarie */}
                  {(vine.needsPruning || vine.needsTreatment || vine.needsReplacement) && (
                    <div className="flex flex-wrap gap-1">
                      {vine.needsPruning && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                          <Scissors size={12} />
                          Potatura
                        </span>
                      )}
                      {vine.needsTreatment && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          <Droplets size={12} />
                          Trattamento
                        </span>
                      )}
                      {vine.needsReplacement && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          <AlertCircle size={12} />
                          Sostituzione
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Vista a lista
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Grape className="text-purple-600" size={20} />
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Vite {vine.vineNumber} - {vine.variety}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {vine.rowNumber && vine.positionInRow && (
                          <span>Filare {vine.rowNumber}, Pos. {vine.positionInRow}</span>
                        )}
                        {vine.plantingDate && (
                          <span>Piantata: {format(new Date(vine.plantingDate), 'dd/MM/yyyy', { locale: it })}</span>
                        )}
                        {vine.lastHarvestKg && (
                          <span>Ultima raccolta: {vine.lastHarvestKg} kg</span>
                        )}
                        {vine.sugarContentBrix && (
                          <span>Brix: {vine.sugarContentBrix}°</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Stato di salute */}
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(vine.healthStatus)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(vine.healthStatus)}`}>
                        {vine.healthStatus === 'healthy' ? 'Sana' :
                         vine.healthStatus === 'stressed' ? 'Stressata' :
                         vine.healthStatus === 'diseased' ? 'Malata' :
                         vine.healthStatus === 'pest_damage' ? 'Parassiti' :
                         vine.healthStatus === 'weather_damage' ? 'Danni Meteo' :
                         'Morta'}
                      </span>
                    </div>
                    
                    {/* Azioni necessarie */}
                    <div className="flex gap-1">
                      {vine.needsPruning && (
                        <span className="p-1 bg-orange-100 text-orange-600 rounded" title="Necessita Potatura">
                          <Scissors size={14} />
                        </span>
                      )}
                      {vine.needsTreatment && (
                        <span className="p-1 bg-red-100 text-red-600 rounded" title="Necessita Trattamento">
                          <Droplets size={14} />
                        </span>
                      )}
                    </div>
                    
                    {/* Azioni */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditVine(vine)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteVine(vine.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal dettagli vite */}
      {selectedVine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Vite {selectedVine.vineNumber} - {selectedVine.variety}
                </h2>
                <button
                  onClick={() => setSelectedVine(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setDetailTab('info')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    detailTab === 'info'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Informazioni
                </button>
                <button
                  onClick={() => setDetailTab('history')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    detailTab === 'history'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Diario Orchestratore
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {detailTab === 'info' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informazioni base */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Informazioni Base</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Varietà:</span>
                          <span className="ml-2 font-medium">{selectedVine.variety}</span>
                        </div>
                        {selectedVine.rootstock && (
                          <div>
                            <span className="text-gray-600">Portinnesto:</span>
                            <span className="ml-2 font-medium">{selectedVine.rootstock}</span>
                          </div>
                        )}
                        {selectedVine.plantingDate && (
                          <div>
                            <span className="text-gray-600">Data Impianto:</span>
                            <span className="ml-2 font-medium">
                              {format(new Date(selectedVine.plantingDate), 'dd MMMM yyyy', { locale: it })}
                            </span>
                          </div>
                        )}
                        {selectedVine.vineAgeYears && (
                          <div>
                            <span className="text-gray-600">Età:</span>
                            <span className="ml-2 font-medium">{selectedVine.vineAgeYears} anni</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stato e produzione */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Stato e Produzione</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Salute:</span>
                          {getHealthStatusIcon(selectedVine.healthStatus)}
                          <span className="font-medium">
                            {selectedVine.healthStatus === 'healthy' ? 'Sana' :
                             selectedVine.healthStatus === 'stressed' ? 'Stressata' :
                             selectedVine.healthStatus === 'diseased' ? 'Malata' :
                             selectedVine.healthStatus === 'pest_damage' ? 'Danni da Parassiti' :
                             selectedVine.healthStatus === 'weather_damage' ? 'Danni Meteorici' :
                             'Morta'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Vigore:</span>
                          {getVigorIcon(selectedVine.vigorLevel)}
                          <span className="font-medium">
                            {selectedVine.vigorLevel === 'very_low' ? 'Molto Basso' :
                             selectedVine.vigorLevel === 'low' ? 'Basso' :
                             selectedVine.vigorLevel === 'normal' ? 'Normale' :
                             selectedVine.vigorLevel === 'high' ? 'Alto' :
                             'Eccessivo'}
                          </span>
                        </div>
                        
                        {selectedVine.lastHarvestKg && (
                          <div>
                            <span className="text-gray-600">Ultima Raccolta:</span>
                            <span className="ml-2 font-medium">{selectedVine.lastHarvestKg} kg</span>
                          </div>
                        )}
                        
                        {selectedVine.cumulativeYieldKg > 0 && (
                          <div>
                            <span className="text-gray-600">Produzione Totale:</span>
                            <span className="ml-2 font-medium">{selectedVine.cumulativeYieldKg} kg</span>
                          </div>
                        )}
                        
                        {selectedVine.sugarContentBrix && (
                          <div>
                            <span className="text-gray-600">Brix:</span>
                            <span className="ml-2 font-medium">{selectedVine.sugarContentBrix}°</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  {selectedVine.notes && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Note</h3>
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                        {selectedVine.notes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-5">
                  <div className="border border-blue-200 rounded-lg bg-blue-50 p-4">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Orchestratore Interventi Vite</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Eventi automatici (IOT) e manuali tracciati nello stesso diario.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowQuickEntry(prev => !prev)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        {showQuickEntry ? 'Chiudi' : 'Registra Intervento'}
                      </button>
                    </div>

                    {showQuickEntry && (
                      <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Origine</label>
                            <select
                              value={entryMode}
                              onChange={(e) => setEntryMode(e.target.value as 'manual' | 'iot')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="manual">Manuale</option>
                              <option value="iot">IOT</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo intervento</label>
                            <select
                              value={entryType}
                              onChange={(e) => setEntryType(e.target.value as 'watering' | 'fertilizing' | 'treatment' | 'work')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="watering">Irrigazione</option>
                              <option value="fertilizing">Fertilizzazione</option>
                              <option value="treatment">Trattamento</option>
                              <option value="work">Lavorazione</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
                            <input
                              type="date"
                              value={entryDate}
                              onChange={(e) => setEntryDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Ora</label>
                            <input
                              type="time"
                              value={entryTime}
                              onChange={(e) => setEntryTime(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quantità</label>
                            <input
                              type="number"
                              step="0.01"
                              value={entryQuantity}
                              onChange={(e) => setEntryQuantity(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Es. 2.5"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Unità</label>
                            <input
                              type="text"
                              value={entryUnit}
                              onChange={(e) => setEntryUnit(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Durata (min)</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={entryDurationMinutes}
                              onChange={(e) => setEntryDurationMinutes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Es. 30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Metodo/Tipo</label>
                            <input
                              type="text"
                              value={entrySubtype}
                              onChange={(e) => setEntrySubtype(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder={entryType === 'watering' ? 'goccia, microjet' : 'preventivo, sfalcio'}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {entryType === 'fertilizing'
                              ? 'Tipo concime'
                              : entryType === 'treatment'
                                ? 'Tipo trattamento fitosanitario'
                                : 'Prodotto (opzionale)'}
                          </label>
                          <input
                            type="text"
                            value={entryProduct}
                            onChange={(e) => setEntryProduct(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder={
                              entryType === 'fertilizing'
                                ? 'Es. NPK 20-20-20'
                                : entryType === 'treatment'
                                  ? 'Es. Rame ossicloruro'
                                  : 'Es. attrezzatura / operatore'
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
                          <textarea
                            rows={2}
                            value={entryNotes}
                            onChange={(e) => setEntryNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Dettagli intervento..."
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={registerVineOperation}
                            disabled={savingEntry}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {savingEntry ? 'Salvataggio...' : 'Salva Intervento'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-b border-gray-200 bg-gray-50 rounded-lg px-3">
                    <div className="flex gap-2 overflow-x-auto">
                      {[
                        { id: 'all', label: 'Tutte', count: vineOperations.length },
                        { id: 'watering', label: 'Irrigazioni', count: operationStats.watering },
                        { id: 'fertilizing', label: 'Fertilizzazioni', count: operationStats.fertilizing },
                        { id: 'treatment', label: 'Trattamenti', count: operationStats.treatment },
                        { id: 'work', label: 'Lavorazioni', count: operationStats.work },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveOperationTab(tab.id as 'all' | 'watering' | 'fertilizing' | 'treatment' | 'work')}
                          className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeOperationTab === tab.id
                              ? 'text-purple-600 border-purple-600'
                              : 'text-gray-500 border-transparent hover:text-gray-700'
                          }`}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ))}
                    </div>
                  </div>

                  {operationsLoading ? (
                    <div className="text-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">Caricamento operazioni...</p>
                    </div>
                  ) : filteredOperations.length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-lg">
                      <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Nessuna operazione registrata</h4>
                      <p className="text-gray-600">
                        {activeOperationTab === 'all'
                          ? 'Non ci sono operazioni per questa vite.'
                          : `Non ci sono ${getOperationLabel(activeOperationTab).toLowerCase()} registrate.`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOperations.map((operation) => {
                        const sourceBadge = getSourceBadge(operation)
                        const details = operation.operationContext?.operationDetails || {}
                        const duration = parseNumber(details.durationMinutes ?? operation.duration ?? operation.durationMinutes)
                        const weather = operation.weatherConditions || operation.operationContext?.weather
                        const weatherText = weather
                          ? `${weather.temp ?? weather.temperature ?? 'N/D'}°C • UR ${weather.humidity ?? 'N/D'}%`
                          : undefined

                        return (
                          <div key={operation.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getOperationIcon(operation.operationType)}</div>
                                <div>
                                  <div className="flex items-center flex-wrap gap-2">
                                    <div className="font-medium text-gray-900">{getOperationLabel(operation.operationType)}</div>
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${sourceBadge.className}`}>
                                      {sourceBadge.label}
                                    </span>
                                  </div>
                                  {operation.notes && (
                                    <div className="text-sm text-gray-600 mt-1">{operation.notes}</div>
                                  )}
                                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                                    {operation.quantity !== undefined && (
                                      <div>Quantità: {operation.quantity} {operation.unit || ''}</div>
                                    )}
                                    {duration !== undefined && (
                                      <div>Durata: {duration} min</div>
                                    )}
                                    {operation.productName && (
                                      <div>Prodotto: {operation.productName}</div>
                                    )}
                                    {details.subtype && (
                                      <div>Tipo: {details.subtype}</div>
                                    )}
                                    {weatherText && (
                                      <div>Meteo: {weatherText}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-sm font-medium text-gray-900">
                                {formatOperationDate(operation.date || operation.operationDate)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
