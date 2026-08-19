'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight } from 'lucide-react'
import PilotRequestForm from '../PilotRequestForm'
import { landingContent } from '../content'

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
              Porta un caso reale: lo ricostruiamo insieme in OrtoMio.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-ortomio-green-900">
              Indicaci azienda, coltura ed esigenza principale: prepariamo una prova guidata sul
              flusso più vicino al tuo lavoro, che si tratti di priorità AI, tracciabilità delle
              piante o preparazione delle evidenze per le certificazioni.
            </p>
            {!showForm && (
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-8 inline-flex min-h-12 items-center gap-3 bg-ortomio-green-900 px-6 py-3 font-bold text-white transition hover:bg-ortomio-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-green-900 focus-visible:ring-offset-2 focus-visible:ring-offset-ortomio-harvest"
              >
                {landingContent.finalCta}
                <ArrowDownRight className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {showForm && <PilotRequestForm onClose={closeForm} />}
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ortomio-green-900">
          Ti ricontattiamo per preparare una demo sul tuo caso, non una presentazione generica.
        </p>
      </div>
    </section>
  )
}
