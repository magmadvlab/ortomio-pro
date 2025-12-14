'use client'

import React from 'react'
import { useTier } from '@/packages/core/hooks/useTier'
import { Zap, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface AICreditsData {
  total: number
  used: number
  resetDate: string | null
}

export function AICreditsWidget() {
  const { tier, isFree } = useTier()
  // TODO: Replace with useAICredits hook in FASE 5
  const [credits, setCredits] = React.useState<AICreditsData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  React.useEffect(() => {
    if (isFree) {
      setIsLoading(false)
      return
    }
    
    // Fetch credits status
    fetch('/api/credits/status')
      .then(res => res.json())
      .then(data => {
        setCredits(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching credits:', err)
        setIsLoading(false)
      })
  }, [isFree])
  
  if (isFree) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Zap className="text-green-600 flex-shrink-0" size={32} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-green-900 mb-1">
              Sblocca AI Illimitata
            </h3>
            <p className="text-green-800 text-sm mb-3">
              Con PRO ottieni 50 AI credits/mese per diagnosi personalizzate
            </p>
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Upgrade a PRO (€9.99/mese)
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  if (isLoading || !credits) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }
  
  const remaining = credits.total - credits.used
  const percentage = credits.total > 0 ? (credits.used / credits.total) * 100 : 0
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-500" size={24} />
            <h3 className="font-semibold text-lg">AI Credits</h3>
          </div>
          <div className="text-2xl font-bold text-green-600">
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
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-medium text-yellow-900">
                Stai per esaurire i credits!
              </p>
              <p className="text-yellow-800 mt-1">
                Acquista 50 credits extra per €4.99
              </p>
            </div>
          </div>
        )}
        
        <Link
          href="/settings/credits"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          <TrendingUp size={16} />
          Compra Credits
        </Link>
      </div>
    </div>
  )
}







