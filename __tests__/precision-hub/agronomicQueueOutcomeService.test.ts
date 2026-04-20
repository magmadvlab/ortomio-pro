import test from 'node:test'
import assert from 'node:assert/strict'

import {
  recordAgronomicQueueTaskOutcome,
  syncAgronomicQueueOutcomeEvidence,
} from '@/services/agronomicQueueOutcomeService'

test('syncAgronomicQueueOutcomeEvidence stores normalized evidence snapshot with measured outcome', async () => {
  const store = new Map<string, unknown>()
  const storage = {
    async getUserPreference<T>(key: string): Promise<T | null> {
      return (store.get(key) as T | undefined) || null
    },
    async setUserPreference<T>(key: string, value: T): Promise<void> {
      store.set(key, value)
    },
    async getTasks() {
      return [
        {
          id: 'task-1',
          gardenId: 'garden-1',
          plantName: 'Sangiovese',
          taskType: 'Irrigation',
          date: '2026-04-20',
          completed: true,
          completedAt: '2026-04-20T08:00:00.000Z',
          suggestedBy: 'agronomic_queue:irrigation:zone-1',
          notes: 'Irrigazione prioritaria AQ_META::{"queueItemId":"irrigation:zone-1","source":"irrigation","focus":"water","priorityScore":80,"priorityConfidence":0.85,"urgencyLabel":"immediate","missingSignals":[]}',
        },
      ]
    },
    async getWateringLogs() {
      return [
        {
          id: 'watering-1',
          date: '2026-04-20',
          notes: 'SOURCE_TASK::task-1',
        },
      ]
    },
    async getFertilizerApplicationLogs() {
      return []
    },
    async getTreatments() {
      return []
    },
    async getMechanicalWorks() {
      return []
    },
    async getHarvestLogs() {
      return []
    },
  }

  await recordAgronomicQueueTaskOutcome(storage, {
    id: 'task-1',
    gardenId: 'garden-1',
    plantName: 'Sangiovese',
    taskType: 'Irrigation',
    date: '2026-04-20',
    completed: true,
    completedAt: '2026-04-20T08:00:00.000Z',
    suggestedBy: 'agronomic_queue:irrigation:zone-1',
    notes: 'Irrigazione prioritaria AQ_META::{"queueItemId":"irrigation:zone-1","source":"irrigation","focus":"water","priorityScore":80,"priorityConfidence":0.85,"urgencyLabel":"immediate","missingSignals":[]}',
  } as any)

  await storage.setUserPreference('agronomic_measured_feedback:garden-1', [
    {
      id: 'feedback-1',
      gardenId: 'garden-1',
      sourceTaskId: 'task-1',
      operation: 'watering',
      focus: 'water',
      recordedAt: '2026-04-20T09:00:00.000Z',
      plantName: 'Sangiovese',
      summary: 'Risposta idrica positiva.',
      metrics: {
        averageSoilMoistureDelta: 5.1,
      },
    },
  ])

  const records = await syncAgronomicQueueOutcomeEvidence(storage as any, 'garden-1')

  assert.equal(records.length, 1)
  assert.equal(records[0]?.evidenceSnapshot?.status, 'execution_verified')
  assert.equal(records[0]?.evidenceSnapshot?.executionVerified, true)
  assert.equal(records[0]?.evidenceSnapshot?.highConfidenceExecution, true)
  assert.equal(records[0]?.evidenceSnapshot?.agronomicOutcome.status, 'positive')
  assert.equal(records[0]?.evidenceSnapshot?.agronomicOutcome.matchedBy, 'task')
})
