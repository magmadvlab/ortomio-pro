'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { GardenBed } from '@/types/gardenBed'
import { GardenRow, IrrigationLineConfig, IrrigationLineType } from '@/types'
import { X, Plus, Edit2, Trash2, AlertTriangle, CheckCircle, Layers } from 'lucide-react'

interface RowManagerModalProps {
  bed: GardenBed
  open: boolean
  onClose: () => void
}

type RowFormState = {
  name: string
  rowNumber?: number
  lengthMeters: number
  lineType: IrrigationLineType
  pipeDiameterMm?: number
  mode: 'per_meter' | 'per_emitter'
  flowRatePerMeterLph?: number
  emitterSpacingCm?: number
  emitterFlowRateLph?: number
  notes?: string
}

type BulkFormState = {
  count: number
  prefix: string
  startNumber: number
  lengthMeters: number
  lineType: IrrigationLineType
  pipeDiameterMm?: number
  mode: 'per_meter' | 'per_emitter'
  flowRatePerMeterLph?: number
  emitterSpacingCm?: number
  emitterFlowRateLph?: number
}

const isIrrigationConfigured = (cfg: IrrigationLineConfig | undefined | null): boolean => {
  if (!cfg) return false
  if (typeof cfg.flowRatePerMeterLph === 'number' && cfg.flowRatePerMeterLph > 0) return true
  if (
    typeof cfg.emitterSpacingCm === 'number' &&
    cfg.emitterSpacingCm > 0 &&
    typeof cfg.emitterFlowRateLph === 'number' &&
    cfg.emitterFlowRateLph > 0
  ) {
    return true
  }
  return false
}

const toFormState = (row?: GardenRow | null): RowFormState => {
  const lineType: IrrigationLineType = row?.irrigationLine?.lineType || 'Dripline'
  const hasPerMeter = typeof row?.irrigationLine?.flowRatePerMeterLph === 'number' && (row?.irrigationLine?.flowRatePerMeterLph || 0) > 0
  return {
    name: row?.name || '',
    rowNumber: typeof row?.rowNumber === 'number' ? row?.rowNumber : undefined,
    lengthMeters: typeof row?.lengthMeters === 'number' ? row.lengthMeters : 0,
    lineType,
    pipeDiameterMm: typeof row?.irrigationLine?.pipeDiameterMm === 'number' ? row?.irrigationLine?.pipeDiameterMm : undefined,
    mode: hasPerMeter ? 'per_meter' : 'per_emitter',
    flowRatePerMeterLph: typeof row?.irrigationLine?.flowRatePerMeterLph === 'number' ? row?.irrigationLine?.flowRatePerMeterLph : undefined,
    emitterSpacingCm: typeof row?.irrigationLine?.emitterSpacingCm === 'number' ? row?.irrigationLine?.emitterSpacingCm : undefined,
    emitterFlowRateLph: typeof row?.irrigationLine?.emitterFlowRateLph === 'number' ? row?.irrigationLine?.emitterFlowRateLph : undefined,
    notes: row?.notes || undefined,
  }
}

const validateRowForm = (f: RowFormState): string | null => {
  if (!f.name.trim()) return 'Nome filare obbligatorio'
  if (!Number.isFinite(f.lengthMeters) || f.lengthMeters <= 0) return 'Lunghezza filare deve essere > 0'

  if (f.mode === 'per_meter') {
    if (!Number.isFinite(f.flowRatePerMeterLph) || (f.flowRatePerMeterLph || 0) <= 0) {
      return 'Inserisci una portata valida (L/h per metro)'
    }
  } else {
    if (!Number.isFinite(f.emitterSpacingCm) || (f.emitterSpacingCm || 0) <= 0) {
      return 'Inserisci una distanza valida tra gocciolatori/fori (cm)'
    }
    if (!Number.isFinite(f.emitterFlowRateLph) || (f.emitterFlowRateLph || 0) <= 0) {
      return 'Inserisci una portata valida per gocciolatore/foro (L/h)'
    }
  }

  return null
}

