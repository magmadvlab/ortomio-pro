// Read-only diagnostic probes. These assertions document current defects,
// not the behavior a regression test should preserve after fixing them.
import assert from 'node:assert/strict'
import { directorService } from '../../../services/directorService'
import { buildPredictionBundle, loadCanonicalPredictionInput } from '../../../services/agronomicPredictionPipelineService'
import { GeoExportService } from '../../../services/geoExportService'
import { readFileSync } from 'node:fs'

async function main() {
  const director = directorService as any
  const weather = { precipitation_mm: 40, temp_max: 39, temp_min: 1 }
  const canonicalRecommendations = director.generateRecommendations({ weather, tracking: [] }, [])
  const legacyRecommendations = director.generateRecommendations({ weather_data: weather }, [])
  assert.equal(canonicalRecommendations.length, 0)
  assert.equal(legacyRecommendations.length, 3)
  console.log('A01', JSON.stringify({ canonicalRecommendations, legacyRecommendations }))

  const input: any = {
    gardenId: 'audit-fixture', asOf: '2026-11-18T12:00:00Z',
    weather: { temperature: { current: 22, min: 17, max: 27, forecast15Days: [22] }, humidity: 84,
      precipitation: { current: 0, forecast15Days: [0] }, windSpeed: 5, pressure: 1013, uvIndex: 4, soilTemperature: 20 },
    soil: { ph: 6.7, ec: 1, moisture: 82, temperature: 20, nutrients: { nitrogen: 30, phosphorus: 20, potassium: 40, organicMatter: 4 }, compaction: 0, lastAnalysis: '2026-11-17' },
    plants: [{ plantId: 'plant-a', plantName: 'Pomodoro', healthScore: 65, growthStage: 'growing', lastUpdate: '2026-11-17' }],
    tasks: [{ taskType: 'Watering', quantity: 100, completed: true, date: '2025-01-01' }],
    provenance: { sensorBacked: true },
  }
  const first = buildPredictionBundle(input)
  const later = buildPredictionBundle({ ...input, asOf: '2026-11-28T12:00:00Z' })
  assert.equal((Date.parse(later.yieldPredictions[0].harvestWindow.optimal) - Date.parse(first.yieldPredictions[0].harvestWindow.optimal)) / 86400000, 10)
  assert.equal(first.confidence, 0.9)
  console.log('A03', JSON.stringify({ firstHarvest: first.yieldPredictions[0].harvestWindow, laterHarvest: later.yieldPredictions[0].harvestWindow }))
  console.log('A04', JSON.stringify({ historicCompletedTaskCounted: first.resourceOptimizations[0]?.currentUsage, confidenceWithoutSourceDates: first.confidence }))

  const tables: Record<string, any> = {
    garden_tasks: [{ id: 'task-a', garden_id: 'audit-fixture', plant_name: 'Pomodoro', task_type: 'Watering', date: '2025-01-01', completed: true, quantity: 100 }],
    daily_weather_log: [{ log_date: '2026-11-17', temperature_max: 27, temperature_min: 17, precipitation_mm: 100, raw_data: { humidity: 84 } }],
    soil_analysis: { analysis_date: '2026-11-17', ph_value: 6.7 },
    garden_plants: [{ id: 'plant-a', plant_name: 'Pomodoro', health_score: 65, status: 'growing', updated_at: '2026-11-17' }],
    sensor_readings: [{ sensor_type: 'soil_moisture', value: 82 }],
    gardens: { altitude_meters: 0 },
  }
  const fake = { from(table: string) {
    const q: any = { then(resolve: any) { return Promise.resolve({ data: tables[table], error: null }).then(resolve) } }
    for (const method of ['select','eq','neq','gte','order','limit','maybeSingle']) q[method] = () => q
    return q
  } }
  const loaded = await loadCanonicalPredictionInput(fake as any, 'audit-fixture', new Date(input.asOf))
  assert.deepEqual(loaded.weather?.precipitation.forecast15Days, [100])
  console.log('A02', JSON.stringify({ historicalDate: tables.daily_weather_log[0].log_date, asOf: loaded.asOf, forecastRain: loaded.weather?.precipitation.forecast15Days, optimizedWater: buildPredictionBundle(loaded).resourceOptimizations[0]?.optimizedUsage }))

  const exportService = new GeoExportService({} as any) as any
  const zones = [{ coordinates: [[16.6,40.3], [16.7,40.3], [16.6,40.4]] }]
  assert.deepEqual(await exportService.transformCoordinates(zones), zones)
  assert.equal(exportService.getGeoJSONCRS('UTM'), 'urn:ogc:def:crs:EPSG::32633')
  console.log('A06', JSON.stringify({ coordinatesUnchanged: true, advertisedUTM: exportService.getGeoJSONCRS('UTM') }))
  await assert.rejects(exportService.generateShapefileComponents(zones, { coordinateSystem: 'WGS84' }), /requires an audited binary encoder/)
  console.log('A07', 'Shapefile encoder always rejects even though the app selects this format by default')

  const route = readFileSync('app/api/garden/sun-exposure/planting-windows/route.ts', 'utf8')
  assert.match(route, /findPlantingWindows\(\s*classification,\s*windows,\s*lat,\s*lng,\s*obstacles,\s*targetYear\s*\)/)
  console.log('A05', 'Production planting-windows route passes neither soil type nor altitude')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
