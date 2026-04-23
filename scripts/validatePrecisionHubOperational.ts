import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import type { SmartDevice, SmartDeviceAutomationLog } from '@/types'

import { SupabaseStorageProvider } from '@/packages/storage-cloud/SupabaseStorageProvider'
import { createTelemetryPostHandler } from '@/app/api/iot/devices/telemetry/route'

type DbRow = Record<string, unknown>

const DB_HOST = process.env.PRECISION_DB_HOST || 'aws-1-eu-west-1.pooler.supabase.com'
const DB_PORT = process.env.PRECISION_DB_PORT || '6543'
const DB_NAME = process.env.PRECISION_DB_NAME || 'postgres'
const DB_USER = process.env.PRECISION_DB_USER || 'postgres.qhmujoivfxftlrcrluaj'
const DB_PASSWORD = process.env.PGPASSWORD

if (!DB_PASSWORD) {
  throw new Error('PGPASSWORD is required to run validatePrecisionHubOperational.ts')
}

const sqlLiteral = (value: unknown): string => {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 'NULL'
    return String(value)
  }
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (value instanceof Date) return sqlLiteral(value.toISOString())
  if (typeof value === 'object') {
    const json = JSON.stringify(value).replace(/'/g, "''")
    return `'${json}'::jsonb`
  }

  return `'${String(value).replace(/'/g, "''")}'`
}

const runSql = (query: string) => execFileSync(
  'psql',
  [
    '-h', DB_HOST,
    '-p', DB_PORT,
    '-d', DB_NAME,
    '-U', DB_USER,
    '-P', 'pager=off',
    '-At',
    '-c', query,
  ],
  {
    encoding: 'utf8',
    env: {
      ...process.env,
      PGPASSWORD: DB_PASSWORD,
    },
  }
).trim()

const runSqlJson = <T = DbRow>(query: string): T[] => {
  const wrappedQuery = `SELECT COALESCE(json_agg(row_to_json(q)), '[]'::json) FROM (${query}) q;`
  const raw = runSql(wrappedQuery)
  return JSON.parse(raw || '[]') as T[]
}

const runSqlOne = <T = DbRow>(query: string): T | null => runSqlJson<T>(query)[0] ?? null

const buildWhereClause = (filters: Array<{ column: string; value: unknown }>) => {
  if (filters.length === 0) {
    return ''
  }

  return ` WHERE ${filters.map(filter => `${filter.column} = ${sqlLiteral(filter.value)}`).join(' AND ')}`
}

const insertRow = (table: string, payload: DbRow) => {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined)
  const columns = entries.map(([column]) => column).join(', ')
  const values = entries.map(([, value]) => sqlLiteral(value)).join(', ')
  const raw = runSql(`WITH q AS (INSERT INTO public.${table} (${columns}) VALUES (${values}) RETURNING *) SELECT row_to_json(q) FROM q;`)
  return raw ? JSON.parse(raw) as DbRow : null
}

const updateRow = (table: string, payload: DbRow, filters: Array<{ column: string; value: unknown }>) => {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined)
  const assignments = entries.map(([column, value]) => `${column} = ${sqlLiteral(value)}`).join(', ')
  const raw = runSql(`WITH q AS (UPDATE public.${table} SET ${assignments}${buildWhereClause(filters)} RETURNING *) SELECT row_to_json(q) FROM q;`)
  return raw ? JSON.parse(raw) as DbRow : null
}

const deleteRows = (table: string, filters: Array<{ column: string; value: unknown }>) => {
  runSql(`DELETE FROM public.${table}${buildWhereClause(filters)};`)
}

const selectOne = (table: string, filters: Array<{ column: string; value: unknown }>) =>
  runSqlOne(`SELECT * FROM public.${table}${buildWhereClause(filters)} LIMIT 1`)

