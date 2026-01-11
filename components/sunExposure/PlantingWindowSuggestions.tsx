'use client'

import React, { useState } from 'react'
import { Calendar, Sprout, Info, CheckCircle } from 'lucide-react'
import { PlantingWindow } from '@/services/plantingWindowOptimizer'
import { PlantSuggestionForWindow } from '@/services/seasonalPlantSuggestions'
import { GardenClassification } from '@/services/seasonalSunWindows'

interface PlantingWindowSuggestionsProps {
  plantingWindows: PlantingWindow[]
  plantSuggestions: PlantSuggestionForWindow[]
  classification: GardenClassification
  gardenId?: string
}

export default function PlantingWindowSuggestions({
  plantingWindows,
  plantSuggestions,
  classification,
  gardenId,
}: PlantingWindowSuggestionsProps) {
  const [selectedWindow, setSelectedWindow] = useState<PlantingWindow | null>(
    plantingWindows.length > 0 ? plantingWindows[0] : null
  )
  const [selectedMethod, setSelectedMethod] = useState<'Seed' | 'Seedling'>('Seedling')

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Estivo':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'Primaverile':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'Autunnale':
        return 'bg-amber-50 border-amber-200 text-amber-800'
      case 'FogliaEstiva':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Estivo':
        return '🌞'
      case 'Primaverile':
        return '🌱'
      case 'Autunnale':
        return '🍂'
      case 'FogliaEstiva':
        return '🌿'
      default:
        return '🌍'
    }
  }

  const filteredSuggestions = selectedWindow
    ? plantSuggestions.filter(s => s.category === selectedWindow.category)
    : plantSuggestions

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Finestre di Impianto Ottimali
        </h3>
        <p className="text-sm text-gray-600">
          Finestre temporali ottimizzate per il tuo tipo di orto. Seleziona una finestra per vedere le piante consigliate.
        </p>
      </div>

      {/* Lista finestre */}
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
        {plantingWindows.map((window, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedWindow(window)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedWindow === window
                ? `${getCategoryColor(window.category)} border-current shadow-md`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl">{getCategoryIcon(window.category)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{window.category}</h4>
                  <p className="text-xs text-gray-600">{window.reason}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={14} />
                <span>
                  {formatDate(window.startDate)} - {formatDate(window.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                {window.method === 'Seed' ? <Sprout size={14} /> : <Sprout size={14} />}
                <span>{window.method === 'Seed' ? 'Semina' : 'Trapianto'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle size={14} />
                <span>{window.cycles} ciclo{window.cycles > 1 ? 'i' : ''} possibili</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1">Piante consigliate:</p>
              <div className="flex flex-wrap gap-3">
                {window.recommendedPlants.slice(0, 3).map((plant, pIdx) => (
                  <span
                    key={pIdx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {plant}
                  </span>
                ))}
                {window.recommendedPlants.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                    +{window.recommendedPlants.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggerimenti piante per finestra selezionata */}
      {selectedWindow && filteredSuggestions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">
              Piante Consigliate per {selectedWindow.category}
            </h4>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedMethod('Seed')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedMethod === 'Seed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sprout size={14} className="inline mr-1" />
                Semina
              </button>
              <button
                onClick={() => setSelectedMethod('Seedling')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedMethod === 'Seedling'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sprout size={14} className="inline mr-1" />
                Trapianto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuggestions
              .filter(s => s.method === selectedMethod)
              .map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-gray-900">{suggestion.plantName}</h5>
                    <div className={`px-2 py-1 rounded text-xs ${getCategoryColor(suggestion.category)}`}>
                      {suggestion.category}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{suggestion.reason}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar size={14} />
                      <span>
                        {formatDate(suggestion.plantingWindow.start)} -{' '}
                        {formatDate(suggestion.plantingWindow.end)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Info size={14} />
                      <span>
                        Adattabilità: {(suggestion.suitabilityScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {filteredSuggestions.filter(s => s.method === selectedMethod).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nessuna pianta disponibile per questo metodo nella categoria {selectedWindow.category}</p>
            </div>
          )}
        </div>
      )}

      {/* Informazioni aggiuntive */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 mb-1">Come funziona:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Semina:</strong> Inizia 45 giorni prima della finestra (tempo per germinazione e nursing)
              </li>
              <li>
                <strong>Trapianto:</strong> Puoi iniziare direttamente nella finestra con piantine pronte
              </li>
              <li>
                Le finestre sono calcolate in base alle ore di sole disponibili nel tuo orto
              </li>
              <li>
                I cicli multipli permettono di ottimizzare la produzione durante l'anno
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

