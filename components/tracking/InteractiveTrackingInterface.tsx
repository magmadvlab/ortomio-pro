/**
 * Interactive Tracking Interface
 * Interfaccia interattiva per registrazione completa operazioni e osservazioni
 * 
 * Funzionalità:
 * - Registrazione rapida operazioni con template
 * - Osservazioni dettagliate con foto
 * - Tracciabilità automatica
 * - Analisi correlazioni in tempo reale
 * - Suggerimenti AI contestuali
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Camera,
  Droplets,
  Leaf,
  Bug,
  Scissors,
  Award,
  Eye,
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  DollarSign,
  Target,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Save,
  Upload,
  Download,
  QrCode,
  Share2,
  Calendar,
  Thermometer,
  CloudRain,
  Sun
} from 'lucide-react'
import { GardenPlant } from '@/types/individualPlant'
import {
  unifiedPlantTrackingService,
  PlantTrackingRecord,
  PlantAnalytics,
  PlantOrigin,
  recordPlantOrigin,
  calculateOriginSpecificAnalytics,
  generateOriginSpecificRecommendations
} from '@/services/unifiedPlantTrackingService'

interface InteractiveTrackingInterfaceProps {
  plant: GardenPlant
  onClose?: () => void
  onRecordAdded?: (record: PlantTrackingRecord) => void
}

interface QuickAction {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  type: 'operation' | 'observation' | 'harvest'
  template: any
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'origin',
    name: 'Origine Pianta',
    icon: Plus,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    type: 'operation',
    template: {
      operationType: 'origin_setup',
      quantity: 1,
      unit: 'pianta',
      product: 'Setup origine'
    }
  },
  {
    id: 'water',
    name: 'Irrigazione',
    icon: Droplets,
    color: 'bg-blue-500 hover:bg-blue-600',
    type: 'operation',
    template: {
      operationType: 'watering',
      quantity: 2,
      unit: 'L',
      product: 'Acqua'
    }
  },
  {
    id: 'fertilize',
    name: 'Concimazione',
    icon: Leaf,
    color: 'bg-green-500 hover:bg-green-600',
    type: 'operation',
    template: {
      operationType: 'fertilizing',
      quantity: 30,
      unit: 'g',
      product: 'Concime NPK'
    }
  },
  {
    id: 'treat',
    name: 'Trattamento',
    icon: Bug,
    color: 'bg-red-500 hover:bg-red-600',
    type: 'operation',
    template: {
      operationType: 'treatment',
      quantity: 10,
      unit: 'ml',
      product: 'Fungicida biologico'
    }
  },
  {
    id: 'prune',
    name: 'Potatura',
    icon: Scissors,
    color: 'bg-purple-500 hover:bg-purple-600',
    type: 'operation',
    template: {
      operationType: 'pruning',
      quantity: 1,
      unit: 'sessione',
      product: 'Potatura manutenzione'
    }
  },
  {
    id: 'observe',
    name: 'Osservazione',
    icon: Eye,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    type: 'observation',
    template: {
      healthScore: 80,
      notes: ''
    }
  },
  {
    id: 'harvest',
    name: 'Raccolto',
    icon: Award,
    color: 'bg-orange-500 hover:bg-orange-600',
    type: 'harvest',
    template: {
      quantity: 1,
      unit: 'kg',
      quality: 4,
      destination: 'personal'
    }
  }
]

export default function InteractiveTrackingInterface({
  plant,
  onClose,
  onRecordAdded
}: InteractiveTrackingInterfaceProps) {
  const [activeMode, setActiveMode] = useState<'quick' | 'detailed' | 'analytics'>('quick')
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [records, setRecords] = useState<PlantTrackingRecord[]>([])
  const [analytics, setAnalytics] = useState<PlantAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [weatherData, setWeatherData] = useState<any>(null)
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showOriginModal, setShowOriginModal] = useState(false)
  const [originData, setOriginData] = useState<PlantOrigin | null>(null)
  const [originAnalytics, setOriginAnalytics] = useState<any>(null)

  useEffect(() => {
    loadPlantData()
    loadWeatherData()
    getGPSLocation()
  }, [plant.id])

  const loadPlantData = async () => {
    const plantRecords = unifiedPlantTrackingService.getPlantRecords(plant.id)
    const plantAnalytics = unifiedPlantTrackingService.getPlantAnalytics(plant.id)
    
    setRecords(plantRecords)
    setAnalytics(plantAnalytics || null)
    
    // Carica analytics origine se disponibili
    if (plantRecords.length > 0) {
      const originAnalysis = calculateOriginSpecificAnalytics(plant.id, plantRecords)
      setOriginAnalytics(originAnalysis)
      setOriginData(originAnalysis.originData)
    }
  }

  const loadWeatherData = async () => {
    // Mock weather data - in real app would fetch from weather API
    setWeatherData({
      temperature: 22,
      humidity: 65,
      conditions: 'Soleggiato',
      windSpeed: 5
    })
  }

  const getGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('GPS location not available:', error)
        }
      )
    }
  }

  const handleQuickAction = async (action: QuickAction) => {
    if (action.id === 'origin') {
      setShowOriginModal(true)
      return
    }
    
    setSelectedAction(action)
    setFormData(action.template)
  }

  const handleSaveRecord = async () => {
    if (!selectedAction) return

    setLoading(true)
    try {
      let record: PlantTrackingRecord

      if (selectedAction.type === 'operation') {
        record = await unifiedPlantTrackingService.recordOperation(
          plant.id,
          formData.operationType,
          {
            quantity: formData.quantity,
            unit: formData.unit,
            product: formData.product,
            cost: formData.cost,
            notes: formData.notes,
            photos,
            weather: weatherData,
            gpsLocation: gpsLocation || undefined
          }
        )
      } else if (selectedAction.type === 'observation') {
        record = await unifiedPlantTrackingService.recordObservation(
          plant.id,
          {
            healthScore: formData.healthScore,
            height: formData.height,
            width: formData.width,
            leafCount: formData.leafCount,
            flowerCount: formData.flowerCount,
            fruitCount: formData.fruitCount,
            issues: formData.issues,
            notes: formData.notes,
            photos
          }
        )
      } else if (selectedAction.type === 'harvest') {
        record = await unifiedPlantTrackingService.recordHarvest(
          plant.id,
          {
            quantity: formData.quantity,
            unit: formData.unit,
            quality: formData.quality,
            marketValue: formData.marketValue,
            destination: formData.destination,
            notes: formData.notes,
            photos
          }
        )
      } else {
        throw new Error('Invalid action type')
      }

      // Aggiorna dati locali
      await loadPlantData()
      
      // Notifica parent
      if (onRecordAdded) {
        onRecordAdded(record)
      }

      // Reset form
      setSelectedAction(null)
      setFormData({})
      setPhotos([])

      console.log('✅ Record saved successfully:', record)
    } catch (error) {
      console.error('Error saving record:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTakePhoto = () => {
    // Mock photo capture - in real app would use camera API
    const mockPhoto = `photo_${Date.now()}.jpg`
    setPhotos(prev => [...prev, mockPhoto])
    setShowCamera(false)
  }

  const getActionIcon = (actionId: string) => {
    const action = QUICK_ACTIONS.find(a => a.id === actionId)
    if (!action) return <Plus size={20} />
    
    const Icon = action.icon
    return <Icon size={20} />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    if (score >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Target className="text-green-600" size={28} />
                Tracking Interattivo: {plant.plantCode}
              </h2>
              <p className="text-gray-600 mt-1">
                {plant.plantName} • Registrazione completa dal seme alla raccolta
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Weather info */}
              {weatherData && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <Sun size={16} />
                  {weatherData.temperature}°C
                </div>
              )}
              
              {/* GPS info */}
              {gpsLocation && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  <MapPin size={16} />
                  GPS
                </div>
              )}
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          {/* Mode switcher */}
          <div className="flex gap-4 mt-4">
            {[
              { id: 'quick', label: 'Azioni Rapide', icon: Zap },
              { id: 'detailed', label: 'Registrazione Dettagliata', icon: Eye },
              { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 }
            ].map(mode => {
              const Icon = mode.icon
              const isActive = activeMode === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'text-green-600 border-green-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {mode.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Actions Mode */}
          {activeMode === 'quick' && (
            <div className="space-y-6">
              {/* Current Status */}
              {analytics && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">📊 Status Attuale</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold px-2 py-1 rounded ${getHealthColor(analytics.performance.healthTrend[analytics.performance.healthTrend.length - 1]?.score || 0)}`}>
                        {analytics.performance.healthTrend[analytics.performance.healthTrend.length - 1]?.score || 0}
                      </div>
                      <div className="text-xs text-gray-600">Salute</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{analytics.lifecycle.totalDays}g</div>
                      <div className="text-xs text-gray-600">Età</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{analytics.performance.yieldPerPlant}kg</div>
                      <div className="text-xs text-gray-600">Raccolto</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{formatCurrency(analytics.economics.totalCosts)}</div>
                      <div className="text-xs text-gray-600">Costi</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {QUICK_ACTIONS.map(action => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className={`${action.color} text-white rounded-xl p-6 transition-all transform hover:scale-105 shadow-lg`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Icon size={32} />
                        <span className="font-semibold">{action.name}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* AI Suggestions */}
              {analytics?.aiInsights?.recommendations && analytics.aiInsights.recommendations.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Zap className="text-purple-600" size={18} />
                    Suggerimenti AI
                  </h3>
                  <div className="space-y-2">
                    {analytics.aiInsights.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          rec.priority === 'high' ? 'bg-red-500' :
                          rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{rec.action}</p>
                          <p className="text-sm text-gray-600">{rec.expectedImpact}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-purple-600">
                              Confidenza: {Math.round(rec.confidence * 100)}%
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {rec.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Origin-Specific Recommendations */}
              {originAnalytics && originAnalytics.originType !== 'unknown' && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                  <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    🌱 Suggerimenti Specifici per {originAnalytics.originType === 'seed' ? 'Semina Diretta' : 'Trapianto Vivaio'}
                  </h3>
                  
                  {/* Origin Info */}
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Tipo:</span>
                        <span className="ml-2 text-indigo-600">
                          {originAnalytics.originType === 'seed' ? '🌰 Da Seme' : '🌱 Da Vivaio'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Costo iniziale:</span>
                        <span className="ml-2 text-indigo-600">
                          €{originAnalytics.costAnalysis.initialCost.toFixed(2)}
                        </span>
                      </div>
                      {originAnalytics.seedMetrics && (
                        <>
                          <div>
                            <span className="font-medium text-gray-700">Germinazione:</span>
                            <span className={`ml-2 ${originAnalytics.seedMetrics.germinationSuccess ? 'text-green-600' : 'text-red-600'}`}>
                              {originAnalytics.seedMetrics.germinationSuccess ? '✅ Riuscita' : '❌ Fallita'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Giorni germinazione:</span>
                            <span className="ml-2 text-indigo-600">
                              {originAnalytics.seedMetrics.germinationDays}
                            </span>
                          </div>
                        </>
                      )}
                      {originAnalytics.nurseryMetrics && (
                        <>
                          <div>
                            <span className="font-medium text-gray-700">Attecchimento:</span>
                            <span className={`ml-2 ${originAnalytics.nurseryMetrics.transplantSuccess ? 'text-green-600' : 'text-red-600'}`}>
                              {originAnalytics.nurseryMetrics.transplantSuccess ? '✅ Riuscito' : '❌ Difficoltà'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Shock trapianto:</span>
                            <span className={`ml-2 ${
                              originAnalytics.nurseryMetrics.transplantShock === 'none' ? 'text-green-600' :
                              originAnalytics.nurseryMetrics.transplantShock === 'low' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {originAnalytics.nurseryMetrics.transplantShock === 'none' ? '✅ Nessuno' :
                               originAnalytics.nurseryMetrics.transplantShock === 'low' ? '⚠️ Lieve' :
                               '🚨 Moderato/Severo'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Origin-specific recommendations */}
                  {(() => {
                    const currentHealth = analytics?.performance.healthTrend[analytics.performance.healthTrend.length - 1]?.score || 80
                    const daysFromPlanting = analytics?.lifecycle.totalDays || 0
                    const originRecs = generateOriginSpecificRecommendations(originAnalytics, currentHealth, daysFromPlanting)
                    
                    return originRecs.length > 0 && (
                      <div className="space-y-2">
                        {originRecs.slice(0, 2).map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              rec.priority === 'high' ? 'bg-red-500' :
                              rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{rec.action}</p>
                              <p className="text-sm text-gray-600">{rec.reason}</p>
                              <p className="text-sm text-indigo-600 font-medium">{rec.expectedImpact}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-indigo-600">
                                  Confidenza: {Math.round(rec.confidence * 100)}%
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-green-100 text-green-600'
                                }`}>
                                  {rec.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Recent Records */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">📝 Ultime Registrazioni</h3>
                <div className="space-y-2">
                  {records.slice(-5).reverse().map(record => (
                    <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getActionIcon(record.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {record.type === 'operation' ? record.operationData?.operationType :
                             record.type === 'observation' ? 'Osservazione' :
                             record.type === 'harvest' ? 'Raccolto' : record.type}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                            {record.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(record.timestamp).toLocaleString('it-IT')}
                        </p>
                      </div>
                      {record.verified && (
                        <CheckCircle className="text-green-600" size={16} />
                      )}
                    </div>
                  ))}
                  
                  {records.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Info size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Nessuna registrazione</p>
                      <p className="text-sm">Inizia con la prima operazione!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Mode */}
          {activeMode === 'detailed' && (
            <div className="space-y-6">
              <div className="text-center py-8 text-gray-500">
                <Eye size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Registrazione Dettagliata</p>
                <p className="text-sm">Funzionalità in sviluppo</p>
              </div>
            </div>
          )}

          {/* Analytics Mode */}
          {activeMode === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Performance Charts */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">📈 Trend Performance</h3>
                
                {/* Health Trend */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Salute nel Tempo</h4>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
                    {analytics.performance.healthTrend.slice(-10).map((point, index) => (
                      <div
                        key={index}
                        className="bg-green-500 rounded-t"
                        style={{
                          height: `${point.score}%`,
                          width: '8%'
                        }}
                        title={`${point.date}: ${point.score}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Economics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Costi</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fertilizzanti:</span>
                        <span>{formatCurrency(analytics.economics.costBreakdown.fertilizers)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Acqua:</span>
                        <span>{formatCurrency(analytics.economics.costBreakdown.water)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Trattamenti:</span>
                        <span>{formatCurrency(analytics.economics.costBreakdown.treatments)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span>Totale:</span>
                        <span>{formatCurrency(analytics.economics.totalCosts)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">ROI</h4>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        analytics.economics.roi > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analytics.economics.roi.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600">
                        Profitto: {formatCurrency(analytics.economics.profit)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Correlations */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">🔗 Correlazioni Input → Risultati</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.correlations).map(([key, data]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">
                        {key === 'wateringFrequency' ? 'Frequenza Irrigazione' :
                         key === 'fertilizerAmount' ? 'Quantità Fertilizzante' :
                         key === 'treatmentFrequency' ? 'Frequenza Trattamenti' :
                         key === 'environmentalStress' ? 'Stress Ambientale' : key}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-2 rounded-full ${
                          data.impact === 'positive' ? 'bg-green-500' :
                          data.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium">
                          {(data.correlation * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predicted Yield */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-4">🔮 Previsione Raccolto AI</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.aiInsights.predictedYield.estimate.toFixed(1)} kg
                    </div>
                    <p className="text-sm text-blue-700">Resa Prevista</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round(analytics.aiInsights.predictedYield.confidence * 100)}%
                    </div>
                    <p className="text-sm text-purple-700">Confidenza</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-blue-800 mb-2">Fattori considerati:</p>
                  <div className="flex flex-wrap gap-2">
                    {analytics.aiInsights.predictedYield.factors.map((factor, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {selectedAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {React.createElement(selectedAction.icon, { size: 20 })}
                  {selectedAction.name}
                </h3>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Form fields based on action type */}
                {selectedAction.type === 'operation' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantità
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={formData.quantity || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={formData.unit || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prodotto
                      </label>
                      <input
                        type="text"
                        value={formData.product || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Costo (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cost || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {selectedAction.type === 'observation' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Punteggio Salute (0-100)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.healthScore || 80}
                        onChange={(e) => setFormData(prev => ({ ...prev, healthScore: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600">
                        {formData.healthScore || 80}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Altezza (cm)
                        </label>
                        <input
                          type="number"
                          value={formData.height || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Larghezza (cm)
                        </label>
                        <input
                          type="number"
                          value={formData.width || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedAction.type === 'harvest' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantità Raccolta
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.quantity || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <select
                          value={formData.unit || 'kg'}
                          onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="pieces">pz</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualità (1-5 stelle)
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setFormData(prev => ({ ...prev, quality: star }))}
                            className={`text-2xl ${
                              (formData.quality || 4) >= star ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destinazione
                      </label>
                      <select
                        value={formData.destination || 'personal'}
                        onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="personal">Consumo Personale</option>
                        <option value="market">Vendita al Mercato</option>
                        <option value="processing">Trasformazione</option>
                        <option value="seed">Semi per Prossima Stagione</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Common fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Aggiungi note dettagliate..."
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleTakePhoto}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Camera size={16} />
                      Scatta Foto
                    </button>
                    {photos.length > 0 && (
                      <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                        {photos.length} foto aggiunte
                      </span>
                    )}
                  </div>
                </div>

                {/* Weather & GPS info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 space-y-1">
                    {weatherData && (
                      <div className="flex items-center gap-2">
                        <Thermometer size={14} />
                        <span>Meteo: {weatherData.temperature}°C, {weatherData.conditions}</span>
                      </div>
                    )}
                    {gpsLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>GPS: {gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>Registrato: {new Date().toLocaleString('it-IT')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveRecord}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Salva Registrazione
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Origin Setup Modal */}
        {showOriginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  🌱 Setup Origine Pianta
                </h3>
                <button
                  onClick={() => setShowOriginModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <OriginSetupForm
                plantId={plant.id}
                onOriginSaved={async (origin) => {
                  await recordPlantOrigin(plant.id, origin)
                  await loadPlantData()
                  setShowOriginModal(false)
                }}
                onCancel={() => setShowOriginModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Origin Setup Form Component
 */
interface OriginSetupFormProps {
  plantId: string
  onOriginSaved: (origin: PlantOrigin) => void
  onCancel: () => void
}

function OriginSetupForm({ plantId, onOriginSaved, onCancel }: OriginSetupFormProps) {
  const [originType, setOriginType] = useState<'seed' | 'nursery_seedling'>('seed')
  const [formData, setFormData] = useState<Record<string, any>>({
    plantingDate: new Date().toISOString().split('T')[0],
    initialHealthScore: 80
  })

  const handleSave = () => {
    const origin: PlantOrigin = {
      type: originType,
      plantingDate: formData.plantingDate,
      initialHealthScore: formData.initialHealthScore,
      photos: [],
      notes: formData.notes || ''
    }

    if (originType === 'seed') {
      origin.seedData = {
        variety: formData.variety || '',
        supplier: formData.supplier || '',
        lotNumber: formData.lotNumber || '',
        expirationDate: formData.expirationDate || '',
        germinationRate: formData.germinationRate || 85,
        seedsPerGram: formData.seedsPerGram || 300,
        costPerSeed: formData.costPerSeed || 0.50,
        organicCertified: formData.organicCertified || false,
        treatmentApplied: formData.treatmentApplied
      }
      origin.expectedGerminationDays = formData.expectedGerminationDays || 7
    } else {
      origin.nurseryData = {
        nurseryName: formData.nurseryName || '',
        variety: formData.variety || '',
        age: formData.age || 30,
        potSize: formData.potSize || '10cm',
        rootingMedium: formData.rootingMedium || 'torba',
        costPerSeedling: formData.costPerSeedling || 2.50,
        healthCertificate: formData.healthCertificate || false,
        organicCertified: formData.organicCertified || false,
        acclimatizationNeeded: formData.acclimatizationNeeded || true,
        transplantShock: formData.transplantShock || 'low'
      }
      origin.expectedTransplantDays = formData.expectedTransplantDays || 14
    }

    onOriginSaved(origin)
  }

  return (
    <div className="space-y-4">
      {/* Origin Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo di Origine
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setOriginType('seed')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              originType === 'seed'
                ? 'border-green-500 bg-green-50 text-green-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌰</span>
              <span className="font-semibold">Semina Diretta</span>
            </div>
            <p className="text-sm text-gray-600">
              Semi piantati direttamente nel terreno
            </p>
            <p className="text-xs text-green-600 mt-1">
              💰 Costo: ~€0.50/pianta
            </p>
          </button>
          
          <button
            onClick={() => setOriginType('nursery_seedling')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              originType === 'nursery_seedling'
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌱</span>
              <span className="font-semibold">Trapianto Vivaio</span>
            </div>
            <p className="text-sm text-gray-600">
              Piantine acquistate dal vivaio
            </p>
            <p className="text-xs text-blue-600 mt-1">
              💰 Costo: ~€2.50/pianta
            </p>
          </button>
        </div>
      </div>

      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Impianto
          </label>
          <input
            type="date"
            value={formData.plantingDate}
            onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, plantingDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Varietà
          </label>
          <input
            type="text"
            value={formData.variety || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
            placeholder="es. San Marzano DOP"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Seed-specific fields */}
      {originType === 'seed' && (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900">📦 Dati Semi</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornitore
              </label>
              <input
                type="text"
                value={formData.supplier || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                placeholder="es. Franchi Sementi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo per Seme (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPerSeed || 0.50}
                onChange={(e) => setFormData(prev => ({ ...prev, costPerSeed: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tasso Germinazione (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.germinationRate || 85}
                onChange={(e) => setFormData(prev => ({ ...prev, germinationRate: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giorni Germinazione Attesi
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.expectedGerminationDays || 7}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedGerminationDays: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="organicSeed"
              checked={formData.organicCertified || false}
              onChange={(e) => setFormData(prev => ({ ...prev, organicCertified: e.target.checked }))}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="organicSeed" className="text-sm text-gray-700">
              🌿 Semi Biologici Certificati
            </label>
          </div>
        </div>
      )}

      {/* Nursery-specific fields */}
      {originType === 'nursery_seedling' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">🏪 Dati Vivaio</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Vivaio
              </label>
              <input
                type="text"
                value={formData.nurseryName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nurseryName: e.target.value }))}
                placeholder="es. Vivaio Rossi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo per Piantina (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPerSeedling || 2.50}
                onChange={(e) => setFormData(prev => ({ ...prev, costPerSeedling: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Età Piantina (giorni)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.age || 30}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensione Vaso
              </label>
              <select
                value={formData.potSize || '10cm'}
                onChange={(e) => setFormData(prev => ({ ...prev, potSize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="8cm">8cm</option>
                <option value="10cm">10cm</option>
                <option value="12cm">12cm</option>
                <option value="14cm">14cm</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shock da Trapianto
              </label>
              <select
                value={formData.transplantShock || 'low'}
                onChange={(e) => setFormData(prev => ({ ...prev, transplantShock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">🟢 Basso</option>
                <option value="medium">🟡 Medio</option>
                <option value="high">🔴 Alto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giorni Attecchimento Attesi
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.expectedTransplantDays || 14}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedTransplantDays: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="organicNursery"
                checked={formData.organicCertified || false}
                onChange={(e) => setFormData(prev => ({ ...prev, organicCertified: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="organicNursery" className="text-sm text-gray-700">
                🌿 Piantine Biologiche Certificate
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="healthCert"
                checked={formData.healthCertificate || false}
                onChange={(e) => setFormData(prev => ({ ...prev, healthCertificate: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="healthCert" className="text-sm text-gray-700">
                🏥 Certificato Sanitario
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note Aggiuntive
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          placeholder="Aggiungi note sull'origine della pianta..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Cost Comparison */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">💰 Confronto Costi</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Semina Diretta:</span>
            <div className="text-green-600">
              • Costo: €0.30-0.70/pianta<br />
              • Tempo: +14-21 giorni<br />
              • Rischio: Medio-Alto
            </div>
          </div>
          <div>
            <span className="font-medium">Trapianto Vivaio:</span>
            <div className="text-blue-600">
              • Costo: €1.50-3.50/pianta<br />
              • Tempo: Immediato<br />
              • Rischio: Basso-Medio
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Annulla
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Save size={16} />
          Salva Origine
        </button>
      </div>
    </div>
  )
}