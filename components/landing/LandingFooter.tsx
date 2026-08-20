import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-ortomio-green-900 px-6 py-10 text-ortomio-green-100">
      <div className="mx-auto grid max-w-6xl gap-8 text-sm sm:grid-cols-[1fr_auto] sm:items-end">
        <div><p className="font-display text-xl font-bold text-white">OrtoMio</p><p className="mt-2 max-w-md text-sm leading-relaxed">La piattaforma agronomica per aziende e consulenti che vogliono guidare le decisioni di campo con la certezza dei dati.</p></div>
        <nav aria-label="Link nel footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/#perche-ortomio" className="min-h-11 py-3 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-harvest">Come funziona</Link>
          <Link href="/#colture" className="min-h-11 py-3 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-harvest">Colture</Link>
        </nav>
      </div>
    </footer>
  )
}
