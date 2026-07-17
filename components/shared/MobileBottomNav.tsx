'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { getEnabledFeatures } from '@/config/features'
import { getVisibleCapabilities } from '@/config/capabilities'
import { useCapabilities } from '@/components/capabilities/CapabilityProvider'
import { CapabilityIconView } from '@/components/capabilities/CapabilityVisuals'
import { UI_LAYERS } from '@/components/shared/uiLayers'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { access } = useCapabilities()
  const items = useMemo(() => getVisibleCapabilities(access, 'bottom', new Set(getEnabledFeatures()))
    .filter(item => item.route)
    .sort((a, b) => (a.bottomOrder ?? 50) - (b.bottomOrder ?? 50))
    .slice(0, 5), [access])

  return <nav className="fixed bottom-0 left-0 right-0 border-t bg-white/95 shadow-lg backdrop-blur lg:hidden" style={{ zIndex: UI_LAYERS.topBar }} aria-label="Navigazione rapida">
    <div className="mx-auto flex h-16 max-w-2xl items-center justify-around px-2">
      {items.map(item => {
        const active = pathname === item.route || (item.route !== '/app' && pathname.startsWith(`${item.route}/`))
        return <Link key={item.id} href={item.route!} className={`flex h-full min-w-11 flex-1 flex-col items-center justify-center ${active ? 'text-green-700' : 'text-gray-500'}`}>
          <CapabilityIconView icon={item.icon} size={20} />
          <span className="mt-0.5 max-w-full truncate px-1 text-[10px] font-medium">{item.label}</span>
        </Link>
      })}
    </div>
  </nav>
}
