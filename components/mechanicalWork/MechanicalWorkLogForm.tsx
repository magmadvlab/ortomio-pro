'use client'

import React, { useState, useEffect } from 'react'
import { Tractor, Calendar, MapPin, Clock, Euro, User, CloudRain, Layers } from 'lucide-react'
import { Garden, GardenBed, GardenRow } from '@/types'
import { WorkType, EquipmentType } from '@/logic/mechanicalWorkEngine'
import { MechanicalWorkLog } from '@/services/mechanicalWorkService'
import { useStorage } from '@/packages/core/hooks/useStorage'

interface MechanicalWorkLogFormProps {
  garden: Garden
  onSubmit: (log: MechanicalWorkLog) => Promise<void>
  onCancel: () => void
  initialData?: Partial<MechanicalWorkLog>
}

export function MechanicalWorkLogForm({
  garden,
  onSubmit,
  onCancel,
  initialData
}: MechanicalWorkLogFormProps) {
  const { storageProvider } = useStorage()
  const [formData, setFormData] = useState<Partial<MechanicalWorkLog>>({
    gardenId: garden.id,
    workDate: new Date().toISOString().split('T')[0],
    completed: true,
    ...initialData
  })

  const [loading, setLoading] = useState(false)
  const [beds, setBeds] = useState<GardenBed[]>([])
  const [rows, setRows] = useState<GardenRow[]>([])
  const [selectedBeds, setSelectedBeds] = useState<string[]>(initialData?.bedIds || [])
  const [selectedRows, setSelectedRows] = useState<string[]>(initialData?.rowIds || [])

  // Carica aiuole e file dal giardino
  useEffect(() => {
    loadGardenStructure()
  }, [garden.id])

  const loadGardenStructure = async () => {
    try {
      // Carica aiuole (beds)
      const gardenBeds = await storageProvider.getGardenBeds(garden.id)
      setBeds(gardenBeds || [])

      // Carica file (rows) - se ci sono aiuole, carica le loro file
      if (gardenBeds && gardenBeds.length > 0) {
        const allRows: GardenRow[] = []
        for (const bed of gardenBeds) {
          const bedRows = await storageProvider.getGardenRows(bed.id)
          if (bedRows) {
            allRows.push(...bedRows)
          }
        }
        setRows(allRows)
      }
    } catch (error) {
      console.error('Error loading garden structure:', error)
    }
  }

  const workTypes: { value: WorkType; label: string }[] = [
    // Suolo
    { value: 'Plowing', label: 'Aratura' },
    { value: 'Subsoiling', label: 'Ripuntatura' },
    { value: 'Harrowing', label: 'Erpicatura' },
    { value: 'Tilling', label: 'Fresatura' },
    { value: 'Rolling', label: 'Rullatura' },
    { value: 'Hoeing', label: 'Sarchiatura / Zappatura' },
    { value: 'EarthingUp', label: 'Rincalzatura' },
    { value: 'Mulching', label: 'Pacciamatura' },
    { value: 'Digging', label: 'Vangatura' },
    { value: 'Crumbling', label: 'Frangizollatura' },
    { value: 'Leveling', label: 'Livellamento' },
    // Potature
    { value: 'FormativePruning', label: 'Potatura di Formazione' },
    { value: 'MaintenancePruning', label: 'Potatura di Mantenimento' },
    { value: 'RejuvenationPruning', label: 'Potatura di Ringiovanimento' },
    { value: 'SummerPruning', label: 'Potatura Verde' },
    { value: 'WinterPruning', label: 'Potatura Invernale' },
    // Generale
    { value: 'Thinning', label: 'Diradamento' },
    { value: 'Suckering', label: 'Scacchiatura' },
    { value: 'Defoliation', label: 'Defogliazione' },
    { value: 'Tying', label: 'Legatura' }
  ]

  const equipmentTypes: { value: EquipmentType; label: string }[] = [
    // Trattore
    { value: 'Tractor', label: 'Trattore' },
    { value: 'RotaryHarrow', label: 'Erpice Rotativo' },
    { value: 'Shredder', label: 'Trincia' },
    // Piccoli mezzi
    { value: 'Rototiller', label: 'Motozappa / Motocoltivatore' },
    { value: 'Cultivator', label: 'Cultivatore' },
    { value: 'Mower', label: 'Tosaerba / Falciatrice' },
    { value: 'BrushCutter', label: 'Decespugliatore' },
    // Elettrificati
    { value: 'ElectricPruner', label: 'Forbici Elettriche' },
    { value: 'TelescopicPruner', label: 'Potatore Telescopico' },
    // Manuale
    { value: 'Manual', label: 'Manuale (Zappa, Vanga, Rastrello)' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.workType || !formData.equipmentType || !formData.workDate) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData as MechanicalWorkLog)
    } catch (error) {
      console.error('Error submitting mechanical work log:', error)
      alert('Errore nel salvare la lavorazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TIPO LAVORAZIONE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Tractor size={16} className="inline mr-1.5" />
          Tipo Lavorazione *
        </label>
        <select
          value={formData.workType || ''}
          onChange={e => setFormData({ ...formData, workType: e.target.value as WorkType })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Seleziona tipo lavorazione</option>
          {workTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* DOVE - Zone/Aiuole/File */}
      {(beds.length > 0 || rows.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={18} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Dove (opzionale)</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Seleziona le aiuole o file specifiche lavorate
          </p>

          {/* Aiuole */}
          {beds.length > 0 && (
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                Aiuole
              </label>
              <div className="grid grid-cols-2 gap-2">
                {beds.map(bed => (
                  <label
                    key={bed.id}
                    className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBeds.includes(bed.id)}
                      onChange={e => {
                        const newBeds = e.target.checked
                          ? [...selectedBeds, bed.id]
                          : selectedBeds.filter(id => id !== bed.id)
                        setSelectedBeds(newBeds)
                        setFormData({ ...formData, bedIds: newBeds })
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-900">{bed.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* File */}
          {rows.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                File
              </label>
              <div className="grid grid-cols-2 gap-2">
                {rows.map(row => (
                  <label
                    key={row.id}
                    className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={e => {
                        const newRows = e.target.checked
                          ? [...selectedRows, row.id]
                          : selectedRows.filter(id => id !== row.id)
                        setSelectedRows(newRows)
                        setFormData({ ...formData, rowIds: newRows })
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-900">{row.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATTREZZATURA */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Attrezzatura Utilizzata *
        </label>
        <select
          value={formData.equipmentType || ''}
          onChange={e => setFormData({ ...formData, equipmentType: e.target.value as EquipmentType })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Seleziona attrezzatura</option>
          {equipmentTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Attachment aggiuntivo se Trattore */}
        {formData.equipmentType === 'Tractor' && (
          <input
            type="text"
            placeholder="es. Aratro a versoio, Fresa rotativa"
            value={formData.equipmentAttachment || ''}
            onChange={e => setFormData({ ...formData, equipmentAttachment: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mt-2"
          />
        )}
      </div>

      {/* DATA LAVORAZIONE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Calendar size={16} className="inline mr-1.5" />
          Data Lavorazione *
        </label>
        <input
          type="date"
          value={formData.workDate || ''}
          onChange={e => setFormData({ ...formData, workDate: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      {/* AREA E PROFONDITÀ */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin size={16} className="inline mr-1.5" />
            Area Lavorata (m²)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.areaCoveredSqm || ''}
            onChange={e => setFormData({ ...formData, areaCoveredSqm: parseFloat(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
            placeholder="es. 500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Profondità (cm)
          </label>
          <input
            type="number"
            value={formData.depthCm || ''}
            onChange={e => setFormData({ ...formData, depthCm: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
            placeholder="es. 30"
          />
          <p className="text-xs text-gray-500 mt-1">
            es. 30-40 cm per aratura, 15-20 cm per fresatura
          </p>
        </div>
      </div>

      {/* DURATA E COSTO */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Clock size={16} className="inline mr-1.5" />
            Durata (minuti)
          </label>
          <input
            type="number"
            value={formData.durationMinutes || ''}
            onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
            placeholder="es. 120"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Euro size={16} className="inline mr-1.5" />
            Costo (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.cost || ''}
            onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
            placeholder="es. 50.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Carburante + operatore + noleggio
          </p>
        </div>
      </div>

      {/* OPERATORE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <User size={16} className="inline mr-1.5" />
          Operatore
        </label>
        <input
          type="text"
          value={formData.operatorName || ''}
          onChange={e => setFormData({ ...formData, operatorName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          placeholder="Nome operatore o azienda"
        />
      </div>

      {/* CONDIZIONI METEO */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <CloudRain size={16} className="inline mr-1.5" />
          Condizioni Meteo
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600">Temperatura (°C)</label>
            <input
              type="number"
              value={formData.weatherConditions?.temperature || ''}
              onChange={e => setFormData({
                ...formData,
                weatherConditions: {
                  ...formData.weatherConditions,
                  temperature: parseFloat(e.target.value)
                }
              })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="18"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Pioggia (mm)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weatherConditions?.rainMm || ''}
              onChange={e => setFormData({
                ...formData,
                weatherConditions: {
                  ...formData.weatherConditions,
                  rainMm: parseFloat(e.target.value)
                }
              })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Umidità Terreno</label>
            <select
              value={formData.weatherConditions?.soilMoisture || ''}
              onChange={e => setFormData({
                ...formData,
                weatherConditions: {
                  ...formData.weatherConditions,
                  soilMoisture: e.target.value as 'dry' | 'optimal' | 'wet'
                }
              })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">-</option>
              <option value="dry">Asciutto</option>
              <option value="optimal">Ottimale (Tempera)</option>
              <option value="wet">Bagnato</option>
            </select>
          </div>
        </div>
      </div>

      {/* NOTE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Note Aggiuntive
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
          placeholder="es. Terreno in buone condizioni, rimosse molte erbacce..."
        />
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors"
        >
          {loading ? 'Salvataggio...' : 'Salva Lavorazione'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annulla
        </button>
      </div>
    </form>
  )
}
