'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { GardenTask, FertilizerApplicationLogDB, GardenBed, GardenRow } from '@/types'
import { X, Droplet, Calendar, AlertCircle, Layers } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  allFertilizers,
  getFertilizerById,
  FertilizerProduct
} from '@/data/fertilizers'
import { useStorage } from '@/packages/core/hooks/useStorage'

interface FertilizerApplicationModalProps {
  task: GardenTask
  onApply: (data: Omit<FertilizerApplicationLogDB, 'id' | 'createdAt'>) => void
  onSkip: () => void
}

export function FertilizerApplicationModal({
  task,
  onApply,
  onSkip
}: FertilizerApplicationModalProps) {
  const { storageProvider } = useStorage()

  // Suggerimento prodotto basato su fase pianta
  const suggestedProduct = useMemo(() => {
    if (task.stage === 'Vegetative') {
      // Fase vegetativa: più azoto
      return getFertilizerById('npk_20_10_10') || getFertilizerById('blood_meal')
    }
    if (task.stage === 'Flowering' || task.stage === 'Fruiting') {
      // Fioritura/fruttificazione: più fosforo e potassio
      return getFertilizerById('npk_10_20_20') || getFertilizerById('bone_meal')
    }
    // Default: bilanciato
    return getFertilizerById('npk_15_15_15') || getFertilizerById('compost_mature')
  }, [task.stage])

  const [selectedProduct, setSelectedProduct] = useState<FertilizerProduct | undefined>(suggestedProduct)
  const [dosageAmount, setDosageAmount] = useState<string>('')
  const [method, setMethod] = useState<'incorporated' | 'surface' | 'fertigation' | 'foliar'>('surface')
  const [shouldRepeat, setShouldRepeat] = useState(true) // Default TRUE per fertilizzazione
  const [frequencyDays, setFrequencyDays] = useState<number>(14) // Default 2 settimane
  const [notes, setNotes] = useState<string>('')

  // Micro-zone tracking: beds e rows
  const [beds, setBeds] = useState<GardenBed[]>([])
  const [rows, setRows] = useState<GardenRow[]>([])
  const [selectedBed, setSelectedBed] = useState<string>(task.bedId || '')
  const [selectedRow, setSelectedRow] = useState<string>('')

  // Carica beds e rows
  useEffect(() => {
    loadGardenStructure()
  }, [task.gardenId])

  useEffect(() => {
    // Carica rows quando cambia bed selezionato
    if (selectedBed) {
      loadRows(selectedBed)
    } else {
      setRows([])
      setSelectedRow('')
    }
  }, [selectedBed])

  const loadGardenStructure = async () => {
    try {
      const gardenBeds = await storageProvider.getGardenBeds(task.gardenId)
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

  // Calcola dosaggio suggerito
  const suggestedDosage = useMemo(() => {
    if (!selectedProduct) return null

    // Area dalla bed o default 1m²
    const area = (task as any).bed?.size || 1

    // Dosaggio min consigliato
    const dosagePerSqm = selectedProduct.dosagePerSqm.min
    const totalDosage = dosagePerSqm * area

    return {
      amount: Math.round(totalDosage * 10) / 10,
      unit: selectedProduct.dosagePerSqm.unit
    }
  }, [selectedProduct, (task as any).bed])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProduct) {
      alert('Seleziona un prodotto fertilizzante')
      return
    }

    const amount = parseFloat(dosageAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Inserisci una quantità valida')
      return
    }

    const applicationDate = new Date().toISOString().split('T')[0]

    // Calcola next_application_date se ripetizione abilitata
    const nextDate = shouldRepeat
      ? new Date(Date.now() + frequencyDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined

    onApply({
      gardenId: task.gardenId,
      taskId: task.id,
      bedId: selectedBed || null,
      bedRowId: selectedRow || null,

      fertilizerProductId: selectedProduct.id,
      fertilizerProductName: selectedProduct.name,
      fertilizerType: selectedProduct.type,
      npk: selectedProduct.npk || null,

      applicationDate,
      areaSqm: (task as any).bed?.size || null,
      dosageAmount: amount,
      dosageUnit: selectedProduct.dosagePerSqm.unit,
      method,

      growthPhase: (task as any).stage || null,

      nextApplicationDate: nextDate || null,
      frequencyDays: shouldRepeat ? frequencyDays : null,

      notes: notes.trim() || null
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header verde come harvest */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">🌱 Fertilizzazione</h2>
              <p className="text-sm opacity-90 mt-1">
                {task.plantName}{task.variety ? ` (${task.variety})` : ''}
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Fase pianta */}
          {task.stage && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Fase pianta:</span>
                <span className="font-semibold text-purple-700">{task.stage}</span>
              </div>
            </div>
          )}

          {/* Suggerimento AI */}
          {suggestedProduct && suggestedDosage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-medium">
                💡 Suggerito: {suggestedProduct.name}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Dosaggio consigliato: <strong>{suggestedDosage.amount} {suggestedDosage.unit}</strong>
              </p>
              {suggestedProduct.npk && (
                <p className="text-xs text-blue-700 mt-1">
                  NPK: {suggestedProduct.npk.n}-{suggestedProduct.npk.p}-{suggestedProduct.npk.k}
                </p>
              )}
            </div>
          )}

          {/* Micro-zone: Dove applicare */}
          {beds.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={16} className="text-green-600" />
                <h4 className="text-sm font-semibold text-gray-900">Dove applicare (opzionale)</h4>
              </div>

              {/* Bed selector */}
              <div className="mb-2">
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Aiuola/Letto
                </label>
                <select
                  value={selectedBed}
                  onChange={(e) => setSelectedBed(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tutto l'orto</option>
                  {beds.map(bed => (
                    <option key={bed.id} value={bed.id}>{bed.name}</option>
                  ))}
                </select>
              </div>

              {/* Rows selector */}
              {rows.length > 0 && selectedBed && (
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    Fila/Filare
                  </label>
                  <select
                    value={selectedRow}
                    onChange={(e) => setSelectedRow(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
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

          {/* Selezione prodotto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fertilizzante *
            </label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => setSelectedProduct(getFertilizerById(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona prodotto...</option>
              <optgroup label="🌾 Organici">
                {allFertilizers.filter(f => f.type === 'organic').map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="⚗️ Minerali">
                {allFertilizers.filter(f => f.type === 'mineral').map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="🔧 Correttivi">
                {allFertilizers.filter(f => f.type === 'corrective').map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="💎 Microelementi">
                {allFertilizers.filter(f => f.type === 'microelement').map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Dosaggio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantità applicata *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                value={dosageAmount}
                onChange={(e) => setDosageAmount(e.target.value)}
                placeholder={suggestedDosage?.amount.toString() || '0'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                <span className="text-sm text-gray-700">
                  {selectedProduct?.dosagePerSqm.unit || 'g/m²'}
                </span>
              </div>
            </div>
          </div>

          {/* Metodo applicazione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metodo applicazione
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="surface">Copertura (Surface)</option>
              <option value="incorporated">Incorporato (Lavorazione)</option>
              <option value="fertigation">Fertirrigazione</option>
              <option value="foliar">Fogliare</option>
            </select>
          </div>

          {/* ⭐ Ripeti checkbox - KEY per scheduling! */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldRepeat}
                onChange={(e) => setShouldRepeat(e.target.checked)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  Ripeti fertilizzazione automaticamente
                </span>
                {shouldRepeat && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Ogni</span>
                    <input
                      type="number"
                      min="7"
                      max="90"
                      value={frequencyDays}
                      onChange={(e) => setFrequencyDays(parseInt(e.target.value) || 14)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-xs text-gray-600">giorni</span>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (opzionale)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Osservazioni, condizioni meteo, ecc..."
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data applicazione
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-sm text-gray-700">
                {format(new Date(), 'dd MMMM yyyy', { locale: it })}
              </span>
            </div>
          </div>

          {/* Warning incompatibilità */}
          {selectedProduct?.incompatibilities && selectedProduct.incompatibilities.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <strong>Attenzione!</strong> Non mescolare con:{' '}
                {selectedProduct.incompatibilities.map(id => getFertilizerById(id)?.name || id).join(', ')}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Non adesso
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Applica Fertilizzante
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
