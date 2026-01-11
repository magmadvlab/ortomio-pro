'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { IrrigationZone } from '@/types/irrigation'
import { X, Droplets, AlertCircle, Calculator } from 'lucide-react'

interface IrrigationZoneEditModalProps {
  zone: IrrigationZone
  onSubmit: (zoneId: string, updates: Partial<IrrigationZone>) => Promise<void>
  onCancel: () => void
}

export function IrrigationZoneEditModal({
  zone,
  onSubmit,
  onCancel
}: IrrigationZoneEditModalProps) {
  const [formData, setFormData] = useState({
    name: zone.name || '',
    areaSqm: zone.areaSqm || 0,
    method: zone.method || 'Dripline' as const,
    flowRateLph: zone.flowRateLph || 0,
    plantTypes: Array.isArray(zone.plantTypes) ? zone.plantTypes : [],
    isAutomated: zone.isAutomated || false,
    notes: zone.notes || ''
  })

  const [plantInput, setPlantInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calcolo automatico minuti per 5mm
  const minutesFor5mm = formData.areaSqm > 0 && formData.flowRateLph > 0
    ? Math.round((formData.areaSqm * 5) / formData.flowRateLph)
    : 0

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome obbligatorio'
    }

    if (formData.areaSqm <= 0) {
      newErrors.areaSqm = 'Area deve essere maggiore di 0'
    }

    if (formData.flowRateLph <= 0) {
      newErrors.flowRateLph = 'Portata deve essere maggiore di 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(zone.id, {
        name: formData.name,
        areaSqm: formData.areaSqm,
        method: formData.method,
        flowRateLph: formData.flowRateLph,
        plantTypes: formData.plantTypes,
        isAutomated: formData.isAutomated,
        notes: formData.notes
      })
    } catch (error) {
      console.error('Error updating zone:', error)
      setErrors({ submit: 'Errore durante il salvataggio' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addPlant = () => {
    if (plantInput.trim() && !formData.plantTypes.includes(plantInput.trim())) {
      setFormData({
        ...formData,
        plantTypes: [...formData.plantTypes, plantInput.trim()]
      })
      setPlantInput('')
    }
  }

  const removePlant = (plant: string) => {
    setFormData({
      ...formData,
      plantTypes: formData.plantTypes.filter(p => p !== plant)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 flex items-center justify-between -m-6 mb-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Droplets size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">Modifica Zona Irrigua</h2>
              <p className="text-sm text-blue-100">{zone.name}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-3 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6 p-6">
          {/* Nome Zona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Zona *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Es. Aiuola Pomodori"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-3">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area (m²) *
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.areaSqm || ''}
              onChange={(e) => setFormData({ ...formData, areaSqm: parseFloat(e.target.value) || 0 })}
              placeholder="Es. 15"
            />
            {errors.areaSqm && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-3">
                <AlertCircle size={14} />
                {errors.areaSqm}
              </p>
            )}
          </div>

          {/* Metodo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metodo Irrigazione
            </label>
            <Select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
            >
              <option value="Manual">Manuale</option>
              <option value="Hose">Tubo</option>
              <option value="Dripline">Ala Gocciolante</option>
              <option value="Drippers">Gocciolatori</option>
              <option value="MicroSprinkler">Micro-sprinkler</option>
              <option value="Sprinkler">Irrigatori</option>
              <option value="Mixed">Misto</option>
            </Select>
          </div>

          {/* Portata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portata Totale (L/h) *
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.flowRateLph || ''}
              onChange={(e) => setFormData({ ...formData, flowRateLph: parseFloat(e.target.value) || 0 })}
              placeholder="Es. 120"
            />
            {errors.flowRateLph && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-3">
                <AlertCircle size={14} />
                {errors.flowRateLph}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Portata totale di tutti i gocciolatori/irrigatori in questa zona
            </p>
          </div>

          {/* Calcolo Automatico */}
          {minutesFor5mm > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calculator className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="font-semibold text-purple-900 mb-1">
                    Calcolo Automatico
                  </div>
                  <div className="text-sm text-purple-800">
                    Per fornire <strong>5mm di irrigazione</strong> a questa zona ({formData.areaSqm} m²)
                    con portata {formData.flowRateLph} L/h:
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-purple-600 mt-2">
                    {minutesFor5mm} minuti
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Piante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Piante in questa zona
            </label>
            <div className="flex gap-3 mb-3">
              <Input
                value={plantInput}
                onChange={(e) => setPlantInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlant())}
                placeholder="Es. Pomodoro, Lattuga..."
              />
              <Button onClick={addPlant} variant="outline" size="sm">
                Aggiungi
              </Button>
            </div>
            {formData.plantTypes.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {formData.plantTypes.map((plant, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-3"
                  >
                    {plant}
                    <button
                      onClick={() => removePlant(plant)}
                      className="hover:text-green-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Automazione */}
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.isAutomated}
              onChange={(e) => setFormData({ ...formData, isAutomated: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <div className="font-medium text-gray-900">Zona Automatizzata</div>
              <div className="text-xs text-gray-500">Controllata da timer/elettrovalvole</div>
            </div>
          </label>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (opzionale)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Aggiungi note su questa zona..."
              rows={3}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error globale */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div className="text-sm text-red-800">{errors.submit}</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 p-6 -m-6 mt-6 rounded-b-xl flex gap-3 justify-end border-t">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
