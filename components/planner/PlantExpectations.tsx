'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { ClipboardList } from 'lucide-react'

interface PlantExpectationsProps {
  germinationDays?: string
  transplantWeeks?: string
  harvestDays?: string
  production?: string
}

export function PlantExpectations({
  germinationDays = '5-10 giorni',
  transplantWeeks = '6-8 settimane',
  harvestDays = '80-100 giorni',
  production = '3-5 kg/pianta',
}: PlantExpectationsProps) {
  return (
    <Card variant="default" className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="text-ortomio-green-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-900">Cosa aspettarti</h3>
      </div>
      
      <ul className="space-y-2 text-sm text-gray-600">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-ortomio-green-500 rounded-full" />
          Germinazione: {germinationDays}
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-ortomio-green-500 rounded-full" />
          Trapianto: dopo {transplantWeeks}
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-ortomio-green-500 rounded-full" />
          Prima raccolta: {harvestDays}
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-ortomio-green-500 rounded-full" />
          Produzione media: {production}
        </li>
      </ul>
    </Card>
  )
}







