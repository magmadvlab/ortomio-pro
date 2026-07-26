import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(
  resolve(process.cwd(), 'services/weatherService.ts'),
  'utf8',
)

test('weather service never fabricates seasonal or random forecast data', () => {
  assert.doesNotMatch(source, /getFallbackWeatherData/)
  assert.doesNotMatch(source, /Math\.random\(\)/)
  assert.doesNotMatch(source, /synthetic_fallback/)
  assert.doesNotMatch(source, /fallback_estimated/)
  assert.match(source, /throw new Error\('Dati meteo non disponibili/)
  assert.match(source, /throw new Error\(`Dati meteo non disponibili per \$\{targetDate\}`/)
  assert.match(source, /throw new Error\('Posizione meteo non disponibile'\)/)
})
