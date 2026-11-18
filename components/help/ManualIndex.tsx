'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Search, ArrowRight } from 'lucide-react'
import { MANUAL_UPDATED, MANUAL_GROUPS, type ManualChapter } from '@/config/manual'
import { matchesManualSearch } from '@/lib/manual/navigation'

export default function ManualIndex({ chapters }: { chapters: ManualChapter[] }) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => chapters.filter(chapter => matchesManualSearch(`${chapter.group} ${chapter.content}`, query)), [chapters, query])
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <header className="mb-8 max-w-3xl">
      <p className="mb-3 text-sm font-medium text-green-800">OrtoMio · aggiornato il {MANUAL_UPDATED}</p>
      <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"><BookOpen aria-hidden="true" className="shrink-0 text-green-800" /> Manuale passo per passo</h1>
      <p className="mt-4 text-lg leading-7 text-gray-700">Dalla prima apertura al lavoro quotidiano: dove andare, cosa compilare, quando intervenire e come verificare il risultato.</p>
      <p className="mt-3 text-sm leading-6 text-gray-600">Trova i passaggi, i campi da compilare e i controlli da fare dopo ogni operazione. Le guide indicano anche i dati e i permessi necessari.</p>
    </header>
    <nav aria-label="Percorsi per iniziare" className="mb-8 grid gap-3 sm:grid-cols-3">
      {[
        ['27-quick-start', 'È la prima volta', 'Configura il tuo spazio e registra la prima attività.'],
        ['44-daily-checklist', 'Che cosa faccio oggi?', 'Segui la lista di controllo del lavoro quotidiano.'],
        ['42-troubleshooting', 'Qualcosa non funziona', 'Trova il problema e il prossimo passo utile.'],
      ].map(([slug, title, summary]) => <Link key={slug} href={`/docs/manual/${slug}`} className="rounded-xl border border-green-200 bg-green-50 p-5 text-green-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-800">
        <span className="flex items-center justify-between gap-2 font-semibold">{title}<ArrowRight size={18} aria-hidden="true" /></span><span className="mt-2 block text-sm leading-6">{summary}</span>
      </Link>)}
    </nav>
    <div className="mb-8">
      <label htmlFor="manual-search" className="mb-2 block font-medium text-gray-900">Cerca in tutti i capitoli</label>
      <div className="relative max-w-2xl"><Search size={20} aria-hidden="true" className="absolute left-3 top-3.5 text-gray-500" /><input id="manual-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Per esempio: creare un orto, irrigazione, password" className="w-full rounded-lg border border-gray-400 bg-white py-3 pl-10 pr-4 text-gray-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-green-800" /></div>
      <p role="status" className="mt-2 text-sm text-gray-600">{results.length} capitoli {query.trim() ? 'trovati' : 'disponibili'}. La ricerca include il testo delle istruzioni.</p>
    </div>
    <div className="space-y-10">{MANUAL_GROUPS.map(group => {
      const items = results.filter(chapter => chapter.group === group.title)
      if (!items.length) return null
      return <section key={group.title}><h2 className="mb-4 text-xl font-semibold text-gray-950">{group.title}</h2><div className="grid gap-3 md:grid-cols-2">{items.map(chapter => <Link key={chapter.slug} href={`/docs/manual/${chapter.slug}`} className="rounded-xl border border-gray-300 bg-white p-5 hover:border-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-800"><h3 className="font-semibold text-green-900">{chapter.title}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{chapter.summary}</p></Link>)}</div></section>
    })}</div>
    {results.length === 0 && <p className="rounded-xl border bg-white p-6 text-gray-700">Nessun capitolo trovato. Prova una parola più semplice, come “acqua”, “raccolto” o “accesso”. <button onClick={() => setQuery('')} className="font-semibold text-green-800 underline">Mostra tutti i capitoli</button></p>}
    <footer className="mt-10 flex flex-wrap gap-5 border-t border-gray-300 pt-6 text-sm"><Link href="/app" className="text-green-800 underline">Torna all’app</Link><Link href="/docs/manual/33-support-contacts" className="text-green-800 underline">Come chiedere assistenza</Link><Link href="/docs/manual/32-roadmap" className="text-green-800 underline">Scegli il percorso giusto</Link></footer>
  </div>
}
