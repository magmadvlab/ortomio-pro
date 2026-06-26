import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { scoreAgronomicPriority } from '../../services/agronomicPriorityService'
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
