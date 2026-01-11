'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTier } from '@/packages/core/hooks/useTier'
import {
  LayoutDashboard,
  Heart,
  Settings,
  Trophy,
  HelpCircle,
  Crown,
  ChevronDown,
  ChevronRight,
  Sprout,
  BarChart3,
  Star,
  BookOpen,
  Leaf,
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: Sprout, label: 'Il Mio Orto', path: '/app/garden' },
  { icon: Leaf, label: 'Vivaio', path: '/app/semenzaio' },
  { icon: Heart, label: 'Salute', path: '/app/advice' },
  { icon: BarChart3, label: 'Progressi', path: '/app/progress' },
  { icon: BookOpen, label: 'Guida Colture', path: '/app/guide' },
  { icon: HelpCircle, label: 'Aiuto', path: '/app/help' },
  { icon: Settings, label: 'Impostazioni', path: '/app/settings' },
]

interface MenuGroup {
  title: string
  items: typeof menuItems
  collapsible?: boolean
}

export function FreeSidebar() {
  const pathname = usePathname()
  const { tier, isPro } = useTier()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  
  // Add admin menu item if user is PRO or in development
  // Usa solo process.env.NODE_ENV per evitare hydration mismatch
  const isDev = process.env.NODE_ENV === 'development'
  
  const allMenuItems = (isDev || isPro || tier === 'PRO')
    ? [...menuItems, { icon: Crown, label: 'Admin', path: '/app/admin' }]
    : menuItems
  
  // Raggruppamento menu per categorie
  const menuGroups: MenuGroup[] = [
    {
      title: 'PRINCIPALE',
      items: allMenuItems.filter(item =>
        ['Dashboard', 'Il Mio Orto', 'Vivaio', 'Salute', 'Progressi', 'Guida Colture'].includes(item.label)
      ),
      collapsible: false
    },
    {
      title: 'IMPOSTAZIONI',
      items: allMenuItems.filter(item =>
        ['Aiuto', 'Impostazioni', 'Admin'].includes(item.label)
      ),
      collapsible: false
    }
  ]
  
  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }
  
  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-bold text-green-900">🌱 OrtoMio</h2>
        <p className="text-xs text-gray-500 mt-1">FREE</p>
      </div>
      
      <nav className="space-y-6">
        {menuGroups.map((group) => {
          const isCollapsed = collapsedGroups.has(group.title)
          
          return (
            <div key={group.title} className="space-y-2">
              {group.collapsible ? (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>{group.title}</span>
                  {isCollapsed ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              ) : (
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              {(!group.collapsible || !isCollapsed) && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path
                    
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-green-100 text-green-900 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label || ''}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      
      <div className="mt-8 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-full max-w-sm shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Star size={18} className="text-yellow-full max-w-sm fill-yellow-600" />
          <p className="text-sm font-bold text-gray-900">
            Passa a PRO
        </p>
        </div>
        <p className="text-xs text-gray-700 mb-3">
          Sblocca AI, Analytics, Ricette e molto altro
        </p>
        <Link
          href="/pricing"
          className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold transition-colors shadow-sm"
        >
          Scopri PRO
        </Link>
      </div>
    </aside>
  )
}