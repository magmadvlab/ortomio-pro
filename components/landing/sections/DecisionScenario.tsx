'use client'

import { motion, staggerParent, staggerItem } from '../motion'

const MORNING_OUTPUTS = [
  {
    label: 'Briefing',
    text: 'Meteo sintetico, stress idrico e termico, fotoperiodo, fase lunare, GDD accumulati: il quadro del giorno, con la qualità dichiarata di ogni fonte.',
  },
  {
    label: 'Coda delle azioni',
    text: 'Cosa fare prima, perché, con quale confidenza — e quali segnali mancano per decidere meglio.',
  },
  {
    label: 'Task eseguibili',
    text: 'Dalla proposta all’azione: link diretti a irrigazione, nutrizione, raccolta e lavorazioni.',
  },
  {
    label: 'Previsioni firmate',
    text: 'Rischio malattie, resa e risorse: ogni previsione porta versione del modello, dati usati e finestra di validità.',
  },
  {
    label: 'Memoria',
    text: 'Perché hai deciso, cosa è stato fatto, com’è andata: la storia che vale anche la prossima stagione.',
  },
] as const

export default function DecisionScenario() {
  return (
    <section id="come-funziona" className="relative isolate overflow-hidden bg-ortomio-green-900 px-6 py-20 text-white sm:py-28">
      <div className="ortomio-grid-bg absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Dal briefing al campo, senza passaggi persi.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-ortomio-green-100">
            Ogni mattina il Director compone ciò che serve in un unico flusso: il quadro del
            giorno, le azioni in ordine di priorità, i task pronti da eseguire, le previsioni
            firmate e la memoria di ogni decisione. Niente si perde tra uno strumento e l’altro,
            perché tutto nasce dallo stesso contesto.
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
          Director · output giornaliero · decisione umana
        </p>
      </div>
    </section>
  )
}
