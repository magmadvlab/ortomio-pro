'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { X, LayoutDashboard, Heart, BarChart3, FlaskConical, Tractor, TreePine, CircleDot, Grape, ChefHat, Database, Wifi, HelpCircle, Settings, Crown, Book, Sprout, ChevronDown, Home, Droplets, Satellite, Map, Shield, Target, Leaf } from 'lucide-react'
import { useTier } from '@/packages/core/hooks/useTier'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { AppTier } from '@/packages/core/config/tiers'
import type { LucideIcon } from 'lucide-react'
import { Garden, GardenTask } from '@/types'

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
  const { storageProvider } = useStorage()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [isGardenSelectorOpen, setIsGardenSelectorOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Carica gardens e tasks
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length > 0) {
          const firstGarden = loadedGardens[0]
          setActiveGarden(firstGarden)
          const gardenTasks = await storageProvider.getTasks(firstGarden.id)
          setTasks(gardenTasks || [])
        }
      } catch (error) {
        console.error('Error loading garden data:', error)
      } finally {
        setLoading(false)
      }
    }
    if (isOpen) {
      loadData()
    }
  }, [storageProvider, isOpen])

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

  const activePlantsCount = tasks.filter(t => !t.completed && t.taskType === 'Sowing').length
  const todayTasksCount = tasks.filter(t => {
    if (t.completed || !t.nextDueDate) return false
    const today = new Date()
    const dueDate = new Date(t.nextDueDate)
    return dueDate.toDateString() === today.toDateString()
  }).length

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
        { icon: Sprout, label: 'Il Mio Orto', path: '/app/garden', tier: 'all' },
        { icon: Leaf, label: 'Piante', path: '/app/plants', tier: 'all' },
        { icon: Heart, label: 'Salute', path: '/app/advice', tier: 'all' },
        { icon: BarChart3, label: 'Progressi', path: '/app/progress', tier: 'all' },
      ],
      tier: 'all'
    },
    {
      title: 'COLTURE SPECIALIZZATE',
      tier: 'all',
      collapsible: true,
      items: [
        { icon: TreePine, label: 'Frutteto', path: '/app/orchard', tier: 'all' },
        { icon: CircleDot, label: 'Oliveto', path: '/app/olives', tier: 'all' },
        { icon: Grape, label: 'Vigneto', path: '/app/vineyard', tier: 'all' },
      ]
    },
    {
      title: 'GESTIONE PROFESSIONALE',
      tier: 'all',
      collapsible: true,
      items: [
        { icon: Droplets, label: 'Irrigazione', path: '/app/irrigation', tier: 'all' },
        { icon: FlaskConical, label: 'Nutrizione & Trattamenti', path: '/app/nutrition', tier: 'all' },
        { icon: Tractor, label: 'Lavorazioni', path: '/app/mechanical-work', tier: 'all' },
        { icon: Shield, label: 'GlobalG.A.P.', path: '/app/compliance', tier: 'all' },
      ]
    },
    {
      title: 'ANALYTICS & SMART',
      tier: 'all',
      collapsible: true,
      items: [
        { icon: Satellite, label: 'NDVI Satellitare', path: '/app/ndvi', tier: 'all' },
        { icon: Target, label: 'Prescription Maps', path: '/app/prescription-maps', tier: 'all' },
        { icon: BarChart3, label: 'Analytics', path: '/app/analytics', tier: 'all' },
        { icon: Wifi, label: 'Smart Hub', path: '/app/smart', tier: 'all' },
        { icon: Database, label: 'Export', path: '/app/export', tier: 'all' },
      ]
    },
    {
      title: 'SUPPORTO',
      items: [
        { icon: Book, label: 'Manuale Utente', path: '/app/help', tier: 'all' },
        { icon: Settings, label: 'Impostazioni', path: '/app/settings', tier: 'all' },
        { icon: Crown, label: 'Admin', path: '/app/admin', tier: 'all' },
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
        { icon: Sprout, label: 'Il Mio Orto', path: '/app/garden', tier: 'all' },
        { icon: Leaf, label: 'Piante', path: '/app/plants', tier: 'all' },
        { icon: Heart, label: 'Salute', path: '/app/advice', tier: 'all' },
        { icon: BarChart3, label: 'Progressi', path: '/app/progress', tier: 'all' },
      ],
      tier: 'all'
    },
    {
      title: 'FUNZIONALITÀ AVANZATE',
      items: [
        { icon: ChefHat, label: 'Ricette', path: '/app/recipes', tier: 'all' },
        { icon: Book, label: 'Guide Premium', path: '/app/guides', tier: 'all' },
        { icon: Wifi, label: 'Smart Hub', path: '/app/smart', tier: 'all' },
      ],
      tier: 'all',
      collapsible: true
    },
    {
      title: 'SUPPORTO',
      items: [
        { icon: Book, label: 'Manuale Utente', path: '/app/help', tier: 'all' },
        { icon: Settings, label: 'Impostazioni', path: '/app/settings', tier: 'all' },
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
        { icon: Sprout, label: 'Il Mio Orto', path: '/app/garden', tier: 'all' },
        { icon: Leaf, label: 'Piante', path: '/app/plants', tier: 'all' },
        { icon: Heart, label: 'Salute', path: '/app/advice', tier: 'all' },
        { icon: BarChart3, label: 'Progressi', path: '/app/progress', tier: 'all' },
        { icon: Wifi, label: 'Smart Hub', path: '/app/smart', tier: 'all' },
      ],
      tier: 'all'
    },
    {
      title: 'SUPPORTO',
      items: [
        { icon: Book, label: 'Manuale Utente', path: '/app/help', tier: 'all' },
        { icon: Settings, label: 'Impostazioni', path: '/app/settings', tier: 'all' },
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
            <h2 className="text-lg sm:text-lg md:text-xl font-bold text-gray-900">🌱 OrtoMio</h2>
            <p className="text-xs text-gray-500 mt-1">
              {safeTier === 'PRO' ? 'PRO Professional' : safeTier === 'PLUS' ? 'PLUS' : 'FREE'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Chiudi menu"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Garden Selector Prominente */}
        {!loading && activeGarden && (
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <button
              onClick={() => setIsGardenSelectorOpen(!isGardenSelectorOpen)}
              className="w-full text-left min-h-[44px] flex items-center"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Home size={18} className="text-green-600" />
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{activeGarden.name}</h3>
                    <ChevronDown 
                      size={16} 
                      className={`text-gray-500 transition-transform ${isGardenSelectorOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-col md:flex-row sm:items-center gap-3 sm:gap-4 text-xs text-gray-600">
                    <span>🌱 {activePlantsCount} piante</span>
                    <span>📋 {todayTasksCount} task oggi</span>
                  </div>
                </div>
              </div>
            </button>
            
            {isGardenSelectorOpen && gardens.length > 1 && (
              <div className="mt-3 space-y-1 animate-in slide-in-from-top-3">
                {gardens.map((garden) => (
                  <button
                    key={garden.id}
                    onClick={() => {
                      setActiveGarden(garden)
                      setIsGardenSelectorOpen(false)
                      handleLinkClick('/app')
                    }}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm min-h-[44px] flex items-center ${
                      garden.id === activeGarden.id
                        ? 'bg-green-100 text-green-900 font-medium'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Home size={16} className="inline mr-2 flex-shrink-0" />
                    <span className="truncate">{garden.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Menu Content - Scrollable */}
        <div className="overflow-y-auto h-[calc(100vh-140px)] pb-4">
          <nav className="p-4 space-y-4 sm:space-y-6">
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
                    className={`w-full flex items-center justify-between px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors min-h-[44px] ${
                      group.collapsible ? 'cursor-pointer hover:text-gray-700' : ''
                    }`}
                  >
                    <span>{group.title}</span>
                    {group.collapsible && (
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                      />
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
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left min-h-[44px] ${
                              isActive
                                ? 'bg-gray-100 text-gray-900 font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon size={20} className="flex-shrink-0" />
                            <span className="flex-1 text-sm sm:text-base truncate">{item.label}</span>
                            {item.badge && (
                              <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded flex-shrink-0">
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
