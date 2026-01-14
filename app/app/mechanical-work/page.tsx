'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tractor, Calendar, MapPin, Clock, Filter } from 'lucide-react'

export default function MechanicalWorkPage() {
  const searchParams = useSearchParams()
  const filter = searchParams?.get('filter')
  const [selectedFilter, setSelectedFilter] = useState(filter || 'all')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Tractor className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Lavorazioni Meccaniche</h1>
          </div>
          <p className="text-gray-600">
            Gestisci e pianifica le lavorazioni meccaniche del tuo terreno
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filtri</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'Pruning', 'Tillage', 'Mowing', 'Harvesting'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === type
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'Tutte' : 
                 type === 'Pruning' ? 'Potatura' :
                 type === 'Tillage' ? 'Lavorazione Terreno' :
                 type === 'Mowing' ? 'Sfalcio' :
                 'Raccolta'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder cards */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300">
            <div className="text-center py-8">
              <Tractor className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Nessuna lavorazione</h3>
              <p className="text-sm text-gray-600 mb-4">
                Inizia a pianificare le tue lavorazioni meccaniche
              </p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Aggiungi Lavorazione
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Funzionalità in sviluppo</h3>
              <p className="text-sm text-blue-800">
                La gestione completa delle lavorazioni meccaniche sarà disponibile a breve. 
                Per ora puoi registrare le lavorazioni tramite il registro attività nel tuo orto/frutteto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
