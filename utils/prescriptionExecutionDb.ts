import type { PrescriptionExecutionRecord } from '@/types/prescriptionMaps'

type DbRecord = Record<string, unknown>

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? undefined : numericValue
}

export const mapPrescriptionExecutionFromDb = (db: DbRecord): PrescriptionExecutionRecord => ({
  id: String(db.id),
  prescriptionMapId: String(db.prescription_map_id),
  prescriptionZoneId: db.prescription_zone_id ? String(db.prescription_zone_id) : undefined,
  applicationDate: String(db.application_date ?? db.created_at ?? new Date().toISOString()),
  productName: String(db.product_name ?? 'Applicazione'),
  productType: db.product_type ? String(db.product_type) : undefined,
  plannedRate: Number(db.planned_rate ?? 0),
  actualRate: toOptionalNumber(db.actual_rate),
  unit: String(db.unit ?? 'kg/ha'),
  plannedAreaSqm: toOptionalNumber(db.planned_area_sqm),
  areaAppliedSqm: toOptionalNumber(db.area_applied_sqm),
  totalProductUsed: toOptionalNumber(db.total_product_used),
  machineryUsed: db.machinery_used ? String(db.machinery_used) : undefined,
  operatorName: db.operator_name ? String(db.operator_name) : undefined,
  gpsTrack: (db.gps_track as PrescriptionExecutionRecord['gpsTrack']) ?? undefined,
  applicationAccuracy: toOptionalNumber(db.application_accuracy),
  applicationQuality: toOptionalNumber(db.application_quality),
  notes: db.notes ? String(db.notes) : undefined,
  weatherConditions: (db.weather_conditions as PrescriptionExecutionRecord['weatherConditions']) ?? undefined,
  productCost: toOptionalNumber(db.product_cost),
  applicationCost: toOptionalNumber(db.application_cost),
  totalCost: toOptionalNumber(db.total_cost),
  executionStatus: (db.execution_status as PrescriptionExecutionRecord['executionStatus']) ?? 'planned',
  executionScopeType: db.execution_scope_type as PrescriptionExecutionRecord['executionScopeType'],
  executionScopeId: db.execution_scope_id ? String(db.execution_scope_id) : undefined,
  sourceOperationType: db.source_operation_type as PrescriptionExecutionRecord['sourceOperationType'],
  sourceOperationId: db.source_operation_id ? String(db.source_operation_id) : undefined,
  prescriptionExportId: db.prescription_export_id ? String(db.prescription_export_id) : undefined,
  smartDeviceId: db.smart_device_id ? String(db.smart_device_id) : undefined,
  createdAt: String(db.created_at ?? new Date().toISOString()),
  updatedAt: String(db.updated_at ?? db.created_at ?? new Date().toISOString()),
})

export const mapPrescriptionExecutionToDb = (
  record: Partial<PrescriptionExecutionRecord>
): DbRecord => {
  const db: DbRecord = {}
  if (record.id !== undefined) db.id = record.id
  if (record.prescriptionMapId !== undefined) db.prescription_map_id = record.prescriptionMapId
  if (record.prescriptionZoneId !== undefined) db.prescription_zone_id = record.prescriptionZoneId
  if (record.applicationDate !== undefined) db.application_date = record.applicationDate
  if (record.productName !== undefined) db.product_name = record.productName
  if (record.productType !== undefined) db.product_type = record.productType
  if (record.plannedRate !== undefined) db.planned_rate = record.plannedRate
  if (record.actualRate !== undefined) db.actual_rate = record.actualRate
  if (record.unit !== undefined) db.unit = record.unit
  if (record.plannedAreaSqm !== undefined) db.planned_area_sqm = record.plannedAreaSqm
  if (record.areaAppliedSqm !== undefined) db.area_applied_sqm = record.areaAppliedSqm
  if (record.totalProductUsed !== undefined) db.total_product_used = record.totalProductUsed
  if (record.machineryUsed !== undefined) db.machinery_used = record.machineryUsed
  if (record.operatorName !== undefined) db.operator_name = record.operatorName
  if (record.gpsTrack !== undefined) db.gps_track = record.gpsTrack
  if (record.applicationAccuracy !== undefined) db.application_accuracy = record.applicationAccuracy
  if (record.applicationQuality !== undefined) db.application_quality = record.applicationQuality
  if (record.notes !== undefined) db.notes = record.notes
  if (record.weatherConditions !== undefined) db.weather_conditions = record.weatherConditions
  if (record.productCost !== undefined) db.product_cost = record.productCost
  if (record.applicationCost !== undefined) db.application_cost = record.applicationCost
  if (record.totalCost !== undefined) db.total_cost = record.totalCost
  if (record.executionStatus !== undefined) db.execution_status = record.executionStatus
  if (record.executionScopeType !== undefined) db.execution_scope_type = record.executionScopeType
  if (record.executionScopeId !== undefined) db.execution_scope_id = record.executionScopeId
  if (record.sourceOperationType !== undefined) db.source_operation_type = record.sourceOperationType
  if (record.sourceOperationId !== undefined) db.source_operation_id = record.sourceOperationId
  if (record.prescriptionExportId !== undefined) db.prescription_export_id = record.prescriptionExportId
  if (record.smartDeviceId !== undefined) db.smart_device_id = record.smartDeviceId
  if (record.createdAt !== undefined) db.created_at = record.createdAt
  if (record.updatedAt !== undefined) db.updated_at = record.updatedAt
  return db
}
