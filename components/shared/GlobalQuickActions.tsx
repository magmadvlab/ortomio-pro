'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, X, Sprout, Camera, ShoppingBasket, Calendar, type LucideIcon } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  color: string
  action: () => void
}

export function GlobalQuickActions() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Azioni contestuali basate su pathname
  const getContextualActions = (): QuickAction[] => {
    // In "Il Mio Orto"
    if (pathname?.includes('/garden')) {
      return [
        {
          id: 'plant',
          label: 'Nuova Pianta',
          icon: Sprout,
          color: 'bg-green-500',
          action: () => {
            router.push('/app/garden?tab=plants&action=add')
            setIsOpen(false)
          }
        },
        {
          id: 'task',
          label: 'Nuovo Task',
          icon: Calendar,
          color: 'bg-blue-500',
          action: () => {
            router.push('/app/garden?tab=list&action=add')
            setIsOpen(false)
          }
        }
      ]
    }
    
    // In "Salute"
    if (pathname?.includes('/advice')) {
      return [
        {
          id: 'photo',
          label: 'Scatta Foto',
          icon: Camera,
          color: 'bg-purple-500',
          action: () => {
            router.push('/app/advice')
            setIsOpen(false)
          }
        }
      ]
    }
    
    // In Dashboard o altre pagine - tutte le azioni
    return [
    {
      id: 'sowing',
      label: 'Nuova Semina',
      icon: Sprout,
      color: 'bg-green-500',
      action: () => {
        router.push('/app/garden?tab=list&action=add')
        setIsOpen(false)
      }
    },
    {
      id: 'task',
      label: 'Nuovo Task',
      icon: Calendar,
      color: 'bg-blue-500',
      action: () => {
        router.push('/app/garden?tab=list&action=add')
        setIsOpen(false)
      }
    },
    {
      id: 'photo',
      label: 'Scatta Foto',
      icon: Camera,
      color: 'bg-purple-500',
      action: () => {
        router.push('/app/advice')
        setIsOpen(false)
      }
    },
    {
      id: 'harvest',
      label: 'Registra Raccolto',
      icon: ShoppingBasket,
      color: 'bg-orange-500',
      action: () => {
          router.push('/app/progress?tab=harvests&action=add')
        setIsOpen(false)
      }
    }
  ]
  }
  
  const actions = getContextualActions()
  
  // Chiudi menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  // Chiudi con ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])
  
  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6" ref={menuRef}>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
          isOpen
            ? 'bg-red-500 text-white rotate-45'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
        aria-label={isOpen ? 'Chiudi azioni rapide' : 'Apri azioni rapide'}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <Plus size={24} />
        )}
      </button>
      
      {/* Actions Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 animate-in fade-in slide-in-from-bottom-4">
          {actions.map((action, idx) => {
            const Icon = action.icon
            return (
              <div
                key={action.id}
                className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
                style={{
                  animationDelay: `${idx * 50}ms`,
                }}
              >
                <span className="bg-white text-gray-700 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={action.action}
                  className={`${action.color} text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95`}
                  aria-label={action.label}
                >
                  <Icon size={20} />
                </button>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Backdrop quando aperto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

