const PIPELINE = ['Semina/acquisto', 'Germinazione', 'Nursing', 'Hardening', 'Pianta F1-P001', 'Raccolto']

export default function PillarTraceability() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Dal seme al raccolto, una pianta alla volta
        </h2>
        <p className="mb-8 max-w-2xl text-gray-700">
          Ogni piantina ha un codice proprio, collegato al lotto del vivaio da cui arriva. Ogni
          operazione registra lo stato di salute prima e dopo, non solo &quot;fatto&quot;. Il
          raccolto chiude il cerchio — per quella pianta specifica, non per la zona in generale.
        </p>

        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-md border border-ortomio-earth-200 bg-ortomio-green-50 p-5">
          {PIPELINE.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span
                className={
                  step.startsWith('Pianta')
                    ? 'rounded border border-ortomio-green-700 bg-white px-2.5 py-1 text-sm font-bold text-ortomio-green-700'
                    : 'rounded border border-ortomio-earth-200 bg-white px-2.5 py-1 text-sm'
                }
              >
                {step}
              </span>
              {i < PIPELINE.length - 1 && <span className="text-gray-400">→</span>}
            </span>
          ))}
        </div>

        <p className="mb-6 max-w-2xl border-l-2 border-semantic-warning bg-semantic-warning/10 p-4 text-sm text-gray-700">
          <strong className="text-ortomio-green-900">Non è un vezzo tecnico:</strong> questa
          tracciabilità alimenta direttamente il punteggio di conformità per la certificazione
          biologica — sistema di tracciabilità, separazione bio/convenzionale, registri di
          produzione contano punti reali nel modulo Certificazioni.
        </p>
      </div>
    </section>
  )
}