const validateBulkForm = (f: BulkFormState): string | null => {
  if (!Number.isFinite(f.count) || f.count <= 0) return 'Numero filari non valido'
  if (!f.prefix.trim()) return 'Prefisso obbligatorio'
  if (!Number.isFinite(f.startNumber) || f.startNumber <= 0) return 'Numero iniziale non valido'
  if (!Number.isFinite(f.lengthMeters) || f.lengthMeters <= 0) return 'Lunghezza filare deve essere > 0'

  if (f.mode === 'per_meter') {
    if (!Number.isFinite(f.flowRatePerMeterLph) || (f.flowRatePerMeterLph || 0) <= 0) {
      return 'Inserisci una portata valida (L/h per metro)'
    }
  } else {
    if (!Number.isFinite(f.emitterSpacingCm) || (f.emitterSpacingCm || 0) <= 0) {
      return 'Inserisci una distanza valida tra gocciolatori/fori (cm)'
    }
    if (!Number.isFinite(f.emitterFlowRateLph) || (f.emitterFlowRateLph || 0) <= 0) {
      return 'Inserisci una portata valida per gocciolatore/foro (L/h)'
    }
  }

  return null
}

const buildIrrigationLine = (f: Pick<RowFormState, 'lineType' | 'pipeDiameterMm' | 'mode' | 'flowRatePerMeterLph' | 'emitterSpacingCm' | 'emitterFlowRateLph'>): IrrigationLineConfig => {
  if (f.mode === 'per_meter') {
    return {
      lineType: f.lineType,
      pipeDiameterMm: typeof f.pipeDiameterMm === 'number' ? f.pipeDiameterMm : null,
      flowRatePerMeterLph: typeof f.flowRatePerMeterLph === 'number' ? f.flowRatePerMeterLph : null,
      emitterSpacingCm: null,
      emitterFlowRateLph: null,
    }
  }

  return {
    lineType: f.lineType,
    pipeDiameterMm: typeof f.pipeDiameterMm === 'number' ? f.pipeDiameterMm : null,
    flowRatePerMeterLph: null,
    emitterSpacingCm: typeof f.emitterSpacingCm === 'number' ? f.emitterSpacingCm : null,
    emitterFlowRateLph: typeof f.emitterFlowRateLph === 'number' ? f.emitterFlowRateLph : null,
  }
}

