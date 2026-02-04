'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import { ArrowLeft, Plus, Edit2, Trash2, TrendingUp, History, BarChart3, Leaf } from 'lucide-react'
import Link from 'next/link'
import {
  getLandZones,
  createLandZone,
  updateLandZone,
  deleteLandZone,
  toggleZoneStatus,
  getZoneStats,
  calculateZoneSoilHealth,
  getZoneRotationSuggestions,
  type LandZone,
  type ZoneSoilHealth,
  type ZoneRotationSuggestion
} from '@/services/landZoneService'

export default function LandZonesPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [gardens, setGardens] = useState<Garden[]>([])
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null)
  const [zones, setZones] = useState<LandZone[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedZoneForHistory, setSelectedZoneForHistory] = useState<string | null>(null)
  
  // Zone stats cache
  const [zoneStats, setZoneStats] = useState<Map<string, any>>(new Map())
  const [zoneSoilHealth, setZoneSoilHealth] = useState<Map<string, ZoneSoilHealth>>(new Map())
  const [zoneRotationSuggestions, setZoneRotationSuggestions] = useState<Map<string, ZoneRotationSuggestion[]>>(new Map())

  const gardenId = searchParams.get('garden')

  useEffect(() => {
    loadData()
  }, [gardenId])

  const loadData = async () => {
    try {
      setLoading(true)
      const loadedGardens = await storageProvider.getGardens()
      setGardens(loadedGardens)
      
      const garden = gardenId 
        ? loadedGardens.find(g => g.id === gardenId)
        : loadedGardens[0]
      
      if (garden) {
        setSelectedGarden(garden)
        await loadZones(garden.id)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadZones = async (gardenId: string) => {
    try {
      const loadedZones = await getLandZones(gardenId)
      setZones(loadedZones)
      
      // Load stats for each zone
      const statsMap = new Map()
      const healthMap = new Map()
      const suggestionsMap = new Map()
      
      for (const zone of loadedZones) {
        const [stats, health, suggestions] = await Promise.all([
          getZoneStats(zone.id),
          calculateZoneSoilHealth(zone.id),
          getZoneRotationSuggestions(zone.id)
        ])
        
        statsMap.set(zone.id, stats)
        if (health) healthMap.set(zone.id, health)
        if (suggestions) suggestionsMap.set(zone.id, suggestions)
      }
      
      setZoneStats(statsMap)
      setZoneSoilHealth(healthMap)
      setZoneRotationSuggestions(suggestionsMap)
    } catch (error) {
      console.error('Error loading zones:', error)
    }
  }

  const handleToggleStatus = async (zoneId: string) => {
    try {
      await toggleZoneStatus(zoneId)
      if (selectedGarden) {
        await loadZones(selectedGarden.id)
      }
    } catch (error) {
      console.error('Error toggling zone status:', error)
      alert('❌ Errore durante il cambio di status')
    }
  }

  const handleDeleteZone = async (zoneId: string, zoneName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare la zona "${zoneName}"?\n\nATTENZIONE: Questo eliminerà anche tutta la memoria del terreno associata!`)) {
      return
    }

    try {
      await deleteLandZone(zoneId)
      if (selectedGarden) {
        await loadZones(selectedGarden.id)
      }
      alert('✅ Zona eliminata con successo')
    } catch (error) {
      console.error('Error deleting zone:', error)
      alert('❌ Errore durante l\'eliminazione della zona')
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
          <p className="text-gray-600 mb-6">Crea il tuo primo orto per gestire le zone</p>
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
                  🌍 Gestione Zone Terreno
                </h1>
                <p className="text-gray-600 mt-1">
                  {selectedGarden.name} • {zones.length} zone configurate
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Nuova Zona
            </button>
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
                    router.push(`/app/garden/zones?garden=${newGarden.id}`)
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
        {zones.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna zona configurata</h3>
            <p className="text-gray-600 mb-6">
              Crea le tue prime zone per organizzare la rotazione delle colture e preservare la memoria del terreno
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Crea Prima Zona
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Zones Grid */}
            {zones.map((zone) => {
              const stats = zoneStats.get(zone.id)
              const health = zoneSoilHealth.get(zone.id)
              const suggestions = zoneRotationSuggestions.get(zone.id)
              const isActive = zone.current_status === 'active'

              return (
                <div 
                  key={zone.id} 
                  className={`bg-white rounded-xl border-2 ${
                    isActive ? 'border-green-300' : 'border-yellow-300'
                  } hover:shadow-xl transition-all duration-300 overflow-hidden`}
                >
                  {/* Header */}
                  <div className={`${
                    isActive 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  } p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{zone.zone_name}</h3>
                        {zone.zone_code && (
                          <p className="text-sm opacity-90 mt-1">Codice: {zone.zone_code}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl mb-1">{isActive ? '🟢' : '🟡'}</div>
                        <div className="text-sm font-medium">
                          {isActive ? 'ATTIVA' : 'RIPOSO'}
                        </div>
                        <div className="text-xs opacity-90 mt-1">
                          dal {new Date(zone.status_since).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📏</span>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Superficie</div>
                          <div className="text-lg font-bold text-gray-900">{zone.area_hectares} ha</div>
                        </div>
                      </div>

                      {zone.soil_type && (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🌱</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Tipo Terreno</div>
                            <div className="text-lg font-bold text-gray-900 capitalize">{zone.soil_type}</div>
                          </div>
                        </div>
                      )}

                      {stats && (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🌾</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Filari Attivi</div>
                            <div className="text-lg font-bold text-gray-900">{stats.activeFieldRows}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Soil Health */}
                    {health && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={18} className="text-green-600" />
                            Salute del Terreno
                          </h4>
                          <div className="text-2xl font-bold text-green-600">
                            {health.health_score}/100
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Bilancio Azoto</div>
                            <div className={`font-bold ${
                              health.nitrogen_balance > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {health.nitrogen_balance > 0 ? '+' : ''}{health.nitrogen_balance}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Diversità</div>
                            <div className="font-bold text-blue-600">{health.diversity_score}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Colture Recenti</div>
                            <div className="font-bold text-purple-600">{health.recent_crops_count}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-700">
                          💡 {health.recommendation}
                        </div>
                      </div>
                    )}

                    {/* Rotation Suggestions */}
                    {suggestions && suggestions.length > 0 && (
                      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Leaf size={18} className="text-purple-600" />
                          Suggerimenti Rotazione
                        </h4>
                        <div className="space-y-2">
                          {suggestions.slice(0, 3).map((suggestion, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="font-medium text-gray-900">{suggestion.family}</span>
                                <span className="text-gray-600 ml-2">• {suggestion.reason}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  suggestion.nitrogen_benefit === 'high' 
                                    ? 'bg-green-100 text-green-700'
                                    : suggestion.nitrogen_benefit === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  N: {suggestion.nitrogen_benefit}
                                </span>
                                <span className="text-purple-600 font-bold">{suggestion.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {zone.notes && (
                      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">📝 Note</h4>
                        <p className="text-sm text-gray-700">{zone.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        onClick={() => handleToggleStatus(zone.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isActive
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {isActive ? '🟡 Metti a Riposo' : '🟢 Attiva'}
                      </button>

                      <button
                        onClick={() => setSelectedZoneForHistory(zone.id)}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <History size={16} />
                        Storico
                      </button>

                      <Link
                        href={`/app/garden/rows?garden=${selectedGarden.id}&zone=${zone.id}`}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <span>🌾</span>
                        Filari
                      </Link>

                      <button
                        onClick={() => handleDeleteZone(zone.id, zone.zone_name)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Create Zone Modal - TODO: Implement */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Crea Nuova Zona</h2>
            <p className="text-gray-600 mb-4">TODO: Implementare form creazione zona</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
