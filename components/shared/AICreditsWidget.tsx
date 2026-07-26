'use client'

import { Zap, AlertCircle } from 'lucide-react'
import { useAICredits } from '@/hooks/useAICredits'

export function AICreditsWidget() {
  const { credits, remaining, percentage, isLoading } = useAICredits()
  
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-full max-w-sm" size={24} />
            <h3 className="font-semibold text-lg">AI Credits</h3>
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {remaining}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Utilizzati: {credits.used}</span>
            <span>Totale: {credits.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                percentage > 80 ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
        
        {percentage > 80 && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-3">
            <AlertCircle className="text-yellow-full max-w-sm flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-medium text-yellow-full max-w-sm">
                Stai per esaurire i credits!
              </p>
              <p className="text-yellow-full max-w-sm mt-1">
                Attendi il rinnovo operativo dei crediti o contatta l’amministratore.
              </p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}




