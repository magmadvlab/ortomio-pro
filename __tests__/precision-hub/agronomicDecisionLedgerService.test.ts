import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getAgronomicDecisionLedgerEntries,
  getAgronomicDecisionLedgerSummary,
  markAgronomicDecisionCompleted,
  recordAgronomicDecisionTaskCreation,
} from '@/services/agronomicDecisionLedgerService'
import type { AgronomicDecisionExplanation } from '@/services/agronomicDecisionExplanationService'
import type { AgronomicQueueTaskDraft } from '@/services/agronomicQueueTaskService'

const createPreferenceStorage = () => {
  const store = new Map<string, unknown>()

  return {
    async getUserPreference<T>(key: string): Promise<T | null> {
      return (store.get(key) as T | undefined) || null
    },
    async setUserPreference<T>(key: string, value: T): Promise<void> {
      store.set(key, value)
    },
  }
}

const decisionExplanation: AgronomicDecisionExplanation = {
  source: 'irrigation',
  focus: 'water',
  score: 81,
  confidence: 0.84,
  urgencyLabel: 'immediate',
  isCriticalStage: true,
  profileResolution: {
    profileId: 'vineyard_quality',
    profileLabel: 'Vigneto qualita',
    resolutionSource: 'fallback',
    matchedBy: 'vineyard_quality',
    warnings: ['Priority profile resolved from fallback profile id.'],
  },
  signals: {
    availableSignals: ['weather_current', 'weather_forecast'],
    requiredP0Signals: ['weather_current'],
    coveredP0Signals: ['weather_current'],
    missingP0Signals: [],
    coverageRatio: 1,
  },
  measuredFeedbackSummary: null,
  economicSummary: null,
  environmentalSummary: null,
  agronomicRationale: ['Finestra decisionale marcata come critica.'],
  economicRationale: [],
  warnings: [],
}

const draft: AgronomicQueueTaskDraft = {
  id: 'draft:irrigation:zone-1',
  sourceQueueId: 'irrigation:zone-1',
  source: 'irrigation',
  title: 'Irrigazione Filare Vigneto',
  priorityScore: 81,
  priorityConfidence: 0.84,
  urgencyLabel: 'immediate',
  missingSignals: [],
  economicSummary: null,
  decisionSnapshot: {
    id: 'aq_snapshot:irrigation:zone-1',
    capturedAt: '2026-04-18T10:00:00.000Z',
    queueItemId: 'irrigation:zone-1',
    source: 'irrigation',
    focus: 'water',
    title: 'Irrigazione Filare Vigneto',
    scopeLabel: 'Filare Vigneto',
    agronomicProfileId: 'vineyard_quality',
    priorityScore: 81,
    priorityConfidence: 0.84,
    urgencyLabel: 'immediate',
    missingSignals: [],
    decisionExplanation,
    economicSummary: null,
  },
  task: {
    gardenId: 'garden-1',
    plantName: 'Filare Vigneto',
    taskType: 'Irrigation',
    date: '2026-04-18',
    nextDueDate: '2026-04-18',
    completed: false,
    isSuggested: true,
    aiGenerated: true,
    suggestedBy: 'agronomic_queue:irrigation:zone-1',
    suggestedDate: '2026-04-18T10:00:00.000Z',
    schedulingType: 'Immediate',
    durationMinutes: 25,
    notes: 'Test task',
  },
}

