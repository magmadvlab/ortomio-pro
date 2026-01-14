'use client'

import React, { useState, useEffect } from 'react'
import { Lightbulb, MapPin, Calendar, Thermometer, Droplets, Sun, Leaf, Sprout, Clock } from 'lucide-react'
import { getSeasonalSuggestions, checkApiAvailableAsync } from '@/services/aiPlanningService'
import { getCurrentPositionWithRetry, getDefaultCoordinates } from '@/services/geolocationService'

interface PlannerSuggestionsProps {
  garden: any
  tasks: any[]
  onAddToJournal: (plantName: string, notes: string, variety?: string, method?: 'Seed' | 'Seedling', date?: string, taskType?: any, additionalData?: any) => void
  onUpdateTask: (task: any) => void
}

interface PlantSuggestion {
  name: string
  description: string
  plantingWindow: string
  harvestTime: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  waterNeeds: 'Low' | 'Medium' | 'High'
  sunRequirement?: string
  spacing?: string
  tips?: string[]
}

export default function PlannerSuggestions({ garden, tasks, onAddToJournal }: PlannerSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<PlantSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<PlantSuggestion | null>(null)

  useEffect(() => {
    loadSuggestions()
  }, [garden])

  const loadSuggestions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Usa coordinate del giardino o geolocalizzazione
      let lat = garden.coordinates?.latitude
      let lng = garden.coordinates?.longitude

      if (!lat || !lng) {
        const result = await getCurrentPositionWithRetry(2, {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000
        })
        
        if (result.success) {
          lat = result.latitude
          lng = result.longitude
        } else {
          const defaultCoords = getDefaultCoordinates()
          lat = defaultCoords.latitude
          lng = defaultCoords.longitude
        }
      }

      // Verifica disponibilità API
      const apiAvailable = await checkApiAvailableAsync()
      
      if (apiAvailable) {
        const results = await getSeasonalSuggestions(lat!, lng!)
        setSuggestions(results || [])
      } else {
        // Fallback a suggerimenti statici per Gennaio 2026
        setSuggestions(getStaticSuggestions())
      }
    } catch (err: any) {
      console.error('Error loading suggestions:', err)
      setError('Errore nel caricamento dei suggerimenti. Uso suggerimenti di base.')
      setSuggestions(getStaticSuggestions())
    } finally {
      setLoading(false)
    }
  }

  const getStaticSuggestions = (): PlantSuggestion[] => [
    {
      name: 'Lattuga',
      description: 'Perfetta per semine invernali in serra o tunnel. Crescita rapida e raccolto continuo.',
      plantingWindow: 'Gennaio - Marzo',
      harvestTime: '30-45 giorni',
      difficulty: 'Easy',
      waterNeeds: 'Medium',
      sunRequirement: 'Sole parziale',
      spacing: '15-20 cm',
      tips: ['Semina ogni 2 settimane per raccolto continuo', 'Proteggi dal gelo con tunnel']
    },
    {
      name: 'Spinaci',
      description: 'Resistenti al freddo, ideali per coltivazione invernale. Ricchi di ferro e vitamine.',
      plantingWindow: 'Gennaio - Febbraio',
      harvestTime: '40-50 giorni',
      difficulty: 'Easy',
      waterNeeds: 'Medium',
      sunRequirement: 'Sole parziale',
      spacing: '10-15 cm',
      tips: ['Raccogli le foglie esterne per prolungare la produzione', 'Preferisce terreni ricchi di azoto']
    },
    {
      name: 'Ravanelli',
      description: 'Crescita velocissima, perfetti per principianti. Ottimi per consociazioni.',
      plantingWindow: 'Gennaio - Marzo',
      harvestTime: '25-30 giorni',
      difficulty: 'Easy',
      waterNeeds: 'Low',
      sunRequirement: 'Sole pieno',
      spacing: '5-8 cm',
      tips: ['Semina diretta, non trapiantare', 'Ottimi tra le file di carote']
    },
    {
      name: 'Prezzemolo',
      description: 'Aromatica essenziale, resistente e produttiva. Semina ora per raccolto primaverile.',
      plantingWindow: 'Gennaio - Febbraio',
      harvestTime: '60-80 giorni',
      difficulty: 'Medium',
      waterNeeds: 'Medium',
      sunRequirement: 'Sole parziale',
      spacing: '15-20 cm',
      tips: ['Ammollo semi 24h prima della semina', 'Taglia regolarmente per stimolare crescita']
    },
    {
      name: 'Fave',
      description: 'Leguminose che arricchiscono il terreno di azoto. Resistenti al freddo.',
      plantingWindow: 'Gennaio - Febbraio',
      harvestTime: '90-120 giorni',
      difficulty: 'Easy',
      waterNeeds: 'Low',
      sunRequirement: 'Sole pieno',
      spacing: '20-30 cm',
      tips: ['Fissano azoto nel terreno', 'Cima le piante per favorire produzione']
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getWaterColor = (waterNeeds: string) => {
    switch (waterNeeds) {
      case 'Low': return 'text-blue-400'
      case 'Medium': return 'text-blue-600'
      case 'High': return 'text-blue-800'
      default: return 'text-gray-600'
    }
  }

  const handlePlantSuggestion = (suggestion: PlantSuggestion) => {
    const today = new Date().toISOString().split('T')[0]
    const notes = `Suggerimento AI: ${suggestion.description}\n\nConsigli:\n${suggestion.tips?.map(tip => `• ${tip}`).join('\n') || ''}\n\nEsigenze: ${suggestion.sunRequirement}, Irrigazione ${suggestion.waterNeeds.toLowerCase()}`
    
    onAddToJournal(
      suggestion.name,
      notes,
      undefined,
      'Seed',
      today,
      'Sowing',
      {
        aiSuggestion: true,
        difficulty: suggestion.difficulty,
        waterNeeds: suggestion.waterNeeds,
        harvestTime: suggestion.harvestTime
      }
    )
    
    setSelectedSuggestion(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generando suggerimenti AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="text-yellow-500" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Suggerimenti AI per il tuo Orto</h2>
            <p className="text-gray-600">Consigli personalizzati basati su stagione, clima e posizione</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="text-blue-600" size={16} />
              <span className="font-medium text-blue-800">Posizione</span>
            </div>
            <p className="text-blue-700 text-sm">
              {garden.coordinates ? 'Coordinate salvate' : 'Posizione automatica'}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-green-600" size={16} />
              <span className="font-medium text-green-800">Stagione</span>
            </div>
            <p className="text-green-700 text-sm">Gennaio 2026 - Inverno</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="text-purple-600" size={16} />
              <span className="font-medium text-purple-800">Clima</span>
            </div>
            <p className="text-purple-700 text-sm">Temperato - Protezione consigliata</p>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Caricamento...' : 'Aggiorna Suggerimenti'}
        </button>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sprout className="text-green-600" size={20} />
                <h3 className="font-bold text-gray-900">{suggestion.name}</h3>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(suggestion.difficulty)}`}>
                  {suggestion.difficulty}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {suggestion.description}
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-gray-400" size={14} />
                <span className="text-gray-600">Semina: {suggestion.plantingWindow}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="text-gray-400" size={14} />
                <span className="text-gray-600">Raccolto: {suggestion.harvestTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Droplets className={getWaterColor(suggestion.waterNeeds)} size={14} />
                <span className="text-gray-600">Acqua: {suggestion.waterNeeds}</span>
              </div>
              {suggestion.sunRequirement && (
                <div className="flex items-center gap-2 text-sm">
                  <Sun className="text-yellow-500" size={14} />
                  <span className="text-gray-600">{suggestion.sunRequirement}</span>
                </div>
              )}
            </div>

            {suggestion.tips && suggestion.tips.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-gray-900 text-sm mb-2">💡 Consigli:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {suggestion.tips.slice(0, 2).map((tip, tipIndex) => (
                    <li key={tipIndex}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setSelectedSuggestion(suggestion)}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Aggiungi al Piano
            </button>
          </div>
        ))}
      </div>

      {suggestions.length === 0 && !loading && (
        <div className="text-center py-12">
          <Leaf className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun suggerimento disponibile</h3>
          <p className="text-gray-600">Prova ad aggiornare i suggerimenti o verifica la configurazione API</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Conferma Pianificazione
            </h3>
            <p className="text-gray-600 mb-4">
              Vuoi aggiungere <strong>{selectedSuggestion.name}</strong> al tuo piano di coltivazione?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handlePlantSuggestion(selectedSuggestion)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Conferma
              </button>
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}