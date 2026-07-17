#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const requireRemote = process.argv.includes('--require-remote')
const requiredMigrations = [
  '20260717000000_p1_security_hardening.sql', '20260717010000_p3_core_persistence.sql',
  '20260717020000_p4_physical_operation_lifecycle.sql', '20260717030000_p5_health_prediction_monitoring.sql',
  '20260717040000_p6_remote_data_provenance.sql', '20260717050000_p7_regulatory_exports_admin.sql',
  '20260717060000_p8_rollout_observability.sql',
]
const requiredEvidence = [
  'P0_BASELINE_INVENTORY_2026-07-16.md',
  'P2_CAPABILITY_NAVIGATION_EVIDENCE_2026-07-17.md',
  'P3_CORE_PERSISTENCE_EVIDENCE_2026-07-17.md',
  'P4_PHYSICAL_OPERATIONS_EVIDENCE_2026-07-17.md',
  'P5_HEALTH_PREDICTIONS_MONITORING_EVIDENCE_2026-07-17.md',
  'P6_REMOTE_DATA_DEMO_ISOLATION_EVIDENCE_2026-07-17.md',
  'P7_CERTIFICATIONS_EXPORT_ADMIN_EVIDENCE_2026-07-17.md',
  'P8_ROLLOUT_OBSERVABILITY_EVIDENCE_2026-07-17.md',
]
const evidenceFiles = fs.readdirSync(path.join(root, 'docs/reports'))
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const featureSource = fs.readFileSync(path.join(root, 'config/features.ts'), 'utf8')

const local = {
  migrations: Object.fromEntries(requiredMigrations.map(file => [file, fs.existsSync(path.join(root, 'supabase/migrations', file))])),
  evidence: Object.fromEntries(requiredEvidence.map(file => [file, evidenceFiles.includes(file)])),
  scripts: {
    releaseTests: Boolean(packageJson.scripts?.['test:release']),
    releaseCheck: Boolean(packageJson.scripts?.['release:check']),
  },
  failClosedFlags: {
    AI_PREDICTIONS: /AI_PREDICTIONS:\s*false/.test(featureSource),
    IRRIGATION_SCHEDULING: /IRRIGATION_SCHEDULING:\s*false/.test(featureSource),
    ADVANCED_CERTIFICATIONS: /ADVANCED_CERTIFICATIONS:\s*false/.test(featureSource),
  },
}
const localReady = Object.values(local.migrations).every(Boolean)
  && Object.values(local.evidence).every(Boolean)
  && Object.values(local.scripts).every(Boolean)
  && Object.values(local.failClosedFlags).every(Boolean)

let remote = { checked: false, deployReady: false, reason: 'remote_not_requested' }
if (requireRemote) {
  const baseUrl = process.env.RELEASE_BASE_URL
  const bearer = process.env.RELEASE_ADMIN_BEARER
  if (!baseUrl || !bearer) {
    remote = { checked: false, deployReady: false, reason: 'missing_RELEASE_BASE_URL_or_RELEASE_ADMIN_BEARER' }
  } else {
    try {
      const response = await fetch(new URL('/api/admin/release-readiness', baseUrl), { headers: { Authorization: `Bearer ${bearer}` } })
      const payload = await response.json()
      remote = { checked: true, deployReady: response.ok && payload.deployReady === true, reason: response.ok ? (payload.deployReady ? 'ready' : 'gates_not_satisfied') : `http_${response.status}` }
    } catch (error) {
      remote = { checked: false, deployReady: false, reason: error instanceof Error ? error.message : 'remote_check_failed' }
    }
  }
}

const result = { localReady, remoteRequired: requireRemote, deployReady: localReady && remote.checked && remote.deployReady, local, remote }
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
process.exit(requireRemote ? (result.deployReady ? 0 : 2) : (localReady ? 0 : 1))
