'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Lightbulb } from 'lucide-react'

interface DailyTipProps {
  tip: string
  location?: string
}

export function DailyTip({ tip, location }: DailyTipProps) {
  return (
    <Card 
      variant="default" 
      className="p-6 bg-gradient-to-br from-amber-100 to-amber-50 border-amber-200"
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl mb-2">💡</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Consiglio del Giorno</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {tip || `Nella tua zona${location ? ` (${location})` : ''}, il periodo ideale per seminare è tra Febbraio e Marzo in semenzaio protetto.`}
          </p>
        </div>
      </div>
    </Card>
  )
}




