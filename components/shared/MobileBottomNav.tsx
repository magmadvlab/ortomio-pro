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
  Menu,
} from 'lucide-react'

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  path: string
  onClick?: () => void
}

interface MobileBottomNavProps {
  onMenuClick?: () => void
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Home', path: '/app' },
    { icon: Calendar, label: 'Planner', path: '/app/planner' },
    { icon: BookOpen, label: 'Diario', path: '/app/journal' },
    { icon: ShoppingBasket, label: 'Raccolto', path: '/app/harvest' },
    { icon: Sparkles, label: 'Cura', path: '/app/advice' },
    { icon: Menu, label: 'Menu', path: '#', onClick: onMenuClick },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.path !== '#' && pathname === item.path
          const isMenuButton = item.path === '#'

          if (isMenuButton && onMenuClick) {
            return (
              <button
                key="menu"
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center w-full h-full transition-colors duration-200 min-w-[44px] min-h-[44px]"
                aria-label="Apri menu"
              >
                <Icon size={22} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                <span className="text-[10px] mt-1 font-medium text-gray-400">Menu</span>
              </button>
            )
          }

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 min-w-[44px] min-h-[44px] ${
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-green-400'
              }`}
            >
              <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

