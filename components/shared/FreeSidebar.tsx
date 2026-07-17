'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { getEnabledFeatures } from '@/config/features'
import { getVisibleCapabilities } from '@/config/capabilities'
import { useCapabilities } from '@/components/capabilities/CapabilityProvider'
import { CapabilityBadge, CapabilityIconView } from '@/components/capabilities/CapabilityVisuals'

/** Compatibility shell: the active layout uses ProfessionalSidebar. */
export function FreeSidebar() {
  const pathname = usePathname()
  const { access } = useCapabilities()
  const items = useMemo(() => getVisibleCapabilities({ ...access, tier: 'FREE' }, 'desktop', new Set(getEnabledFeatures())).filter(item => item.route), [access])
  return <aside className="hidden min-h-screen w-64 border-r bg-white p-4 lg:block">
    <h2 className="mb-5 text-lg font-bold text-green-900">OrtoMio</h2>
    <nav className="space-y-1">{items.map(item => <Link key={item.id} href={item.route!} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname === item.route ? 'bg-green-100 font-semibold' : 'hover:bg-gray-50'}`}>
      <CapabilityIconView icon={item.icon} /><span className="flex-1">{item.label}</span><CapabilityBadge capability={item} />
    </Link>)}</nav>
  </aside>
}
