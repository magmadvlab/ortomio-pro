'use client'

import React, { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { IrrigationSystem } from '@/types/irrigation'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface IrrigationSystemWizardProps {
  gardenId: string
  onComplete: (system: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel: () => void
}

export function IrrigationSystemWizard({ gardenId, onComplete, onCancel }: IrrigationSystemWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Drip' as IrrigationSystem['type'],
    waterSource: undefined as IrrigationSystem['waterSource'],
    pressureBar: undefined as number | undefined,
    hasTimer: false,
    hasValve: false,
    notes: ''
  })

  const totalSteps = 3

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onComplete({
        gardenId,
        name: formData.name,
        type: formData.type,
        waterSource: formData.waterSource,
        pressureBar: formData.pressureBar,
        hasTimer: formData.hasTimer,
        hasValve: formData.hasValve,
        notes: formData.notes || undefined
      })
    } catch (error) {
      console.error('Error creating irrigation system:', error)
      alert('Errore durante la creazione del sistema')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return formData.name.length > 0 && formData.type
    if (step === 2) return true // Waterproof source opzionale
    if (step === 3) return true
    return false
  }

  return (
    <Dialog open={true} onClose={onCancel}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nuovo Sistema Irrigazione</h2>
              <p className="text-sm text-gray-600">Step {step} di {totalSteps}</p>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-4">
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${
                    s <= step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-6 min-h-[300px]">
            {/* Step 1: Nome e Tipo */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informazioni Base</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Sistema *
                      </label>
                      <Input
                        placeholder="es. Impianto Principale, Orto Sud..."
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo Sistema *
                      </label>
                      <Select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      >
                        <option value="Manual">💧 Manuale (tubo/annaffiatoio)</option>
                        <option value="Drip">💦 Goccia (drip irrigation)</option>
                        <option value="Sprinkler">🌧️ Irrigatori (sprinkler)</option>
                        <option value="Micro">🌊 Micro-irrigazione</option>
                        <option value="Soaker">🚿 Tubo poroso (soaker hose)</option>
                      </Select>
                      <p className="text-xs text-gray-500 mt-2">
                        {formData.type === 'Drip' && 'Ideale per risparmio idrico e irrigazione mirata'}
                        {formData.type === 'Sprinkler' && 'Copre aree ampie, consuma più acqua'}
                        {formData.type === 'Manual' && 'Massima flessibilità, richiede presenza costante'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Fonte Acqua e Pressione */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Fonte Acqua e Caratteristiche</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fonte Acqua (opzionale)
                      </label>
                      <Select
                        value={formData.waterSource || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, waterSource: e.target.value as any || undefined }))}
                      >
                        <option value="">Non specificato</option>
                        <option value="Municipal">🏙️ Acquedotto</option>
                        <option value="Consortium">🚜 Consorzio di Bonifica</option>
                        <option value="Well">🕳️ Pozzo</option>
                        <option value="Rainwater">🌧️ Raccolta Piovana</option>
                        <option value="River">🌊 Fiume/Canale</option>
                        <option value="Pond">🏞️ Laghetto</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pressione Sistema (bar, opzionale)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="es. 2.5"
                        value={formData.pressureBar || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          pressureBar: parseFloat(e.target.value) || undefined
                        }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tipicamente 1.5-3 bar per sistemi a goccia, 2-4 bar per irrigatori
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Automazione e Note */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Automazione e Note</h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="hasTimer"
                        checked={formData.hasTimer}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasTimer: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="hasTimer" className="text-sm font-medium text-gray-700">
                        Sistema con timer programmabile
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="hasValve"
                        checked={formData.hasValve}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasValve: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="hasValve" className="text-sm font-medium text-gray-700">
                        Sistema con elettrovalvole smart
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note (opzionale)
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Marca, modello, note installazione..."
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t px-6 py-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1}
            >
              <ChevronLeft size={16} className="mr-1" />
              Indietro
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={onCancel}>
                Annulla
              </Button>

              {step < totalSteps ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Avanti
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !canProceed()}>
                  {loading ? 'Creazione...' : 'Crea Sistema'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
