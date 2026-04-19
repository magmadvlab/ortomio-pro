import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildAgronomicQueueTaskOperationalSummary,
  buildAgronomicQueueTaskDrafts,
  parseAgronomicQueueTaskMetadata,
  type AgronomicDecisionSnapshot,
} from '@/services/agronomicQueueTaskService'
import type { AgronomicDecisionExplanation } from '@/services/agronomicDecisionExplanationService'
import type { AgronomicActionQueueItem } from '@/services/agronomicActionQueueService'

test('buildAgronomicQueueTaskDrafts persists decision snapshot metadata into task notes', () => {
  const decisionExplanation: AgronomicDecisionExplanation = {
    source: 'irrigation',
    focus: 'water',
    score: 79,
    confidence: 0.82,
    urgencyLabel: 'immediate',
    isCriticalStage: true,
    profileResolution: {
      profileId: 'vineyard_quality',
      profileLabel: 'Vigneto qualita',
      resolutionSource: 'fallback',
      matchedBy: 'vineyard_quality',
      warnings: ['Priority profile resolved from fallback profile id.'],
    },
    signals: {
      availableSignals: ['weather_current', 'weather_forecast', 'soil_moisture_30cm'],
      requiredP0Signals: ['weather_current', 'soil_moisture_30cm'],
      coveredP0Signals: ['weather_current', 'soil_moisture_30cm'],
      missingP0Signals: [],
      coverageRatio: 1,
    },
    measuredFeedbackSummary: null,
    economicSummary: null,
    environmentalSummary: null,
    agronomicRationale: ['Finestra decisionale marcata come critica.'],
    economicRationale: [],
    warnings: [],
    refinedContext: {
      cultivarContext: {
        cultivarLabel: 'Sangiovese',
        productionIntent: 'wine',
      },
      subSystemContext: {
        systemType: 'vineyard',
        irrigationMode: 'pressurized_irrigation',
      },
    },
    contextRationale: ['Cultivar considerata: Sangiovese.'],
  }

  const queueItem: AgronomicActionQueueItem = {
    id: 'irrigation:zone-vine:week',
    source: 'irrigation',
    title: 'Irrigazione Filare Sangiovese',
    description: 'Aumenta il supporto irriguo sulla fascia piu stressata.',
    scopeLabel: 'Filare Sangiovese',
    focus: 'water',
    priorityScore: 79,
    priorityConfidence: 0.82,
    agronomicProfileId: 'vineyard_quality',
    missingSignals: [],
    urgencyLabel: 'immediate',
    metadata: {
      refinedContext: decisionExplanation.refinedContext,
      decisionExplanation,
      economicSummary: null,
    },
  }

  const drafts = buildAgronomicQueueTaskDrafts('garden-1', [queueItem], [])
  assert.equal(drafts.length, 1)

  const draft = drafts[0]
  assert.ok(draft.decisionSnapshot)
  assert.equal(draft.decisionSnapshot?.agronomicProfileId, 'vineyard_quality')

  const metadata = parseAgronomicQueueTaskMetadata(draft.task.notes)
  assert.equal(metadata?.queueItemId, queueItem.id)
  assert.equal(metadata?.decisionExplanation?.profileResolution?.profileId, 'vineyard_quality')
  assert.equal(metadata?.refinedContext?.cultivarContext?.cultivarLabel, 'Sangiovese')
  assert.equal(
    (metadata?.decisionSnapshot as AgronomicDecisionSnapshot | null)?.refinedContext?.subSystemContext
      ?.systemType,
    'vineyard'
  )
  assert.equal(
    (metadata?.decisionSnapshot as AgronomicDecisionSnapshot | null)?.decisionExplanation?.urgencyLabel,
    'immediate'
  )
})

test('buildAgronomicQueueTaskOperationalSummary classifies readiness and context labels', () => {
  const decisionExplanation: AgronomicDecisionExplanation = {
    source: 'prescription',
    focus: 'nutrition',
    score: 68,
    confidence: 0.58,
    urgencyLabel: 'next_cycle',
    isCriticalStage: false,
    profileResolution: {
      profileId: 'olive_quality',
      profileLabel: 'Oliveto qualita',
      resolutionSource: 'fallback',
      matchedBy: 'olive_quality',
      warnings: [],
    },
    signals: {
      availableSignals: ['weather_current'],
      requiredP0Signals: ['weather_current', 'ndvi', 'soil_moisture_30cm'],
      coveredP0Signals: ['weather_current'],
      missingP0Signals: ['ndvi', 'soil_moisture_30cm'],
      coverageRatio: 1 / 3,
    },
    measuredFeedbackSummary: null,
    economicSummary: null,
    environmentalSummary: null,
    agronomicRationale: ['Stress nutrizionale crescente sul comparto olivicolo.'],
    economicRationale: [],
    warnings: [],
    refinedContext: {
      cultivarContext: {
        cultivarLabel: 'Coratina',
        productionIntent: 'oil',
      },
      subSystemContext: {
        systemType: 'olive_grove',
        irrigationMode: 'rainfed',
      },
      siteOperationalProfile: {
        terroir: 'collina_calcarea',
        soilType: 'franco_argilloso',
      },
    },
    contextRationale: ['Terroir collinare con disponibilita idrica limitata.'],
  }

  const queueItem: AgronomicActionQueueItem = {
    id: 'prescription:olive:zone-a',
    source: 'prescription',
    title: 'Prescription Oliveto Zona A',
    description: 'Ribilancia la strategia nutrizionale prima del prossimo passaggio.',
    scopeLabel: 'Oliveto Zona A',
    focus: 'nutrition',
    priorityScore: 68,
    priorityConfidence: 0.58,
    agronomicProfileId: 'olive_quality',
    missingSignals: ['ndvi', 'soil_moisture_30cm'],
    urgencyLabel: 'next_cycle',
    metadata: {
      refinedContext: decisionExplanation.refinedContext,
      decisionExplanation,
      economicSummary: null,
    },
  }

  const draft = buildAgronomicQueueTaskDrafts('garden-1', [queueItem], [])[0]
  const summary = buildAgronomicQueueTaskOperationalSummary(draft.task)

  assert.equal(summary?.readiness, 'partial')
  assert.equal(summary?.readinessLabel, 'Eseguibile con dati parziali')
  assert.equal(summary?.focusLabel, 'Focus nutrizione')
  assert.equal(summary?.urgencyLabel, 'Prossimo ciclo')
  assert.match(summary?.confidenceLabel || '', /58%/)
  assert.equal(summary?.contextLabels.includes('Cultivar Coratina'), true)
  assert.equal(summary?.contextLabels.includes('Target Olio'), true)
  assert.match(summary?.missingSignalsLabel || '', /ndvi/i)
  assert.match(summary?.primaryRationale || '', /Stress nutrizionale crescente/i)
})
