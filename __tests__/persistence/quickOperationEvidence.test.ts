import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('../../components/fieldrows/QuickOperationModal.tsx', import.meta.url),
  'utf8'
)

test('quick field operation requires authenticated durable evidence', () => {
  assert.match(source, /const \{ user \} = useAuth\(\)/)
  assert.match(source, /if \(!user\)/)
  assert.match(source, /storageProvider\.uploadPhoto/)
  assert.match(source, /Esecutore: \$\{user\.id\}/)
  assert.match(source, /executeFieldRowOperationThroughUnifiedService/)
  assert.match(source, /operationIds: \[\.\.\.unifiedResponse\.rowOperationIds/)
  assert.doesNotMatch(source, /executedBy:\s*['"]user['"]/)
  assert.doesNotMatch(source, /Registro operazione creato/)
})
