const PROOFS = [
  [
    'Osserva dove serve attenzione',
    'NDVI, meteo e sensori disponibili aiutano a individuare zone, filari e piante da controllare.',
  ],
  [
    'Ricostruisce cosa è stato fatto',
    'Acqua, nutrimenti, trattamenti, operatori e quantità restano collegati al punto in cui sono stati applicati.',
  ],
  [
    'Verifica come ha risposto la coltura',
    'Salute prima e dopo, efficacia, raccolto, qualità e costi completano la storia dell’intervento.',
  ],
] as const

export default function ReasonWhySection() {
  return (
    <section id="perche-ortomio" className="border-b border-ortomio-earth/30 bg-ortomio-earth-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ortomio-green-900 sm:text-5xl">
            Un’unica lettura, dal campo alla singola pianta.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-700">
            Quando i dati satellitari sono disponibili, OrtoMio evidenzia le zone da controllare,
            integra le misure dei sensori collegati, associa acqua, nutrimenti e trattamenti alle
            singole piante e confronta ogni intervento con il risultato ottenuto. La sua AI mette
            queste informazioni in relazione e le trasforma in indicazioni motivate.
          </p>
        </div>

        <div className="mt-14 grid border-y border-ortomio-earth/30 md:grid-cols-3 md:divide-x md:divide-ortomio-earth/30">
          {PROOFS.map(([title, text], index) => (
            <article key={title} className="border-b border-ortomio-earth/30 py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
              <span className="font-mono text-xs font-bold text-ortomio-harvest">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-ortomio-green-900">{title}</h3>
              <p className="mt-3 leading-relaxed text-gray-700">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
