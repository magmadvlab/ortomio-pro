import test from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'

import {
  AccessError,
  requireAdmin,
  requireCron,
  requireDeviceSource,
  requireGardenAccess,
  requireOrganizationAccess,
  requireUser,
} from '@/lib/auth.server'
import { POST as ndviPost } from '@/app/api/ndvi/sentinel/route'
import { POST as sensorReadingPost } from '@/app/api/sensors/readings/route'
import { POST as thingsboardTelemetryPost } from '@/app/api/iot/telemetry/route'
import { GET as testApiGet } from '@/app/api/test/route'
import { proxy } from '@/proxy'
import { enforceRateLimit, RATE_LIMIT_POLICIES } from '@/lib/rate-limit.server'

const request = (path: string, init?: RequestInit) =>
  new NextRequest(new Request(`http://localhost${path}`, init))

const mockUser = { id: '11111111-1111-4111-8111-111111111111' } as never

const assertAccessError = async (
  action: () => unknown | Promise<unknown>,
  status: number,
  code: string,
) => {
  await assert.rejects(action, (error: unknown) => {
    assert.ok(error instanceof AccessError)
    assert.equal(error.status, status)
    assert.equal(error.code, code)
    return true
  })
}

test('anonymous requests are rejected by the canonical user guard', async () => {
  await assertAccessError(
    () => requireUser(request('/api/private')),
    401,
    'unauthorized',
  )
})

test('non-admin users receive 403 from the canonical admin guard', async () => {
  await assertAccessError(
    () => requireAdmin(request('/app/admin'), {
      getUserFromRequestFn: async () => mockUser,
      getUserProfileFn: async () => ({ role: 'operator', is_superadmin: false }),
    }),
    403,
    'forbidden',
  )
})

test('admin users pass the canonical admin guard', async () => {
  const access = await requireAdmin(request('/app/admin'), {
    getUserFromRequestFn: async () => mockUser,
    getUserProfileFn: async () => ({ role: 'admin', is_superadmin: false }),
  })
  assert.equal(access.user.id, mockUser.id)
})

test('the server proxy redirects anonymous app requests to auth', async () => {
  const response = await proxy(request('/app/garden?tab=rows'))
  assert.equal(response.status, 307)
  const location = new URL(response.headers.get('location') || '')
  assert.equal(location.pathname, '/auth')
  assert.equal(location.searchParams.get('redirect'), '/app/garden?tab=rows')
})

test('cross-garden and cross-organization resources are hidden with 404', async () => {
  const missingQuery = {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
            eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
          }),
        }),
      }),
    }),
  }

  const dependencies = {
    getUserFromRequestFn: async () => mockUser,
    getSupabaseClientFn: () => missingQuery as never,
  }

  await assertAccessError(
    () => requireGardenAccess(request('/api/garden'), 'other-garden', dependencies),
    404,
    'not_found',
  )
  await assertAccessError(
    () => requireOrganizationAccess(request('/api/org'), 'other-org', dependencies),
    404,
    'not_found',
  )
})

test('cron guard rejects missing and stale credentials and blocks replay', () => {
  const previousSecret = process.env.CRON_SECRET
  process.env.CRON_SECRET = 'cron-test-secret'

  try {
    assert.throws(() => requireCron(request('/api/cron/a')), (error: unknown) => {
      assert.ok(error instanceof AccessError)
      assert.equal(error.status, 401)
      return true
    })

    assert.throws(() => requireCron(request('/api/cron/stale', {
      headers: {
        authorization: 'Bearer cron-test-secret',
        'x-cron-timestamp': String(Date.now() - 11 * 60 * 1000),
      },
    })), (error: unknown) => error instanceof AccessError && error.status === 401)

    const valid = request('/api/cron/replay', {
      headers: {
        authorization: 'Bearer cron-test-secret',
        'x-cron-timestamp': String(Date.now()),
        'x-cron-request-id': 'p1-test-replay',
      },
    })
    requireCron(valid)
    assert.throws(() => requireCron(valid), (error: unknown) =>
      error instanceof AccessError && error.status === 409 && error.code === 'replayed_cron_request')
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = previousSecret
  }
})

test('device ingestion accepts only the token assigned to that device', () => {
  const previousTokens = process.env.IOT_DEVICE_TOKENS_JSON
  process.env.IOT_DEVICE_TOKENS_JSON = JSON.stringify({ 'device-a': 'token-a' })

  try {
    assert.deepEqual(
      requireDeviceSource(request('/api/iot', { headers: { 'x-device-token': 'token-a' } }), 'device-a'),
      { deviceId: 'device-a' },
    )
    assert.throws(
      () => requireDeviceSource(request('/api/iot', { headers: { 'x-device-token': 'token-a' } }), 'device-b'),
      (error: unknown) => error instanceof AccessError && error.status === 401,
    )
  } finally {
    if (previousTokens === undefined) delete process.env.IOT_DEVICE_TOKENS_JSON
    else process.env.IOT_DEVICE_TOKENS_JSON = previousTokens
  }
})

test('NDVI, sensor and ThingsBoard write endpoints reject anonymous sources', async () => {
  const ndviResponse = await ndviPost(request('/api/ndvi/sentinel', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      gardenId: 'garden-a',
      bbox: { north: 45, south: 44, east: 12, west: 11 },
    }),
  }))
  assert.equal(ndviResponse.status, 401)

  const sensorResponse = await sensorReadingPost(request('/api/sensors/readings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ garden_id: 'garden-a', sensor_type: 'temperature', value: 20, unit: 'C' }),
  }))
  assert.equal(sensorResponse.status, 401)

  const telemetryResponse = await thingsboardTelemetryPost(request('/api/iot/telemetry', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceId: 'device-a', telemetry: { temperature: 20 } }),
  }))
  assert.equal(telemetryResponse.status, 401)
})

test('test API is unavailable in production', async () => {
  const previousNodeEnv = process.env.NODE_ENV
  Object.assign(process.env, { NODE_ENV: 'production' })
  try {
    const response = await testApiGet()
    assert.equal(response.status, 404)
  } finally {
    Object.assign(process.env, { NODE_ENV: previousNodeEnv })
  }
})

test('support rate limit returns 429 after the configured allowance', async () => {
  let lastResponse: unknown
  for (let index = 0; index <= RATE_LIMIT_POLICIES.support.limit; index += 1) {
    lastResponse = enforceRateLimit(request('/api/support/submit', {
      headers: { 'x-forwarded-for': '203.0.113.77' },
    }), RATE_LIMIT_POLICIES.support)
  }
  assert.ok(lastResponse instanceof Response)
  assert.equal(lastResponse.status, 429)
})
