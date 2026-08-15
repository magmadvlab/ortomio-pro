'use client'

import { useState } from 'react'
import PilotRequestForm from '../PilotRequestForm'

export default function MaturitySection() {
  const [showForm, setShowForm] = useState(false)

  return (
    <section id="maturita" className="scroll-mt-20 border-b border-ortomio-earth-200 bg-ortomio-earth-100 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Dove siamo davvero — funzione per funzione, non a parole
        </h2>
        <blockquote className="mb-6 border-l-2 border-semantic-warning pl-4 text-lg text-gray-800">
          La maturità non è un&apos;affermazione di marketing: è un campo nel codice, mostrato
          dall&apos;interfaccia stessa.
        </blockquote>

        <div className="mb-6 flex h-4 w-full max-w-md overflow-hidden rounded-sm border border-ortomio-earth-200" role="img" aria-label="15 capability stabili, 14 in beta, 2 in simulazione, su 31 totali">
          <div className="bg-ortomio-green-600" style={{ width: `${(15 / 31) * 100}%` }} title="15 stabili" />
          <div
            className="bg-ortomio-green-100"
            style={{
              width: `${(14 / 31) * 100}%`,
              backgroundImage: 'repeating-linear-gradient(45deg, #1b7a6b 0 3px, transparent 3px 7px)',
            }}
            title="14 in beta"
          />
          <div className="border-l border-dashed border-ortomio-earth-500 bg-white" style={{ width: `${(2 / 31) * 100}%` }} title="2 in simulazione" />
        </div>

        <ul className="mb-6 divide-y divide-ortomio-earth-200 border-y border-ortomio-earth-200 bg-white">
          <li className="flex items-start gap-3 p-4 text-sm">
            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-sm bg-ortomio-green-600" />
            <span><strong>15 capability stabili</strong> — nessun badge mostrato, uso pieno.</span>
          </li>
          <li className="flex items-start gap-3 p-4 text-sm">
            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-sm border border-ortomio-green-600" />
            <span>
              <strong>14 in beta</strong> — badge &quot;Beta&quot; visibile in app: funzionalmente
              complete e testate in locale, ma senza ancora le prove richieste in produzione.
            </span>
          </li>
          <li className="flex items-start gap-3 p-4 text-sm">
            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-sm border border-dashed border-ortomio-earth-500" />
            <span>
              <strong>2 in simulazione</strong> — drone e blockchain/NFT: laboratori isolati, mai
              promossi finché non c&apos;è hardware o provider reale.
            </span>
          </li>
        </ul>

        <p className="mb-3 text-sm text-gray-700">
          Un esempio concreto di questo rigore: il modulo Certificazioni dichiara apertamente{' '}
          <em>&quot;non sostituisce un audit e non emette certificati&quot;</em> — prepara
          evidenze e dossier, non promette conformità che non può garantire.
        </p>

        <p className="mb-6 text-sm text-gray-700">
          Nessuna capability beta viene promossa a stabile finché la sua prova specifica non è
          chiusa con evidenza riproducibile. Non sostituiamo il responsabile agronomico. Non
          garantiamo certificazioni ufficiali.
        </p>

        {showForm ? (
          <PilotRequestForm onClose={() => setShowForm(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="font-bold text-ortomio-green-700 underline-offset-2 hover:underline"
          >
            Vuoi un pilot reale sulla tua azienda? Parliamone →
          </button>
        )}
      </div>
    </section>
  )
}
