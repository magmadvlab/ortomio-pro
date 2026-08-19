'use client'

import { Reveal } from '../motion'

const PREDICTION_PROOFS = [
  [
    'Deterministiche e versionate',
    'Ogni previsione è riproducibile: sai quale modello e quali regole l’hanno prodotta, e quando scade.',
  ],
  [
    'Qualità della fonte esplicita',
    'Misurato, stimato, misto o insufficiente: la provenienza del dato è parte del risultato, non un’annotazione nascosta.',
  ],
  [
    'Segnali mancanti visibili',
    'Quando non c’è abbastanza per prevedere, OrtoMio dice cosa manca — e come procurarlo.',
  ],
] as const

export default function PrecisionEvidence() {
  return (
    <section className="border-b border-ortomio-earth/30 bg-ortomio-earth-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
            Previsioni firmate
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Previsioni che puoi verificare, non promesse.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            Stesso input, stesso output: le previsioni di OrtoMio sono deterministiche e firmate —
            versione del modello, versione delle regole, orizzonte e finestra di validità. Se un
            dato manca, la previsione lo dichiara invece di riempirlo.
          </p>
        </Reveal>

        <div className="mt-14 grid border-y border-ortomio-earth/30 md:grid-cols-3 md:divide-x md:divide-ortomio-earth/30">
          {PREDICTION_PROOFS.map(([title, text], index) => (
            <article
              key={title}
              className="border-b border-ortomio-earth/30 py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <span className="font-mono text-xs font-bold text-ortomio-green-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-ortomio-green-900">
                {title}
              </h3>
              <p className="mt-4 leading-relaxed text-gray-700">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
