import test from 'node:test'
import assert from 'node:assert/strict'

import { buildSmartDeviceAutomationAnalytics } from '@/services/smartDeviceAutomationAnalyticsService'
import type { SmartDevice, SmartDeviceAutomationLog } from '@/types'

const now = new Date()

const isoDaysAgo = (daysAgo: number) => {
  const value = new Date(now)
  value.setDate(value.getDate() - daysAgo)
  return value.toISOString()
}

const createDevice = (id: string, scopeId: string, name: string): SmartDevice => ({
  id,
  gardenId: 'garden-1',
  name,
  type: 'Valve',
  provider: 'thingsboard',
  deviceCategory: 'irrigation_valve',
  connectionType: 'cloud',
  scopeType: 'zone',
  scopeId,
  zoneId: scopeId,
  moisture: 45,
  isValveOpen: false,
  flowRateLpm: 12,
  sessionLiters: 0,
  targetLiters: 20,
  autoThreshold: 30,
  autoMode: true,
  lastUpdate: isoDaysAgo(0),
})

const createOutcomeLog = (
  id: string,
  deviceId: string,
  scopeId: string,
  outcome: NonNullable<SmartDeviceAutomationLog['irrigationOutcome']>,
  daysAgo: number,
  moistureDelta: number,
  targetLiters: number
): SmartDeviceAutomationLog => ({
  id,
  gardenId: 'garden-1',
  deviceId,
  provider: 'thingsboard',
  eventType: 'outcome',
  source: 'automation',
  eventAt: isoDaysAgo(daysAgo),
  scopeType: 'zone',
  scopeId,
  zoneId: scopeId,
  decision: 'close_now',
  trigger: 'target_reached',
  confidence: 'high',
  reason: 'Outcome test',
  commandStatus: 'confirmed',
  commandedValveState: false,
  confirmedValveState: false,
  targetLiters,
  sessionLiters: targetLiters,
  moisture: 50,
  irrigationDeltaMoisture: moistureDelta,
  irrigationOutcome: outcome,
  flowRateActualLpm: 11.8,
  linePressureBar: 1.7,
  createdAt: isoDaysAgo(daysAgo),
})

const createTimeoutLog = (
  id: string,
  deviceId: string,
  scopeId: string,
  daysAgo: number
): SmartDeviceAutomationLog => ({
  id,
  gardenId: 'garden-1',
  deviceId,
  provider: 'thingsboard',
  eventType: 'command_result',
  source: 'automation',
  eventAt: isoDaysAgo(daysAgo),
  scopeType: 'zone',
  scopeId,
  zoneId: scopeId,
  decision: 'open_now',
  trigger: 'water_stress',
  confidence: 'high',
  reason: 'Timeout test',
  commandStatus: 'timeout',
  commandedValveState: true,
  confirmedValveState: false,
  targetLiters: 20,
  sessionLiters: 0,
  moisture: 40,
  createdAt: isoDaysAgo(daysAgo),
})

