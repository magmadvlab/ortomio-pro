'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { getEnabledFeaturesForAccess } from '@/config/capabilities'
import { getVisibleCapabilities } from '@/config/capabilities'
import { useCapabilities } from '@/components/capabilities/CapabilityProvider'
import { CapabilityBadge, CapabilityIconView } from '@/components/capabilities/CapabilityVisuals'

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { access } = useCapabilities()
  const items = useMemo(() => getVisibleCapabilities(access, 'mobile', getEnabledFeaturesForAccess(access)).filter(item => item.route), [access])
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])
  if (!isOpen) return null
  return <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onClose}>
    <aside className="h-full w-[min(88vw,340px)] overflow-y-auto bg-white p-4" onClick={event => event.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between"><strong>OrtoMio</strong><button onClick={onClose} aria-label="Chiudi menu"><X /></button></div>
      <nav className="space-y-1">{items.map(item => <Link key={item.id} href={item.route!} onClick={onClose} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname === item.route ? 'bg-green-100 font-semibold' : 'hover:bg-gray-50'}`}>
        <CapabilityIconView icon={item.icon} /><span className="flex-1">{item.label}</span><CapabilityBadge capability={item} />
      </Link>)}</nav>
    </aside>
  </div>
}
