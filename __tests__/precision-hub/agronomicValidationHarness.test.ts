import test from 'node:test'
import assert from 'node:assert/strict'

import { AGRONOMIC_VALIDATION_SCENARIOS } from '@/data/agronomicValidationScenarios'
import { runAgronomicValidationHarness } from '@/services/agronomicValidationHarness'

test('agronomic validation harness exposes at least six canonical executable scenarios', () => {
  assert.ok(AGRONOMIC_VALIDATION_SCENARIOS.length >= 6)
})

test('agronomic validation harness preserves expected top action, confidence and ROI direction', () => {
  const results = runAgronomicValidationHarness()

  assert.equal(results.length, AGRONOMIC_VALIDATION_SCENARIOS.length)

  for (const scenario of AGRONOMIC_VALIDATION_SCENARIOS) {
    const result = results.find((entry) => entry.scenarioId === scenario.id)

    assert.ok(result, `Missing result for scenario ${scenario.id}`)
    assert.equal(result?.resolvedProfileId, scenario.expected.profileId)
    assert.equal(result?.topCandidateId, scenario.expected.topCandidateId)
    assert.ok((result?.topScore || 0) >= scenario.expected.minTopScore, `Top score too low for ${scenario.id}`)
    assert.ok(
      (result?.topConfidence || 0) >= scenario.expected.minTopConfidence,
      `Top confidence too low for ${scenario.id}`
    )
    assert.equal(result?.roiDirection, scenario.expected.roiDirection)
  }
})
