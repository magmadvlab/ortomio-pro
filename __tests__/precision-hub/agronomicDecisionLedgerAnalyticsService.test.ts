import test from 'node:test'
import assert from 'node:assert/strict'

import { getAgronomicDecisionLedgerAnalyticsSummary } from '@/services/agronomicDecisionLedgerAnalyticsService'
import {
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
  score: 76,
  confidence: 0.8,
  urgencyLabel: 'immediate',
  isCriticalStage: true,
  profileResolution: {
    profileId: 'vineyard_quality',
    profileLabel: 'Vigneto qualita',
    resolutionSource: 'fallback',
    matchedBy: 'vineyard_quality',
    warnings: [],
  },
  signals: {
    availableSignals: ['weather_current'],
    requiredP0Signals: ['weather_current'],
    coveredP0Signals: ['weather_current'],
    missingP0Signals: [],
    coverageRatio: 1,
  },
  measuredFeedbackSummary: null,
  economicSummary: null,
  environmentalSummary: null,
  agronomicRationale: ['Test rationale'],
  economicRationale: [],
  contextRationale: ['Orientamento sito: South.', 'Protezione vento: Low.'],
  warnings: [],
}

const draft: AgronomicQueueTaskDraft = {
  id: 'draft:1',
  sourceQueueId: 'irrigation:zone-1',
  source: 'irrigation',
  title: 'Irrigazione Vigneto',
  priorityScore: 76,
  priorityConfidence: 0.8,
  urgencyLabel: 'immediate',
  missingSignals: [],
  economicSummary: null,
  decisionSnapshot: {
    id: 'aq_snapshot:1',
    capturedAt: '2026-04-18T08:00:00.000Z',
    queueItemId: 'irrigation:zone-1',
    source: 'irrigation',
    focus: 'water',
    title: 'Irrigazione Vigneto',
    scopeLabel: 'Vigneto nord',
    agronomicProfileId: 'vineyard_quality',
    priorityScore: 76,
    priorityConfidence: 0.8,
    urgencyLabel: 'immediate',
    missingSignals: [],
    decisionExplanation,
    economicSummary: null,
  },
  task: {
    gardenId: 'garden-1',
    plantName: 'Vigneto nord',
    taskType: 'Irrigation',
    date: '2026-04-18',
    nextDueDate: '2026-04-18',
    completed: false,
    isSuggested: true,
    aiGenerated: true,
    suggestedBy: 'agronomic_queue:irrigation:zone-1',
    suggestedDate: '2026-04-18T08:00:00.000Z',
    schedulingType: 'Immediate',
    durationMinutes: 25,
    notes: 'Test',
  },
}

test('decision ledger analytics summarize completion and evidence rates', async () => {
  const storage = createPreferenceStorage()

  await recordAgronomicDecisionTaskCreation(storage, 'garden-1', draft)
  await markAgronomicDecisionCompleted(storage, 'garden-1', {
    queueItemId: draft.sourceQueueId,
    completedAt: '2026-04-20T08:00:00.000Z',
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

  await storage.setUserPreference('agronomic_queue_outcomes:garden-1', [
    {
      id: 'aq_outcome:task-1',
      gardenId: 'garden-1',
      taskId: 'task-1',
      queueItemId: draft.sourceQueueId,
      completedAt: '2026-04-20T08:00:00.000Z',
      taskType: 'Irrigation',
      plantName: 'Vigneto nord',
      success: true,
      metadata: {
        queueItemId: draft.sourceQueueId,
        source: 'irrigation',
        focus: 'water',
        priorityScore: 76,
        priorityConfidence: 0.8,
        urgencyLabel: 'immediate',
        agronomicProfileId: 'vineyard_quality',
        missingSignals: [],
      },
      executionEvidence: {
        kind: 'watering',
        logId: 'water-log-1',
        executionDate: '2026-04-20',
        confidence: 'high',
        rationale: 'Test',
      },
      measurementEvidence: {
        kind: 'harvest',
        recordId: 'harvest-1',
        recordedAt: '2026-04-25',
        rationale: 'Test',
      },
    },
  ])

  await storage.setUserPreference('agronomic_measured_feedback:garden-1', [
    {
      id: 'agro_feedback:watering:task-1:2026-04-20',
      gardenId: 'garden-1',
      sourceTaskId: 'task-1',
      operation: 'watering',
      focus: 'water',
      recordedAt: '2026-04-20T09:00:00.000Z',
      plantName: 'Vigneto nord',
      zoneId: 'zone-1',
      summary: 'Irrigazione eseguita con risposta idrica positiva sul suolo.',
      metrics: {
        averageSoilMoistureDelta: 5.2,
      },
    },
  ])

  const summary = await getAgronomicDecisionLedgerAnalyticsSummary(storage, 'garden-1')

  assert.equal(summary.totalEntries, 1)
  assert.equal(summary.completedEntries, 1)
  assert.equal(summary.urgentEntries, 1)
  assert.equal(summary.urgentCompleted, 1)
  assert.equal(summary.urgentVerifiedExecutions, 1)
  assert.equal(summary.urgentHighConfidenceExecutions, 1)
  assert.equal(summary.urgentMeasuredOutcomes, 1)
  assert.equal(summary.agronomicMeasuredOutcomes, 1)
  assert.equal(summary.agronomicPositiveOutcomes, 1)
  assert.equal(summary.agronomicNegativeOutcomes, 0)
  assert.equal(summary.urgentAgronomicPositiveOutcomes, 1)
  assert.equal(summary.urgentAgronomicNegativeOutcomes, 0)
  assert.equal(summary.completionRate, 1)
  assert.equal(summary.contextExplainedRate, 1)
  assert.equal(summary.verifiedExecutionRate, 1)
  assert.equal(summary.highConfidenceExecutionRate, 1)
  assert.equal(summary.measuredOutcomeRate, 1)
  assert.equal(summary.averageCompletionDays, 2)
  assert.equal(summary.topProfiles[0]?.profileId, 'vineyard_quality')
})
