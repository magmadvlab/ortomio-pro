import test from 'node:test'
import assert from 'node:assert/strict'

import { scoreAgronomicPriority } from '@/services/agronomicPriorityService'
import type { AgronomicRefinedContext } from '@/types/agronomicKernel'

const droughtRootstockContext: AgronomicRefinedContext = {
  subSystemContext: {
    rootstock: '110R',
    trainingSystem: 'Guyot',
    systemType: 'vineyard',
    irrigationMode: 'rainfed',
  },
}

const vigorousRootstockContext: AgronomicRefinedContext = {
  subSystemContext: {
    rootstock: 'SO4',
    trainingSystem: 'Pergola',
    systemType: 'vineyard',
  },
}

test('drought-tolerant rootstock (110R) increases water focus score', () => {
  const droughtResult = scoreAgronomicPriority({
    baseScore: 55,
    confidence: 0.7,
    focus: 'water',
    refinedContext: droughtRootstockContext,
  })

  const noRootstockResult = scoreAgronomicPriority({
    baseScore: 55,
    confidence: 0.7,
    focus: 'water',
    refinedContext: {},
  })

  assert.ok(
    droughtResult.score > noRootstockResult.score,
    `Expected drought rootstock score (${droughtResult.score}) > no rootstock (${noRootstockResult.score})`
  )
})

test('vigorous rootstock (SO4) increases nutrition focus score', () => {
  const vigorousResult = scoreAgronomicPriority({
    baseScore: 50,
    confidence: 0.65,
    focus: 'nutrition',
    refinedContext: vigorousRootstockContext,
  })

  const noRootstockResult = scoreAgronomicPriority({
    baseScore: 50,
    confidence: 0.65,
    focus: 'nutrition',
    refinedContext: {},
  })

  assert.ok(
    vigorousResult.score >= noRootstockResult.score,
    `Expected vigorous rootstock nutrition score (${vigorousResult.score}) >= baseline (${noRootstockResult.score})`
  )
})

test('Guyot training system increases quality focus score vs Pergola', () => {
  const guyotResult = scoreAgronomicPriority({
    baseScore: 60,
    confidence: 0.75,
    focus: 'quality',
    refinedContext: droughtRootstockContext, // ha Guyot
  })

  const pergolaResult = scoreAgronomicPriority({
    baseScore: 60,
    confidence: 0.75,
    focus: 'quality',
    refinedContext: vigorousRootstockContext, // ha Pergola
  })

  assert.ok(
    guyotResult.score >= pergolaResult.score,
    `Expected Guyot quality score (${guyotResult.score}) >= Pergola (${pergolaResult.score})`
  )
})
