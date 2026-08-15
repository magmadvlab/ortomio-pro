const EVIDENCE = [
  {
    title: 'NDVI: osserva dove approfondire',
    text: 'Quando i dati satellitari sono disponibili, le differenze di vigore diventano aree da controllare e restano collegate a colture, filari, irrigazioni e storico.',
  },
  {
    title: 'IoT: registra ciò che viene misurato',
    text: 'Con dispositivi associati, la telemetria registra portata e litri erogati. OrtoMio mantiene distinti valori misurati, inseriti manualmente, pianificati e calcolati.',
  },
] as const

const DATA_STATES = [
  ['Misurato', 'Dispositivo associato e telemetria reale'],
  ['Manuale', 'Quantità inserita dall’operatore'],
  ['Pianificato', 'Volume previsto'],
  ['Calcolato', 'Valore ricavato dai dati disponibili'],
] as const

export default function PrecisionEvidence() {
  return (
    <section className="border-b border-ortomio-earth/30 bg-ortomio-earth-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ortomio-harvest">
            Osservazione e misure
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Vedi dove controllare. Sai da dove arriva ogni valore.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            NDVI guida il controllo sul campo: non formula una diagnosi. Le misure IoT restano
            riconoscibili solo quando arrivano da un dispositivo associato e dalla sua telemetria.
          </p>
        </div>

        <div className="mt-14 grid border-y border-ortomio-earth/30 lg:grid-cols-2 lg:divide-x lg:divide-ortomio-earth/30">
          {EVIDENCE.map(({ title, text }, index) => (
            <article
              key={title}
              className="border-b border-ortomio-earth/30 py-8 last:border-b-0 lg:border-b-0 lg:px-10 lg:first:pl-0 lg:last:pr-0"
            >
              <span className="font-mono text-xs font-bold text-ortomio-harvest">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-ortomio-green-900">
                {title}
              </h3>
              <p className="mt-4 leading-relaxed text-gray-700">{text}</p>

              {index === 1 && (
                <>
                  <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                    {DATA_STATES.map(([term, description]) => (
                      <div key={term} className="border-l-2 border-ortomio-harvest pl-3">
                        <dt className="font-mono text-xs font-bold uppercase tracking-wider text-ortomio-green-800">
                          {term}
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed text-gray-700">{description}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-6 text-sm leading-relaxed text-gray-600">
                    Il volume comandato non indica automaticamente la quantità arrivata alle
                    radici.
                  </p>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
