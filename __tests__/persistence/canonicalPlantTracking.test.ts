import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const plantOperations = readFileSync(
  new URL('../../services/plantOperationsService.ts', import.meta.url),
  'utf8'
)

test('plant tracking converges on the durable canonical service', () => {
  assert.equal(
    existsSync(new URL('../../services/unifiedPlantTrackingService.ts', import.meta.url)),
    false,
    'the unused in-memory tracking duplicate must not return'
  )
  assert.match(plantOperations, /createPlantOperation/)
  assert.match(plantOperations, /requireStorageMethod/)
})
