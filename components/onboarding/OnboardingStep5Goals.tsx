'use client'

import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, Home, ShoppingCart, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { OnboardingData } from './UserOnboardingWizard'

interface OnboardingStep5GoalsProps {
  initialValue?: OnboardingData['goals']
  onNext: (data: Partial<OnboardingData>) => void
  onBack: () => void
}

export function OnboardingStep5Goals({ initialValue, onNext, onBack }: OnboardingStep5GoalsProps) {
  const [selectedGoals, setSelectedGoals] = useState<OnboardingData['goals']>(initialValue || [])

  const goals = [
    {
      id: 'autoconsumo' as const,
      label: 'Autoconsumo',
      description: 'Coltivo per me e la mia famiglia',
      icon: Home,
      color: 'bg-green-100 text-green-700 border-green-300',
    },
    {
      id: 'vendita' as const,
      label: 'Vendita',
      description: 'Coltivo per vendere i prodotti',
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    {
      id: 'entrambi' as const,
      label: 'Entrambi',
      description: 'Autoconsumo e vendita',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
    },
  ]

  const toggleGoal = (goalId: OnboardingData['goals'][0]) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleNext = () => {
    if (selectedGoals.length > 0) {
      onNext({ goals: selectedGoals })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Quali sono i tuoi obiettivi?
        </h3>
        <p className="text-gray-600">
          Puoi selezionare più opzioni
        </p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const Icon = goal.icon
          const isSelected = selectedGoals.includes(goal.id)
          
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${goal.color} border-current`
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
                  <h4 className="font-semibold text-lg">{goal.label}</h4>
                  <p className="text-sm opacity-80">{goal.description}</p>
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
          disabled={selectedGoals.length === 0}
          className="flex-1"
        >
          Continua
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}

