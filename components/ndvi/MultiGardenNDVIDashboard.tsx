'use client'

import React, { useState, useEffect } from 'react'
import { Garden } from '../../types'
import { NDVISatelliteService, NDVIReading } from '../../services/ndviSatelliteService'
import { Satellite, TrendingUp, TrendingDown, Minus, AlertTriangle, Leaf, MapPin, RefreshCw } from 'lucide-react'

interface MultiGardenNDVIDashboardProps {
  gardens: Garden[]
}

interface GardenNDVIData {
  garden: Garden
  ndviReading: NDVIReading | null
  loading: boolean
  error?: string
}

const MultiGardenNDVIDashboard: React.FC<MultiGardenNDVIDashboardProps> = ({ gardens }) => {
  const [gardenData, setGardenData] = useState<GardenNDVIData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllGardensNDVI()
  }, [gardens])

  const loadAllGardensNDVI = async () => {
    setLoading(true)
    
    // Inizializza array con loading state
    const initialData: GardenNDVIData[] = gardens.map(garden => ({
      garden,
      ndviReading: null,
      loading: true
    }))
    setGardenData(initialData)

    // Carica NDVI per ogni garden in parallelo
    const promises = gardens.map(async (garden, index) => {
      try {
        const ndviReading = await NDVISatelliteService.getLatestNDVI(garden)
        return { garden, ndviReading, loading: false }
      } catch (error) {
        console.error(`Errore NDVI per ${garden.name}:`, error)
        return { 
          garden, 
          ndviReading: null, 
          loading: false, 
          error: 'Errore caricamento dati' 
        }
      }
    })

    try {
      const results = await Promise.all(promises)
      setGardenData(results)
    } catch (error) {
      console.error('Errore caricamento NDVI multi-garden:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGardenTypeEmoji = (gardenType: string) => {
    switch (gardenType?.toLowerCase()) {
      case 'orchard': case 'frutteto': return '🍎'
      case 'vineyard': case 'vigneto': return '🍇'
      case 'olive': case 'oliveto': return '🫒'
      case 'garden': case 'orto': default: return '🌱'
    }
  }

  const getOptimalNDVIRange = (gardenType: string) => {
    switch (gardenType?.toLowerCase()) {
      case 'orchard': case 'frutteto': return { min: 0.7, max: 0.9, label: 'Frutteto' }
      case 'vineyard': case 'vigneto': return { min: 0.4, max: 0.6, label: 'Vigneto' }
      case 'olive': case 'oliveto': return { min: 0.5, max: 0.7, label: 'Oliveto' }
      case 'garden': case 'orto': default: return { min: 0.6, max: 0.8, label: 'Orto' }
    }
  }

  const getNDVIStatus = (ndvi: number, gardenType: string) => {
    const range = getOptimalNDVIRange(gardenType)
    
    if (ndvi >= range.min && ndvi <= range.max) {
      return { status: 'optimal', color: 'text-green-600 bg-green-50 border-green-200', label: 'Ottimale' }
    } else if (ndvi >= range.min - 0.1 && ndvi <= range.max + 0.1) {
      return { status: 'good', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Buono' }
    } else if (ndvi < range.min - 0.1) {
      return { status: 'low', color: 'text-red-600 bg-red-50 border-red-200', label: 'Basso' }
    } else {
      return { status: 'high', color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Alto' }
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-green-500'
      case 'moderate': return 'text-yellow-600'
      case 'poor': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Statistiche aggregate
  const totalGardens = gardens.length
  const loadedGardens = gardenData.filter(g => !g.loading && g.ndviReading).length
  const averageNDVI = gardenData
    .filter(g => g.ndviReading)
    .reduce((sum, g) => sum + g.ndviReading!.ndvi_value, 0) / Math.max(loadedGardens, 1)
  const gardensNeedingAttention = gardenData.filter(g => 
    g.ndviReading && (
      g.ndviReading.analysis.stress_indicators.water_stress ||
      g.ndviReading.analysis.stress_indicators.nutrient_deficiency ||
      g.ndviReading.analysis.stress_indicators.disease_risk
    )
  ).length

  return (
    <div className="space-y-6">
      {/* Header con statistiche aggregate */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Satellite className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Monitoraggio NDVI Multi-Garden</h2>
              <p className="text-sm text-gray-500">Analisi satellitare per tutti i tuoi terreni</p>
            </div>
          </div>
          <button
            onClick={loadAllGardensNDVI}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna Tutti
          </button>
        </div>

        {/* Statistiche aggregate */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Terreni Totali</span>
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalGardens}</div>
            <div className="text-xs text-gray-500">{loadedGardens} con dati NDVI</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">NDVI Medio</span>
              <Leaf className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${getHealthColor(averageNDVI >= 0.6 ? 'good' : averageNDVI >= 0.4 ? 'moderate' : 'poor')}`}>
              {loadedGardens > 0 ? averageNDVI.toFixed(3) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Su {loadedGardens} terreni</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Richiedono Attenzione</span>
              <AlertTriangle className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${gardensNeedingAttention > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {gardensNeedingAttention}
            </div>
            <div className="text-xs text-gray-500">
              {gardensNeedingAttention > 0 ? 'Intervento necessario' : 'Tutto OK'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Ultimo Aggiornamento</span>
              <Satellite className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-sm font-bold text-gray-700">
              {new Date().toLocaleDateString('it-IT')}
            </div>
            <div className="text-xs text-gray-500">Sentinel-2 • 10m</div>
          </div>
        </div>
      </div>

      {/* Lista gardens con NDVI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gardenData.map((data, index) => {
          const { garden, ndviReading, loading: gardenLoading, error } = data
          const gardenType = garden.gardenType || 'garden'
          const optimalRange = getOptimalNDVIRange(gardenType)
          
          return (
            <div key={garden.id} className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Header garden */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getGardenTypeEmoji(gardenType)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{garden.name}</h3>
                    <p className="text-sm text-gray-500">{optimalRange.label}</p>
                  </div>
                </div>
                {garden.coordinates && (
                  <div className="text-xs text-gray-400 text-right">
                    <div>{garden.coordinates.latitude.toFixed(4)}</div>
                    <div>{garden.coordinates.longitude.toFixed(4)}</div>
                  </div>
                )}
              </div>

              {/* Contenuto NDVI */}
              {gardenLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Caricamento...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Errore</span>
                  </div>
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              ) : ndviReading ? (
                <div className="space-y-4">
                  {/* NDVI Value */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {ndviReading.ndvi_value.toFixed(3)}
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getNDVIStatus(ndviReading.ndvi_value, gardenType).color}`}>
                      {getNDVIStatus(ndviReading.ndvi_value, gardenType).label}
                    </div>
                  </div>

                  {/* Range ottimale */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-2">Range Ottimale {optimalRange.label}:</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono">{optimalRange.min.toFixed(1)}</span>
                      <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full relative">
                        <div 
                          className="absolute h-full bg-green-400 rounded-full"
                          style={{ 
                            left: `${(optimalRange.min / 1.0) * 100}%`,
                            width: `${((optimalRange.max - optimalRange.min) / 1.0) * 100}%`
                          }}
                        ></div>
                        <div 
                          className="absolute w-2 h-2 bg-blue-600 rounded-full transform -translate-x-1 -translate-y-0"
                          style={{ 
                            left: `${(ndviReading.ndvi_value / 1.0) * 100}%`,
                            top: '0px'
                          }}
                        ></div>
                      </div>
                      <span className="font-mono">{optimalRange.max.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Salute vegetazione */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Salute:</span>
                    <span className={`text-sm font-medium ${getHealthColor(ndviReading.analysis.vegetation_health)}`}>
                      {ndviReading.analysis.vegetation_health.toUpperCase()}
                    </span>
                  </div>

                  {/* Indicatori stress */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Indicatori:</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className={`text-center p-2 rounded ${ndviReading.analysis.stress_indicators.water_stress ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        💧 {ndviReading.analysis.stress_indicators.water_stress ? 'Stress' : 'OK'}
                      </div>
                      <div className={`text-center p-2 rounded ${ndviReading.analysis.stress_indicators.nutrient_deficiency ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        🌿 {ndviReading.analysis.stress_indicators.nutrient_deficiency ? 'Carenza' : 'OK'}
                      </div>
                      <div className={`text-center p-2 rounded ${ndviReading.analysis.stress_indicators.disease_risk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        🦠 {ndviReading.analysis.stress_indicators.disease_risk ? 'Rischio' : 'OK'}
                      </div>
                    </div>
                  </div>

                  {/* Data ultimo aggiornamento */}
                  <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                    Aggiornato: {new Date(ndviReading.date).toLocaleDateString('it-IT')}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Satellite className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Dati non disponibili</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Valori NDVI Ottimali per Tipo di Coltivazione</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🌱</span>
              <span className="font-medium text-gray-900">Orto Domestico</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Ottimale: <span className="font-mono font-bold">0.6 - 0.8</span></div>
              <div className="text-xs mt-1">Ortaggi a foglia, pomodori, peperoni</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🍎</span>
              <span className="font-medium text-gray-900">Frutteto</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Ottimale: <span className="font-mono font-bold">0.7 - 0.9</span></div>
              <div className="text-xs mt-1">Meli, peri, peschi, ciliegi</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🫒</span>
              <span className="font-medium text-gray-900">Oliveto</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Ottimale: <span className="font-mono font-bold">0.5 - 0.7</span></div>
              <div className="text-xs mt-1">Olivi resistenti alla siccità</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🍇</span>
              <span className="font-medium text-gray-900">Vigneto</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Ottimale: <span className="font-mono font-bold">0.4 - 0.6</span></div>
              <div className="text-xs mt-1">Viti con stress controllato</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Nota:</strong> I valori NDVI ottimali variano in base al tipo di coltivazione. 
            Il sistema adatta automaticamente l'analisi per ogni terreno in base alla tipologia configurata.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MultiGardenNDVIDashboard