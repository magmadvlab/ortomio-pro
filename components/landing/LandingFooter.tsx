import Link from 'next/link'
import { landingContent } from './content'

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-ortomio-green-900 px-6 py-10 text-ortomio-green-100">
      <div className="mx-auto grid max-w-6xl gap-8 text-sm sm:grid-cols-[1fr_auto] sm:items-end">
        <div><p className="font-display text-xl font-bold text-white">OrtoMio</p><p className="mt-2 max-w-md text-sm leading-relaxed">Memoria operativa e supporto decisionale per aziende agricole e consulenti agronomici.</p><p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-ortomio-harvest">{landingContent.commercialState}</p></div>
        <nav aria-label="Link nel footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/come-funziona" className="min-h-11 py-3 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-harvest">Come funziona</Link>
          <Link href="/docs/manual/README" className="min-h-11 py-3 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-harvest">Manuali</Link>
          <a href="mailto:roberto.lalinga@gmail.com" className="min-h-11 py-3 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-harvest">Contatti</a>
        </nav>
      </div>
    </footer>
  )
}
