'use client'

import React from 'react'
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface OnboardingStep7TutorialProps {
  onComplete: () => void
  onBack: () => void
}

export function OnboardingStep7Tutorial({ onComplete, onBack }: OnboardingStep7TutorialProps) {
  const features = [
    {
      icon: '📅',
      title: 'Pianifica le tue coltivazioni',
      description: 'Aggiungi piante al planner e ricevi promemoria automatici',
    },
    {
      icon: '📖',
      title: 'Tieni un diario',
      description: 'Registra tutte le tue attività e monitora la crescita',
    },
    {
      icon: '🍅',
      title: 'Traccia i raccolti',
      description: 'Vedi quanto produci e migliora nel tempo',
    },
    {
      icon: '✨',
      title: 'Ricevi consigli',
      description: 'Ottieni suggerimenti personalizzati basati sul tuo orto',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          🎉 Tutto pronto!
        </h3>
        <p className="text-gray-600">
          Ecco cosa puoi fare con OrtoMio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, idx) => (
          <Card key={idx} variant="interactive" className="p-4">
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </Card>
        ))}
      </div>

      <div className="bg-ortomio-green-50 border border-ortomio-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="text-ortomio-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-ortomio-green-900 mb-1">
              Pronto per iniziare!
            </p>
            <p className="text-sm text-ortomio-green-800">
              Esplora la dashboard e inizia a pianificare la tua prima coltivazione.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Indietro
        </Button>
        <Button
          variant="primary"
          onClick={onComplete}
          className="flex-1"
        >
          Inizia a coltivare!
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}

