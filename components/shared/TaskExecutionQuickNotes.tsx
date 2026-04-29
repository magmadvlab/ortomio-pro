'use client'

import { useEffect, useMemo, useState } from 'react'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import { loadTaskExecutionBannerDetails } from '@/services/taskExecutionBannerService'

interface TaskExecutionQuickNotesProps {
  sourceTaskId?: string
  storageProvider?: Pick<IStorageProvider, 'getTask'> | null
  notes?: string
  onChange: (notes: string) => void
  extraTokens?: string[]
}

const appendToken = (notes: string, token: string) => {
  const cleanedNotes = notes.trim()
  if (!cleanedNotes) {
    return token
  }
  if (cleanedNotes.toLowerCase().includes(token.toLowerCase())) {
    return cleanedNotes
  }
  return `${cleanedNotes} • ${token}`
}

export default function TaskExecutionQuickNotes({
  sourceTaskId,
  storageProvider,
  notes = '',
  onChange,
  extraTokens = [],
}: TaskExecutionQuickNotesProps) {
  const [evidenceLabels, setEvidenceLabels] = useState<string[]>([])

  useEffect(() => {
    if (!storageProvider?.getTask || !sourceTaskId) {
      setEvidenceLabels([])
      return
    }

    let isActive = true

    const loadLabels = async () => {
      const details = await loadTaskExecutionBannerDetails(storageProvider, sourceTaskId)
      if (isActive) {
        setEvidenceLabels(details?.operationalSummary?.evidenceLabels || [])
      }
    }

    void loadLabels()

    return () => {
      isActive = false
    }
  }, [sourceTaskId, storageProvider])

  const suggestedTokens = useMemo(
    () =>
      [
        ...evidenceLabels.slice(0, 3).map((label) => `ok ${label}`),
        ...extraTokens,
      ].filter((value, index, items) => items.indexOf(value) === index),
    [evidenceLabels, extraTokens]
  )

  if (suggestedTokens.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Quick payload</p>
      <p className="mt-1 text-xs text-slate-600">Aggiungi note rapide coerenti con l’evidence minima richiesta.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestedTokens.map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => onChange(appendToken(notes, token))}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100"
          >
            {token}
          </button>
        ))}
      </div>
    </div>
  )
}
