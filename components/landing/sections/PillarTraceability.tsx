const NURSERY_STEPS = ['Semina o acquisto', 'Germinazione', 'Crescita', 'Preparazione al trapianto']
const FIELD_STEPS = ['Filare 1 · Pianta 001', 'Interventi', 'Raccolto']
const PLANT_RECORD = [
  'Acqua erogata',
  'Nutrimenti, prodotti e dosi',
  'Trattamenti e lavorazioni',
  'Data e operatore',
  'Salute prima e dopo',
  'Quantità, qualità e destinazione del raccolto',
] as const

export default function PillarTraceability() {
  return (
    <section className="border-b border-ortomio-earth-200 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Dal vivaio al filare, ogni pianta conserva la sua storia
        </h2>
        <p className="mb-8 max-w-2xl text-gray-700">
          Nel vivaio segui la crescita delle piante dalla semina o dall’acquisto: germinazione,
          cure, sviluppo e preparazione al trapianto. Quando una piantina entra in campo, il suo
          codice viene associato alla posizione esatta nel filare.
        </p>

        <div className="mb-8 grid gap-5 rounded-md border border-ortomio-earth-200 bg-ortomio-green-50 p-5 md:grid-cols-2">
          {[
            { label: 'In vivaio', steps: NURSERY_STEPS },
            { label: 'In campo', steps: FIELD_STEPS },
          ].map((phase) => (
            <div key={phase.label}>
              <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-ortomio-green-700">{phase.label}</p>
              <div className="flex flex-wrap items-center gap-y-2">
                {phase.steps.map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    {i > 0 && <span className="mx-1 h-px w-4 bg-ortomio-earth-300" aria-hidden="true" />}
                    <span className="rounded border border-ortomio-earth-200 bg-white px-2.5 py-1.5 text-sm">{step}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 max-w-2xl rounded-md border border-ortomio-earth-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-ortomio-green-900">
            Come cambia la pianta dopo ogni intervento
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-gray-700">
            Una volta trapiantata, ogni pianta, vite o albero continua ad avere una scheda propria.
            Interventi, stato di salute e raccolto restano collegati a quella specifica posizione.
          </p>
          <div className="mb-6 grid gap-2 sm:grid-cols-2">
            {PLANT_RECORD.map((item) => (
              <div
                key={item}
                className="border-l-2 border-ortomio-harvest bg-ortomio-earth-50 px-3 py-2 text-sm leading-relaxed text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
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
                <span className="text-center text-xs leading-tight text-gray-600">{op.label}</span>
                <span className="font-mono text-xs text-gray-600">{op.before}→{op.after}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Esempio illustrativo: il confronto prima e dopo aiuta a capire come la pianta ha
            risposto al lavoro eseguito.
          </p>
        </div>

        <div className="max-w-2xl rounded-md border border-semantic-warning/40 bg-semantic-warning/10 p-4 text-sm text-gray-700">
          <strong className="text-ortomio-green-900">Dati pronti per registri e certificazioni.</strong>{' '}
          La storia completa di ogni pianta rende più semplice ricostruire le lavorazioni,
          distinguere le produzioni e preparare le informazioni richieste.
        </div>
      </div>
    </section>
  )
}
