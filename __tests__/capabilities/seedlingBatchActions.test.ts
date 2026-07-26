import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(
  resolve(process.cwd(), 'components/seedling/SeedlingDashboard.tsx'),
  'utf8',
)
const sourceMigration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260726180000_seedling_batch_sources.sql'),
  'utf8',
)

test('both seedling batch creation entries open the same visible form', () => {
  assert.match(source, /const openCreateForm = \(\) =>/)
  assert.equal(source.match(/onClick=\{openCreateForm\}/g)?.length, 2)
  assert.match(source, /createFormRef\.current\?\.scrollIntoView/)
  assert.match(source, /createFormRef\.current\?\.focus/)
})

test('single-PRO seedling dashboard has no legacy free batch limit', () => {
  assert.doesNotMatch(source, /maxBatches/)
  assert.doesNotMatch(source, /versione gratuita/)
  assert.doesNotMatch(source, /Passa a Pro/)
})

test('create action explains and focuses the missing required plant', () => {
  assert.match(source, /setCreateError\('Seleziona la pianta:/)
  assert.match(source, /plantSelectRef\.current\?\.focus\(\)/)
  assert.match(source, /role="alert"/)
  assert.match(source, /<Button onClick=\{handleCreateBatch\} disabled=\{savingCreate\}>/)
})

test('database contract persists both internal and purchased seedling batches', () => {
  assert.match(sourceMigration, /add column if not exists source text not null default 'home'/)
  assert.match(sourceMigration, /add column if not exists purchase_date date/)
  assert.match(sourceMigration, /add column if not exists nursery_name text/)
  assert.match(sourceMigration, /check \(source in \('home', 'nursery'\)\)/)
})
