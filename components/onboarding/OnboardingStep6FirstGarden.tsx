'use client'

import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useStorage } from '@/packages/core/hooks/useStorage'
import type { OnboardingData } from './UserOnboardingWizard'
import type { Garden } from '@/types'

interface OnboardingStep6FirstGardenProps {
  onboardingData: Partial<OnboardingData>
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}

export function OnboardingStep6FirstGarden({ onboardingData, onNext, onBack }: OnboardingStep6FirstGardenProps) {
  const { storageProvider } = useStorage()
  const [gardenName, setGardenName] = useState('Il Mio Orto')
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)

  const handleCreateGarden = async () => {
    if (!gardenName.trim()) return

    setCreating(true)
    try {
      const garden: Garden = {
        id: crypto.randomUUID(),
        name: gardenName.trim(),
        sizeSqMeters: 0,
        sizeUnit: 'sqm',
        coordinates: onboardingData.location,
        altitudeMeters: onboardingData.location?.altitude,
        primaryCrop: {
          archetypeId: 'MIX',
          label: 'Orto misto',
          canonicalPlantName: 'orto',
          createdFrom: 'suggested',
        },
        gardenType: onboardingData.gardenTypes?.[0] === 'orto' ? 'OpenField' : 
                   onboardingData.gardenTypes?.[0] === 'frutteto' ? 'Orchard' :
                   onboardingData.gardenTypes?.[0] === 'oliveto' ? 'OliveGrove' :
                   onboardingData.gardenTypes?.[0] === 'vigneto' ? 'Vineyard' : 'OpenField',
        soilType: 'Loamy',
        soilPh: 6.5,
        createdAt: new Date().toISOString()
      }

      await storageProvider.createGarden(garden)
      setCreated(true)
      
      setTimeout(() => {
        onNext({ garden })
      }, 1000)
    } catch (error) {
      console.error('Error creating garden:', error)
      alert('Errore nella creazione del giardino. Riprova.')
      setCreating(false)
    }
  }

  if (created) {
    return (
      <div className="space-y-6 text-center">
        <CheckCircle className="mx-auto text-ortomio-green-600" size={64} />
        <h3 className="text-2xl font-bold text-gray-900">
          Giardino creato con successo!
        </h3>
        <p className="text-gray-600">
          Stai per essere reindirizzato alla dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Crea il tuo primo giardino
        </h3>
        <p className="text-gray-600">
          Diamo un nome al tuo spazio di coltivazione
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome del giardino
        </label>
        <Input
          type="text"
          value={gardenName}
          onChange={(e) => setGardenName(e.target.value)}
          placeholder="Il Mio Orto"
          className="text-lg"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Suggerimento:</strong> Puoi creare altri giardini in seguito dalle impostazioni.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={creating}
        >
          <ArrowLeft size={20} className="mr-2" />
          Indietro
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateGarden}
          disabled={!gardenName.trim() || creating}
          className="flex-1"
        >
          {creating ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Creazione...
            </>
          ) : (
            <>
              Crea Giardino
              <ArrowRight size={20} className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
