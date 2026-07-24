import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const register = readFileSync(
  new URL('../../components/professional/TreatmentRegister.tsx', import.meta.url),
  'utf8'
)

test('professional treatment register reads and writes canonical records', () => {
  assert.match(register, /storageProvider\.getTreatments\(garden\.id\)/)
  assert.match(register, /storageProvider\.createTreatment\(/)
  assert.match(register, /mapTreatmentRecord/)
  assert.doesNotMatch(register, /Treatment log to save/)
})
