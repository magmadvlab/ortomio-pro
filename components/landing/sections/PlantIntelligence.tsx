'use client'

import { motion, Reveal, staggerParent, staggerItem } from '../motion'
import SectionHeader from '../SectionHeader'

const PLANT_AI = [
  [
    'Analisi fotografica',
    'Esposizione, salute, ritmo di crescita e fase fenologica: dalla foto dell’appezzamento o della singola pianta, con la confidenza dichiarata.',
  ],
  [
    'Allerte salute',
    'Rischio malattia dal meteo, parassiti stagionali, deficit idrico e soglie dei sensori: l’attenzione arriva prima del danno.',
  ],
  [
    'Storia per individuo',
    'Codice, filare, posizione: potature, trattamenti e raccolte restano legati alla pianta, non alla media dell’appezzamento.',
  ],
] as const

export default function PlantIntelligence() {
  return (
    <section className="border-b border-ortomio-earth/30 bg-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader index="05" label="plant-intel" />
        <Reveal className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-green-700">
            Piante e alberi
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Ogni pianta ha un codice, una storia — e un occhio AI.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            Scatta una foto: OrtoMio la analizza per esposizione solare, stato di salute, ritmo di
            crescita e fase. Ogni pianta e ogni albero mantiene codice, posizione, varietà e la
            sequenza di ciò che ha ricevuto e prodotto.
          </p>
        </Reveal>

        <motion.div
          variants={staggerParent(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14 grid gap-px overflow-hidden rounded-lg border border-ortomio-earth/30 bg-ortomio-earth/30 md:grid-cols-3"
        >
          {PLANT_AI.map(([title, text], index) => (
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
