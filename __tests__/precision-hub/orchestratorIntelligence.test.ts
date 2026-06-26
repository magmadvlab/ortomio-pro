import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { scoreAgronomicPriority } from '../../services/agronomicPriorityService'
import { isWaxingPhase } from '../../services/lunarPhaseService'
import type { AgronomicRefinedContext } from '../../types/agronomicKernel'

function makeRefinedContextWithPhotoperiod(hours: number): AgronomicRefinedContext {
  return {
    siteOperationalProfile: {
      photoperiodHours: hours,
    },
  }
}

test('photoperiod > 14h increases water focus score by 1', () => {
  const base = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'water',
    refinedContext: makeRefinedContextWithPhotoperiod(12),
  })
  const high = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'water',
    refinedContext: makeRefinedContextWithPhotoperiod(15),
  })
  assert.ok(high.score > base.score, `high photoperiod (15h) should score higher than 12h for water focus: ${high.score} vs ${base.score}`)
  assert.strictEqual(high.score - base.score, 1)
})

test('photoperiod < 10h increases health focus score by 1', () => {
  const base = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'health',
    refinedContext: makeRefinedContextWithPhotoperiod(12),
  })
  const low = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'health',
    refinedContext: makeRefinedContextWithPhotoperiod(9),
  })
  assert.ok(low.score > base.score, `low photoperiod (9h) should score higher than 12h for health focus: ${low.score} vs ${base.score}`)
  assert.strictEqual(low.score - base.score, 1)
})

test('photoperiod has no effect on nutrition focus', () => {
  const base = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'nutrition',
    refinedContext: makeRefinedContextWithPhotoperiod(12),
  })
  const high = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'nutrition',
    refinedContext: makeRefinedContextWithPhotoperiod(16),
  })
  assert.strictEqual(high.score, base.score, `photoperiod should not affect nutrition score`)
})

test('missing photoperiodHours does not affect score', () => {
  const withoutPhotoperiod = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'water',
    refinedContext: { siteOperationalProfile: {} },
  })
  const noContext = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'water',
  })
  assert.strictEqual(withoutPhotoperiod.score, noContext.score)
})

test('isWaxingPhase: correctly classifies all 8 lunar phases', () => {
  // Waxing phases
  assert.strictEqual(isWaxingPhase('waxing_crescent'), true)
  assert.strictEqual(isWaxingPhase('first_quarter'), true)
  assert.strictEqual(isWaxingPhase('waxing_gibbous'), true)
  // Non-waxing phases
  assert.strictEqual(isWaxingPhase('new_moon'), false)
  assert.strictEqual(isWaxingPhase('full_moon'), false)
  assert.strictEqual(isWaxingPhase('waning_gibbous'), false)
  assert.strictEqual(isWaxingPhase('last_quarter'), false)
  assert.strictEqual(isWaxingPhase('waning_crescent'), false)
})

test('water focus score ordering: photoperiod 16h > 12h >= 8h', () => {
  const makeContext = (hours: number) => ({
    siteOperationalProfile: { photoperiodHours: hours },
  })
  const s8 = scoreAgronomicPriority({ baseScore: 50, focus: 'water', refinedContext: makeContext(8) })
  const s12 = scoreAgronomicPriority({ baseScore: 50, focus: 'water', refinedContext: makeContext(12) })
  const s16 = scoreAgronomicPriority({ baseScore: 50, focus: 'water', refinedContext: makeContext(16) })
  assert.ok(s16.score >= s12.score, `16h (${s16.score}) should be >= 12h (${s12.score}) for water focus`)
  assert.ok(s12.score >= s8.score, `12h (${s12.score}) should be >= 8h (${s8.score}) for water focus`)
})
