'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { X, LayoutDashboard, Calendar, CalendarDays, BookOpen, ShoppingBasket, Sparkles, Trophy, BarChart3, FlaskConical, Tractor, TreePine, CircleDot, Grape, ChefHat, Database, Wifi, HelpCircle, Settings, Crown, Book } from 'lucide-react'
import { useTier } from '@/packages/core/hooks/useTier'
import { AppTier } from '@/packages/core/config/tiers'
import type { LucideIcon } from 'lucide-react'

interface MenuItem {
  icon: LucideIcon
  label: string
  path: string
  tier?: 'all' | 'PRO' | 'PLUS'
  badge?: string
}

interface MenuGroup {
  title: string
  icon?: LucideIcon
  items: MenuItem[]
  tier?: 'all' | 'PRO' | 'PLUS'
  collapsible?: boolean
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { tier, isPro, isPlus } = useTier()
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set())

  // Prevenire scroll body quando menu aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Chiusura automatica dopo navigazione
  const handleLinkClick = (path: string) => {
    router.push(path)
    onClose()
  }

  // Toggle gruppo collassabile
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

  // Determina se un item è disponibile per il tier corrente
  const isItemAvailable = (item: MenuItem): boolean => {
    if (item.tier === 'all') return true
    const safeTier = (tier || 'FREE') as string
    if (item.tier === 'PRO') {
      return safeTier === 'PRO' || safeTier === 'PRO_PROFESSIONAL' || isPro
    }
    if (item.tier === 'PLUS') {
      return safeTier === 'PLUS' || safeTier === 'PRO_CONSUMER' || isPlus || isPro
    }
    return false
  }

  // Determina se un gruppo è disponibile
  const isGroupAvailable = (group: MenuGroup): boolean => {
    if (group.tier === 'all') return true
    const safeTier = (tier || 'FREE') as string
    if (group.tier === 'PRO') {
      return safeTier === 'PRO' || safeTier === 'PRO_PROFESSIONAL' || isPro
    }
    if (group.tier === 'PLUS') {
      return safeTier === 'PLUS' || safeTier === 'PRO_CONSUMER' || isPlus || isPro
    }
    return false
  }

  // Menu groups per Professional
  const professionalGroups: MenuGroup[] = [
    {
      title: 'PRINCIPALE',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app', tier: 'all' },
        { icon: Calendar, label: 'Planner', path: '/app/planner', tier: 'all' },
        { icon: CalendarDays, label: 'Calendario', path: '/app/calendar', tier: 'all' },
        { icon: BookOpen, label: 'Diario', path: '/app/journal', tier: 'all' },
        { icon: ShoppingBasket, label: 'Raccolto', path: '/app/harvest', tier: 'all' },
        { icon: Sparkles, label: 'Cura', path: '/app/advice', tier: 'all' },
        { icon: Trophy, label: 'Challenge', path: '/app/challenges', tier: 'all' },
      ],
      tier: 'all'
    },
    {
      title: 'COLTURE SPECIALIZZATE',
      items: [
        { icon: TreePine, label: 'Frutteto', path: '/app/orchard', tier: 'PRO', badge: 'PRO' },
        { icon: CircleDot, label: 'Olivi', path: '/app/olives', tier: 'PRO', badge: 'PRO' },
        { icon: Grape, label: 'Vite', path: '/app/vineyard', tier: 'PRO', badge: 'PRO' },
      ],
      tier: 'PRO',
      collapsible: true
    },
    {
      title: 'GESTIONE AVANZATA',
      items: [
        { icon: BarChart3, label: 'Analytics', path: '/app/analytics', tier: 'PRO', badge: 'PRO' },
        { icon: FlaskConical, label: 'Trattamenti', path: '/app/treatments', tier: 'PRO', badge: 'PRO' },
        { icon: Tractor, label: 'Lavorazioni', path: '/app/mechanical-work', tier: 'PRO', badge: 'PRO' },
        { icon: Database, label: 'Export', path: '/app/export', tier: 'PRO', badge: 'PRO' },
      ],
      tier: 'PRO',
      collapsible: true
    },
    {
      title: 'IMPOSTAZIONI',
      items: [
        { icon: Wifi, label: 'Smart Hub', path: '/app/smart', tier: 'all' },
        { icon: ChefHat, label: 'Ricette', path: '/app/recipes', tier: 'PRO', badge: 'PRO' },
        { icon: Settings, label: 'Settings', path: '/app/settings', tier: 'all' },
        { icon: HelpCircle, label: 'Aiuto', path: '/app/help', tier: 'all' },
        { icon: Crown, label: 'Admin', path: '/app/admin', tier: 'PRO' },
      ],
      tier: 'all'
    }
  ]

  // Menu groups per Consumer
  const consumerGroups: MenuGroup[] = [
    {
      title: 'PRINCIPALE',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app', tier: 'all' },
        { icon: Calendar, label: 'Planner', path: '/app/planner', tier: 'all' },
        { icon: CalendarDays, label: 'Calendario', path: '/app/calendar', tier: 'all' },
        { icon: BookOpen, label: 'Diario', path: '/app/journal', tier: 'all' },
        { icon: ShoppingBasket, label: 'Raccolto', path: '/app/harvest', tier: 'all' },
        { icon: Sparkles, label: 'Cura', path: '/app/advice', tier: 'all' },
        { icon: Trophy, label: 'Challenge', path: '/app/challenges', tier: 'all' },
      ],
      tier: 'all'
    },
    {
      title: 'EXTRA',
      items: [
        { icon: ChefHat, label: 'Ricette', path: '/app/recipes', tier: 'PRO', badge: 'PRO' },
        { icon: Book, label: 'Guide', path: '/app/guides', tier: 'PRO', badge: 'PRO' },
      ],
      tier: 'PRO'
    },
    {
      title: 'IMPOSTAZIONI',
      items: [
        { icon: Settings, label: 'Settings', path: '/app/settings', tier: 'all' },
        { icon: HelpCircle, label: 'Aiuto', path: '/app/help', tier: 'all' },
      ],
      tier: 'all'
    }
  ]

  // Menu groups per Free
  const freeGroups: MenuGroup[] = [
    {
      title: 'PRINCIPALE',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app', tier: 'all' },
        { icon: Calendar, label: 'Planner', path: '/app/planner', tier: 'all' },
        { icon: CalendarDays, label: 'Calendario', path: '/app/calendar', tier: 'all' },
        { icon: BookOpen, label: 'Diario', path: '/app/journal', tier: 'all' },
        { icon: ShoppingBasket, label: 'Raccolto', path: '/app/harvest', tier: 'all' },
        { icon: Sparkles, label: 'Cura', path: '/app/advice', tier: 'all' },
        { icon: Trophy, label: 'Challenge', path: '/app/challenges', tier: 'all' },
      ],
      tier: 'all'
    },
    {
      title: 'IMPOSTAZIONI',
      items: [
        { icon: HelpCircle, label: 'Aiuto', path: '/app/help', tier: 'all' },
        { icon: Settings, label: 'Settings', path: '/app/settings', tier: 'all' },
      ],
      tier: 'all'
    }
  ]

  // Seleziona gruppi in base al tier
  const safeTier = (tier || 'FREE') as string
  let menuGroups: MenuGroup[] = freeGroups
  if (safeTier === 'PRO' || safeTier === 'PRO_PROFESSIONAL' || isPro) {
    menuGroups = professionalGroups
  } else if (safeTier === 'PLUS' || safeTier === 'PRO_CONSUMER' || isPlus) {
    menuGroups = consumerGroups
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-[80vw] max-w-[320px] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🌱 OrtoMio</h2>
            <p className="text-xs text-gray-500 mt-1">
              {safeTier === 'PRO' ? 'PRO Professional' : safeTier === 'PLUS' ? 'PLUS' : 'FREE'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Chiudi menu"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Menu Content - Scrollable */}
        <div className="overflow-y-auto h-[calc(100vh-80px)] pb-20">
          <nav className="p-4 space-y-6">
            {menuGroups.map((group) => {
              if (!isGroupAvailable(group)) return null

              const isCollapsed = collapsedGroups.has(group.title)
              const availableItems = group.items.filter(isItemAvailable)

              if (availableItems.length === 0) return null

              return (
                <div key={group.title} className="space-y-2">
                  {/* Group Header */}
                  <button
                    onClick={() => group.collapsible && toggleGroup(group.title)}
                    className={`w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                      group.collapsible ? 'cursor-pointer hover:text-gray-700' : ''
                    }`}
                  >
                    <span>{group.title}</span>
                    {group.collapsible && (
                      <span className="text-gray-400">
                        {isCollapsed ? '▼' : '▲'}
                      </span>
                    )}
                  </button>

                  {/* Group Items */}
                  {(!group.collapsible || !isCollapsed) && (
                    <div className="space-y-1">
                      {availableItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.path

                        return (
                          <button
                            key={item.path}
                            onClick={() => handleLinkClick(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                              isActive
                                ? 'bg-gray-100 text-gray-900 font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon size={20} />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

