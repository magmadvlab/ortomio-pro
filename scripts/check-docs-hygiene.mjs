#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const rootAllowlist = new Set(['README.md', 'MASTERDOC.md', 'TASKS.md', 'PRODUCT.md', 'AGENTS.md'])
const exactAllowlist = new Set([
  'components/lunar/README.md',
  'docs/DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-15_APPROFONDITO.md',
  'docs/landing-media-sources.md',
  'docs/reports/M06_SUPABASE_REMOTE_AUDIT_2026-07-26.md',
  'docs/reports/M15_PRODUCTION_MIGRATION_APPLY_2026-07-26.md',
  'docs/reports/M16_GO_NO_GO_2026-07-26.md',
  'docs/reports/T01_LINT_DEBT_BASELINE_2026-07-24.md',
  'docs/reports/audit-2026-11-18/REPORT.md',
  'docs/reports/audit-2026-11-18/EXECUTION.md',
  'docs/reports/audit-2026-11-18/LOCAL_RUNBOOK.md',
  'x_ortomio_free/README.md',
  'docs/archive/README.md',
  'docs/reports/ORTOMIO_AUDIT_LOCALE_MANUALE_2026-11-18.md',
  'docs/reports/P0_BASELINE_INVENTORY_2026-07-16.md',
  'docs/reports/P2_CAPABILITY_NAVIGATION_EVIDENCE_2026-07-17.md',
  'docs/reports/P3_CORE_PERSISTENCE_EVIDENCE_2026-07-17.md',
  'docs/reports/P4_PHYSICAL_OPERATIONS_EVIDENCE_2026-07-17.md',
  'docs/reports/P5_HEALTH_PREDICTIONS_MONITORING_EVIDENCE_2026-07-17.md',
  'docs/reports/P6_REMOTE_DATA_DEMO_ISOLATION_EVIDENCE_2026-07-17.md',
  'docs/reports/P7_CERTIFICATIONS_EXPORT_ADMIN_EVIDENCE_2026-07-17.md',
  'docs/reports/P8_ROLLOUT_OBSERVABILITY_EVIDENCE_2026-07-17.md',
  'docs/reports/P9_DOCUMENTATION_ALIGNMENT_EVIDENCE_2026-07-17.md',
  'docs/reports/P9_DOCUMENT_HYGIENE_REPORT_2026-07-17.md',
  'docs/reports/M06_MIGRATION_RUNBOOK_2026-07-24.md',
  'docs/reports/M07_BACKUP_RESTORE_DRILL_2026-07-24.md',
  'docs/reports/M08_MULTI_CLIENT_RLS_MATRIX_2026-07-24.md',
  'docs/reports/M09_CANONICAL_PROVIDER_MAP_2026-07-24.md',
  'docs/reports/M10_NOTIFICATION_DELIVERY_GAPS_2026-07-24.md',
  'docs/reports/M11_CORE_OPERATIONAL_DAY_2026-07-24.md',
  'docs/reports/M12_AGRONOMIC_PILOT_PROTOCOL_2026-07-24.md',
  'docs/reports/M13_PROVIDER_SMOKE_2026-07-24.md',
  'docs/reports/M14_AI_SHADOW_VALIDATION_2026-07-24.md',
  'docs/reports/M15_COMMERCIAL_LIFECYCLE_GAPS_2026-07-24.md',
  'docs/reports/execution-plans/ORTOMIO_PIANO_ESECUTIVO_COMPLETAMENTO_2026-07-16.md',
  'docs/reports/execution-plans/ORTOMIO_ROADMAP_INDUSTRIALIZZAZIONE_2026-07-22.md',
  'docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md',
  'docs/superpowers/plans/2026-07-23-vineyard-bulk-vine-creation.md',
  'docs/security/API_CAPABILITY_MATRIX.md',
  'docs/security/P1_SECURITY_REMEDIATION_2026-07-17.md',
  'docs/security/SUPABASE_SECURITY_ADVISOR_2026-07-16.md',
])

function allowed(path) {
  if (!path.includes('/')) return rootAllowlist.has(path)
  if (path.startsWith('docs/manual/') && path.endsWith('.md')) return true
  if (path.startsWith('public/docs/manual/') && path.endsWith('.md')) return true
  // Historical specifications and marketing records are not the current execution queue.
  if (/^docs\/(superpowers\/(plans|specs|reports)|gtm|video)\//.test(path)) return true
  return exactAllowlist.has(path)
}

const inventory = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(path => /\.(md|txt)$/i.test(path))
  .filter(path => existsSync(resolve(root, path)))
  .sort()
// Tool/vendor instructions and quarantined implementations are outside product documentation.
const excludedToolDocs = inventory.filter(path => /^(\.claude|\.impeccable|_quarantine|video-ortomio)\//.test(path))
const documents = inventory.filter(path => !excludedToolDocs.includes(path))
const forbidden = documents.filter(path => !allowed(path))
const forbiddenNames = documents.filter(path => /(^|\/)(COMMIT_MESSAGE|PUSH_SUCCESS)|_(COMPLETE|SUCCESS)(_|\.)|SESSION_SUMMARY/i.test(path))

const planPath = 'docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md'
const planContent = await readFile(resolve(root, planPath), 'utf8')

const errors = []
if (forbidden.length) errors.push(`File fuori allowlist:\n${forbidden.join('\n')}`)
if (forbiddenNames.length) errors.push(`Nomi storici vietati:\n${forbiddenNames.join('\n')}`)
if (!/\*\*Stato esecuzione:\*\*/.test(planContent)) errors.push('Il piano corrente non dichiara lo stato esecuzione')

if (errors.length) {
  console.error(errors.join('\n\n'))
  process.exit(1)
}

console.log(`Igiene documentale verificata: ${documents.length} Markdown/TXT ammessi, root ${rootAllowlist.size}; documenti tooling/quarantena separati: ${excludedToolDocs.length}`)
