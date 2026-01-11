'use client'

import React, { useState } from 'react'
import { Garden } from '@/types'
import { X, ArrowRight, ArrowLeft, Home, Ruler, MapPin } from 'lucide-react'

interface DashboardWizardProps {
  onComplete: (gardenData: Partial<Garden>) => void
  onSkip: () => void
}

export function DashboardWizard({ onComplete, onSkip }: DashboardWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [gardenData, setGardenData] = useState<Partial<Garden>>({
    name: '',
    sizeSqMeters: undefined,
    coordinates: undefined
  })

  const steps = [
    {
      id: 'name',
      title: 'Nome del tuo orto',
      description: 'Come vuoi chiamare il tuo orto?'
    },
    {
      id: 'size',
      title: 'Dimensione',
      description: 'Quanto è grande il tuo orto?'
    },
    {
      id: 'location',
      title: 'Posizione',
      description: 'Dove si trova il tuo orto?'
    }
  ]

  const sizeOptions = [
    { value: 5, label: 'Piccolo', icon: '🌱', description: 'Fino a 10 m²' },
    { value: 30, label: 'Medio', icon: '🌿', description: '10-50 m²' },
    { value: 100, label: 'Grande', icon: '🌳', description: '50-200 m²' },
    { value: 250, label: 'Molto Grande', icon: '🏡', description: 'Oltre 200 m²' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete(gardenData)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return gardenData.name && gardenData.name.trim().length > 0
      case 1:
        return gardenData.sizeSqMeters !== undefined
      case 2:
        return gardenData.coordinates !== undefined
      default:
        return false
    }
  }

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGardenData({
            ...gardenData,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Impossibile ottenere la posizione. Puoi saltare questo passaggio.')
        }
      )
    } else {
      alert('La geolocalizzazione non è supportata dal tuo browser.')
    }
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            {steps[currentStep].title}
          </h2>
          <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
        </div>
        <button
          onClick={onSkip}
          className="p-3 hover:bg-white/50 rounded-lg transition-colors"
          aria-label="Salta configurazione"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-green-600 scale-125'
                  : idx < currentStep
                  ? 'bg-green-400'
                  : 'bg-gray-300'
              }`}
            />
            {idx < steps.length - 1 && (
              <div
                className={`h-1 w-8 transition-all ${
                  idx < currentStep ? 'bg-green-400' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="mb-6 min-h-[200px]">
        {currentStep === 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome orto
            </label>
            <input
              type="text"
              value={gardenData.name || ''}
              onChange={(e) => setGardenData({ ...gardenData, name: e.target.value })}
              placeholder="Es: Orto di casa, Giardino principale..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Seleziona la dimensione
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setGardenData({
                      ...gardenData,
                      sizeSqMeters: option.value,
                      sizeUnit: 'sqm'
                    })
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    gardenData.sizeSqMeters === option.value
                      ? 'border-green-500 bg-green-100 scale-105'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Posizione del tuo orto
            </label>
            {gardenData.coordinates ? (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-3 text-green-700">
                  <MapPin size={20} />
                  <span className="font-medium">Posizione impostata</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Lat: {gardenData.coordinates.latitude.toFixed(4)}, 
                  Lng: {gardenData.coordinates.longitude.toFixed(4)}
                </p>
                <button
                  onClick={() => setGardenData({ ...gardenData, coordinates: undefined })}
                  className="text-xs text-gray-600 hover:text-gray-900 mt-2 underline"
                >
                  Cambia posizione
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleLocationClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <MapPin size={20} />
                  Usa la mia posizione attuale
                </button>
                <p className="text-xs text-gray-600 text-center">
                  Oppure puoi saltare questo passaggio e impostarlo dopo
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          Salta configurazione - lo faccio dopo
        </button>
        
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center gap-3"
            >
              <ArrowLeft size={18} />
              Indietro
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              canProceed()
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentStep === steps.length - 1 ? 'Completa' : 'Avanti'}
            {currentStep < steps.length - 1 && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
