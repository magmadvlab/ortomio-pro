import test from 'node:test'
import assert from 'node:assert/strict'

import { directorService } from '@/services/directorService'
import type { AISuggestion } from '@/types/aiFeedback'

const baseSuggestion: AISuggestion = {
  id: 'suggestion-1',
  user_id: 'user-1',
  garden_id: 'garden-1',
  suggestion_type: 'DISEASE_PREVENTION',
  context: 'Broccoli',
  title: 'Controllare pressione fungina su broccoli',
  description: 'La pressione microclimatica sta aumentando nella coltura di broccoli.',
  reasoning: 'Serve una risposta coerente con il contesto operativo reale.',
  data_sources: [],
  prediction_data: {
    confidence: 0.72,
    riskLevel: 'HIGH',
  },
  confidence_score: 0.72,
  suggested_action: 'Verificare e trattare la zona piu esposta.',
  action_priority: 'HIGH',
  suggested_parameters: {},
  expected_outcomes: [],
  status: 'PENDING',
  created_at: '2026-04-01T08:00:00.000Z',
  metadata: {
    cropName: 'broccoli',
  },
}

test('director suggestionToAction carries operational context into economic comparison', () => {
  const protectedAction = (directorService as any).suggestionToAction({
    ...baseSuggestion,
    metadata: {
      ...baseSuggestion.metadata,
      cultivarId: 'broccoli_calabrese',
      cropVariety: 'Broccolo Calabrese',
      gardenType: 'Greenhouse',
    },
  })
  const openFieldAction = (directorService as any).suggestionToAction({
    ...baseSuggestion,
    id: 'suggestion-2',
    metadata: {
      ...baseSuggestion.metadata,
      gardenType: 'Open Field',
    },
  })

  assert.equal(protectedAction.operationalContextTags?.includes('protected_culture'), true)
  assert.equal(openFieldAction.operationalContextTags?.includes('open_field'), true)
  assert.equal(protectedAction.refinedContext?.subSystemContext?.systemType, 'protected_culture')
  assert.equal(openFieldAction.refinedContext?.subSystemContext?.systemType, 'open_field')
  assert.equal(protectedAction.refinedContext?.cultivarContext?.cultivarId, 'broccoli_calabrese')
  assert.equal(protectedAction.refinedContext?.cultivarContext?.cultivarLabel, 'Broccolo Calabrese')
  assert.ok(
    (protectedAction.economicSummary?.actionComparison?.dominanceMargin || 0) >
      (openFieldAction.economicSummary?.actionComparison?.dominanceMargin || 0)
  )
  assert.equal(protectedAction.actionComparisonExplanation?.length > 0, true)
  assert.equal(protectedAction.decisionExplanation?.source, 'director')
  assert.equal(protectedAction.decisionExplanation?.profileResolution?.profileId, 'field_brassicas')
  assert.equal(
    protectedAction.decisionExplanation?.refinedContext?.subSystemContext?.systemType,
    'protected_culture'
  )
  assert.ok(
    protectedAction.decisionExplanation?.contextRationale?.some((entry) =>
      entry.includes('Sottosistema: protected_culture.')
    )
  )
  assert.ok(
    (protectedAction.decisionExplanation?.signals.requiredP0Signals.length || 0) >=
      (openFieldAction.decisionExplanation?.signals.coveredP0Signals.length || 0)
  )
})
