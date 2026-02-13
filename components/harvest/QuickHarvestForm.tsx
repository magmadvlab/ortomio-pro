'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { GardenTask, HarvestLogData, Garden } from '@/types'
import { X, Camera, Minus, Plus } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { useStorage } from '@/packages/core/hooks/useStorage'

interface QuickHarvestFormProps {
  task: GardenTask
  onHarvest: (harvestData: Omit<HarvestLogData, 'id' | 'gardenId'>) => void
  onSkip: () => void
}

export function QuickHarvestForm({ task, onHarvest, onSkip }: QuickHarvestFormProps) {
  const storage = useStorage()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [unit, setUnit] = useState<'kg' | 'g' | 'units'>('kg')
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good')
  const [photo, setPhoto] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>('')
  
  // Hydroponic fields
  const [channelNumber, setChannelNumber] = useState<number>(1)
  const [bucketNumber, setBucketNumber] = useState<number>(1)
  const [position, setPosition] = useState<number>(1)
  const [ph, setPh] = useState<number>(6.0)
  const [ec, setEc] = useState<number>(1.5)
  const [waterTemp, setWaterTemp] = useState<number>(20)
  const [daysSinceChange, setDaysSinceChange] = useState<number>(7)

  // Load garden data
  useEffect(() => {
    const loadGarden = async () => {
      if (task.gardenId && storage) {
        try {
          const gardenData = await storage.getGarden(task.gardenId)
          setGarden(gardenData)
        } catch (error) {
          console.error('Error loading garden:', error)
        }
      }
    }
    loadGarden()
  }, [task.gardenId, storage])

  // Check if garden is hydroponic/aquaponic/aeroponic
  const isHydroponic = useMemo(() => {
    if (!garden) return false
    const hydroTypes = ['Hydroponic', 'NFT', 'DWC', 'EbbFlow', 'Drip', 'Wick', 'Kratky']
    return hydroTypes.includes(garden.gardenType || '')
  }, [garden])

  const isAquaponic = useMemo(() => {
    return garden?.gardenType === 'Aquaponic'
  }, [garden])

  const isAeroponic = useMemo(() => {
    return garden?.gardenType === 'Aeroponic'
  }, [garden])

  const qualityOptions = [
    { value: 'excellent', emoji: '😊', label: 'Ottima' },
    { value: 'good', emoji: '🙂', label: 'Buona' },
    { value: 'fair', emoji: '😐', label: 'Sufficiente' },
    { value: 'poor', emoji: '😟', label: 'Scarsa' }
  ]

  // Calcola giorni dalla semina/trapianto
  const daysSincePlanting = useMemo(() => {
    if (!task.date) return 0
    const plantingDate = new Date(task.date)
    const today = new Date()
    return differenceInDays(today, plantingDate)
  }, [task.date])

  // Ottieni emoji pianta (placeholder - da migliorare con mapping reale)
  const getPlantEmoji = (plantName: string) => {
    const emojiMap: Record<string, string> = {
      'Lattuga': '🥬',
      'Pomodoro': '🍅',
      'Basilico': '🌿',
      'Peperone': '🫑',
      'Zucchina': '🥒',
    }
    return emojiMap[plantName] || '🌱'
  }

  // Ottieni zona (placeholder - da migliorare con dati reali)
  const getZone = () => {
    if (task.bedId) return `Zona ${task.bedId.slice(0, 1).toUpperCase()}`
    if (task.zoneId) return `Zona ${task.zoneId.slice(0, 1).toUpperCase()}`
    return 'Zona C'
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhoto(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const qualityRating = ({
      'excellent': 5,
      'good': 4,
      'fair': 3,
      'poor': 2
    }[quality] ?? 3) as HarvestLogData['rating']

    const harvestData: Omit<HarvestLogData, 'id' | 'gardenId'> = {
      plantName: task.plantName,
      quantity,
      unit,
      rating: qualityRating,
      date: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
      photo: photo || undefined,
      taskId: task.id
    }

    // Add hydroponic data if applicable
    if (isHydroponic && garden) {
      const systemType = garden.gardenType as 'NFT' | 'DWC' | 'EbbFlow' | 'Drip' | 'Wick' | 'Kratky'
      
      harvestData.hydroponicPosition = {
        systemType,
        ...(systemType === 'NFT' && { channelNumber, position }),
        ...(systemType === 'DWC' && { bucketNumber, position }),
        plantCode: `${systemType}-${systemType === 'NFT' ? `C${channelNumber}` : `B${bucketNumber}`}-P${position}`
      }

      harvestData.hydroponicParameters = {
        ph,
        ec,
        waterTemperature: waterTemp,
        daysSinceLastChange: daysSinceChange
      }
    }

    // Add aquaponic data if applicable
    if (isAquaponic && garden) {
      harvestData.aquaponicPosition = {
        systemType: 'MediaBed',
        bedNumber: bucketNumber,
        position,
        plantCode: `AQP-B${bucketNumber}-P${position}`
      }

      harvestData.aquaponicParameters = {
        ph,
        ammonia: 0.5, // Default values - should be from latest reading
        nitrite: 0.1,
        nitrate: 40,
        waterTemperature: waterTemp
      }
    }

    // Add aeroponic data if applicable
    if (isAeroponic && garden) {
      harvestData.aeroponicPosition = {
        systemType: 'HighPressure',
        chamberNumber: channelNumber,
        position,
        plantCode: `AER-CH${channelNumber}-P${position}`
      }

      harvestData.aeroponicParameters = {
        ph,
        ec,
        waterTemperature: waterTemp,
        mistingPressure: 80 // Default value
      }
    }

    onHarvest(harvestData)
  }

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(0.1, Math.min(1000, quantity + delta)))
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[480px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">🛒 Registra Raccolto</h2>
          <button
            onClick={onSkip}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Chiudi"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center mb-6">
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-lg font-semibold text-green-700 mb-1">
              La tua {task.plantName} è pronta!
            </div>
            <div className="text-sm text-gray-600">
              Registra il raccolto per tenere traccia dei tuoi progressi
            </div>
          </div>

          {/* Plant Info Card */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
              {getPlantEmoji(task.plantName)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                {task.plantName} {task.variety ? `(${task.variety})` : ''}
              </h3>
              <p className="text-[13px] text-gray-500">
                📍 {getZone()} • Piantata {daysSincePlanting} giorni fa
              </p>
            </div>
          </div>
          {/* Quantità con +/- buttons */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantità raccolta
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => adjustQuantity(-0.5)}
                className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors text-xl md:text-2xl font-light"
                aria-label="Diminuisci"
              >
                −
              </button>
              
              <div className="flex-1 text-center">
                <div className="text-4xl font-bold text-gray-800 mb-1">
                  {quantity.toFixed(quantity % 1 === 0 ? 0 : 1)}
                </div>
                <div className="text-sm text-gray-500">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="bg-transparent border-none text-gray-500 focus:outline-none cursor-pointer"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="units">unità</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => adjustQuantity(0.5)}
                className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors text-xl md:text-2xl font-light"
                aria-label="Aumenta"
              >
                +
              </button>
            </div>
          </div>

          {/* Selezione Qualità Emoji */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualità
            </label>
            <div className="flex gap-3">
              {qualityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setQuality(option.value as any)}
                  className={`flex-1 p-3 bg-gray-50 border-2 rounded-xl text-center transition-all ${
                    quality === option.value
                      ? 'bg-green-50 border-green-500'
                      : 'border-transparent hover:bg-green-50'
                  }`}
                >
                  <div className="text-xl md:text-2xl mb-1">{option.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hydroponic/Aquaponic/Aeroponic Fields */}
          {(isHydroponic || isAquaponic || isAeroponic) && (
            <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                💧 Dati Sistema {isHydroponic ? 'Idroponico' : isAquaponic ? 'Acquaponico' : 'Aeroponico'}
              </h3>
              
              {/* Position Fields */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {(isHydroponic && garden?.gardenType === 'NFT') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Canale NFT
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={channelNumber}
                      onChange={(e) => setChannelNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
                
                {(isHydroponic && garden?.gardenType === 'DWC') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Secchio DWC
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={bucketNumber}
                      onChange={(e) => setBucketNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {isAquaponic && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Letto
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={bucketNumber}
                      onChange={(e) => setBucketNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {isAeroponic && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Camera
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={channelNumber}
                      onChange={(e) => setChannelNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Posizione
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Parameters Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="8"
                    value={ph}
                    onChange={(e) => setPh(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                {(isHydroponic || isAeroponic) && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      EC (mS/cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={ec}
                      onChange={(e) => setEc(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Temp. Acqua (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="10"
                    max="35"
                    value={waterTemp}
                    onChange={(e) => setWaterTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                {isHydroponic && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Giorni da cambio
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={daysSinceChange}
                      onChange={(e) => setDaysSinceChange(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Foto Opzionale */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto (opzionale)
            </label>
            {photo ? (
              <div className="relative">
                <img src={photo} alt="Preview" className="w-full h-48 object-cover rounded-xl border-2 border-gray-200" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-3 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm text-gray-600 font-medium">Tocca per aggiungere una foto</div>
                <div className="text-xs text-gray-400 mt-1">Documenta il tuo raccolto!</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Note Opzionale */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (opzionale)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none"
              placeholder="Es: Foglie molto croccanti, raccolto anticipato per il freddo..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold text-base"
          >
            💾 Salva Raccolto
          </button>
        </form>
      </div>
    </div>
  )
}