const createScopeActionLog = (
  id: string,
  deviceId: string,
  scopeId: string,
  options: {
    daysAgo: number
    executionId: string
    mode: 'apply' | 'rollback'
    rollbackOfExecutionId?: string
    beforeTargetLiters?: number
    afterTargetLiters?: number
    beforeAutoThreshold?: number
    afterAutoThreshold?: number
    beforeAutoMode?: boolean
    afterAutoMode?: boolean
    title?: string
    priority?: 'urgent' | 'high' | 'medium' | 'low'
  category?: 'connectivity' | 'hydraulics' | 'rules' | 'sensors' | 'benchmark'
  }
): SmartDeviceAutomationLog => ({
  id,
  gardenId: 'garden-1',
  deviceId,
  provider: 'thingsboard',
  eventType: 'decision',
  source: 'manual',
  eventAt: isoDaysAgo(options.daysAgo),
  scopeType: 'zone',
  scopeId,
  zoneId: scopeId,
  decision: options.mode === 'rollback' ? 'manual_review' : 'hold',
  trigger: 'stability_hold',
  confidence: 'high',
  reason: (options.mode ?? 'apply') === 'rollback' ? 'Rollback test' : 'Apply test',
  createdAt: isoDaysAgo(options.daysAgo),
  metadata: {
    scopeActionMode: options.mode ?? 'apply',
    scopeActionExecutionId: options.executionId,
    scopeActionRollbackOfExecutionId: options.rollbackOfExecutionId,
    scopeActionTitle: options.title ?? 'Ritarare target e soglia',
    scopeActionPriority: options.priority ?? 'high',
    scopeActionCategory: options.category ?? 'rules',
    beforeTargetLiters: options.beforeTargetLiters,
    afterTargetLiters: options.afterTargetLiters,
    beforeAutoThreshold: options.beforeAutoThreshold,
    afterAutoThreshold: options.afterAutoThreshold,
    beforeAutoMode: options.beforeAutoMode,
    afterAutoMode: options.afterAutoMode,
  },
})

test('analytics computes stable benchmark and top gaps deterministically', () => {
  const devices = [
    createDevice('device-a', 'zone-a', 'Valvola A'),
    createDevice('device-b', 'zone-b', 'Valvola B'),
  ]

  const logs = [
    createOutcomeLog('log-a1', 'device-a', 'zone-a', 'nominal', 0, 5.5, 18),
    createOutcomeLog('log-a2', 'device-a', 'zone-a', 'nominal', 1, 5.1, 19),
    createOutcomeLog('log-a3', 'device-a', 'zone-a', 'nominal', 2, 4.8, 18),
    createOutcomeLog('log-b1', 'device-b', 'zone-b', 'critical', 0, 0.9, 24),
    createOutcomeLog('log-b2', 'device-b', 'zone-b', 'warning', 1, 1.2, 22),
    createTimeoutLog('log-b3', 'device-b', 'zone-b', 2),
  ]

  const analytics = buildSmartDeviceAutomationAnalytics(devices, logs)

  assert.equal(analytics.benchmark.bestScope?.scopeKey, 'zone:zone-a')
  assert.equal(analytics.benchmark.worstScope?.scopeKey, 'zone:zone-b')
  assert.equal(analytics.benchmark.topGaps[0]?.scopeKey, 'zone:zone-b')
  assert.equal(analytics.benchmark.topGaps[0]?.severityGap, 5)
})

test('analytics produces actionable recommendations for unstable scopes', () => {
  const devices = [
    createDevice('device-a', 'zone-a', 'Valvola A'),
    createDevice('device-b', 'zone-b', 'Valvola B'),
  ]

  const logs = [
    createOutcomeLog('log-a1', 'device-a', 'zone-a', 'nominal', 0, 5.2, 18),
    createOutcomeLog('log-a2', 'device-a', 'zone-a', 'nominal', 1, 5.0, 18),
    createOutcomeLog('log-b1', 'device-b', 'zone-b', 'critical', 0, 0.6, 24),
    createOutcomeLog('log-b2', 'device-b', 'zone-b', 'critical', 1, 0.8, 24),
    createTimeoutLog('log-b3', 'device-b', 'zone-b', 2),
  ]

  const analytics = buildSmartDeviceAutomationAnalytics(devices, logs)

  assert.ok(
    analytics.recommendations.some(
      recommendation =>
        recommendation.scopeLabel === 'zone: zone-b' &&
        recommendation.title === 'Delta umidita basso'
      )
  )

  assert.ok(
    analytics.scopeActions.some(
      action => action.scopeKey === 'zone:zone-b' && action.priority === 'urgent'
    )
  )
})

