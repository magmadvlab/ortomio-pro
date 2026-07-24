import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const form = readFileSync(
  new URL('../../components/harvest/QuickHarvestForm.tsx', import.meta.url),
  'utf8'
)

test('quick harvest resolves botanical and structural context', () => {
  assert.match(form, /getPlantTaxonomy\(task\.plantName\)/)
  assert.match(form, /getArchetypeById/)
  assert.match(form, /storageProvider\.getGardenRow/)
  assert.match(form, /storageProvider\.getFieldRow/)
  assert.match(form, /storageProvider\.getGardenBed/)
  assert.match(form, /storageProvider\.getGardenZone/)
  assert.doesNotMatch(form, /placeholder - da migliorare/)
})
