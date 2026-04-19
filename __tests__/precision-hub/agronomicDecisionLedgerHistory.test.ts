import test from 'node:test'
import assert from 'node:assert/strict'

import { getAgronomicDecisionLedgerHistory } from '@/services/agronomicDecisionLedgerAnalyticsService'

test('decision ledger history filters vineyard entries and exposes execution outcome state', async () => {
  const store = new Map<string, unknown>()
  const storage = {
    async getUserPreference<T>(key: string): Promise<T | null> {
      return (store.get(key) as T | undefined) || null
    },
  }

  store.set('agronomic_decision_ledger:garden-1', [
    {
      id: 'aq_ledger:1',
      gardenId: 'garden-1',
      queueItemId: 'irrigation:zone-vine',
      source: 'irrigation',
      focus: 'water',
      agronomicProfileId: 'vineyard_quality',
      scopeLabel: 'Filare nord',
      plantName: 'Sangiovese',
      status: 'completed',
      createdAt: '2026-04-18T08:00:00.000Z',
      updatedAt: '2026-04-19T08:00:00.000Z',
      taskCreatedAt: '2026-04-18T08:00:00.000Z',
      completedAt: '2026-04-19T08:00:00.000Z',
      decisionSnapshot: {
        id: 'aq_snapshot:1',
        capturedAt: '2026-04-18T08:00:00.000Z',
        queueItemId: 'irrigation:zone-vine',
        source: 'irrigation',
        focus: 'water',
        title: 'Irrigazione Filare nord',
        scopeLabel: 'Filare nord',
        agronomicProfileId: 'vineyard_quality',
        priorityScore: 77,
        priorityConfidence: 0.81,
        urgencyLabel: 'immediate',
        missingSignals: [],
        decisionExplanation: {
          source: 'irrigation',
          focus: 'water',
          score: 77,
          confidence: 0.81,
          urgencyLabel: 'immediate',
          isCriticalStage: true,
          profileResolution: null,
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
          agronomicRationale: ['Deficit idrico persistente su vigneto.'],
          economicRationale: [],
          warnings: [],
        },
        economicSummary: null,
      },
    },
    {
      id: 'aq_ledger:2',
      gardenId: 'garden-1',
      queueItemId: 'irrigation:zone-olive',
      source: 'irrigation',
      focus: 'water',
      agronomicProfileId: 'olive_grove_oil',
      scopeLabel: 'Parcella olivo',
      plantName: 'Olivo',
      status: 'task_created',
      createdAt: '2026-04-18T09:00:00.000Z',
      updatedAt: '2026-04-18T09:00:00.000Z',
      decisionSnapshot: {
        id: 'aq_snapshot:2',
        capturedAt: '2026-04-18T09:00:00.000Z',
        queueItemId: 'irrigation:zone-olive',
        source: 'irrigation',
        focus: 'water',
        title: 'Irrigazione Parcella olivo',
        agronomicProfileId: 'olive_grove_oil',
        priorityScore: 62,
        priorityConfidence: 0.7,
        urgencyLabel: 'next_cycle',
        missingSignals: [],
        decisionExplanation: null,
        economicSummary: null,
      },
    },
  ])

  store.set('agronomic_queue_outcomes:garden-1', [
    {
      id: 'aq_outcome:task-1',
      gardenId: 'garden-1',
      taskId: 'task-1',
      queueItemId: 'irrigation:zone-vine',
      completedAt: '2026-04-19T08:00:00.000Z',
      taskType: 'Irrigation',
      plantName: 'Sangiovese',
      success: true,
      executionEvidence: {
        kind: 'watering',
        logId: 'water-log-1',
        executionDate: '2026-04-19',
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

  store.set('agronomic_measured_feedback:garden-1', [
    {
      id: 'agro_feedback:watering:task-1:2026-04-19',
      gardenId: 'garden-1',
      sourceTaskId: 'task-1',
      operation: 'watering',
      focus: 'water',
      recordedAt: '2026-04-19T10:00:00.000Z',
      plantName: 'Sangiovese',
      summary: 'Risposta idrica positiva dopo irrigazione.',
      metrics: {
        averageSoilMoistureDelta: 4.8,
      },
    },
  ])

  const history = await getAgronomicDecisionLedgerHistory(storage, 'garden-1', {
    profileIds: ['vineyard_quality'],
    limit: 5,
  })

  assert.equal(history.length, 1)
  assert.equal(history[0]?.agronomicProfileId, 'vineyard_quality')
  assert.equal(history[0]?.executionEvidence?.kind, 'watering')
  assert.equal(history[0]?.measurementEvidence?.kind, 'harvest')
  assert.equal(history[0]?.evidenceStatus, 'outcome_measured')
  assert.equal(history[0]?.agronomicOutcome.status, 'positive')
  assert.match(history[0]?.agronomicRationale[0] || '', /Deficit idrico persistente/i)
})
