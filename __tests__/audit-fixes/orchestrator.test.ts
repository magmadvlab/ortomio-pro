import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPredictionBundle, compareRecordedWater, resolveHarvestWindow, selectDatedForecast, type CanonicalPredictionInput } from '@/services/agronomicPredictionPipelineService'
import { directorService, summarizeDiaryTracking } from '@/services/directorService'
import type { dailyDiaryService } from '@/services/dailyDiaryService'
import type { PersistedForecastSnapshot } from '@/types/environmental'

const asOf = new Date('2026-11-18T15:00:00.000Z')
const plant: CanonicalPredictionInput['plants'][number] = {
  plantId: 'p1', plantName: 'Pomodoro', healthScore: 80, growthStage: 'growing',
  stressIndicators: [], diseases: [], pests: [], lastUpdate: asOf.toISOString(),
  nutritionalStatus: { nitrogen: 'ADEQUATE', phosphorus: 'ADEQUATE', potassium: 'ADEQUATE' },
  plantingDate: '2026-10-01', cycle: { minDays: 75, maxDays: 85, ruleId: 'fixture-approved-cycle' },
}
const input: CanonicalPredictionInput = {
  gardenId: 'g1', asOf: asOf.toISOString(), plants: [plant], tasks: [],
  weather: { temperature: { current: 22, min: 15, max: 28, forecast15Days: [] }, humidity: 85,
    precipitation: { current: 0, forecast15Days: [] }, windSpeed: 3, pressure: 1013, uvIndex: 3, soilTemperature: 19 },
  soil: { ph: 6.5, ec: 1, moisture: 65, temperature: 19, nutrients: { nitrogen: 1, phosphorus: 1, potassium: 1, organicMatter: 4 }, compaction: 0, lastAnalysis: '2026-11-17' },
  provenance: { weatherRecordedAt: '2026-11-18T10:00:00Z', soilRecordedAt: '2026-11-17T00:00:00Z', plantRecordedAt: plant.lastUpdate, sensorBacked: true },
}

test('briefing consumes the real diary contract and reports dimensionless worst-crop stress', () => {
  type Entry = Awaited<ReturnType<typeof dailyDiaryService.getDailyEntry>>
  const entry = { weather: { temp_max: 39, temp_min: 1, precipitation_mm: 40 }, tracking: [
    { cultivation_id: 'a', heat_stress_index: 0.1, water_stress_index: 0.2 },
    { cultivation_id: 'b', heat_stress_index: 0.8, water_stress_index: 0.9 },
  ], events: [] } as Entry
  const director = directorService as unknown as {
    generateRecommendations(entry: Entry, actions: unknown[]): string[]
    generateSummary(entry: Entry, actions: unknown[], stats: { criticalCount: number; highCount: number }): string
  }
  const recommendations = director.generateRecommendations(entry, [])
  assert.equal(recommendations.length, 5)
  assert.match(recommendations.join(' '), /Pioggia abbondante nel diario/)
  assert.doesNotMatch(recommendations.join(' '), /Pioggia abbondante prevista/)
  assert.match(director.generateSummary(entry, [], { criticalCount: 0, highCount: 0 }), /1°-39°C.*40mm/)
  assert.deepEqual(summarizeDiaryTracking(entry.tracking), { heat_stress_index: 0.8, water_stress_index: 0.9, cultivationCount: 2 })
  assert.equal(summarizeDiaryTracking([]).heat_stress_index, undefined)
})

test('historical rain is never a forecast; snapshots require dates, freshness and real source', () => {
  const history = { log_date: '2026-11-17', precipitation_mm: 100 }
  assert.deepEqual(selectDatedForecast([history], asOf), [])
  const forecast: PersistedForecastSnapshot = { forecastDate: '2026-11-19', generatedFromDate: '2026-11-18', generatedAt: '2026-11-18T10:00:00Z', daysAhead: 1, source: 'open_meteo_forecast', confidence: 'medium', tempMin: 10, tempMax: 20, precipitationMm: 3 }
  const rows = [{ ...history, raw_data: { forecastSnapshots: [
    forecast, { ...forecast, precipitationMm: 5, generatedAt: '2026-11-18T11:00:00Z' },
    { ...forecast, forecastDate: '2026-11-17' }, { ...forecast, source: 'synthetic_fallback', precipitationMm: 999 },
    { ...forecast, generatedAt: '2026-11-20T00:00:00Z' }, { ...forecast, generatedAt: '2026-11-10T00:00:00Z' },
  ] } }]
  const selected = selectDatedForecast(rows, asOf)
  assert.equal(selected.length, 1); assert.equal(selected[0].precipitationMm, 5)
})

test('harvest window remains anchored across recalculation, distinguishes recorded dates and missing cycles', () => {
  const first = buildPredictionBundle(input).yieldPredictions[0]
  const later = buildPredictionBundle({ ...input, asOf: '2026-11-28T15:00:00Z' }).yieldPredictions[0]
  assert.deepEqual(first.harvestWindow, later.harvestWindow)
  assert.equal(first.harvestWindow.optimal, '2026-12-20')
  assert.equal(resolveHarvestWindow({ ...plant, cycle: undefined }), null)
  const recorded = { ...plant, expectedHarvestDate: '2026-12-15' }
  assert.equal(resolveHarvestWindow(recorded, 1000)?.optimal, '2026-12-15')
  assert.equal(resolveHarvestWindow({ ...plant, plantingDate: '2026-02-30' }), null)
})

test('actual irrigation comparison is scoped to closed days and matching zone requirements', () => {
  const logs = [
    { id: 'old', zone_id: 'z', date: '2025-01-01', liters_applied: 1000, completed: true },
    { id: 'today', zone_id: 'z', date: '2026-11-18', liters_applied: 1000, completed: true },
    { id: 'cancelled', zone_id: 'z', date: '2026-11-17', liters_applied: 1000, completed: false },
    { id: 'real', zone_id: 'z', date: '2026-11-17', liters_applied: 100, completed: true },
  ]
  const requirements = [{ zone_id: 'z', calculation_date: '2026-11-17', recommended_volume_liters: 70, created_at: '2026-11-17T10:00:00Z' }]
  const comparison = compareRecordedWater([...logs, logs[3]], requirements, '2026-11-03', '2026-11-17')!
  assert.equal(comparison.actualLiters, 100); assert.equal(comparison.requiredLiters, 70)
  const result = buildPredictionBundle({ ...input, waterComparison: comparison }).resourceOptimizations[0]
  assert.equal(result.savings.amount, 30); assert.equal(result.savings.cost, null)
  assert.equal(result.comparisonKind, 'historical_requirement')
  assert.equal(compareRecordedWater(logs, [], '2026-11-03', '2026-11-17'), undefined)
  assert.deepEqual(buildPredictionBundle(input).resourceOptimizations, [])
})

test('missing or invalid timestamps cannot become fresh data or a measured prediction bundle', () => {
  const fresh = buildPredictionBundle(input)
  const missing = buildPredictionBundle({ ...input, provenance: { sensorBacked: true } })
  assert.equal(fresh.sourceQuality, 'mixed')
  assert.equal(missing.sourceQuality, 'estimated')
  assert.ok(missing.confidence! < fresh.confidence!)
  assert.ok(missing.missingSignals.includes('source_timestamps'))
  const invalid = buildPredictionBundle({ ...input, provenance: { ...input.provenance, weatherRecordedAt: 'invalid', soilRecordedAt: '2030-01-01' } })
  assert.ok(Number.isFinite(invalid.confidence))
  assert.ok(invalid.missingSignals.includes('source_timestamps'))
})
