/**
 * Integrated Field Operations Modal
 * Modal per operazioni integrate su filari e piante individuali
 */

import React, { useState, useEffect } from 'react'
import { Garden } from '@/types'
import { GardenPlant } from '@/types/individualPlant'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { 
  integratedFieldOperationsService, 
  FieldRowConfiguration,
  IntegratedOperationRequest,
  IntegratedOperationResult
} from '@/services/integratedFieldOperationsService'
import { createOperationContextService } from '@/services/operationContextService'
import { 
  Droplets, 
  Zap, 
  Scissors, 
  Sprout,
  Calculator,
  Target,
  Users,
  Grid3X3,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Calendar,
  MapPin
} from 'lucide-react'

interface IntegratedFieldOperationsModalProps {
  isOpen: boolean
  onClose: () => void
  garden: Garden
  fieldRows: FieldRowConfiguration[]
  plants: GardenPlant[]
  onOperationComplete: (result: IntegratedOperationResult) => void
}

export const IntegratedFieldOperationsModal: React.FC<IntegratedFieldOperationsModalProps> = ({
  isOpen,
  onClose,
  garden,
  fieldRows,
  plants,
  onOperationComplete
}) => {
  const { storageProvider } = useStorage()
  const operationContextService = createOperationContextService()
  const qualityGradeToScore = (grade: 'A' | 'B' | 'C') => {
    switch (grade) {
      case 'A': return 90
      case 'B': return 75
      case 'C': return 55
      default: return 75
    }
  }
  
  // State
  const [selectedFieldRows, setSelectedFieldRows] = useState<string[]>([])
  const [operationType, setOperationType] = useState<'irrigation' | 'fertilization' | 'treatment' | 'cultivation' | 'harvest'>('irrigation')
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  
  // Operation config
  const [operationConfig, setOperationConfig] = useState({
    // Irrigazione
    duration: 30, // minuti
    
    // Fertilizzazione
    fertilizerType: 'NPK 20-20-20',
    dosagePerPlant: 50, // grammi
    
    // Trattamento
    treatmentType: 'fungicida',
    productName: 'Rame',
    concentration: 0.5, // %
    applicationMethod: 'spray' as 'spray' | 'soil' | 'systemic',
    
    // Lavorazione
    cultivationType: 'weeding' as 'weeding' | 'hoeing' | 'mulching' | 'pruning',
    
    // Raccolta
    expectedYield: 2.0, // kg per pianta
    qualityGrade: 'A' as 'A' | 'B' | 'C'
  })
  
  // Plant application
  const [plantApplication, setPlantApplication] = useState({
    applyToAllPlants: true,
    specificPositions: [] as number[]
  })
  
  // Calculated values
  const [calculations, setCalculations] = useState({
    totalPlants: 0,
    totalAmount: 0,
    estimatedCost: 0,
    estimatedDuration: 0
  })

  useEffect(() => {
    calculateTotals()
  }, [selectedFieldRows, operationType, operationConfig, plantApplication])

  const calculateFieldRowFlowRateLph = (fieldRow: FieldRowConfiguration): number => {
    const irrigation = fieldRow.irrigationConfig
    if (!irrigation?.enabled) return 0
    if (irrigation.totalFlowRate > 0) return irrigation.totalFlowRate
    if (irrigation.flowRatePerMeter > 0 && fieldRow.lengthMeters > 0) {
      return irrigation.flowRatePerMeter * fieldRow.lengthMeters
    }
    if (
      irrigation.irrigationType === 'drip' &&
      irrigation.emitterSpacing > 0 &&
      irrigation.emitterFlowRate > 0 &&
      fieldRow.lengthMeters > 0
    ) {
      const emitterCount = Math.floor((fieldRow.lengthMeters * 100) / irrigation.emitterSpacing)
      return emitterCount * irrigation.emitterFlowRate
    }
    return 0
  }

  const calculateTotals = () => {
    let totalPlants = 0
    let totalAmount = 0
    let estimatedDuration = 0
    
    selectedFieldRows.forEach(fieldRowId => {
      const fieldRow = fieldRows.find(fr => fr.id === fieldRowId)
      if (!fieldRow) return
      
      const fieldRowPlants = plants.filter(p => p.fieldRowId === fieldRowId)
      const targetPlants = plantApplication.applyToAllPlants 
        ? fieldRowPlants.length
        : plantApplication.specificPositions.length
      
      totalPlants += targetPlants
      
      // Calcola quantità per tipo operazione
      switch (operationType) {
        case 'irrigation':
          const flowRate = calculateFieldRowFlowRateLph(fieldRow)
          totalAmount += (flowRate * operationConfig.duration / 60)
          estimatedDuration = Math.max(estimatedDuration, operationConfig.duration)
          break
          
        case 'fertilization':
          totalAmount += (operationConfig.dosagePerPlant * targetPlants)
          estimatedDuration += (targetPlants * 2) // 2 min per pianta
          break
          
        case 'treatment':
          totalAmount += (targetPlants * 0.5) // 0.5L per pianta
          estimatedDuration += (targetPlants * 1.5) // 1.5 min per pianta
          break
          
        case 'cultivation':
          estimatedDuration += (fieldRow.lengthMeters * 5) // 5 min per metro
          break
          
        case 'harvest':
          totalAmount += (targetPlants * operationConfig.expectedYield)
          estimatedDuration += (targetPlants * 3) // 3 min per pianta
          break
      }
    })
    
    setCalculations({
      totalPlants,
      totalAmount: Math.round(totalAmount * 100) / 100,
      estimatedCost: Math.round(totalAmount * getUnitCost() * 100) / 100,
      estimatedDuration: Math.round(estimatedDuration)
    })
  }
  
  const getUnitCost = (): number => {
    switch (operationType) {
      case 'irrigation': return 0.002 // €/litro
      case 'fertilization': return 0.05 // €/grammo
      case 'treatment': return 2.0 // €/litro
      default: return 0
    }
  }
  
  const getOperationIcon = () => {
    switch (operationType) {
      case 'irrigation': return <Droplets className="text-blue-600" size={20} />
      case 'fertilization': return <Zap className="text-green-600" size={20} />
      case 'treatment': return <Scissors className="text-orange-600" size={20} />
      case 'cultivation': return <Grid3X3 className="text-purple-600" size={20} />
      case 'harvest': return <Sprout className="text-yellow-600" size={20} />
    }
  }
  
  const getOperationLabel = () => {
    switch (operationType) {
      case 'irrigation': return 'Irrigazione'
      case 'fertilization': return 'Fertilizzazione'
      case 'treatment': return 'Trattamento'
      case 'cultivation': return 'Lavorazione'
      case 'harvest': return 'Raccolta'
    }
  }
  
  const getAmountUnit = () => {
    switch (operationType) {
      case 'irrigation': return 'litri'
      case 'fertilization': return 'grammi'
      case 'treatment': return 'litri'
      case 'harvest': return 'kg'
      default: return ''
    }
  }
  
  const handleExecuteOperation = async () => {
    if (selectedFieldRows.length === 0) {
      alert('Seleziona almeno un filare')
      return
    }
    
    setLoading(true)
    
    try {
      const [latitude, longitude] = garden.coordinates
        ? [garden.coordinates.latitude, garden.coordinates.longitude]
        : [undefined, undefined]
      const validTimestamp = new Date(`${scheduledDate}T12:00:00`)
      const context = latitude !== undefined && longitude !== undefined
        ? await operationContextService.getOperationContext(latitude, longitude, validTimestamp)
        : undefined

      const request: IntegratedOperationRequest = {
        gardenId: garden.id,
        fieldRowIds: selectedFieldRows,
        operationType,
        scheduledDate,
        config: {
          duration: operationConfig.duration,
          waterAmount: operationType === 'irrigation' ? calculations.totalAmount : undefined,
          fertilizerType: operationType === 'fertilization' ? operationConfig.fertilizerType : undefined,
          dosagePerPlant: operationType === 'fertilization' ? operationConfig.dosagePerPlant : undefined,
          totalDosage: operationType === 'fertilization' ? calculations.totalAmount : undefined,
          treatmentType: operationType === 'treatment' ? operationConfig.treatmentType : undefined,
          productName: operationType === 'treatment' ? operationConfig.productName : undefined,
          concentration: operationType === 'treatment' ? operationConfig.concentration : undefined,
          applicationMethod: operationType === 'treatment' ? operationConfig.applicationMethod : undefined,
          cultivationType: operationType === 'cultivation' ? operationConfig.cultivationType : undefined,
          expectedYield: operationType === 'harvest' ? calculations.totalAmount : undefined,
          qualityGrade: operationType === 'harvest' ? operationConfig.qualityGrade : undefined,
          qualityScore: operationType === 'harvest' ? (operationConfig.qualityScore || qualityGradeToScore(operationConfig.qualityGrade)) : undefined
        },
        plantApplication: {
          applyToAllPlants: plantApplication.applyToAllPlants,
          plantPositions: plantApplication.applyToAllPlants ? undefined : plantApplication.specificPositions
        },
        sourceType: 'manual',
        actorType: 'manual',
        contextSnapshot: context,
        weatherConditions: context
          ? {
              temp: context.weather.temperature,
              humidity: context.weather.humidity,
              wind: `${context.weather.windSpeed} km/h`,
              condition: context.weather.condition,
              precipitation: context.weather.precipitation,
              pressure: context.weather.pressure,
              source: context.weather.source
            }
          : undefined,
        geoSnapshot: {
          latitude,
          longitude,
          altitudeMeters: garden.altitudeMeters,
          sunExposure: garden.sunExposure,
          aspectDirection: garden.aspectDirection,
          obstacles: Array.isArray(garden.obstacles) ? garden.obstacles : undefined,
          source: latitude !== undefined && longitude !== undefined ? 'garden_coordinates' : 'not_available'
        }
      }
      
      const result = await integratedFieldOperationsService.createIntegratedOperation(
        request,
        fieldRows,
        plants,
        storageProvider
      )
      
      if (result.success) {
        alert(`✅ Operazione completata con successo!\n\n` +
              `📊 Statistiche:\n` +
              `• ${result.operationsCreated} operazioni create\n` +
              `• ${result.plantsAffected} piante coinvolte\n` +
              `• ${result.fieldRowsAffected} filari interessati\n` +
              `• ${result.totalAmount} ${getAmountUnit()} totali\n` +
              `${result.estimatedCost ? `• €${result.estimatedCost.toFixed(2)} costo stimato` : ''}`)
        
        onOperationComplete(result)
        onClose()
      } else {
        throw new Error(result.errors?.join(', ') || 'Errore durante l\'operazione')
      }
      
    } catch (error) {
      console.error('Operation error:', error)
      alert(`❌ Errore durante l'operazione:\n${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                {getOperationIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Operazioni Integrate Filari</h2>
                <p className="text-gray-600">Gestione completa: filari → piante individuali</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Operation Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo Operazione
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { type: 'irrigation', label: 'Irrigazione', icon: Droplets, color: 'blue' },
                { type: 'fertilization', label: 'Fertilizzazione', icon: Zap, color: 'green' },
                { type: 'treatment', label: 'Trattamento', icon: Scissors, color: 'orange' },
                { type: 'cultivation', label: 'Lavorazione', icon: Grid3X3, color: 'purple' },
                { type: 'harvest', label: 'Raccolta', icon: Sprout, color: 'yellow' }
              ].map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => setOperationType(type as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    operationType === type
                      ? `border-${color}-500 bg-${color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} className={`mx-auto mb-2 ${
                    operationType === type ? `text-${color}-600` : 'text-gray-600'
                  }`} />
                  <p className={`text-xs font-medium ${
                    operationType === type ? `text-${color}-700` : 'text-gray-700'
                  }`}>
                    {label}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Field Row Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filari da Trattare
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {fieldRows.map(fieldRow => {
                const fieldRowPlants = plants.filter(p => p.fieldRowId === fieldRow.id)
                const isSelected = selectedFieldRows.includes(fieldRow.id)
                
                return (
                  <div
                    key={fieldRow.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFieldRows(prev => prev.filter(id => id !== fieldRow.id))
                      } else {
                        setSelectedFieldRows(prev => [...prev, fieldRow.id])
                      }
                    }}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{fieldRow.name}</h4>
                        <p className="text-sm text-gray-600">
                          {fieldRow.lengthMeters}m • {fieldRowPlants.length} piante
                        </p>
                        {fieldRow.cultivar && (
                          <p className="text-xs text-blue-600">{fieldRow.cultivar}</p>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle className="text-green-600" size={20} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Operation Configuration */}
          {selectedFieldRows.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calculator size={16} />
                Configurazione {getOperationLabel()}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Data programmazione */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Programmata
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                {/* Configurazione specifica per tipo */}
                {operationType === 'irrigation' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durata (minuti)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={operationConfig.duration}
                      onChange={(e) => setOperationConfig(prev => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 30
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
                
                {operationType === 'fertilization' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo Fertilizzante
                      </label>
                      <select
                        value={operationConfig.fertilizerType}
                        onChange={(e) => setOperationConfig(prev => ({
                          ...prev,
                          fertilizerType: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="NPK 20-20-20">NPK 20-20-20</option>
                        <option value="Compost">Compost</option>
                        <option value="Letame">Letame</option>
                        <option value="Humus">Humus</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosaggio per Pianta (g)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={operationConfig.dosagePerPlant}
                        onChange={(e) => setOperationConfig(prev => ({
                          ...prev,
                          dosagePerPlant: parseInt(e.target.value) || 50
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </>
                )}
                
                {operationType === 'treatment' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prodotto
                      </label>
                      <input
                        type="text"
                        value={operationConfig.productName}
                        onChange={(e) => setOperationConfig(prev => ({
                          ...prev,
                          productName: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Nome prodotto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Concentrazione (%)
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={operationConfig.concentration}
                        onChange={(e) => setOperationConfig(prev => ({
                          ...prev,
                          concentration: parseFloat(e.target.value) || 0.5
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </>
                )}
                
                {operationType === 'harvest' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resa Stimata per Pianta (kg)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={operationConfig.expectedYield}
                      onChange={(e) => setOperationConfig(prev => ({
                        ...prev,
                        expectedYield: parseFloat(e.target.value) || 2.0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Plant Application */}
          {selectedFieldRows.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Target size={16} />
                Applicazione Piante
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="plantApplication"
                    checked={plantApplication.applyToAllPlants}
                    onChange={() => setPlantApplication(prev => ({
                      ...prev,
                      applyToAllPlants: true
                    }))}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-blue-900">
                    Tutte le piante nei filari selezionati
                  </span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="plantApplication"
                    checked={!plantApplication.applyToAllPlants}
                    onChange={() => setPlantApplication(prev => ({
                      ...prev,
                      applyToAllPlants: false
                    }))}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-blue-900">
                    Solo posizioni specifiche
                  </span>
                </label>
                
                {!plantApplication.applyToAllPlants && (
                  <div className="ml-6">
                    <input
                      type="text"
                      placeholder="Posizioni (es: 1,3,5-10,15)"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        // Parse positions like "1,3,5-10,15"
                        const positions: number[] = []
                        e.target.value.split(',').forEach(part => {
                          if (part.includes('-')) {
                            const [start, end] = part.split('-').map(n => parseInt(n.trim()))
                            for (let i = start; i <= end; i++) {
                              positions.push(i)
                            }
                          } else {
                            const pos = parseInt(part.trim())
                            if (!isNaN(pos)) positions.push(pos)
                          }
                        })
                        setPlantApplication(prev => ({
                          ...prev,
                          specificPositions: positions
                        }))
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Calculations */}
          {selectedFieldRows.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Calculator size={16} />
                Calcoli Automatici
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-green-600">Piante Coinvolte</p>
                  <p className="font-bold text-green-900">{calculations.totalPlants}</p>
                </div>
                <div>
                  <p className="text-green-600">Quantità Totale</p>
                  <p className="font-bold text-green-900">
                    {calculations.totalAmount} {getAmountUnit()}
                  </p>
                </div>
                <div>
                  <p className="text-green-600">Durata Stimata</p>
                  <p className="font-bold text-green-900">{calculations.estimatedDuration} min</p>
                </div>
                <div>
                  <p className="text-green-600">Costo Stimato</p>
                  <p className="font-bold text-green-900">€{calculations.estimatedCost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            
            <button
              onClick={handleExecuteOperation}
              disabled={selectedFieldRows.length === 0 || loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Eseguendo...
                </>
              ) : (
                <>
                  {getOperationIcon()}
                  Esegui {getOperationLabel()}
                </>
              )}
            </button>
          </div>
          
          <div className="mt-3 text-center text-sm text-gray-600">
            L'operazione sarà applicata a livello filare e registrata su ogni pianta individuale
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegratedFieldOperationsModal
