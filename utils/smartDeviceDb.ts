import { SmartDevice } from '@/types'
import { normalizeSmartDeviceScope } from '@/utils/smartDeviceScope'

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? undefined : numericValue
}

export const mapSmartDeviceFromDb = (db: Record<string, unknown>): SmartDevice => {
  const device: SmartDevice = {
    id: String(db.id),
    gardenId: String(db.garden_id),
    name: String(db.name),
    type: db.type as SmartDevice['type'],
    provider: db.provider as SmartDevice['provider'],
    deviceCategory: db.device_category as SmartDevice['deviceCategory'],
    connectionType: db.connection_type as SmartDevice['connectionType'],
    externalDeviceId: db.external_device_id ? String(db.external_device_id) : undefined,
    sensorId: db.sensor_id ? String(db.sensor_id) : undefined,
    scopeType: db.scope_type as SmartDevice['scopeType'],
    scopeId: db.scope_id ? String(db.scope_id) : undefined,
    zoneId: db.zone_id ? String(db.zone_id) : undefined,
    fieldRowId: db.field_row_id ? String(db.field_row_id) : undefined,
    treeId: db.tree_id ? String(db.tree_id) : undefined,
    plantId: db.plant_id ? String(db.plant_id) : undefined,
    isOnline: db.is_online as boolean | undefined,
    lastTelemetryAt: db.last_telemetry_at ? String(db.last_telemetry_at) : undefined,
    lastCommandAt: db.last_command_at ? String(db.last_command_at) : undefined,
    lastCommandStatus: db.last_command_status as SmartDevice['lastCommandStatus'],
    lastCommandedValveState: db.last_commanded_valve_state as boolean | undefined,
    lastConfirmedValveState: db.last_confirmed_valve_state as boolean | undefined,
    lastConfirmedValveAt: db.last_confirmed_valve_at ? String(db.last_confirmed_valve_at) : undefined,
    lastCommandError: db.last_command_error ? String(db.last_command_error) : undefined,
    lastCommandLatencyMs: toOptionalNumber(db.last_command_latency_ms),
    lastIrrigationStartedAt: db.last_irrigation_started_at ? String(db.last_irrigation_started_at) : undefined,
    lastIrrigationCompletedAt: db.last_irrigation_completed_at ? String(db.last_irrigation_completed_at) : undefined,
    lastIrrigationBaselineMoisture: toOptionalNumber(db.last_irrigation_baseline_moisture),
    lastIrrigationDeltaMoisture: toOptionalNumber(db.last_irrigation_delta_moisture),
    lastIrrigationOutcome: db.last_irrigation_outcome as SmartDevice['lastIrrigationOutcome'],
    lastAutomationEvaluatedAt: db.last_automation_evaluated_at ? String(db.last_automation_evaluated_at) : undefined,
    lastAutomationDecision: db.last_automation_decision as SmartDevice['lastAutomationDecision'],
    lastAutomationTrigger: db.last_automation_trigger as SmartDevice['lastAutomationTrigger'],
    lastAutomationReason: db.last_automation_reason ? String(db.last_automation_reason) : undefined,
    lastAutomationConfidence: db.last_automation_confidence as SmartDevice['lastAutomationConfidence'],
    lastAutomationTargetLiters: toOptionalNumber(db.last_automation_target_liters),
    flowRateActualLpm: toOptionalNumber(db.flow_rate_actual_lpm),
    linePressureBar: toOptionalNumber(db.line_pressure_bar),
    metadata: (db.metadata as SmartDevice['metadata']) ?? undefined,
    moisture: toOptionalNumber(db.moisture) ?? 0,
    isValveOpen: Boolean(db.is_valve_open),
    flowRateLpm: toOptionalNumber(db.flow_rate_lpm) ?? 0,
    sessionLiters: toOptionalNumber(db.session_liters) ?? 0,
    targetLiters: toOptionalNumber(db.target_liters) ?? 0,
    autoThreshold: toOptionalNumber(db.auto_threshold) ?? 0,
    autoMode: Boolean(db.auto_mode),
    lastUpdate: String(db.updated_at ?? db.created_at ?? new Date().toISOString()),
  }

  return normalizeSmartDeviceScope(device)
}

