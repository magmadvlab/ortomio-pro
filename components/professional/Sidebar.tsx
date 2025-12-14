'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  ShoppingBasket,
  Sparkles,
  Settings,
  BarChart3,
  FlaskConical,
  FileText,
  Database,
  CalendarDays,
  Trophy,
  Tractor,
  Wifi,
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
  { icon: BarChart3, label: 'Analytics', path: '/app/analytics', tier: 'PRO_PROFESSIONAL', badge: 'PRO' },
  { icon: FlaskConical, label: 'Trattamenti', path: '/app/treatments', tier: 'PRO_PROFESSIONAL', badge: 'PRO' },
  { icon: Tractor, label: 'Lavorazioni', path: '/app/mechanical-work', tier: 'PRO_PROFESSIONAL', badge: 'PRO' },
  { icon: Database, label: 'Export', path: '/app/export', tier: 'PRO_PROFESSIONAL', badge: 'PRO' },
  { icon: Wifi, label: 'Smart Hub', path: '/app/smart', tier: 'all' },
  { icon: HelpCircle, label: 'Aiuto', path: '/app/help', tier: 'all' },
  { icon: Settings, label: 'Settings', path: '/app/settings', tier: 'all' },
]

export function ProfessionalSidebar() {
  const pathname = usePathname()
  const { tier } = useTier()
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">🌱 OrtoMio</h2>
        <p className="text-xs text-gray-500 mt-1">PRO Professional</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          const isAvailable = item.tier === 'all' || 
                             (item.tier === 'PRO_PROFESSIONAL' && tier === 'PRO_PROFESSIONAL')
          
          if (!isAvailable) return null
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-gray-600 text-white px-2 py-0.5 rounded">
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
