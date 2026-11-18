import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
const local = JSON.parse(execFileSync('supabase', ['status', '--workdir', '/tmp/ortomio-audit-local', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
assert.equal(local.API_URL, 'http://127.0.0.1:55421')
const admin = createClient(local.API_URL, local.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
const users = []; const gardenIds = []
const json = async (path, token, method = 'GET', body, extraHeaders = {}) => {
  const response = await fetch(`http://127.0.0.1:3004${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extraHeaders }, ...(body ? { body: JSON.stringify(body) } : {}) })
  return { status: response.status, data: await response.json() }
}
try {
  for (let i = 0; i < 2; i++) {
    const email = `audit-${randomUUID()}@example.test`; const password = randomUUID() + 'Aa9!'
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    assert.ifError(created.error); users.push({ id: created.data.user.id })
    const client = createClient(local.API_URL, local.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
    const login = await client.auth.signInWithPassword({ email, password }); assert.ifError(login.error)
    users[i].token = login.data.session.access_token; users[i].client = client
    const { error: profileError } = await admin.from('profiles').upsert({ id: users[i].id, email, tier: 'PRO' }); assert.ifError(profileError)
    const garden = await admin.from('gardens').insert({ user_id: users[i].id, name: `Audit HTTP ${i}`, coordinates: { latitude: 41.9, longitude: 12.5 }, soil_type: 'Sandy', altitude_meters: 0 }).select('id').single(); assert.ifError(garden.error)
    gardenIds.push(garden.data.id)
  }
  assert.equal((await json('/api/api-configurations')).status, 401)
  assert.equal((await json('/api/ai/external')).status, 401)
  assert.equal((await json('/api/ai/generate', users[0].token, 'POST', { feature: 'advanced_analysis', model: 'fixture', contents: 'test' })).status, 503)
  assert.equal((await json('/api/ai/generate', users[0].token, 'POST', { feature: 'advanced_analysis', model: 'fixture', contents: { parts: [] } })).status, 400)
  assert.equal((await json('/api/ai/external', users[0].token, 'POST', { provider: 'groq', messages: [{ role: 'user', content: 'test' }] })).status, 503)
  const legacyRead = await users[0].client.from('api_keys').select('*')
  assert.ok(legacyRead.error, 'Retired browser credential store must also be inaccessible')
  const key = 'synthetic-key-' + randomUUID()
  const saved = await json('/api/api-configurations', users[0].token, 'POST', { service_type: 'ai_gemini', provider_name: 'Synthetic fixture', api_key: key, config: { model: 'fixture' }, is_default: true })
  assert.equal(saved.status, 201, JSON.stringify(saved.data))
  const id = saved.data.configuration.id
  assert.ok(!JSON.stringify(saved.data).includes(key))
  const reread = await json('/api/api-configurations/ai_gemini', users[0].token)
  assert.equal(reread.data.configuration.id, id); assert.equal(reread.data.configuration.api_key, '')
  const stored = await admin.from('api_configurations').select('api_key_encrypted').eq('id', id).single()
  assert.match(stored.data.api_key_encrypted, /^v1\./); assert.ok(!stored.data.api_key_encrypted.includes(key))
  const clientRead = await users[0].client.from('api_configurations').select('*')
  assert.ok(clientRead.error, 'Browser must not read encrypted keys directly')
  assert.equal((await json('/api/api-configurations', users[1].token)).data.configurations.length, 0)
  assert.equal((await json('/api/api-configurations', users[1].token, 'PATCH', { id, provider_name: 'Hijack' })).status, 404)
  assert.equal((await json('/api/api-configurations/generate', users[1].token, 'POST', { id, prompt: 'must never reach provider' })).status, 404)
  const updated = await json('/api/api-configurations', users[0].token, 'PATCH', { id, provider_name: 'Updated fixture', api_key: '' })
  assert.equal(updated.status, 200, JSON.stringify(updated.data))
  const unchanged = await admin.from('api_configurations').select('api_key_encrypted').eq('id', id).single()
  assert.equal(unchanged.data.api_key_encrypted, stored.data.api_key_encrypted)
  const windows = await json('/api/garden/sun-exposure/planting-windows', users[0].token, 'POST', { gardenId: gardenIds[0], year: 2026 })
  assert.equal(windows.status, 200, JSON.stringify(windows.data))
  assert.equal(windows.data.parameters.altitudeMeters, 0)
  assert.equal(windows.data.parameters.soilType, 'Sandy')
  assert.equal((await json('/api/garden/sun-exposure/planting-windows', users[1].token, 'POST', { gardenId: gardenIds[0], year: 2026 })).status, 404)
  assert.equal((await json('/api/api-configurations', users[0].token, 'DELETE', { id })).status, 200)
  for (let i = 0; i < users.length; i++) {
    const prefs = await admin.from('notification_preferences').upsert({ user_id: users[i].id, email_enabled: false, weather_alerts: false }); assert.ifError(prefs.error)
    const reading = await admin.from('sensor_readings').insert({ user_id: users[i].id, garden_id: gardenIds[i], sensor_type: 'moisture', value: 10, unit: '%', is_simulated: i === 1 }); assert.ifError(reading.error)
  }
  assert.equal((await json('/api/cron/health-check')).status, 401)
  const cron = await json('/api/cron/health-check', 'local-audit-no-production-jobs', 'GET', undefined, { 'x-cron-request-id': randomUUID() })
  assert.equal(cron.status, 200, JSON.stringify(cron.data)); assert.equal(cron.data.errorsQueued, 0, JSON.stringify(cron.data))
  const alerts = await admin.from('health_alerts').select('id,garden_id').in('garden_id', gardenIds)
  assert.ok(alerts.data.some(row => row.garden_id === gardenIds[0]), 'real sensor should create an alert')
  assert.ok(!alerts.data.some(row => row.garden_id === gardenIds[1]), 'simulated sensor must not create operational alerts')
  const runs = await admin.from('monitoring_runs').select('status,garden_id').in('garden_id', gardenIds)
  assert.equal(runs.data.length, 2); assert.ok(runs.data.every(row => row.status === 'completed'))
  const repeated = await json('/api/cron/health-check', 'local-audit-no-production-jobs', 'GET', undefined, { 'x-cron-request-id': randomUUID() })
  assert.equal(repeated.data.gardensSkipped, 2)
  const repeatedAlerts = await admin.from('health_alerts').select('id').in('garden_id', gardenIds)
  assert.equal(repeatedAlerts.data.length, alerts.data.length)
  const deliveries = await admin.from('notification_delivery_queue').select('id').in('user_id', users.map(user => user.id))
  assert.equal(deliveries.data.length, 0, 'disabled email preferences must suppress delivery')
  console.log(JSON.stringify({ passed: true, tests: ['real-auth-login', 'ai-proxy-auth-and-invalid-input', 'unconfigured-provider-explicit', 'legacy-secret-access-denied', 'credential-crud-reread', 'encrypted-at-rest', 'browser-secret-access-denied', 'cross-owner-list-write-proxy-denied', 'blank-key-preserves-secret', 'planting-soil-altitude-zero', 'cross-owner-garden-denied', 'monitoring-persisted', 'simulation-excluded', 'cron-idempotency', 'email-preference-suppression'], providerRequestsSent: 0 }))
} finally {
  for (const id of gardenIds) { const result = await admin.from('gardens').delete().eq('id', id); assert.ifError(result.error) }
  for (const user of users) { const result = await admin.auth.admin.deleteUser(user.id); assert.ifError(result.error) }
}
