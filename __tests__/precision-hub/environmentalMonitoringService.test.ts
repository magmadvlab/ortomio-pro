import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildEnvironmentalMonitoringSnapshot,
  buildPersistedForecastSnapshots,
  buildPersistedWeatherEnvelope,
  buildSiteWeatherBinding,
  derivePersistedWeatherLineage,
  extractGardenEnvironmentalHistory,
  extractZoneEnvironmentalHistory,
  resolvePersistedWeatherLogForDate,
  summarizeGardenEnvironmentalHistory,
  summarizeZoneEnvironmentalHistory,
  upsertZoneEnvironmentalLedger,
} from '@/services/environmentalMonitoringService'

test('buildPersistedWeatherEnvelope stores lineage and agronomic derived indicators', () => {
  const envelope = buildPersistedWeatherEnvelope(
    {
      log_date: '2026-03-20',
      temp_min: 9,
      temp_max: 24,
      temp_avg: 16.5,
      precipitation_mm: 0,
      humidity_avg: 42,
      eto_calculated: 5.6,
      weather_conditions: 'sereno',
      data_source: 'api',
      raw_data: {
        payload: { provider: 'open-meteo' },
      },
    },
    {
      recordedAt: '2026-03-20T21:00:00.000Z',
      now: new Date('2026-03-21T08:00:00.000Z'),
    }
  )

  const lineage = envelope.environmentalLineage as ReturnType<typeof derivePersistedWeatherLineage>
  const derived = envelope.derivedIndicators as {
    waterBalanceClass: string
    dryingPowerClass: string
    thermalAmplitudeC: number
  }

  assert.equal(lineage.primarySource, 'open_meteo_archive')
  assert.equal(lineage.signalClass, 'historical_archive')
  assert.equal(lineage.signalQuality, 'mixed')
  assert.equal(derived.waterBalanceClass, 'deficit')
  assert.equal(derived.dryingPowerClass, 'high')
  assert.equal(derived.thermalAmplitudeC, 15)
})

test('buildPersistedForecastSnapshots and site binding preserve canonical forecast metadata', () => {
  const snapshots = buildPersistedForecastSnapshots(
    {
      dates: ['2026-03-21', '2026-03-22', '2026-03-23'],
      tempMin: [11, 12, 14],
      tempMax: [21, 23, 24],
      precipitationMm: [0, 3, 7],
      humidityMin: [45, 52, 70],
      humidityMax: [66, 74, 88],
      windSpeedMax: [12, 18, 26],
      conditions: ['sereno', 'variabile', 'pioggia moderata'],
    },
    {
      generatedFromDate: '2026-03-21',
      generatedAt: '2026-03-21T06:00:00.000Z',
      source: 'open_meteo_forecast',
    }
  )
  const siteBinding = buildSiteWeatherBinding({
    latitude: 41.1,
    longitude: 16.8,
    slopePercentage: 14,
    sunExposure: 'full',
  })
  const envelope = buildPersistedWeatherEnvelope(
    {
      log_date: '2026-03-21',
      temp_min: 11,
      temp_max: 21,
      temp_avg: 16,
      precipitation_mm: 0,
      humidity_avg: 55,
      data_source: 'api',
      weather_conditions: 'sereno',
    },
    {
      forecastSnapshots: snapshots,
      siteWeatherBinding: siteBinding,
    }
  )

  assert.equal(snapshots.length, 3)
  assert.equal(snapshots[0]?.confidence, 'high')
  assert.equal(snapshots[2]?.confidence, 'medium')
  assert.equal((envelope.forecastSnapshots as Array<{ forecastDate: string }>)[1]?.forecastDate, '2026-03-22')
  assert.equal((envelope.siteWeatherBinding as { slopeClass: string }).slopeClass, 'steep')
  assert.equal((envelope.siteWeatherBinding as { exposureClass: string }).exposureClass, 'exposed')
})

