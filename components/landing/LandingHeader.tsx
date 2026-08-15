import Link from 'next/link'
import Image from 'next/image'

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ortomio-earth-200 bg-ortomio-green-50/90 px-6 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between py-3">
        <div className="flex items-baseline gap-2">
          <Image src="/logo.png" alt="" width={28} height={28} className="rounded" />
          <span className="font-display text-lg font-extrabold tracking-tight text-ortomio-green-900">
            OrtoMio
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 rounded-full border border-semantic-warning/50 bg-semantic-warning/10 px-2.5 py-1 font-mono text-xs text-semantic-warning-text sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-semantic-warning" />
            demo/beta
          </span>
          <Link
            href="/login"
            className="py-2 text-sm text-ortomio-earth-700 underline-offset-2 hover:underline"
          >
            Accedi
          </Link>
          <Link
            href="/app"
            className="rounded-md bg-ortomio-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-ortomio-green-700"
          >
            Prova la demo
          </Link>
        </div>
      </div>
    </header>
  )
}
