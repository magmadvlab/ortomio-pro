'use client'

import React, { useState } from 'react'
import { calculateNutrientNeeds, type NutrientAdvice } from '@/logic/nutrientEngine'
import { getMasterSheet } from '@/services/plantMasterService'

interface NutrientResult {
  advice: NutrientAdvice
  cropName: string
  areaSqm: number
}

export function NutrientCalculator() {
  const [crop, setCrop] = useState('')
  const [phase, setPhase] = useState('')
  const [area, setArea] = useState('')
  const [soilType, setSoilType] = useState('')
  const [result, setResult] = useState<NutrientResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [calculating, setCalculating] = useState(false)
  
  const handleCalculate = async () => {
    const areaNum = Number(area)
    if (!crop.trim() || !phase || !soilType || !Number.isFinite(areaNum) || areaNum <= 0) {
      setError('Compila coltura, fase, superficie valida e tipo di terreno.')
      setResult(null)
      return
    }

    setCalculating(true)
    setError(null)
    try {
      const masterSheet = await getMasterSheet(crop.trim())
      if (!masterSheet) {
        setResult(null)
        setError('Coltura non riconosciuta nel catalogo agronomico.')
        return
      }

      const daysByPhase: Record<string, number> = {
        germination: 0,
        vegetative: 30,
        flowering: 55,
        fruiting: 70,
      }
      const soilBySelection = {
        clay: 'Clay',
        sandy: 'Sandy',
        loamy: 'Loamy',
      } as const
      const advice = calculateNutrientNeeds(
        masterSheet,
        daysByPhase[phase],
        soilBySelection[soilType as keyof typeof soilBySelection],
        phase === 'germination' ? 'Sowing' : undefined
      )
      setResult({
        advice,
        cropName: masterSheet.commonName,
        areaSqm: areaNum,
      })
    } finally {
      setCalculating(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Supporto nutrizionale</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coltura
          </label>
          <input
            type="text"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
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
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
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
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
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
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
          >
            <option value="">Seleziona terreno</option>
            <option value="clay">Argilloso</option>
            <option value="sandy">Sabbioso</option>
            <option value="loamy">Limosso</option>
          </select>
        </div>
        
        <button
          onClick={handleCalculate}
          disabled={calculating}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          {calculating ? 'Calcolo in corso…' : 'Calcola fabbisogno'}
        </button>

        {error && <p className="text-sm text-red-700">{error}</p>}
        
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {result.advice.adviceTitle}
            </h3>
            <div className="space-y-1 text-sm">
              <p>Coltura: <strong>{result.cropName}</strong></p>
              <p>Superficie: <strong>{result.areaSqm.toFixed(2)} m²</strong></p>
              <p>Fase: <strong>{result.advice.phase}</strong></p>
              <p>Elemento prioritario: <strong>{result.advice.elementFocus}</strong></p>
              <p className="pt-2">{result.advice.adviceBody}</p>
              {result.advice.soilNote && <p>{result.advice.soilNote}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}





















