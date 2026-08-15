import Link from 'next/link'

export default function FinalCta() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-ortomio-green-900 sm:text-3xl">
          Prova a portare un tuo caso reale nella demo
        </h2>
        <p className="mb-8 text-gray-700">
          Configura un garden, aggiungi una coltura, guarda come il sistema costruisce una
          priorità e spiega perché. Dati fittizi, nessun impegno, puoi ricominciare da capo
          quando vuoi.
        </p>
        <Link
          href="/app"
          className="inline-block rounded-md bg-ortomio-green-600 px-6 py-3 text-base font-bold text-white shadow-sm hover:-translate-y-0.5 hover:bg-ortomio-green-700 hover:shadow-md transition"
        >
          Prova la demo ora
        </Link>
      </div>
    </section>
  )
}
