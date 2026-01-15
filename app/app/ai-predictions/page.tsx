'use client'

import { FeatureGate } from '@/components/shared/FeatureGate'
import AIPredictionsDashboard from '@/components/ai/predictions/AIPredictionsDashboard'

/**
 * AI Predictions Page
 * 
 * Modulo: AI_PREDICTIONS
 * Servizio: aiPredictiveEngine.ts
 * 
 * Funzionalità:
 * - Predizioni malattie con probabilità e lead time
 * - Predizioni resa con range e finestra raccolta
 * - Ottimizzazione risorse (acqua, fertilizzanti, lavoro, energia)
 * - Azioni raccomandate basate su AI
 */
export default function AIPredictionsPage() {
  return (
    <FeatureGate 
      feature="AI_PREDICTIONS"
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI Predictions
            </h2>
            <p className="text-gray-600 mb-4">
              Questa funzionalità non è ancora disponibile.
            </p>
            <p className="text-sm text-gray-500">
              Contatta l'amministratore per attivarla.
            </p>
          </div>
        </div>
      }
    >
      <AIPredictionsDashboard />
    </FeatureGate>
  )
}
