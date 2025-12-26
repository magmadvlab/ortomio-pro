'use client'

import React, { useState, useEffect } from 'react'
import { X, Droplet, Calendar, AlertTriangle, Layers, Beaker } from 'lucide-react'
import { Garden, GardenBed, GardenRow } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'

export interface TreatmentLog {
  id?: string
  gardenId: string
  bedId?: string | null
  rowId?: string | null

  cropName: string
  treatmentDate: string // ISO date
  productName: string
  activeIngredient?: string
  dosage: number
  dosageUnit: 'ml' | 'g' | 'kg' | 'L'
  areaTreated?: number // m²
  method: 'spray' | 'soil' | 'seed' | 'foliar'
  reason: 'preventive' | 'curative' | 'pest_control' | 'disease_control' | 'nutrient'

  weatherConditions?: {
    temperature?: number
    windSpeed?: number
    rain?: boolean
  }
  operatorName?: string
  notes?: string
}

interface TreatmentRegisterFormProps {
  garden: Garden
  onSubmit: (log: TreatmentLog) => Promise<void>
  onCancel: () => void
  initialData?: Partial<TreatmentLog>
}

export function TreatmentRegisterForm({
  garden,
  onSubmit,
  onCancel,
  initialData
}: TreatmentRegisterFormProps) {
  const { storageProvider } = useStorage()

  const [formData, setFormData] = useState<Partial<TreatmentLog>>({
    gardenId: garden.id,
    treatmentDate: new Date().toISOString().split('T')[0],
    method: 'spray',
    reason: 'preventive',
    dosageUnit: 'ml',
    ...initialData
  })

  const [loading, setLoading] = useState(false)
  const [beds, setBeds] = useState<GardenBed[]>([])
  const [rows, setRows] = useState<GardenRow[]>([])
  const [selectedBed, setSelectedBed] = useState<string>(initialData?.bedId || '')
  const [selectedRow, setSelectedRow] = useState<string>(initialData?.rowId || '')

  // Carica beds e rows
  useEffect(() => {
    loadGardenStructure()
  }, [garden.id])

  useEffect(() => {
    if (selectedBed) {
      loadRows(selectedBed)
    } else {
      setRows([])
      setSelectedRow('')
    }
  }, [selectedBed])

  const loadGardenStructure = async () => {
    try {
      const gardenBeds = await storageProvider.getGardenBeds(garden.id)
      setBeds(gardenBeds || [])
    } catch (error) {
      console.error('Error loading garden beds:', error)
    }
  }

  const loadRows = async (bedId: string) => {
    try {
      const bedRows = await storageProvider.getGardenRows(bedId)
      setRows(bedRows || [])
    } catch (error) {
      console.error('Error loading rows:', error)
      setRows([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.cropName || !formData.productName || !formData.dosage) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        bedId: selectedBed || null,
        rowId: selectedRow || null
      } as TreatmentLog)
    } catch (error) {
      console.error('Error submitting treatment log:', error)
      alert('Errore nel salvare il trattamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Coltura trattata */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Coltura Trattata *
        </label>
        <input
          type="text"
          value={formData.cropName || ''}
          onChange={e => setFormData({ ...formData, cropName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="es. Pomodoro, Insalata, ecc."
          required
        />
      </div>

      {/* Micro-zone: Dove */}
      {beds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={18} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Dove (opzionale)</h3>
          </div>

          {/* Bed selector */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Aiuola/Letto
            </label>
            <select
              value={selectedBed}
              onChange={(e) => setSelectedBed(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tutto l'orto</option>
              {beds.map(bed => (
                <option key={bed.id} value={bed.id}>{bed.name}</option>
              ))}
            </select>
          </div>

          {/* Row selector */}
          {rows.length > 0 && selectedBed && (
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                Fila/Filare
              </label>
              <select
                value={selectedRow}
                onChange={(e) => setSelectedRow(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tutta l'aiuola</option>
                {rows.map(row => (
                  <option key={row.id} value={row.id}>{row.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Data trattamento */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Calendar size={16} className="inline mr-1.5" />
          Data Trattamento *
        </label>
        <input
          type="date"
          value={formData.treatmentDate || ''}
          onChange={e => setFormData({ ...formData, treatmentDate: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Prodotto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Beaker size={16} className="inline mr-1.5" />
          Prodotto Fitosanitario *
        </label>
        <input
          type="text"
          value={formData.productName || ''}
          onChange={e => setFormData({ ...formData, productName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
          placeholder="Nome commerciale prodotto"
          required
        />
      </div>

      {/* Principio attivo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Principio Attivo
        </label>
        <input
          type="text"
          value={formData.activeIngredient || ''}
          onChange={e => setFormData({ ...formData, activeIngredient: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          placeholder="es. Rame, Zolfo, ecc."
        />
      </div>

      {/* Dosaggio e Area */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dosaggio *
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={formData.dosage || ''}
              onChange={e => setFormData({ ...formData, dosage: parseFloat(e.target.value) })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5"
              placeholder="0.00"
              required
            />
            <select
              value={formData.dosageUnit || 'ml'}
              onChange={e => setFormData({ ...formData, dosageUnit: e.target.value as any })}
              className="border border-gray-300 rounded-lg px-3 py-2.5"
            >
              <option value="ml">ml</option>
              <option value="L">L</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Area Trattata (m²)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.areaTreated || ''}
            onChange={e => setFormData({ ...formData, areaTreated: parseFloat(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
            placeholder="es. 100"
          />
        </div>
      </div>

      {/* Metodo e Motivo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Metodo Applicazione
          </label>
          <select
            value={formData.method || 'spray'}
            onChange={e => setFormData({ ...formData, method: e.target.value as any })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value="spray">Spray/Nebulizzazione</option>
            <option value="foliar">Fogliare</option>
            <option value="soil">Al Terreno</option>
            <option value="seed">Concia Seme</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Motivo Trattamento
          </label>
          <select
            value={formData.reason || 'preventive'}
            onChange={e => setFormData({ ...formData, reason: e.target.value as any })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value="preventive">Preventivo</option>
            <option value="curative">Curativo</option>
            <option value="pest_control">Controllo Parassiti</option>
            <option value="disease_control">Controllo Malattie</option>
            <option value="nutrient">Nutrizione</option>
          </select>
        </div>
      </div>

      {/* Condizioni Meteo */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-amber-600" />
          <label className="text-sm font-semibold text-gray-900">
            Condizioni Meteo
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Temperatura (°C)</label>
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
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              placeholder="20"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Vento (km/h)</label>
            <input
              type="number"
              value={formData.weatherConditions?.windSpeed || ''}
              onChange={e => setFormData({
                ...formData,
                weatherConditions: {
                  ...formData.weatherConditions,
                  windSpeed: parseFloat(e.target.value)
                }
              })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Pioggia</label>
            <select
              value={formData.weatherConditions?.rain ? 'yes' : 'no'}
              onChange={e => setFormData({
                ...formData,
                weatherConditions: {
                  ...formData.weatherConditions,
                  rain: e.target.value === 'yes'
                }
              })}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="no">No</option>
              <option value="yes">Sì</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operatore */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Operatore
        </label>
        <input
          type="text"
          value={formData.operatorName || ''}
          onChange={e => setFormData({ ...formData, operatorName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          placeholder="Nome operatore"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Note
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Osservazioni, parassiti rilevati, ecc..."
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
        >
          {loading ? 'Salvataggio...' : 'Salva Trattamento'}
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
