#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const migrationDirectory = path.join(root, 'supabase/migrations')
const snapshot = JSON.parse(fs.readFileSync(
  path.join(root, 'docs/reports/M06_REMOTE_MIGRATION_SNAPSHOT_2026-07-24.json'),
  'utf8',
))
const remote = new Set(snapshot.remoteVersions)
const files = fs.readdirSync(migrationDirectory).sort()
const active = files.filter((file) => /^\d{14}_.+\.sql$/.test(file))
const special = files.filter((file) => !/^\d{14}_.+\.sql$/.test(file))
const byVersion = new Map()

for (const file of active) {
  const version = file.slice(0, 14)
  byVersion.set(version, [...(byVersion.get(version) || []), file])
}

const rows = []
for (const file of active) {
  const version = file.slice(0, 14)
  const duplicates = byVersion.get(version)
  const status = duplicates.length > 1
    ? 'duplicate_timestamp'
    : remote.has(version)
      ? 'remote_applied'
      : 'pending_preflight'
  rows.push({ version, file, status, batch: status === 'pending_preflight' ? `B${String(Math.floor(rows.filter((row) => row.status === 'pending_preflight').length / 10) + 1).padStart(2, '0')}` : '' })
}
for (const file of special) rows.push({ version: '', file, status: 'special_non_runnable', batch: '' })
for (const version of remote) {
  if (!byVersion.has(version)) rows.push({ version, file: '', status: 'remote_orphan', batch: '' })
}

const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
const columns = ['version', 'file', 'status', 'batch']
const output = [
  columns.map(csv).join(','),
  ...rows.map((row) => columns.map((column) => csv(row[column])).join(',')),
  '',
].join('\n')
fs.writeFileSync(path.join(root, 'docs/reports/M06_MIGRATION_RECONCILIATION_2026-07-24.csv'), output)

const count = (status) => rows.filter((row) => row.status === status).length
const result = {
  activeLocalFiles: active.length,
  remoteVersions: remote.size,
  remoteAppliedFiles: count('remote_applied'),
  pendingPreflightFiles: count('pending_preflight'),
  duplicateTimestampFiles: count('duplicate_timestamp'),
  specialFiles: count('special_non_runnable'),
  remoteOrphans: count('remote_orphan'),
  safeToApply: count('duplicate_timestamp') === 0 && count('remote_orphan') === 0,
}
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
if (process.argv.includes('--require-safe') && !result.safeToApply) process.exit(1)
