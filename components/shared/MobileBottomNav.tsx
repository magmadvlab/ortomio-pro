'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Sprout,
  Heart,
  BarChart3,
  Leaf,
} from 'lucide-react'

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  label: string
  path: string
}

interface MobileBottomNavProps {
  onMenuClick?: () => void
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Home', path: '/app' },
    { icon: Sprout, label: 'Orto', path: '/app/garden' },
    { icon: Leaf, label: 'Vivaio', path: '/app/semenzaio' },
    { icon: BarChart3, label: 'Progressi', path: '/app/progress' },
  ]

  return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:hidden safe-area-bottom">
        <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon
          const isActive = pathname === item.path || (item.path === '/app' && pathname === '/app')

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 min-w-[44px] min-h-[44px] ${
                isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
  )
}
