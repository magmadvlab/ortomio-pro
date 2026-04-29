import test from 'node:test'
import assert from 'node:assert/strict'

import {
  attachAgronomicQueueOperatorEvidence,
  getAgronomicQueueOutcomeRecords,
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
  assert.equal(records[0]?.evidenceSnapshot?.operatorEvidenceCaptured, false)
  assert.equal(records[0]?.evidenceSnapshot?.agronomicOutcome.status, 'positive')
  assert.equal(records[0]?.evidenceSnapshot?.agronomicOutcome.matchedBy, 'task')
})

test('attachAgronomicQueueOperatorEvidence stores source-side execution payload on matching outcome record', async () => {
  const store = new Map<string, unknown>()
  const storage = {
    async getUserPreference<T>(key: string): Promise<T | null> {
      return (store.get(key) as T | undefined) || null
    },
    async setUserPreference<T>(key: string, value: T): Promise<void> {
      store.set(key, value)
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
    },
  ])

  const updated = await attachAgronomicQueueOperatorEvidence(storage as any, {
    gardenId: 'garden-1',
    sourceTaskId: 'task-1',
    operatorEvidence: {
      operation: 'watering',
      recordedAt: '2026-04-20',
      summary: 'Irrigazione registrata a fonte.',
      notes: 'Turno concluso.',
      metrics: {
        totalLiters: 20,
      },
    },
  })

  assert.equal(updated?.operatorEvidence?.operation, 'watering')
  assert.equal(updated?.operatorEvidence?.metrics.totalLiters, 20)
  assert.equal(updated?.operatorEvidence?.followUpRequired, undefined)
})

test('queue outcomes prefer DB-backed records and migrate preference fallback when DB is empty', async () => {
  const preferenceStore = new Map<string, unknown>()
  const dbRecords: any[] = []
  const storage = {
    async getUserPreference<T>(key: string): Promise<T | null> {
      return (preferenceStore.get(key) as T | undefined) || null
    },
    async setUserPreference<T>(key: string, value: T): Promise<void> {
      preferenceStore.set(key, value)
    },
    async getAgronomicQueueOutcomeRecords() {
      return dbRecords
    },
    async upsertAgronomicQueueOutcomeRecord(record: any) {
      const index = dbRecords.findIndex((existing) => existing.id === record.id)
      if (index >= 0) {
        dbRecords[index] = record
      } else {
        dbRecords.push(record)
      }
      return record
    },
  }

  await storage.setUserPreference('agronomic_queue_outcomes:garden-1', [
    {
      id: 'aq_outcome:preference',
      gardenId: 'garden-1',
      taskId: 'task-preference',
      queueItemId: 'queue-preference',
      completedAt: '2026-04-18T08:00:00.000Z',
      taskType: 'Irrigation',
      plantName: 'Sangiovese',
      success: true,
    },
  ])

  const migrated = await getAgronomicQueueOutcomeRecords(storage, 'garden-1')

  assert.equal(migrated.length, 1)
  assert.equal(migrated[0]?.id, 'aq_outcome:preference')
  assert.equal(dbRecords.length, 1)

  dbRecords.push({
    id: 'aq_outcome:db',
    gardenId: 'garden-1',
    taskId: 'task-db',
    queueItemId: 'queue-db',
    completedAt: '2026-04-19T08:00:00.000Z',
    taskType: 'Treatment',
    plantName: 'Sangiovese',
    success: true,
  })

  const dbBacked = await getAgronomicQueueOutcomeRecords(storage, 'garden-1')

  assert.equal(dbBacked.length, 2)
  assert.equal(dbBacked[0]?.id, 'aq_outcome:db')
})

test('recordAgronomicQueueTaskOutcome writes directly to DB-backed outcome storage', async () => {
  const dbRecords: any[] = []
  const decisionEntries: any[] = []
  const storage = {
    async getUserPreference() {
      return []
    },
    async setUserPreference() {
      throw new Error('preference storage should not be used for DB-backed outcome writes')
    },
    async getAgronomicQueueOutcomeRecords() {
      return dbRecords
    },
    async upsertAgronomicQueueOutcomeRecord(record: any) {
      dbRecords.push(record)
      return record
    },
    async getAgronomicDecisionLedgerEntries() {
      return decisionEntries
    },
    async upsertAgronomicDecisionLedgerEntry(entry: any) {
      decisionEntries.push(entry)
      return entry
    },
  }

  await recordAgronomicQueueTaskOutcome(storage as any, {
    id: 'task-db',
    gardenId: 'garden-1',
    plantName: 'Sangiovese',
    taskType: 'Irrigation',
    date: '2026-04-20',
    completed: true,
    completedAt: '2026-04-20T08:00:00.000Z',
    suggestedBy: 'agronomic_queue:irrigation:zone-1',
    notes: 'AQ_META::{"queueItemId":"irrigation:zone-1","source":"irrigation","focus":"water","priorityScore":80,"priorityConfidence":0.85,"urgencyLabel":"immediate","missingSignals":[]}',
  })

  assert.equal(dbRecords.length, 1)
  assert.equal(dbRecords[0]?.taskId, 'task-db')
})
