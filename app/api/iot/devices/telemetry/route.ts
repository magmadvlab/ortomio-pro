import { NextRequest, NextResponse } from 'next/server'
import { requireSupabase } from '@/lib/supabase-server'
import { mapSmartDeviceFromDb, mapSmartDeviceToDb } from '@/utils/smartDeviceDb'
import { mapSmartDeviceAutomationLogToDb } from '@/utils/smartDeviceAutomationLogDb'
import { SmartDevice } from '@/types'

type CommandStatus = NonNullable<SmartDevice['lastCommandStatus']>
type IrrigationOutcome = NonNullable<SmartDevice['lastIrrigationOutcome']>

const TELEMETRY_SECRET = process.env.IOT_WEBHOOK_SECRET

const isAuthorized = (request: NextRequest) => {
  if (!TELEMETRY_SECRET) {
    return process.env.NODE_ENV === 'development'
  }

  const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const headerToken = request.headers.get('x-iot-secret')
  return bearerToken === TELEMETRY_SECRET || headerToken === TELEMETRY_SECRET
}

const normalizeOutcome = (value: unknown): IrrigationOutcome | undefined => {
  if (value === 'nominal' || value === 'warning' || value === 'critical') {
    return value
  }

  return undefined
}

type TelemetryRouteDependencies = {
  requireSupabaseFn?: typeof requireSupabase
  isAuthorizedFn?: (request: NextRequest) => boolean
}

const AUDIT_METADATA_KEYS = [
  'auditStatus',
  'auditIncomplete',
  'auditFailureAt',
  'auditRetryCount',
  'auditLastError',
  'auditLastSource',
] as const

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const clearAuditMetadata = (metadata?: SmartDevice['metadata']): SmartDevice['metadata'] | undefined => {
  if (!metadata) {
    return undefined
  }

  const nextEntries = Object.entries(metadata).filter(([key]) => !AUDIT_METADATA_KEYS.includes(key as typeof AUDIT_METADATA_KEYS[number]))
  return nextEntries.length > 0 ? Object.fromEntries(nextEntries) : undefined
}

const mapDeviceUpdateWithMetadata = (
  currentDevice: SmartDevice,
  updates: Partial<SmartDevice>
) => {
  const mergedDevice = {
    ...currentDevice,
    ...updates,
  }
  const dbPayload = mapSmartDeviceToDb(mergedDevice)

  if (updates.metadata === undefined && currentDevice.metadata !== undefined) {
    dbPayload.metadata = null
  }

  return dbPayload
}

const buildAuditIncompleteMetadata = (
  currentMetadata: SmartDevice['metadata'] | undefined,
  options: {
    failedAt: string
    retryCount: number
    errorMessage?: string
  }
): SmartDevice['metadata'] => ({
  ...(clearAuditMetadata(currentMetadata) ?? {}),
  auditStatus: 'incomplete',
  auditIncomplete: true,
  auditFailureAt: options.failedAt,
  auditRetryCount: options.retryCount,
  auditLastError: options.errorMessage ?? 'unknown_audit_error',
  auditLastSource: 'telemetry',
})

const insertTelemetryAuditLog = async (
  supabase: ReturnType<typeof requireSupabase>,
  payload: Record<string, unknown>,
  attempts = 3
) => {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const { data, error } = await supabase
      .from('smart_device_automation_logs')
      .insert(payload)
      .select('id')
      .single()

    if (!error && data) {
      return {
        data,
        attemptsUsed: attempt,
        error: null,
      }
    }

    lastError = error

    if (attempt < attempts) {
      await delay(attempt * 150)
    }
  }

  return {
    data: null,
    attemptsUsed: attempts,
    error: lastError,
  }
}

