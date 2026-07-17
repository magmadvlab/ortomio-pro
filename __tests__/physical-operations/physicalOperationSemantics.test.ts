import test from 'node:test'
import assert from 'node:assert/strict'
import { validateTelemetryEnvelope } from '@/app/api/iot/devices/telemetry/route'
import { decideCommandRetry } from '@/services/iotCommandLifecycleService'
import { buildIrrigationVolumeEvidence, projectNutritionStock } from '@/services/physicalOperationSemantics'
import { adjustIrrigationNeedForRain } from '@/logic/rainManager'
import { validateProductConcentration } from '@/services/advancedNutritionService'

const now = new Date('2026-07-17T10:00:00.000Z')

test('telemetry rejects invalid units, ranges, and stale timestamps', () => {
  assert.deepEqual(validateTelemetryEnvelope({ source: 'thingsboard', recordedAt: now.toISOString(), moisture: 101, units: { moisture: '%' } }, now), { valid: false, error: 'out_of_range_moisture' })
  assert.deepEqual(validateTelemetryEnvelope({ source: 'thingsboard', recordedAt: now.toISOString(), moisture: 50, units: { moisture: 'ratio' } }, now), { valid: false, error: 'invalid_unit_moisture' })
  assert.deepEqual(validateTelemetryEnvelope({ source: 'thingsboard', recordedAt: '2026-07-15T10:00:00.000Z' }, now), { valid: false, error: 'stale_telemetry_timestamp' })
})

test('timeout retries are bounded and become dead letter', () => {
  const base = { id: 'c1', deviceId: 'd1', idempotencyKey: 'retry-key-1', desiredValveState: true, attempts: 1, maxAttempts: 3 }
  assert.deepEqual(decideCommandRetry(base), { action: 'retry', nextAttempt: 2 })
  assert.deepEqual(decideCommandRetry({ ...base, attempts: 3 }), { action: 'dead_letter', nextAttempt: 4 })
})

test('planned and measured irrigation volumes stay distinct and measured data needs evidence', () => {
  const planned = buildIrrigationVolumeEvidence({ plannedVolumeLiters: 100 })
  assert.equal(planned.plannedVolumeLiters, 100)
  assert.equal(planned.measuredVolumeLiters, undefined)
  assert.equal(planned.estimated, true)
  const measured = buildIrrigationVolumeEvidence({ plannedVolumeLiters: 100, measuredVolumeLiters: 87, measurementSource: 'meter', measuredAt: now.toISOString() })
  assert.equal(measured.plannedVolumeLiters, 100)
  assert.equal(measured.measuredVolumeLiters, 87)
  assert.equal(measured.estimated, false)
  assert.throws(() => buildIrrigationVolumeEvidence({ plannedVolumeLiters: 100, measuredVolumeLiters: 87 }))
})

test('rain adjusts a real irrigation need without constructing a fake task', () => {
  const adjustment = adjustIrrigationNeedForRain(40, now.toISOString(), [{ date: '2026-07-17', tempMin: 18, tempMax: 28, condition: 'rain', rainMm: 16, windSpeed: 5, humidity: 80 }], { soilType: 'Loamy' } as never)
  assert.equal(adjustment.action, 'REDUCE')
  assert.equal(adjustment.adjustedDuration, 20)
})

test('nutrition stock changes only after confirmed application', () => {
  assert.equal(projectNutritionStock({ currentStock: 25, quantity: 5, event: 'suggestion' }), 25)
  assert.equal(projectNutritionStock({ currentStock: 25, quantity: 5, event: 'plan' }), 25)
  assert.equal(projectNutritionStock({ currentStock: 25, quantity: 5, event: 'application_confirmed' }), 20)
})

test('nutrition product concentration validates unit and physical range', () => {
  assert.doesNotThrow(() => validateProductConcentration(20, 'percentage'))
  assert.throws(() => validateProductConcentration(120, 'percentage'))
  assert.throws(() => validateProductConcentration(5, 'unknown'))
})
