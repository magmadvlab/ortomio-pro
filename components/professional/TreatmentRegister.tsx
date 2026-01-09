'use client'

import React, { useState, useEffect } from 'react'
import { Garden } from '@/types'
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

  useEffect(() => {
    loadTreatments()
  }, [garden.id])

  const loadTreatments = async () => {
    setLoading(true)
    try {
      // TODO: Implementare getTreatmentLogs nel storage provider
      // const logs = await storageProvider.getTreatmentLogs(garden.id)
      // setTreatments(logs?.slice(0, limit) || [])
      setTreatments([])
    } catch (error) {
      console.error('Error loading treatments:', error)
      setTreatments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (log: TreatmentLog) => {
    try {
      // TODO: Implementare createTreatmentLog nel storage provider
      // await storageProvider.createTreatmentLog(log)
      console.log('Treatment log to save:', log)
      alert('✅ Trattamento registrato con successo!')
      setShowForm(false)
      await loadTreatments()
    } catch (error) {
      console.error('Error saving treatment:', error)
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
    </div>
  )
}



