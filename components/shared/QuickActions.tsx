'use client'

import React, { useState } from 'react'
import { Plus, X, Sprout, ShoppingBasket, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  action: () => void
  color: string
}

interface QuickActionsProps {
  gardenId?: string
  onNewSowing?: () => void
  onRecordHarvest?: () => void
  onReportIssue?: () => void
}

export function QuickActions({
  gardenId,
  onNewSowing,
  onRecordHarvest,
  onReportIssue,
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const actions: QuickAction[] = [
    {
      id: 'sowing',
      label: 'Vai al Diario',
      icon: Sprout,
      action: () => {
        setIsOpen(false)
        if (onNewSowing) {
          onNewSowing()
        } else {
          router.push('/app/garden?tab=list')
        }
      },
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'harvest',
      label: 'Vai a Raccolti',
      icon: ShoppingBasket,
      action: () => {
        setIsOpen(false)
        if (onRecordHarvest) {
          onRecordHarvest()
        } else {
          router.push('/app/progress?tab=harvests')
        }
      },
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      id: 'advice',
      label: 'Chiedi Consiglio',
      icon: AlertTriangle,
      action: () => {
        setIsOpen(false)
        if (onReportIssue) {
          onReportIssue()
        } else {
          router.push('/app/advice')
        }
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse items-end gap-3">
            {isOpen &&
          actions.map((action, index) => {
            const Icon = action.icon
            return (
              <div
                key={action.id}
                className="flex items-center gap-3"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${index * 50}ms both`,
                }}
              >
                <span className="bg-white text-gray-700 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={action.action}
                  className={`${action.color} text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110`}
                  aria-label={action.label}
                >
                  <Icon size={24} />
                </button>
              </div>
            )
          })}

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${
            isOpen
              ? 'bg-red-500 hover:bg-red-600 rotate-45'
              : 'bg-ortomio-green-500 hover:bg-ortomio-green-600'
          } text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110`}
          aria-label={isOpen ? 'Chiudi menu' : 'Apri menu azioni rapide'}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

    </div>
  )
}
