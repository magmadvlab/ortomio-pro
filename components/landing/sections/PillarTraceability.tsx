const PIPELINE = ['Semina/acquisto', 'Germinazione', 'Nursing', 'Hardening', 'Pianta F1-P001', 'Raccolto']

export default function PillarTraceability() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-5xl">
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

        <div className="mb-6 max-w-2xl rounded-md border border-ortomio-earth-200 bg-white p-4">
          <p className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-500">
            Pianta F1-P001 — storia salute per operazione
          </p>
          <div className="flex items-end gap-3">
            {[
              { label: 'Trapianto', before: 78, after: 76 },
              { label: 'Irrigazione', before: 76, after: 81 },
              { label: 'Concimazione', before: 81, after: 85 },
              { label: 'Trattamento', before: 85, after: 88 },
            ].map((op) => (
              <div key={op.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-16 w-full items-end gap-1">
                  <div
                    className="flex-1 rounded-t-sm bg-ortomio-earth-200"
                    style={{ height: `${op.before}%` }}
                    title={`Prima: ${op.before}`}
                  />
                  <div
                    className="flex-1 rounded-t-sm bg-ortomio-green-600"
                    style={{ height: `${op.after}%` }}
                    title={`Dopo: ${op.after}`}
                  />
                </div>
                <span className="text-center text-[10px] leading-tight text-gray-500">{op.label}</span>
                <span className="font-mono text-[10px] text-gray-400">{op.before}→{op.after}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-500">
            Esempio illustrativo — ogni operazione reale registra un valore di salute prima e dopo (0-100), non solo &quot;fatto&quot;.
          </p>
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
