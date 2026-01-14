'use client'

import React from 'react'
import { Calendar, CalendarDays, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export type CalendarView = 'day' | 'week' | 'month'

interface CalendarViewSwitcherProps {
  currentView: CalendarView
  onViewChange: (view: CalendarView) => void
}

export function CalendarViewSwitcher({ currentView, onViewChange }: CalendarViewSwitcherProps) {
  const views: { id: CalendarView; label: string; icon: any }[] = [
    { id: 'day', label: 'Giorno', icon: Clock },
    { id: 'week', label: 'Settimana', icon: CalendarDays },
    { id: 'month', label: 'Mese', icon: Calendar },
  ]

  return (
    <div className="flex gap-3 bg-gray-100 p-3 rounded-lg">
      {views.map((view) => {
        const Icon = view.icon
        const isActive = currentView === view.id
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-white text-ortomio-green-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon size={18} />
            <span className="text-sm">{view.label}</span>
          </button>
        )
      })}
    </div>
  )
}

