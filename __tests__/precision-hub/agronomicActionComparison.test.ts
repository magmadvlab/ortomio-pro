import test from 'node:test'
import assert from 'node:assert/strict'

import { buildAgronomicActionQueue } from '@/services/agronomicActionQueueService'
import { buildAgronomicEconomicPrioritySummary } from '@/services/agronomicEconomicPriorityService'
import { scoreAgronomicPriority } from '@/services/agronomicPriorityService'
import type { PrioritizedAction } from '@/services/directorService'

test('economic priority summary compares alternative actions and selects intervene_now for critical quality windows', () => {
  const summary = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 78,
    priorityConfidence: 0.84,
    cropNameHint: 'CARCIOFO',
    isCriticalStage: true,
    qualityScoreGap: 12,
  })

  assert.ok(summary.actionComparison)
  assert.equal(summary.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(summary.actionComparison?.recommendedUrgencyLabel, 'immediate')
  assert.equal(summary.actionComparison?.scenarios.length, 3)
  assert.ok((summary.actionComparison?.dominanceMargin || 0) > 100)
  assert.match(summary.actionComparison?.explanation || '', /intervenire ora domina/i)
})

test('economic priority summary can prefer monitor when immediate intervention has weak economics', () => {
  const summary = buildAgronomicEconomicPrioritySummary({
    source: 'director',
    focus: 'nutrition',
    priorityScore: 18,
    priorityConfidence: 0.5,
    interventionCost: 180,
    efficacyScore: 96,
  })

  assert.ok(summary.actionComparison)
  assert.equal(summary.actionComparison?.recommendedAction, 'monitor')
  assert.equal(summary.actionComparison?.recommendedUrgencyLabel, 'monitor')
  assert.ok((summary.actionComparison?.dominanceMargin || 0) >= 100)

  const monitorScenario = summary.actionComparison?.scenarios.find(
    (scenario) => scenario.action === 'monitor'
  )
  const interveneScenario = summary.actionComparison?.scenarios.find(
    (scenario) => scenario.action === 'intervene_now'
  )

  assert.ok((monitorScenario?.estimatedNetImpact || 0) > 0)
  assert.ok((interveneScenario?.estimatedNetImpact || 0) < 0)
  assert.equal(summary.estimatedNetImpact, monitorScenario?.estimatedNetImpact)
  assert.equal(summary.roiRatio, monitorScenario?.roiRatio)
})

test('agronomic action queue propagates action comparison explanation and urgency label', () => {
  const directorAction: PrioritizedAction = {
    id: 'dir-1',
    type: 'LOW',
    title: 'Nutrizione parcella marginale',
    description: 'Verifica se il prossimo passaggio puo assorbire la correzione.',
    urgency: 18,
    impact: 45,
    feasibility: 82,
    cost: 180,
    priorityScore: 18,
    dependencies: [],
    source: 'ai_suggestion',
    sourceId: 'dir-1',
    reasoning: 'Correzione non ancora dominante.',
    confidence: 0.5,
    priorityConfidence: 0.5,
    agronomicFocus: 'nutrition',
  }

  const queue = buildAgronomicActionQueue({
    directorActions: [directorAction],
  })

  assert.equal(queue.length, 1)
  assert.equal(queue[0]?.urgencyLabel, 'monitor')
  assert.match(queue[0]?.description || '', /monitorare domina/i)
  assert.equal(
    (queue[0]?.metadata?.actionComparison as { recommendedAction?: string } | undefined)
      ?.recommendedAction,
    'monitor'
  )
})

test('economic priority summary can select next_cycle when immediate benefit is only marginally better', () => {
  const summary = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 30,
    priorityConfidence: 0.35,
    averageEfficiency: 88,
    waterUseEfficiency: 86,
    uniformityCoefficient: 84,
  })

  assert.equal(summary.actionComparison?.recommendedAction, 'next_cycle')
  assert.equal(summary.actionComparison?.recommendedUrgencyLabel, 'next_cycle')
  assert.match(summary.actionComparison?.explanation || '', /prossimo ciclo/i)

  const nextCycleScenario = summary.actionComparison?.scenarios.find(
    (scenario) => scenario.action === 'next_cycle'
  )

  assert.equal(summary.estimatedNetImpact, nextCycleScenario?.estimatedNetImpact)
  assert.equal(summary.roiRatio, nextCycleScenario?.roiRatio)
})

test('priority scoring stays aligned with monitor recommendations', () => {
  const economicSummary = buildAgronomicEconomicPrioritySummary({
    source: 'director',
    focus: 'water',
    priorityScore: 60,
    priorityConfidence: 0.55,
    interventionCost: 120,
  })

  const priority = scoreAgronomicPriority({
    baseScore: 60,
    confidence: 0.55,
    focus: 'water',
    economicSummary,
  })

  assert.equal(economicSummary.actionComparison?.recommendedUrgencyLabel, 'monitor')
  assert.ok(priority.score < 45)
})

