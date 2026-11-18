'use client'

import React from 'react'
import Link from 'next/link'
import { BookOpen, HelpCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { CAPABILITIES } from '@/config/capabilities'
import AuthStatus from './AuthStatus'
import { UI_LAYERS } from '@/components/shared/uiLayers'

export default function TopBar() {
  const pathname = usePathname()
  const section = CAPABILITIES.filter(item => item.route && item.id !== 'help' &&
    (pathname === item.route || (item.route !== '/app' && pathname.startsWith(`${item.route}/`))))
    .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))[0]
  return (
    <div
      className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0"
      style={{ zIndex: UI_LAYERS.topBar }}
    >
      {/* Logo/Brand - Hidden on mobile (hamburger menu shows it) */}
      <div className="hidden lg:flex items-center gap-4">
        <h1 className="text-xl font-bold text-emerald-700">OrtoMio Agricoltura</h1>
      </div>
      
      {/* Mobile: Spacer to push content right */}
      <div className="lg:hidden flex-1" />

      {/* Right side: Manual + Auth */}
      <div className="flex items-center gap-2 sm:gap-4">
        {section?.helpHref && <Link href={section.helpHref}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-green-800 hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-800"
          aria-label={`Guida alla sezione ${section.label}`} title={`Guida: ${section.label}`}>
          <HelpCircle size={18} aria-hidden="true" /><span className="hidden sm:inline">Guida sezione</span>
        </Link>}
        {/* Link al Manuale - Icon only on mobile */}
        <Link
          href="/app/help"
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Manuale"
          aria-label="Apri il manuale completo"
        >
          <BookOpen size={18} />
          <span className="hidden sm:inline">Manuale</span>
        </Link>

        {/* Auth Status (con logout) */}
        <AuthStatus />
      </div>
    </div>
  )
}
