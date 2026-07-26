import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(
  resolve(process.cwd(), 'components/plants/SmartPlantManager.tsx'),
  'utf8',
)

test('health action opens the implemented bulk-operation modal', () => {
  assert.match(
    source,
    /setSelectedOperation\('health'\);\s+setShowOperationModal\(true\);/,
  )
  assert.match(source, /operationType=\{selectedOperation\}/)
  assert.match(source, /onSubmit=\{handleBulkOperation\}/)
  assert.doesNotMatch(source, /showHealthModal/)
})

test('plant manager does not advertise the removed placeholder operation', () => {
  assert.doesNotMatch(source, /Funzionalità in sviluppo/)
  assert.doesNotMatch(source, /Operazione Unificata/)
  assert.doesNotMatch(source, /showUnifiedOperationModal/)
})
