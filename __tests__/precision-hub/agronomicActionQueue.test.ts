import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { buildAgronomicActionQueue } from '../../services/agronomicActionQueueService'
import type { HealthAlert } from '../../services/plantHealthMonitoringService'
import type { PrioritizedAction } from '../../services/directorService'

// Build minimal valid HealthAlert fixture
function makeHealthAlert(severity: 'critical' | 'high' | 'medium' | 'low', id: string): HealthAlert {
  return {
    id,
    type: 'stress_symptoms',
    severity,
    plantName: `Pianta ${id}`,
    description: 'Test alert',
    detectedAt: new Date().toISOString(),
    confidence: 0.9,
    triggers: [],
  } as unknown as HealthAlert
}

// Build minimal valid PrioritizedAction fixture
function makePrioritizedAction(score: number, id: string): PrioritizedAction {
  return {
    id,
    type: score >= 75 ? 'CRITICAL' : 'HIGH',
    category: 'IRRIGATION',
    title: `Action ${id}`,
    description: 'Test action',
    priority: 'HIGH',
    priorityScore: score,
    confidence: 0.8,
    dataSources: [],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  } as unknown as PrioritizedAction
}

test('empty input returns empty queue', () => {
  const result = buildAgronomicActionQueue({})
  assert.strictEqual(result.length, 0)
})

test('health alerts are included in queue', () => {
  const result = buildAgronomicActionQueue({
    healthAlerts: [makeHealthAlert('high', 'h1')],
  })
  assert.ok(result.length > 0, 'should have at least one item from health alert')
})

test('critical health alert has higher score than low severity alert', () => {
  const criticalResult = buildAgronomicActionQueue({
    healthAlerts: [makeHealthAlert('critical', 'h1')],
  })
  const lowResult = buildAgronomicActionQueue({
    healthAlerts: [makeHealthAlert('low', 'h2')],
  })
  assert.ok(criticalResult.length > 0)
  assert.ok(lowResult.length > 0)
  assert.ok(
    criticalResult[0].priorityScore > lowResult[0].priorityScore,
    `critical (${criticalResult[0].priorityScore}) should score higher than low (${lowResult[0].priorityScore})`
  )
})

test('director actions are included in queue', () => {
  const result = buildAgronomicActionQueue({
    directorActions: [makePrioritizedAction(80, 'a1')],
  })
  assert.ok(result.length > 0)
})

test('queue is sorted by priorityScore descending', () => {
  const result = buildAgronomicActionQueue({
    healthAlerts: [
      makeHealthAlert('high', 'h1'),     // score 78
      makeHealthAlert('critical', 'h2'), // score 96
    ],
  })
  assert.ok(result.length >= 2)
  for (let i = 0; i < result.length - 1; i++) {
    assert.ok(
      result[i].priorityScore >= result[i + 1].priorityScore,
      `item ${i} (score ${result[i].priorityScore}) should be >= item ${i + 1} (score ${result[i + 1].priorityScore})`
    )
  }
})

test('mixed sources: both health alerts and director actions appear', () => {
  const result = buildAgronomicActionQueue({
    healthAlerts: [makeHealthAlert('high', 'h1')],
    directorActions: [makePrioritizedAction(80, 'a1')],
  })
  assert.ok(result.length >= 2, `should have items from both sources, got ${result.length}`)
})
