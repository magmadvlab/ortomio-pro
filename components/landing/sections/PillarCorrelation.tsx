export default function PillarCorrelation() {
  return (
    <section className="border-b border-ortomio-earth-200 bg-ortomio-earth-100 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Excel contiene i dati. OrtoMio li mette in relazione.
        </h2>
        <p className="mb-8 max-w-2xl text-gray-700">
          Un foglio può contenere meteo, rotazioni e fasi lunari, ognuno nella sua scheda. Non può
          far scattare un avviso perché fase lunare, stress idrico e pH sono fuori soglia nello
          stesso momento, sulla stessa zona.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-md border border-ortomio-earth-200 bg-white p-5">
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-500">
              rotazione — motivazione botanica reale
            </div>
            <div className="mb-3 space-y-1.5 text-sm">
              <div className="rounded border-l-2 border-gray-300 px-2 py-1 text-gray-400 line-through">
                evita — Solanacee (es. patata)
              </div>
              <div className="rounded border-l-2 border-ortomio-green-500 px-2 py-1">
                consigliato — Brassicacee
              </div>
              <div className="rounded border-l-2 border-ortomio-green-700 bg-ortomio-green-50 px-2 py-1 font-semibold">
                eccellente — Leguminose
              </div>
            </div>
            <p className="border-t border-dashed border-ortomio-earth-200 pt-3 text-sm italic text-gray-600">
              &quot;Le Solanacee depauperano il suolo. Seguire con leguminose per ripristinare
              l&apos;azoto.&quot; — dopo un ciclo di pomodoro.
            </p>
          </div>

          <div className="rounded-md border border-ortomio-earth-200 bg-white p-5">
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-gray-500">
              briefing del giorno — una lettura correlata
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {['Meteo sintetico', 'Fase lunare', 'GDD (growing degree days)', 'Stress idrico', 'Fotoperiodo', 'Azioni prioritizzate'].map(
                (item) => (
                  <li key={item} className="relative pl-3 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-ortomio-green-600">
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ortomio-earth-200 pt-6">
          {['piano di semina', 'piano di rotazione', 'timing raccolta', 'irrigazione', 'nutrizione'].map((chip) => (
            <span key={chip} className="rounded-full border border-ortomio-green-600 px-2.5 py-1 font-mono text-xs text-ortomio-green-700">
              {chip}
            </span>
          ))}
          <span className="ml-1 text-sm text-gray-500">
            → ogni proposta AI resta dentro un unico percorso: punteggio → spiegazione → task →
            ledger → feedback. Mai fuori da lì.
          </span>
        </div>
      </div>
    </section>
  )
}
