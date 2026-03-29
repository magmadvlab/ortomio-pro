import test from 'node:test'
import assert from 'node:assert/strict'

import { getCurrentPhenologyState, getPhenologyStageLabel } from '@/services/phenologyService'
import type { PhenologyObservation } from '@/types'

const vineyardGarden = {
  id: 'garden-1',
  gardenType: 'Vineyard',
  vineyardConfig: { varieties: ['Sangiovese'] },
} as any

const createObservation = (
  overrides: Partial<PhenologyObservation> = {}
): PhenologyObservation => ({
  id: overrides.id ?? crypto.randomUUID(),
  gardenId: 'garden-1',
  cropContextId: 'vineyard',
  scopeType: overrides.scopeType ?? 'garden',
  scopeId: overrides.scopeId,
  zoneId: overrides.zoneId,
  fieldRowId: overrides.fieldRowId,
  treeId: overrides.treeId,
  plantId: overrides.plantId,
  observedAt: overrides.observedAt ?? '2026-03-20T09:00:00.000Z',
  phenologyStage: overrides.phenologyStage ?? 'veraison',
  bbchCode: overrides.bbchCode,
  stageIntensity: overrides.stageIntensity,
  confidenceLevel: overrides.confidenceLevel ?? 0.92,
  observationSource: overrides.observationSource ?? 'visual',
  notes: overrides.notes,
  metadata: overrides.metadata,
  createdAt: overrides.createdAt ?? '2026-03-20T09:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-03-20T09:00:00.000Z',
})

test('getCurrentPhenologyState resolves the most specific available scope first', async () => {
  const provider = {
    async getPhenologyObservations(_gardenId: string, options?: { scopeType?: string; scopeId?: string }) {
      if (options?.scopeType === 'field_row' && options.scopeId === 'row-7') {
        return [createObservation({ scopeType: 'field_row', scopeId: 'row-7', fieldRowId: 'row-7' })]
      }

      if (options?.scopeType === 'garden') {
        return [createObservation({ scopeType: 'garden', phenologyStage: 'fruit_growth' })]
      }

      return []
    },
  }

  const state = await getCurrentPhenologyState(provider, vineyardGarden, { fieldRowId: 'row-7', zoneId: 'zone-1' })

  assert.ok(state)
  assert.equal(state?.observation.scopeType, 'field_row')
  assert.equal(state?.stageLabel, 'Invaiatura')
  assert.equal(state?.scopeLabel, 'filare row-7')
})

test('getCurrentPhenologyState returns null for generic gardens without phenological context', async () => {
  const genericGarden = { id: 'garden-2', gardenType: 'VegetableGarden' } as any
  const provider = {
    async getPhenologyObservations() {
      assert.fail('generic gardens should not query phenology observations')
    },
  }

  const state = await getCurrentPhenologyState(provider, genericGarden)
  assert.equal(state, null)
})

test('getPhenologyStageLabel maps vineyard and orchard stages to readable Italian labels', () => {
  assert.equal(getPhenologyStageLabel('veraison'), 'Invaiatura')
  assert.equal(getPhenologyStageLabel('pit_hardening'), 'Indurimento nocciolo')
})
