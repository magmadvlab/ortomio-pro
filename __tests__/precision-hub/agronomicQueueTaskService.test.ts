import test from 'node:test'
import assert from 'node:assert/strict'

import {
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
  assert.equal(
    (metadata?.decisionSnapshot as AgronomicDecisionSnapshot | null)?.decisionExplanation?.urgencyLabel,
    'immediate'
  )
})
