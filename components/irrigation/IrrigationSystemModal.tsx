'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { IrrigationSystem } from '@/types/irrigation'
import { X, Droplets, AlertCircle } from 'lucide-react'

interface IrrigationSystemModalProps {
  system?: IrrigationSystem | null
  gardenId: string
  onSubmit: (system: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel: () => void
}

export function IrrigationSystemModal({
  system,
  gardenId,
  onSubmit,
  onCancel
}: IrrigationSystemModalProps) {
  const [formData, setFormData] = useState({
    name: system?.name || '',
    type: system?.type || 'Drip' as const,
    waterSource: system?.waterSource || 'Municipal' as const,
    pressureBar: system?.pressureBar || 2.0,
    hasTimer: system?.hasTimer || false,
    hasValve: system?.hasValve || false,
    notes: system?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome obbligatorio'
    }

    if (formData.pressureBar && (formData.pressureBar < 0 || formData.pressureBar > 10)) {
      newErrors.pressureBar = 'Pressione deve essere tra 0 e 10 bar'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        gardenId,
        name: formData.name,
        type: formData.type,
        waterSource: formData.waterSource,
        pressureBar: formData.pressureBar,
        hasTimer: formData.hasTimer,
        hasValve: formData.hasValve,
        notes: formData.notes
      })
    } catch (error) {
      console.error('Error saving system:', error)
      setErrors({ submit: 'Errore durante il salvataggio' })
    } finally {
      setIsSubmitting(false)
    }
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
              <h2 className="text-lg md:text-xl font-bold">
                {system ? 'Modifica Sistema' : 'Nuovo Sistema Irrigazione'}
              </h2>
              <p className="text-sm text-blue-100">
                Configura il tuo impianto irriguo
              </p>
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
          {/* Nome Sistema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Sistema *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Es. Impianto Orto Principale"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-3">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Tipo Sistema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Irrigazione
            </label>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="Manual">Manuale</option>
              <option value="Drip">Goccia (Drip)</option>
              <option value="Sprinkler">Irrigatori (Sprinkler)</option>
              <option value="Micro">Micro-irrigazione</option>
              <option value="Soaker">Tubo Poroso (Soaker)</option>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.type === 'Drip' && 'Ideale per orto: risparmio idrico e irrigazione localizzata'}
              {formData.type === 'Sprinkler' && 'Adatto per prati e aree grandi'}
              {formData.type === 'Micro' && 'Perfetto per vasi e aiuole'}
              {formData.type === 'Manual' && 'Irrigazione manuale con tubo o annaffiatoio'}
              {formData.type === 'Soaker' && 'Tubo che trasuda acqua lungo tutta la lunghezza'}
            </p>
          </div>

          {/* Fonte Acqua */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fonte Acqua
            </label>
            <Select
              value={formData.waterSource || 'Municipal'}
              onChange={(e) => setFormData({ ...formData, waterSource: e.target.value as any })}
            >
              <option value="Municipal">Acquedotto</option>
              <option value="Consortium">Consorzio di Bonifica</option>
              <option value="Well">Pozzo</option>
              <option value="Rainwater">Raccolta Acqua Piovana</option>
              <option value="River">Fiume/Canale</option>
              <option value="Pond">Laghetto</option>
            </Select>
          </div>

          {/* Pressione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pressione Impianto (bar)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.pressureBar || ''}
              onChange={(e) => setFormData({ ...formData, pressureBar: parseFloat(e.target.value) || 0 })}
              placeholder="Es. 2.0"
            />
            {errors.pressureBar && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-3">
                <AlertCircle size={14} />
                {errors.pressureBar}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Pressione tipica acquedotto: 2-4 bar. Pozzo con pompa: 1.5-3 bar
            </p>
          </div>

          {/* Componenti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.hasTimer}
                onChange={(e) => setFormData({ ...formData, hasTimer: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">Timer/Centralina</div>
                <div className="text-xs text-gray-500">Programmazione automatica</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.hasValve}
                onChange={(e) => setFormData({ ...formData, hasValve: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">Elettrovalvole</div>
                <div className="text-xs text-gray-500">Controllo zone</div>
              </div>
            </label>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (opzionale)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Aggiungi note sul tuo impianto..."
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
            {isSubmitting ? 'Salvataggio...' : system ? 'Salva Modifiche' : 'Crea Sistema'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
