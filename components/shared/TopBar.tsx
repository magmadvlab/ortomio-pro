'use client'

import React from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import AuthStatus from './AuthStatus'

export default function TopBar() {
  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* Logo/Brand - Hidden on mobile (hamburger menu shows it) */}
      <div className="hidden lg:flex items-center gap-4">
        <h1 className="text-xl font-bold text-green-600">OrtoMio PRO</h1>
      </div>
      
      {/* Mobile: Spacer to push content right */}
      <div className="lg:hidden flex-1" />

      {/* Right side: Manual + Auth */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Link al Manuale - Icon only on mobile */}
        <Link
          href="/app/help"
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Manuale"
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