export const createTelemetryPostHandler = (
  dependencies: TelemetryRouteDependencies = {}
) => async (request: NextRequest) => {
  const requireSupabaseFn = dependencies.requireSupabaseFn ?? requireSupabase
  const isAuthorizedFn = dependencies.isAuthorizedFn ?? isAuthorized

  try {
    if (!isAuthorizedFn(request)) {
      return NextResponse.json({ error: 'unauthorized_webhook' }, { status: 401 })
    }

    const body = await request.json()
    const { deviceId, externalDeviceId, telemetry } = body ?? {}

    if ((!deviceId && !externalDeviceId) || !telemetry || typeof telemetry !== 'object') {
      return NextResponse.json(
        { error: 'missing_required_fields', message: 'Servono deviceId o externalDeviceId e un payload telemetry valido' },
        { status: 400 }
      )
    }

    const supabase = requireSupabaseFn()
    let query = supabase.from('smart_devices').select('*')
    query = deviceId ? query.eq('id', deviceId) : query.eq('external_device_id', externalDeviceId)

    const { data: currentDeviceRow, error: currentDeviceError } = await query.single()
    if (currentDeviceError || !currentDeviceRow) {
      return NextResponse.json({ error: 'device_not_found' }, { status: 404 })
    }

    const currentDevice = mapSmartDeviceFromDb(currentDeviceRow)
    const recordedAt = typeof telemetry.recordedAt === 'string'
      ? telemetry.recordedAt
      : typeof telemetry.recorded_at === 'string'
      ? telemetry.recorded_at
      : new Date().toISOString()

    const confirmedValveState =
      typeof telemetry.lastConfirmedValveState === 'boolean'
        ? telemetry.lastConfirmedValveState
        : typeof telemetry.valveConfirmedState === 'boolean'
        ? telemetry.valveConfirmedState
        : typeof telemetry.isValveOpen === 'boolean'
        ? telemetry.isValveOpen
        : undefined

    const flowRateActualLpm =
      typeof telemetry.flowRateActualLpm === 'number'
        ? telemetry.flowRateActualLpm
        : typeof telemetry.flow_rate_actual_lpm === 'number'
        ? telemetry.flow_rate_actual_lpm
        : undefined

    const linePressureBar =
      typeof telemetry.linePressureBar === 'number'
        ? telemetry.linePressureBar
        : typeof telemetry.line_pressure_bar === 'number'
        ? telemetry.line_pressure_bar
        : undefined

    const sessionLiters =
      typeof telemetry.sessionLiters === 'number'
        ? telemetry.sessionLiters
        : typeof telemetry.session_liters === 'number'
        ? telemetry.session_liters
        : undefined

    const moisture =
      typeof telemetry.moisture === 'number'
        ? telemetry.moisture
        : typeof telemetry.soilMoisture === 'number'
        ? telemetry.soilMoisture
        : undefined

    const irrigationDeltaMoisture =
      typeof telemetry.irrigationDeltaMoisture === 'number'
        ? telemetry.irrigationDeltaMoisture
        : typeof telemetry.irrigation_delta_moisture === 'number'
        ? telemetry.irrigation_delta_moisture
        : undefined

    const lastIrrigationOutcome = normalizeOutcome(
      telemetry.lastIrrigationOutcome ?? telemetry.last_irrigation_outcome
    )

    const updates: Partial<SmartDevice> = {
      isOnline: true,
      lastTelemetryAt: recordedAt,
      flowRateActualLpm,
      linePressureBar,
      sessionLiters,
      moisture,
      lastIrrigationDeltaMoisture: irrigationDeltaMoisture,
      lastIrrigationOutcome,
      lastUpdate: recordedAt,
      metadata: clearAuditMetadata(currentDevice.metadata),
    }

    if (confirmedValveState !== undefined) {
      updates.isValveOpen = confirmedValveState
      updates.lastConfirmedValveState = confirmedValveState
      updates.lastConfirmedValveAt = recordedAt
      updates.lastCommandStatus = 'confirmed' as CommandStatus
      updates.lastCommandError = undefined

      if (currentDevice.lastCommandAt) {
        updates.lastCommandLatencyMs = Math.max(
          0,
          new Date(recordedAt).getTime() - new Date(currentDevice.lastCommandAt).getTime()
        )
      }

      if (!confirmedValveState) {
        updates.lastIrrigationCompletedAt = recordedAt
      }
    }

    const { data: updatedDeviceRow, error: updateError } = await supabase
      .from('smart_devices')
      .update(mapDeviceUpdateWithMetadata(currentDevice, updates))
      .eq('id', currentDevice.id)
      .select('*')
      .single()

    if (updateError || !updatedDeviceRow) {
      return NextResponse.json({ error: 'device_update_failed', details: updateError?.message }, { status: 500 })
    }

    const logInsertPayload = {
      ...mapSmartDeviceAutomationLogToDb({
        gardenId: currentDevice.gardenId,
        deviceId: currentDevice.id,
        provider: currentDevice.provider,
        eventType: lastIrrigationOutcome ? 'outcome' : 'telemetry',
        source: 'telemetry',
        eventAt: recordedAt,
        scopeType: currentDevice.scopeType,
        scopeId: currentDevice.scopeId,
        zoneId: currentDevice.zoneId,
        fieldRowId: currentDevice.fieldRowId,
        treeId: currentDevice.treeId,
        plantId: currentDevice.plantId,
        decision: currentDevice.lastAutomationDecision,
        trigger: currentDevice.lastAutomationTrigger,
        confidence: currentDevice.lastAutomationConfidence,
        reason: confirmedValveState !== undefined
          ? 'Conferma telemetrica ricevuta dal dispositivo.'
          : 'Telemetria aggiornata da integrazione IoT.',
        commandStatus: confirmedValveState !== undefined ? 'confirmed' : currentDevice.lastCommandStatus,
        commandedValveState: currentDevice.lastCommandedValveState,
        confirmedValveState,
        targetLiters: currentDevice.targetLiters,
        sessionLiters: sessionLiters ?? currentDevice.sessionLiters,
        moisture: moisture ?? currentDevice.moisture,
        irrigationDeltaMoisture: irrigationDeltaMoisture,
        irrigationOutcome: lastIrrigationOutcome,
        flowRateActualLpm,
        linePressureBar,
        metadata: {
          auditSource: 'telemetry',
        },
      }),
      user_id: currentDeviceRow.user_id,
    }

    const {
      data: insertedLogRow,
      error: logInsertError,
      attemptsUsed: logInsertAttempts,
    } = await insertTelemetryAuditLog(supabase, logInsertPayload)

    if (logInsertError || !insertedLogRow) {
      console.warn('Impossibile salvare il log telemetrico smart device:', logInsertError)
      const auditIncompleteMetadata = buildAuditIncompleteMetadata(currentDevice.metadata, {
        failedAt: recordedAt,
        retryCount: logInsertAttempts,
        errorMessage:
          logInsertError instanceof Error
            ? logInsertError.message
            : typeof logInsertError === 'object' && logInsertError !== null && 'message' in logInsertError
            ? String((logInsertError as { message?: unknown }).message)
            : undefined,
      })

      const { data: auditFlaggedDeviceRow } = await supabase
        .from('smart_devices')
        .update(mapDeviceUpdateWithMetadata(currentDevice, { ...updates, metadata: auditIncompleteMetadata }))
        .eq('id', currentDevice.id)
        .select('*')
        .single()

      return NextResponse.json(
        {
          success: false,
          warning: 'telemetry_audit_incomplete',
          message: 'Telemetria aggiornata sul device, ma log audit non salvato.',
          auditRetryCount: logInsertAttempts,
          device: mapSmartDeviceFromDb(auditFlaggedDeviceRow ?? updatedDeviceRow),
        },
        { status: 202 }
      )
    }

    return NextResponse.json({
      success: true,
      auditLogged: true,
      device: mapSmartDeviceFromDb(updatedDeviceRow),
    })
  } catch (error) {
    console.error('Errore ingest telemetria smart device:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export const POST = createTelemetryPostHandler()
