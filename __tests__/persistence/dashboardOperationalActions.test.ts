import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const fertilizerModal = readFileSync(
  new URL('../../components/fertilizer/FertilizerApplicationModal.tsx', import.meta.url),
  'utf8'
)
const taskCard = readFileSync(
  new URL('../../components/shared/TaskCard.tsx', import.meta.url),
  'utf8'
)
const homeDashboard = readFileSync(
  new URL('../../components/shared/HomeDashboard.tsx', import.meta.url),
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

test('fertilizer suggestion prefers products actually in stock over the generic catalog', () => {
  assert.match(fertilizerModal, /getFertilizerInventory\(task\.gardenId\)/)
  assert.match(fertilizerModal, /item\.quantity > 0/)
  assert.match(fertilizerModal, /stockedFertilizers/)
})

test('completing an irrigation task offers a measured watering log instead of a bare checkbox', () => {
  assert.match(taskCard, /task\.taskType === 'Irrigation' && onWater && irrigationZones/)
  assert.match(taskCard, /<WateringLogForm/)
  assert.match(homeDashboard, /onWater=\{async \(log\) => \{/)
  assert.match(homeDashboard, /storageProvider\.createWateringLog\(log\)/)
})

test('season review is confirmed only after owner-scoped persistence', () => {
  assert.match(seasonView, /await onAdjustmentsAccepted\(analysis\.nextYearAdjustments\)/)
  assert.match(seasonView, /setAcceptError\('Salvataggio non riuscito/)
  assert.match(migration, /UNIQUE \(garden_id, season_year, season\)/)
  assert.match(migration, /g\.user_id = auth\.uid\(\)/)
  assert.match(migration, /jsonb_array_length\(adjustments\) > 0/)
})