test('buildEnvironmentalMonitoringSnapshot prefers zone sensors and exposes persisted soil-water stress', () => {
  const snapshot = buildEnvironmentalMonitoringSnapshot({
    date: '2026-03-21',
    zoneId: 'zone-1',
    weatherLog: {
      log_date: '2026-03-21',
      temp_min: 14,
      temp_max: 27,
      temp_avg: 20.5,
      precipitation_mm: 4,
      humidity_avg: 84,
      eto_calculated: 3.2,
      weather_conditions: 'pioggia moderata',
      data_source: 'api',
      raw_data: buildPersistedWeatherEnvelope(
        {
          log_date: '2026-03-21',
          temp_min: 14,
          temp_max: 27,
          temp_avg: 20.5,
          precipitation_mm: 4,
          humidity_avg: 84,
          eto_calculated: 3.2,
          weather_conditions: 'pioggia moderata',
          data_source: 'api',
        },
        {
          recordedAt: '2026-03-21T21:00:00.000Z',
          now: new Date('2026-03-21T22:00:00.000Z'),
        }
      ),
    },
    sensorReadings: [
      {
        garden_id: 'garden-1',
        zone_id: 'zone-1',
        sensor_type: 'temperature_air',
        value: 23,
        unit: 'C',
        reading_date: '2026-03-21T18:00:00.000Z',
      },
      {
        garden_id: 'garden-1',
        zone_id: 'zone-1',
        sensor_type: 'soil_moisture_30cm',
        value: 19,
        unit: '%',
        reading_date: '2026-03-21T18:05:00.000Z',
      },
    ],
    waterRequirement: {
      calculation_date: '2026-03-21',
      soil_water_deficit_mm: 28,
      available_water_mm: 35,
    },
  })

  assert.equal(snapshot.sensors.precedence, 'sensor_local')
  assert.equal(snapshot.sensors.readingCount, 2)
  assert.equal(snapshot.weather.diseasePressureClass, 'high')
  assert.equal(snapshot.soilWater.stressLevel, 'high')
  assert.equal(snapshot.weather.regionalConfidence, 'medium')
  assert.equal(snapshot.weather.localConfidence, 'high')
  assert.ok(snapshot.circulation.notes.some((note) => note.includes('Zone-local sensors')))
})

test('resolvePersistedWeatherLogForDate materializes future dates from persisted forecast snapshots', () => {
  const forecastSnapshots = buildPersistedForecastSnapshots(
    {
      dates: ['2026-03-21', '2026-03-22', '2026-03-23'],
      tempMin: [10, 12, 13],
      tempMax: [19, 22, 24],
      precipitationMm: [0, 1, 6],
      humidityMin: [45, 55, 70],
      humidityMax: [65, 75, 90],
      conditions: ['sereno', 'variabile', 'pioggia'],
    },
    {
      generatedFromDate: '2026-03-21',
      generatedAt: '2026-03-21T05:00:00.000Z',
      source: 'open_meteo_forecast',
    }
  )

  const resolved = resolvePersistedWeatherLogForDate(
    [
      {
        log_date: '2026-03-21',
        temp_min: 10,
        temp_max: 19,
        temp_avg: 14.5,
        precipitation_mm: 0,
        humidity_avg: 55,
        weather_conditions: 'sereno',
        data_source: 'api',
        raw_data: buildPersistedWeatherEnvelope(
          {
            log_date: '2026-03-21',
            temp_min: 10,
            temp_max: 19,
            temp_avg: 14.5,
            precipitation_mm: 0,
            humidity_avg: 55,
            weather_conditions: 'sereno',
            data_source: 'api',
          },
          {
            forecastSnapshots,
            siteWeatherBinding: buildSiteWeatherBinding({
              latitude: 41.1,
              longitude: 16.8,
              slopePercentage: 9,
              sunExposure: 'partial',
            }),
            now: new Date('2026-03-21T10:00:00.000Z'),
          }
        ),
      },
    ],
    '2026-03-23',
    {
      now: new Date('2026-03-21T10:00:00.000Z'),
    }
  )

  assert.ok(resolved)
  assert.equal(resolved?.log_date, '2026-03-23')
  assert.equal(resolved?.precipitation_mm, 6)
  assert.equal(
    ((resolved?.raw_data?.forecastSnapshot as { generatedFromDate?: string }) || {}).generatedFromDate,
    '2026-03-21'
  )

  const snapshot = buildEnvironmentalMonitoringSnapshot({
    date: '2026-03-23',
    weatherLog: resolved,
  })

  assert.equal(snapshot.weather.sourceClass, 'forecast')
  assert.equal(snapshot.weather.forecastDaysAhead, 2)
  assert.equal(snapshot.weather.regionalConfidence, 'medium')
  assert.equal(snapshot.weather.localConfidence, 'medium')
  assert.ok(snapshot.circulation.notes.some((note) => note.includes('Persisted forecast snapshot')))
})

