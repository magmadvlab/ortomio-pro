import assert from 'node:assert/strict'
import test from 'node:test'
import type { FertilizerInventoryItemDB, TreatmentRecordDB } from '../../types'
import { calculateNutritionEvidenceStats } from '../../lib/nutrition/nutritionStats'

const treatment = (
  id: string,
  treatmentType: TreatmentRecordDB['treatment_type'],
  organicApproved?: boolean,
): TreatmentRecordDB => ({
  id,
  user_id: 'user-1',
  garden_id: 'garden-1',
  crop_name: 'Pomodoro',
  treatment_date: '2026-07-28',
  product_name: `Prodotto ${id}`,
  treatment_type: treatmentType,
  organic_approved: organicApproved,
  created_at: '2026-07-28T08:00:00Z',
})

const fertilizer = (
  id: string,
  productType: FertilizerInventoryItemDB['product_type'],
): FertilizerInventoryItemDB => ({
  id,
  garden_id: 'garden-1',
  product_name: `Fertilizzante ${id}`,
  product_type: productType,
  category: productType,
  quantity: 1,
  unit: 'kg',
  created_at: '2026-07-28T08:00:00Z',
  updated_at: '2026-07-28T08:00:00Z',
})

test('empty persisted nutrition datasets produce unavailable percentages', () => {
  const stats = calculateNutritionEvidenceStats([], [])

  assert.equal(stats.treatments.total, 0)
  assert.equal(stats.treatments.organicPercentage, null)
  assert.equal(stats.fertilizers.total, 0)
  assert.equal(stats.fertilizers.organicPercentage, null)
})

test('nutrition statistics classify persisted treatment and inventory contracts', () => {
  const stats = calculateNutritionEvidenceStats(
    [
      treatment('organic', 'organic', true),
      treatment('integrated', 'integrated'),
      treatment('conventional', 'conventional'),
      treatment('approved-without-type', undefined, true),
    ],
    [
      fertilizer('organic', 'organic'),
      fertilizer('mineral', 'mineral'),
      fertilizer('corrective', 'corrective'),
      fertilizer('microelement', 'microelement'),
    ],
  )

  assert.deepEqual(stats.treatments, {
    total: 4,
    organic: 2,
    conventional: 1,
    integrated: 1,
    organicPercentage: 50,
  })
  assert.deepEqual(stats.fertilizers, {
    total: 4,
    organic: 1,
    mineral: 1,
    corrective: 1,
    microelement: 1,
    organicPercentage: 25,
  })
})
