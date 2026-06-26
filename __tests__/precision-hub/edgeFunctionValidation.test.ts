import { strict as assert } from 'node:assert'
import { test } from 'node:test'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validateGardenId(gardenId: string): 'valid' | 'invalid_format' {
  if (!UUID_REGEX.test(gardenId)) return 'invalid_format'
  return 'valid'
}

test('valid UUID passes validation', () => {
  assert.strictEqual(validateGardenId('550e8400-e29b-41d4-a716-446655440000'), 'valid')
})

test('empty string fails validation', () => {
  assert.strictEqual(validateGardenId(''), 'invalid_format')
})

test('SQL injection attempt fails validation', () => {
  assert.strictEqual(validateGardenId("'; DROP TABLE gardens; --"), 'invalid_format')
})

test('non-UUID string fails validation', () => {
  assert.strictEqual(validateGardenId('garden-1'), 'invalid_format')
})
