'use client'

import React, { useState } from 'react'

interface Treatment {
  id: string
  date: string
  product: string
  dosage: number
  area: number
  reason: string
}

interface TreatmentRegisterProps {
  limit?: number
}

export function TreatmentRegister({ limit = 10 }: TreatmentRegisterProps) {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [showForm, setShowForm] = useState(false)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Registro Trattamenti</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          {showForm ? 'Annulla' : 'Nuovo Trattamento'}
        </button>
      </div>
      
      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Form nuovo trattamento (da implementare)</p>
        </div>
      )}
      
      {treatments.length === 0 ? (
        <p className="text-gray-500 text-sm">Nessun trattamento registrato</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 text-sm font-semibold text-gray-700">Data</th>
              <th className="text-left p-2 text-sm font-semibold text-gray-700">Prodotto</th>
              <th className="text-left p-2 text-sm font-semibold text-gray-700">Dosaggio</th>
              <th className="text-left p-2 text-sm font-semibold text-gray-700">Area (m²)</th>
              <th className="text-left p-2 text-sm font-semibold text-gray-700">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {treatments.map((treatment) => (
              <tr key={treatment.id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-sm text-gray-900">{treatment.date}</td>
                <td className="p-2 text-sm text-gray-700">{treatment.product}</td>
                <td className="p-2 text-sm text-gray-700">{treatment.dosage}</td>
                <td className="p-2 text-sm text-gray-700">{treatment.area}</td>
                <td className="p-2 text-sm text-gray-700">{treatment.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}







