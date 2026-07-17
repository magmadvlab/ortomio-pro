import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { NextRequest } from 'next/server'
import { POST as predictionPost, GET as predictionGet } from '@/app/api/ai/predictions/route'
import { buildPredictionBundle, hashPredictionInput, type CanonicalPredictionInput } from '@/services/agronomicPredictionPipelineService'
import { calculatePredictionOutcomeMetrics } from '@/services/predictionOutcomeService'
import { buildHealthAlertFingerprint, checkHealthAlerts } from '@/services/healthAlertEngine'
import { confidenceForMonitoringSource, monitoringRunKey, monitoringTaskSourceKey } from '@/services/healthMonitoringPolicyService'

const input: CanonicalPredictionInput = {
  gardenId: 'garden-a',
  asOf: '2026-07-17T10:00:00.000Z',
  weather: {
    temperature: { current: 22, min: 17, max: 27, forecast15Days: [22, 23] },
    humidity: 84,
    precipitation: { current: 0, forecast15Days: [0, 2] },
    windSpeed: 5,
    pressure: 1013,
    uvIndex: 4,
    soilTemperature: 20,
  },
  soil: {
    ph: 6.7,
    ec: 1.1,
    moisture: 82,
    temperature: 20,
    nutrients: { nitrogen: 30, phosphorus: 20, potassium: 40, organicMatter: 4 },
    compaction: 0,
    lastAnalysis: '2026-07-16',
  },
  plants: [{
    plantId: 'plant-a', plantName: 'Pomodoro', variety: 'San Marzano', healthScore: 65,
    growthStage: 'growing', stressIndicators: [], diseases: [], pests: [],
    nutritionalStatus: { nitrogen: 'ADEQUATE', phosphorus: 'ADEQUATE', potassium: 'ADEQUATE' },
    lastUpdate: '2026-07-17T09:00:00.000Z',
  }],
  tasks: [],
  provenance: {
    weatherRecordedAt: '2026-07-17T08:00:00.000Z',
    soilRecordedAt: '2026-07-16T12:00:00.000Z',
    plantRecordedAt: '2026-07-17T09:00:00.000Z',
    sensorBacked: true,
  },
}

test('same canonical prediction input produces the same hash and output', () => {
  const reordered = JSON.parse(JSON.stringify(input)) as CanonicalPredictionInput
  reordered.provenance = { sensorBacked: true, plantRecordedAt: input.provenance.plantRecordedAt, soilRecordedAt: input.provenance.soilRecordedAt, weatherRecordedAt: input.provenance.weatherRecordedAt }
  assert.equal(hashPredictionInput(input), hashPredictionInput(reordered))
  assert.deepEqual(buildPredictionBundle(input), buildPredictionBundle(reordered))
})

test('missing persisted signals returns insufficient_data without fabricated forecasts', () => {
  const bundle = buildPredictionBundle({ ...input, weather: undefined, soil: undefined, plants: [] })
  assert.equal(bundle.status, 'insufficient_data')
  assert.equal(bundle.confidence, null)
  assert.deepEqual(bundle.diseasePredicitions, [])
  assert.deepEqual(bundle.yieldPredictions, [])
  assert.deepEqual(bundle.resourceOptimizations, [])
  assert.deepEqual(bundle.missingSignals.sort(), ['observed_plant_health', 'persisted_weather', 'soil_analysis_and_moisture'])
})

test('prediction outcomes calculate reproducible yield and disease calibration', () => {
  const output = buildPredictionBundle(input) as unknown as Record<string, any>
  const yieldItem = output.yieldPredictions[0]
  const yieldMetrics = calculatePredictionOutcomeMetrics(output, 'yield', { predictionItemId: yieldItem.id, yieldKgPerSqm: yieldItem.expectedYield + 1 })
  assert.equal(yieldMetrics.absoluteError, 1)
  assert.ok((yieldMetrics.calibrationScore ?? 0) >= 0 && (yieldMetrics.calibrationScore ?? 0) <= 1)
  const diseaseItem = output.diseasePredicitions[0]
  const diseaseMetrics = calculatePredictionOutcomeMetrics(output, 'disease', { predictionItemId: diseaseItem.id, occurred: true })
  assert.equal(diseaseMetrics.brierScore, Number(((diseaseItem.probability - 1) ** 2).toFixed(4)))
})

test('health alerts are deterministic, deduplicated and expose evidence metadata', async () => {
  const context = {
    garden: { id: 'garden-a' },
    checkedAt: '2026-07-17T10:00:00.000Z',
    tasks: [{ id: 'task-a', gardenId: 'garden-a', plantName: 'Pomodoro', taskType: 'Transplant', date: '2026-07-10', completed: false }],
    weather: { temp: 22, humidity: 85, rainTomorrow: true, rainMm: 8, windSpeed: 18, recordedAt: '2026-07-17T09:00:00.000Z' },
    environmentalHistorySummary: { entries: 10, highDiseasePressureDays: 3, highSoilWaterStressDays: 0, deficitWaterBalanceDays: 0 },
    productAvailability: 'unavailable' as const,
    nextHarvestDate: '2026-07-20',
  }
  const first = await checkHealthAlerts(context)
  const second = await checkHealthAlerts(context)
  assert.deepEqual(first, second)
  assert.equal(new Set(first.map(alert => alert.metadata?.fingerprint)).size, first.length)
  assert.ok(first.every(alert => alert.metadata?.ruleVersion && alert.metadata?.inputSnapshot))
  assert.ok(first.some(alert => alert.metadata?.contraindications.includes('vento_elevato_no_applicazione_fogliare')))
})

test('monitoring keys remain stable and simulated data cannot boost confidence', () => {
  const at = new Date('2026-07-17T10:00:00.000Z')
  assert.equal(monitoringRunKey('garden-a', at), monitoringRunKey('garden-a', new Date('2026-07-17T11:59:00.000Z')))
  assert.equal(monitoringTaskSourceKey('fingerprint-a'), 'monitoring:fingerprint-a')
  assert.equal(confidenceForMonitoringSource('simulated', 0.99), 0.35)
  assert.equal(confidenceForMonitoringSource('predicted', 0.99), 0.85)
  assert.equal(confidenceForMonitoringSource('observed', 0.95), 0.95)
})

test('prediction routes are server-authorized and GET mock generation stays disabled', () => {
  const route = readFileSync('app/api/ai/predictions/route.ts', 'utf8')
  assert.match(route, /requireGardenAccess\(request, gardenId\)/)
  assert.match(route, /loadCanonicalPredictionInput\(supabase, gardenId\)/)
  assert.doesNotMatch(route, /body\.(weatherData|soilData|plantHealthData|tasks)/)
  assert.match(route, /status: 405/)
})

test('anonymous prediction requests are rejected and GET returns method not allowed', async () => {
  const request = new NextRequest(new Request('http://localhost/api/ai/predictions', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ gardenId: 'garden-a' }),
  }))
  assert.equal((await predictionPost(request)).status, 401)
  assert.equal((await predictionGet()).status, 405)
})
