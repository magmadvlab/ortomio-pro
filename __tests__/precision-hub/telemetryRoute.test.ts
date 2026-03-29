import test from 'node:test'
import assert from 'node:assert/strict'

import { createTelemetryPostHandler } from '@/app/api/iot/devices/telemetry/route'

const createCurrentDeviceRow = () => ({
  id: 'device-1',
  user_id: 'user-1',
  garden_id: 'garden-1',
  name: 'Valvola test',
  type: 'Valve',
  provider: 'thingsboard',
  device_category: 'irrigation_valve',
  connection_type: 'cloud',
  scope_type: 'zone',
  scope_id: 'zone-1',
  zone_id: 'zone-1',
  last_command_at: '2026-03-20T09:59:00.000Z',
  last_command_status: 'pending',
  last_commanded_valve_state: true,
  moisture: 42,
  is_valve_open: false,
  flow_rate_lpm: 12,
  session_liters: 0,
  target_liters: 20,
  auto_threshold: 30,
  auto_mode: false,
  created_at: '2026-03-20T09:00:00.000Z',
  updated_at: '2026-03-20T09:59:00.000Z',
})

const createRequest = (body: unknown) =>
  new Request('http://localhost/api/iot/devices/telemetry', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

test('telemetry handler returns 202 when device update succeeds but audit log insert fails', async () => {
  const currentDeviceRow = createCurrentDeviceRow()
  const updatePayloads: Array<Record<string, unknown>> = []

  const supabase = {
    from: (table: string) => {
      if (table === 'smart_devices') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: currentDeviceRow, error: null }),
            }),
          }),
          update: (payload: Record<string, unknown>) => {
            updatePayloads.push(payload)
            return {
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data: {
                      ...currentDeviceRow,
                      ...payload,
                      updated_at: '2026-03-20T10:00:00.000Z',
                    },
                    error: null,
                  }),
                }),
              }),
            }
          },
        }
      }

      if (table === 'smart_device_automation_logs') {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: null,
                error: { message: 'audit insert failed' },
              }),
            }),
          }),
        }
      }

      throw new Error(`Unexpected table ${table}`)
    },
  }

  const handler = createTelemetryPostHandler({
    requireSupabaseFn: () => supabase as never,
    isAuthorizedFn: () => true,
  })

  const response = await handler(
    createRequest({
      deviceId: 'device-1',
      telemetry: {
        recordedAt: '2026-03-20T10:00:00.000Z',
        isValveOpen: true,
        flowRateActualLpm: 11.5,
        linePressureBar: 1.7,
      },
    }) as never
  )

  assert.equal(response.status, 202)
  const payload = await response.json()
  assert.equal(payload.success, false)
  assert.equal(payload.warning, 'telemetry_audit_incomplete')
  assert.equal(payload.auditRetryCount, 3)
  assert.equal(payload.device.id, 'device-1')
  assert.equal(updatePayloads[0]?.last_command_status, 'confirmed')
  assert.equal(updatePayloads[0]?.last_confirmed_valve_state, true)
  assert.equal(payload.device.metadata.auditStatus, 'incomplete')
  assert.equal(payload.device.metadata.auditIncomplete, true)
  assert.equal(payload.device.metadata.auditRetryCount, 3)
})

test('telemetry handler returns 200, logs audit, and clears previous audit incomplete metadata', async () => {
  const currentDeviceRow = {
    ...createCurrentDeviceRow(),
    metadata: {
      auditStatus: 'incomplete',
      auditIncomplete: true,
      auditFailureAt: '2026-03-20T09:58:00.000Z',
      auditRetryCount: 3,
      auditLastError: 'old error',
      keepMe: 'yes',
    },
  }
  let updatedPayload: Record<string, unknown> | null = null

  const supabase = {
    from: (table: string) => {
      if (table === 'smart_devices') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: currentDeviceRow, error: null }),
            }),
          }),
          update: (payload: Record<string, unknown>) => {
            updatedPayload = payload
            return {
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data: {
                      ...currentDeviceRow,
                      ...payload,
                      updated_at: '2026-03-20T10:00:00.000Z',
                    },
                    error: null,
                  }),
                }),
              }),
            }
          },
        }
      }

      if (table === 'smart_device_automation_logs') {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: 'log-1' },
                error: null,
              }),
            }),
          }),
        }
      }

      throw new Error(`Unexpected table ${table}`)
    },
  }

  const handler = createTelemetryPostHandler({
    requireSupabaseFn: () => supabase as never,
    isAuthorizedFn: () => true,
  })

  const response = await handler(
    createRequest({
      externalDeviceId: 'tb-device-1',
      telemetry: {
        recorded_at: '2026-03-20T10:00:00.000Z',
        lastConfirmedValveState: false,
        lastIrrigationOutcome: 'nominal',
        session_liters: 19.5,
        irrigation_delta_moisture: 4.2,
      },
    }) as never
  )

  assert.equal(response.status, 200)
  const payload = await response.json()
  assert.equal(payload.success, true)
  assert.equal(payload.auditLogged, true)
  assert.equal(payload.device.id, 'device-1')
  assert.deepEqual(updatedPayload?.metadata, { keepMe: 'yes' })
})
