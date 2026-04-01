import test from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateSoilHydraulicProfile,
  type SoilAnalysis,
} from '@/services/soilAnalysisService'

const baseAnalysis: SoilAnalysis = {
  id: 'soil-1',
  gardenId: 'garden-1',
  analysisDate: '2026-03-20',
  analysisType: 'complete',
  sandPercent: 32,
  siltPercent: 33,
  clayPercent: 35,
  organicMatterPercent: 1.4,
  cec: 28,
  ph: 8.1,
  createdAt: '2026-03-20T10:00:00.000Z',
  updatedAt: '2026-03-20T10:00:00.000Z',
}

test('calculateSoilHydraulicProfile exposes measured-vs-estimated metadata and soil constraints', () => {
  const profile = calculateSoilHydraulicProfile(baseAnalysis, {
    rootZoneDepthCm: 70,
    rootDepthSource: 'crop_profile',
    zone: {
      id: 'zone-1',
      name: 'Zona lenta',
      createdAt: '',
      updatedAt: '',
      drainageQuality: 'poor',
      waterRetention: 'high',
      slopePercentage: 14,
      soilType: 'clay',
    },
    waterQualityProfile: {
      qualityBand: 'critical',
      qualityScore: 49,
      salinity: { value: 2.4, unit: 'dS/m', source: 'sensor' },
      bicarbonates: { value: 410, unit: 'mg/L', source: 'sensor' },
      riskFlags: ['salinita elevata'],
      recommendations: ['Aumenta la lisciviazione'],
    },
  })

  assert.ok(profile)
  assert.equal(profile?.hydraulicQuality, 'measured')
  assert.equal(profile?.fieldCapacitySource, 'measured')
  assert.equal(profile?.rootDepthSource, 'crop_profile')
  assert.equal(profile?.pulseSplitRecommended, true)
  assert.ok((profile?.pulseCountSuggestion || 0) >= 2)
  assert.ok((profile?.salinityPressureIndex || 0) >= 70)
  assert.ok((profile?.effectiveRootableDepthCm || 0) < 70)
  assert.ok((profile?.refillEventTargetMm || 0) > 0)
  assert.equal(profile?.salinityAccumulationRisk, 'high')
})

test('calculateSoilHydraulicProfile falls back to estimated quality on partial analyses', () => {
  const partialAnalysis: SoilAnalysis = {
    id: 'soil-2',
    gardenId: 'garden-1',
    analysisDate: '2026-03-21',
    analysisType: 'basic',
    createdAt: '2026-03-21T10:00:00.000Z',
    updatedAt: '2026-03-21T10:00:00.000Z',
  }

  const profile = calculateSoilHydraulicProfile(partialAnalysis)

  assert.ok(profile)
  assert.equal(profile?.hydraulicQuality, 'estimated')
  assert.equal(profile?.fieldCapacitySource, 'estimated')
  assert.equal(profile?.source, 'estimated_from_partial_analysis')
  assert.equal(profile?.pulseSplitRecommended, false)
})
