'use client'

import { useState } from 'react'
import { ArrowDownRight } from 'lucide-react'
import PilotRequestForm from '../PilotRequestForm'
import { landingContent } from '../content'

export default function FinalCta() {
  const [showForm, setShowForm] = useState(false)

  return (
    <section className="relative overflow-hidden bg-ortomio-harvest px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-900">
              Prova guidata
            </p>
            <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-6xl">
              Porta un caso reale. Lo ricostruiamo insieme in OrtoMio.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-ortomio-green-900">
              Indicaci azienda, coltura ed esigenza principale. Prepareremo una prova guidata sui
              flussi più vicini al tuo lavoro: osservazione del campo, priorità AI, tracciabilità
              delle piante, pianificazione, IoT, NDVI o preparazione delle evidenze per le
              certificazioni.
            </p>
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-8 inline-flex min-h-12 items-center gap-3 bg-ortomio-green-900 px-6 py-3 font-bold text-white transition hover:bg-ortomio-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ortomio-harvest"
              >
                {landingContent.finalCta}
                <ArrowDownRight className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {showForm && <PilotRequestForm onClose={() => setShowForm(false)} />}
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ortomio-green-900/80">
          Ti ricontatteremo per preparare una dimostrazione coerente con il tuo contesto.
        </p>
      </div>
    </section>
  )
}
