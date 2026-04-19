import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildWidgetForecastFromPersistedSnapshots,
  normalizeForecastEntry,
  normalizeForecastList,
} from '@/services/weatherCacheService'
import { buildPersistedForecastSnapshots } from '@/services/environmentalMonitoringService'

test('normalizeForecastEntry maps raw Open-Meteo response shape to widget forecast shape', () => {
  const normalized = normalizeForecastEntry({
    date: new Date('2026-04-19T00:00:00.000Z'),
    temp_max: 24,
    temp_min: 12,
    precipitation: 3,
    weathercode: 61,
    wind_speed: 18,
    humidity: 72,
    condition: 'pioggia moderata',
  })

  assert.ok(normalized)
  assert.equal(normalized?.date, '2026-04-19')
  assert.equal(normalized?.temp, 18)
  assert.equal(normalized?.tempMax, 24)
  assert.equal(normalized?.tempMin, 12)
  assert.equal(normalized?.rainForecastMm, 3)
  assert.equal(normalized?.code, 61)
  assert.equal(normalized?.windSpeed, 18)
  assert.equal(normalized?.humidity, 72)
})

test('normalizeForecastList preserves widget-native cache entries', () => {
  const normalized = normalizeForecastList([
    {
      date: '2026-04-19',
      temp: 18,
      tempMax: 24,
      tempMin: 12,
      code: 3,
      rainForecastMm: 0,
      windSpeed: 10,
      humidity: 60,
      condition: 'Variabile',
    },
  ])

  assert.equal(normalized.length, 1)
  assert.equal(normalized[0]?.temp, 18)
  assert.equal(normalized[0]?.code, 3)
})

test('buildWidgetForecastFromPersistedSnapshots maps persisted forecast snapshots into widget cache entries', () => {
  const snapshots = buildPersistedForecastSnapshots(
    {
      dates: ['2026-04-19', '2026-04-20'],
      tempMin: [10, 11],
      tempMax: [22, 24],
      precipitationMm: [0, 5],
      humidityMin: [45, 60],
      humidityMax: [65, 84],
      windSpeedMax: [12, 20],
      conditions: ['sereno', 'pioggia'],
    },
    {
      generatedFromDate: '2026-04-19',
      generatedAt: '2026-04-19T06:00:00.000Z',
      source: 'open_meteo_forecast',
    }
  )

  const forecast = buildWidgetForecastFromPersistedSnapshots(snapshots)

  assert.equal(forecast.length, 2)
  assert.equal(forecast[0]?.date, '2026-04-19')
  assert.equal(forecast[0]?.temp, 16)
  assert.equal(forecast[0]?.code, 0)
  assert.equal(forecast[1]?.rainForecastMm, 5)
  assert.equal(forecast[1]?.code, 61)
})
