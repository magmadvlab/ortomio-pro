'use client'

import { useState } from 'react'
import { Calculator, Info, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { plantingDensityService } from '@/services/plantingDensityService'
import type { CropType, TrainingSystem, DensityInput, DensityRecommendation } from '@/types/plantingDensity'

export default function DensityCalculator() {
  const [input, setInput] = useState<DensityInput>({
    cropType: 'apple',
    trainingSystem: 'spindle',
    surfaceArea: 10000, // 1 ettaro default
    mechanization: 'full',
    soilQuality: 'medium',
    climateZone: 'temperate'
  })
  
  const [result, setResult] = useState<DensityRecommendation | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const handleCalculate = () => {
    const recommendation = plantingDensityService.calculateDensity(input)
    setResult(recommendation)
  }
  
  const cropTypes: Array<{ value: CropType; label: string }> = [
    { value: 'apple', label: '🍎 Melo' },
    { value: 'pear', label: '🍐 Pero' },
    { value: 'peach', label: '🍑 Pesco' },
    { value: 'apricot', label: '🍊 Albicocco' },
    { value: 'cherry', label: '🍒 Ciliegio' },
    { value: 'plum', label: '🫐 Susino' },
    { value: 'citrus', label: '🍋 Agrumi' },
    { value: 'walnut', label: '🌰 Noce' },
    { value: 'hazelnut', label: 'Nocciolo' },
    { value: 'almond', label: 'Mandorlo' },
    { value: 'olive', label: '🫒 Olivo' },
    { value: 'grape', label: '🍇 Vite' }
  ]
  
  // Ottieni forme di allevamento per la coltura selezionata
  const availableSystems = plantingDensityService.getTrainingSystemsForCrop(input.cropType)
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle2 size={16} />
      case 'medium': return <Info size={16} />
      case 'low': return <AlertCircle size={16} />
      default: return null
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="text-green-600" size={24} />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Calcolo Densità Impianto</h2>
          <p className="text-sm text-gray-600">Calcola sesti e densità ottimali per il tuo frutteto</p>
        </div>
      </div>
      
      {/* Form Input */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo Coltura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Coltura *
            </label>
            <select
              value={input.cropType}
              onChange={(e) => setInput({ ...input, cropType: e.target.value as CropType, trainingSystem: 'spindle' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {cropTypes.map(crop => (
                <option key={crop.value} value={crop.value}>{crop.label}</option>
              ))}
            </select>
          </div>
          
          {/* Forma Allevamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forma di Allevamento *
            </label>
            <select
              value={input.trainingSystem}
              onChange={(e) => setInput({ ...input, trainingSystem: e.target.value as TrainingSystem })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {availableSystems.map(({ system, info }) => (
                <option key={system} value={system}>{info.name}</option>
              ))}
            </select>
            {input.trainingSystem && (
              <p className="text-xs text-gray-500 mt-1">
                {plantingDensityService.getTrainingSystemInfo(input.trainingSystem).description}
              </p>
            )}
          </div>
          
          {/* Superficie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Superficie (m²) *
            </label>
            <input
              type="number"
              value={input.surfaceArea}
              onChange={(e) => setInput({ ...input, surfaceArea: parseFloat(e.target.value) })}
              min="100"
              step="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(input.surfaceArea / 10000).toFixed(2)} ettari
            </p>
          </div>
          
          {/* Meccanizzazione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Livello Meccanizzazione
            </label>
            <select
              value={input.mechanization}
              onChange={(e) => setInput({ ...input, mechanization: e.target.value as 'full' | 'partial' | 'manual' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="full">Completa</option>
              <option value="partial">Parziale</option>
              <option value="manual">Manuale</option>
            </select>
          </div>
          
          {/* Qualità Suolo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualità Suolo
            </label>
            <select
              value={input.soilQuality}
              onChange={(e) => setInput({ ...input, soilQuality: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="poor">Scarsa</option>
              <option value="medium">Media</option>
              <option value="good">Buona</option>
              <option value="excellent">Ottima</option>
            </select>
          </div>
          
          {/* Zona Climatica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona Climatica
            </label>
            <select
              value={input.climateZone}
              onChange={(e) => setInput({ ...input, climateZone: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="cold">Fredda</option>
              <option value="temperate">Temperata</option>
              <option value="warm">Calda</option>
              <option value="hot">Molto Calda</option>
            </select>
          </div>
        </div>
        
        {/* Parametri Avanzati */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            {showAdvanced ? '▼' : '▶'} Parametri Avanzati (opzionale)
          </button>
          
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distanza tra File (m)
                </label>
                <input
                  type="number"
                  value={input.rowSpacing || ''}
                  onChange={(e) => setInput({ ...input, rowSpacing: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Auto"
                  min="1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distanza sulla Fila (m)
                </label>
                <input
                  type="number"
                  value={input.plantSpacing || ''}
                  onChange={(e) => setInput({ ...input, plantSpacing: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Auto"
                  min="0.5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottone Calcola */}
      <button
        onClick={handleCalculate}
        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <Calculator size={20} />
        Calcola Densità Ottimale
      </button>
      
      {/* Risultati */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600" />
              Risultati Calcolo
            </h3>
            
            {/* Confidenza */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${getConfidenceColor(result.confidence)}`}>
              {getConfidenceIcon(result.confidence)}
              Confidenza: {result.confidence === 'high' ? 'Alta' : result.confidence === 'medium' ? 'Media' : 'Bassa'}
            </div>
            
            {/* Risultati Principali */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Piante/Ettaro</p>
                <p className="text-2xl font-bold text-green-900">{result.plantsPerHectare}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Piante Totali</p>
                <p className="text-2xl font-bold text-blue-900">{result.plantsTotal}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">Tra File (m)</p>
                <p className="text-2xl font-bold text-purple-900">{result.rowSpacing.toFixed(1)}</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 mb-1">Sulla Fila (m)</p>
                <p className="text-2xl font-bold text-orange-900">{result.plantSpacing.toFixed(1)}</p>
              </div>
            </div>
            
            {/* Dettagli Layout */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Layout Impianto</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Numero File:</span>
                  <span className="ml-2 font-medium">{result.rowsCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Piante per Fila:</span>
                  <span className="ml-2 font-medium">{result.plantsPerRow}</span>
                </div>
              </div>
            </div>
            
            {/* Note e Avvisi */}
            {result.notes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                  <Info size={16} />
                  Note Importanti
                </h4>
                <ul className="space-y-1">
                  {result.notes.map((note, index) => (
                    <li key={index} className="text-sm text-yellow-800">{note}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Alternative */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Soluzioni Alternative</h4>
              <div className="space-y-2">
                {result.alternatives.map((alt, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{alt.plantsPerHectare} piante/ha</span>
                      <span className="text-sm text-gray-600">
                        {alt.rowSpacing.toFixed(1)}m × {alt.plantSpacing.toFixed(1)}m
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{alt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
