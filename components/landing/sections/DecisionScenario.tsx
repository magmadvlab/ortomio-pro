'use client'

import { motion, staggerParent, staggerItem } from '../motion'
import SectionHeader from '../SectionHeader'

const MORNING_OUTPUTS = [
  {
    label: 'Quadro del giorno',
    text: 'Meteo, stress idrico e termico, fotoperiodo e GDD accumulati. Hai subito il quadro sintetico delle prossime ore, con la certezza dell’affidabilità di ogni fonte.',
  },
  {
    label: 'Priorità di intervento',
    text: 'Cosa fare prima, perché conviene agire subito e con quale livello di precisione. Se mancano dati per decidere al meglio, il sistema ti indica subito come recuperarli.',
  },
  {
    label: 'Azioni pronte all’uso',
    text: 'Dalla teoria alla pratica in un click: avvia o assegna direttamente le operazioni di irrigazione, nutrizione, difesa, lavorazione o raccolta.',
  },
  {
    label: 'Previsioni verificabili',
    text: 'Analisi di resa, risorse e rischio malattie basate su modelli scientifici trasparenti. Vedi sempre quali dati sono stati usati e fino a quando la stima è valida.',
  },
  {
    label: 'Storico e tracciabilità',
    text: 'Registra il motivo di ogni scelta, l’intervento eseguito e il risultato finale. Costruisci una memoria storica attiva che aumenta il valore della tua azienda stagione dopo stagione.',
  },
] as const

export default function DecisionScenario() {
  return (
    <section id="come-funziona" className="relative isolate overflow-hidden bg-ortomio-green-900 px-6 py-20 text-white sm:py-28">
      <div className="ortomio-grid-bg absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeader index="02" label="daily-output" dark />
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Dalla prima luce del mattino all’intervento in campo, senza dispersioni.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-ortomio-green-100">
            Ogni mattina OrtoMio trasforma una mole di dati complessi in un piano di lavoro
            chiaro: le urgenze reali, gli interventi pronti da avviare e la memoria di ciò che è
            stato fatto. Niente più appunti dispersi o decisioni al buio: tutto parte da un’unica
            visione d’insieme.
          </p>
        </div>

        <motion.ol
          variants={staggerParent(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14 grid gap-px overflow-hidden rounded-lg border border-white/15 bg-white/15 md:grid-cols-2 lg:grid-cols-5"
        >
          {MORNING_OUTPUTS.map(({ label, text }, index) => (
            <motion.li
              key={label}
              variants={staggerItem(14)}
              className="bg-ortomio-green-900 p-6 lg:p-5"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-ortomio-harvest">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-lg font-bold text-white">{label}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ortomio-green-100">{text}</p>
            </motion.li>
          ))}
        </motion.ol>

        <p className="mt-6 font-mono text-xs uppercase tracking-wider text-ortomio-green-400">
          Sistema · output giornaliero · decisione umana
        </p>
      </div>
    </section>
  )
}
