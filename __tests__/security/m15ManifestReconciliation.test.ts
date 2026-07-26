import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const diseaseDiagnosis = readFileSync('components/DiseaseDiagnosis.tsx', 'utf8')
const creditsWidget = readFileSync('components/shared/AICreditsWidget.tsx', 'utf8')
const organizationService = readFileSync('services/organizationService.ts', 'utf8')
const publicContract = readFileSync('app/api/public-contract/route.ts', 'utf8')

test('single-PRO diagnosis no longer contains an unreachable upgrade branch', () => {
  assert.doesNotMatch(diseaseDiagnosis, /UpgradePrompt/)
  assert.doesNotMatch(diseaseDiagnosis, /Versione Free/)
  assert.doesNotMatch(diseaseDiagnosis, /Implementare upgrade flow/)
})

test('AI credits widget uses the implemented shared hook', () => {
  assert.match(creditsWidget, /useAICredits\(\)/)
  assert.doesNotMatch(creditsWidget, /Replace with useAICredits/)
  assert.doesNotMatch(creditsWidget, /fetch\('\/api\/credits\/status'\)/)
})

test('organization permission scopes fail closed and use the member id', () => {
  assert.match(organizationService, /\.eq\('member_id', member\.id\)/)
  assert.doesNotMatch(organizationService, /\.eq\('member_id', member\.role_id\)/)
  assert.match(organizationService, /resource !== 'gardens' \|\| !gardenId[\s\S]*return false/)
  assert.match(organizationService, /if \(!gardenId\) return false/)
  assert.doesNotMatch(organizationService, /return \['\*'\]/)
  assert.match(organizationService, /new Set\([\s\S]*assignment\.garden_id/)
})

test('the public contract labels the external API as outside release scope', () => {
  assert.match(publicContract, /status: 'not-in-release-scope'/)
  assert.doesNotMatch(publicContract, /status: 'todo'/)
})
