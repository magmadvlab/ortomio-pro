import test from 'node:test'
import assert from 'node:assert/strict'

import { finalizeTaskExecutionPostAction } from '@/services/taskExecutionPostActionService'

test('finalizeTaskExecutionPostAction records feedback before syncing queue outcome evidence', async () => {
  const store = new Map<string, unknown>()
  const callOrder: string[] = []

  const storage = {
    async getTask() {
      return null
    },
    async updateTask() {
      throw new Error('updateTask should not be called')
    },
    async getUserPreference<T>(key: string): Promise<T | null> {
      callOrder.push(`get:${key}`)
      return (store.get(key) as T | undefined) || null
    },
    async setUserPreference<T>(key: string, value: T): Promise<void> {
      callOrder.push(`set:${key}`)
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
          notes: 'Test AQ_META::{"queueItemId":"irrigation:zone-1","source":"irrigation","focus":"water","priorityScore":80,"priorityConfidence":0.85,"urgencyLabel":"immediate","missingSignals":[]}',
        },
      ] as any
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

  await storage.setUserPreference('agronomic_queue_outcomes:garden-1', [
    {
      id: 'aq_outcome:task-1',
      gardenId: 'garden-1',
      taskId: 'task-1',
      queueItemId: 'irrigation:zone-1',
      completedAt: '2026-04-20T08:00:00.000Z',
      taskType: 'Irrigation',
      plantName: 'Sangiovese',
      success: true,
      metadata: {
        queueItemId: 'irrigation:zone-1',
        source: 'irrigation',
        focus: 'water',
        priorityScore: 80,
        priorityConfidence: 0.85,
        urgencyLabel: 'immediate',
        missingSignals: [],
      },
    },
  ])

  await finalizeTaskExecutionPostAction({
    storageProvider: storage as any,
    gardenId: 'garden-1',
    sourceTaskId: 'task-1',
    operatorEvidence: {
      operation: 'watering',
      recordedAt: '2026-04-20',
      summary: 'Irrigazione registrata a fonte.',
      notes: 'Turno completato. • esito attention • follow-up richiesto',
      followUpRequired: true,
      metrics: {
        totalLiters: 21.2,
        quickOutcome: 'attention',
      },
    },
    measuredFeedback: {
      id: 'feedback-1',
      gardenId: 'garden-1',
      sourceTaskId: 'task-1',
      operation: 'watering',
      focus: 'water',
      recordedAt: '2026-04-20T09:00:00.000Z',
      plantName: 'Sangiovese',
      summary: 'Risposta idrica positiva.',
      metrics: {
        averageSoilMoistureDelta: 5.3,
      },
    },
  })

  const outcomes = (await storage.getUserPreference<any[]>('agronomic_queue_outcomes:garden-1')) || []

  assert.equal(outcomes[0]?.evidenceSnapshot?.agronomicOutcome.status, 'positive')
  assert.equal(outcomes[0]?.evidenceSnapshot?.agronomicOutcome.matchedBy, 'task')
  assert.equal(outcomes[0]?.operatorEvidence?.operation, 'watering')
  assert.equal(outcomes[0]?.operatorEvidence?.followUpRequired, true)
  assert.equal(outcomes[0]?.operatorEvidence?.metrics.quickOutcome, 'attention')
  assert.equal(outcomes[0]?.evidenceSnapshot?.operatorEvidenceCaptured, true)
  assert.ok(
    callOrder.indexOf('set:agronomic_measured_feedback:garden-1') <
      callOrder.lastIndexOf('set:agronomic_queue_outcomes:garden-1')
  )
})
