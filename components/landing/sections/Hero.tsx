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

/** Parcelle che si accendono sul reticolo, come letture NDVI. */
const PLOTS = [
  { left: '18%', top: '22%', delay: '0.4s' },
  { left: '64%', top: '12%', delay: '2.1s' },
  { left: '38%', top: '58%', delay: '3.6s' },
  { left: '82%', top: '44%', delay: '5.2s' },
] as const

export default function Hero() {
  const reduced = useReducedMotion()

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE_OUT_EXPO },
  })

  const words = landingContent.title.split(' ')

  return (
    <section className="relative isolate overflow-hidden bg-ortomio-green-900 text-white">
      {/* Reticolo satellitare e parcelle in lettura */}
      <div className="ortomio-grid-bg absolute inset-0" aria-hidden="true">
        {PLOTS.map((plot) => (
          <span
            key={`${plot.left}-${plot.top}`}
            className="ortomio-plot"
            style={{ left: plot.left, top: plot.top, animationDelay: plot.delay }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-ortomio-green-900 via-ortomio-green-900/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-[82vh] max-w-[96rem] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex items-end px-6 py-24 sm:px-12 sm:py-32 lg:px-16 lg:py-20">
          <div className="max-w-4xl">
            <motion.p
              {...rise(0)}
              className="mb-6 text-xs font-bold uppercase tracking-[0.22em] text-ortomio-harvest"
            >
              {landingContent.eyebrow}
            </motion.p>

            {/* Titolo cinetico: le parole salgono da maschere di riga */}
            <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[4.1rem]">
              {words.map((word, i) => (
                <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={reduced ? false : { y: '112%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.08 + i * 0.05, ease: EASE_OUT_EXPO }}
                  >
                    {word}
                    {i < words.length - 1 ? '\u00A0' : ''}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              {...rise(0.4)}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-ortomio-green-100"
            >
              {landingContent.summary}
            </motion.p>
            <motion.a
              {...rise(0.48)}
              href="#prova-guidata"
              className="mt-6 inline-flex min-h-12 items-center bg-ortomio-harvest px-6 py-3 font-bold text-ortomio-green-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-harvest focus-visible:ring-offset-2 focus-visible:ring-offset-ortomio-green-900"
            >
              {landingContent.finalCta}
            </motion.a>

            {/* Readout del briefing: valori illustrativi, meccanismo reale */}
            <motion.dl
              {...rise(0.58)}
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

        {/* La foto come parcella monitorata: marcatori agli angoli */}
        <motion.figure
          initial={reduced ? false : { scale: 1.06, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: EASE_OUT_EXPO }}
          className="relative min-h-[28rem] overflow-hidden lg:min-h-full"
        >
          <Image src="/landing/production-greenhouse.webp" alt="Serra agricola professionale con filari di pomodori in produzione" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ortomio-green-900/50 via-transparent to-transparent" aria-hidden="true" />

          <div className="pointer-events-none absolute inset-5" aria-hidden="true">
            <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-ortomio-harvest/80" />
            <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-ortomio-harvest/80" />
            <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-ortomio-harvest/80" />
            <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-ortomio-harvest/80" />
            <span className="absolute bottom-1 left-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ortomio-harvest">
              campo · vista 01
            </span>
            <span className="absolute right-8 top-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ortomio-harvest">
              ◱ inquadra
            </span>
          </div>
        </motion.figure>
      </div>
    </section>
  )
}
