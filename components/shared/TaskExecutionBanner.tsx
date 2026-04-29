'use client'

import { useEffect, useState } from 'react'
import { Calendar, MapPin, Play, X } from 'lucide-react'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { TaskExecutionContext } from '@/services/taskExecutionLaunchService'
import type { TaskExecutionBannerDetails } from '@/services/taskExecutionBannerService'
import { loadTaskExecutionBannerDetails } from '@/services/taskExecutionBannerService'
import TaskExecutionEvidenceContract from '@/components/shared/TaskExecutionEvidenceContract'

interface TaskExecutionBannerProps {
  context: TaskExecutionContext
  theme?: 'nutrition' | 'irrigation' | 'mechanical' | 'harvest'
  storageProvider?: Pick<IStorageProvider, 'getTask'> | null
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
  storageProvider,
  onResume,
  onDismiss,
}: TaskExecutionBannerProps) {
  const [details, setDetails] = useState<TaskExecutionBannerDetails | null>(null)
  const styles = themeStyles[theme]
  const scopeLabel = context.rowNumber
    ? `Fila ${context.rowNumber}`
    : context.rowId
      ? `Riga ${context.rowId}`
      : context.zoneId
        ? `Zona ${context.zoneId}`
        : null

  useEffect(() => {
    let isActive = true

    const loadDetails = async () => {
      const nextDetails = await loadTaskExecutionBannerDetails(storageProvider, context.sourceTaskId)
      if (isActive) {
        setDetails(nextDetails)
      }
    }

    void loadDetails()

    return () => {
      isActive = false
    }
  }, [context.sourceTaskId, storageProvider])

  const operationalSummary = details?.operationalSummary
  const mobileSummaryChips = details?.mobileSummaryChips || []

  const getReadinessClasses = (readiness: 'ready' | 'partial' | 'blocked') => {
    switch (readiness) {
      case 'ready':
        return 'bg-emerald-100 text-emerald-700'
      case 'blocked':
        return 'bg-amber-100 text-amber-800'
      case 'partial':
      default:
        return 'bg-sky-100 text-sky-700'
    }
  }

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

            {operationalSummary && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${getReadinessClasses(
                    operationalSummary.readiness
                  )}`}
                >
                  {operationalSummary.readinessLabel}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${styles.badge}`}>
                  {operationalSummary.focusLabel}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${styles.badge}`}>
                  {operationalSummary.urgencyLabel}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${styles.badge}`}>
                  {operationalSummary.confidenceLabel}
                </span>
                {operationalSummary.contextLabels.map((label) => (
                  <span
                    key={`${context.sourceTaskId}:${label}`}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${styles.badge}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {mobileSummaryChips.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:hidden">
                {mobileSummaryChips.map((label) => (
                  <span
                    key={`${context.sourceTaskId}:mobile:${label}`}
                    className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-gray-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {operationalSummary?.primaryRationale && (
              <p className="text-xs text-gray-700">{operationalSummary.primaryRationale}</p>
            )}

            {operationalSummary?.missingSignalsLabel && (
              <p className="text-xs text-amber-700">{operationalSummary.missingSignalsLabel}</p>
            )}

            {details?.visibleNotes && (
              <p className="text-xs text-gray-600">{details.visibleNotes}</p>
            )}

            <TaskExecutionEvidenceContract operationalSummary={operationalSummary} className="sm:hidden" compact />
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
