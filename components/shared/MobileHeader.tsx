'use client'

import React, { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import AuthStatus from './AuthStatus'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-green-200 shadow-sm lg:hidden">
      {!showSearch ? (
        <div className="px-3 py-2 flex items-center justify-between h-14">
          {/* Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Apri menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Logo/Titolo */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-900">🌱 OrtoMio</h1>
          </div>

          {/* Search & Auth */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Cerca"
            >
              <Search size={20} className="text-gray-700" />
            </button>
            <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
              <AuthStatus />
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2 flex items-center gap-2 h-14">
          <button
            onClick={() => setShowSearch(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Chiudi ricerca"
          >
            <X size={20} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <GlobalSearch />
          </div>
        </div>
      )}
    </header>
  )
}

