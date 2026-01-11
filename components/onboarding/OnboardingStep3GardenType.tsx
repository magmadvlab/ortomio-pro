'use client'

import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, Sprout, TreePine, CircleDot, Grape } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { OnboardingData } from './UserOnboardingWizard'

interface OnboardingStep3GardenTypeProps {
  initialValue?: string[]
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}

export function OnboardingStep3GardenType({ initialValue, onNext, onBack }: OnboardingStep3GardenTypeProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialValue || [])

  const gardenTypes = [
    {
      id: 'orto',
      label: 'Orto',
      icon: Sprout,
      emoji: '🥬',
    },
    {
      id: 'frutteto',
      label: 'Frutteto',
      icon: TreePine,
      emoji: '🍎',
    },
    {
      id: 'oliveto',
      label: 'Olivi',
      icon: CircleDot,
      emoji: '🫒',
    },
    {
      id: 'vigneto',
      label: 'Vigneto',
      icon: Grape,
      emoji: '🍇',
    },
  ]

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    )
  }

  const handleNext = () => {
    if (selectedTypes.length > 0) {
      onNext({ gardenTypes: selectedTypes })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Cosa coltivi?
        </h3>
        <p className="text-gray-600">
          Seleziona tutti i tipi di coltivazione che ti interessano
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gardenTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selectedTypes.includes(type.id)
          
          return (
            <button
              key={type.id}
              onClick={() => toggleType(type.id)}
              className={`p-6 rounded-lg border-2 transition-all text-center ${
                isSelected
                  ? 'bg-ortomio-green-50 border-ortomio-green-500 text-ortomio-green-700'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">{type.emoji}</div>
              <div className="font-semibold">{type.label}</div>
            </button>
          )
        })}
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
          disabled={selectedTypes.length === 0}
          className="flex-1"
        >
          Continua
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}

