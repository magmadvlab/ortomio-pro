import assert from 'node:assert/strict'
import test from 'node:test'

import { evaluateWeatherRisks } from '../../logic/weatherDecisionEngine'
import { generateWeatherAlerts } from '../../services/weatherService'

test('distingue pioggia abbondante da rischio di allagamento rapido', () => {
  const heavyRain = evaluateWeatherRisks({
    precipitationTotalMm: 42,
    maxHourlyPrecipitationMm: 18,
  })
  const flashFlood = evaluateWeatherRisks({
    precipitationTotalMm: 90,
    maxHourlyPrecipitationMm: 34,
  })

  assert.equal(heavyRain[0].hazard, 'heavy_rain')
  assert.match(heavyRain[0].action, /drenaggi/i)
  assert.equal(flashFlood[0].hazard, 'flash_flood')
  assert.match(flashFlood[0].safetyNotice || '', /non sostituisce l’allerta idraulica ufficiale/i)
})

test('il codice WMO con grandine produce protezione e istruzioni di sicurezza mirate', () => {
  const alerts = evaluateWeatherRisks({ weatherCodes: [96], windGustMaxKmh: 55 })
  const hail = alerts.find((alert) => alert.hazard === 'hail')

  assert.ok(hail)
  assert.equal(hail.severity, 'HIGH')
  assert.match(hail.action, /reti antigrandine/i)
  assert.match(hail.steps.join(' '), /edificio|veicolo chiuso/i)
})

test('instabilità e raffiche segnalano scenario convettivo senza fingere di prevedere una tromba d’aria', () => {
  const alerts = evaluateWeatherRisks({ capeMaxJkg: 1900, windGustMaxKmh: 78 })
  const storm = alerts.find((alert) => alert.hazard === 'severe_thunderstorm')

  assert.ok(storm)
  assert.equal(storm.confidence, 'MEDIUM')
  assert.match(storm.steps.join(' '), /trombe d’aria non sono localizzabili con precisione/i)
  assert.match(storm.safetyNotice || '', /non una previsione puntuale/i)
})

test('le raffiche violente generano una procedura diversa dal semplice vento forte', () => {
  const alerts = evaluateWeatherRisks({ windSpeedMaxKmh: 55, windGustMaxKmh: 105 })
  const wind = alerts.find((alert) => alert.hazard === 'violent_wind')

  assert.ok(wind)
  assert.match(wind.action, /sospendi il lavoro all’aperto/i)
  assert.match(wind.steps.join(' '), /serre|tunnel/i)
})

test('analizza le prossime 72 ore e conserva per ogni rischio l’evento più grave', () => {
  const alerts = generateWeatherAlerts([
    { date: '2026-07-17', temp_max: 32, temp_min: 20 },
    { date: '2026-07-18', temp_max: 40, temp_min: 23 },
    { date: '2026-07-19', temp_max: 36, temp_min: 22 },
  ])

  assert.equal(alerts.length, 1)
  assert.equal(alerts[0].hazard, 'heat')
  assert.equal(alerts[0].dayOffset, 1)
  assert.match(alerts[0].message, /^Domani:/)
  assert.match(alerts[0].message, /40°C/)
})
