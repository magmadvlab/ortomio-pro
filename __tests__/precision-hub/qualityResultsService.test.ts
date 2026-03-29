import test from 'node:test'
import assert from 'node:assert/strict'

import { getQualityOverview } from '@/services/qualityResultsService'
import type { QualityResult } from '@/types'

const createQualityResult = (
  overrides: Partial<QualityResult> = {}
): QualityResult => ({
  id: overrides.id ?? crypto.randomUUID(),
  gardenId: 'garden-1',
  cropContextId: 'vineyard',
  scopeType: overrides.scopeType ?? 'field_row',
  scopeId: overrides.scopeId ?? 'row-1',
  fieldRowId: overrides.fieldRowId ?? 'row-1',
  recordedAt: overrides.recordedAt ?? '2026-03-20T10:00:00.000Z',
  source: overrides.source ?? 'field_measurement',
  qualityGrade: overrides.qualityGrade,
  qualityScore: overrides.qualityScore,
  marketableYieldKg: overrides.marketableYieldKg,
  rejectedYieldKg: overrides.rejectedYieldKg,
  brix: overrides.brix,
  acidity: overrides.acidity,
  ph: overrides.ph,
  firmness: overrides.firmness,
  dryMatterPercentage: overrides.dryMatterPercentage,
  oilContentPercentage: overrides.oilContentPercentage,
  oilYieldPercentage: overrides.oilYieldPercentage,
  defectIncidencePercentage: overrides.defectIncidencePercentage,
  notes: overrides.notes,
  metadata: overrides.metadata,
  createdAt: overrides.createdAt ?? '2026-03-20T10:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-03-20T10:00:00.000Z',
})

test('getQualityOverview groups quality history by scope and computes improving trend', async () => {
  const provider = {
    async getQualityResults() {
      return [
        createQualityResult({ recordedAt: '2026-03-20T10:00:00.000Z', qualityScore: 86, brix: 22.1, marketableYieldKg: 120 }),
        createQualityResult({ recordedAt: '2026-03-13T10:00:00.000Z', qualityScore: 82, brix: 21.4, marketableYieldKg: 118 }),
        createQualityResult({ recordedAt: '2026-03-06T10:00:00.000Z', qualityScore: 74, brix: 20.6, marketableYieldKg: 112 }),
      ]
    },
  }

  const overview = await getQualityOverview(provider, 'garden-1', { cropContextId: 'vineyard' })

  assert.equal(overview.totalResults, 3)
  assert.equal(overview.averageQualityScore, 80.67)
  assert.equal(overview.averageBrix, 21.37)
  assert.equal(overview.totalMarketableYieldKg, 350)
  assert.equal(overview.byScope.length, 1)
  assert.equal(overview.byScope[0].scopeLabel, 'filare row-1')
  assert.equal(overview.byScope[0].trend, 'improving')
  assert.equal(overview.byScope[0].latestQualityScore, 86)
})

test('getQualityOverview separates scopes and keeps the most recent scope first', async () => {
  const provider = {
    async getQualityResults() {
      return [
        createQualityResult({
          scopeId: 'row-2',
          fieldRowId: 'row-2',
          recordedAt: '2026-03-21T10:00:00.000Z',
          qualityScore: 79,
        }),
        createQualityResult({
          scopeId: 'row-1',
          fieldRowId: 'row-1',
          recordedAt: '2026-03-20T10:00:00.000Z',
          qualityScore: 84,
        }),
      ]
    },
  }

  const overview = await getQualityOverview(provider, 'garden-1')

  assert.equal(overview.byScope.length, 2)
  assert.equal(overview.byScope[0].scopeId, 'row-2')
  assert.equal(overview.byScope[1].scopeId, 'row-1')
})
