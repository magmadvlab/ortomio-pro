'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Plus, TrendingUp } from 'lucide-react'
import type { Garden, GardenTask } from '@/types'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { directorService } from '@/services/directorService'
import {
  getAgronomicDecisionLedgerAnalyticsSummary,
  getAgronomicDecisionLedgerHistory,
  type AgronomicDecisionLedgerAnalyticsSummary,
  type AgronomicDecisionLedgerHistoryItem,
} from '@/services/agronomicDecisionLedgerAnalyticsService'
import { formatAgronomicEconomicSummary } from '@/services/agronomicEconomicPriorityService'
import {
  buildAgronomicQueueTaskDrafts,
  humanizeAgronomicSignal,
  stripAgronomicQueueTaskMetadata,
} from '@/services/agronomicQueueTaskService'
import { recordAgronomicDecisionTaskCreation } from '@/services/agronomicDecisionLedgerService'
import {
  getAgronomicQueueOutcomeSummary,
  type AgronomicQueueOutcomeSummary,
} from '@/services/agronomicQueueOutcomeService'
import type { AgronomicRefinedContext } from '@/types/agronomicKernel'

interface AgronomicQueueTaskPanelProps {
  garden: Garden
  tasks: GardenTask[]
  onTaskCreate: (taskData: Omit<GardenTask, 'id'>) => Promise<void>
}

const PROFILE_LABELS: Record<string, string> = {
  vineyard_quality: 'Vigneto',
  olive_grove_oil: 'Oliveto',
  orchard_generic: 'Frutteto',
}

const REFINED_CONTEXT_LABELS: Record<string, string> = {
  protected_culture: 'Coltura protetta',
  open_field: 'Campo aperto',
  orchard: 'Frutteto',
  vineyard: 'Vigneto',
  olive_grove: 'Oliveto',
  indoor: 'Indoor',
  hydroponic: 'Idroponica',
  aquaponic: 'Acquaponica',
  aeroponic: 'Aeroponica',
  mixed: 'Sistema misto',
  rainfed: 'Asciutta',
  manual_irrigation: 'Irrigazione manuale',
  pressurized_irrigation: 'Irrigazione in pressione',
  wine: 'Vino',
  table_grape: 'Uva da tavola',
  oil: 'Olio',
  table_olive: 'Oliva da mensa',
  fresh_market: 'Mercato fresco',
  processing: 'Trasformazione',
  sheltered: 'Riparato',
  balanced: 'Bilanciato',
  exposed: 'Esposto',
  flat: 'Pianeggiante',
  rolling: 'Ondulato',
  steep: 'Ripido',
}

const humanizeRefinedContextValue = (value?: string | null) =>
  value ? REFINED_CONTEXT_LABELS[value] || value.replace(/_/g, ' ') : null

