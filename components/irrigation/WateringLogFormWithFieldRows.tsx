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
import { X, Calculator, Info } from 'lucide-react'
import { irrigationCalculatorService, ManualIrrigationSystem } from '@/services/irrigationCalculatorService'

interface WateringLogFormProps {
  zones: IrrigationZone[]
  preselectedZone?: IrrigationZone
  fieldRows?: any[] // Field rows del garden per irrigazione diretta
  onSubmit: (log: Omit<WateringLog, 'id' | 'createdAt'>) => Promise<void>
  onSubmitBatch?: (logs: Array<Omit<WateringLog, 'id' | 'createdAt'>>) => Promise<void>
  onCancel: () => void
}

export function WateringLogFormWithFieldRows({ zones, preselectedZone, fieldRows = [], onSubmit, onSubmitBatch, onCancel }: WateringLogFormProps) {
  const { storageProvider } = useStorage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    zoneId: preselectedZone?.id || '',
    bedId: '',
    fieldRowId: '', // Nuovo: per field rows
    irrigationType: 'zone' as 'zone' | 'field', // Nuovo: tipo irrigazione
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    litersPerRow: 10,
    method: 'Manual' as const,
    weatherCondition: '',
    soilMoistureBefore: undefined as number | undefined,
    soilMoistureAfter: undefined as number | undefined,
    airTemperatureC: undefined as number | undefined,
    notes: '',
    // Parametri sistema manuale
    manualSystemType: 'drip' as 'drip' | 'sprinkler' | 'hose' | 'furrow',
    useManualCalculation: false,
    // Goccia
    dripperFlowRateLph: undefined as number | undefined,
    dripperCount: undefined as number | undefined,
    dripperSpacingCm: undefined as number | undefined,
    // Sprinkler
    sprinklerFlowRateLph: undefined as number | undefined,
    sprinklerCount: undefined as number | undefined,
    sprinklerEfficiency: 75,
    // Tubo
    hoseFlowRateLpm: undefined as number | undefined,
    hoseDiameterMm: undefined as number | undefined,
    pressureBar: undefined as number | undefined,
    // Solco
    furrowLengthM: undefined as number | undefined,
    furrowWidthCm: undefined as number | undefined,
    infiltrationRateMmh: undefined as number | undefined
  })

  const [bedOptions, setBedOptions] = useState<GardenBed[]>([])
  const [rowOptions, setRowOptions] = useState<GardenRow[]>([])
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [selectedFieldRowIds, setSelectedFieldRowIds] = useState<string[]>([]) // Nuovo: per field rows
  const [showManualCalculator, setShowManualCalculator] = useState(false)
  const [calculationResult, setCalculationResult] = useState<any>(null)

  const selectedZone = zones.find(z => z.id === formData.zoneId)

  // Calcolo automatico volume/durata per sistemi manuali
  const handleCalculateManual = () => {
    const system: ManualIrrigationSystem = {
      type: formData.manualSystemType,
      pressureBar: formData.pressureBar,
      dripperFlowRateLph: formData.dripperFlowRateLph,
      dripperCount: formData.dripperCount,
      dripperSpacingCm: formData.dripperSpacingCm,
      rowLengthM: selectedRows[0]?.lengthMeters,
      sprinklerFlowRateLph: formData.sprinklerFlowRateLph,
      sprinklerCount: formData.sprinklerCount,
      sprinklerEfficiency: formData.sprinklerEfficiency,
      hoseDiameterMm: formData.hoseDiameterMm,
      hoseFlowRateLpm: formData.hoseFlowRateLpm,
      furrowLengthM: formData.furrowLengthM,
      furrowWidthCm: formData.furrowWidthCm,
      infiltrationRateMmh: formData.infiltrationRateMmh
    }

    const result = irrigationCalculatorService.calculate(system, formData.litersPerRow)
    setCalculationResult(result)
  }

  // Ricalcola automaticamente quando cambiano i parametri
  React.useEffect(() => {
    if (formData.useManualCalculation) {
      handleCalculateManual()
    }
  }, [
    formData.useManualCalculation,
    formData.manualSystemType,
    formData.litersPerRow,
    formData.dripperFlowRateLph,
    formData.dripperCount,
    formData.dripperSpacingCm,
    formData.sprinklerFlowRateLph,
    formData.sprinklerCount,
    formData.sprinklerEfficiency,
    formData.hoseFlowRateLpm,
    formData.hoseDiameterMm,
    formData.pressureBar,
    formData.furrowLengthM,
    formData.furrowWidthCm,
    formData.infiltrationRateMmh,
    selectedRows
  ])

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

  const selectedFieldRows = useMemo(() => {
    const map = new Map(fieldRows.map((r) => [r.id, r]))
    return selectedFieldRowIds.map((id) => map.get(id)).filter((r) => Boolean(r))
  }, [fieldRows, selectedFieldRowIds])

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

    if (formData.irrigationType === 'zone') {
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
    } else if (formData.irrigationType === 'field') {
      if (selectedFieldRowIds.length === 0) {
        alert('Seleziona almeno un filare di campo aperto.')
        return
      }
    }

    setLoading(true)
    try {
      const wateredAt = `${formData.date}T${formData.time}:00`

      if (formData.irrigationType === 'field') {
        // Irrigazione diretta field rows
        const logsToCreate = selectedFieldRows.map((row) => {
          // Usa durata calcolata se disponibile, altrimenti default
          const duration = calculationResult?.durationMinutes || 30
          
          return {
            zoneId: '', // Non collegato a zona
            gardenId: row.gardenId || '',
            fieldRowId: row.id, // Nuovo campo per field rows
            wateredAt,
            date: formData.date,
            durationMinutes: duration,
            litersApplied: formData.litersPerRow,
            method: formData.method,
            weatherCondition: formData.weatherCondition || undefined,
            soilMoistureBefore: formData.soilMoistureBefore,
            soilMoistureAfter: formData.soilMoistureAfter,
            airTemperatureC: formData.airTemperatureC,
            notes: formData.notes || undefined,
            completed: true,
            // Salva parametri sistema per riferimento futuro
            systemType: formData.useManualCalculation ? formData.manualSystemType : undefined,
            flowRateLph: calculationResult?.estimatedFlowRateLph,
            calculationMethod: calculationResult?.method,
            calculationConfidence: calculationResult?.confidence
          }
        })

        if (onSubmitBatch) {
          await onSubmitBatch(logsToCreate)
        } else {
          for (const l of logsToCreate) {
            await onSubmit(l)
          }
        }
      } else {
        // Irrigazione per zone (logica esistente)
        const zone = zones.find(z => z.id === formData.zoneId)
        if (!zone) return

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
            for (const l of logsToCreate) {
              await onSubmit(l)
            }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Registra Irrigazione</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tipo Irrigazione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Irrigazione *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="irrigationType"
                    value="zone"
                    checked={formData.irrigationType === 'zone'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ 
                      ...prev, 
                      irrigationType: e.target.value as 'zone' | 'field',
                      zoneId: '',
                      bedId: '',
                      fieldRowId: ''
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Zone Irrigue</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="irrigationType"
                    value="field"
                    checked={formData.irrigationType === 'field'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ 
                      ...prev, 
                      irrigationType: e.target.value as 'zone' | 'field',
                      zoneId: '',
                      bedId: '',
                      fieldRowId: ''
                    }))}
                    className="mr-2"
                    disabled={!fieldRows || fieldRows.length === 0}
                  />
                  <span className="text-sm">Filari Campo Aperto</span>
                  {(!fieldRows || fieldRows.length === 0) && (
                    <span className="text-xs text-gray-500 ml-2">(non disponibili)</span>
                  )}
                </label>
              </div>
            </div>

            {/* Irrigazione per Zone */}
            {formData.irrigationType === 'zone' && (
              <>
                {/* Zona */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Irrigua *
                  </label>
                  <Select
                    value={formData.zoneId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, zoneId: e.target.value }))}
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
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData((prev) => ({ ...prev, bedId: e.target.value }))}
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
                          Nessun filare trovato per questo letto. Apri "Gestione Filari" dal Bed Manager.
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
              </>
            )}

            {/* Irrigazione per Field Rows */}
            {formData.irrigationType === 'field' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Filari Campo Aperto *
                  </label>
                  {fieldRows && fieldRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedFieldRowIds.length === fieldRows.length) {
                          setSelectedFieldRowIds([])
                        } else {
                          setSelectedFieldRowIds(fieldRows.map((r) => r.id))
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      {selectedFieldRowIds.length === fieldRows.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
                    </button>
                  )}
                </div>

                {!fieldRows || fieldRows.length === 0 ? (
                  <div className="p-3 border border-gray-200 rounded-lg text-sm text-gray-600">
                    Nessun filare di campo aperto trovato. Vai in Gestione Garden per creare filari.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                    {fieldRows.map((r) => {
                      const checked = selectedFieldRowIds.includes(r.id)
                      return (
                        <label key={r.id} className="flex items-center justify-between gap-3 p-3 cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (e.target.checked) {
                                  setSelectedFieldRowIds((prev) => Array.from(new Set([...prev, r.id])))
                                } else {
                                  setSelectedFieldRowIds((prev) => prev.filter((id) => id !== r.id))
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                              <div className="text-xs text-gray-500">
                                {r.lengthMeters}m • {r.cropName || 'Nessuna coltura'}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-100 text-blue-700">
                            Campo Aperto
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Data e Ora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, date: e.target.value }))}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Litri per filare + riepilogo durata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Litri per filare *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.litersPerRow}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, litersPerRow: parseFloat(e.target.value) || 0 }))}
                  required
                />
                {(selectedRowIds.length > 0 || selectedFieldRowIds.length > 0) && (
                  <p className="text-xs text-gray-500 mt-1">
                    Totale: {(formData.litersPerRow * (selectedRowIds.length + selectedFieldRowIds.length)).toFixed(1)} L
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durata stimata (min)
                </label>
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-800">
                  {formData.irrigationType === 'field' ? (
                    selectedFieldRowIds.length === 0 ? (
                      <span className="text-gray-500">Seleziona filari per calcolare</span>
                    ) : calculationResult ? (
                      <span className="font-semibold text-green-700">{calculationResult.durationMinutes} min</span>
                    ) : (
                      <span>~30 min per filare</span>
                    )
                  ) : selectedRowIds.length === 0 ? (
                    <span className="text-gray-500">Seleziona filari per calcolare</span>
                  ) : hasAnyRowMissingConfig ? (
                    <span className="text-yellow-full max-w-sm">Config mancante su uno o più filari</span>
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
                  {formData.irrigationType === 'field' 
                    ? calculationResult ? calculationResult.method : 'Stima per filari campo aperto'
                    : 'Calcolato dalla configurazione del filare (passo/portata o L/h per metro)'
                  }
                </p>
              </div>
            </div>

            {/* Calcolatore Automatico Volumi */}
            {formData.irrigationType === 'field' && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Calcolo Automatico Volume/Durata</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualCalculator(!showManualCalculator)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {showManualCalculator ? 'Nascondi' : 'Configura'}
                  </button>
                </div>

                {showManualCalculator && (
                  <div className="space-y-4 mt-4">
                    {/* Tipo Sistema */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo Sistema Irrigazione
                      </label>
                      <Select
                        value={formData.manualSystemType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, manualSystemType: e.target.value as any }))}
                      >
                        <option value="drip">Goccia</option>
                        <option value="sprinkler">Sprinkler</option>
                        <option value="hose">Tubo/Manichetta</option>
                        <option value="furrow">Solco</option>
                      </Select>
                    </div>

                    {/* Parametri Goccia */}
                    {formData.manualSystemType === 'drip' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Portata gocciolatore (L/h)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="es. 2"
                            value={formData.dripperFlowRateLph || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, dripperFlowRateLph: parseFloat(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Numero gocciolatori
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="es. 20"
                            value={formData.dripperCount || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, dripperCount: parseInt(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Passo gocciolatori (cm)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="es. 30"
                            value={formData.dripperSpacingCm || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, dripperSpacingCm: parseInt(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                      </div>
                    )}

                    {/* Parametri Sprinkler */}
                    {formData.manualSystemType === 'sprinkler' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Portata ugello (L/h)
                          </label>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="es. 100"
                            value={formData.sprinklerFlowRateLph || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, sprinklerFlowRateLph: parseFloat(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Numero ugelli
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="es. 4"
                            value={formData.sprinklerCount || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, sprinklerCount: parseInt(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Efficienza (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="75"
                            value={formData.sprinklerEfficiency}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, sprinklerEfficiency: parseInt(e.target.value) || 75, useManualCalculation: true }))}
                          />
                        </div>
                      </div>
                    )}

                    {/* Parametri Tubo */}
                    {formData.manualSystemType === 'hose' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Portata misurata (L/min)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="es. 15"
                            value={formData.hoseFlowRateLpm || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, hoseFlowRateLpm: parseFloat(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                          <p className="text-xs text-gray-500 mt-1">💡 Riempi secchio 10L e cronometra</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Diametro tubo (mm)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="es. 19"
                            value={formData.hoseDiameterMm || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, hoseDiameterMm: parseInt(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pressione (bar)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="es. 3"
                            value={formData.pressureBar || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, pressureBar: parseFloat(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                      </div>
                    )}

                    {/* Parametri Solco */}
                    {formData.manualSystemType === 'furrow' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Lunghezza solco (m)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="es. 10"
                            value={formData.furrowLengthM || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, furrowLengthM: parseFloat(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Larghezza solco (cm)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="es. 30"
                            value={formData.furrowWidthCm || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, furrowWidthCm: parseInt(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Infiltrazione (mm/h)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="es. 20"
                            value={formData.infiltrationRateMmh || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, infiltrationRateMmh: parseInt(e.target.value) || undefined, useManualCalculation: true }))}
                          />
                        </div>
                      </div>
                    )}

                    {/* Risultato Calcolo */}
                    {calculationResult && (
                      <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              Calcolo: {calculationResult.method}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mb-2">
                              <div>
                                <span className="font-medium">Portata:</span> {calculationResult.estimatedFlowRateLph.toFixed(1)} L/h
                              </div>
                              <div>
                                <span className="font-medium">Durata:</span> {calculationResult.durationMinutes} min
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              <span className="text-xs font-medium">Affidabilità:</span>
                              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                calculationResult.confidence === 'high' ? 'bg-green-100 text-green-700' :
                                calculationResult.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {calculationResult.confidence === 'high' ? 'Alta' :
                                 calculationResult.confidence === 'medium' ? 'Media' : 'Bassa'}
                              </span>
                            </div>
                            {calculationResult.notes && calculationResult.notes.length > 0 && (
                              <ul className="text-xs text-gray-600 space-y-1">
                                {calculationResult.notes.map((note: string, idx: number) => (
                                  <li key={idx}>• {note}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Metodo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodo
              </label>
              <Select
                value={formData.method}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
              >
                <option value="Manual">Manuale</option>
                <option value="Automatic">Automatico</option>
                <option value="Timer">Timer</option>
              </Select>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Eventuali osservazioni..."
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                  (formData.irrigationType === 'zone' && (
                    !formData.zoneId ||
                    (selectedZone?.bedIds?.length ? (!formData.bedId || selectedRowIds.length === 0 || hasAnyRowMissingConfig) : false)
                  )) ||
                  (formData.irrigationType === 'field' && selectedFieldRowIds.length === 0)
                }
              >
                {loading ? 'Salvataggio...' : 'Salva Irrigazione'}
              </Button>
            </div>
        </form>
      </div>
    </div>
  )
}