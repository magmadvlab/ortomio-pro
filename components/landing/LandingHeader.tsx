import Link from 'next/link'
import Image from 'next/image'

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-green-700 focus-visible:ring-offset-2'

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ortomio-earth/20 bg-ortomio-paper/95 px-5 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
        <Link href="/" className={`flex min-h-11 items-center gap-2 ${focus}`} aria-label="OrtoMio, homepage">
          <Image src="/logo.png" alt="" width={32} height={32} />
          <span className="font-display text-xl font-extrabold tracking-tight text-ortomio-green-900">OrtoMio</span>
        </Link>
        <nav aria-label="Navigazione principale" className="flex items-center gap-1 sm:gap-5">
          <Link href="/#come-funziona" className={`hidden min-h-11 items-center px-2 text-sm text-ortomio-green-900 hover:text-ortomio-green-600 md:flex ${focus}`}>Come funziona</Link>
          <Link href="/#colture" className={`hidden min-h-11 items-center px-2 text-sm text-ortomio-green-900 hover:text-ortomio-green-600 md:flex ${focus}`}>Colture</Link>
          <Link href="/login" className={`flex min-h-11 items-center border-l border-ortomio-earth/30 px-3 text-sm font-bold text-ortomio-green-900 hover:text-ortomio-green-600 sm:pl-5 ${focus}`}>Accedi</Link>
        </nav>
      </div>
    </header>
  )
}