const buildRefinedContextPills = (context?: AgronomicRefinedContext | null) => {
  if (!context) {
    return []
  }

  const pills = [
    context.cultivarContext?.cultivarLabel
      ? `Cultivar: ${context.cultivarContext.cultivarLabel}`
      : null,
    context.cultivarContext?.productionIntent
      ? `Target: ${humanizeRefinedContextValue(context.cultivarContext.productionIntent)}`
      : null,
    context.subSystemContext?.systemType
      ? `Sistema: ${humanizeRefinedContextValue(context.subSystemContext.systemType)}`
      : null,
    context.subSystemContext?.irrigationMode
      ? `Irrigazione: ${humanizeRefinedContextValue(context.subSystemContext.irrigationMode)}`
      : null,
    context.siteOperationalProfile?.exposureClass
      ? `Esposizione: ${humanizeRefinedContextValue(context.siteOperationalProfile.exposureClass)}`
      : null,
    context.siteOperationalProfile?.slopeClass
      ? `Pendenza: ${humanizeRefinedContextValue(context.siteOperationalProfile.slopeClass)}`
      : null,
    context.siteOperationalProfile?.soilType
      ? `Suolo: ${context.siteOperationalProfile.soilType}`
      : null,
  ].filter((value): value is string => Boolean(value))

  return pills
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
  const [ledgerAnalytics, setLedgerAnalytics] = useState<AgronomicDecisionLedgerAnalyticsSummary | null>(null)
  const [ledgerHistory, setLedgerHistory] = useState<AgronomicDecisionLedgerHistoryItem[]>([])
  const [selectedLedgerProfile, setSelectedLedgerProfile] = useState<string>('all')

  useEffect(() => {
    if (!garden?.id || !user?.id) {
      return
    }

    const loadQueue = async () => {
      try {
        setLoading(true)
        setError(null)
        const [briefing, summary, analytics, history] = await Promise.all([
          directorService.getDailyBriefing(user.id, garden.id),
          getAgronomicQueueOutcomeSummary(storageProvider, garden.id),
          getAgronomicDecisionLedgerAnalyticsSummary(storageProvider, garden.id),
          getAgronomicDecisionLedgerHistory(storageProvider, garden.id, { limit: 18 }),
        ])
        setQueue(briefing.transversalQueue || [])
        setOutcomeSummary(summary)
        setLedgerAnalytics(analytics)
        setLedgerHistory(history)
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
  const availableLedgerProfiles = ['vineyard_quality', 'olive_grove_oil', 'orchard_generic'].filter(
    (profileId) => ledgerHistory.some((entry) => entry.agronomicProfileId === profileId)
  )
  const visibleLedgerHistory =
    selectedLedgerProfile === 'all'
      ? ledgerHistory.slice(0, 6)
      : ledgerHistory
          .filter((entry) => entry.agronomicProfileId === selectedLedgerProfile)
          .slice(0, 6)
  const selectedLedgerPopulation =
    selectedLedgerProfile === 'all'
      ? ledgerHistory
      : ledgerHistory.filter((entry) => entry.agronomicProfileId === selectedLedgerProfile)
  const selectedUrgentEntries = selectedLedgerPopulation.filter((entry) => entry.urgencyLabel === 'immediate')
  const selectedUrgentCompleted = selectedUrgentEntries.filter((entry) => entry.status === 'completed')
  const selectedUrgentVerified = selectedUrgentCompleted.filter((entry) => Boolean(entry.executionEvidence))
  const selectedUrgentHighConfidence = selectedUrgentCompleted.filter(
    (entry) => entry.executionEvidence?.confidence === 'high'
  )
  const selectedUrgentMeasured = selectedUrgentCompleted.filter((entry) => Boolean(entry.measurementEvidence))
  const selectedAgronomicMeasured = selectedLedgerPopulation.filter(
    (entry) => entry.agronomicOutcome.status !== 'unknown'
  )
  const selectedAgronomicPositive = selectedLedgerPopulation.filter(
    (entry) => entry.agronomicOutcome.status === 'positive'
  )
  const selectedAgronomicNegative = selectedLedgerPopulation.filter(
    (entry) => entry.agronomicOutcome.status === 'negative'
  )

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
      await recordAgronomicDecisionTaskCreation(storageProvider, garden.id, draft)
      setFeedback((current) => ({ ...current, [draftId]: 'Task creato e snapshot registrato.' }))
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
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 md:grid-cols-6">
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
            <div className="text-xs uppercase tracking-wide text-emerald-700">Decisioni spiegate</div>
            <div className="text-lg font-semibold text-emerald-900">{outcomeSummary.explainedDecisions}</div>
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

      {ledgerAnalytics && ledgerAnalytics.totalEntries > 0 && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-sky-100 bg-sky-50 p-4 md:grid-cols-5">
          <div>
            <div className="text-xs uppercase tracking-wide text-sky-700">Tasso chiusura</div>
            <div className="text-lg font-semibold text-sky-950">{(ledgerAnalytics.completionRate * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-sky-700">Esecuzioni verificate</div>
            <div className="text-lg font-semibold text-sky-950">{(ledgerAnalytics.verifiedExecutionRate * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-sky-700">Esiti misurati</div>
            <div className="text-lg font-semibold text-sky-950">{(ledgerAnalytics.measuredOutcomeRate * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-sky-700">Tempo medio chiusura</div>
            <div className="text-lg font-semibold text-sky-950">
              {ledgerAnalytics.averageCompletionDays !== null ? `${ledgerAnalytics.averageCompletionDays} g` : 'n.d.'}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-sky-700">Profilo piu attivo</div>
            <div className="text-lg font-semibold text-sky-950">
              {ledgerAnalytics.topProfiles[0]?.profileId || 'n.d.'}
            </div>
          </div>
        </div>
      )}

      {ledgerHistory.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Storico Decisionale</h3>
              <p className="text-xs text-gray-600">
                Timeline sintetica di decisione, esecuzione ed esito per i profili piu rilevanti.
              </p>
            </div>
            <div className="text-xs text-gray-500">{visibleLedgerHistory.length} eventi</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLedgerProfile('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                selectedLedgerProfile === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              Tutti
            </button>
            {availableLedgerProfiles.map((profileId) => (
              <button
                key={profileId}
                onClick={() => setSelectedLedgerProfile(profileId)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  selectedLedgerProfile === profileId
                    ? 'bg-sky-700 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {PROFILE_LABELS[profileId] || profileId}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {visibleLedgerHistory.map((entry) => (
              <div key={entry.entryId} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">
                        {PROFILE_LABELS[entry.agronomicProfileId || ''] || entry.agronomicProfileId || 'Profilo non risolto'}
                      </span>
                      <span className="rounded-full bg-sky-100 px-2 py-1 text-[11px] font-medium text-sky-700">
                        {entry.focus}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700">
                        {entry.urgencyLabel}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {entry.scopeLabel || entry.plantName || entry.queueItemId}
                    </div>
                    <div className="text-xs text-gray-600">
                      score {entry.priorityScore} · conf. {(entry.priorityConfidence * 100).toFixed(0)}% · stato {entry.status === 'completed' ? 'completato' : 'creato'}
                    </div>
                    <div className="text-xs text-gray-500">
                      creato {entry.createdAt.split('T')[0]}
                      {entry.completedAt ? ` · chiuso ${entry.completedAt.split('T')[0]}` : ''}
                      {entry.taskType ? ` · task ${entry.taskType}` : ''}
                    </div>
                    {entry.agronomicRationale[0] && (
                      <div className="text-xs text-gray-700">{entry.agronomicRationale[0]}</div>
                    )}
                    {entry.agronomicRationale.length > 1 && (
                      <div className="text-xs text-gray-500">{entry.agronomicRationale[1]}</div>
                    )}
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <div className={entry.executionEvidence ? 'text-emerald-700' : 'text-gray-400'}>
                      {entry.executionEvidence ? 'esecuzione verificata' : 'esecuzione non verificata'}
                    </div>
                    <div className={entry.measurementEvidence ? 'text-emerald-700' : 'text-gray-400'}>
                      {entry.measurementEvidence ? 'esito misurato' : 'esito non misurato'}
                    </div>
                    <div
                      className={
                        entry.agronomicOutcome.status === 'positive'
                          ? 'text-emerald-700'
                          : entry.agronomicOutcome.status === 'negative'
                            ? 'text-red-700'
                            : entry.agronomicOutcome.status === 'mixed'
                              ? 'text-amber-700'
                              : 'text-gray-400'
                      }
                    >
                      {entry.agronomicOutcome.status === 'positive'
                        ? 'outcome agronomico positivo'
                        : entry.agronomicOutcome.status === 'negative'
                          ? 'outcome agronomico negativo'
                          : entry.agronomicOutcome.status === 'mixed'
                            ? 'outcome agronomico intermedio'
                            : 'outcome agronomico non disponibile'}
                    </div>
                    <div
                      className={
                        entry.evidenceStatus === 'outcome_measured'
                          ? 'text-emerald-700'
                          : entry.evidenceStatus === 'execution_verified'
                            ? 'text-sky-700'
                            : entry.evidenceStatus === 'completed_unverified'
                              ? 'text-amber-700'
                              : 'text-gray-400'
                      }
                    >
                      {entry.evidenceStatus === 'outcome_measured'
                        ? 'coerenza evidenziale completa'
                        : entry.evidenceStatus === 'execution_verified'
                          ? 'coerenza operativa verificata'
                          : entry.evidenceStatus === 'completed_unverified'
                            ? 'task chiuso senza evidenze'
                            : 'in attesa di esecuzione'}
                    </div>
                  </div>
                </div>
                {entry.agronomicOutcome.summary && (
                  <div className="mt-2 text-xs text-gray-600">
                    Misura osservata: {entry.agronomicOutcome.summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedLedgerPopulation.length > 0 && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4 md:grid-cols-8">
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-700">Urgenti</div>
            <div className="text-lg font-semibold text-amber-950">{selectedUrgentEntries.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-700">Urgenti chiuse</div>
            <div className="text-lg font-semibold text-amber-950">{selectedUrgentCompleted.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-700">Urgenti verificate</div>
            <div className="text-lg font-semibold text-amber-950">{selectedUrgentVerified.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-700">Urgenti evidenza forte</div>
            <div className="text-lg font-semibold text-amber-950">{selectedUrgentHighConfidence.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-700">Urgenti con esito</div>
            <div className="text-lg font-semibold text-amber-950">{selectedUrgentMeasured.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-700">Outcome agronomici</div>
            <div className="text-lg font-semibold text-amber-950">{selectedAgronomicMeasured.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-700">Outcome positivi</div>
            <div className="text-lg font-semibold text-emerald-800">{selectedAgronomicPositive.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-700">Outcome negativi</div>
            <div className="text-lg font-semibold text-red-800">{selectedAgronomicNegative.length}</div>
          </div>
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
          Nessuna nuova bozza task: la coda e gia coperta da task aperti oppure non segnala interventi operativi prioritari.
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => {
            const refinedContext =
              draft.decisionSnapshot?.refinedContext ||
              draft.decisionSnapshot?.decisionExplanation?.refinedContext ||
              null
            const refinedContextPills = buildRefinedContextPills(refinedContext)
            const contextRationale =
              draft.decisionSnapshot?.decisionExplanation?.contextRationale?.slice(0, 2) || []

            return (
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
                    <p className="text-sm text-gray-600">
                      {stripAgronomicQueueTaskMetadata(draft.task.notes)}
                    </p>
                    {formatAgronomicEconomicSummary(draft.economicSummary) && (
                      <p className="text-xs text-emerald-700 mt-1">
                        ROI stimato: {formatAgronomicEconomicSummary(draft.economicSummary)}
                      </p>
                    )}
                  </div>
                  {(refinedContextPills.length > 0 || contextRationale.length > 0) && (
                    <div className="rounded-lg border border-sky-100 bg-sky-50 p-3 space-y-2">
                      {refinedContextPills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {refinedContextPills.map((pill) => (
                            <span
                              key={pill}
                              className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-sky-700 border border-sky-100"
                            >
                              {pill}
                            </span>
                          ))}
                        </div>
                      )}
                      {contextRationale.length > 0 && (
                        <div className="space-y-1">
                          {contextRationale.map((item) => (
                            <div key={item} className="text-xs text-sky-900">
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Pianificato per {draft.task.date}
                    {draft.missingSignals.length > 0
                      ? ` · dati mancanti: ${draft.missingSignals.slice(0, 3).map(humanizeAgronomicSignal).join(', ')}`
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
          )})}
        </div>
      )}
    </div>
  )
}
