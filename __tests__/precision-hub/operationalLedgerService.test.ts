import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getOperationalLedgerSummary,
  getOperationalLedgerUnifiedEvents,
} from '@/services/operationalLedgerService'
import type {
  AgronomicOperationOutcomeProjection,
  AgronomicOperationSignalProjection,
  AgronomicPrecisionExecutionProjection,
} from '@/types/operationalLedger'

test('operational ledger summary combines outcome, signal and precision projections', async () => {
  const outcomes: AgronomicOperationOutcomeProjection[] = [
    {
      projectionId: 'queue_outcome:1',
      projectionSource: 'agronomic_queue_outcome',
      userId: 'user-1',
      gardenId: 'garden-1',
      taskId: 'task-1',
      operationCategory: 'irrigation',
      operationKind: 'watering',
      operationTimestamp: '2026-04-20T08:30:00.000Z',
      executionVerified: true,
      measuredOutcomeRecorded: true,
      hasMeasuredResult: true,
      resultClass: 'beneficial',
      executionEvidenceLogId: 'water-log-1',
    },
  ]

  const signals: AgronomicOperationSignalProjection[] = [
    {
      projectionId: 'individual_plant_operation:1',
      sourceTable: 'individual_plant_operations',
      sourceRecordId: 'plant-op-1',
      userId: 'user-1',
      gardenId: 'garden-1',
      signalRole: 'plant_operation',
      operationKind: 'treatment',
      operationCategory: 'protection',
      signalDate: '2026-04-21',
      signalAt: '2026-04-21T09:00:00.000Z',
      plantId: 'plant-1',
      resultClass: 'direct_operation',
    },
  ]

  const precisionExecutions: AgronomicPrecisionExecutionProjection[] = [
    {
      projectionId: 'variable_rate_application:1',
      executionRecordId: 'vrt-1',
      prescriptionMapId: 'map-1',
      gardenId: 'garden-1',
      userId: 'user-1',
      applicationDate: '2026-04-22T10:00:00.000Z',
      productName: 'Nutrizione VRT',
      plannedRate: 20,
      actualRate: 19,
      unit: 'kg/ha',
      executionStatus: 'completed',
      sourceOperationType: 'fertilization',
      varianceClass: 'aligned',
    },
  ]

  const storage = {
    async getAgronomicOperationOutcomeProjection() {
      return outcomes
    },
    async getAgronomicOperationSignalProjection() {
      return signals
    },
    async getAgronomicPrecisionExecutionProjection() {
      return precisionExecutions
    },
  }

  const summary = await getOperationalLedgerSummary(storage, 'garden-1')

  assert.equal(summary.totalEvents, 3)
  assert.equal(summary.outcomeEvents, 1)
  assert.equal(summary.signalEvents, 1)
  assert.equal(summary.precisionExecutionEvents, 1)
  assert.equal(summary.measuredResultEvents, 1)
  assert.equal(summary.verifiedExecutionEvents, 3)
  assert.equal(summary.byCategory.irrigation, 1)
  assert.equal(summary.byCategory.protection, 1)
  assert.equal(summary.byCategory.precision_execution, 1)
  assert.equal(summary.byResultClass.beneficial, 1)
  assert.equal(summary.byResultClass.direct_operation, 1)
  assert.equal(summary.byResultClass.aligned, 1)
  assert.equal(summary.latestEvent?.id, 'variable_rate_application:1')
})

test('operational ledger service returns an empty event list when projection readers are unavailable', async () => {
  const events = await getOperationalLedgerUnifiedEvents({}, 'garden-1')
  const summary = await getOperationalLedgerSummary(null, 'garden-1')

  assert.deepEqual(events, [])
  assert.equal(summary.totalEvents, 0)
  assert.equal(summary.latestEvent, undefined)
})
