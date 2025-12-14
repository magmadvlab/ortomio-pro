'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  ShoppingBasket,
  ChefHat,
  Book,
  Settings,
  Sparkles,
  CalendarDays,
  Trophy,
  HelpCircle,
} from 'lucide-react'
import { useTier } from '@/packages/core/hooks/useTier'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app', tier: 'all' },
  { icon: Calendar, label: 'Planner', path: '/app/planner', tier: 'all' },
  { icon: CalendarDays, label: 'Calendario', path: '/app/calendar', tier: 'all' },
  { icon: BookOpen, label: 'Diario', path: '/app/journal', tier: 'all' },
  { icon: ShoppingBasket, label: 'Raccolto', path: '/app/harvest', tier: 'all' },
  { icon: Sparkles, label: 'Cura', path: '/app/advice', tier: 'all' },
  { icon: Trophy, label: 'Challenge', path: '/app/challenges', tier: 'all' },
  { icon: ChefHat, label: 'Ricette', path: '/app/recipes', tier: 'PRO_CONSUMER', badge: 'PRO' },
  { icon: Book, label: 'Guide', path: '/app/guides', tier: 'PRO_CONSUMER', badge: 'PRO' },
  { icon: HelpCircle, label: 'Aiuto', path: '/app/help', tier: 'all' },
  { icon: Settings, label: 'Settings', path: '/app/settings', tier: 'all' },
]

export function ConsumerSidebar() {
  const pathname = usePathname()
  const { tier, can } = useTier()
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-green-900">🌱 OrtoMio</h2>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          const isAvailable = item.tier === 'all' || 
                             (item.tier === 'PRO_CONSUMER' && (tier === 'PRO_CONSUMER' || tier === 'PRO'))
          
          if (!isAvailable) return null
          
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
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}


