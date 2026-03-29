import type { SmartDeviceAutomationLog } from '@/types'

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? undefined : numericValue
}

export const mapSmartDeviceAutomationLogFromDb = (
  db: Record<string, unknown>
): SmartDeviceAutomationLog => ({
  id: String(db.id),
  gardenId: String(db.garden_id),
  deviceId: String(db.device_id),
  provider: db.provider as SmartDeviceAutomationLog['provider'],
  eventType: db.event_type as SmartDeviceAutomationLog['eventType'],
  source: db.source as SmartDeviceAutomationLog['source'],
  eventAt: String(db.event_at ?? db.created_at ?? new Date().toISOString()),
  scopeType: db.scope_type as SmartDeviceAutomationLog['scopeType'],
  scopeId: db.scope_id ? String(db.scope_id) : undefined,
  zoneId: db.zone_id ? String(db.zone_id) : undefined,
  fieldRowId: db.field_row_id ? String(db.field_row_id) : undefined,
  treeId: db.tree_id ? String(db.tree_id) : undefined,
  plantId: db.plant_id ? String(db.plant_id) : undefined,
  decision: db.decision as SmartDeviceAutomationLog['decision'],
  trigger: db.trigger as SmartDeviceAutomationLog['trigger'],
  confidence: db.confidence as SmartDeviceAutomationLog['confidence'],
  reason: db.reason ? String(db.reason) : undefined,
  commandStatus: db.command_status as SmartDeviceAutomationLog['commandStatus'],
  commandedValveState: db.commanded_valve_state as boolean | undefined,
  confirmedValveState: db.confirmed_valve_state as boolean | undefined,
  targetLiters: toOptionalNumber(db.target_liters),
  sessionLiters: toOptionalNumber(db.session_liters),
  moisture: toOptionalNumber(db.moisture),
  irrigationDeltaMoisture: toOptionalNumber(db.irrigation_delta_moisture),
  irrigationOutcome: db.irrigation_outcome as SmartDeviceAutomationLog['irrigationOutcome'],
  flowRateActualLpm: toOptionalNumber(db.flow_rate_actual_lpm),
  linePressureBar: toOptionalNumber(db.line_pressure_bar),
  metadata: (db.metadata as SmartDeviceAutomationLog['metadata']) ?? undefined,
  createdAt: String(db.created_at ?? new Date().toISOString()),
})

export const mapSmartDeviceAutomationLogToDb = (
  log: Partial<SmartDeviceAutomationLog>
) => {
  const db: Record<string, unknown> = {}

  if (log.gardenId !== undefined) db.garden_id = log.gardenId
  if (log.deviceId !== undefined) db.device_id = log.deviceId
  if (log.provider !== undefined) db.provider = log.provider
  if (log.eventType !== undefined) db.event_type = log.eventType
  if (log.source !== undefined) db.source = log.source
  if (log.eventAt !== undefined) db.event_at = log.eventAt
  if (log.scopeType !== undefined) db.scope_type = log.scopeType
  if (log.scopeId !== undefined) db.scope_id = log.scopeId
  if (log.zoneId !== undefined) db.zone_id = log.zoneId
  if (log.fieldRowId !== undefined) db.field_row_id = log.fieldRowId
  if (log.treeId !== undefined) db.tree_id = log.treeId
  if (log.plantId !== undefined) db.plant_id = log.plantId
  if (log.decision !== undefined) db.decision = log.decision
  if (log.trigger !== undefined) db.trigger = log.trigger
  if (log.confidence !== undefined) db.confidence = log.confidence
  if (log.reason !== undefined) db.reason = log.reason
  if (log.commandStatus !== undefined) db.command_status = log.commandStatus
  if (log.commandedValveState !== undefined) db.commanded_valve_state = log.commandedValveState
  if (log.confirmedValveState !== undefined) db.confirmed_valve_state = log.confirmedValveState
  if (log.targetLiters !== undefined) db.target_liters = log.targetLiters
  if (log.sessionLiters !== undefined) db.session_liters = log.sessionLiters
  if (log.moisture !== undefined) db.moisture = log.moisture
  if (log.irrigationDeltaMoisture !== undefined) db.irrigation_delta_moisture = log.irrigationDeltaMoisture
  if (log.irrigationOutcome !== undefined) db.irrigation_outcome = log.irrigationOutcome
  if (log.flowRateActualLpm !== undefined) db.flow_rate_actual_lpm = log.flowRateActualLpm
  if (log.linePressureBar !== undefined) db.line_pressure_bar = log.linePressureBar
  if (log.metadata !== undefined) db.metadata = log.metadata
  if (log.createdAt !== undefined) db.created_at = log.createdAt

  return db
}
