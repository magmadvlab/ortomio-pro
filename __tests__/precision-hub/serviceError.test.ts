import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createServiceError, isServiceError, logServiceError } from '../../utils/serviceError'

test('createServiceError creates tagged object', () => {
  const err = createServiceError('SUPABASE_ERROR', { gardenId: 'g1', method: 'fetchGarden' })
  assert.strictEqual(err._tag, 'ServiceError')
  assert.strictEqual(err.code, 'SUPABASE_ERROR')
  assert.deepStrictEqual(err.context, { gardenId: 'g1', method: 'fetchGarden' })
})

test('isServiceError: detects ServiceError', () => {
  const err = createServiceError('X', {})
  assert.strictEqual(isServiceError(err), true)
  assert.strictEqual(isServiceError(null), false)
  assert.strictEqual(isServiceError('string'), false)
  assert.strictEqual(isServiceError({ code: 'X' }), false)
})

test('logServiceError does not throw', () => {
  assert.doesNotThrow(() => {
    logServiceError(new Error('boom'), 'TEST_ERROR', { context: 'unit test' })
  })
})
