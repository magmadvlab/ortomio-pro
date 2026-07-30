'use client'

import React, { useState, useEffect } from 'react'
import { Garden, TreatmentRecordDB } from '@/types'
import { TreatmentRegisterForm, TreatmentLog } from './TreatmentRegisterForm'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { X } from 'lucide-react'

interface TreatmentRegisterProps {
  garden: Garden
  limit?: number
}

export function TreatmentRegister({ garden, limit = 20 }: TreatmentRegisterProps) {
  const { storageProvider } = useStorage()
  const [treatments, setTreatments] = useState<TreatmentLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTreatments()
  }, [garden.id])

  const loadTreatments = async () => {
    setLoading(true)
    try {
      setError(null)
      const records = await storageProvider.getTreatments(garden.id)
      setTreatments(records.slice(0, limit).map(mapTreatmentRecord))
    } catch (error) {
      console.error('Error loading treatments:', error)
      setError('Registro trattamenti non disponibile. Riprova.')
      setTreatments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (log: TreatmentLog) => {
    try {
      setError(null)
      await storageProvider.createTreatment({
        garden_id: garden.id,
        bed_id: log.bedId || undefined,
        bed_row_id: log.rowId || undefined,
        crop_name: log.cropName,
        treatment_date: log.treatmentDate,
        product_name: log.productName,
        active_ingredient: log.activeIngredient,
        dosage: log.dosage,
        dosage_unit: log.dosageUnit,
        area_treated: log.areaTreated,
        method: log.method,
        reason: log.reason,
        weather_conditions: log.weatherConditions ? {
          temp: log.weatherConditions.temperature,
          wind: log.weatherConditions.windSpeed?.toString(),
        } : undefined,
        operator_name: log.operatorName,
        notes: log.notes,
      })
      setShowForm(false)
      await loadTreatments()
    } catch (error) {
      console.error('Error saving treatment:', error)
      setError('Salvataggio del trattamento non riuscito.')
      throw error
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Registro Trattamenti</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Annulla' : 'Nuovo Trattamento'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <TreatmentRegisterForm
            garden={garden}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm text-center py-4">Caricamento...</p>
      ) : treatments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-2">Nessun trattamento registrato</p>
          <p className="text-gray-400 text-xs">
            Clicca su "Nuovo Trattamento" per registrare il primo trattamento fitosanitario
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">Data</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">Coltura</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">Prodotto</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">Dosaggio</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">Area (m²)</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">Motivo</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">Dove</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((treatment) => (
                <tr key={treatment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm text-gray-900">{treatment.treatmentDate}</td>
                  <td className="p-3 text-sm text-gray-700">{treatment.cropName}</td>
                  <td className="p-3 text-sm text-gray-700">{treatment.productName}</td>
                  <td className="p-3 text-sm text-gray-700">
                    {treatment.dosage} {treatment.dosageUnit}
                  </td>
                  <td className="p-3 text-sm text-gray-700">{treatment.areaTreated || '-'}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      treatment.reason === 'preventive' ? 'bg-green-100 text-green-700' :
                      treatment.reason === 'curative' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {treatment.reason === 'preventive' ? 'Preventivo' :
                       treatment.reason === 'curative' ? 'Curativo' :
                       treatment.reason === 'pest_control' ? 'Parassiti' :
                       treatment.reason === 'disease_control' ? 'Malattie' : 'Nutrizione'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {treatment.rowId ? '📍 Filare' : treatment.bedId ? '📍 Aiuola' : '🌍 Tutto'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

function mapTreatmentRecord(record: TreatmentRecordDB): TreatmentLog {
  return {
    id: record.id,
    gardenId: record.garden_id || '',
    bedId: record.bed_id || null,
    rowId: record.bed_row_id || record.field_row_id || null,
    cropName: record.crop_name,
    treatmentDate: record.treatment_date,
    productName: record.product_name,
    activeIngredient: record.active_ingredient,
    dosage: record.dosage || 0,
    dosageUnit: record.dosage_unit || 'ml',
    areaTreated: record.area_treated,
    method: record.method || 'spray',
    reason: record.reason || 'preventive',
    weatherConditions: record.weather_conditions ? {
      temperature: record.weather_conditions.temp,
      windSpeed: record.weather_conditions.wind
        ? Number.parseFloat(record.weather_conditions.wind)
        : undefined,
    } : undefined,
    operatorName: record.operator_name,
    notes: record.notes,
  }
}