test('zone environmental ledger upserts by garden-zone-date and can be extracted as history', () => {
  const baseEnvelope = buildPersistedWeatherEnvelope(
    {
      log_date: '2026-03-21',
      temp_min: 11,
      temp_max: 23,
      temp_avg: 17,
      precipitation_mm: 2,
      humidity_avg: 78,
      eto_calculated: 3.1,
      weather_conditions: 'variabile',
      data_source: 'api',
    },
    {
      recordedAt: '2026-03-21T21:00:00.000Z',
      now: new Date('2026-03-21T22:00:00.000Z'),
    }
  )

  const snapshot = buildEnvironmentalMonitoringSnapshot({
    date: '2026-03-21',
    zoneId: 'zone-1',
    weatherLog: {
      log_date: '2026-03-21',
      temp_min: 11,
      temp_max: 23,
      temp_avg: 17,
      precipitation_mm: 2,
      humidity_avg: 78,
      eto_calculated: 3.1,
      weather_conditions: 'variabile',
      data_source: 'api',
      raw_data: baseEnvelope,
    },
  })

  const withFirstEntry = upsertZoneEnvironmentalLedger(undefined, {
    gardenId: 'garden-1',
    zoneId: 'zone-1',
    zoneName: 'Zona 1',
    recordedAt: '2026-03-21T22:00:00.000Z',
    snapshot,
  })

  const withReplacementEntry = upsertZoneEnvironmentalLedger(withFirstEntry, {
    gardenId: 'garden-1',
    zoneId: 'zone-1',
    zoneName: 'Zona 1',
    recordedAt: '2026-03-21T23:00:00.000Z',
    snapshot: {
      ...snapshot,
      soilWater: {
        ...snapshot.soilWater,
        stressLevel: 'medium',
      },
    },
  })

  const history = extractZoneEnvironmentalHistory(
    [
      {
        log_date: '2026-03-21',
        raw_data: withReplacementEntry,
      },
    ],
    {
      zoneId: 'zone-1',
      gardenId: 'garden-1',
    }
  )

  assert.equal(
    Array.isArray(withReplacementEntry.zoneEnvironmentalLedger)
      ? withReplacementEntry.zoneEnvironmentalLedger.length
      : 0,
    1
  )
  assert.equal(history.length, 1)
  assert.equal(history[0]?.recordedAt, '2026-03-21T23:00:00.000Z')
  assert.equal(history[0]?.snapshot.soilWater.stressLevel, 'medium')

  const summary = summarizeZoneEnvironmentalHistory(history)
  assert.ok(summary)
  assert.equal(summary?.entries, 1)
  assert.equal(summary?.mediumSoilWaterStressDays, 1)
  assert.equal(summary?.surplusWaterBalanceDays, 0)
  assert.equal(summary?.latestSensorPrecedence, 'persisted_weather')
})

test('garden environmental history summary aggregates environmental circulation across zones', () => {
  const drySnapshot = buildEnvironmentalMonitoringSnapshot({
    date: '2026-03-22',
    zoneId: 'zone-1',
    weatherLog: {
      log_date: '2026-03-22',
      temp_min: 12,
      temp_max: 29,
      temp_avg: 20,
      precipitation_mm: 0,
      humidity_avg: 42,
      eto_calculated: 5.3,
      weather_conditions: 'sereno',
      data_source: 'api',
      raw_data: buildPersistedWeatherEnvelope({
        log_date: '2026-03-22',
        temp_min: 12,
        temp_max: 29,
        temp_avg: 20,
        precipitation_mm: 0,
        humidity_avg: 42,
        eto_calculated: 5.3,
        weather_conditions: 'sereno',
        data_source: 'api',
      }),
    },
    waterRequirement: {
      calculation_date: '2026-03-22',
      soil_water_deficit_mm: 24,
      available_water_mm: 30,
    },
  })

  const wetSnapshot = buildEnvironmentalMonitoringSnapshot({
    date: '2026-03-23',
    zoneId: 'zone-2',
    weatherLog: {
      log_date: '2026-03-23',
      temp_min: 15,
      temp_max: 22,
      temp_avg: 18,
      precipitation_mm: 8,
      humidity_avg: 89,
      eto_calculated: 2.1,
      weather_conditions: 'pioggia persistente',
      data_source: 'api',
      raw_data: buildPersistedWeatherEnvelope({
        log_date: '2026-03-23',
        temp_min: 15,
        temp_max: 22,
        temp_avg: 18,
        precipitation_mm: 8,
        humidity_avg: 89,
        eto_calculated: 2.1,
        weather_conditions: 'pioggia persistente',
        data_source: 'api',
      }),
    },
    sensorReadings: [
      {
        garden_id: 'garden-1',
        zone_id: 'zone-2',
        sensor_type: 'leaf_wetness',
        value: 78,
        unit: '%',
        reading_date: '2026-03-23T06:00:00.000Z',
      },
    ],
  })

  const history = extractGardenEnvironmentalHistory(
    [
      {
        log_date: '2026-03-22',
        raw_data: {
          zoneEnvironmentalLedger: [
            {
              gardenId: 'garden-1',
              zoneId: 'zone-1',
              recordedAt: '2026-03-22T22:00:00.000Z',
              snapshot: drySnapshot,
            },
          ],
        },
      },
      {
        log_date: '2026-03-23',
        raw_data: {
          zoneEnvironmentalLedger: [
            {
              gardenId: 'garden-1',
              zoneId: 'zone-2',
              recordedAt: '2026-03-23T22:00:00.000Z',
              snapshot: wetSnapshot,
            },
          ],
        },
      },
    ],
    {
      gardenId: 'garden-1',
    }
  )

  const summary = summarizeGardenEnvironmentalHistory(history)
  assert.ok(summary)
  assert.equal(summary?.entries, 2)
  assert.equal(summary?.trackedZones, 2)
  assert.equal(summary?.highSoilWaterStressDays, 1)
  assert.equal(summary?.highDiseasePressureDays, 1)
  assert.equal(summary?.deficitWaterBalanceDays, 1)
  assert.equal(summary?.surplusWaterBalanceDays, 1)
  assert.equal(summary?.sensorLocalDays, 1)
})
