import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildHealthMicroclimateSnapshot,
  describeMicroclimateSignals,
  healthRiskLevelToScore,
} from '@/services/healthMicroclimateService'
import type { SensorReading } from '@/services/sensorDataService'

const createReading = (
  sensor_type: SensorReading['sensor_type'],
  value: number,
  overrides: Partial<SensorReading> = {}
): SensorReading => ({
  garden_id: 'garden-1',
  sensor_type,
  value,
  unit: overrides.unit ?? 'unit',
  reading_date: overrides.reading_date ?? '2026-03-20T10:00:00.000Z',
  ...overrides,
})

test('microclimate snapshot raises high fungal pressure when leaf wetness, humidity and dew point are favorable', () => {
  const snapshot = buildHealthMicroclimateSnapshot(
    { id: 'garden-1' },
    {
      leafWetness: createReading('leaf_wetness', 82, { unit: '%' }),
      dewPoint: createReading('dew_point', 16, { unit: 'C' }),
      vpd: createReading('vpd', 0.8, { unit: 'kPa' }),
      rainGaugeLocal: createReading('rain_gauge_local', 3.1, { unit: 'mm' }),
      airHumidity: createReading('humidity_air', 91, { unit: '%' }),
      airTemperature: createReading('temperature_air', 18, { unit: 'C' }),
    },
    { zoneId: 'zone-1' },
    { scopeType: 'zone', scopeId: 'zone-1', deviceIds: ['sensor-zone-1'] }
  )

  assert.equal(snapshot.fungalPressure, 'high')
  assert.equal(snapshot.hasRecentData, true)
  assert.equal(snapshot.resolutionScopeType, 'zone')
  assert.equal(snapshot.resolutionScopeId, 'zone-1')
  assert.deepEqual(snapshot.matchedDeviceIds, ['sensor-zone-1'])
  assert.equal(snapshot.metrics.dewPointSpreadC, 2)
  assert.ok(describeMicroclimateSignals(snapshot).includes('bagnatura fogliare 82%'))
  assert.equal(healthRiskLevelToScore(snapshot.fungalPressure), 3)
})

test('microclimate snapshot raises high water and heat stress when soil tension, canopy delta and VPD are severe', () => {
  const snapshot = buildHealthMicroclimateSnapshot(
    { id: 'garden-1' },
    {
      vpd: createReading('vpd', 2.6, { unit: 'kPa' }),
      airTemperature: createReading('temperature_air', 35, { unit: 'C' }),
      canopyTemperature: createReading('canopy_temperature', 40, { unit: 'C' }),
      soilMoisture10cm: createReading('soil_moisture_10cm', 22, { unit: '%' }),
      soilMoisture30cm: createReading('soil_moisture_30cm', 16, { unit: '%' }),
      soilMoisture60cm: createReading('soil_moisture_60cm', 18, { unit: '%' }),
      soilTensionKpa: createReading('soil_tension_kpa', 145, { unit: 'kPa' }),
    },
    { fieldRowId: 'row-7' },
    { scopeType: 'field_row', scopeId: 'row-7', deviceIds: ['sensor-row-7'] }
  )

  assert.equal(snapshot.waterStress, 'high')
  assert.equal(snapshot.heatStress, 'high')
  assert.equal(snapshot.metrics.canopyDeltaC, 5)
  assert.equal(snapshot.metrics.soilTensionKpa, 145)
  assert.ok(snapshot.supportingSignals.includes('tensione suolo 145 kPa'))
  assert.ok(snapshot.supportingSignals.includes('delta chioma-aria 5.0°C'))
})

test('microclimate snapshot stays low-risk when only a weak superficial dryness signal is present', () => {
  const snapshot = buildHealthMicroclimateSnapshot(
    { id: 'garden-1' },
    {
      soilMoisture10cm: createReading('soil_moisture_10cm', 27, { unit: '%' }),
      airTemperature: createReading('temperature_air', 24, { unit: 'C' }),
    },
    { zoneId: 'zone-2' }
  )

  assert.equal(snapshot.fungalPressure, 'none')
  assert.equal(snapshot.waterStress, 'low')
  assert.equal(snapshot.heatStress, 'none')
})
