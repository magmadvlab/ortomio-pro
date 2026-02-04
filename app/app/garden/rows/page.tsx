'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import { ArrowLeft, Save, Trash2, Settings, Droplets, Sprout, Plus, Edit2, Brain, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useFieldRowPredictions } from '@/services/fieldRowPredictiveService'
import FieldRowPredictionWidget from '@/components/fieldrows/FieldRowPredictionWidget'

export default function GardenRowsPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [gardens, setGardens] = useState<Garden[]>([])
  const [fieldRows, setFieldRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null)
  const [showPredictions, setShowPredictions] = useState(false)

  // URL parameters
  const gardenId = searchParams.get('garden')

  // AI Predictions
  const { predictions, loading: predictionsLoading, error: predictionsError, reload: reloadPredictions } = useFieldRowPredictions(selectedGarden?.id || '')

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        
        // Select garden from URL or first available
        const garden = gardenId 
          ? loadedGardens.find(g => g.id === gardenId)
          : loadedGardens[0]
        
        if (garden) {
          setSelectedGarden(garden)
          const rows = await storageProvider.getFieldRows(garden.id)
          setFieldRows(rows || [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider, gardenId])

  const handleDeleteRow = async (rowId: string, rowName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il filare "${rowName}"?`)) return

    try {
      await storageProvider.deleteFieldRow(rowId)
      // Reload field rows
      if (selectedGarden) {
        const rows = await storageProvider.getFieldRows(selectedGarden.id)
        setFieldRows(rows || [])
      }
      alert('✅ Filare eliminato con successo')
    } catch (error) {
      console.error('Error deleting field row:', error)
      alert('❌ Errore durante l\'eliminazione del filare')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (!selectedGarden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nessun orto trovato</h2>
          <p className="text-gray-600 mb-6">Crea il tuo primo orto per gestire i filari</p>
          <Link
            href="/app/settings?section=gardens"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Crea Orto
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/app"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  🌾 Filari Campo Aperto
                </h1>
                <p className="text-gray-600 mt-1">
                  {selectedGarden.name} • {fieldRows.length} filari configurati
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  showPredictions 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'border border-purple-300 text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Brain size={16} />
                AI Predictions
                {predictionsLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              </button>
              <Link
                href={`/app/garden/rows/edit?garden=${selectedGarden.id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Nuovo Filare
              </Link>
              <Link
                href="/app/settings?section=gardens"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Settings size={16} />
                Impostazioni Orto
              </Link>
            </div>
          </div>

          {/* Garden Selector */}
          {gardens.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Seleziona Orto:</label>
              <select
                value={selectedGarden.id}
                onChange={(e) => {
                  const newGarden = gardens.find(g => g.id === e.target.value)
                  if (newGarden) {
                    router.push(`/app/garden/rows?garden=${newGarden.id}`)
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {gardens.map(garden => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* AI Predictions Panel */}
        {showPredictions && fieldRows.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Brain size={28} />
                    AI Predictions Dashboard
                  </h2>
                  <p className="text-purple-100 mt-2">
                    Analisi predittiva avanzata per {fieldRows.length} filari • Powered by Director AI
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-purple-100">
                    {predictionsLoading ? 'Analizzando...' : `${predictions.size} predizioni generate`}
                  </div>
                  {predictionsError && (
                    <div className="text-red-200 text-sm mt-1">
                      Errore: {predictionsError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Predictions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {fieldRows.map((row) => {
                const prediction = predictions.get(row.id)
                return prediction ? (
                  <FieldRowPredictionWidget
                    key={row.id}
                    prediction={prediction}
                    compact={false}
                    showDetails={false}
                  />
                ) : (
                  <div key={row.id} className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Brain size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Analisi in corso per {row.name}...</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Stats */}
            {predictions.size > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Riepilogo Predizioni
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Array.from(predictions.values()).filter(p => p.healthStatus.riskLevel === 'low').length}
                    </div>
                    <div className="text-sm text-gray-600">Filari Sani</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Array.from(predictions.values()).filter(p => p.healthStatus.riskLevel === 'medium').length}
                    </div>
                    <div className="text-sm text-gray-600">Attenzione</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Array.from(predictions.values()).filter(p => p.healthStatus.riskLevel === 'high').length}
                    </div>
                    <div className="text-sm text-gray-600">Rischio Alto</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Array.from(predictions.values()).filter(p => p.healthStatus.riskLevel === 'critical').length}
                    </div>
                    <div className="text-sm text-gray-600">Critici</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {fieldRows.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sprout className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun filare configurato</h3>
            <p className="text-gray-600 mb-6">
              Inizia creando il tuo primo filare per organizzare le coltivazioni del campo aperto
            </p>
            <Link
              href={`/app/garden/rows/edit?garden=${selectedGarden.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Crea Primo Filare
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Stats - Larger and more prominent */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">🌾</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Filari Totali</p>
                    <p className="text-3xl font-bold text-green-900">{fieldRows.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <Droplets className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Con Irrigazione</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {fieldRows.filter(row => row.irrigationConfig?.enabled).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">🌱</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">Coltivati</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {fieldRows.filter(row => row.cultivar).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">📏</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Lunghezza Tot.</p>
                    <p className="text-3xl font-bold text-orange-900">
                      {fieldRows.reduce((sum, row) => sum + (row.length_meters || 0), 0)}m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Rows Grid - Larger cards with plant icons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {fieldRows.map((row, index) => {
                const prediction = predictions.get(row.id)
                
                return (
                  <div key={row.id} className="bg-white rounded-xl border-2 border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Header with plant visualization */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{row.name}</h3>
                          <p className="text-green-100">Filare #{row.row_number || index + 1}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl mb-1">🌾</div>
                          <div className="text-xs text-green-100">{row.length_meters}m</div>
                        </div>
                      </div>
                      
                      {/* Plant visualization */}
                      <div className="bg-green-400/30 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm text-green-100 mb-2">
                          <span>Visualizzazione Piante</span>
                          {row.plant_spacing && (
                            <span>~{Math.floor((row.length_meters * 100) / row.plant_spacing)} piante</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: Math.min(20, Math.floor((row.length_meters * 100) / (row.plant_spacing || 50))) }).map((_, i) => (
                            <span key={i} className="text-lg">🌱</span>
                          ))}
                          {Math.floor((row.length_meters * 100) / (row.plant_spacing || 50)) > 20 && (
                            <span className="text-green-200 text-sm">+{Math.floor((row.length_meters * 100) / (row.plant_spacing || 50)) - 20}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* AI Prediction Compact Widget */}
                      {showPredictions && prediction && (
                        <div className="mb-4">
                          <FieldRowPredictionWidget
                            prediction={prediction}
                            compact={true}
                          />
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {row.irrigationConfig?.enabled && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-700 text-sm font-medium rounded-full">
                            <Droplets size={14} />
                            Irrigato
                          </span>
                        )}
                        {row.cultivar && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            <span>🌱</span>
                            {row.cultivar}
                          </span>
                        )}
                        {row.planted_date && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                            <span>📅</span>
                            {new Date(row.planted_date).toLocaleDateString('it-IT')}
                          </span>
                        )}
                      </div>
                      
                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📏</span>
                          <div>
                            <div className="font-medium text-gray-900">Lunghezza</div>
                            <div>{row.length_meters}m</div>
                          </div>
                        </div>
                        {row.distance_from_previous_row && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">↔️</span>
                            <div>
                              <div className="font-medium text-gray-900">Distanza</div>
                              <div>{row.distance_from_previous_row}cm</div>
                            </div>
                          </div>
                        )}
                        {row.plant_spacing && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📐</span>
                            <div>
                              <div className="font-medium text-gray-900">Spaziatura</div>
                              <div>{row.plant_spacing}cm</div>
                            </div>
                          </div>
                        )}
                        {row.orientation && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🧭</span>
                            <div>
                              <div className="font-medium text-gray-900">Orientamento</div>
                              <div>{row.orientation}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Irrigation Details */}
                      {row.irrigationConfig?.enabled && (
                        <div className="mb-4 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="text-cyan-600" size={16} />
                            <span className="font-medium text-cyan-800">Sistema Irrigazione Attivo</span>
                          </div>
                          <div className="text-sm text-cyan-700 space-y-1">
                            <div>Tipo: {row.irrigationConfig.irrigationType === 'drip' ? 'Goccia a Goccia' : row.irrigationConfig.irrigationType}</div>
                            {row.irrigationConfig.totalFlowRate > 0 && (
                              <div>Portata: {row.irrigationConfig.totalFlowRate} L/h</div>
                            )}
                            {row.irrigationConfig.schedule && (
                              <div>Programmazione: {row.irrigationConfig.schedule.frequency} alle {row.irrigationConfig.schedule.times?.[0] || '08:00'}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-3 gap-2">
                        <Link
                          href={`/app/garden/rows?garden=${selectedGarden.id}`}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <span className="text-sm">🌾</span>
                          Filari
                        </Link>
                        <Link
                          href={`/app/plants?garden=${selectedGarden.id}&fieldRow=${row.id}`}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <span className="text-sm">🌱</span>
                          Piante
                        </Link>
                        <Link
                          href={`/app/garden/rows/edit?garden=${selectedGarden.id}&id=${row.id}`}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                          <Edit2 size={14} />
                          Configura
                        </Link>
                      </div>
                      
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteRow(row.id, row.name)}
                        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        Elimina Filare
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}