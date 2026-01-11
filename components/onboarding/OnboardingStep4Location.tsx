'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, ArrowLeft, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { OnboardingData } from './UserOnboardingWizard'

interface OnboardingStep4LocationProps {
  initialValue?: OnboardingData['location']
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}

export function OnboardingStep4Location({ initialValue, onNext, onBack }: OnboardingStep4LocationProps) {
  const [latitude, setLatitude] = useState(initialValue?.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(initialValue?.longitude?.toString() || '')
  const [altitude, setAltitude] = useState(initialValue?.altitude?.toString() || '')
  const [loading, setLoading] = useState(false)

  const handleGetLocation = async () => {
    setLoading(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude.toFixed(6))
            setLongitude(position.coords.longitude.toFixed(6))
            setLoading(false)
          },
          (error) => {
            console.error('Error getting location:', error)
            setLoading(false)
            alert('Impossibile ottenere la posizione. Inseriscila manualmente.')
          }
        )
      } else {
        alert('La geolocalizzazione non è supportata dal tuo browser.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (latitude && longitude) {
      onNext({
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          altitude: altitude ? parseFloat(altitude) : undefined,
        },
      })
    }
  }

  const isValid = latitude && longitude && 
    !isNaN(parseFloat(latitude)) && 
    !isNaN(parseFloat(longitude)) &&
    parseFloat(latitude) >= -90 && parseFloat(latitude) <= 90 &&
    parseFloat(longitude) >= -180 && parseFloat(longitude) <= 180

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Dimensioni e Localizzazione
        </h3>
        <p className="text-gray-600">
          Inserisci le coordinate del tuo orto per suggerimenti personalizzati
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coordinate
          </label>
          <div className="flex gap-3">
            <Input
              type="number"
              step="any"
              placeholder="Latitudine"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitudine"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGetLocation}
            disabled={loading}
            className="mt-2 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Rilevamento...
              </>
            ) : (
              <>
                <MapPin size={16} className="mr-2" />
                Rileva Posizione Automaticamente
              </>
            )}
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Altitudine (metri, opzionale)
          </label>
          <Input
            type="number"
            placeholder="Altitudine"
            value={altitude}
            onChange={(e) => setAltitude(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft size={20} className="mr-2" />
          Indietro
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!isValid}
          className="flex-1"
        >
          Continua
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}

