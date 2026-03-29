import test from 'node:test'
import assert from 'node:assert/strict'

import { createCommandPostHandler } from '@/app/api/iot/devices/command/commandHandler'

const createRequest = (body: unknown) =>
  new Request('http://localhost/api/iot/devices/command', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

const createSupabaseForCommand = (options?: {
  deviceRow?: {
    id: string
    provider?: string
    external_device_id?: string | null
    garden_id: string
  } | null
  ownsGarden?: boolean
}) => ({
  from: (table: string) => {
    if (table === 'smart_devices') {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: options?.deviceRow ?? {
                id: 'device-1',
                provider: 'thingsboard',
                external_device_id: 'tb-1',
                garden_id: 'garden-1',
              },
              error: options?.deviceRow === null ? { message: 'not found' } : null,
            }),
          }),
        }),
      }
    }

    if (table === 'gardens') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: options?.ownsGarden === false ? null : { id: 'garden-1' },
                error: null,
              }),
            }),
          }),
        }),
      }
    }

    throw new Error(`Unexpected table ${table}`)
  },
})

test('command handler rejects missing required fields', async () => {
  const handler = createCommandPostHandler({
    isSupabaseAvailableFn: () => true,
  })

  const response = await handler(createRequest({ deviceId: 'device-1' }) as never)

  assert.equal(response.status, 400)
  const payload = await response.json()
  assert.equal(payload.error, 'missing_required_fields')
})

test('command handler returns simulated response when Supabase is unavailable', async () => {
  const handler = createCommandPostHandler({
    isSupabaseAvailableFn: () => false,
  })

  const response = await handler(
    createRequest({
      deviceId: 'device-1',
      desiredValveState: true,
    }) as never
  )

  assert.equal(response.status, 200)
  const payload = await response.json()
  assert.equal(payload.success, true)
  assert.equal(payload.simulated, true)
})

test('command handler dispatches ThingsBoard attributes for supported cloud devices', async () => {
  const sentAttributes: Array<Record<string, unknown>> = []
  const handler = createCommandPostHandler({
    isSupabaseAvailableFn: () => true,
    verifyTierFn: async () => ({
      user: { id: 'user-1' },
      profile: { id: 'profile-1' },
      tier: 'PRO',
    }) as never,
    getSupabaseClientFn: () => createSupabaseForCommand() as never,
    sendThingsboardAttributesFn: async (payload) => {
      sentAttributes.push(payload)
    },
  })

  const response = await handler(
    createRequest({
      deviceId: 'device-1',
      desiredValveState: true,
    }) as never
  )

  assert.equal(response.status, 200)
  const payload = await response.json()
  assert.equal(payload.success, true)
  assert.equal(payload.provider, 'thingsboard')
  assert.equal(payload.queued, true)
  assert.equal(sentAttributes.length, 1)
  assert.equal(sentAttributes[0]?.commandType, 'valve_toggle')
  assert.equal(sentAttributes[0]?.targetDeviceId, 'tb-1')
  assert.equal(sentAttributes[0]?.desiredValveState, true)
})

test('command handler returns 501 for Tuya devices without attempting dispatch', async () => {
  let dispatchAttempts = 0
  const handler = createCommandPostHandler({
    isSupabaseAvailableFn: () => true,
    verifyTierFn: async () => ({
      user: { id: 'user-1' },
      profile: { id: 'profile-1' },
      tier: 'PRO',
    }) as never,
    getSupabaseClientFn: () =>
      createSupabaseForCommand({
        deviceRow: {
          id: 'device-tuya',
          provider: 'tuya',
          external_device_id: 'tuya-1',
          garden_id: 'garden-1',
        },
      }) as never,
    sendThingsboardAttributesFn: async () => {
      dispatchAttempts += 1
    },
  })

  const response = await handler(
    createRequest({
      deviceId: 'device-tuya',
      desiredValveState: false,
    }) as never
  )

  assert.equal(response.status, 501)
  const payload = await response.json()
  assert.equal(payload.error, 'provider_not_supported')
  assert.equal(dispatchAttempts, 0)
})

test('command handler forbids devices outside the user garden', async () => {
  const handler = createCommandPostHandler({
    isSupabaseAvailableFn: () => true,
    verifyTierFn: async () => ({
      user: { id: 'user-1' },
      profile: { id: 'profile-1' },
      tier: 'FREE',
    }) as never,
    getSupabaseClientFn: () =>
      createSupabaseForCommand({
        ownsGarden: false,
      }) as never,
  })

  const response = await handler(
    createRequest({
      deviceId: 'device-1',
      desiredValveState: true,
    }) as never
  )

  assert.equal(response.status, 403)
  const payload = await response.json()
  assert.equal(payload.error, 'forbidden')
})
