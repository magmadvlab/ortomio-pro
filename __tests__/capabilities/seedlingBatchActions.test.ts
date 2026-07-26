import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(
  resolve(process.cwd(), 'components/seedling/SeedlingDashboard.tsx'),
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
