'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { getEnabledFeaturesForAccess } from '@/config/capabilities'
import { getVisibleCapabilities, type CapabilityDescriptor } from '@/config/capabilities'
import { useCapabilities } from '@/components/capabilities/CapabilityProvider'
import { CapabilityBadge, CapabilityIconView } from '@/components/capabilities/CapabilityVisuals'
import { UI_LAYERS } from '@/components/shared/uiLayers'

export function ProfessionalSidebar() {
  const pathname = usePathname()
  const { access } = useCapabilities()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(false)
  const capabilities = useMemo(
    () => getVisibleCapabilities(access, 'desktop', getEnabledFeaturesForAccess(access)).filter(item => item.route),
    [access],
  )
  const groups = useMemo(() => capabilities.reduce<Record<string, CapabilityDescriptor[]>>((result, item) => {
    const groupItems = result[item.group] ?? (result[item.group] = [])
    groupItems.push(item)
    return result
  }, {}), [capabilities])

  useEffect(() => {
    try { setCollapsed(new Set(JSON.parse(localStorage.getItem('ortomio_sidebar_collapsed') ?? '[]'))) } catch {}
  }, [])

  const toggle = (group: string) => setCollapsed(previous => {
    const next = new Set(previous)
    if (next.has(group)) {
      next.delete(group)
    } else {
      next.add(group)
    }
    localStorage.setItem('ortomio_sidebar_collapsed', JSON.stringify([...next]))
    return next
  })

  return <>
    <button onClick={() => setOpen(!open)} className="fixed left-3 top-3 rounded-lg border bg-white p-2.5 shadow-md lg:hidden" style={{ zIndex: UI_LAYERS.sidebarToggle }} aria-label="Apri menu">
      <span className="block text-xl leading-none">{open ? '×' : '☰'}</span>
    </button>
    {open && <button className="fixed inset-0 bg-black/50 lg:hidden" style={{ zIndex: UI_LAYERS.sidebarOverlay }} onClick={() => setOpen(false)} aria-label="Chiudi menu" />}
    <aside className={`fixed inset-y-0 left-0 min-h-screen w-[280px] overflow-y-auto border-r bg-white transition-transform lg:static lg:w-64 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`} style={{ zIndex: UI_LAYERS.sidebar }}>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white p-4">
        <img src="/logo.png" alt="OrtoMio" className="h-10 w-10 object-contain" />
        <div><h2 className="font-bold">OrtoMio</h2><p className="text-xs text-gray-500">Gestione agricola</p></div>
      </div>
      <nav className="space-y-5 p-4">
        {Object.entries(groups).map(([group, items]) => {
          const collapsible = !['PRINCIPALE', 'SUPPORTO'].includes(group)
          const hidden = collapsible && collapsed.has(group)
          return <section key={group}>
            <button disabled={!collapsible} onClick={() => toggle(group)} className="mb-2 flex w-full items-center justify-between px-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 disabled:cursor-default">
              {group}<ChevronRight size={15} className={`${hidden ? '' : 'rotate-90'} ${collapsible ? '' : 'invisible'}`} />
            </button>
            {!hidden && <div className="space-y-1">{items.map(item => {
              const active = pathname === item.route || (item.route !== '/app' && pathname.startsWith(`${item.route}/`))
              return <Link key={item.id} href={item.route!} onClick={() => setOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                <CapabilityIconView icon={item.icon} /><span className="min-w-0 flex-1">{item.label}</span><CapabilityBadge capability={item} />
              </Link>
            })}</div>}
          </section>
        })}
      </nav>
    </aside>
  </>
}
