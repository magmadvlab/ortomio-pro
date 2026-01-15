'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, GitCompare, ExternalLink } from 'lucide-react'

export default function ComparePage() {
  const [selectedFeature, setSelectedFeature] = useState<string>('planner')

  const features = [
    {
      id: 'planner',
      name: 'Planner',
      oldRoute: '/app/compare/old/planner',
      newRoute: '/app/planner',
      description: 'Sistema di pianificazione colture'
    },
    {
      id: 'irrigation',
      name: 'Irrigazione',
      oldRoute: '/app/compare/old/irrigation',
      newRoute: '/app/irrigation',
      description: 'Gestione sistemi irrigazione'
    },
    {
      id: 'nutrition',
      name: 'Nutrizione',
      oldRoute: '/app/compare/old/nutrition',
      newRoute: '/app/nutrition',
      description: 'Gestione fertilizzanti e trattamenti'
    },
    {
      id: 'certifications',
      name: 'Certificazioni',
      oldRoute: '/app/compare/old/certifications',
      newRoute: '/app/certifications',
      description: 'Gestione certificazioni GlobalGAP'
    },
    {
      id: 'mechanical',
      name: 'Lavori Meccanici',
      oldRoute: '/app/compare/old/mechanical-work',
      newRoute: '/app/mechanical-work',
      description: 'Gestione attrezzature e lavorazioni'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      oldRoute: '/app/compare/old/analytics',
      newRoute: '/app/analytics',
      description: 'Analisi e statistiche'
    }
  ]

  const selected = features.find(f => f.id === selectedFeature)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <GitCompare className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Confronto Versioni
              </h1>
              <p className="text-gray-600">
                Confronta le funzionalità tra vecchia e nuova app
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Come usare:</strong> Seleziona una funzionalità dalla lista sotto, 
              poi apri entrambe le versioni in tab separate per confrontarle side-by-side.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Selector */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Seleziona Funzionalità da Confrontare
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedFeature === feature.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">
                  {feature.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison View */}
      {selected && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Old Version */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Versione Vecchia
                  </h3>
                  <p className="text-sm text-gray-600">
                    Implementazione originale
                  </p>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  OLD
                </span>
              </div>

              <div className="space-y-4">
                <Link
                  href={selected.oldRoute}
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={20} className="text-gray-600" />
                    <span className="font-medium text-gray-900">
                      Apri in nuova tab
                    </span>
                  </div>
                  <ArrowRight size={20} className="text-gray-400" />
                </Link>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-900">
                    <strong>Nota:</strong> Questa è la versione originale con tutte le funzionalità complete.
                  </p>
                </div>
              </div>
            </div>

            {/* New Version */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Versione Nuova
                  </h3>
                  <p className="text-sm text-gray-600">
                    Implementazione attuale
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  NEW
                </span>
              </div>

              <div className="space-y-4">
                <Link
                  href={selected.newRoute}
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={20} className="text-gray-600" />
                    <span className="font-medium text-gray-900">
                      Apri in nuova tab
                    </span>
                  </div>
                  <ArrowRight size={20} className="text-gray-400" />
                </Link>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    <strong>Nota:</strong> Questa è la versione nuova con funzionalità ottimizzate e AI integrata.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Istruzioni per il Confronto
            </h3>
            
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <span>
                  Clicca su "Apri in nuova tab" per la <strong>Versione Vecchia</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <span>
                  Clicca su "Apri in nuova tab" per la <strong>Versione Nuova</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <span>
                  Posiziona le due tab affiancate (su Windows: Win+←/→, su Mac: usa Split View)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </span>
                <span>
                  Testa le funzionalità in entrambe le versioni e annota le differenze
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  5
                </span>
                <span>
                  Decidi quale versione mantenere o quali funzionalità portare dalla vecchia alla nuova
                </span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Back Link */}
      <div className="max-w-7xl mx-auto mt-8">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Torna alla Dashboard</span>
        </Link>
      </div>
    </div>
  )
}