const createDbAdapter = (userId: string) => ({
  auth: {
    getUser: async () => ({
      data: {
        user: {
          id: userId,
        },
      },
    }),
  },
  from: (table: string) => {
    if (table === 'smart_devices') {
      return {
        select: () => {
          const filters: Array<{ column: string; value: unknown }> = []

          return {
            eq: (column: string, value: unknown) => {
              filters.push({ column, value })
              return {
                single: async () => ({
                  data: selectOne('smart_devices', filters),
                  error: selectOne('smart_devices', filters) ? null : { message: 'not found' },
                }),
              }
            },
            single: async () => ({
              data: selectOne('smart_devices', filters),
              error: selectOne('smart_devices', filters) ? null : { message: 'not found' },
            }),
          }
        },
        insert: (payload: DbRow) => ({
          select: () => ({
            single: async () => ({
              data: insertRow('smart_devices', payload),
              error: null,
            }),
          }),
        }),
        update: (payload: DbRow) => {
          const filters: Array<{ column: string; value: unknown }> = []
          return {
            eq: (column: string, value: unknown) => {
              filters.push({ column, value })
              return {
                select: () => ({
                  single: async () => ({
                    data: updateRow('smart_devices', payload, filters),
                    error: null,
                  }),
                }),
              }
            },
          }
        },
        delete: () => {
          const filters: Array<{ column: string; value: unknown }> = []
          return {
            eq: async (column: string, value: unknown) => {
              filters.push({ column, value })
              deleteRows('smart_devices', filters)
              return {
                error: null,
              }
            },
          }
        },
      }
    }

    if (table === 'smart_device_automation_logs') {
      return {
        insert: (payload: DbRow) => ({
          select: () => ({
            single: async () => ({
              data: insertRow('smart_device_automation_logs', payload),
              error: null,
            }),
          }),
        }),
      }
    }

    throw new Error(`Unsupported table ${table}`)
  },
})

