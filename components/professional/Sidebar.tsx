'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  FlaskConical,
  Database,
  Tractor,
  Wifi,
  BookOpen,
  Crown,
  TreePine,
  CircleDot,
  Grape,
  ChevronDown,
  ChevronRight,
  Sprout,
  Heart,
  Droplets,
  Leaf,
  Shield,
  Bot,
  Satellite,
  Map,
  Target,
  Brain,
  Drone,
  Link2,
} from 'lucide-react'
import { useTier } from '@/packages/core/hooks/useTier'
import { useEffect } from 'react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app', tier: 'all' },
  { icon: Sprout, label: 'Il Mio Orto', path: '/app/garden', tier: 'all' },
  { icon: Bot, label: '🤖 Planner AI', path: '/app/planner', tier: 'all', badge: 'NEW' },
  { icon: Heart, label: 'Salute', path: '/app/advice', tier: 'all' },
  { icon: BarChart3, label: 'Progressi', path: '/app/progress', tier: 'all' },
  { icon: TreePine, label: 'Frutteto', path: '/app/orchard', tier: 'PRO', badge: 'PRO' },
  { icon: CircleDot, label: 'Oliveto', path: '/app/olives', tier: 'PRO', badge: 'PRO' },
  { icon: Grape, label: 'Vigneto', path: '/app/vineyard', tier: 'PRO', badge: 'PRO' },
  { icon: Droplets, label: 'Irrigazione', path: '/app/irrigation', tier: 'PRO', badge: 'PRO' },
  { icon: FlaskConical, label: 'Nutrizione & Trattamenti', path: '/app/nutrition', tier: 'PRO', badge: 'PRO' },
  { icon: Tractor, label: 'Lavorazioni', path: '/app/mechanical-work', tier: 'PRO', badge: 'PRO' },
  { icon: Shield, label: 'Certificazioni', path: '/app/certifications', tier: 'PRO', badge: 'PRO' },
  { icon: Brain, label: 'Predizioni AI', path: '/app/ai-predictions', tier: 'PRO', badge: 'NEW' },
  { icon: Drone, label: 'Operazioni Drone', path: '/app/drone-operations', tier: 'PRO', badge: 'NEW' },
  { icon: Link2, label: 'Blockchain', path: '/app/blockchain-traceability', tier: 'PRO', badge: 'NEW' },
  { icon: Satellite, label: 'NDVI Satellitare', path: '/app/ndvi', tier: 'PRO', badge: 'NEW' },
  { icon: Map, label: 'Prescription Maps', path: '/app/prescription-maps', tier: 'PRO', badge: 'NEW' },
  { icon: BarChart3, label: 'Analytics', path: '/app/analytics', tier: 'PRO', badge: 'PRO' },
  { icon: Wifi, label: 'Smart Hub', path: '/app/smart', tier: 'all' },
  { icon: Database, label: 'Export', path: '/app/export', tier: 'PRO', badge: 'PRO' },
  { icon: BookOpen, label: 'Manuale Utente', path: '/app/help', tier: 'all' },
  { icon: Settings, label: 'Impostazioni', path: '/app/settings', tier: 'all' },
]

interface MenuGroup {
  title: string
  items: typeof menuItems
  tier?: 'all' | 'PRO'
  collapsible?: boolean
}

export function ProfessionalSidebar() {
  const pathname = usePathname()
  const { tier, isPro } = useTier()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  
  // Add admin menu item if user is PRO (always available for PRO)
  const allMenuItems = [
    ...menuItems,
    { icon: Crown, label: 'Admin', path: '/app/admin', tier: 'PRO' as const }
  ]
  
  // Raggruppamento menu per categorie - Ottimizzato FINALE
  const menuGroups: MenuGroup[] = [
    {
      title: 'PRINCIPALE',
      items: allMenuItems.filter(item =>
        ['Dashboard', 'Il Mio Orto', '🤖 Planner AI', 'Salute', 'Progressi'].includes(item.label)
      ),
      tier: 'all',
      collapsible: false
    },
    {
      title: 'COLTURE SPECIALIZZATE',
      tier: 'PRO',
      collapsible: true,
      items: allMenuItems.filter(item =>
        ['Frutteto', 'Oliveto', 'Vigneto'].includes(item.label)
      )
    },
    {
      title: 'GESTIONE PROFESSIONALE',
      tier: 'PRO',
      collapsible: true,
      items: allMenuItems.filter(item =>
        ['Irrigazione', 'Nutrizione & Trattamenti', 'Lavorazioni', 'Certificazioni'].includes(item.label)
      )
    },
    {
      title: 'ANALYTICS & SMART',
      tier: 'PRO',
      collapsible: true,
      items: allMenuItems.filter(item =>
        ['Predizioni AI', 'Operazioni Drone', 'Blockchain', 'NDVI Satellitare', 'Prescription Maps', 'Analytics', 'Smart Hub', 'Export'].includes(item.label)
      )
    },
    {
      title: 'SUPPORTO',
      items: allMenuItems.filter(item =>
        ['Impostazioni', 'Manuale Utente', 'Admin'].includes(item.label)
      ),
      tier: 'all',
      collapsible: false
    }
  ]
  
  // Carica preferenze collassamento da localStorage al mount
  useEffect(() => {
    const saved = localStorage.getItem('ortomio_sidebar_collapsed')
    if (saved) {
      try {
        const savedGroups = JSON.parse(saved)
        setCollapsedGroups(new Set(savedGroups))
      } catch (e) {
        // Ignora errori di parsing
      }
    }
  }, [])
  
  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      // Salva preferenze immediatamente
      localStorage.setItem('ortomio_sidebar_collapsed', JSON.stringify(Array.from(next)))
      return next
    })
  }
  
  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">🌱 OrtoMio</h2>
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
          
          const isCollapsed = collapsedGroups.has(group.title)
          
          return (
            <div key={group.title} className="space-y-2">
              {group.collapsible ? (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-all duration-200"
                >
                  <span>{group.title}</span>
                  <ChevronRight 
                    size={16} 
                    className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                  />
                </button>
              ) : (
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              {(!group.collapsible || !isCollapsed) && (
                <div className={`space-y-1 transition-all duration-200 ${
                  group.collapsible ? 'animate-in slide-in-from-top-2' : ''
                }`}>
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
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
                            item.badge === 'NEW' 
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white animate-pulse' 
                              : 'bg-gray-600 text-white'
                          }`}>
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
