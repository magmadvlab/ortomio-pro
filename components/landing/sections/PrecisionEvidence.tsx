'use client'

import { motion, Reveal, staggerParent, staggerItem } from '../motion'
import SectionHeader from '../SectionHeader'

const PREDICTION_PROOFS = [
  [
    'Scienza riproducibile e verificabile',
    'Nessuna sensazione: ogni stima si basa su regole agronomiche precise e modelli aggiornati. Puoi sempre risalire ai criteri che l’hanno generata e verificarne la scadenza.',
  ],
  [
    'Origine del dato sempre dichiarata',
    'Che si tratti di un valore misurato sul campo, stimato o misto, la qualità della fonte viaggia sempre insieme al risultato. Sai esattamente quanta certezza c’è dietro ogni numero.',
  ],
  [
    'Dati mancanti subito in evidenza',
    'Quando non ci sono abbastanza informazioni per una stima affidabile, OrtoMio lo dichiara apertamente e ti indica quali sensori o rilevamenti servono per sbloccare la previsione.',
  ],
] as const

export default function PrecisionEvidence() {
  return (
    <section className="border-b border-ortomio-earth/30 bg-ortomio-earth-100 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader index="04" label="predictions" />
        <Reveal className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
            Previsioni firmate
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Previsioni trasparenti e tracciabili. Zero stime al buio.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            Ogni previsione di OrtoMio ha un’origine chiara: sai sempre quale modello è stato
            usato, quali dati lo supportano e fino a quando è valida. Se le informazioni non
            bastano, il sistema non tira a indovinare: ti mostra subito cosa manca.
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
