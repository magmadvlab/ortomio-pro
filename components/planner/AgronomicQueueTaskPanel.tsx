'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Plus, TrendingUp } from 'lucide-react'
import type { Garden, GardenTask } from '@/types'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { directorService } from '@/services/directorService'
import { buildAgronomicQueueTaskDrafts } from '@/services/agronomicQueueTaskService'
import {
  getAgronomicQueueOutcomeSummary,
  type AgronomicQueueOutcomeSummary,
} from '@/services/agronomicQueueOutcomeService'

interface AgronomicQueueTaskPanelProps {
  garden: Garden
  tasks: GardenTask[]
  onTaskCreate: (taskData: Omit<GardenTask, 'id'>) => Promise<void>
}

export default function AgronomicQueueTaskPanel({
  garden,
  tasks,
  onTaskCreate,
}: AgronomicQueueTaskPanelProps) {
  const { user } = useAuth()
  const { storageProvider } = useStorage()
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof directorService.getDailyBriefing>>['transversalQueue']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingIds, setCreatingIds] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [outcomeSummary, setOutcomeSummary] = useState<AgronomicQueueOutcomeSummary | null>(null)

  useEffect(() => {
    if (!garden?.id || !user?.id) {
      return
    }

    const loadQueue = async () => {
      try {
        setLoading(true)
        setError(null)
        const [briefing, summary] = await Promise.all([
          directorService.getDailyBriefing(user.id, garden.id),
          getAgronomicQueueOutcomeSummary(storageProvider, garden.id),
        ])
        setQueue(briefing.transversalQueue || [])
        setOutcomeSummary(summary)
      } catch (loadError) {
        console.error('Error loading agronomic queue briefing:', loadError)
        setError('Impossibile caricare la coda trasversale.')
      } finally {
        setLoading(false)
      }
    }

    loadQueue()
  }, [garden.id, user?.id, storageProvider, tasks.length, tasks.filter(task => task.completed).length])

  const drafts = buildAgronomicQueueTaskDrafts(garden.id, queue, tasks).slice(0, 6)

  const handleCreateTask = async (draftId: string) => {
    const draft = drafts.find((candidate) => candidate.id === draftId)
    if (!draft) {
      return
    }

    try {
      setCreatingIds((current) => ({ ...current, [draftId]: true }))
      setFeedback((current) => {
        const next = { ...current }
        delete next[draftId]
        return next
      })
      await onTaskCreate(draft.task)
      setFeedback((current) => ({ ...current, [draftId]: 'Task creato.' }))
    } catch (creationError) {
      console.error('Error creating agronomic queue task:', creationError)
      setFeedback((current) => ({ ...current, [draftId]: 'Errore nella creazione del task.' }))
    } finally {
      setCreatingIds((current) => ({ ...current, [draftId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-gray-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <h2 className="font-semibold">Task Trasversali</h2>
            <p className="text-sm text-gray-500">Costruzione della coda agronomica in corso...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h2 className="font-semibold text-gray-900">Task Trasversali</h2>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 text-emerald-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Task Trasversali</h2>
            <p className="text-sm text-gray-600">
              La coda agronomica trasforma priorita su acqua, salute, fenologia e prescription in task operativi per il planner.
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">{drafts.length} bozze</div>
      </div>

      {outcomeSummary && outcomeSummary.totalCompleted > 0 && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 md:grid-cols-5">
          <div>
            <div className="text-xs uppercase tracking-wide text-emerald-700">Completati</div>
            <div className="text-lg font-semibold text-emerald-900">{outcomeSummary.totalCompleted}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-emerald-700">Ultimi 7 giorni</div>
            <div className="text-lg font-semibold text-emerald-900">{outcomeSummary.completedThisWeek}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-emerald-700">Score medio</div>
            <div className="text-lg font-semibold text-emerald-900">{outcomeSummary.averagePriorityScore}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-emerald-700">Esecuzioni verificate</div>
            <div className="text-lg font-semibold text-emerald-900">{outcomeSummary.verifiedExecutions}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-emerald-700">Risultati misurati</div>
            <div className="text-lg font-semibold text-emerald-900">{outcomeSummary.measuredOutcomes}</div>
          </div>
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
          Nessuna nuova bozza task: la coda e gia coperta da task aperti oppure non segnala interventi operativi prioritari.
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {draft.task.taskType}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      {draft.urgencyLabel === 'immediate'
                        ? 'Subito'
                        : draft.urgencyLabel === 'next_cycle'
                          ? 'Prossimo ciclo'
                          : 'Monitorare'}
                    </span>
                    <span className="text-xs text-gray-500">
                      score {draft.priorityScore} · conf. {(draft.priorityConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{draft.title}</h3>
                    <p className="text-sm text-gray-600">{draft.task.notes}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Pianificato per {draft.task.date}
                    {draft.missingSignals.length > 0
                      ? ` · segnali mancanti: ${draft.missingSignals.slice(0, 3).join(', ')}`
                      : ''}
                  </div>
                  {feedback[draft.id] && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {feedback[draft.id]}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleCreateTask(draft.id)}
                  disabled={Boolean(creatingIds[draft.id])}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingIds[draft.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Crea task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
