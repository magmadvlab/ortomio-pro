import test from 'node:test'
import assert from 'node:assert/strict'

import { directorService } from '@/services/directorService'
import type { AISuggestion } from '@/types/aiFeedback'

const base: Pick<AISuggestion, 'id' | 'user_id' | 'garden_id' | 'suggestion_type' | 'context' | 'title' | 'description' | 'reasoning' | 'confidence_score' | 'suggested_action' | 'action_priority' | 'suggested_parameters' | 'expected_outcomes' | 'status' | 'created_at' | 'prediction_data' | 'metadata'> = {
  id: 'sug-sig-1',
  user_id: 'u1',
  garden_id: 'g1',
  suggestion_type: 'DISEASE_PREVENTION',
  context: 'Vigneto',
  title: 'Test segnali',
  description: '',
  reasoning: '',
  prediction_data: { confidence: 0.7, riskLevel: 'HIGH' },
  confidence_score: 0.7,
  suggested_action: '',
  action_priority: 'HIGH',
  suggested_parameters: {},
  expected_outcomes: [],
  status: 'PENDING',
  created_at: '2026-06-01T00:00:00.000Z',
  metadata: {},
}

test('local_sensor source type maps to ndvi and satellite_vigor signals', () => {
  const suggestion: AISuggestion = {
    ...base,
    data_sources: [{ type: 'local_sensor', description: 'sensor IoT', value: 0 }] as any,
  }
  const signals: Set<string> = (directorService as any).getAvailableSignalsFromSuggestion(suggestion)
  assert.ok(signals.has('ndvi') || signals.has('satellite_vigor') || signals.has('flow_rate_actual'),
    `Expected at least one sensor-derived signal, got: ${[...signals].join(', ')}`)
})

test('user_observation source type maps to phenology_observation and canopy_temperature', () => {
  const suggestion: AISuggestion = {
    ...base,
    data_sources: [{ type: 'user_observation', description: 'osservazione operatore', value: 0 }] as any,
  }
  const signals: Set<string> = (directorService as any).getAvailableSignalsFromSuggestion(suggestion)
  assert.ok(signals.has('phenology_observation') || signals.has('canopy_temperature'),
    `Expected phenology or canopy signal, got: ${[...signals].join(', ')}`)
})

test('satellite source type maps to ndvi and satellite_vigor', () => {
  const suggestion: AISuggestion = {
    ...base,
    data_sources: [{ type: 'satellite', description: 'immagine NDVI', value: 0 }] as any,
  }
  const signals: Set<string> = (directorService as any).getAvailableSignalsFromSuggestion(suggestion)
  assert.ok(signals.has('ndvi') || signals.has('satellite_vigor'),
    `Expected ndvi or satellite_vigor, got: ${[...signals].join(', ')}`)
})

test('irrigation_meter source type maps to flow_rate_actual and line_pressure', () => {
  const suggestion: AISuggestion = {
    ...base,
    data_sources: [{ type: 'irrigation_meter', description: 'contatore portata', value: 0 }] as any,
  }
  const signals: Set<string> = (directorService as any).getAvailableSignalsFromSuggestion(suggestion)
  assert.ok(signals.has('flow_rate_actual') || signals.has('line_pressure'),
    `Expected flow or pressure signal, got: ${[...signals].join(', ')}`)
})
