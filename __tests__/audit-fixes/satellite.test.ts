import test from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { testSatelliteConnection } from '@/services/satelliteConnectionTest.server'
import { AccessError } from '@/lib/auth.server'
const request = () => new NextRequest('http://localhost/api/ndvi/test-connection', { method: 'POST' })
const credentials = { clientId: 'fixture-client', clientSecret: 'fixture-secret' }

test('satellite test rejects unauthorized users before contacting the provider', async () => {
  let called = false
  const result = await testSatelliteConnection(request(), { authorize: async () => { throw new AccessError('forbidden', 403) }, fetch: async () => { called = true; return new Response() } })
  assert.equal(result.status, 403); assert.equal(called, false)
})
test('satellite test rejects missing credentials, HTTP errors, malformed success and network failures', async () => {
  assert.equal((await testSatelliteConnection(request(), { authorize: async () => {}, credentials: {} })).status, 503)
  for (const response of [new Response('{"error":"invalid_client"}', { status: 401 }), Response.json({ error: 'failed' }), new Response('not json'), Response.json({ access_token: 'fixture-token', expires_in: 0 })]) {
    const result = await testSatelliteConnection(request(), { authorize: async () => {}, credentials, fetch: async () => response })
    assert.equal(result.status, 502)
    assert.notEqual((await result.json()).success, true)
  }
  assert.equal((await testSatelliteConnection(request(), { authorize: async () => {}, credentials, fetch: async () => { throw new Error('offline') } })).status, 502)
})
test('satellite success comes from the provider and never discloses credentials or tokens', async () => {
  const result = await testSatelliteConnection(request(), { authorize: async () => {}, credentials, fetch: async () => Response.json({ access_token: 'fixture-token', expires_in: 300 }) })
  assert.equal(result.status, 200)
  const text = await result.text()
  assert.equal(JSON.parse(text).status, 'connected')
  assert.doesNotMatch(text, /fixture-(token|client|secret)/)
})

test('Copernicus authentication uses the documented CDSE endpoint and form encoding, then reuses its token', async () => {
  const { copernicusToken, COPERNICUS_TOKEN_URL } = await import('@/services/copernicusAuth.server')
  let calls = 0
  const fetcher: typeof fetch = async (url, options) => {
    calls++
    assert.equal(url, COPERNICUS_TOKEN_URL)
    assert.equal(url, 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token')
    const body = new URLSearchParams(String(options?.body))
    assert.equal(body.get('client_secret'), 'special &+ fixture')
    assert.equal(body.get('client_id'), 'cache-fixture')
    return Response.json({ access_token: 'cache-token', expires_in: 300 })
  }
  await copernicusToken('cache-fixture', 'special &+ fixture', { force: true, fetcher })
  assert.equal(await copernicusToken('cache-fixture', 'special &+ fixture', { fetcher }), 'cache-token')
  assert.equal(calls, 1)
})
