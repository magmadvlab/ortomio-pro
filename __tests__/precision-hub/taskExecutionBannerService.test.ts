import test from 'node:test'
import assert from 'node:assert/strict'

import { buildAgronomicQueueTaskDrafts } from '@/services/agronomicQueueTaskService'
import { loadTaskExecutionBannerDetails } from '@/services/taskExecutionBannerService'
import type { AgronomicDecisionExplanation } from '@/services/agronomicDecisionExplanationService'
import type { AgronomicActionQueueItem } from '@/services/agronomicActionQueueService'

test('loadTaskExecutionBannerDetails exposes visible notes and operational summary for agronomic queue tasks', async () => {
  const decisionExplanation: AgronomicDecisionExplanation = {
    source: 'irrigation',
    focus: 'water',
    score: 84,
    confidence: 0.86,
    urgencyLabel: 'immediate',
    isCriticalStage: true,
    profileResolution: {
      profileId: 'vineyard_quality',
      profileLabel: 'Vigneto qualita',
      resolutionSource: 'fallback',
      matchedBy: 'vineyard_quality',
      warnings: [],
    },
    signals: {
      availableSignals: ['weather_current', 'soil_moisture_30cm'],
      requiredP0Signals: ['weather_current', 'soil_moisture_30cm'],
      coveredP0Signals: ['weather_current', 'soil_moisture_30cm'],
      missingP0Signals: [],
      coverageRatio: 1,
    },
    measuredFeedbackSummary: null,
    economicSummary: null,
    environmentalSummary: null,
    agronomicRationale: ['Deficit idrico persistente sul filare prioritario.'],
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
      siteOperationalProfile: {
        altitudeMeters: 420,
        dailySunHours: 7.8,
        aspectDirection: 'South',
        windProtection: 'Low',
        exposureClass: 'exposed',
      },
    },
    contextRationale: ['Profilo di vigneto orientato alla qualita.'],
  }

  const queueItem: AgronomicActionQueueItem = {
    id: 'irrigation:vine-row-1',
    source: 'irrigation',
    title: 'Irrigazione Filare Vigna 1',
    description: 'Apri il turno irriguo sul filare principale prima del picco termico.',
    scopeLabel: 'Filare Vigna 1',
    focus: 'water',
    priorityScore: 84,
    priorityConfidence: 0.86,
    agronomicProfileId: 'vineyard_quality',
    missingSignals: [],
    urgencyLabel: 'immediate',
    metadata: {
      refinedContext: decisionExplanation.refinedContext,
      decisionExplanation,
      economicSummary: null,
    },
  }

  const draft = buildAgronomicQueueTaskDrafts('garden-1', [queueItem], [])[0]
  const mockStorage = {
    async getTask(id: string) {
      return id === 'task-1' ? { id, ...draft.task } : null
    },
  }

  const result = await loadTaskExecutionBannerDetails(mockStorage, 'task-1')

  assert.equal(result?.operationalSummary?.readiness, 'ready')
  assert.equal(result?.operationalSummary?.urgencyLabel, 'Urgente oggi')
  assert.equal(result?.operationalSummary?.contextLabels.includes('Cultivar Sangiovese'), true)
  assert.equal(result?.operationalSummary?.contextLabels.includes('Orientamento South'), true)
  assert.equal(result?.operationalSummary?.contextLabels.includes('Vento Low'), true)
  assert.deepEqual(result?.mobileSummaryChips, [
    'Esegui ora',
    'Focus acqua',
    'Urgente oggi',
    'Registra ora esecuzione + litri o durata',
  ])
  assert.match(result?.operationalSummary?.primaryRationale || '', /Deficit idrico persistente/i)
  assert.match(result?.visibleNotes || '', /turno irriguo/i)
})
