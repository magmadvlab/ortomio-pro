'use client'

import React, { useState } from 'react'
import { Search, Loader2, Leaf, Info, Calendar, Droplets, Sun, Target, Plus } from 'lucide-react'
import { getSpecificPlantDetails } from '@/services/aiPlanningService'
import { getDefaultCoordinates } from '@/services/geolocationService'

interface PlannerSearchProps {
  garden: any
  tasks: any[]
  onAddToJournal: (plantName: string, notes: string, variety?: string, method?: 'Seed' | 'Seedling', date?: string, taskType?: any, additionalData?: any) => void
  onUpdateTask: (task: any) => void
}

interface PlantDetails {
  name: string
  description: string
  plantingInstructions: string
  careInstructions: string
  harvestInstructions: string
  companionPlants: string[]
  spacing: {
    betweenPlants: string
    betweenRows: string
  }
  soil: {
    phMin: number
    phMax: number
    typeDescription: string
  }
  irrigation: {
    frequency: string
    method: string
  }
  fertilizer: {
    organicType: string
    organicDosageGm2: number
  }
  harvest: {
    visualSigns: string
    minBrix?: number
  }
  variety?: string
}

export default function PlannerSearch({ garden, onAddToJournal }: PlannerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<PlantDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plantingMethod, setPlantingMethod] = useState<'Seed' | 'Seedling'>('Seed')
  const [quantity, setQuantity] = useState(1)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setSearchResult(null)

    try {
      // Usa coordinate del giardino o default
      const defaultCoords = getDefaultCoordinates()
      const lat = garden.coordinates?.latitude || defaultCoords.latitude
      const lng = garden.coordinates?.longitude || defaultCoords.longitude

      const result = await getSpecificPlantDetails(searchQuery, lat, lng)
      
      if (result) {
        setSearchResult(result)
      } else {
        setError('Pianta non trovata. Prova con un nome diverso o più specifico.')
      }
    } catch (err: any) {
      console.error('Search error:', err)
      const errorMsg = err?.message || 'Errore sconosciuto'
      
      if (errorMsg.includes('insufficient_credits') || errorMsg.includes('Credits insufficienti')) {
        setError('Credits insufficienti per la ricerca avanzata.')
      } else if (errorMsg.includes('insufficient_tier') || errorMsg.includes('unauthorized')) {
        setError('La ricerca avanzata richiede un piano PLUS o PRO.')
      } else {
        setError(`Errore nella ricerca: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlant = () => {
    if (!searchResult) return

    const today = new Date().toISOString().split('T')[0]
    const notes = `${searchResult.description}

📋 ISTRUZIONI PIANTAGIONE:
${searchResult.plantingInstructions}

🌱 CURA E MANUTENZIONE:
${searchResult.careInstructions}

🧺 RACCOLTA:
${searchResult.harvestInstructions}

💧 IRRIGAZIONE: ${searchResult.irrigation.frequency} - ${searchResult.irrigation.method}
🌱 CONCIME: ${searchResult.fertilizer.organicType} (${searchResult.fertilizer.organicDosageGm2}g/m²)
📏 SPAZIATURA: ${searchResult.spacing.betweenPlants} tra piante, ${searchResult.spacing.betweenRows} tra file
🌍 pH IDEALE: ${searchResult.soil.phMin}-${searchResult.soil.phMax}

🤝 PIANTE COMPAGNE: ${searchResult.companionPlants.join(', ')}`

    onAddToJournal(
      searchResult.name,
      notes,
      searchResult.variety,
      plantingMethod,
      today,
      plantingMethod === 'Seed' ? 'Sowing' : 'Transplant',
      {
        searchResult: true,
        quantity,
        spacing: searchResult.spacing,
        soilRequirements: searchResult.soil,
        irrigationPlan: searchResult.irrigation,
        fertilizerPlan: searchResult.fertilizer
      }
    )

    // Reset form
    setSearchResult(null)
    setSearchQuery('')
    setQuantity(1)
  }

  const popularSearches = [
    'Pomodori San Marzano',
    'Basilico Genovese',
    'Lattuga Iceberg',
    'Carote Nantesi',
    'Zucchine Romanesco',
    'Peperoni Quadrati',
    'Melanzane Violette',
    'Spinaci Gigante'
  ]

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="text-blue-500" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cerca e Pianifica Nuove Piante</h2>
            <p className="text-gray-600">Trova informazioni dettagliate su qualsiasi pianta e aggiungila al tuo piano</p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca una pianta... (es. pomodori, basilico, lattuga)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cercando...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Cerca
                </>
              )}
            </button>
          </div>
        </form>

        {/* Popular Searches */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Ricerche popolari:</h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(search)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Leaf className="text-green-600" size={24} />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{searchResult.name}</h3>
                {searchResult.variety && (
                  <p className="text-gray-600">Varietà: {searchResult.variety}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info size={16} />
                Descrizione
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {searchResult.description}
              </p>

              {/* Quick Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="text-blue-500" size={14} />
                  <span className="text-gray-600">Irrigazione: {searchResult.irrigation.frequency}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="text-purple-500" size={14} />
                  <span className="text-gray-600">pH: {searchResult.soil.phMin}-{searchResult.soil.phMax}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-orange-500" size={14} />
                  <span className="text-gray-600">Spaziatura: {searchResult.spacing.betweenPlants}</span>
                </div>
              </div>
            </div>

            {/* Planting Options */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={16} />
                Aggiungi al Piano
              </h4>

              <div className="space-y-4">
                {/* Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metodo di Piantagione
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPlantingMethod('Seed')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        plantingMethod === 'Seed'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🌱 Seme
                    </button>
                    <button
                      onClick={() => setPlantingMethod('Seedling')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        plantingMethod === 'Seedling'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🌿 Piantina
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantità
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleAddPlant}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Aggiungi al Piano di Coltivazione
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🌱 Piantagione</h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                {searchResult.plantingInstructions}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">🌿 Cura</h4>
              <p className="text-green-700 text-sm leading-relaxed">
                {searchResult.careInstructions}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">🧺 Raccolta</h4>
              <p className="text-orange-700 text-sm leading-relaxed">
                {searchResult.harvestInstructions}
              </p>
            </div>
          </div>

          {/* Companion Plants */}
          {searchResult.companionPlants.length > 0 && (
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">🤝 Piante Compagne</h4>
              <div className="flex flex-wrap gap-2">
                {searchResult.companionPlants.map((companion, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {companion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searchResult && !loading && (
        <div className="text-center py-12">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cerca una pianta per iniziare</h3>
          <p className="text-gray-600">Inserisci il nome di una pianta per ottenere informazioni dettagliate e aggiungerla al tuo piano</p>
        </div>
      )}
    </div>
  )
}