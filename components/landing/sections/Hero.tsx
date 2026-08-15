import Link from 'next/link'

export default function Hero() {
  return (
    <section className="border-b border-ortomio-earth-200 bg-ortomio-green-50 px-6 pb-16 pt-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 flex flex-wrap gap-4 font-mono text-xs text-ortomio-earth-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-ortomio-green-600" /> misurato
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm border border-ortomio-green-600 bg-[repeating-linear-gradient(45deg,theme(colors.ortomio-green.600)_0_2px,transparent_2px_4px)]" />
            stimato
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm border border-ortomio-earth-500" /> assente
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm border border-dashed border-ortomio-earth-500" /> simulato
          </span>
        </div>

        <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ortomio-green-900 sm:text-5xl">
          Ogni priorità che OrtoMio propone ha un calcolo che puoi{' '}
          <span className="text-ortomio-green-700 underline decoration-ortomio-green-500 decoration-[3px] underline-offset-4">
            verificare
          </span>
          .
        </h1>

        <p className="mb-9 max-w-xl text-lg text-gray-700">
          Ogni priorità che OrtoMio propone porta con sé il calcolo che l&apos;ha generata: confidenza
          numerica, segnali coperti e mancanti, convenienza economica. Non un&apos;agenda in più, non
          un&apos;AI che &quot;sente&quot; cosa fare — un motore che mostra il proprio ragionamento.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/app"
            className="rounded-md bg-ortomio-green-600 px-6 py-3 text-base font-bold text-white shadow-sm hover:-translate-y-0.5 hover:bg-ortomio-green-700 hover:shadow-md transition"
          >
            Prova la demo ora
          </Link>
          <span className="text-sm text-gray-500">Ambiente demo, dati fittizi — nessun impegno.</span>
        </div>
      </div>
    </section>
  )
}
