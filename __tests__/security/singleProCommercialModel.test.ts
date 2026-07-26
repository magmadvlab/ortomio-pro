import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CAPABILITIES, DEFAULT_CAPABILITY_ACCESS } from '@/config/capabilities'
import { PRO_TIER, FREE_TIER, PLUS_TIER } from '@/packages/core/config/tiers'

test('the commercial model exposes one unlimited PRO version', () => {
  assert.equal(DEFAULT_CAPABILITY_ACCESS.tier, 'PRO')
  assert.equal(CAPABILITIES.every(capability => capability.tiers.includes('PRO')), true)
  assert.equal(FREE_TIER, PRO_TIER)
  assert.equal(PLUS_TIER, PRO_TIER)
  assert.equal(Object.values(PRO_TIER.limits).every(limit => limit === -1), true)
  assert.equal(Object.values(PRO_TIER.features).every(Boolean), true)
})

test('server authorization no longer rejects authenticated users by legacy tier', () => {
  const auth = readFileSync('lib/auth.server.ts', 'utf8')
  const capabilities = readFileSync('app/api/auth/capabilities/route.ts', 'utf8')
  const creditReset = readFileSync('app/api/cron/reset-credits/route.ts', 'utf8')
  const cloudStorage = readFileSync('packages/storage-cloud/SupabaseStorageProvider.ts', 'utf8')
  assert.doesNotMatch(auth, /error:\s*['"]insufficient_tier['"]/)
  assert.match(auth, /tier:\s*['"]PRO['"]/)
  assert.match(capabilities, /tier:\s*['"]PRO['"]/)
  assert.doesNotMatch(capabilities, /normalizeTier/)
  assert.doesNotMatch(creditReset, /\.in\(['"]tier['"]/)
  assert.doesNotMatch(creditReset, /profile\.tier/)
  assert.match(cloudStorage, /tier:\s*['"]PRO['"]/)
  assert.doesNotMatch(cloudStorage, /tier:\s*['"]FREE['"]/)
})

test('live AI credit widgets do not advertise obsolete plans or prices', () => {
  const widget = readFileSync('components/shared/AICreditsWidget.tsx', 'utf8')
  const modal = readFileSync('components/shared/AIRequestModal.tsx', 'utf8')
  for (const source of [widget, modal]) {
    assert.doesNotMatch(source, /\/pricing/)
    assert.doesNotMatch(source, /PRO\+/)
    assert.doesNotMatch(source, /€(?:4\.99|9\.99|19\.99|29\.99)/)
  }
})
