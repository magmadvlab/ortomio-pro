import test from 'node:test'
import assert from 'node:assert/strict'

import { buildAgronomicEconomicPrioritySummary } from '@/services/agronomicEconomicPriorityService'
import { resolveAgronomicCropProfileSync } from '@/services/agronomicKernelService'
import { scoreAgronomicPriority } from '@/services/agronomicPriorityService'

test('crop package aliases resolve canonical profiles for newly covered priority families', () => {
  assert.equal(
    resolveAgronomicCropProfileSync({ plantId: 'durum wheat' }).profile.id,
    'winter_cereals'
  )
  assert.equal(
    resolveAgronomicCropProfileSync({ plantId: 'rapeseed' }).profile.id,
    'industrial_broadacre'
  )
  assert.equal(
    resolveAgronomicCropProfileSync({ plantId: 'brussels sprouts' }).profile.id,
    'field_brassicas'
  )
  assert.equal(
    resolveAgronomicCropProfileSync({ plantId: 'faba bean' }).profile.id,
    'broadacre_legumes'
  )
  assert.equal(
    resolveAgronomicCropProfileSync({ plantId: 'artichokes' }).profile.id,
    'artichoke_open_field'
  )
  assert.equal(
    resolveAgronomicCropProfileSync({ plantId: 'wine grape' }).profile.id,
    'vineyard_quality'
  )
  assert.equal(
    resolveAgronomicCropProfileSync({ plantId: 'olive oil' }).profile.id,
    'olive_grove_oil'
  )
  assert.equal(
    resolveAgronomicCropProfileSync({ plantId: 'fruit trees' }).profile.id,
    'orchard_generic'
  )
  assert.equal(
    resolveAgronomicCropProfileSync({ plantId: 'controlled environment' }).profile.id,
    'controlled_environment_leafy'
  )
})

test('field brassicas receive stronger health priority than legumes under the same humid pressure', () => {
  const brassicaProfile = resolveAgronomicCropProfileSync({ plantId: 'broccoli' })
  const legumeProfile = resolveAgronomicCropProfileSync({ plantId: 'cece' })
  const environmentalSummary = {
    zoneId: 'zone-1',
    gardenId: 'garden-1',
    entries: 6,
    highSoilWaterStressDays: 0,
    mediumSoilWaterStressDays: 0,
    highDiseasePressureDays: 4,
    sensorLocalDays: 2,
    surplusWaterBalanceDays: 3,
    lowDryingPowerDays: 3,
    latestSensorPrecedence: 'sensor_local' as const,
    dominantWeatherSourceClass: 'historical_archive' as const,
  }

  const brassicaScore = scoreAgronomicPriority({
    baseScore: 60,
    confidence: 0.68,
    resolvedProfile: brassicaProfile,
    focus: 'health',
    availableSignals: ['leaf_wetness', 'dew_point', 'weather_current'],
    isCriticalStage: true,
    environmentalSummary,
  })

  const legumeScore = scoreAgronomicPriority({
    baseScore: 60,
    confidence: 0.68,
    resolvedProfile: legumeProfile,
    focus: 'health',
    availableSignals: ['weather_current'],
    isCriticalStage: true,
    environmentalSummary,
  })

  assert.ok(brassicaScore.score > legumeScore.score)
  assert.ok(brassicaScore.confidence > legumeScore.confidence)
})

test('artichoke quality economics dominate broadacre legumes for the same priority envelope', () => {
  const artichoke = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 72,
    priorityConfidence: 0.78,
    agronomicProfileId: 'artichoke_open_field',
    isCriticalStage: true,
    qualityScoreGap: 8,
  })

  const legumes = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 72,
    priorityConfidence: 0.78,
    agronomicProfileId: 'broadacre_legumes',
    isCriticalStage: true,
    qualityScoreGap: 8,
  })

  assert.ok((artichoke.estimatedCostOfDelay || 0) > (legumes.estimatedCostOfDelay || 0))
  assert.ok((artichoke.estimatedValueProtected || 0) > (legumes.estimatedValueProtected || 0))
  assert.ok((artichoke.roiRatio || 0) > (legumes.roiRatio || 0))
})