export function RowManagerModal({ bed, open, onClose }: RowManagerModalProps) {
  const { storageProvider } = useStorage()
  const [rows, setRows] = useState<GardenRow[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [editing, setEditing] = useState<GardenRow | null>(null)

  const [rowForm, setRowForm] = useState<RowFormState>(() => toFormState(null))
  const [bulkForm, setBulkForm] = useState<BulkFormState>({
    count: 4,
    prefix: 'Filare',
    startNumber: 1,
    lengthMeters: 10,
    lineType: 'Dripline',
    pipeDiameterMm: 16,
    mode: 'per_emitter',
    emitterSpacingCm: 30,
    emitterFlowRateLph: 2,
    flowRatePerMeterLph: undefined,
  })

  const configuredCount = useMemo(() => rows.filter((r) => isIrrigationConfigured(r.irrigationLine)).length, [rows])

  const load = async () => {
    setLoading(true)
    try {
      const loaded = await storageProvider.getGardenRows(bed.id)
      setRows(loaded || [])
    } catch (e) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bed.id])

  const startNew = () => {
    setEditing(null)
    setRowForm(toFormState(null))
    setShowBulk(false)
    setShowForm(true)
  }

  const startEdit = (row: GardenRow) => {
    setEditing(row)
    setRowForm(toFormState(row))
    setShowBulk(false)
    setShowForm(true)
  }

  const saveRow = async () => {
    const err = validateRowForm(rowForm)
    if (err) {
      alert(err)
      return
    }

    const irrigationLine = buildIrrigationLine(rowForm)

    try {
      if (editing) {
        await storageProvider.updateGardenRow(editing.id, {
          name: rowForm.name.trim(),
          rowNumber: typeof rowForm.rowNumber === 'number' ? rowForm.rowNumber : null,
          lengthMeters: rowForm.lengthMeters,
          irrigationLine,
          notes: rowForm.notes ? rowForm.notes : null,
        })
      } else {
        await storageProvider.createGardenRow({
          gardenId: bed.gardenId,
          bedId: bed.id,
          name: rowForm.name.trim(),
          rowNumber: typeof rowForm.rowNumber === 'number' ? rowForm.rowNumber : null,
          lengthMeters: rowForm.lengthMeters,
          irrigationLine,
          notes: rowForm.notes ? rowForm.notes : null,
        })
      }

      await load()
      setShowForm(false)
      setEditing(null)
    } catch (e: any) {
      alert(e?.message || 'Errore nel salvataggio del filare')
    }
  }

  const deleteRow = async (row: GardenRow) => {
    if (!confirm(`Eliminare ${row.name}?`)) return
    try {
      await storageProvider.deleteGardenRow(row.id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Errore eliminazione filare')
    }
  }

  const saveBulk = async () => {
    const err = validateBulkForm(bulkForm)
    if (err) {
      alert(err)
      return
    }

    const irrigationLine = buildIrrigationLine(bulkForm)

    try {
      const ops = Array.from({ length: bulkForm.count }).map((_, idx) => {
        const n = bulkForm.startNumber + idx
        return storageProvider.createGardenRow({
          gardenId: bed.gardenId,
          bedId: bed.id,
          name: `${bulkForm.prefix.trim()} ${n}`,
          rowNumber: n,
          lengthMeters: bulkForm.lengthMeters,
          irrigationLine,
          notes: null,
        })
      })

      await Promise.all(ops)
      await load()
      setShowBulk(false)
    } catch (e: any) {
      alert(e?.message || 'Errore creazione filari')
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Filari • {bed.name}</h2>
              <p className="text-sm text-gray-600">Configurati: {configuredCount}/{rows.length}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setShowBulk(true)
                  setShowForm(false)
                  setEditing(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
              >
                <Layers size={18} />
                Crea Multipli
              </button>
              <button
                onClick={startNew}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Nuovo Filare
              </button>
            </div>

            {showBulk && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">Creazione multipla</h3>
                  <button onClick={() => setShowBulk(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Numero filari</label>
                    <input
                      type="number"
                      min={1}
                      value={bulkForm.count}
                      onChange={(e) => setBulkForm((p) => ({ ...p, count: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Prefisso</label>
                    <input
                      value={bulkForm.prefix}
                      onChange={(e) => setBulkForm((p) => ({ ...p, prefix: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Numero iniziale</label>
                    <input
                      type="number"
                      min={1}
                      value={bulkForm.startNumber}
                      onChange={(e) => setBulkForm((p) => ({ ...p, startNumber: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Lunghezza (m)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={bulkForm.lengthMeters}
                      onChange={(e) => setBulkForm((p) => ({ ...p, lengthMeters: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo linea</label>
                    <select
                      value={bulkForm.lineType}
                      onChange={(e) => setBulkForm((p) => ({ ...p, lineType: e.target.value as IrrigationLineType }))}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Dripline">Ala gocciolante</option>
                      <option value="PipeWithDrippers">Tubo con gocciolatori</option>
                      <option value="MicroSprinkler">Micro-sprinkler</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Diametro tubo (mm)</label>
                    <input
                      type="number"
                      min={0}
                      value={bulkForm.pipeDiameterMm || ''}
                      onChange={(e) => setBulkForm((p) => ({ ...p, pipeDiameterMm: parseFloat(e.target.value) || undefined }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Modalità portata</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkForm((p) => ({ ...p, mode: 'per_emitter' }))}
                      className={`flex-1 px-3 py-2 rounded-lg border font-semibold ${
                        bulkForm.mode === 'per_emitter' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      Per gocciolatore/foro
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkForm((p) => ({ ...p, mode: 'per_meter' }))}
                      className={`flex-1 px-3 py-2 rounded-lg border font-semibold ${
                        bulkForm.mode === 'per_meter' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      L/h per metro
                    </button>
                  </div>
                </div>

                {bulkForm.mode === 'per_meter' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Portata per metro (L/h/m)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={bulkForm.flowRatePerMeterLph || ''}
                        onChange={(e) => setBulkForm((p) => ({ ...p, flowRatePerMeterLph: parseFloat(e.target.value) || undefined }))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Distanza emettitori (cm)</label>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={bulkForm.emitterSpacingCm || ''}
                        onChange={(e) => setBulkForm((p) => ({ ...p, emitterSpacingCm: parseFloat(e.target.value) || undefined }))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Portata emettitore (L/h)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={bulkForm.emitterFlowRateLph || ''}
                        onChange={(e) => setBulkForm((p) => ({ ...p, emitterFlowRateLph: parseFloat(e.target.value) || undefined }))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setShowBulk(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={saveBulk}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Crea
                  </button>
                </div>
              </div>
            )}

            {showForm && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{editing ? 'Modifica filare' : 'Nuovo filare'}</h3>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditing(null)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nome</label>
                    <input
                      value={rowForm.name}
                      onChange={(e) => setRowForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Numero filare</label>
                    <input
                      type="number"
                      min={1}
                      value={rowForm.rowNumber ?? ''}
                      onChange={(e) =>
                        setRowForm((p) => ({
                          ...p,
                          rowNumber: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined,
                        }))
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Lunghezza (m)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={rowForm.lengthMeters}
                      onChange={(e) => setRowForm((p) => ({ ...p, lengthMeters: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo linea</label>
                    <select
                      value={rowForm.lineType}
                      onChange={(e) => setRowForm((p) => ({ ...p, lineType: e.target.value as IrrigationLineType }))}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Dripline">Ala gocciolante</option>
                      <option value="PipeWithDrippers">Tubo con gocciolatori</option>
                      <option value="MicroSprinkler">Micro-sprinkler</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Diametro tubo (mm)</label>
                    <input
                      type="number"
                      min={0}
                      value={rowForm.pipeDiameterMm || ''}
                      onChange={(e) => setRowForm((p) => ({ ...p, pipeDiameterMm: parseFloat(e.target.value) || undefined }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Note</label>
                    <input
                      value={rowForm.notes || ''}
                      onChange={(e) => setRowForm((p) => ({ ...p, notes: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Modalità portata</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRowForm((p) => ({ ...p, mode: 'per_emitter' }))}
                      className={`flex-1 px-3 py-2 rounded-lg border font-semibold ${
                        rowForm.mode === 'per_emitter' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      Per gocciolatore/foro
                    </button>
                    <button
                      type="button"
                      onClick={() => setRowForm((p) => ({ ...p, mode: 'per_meter' }))}
                      className={`flex-1 px-3 py-2 rounded-lg border font-semibold ${
                        rowForm.mode === 'per_meter' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      L/h per metro
                    </button>
                  </div>
                </div>

                {rowForm.mode === 'per_meter' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Portata per metro (L/h/m)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={rowForm.flowRatePerMeterLph || ''}
                        onChange={(e) => setRowForm((p) => ({ ...p, flowRatePerMeterLph: parseFloat(e.target.value) || undefined }))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Distanza emettitori (cm)</label>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={rowForm.emitterSpacingCm || ''}
                        onChange={(e) => setRowForm((p) => ({ ...p, emitterSpacingCm: parseFloat(e.target.value) || undefined }))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Portata emettitore (L/h)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={rowForm.emitterFlowRateLph || ''}
                        onChange={(e) => setRowForm((p) => ({ ...p, emitterFlowRateLph: parseFloat(e.target.value) || undefined }))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditing(null)
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={saveRow}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                  >
                    Salva
                  </button>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Elenco filari</h3>
                {rows.length === 0 ? (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-600" />
                    Nessun filare creato
                  </div>
                ) : (
                  <div className={`text-sm font-semibold flex items-center gap-2 ${configuredCount === rows.length ? 'text-green-700' : 'text-yellow-700'}`}>
                    {configuredCount === rows.length ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {configuredCount}/{rows.length} configurati
                  </div>
                )}
              </div>

              {loading ? (
                <div className="p-6 text-gray-600">Caricamento...</div>
              ) : rows.length === 0 ? (
                <div className="p-6 text-gray-600">Crea il primo filare per iniziare.</div>
              ) : (
                <div className="divide-y">
                  {rows.map((r) => {
                    const ok = isIrrigationConfigured(r.irrigationLine)
                    return (
                      <div key={r.id} className="p-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-semibold text-gray-900">{r.name}</div>
                            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${ok ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                              {ok ? 'Irrigazione configurata' : 'Config mancante'}
                            </span>
                            <span className="text-xs text-gray-600">{r.lengthMeters} m</span>
                            {typeof r.rowNumber === 'number' && (
                              <span className="text-xs text-gray-600">N° {r.rowNumber}</span>
                            )}
                          </div>
                          {!ok && (
                            <div className="mt-2 text-xs text-yellow-800 flex items-center gap-1">
                              <AlertTriangle size={14} />
                              Configura passo/portata oppure portata per metro.
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(r)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Modifica"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteRow(r)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Elimina"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
