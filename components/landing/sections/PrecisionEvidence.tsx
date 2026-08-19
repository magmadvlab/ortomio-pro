'use client'

import { motion, Reveal, staggerParent, staggerItem } from '../motion'
import SectionHeader from '../SectionHeader'

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
        <SectionHeader index="04" label="predictions" />
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

        <motion.div
          variants={staggerParent(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14 grid gap-px overflow-hidden rounded-lg border border-ortomio-earth/30 bg-ortomio-earth/30 md:grid-cols-3"
        >
          {PREDICTION_PROOFS.map(([title, text], index) => (
            <motion.article key={title} variants={staggerItem()} className="bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-ortomio-green-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="h-1.5 w-1.5 rounded-[2px] bg-ortomio-green-500" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-ortomio-green-900">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{text}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
