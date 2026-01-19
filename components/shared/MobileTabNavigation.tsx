'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface TabItem {
  id: string
  label: string
  emoji?: string
  icon?: React.ComponentType<any>
  badge?: number
}

interface MobileTabNavigationProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export default function MobileTabNavigation({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '' 
}: MobileTabNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const currentTab = tabs.find(tab => tab.id === activeTab)

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Previeni scroll del body quando il dropdown è aperto
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Chiudi dropdown quando si preme ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Mobile: Dropdown Navigation */}
      <div className="block md:hidden">
        {/* Current Tab Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-50 transition-colors shadow-sm touch-manipulation"
          style={{ minHeight: '56px' }}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center gap-3">
            {currentTab?.emoji && (
              <span className="text-lg">{currentTab.emoji}</span>
            )}
            {currentTab?.icon && (
              <currentTab.icon size={20} className="text-gray-600" />
            )}
            <span className="font-medium">{currentTab?.label}</span>
            {currentTab?.badge && currentTab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-bold">
                {currentTab.badge}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="text-gray-400" size={20} />
          ) : (
            <ChevronDown className="text-gray-400" size={20} />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black bg-opacity-25 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu */}
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
              {/* Header del dropdown */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <span className="font-semibold text-gray-700">Seleziona sezione</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Chiudi menu"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              
              {/* Lista tab */}
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 touch-manipulation ${
                      isActive ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                    style={{ minHeight: '56px' }}
                    role="menuitem"
                    tabIndex={isOpen ? 0 : -1}
                  >
                    {tab.emoji && (
                      <span className="text-lg">{tab.emoji}</span>
                    )}
                    {Icon && (
                      <Icon size={20} className={isActive ? 'text-green-600' : 'text-gray-500'} />
                    )}
                    <span className="flex-1 font-medium">{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-bold">
                        {tab.badge}
                      </span>
                    )}
                    {isActive && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Desktop: Tab Navigation */}
      <div className="hidden md:block border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.emoji && (
                  <span className="text-base">{tab.emoji}</span>
                )}
                {Icon && (
                  <Icon size={16} className={activeTab === tab.id ? 'text-green-600' : 'text-gray-500'} />
                )}
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">
                  {tab.label.split(' ')[0]}
                </span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Mobile: Current Tab Indicator */}
      <div className="block md:hidden mt-3">
        <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium text-green-800">
            Sezione attiva: {currentTab?.label}
          </span>
          {currentTab?.badge && currentTab.badge > 0 && (
            <span className="ml-auto bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              {currentTab.badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}