test('decision ledger records task creation and completion for vineyard irrigation flow', async () => {
  const storage = createPreferenceStorage()

  const created = await recordAgronomicDecisionTaskCreation(storage, 'garden-1', draft)
  assert.ok(created)
  assert.equal(created?.status, 'task_created')
  assert.equal(created?.agronomicProfileId, 'vineyard_quality')

  const beforeCompletion = await getAgronomicDecisionLedgerEntries(storage, 'garden-1', {
    agronomicProfileId: 'vineyard_quality',
  })
  assert.equal(beforeCompletion.length, 1)
  assert.equal(beforeCompletion[0]?.decisionSnapshot.decisionExplanation?.urgencyLabel, 'immediate')

  await markAgronomicDecisionCompleted(storage, 'garden-1', {
    queueItemId: draft.sourceQueueId,
    completedAt: '2026-04-19T08:00:00.000Z',
    taskId: 'task-1',
    taskSuggestedBy: draft.task.suggestedBy,
    taskType: draft.task.taskType,
    plantName: draft.task.plantName,
    plannedDate: draft.task.date,
    metadata: {
      queueItemId: draft.sourceQueueId,
      source: draft.source,
      focus: 'water',
      priorityScore: draft.priorityScore,
      priorityConfidence: draft.priorityConfidence,
      urgencyLabel: draft.urgencyLabel,
      agronomicProfileId: 'vineyard_quality',
      missingSignals: [],
      decisionExplanation,
      decisionSnapshot: draft.decisionSnapshot,
      economicSummary: null,
    },
  })

  const summary = await getAgronomicDecisionLedgerSummary(storage, 'garden-1')
  assert.equal(summary.totalEntries, 1)
  assert.equal(summary.completed, 1)
  assert.equal(summary.withExplanation, 1)
  assert.equal(summary.bySource.irrigation, 1)
  assert.equal(summary.byFocus.water, 1)
})

test('decision ledger prefers DB-backed records and migrates preference fallback when DB is empty', async () => {
  const preferenceStore = new Map<string, unknown>()
  const dbEntries: any[] = []
  const storage = {
    async getUserPreference<T>(key: string): Promise<T | null> {
      return (preferenceStore.get(key) as T | undefined) || null
    },
    async setUserPreference<T>(key: string, value: T): Promise<void> {
      preferenceStore.set(key, value)
    },
    async getAgronomicDecisionLedgerEntries() {
      return dbEntries
    },
    async upsertAgronomicDecisionLedgerEntry(entry: any) {
      const index = dbEntries.findIndex((existing) => existing.id === entry.id)
      if (index >= 0) {
        dbEntries[index] = entry
      } else {
        dbEntries.push(entry)
      }
      return entry
    },
  }

  await storage.setUserPreference('agronomic_decision_ledger:garden-1', [
    {
      id: 'ledger-preference',
      gardenId: 'garden-1',
      queueItemId: 'queue-preference',
      source: 'irrigation',
      focus: 'water',
      status: 'task_created',
      agronomicProfileId: 'vineyard_quality',
      createdAt: '2026-04-18T08:00:00.000Z',
      updatedAt: '2026-04-18T08:00:00.000Z',
      decisionSnapshot: {
        source: 'irrigation',
        focus: 'water',
        capturedAt: '2026-04-18T08:00:00.000Z',
      },
    },
  ])

  const migrated = await getAgronomicDecisionLedgerEntries(storage, 'garden-1')

  assert.equal(migrated.length, 1)
  assert.equal(migrated[0]?.id, 'ledger-preference')
  assert.equal(dbEntries.length, 1)

  dbEntries.push({
    id: 'ledger-db',
    gardenId: 'garden-1',
    queueItemId: 'queue-db',
    source: 'health',
    focus: 'health',
    status: 'completed',
    agronomicProfileId: 'vineyard_quality',
    createdAt: '2026-04-19T08:00:00.000Z',
    updatedAt: '2026-04-19T08:00:00.000Z',
    decisionSnapshot: {
      source: 'health',
      focus: 'health',
      capturedAt: '2026-04-19T08:00:00.000Z',
    },
  })

  const dbBacked = await getAgronomicDecisionLedgerEntries(storage, 'garden-1', {
    focus: 'health',
  })

  assert.equal(dbBacked.length, 1)
  assert.equal(dbBacked[0]?.id, 'ledger-db')
})
