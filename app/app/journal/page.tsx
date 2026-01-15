'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { FeatureGate } from '@/components/shared/FeatureGate'
import OperationalDiary from '@/components/diary/OperationalDiary'
import QuickEventModal, { type QuickEvent } from '@/components/diary/QuickEventModal'
import { useGarden } from '@/packages/core/hooks/useGarden'

/**
 * Journal Page - Diario Operativo
 * 
 * Modulo: JOURNAL
 * Componente: OperationalDiary.tsx
 * Servizio: operationalDiaryService.ts
 * 
 * Funzionalità:
 * - Timeline unificata di tutte le operazioni
 * - Memorizzazione automatica dei risultati
 * - Analisi trend e correlazioni
 * - Integrazione con Planner AI
 * - Export per compliance e certificazioni
 * - Filtri avanzati per tipo operazione, data, zona
 * - NUOVO: Aggiungi eventi improvvisi (osservazioni, problemi, azioni)
 */
export default function JournalPage() {
  const { activeGarden } = useGarden()
  const [showQuickEvent, setShowQuickEvent] = useState(false)

  const handleSaveQuickEvent = async (event: QuickEvent) => {
    console.log('Saving quick event:', event)
    // TODO: Salvare nel database tramite operationalDiaryService
    // await operationalDiaryService.addQuickEvent(activeGarden.id, event)
    
    // Per ora solo log
    alert(`Evento salvato: ${event.title}`)
  }

  if (!activeGarden) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seleziona un Orto
          </h2>
          <p className="text-gray-600">
            Seleziona un orto per visualizzare il diario operativo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <FeatureGate 
      feature="JOURNAL"
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
            <div className="text-6xl mb-4">📔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Diario Operativo
            </h2>
            <p className="text-gray-600 mb-4">
              Questa funzionalità non è ancora disponibile.
            </p>
            <p className="text-sm text-gray-500">
              Contatta l'amministratore per attivarla.
            </p>
          </div>
        </div>
      }
    >
      <div className="relative min-h-screen">
        {/* Bottone Floating per aggiungere eventi rapidi */}
        <button
          onClick={() => setShowQuickEvent(true)}
          className="fixed bottom-8 right-8 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 flex items-center gap-2 group"
          title="Aggiungi evento improvviso"
          style={{ boxShadow: '0 10px 40px rgba(37, 99, 235, 0.4)' }}
        >
          <Plus className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium">
            Aggiungi Evento
          </span>
        </button>

        {/* Diario principale */}
        <OperationalDiary 
          gardenId={activeGarden.id}
          onEntryAdded={(entry) => {
            console.log('Entry added:', entry)
          }}
        />

        {/* Modal per eventi rapidi */}
        <QuickEventModal
          isOpen={showQuickEvent}
          onClose={() => setShowQuickEvent(false)}
          onSave={handleSaveQuickEvent}
          gardenId={activeGarden.id}
        />
      </div>
    </FeatureGate>
  )
}
