'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTier } from '@/packages/core/hooks/useTier'
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  ShoppingBasket,
  Sparkles,
  Settings,
  Lock,
  CalendarDays,
  Trophy,
  HelpCircle,
  Crown,
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: Calendar, label: 'Planner', path: '/app/planner' },
  { icon: CalendarDays, label: 'Calendario', path: '/app/calendar' },
  { icon: BookOpen, label: 'Diario', path: '/app/journal' },
  { icon: ShoppingBasket, label: 'Raccolto', path: '/app/harvest' },
  { icon: Sparkles, label: 'Cura', path: '/app/advice' },
  { icon: Trophy, label: 'Challenge', path: '/app/challenges' },
  { icon: HelpCircle, label: 'Aiuto', path: '/app/help' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
]

export function FreeSidebar() {
  const pathname = usePathname()
  const { isProfessional } = useTier()
  
  // Add admin menu item if user is PRO_PROFESSIONAL or in development
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  )
  
  const allMenuItems = (isDev || isProfessional)
    ? [...menuItems, { icon: Crown, label: 'Admin', path: '/app/admin' }]
    : menuItems
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-green-900">🌱 OrtoMio</h2>
        <p className="text-xs text-gray-500 mt-1">FREE</p>
      </div>
      
      <nav className="space-y-2">
        {allMenuItems.map((item) => {
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
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-900 font-medium mb-2">
          Upgrade a PRO
        </p>
        <p className="text-xs text-green-700 mb-3">
          Sblocca tutte le feature avanzate
        </p>
        <Link
          href="/pricing"
          className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          Vedi Piani
        </Link>
      </div>
    </aside>
  )
}