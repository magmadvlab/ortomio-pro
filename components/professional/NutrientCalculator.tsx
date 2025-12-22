'use client'

import React, { useState } from 'react'

interface NutrientResult {
  n: number // grammi/m²
  p: number
  k: number
}

export function NutrientCalculator() {
  const [crop, setCrop] = useState('')
  const [phase, setPhase] = useState('')
  const [area, setArea] = useState('')
  const [soilType, setSoilType] = useState('')
  const [result, setResult] = useState<NutrientResult | null>(null)
  
  const handleCalculate = () => {
    // TODO: Integrate with logic/nutrientEngine.ts
    // Placeholder calculation
    const areaNum = parseFloat(area) || 1
    setResult({
      n: 10 * areaNum,
      p: 5 * areaNum,
      k: 15 * areaNum,
    })
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Calcolatore NPK</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coltura
          </label>
          <input
            type="text"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="es. Pomodoro"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fase
          </label>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Seleziona fase</option>
            <option value="germination">Germinazione</option>
            <option value="vegetative">Vegetativa</option>
            <option value="flowering">Fioritura</option>
            <option value="fruiting">Fruttificazione</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Superficie (m²)
          </label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="es. 10"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo terreno
          </label>
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Seleziona terreno</option>
            <option value="clay">Argilloso</option>
            <option value="sandy">Sabbioso</option>
            <option value="loamy">Limosso</option>
          </select>
        </div>
        
        <button
          onClick={handleCalculate}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Calcola NPK
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Risultato:</h3>
            <div className="space-y-1 text-sm">
              <p>Azoto (N): <strong>{result.n.toFixed(2)} g/m²</strong></p>
              <p>Fosforo (P): <strong>{result.p.toFixed(2)} g/m²</strong></p>
              <p>Potassio (K): <strong>{result.k.toFixed(2)} g/m²</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
















