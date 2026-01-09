'use client'

import React, { useState, useEffect } from 'react'
import { Sun, Upload, Sliders, Compass, Calculator, ChevronRight } from 'lucide-react'
import { CompassObstacleSelector } from './CompassObstacleSelector'
import { Obstacle3D, calculateDailySunHours, calculateMonthlySunHours } from '@/services/preciseSunCalculator'
import { extractObstaclesFrom360 } from '@/services/obstacleExtractor'

interface AdvancedSunExposureWizardProps {
  latitude: number
  longitude: number
  onComplete: (data: {
    dailySunHours: number
    sunExposure: 'FullSun' | 'PartSun' | 'Shade'
    aspectDirection?: 'North' | 'South' | 'East' | 'West' | 'Flat'
    obstacles: Obstacle3D[]
  }) => void
}

type WizardMode = 'select' | 'simple' | 'advanced' | 'photo360'

/**
 * Wizard Avanzato per Esposizione Solare
 * Supporta 3 modalità:
 * 1. Semplice: Slider rapidi (attuale)
 * 2. Avanzata: Compass selector + calcolo scientifico
 * 3. Foto 360°: Upload foto + AI extraction
 */
export function AdvancedSunExposureWizard({
  latitude,
  longitude,
  onComplete
}: AdvancedSunExposureWizardProps) {
  const [mode, setMode] = useState<WizardMode>('select')
  const [obstacles, setObstacles] = useState<Obstacle3D[]>([])
  const [calculatedSunHours, setCalculatedSunHours] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Modalità Semplice - Slider
  const [simpleMode, setSimpleMode] = useState({
    morning: 3,
    midday: 5,
    afternoon: 3
  })

  // Modalità Foto 360°
  const [photo360, setPhoto360] = useState<string | null>(null)
  const [photoNorthOffset, setPhotoNorthOffset] = useState(0)

  // Calcola ore sole in tempo reale quando cambiano ostacoli
  useEffect(() => {
    if (mode === 'advanced' && obstacles.length > 0) {
      calculateScientificSunHours()
    }
  }, [obstacles, mode])

  const calculateScientificSunHours = async () => {
    setIsCalculating(true)

    try {
      // Calcola ore sole per oggi
      const today = new Date()
      const sunHours = calculateDailySunHours(
        latitude,
        longitude,
        today,
        obstacles,
        10 // Time step: ogni 10 minuti
      )

      setCalculatedSunHours(sunHours)
    } catch (error) {
      console.error('Error calculating sun hours:', error)
      setCalculatedSunHours(null)
    } finally {
      setIsCalculating(false)
    }
  }

  const handle360PhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      setPhoto360(base64)

      try {
        // Estrai ostacoli dalla foto 360°
        const extractedObstacles = await extractObstaclesFrom360(
          base64,
          latitude,
          longitude,
          photoNorthOffset
        )

        setObstacles(extractedObstacles)
        alert(`${extractedObstacles.length} ostacoli rilevati dalla foto!`)
      } catch (error) {
        console.error('Error extracting obstacles:', error)
        alert('Errore nell\'analisi della foto. Riprova o usa la modalità manuale.')
      }
    }

    reader.readAsDataURL(file)
  }

  const handleComplete = () => {
    let finalSunHours: number
    let sunExposure: 'FullSun' | 'PartSun' | 'Shade'
    let aspectDirection: 'North' | 'South' | 'East' | 'West' | 'Flat' | undefined

    if (mode === 'simple') {
      // Modalità semplice: somma slider
      finalSunHours = simpleMode.morning + simpleMode.midday + simpleMode.afternoon
    } else if (mode === 'advanced' || mode === 'photo360') {
      // Modalità avanzata: usa calcolo scientifico
      finalSunHours = calculatedSunHours || 8 // Fallback
    } else {
      finalSunHours = 8 // Default
    }

    // Determina categoria esposizione
    if (finalSunHours >= 6) {
      sunExposure = 'FullSun'
    } else if (finalSunHours >= 4) {
      sunExposure = 'PartSun'
    } else {
      sunExposure = 'Shade'
    }

    // Determina aspect direction (direzione principale ombra)
    if (obstacles.length > 0) {
      const dominantObstacle = obstacles.reduce((max, obs) => {
        const maxElevation = Math.atan2(max.height, max.distance)
        const obsElevation = Math.atan2(obs.height, obs.distance)
        return obsElevation > maxElevation ? obs : max
      })

      // Converti azimuth in direzione cardinale
      const azimuth = dominantObstacle.azimuth
      if (azimuth >= 315 || azimuth < 45) aspectDirection = 'North'
      else if (azimuth >= 45 && azimuth < 135) aspectDirection = 'East'
      else if (azimuth >= 135 && azimuth < 225) aspectDirection = 'South'
      else aspectDirection = 'West'
    }

    onComplete({
      dailySunHours: Math.round(finalSunHours),
      sunExposure,
      aspectDirection,
      obstacles
    })
  }

  // Schermata selezione modalità
  if (mode === 'select') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ☀️ Come vuoi configurare l'esposizione solare?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Modalità Semplice */}
          <button
            onClick={() => setMode('simple')}
            className="p-6 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Sliders className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900">Modalità Semplice</h4>
            </div>
            <p className="text-sm text-gray-600">
              Slider veloci per mattino, mezzogiorno e pomeriggio.
              Rapida ma meno precisa.
            </p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              Seleziona <ChevronRight size={16} className="ml-1" />
            </div>
          </button>

          {/* Modalità Avanzata */}
          <button
            onClick={() => setMode('advanced')}
            className="p-6 border-2 border-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all text-left group relative"
          >
            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
              CONSIGLIATO
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
                <Compass className="text-blue-700" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900">Modalità Avanzata</h4>
            </div>
            <p className="text-sm text-gray-600">
              Compass selector 0-360° con calcolo scientifico.
              Precisione massima basata su formule astronomiche.
            </p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              Seleziona <ChevronRight size={16} className="ml-1" />
            </div>
          </button>

          {/* Modalità Foto 360° */}
          <button
            onClick={() => setMode('photo360')}
            className="p-6 border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Upload className="text-purple-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900">Foto 360°</h4>
            </div>
            <p className="text-sm text-gray-600">
              Carica foto panoramica e l'AI rileva automaticamente
              gli ostacoli con precisione.
            </p>
            <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
              Seleziona <ChevronRight size={16} className="ml-1" />
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Modalità Semplice
  if (mode === 'simple') {
    const totalHours = simpleMode.morning + simpleMode.midday + simpleMode.afternoon

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            ☀️ Modalità Semplice
          </h3>
          <button
            onClick={() => setMode('select')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Cambia modalità
          </button>
        </div>

        {/* Slider Mattino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ☀️ Mattino
          </label>
          <input
            type="range"
            min="0"
            max="6"
            step="0.5"
            value={simpleMode.morning}
            onChange={(e) => setSimpleMode({ ...simpleMode, morning: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Niente</span>
            <span className="font-semibold text-orange-600">{simpleMode.morning} ore</span>
            <span>Molto</span>
          </div>
        </div>

        {/* Slider Mezzogiorno */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ☀️ Mezzogiorno
          </label>
          <input
            type="range"
            min="0"
            max="6"
            step="0.5"
            value={simpleMode.midday}
            onChange={(e) => setSimpleMode({ ...simpleMode, midday: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Niente</span>
            <span className="font-semibold text-yellow-600">{simpleMode.midday} ore</span>
            <span>Molto</span>
          </div>
        </div>

        {/* Slider Pomeriggio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ☀️ Pomeriggio
          </label>
          <input
            type="range"
            min="0"
            max="6"
            step="0.5"
            value={simpleMode.afternoon}
            onChange={(e) => setSimpleMode({ ...simpleMode, afternoon: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Niente</span>
            <span className="font-semibold text-orange-700">{simpleMode.afternoon} ore</span>
            <span>Molto</span>
          </div>
        </div>

        {/* Risultato */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 mb-2">Ore di sole stimate:</p>
          <p className="text-3xl font-bold text-blue-600">{totalHours.toFixed(1)} h/giorno</p>
        </div>

        {/* Pulsanti */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode('select')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Indietro
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Conferma
          </button>
        </div>
      </div>
    )
  }

  // Modalità Avanzata
  if (mode === 'advanced') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            🧭 Modalità Avanzata - Calcolo Scientifico
          </h3>
          <button
            onClick={() => setMode('select')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Cambia modalità
          </button>
        </div>

        <CompassObstacleSelector
          onObstaclesChange={setObstacles}
          initialObstacles={obstacles}
          latitude={latitude}
          longitude={longitude}
        />

        {/* Risultato Calcolo Scientifico */}
        {calculatedSunHours !== null && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="text-blue-600" size={20} />
              <p className="text-sm font-semibold text-blue-900">
                Calcolo Scientifico (formule astronomiche)
              </p>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {calculatedSunHours.toFixed(1)} h/giorno
            </p>
            <p className="text-xs text-blue-700">
              Calcolato per lat {latitude.toFixed(2)}°, lng {longitude.toFixed(2)}° con {obstacles.length} ostacoli
            </p>
          </div>
        )}

        {obstacles.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              ℹ️ Aggiungi almeno un ostacolo per calcolare le ore di sole con precisione scientifica.
            </p>
          </div>
        )}

        {/* Pulsanti */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode('select')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Indietro
          </button>
          <button
            onClick={handleComplete}
            disabled={obstacles.length === 0}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Conferma
          </button>
        </div>
      </div>
    )
  }

  // Modalità Foto 360° (placeholder - da implementare completamente)
  if (mode === 'photo360') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            📸 Foto 360° - Analisi AI
          </h3>
          <button
            onClick={() => setMode('select')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Cambia modalità
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <h4 className="font-semibold text-gray-900 mb-2">Carica Foto Panoramica 360°</h4>
          <p className="text-sm text-gray-600 mb-4">
            L'AI analizzerà automaticamente la foto per rilevare edifici, alberi e montagne
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handle360PhotoUpload}
            className="hidden"
            id="photo360-upload"
          />
          <label
            htmlFor="photo360-upload"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
          >
            Scegli Foto
          </label>
        </div>

        {photo360 && (
          <div className="space-y-4">
            <img src={photo360} alt="Foto 360°" className="w-full rounded-lg" />

            {obstacles.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  ✅ {obstacles.length} ostacoli rilevati!
                </p>
                <p className="text-xs text-green-700">
                  Puoi procedere o modificare manualmente gli ostacoli.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pulsanti */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode('select')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Indietro
          </button>
          <button
            onClick={handleComplete}
            disabled={obstacles.length === 0}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Conferma
          </button>
        </div>
      </div>
    )
  }

  return null
}
