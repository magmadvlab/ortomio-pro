import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const legacyRoute = readFileSync(
  new URL('../../app/app/journal/page.tsx', import.meta.url),
  'utf8'
)

test('the legacy journal route converges on the canonical diary', () => {
  assert.match(legacyRoute, /redirect\('\/app\/diary'\)/)
  assert.equal(
    existsSync(new URL('../../components/Journal.tsx', import.meta.url)),
    false,
    'obsolete duplicate journal component must not return'
  )
})
