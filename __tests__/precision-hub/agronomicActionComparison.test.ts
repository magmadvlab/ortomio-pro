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

test('agronomic action queue ranks the same irrigation demand differently on exposed and sheltered contexts', () => {
  const sharedSuggestion = {
    id: 'dir-irrigation-context',
    type: 'HIGH' as const,
    title: 'Verifica irrigazione',
    description: 'Controllare la parcella prima del prossimo turno.',
    urgency: 75,
    impact: 60,
    feasibility: 82,
    cost: 140,
    priorityScore: 75,
    dependencies: [],
    source: 'ai_suggestion' as const,
    sourceId: 'dir-irrigation-context',
    reasoning: 'Verifica idrica prioritaria.',
    confidence: 0.72,
    priorityConfidence: 0.72,
    agronomicFocus: 'water' as const,
  }

  const queue = buildAgronomicActionQueue({
    directorActions: [
      {
        ...sharedSuggestion,
        id: 'dir-irrigation-exposed',
        title: 'Verifica irrigazione parcella esposta',
        refinedContext: {
          siteOperationalProfile: {
            dailySunHours: 8.6,
            exposureClass: 'exposed',
            windProtection: 'Low',
            soilType: 'Sandy',
          },
        } as any,
      },
      {
        ...sharedSuggestion,
        id: 'dir-irrigation-sheltered',
        title: 'Verifica irrigazione parcella riparata',
        refinedContext: {
          siteOperationalProfile: {
            dailySunHours: 3.2,
            exposureClass: 'sheltered',
            windProtection: 'High',
            soilType: 'Clay',
          },
        } as any,
      },
    ],
  })

  assert.equal(queue.length, 2)
  assert.equal(queue[0]?.id, 'director:dir-irrigation-exposed')
  assert.ok((queue[0]?.priorityScore || 0) >= (queue[1]?.priorityScore || 0))
  assert.equal(
    (queue[0]?.metadata?.actionComparison as { recommendedAction?: string } | undefined)
      ?.recommendedAction,
    'intervene_now'
  )
  assert.equal(
    (queue[1]?.metadata?.actionComparison as { recommendedAction?: string } | undefined)
      ?.recommendedAction,
    'intervene_now'
  )
  assert.ok(
    ((queue[0]?.metadata?.actionComparison as { dominanceMargin?: number } | undefined)
      ?.dominanceMargin || 0) >=
      ((queue[1]?.metadata?.actionComparison as { dominanceMargin?: number } | undefined)
        ?.dominanceMargin || 0)
  )
})

test('site context can move a borderline irrigation comparison without changing the action label yet', () => {
  const sheltered = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 28,
    priorityConfidence: 0.61,
    agronomicProfileId: 'field_brassicas',
    averageEfficiency: 82,
    waterUseEfficiency: 80,
    refinedContext: {
      siteOperationalProfile: {
        soilType: 'Clay',
        dailySunHours: 3.1,
        exposureClass: 'sheltered',
        windProtection: 'High',
        shadowObstaclesCount: 2,
      },
    },
  })

  const exposed = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 28,
    priorityConfidence: 0.61,
    agronomicProfileId: 'field_brassicas',
    averageEfficiency: 82,
    waterUseEfficiency: 80,
    refinedContext: {
      siteOperationalProfile: {
        soilType: 'Sandy',
        dailySunHours: 8.6,
        exposureClass: 'exposed',
        windProtection: 'Low',
        shadowObstaclesCount: 0,
      },
    },
  })

  assert.equal(sheltered.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(exposed.actionComparison?.recommendedAction, 'intervene_now')
  assert.ok((exposed.actionComparison?.dominanceMargin || 0) > (sheltered.actionComparison?.dominanceMargin || 0))
  assert.ok((exposed.estimatedCostOfDelay || 0) > (sheltered.estimatedCostOfDelay || 0))
})

