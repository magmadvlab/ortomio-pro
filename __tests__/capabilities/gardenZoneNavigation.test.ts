import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('../../components/garden/GardenView.tsx', import.meta.url),
  'utf8'
)

test('garden structure links to canonical zone management with garden scope', () => {
  assert.match(
    source,
    /href=\{`\/app\/garden\/zones\?garden=\$\{encodeURIComponent\(garden\.id\)\}`\}/
  )
  assert.doesNotMatch(source, /TODO: Implement zone management/)
})
