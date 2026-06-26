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

test('local_sensor source type maps to flow_rate_actual, line_pressure, rain_gauge_local', () => {
  const suggestion: AISuggestion = {
    ...base,
    data_sources: [{ type: 'local_sensor', timestamp: '2026-06-01T00:00:00.000Z', data: {}, reliability: 1 }],
  }
  const signals: Set<string> = (directorService as any).getAvailableSignalsFromSuggestion(suggestion)
  assert.ok(signals.has('flow_rate_actual'), `Missing 'flow_rate_actual', got: ${[...signals].join(', ')}`)
  assert.ok(signals.has('line_pressure'), `Missing 'line_pressure', got: ${[...signals].join(', ')}`)
  assert.ok(signals.has('rain_gauge_local'), `Missing 'rain_gauge_local', got: ${[...signals].join(', ')}`)
})

test('user_observation source type maps to phenology_observation and canopy_temperature', () => {
  const suggestion: AISuggestion = {
    ...base,
    data_sources: [{ type: 'user_observation', timestamp: '2026-06-01T00:00:00.000Z', data: {}, reliability: 1 }],
  }
  const signals: Set<string> = (directorService as any).getAvailableSignalsFromSuggestion(suggestion)
  assert.ok(signals.has('phenology_observation'), `Missing 'phenology_observation', got: ${[...signals].join(', ')}`)
  assert.ok(signals.has('canopy_temperature'), `Missing 'canopy_temperature', got: ${[...signals].join(', ')}`)
})

test('satellite source type maps to ndvi and satellite_vigor', () => {
  const suggestion: AISuggestion = {
    ...base,
    data_sources: [{ type: 'satellite', timestamp: '2026-06-01T00:00:00.000Z', data: {}, reliability: 1 }],
  }
  const signals: Set<string> = (directorService as any).getAvailableSignalsFromSuggestion(suggestion)
  assert.ok(signals.has('ndvi'), `Missing 'ndvi', got: ${[...signals].join(', ')}`)
  assert.ok(signals.has('satellite_vigor'), `Missing 'satellite_vigor', got: ${[...signals].join(', ')}`)
})

test('irrigation_meter source type maps to flow_rate_actual and line_pressure', () => {
  const suggestion: AISuggestion = {
    ...base,
    data_sources: [{ type: 'irrigation_meter', timestamp: '2026-06-01T00:00:00.000Z', data: {}, reliability: 1 }],
  }
  const signals: Set<string> = (directorService as any).getAvailableSignalsFromSuggestion(suggestion)
  assert.ok(signals.has('flow_rate_actual'), `Missing 'flow_rate_actual', got: ${[...signals].join(', ')}`)
  assert.ok(signals.has('line_pressure'), `Missing 'line_pressure', got: ${[...signals].join(', ')}`)
})
