import assert from 'node:assert/strict'
import test from 'node:test'

import { calculateOperationalOccurrences } from '../../lib/calendar/romeRecurrence'

test('daily recurrence preserves Rome wall time across spring DST', () => {
  assert.deepEqual(
    calculateOperationalOccurrences(
      '2026-03-28T08:00:00+01:00',
      { type: 'daily', interval: 1 },
      '2026-03-28T00:00:00+01:00',
      '2026-03-30T23:59:59+02:00'
    ),
    [
      '2026-03-28T07:00:00.000Z',
      '2026-03-29T06:00:00.000Z',
      '2026-03-30T06:00:00.000Z',
    ]
  )
})

test('weekly recurrence preserves Rome wall time across autumn DST', () => {
  assert.deepEqual(
    calculateOperationalOccurrences(
      '2026-10-24T08:00:00+02:00',
      { type: 'weekly', interval: 1 },
      '2026-10-24',
      '2026-11-08T23:59:59+01:00'
    ),
    [
      '2026-10-24T06:00:00.000Z',
      '2026-10-31T07:00:00.000Z',
      '2026-11-07T07:00:00.000Z',
    ]
  )
})

test('monthly recurrence clamps to the last valid calendar day', () => {
  assert.deepEqual(
    calculateOperationalOccurrences(
      '2026-01-31',
      { type: 'monthly', interval: 1 },
      '2026-01-01',
      '2026-04-30T23:59:59+02:00'
    ),
    [
      '2026-01-30T23:00:00.000Z',
      '2026-02-27T23:00:00.000Z',
      '2026-03-30T22:00:00.000Z',
      '2026-04-29T22:00:00.000Z',
    ]
  )
})

test('invalid intervals and ranges fail closed', () => {
  assert.throws(
    () => calculateOperationalOccurrences('2026-01-01', { type: 'daily', interval: 0 }),
    /positive integer/
  )
  assert.throws(
    () => calculateOperationalOccurrences(
      '2026-01-01',
      { type: 'daily', interval: 1 },
      '2026-02-01',
      '2026-01-01'
    ),
    /invalid recurrence range/
  )
})
