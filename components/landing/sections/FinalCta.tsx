'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight } from 'lucide-react'
import PilotRequestForm from '../PilotRequestForm'

export default function FinalCta() {
  const [showForm, setShowForm] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const returnFocusAfterClose = useRef(false)

  useEffect(() => {
    if (!showForm && returnFocusAfterClose.current) {
      triggerRef.current?.focus()
      returnFocusAfterClose.current = false
    }
  }, [showForm])

  const closeForm = () => {
    returnFocusAfterClose.current = true
    setShowForm(false)
  }

  return (
    <section id="prova-guidata" className="relative overflow-hidden bg-ortomio-harvest px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-900">
              Prova guidata
            </p>
            <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-6xl">
              Metti alla prova OrtoMio sul tuo campo reale.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-ortomio-green-900">
              Non la solita demo generica: configuriamo la piattaforma direttamente con i tuoi
              ettari, le tue colture e i tuoi flussi di lavoro principali — priorità d’intervento,
              tracciabilità o registri per le certificazioni.
            </p>
            {!showForm && (
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-8 inline-flex min-h-12 items-center gap-3 bg-ortomio-green-900 px-6 py-3 font-bold text-white transition hover:bg-ortomio-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-green-900 focus-visible:ring-offset-2 focus-visible:ring-offset-ortomio-harvest"
              >
                Richiedi la prova guidata con i tuoi dati
                <ArrowDownRight className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <ol className="mt-10 grid gap-6 border-t border-ortomio-green-900/15 pt-8 sm:grid-cols-3">
          {[
            'Analizziamo le colture e gli ettari della tua azienda.',
            'Ricostruiamo un caso d’uso reale del tuo campo.',
            'Ti mostriamo le priorità e i suggerimenti calcolati per te.',
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="font-mono text-sm font-bold text-ortomio-green-900">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-sm leading-relaxed text-ortomio-green-900">{step}</span>
            </li>
          ))}
        </ol>

        {showForm && <PilotRequestForm onClose={closeForm} />}
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ortomio-green-900">
          Ti ricontattiamo per preparare la prova sui dati e sulla coltura della tua azienda.
        </p>
      </div>
    </section>
  )
}
