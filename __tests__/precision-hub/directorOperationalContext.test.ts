import test from 'node:test'
import assert from 'node:assert/strict'

import { directorService } from '@/services/directorService'
import type { AISuggestion } from '@/types/aiFeedback'
import type { Garden } from '@/types'

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

test('director suggestionToAction enriches actions with garden wizard site context', () => {
  const mountainOpenFieldGarden: Garden = {
    id: 'garden-1',
    name: 'Campo montano',
    sizeSqMeters: 1200,
    createdAt: '2026-04-01T08:00:00.000Z',
    gardenType: 'OpenField',
    soilType: 'Clay',
    soilPh: 6.2,
    altitudeMeters: 980,
    sunExposure: 'PartSun',
    dailySunHours: 5.5,
    aspectDirection: 'East',
    windProtection: 'Low',
    obstacles: [
      {
        azimuth: 135,
        height: 8,
        distance: 14,
        widthDegrees: 28,
        type: 'Tree',
      },
    ],
  }

  const action = (directorService as any).suggestionToAction(
    {
      ...baseSuggestion,
      id: 'suggestion-mountain-field',
      metadata: {
        ...baseSuggestion.metadata,
        gardenType: undefined,
      },
    },
    mountainOpenFieldGarden
  )

  assert.equal(action.operationalContextTags?.includes('open_field'), true)
  assert.equal(action.operationalContextTags?.includes('high_altitude_site'), true)
  assert.equal(action.refinedContext?.subSystemContext?.systemType, 'open_field')
  assert.equal(action.refinedContext?.siteOperationalProfile?.altitudeMeters, 980)
  assert.equal(action.refinedContext?.siteOperationalProfile?.soilType, 'Clay')
  assert.equal(action.refinedContext?.siteOperationalProfile?.soilPh, 6.2)
  assert.equal(action.refinedContext?.siteOperationalProfile?.dailySunHours, 5.5)
  assert.equal(action.refinedContext?.siteOperationalProfile?.shadowObstaclesCount, 1)
  assert.ok(
    action.decisionExplanation?.contextRationale?.some((entry: string) =>
      entry.includes('Altitudine sito: 980 m.')
    )
  )
  assert.ok(
    action.decisionExplanation?.contextRationale?.some((entry: string) =>
      entry.includes('Ombre considerate: 1 ostacoli.')
    )
  )
})