test('site context can move prescription economics at the cutoff without flipping the action label', () => {
  const sheltered = buildAgronomicEconomicPrioritySummary({
    source: 'prescription',
    focus: 'water',
    priorityScore: 69,
    priorityConfidence: 0.58,
    averageEfficiency: 74,
    waterUseEfficiency: 72,
    interventionCost: 120,
    refinedContext: {
      siteOperationalProfile: {
        soilType: 'Clay',
        dailySunHours: 3.2,
        exposureClass: 'sheltered',
        windProtection: 'High',
        aspectDirection: 'North',
        shadowObstaclesCount: 3,
      },
    },
  })

  const exposed = buildAgronomicEconomicPrioritySummary({
    source: 'prescription',
    focus: 'water',
    priorityScore: 69,
    priorityConfidence: 0.58,
    averageEfficiency: 74,
    waterUseEfficiency: 72,
    interventionCost: 120,
    refinedContext: {
      siteOperationalProfile: {
        soilType: 'Sandy',
        dailySunHours: 8.6,
        exposureClass: 'exposed',
        windProtection: 'Low',
        aspectDirection: 'South',
        shadowObstaclesCount: 0,
      },
    },
  })

  assert.equal(sheltered.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(exposed.actionComparison?.recommendedAction, 'intervene_now')
  assert.equal(exposed.actionComparison?.recommendedUrgencyLabel, 'immediate')
  assert.equal(sheltered.actionComparison?.recommendedUrgencyLabel, 'immediate')
  assert.ok((exposed.actionComparison?.dominanceMargin || 0) >= (sheltered.actionComparison?.dominanceMargin || 0))
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

test('refined site context changes irrigation action comparison even without explicit site tags', () => {
  const shadedSite = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 48,
    priorityConfidence: 0.58,
    agronomicProfileId: 'field_brassicas',
    averageEfficiency: 76,
    waterUseEfficiency: 75,
    refinedContext: {
      siteOperationalProfile: {
        soilType: 'Clay',
        dailySunHours: 3.2,
        exposureClass: 'sheltered',
        windProtection: 'High',
        shadowObstaclesCount: 2,
      },
    },
  })

  const exposedSandySite = buildAgronomicEconomicPrioritySummary({
    source: 'irrigation',
    focus: 'water',
    priorityScore: 48,
    priorityConfidence: 0.58,
    agronomicProfileId: 'field_brassicas',
    averageEfficiency: 76,
    waterUseEfficiency: 75,
    refinedContext: {
      siteOperationalProfile: {
        soilType: 'Sandy',
        dailySunHours: 8.4,
        exposureClass: 'exposed',
        windProtection: 'Low',
        shadowObstaclesCount: 0,
      },
    },
  })

  assert.ok(
    (exposedSandySite.estimatedCostOfDelay || 0) > (shadedSite.estimatedCostOfDelay || 0)
  )
  assert.ok(
    (exposedSandySite.actionComparison?.dominanceMargin || 0) >
      (shadedSite.actionComparison?.dominanceMargin || 0)
  )
})

test('refined site context raises quality economics on mountain orchards without relying on tags', () => {
  const lowlandSite = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 58,
    priorityConfidence: 0.66,
    agronomicProfileId: 'orchard_generic',
    isCriticalStage: true,
    qualityScoreGap: 5,
    refinedContext: {
      siteOperationalProfile: {
        altitudeMeters: 90,
        slopeClass: 'flat',
        dailySunHours: 7,
      },
    },
  })

  const mountainSite = buildAgronomicEconomicPrioritySummary({
    source: 'phenology',
    focus: 'quality',
    priorityScore: 58,
    priorityConfidence: 0.66,
    agronomicProfileId: 'orchard_generic',
    isCriticalStage: true,
    qualityScoreGap: 5,
    refinedContext: {
      siteOperationalProfile: {
        altitudeMeters: 920,
        slopeClass: 'steep',
        dailySunHours: 7,
      },
    },
  })

  assert.ok((mountainSite.estimatedValueProtected || 0) > (lowlandSite.estimatedValueProtected || 0))
  assert.ok((mountainSite.actionComparison?.dominanceMargin || 0) > (lowlandSite.actionComparison?.dominanceMargin || 0))
})
