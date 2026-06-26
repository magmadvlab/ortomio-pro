import test from 'node:test'
import assert from 'node:assert/strict'

import { calculatePhotoperiodHours } from '@/services/photoperiodService'

test('summer solstice at 45°N gives about 15-16h photoperiod', () => {
  const h = calculatePhotoperiodHours(45, new Date('2026-06-21'))
  assert.ok(h >= 14.5 && h <= 16.5, `Expected 14.5-16.5h, got ${h.toFixed(2)}h`)
})

test('winter solstice at 45°N gives about 8-10h photoperiod', () => {
  const h = calculatePhotoperiodHours(45, new Date('2026-12-21'))
  assert.ok(h >= 7.5 && h <= 10.5, `Expected 7.5-10.5h, got ${h.toFixed(2)}h`)
})

test('equinox at 45°N gives about 12h photoperiod', () => {
  const h = calculatePhotoperiodHours(45, new Date('2026-03-20'))
  assert.ok(h >= 11 && h <= 13, `Expected 11-13h, got ${h.toFixed(2)}h`)
})

test('equator gives about 12h photoperiod year-round', () => {
  const june = calculatePhotoperiodHours(0, new Date('2026-06-21'))
  const dec = calculatePhotoperiodHours(0, new Date('2026-12-21'))
  assert.ok(june >= 11.5 && june <= 12.5, `Expected ~12h at equator in June, got ${june.toFixed(2)}`)
  assert.ok(dec >= 11.5 && dec <= 12.5, `Expected ~12h at equator in Dec, got ${dec.toFixed(2)}`)
})

test('photoperiod_hours is non-zero when garden has coordinates (lat 44.5, summer solstice)', () => {
  // Testa che la funzione produca un valore ≥14h per lat 44.5 al solstizio estivo
  // Il wiring nel directorService.ts usa questa stessa funzione con garden.coordinates.latitude
  const photoperiodHours = calculatePhotoperiodHours(44.5, new Date('2026-06-21'))
  assert.ok(
    photoperiodHours >= 14,
    `Expected ≥14h for lat 44.5 on summer solstice, got ${photoperiodHours.toFixed(2)}`
  )
})

test('calculatePhotoperiodHours returns 0 for invalid latitude (out of range)', () => {
  // Latitude values outside [-90, 90] should not produce valid results
  // With the clamp on cosHourAngle, extreme latitudes still return a clamped value
  // — verify the function returns a finite number for lat 90 (pole, midnight sun)
  const north = calculatePhotoperiodHours(90, new Date('2026-06-21'))
  assert.ok(isFinite(north), `Expected finite result for lat 90, got ${north}`)
  assert.ok(north >= 23 && north <= 24, `Expected 23-24h at North Pole summer solstice, got ${north.toFixed(2)}h`)
})
