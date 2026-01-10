'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ChefHat,
  Book,
  Settings,
  Heart,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Sprout,
  BarChart3,
  Leaf,
} from 'lucide-react'
import { useTier } from '@/packages/core/hooks/useTier'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app', tier: 'all' },
  { icon: Sprout, label: 'Il Mio Orto', path: '/app/garden', tier: 'all' },
  { icon: Leaf, label: 'Vivaio', path: '/app/semenzaio', tier: 'all' },
  { icon: Heart, label: 'Salute', path: '/app/advice', tier: 'all' },
  { icon: BarChart3, label: 'Progressi', path: '/app/progress', tier: 'all' },
  { icon: ChefHat, label: 'Ricette', path: '/app/recipes', tier: 'PRO_CONSUMER', badge: 'PRO' },
  { icon: Book, label: 'Guide Premium', path: '/app/guides', tier: 'PRO_CONSUMER', badge: 'PRO' },
  { icon: HelpCircle, label: 'Aiuto', path: '/app/help', tier: 'all' },
  { icon: Settings, label: 'Impostazioni', path: '/app/settings', tier: 'all' },
]

interface MenuGroup {
  title: string
  items: typeof menuItems
  tier?: 'all' | 'PRO' | 'PLUS'
  collapsible?: boolean
}

export function ConsumerSidebar() {
  const pathname = usePathname()
  const { tier, can } = useTier()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  
  // Raggruppamento menu per categorie
  const menuGroups: MenuGroup[] = [
    {
      title: 'PRINCIPALE',
      items: menuItems.filter(item => 
        ['Dashboard', 'Il Mio Orto', 'Vivaio', 'Salute', 'Progressi'].includes(item.label)
      ),
      tier: 'all',
      collapsible: false
    },
    {
      title: 'PRO',
      items: menuItems.filter(item => 
        ['Ricette', 'Guide Premium'].includes(item.label)
      ),
      tier: 'PRO',
      collapsible: true
    },
    {
      title: 'IMPOSTAZIONI',
      items: menuItems.filter(item => 
        ['Impostazioni', 'Aiuto'].includes(item.label)
      ),
      tier: 'all',
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
        <h2 className="text-xl font-bold text-green-900">🌱 OrtoMio</h2>
      </div>
      
      <nav className="space-y-6">
        {menuGroups.map((group) => {
          const tierStr = (tier || 'FREE') as string
          const isGroupAvailable = group.tier === 'all' || 
                                   (group.tier === 'PRO' && (tierStr === 'PLUS' || tierStr === 'PRO_CONSUMER' || tierStr === 'PRO')) ||
                                   (group.tier === 'PLUS' && (tierStr === 'PLUS' || tierStr === 'PRO'))
          
          if (!isGroupAvailable) return null
          
          const availableItems = group.items.filter((item) => {
            const isAvailable = item.tier === 'all' || 
                               (item.tier === 'PRO_CONSUMER' && (tierStr === 'PLUS' || tierStr === 'PRO_CONSUMER')) ||
                               (item.tier === 'PLUS' && (tierStr === 'PLUS' || tierStr === 'PRO')) ||
                               (item.tier === 'PRO' && (tierStr === 'PRO' || tierStr === 'PRO_PROFESSIONAL'))
            return isAvailable
          })
          
          if (availableItems.length === 0) return null
          
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
                  {availableItems.map((item) => {
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
                        {item.badge && typeof item.badge === 'string' && (
                          <span className="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}


