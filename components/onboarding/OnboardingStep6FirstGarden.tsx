'use client'

import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { OnboardingData } from './UserOnboardingWizard'

interface OnboardingStep6FirstGardenProps {
  onboardingData: Partial<OnboardingData>
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}

export function OnboardingStep6FirstGarden({ onboardingData, onNext, onBack }: OnboardingStep6FirstGardenProps) {
  const [gardenName, setGardenName] = useState('Il Mio Orto')

  const handleContinue = () => {
    // Non creiamo l'orto qui, passiamo solo il nome
    // Il GardenTypeWizard si occuperà della creazione completa
    onNext({
      gardenName,
      // Salviamo un flag per indicare che l'utente vuole creare un orto
      shouldCreateGarden: true
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Prepariamoci a creare il tuo primo spazio
        </h3>
        <p className="text-gray-600">
          Come vuoi chiamare il tuo spazio di coltivazione?
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome
        </label>
        <Input
          type="text"
          value={gardenName}
          onChange={(e) => setGardenName(e.target.value)}
          placeholder="Il Mio Orto"
          className="text-lg"
          autoFocus
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          🌱 <strong>Prossimo passo:</strong> Ti guideremo nella configurazione completa del tuo spazio (tipo, dimensioni, terreno, irrigazione, ecc.)
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Suggerimento:</strong> Potrai creare altri spazi in seguito dalla dashboard.
        </p>
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
          onClick={handleContinue}
          disabled={!gardenName.trim()}
          className="flex-1"
        >
          Continua alla Configurazione
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}
