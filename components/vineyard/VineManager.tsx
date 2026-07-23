'use client'

import React, { useState, useEffect } from 'react'
import { VineyardVine, VineSearchCriteria, VineHealthStatus, VineVigorLevel, VineProductivityStatus } from '@/types/vineyard'
import type { FieldRow, FieldRowOrdering, FieldRowAxis } from '@/types/fieldRow'
import { FIELD_ROW_ORDERING_OPTIONS } from '@/types/fieldRow'
import { vineyardService } from '@/services/vineyardService'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { createUnifiedOperationsService } from '@/services/unifiedOperationsService'
import { createOperationContextService } from '@/services/operationContextService'
import { AppModal } from '@/components/shared/AppModal'
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
  BarChart3,
  Upload,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface VineManagerProps {
  vineyardId: string
  gardenId: string
}

export default function VineManager({ vineyardId, gardenId }: VineManagerProps) {
  const [vines, setVines] = useState<VineyardVine[]>([])
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([])
  const [filteredVines, setFilteredVines] = useState<VineyardVine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVine, setSelectedVine] = useState<VineyardVine | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [editingVine, setEditingVine] = useState<VineyardVine | null>(null)
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
      const fieldRowsPromise = storageProvider?.getFieldRows
        ? storageProvider.getFieldRows(gardenId).catch((error) => {
            console.error('Error loading field rows:', error)
            return []
          })
        : Promise.resolve([])

      const [vinesData, fieldRowsData] = await Promise.all([
        vineyardService.getVineyardVines(vineyardId, filters),
        fieldRowsPromise
      ])
      setVines(vinesData)
      setFieldRows(fieldRowsData)
    } catch (error) {
      console.error('Error loading vines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVine = async (data: {
    vineNumber: string
    variety: string
    rootstock: string
    plantingDate: string
    rowNumber?: number
    positionInRow?: number
  }) => {
    try {
      const created = await vineyardService.createVine({
        vineyardId,
        gardenId,
        vineNumber: data.vineNumber,
        variety: data.variety,
        rootstock: data.rootstock || undefined,
        plantingDate: data.plantingDate || undefined,
        rowNumber: data.rowNumber,
        positionInRow: data.positionInRow,
        healthStatus: 'healthy',
        vigorLevel: 'normal',
        productivityStatus: 'young',
        isActive: true,
        needsPruning: false,
        needsTreatment: false,
        needsReplacement: false,
        cumulativeYieldKg: 0,
      })
      setVines(prev => [...prev, created])
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating vine:', error)
      alert(`Errore nella creazione della vite: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleBatchAddVines = async (batchData: {
    startRowNumber: number
    rowsCount: number
    vinesPerRow: number
    variety: string
    rootstock: string
    plantingDate: string
    prefix: string
    plantSpacingCm?: number
    distanceFromPreviousRowCm?: number
    orientation?: FieldRowAxis
    rowOrdering?: FieldRowOrdering
    plantOrderingInRow?: FieldRowOrdering
  }) => {
    try {
      if (!storageProvider?.getFieldRows || !storageProvider?.createFieldRow) {
        throw new Error('Storage provider non supporta la gestione dei filari reali')
      }

      const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100
      const calculateRowLengthMeters = (vineCount: number, plantSpacingCm: number) =>
        roundToTwoDecimals((vineCount * plantSpacingCm) / 100)

      const vinesToCreate: Omit<VineyardVine, 'id' | 'createdAt' | 'updatedAt'>[] = []
      const nextPositionByRow = new Map<number, number>()
      const rowIdByRowNumber = new Map<number, string>()
      const existingFieldRows = await storageProvider.getFieldRows(gardenId)
      const fieldRowByNumber = new Map<number, FieldRow>()

      vines.forEach((vine) => {
        if (!vine.rowNumber) return
        const rowNumber = vine.rowNumber
        const nextPosition = (vine.positionInRow || 0) + 1
        const currentMax = nextPositionByRow.get(rowNumber) || 1
        nextPositionByRow.set(rowNumber, Math.max(currentMax, nextPosition))
      })

      existingFieldRows.forEach((row) => {
        if (!fieldRowByNumber.has(row.rowNumber)) {
          fieldRowByNumber.set(row.rowNumber, row)
        }
      })

      for (let rowOffset = 0; rowOffset < batchData.rowsCount; rowOffset++) {
        const currentRow = batchData.startRowNumber + rowOffset
        const rowStartPosition = nextPositionByRow.get(currentRow) || 1
        const totalVinesAfterBatch = rowStartPosition + batchData.vinesPerRow - 1
        let linkedFieldRow = fieldRowByNumber.get(currentRow)

        if (!linkedFieldRow) {
          if (!batchData.plantSpacingCm || batchData.plantSpacingCm <= 0) {
            throw new Error(`Manca la distanza piante per creare il filare ${currentRow}`)
          }

          linkedFieldRow = await storageProvider.createFieldRow({
            gardenId,
            name: `Fila ${currentRow}`,
            rowNumber: currentRow,
            lengthMeters: calculateRowLengthMeters(totalVinesAfterBatch, batchData.plantSpacingCm),
            distanceFromPreviousRow: batchData.distanceFromPreviousRowCm,
            plantSpacing: batchData.plantSpacingCm,
            cultivar: batchData.variety,
            plantCount: totalVinesAfterBatch,
            orientation: batchData.orientation || undefined,
            rowOrdering: batchData.rowOrdering,
            plantOrderingInRow: batchData.plantOrderingInRow,
            plantedDate: batchData.plantingDate || undefined,
            isActive: true,
            notes: 'Creato automaticamente dal batch viti del vigneto'
          })

          fieldRowByNumber.set(currentRow, linkedFieldRow)
        } else if (storageProvider.updateFieldRow) {
          const spacingForLength = linkedFieldRow.plantSpacing || batchData.plantSpacingCm
          const updates: Partial<FieldRow> = {}

          if (spacingForLength && (!linkedFieldRow.lengthMeters || calculateRowLengthMeters(totalVinesAfterBatch, spacingForLength) > linkedFieldRow.lengthMeters)) {
            updates.lengthMeters = calculateRowLengthMeters(totalVinesAfterBatch, spacingForLength)
          }
          if (!linkedFieldRow.plantSpacing && batchData.plantSpacingCm) {
            updates.plantSpacing = batchData.plantSpacingCm
          }
          if (!linkedFieldRow.distanceFromPreviousRow && batchData.distanceFromPreviousRowCm) {
            updates.distanceFromPreviousRow = batchData.distanceFromPreviousRowCm
          }
          if (!linkedFieldRow.orientation && batchData.orientation) {
            updates.orientation = batchData.orientation
          }
          if (!linkedFieldRow.rowOrdering && batchData.rowOrdering) {
            updates.rowOrdering = batchData.rowOrdering
          }
          if (!linkedFieldRow.plantOrderingInRow && batchData.plantOrderingInRow) {
            updates.plantOrderingInRow = batchData.plantOrderingInRow
          }
          if (!linkedFieldRow.cultivar && batchData.variety) {
            updates.cultivar = batchData.variety
          }
          if (!linkedFieldRow.plantedDate && batchData.plantingDate) {
            updates.plantedDate = batchData.plantingDate
          }
          if (!linkedFieldRow.plantCount || linkedFieldRow.plantCount < totalVinesAfterBatch) {
            updates.plantCount = totalVinesAfterBatch
          }

          if (Object.keys(updates).length > 0) {
            linkedFieldRow = await storageProvider.updateFieldRow(linkedFieldRow.id, updates)
            fieldRowByNumber.set(currentRow, linkedFieldRow)
          }
        }

        if (linkedFieldRow?.id) {
          rowIdByRowNumber.set(currentRow, linkedFieldRow.id)
        }

        for (let i = 0; i < batchData.vinesPerRow; i++) {
          const pos = rowStartPosition + i
          vinesToCreate.push({
            vineyardId,
            gardenId,
            vineNumber: `${batchData.prefix}${currentRow}-${pos}`,
            variety: batchData.variety,
            rootstock: batchData.rootstock || undefined,
            plantingDate: batchData.plantingDate || undefined,
            fieldRowId: rowIdByRowNumber.get(currentRow),
            rowNumber: currentRow,
            positionInRow: pos,
            healthStatus: 'healthy',
            vigorLevel: 'normal',
            productivityStatus: 'young',
            isActive: true,
            needsPruning: false,
            needsTreatment: false,
            needsReplacement: false,
            cumulativeYieldKg: 0,
          })
        }

        nextPositionByRow.set(currentRow, rowStartPosition + batchData.vinesPerRow)
      }

      const created = await vineyardService.bulkCreateVines(vinesToCreate)
      setVines(prev => [...prev, ...created])
      const refreshedFieldRows = await storageProvider.getFieldRows(gardenId)
      setFieldRows(refreshedFieldRows)
      setShowBatchModal(false)
    } catch (error) {
      console.error('Error batch creating vines:', error)
      alert(`Errore nella creazione batch: ${error instanceof Error ? error.message : String(error)}`)
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

      const rawGardenCoordinates = garden?.coordinates as Record<string, string | number | undefined> | undefined

      const gardenCoordinates = rawGardenCoordinates
        ? {
            latitude: parseNumber(rawGardenCoordinates.latitude ?? rawGardenCoordinates.lat),
            longitude: parseNumber(rawGardenCoordinates.longitude ?? rawGardenCoordinates.lng ?? rawGardenCoordinates.lon),
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
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={18} />
            Crea Fila
          </button>

          <button
            onClick={() => setShowAddModal(true)}
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
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowBatchModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload size={20} />
                Crea Fila
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus size={20} />
                Registra Prima Vite
              </button>
            </div>
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
                        onClick={() => setEditingVine(vine)}
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
                        onClick={() => setEditingVine(vine)}
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

      {showAddModal && (
        <AddVineModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreateVine}
        />
      )}

      {showBatchModal && (
        <BatchAddVineModal
          existingVines={vines}
          existingFieldRows={fieldRows}
          onClose={() => setShowBatchModal(false)}
          onBatchAdd={handleBatchAddVines}
        />
      )}
    </div>
  )
}

interface AddVineModalProps {
  onClose: () => void
  onCreate: (data: {
    vineNumber: string
    variety: string
    rootstock: string
    plantingDate: string
    rowNumber?: number
    positionInRow?: number
  }) => Promise<void>
}

function AddVineModal({ onClose, onCreate }: AddVineModalProps) {
  const [vineNumber, setVineNumber] = useState('')
  const [variety, setVariety] = useState('')
  const [rootstock, setRootstock] = useState('')
  const [plantingDate, setPlantingDate] = useState('')
  const [rowNumber, setRowNumber] = useState('')
  const [positionInRow, setPositionInRow] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vineNumber.trim() || !variety.trim()) {
      alert('Inserisci numero vite e varietà')
      return
    }
    setLoading(true)
    try {
      await onCreate({
        vineNumber: vineNumber.trim(),
        variety: variety.trim(),
        rootstock: rootstock.trim(),
        plantingDate,
        rowNumber: rowNumber ? parseInt(rowNumber, 10) : undefined,
        positionInRow: positionInRow ? parseInt(positionInRow, 10) : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppModal isOpen onClose={onClose} fullScreenOnMobile panelClassName="bg-white shadow-2xl w-full max-w-lg sm:rounded-2xl">
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-green-600 text-white px-6 py-4 flex items-center justify-between sm:rounded-t-2xl">
        <h2 className="text-xl font-bold">Nuova Vite</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numero Vite *</label>
          <input type="text" required value={vineNumber} onChange={(e) => setVineNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="es. A1-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Varietà *</label>
          <input type="text" required value={variety} onChange={(e) => setVariety(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="es. Sangiovese" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fila</label>
            <input type="number" value={rowNumber} onChange={(e) => setRowNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posizione in fila</label>
            <input type="number" value={positionInRow} onChange={(e) => setPositionInRow(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" min="1" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portinnesto</label>
          <input type="text" value={rootstock} onChange={(e) => setRootstock(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="es. 1103 Paulsen" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Impianto</label>
          <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Annulla
          </button>
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creazione...' : 'Crea Vite'}
          </button>
        </div>
      </form>
    </AppModal>
  )
}

// Batch Add Vines Modal Component
interface BatchAddVineModalProps {
  existingVines: VineyardVine[]
  existingFieldRows: FieldRow[]
  onClose: () => void
  onBatchAdd: (data: {
    startRowNumber: number
    rowsCount: number
    vinesPerRow: number
    variety: string
    rootstock: string
    plantingDate: string
    prefix: string
    plantSpacingCm?: number
    distanceFromPreviousRowCm?: number
    orientation?: FieldRowAxis
    rowOrdering?: FieldRowOrdering
    plantOrderingInRow?: FieldRowOrdering
  }) => Promise<void>
}

function BatchAddVineModal({ existingVines, existingFieldRows, onClose, onBatchAdd }: BatchAddVineModalProps) {
  const [rowNumber, setRowNumber] = useState(1)
  const [rowsCount, setRowsCount] = useState(1)
  const [count, setCount] = useState(10)
  const [variety, setVariety] = useState('')
  const [rootstock, setRootstock] = useState('')
  const [plantingDate, setPlantingDate] = useState('')
  const [prefix, setPrefix] = useState('')
  const [plantSpacingCm, setPlantSpacingCm] = useState('')
  const [distanceFromPreviousRowCm, setDistanceFromPreviousRowCm] = useState('')
  const [orientation, setOrientation] = useState<FieldRowAxis>('')
  const [rowOrdering, setRowOrdering] = useState<FieldRowOrdering | ''>('')
  const [plantOrderingInRow, setPlantOrderingInRow] = useState<FieldRowOrdering | ''>('')
  const [loading, setLoading] = useState(false)

  // Calcola la prossima fila disponibile
  useEffect(() => {
    if (existingVines.length > 0) {
      const maxRow = Math.max(...existingVines.map(v => v.rowNumber || 0))
      setRowNumber(maxRow + 1)
    }
  }, [existingVines])

  const getStartPositionForRow = (targetRowNumber: number) => {
    const vinesInRow = existingVines.filter(v => v.rowNumber === targetRowNumber)
    if (vinesInRow.length === 0) return 1
    return Math.max(...vinesInRow.map(v => v.positionInRow || 0)) + 1
  }

  const firstRowStartPosition = getStartPositionForRow(rowNumber)
  const lastRowNumber = rowNumber + rowsCount - 1
  const lastRowStartPosition = getStartPositionForRow(lastRowNumber)
  const totalVines = rowsCount * count
  const rowNumbersInRange = Array.from({ length: rowsCount }, (_, index) => rowNumber + index)
  const missingFieldRows = rowNumbersInRange.filter((targetRowNumber) =>
    !existingFieldRows.some((row) => Number(row.rowNumber) === targetRowNumber)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!variety.trim()) {
      alert('Inserisci la varietà')
      return
    }
    if (count < 1 || count > 500) {
      alert('Numero viti deve essere tra 1 e 500')
      return
    }
    if (rowsCount < 1 || rowsCount > 200) {
      alert('Numero file consecutive deve essere tra 1 e 200')
      return
    }
    if (totalVines > 5000) {
      alert('Massimo 5.000 viti per singola operazione batch')
      return
    }
    if (missingFieldRows.length > 0) {
      const parsedPlantSpacing = parseFloat(plantSpacingCm)
      if (!parsedPlantSpacing || parsedPlantSpacing <= 0) {
        alert('Inserisci la distanza tra piante per creare i filari mancanti')
        return
      }
    }

    setLoading(true)
    try {
      await onBatchAdd({
        startRowNumber: rowNumber,
        rowsCount,
        vinesPerRow: count,
        variety: variety.trim(),
        rootstock: rootstock.trim(),
        plantingDate,
        prefix: prefix.trim(),
        plantSpacingCm: plantSpacingCm ? parseFloat(plantSpacingCm) : undefined,
        distanceFromPreviousRowCm: distanceFromPreviousRowCm ? parseFloat(distanceFromPreviousRowCm) : undefined,
        orientation: orientation || undefined,
        rowOrdering: rowOrdering || undefined,
        plantOrderingInRow: plantOrderingInRow || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  // Existing rows summary
  const rowSummary = new Map<number, number>()
  existingVines.forEach(v => {
    if (v.rowNumber) {
      rowSummary.set(v.rowNumber, (rowSummary.get(v.rowNumber) || 0) + 1)
    }
  })

  return (
    <AppModal
      isOpen
      onClose={onClose}
      fullScreenOnMobile
      panelClassName="bg-white shadow-2xl w-full max-w-2xl sm:rounded-2xl"
    >
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-4 flex items-center justify-between sm:rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Crea Fila di Viti</h2>
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
                    Fila {row}: {count} viti
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
                {existingVines.filter(v => v.rowNumber === rowNumber).length > 0
                  ? `Fila ${rowNumber} ha già ${existingVines.filter(v => v.rowNumber === rowNumber).length} viti (si aggiunge da pos. ${firstRowStartPosition})`
                  : `Nuova fila ${rowNumber}`}
              </p>
            </div>

            {/* Numero File Consecutive */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero File Consecutive *</label>
              <input type="number" required value={rowsCount}
                onChange={(e) => setRowsCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1" max="200" />
              <p className="text-xs text-gray-500 mt-1">
                Da Fila {rowNumber} a Fila {lastRowNumber}
              </p>
            </div>

            {/* Numero Viti */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero Viti *</label>
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
                placeholder="es. Sangiovese, Nebbiolo, Chardonnay" />
            </div>

            {/* Portinnesto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portinnesto</label>
              <input type="text" value={rootstock}
                onChange={(e) => setRootstock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="es. 1103 Paulsen, SO4" />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distanza piante nel filare (cm){missingFieldRows.length > 0 ? ' *' : ''}
              </label>
              <input
                type="number"
                value={plantSpacingCm}
                onChange={(e) => setPlantSpacingCm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                step="1"
                placeholder="es. 150"
              />
              <p className="text-xs text-gray-500 mt-1">
                Serve per creare il filare reale se nel range ci sono file non ancora configurate.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distanza dal filare precedente (cm)</label>
              <input
                type="number"
                value={distanceFromPreviousRowCm}
                onChange={(e) => setDistanceFromPreviousRowCm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1"
                placeholder="es. 250"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orientamento filare</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as FieldRowAxis)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Non specificato</option>
                <option value="N-S">Nord-Sud</option>
                <option value="E-W">Est-Ovest</option>
                <option value="NE-SW">NordEst-SudOvest</option>
                <option value="NW-SE">NordOvest-SudEst</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordine numerazione filari</label>
              <select
                value={rowOrdering}
                onChange={(e) => setRowOrdering(e.target.value as FieldRowOrdering | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Non specificato</option>
                {FIELD_ROW_ORDERING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordine piante nel filare</label>
              <select
                value={plantOrderingInRow}
                onChange={(e) => setPlantOrderingInRow(e.target.value as FieldRowOrdering | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Non specificato</option>
                {FIELD_ROW_ORDERING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Anteprima */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Anteprima creazione</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                Verranno create <strong>{totalVines}</strong> viti in <strong>{rowsCount} {rowsCount === 1 ? 'fila' : 'file'}</strong>
              </p>
              <p>
                Intervallo file: <strong>{rowNumber}</strong> → <strong>{lastRowNumber}</strong> ({count} viti per fila)
              </p>
              <p>
                Prima fila ({rowNumber}) posizioni: <strong>{firstRowStartPosition}</strong> → <strong>{firstRowStartPosition + count - 1}</strong>
              </p>
              <p>
                Numerazione prima fila: <strong>{prefix}{rowNumber}-{firstRowStartPosition}</strong> → <strong>{prefix}{rowNumber}-{firstRowStartPosition + count - 1}</strong>
              </p>
              {rowsCount > 1 && (
                <p>
                  Ultima fila ({lastRowNumber}) parte da posizione <strong>{lastRowStartPosition}</strong>
                </p>
              )}
              {missingFieldRows.length > 0 ? (
                <p>
                  Verranno creati anche i filari reali: <strong>{missingFieldRows.join(', ')}</strong>
                </p>
              ) : (
                <p>
                  Tutte le file del range risultano gia collegate a filari reali.
                </p>
              )}
              {plantSpacingCm && (
                <p>
                  Passo piante usato per il filare: <strong>{plantSpacingCm} cm</strong>
                  {distanceFromPreviousRowCm ? ` • Interfila: ${distanceFromPreviousRowCm} cm` : ''}
                </p>
              )}
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
              {loading ? 'Creazione...' : `Crea ${totalVines} Viti`}
            </button>
          </div>
        </form>
    </AppModal>
  )
}