test('analytics reconstructs applied scope actions with before/after values per device', () => {
  const devices = [
    createDevice('device-a', 'zone-a', 'Valvola A'),
    createDevice('device-b', 'zone-a', 'Valvola B'),
  ]

  const logs = [
    createScopeActionLog('apply-a', 'device-a', 'zone-a', {
      daysAgo: 0,
      executionId: 'exec-1',
      beforeTargetLiters: 24,
      afterTargetLiters: 21,
      beforeAutoThreshold: 30,
      afterAutoThreshold: 35,
      beforeAutoMode: true,
      afterAutoMode: true,
    }),
    createScopeActionLog('apply-b', 'device-b', 'zone-a', {
      daysAgo: 0,
      executionId: 'exec-1',
      beforeTargetLiters: 23,
      afterTargetLiters: 20,
      beforeAutoThreshold: 30,
      afterAutoThreshold: 35,
      beforeAutoMode: true,
      afterAutoMode: true,
    }),
  ]

  const analytics = buildSmartDeviceAutomationAnalytics(devices, logs)
  const appliedAction = analytics.appliedScopeActions[0]

  assert.equal(analytics.appliedScopeActions.length, 1)
  assert.equal(appliedAction?.executionId, 'exec-1')
  assert.equal(appliedAction?.rolledBack, false)
  assert.equal(appliedAction?.scopeLabel, 'zone: zone-a')
  assert.equal(appliedAction?.deviceChanges.length, 2)
  assert.deepEqual(appliedAction?.deviceChanges[0], {
    deviceId: 'device-a',
    deviceName: 'Valvola A',
    beforeTargetLiters: 24,
    afterTargetLiters: 21,
    beforeAutoThreshold: 30,
    afterAutoThreshold: 35,
    beforeAutoMode: true,
    afterAutoMode: true,
  })
})

test('analytics marks applied actions as rolled back when rollback execution log is present', () => {
  const devices = [
    createDevice('device-a', 'zone-a', 'Valvola A'),
  ]

  const logs = [
    createScopeActionLog('apply-a', 'device-a', 'zone-a', {
      daysAgo: 1,
      executionId: 'exec-older',
      beforeTargetLiters: 22,
      afterTargetLiters: 20,
      beforeAutoThreshold: 30,
      afterAutoThreshold: 35,
      beforeAutoMode: true,
      afterAutoMode: true,
      title: 'Correzione precedente',
      priority: 'medium',
    }),
    createScopeActionLog('apply-b', 'device-a', 'zone-a', {
      daysAgo: 0,
      executionId: 'exec-latest',
      beforeTargetLiters: 20,
      afterTargetLiters: 18,
      beforeAutoThreshold: 35,
      afterAutoThreshold: 40,
      beforeAutoMode: true,
      afterAutoMode: false,
      title: 'Correzione recente',
      priority: 'urgent',
    }),
    createScopeActionLog('rollback-b', 'device-a', 'zone-a', {
      daysAgo: 0,
      executionId: 'rollback-exec-latest',
      mode: 'rollback',
      rollbackOfExecutionId: 'exec-latest',
      beforeTargetLiters: 18,
      afterTargetLiters: 20,
      beforeAutoThreshold: 40,
      afterAutoThreshold: 35,
      beforeAutoMode: false,
      afterAutoMode: true,
      title: 'Correzione recente',
      priority: 'urgent',
    }),
  ]

  const analytics = buildSmartDeviceAutomationAnalytics(devices, logs)

  assert.equal(analytics.appliedScopeActions.length, 2)
  assert.equal(analytics.appliedScopeActions[0]?.executionId, 'exec-latest')
  assert.equal(analytics.appliedScopeActions[0]?.rolledBack, true)
  assert.equal(analytics.appliedScopeActions[1]?.executionId, 'exec-older')
  assert.equal(analytics.appliedScopeActions[1]?.rolledBack, false)
  assert.equal(analytics.appliedScopeActions[0]?.deviceChanges[0]?.afterAutoMode, false)
  assert.equal(analytics.appliedScopeActions[1]?.deviceChanges[0]?.afterTargetLiters, 20)
})
