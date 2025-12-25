'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Edit, SkipForward, X, Sprout } from 'lucide-react'
import GardenOnboarding from '@/components/GardenOnboarding'

interface OnboardingBannerProps {
  onDismiss?: () => void
  onComplete?: () => void
}

export function OnboardingBanner({ onDismiss, onComplete }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardMode, setWizardMode] = useState<'auto' | 'manual'>('auto')

  const handleDismiss = () => {
    setDismissed(true)
    if (onDismiss) {
      onDismiss()
    }
  }

  const handleOpenWizard = (mode: 'auto' | 'manual') => {
    setWizardMode(mode)
    setWizardOpen(true)
  }

  const handleWizardComplete = () => {
    setWizardOpen(false)
    setDismissed(true)
    if (onComplete) {
      onComplete()
    }
  }

  if (dismissed) {
    return null
  }

  return (
    <>
      {/* Banner */}
      <Card className="mb-6 border-2 border-green-500 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shadow-lg">
        <div className="p-6 relative">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="pr-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                <Sprout className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  👋 Benvenuto in OrtoMio!
                </h3>
                <p className="text-sm text-gray-600">
                  Inizia a pianificare il tuo orto in pochi secondi
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-5">
              Configura il tuo primo orto per ricevere consigli personalizzati su cosa piantare,
              quando irrigare e quando raccogliere. OrtoMio ti guiderà passo dopo passo.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleOpenWizard('auto')}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <MapPin size={18} />
                Usa mia posizione
              </Button>

              <Button
                onClick={() => handleOpenWizard('manual')}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                <Edit size={18} />
                Inserisci manualmente
              </Button>

              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <SkipForward size={18} />
                Salta per ora
              </Button>
            </div>

            {/* Info aggiuntiva */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 <strong>Suggerimento:</strong> Configurare la posizione permette a OrtoMio di
                darti consigli stagionali precisi e alert meteo per il tuo orto.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Garden Onboarding Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Configura il tuo primo orto
                </h2>
                <button
                  onClick={() => setWizardOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Chiudi"
                >
                  <X size={24} />
                </button>
              </div>

              <GardenOnboarding
                onComplete={handleWizardComplete}
                onCancel={() => setWizardOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
