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
  Crown,
  TreePine,
  CircleDot,
  Grape,
  ChefHat,
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
  { icon: BarChart3, label: 'Analytics', path: '/app/analytics', tier: 'PRO', badge: 'PRO' },
  { icon: FlaskConical, label: 'Trattamenti', path: '/app/treatments', tier: 'PRO', badge: 'PRO' },
  { icon: Tractor, label: 'Lavorazioni', path: '/app/mechanical-work', tier: 'PRO', badge: 'PRO' },
  { icon: TreePine, label: 'Frutteto', path: '/app/orchard', tier: 'PRO', badge: 'PRO' },
  { icon: CircleDot, label: 'Olivi', path: '/app/olives', tier: 'PRO', badge: 'PRO' },
  { icon: Grape, label: 'Vite', path: '/app/vineyard', tier: 'PRO', badge: 'PRO' },
  { icon: ChefHat, label: 'Ricette', path: '/app/recipes', tier: 'PRO', badge: 'PRO' },
  { icon: Database, label: 'Export', path: '/app/export', tier: 'PRO', badge: 'PRO' },
  { icon: Wifi, label: 'Smart Hub', path: '/app/smart', tier: 'all' },
  { icon: HelpCircle, label: 'Aiuto', path: '/app/help', tier: 'all' },
  { icon: Settings, label: 'Settings', path: '/app/settings', tier: 'all' },
]

interface MenuGroup {
  title: string
  items: typeof menuItems
  tier?: 'all' | 'PRO'
}

export function ProfessionalSidebar() {
  const pathname = usePathname()
  const { tier, isPro } = useTier()
  
  // Add admin menu item if user is PRO (always available for PRO)
  const allMenuItems = [
    ...menuItems,
    { icon: Crown, label: 'Admin', path: '/app/admin', tier: 'PRO' as const }
  ]
  
  // Raggruppamento menu per categorie
  const menuGroups: MenuGroup[] = [
    {
      title: 'PRINCIPALE',
      items: allMenuItems.filter(item => 
        ['Dashboard', 'Planner', 'Calendario', 'Diario', 'Raccolto', 'Cura', 'Challenge'].includes(item.label)
      ),
      tier: 'all'
    },
    {
      title: 'COLTURE SPECIALIZZATE',
      items: allMenuItems.filter(item => 
        ['Frutteto', 'Olivi', 'Vite'].includes(item.label)
      ),
      tier: 'PRO'
    },
    {
      title: 'GESTIONE AVANZATA',
      items: allMenuItems.filter(item => 
        ['Analytics', 'Trattamenti', 'Lavorazioni', 'Export'].includes(item.label)
      ),
      tier: 'PRO'
    },
    {
      title: 'IMPOSTAZIONI',
      items: allMenuItems.filter(item => 
        ['Smart Hub', 'Ricette', 'Settings', 'Aiuto', 'Admin'].includes(item.label)
      ),
      tier: 'all'
    }
  ]
  
  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">🌱 OrtoMio</h2>
        <p className="text-xs text-gray-500 mt-1">PRO Professional</p>
      </div>
      
      <nav className="space-y-6">
        {menuGroups.map((group) => {
          const tierStr = (tier || 'FREE') as string
          const isGroupAvailable = group.tier === 'all' || 
                                   (group.tier === 'PRO' && (tierStr === 'PRO' || tierStr === 'PRO_PROFESSIONAL' || isPro))
          
          if (!isGroupAvailable) return null
          
          const availableItems = group.items.filter((item) => {
            const isAvailable = item.tier === 'all' || 
                               (item.tier === 'PRO' && (tierStr === 'PRO' || tierStr === 'PRO_PROFESSIONAL' || isPro))
            return isAvailable
          })
          
          if (availableItems.length === 0) return null
          
          return (
            <div key={group.title} className="space-y-2">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.title}
              </h3>
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
                          ? 'bg-gray-100 text-gray-900 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label || ''}</span>
                      {item.badge && typeof item.badge === 'string' && (
                        <span className="ml-auto text-xs bg-gray-600 text-white px-2 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
