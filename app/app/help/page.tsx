'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronRight, Search } from 'lucide-react'
import { getEnabledFeatures } from '@/config/features'
import { getVisibleCapabilities, type CapabilityDescriptor } from '@/config/capabilities'
import { useCapabilities } from '@/components/capabilities/CapabilityProvider'
import { CapabilityBadge, CapabilityIconView } from '@/components/capabilities/CapabilityVisuals'

export default function HelpPage() {
  const [query, setQuery] = useState('')
  const { access } = useCapabilities()
  const sections = useMemo(() => getVisibleCapabilities(access, 'help', new Set(getEnabledFeatures()))
    .filter(item => item.helpHref)
    .filter(item => `${item.label} ${item.description} ${item.group}`.toLocaleLowerCase('it-IT').includes(query.trim().toLocaleLowerCase('it-IT')))
    .reduce<Record<string, CapabilityDescriptor[]>>((result, item) => {
      ;(result[item.group] ??= []).push(item)
      return result
    }, {}), [access, query])

  return <div className="p-4 sm:p-6">
    <header className="mb-6">
      <h1 className="flex items-center gap-3 text-2xl font-bold"><BookOpen className="text-blue-600" /> Manuale utente</h1>
      <p className="mt-1 text-gray-600">Guida alle capability disponibili per il tuo ruolo e piano.</p>
    </header>
    <div className="relative mb-8 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cerca nella documentazione..." className="w-full rounded-lg border py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
    </div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(sections).map(([group, items]) => <section key={group} className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">{group}</h2>
        <div className="space-y-1">{items.map(item => <Link key={item.id} href={item.helpHref!} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-gray-50">
          <CapabilityIconView icon={item.icon} /><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-gray-900">{item.label}</span><span className="block truncate text-xs text-gray-500">{item.description}</span></span><CapabilityBadge capability={item} /><ChevronRight size={16} className="text-gray-400" />
        </Link>)}</div>
      </section>)}
    </div>
    {Object.keys(sections).length === 0 && <p className="rounded-lg border bg-white p-8 text-center text-gray-500">Nessuna guida corrisponde alla ricerca.</p>}
    <div className="mt-8 rounded-lg bg-blue-50 p-5 text-sm text-blue-950">
      Serve assistenza? <a className="font-semibold underline" href="mailto:roberto.lalinga@gmail.com">Contatta il supporto</a>.
    </div>
  </div>
}
