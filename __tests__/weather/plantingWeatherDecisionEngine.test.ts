import assert from 'node:assert/strict'
import test from 'node:test'

import { assessPlantingWeatherWindow } from '../../logic/plantingWeatherDecisionEngine'

const baseForecast = Array.from({ length: 7 }, (_, index) => ({
  date: `2026-06-${String(17 + index).padStart(2, '0')}`,
  temp_min: 17,
  temp_max: 29,
  precipitation: 0,
  max_hourly_precipitation: 0,
  wind_speed: 12,
  wind_gusts: 24,
  weathercode: 1,
}))

test('rimanda la semina della zucca se la finestra 19-21 giugno è sfavorevole', () => {
  const forecast = baseForecast.map((day) =>
    day.date === '2026-06-20'
      ? { ...day, precipitation: 42, max_hourly_precipitation: 18, weathercode: 95 }
      : day
  )

  const result = assessPlantingWeatherWindow({
    operation: 'direct_sowing',
    requestedDate: '2026-06-19',
    forecast,
    cropMinTemperature: 12,
    cropMaxTemperature: 35,
  })

  assert.equal(result.status, 'POSTPONE')
  assert.equal(result.recommendedDate, '2026-06-21')
  assert.match(result.reasons.join(' '), /2026-06-20.*Piogge abbondanti/i)
})

test('per il trapianto considera anche i due giorni di attecchimento e le raffiche', () => {
  const forecast = baseForecast.map((day) =>
    day.date === '2026-06-20' ? { ...day, wind_gusts: 58 } : day
  )
  const result = assessPlantingWeatherWindow({
    operation: 'transplant',
    requestedDate: '2026-06-19',
    forecast,
  })

  assert.equal(result.status, 'POSTPONE')
  assert.match(result.reasons.join(' '), /raffiche 58 km\/h/i)
})

test('approva solo quando tutti e tre i giorni sono compatibili', () => {
  const result = assessPlantingWeatherWindow({
    operation: 'direct_sowing',
    requestedDate: '2026-06-19',
    forecast: baseForecast,
    cropMinTemperature: 12,
  })

  assert.equal(result.status, 'GO')
  assert.deepEqual(result.evaluatedDates, ['2026-06-19', '2026-06-20', '2026-06-21'])
})

test('non inventa una valutazione per date fuori dall’orizzonte disponibile', () => {
  const result = assessPlantingWeatherWindow({
    operation: 'direct_sowing',
    requestedDate: '2026-07-19',
    forecast: baseForecast,
  })

  assert.equal(result.status, 'UNVERIFIED')
  assert.equal(result.recommendedDate, undefined)
})
