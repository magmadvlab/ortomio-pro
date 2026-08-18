'use client'

import {
  BarChart3, BookOpen, Bot, Brain, CircleDot, Crown, Database, Droplets,
  FlaskConical, Grape, Heart, LayoutDashboard, Leaf, Link2, Map, MapPinned,
  Satellite, Settings, Shield, Sprout, Tractor, TreePine, Wifi,
  type LucideIcon,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { CAPABILITIES, getCapabilityBadge, type CapabilityDescriptor, type CapabilityIcon } from '@/config/capabilities'

const ICONS: Record<CapabilityIcon, LucideIcon> = {
  dashboard: LayoutDashboard, farm: MapPinned, garden: Sprout, planner: Bot,
  plants: Leaf, health: Heart, advice: Brain, diary: BookOpen, orchard: TreePine,
  olive: CircleDot, vineyard: Grape, irrigation: Droplets, nutrition: FlaskConical,
  mechanical: Tractor, certifications: Shield, prediction: Brain, satellite: Satellite,
  map: Map, analytics: BarChart3, smart: Wifi, export: Database, help: BookOpen,
  settings: Settings, admin: Crown, drone: Bot, traceability: Link2,
  harvest: Database, seedbed: Sprout,
}

export function CapabilityIconView({ icon, size = 18 }: { icon: CapabilityIcon; size?: number }) {
  const Icon = ICONS[icon]
  return <Icon size={size} className="flex-shrink-0" aria-hidden="true" />
}

export function CapabilityBadge({ capability }: { capability: CapabilityDescriptor }) {
  const badge = getCapabilityBadge(capability)
  if (!badge) return null
  const simulated = capability.maturity === 'simulation'
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
      simulated ? 'bg-amber-100 text-amber-800' : 'bg-violet-100 text-violet-800'
    }`}>
      {badge}
    </span>
  )
}

export function CapabilityPageBadge() {
  const pathname = usePathname()
  const capability = CAPABILITIES
    .filter(item => item.route && (pathname === item.route || pathname.startsWith(`${item.route}/`)))
    .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))[0]
  if (!capability || capability.maturity === 'stable') return null
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <CapabilityBadge capability={capability} />
        <span>{capability.description}</span>
      </div>
    </div>
  )
}
