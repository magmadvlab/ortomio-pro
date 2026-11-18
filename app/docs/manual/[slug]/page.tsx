import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import ManualMarkdown from '@/components/help/ManualMarkdown'
import { getManualChapters, readManualChapter } from '@/lib/manual/content'
import { headingId } from '@/lib/manual/navigation'
import { MANUAL_GROUPS, MANUAL_UPDATED } from '@/config/manual'

type DocPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params
  const content = readManualChapter(slug)
  return { title: `${content?.split('\n')[0].replace(/^#\s+/, '') ?? 'Capitolo non trovato'} | Manuale OrtoMio` }
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params
  if (slug === 'README') redirect('/docs/manual')
  const content = readManualChapter(slug)
  if (!content) notFound()
  const chapters = getManualChapters()
  const index = chapters.findIndex(chapter => chapter.slug === slug)
  const previous = index > 0 ? chapters[index - 1] : null
  const next = index >= 0 ? chapters[index + 1] : null
  const headings = [...content.matchAll(/^## (.+)$/gm)].map(match => ({ title: match[1], id: headingId(match[1]) }))

  return <div className="min-h-screen bg-gray-50">
    <header className="sticky top-0 z-10 border-b border-gray-300 bg-white px-4 py-4 print:static">
      <nav aria-label="Navigazione del manuale" className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-sm font-medium">
        <Link href="/docs/manual" className="rounded text-green-800 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">← Indice e ricerca</Link>
        <Link href="/app/help" className="rounded text-green-800 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Manuale nell’app</Link>
        <Link href="/app" className="rounded text-green-800 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Torna all’app</Link>
      </nav>
    </header>
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <p className="mb-4 text-sm text-gray-600">Manuale OrtoMio · aggiornato il {MANUAL_UPDATED}</p>
      {headings.length > 0 && <nav aria-label="In questo capitolo" className="mb-6 rounded-xl border border-gray-300 bg-white p-5 print:hidden"><h2 className="mb-3 font-semibold text-gray-900">In questo capitolo</h2><ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm">{headings.map(heading => <li key={heading.id}><a href={`#${heading.id}`} className="text-green-800 underline underline-offset-4">{heading.title}</a></li>)}</ul></nav>}
      <article className="min-w-0 break-words rounded-xl border border-gray-200 bg-white px-5 py-7 sm:p-10"><ManualMarkdown content={content} /></article>
      <nav aria-label="Capitoli precedente e successivo" className="mt-6 grid gap-3 sm:grid-cols-2">
        {previous && <Link href={`/docs/manual/${previous.slug}`} className="rounded-lg border border-gray-300 bg-white p-4 text-green-800"><span className="block text-xs text-gray-600">Capitolo precedente</span>← {previous.title}</Link>}
        {next && <Link href={`/docs/manual/${next.slug}`} className="rounded-lg border border-gray-300 bg-white p-4 text-green-800"><span className="block text-xs text-gray-600">Capitolo successivo</span>{next.title} →</Link>}
      </nav>
    </main>
  </div>
}

export function generateStaticParams() {
  return MANUAL_GROUPS.flatMap(group => group.slugs.map(slug => ({ slug })))
}