type ValidationProvider = {
  createDevice(device: Omit<SmartDevice, 'id' | 'lastUpdate'>): Promise<SmartDevice>
  updateDevice(id: string, updates: Partial<SmartDevice>): Promise<SmartDevice>
  createSmartDeviceAutomationLog(
    input: Omit<SmartDeviceAutomationLog, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SmartDeviceAutomationLog>
}

const main = async () => {
  const baseGarden = runSqlOne<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM public.gardens WHERE user_id IS NOT NULL ORDER BY created_at ASC LIMIT 1`
  )

  if (!baseGarden) {
    throw new Error('No garden with user_id found for validation')
  }

  const validationId = `precision-e2e-${Date.now()}`
  const adapter = createDbAdapter(baseGarden.user_id)
  const providerInstance = new SupabaseStorageProvider()
  Reflect.set(providerInstance as object, 'client', adapter)
  const provider = providerInstance as unknown as ValidationProvider

  let createdDeviceId: string | undefined

  try {
    const createdDevice = await provider.createDevice({
      gardenId: baseGarden.id,
      name: `E2E Validation ${validationId}`,
      type: 'Valve',
      provider: 'thingsboard',
      deviceCategory: 'irrigation_valve',
      connectionType: 'cloud',
      externalDeviceId: validationId,
      scopeType: 'zone',
      scopeId: `scope-${validationId}`,
      zoneId: `scope-${validationId}`,
      moisture: 34,
      isValveOpen: false,
      flowRateLpm: 9,
      sessionLiters: 0,
      targetLiters: 18,
      autoThreshold: 28,
      autoMode: true,
    })

    createdDeviceId = createdDevice.id

    const createdDeviceRow = runSqlOne<{ id: string; name: string; target_liters: string; auto_mode: boolean }>(
      `SELECT id, name, target_liters, auto_mode FROM public.smart_devices WHERE id = ${sqlLiteral(createdDevice.id)}`
    )
    assert.ok(createdDeviceRow, 'device row should exist after provider.createDevice')
    assert.equal(createdDeviceRow?.name, `E2E Validation ${validationId}`)

    const updatedDevice = await provider.updateDevice(createdDevice.id, {
      targetLiters: 22,
      autoThreshold: 31,
      lastCommandStatus: 'pending',
      lastCommandAt: '2026-03-20T12:00:00.000Z',
      lastCommandedValveState: true,
    })

    const updatedDeviceRow = runSqlOne<{
      target_liters: string
      auto_threshold: string
      last_command_status: string
    }>(
      `SELECT target_liters, auto_threshold, last_command_status FROM public.smart_devices WHERE id = ${sqlLiteral(createdDevice.id)}`
    )
    assert.equal(Number(updatedDeviceRow?.target_liters), 22)
    assert.equal(Number(updatedDeviceRow?.auto_threshold), 31)
    assert.equal(updatedDeviceRow?.last_command_status, 'pending')
    assert.equal(updatedDevice.lastCommandStatus, 'pending')

    const createdLog = await provider.createSmartDeviceAutomationLog({
      gardenId: baseGarden.id,
      deviceId: createdDevice.id,
      provider: 'thingsboard',
      eventType: 'decision',
      source: 'automation',
      eventAt: '2026-03-20T12:00:30.000Z',
      scopeType: 'zone',
      scopeId: `scope-${validationId}`,
      zoneId: `scope-${validationId}`,
      decision: 'open_now',
      trigger: 'water_stress',
      confidence: 'high',
      reason: 'E2E validation log',
      commandStatus: 'pending',
      commandedValveState: true,
      confirmedValveState: false,
      targetLiters: 22,
      sessionLiters: 0,
      moisture: 34,
      metadata: {
        validationId,
      },
    })

    const createdLogRow = runSqlOne<{ id: string; event_type: string; source: string }>(
      `SELECT id, event_type, source FROM public.smart_device_automation_logs WHERE id = ${sqlLiteral(createdLog.id)}`
    )
    assert.ok(createdLogRow, 'automation log should exist after provider.createSmartDeviceAutomationLog')
    assert.equal(createdLogRow?.event_type, 'decision')
    assert.equal(createdLogRow?.source, 'automation')

    const telemetryHandler = createTelemetryPostHandler({
      requireSupabaseFn: () => adapter as never,
      isAuthorizedFn: () => true,
    })

    const telemetryResponse = await telemetryHandler(
      new Request('http://localhost/api/iot/devices/telemetry', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: createdDevice.id,
          telemetry: {
            recordedAt: '2026-03-20T12:01:00.000Z',
            isValveOpen: true,
            flowRateActualLpm: 8.7,
            linePressureBar: 1.6,
            sessionLiters: 6.4,
            moisture: 38,
          },
        }),
      }) as never
    )

    assert.equal(telemetryResponse.status, 200)
    const telemetryPayload = await telemetryResponse.json()
    assert.equal(telemetryPayload.success, true)
    assert.equal(telemetryPayload.auditLogged, true)

    const telemetryDeviceRow = runSqlOne<{
      last_command_status: string
      last_confirmed_valve_state: boolean
      flow_rate_actual_lpm: string
      line_pressure_bar: string
      session_liters: string
      moisture: string
    }>(
      `SELECT last_command_status, last_confirmed_valve_state, flow_rate_actual_lpm, line_pressure_bar, session_liters, moisture
       FROM public.smart_devices
       WHERE id = ${sqlLiteral(createdDevice.id)}`
    )

    assert.equal(telemetryDeviceRow?.last_command_status, 'confirmed')
    assert.equal(telemetryDeviceRow?.last_confirmed_valve_state, true)
    assert.equal(Number(telemetryDeviceRow?.flow_rate_actual_lpm), 8.7)
    assert.equal(Number(telemetryDeviceRow?.line_pressure_bar), 1.6)
    assert.equal(Number(telemetryDeviceRow?.session_liters), 6.4)
    assert.equal(Number(telemetryDeviceRow?.moisture), 38)

    const telemetryLogs = runSqlJson<{ event_type: string; source: string }>(
      `SELECT event_type, source
       FROM public.smart_device_automation_logs
       WHERE device_id = ${sqlLiteral(createdDevice.id)}
       ORDER BY created_at DESC
       LIMIT 5`
    )

    assert.ok(
      telemetryLogs.some(log => log.event_type === 'telemetry' && log.source === 'telemetry'),
      'telemetry log should be written by webhook handler'
    )

    console.log(JSON.stringify({
      success: true,
      validationId,
      gardenId: baseGarden.id,
      userId: baseGarden.user_id,
      deviceId: createdDevice.id,
      createdLogId: createdLog.id,
      checks: {
        providerCreateAndUpdate: true,
        automationLogWrite: true,
        telemetryWebhookUpdate: true,
      },
    }, null, 2))
  } finally {
    if (createdDeviceId) {
      deleteRows('smart_device_automation_logs', [{ column: 'device_id', value: createdDeviceId }])
      deleteRows('smart_devices', [{ column: 'id', value: createdDeviceId }])
    }
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
