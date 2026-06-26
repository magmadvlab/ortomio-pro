import test from 'node:test'
import assert from 'node:assert/strict'

import { getLunarPhase } from '@/services/lunarPhaseService'

// Reference new moon: 2000-01-06T18:14:00Z (pos = 0.0)
// Cycle: 29.53058867 days
// Full moon band: pos in [14.77, 16.61)
// Waxing gibbous band: pos in [9.22, 14.77)

test('reference date 2000-01-06 is new moon', () => {
  const phase = getLunarPhase(new Date('2000-01-06T18:14:00Z'))
  assert.equal(phase, 'new_moon')
})

test('ref + 15.5 days is full_moon', () => {
  // pos = 15.5 → full_moon band [14.77, 16.61)
  const refMs = new Date('2000-01-06T18:14:00Z').getTime()
  const fullMoon = new Date(refMs + 15.5 * 86400000)
  const phase = getLunarPhase(fullMoon)
  assert.equal(phase, 'full_moon')
})

test('ref + 12 days is waxing_gibbous', () => {
  // pos = 12.0 → waxing_gibbous band [9.22, 14.77)
  const refMs = new Date('2000-01-06T18:14:00Z').getTime()
  const waxGibbous = new Date(refMs + 12 * 86400000)
  const phase = getLunarPhase(waxGibbous)
  assert.equal(phase, 'waxing_gibbous')
})

test('cycle wraps correctly: 30 days after reference is still in new moon band', () => {
  const refMs = new Date('2000-01-06T18:14:00Z').getTime()
  const exactly30 = new Date(refMs + 30 * 86400000)
  const phase = getLunarPhase(exactly30)
  // 30 - 29.53 = 0.47 days into cycle → new_moon (< 1.85)
  assert.equal(phase, 'new_moon')
})
