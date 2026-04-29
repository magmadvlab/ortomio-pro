'use client'

import { useEffect, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { AgronomicQueueTaskOperationalSummary } from '@/services/agronomicQueueTaskService'
import { loadTaskExecutionBannerDetails } from '@/services/taskExecutionBannerService'

interface TaskExecutionEvidenceContractProps {
  sourceTaskId?: string
  storageProvider?: Pick<IStorageProvider, 'getTask'> | null
  operationalSummary?: AgronomicQueueTaskOperationalSummary | null
  className?: string
  compact?: boolean
}

export default function TaskExecutionEvidenceContract({
  sourceTaskId,
  storageProvider,
  operationalSummary: providedOperationalSummary,
  className = '',
  compact = false,
}: TaskExecutionEvidenceContractProps) {
  const [loadedOperationalSummary, setLoadedOperationalSummary] =
    useState<AgronomicQueueTaskOperationalSummary | null>(providedOperationalSummary || null)

  useEffect(() => {
    if (providedOperationalSummary) {
      setLoadedOperationalSummary(providedOperationalSummary)
      return
    }

    if (!storageProvider?.getTask || !sourceTaskId) {
      setLoadedOperationalSummary(null)
      return
    }

    let isActive = true

    const loadSummary = async () => {
      const details = await loadTaskExecutionBannerDetails(storageProvider, sourceTaskId)
      if (isActive) {
        setLoadedOperationalSummary(details?.operationalSummary || null)
      }
    }

    void loadSummary()

    return () => {
      isActive = false
    }
  }, [providedOperationalSummary, sourceTaskId, storageProvider])

  const operationalSummary = providedOperationalSummary || loadedOperationalSummary
  if (!operationalSummary) {
    return null
  }

  return (
    <div className={`rounded-lg border border-emerald-100 bg-emerald-50/80 p-3 ${className}`.trim()}>
      <div className="flex items-start gap-2">
        <ClipboardCheck size={16} className="mt-0.5 shrink-0 text-emerald-700" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900">
            {operationalSummary.mobileActionLabel} • {operationalSummary.mobileEvidencePrompt}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {compact ? operationalSummary.evidenceLabels.slice(0, 2).join(' · ') : operationalSummary.evidenceLabels.join(' · ')}
          </p>
          {!compact && (
            <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
              Contratto minimo di evidence
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
