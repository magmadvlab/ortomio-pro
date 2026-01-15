'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, ExternalLink, GitCompare } from 'lucide-react'

type FeatureStatus = 'both' | 'old-only' | 'new-only' | 'different'
type Priority = 'critical' | 'high' | 'medium' | 'low'

interface Feature {
  id: string
  name: string
  oldRoute: string | null
  newRoute: string | null
  status: FeatureStatus
  priority: Priority
  description: string
  oldFeatures?: string[]
  newFeatures?: string[]
  notes?: string
}

export default function DetailedComparePage() {
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

  const features: Feature[] = [
    // Pagine presenti in entrambe ma diverse
    {
      id: 'planner',
      name: 'Planner',
      oldRoute: '/app/old/planner',
      newRoute: '/app/planner',
      status: 'different',
      priority: 'critical',
      description: 'Sistema di pianificazione colture',
      oldFeatures: [
        'Planner monolitico 2560+ righe',
        'Wizard piantagione step-by-step',
        'Selezione materiale (seme/piantina/alberello)',
        'Collegamento banca semi',
        'Collegamento vivaio',
        'Semina scaglionata (batches)',
        'Calendario colturale visuale',
        'Compatibilità pH',
        'Fertirrigazione',
        'Piante compagne',
        'Suggerimenti AI Gemini',
        'Visual Garden Planner',
        'Specialized Crop Form',
        'Custom Crop Form'
      ],
      newFeatures: [
        'Planner modulare con 5 tabs',
        'SmartPlanner con AI',
        'ClassicPlanner con rotazione',
        'Timeline grafica',
        'Metriche efficienza',
        'Suggerimenti AI contestuali',
        'Calendario professionale',
        'Task list avanzata',
        'Analytics integrati'
      ],
      notes: 'Vecchia: tutto in un file. Nuova: modulare e separato'
    },
    {
      id: 'irrigation',
      name: 'Irrigazione',
      oldRoute: '/app/old/irrigation',
      newRoute: '/app/irrigation',
      status: 'different',
      priority: 'high',
      description: 'Gestione sistemi irrigazione',
      oldFeatures: [
        'Gestione zone irrigazione',
        'Sistemi irrigazione (goccia, aspersione)',
        'Log irrigazioni dettagliati',
        'Analytics consumo acqua',
        'Calcolo fabbisogno idrico',
        'Programmazione automatica',
        'Storico completo'
      ],
      newFeatures: [
        'Widget AI suggerimenti',
        'Integrazione meteo',
        'Log semplificato',
        'Dashboard essenziale'
      ],
      notes: 'Vecchia: sistema completo. Nuova: semplificata con AI'
    },
    {
      id: 'nutrition',
      name: 'Nutrizione',
      oldRoute: '/app/old/nutrition',
      newRoute: '/app/nutrition',
      status: 'different',
      priority: 'high',
      description: 'Gestione fertilizzanti e trattamenti',
      oldFeatures: [
        'Gestione fertilizzanti per bed/row',
        'Trattamenti fitosanitari',
        'Calcolo dosi per zona',
        'Storico trattamenti',
        'Inventario prodotti',
        'Compatibilità prodotti',
        'Registro trattamenti'
      ],
      newFeatures: [
        'Widget AI suggerimenti',
        'Gestione semplificata',
        'Trattamenti bio/tradizionale',
        'Dashboard essenziale'
      ],
      notes: 'Vecchia: gestione dettagliata. Nuova: semplificata con AI'
    },
    {
      id: 'certifications',
      name: 'Certificazioni',
      oldRoute: '/app/old/certifications',
      newRoute: '/app/certifications',
      status: 'different',
      priority: 'medium',
      description: 'Gestione certificazioni GlobalGAP',
      oldFeatures: [
        'Dashboard completo certificazioni',
        'Gestione documenti',
        'Scadenze e reminder',
        'Checklist conformità',
        'Export report',
        'Moduli GlobalGAP completi',
        'Audit trail'
      ],
      newFeatures: [
        'GlobalGapDashboard',
        'Compliance checklist',
        'Document manager',
        'Deadline manager'
      ],
      notes: 'Vecchia: sistema completo documenti. Nuova: essenziale'
    },
    {
      id: 'mechanical-work',
      name: 'Lavori Meccanici',
      oldRoute: '/app/old/mechanical-work',
      newRoute: '/app/mechanical-work',
      status: 'different',
      priority: 'medium',
      description: 'Gestione attrezzature e lavorazioni',
      oldFeatures: [
        'Gestione attrezzature complete',
        'Manutenzione attrezzature',
        'Lavorazioni terreno',
        'Accessori e ricambi',
        'Costi operativi',
        'Storico manutenzioni',
        'Calendario manutenzioni'
      ],
      newFeatures: [
        'Versione minimalista',
        'Log lavorazioni base'
      ],
      notes: 'Vecchia: sistema completo. Nuova: molto semplificata'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      oldRoute: '/app/old/analytics',
      newRoute: '/app/analytics',
      status: 'different',
      priority: 'medium',
      description: 'Analisi e statistiche',
      oldFeatures: [
        'Analytics base',
        'Grafici semplici',
        'Report essenziali'
      ],
      newFeatures: [
        'Dashboard professionale',
        'Metriche multiple',
        'Visualizzazioni avanzate',
        'Export dati',
        'Confronti temporali'
      ],
      notes: 'Nuova: molto più avanzata'
    },
    {
      id: 'advice',
      name: 'Consigli',
      oldRoute: '/app/old/advice',
      newRoute: '/app/advice',
      status: 'different',
      priority: 'medium',
      description: 'Consigli e suggerimenti',
      oldFeatures: [
        'Consigli base',
        'Suggerimenti stagionali'
      ],
      newFeatures: [
        'CropRotationPlanner',
        'BiologicalControlDashboard',
        'Sistema consigli attivi integrati',
        'AI collaborativa'
      ],
      notes: 'Nuova: molto più avanzata con AI'
    },
    
    // Pagine solo nella vecchia app
    {
      id: 'ai-predictions',
      name: 'AI Predictions',
      oldRoute: '/app/old/ai-predictions',
      newRoute: null,
      status: 'old-only',
      priority: 'critical',
      description: 'Predizioni AI malattie e resa',
      oldFeatures: [
        'UI dedicata predizioni',
        'Visualizzazione malattie previste',
        'Predizioni resa',
        'Confidence score',
        'Azioni raccomandate'
      ],
      notes: 'Servizio esiste nella nuova app, manca solo UI'
    },
    {
      id: 'journal',
      name: 'Diario',
      oldRoute: '/app/old/journal',
      newRoute: null,
      status: 'old-only',
      priority: 'critical',
      description: 'Diario operativo',
      oldFeatures: [
        'Route dedicata',
        'Vista timeline',
        'Filtri avanzati',
        'Export diario'
      ],
      notes: 'Componente esiste nella nuova app, manca solo route'
    },
    {
      id: 'plants',
      name: 'Piante Individuali',
      oldRoute: '/app/old/plants',
      newRoute: null,
      status: 'old-only',
      priority: 'critical',
      description: 'Gestione piante individuali',
      oldFeatures: [
        'Route dedicata',
        'Vista piante',
        'Operazioni su piante',
        'Storico pianta'
      ],
      notes: 'Componente esiste nella nuova app, manca solo route'
    },
    {
      id: 'orchard',
      name: 'Frutteto',
      oldRoute: '/app/old/orchard',
      newRoute: '/app/orchard',
      status: 'old-only',
      priority: 'critical',
      description: 'Gestione frutteto',
      oldFeatures: [
        'Wizard creazione frutteto',
        'Gestione alberi da frutto',
        'Task specifici frutteto',
        'Potatura alberi',
        'Raccolta frutti'
      ],
      notes: 'Nuova app ha solo placeholder'
    },
    {
      id: 'vineyard',
      name: 'Vigneto',
      oldRoute: '/app/old/vineyard',
      newRoute: '/app/vineyard',
      status: 'old-only',
      priority: 'critical',
      description: 'Gestione vigneto',
      oldFeatures: [
        'Wizard creazione vigneto',
        'Gestione viti',
        'Task specifici vigneto',
        'Potatura viti',
        'Vendemmia'
      ],
      notes: 'Nuova app ha solo placeholder'
    },
    {
      id: 'olives',
      name: 'Oliveto',
      oldRoute: '/app/old/olives',
      newRoute: '/app/olives',
      status: 'old-only',
      priority: 'critical',
      description: 'Gestione oliveto',
      oldFeatures: [
        'Wizard creazione oliveto',
        'Gestione olivi',
        'Task specifici oliveto',
        'Potatura olivi',
        'Raccolta olive'
      ],
      notes: 'Nuova app ha solo placeholder'
    },
    {
      id: 'harvest',
      name: 'Raccolti',
      oldRoute: 'vcchiortomio/vecchia app/app/(dashboard)/app/harvest',
      newRoute: null,
      status: 'old-only',
      priority: 'medium',
      description: 'Gestione raccolti',
      oldFeatures: [
        'Log raccolti',
        'Analytics raccolti',
        'Confronti annuali'
      ],
      notes: 'Integrato in analytics nella nuova app'
    },
    {
      id: 'treatments',
      name: 'Trattamenti',
      oldRoute: 'vcchiortomio/vecchia app/app/(dashboard)/app/treatments',
      newRoute: null,
      status: 'old-only',
      priority: 'medium',
      description: 'Trattamenti fitosanitari',
      oldFeatures: [
        'Registro trattamenti',
        'Prodotti fitosanitari',
        'Dosi e applicazioni'
      ],
      notes: 'Integrato in nutrition nella nuova app'
    },
    {
      id: 'ndvi',
      name: 'NDVI Satellitare',
      oldRoute: 'vcchiortomio/vecchia app/app/(dashboard)/app/ndvi',
      newRoute: null,
      status: 'old-only',
      priority: 'medium',
      description: 'Mappe satellitari NDVI',
      oldFeatures: [
        'Visualizzazione mappe NDVI',
        'Storico immagini',
        'Analisi vegetazione'
      ],
      notes: 'Servizio esiste, manca UI dedicata'
    },
    {
      id: 'prescription-maps',
      name: 'Mappe Prescrizione',
      oldRoute: 'vcchiortomio/vecchia app/app/(dashboard)/app/prescription-maps',
      newRoute: null,
      status: 'old-only',
      priority: 'medium',
      description: 'Mappe prescrizione variabile',
      oldFeatures: [
        'Creazione mappe prescrizione',
        'Zone management',
        'Export per macchinari'
      ],
      notes: 'Servizio esiste, manca UI dedicata'
    },
    {
      id: 'calendar',
      name: 'Calendario',
      oldRoute: 'vcchiortomio/vecchia app/app/(dashboard)/app/calendar',
      newRoute: null,
      status: 'old-only',
      priority: 'low',
      description: 'Calendario attività',
      notes: 'Integrato in planner nella nuova app'
    },
    {
      id: 'challenges',
      name: 'Sfide',
      oldRoute: 'vcchiortomio/vecchia app/app/(dashboard)/app/challenges',
      newRoute: null,
      status: 'old-only',
      priority: 'low',
      description: 'Sfide e gamification',
      notes: 'Funzionalità gamification rimossa'
    },
    {
      id: 'smart',
      name: 'Smart Hub',
      oldRoute: 'vcchiortomio/vecchia app/app/(dashboard)/app/smart',
      newRoute: null,
      status: 'old-only',
      priority: 'medium',
      description: 'Hub dispositivi smart',
      notes: 'Servizio esiste, manca UI dedicata'
    }
  ]

  const filteredFeatures = features.filter(f => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false
    if (filterPriority !== 'all' && f.priority !== filterPriority) return false
    return true
  })

  const getStatusBadge = (status: FeatureStatus) => {
    switch (status) {
      case 'both':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Entrambe</span>
      case 'different':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Diverse</span>
      case 'old-only':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">Solo Vecchia</span>
      case 'new-only':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Solo Nuova</span>
    }
  }

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">🔴 CRITICA</span>
      case 'high':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">🟠 ALTA</span>
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">🟡 MEDIA</span>
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">🟢 BASSA</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <GitCompare className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Confronto Dettagliato Funzionalità
              </h1>
              <p className="text-gray-600">
                Analisi completa di tutte le pagine e funzionalità
              </p>
            </div>
          </div>

          {/* Statistiche */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{features.filter(f => f.status === 'both' || f.status === 'different').length}</div>
              <div className="text-sm text-blue-700">In Entrambe</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{features.filter(f => f.status === 'old-only').length}</div>
              <div className="text-sm text-orange-700">Solo Vecchia</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{features.filter(f => f.status === 'new-only').length}</div>
              <div className="text-sm text-green-700">Solo Nuova</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-900">{features.filter(f => f.priority === 'critical').length}</div>
              <div className="text-sm text-red-700">Priorità Critica</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Tutti</option>
                <option value="both">Entrambe</option>
                <option value="different">Diverse</option>
                <option value="old-only">Solo Vecchia</option>
                <option value="new-only">Solo Nuova</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorità</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Tutte</option>
                <option value="critical">Critica</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Bassa</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista Funzionalità */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedFeature(feature)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.name}
                    </h3>
                    {getStatusBadge(feature.status)}
                    {getPriorityBadge(feature.priority)}
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>

              {feature.notes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> {feature.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                {feature.oldRoute && (
                  <div className="text-xs text-gray-500">
                    📁 Vecchia: <code className="bg-gray-100 px-2 py-1 rounded">{feature.oldRoute}</code>
                  </div>
                )}
                {feature.newRoute && (
                  <div className="text-xs text-gray-500">
                    📁 Nuova: <code className="bg-gray-100 px-2 py-1 rounded">{feature.newRoute}</code>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Dettagli */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50" onClick={() => setSelectedFeature(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedFeature.name}</h2>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-gray-600 mb-4">{selectedFeature.description}</p>
                <div className="flex gap-3">
                  {getStatusBadge(selectedFeature.status)}
                  {getPriorityBadge(selectedFeature.priority)}
                </div>
              </div>

              {selectedFeature.oldFeatures && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Funzionalità Vecchia App</h3>
                  <ul className="space-y-2">
                    {selectedFeature.oldFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-orange-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedFeature.newFeatures && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Funzionalità Nuova App</h3>
                  <ul className="space-y-2">
                    {selectedFeature.newFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedFeature.notes && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Note</h3>
                  <p className="text-sm text-blue-800">{selectedFeature.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {selectedFeature.oldRoute && (
                  <Link
                    href={selectedFeature.oldRoute}
                    target="_blank"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Apri Vecchia App
                  </Link>
                )}
                {selectedFeature.newRoute && (
                  <Link
                    href={selectedFeature.newRoute}
                    target="_blank"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Apri Nuova App
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Link */}
      <div className="max-w-7xl mx-auto mt-8">
        <Link
          href="/app/compare"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Torna al Confronto</span>
        </Link>
      </div>
    </div>
  )
}
