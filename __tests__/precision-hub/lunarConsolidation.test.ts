import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  getLunarPhase,
  getIlluminationFraction,
  isWaxingPhase,
  getPhaseEmoji,
  getDayInCycle,
} from '../../services/lunarPhaseService'

test('getIlluminationFraction: full moon returns ~1.0', () => {
  // 2024-03-26 è luna piena nel ciclo sinodico di riferimento (synodic day ~15.59)
  const fullMoon = new Date('2024-03-26T00:00:00Z')
  const phase = getLunarPhase(fullMoon)
  assert.strictEqual(phase, 'full_moon')
  const illumination = getIlluminationFraction(fullMoon)
  assert.ok(illumination >= 0.85, `illumination should be near 1, got ${illumination}`)
})

test('isWaxingPhase: waxing_crescent returns true', () => {
  assert.strictEqual(isWaxingPhase('waxing_crescent'), true)
  assert.strictEqual(isWaxingPhase('full_moon'), false)
  assert.strictEqual(isWaxingPhase('waning_gibbous'), false)
})

test('getPhaseEmoji: new_moon returns 🌑', () => {
  assert.strictEqual(getPhaseEmoji('new_moon'), '🌑')
  assert.strictEqual(getPhaseEmoji('full_moon'), '🌕')
})

test('getDayInCycle: returns number in [0, 29.53)', () => {
  const day = getDayInCycle(new Date('2026-06-26T00:00:00Z'))
  assert.ok(day >= 0 && day < 29.53058867, `dayInCycle out of range: ${day}`)
})
