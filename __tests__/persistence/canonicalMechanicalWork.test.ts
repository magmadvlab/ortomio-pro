import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const service = readFileSync(
  new URL('../../services/mechanicalWorkService.ts', import.meta.url),
  'utf8'
)
const provider = readFileSync(
  new URL('../../packages/core/storage/interface.ts', import.meta.url),
  'utf8'
)

test('mechanical work runtime is owned only by durable storage providers', () => {
  assert.match(provider, /createMechanicalWork\(/)
  assert.match(provider, /updateMechanicalWork\(/)
  assert.match(provider, /deleteMechanicalWork\(/)
  assert.doesNotMatch(service, /createMechanicalWorkLog/)
  assert.doesNotMatch(service, /Mock|mock/)
})
