import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createServiceError, isServiceError, logServiceError } from '../../utils/serviceError'

test('createServiceError creates a properly tagged ServiceError', () => {
  const err = createServiceError('COLLABORATIVE_AI_CREATE_SUGGESTION', {
    userId: 'u-123',
    gardenId: 'g-456',
  })
  assert.strictEqual(err._tag, 'ServiceError')
  assert.strictEqual(err.code, 'COLLABORATIVE_AI_CREATE_SUGGESTION')
  assert.deepStrictEqual(err.context, { userId: 'u-123', gardenId: 'g-456' })
})

test('isServiceError returns false for plain Error instance', () => {
  const nativeError = new Error('Supabase connection failed')
  assert.strictEqual(isServiceError(nativeError), false)
})

test('isServiceError returns false for objects without _tag', () => {
  assert.strictEqual(isServiceError({ code: 'COLLABORATIVE_AI_CREATE_SUGGESTION', context: {} }), false)
  assert.strictEqual(isServiceError({ _tag: 'OtherTag', code: 'X', context: {} }), false)
})

test('logServiceError emits structured JSON to console.error', () => {
  const messages: string[] = []
  const originalConsoleError = console.error
  console.error = (...args: unknown[]) => { messages.push(String(args[0])) }
  try {
    logServiceError(new Error('DB timeout'), 'COLLABORATIVE_AI_RECORD_DECISION', { suggestionId: 's-789' })
  } finally {
    console.error = originalConsoleError
  }
  assert.strictEqual(messages.length, 1, 'should emit exactly one log line')
  const parsed = JSON.parse(messages[0])
  assert.strictEqual(parsed._tag, 'ServiceError')
  assert.strictEqual(parsed.code, 'COLLABORATIVE_AI_RECORD_DECISION')
  assert.strictEqual(parsed.context.suggestionId, 's-789')
  assert.ok(typeof parsed.context.error === 'string', 'error field should be a string')
  assert.ok(parsed.context.error.includes('DB timeout'), 'error field should contain the original message')
})
