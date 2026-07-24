import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const dashboard = readFileSync(
  new URL('../../components/Dashboard.tsx', import.meta.url),
  'utf8'
)
const seasonView = readFileSync(
  new URL('../../components/analysis/SeasonAnalysisView.tsx', import.meta.url),
  'utf8'
)
const migration = readFileSync(
  new URL('../../supabase/migrations/20260724170000_season_adjustment_decisions.sql', import.meta.url),
  'utf8'
)

test('dashboard recommendations use stocked fertilizer products', () => {
  assert.match(dashboard, /getFertilizerInventory\(activeGardenId\)/)
  assert.match(dashboard, /item\.quantity > 0/)
  assert.match(dashboard, /availableFertilizers/)
})

test('watering timer opens the persisted completion flow when elapsed', () => {
  assert.match(dashboard, /startWateringTimer\(task\.zoneId, task\.durationMinutes\)/)
  assert.match(dashboard, /if \(!zoneId\)/)
  assert.match(dashboard, /handleMarkWateringDone\(zoneId\)/)
  assert.doesNotMatch(dashboard, /Timer non ancora implementato/)
})

test('season review is confirmed only after owner-scoped persistence', () => {
  assert.match(seasonView, /await onAdjustmentsAccepted\(analysis\.nextYearAdjustments\)/)
  assert.match(seasonView, /setAcceptError\('Salvataggio non riuscito/)
  assert.match(migration, /UNIQUE \(garden_id, season_year, season\)/)
  assert.match(migration, /g\.user_id = auth\.uid\(\)/)
  assert.match(migration, /jsonb_array_length\(adjustments\) > 0/)
})
