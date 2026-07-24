import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('../../components/plants/PlantLifecycleManager.tsx', import.meta.url),
  'utf8'
)

test('plant lifecycle edit action persists through the update callback', () => {
  assert.match(source, /const handleEditOperation = \(operation: PlantOperation\)/)
  assert.match(source, /setEditingOperationId\(operation\.id\)/)
  assert.match(source, /onUpdateOperation\(editingOperationId, operation\)/)
  assert.match(source, /onClick=\{\(\) => handleEditOperation\(operation\)\}/)
  assert.doesNotMatch(source, /TODO: Implementare modifica operazione/)
})
