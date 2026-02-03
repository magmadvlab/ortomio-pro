/**
 * Quick Operation Modal
 * Modal per operazioni rapide su filari con registrazione completa
 */

import React, { useState, useEffect } from 'react'
import { Garden } from '@/types'
import { GardenPlant } from '@/types/individualPlant'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { 
  integratedFieldOperationsService, 
  FieldRowConfiguration,
  IntegratedOperationRequest
} from '@/services/integratedFieldOperationsService'
import { 
  Zap, 
  Scissors, 
  Wrench,
  Calendar,
  Clock,
  Thermometer,
  CloudRain,
  Wind,
  Calculator,
  Camera,
  MapPin,
  CheckCircle,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react'

interface QuickOperationModalProps {
  isOpen: boolean
  onClose: () => void
  garden: Garden
  fieldRowId: string
  operationType: 'fertilization' | 'treatment' | 'cultivation'
  fieldRows: FieldRowConfiguration[]
  plants: GardenPlant[]
  onOperationComplete: (result: any) => void
}

export const QuickOperationModal: React.FC<QuickOperationModalProps> = ({
  isOpen,
  onClose,
  garden,
  fieldRowId,
  operationType,
  fieldRows,
  plants,
  onOperationComplete
}) => {
  const { storageProvider } = useStorage()
  
  // State
  const [loading, setLoading] = useState(false)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loadingWeather, setLoadingWeather] = useState(false)
  
  // Operation data
  const [operationData, setOperationData] = useState({
    // Data e ora
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    
    // Fertilizzazione
    fertilizerType: 'NPK 20-20-20',
    dosagePerPlant: 50, // grammi
    applicationMethod: 'soil' as 'soil' | 'foliar' | 'fertigation',
    
    // Trattamento
    productName: 'Rame Biologico',
    activeIngredient: 'Solfato di Rame',
    concentration: 0.5, // %
    treatmentType: 'fungicida' as 'fungicida' | 'insetticida' | 'erbicida' | 'biologico',
    
    // Lavorazione
    cultivationType: 'weeding' as 'weeding' | 'hoeing' | 'mulching' | 'pruning',
    tools: 'Zappa manuale',
    
    // Condizioni
    temperature: 20, // °C
    humidity: 60, // %
    windSpeed: 5, // km/h
    weatherCondition: 'sereno' as 'sereno' | 'nuvoloso' | 'pioggia' | 'vento',
    
    // Note e foto
    notes: '',
    photos: [] as File[]
  })
  
  // Calculated values
  const fieldRow = fieldRows.find(fr => fr.id === fieldRowId)
  const fieldRowPlants = plants.filter(p => p.fieldRowId === fieldRowId)
  const totalDosage = operationType === 'fertilization' 
    ? fieldRowPlants.length * operationData.dosagePerPlant 
    : 0
  const estimatedCost = calculateEstimatedCost()
  
  useEffect(() => {
    if (isOpen && garden.coordinates) {
      loadWeatherData()
    }
  }, [isOpen, garden.coordinates])
  
  const loadWeatherData = async () => {
    if (!garden.coordinates?.latitude || !garden.coordinates?.longitude) return
    
    setLoadingWeather(true)
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${garden.coordinates.latitude}&longitude=${garden.coordinates.longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
      )
      const data = await response.json()
      
      if (data.current_weather) {
        setWeatherData(data.current_weather)
        setOperationData(prev => ({
          ...prev,
          temperature: Math.round(data.current_weather.temperature),
          windSpeed: Math.round(data.current_weather.windspeed),
          weatherCondition: getWeatherCondition(data.current_weather.weathercode)
        }))
      }
    } catch (error) {
      console.error('Error loading weather:', error)
    } finally {
      setLoadingWeather(false)
    }
  }
  
  const getWeatherCondition = (code: number): string => {
    if (code <= 1) return 'sereno'
    if (code <= 3) return 'nuvoloso'
    if (code >= 51) return 'pioggia'
    return 'nuvoloso'
  }
  
  function calculateEstimatedCost(): number {
    switch (operationType) {
      case 'fertilization':
        return totalDosage * 0.05 // €0.05 per grammo
      case 'treatment':
        const solutionAmount = fieldRowPlants.length * 0.5 // 0.5L per pianta
        return solutionAmount * 2.0 // €2 per litro
      case 'cultivation':
        const timeRequired = fieldRow ? fieldRow.lengthMeters * 5 : 60 // 5 min per metro
        return (timeRequired / 60) * 15 // €15 per ora
      default:
        return 0
    }
  }
  
  const getOperationIcon = () => {
    switch (operationType) {
      case 'fertilization': return <Zap className="text-yellow-600" size={24} />
      case 'treatment': return <Scissors className="text-orange-600" size={24} />
      case 'cultivation': return <Wrench className="text-purple-600" size={24} />
    }
  }
  
  const getOperationTitle = () => {
    switch (operationType) {
      case 'fertilization': return 'Fertilizzazione Rapida'
      case 'treatment': return 'Trattamento Rapido'
      case 'cultivation': return 'Lavorazione Rapida'
    }
  }
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setOperationData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }))
  }
  
  const handleExecuteOperation = async () => {
    if (!fieldRow) {
      alert('Filare non trovato')
      return
    }
    
    setLoading(true)
    
    try {
      // Crea richiesta operazione
      const request: IntegratedOperationRequest = {
        gardenId: garden.id,
        fieldRowIds: [fieldRowId],
        operationType,
        scheduledDate: `${operationData.date}T${operationData.time}:00`,
        config: {
          // Fertilizzazione
          fertilizerType: operationType === 'fertilization' ? operationData.fertilizerType : undefined,
          dosagePerPlant: operationType === 'fertilization' ? operationData.dosagePerPlant : undefined,
          totalDosage: operationType === 'fertilization' ? totalDosage : undefined,
          
          // Trattamento
          treatmentType: operationType === 'treatment' ? operationData.treatmentType : undefined,
          productName: operationType === 'treatment' ? operationData.productName : undefined,
          concentration: operationType === 'treatment' ? operationData.concentration : undefined,
          applicationMethod: operationType === 'treatment' ? operationData.applicationMethod : undefined,
          
          // Lavorazione
          cultivationType: operationType === 'cultivation' ? operationData.cultivationType : undefined
        },
        plantApplication: {
          applyToAllPlants: true
        },
        notes: `${operationData.notes}\n\nCondizioni meteo:\n- Temperatura: ${operationData.temperature}°C\n- Umidità: ${operationData.humidity}%\n- Vento: ${operationData.windSpeed} km/h\n- Condizioni: ${operationData.weatherCondition}`
      }
      
      // Esegui operazione
      const result = await integratedFieldOperationsService.createIntegratedOperation(
        request,
        fieldRows,
        plants
      )
      
      if (result.success) {
        // Salva foto se presenti
        if (operationData.photos.length > 0) {
          // TODO: Implementare upload foto
          console.log('📸 Foto da salvare:', operationData.photos.length)
        }
        
        // Crea registro operazione dettagliato
        const operationRecord = {
          id: `quick_op_${Date.now()}`,
          type: operationType,
          fieldRowId,
          fieldRowName: fieldRow.name,
          gardenId: garden.id,
          gardenName: garden.name,
          
          // Data e ora
          executedAt: `${operationData.date}T${operationData.time}:00`,
          executedBy: 'user', // TODO: Implementare utente corrente
          
          // Dettagli operazione
          details: {
            fertilization: operationType === 'fertilization' ? {
              type: operationData.fertilizerType,
              dosagePerPlant: operationData.dosagePerPlant,
              totalDosage,
              applicationMethod: operationData.applicationMethod
            } : undefined,
            
            treatment: operationType === 'treatment' ? {
              productName: operationData.productName,
              activeIngredient: operationData.activeIngredient,
              concentration: operationData.concentration,
              treatmentType: operationData.treatmentType,
              applicationMethod: operationData.applicationMethod
            } : undefined,
            
            cultivation: operationType === 'cultivation' ? {
              type: operationData.cultivationType,
              tools: operationData.tools
            } : undefined
          },
          
          // Condizioni meteo
          weatherConditions: {
            temperature: operationData.temperature,
            humidity: operationData.humidity,
            windSpeed: operationData.windSpeed,
            condition: operationData.weatherCondition,
            source: weatherData ? 'api' : 'manual'
          },
          
          // Risultati
          results: {
            plantsAffected: result.plantsAffected,
            fieldRowsAffected: result.fieldRowsAffected,
            totalAmount: result.totalAmount,
            estimatedCost
          },
          
          // Note e foto
          notes: operationData.notes,
          photosCount: operationData.photos.length,
          
          createdAt: new Date().toISOString()
        }
        
        // Salva registro (TODO: implementare storage)
        console.log('📋 Registro operazione creato:', operationRecord)
        
        alert(`✅ ${getOperationTitle()} completata!\n\n` +
              `📊 Risultati:\n` +
              `• ${result.plantsAffected} piante trattate\n` +
              `• ${result.totalAmount} ${getAmountUnit()} applicati\n` +
              `• €${estimatedCost.toFixed(2)} costo stimato\n\n` +
              `🌤️ Condizioni: ${operationData.temperature}°C, ${operationData.weatherCondition}`)
        
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
  
  const getAmountUnit = () => {
    switch (operationType) {
      case 'fertilization': return 'grammi'
      case 'treatment': return 'litri'
      case 'cultivation': return 'minuti'
      default: return ''
    }
  }
  
  if (!isOpen || !fieldRow) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                {getOperationIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{getOperationTitle()}</h2>
                <p className="text-gray-600">{fieldRow.name} • {fieldRowPlants.length} piante</p>
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
          {/* Data e Ora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Data
              </label>
              <input
                type="date"
                value={operationData.date}
                onChange={(e) => setOperationData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-2" />
                Ora
              </label>
              <input
                type="time"
                value={operationData.time}
                onChange={(e) => setOperationData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          {/* Configurazione Operazione */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Configurazione {getOperationTitle()}</h3>
            
            {operationType === 'fertilization' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Fertilizzante
                  </label>
                  <select
                    value={operationData.fertilizerType}
                    onChange={(e) => setOperationData(prev => ({ ...prev, fertilizerType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="NPK 20-20-20">NPK 20-20-20</option>
                    <option value="NPK 15-15-15">NPK 15-15-15</option>
                    <option value="Compost">Compost</option>
                    <option value="Letame maturo">Letame maturo</option>
                    <option value="Humus di lombrico">Humus di lombrico</option>
                    <option value="Fertilizzante biologico">Fertilizzante biologico</option>
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
                    value={operationData.dosagePerPlant}
                    onChange={(e) => setOperationData(prev => ({ ...prev, dosagePerPlant: parseInt(e.target.value) || 50 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metodo Applicazione
                  </label>
                  <select
                    value={operationData.applicationMethod}
                    onChange={(e) => setOperationData(prev => ({ ...prev, applicationMethod: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="soil">Al suolo</option>
                    <option value="foliar">Fogliare</option>
                    <option value="fertigation">Fertirrigazione</option>
                  </select>
                </div>
              </div>
            )}
            
            {operationType === 'treatment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Prodotto
                  </label>
                  <input
                    type="text"
                    value={operationData.productName}
                    onChange={(e) => setOperationData(prev => ({ ...prev, productName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Es. Rame Biologico"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Principio Attivo
                  </label>
                  <input
                    type="text"
                    value={operationData.activeIngredient}
                    onChange={(e) => setOperationData(prev => ({ ...prev, activeIngredient: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Es. Solfato di Rame"
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
                    value={operationData.concentration}
                    onChange={(e) => setOperationData(prev => ({ ...prev, concentration: parseFloat(e.target.value) || 0.5 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Trattamento
                  </label>
                  <select
                    value={operationData.treatmentType}
                    onChange={(e) => setOperationData(prev => ({ ...prev, treatmentType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="fungicida">Fungicida</option>
                    <option value="insetticida">Insetticida</option>
                    <option value="erbicida">Erbicida</option>
                    <option value="biologico">Biologico</option>
                  </select>
                </div>
              </div>
            )}
            
            {operationType === 'cultivation' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Lavorazione
                  </label>
                  <select
                    value={operationData.cultivationType}
                    onChange={(e) => setOperationData(prev => ({ ...prev, cultivationType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="weeding">Diserbo manuale</option>
                    <option value="hoeing">Sarchiatura</option>
                    <option value="mulching">Pacciamatura</option>
                    <option value="pruning">Potatura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strumenti Utilizzati
                  </label>
                  <input
                    type="text"
                    value={operationData.tools}
                    onChange={(e) => setOperationData(prev => ({ ...prev, tools: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Es. Zappa manuale, Forbici"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Condizioni Meteo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-900">Condizioni Meteo</h3>
              {loadingWeather ? (
                <Loader2 className="animate-spin text-blue-600" size={16} />
              ) : (
                <button
                  onClick={loadWeatherData}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Aggiorna
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-blue-700 mb-1">
                  <Thermometer size={12} className="inline mr-1" />
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  min="-10"
                  max="50"
                  value={operationData.temperature}
                  onChange={(e) => setOperationData(prev => ({ ...prev, temperature: parseInt(e.target.value) || 20 }))}
                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-700 mb-1">
                  <CloudRain size={12} className="inline mr-1" />
                  Umidità (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={operationData.humidity}
                  onChange={(e) => setOperationData(prev => ({ ...prev, humidity: parseInt(e.target.value) || 60 }))}
                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-700 mb-1">
                  <Wind size={12} className="inline mr-1" />
                  Vento (km/h)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={operationData.windSpeed}
                  onChange={(e) => setOperationData(prev => ({ ...prev, windSpeed: parseInt(e.target.value) || 5 }))}
                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-700 mb-1">
                  Condizioni
                </label>
                <select
                  value={operationData.weatherCondition}
                  onChange={(e) => setOperationData(prev => ({ ...prev, weatherCondition: e.target.value as any }))}
                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sereno">Sereno</option>
                  <option value="nuvoloso">Nuvoloso</option>
                  <option value="pioggia">Pioggia</option>
                  <option value="vento">Ventoso</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Calcoli */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Calculator size={16} />
              Calcoli Automatici
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-green-600">Piante Trattate</p>
                <p className="font-bold text-green-900">{fieldRowPlants.length}</p>
              </div>
              <div>
                <p className="text-green-600">Quantità Totale</p>
                <p className="font-bold text-green-900">
                  {operationType === 'fertilization' ? totalDosage : 
                   operationType === 'treatment' ? fieldRowPlants.length * 0.5 :
                   fieldRow.lengthMeters * 5} {getAmountUnit()}
                </p>
              </div>
              <div>
                <p className="text-green-600">Costo Stimato</p>
                <p className="font-bold text-green-900">€{estimatedCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-green-600">Durata Stimata</p>
                <p className="font-bold text-green-900">
                  {operationType === 'fertilization' ? fieldRowPlants.length * 2 :
                   operationType === 'treatment' ? fieldRowPlants.length * 1.5 :
                   fieldRow.lengthMeters * 5} min
                </p>
              </div>
            </div>
          </div>
          
          {/* Note e Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Aggiuntive
            </label>
            <textarea
              value={operationData.notes}
              onChange={(e) => setOperationData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Aggiungi note sull'operazione..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera size={16} className="inline mr-2" />
              Foto Operazione
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            {operationData.photos.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {operationData.photos.length} foto selezionate
              </p>
            )}
          </div>
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
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Eseguendo...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Esegui {getOperationTitle()}
                </>
              )}
            </button>
          </div>
          
          <div className="mt-3 text-center text-sm text-gray-600">
            L'operazione sarà registrata con data, ora, condizioni meteo e applicata a tutte le piante del filare
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickOperationModal