'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Sprout,
  TreePine,
  Bot,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { UI_LAYERS } from '@/components/shared/uiLayers'

interface NavItem {
  icon: LucideIcon
  label: string
  path: string
}

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    { icon: Sprout, label: 'Orto', path: '/app/garden' },
    { icon: TreePine, label: 'Frutteto', path: '/app/orchard' },
    { icon: Bot, label: 'Planner', path: '/app/planner' },
    { icon: Settings, label: 'Altro', path: '/app/settings' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg lg:hidden safe-area-inset-bottom"
      style={{ zIndex: UI_LAYERS.topBar }}
    >
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || (item.path === '/app' && pathname === '/app')

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 min-w-[44px] min-h-[44px] ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
