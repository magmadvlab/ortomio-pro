'use client'

import React from 'react'
import { Calendar, Sprout, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SimplifiedPlantingFormProps {
  plantName: string
  variety?: string
  varieties?: Array<{ id: string; name: string; recommended?: boolean }>
  plantingMethod: 'now' | 'transplant' | 'later'
  onPlantingMethodChange: (method: 'now' | 'transplant' | 'later') => void
  plantingDate: string
  onPlantingDateChange: (date: string) => void
  quantity: number
  onQuantityChange: (qty: number) => void
  onSubmit: () => void
  isLoading?: boolean
}

export function SimplifiedPlantingForm({
  plantName,
  variety,
  varieties = [],
  plantingMethod,
  onPlantingMethodChange,
  plantingDate,
  onPlantingDateChange,
  quantity,
  onQuantityChange,
  onSubmit,
  isLoading = false,
}: SimplifiedPlantingFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Varietà Select */}
      {varieties.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Varietà
          </label>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base bg-white cursor-pointer transition-all focus:border-ortomio-green-500 focus:outline-none">
            {varieties.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.recommended ? '(consigliato per la tua zona)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quando vuoi iniziare? */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Quando vuoi iniziare?
        </label>
        <div className="space-y-3">
          {/* Semina ora */}
          <button
            onClick={() => onPlantingMethodChange('now')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              plantingMethod === 'now'
                ? 'border-ortomio-green-500 bg-ortomio-green-50'
                : 'border-gray-200 hover:border-ortomio-green-300 hover:bg-gray-50'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              plantingMethod === 'now' ? 'border-ortomio-green-500' : 'border-gray-300'
            }`}>
              {plantingMethod === 'now' && (
                <div className="w-3 h-3 bg-ortomio-green-500 rounded-full" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">Semina ora</div>
              <div className="text-sm text-gray-600">Inizia dalle sementi in semenzaio</div>
            </div>
            {plantingMethod === 'now' && (
              <span className="px-3 py-1 bg-ortomio-green-100 text-ortomio-green-700 text-xs font-semibold rounded-full">
                Consigliato
              </span>
            )}
          </button>

          {/* Trapianto */}
          <button
            onClick={() => onPlantingMethodChange('transplant')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              plantingMethod === 'transplant'
                ? 'border-ortomio-green-500 bg-ortomio-green-50'
                : 'border-gray-200 hover:border-ortomio-green-300 hover:bg-gray-50'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              plantingMethod === 'transplant' ? 'border-ortomio-green-500' : 'border-gray-300'
            }`}>
              {plantingMethod === 'transplant' && (
                <div className="w-3 h-3 bg-ortomio-green-500 rounded-full" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">Trapianto</div>
              <div className="text-sm text-gray-600">Ho già le piantine pronte</div>
            </div>
          </button>

          {/* Pianifica per dopo */}
          <button
            onClick={() => onPlantingMethodChange('later')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              plantingMethod === 'later'
                ? 'border-ortomio-green-500 bg-ortomio-green-50'
                : 'border-gray-200 hover:border-ortomio-green-300 hover:bg-gray-50'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              plantingMethod === 'later' ? 'border-ortomio-green-500' : 'border-gray-300'
            }`}>
              {plantingMethod === 'later' && (
                <div className="w-3 h-3 bg-ortomio-green-500 rounded-full" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">Pianifica per dopo</div>
              <div className="text-sm text-gray-600">Scegli una data futura</div>
            </div>
          </button>
        </div>

        {/* Date picker quando "Pianifica per dopo" è selezionato */}
        {plantingMethod === 'later' && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Data di semina
            </label>
            <input
              type="date"
              value={plantingDate || today}
              onChange={(e) => onPlantingDateChange(e.target.value)}
              min={today}
              max={maxDateStr}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-ortomio-green-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Quantità */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Quantità
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-11 h-11 border-2 border-gray-200 rounded-xl bg-white hover:border-ortomio-green-500 hover:bg-ortomio-green-50 transition-all text-xl font-semibold text-gray-700"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <div className="text-4xl font-bold text-ortomio-green-600">{quantity}</div>
            <div className="text-sm text-gray-600 mt-1">piante</div>
          </div>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-11 h-11 border-2 border-gray-200 rounded-xl bg-white hover:border-ortomio-green-500 hover:bg-ortomio-green-50 transition-all text-xl font-semibold text-gray-700"
          >
            +
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200 bg-ortomio-green-50 -mx-6 -mb-6 px-6 pb-6">
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-ortomio-green-500 to-ortomio-green-600 text-white rounded-xl font-semibold text-base hover:from-ortomio-green-600 hover:to-ortomio-green-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Sprout size={20} />
          Aggiungi al Piano
        </Button>
        <p className="text-center text-sm text-gray-600 mt-3">
          OrtoMio ti ricorderà quando irrigare, concimare e raccogliere!
        </p>
      </div>
    </div>
  )
}







