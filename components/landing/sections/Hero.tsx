'use client'

import Image from 'next/image'
import { motion, useReducedMotion, EASE_OUT_EXPO } from '../motion'
import { landingContent } from '../content'

const BRIEFING_READOUT = [
  ['BRIEFING', '06:12'],
  ['GDD ACC.', '428'],
  ['STRESS IDRICO', 'basso'],
  ['SEGNALI', '14/21'],
  ['FASE', 'fioritura'],
] as const

export default function Hero() {
  const reduced = useReducedMotion()

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE_OUT_EXPO },
  })

  return (
    <section className="relative isolate overflow-hidden bg-ortomio-green-900 text-white">
      {/* Reticolo satellitare sul fondo scuro */}
      <div className="ortomio-grid-bg absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ortomio-green-900 via-ortomio-green-900/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-[82vh] max-w-[96rem] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex items-end px-6 py-24 sm:px-12 sm:py-32 lg:px-16">
          <div className="max-w-4xl">
            <motion.p
              {...rise(0)}
              className="mb-6 text-xs font-bold uppercase tracking-[0.22em] text-ortomio-harvest"
            >
              {landingContent.eyebrow}
            </motion.p>
            <motion.h1
              {...rise(0.08)}
              className="font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[5.35rem]"
            >
              {landingContent.title}
            </motion.h1>
            <motion.p
              {...rise(0.16)}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-ortomio-green-100"
            >
              {landingContent.summary}
            </motion.p>
            <motion.a
              {...rise(0.24)}
              href="#prova-guidata"
              className="mt-8 inline-flex min-h-12 items-center bg-ortomio-harvest px-6 py-3 font-bold text-ortomio-green-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-harvest focus-visible:ring-offset-2 focus-visible:ring-offset-ortomio-green-900"
            >
              {landingContent.finalCta}
            </motion.a>

            {/* Readout del briefing: valori illustrativi, meccanismo reale */}
            <motion.dl
              {...rise(0.34)}
              className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-ortomio-green-200"
              aria-label="Esempio illustrativo di briefing giornaliero"
            >
              <span className="flex items-center gap-2 text-ortomio-green-300">
                <span className="ortomio-signal-dot" aria-hidden="true" />
                DIRECTOR
              </span>
              {BRIEFING_READOUT.map(([key, value]) => (
                <span key={key} className="flex items-baseline gap-2 whitespace-nowrap">
                  <dt className="text-ortomio-green-400">{key}</dt>
                  <dd className="font-bold text-ortomio-green-100">{value}</dd>
                </span>
              ))}
              <span className="ortomio-caret" aria-hidden="true" />
              <span className="w-full text-[10px] uppercase tracking-wider text-ortomio-green-500">
                esempio illustrativo
              </span>
            </motion.dl>
          </div>
        </div>

        <motion.figure
          initial={reduced ? false : { scale: 1.06, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: EASE_OUT_EXPO }}
          className="relative min-h-[28rem] overflow-hidden lg:min-h-full"
        >
          <Image src="/landing/production_greenhouse.webp" alt="Serra agricola professionale con filari di pomodori in produzione" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ortomio-green-900/50 via-transparent to-transparent" aria-hidden="true" />
        </motion.figure>
      </div>
    </section>
  )
}
