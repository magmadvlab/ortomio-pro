import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('organization invitation tokens are never written to application logs', () => {
  const source = readFileSync('services/organizationService.ts', 'utf8')
  assert.doesNotMatch(source, /console\.(?:log|info|warn|error)\([^\n]*invitation\.token/)
  assert.equal(source.includes('Token: ${invitation.token}'), false)
})

test('commercial lifecycle is not falsely exposed as a completed API', () => {
  const apiFiles = [
    'app/api/billing/route.ts',
    'app/api/subscriptions/route.ts',
    'app/api/licenses/route.ts',
  ]
  assert.equal(apiFiles.some((file) => {
    try {
      readFileSync(file)
      return true
    } catch {
      return false
    }
  }), false)
})
