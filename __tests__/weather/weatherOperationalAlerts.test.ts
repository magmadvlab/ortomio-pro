import assert from 'node:assert/strict'
import test from 'node:test'

import { generateWeatherAlerts } from '../../services/weatherService'

test('caldo estremo genera una raccomandazione operativa completa', () => {
  const alerts = generateWeatherAlerts([{
    temp_max: 40,
    temp_min: 22,
    precipitation: 0,
    wind_speed: 12,
  }])

  assert.equal(alerts.length, 1)
  assert.equal(alerts[0].severity, 'HIGH')
  assert.equal(alerts[0].type, 'temperature')
  assert.match(alerts[0].message, /40°C/)
  assert.match(alerts[0].action, /ombreggiante 30–50%/)
  assert.equal(alerts[0].steps.length, 3)
  assert.ok(alerts[0].estimatedMinutes > 0)
})

test('ogni allerta meteo include azione, passaggi e durata', () => {
  const alerts = generateWeatherAlerts([{
    temp_max: 28,
    temp_min: 12,
    precipitation: 30,
    wind_speed: 60,
  }])

  assert.deepEqual(alerts.map((alert) => alert.type), ['rain', 'wind'])
  alerts.forEach((alert) => {
    assert.ok(alert.action.length > 20)
    assert.ok(alert.steps.length >= 3)
    assert.ok(alert.estimatedMinutes > 0)
  })
})
