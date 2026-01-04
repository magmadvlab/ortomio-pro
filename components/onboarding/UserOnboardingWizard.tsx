'use client'

import React, { useState } from 'react'
import { X, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { OnboardingStep1Welcome } from './OnboardingStep1Welcome'
import { OnboardingStep2UserType } from './OnboardingStep2UserType'
import { OnboardingStep3GardenType } from './OnboardingStep3GardenType'
import { OnboardingStep5Goals } from './OnboardingStep5Goals'
import { OnboardingStep7Tutorial } from './OnboardingStep7Tutorial'
import { Garden } from '@/types'

interface UserOnboardingWizardProps {
  onComplete: (data: OnboardingData) => void
  onCancel?: () => void
  allowSkip?: boolean // Permette di saltare l'onboarding
}

export interface OnboardingData {
  userName: string
  userType: 'hobby' | 'semi-pro' | 'pro'
  gardenTypes: string[]
  location?: {
    latitude: number
    longitude: number
    altitude?: number
  }
  goals: ('autoconsumo' | 'vendita' | 'entrambi')[]
  garden?: Garden
  gardenName?: string
  shouldCreateGarden?: boolean
}

export function UserOnboardingWizard({ onComplete, onCancel, allowSkip = false }: UserOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({})

  const totalSteps = 5 // Rimosso Step 4 (Location) e Step 6 (FirstGarden) - specifici per spazio

  const updateData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete(onboardingData as OnboardingData)
  }

  const handleSkip = () => {
    // Completa con dati minimali
    onComplete({
      ...onboardingData,
      userName: onboardingData.userName || 'Utente',
      userType: onboardingData.userType || 'hobby',
      gardenTypes: onboardingData.gardenTypes || ['orto'],
      goals: onboardingData.goals || ['autoconsumo'],
    } as OnboardingData)
  }

  const handleStepComplete = (stepData: Partial<OnboardingData>) => {
    updateData(stepData)
    handleNext()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Benvenuto in OrtoMio
            </h2>
            <div className="flex items-center gap-3">
              {allowSkip && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-1"
                >
                  Salta per ora
                  <ArrowRight size={16} />
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Chiudi"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep >= step
                    ? 'bg-ortomio-green-600 border-ortomio-green-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step ? <CheckCircle size={20} /> : step}
                </div>
                {step < totalSteps && (
                  <div className={`flex-1 h-1 mx-2 transition-colors ${
                    currentStep > step ? 'bg-ortomio-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {currentStep === 1 && (
              <OnboardingStep1Welcome
                onNext={(data) => handleStepComplete(data)}
              />
            )}
            {currentStep === 2 && (
              <OnboardingStep2UserType
                initialValue={onboardingData.userType}
                onNext={(data) => handleStepComplete(data)}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <OnboardingStep3GardenType
                initialValue={onboardingData.gardenTypes}
                onNext={(data) => handleStepComplete(data)}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <OnboardingStep5Goals
                initialValue={onboardingData.goals}
                onNext={(data) => handleStepComplete(data)}
                onBack={handleBack}
              />
            )}
            {currentStep === 5 && (
              <OnboardingStep7Tutorial
                onComplete={handleComplete}
                onBack={handleBack}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

