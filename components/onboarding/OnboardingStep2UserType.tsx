'use client'

import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, User, Briefcase, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { OnboardingData } from './UserOnboardingWizard'

interface OnboardingStep2UserTypeProps {
  initialValue?: OnboardingData['userType']
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}

export function OnboardingStep2UserType({ initialValue, onNext, onBack }: OnboardingStep2UserTypeProps) {
  const [selectedType, setSelectedType] = useState<OnboardingData['userType'] | undefined>(initialValue)

  const userTypes = [
    {
      id: 'hobby' as const,
      label: 'Hobby',
      description: 'Coltivo per passione e autoconsumo',
      icon: User,
      color: 'bg-green-100 text-green-700 border-green-300',
    },
    {
      id: 'semi-pro' as const,
      label: 'Semi-professionale',
      description: 'Coltivo per vendita occasionale',
      icon: Briefcase,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    {
      id: 'pro' as const,
      label: 'Professionale',
      description: 'Coltivo per vendita regolare',
      icon: Building2,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
    },
  ]

  const handleNext = () => {
    if (selectedType) {
      onNext({ userType: selectedType })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Che tipo di coltivatore sei?
        </h3>
        <p className="text-gray-600">
          Scegli l'opzione che meglio ti descrive
        </p>
      </div>

      <div className="space-y-3">
        {userTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.id
          
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${type.color} border-current`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  isSelected ? 'bg-white/50' : 'bg-gray-50'
                }`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{type.label}</h4>
                  <p className="text-sm opacity-80">{type.description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
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
          disabled={!selectedType}
          className="flex-1"
        >
          Continua
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}
