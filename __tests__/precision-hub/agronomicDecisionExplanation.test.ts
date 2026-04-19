import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildAgronomicDecisionExplanation,
  type AgronomicDecisionExplanation,
} from '@/services/agronomicDecisionExplanationService'
import { buildAgronomicActionQueue } from '@/services/agronomicActionQueueService'
import {
  resolveAgronomicPriorityProfileSync,
  scoreAgronomicPriority,
} from '@/services/agronomicPriorityService'
import type { EfficiencyReport } from '@/types/irrigation'

test('buildAgronomicDecisionExplanation captures profile resolution and signal coverage', () => {
  const resolvedProfile = resolveAgronomicPriorityProfileSync({
    fallbackProfileId: 'vineyard_quality',
  })

  assert.ok(resolvedProfile)

  const priorityResult = scoreAgronomicPriority({
    baseScore: 58,
    confidence: 0.66,
    resolvedProfile,
    focus: 'water',
    availableSignals: ['weather_current', 'weather_forecast'],
    isCriticalStage: true,
  })

  const explanation = buildAgronomicDecisionExplanation({
    source: 'irrigation',
    focus: 'water',
    priorityResult,
    resolvedProfile,
    availableSignals: ['weather_current', 'weather_forecast'],
    isCriticalStage: true,
  })

  assert.equal(explanation.source, 'irrigation')
  assert.equal(explanation.focus, 'water')
  assert.equal(explanation.isCriticalStage, true)
  assert.equal(explanation.profileResolution?.profileId, 'vineyard_quality')
  assert.ok(explanation.signals.requiredP0Signals.length > 0)
  assert.ok(explanation.signals.missingP0Signals.length > 0)
  assert.match(explanation.warnings.join(' '), /Segnali P0 mancanti/i)
})

test('buildAgronomicActionQueue preserves decision explanation in irrigation metadata', () => {
  const decisionExplanation: AgronomicDecisionExplanation = {
    source: 'irrigation',
    focus: 'water',
    score: 64,
    confidence: 0.71,
    urgencyLabel: 'next_cycle',
    isCriticalStage: false,
    profileResolution: null,
    signals: {
      availableSignals: ['weather_current'],
      requiredP0Signals: ['weather_current'],
      coveredP0Signals: ['weather_current'],
      missingP0Signals: [],
      coverageRatio: 1,
    },
    measuredFeedbackSummary: null,
    economicSummary: null,
    environmentalSummary: null,
    agronomicRationale: ['Test rationale'],
    economicRationale: [],
    warnings: [],
  }

  const irrigationReport: EfficiencyReport = {
    zoneId: 'zone-1',
    zoneName: 'Zona test',
    period: 'week',
    averageEfficiency: 74,
    uniformityCoefficient: 70,
    waterUseEfficiency: 0.78,
    recommendations: ['Ottimizza il turno'],
    priorityScore: 64,
    priorityConfidence: 0.71,
    missingSignals: [],
    decisionExplanation,
  }

  const queue = buildAgronomicActionQueue({
    irrigationReports: [irrigationReport],
  })

  assert.equal(queue.length, 1)
  assert.deepEqual(
    (queue[0]?.metadata?.decisionExplanation as AgronomicDecisionExplanation | undefined)?.signals
      .coveredP0Signals,
    ['weather_current']
  )
})

test('buildAgronomicActionQueue builds decision explanation for health alerts with crop profile resolution', () => {
  const queue = buildAgronomicActionQueue({
    healthAlerts: [
      {
        id: 'alert-1',
        type: 'disease_risk',
        severity: 'high',
        plantName: 'Broccoli',
        description: 'Condizioni favorevoli a peronospora e alternaria.',
        detectedAt: '2026-04-18T08:00:00.000Z',
        suggestedActions: [],
        photoRequired: true,
        agronomistConsultation: false,
        urgencyDays: 2,
        confidence: 0.77,
        triggers: ['leaf wetness', 'humidity'],
      },
    ],
  })

  const explanation = queue[0]?.metadata?.decisionExplanation as AgronomicDecisionExplanation | undefined
  assert.ok(explanation)
  assert.equal(queue[0]?.agronomicProfileId, 'field_brassicas')
  assert.equal(explanation?.profileResolution?.profileId, 'field_brassicas')
  assert.equal(explanation?.source, 'health')
  assert.equal(explanation?.focus, 'health')
  assert.ok((queue[0]?.missingSignals.length || 0) >= 0)
})

test('buildAgronomicActionQueue builds decision explanation for phenology candidates', () => {
  const queue = buildAgronomicActionQueue({
    phenologyCandidates: [
      {
        id: 'phenology-1',
        title: 'Verifica invaiatura parcella Sangiovese',
        stageKey: 'veraison',
        stageLabel: 'Invaiatura',
        scopeLabel: 'Parcella Sangiovese',
        confidence: 0.74,
        profileId: 'vineyard_quality',
        source: 'observation',
        cropNameHint: 'wine grape',
        availableSignals: ['phenology_observation', 'quality_result'],
        isDecisionCriticalStage: true,
      },
    ],
  })

  const explanation = queue[0]?.metadata?.decisionExplanation as AgronomicDecisionExplanation | undefined
  assert.ok(explanation)
  assert.equal(queue[0]?.agronomicProfileId, 'vineyard_quality')
  assert.equal(explanation?.profileResolution?.profileId, 'vineyard_quality')
  assert.equal(explanation?.source, 'phenology')
  assert.equal(explanation?.isCriticalStage, true)
})
