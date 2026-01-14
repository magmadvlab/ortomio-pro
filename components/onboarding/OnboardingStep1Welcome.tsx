'use client'

import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { OnboardingData } from './UserOnboardingWizard'

interface OnboardingStep1WelcomeProps {
  onNext: (data: Partial<OnboardingData>) => void
}

export function OnboardingStep1Welcome({ onNext }: OnboardingStep1WelcomeProps) {
  const [userName, setUserName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      localStorage.setItem('ortomio_user_name', userName.trim())
      onNext({ userName: userName.trim() })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          🌱 Benvenuto in OrtoMio!
        </h3>
        <p className="text-gray-600">
          Il tuo assistente personale per coltivare con successo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
            Come ti chiami?
          </label>
          <Input
            id="userName"
            type="text"
            value={userName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
            placeholder="Il tuo nome"
            required
            className="text-lg"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!userName.trim()}
        >
          Continua
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </form>
    </div>
  )
}

