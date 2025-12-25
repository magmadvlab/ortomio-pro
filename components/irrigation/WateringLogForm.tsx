'use client'

import React, { useMemo, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { IrrigationZone, WateringLog } from '@/types/irrigation'
import { GardenBed } from '@/types/gardenBed'
import { GardenRow } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { X } from 'lucide-react'

interface WateringLogFormProps {
  zones: IrrigationZone[]
  preselectedZone?: IrrigationZone
  onSubmit: (log: Omit<WateringLog, 'id' | 'createdAt'>) => Promise<void>
  onSubmitBatch?: (logs: Array<Omit<WateringLog, 'id' | 'createdAt'>>) => Promise<void>
  onCancel: () => void
}

export function WateringLogForm({ zones, preselectedZone, onSubmit, onSubmitBatch, onCancel }: WateringLogFormProps) {
  const { storageProvider } = useStorage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    zoneId: preselectedZone?.id || '',
    bedId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    litersPerRow: 10,
    method: 'Manual' as const,
    weatherCondition: '',
    soilMoistureBefore: undefined as number | undefined,
    soilMoistureAfter: undefined as number | undefined,
    airTemperatureC: undefined as number | undefined,
    notes: ''
  })

  const [bedOptions, setBedOptions] = useState<GardenBed[]>([])
  const [rowOptions, setRowOptions] = useState<GardenRow[]>([])
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const selectedZone = zones.find(z => z.id === formData.zoneId)

  React.useEffect(() => {
    const loadBedsAndReset = async () => {
      setBedOptions([])
      setRowOptions([])
      setSelectedRowIds([])
      setFormData((prev) => ({ ...prev, bedId: '' }))

      if (!selectedZone) return
      if (!Array.isArray(selectedZone.bedIds) || selectedZone.bedIds.length === 0) return

      try {
        const beds = (await Promise.all(selectedZone.bedIds.map((id) => storageProvider.getGardenBed(id))))
          .filter((b): b is GardenBed => Boolean(b))
        setBedOptions(beds)
        if (beds.length === 1) {
          setFormData((prev) => ({ ...prev, bedId: beds[0].id }))
        }
      } catch {
        setBedOptions([])
      }
    }

    void loadBedsAndReset()
  }, [formData.zoneId, selectedZone, storageProvider])

  React.useEffect(() => {
    const loadRows = async () => {
      setRowOptions([])
      setSelectedRowIds([])
      if (!formData.bedId) return
      try {
        const rows = await storageProvider.getGardenRows(formData.bedId)
        setRowOptions(rows || [])
      } catch {
        setRowOptions([])
      }
    }

    void loadRows()
  }, [formData.bedId, storageProvider])

  const isRowConfigured = (row: GardenRow): boolean => {
    const line = row.irrigationLine
    if (!line) return false
    if (typeof line.flowRatePerMeterLph === 'number' && line.flowRatePerMeterLph > 0) return true
    if (
      typeof line.emitterSpacingCm === 'number' &&
      line.emitterSpacingCm > 0 &&
      typeof line.emitterFlowRateLph === 'number' &&
      line.emitterFlowRateLph > 0
    ) {
      return true
    }
    return false
  }

  const calcMinutesForRow = (row: GardenRow, litersPerRow: number): number | null => {
    if (!isRowConfigured(row)) return null
    if (!Number.isFinite(litersPerRow) || litersPerRow <= 0) return null
    if (!Number.isFinite(row.lengthMeters) || row.lengthMeters <= 0) return null

    const line = row.irrigationLine
    let flowRowLph = 0
    if (typeof line.flowRatePerMeterLph === 'number' && line.flowRatePerMeterLph > 0) {
      flowRowLph = row.lengthMeters * line.flowRatePerMeterLph
    } else if (
      typeof line.emitterSpacingCm === 'number' &&
      line.emitterSpacingCm > 0 &&
      typeof line.emitterFlowRateLph === 'number' &&
      line.emitterFlowRateLph > 0
    ) {
      const spacingMeters = line.emitterSpacingCm / 100
      const emitters = row.lengthMeters / spacingMeters
      flowRowLph = emitters * line.emitterFlowRateLph
    }

    if (!Number.isFinite(flowRowLph) || flowRowLph <= 0) return null
    const minutes = (litersPerRow / flowRowLph) * 60
    if (!Number.isFinite(minutes) || minutes <= 0) return null
    return Math.max(1, Math.round(minutes))
  }

  const selectedRows = useMemo(() => {
    const map = new Map(rowOptions.map((r) => [r.id, r]))
    return selectedRowIds.map((id) => map.get(id)).filter((r): r is GardenRow => Boolean(r))
  }, [rowOptions, selectedRowIds])

  const minutesByRowId = useMemo(() => {
    const litersPerRow = formData.litersPerRow
    const out: Record<string, number> = {}
    for (const row of selectedRows) {
      const m = calcMinutesForRow(row, litersPerRow)
      if (typeof m === 'number') out[row.id] = m
    }
    return out
  }, [formData.litersPerRow, selectedRows])

  const hasAnyRowMissingConfig = useMemo(() => {
    if (selectedRows.length === 0) return false
    return selectedRows.some((r) => !isRowConfigured(r) || typeof minutesByRowId[r.id] !== 'number')
  }, [minutesByRowId, selectedRows])

  const durationSummary = useMemo(() => {
    const values = Object.values(minutesByRowId)
    if (values.length === 0) return null
    const min = Math.min(...values)
    const max = Math.max(...values)
    return { min, max }
  }, [minutesByRowId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.zoneId) return

    // Row-level logging: require bed + at least one row if the zone is linked to beds.
    if (selectedZone?.bedIds?.length) {
      if (!formData.bedId) {
        alert('Seleziona il letto servito dalla zona.')
        return
      }
      if (selectedRowIds.length === 0) {
        alert('Seleziona almeno un filare.')
        return
      }
      if (hasAnyRowMissingConfig) {
        alert('Alcuni filari non hanno configurazione irrigua completa. Apri Gestione Filari e completa passo/portata.')
        return
      }
    }

    setLoading(true)
    try {
      const zone = zones.find(z => z.id === formData.zoneId)
      if (!zone) return

      const wateredAt = `${formData.date}T${formData.time}:00`

      // If no rows selected (zone not linked to beds), fallback to single log.
      if (!selectedZone?.bedIds?.length || selectedRowIds.length === 0) {
        await onSubmit({
          zoneId: formData.zoneId,
          gardenId: zone.gardenId,
          wateredAt,
          date: formData.date,
          durationMinutes: 0,
          litersApplied: 0,
          method: formData.method,
          weatherCondition: formData.weatherCondition || undefined,
          soilMoistureBefore: formData.soilMoistureBefore,
          soilMoistureAfter: formData.soilMoistureAfter,
          airTemperatureC: formData.airTemperatureC,
          notes: formData.notes || undefined,
          completed: true
        })
      } else {
        const logsToCreate = selectedRows.map((row) => {
          const minutes = minutesByRowId[row.id]
          return {
            zoneId: formData.zoneId,
            gardenId: zone.gardenId,
            bedId: formData.bedId,
            rowId: row.id,
            wateredAt,
            date: formData.date,
            durationMinutes: minutes,
            litersApplied: formData.litersPerRow,
            method: formData.method,
            weatherCondition: formData.weatherCondition || undefined,
            soilMoistureBefore: formData.soilMoistureBefore,
            soilMoistureAfter: formData.soilMoistureAfter,
            airTemperatureC: formData.airTemperatureC,
            notes: formData.notes || undefined,
            completed: true
          }
        })

        if (onSubmitBatch) {
          await onSubmitBatch(logsToCreate)
        } else {
          // Fallback (should not happen in irrigation page): sequential submit
          for (const l of logsToCreate) {
            await onSubmit(l)
          }
        }
      }
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

            {/* Bed + Filari (se la zona è collegata a letti) */}
            {selectedZone?.bedIds?.length ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Letto servito *
                  </label>
                  <Select
                    value={formData.bedId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bedId: e.target.value }))}
                    required
                  >
                    <option value="">Seleziona letto...</option>
                    {bedOptions.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                  {bedOptions.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">Nessun letto associato trovato per questa zona.</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Filari *
                    </label>
                    {rowOptions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedRowIds.length === rowOptions.length) {
                            setSelectedRowIds([])
                          } else {
                            setSelectedRowIds(rowOptions.map((r) => r.id))
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        {selectedRowIds.length === rowOptions.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
                      </button>
                    )}
                  </div>

                  {rowOptions.length === 0 ? (
                    <div className="p-3 border border-gray-200 rounded-lg text-sm text-gray-600">
                      Nessun filare trovato per questo letto. Apri “Gestione Filari” dal Bed Manager.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                      {rowOptions.map((r) => {
                        const checked = selectedRowIds.includes(r.id)
                        const ok = isRowConfigured(r)
                        return (
                          <label key={r.id} className="flex items-center justify-between gap-3 p-3 cursor-pointer hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRowIds((prev) => Array.from(new Set([...prev, r.id])))
                                  } else {
                                    setSelectedRowIds((prev) => prev.filter((id) => id !== r.id))
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                                <div className="text-xs text-gray-500">{r.lengthMeters} m</div>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${ok ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                              {ok ? 'OK' : 'Config mancante'}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : null}

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

            {/* Litri per filare + riepilogo durata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Litri per filare *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.litersPerRow}
                  onChange={(e) => setFormData(prev => ({ ...prev, litersPerRow: parseFloat(e.target.value) || 0 }))}
                  required
                />
                {selectedRowIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Totale: {(formData.litersPerRow * selectedRowIds.length).toFixed(1)} L
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durata stimata (min)
                </label>
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800">
                  {selectedRowIds.length === 0 ? (
                    <span className="text-gray-500">Seleziona filari per calcolare</span>
                  ) : hasAnyRowMissingConfig ? (
                    <span className="text-yellow-800">Config mancante su uno o più filari</span>
                  ) : durationSummary ? (
                    durationSummary.min === durationSummary.max ? (
                      <span>{durationSummary.min} min</span>
                    ) : (
                      <span>{durationSummary.min}–{durationSummary.max} min</span>
                    )
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Calcolato dalla configurazione del filare (passo/portata o L/h per metro)
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
              <Button
                type="submit"
                disabled={
                  loading ||
                  !formData.zoneId ||
                  (selectedZone?.bedIds?.length ? (!formData.bedId || selectedRowIds.length === 0 || hasAnyRowMissingConfig) : false)
                }
              >
                {loading ? 'Salvataggio...' : 'Salva Irrigazione'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
