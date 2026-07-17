#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const rootAllowlist = new Set(['README.md', 'MASTERDOC.md', 'TASKS.md'])
const exactAllowlist = new Set([
  'components/lunar/README.md',
  'x_ortomio_free/README.md',
  'docs/archive/README.md',
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
  'docs/reports/execution-plans/ORTOMIO_PIANO_ESECUTIVO_COMPLETAMENTO_2026-07-16.md',
  'docs/security/API_CAPABILITY_MATRIX.md',
  'docs/security/P1_SECURITY_REMEDIATION_2026-07-17.md',
  'docs/security/SUPABASE_SECURITY_ADVISOR_2026-07-16.md',
])

function allowed(path) {
  if (!path.includes('/')) return rootAllowlist.has(path)
  if (path.startsWith('docs/manual/') && path.endsWith('.md')) return true
  if (path.startsWith('public/docs/manual/') && path.endsWith('.md')) return true
  return exactAllowlist.has(path)
}

const documents = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter(path => /\.(md|txt)$/i.test(path))
  .filter(path => existsSync(resolve(root, path)))
  .sort()
const forbidden = documents.filter(path => !allowed(path))
const forbiddenNames = documents.filter(path => /(^|\/)(COMMIT_MESSAGE|PUSH_SUCCESS)|_(COMPLETE|SUCCESS)(_|\.)|SESSION_SUMMARY/i.test(path))

const planPath = 'docs/reports/execution-plans/ORTOMIO_PIANO_ESECUTIVO_COMPLETAMENTO_2026-07-16.md'
const plans = documents.filter(path => path.includes('/execution-plans/') || path.includes('/superpowers/plans/'))
const planContent = await readFile(resolve(root, planPath), 'utf8')

const errors = []
if (forbidden.length) errors.push(`File fuori allowlist:\n${forbidden.join('\n')}`)
if (forbiddenNames.length) errors.push(`Nomi storici vietati:\n${forbiddenNames.join('\n')}`)
if (plans.length !== 1 || plans[0] !== planPath) errors.push(`Piani attivi inattesi: ${plans.join(', ')}`)
if (!/\*\*Stato esecuzione:\*\*/.test(planContent)) errors.push('Il piano corrente non dichiara lo stato esecuzione')

if (errors.length) {
  console.error(errors.join('\n\n'))
  process.exit(1)
}

console.log(`Igiene documentale verificata: ${documents.length} Markdown/TXT ammessi, root ${rootAllowlist.size}/3`)
