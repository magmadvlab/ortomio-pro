'use client'

import React, { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { IrrigationZone, WateringLog } from '@/types/irrigation'
import { X } from 'lucide-react'

interface WateringLogFormProps {
  zones: IrrigationZone[]
  preselectedZone?: IrrigationZone
  onSubmit: (log: Omit<WateringLog, 'id' | 'createdAt'>) => Promise<void>
  onCancel: () => void
}

export function WateringLogForm({ zones, preselectedZone, onSubmit, onCancel }: WateringLogFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    zoneId: preselectedZone?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    durationMinutes: 30,
    litersApplied: 0,
    method: 'Manual' as const,
    weatherCondition: '',
    soilMoistureBefore: undefined as number | undefined,
    soilMoistureAfter: undefined as number | undefined,
    airTemperatureC: undefined as number | undefined,
    notes: ''
  })

  const selectedZone = zones.find(z => z.id === formData.zoneId)

  // Auto-calcola litri se zona ha flow rate e durata è impostata
  const autoCalculateLiters = () => {
    if (selectedZone && selectedZone.flowRateLph && formData.durationMinutes) {
      const liters = (selectedZone.flowRateLph * formData.durationMinutes) / 60
      setFormData(prev => ({ ...prev, litersApplied: Math.round(liters * 10) / 10 }))
    }
  }

  React.useEffect(() => {
    autoCalculateLiters()
  }, [formData.zoneId, formData.durationMinutes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.zoneId) return

    setLoading(true)
    try {
      const zone = zones.find(z => z.id === formData.zoneId)
      if (!zone) return

      const wateredAt = `${formData.date}T${formData.time}:00`

      await onSubmit({
        zoneId: formData.zoneId,
        gardenId: zone.gardenId,
        wateredAt,
        date: formData.date,
        durationMinutes: formData.durationMinutes,
        litersApplied: formData.litersApplied,
        method: formData.method,
        weatherCondition: formData.weatherCondition || undefined,
        soilMoistureBefore: formData.soilMoistureBefore,
        soilMoistureAfter: formData.soilMoistureAfter,
        airTemperatureC: formData.airTemperatureC,
        notes: formData.notes || undefined,
        completed: true
      })
    } catch (error) {
      console.error('Error saving watering log:', error)
      alert('Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onClose={onCancel}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Registra Irrigazione</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Zona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona Irrigua *
              </label>
              <Select
                value={formData.zoneId}
                onChange={(e) => setFormData(prev => ({ ...prev, zoneId: e.target.value }))}
                required
                disabled={!!preselectedZone}
              >
                <option value="">Seleziona zona...</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.areaSqm} m² - {zone.method})
                  </option>
                ))}
              </Select>
            </div>

            {/* Data e Ora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ora *
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Durata e Litri */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durata (minuti) *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
                  required
                />
                {selectedZone && (
                  <p className="text-xs text-gray-500 mt-1">
                    Portata zona: {selectedZone.flowRateLph} L/h
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Litri applicati *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.litersApplied}
                  onChange={(e) => setFormData(prev => ({ ...prev, litersApplied: parseFloat(e.target.value) || 0 }))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calcolato da durata
                </p>
              </div>
            </div>

            {/* Metodo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodo
              </label>
              <Select
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
              >
                <option value="Manual">Manuale</option>
                <option value="Automatic">Automatico</option>
                <option value="Timer">Timer</option>
              </Select>
            </div>

            {/* Condizioni Meteo (opzionale) */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Condizioni (opzionale)</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meteo
                  </label>
                  <Select
                    value={formData.weatherCondition}
                    onChange={(e) => setFormData(prev => ({ ...prev, weatherCondition: e.target.value }))}
                  >
                    <option value="">Non specificato</option>
                    <option value="Sunny">Soleggiato</option>
                    <option value="Cloudy">Nuvoloso</option>
                    <option value="Rainy">Piovoso</option>
                    <option value="Windy">Ventoso</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura °C
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="es. 25.5"
                    value={formData.airTemperatureC || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, airTemperatureC: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Umidità suolo prima (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="es. 30"
                    value={formData.soilMoistureBefore || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, soilMoistureBefore: parseInt(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Umidità suolo dopo (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="es. 80"
                    value={formData.soilMoistureAfter || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, soilMoistureAfter: parseInt(e.target.value) || undefined }))}
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Eventuali osservazioni..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Annulla
              </Button>
              <Button type="submit" disabled={loading || !formData.zoneId}>
                {loading ? 'Salvataggio...' : 'Salva Irrigazione'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