test('crop-aware action comparison tuning allows next cycle on extensive families', () => {
  const cereals = buildAgronomicEconomicPrioritySummary({
    source: 'prescription',
    focus: 'nutrition',
    priorityScore: 34,
    priorityConfidence: 0.42,
    agronomicProfileId: 'winter_cereals',
    efficacyScore: 82,
  })

  const industrial = buildAgronomicEconomicPrioritySummary({
    source: 'prescription',
    focus: 'nutrition',
    priorityScore: 36,
    priorityConfidence: 0.45,
    agronomicProfileId: 'industrial_broadacre',
    efficacyScore: 82,
  })

  const legumes = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 34,
    priorityConfidence: 0.4,
    agronomicProfileId: 'broadacre_legumes',
    averageEfficiency: 88,
    waterUseEfficiency: 86,
    uniformityCoefficient: 84,
  })

  assert.equal(cereals.actionComparison?.recommendedAction, 'next_cycle')
  assert.equal(industrial.actionComparison?.recommendedAction, 'next_cycle')
  assert.equal(legumes.actionComparison?.recommendedAction, 'next_cycle')
})

test('crop-aware action comparison tuning keeps artichoke and brassicas biased to immediate action', () => {
  const artichoke = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 52,
    priorityConfidence: 0.62,
    agronomicProfileId: 'artichoke_open_field',
    qualityScoreGap: 6,
    isCriticalStage: true,
  })

  const brassicas = buildAgronomicEconomicPrioritySummary({
    source: 'health',
    focus: 'health',
    priorityScore: 54,
    priorityConfidence: 0.64,
    agronomicProfileId: 'field_brassicas',
    severity: 'medium',
  })

  assert.equal(artichoke.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(brassicas.actionComparison?.recommendedAction, 'intervene_now')
  assert.ok((artichoke.actionComparison?.dominanceMargin || 0) > 100)
  assert.ok((brassicas.actionComparison?.dominanceMargin || 0) > 50)
})

test('mixed-system profiles only apply protected-culture pressure when the context is explicit', () => {
  const baseInput = {
    source: 'health' as const,
    focus: 'health' as const,
    priorityScore: 46,
    priorityConfidence: 0.56,
    agronomicProfileId: 'field_brassicas',
    severity: 'medium' as const,
  }

  const generic = buildAgronomicEconomicPrioritySummary(baseInput)
  const openField = buildAgronomicEconomicPrioritySummary({
    ...baseInput,
    operationalContextTags: ['open_field'],
  })
  const protectedCulture = buildAgronomicEconomicPrioritySummary({
    ...baseInput,
    operationalContextTags: ['protected_culture'],
  })

  assert.equal(generic.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(openField.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(protectedCulture.actionComparison?.recommendedAction, 'intervene_now')
  assert.ok(
    (protectedCulture.actionComparison?.dominanceMargin || 0) >
      (generic.actionComparison?.dominanceMargin || 0)
  )
  assert.ok(
    (generic.actionComparison?.dominanceMargin || 0) >
      (openField.actionComparison?.dominanceMargin || 0)
  )
})

test('operational irrigation context changes broadacre legume water economics', () => {
  const baseInput = {
    source: 'irrigation' as const,
    focus: 'water' as const,
    priorityScore: 30,
    priorityConfidence: 0.4,
    agronomicProfileId: 'broadacre_legumes',
    averageEfficiency: 88,
    waterUseEfficiency: 86,
    uniformityCoefficient: 84,
  }

  const rainfed = buildAgronomicEconomicPrioritySummary({
    ...baseInput,
    operationalContextTags: ['rainfed'],
  })
  const pressurized = buildAgronomicEconomicPrioritySummary({
    ...baseInput,
    operationalContextTags: ['pressurized_irrigation'],
  })

  const rainfedImmediate = rainfed.actionComparison?.scenarios.find(
    (scenario) => scenario.action === 'intervene_now'
  )
  const pressurizedImmediate = pressurized.actionComparison?.scenarios.find(
    (scenario) => scenario.action === 'intervene_now'
  )

  assert.equal(rainfed.actionComparison?.recommendedAction, 'next_cycle')
  assert.equal(pressurized.actionComparison?.recommendedAction, 'next_cycle')
  assert.ok(
    (pressurized.actionComparison?.dominanceMargin || 0) >
      (rainfed.actionComparison?.dominanceMargin || 0)
  )
  assert.ok(
    (pressurizedImmediate?.estimatedNetImpact || 0) >
      (rainfedImmediate?.estimatedNetImpact || 0)
  )
})