export const mapSmartDeviceToDb = (device: Partial<SmartDevice>) => {
  const normalizedDevice = normalizeSmartDeviceScope(device)
  const db: Record<string, unknown> = {}

  if (normalizedDevice.gardenId !== undefined) db.garden_id = normalizedDevice.gardenId
  if (normalizedDevice.name !== undefined) db.name = normalizedDevice.name
  if (normalizedDevice.type !== undefined) db.type = normalizedDevice.type
  if (normalizedDevice.provider !== undefined) db.provider = normalizedDevice.provider
  if (normalizedDevice.deviceCategory !== undefined) db.device_category = normalizedDevice.deviceCategory
  if (normalizedDevice.connectionType !== undefined) db.connection_type = normalizedDevice.connectionType
  if (normalizedDevice.externalDeviceId !== undefined) db.external_device_id = normalizedDevice.externalDeviceId
  if (normalizedDevice.sensorId !== undefined) db.sensor_id = normalizedDevice.sensorId
  if (normalizedDevice.scopeType !== undefined) db.scope_type = normalizedDevice.scopeType
  if (normalizedDevice.scopeId !== undefined) db.scope_id = normalizedDevice.scopeId
  if (normalizedDevice.zoneId !== undefined) db.zone_id = normalizedDevice.zoneId
  if (normalizedDevice.fieldRowId !== undefined) db.field_row_id = normalizedDevice.fieldRowId
  if (normalizedDevice.treeId !== undefined) db.tree_id = normalizedDevice.treeId
  if (normalizedDevice.plantId !== undefined) db.plant_id = normalizedDevice.plantId
  if (normalizedDevice.isOnline !== undefined) db.is_online = normalizedDevice.isOnline
  if (normalizedDevice.lastTelemetryAt !== undefined) db.last_telemetry_at = normalizedDevice.lastTelemetryAt
  if (normalizedDevice.lastCommandAt !== undefined) db.last_command_at = normalizedDevice.lastCommandAt
  if (normalizedDevice.lastCommandStatus !== undefined) db.last_command_status = normalizedDevice.lastCommandStatus
  if (normalizedDevice.lastCommandedValveState !== undefined) db.last_commanded_valve_state = normalizedDevice.lastCommandedValveState
  if (normalizedDevice.lastConfirmedValveState !== undefined) db.last_confirmed_valve_state = normalizedDevice.lastConfirmedValveState
  if (normalizedDevice.lastConfirmedValveAt !== undefined) db.last_confirmed_valve_at = normalizedDevice.lastConfirmedValveAt
  if (normalizedDevice.lastCommandError !== undefined) db.last_command_error = normalizedDevice.lastCommandError
  if (normalizedDevice.lastCommandLatencyMs !== undefined) db.last_command_latency_ms = normalizedDevice.lastCommandLatencyMs
  if (normalizedDevice.lastIrrigationStartedAt !== undefined) db.last_irrigation_started_at = normalizedDevice.lastIrrigationStartedAt
  if (normalizedDevice.lastIrrigationCompletedAt !== undefined) db.last_irrigation_completed_at = normalizedDevice.lastIrrigationCompletedAt
  if (normalizedDevice.lastIrrigationBaselineMoisture !== undefined) db.last_irrigation_baseline_moisture = normalizedDevice.lastIrrigationBaselineMoisture
  if (normalizedDevice.lastIrrigationDeltaMoisture !== undefined) db.last_irrigation_delta_moisture = normalizedDevice.lastIrrigationDeltaMoisture
  if (normalizedDevice.lastIrrigationOutcome !== undefined) db.last_irrigation_outcome = normalizedDevice.lastIrrigationOutcome
  if (normalizedDevice.lastAutomationEvaluatedAt !== undefined) db.last_automation_evaluated_at = normalizedDevice.lastAutomationEvaluatedAt
  if (normalizedDevice.lastAutomationDecision !== undefined) db.last_automation_decision = normalizedDevice.lastAutomationDecision
  if (normalizedDevice.lastAutomationTrigger !== undefined) db.last_automation_trigger = normalizedDevice.lastAutomationTrigger
  if (normalizedDevice.lastAutomationReason !== undefined) db.last_automation_reason = normalizedDevice.lastAutomationReason
  if (normalizedDevice.lastAutomationConfidence !== undefined) db.last_automation_confidence = normalizedDevice.lastAutomationConfidence
  if (normalizedDevice.lastAutomationTargetLiters !== undefined) db.last_automation_target_liters = normalizedDevice.lastAutomationTargetLiters
  if (normalizedDevice.flowRateActualLpm !== undefined) db.flow_rate_actual_lpm = normalizedDevice.flowRateActualLpm
  if (normalizedDevice.linePressureBar !== undefined) db.line_pressure_bar = normalizedDevice.linePressureBar
  if (normalizedDevice.metadata !== undefined) db.metadata = normalizedDevice.metadata
  if (normalizedDevice.moisture !== undefined) db.moisture = normalizedDevice.moisture
  if (normalizedDevice.isValveOpen !== undefined) db.is_valve_open = normalizedDevice.isValveOpen
  if (normalizedDevice.flowRateLpm !== undefined) db.flow_rate_lpm = normalizedDevice.flowRateLpm
  if (normalizedDevice.sessionLiters !== undefined) db.session_liters = normalizedDevice.sessionLiters
  if (normalizedDevice.targetLiters !== undefined) db.target_liters = normalizedDevice.targetLiters
  if (normalizedDevice.autoThreshold !== undefined) db.auto_threshold = normalizedDevice.autoThreshold
  if (normalizedDevice.autoMode !== undefined) db.auto_mode = normalizedDevice.autoMode
  if (normalizedDevice.lastUpdate !== undefined) db.updated_at = normalizedDevice.lastUpdate

  return db
}
