import assert from 'node:assert/strict'
import test from 'node:test'
import { encryptAPISecret, decryptAPISecret, publicConfiguration, ownedConfiguration } from '../../services/apiConfiguration.server'
import { configuredAIProvider } from '../../services/configuredAIProvider.server'
import { selectIrrigationSensorSignals, type RecordedSensorSignal } from '../../lib/irrigation/sensorSignals'
import { validateSuggestionTasks } from '../../lib/planner/suggestionTasks'
import { createCipheriv, randomBytes } from 'node:crypto'
import { decodeLegacyBrowserKey, legacyPublicConfig, legacyServiceTarget } from '@/services/legacyCredentialMigration.server'

test('secrets are authenticated, owner-bound, randomized and never included in public metadata', () => {
  const old = process.env.API_CONFIGURATION_ENCRYPTION_KEY
  try {
    process.env.API_CONFIGURATION_ENCRYPTION_KEY = 'ab'.repeat(32)
    const secret = 'synthetic-key-not-a-real-credential'
    const encrypted = encryptAPISecret(secret, 'owner-a')
    assert.notEqual(encrypted, encryptAPISecret(secret, 'owner-a'))
    assert.equal(decryptAPISecret(encrypted, 'owner-a'), secret)
    assert.throws(() => decryptAPISecret(encrypted, 'owner-b'))
    const pieces = encrypted.split('.'); pieces[3] = Buffer.from('corrupt').toString('base64url')
    assert.throws(() => decryptAPISecret(pieces.join('.'), 'owner-a'))
    const publicData = publicConfiguration({ id: 'id', user_id: 'owner-a', service_name: 'ai_gemini', provider_name: 'Gemini', api_key_encrypted: encrypted, config: { model: 'fixture', hiddenSecret: secret }, is_active: true, is_default: true })
    assert.equal(publicData.api_key, '')
    assert.equal(publicData.has_api_key, true)
    assert.ok(!JSON.stringify(publicData).includes(secret))
    assert.ok(!JSON.stringify(publicData).includes(encrypted))
    delete process.env.API_CONFIGURATION_ENCRYPTION_KEY
    assert.throws(() => encryptAPISecret(secret, 'owner-a'), /not_configured/)
  } finally { if (old === undefined) delete process.env.API_CONFIGURATION_ENCRYPTION_KEY; else process.env.API_CONFIGURATION_ENCRYPTION_KEY = old }
})
test('server proxy reads only active configuration belonging to the authenticated owner', async () => {
  const filters: unknown[] = []
  const db = { from: () => ({ select() { return this }, eq(...args: unknown[]) { filters.push(args); return this }, async maybeSingle() { return { data: null, error: null } } }) }
  assert.equal(await ownedConfiguration(db as never, 'owner-a', 'configuration-b'), null)
  assert.deepEqual(filters, [['id', 'configuration-b'], ['user_id', 'owner-a'], ['is_active', true]])
  assert.throws(() => configuredAIProvider({ user_id: 'a', service_type: 'ai_local', provider_name: 'local', api_key: 'fixture', config: { base_url: 'http://169.254.169.254' } }), /not_allowed/)
})
test('irrigation signals retain zero, scope, timestamp and units; reject simulation, stale and unknown units', () => {
  const asOf = new Date('2026-11-18T12:00:00Z')
  const row: RecordedSensorSignal = { garden_id: 'garden-a', irrigation_zone_id: 'zone-a', sensor_type: 'soil_moisture_10cm', unit: '%', value: 0, recorded_at: '2026-11-18T11:00:00Z', is_simulated: false }
  const scope = { gardenId: 'garden-a', zoneId: 'zone-a', asOf }
  assert.equal(selectIrrigationSensorSignals([row], scope).soilMoisture10cm, 0)
  for (const invalid of [{ garden_id: 'b' }, { irrigation_zone_id: 'b' }, { is_simulated: true }, { is_simulated: null }, { recorded_at: '2026-10-18T11:00:00Z' }, { recorded_at: '2026-11-19T11:00:00Z' }, { value: null }, { value: 'NaN' }, { unit: 'fraction' }]) {
    assert.equal(selectIrrigationSensorSignals([{ ...row, ...invalid }], scope).soilMoisture10cm, undefined)
  }
  const result = selectIrrigationSensorSignals([row], scope)
  assert.equal(result.sensorProvenance.soilMoisture10cm.observedAt, row.recorded_at)
})
test('reviewed planner tasks reject impossible dates, mismatched operation types and invented fields', () => {
  const task = { plantName: 'Pomodoro', taskType: 'Harvest', date: '2026-11-18', quantity: 2 }
  assert.equal(validateSuggestionTasks('HARVEST_TIMING', [task]).length, 1)
  for (const patch of [{ date: '2026-02-30' }, { date: '2300-01-01' }, { quantity: 0 }, { taskType: 'Sowing' }, { unknown: 1 }]) assert.throws(() => validateSuggestionTasks('HARVEST_TIMING', [{ ...task, ...patch }]))
})

test('retired browser credentials decode both formats without promoting organization secrets or config passwords', () => {
  const key = randomBytes(32), iv = randomBytes(12), secret = 'synthetic-provider-key'
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(secret), cipher.final()])
  const legacy = Buffer.concat([iv, ciphertext, cipher.getAuthTag(), key]).toString('base64')
  assert.equal(decodeLegacyBrowserKey(legacy), secret)
  assert.equal(decodeLegacyBrowserKey(Buffer.from(secret).toString('base64')), secret)
  assert.throws(() => decodeLegacyBrowserKey('not-a-serialized-key'))
  const corrupt = Buffer.from(legacy, 'base64'); corrupt[15] ^= 1
  assert.throws(() => decodeLegacyBrowserKey(corrupt.toString('base64')))
  assert.equal(legacyServiceTarget('GoogleAI', null), 'ai_gemini')
  assert.equal(legacyServiceTarget('GoogleAI', 'organization'), null)
  assert.equal(legacyServiceTarget('SentinelHub', null), null)
  assert.deepEqual(legacyPublicConfig({ model: 'fixture', apiKey: secret, clientSecret: secret, temperature: 0 }), { model: 'fixture', temperature: 0 })
})