test('vineyard and olive quality packages dominate generic orchard quality economics', () => {
  const orchard = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 68,
    priorityConfidence: 0.74,
    agronomicProfileId: 'orchard_generic',
    isCriticalStage: true,
    qualityScoreGap: 7,
  })

  const vineyard = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 68,
    priorityConfidence: 0.74,
    agronomicProfileId: 'vineyard_quality',
    isCriticalStage: true,
    qualityScoreGap: 7,
  })

  const olive = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 68,
    priorityConfidence: 0.74,
    agronomicProfileId: 'olive_grove_oil',
    isCriticalStage: true,
    qualityScoreGap: 7,
  })

  assert.equal(orchard.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(vineyard.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(olive.actionComparison?.recommendedAction, 'intervene_now')
  assert.ok((vineyard.estimatedValueProtected || 0) > (orchard.estimatedValueProtected || 0))
  assert.ok((olive.estimatedValueProtected || 0) > (vineyard.estimatedValueProtected || 0))
  assert.ok((olive.roiRatio || 0) > (orchard.roiRatio || 0))
})

test('controlled-environment leafy package is more aggressive than generic leafy crops under the same health pressure', () => {
  const leafy = buildAgronomicEconomicPrioritySummary({
    source: 'health',
    focus: 'health',
    priorityScore: 52,
    priorityConfidence: 0.62,
    agronomicProfileId: 'leafy_vegetables',
    severity: 'medium',
  })

  const cea = buildAgronomicEconomicPrioritySummary({
    source: 'health',
    focus: 'health',
    priorityScore: 52,
    priorityConfidence: 0.62,
    agronomicProfileId: 'controlled_environment_leafy',
    severity: 'medium',
  })

  assert.equal(leafy.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(cea.actionComparison?.recommendedAction, 'intervene_now')
  assert.ok((cea.actionComparison?.dominanceMargin || 0) > (leafy.actionComparison?.dominanceMargin || 0))
  assert.ok((cea.estimatedValueProtected || 0) > (leafy.estimatedValueProtected || 0))
})

test('wine-grape context is more quality-sensitive than table-grape context in vineyard economics', () => {
  const wineGrape = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 58,
    priorityConfidence: 0.66,
    agronomicProfileId: 'vineyard_quality',
    isCriticalStage: true,
    qualityScoreGap: 5,
    operationalContextTags: ['wine_grape'],
  })

  const tableGrape = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 58,
    priorityConfidence: 0.66,
    agronomicProfileId: 'vineyard_quality',
    isCriticalStage: true,
    qualityScoreGap: 5,
    operationalContextTags: ['table_grape'],
  })

  assert.equal(wineGrape.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(tableGrape.actionComparison?.recommendedAction, 'intervene_now')
  assert.ok((wineGrape.estimatedValueProtected || 0) > (tableGrape.estimatedValueProtected || 0))
  assert.ok((wineGrape.actionComparison?.dominanceMargin || 0) > (tableGrape.actionComparison?.dominanceMargin || 0))
})

test('NFT sub-system is stricter than ebb-flow in controlled-environment water economics', () => {
  const nft = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 34,
    priorityConfidence: 0.42,
    agronomicProfileId: 'controlled_environment_leafy',
    averageEfficiency: 88,
    waterUseEfficiency: 86,
    uniformityCoefficient: 84,
    operationalContextTags: ['nft_system'],
  })

  const ebbFlow = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 34,
    priorityConfidence: 0.42,
    agronomicProfileId: 'controlled_environment_leafy',
    averageEfficiency: 88,
    waterUseEfficiency: 86,
    uniformityCoefficient: 84,
    operationalContextTags: ['ebb_flow_system'],
  })

  assert.equal(nft.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(ebbFlow.actionComparison?.recommendedAction, 'intervene_now')
  assert.ok((nft.estimatedValueProtected || 0) > (ebbFlow.estimatedValueProtected || 0))
  assert.ok((nft.actionComparison?.dominanceMargin || 0) > (ebbFlow.actionComparison?.dominanceMargin || 0))
})

test('operational terroir increases orchard quality pressure on high-altitude steep sites', () => {
  const flatSite = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 60,
    priorityConfidence: 0.68,
    agronomicProfileId: 'orchard_generic',
    isCriticalStage: true,
    qualityScoreGap: 5,
  })

  const terroirSite = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 60,
    priorityConfidence: 0.68,
    agronomicProfileId: 'orchard_generic',
    isCriticalStage: true,
    qualityScoreGap: 5,
    operationalContextTags: ['high_altitude_site', 'steep_slope_site'],
  })

  assert.equal(flatSite.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(terroirSite.actionComparison?.recommendedAction, 'intervene_now')
  assert.ok((terroirSite.estimatedValueProtected || 0) > (flatSite.estimatedValueProtected || 0))
  assert.ok((terroirSite.roiRatio || 0) > (flatSite.roiRatio || 0))
})
