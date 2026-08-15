import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('guided trial collects and submits the four approved fields', () => {
  const source = readFileSync('components/landing/PilotRequestForm.tsx', 'utf8')
  for (const field of ['name', 'email', 'company', 'message']) assert.match(source, new RegExp(`name="${field}"`))
  assert.match(source, /guided_trial/)
})

test('support route preserves the company on guided trial requests', () => {
  const source = readFileSync('app/api/support/submit/route.ts', 'utf8')
  assert.match(source, /formData\.get\('company'\)/)
  assert.match(source, /guided_trial/)
})
