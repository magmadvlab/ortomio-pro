import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { NextRequest } from 'next/server'
import { GET as readinessGet } from '@/app/api/admin/release-readiness/route'
import { evaluateReleaseMetrics } from '@/config/release'

test('release thresholds request rollback on failures, dead letters and latency', () => {
  const result = evaluateReleaseMetrics({
    criticalWrites: 100, criticalWriteFailures: 2, commands: 100, retriedCommands: 8,
    deadLetters: 1, monitoringRuns: 100, failedMonitoringRuns: 2,
    maturePredictions: 100, predictionsWithoutOutcome: 25, p95LatencyMs: 2500,
  })
  assert.equal(result.rollbackRequired, true)
  assert.deepEqual(result.violations.sort(), ['command_retry_rate', 'critical_write_failure_rate', 'dead_letters', 'missing_prediction_outcomes', 'monitoring_failure_rate', 'p95_latency'])
})

test('empty or healthy windows do not create false rollback violations', () => {
  const result = evaluateReleaseMetrics({
    criticalWrites: 0, criticalWriteFailures: 0, commands: 0, retriedCommands: 0,
    deadLetters: 0, monitoringRuns: 0, failedMonitoringRuns: 0,
    maturePredictions: 0, predictionsWithoutOutcome: 0, p95LatencyMs: 0,
  })
  assert.equal(result.rollbackRequired, false)
})

test('release readiness endpoint is admin-only', async () => {
  const response = await readinessGet(new NextRequest('http://localhost/api/admin/release-readiness'))
  assert.equal(response.status, 401)
})

test('capability response applies server-side rollout state and schema checks', () => {
  const route = readFileSync('app/api/auth/capabilities/route.ts', 'utf8')
  const gate = readFileSync('components/shared/FeatureGate.tsx', 'utf8')
  assert.match(route, /release_capability_rollouts/)
  assert.match(route, /enabledFeatures/)
  assert.match(route, /daily_diary_entries/)
  assert.match(gate, /access\.enabledFeatures/)
  assert.doesNotMatch(gate, /isFeatureEnabled/)
})

test('local release manifest is complete while remote deployment remains a separate gate', () => {
  const output = execFileSync(process.execPath, ['scripts/check-release-readiness.mjs'], { encoding: 'utf8' })
  const result = JSON.parse(output)
  assert.equal(result.localReady, true)
  assert.equal(result.remote.checked, false)
  assert.equal(result.deployReady, false)
})

test('backup and restore require explicit database targets and restore authorization', () => {
  const backup = readFileSync('scripts/backup-database.sh', 'utf8')
  const restore = readFileSync('scripts/restore-database.sh', 'utf8')
  assert.match(backup, /DATABASE_URL/)
  assert.match(backup, /PG_RESTORE_BIN --list/)
  assert.doesNotMatch(backup + restore, /DB_PASSWORD="postgres"|127\.0\.0\.1|54324/)
  assert.match(restore, /ALLOW_RESTORE/)
  assert.match(restore, /RESTORE_DATABASE_URL/)
})

test('P8 migration provides audited rollouts and append-only release audit', () => {
  const sql = readFileSync('supabase/migrations/20260717060000_p8_rollout_observability.sql', 'utf8')
  assert.match(sql, /release_capability_rollouts/)
  assert.match(sql, /release_observability_events/)
  assert.match(sql, /set_release_capability_rollout/)
  assert.match(sql, /release_rollout_audit_is_append_only/)
})
