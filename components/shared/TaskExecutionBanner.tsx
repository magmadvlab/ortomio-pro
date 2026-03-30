'use client'

import { Calendar, MapPin, Play, X } from 'lucide-react'
import type { TaskExecutionContext } from '@/services/taskExecutionLaunchService'

interface TaskExecutionBannerProps {
  context: TaskExecutionContext
  theme?: 'nutrition' | 'irrigation' | 'mechanical' | 'harvest'
  onResume: () => void
  onDismiss: () => void
}

const themeStyles = {
  nutrition: {
    wrapper: 'border-green-200 bg-green-50',
    accent: 'bg-green-600',
    badge: 'bg-green-100 text-green-700',
    button: 'bg-green-600 hover:bg-green-700',
    secondary: 'text-green-700 hover:bg-green-100',
  },
  irrigation: {
    wrapper: 'border-blue-200 bg-blue-50',
    accent: 'bg-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'text-blue-700 hover:bg-blue-100',
  },
  mechanical: {
    wrapper: 'border-emerald-200 bg-emerald-50',
    accent: 'bg-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    secondary: 'text-emerald-700 hover:bg-emerald-100',
  },
  harvest: {
    wrapper: 'border-amber-200 bg-amber-50',
    accent: 'bg-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700',
    secondary: 'text-amber-700 hover:bg-amber-100',
  },
} as const

export default function TaskExecutionBanner({
  context,
  theme = 'nutrition',
  onResume,
  onDismiss,
}: TaskExecutionBannerProps) {
  const styles = themeStyles[theme]
  const scopeLabel = context.rowNumber
    ? `Fila ${context.rowNumber}`
    : context.rowId
      ? `Riga ${context.rowId}`
      : context.zoneId
        ? `Zona ${context.zoneId}`
        : null

  return (
    <div className={`mb-6 rounded-xl border p-4 ${styles.wrapper}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className={`mt-1 h-3 w-3 rounded-full ${styles.accent}`} />
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">Task sorgente attivo</p>
              <p className="text-sm text-gray-700">
                {context.plantName ? `${context.plantName} • ` : ''}
                {context.taskType} • #{context.sourceTaskId.slice(0, 8)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {context.date && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${styles.badge}`}>
                  <Calendar size={12} />
                  {context.date}
                </span>
              )}
              {scopeLabel && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${styles.badge}`}>
                  <MapPin size={12} />
                  {scopeLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onResume}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${styles.button}`}
          >
            <Play size={14} />
            Riprendi esecuzione
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${styles.secondary}`}
          >
            <X size={14} />
            Chiudi contesto
          </button>
        </div>
      </div>
    </div>
  )
}
