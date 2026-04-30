'use client'

import { useEffect, useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import { loadTaskExecutionBannerDetails, type TaskExecutionBannerDetails } from '@/services/taskExecutionBannerService'

interface TaskExecutionFormContextSummaryProps {
  sourceTaskId?: string
  storageProvider?: Pick<IStorageProvider, 'getTask'> | null
  className?: string
}

export default function TaskExecutionFormContextSummary({
  sourceTaskId,
  storageProvider,
  className = '',
}: TaskExecutionFormContextSummaryProps) {
  const [details, setDetails] = useState<TaskExecutionBannerDetails | null>(null)

  useEffect(() => {
    if (!storageProvider?.getTask || !sourceTaskId) {
      setDetails(null)
      return
    }

    let isActive = true

    const loadDetails = async () => {
      const nextDetails = await loadTaskExecutionBannerDetails(storageProvider, sourceTaskId)
      if (isActive) {
        setDetails(nextDetails)
      }
    }

    void loadDetails()

    return () => {
      isActive = false
    }
  }, [sourceTaskId, storageProvider])

  if (!details) {
    return null
  }

  const { sourceTask, visibleNotes, mobileSummaryChips, operationalSummary } = details
  const scopeLabel =
    typeof sourceTask.rowNumber === 'number'
      ? `Fila ${sourceTask.rowNumber}`
      : sourceTask.rowId
        ? `Riga ${sourceTask.rowId}`
        : sourceTask.zoneId
          ? `Zona ${sourceTask.zoneId}`
          : null

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${className}`.trim()}>
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Contesto task sorgente</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {sourceTask.plantName ? `${sourceTask.plantName} • ` : ''}
            {sourceTask.taskType}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {sourceTask.date && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-slate-700">
              <Calendar size={12} />
              {sourceTask.date}
            </span>
          )}
          {scopeLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-slate-700">
              <MapPin size={12} />
              {scopeLabel}
            </span>
          )}
          {mobileSummaryChips.map((label) => (
            <span
              key={`${sourceTaskId}:summary:${label}`}
              className="inline-flex items-center rounded-full bg-white px-2 py-1 text-slate-700"
            >
              {label}
            </span>
          ))}
        </div>

        {operationalSummary?.primaryRationale && (
          <p className="text-xs text-slate-700">{operationalSummary.primaryRationale}</p>
        )}

        {visibleNotes && <p className="text-xs text-slate-600">{visibleNotes}</p>}
      </div>
    </div>
  )
}
