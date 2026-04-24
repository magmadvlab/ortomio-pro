export interface OperationalLedgerProjectionFilters {
  gardenId?: string
  taskId?: string
  sourceTable?: string
  projectionSource?: string
  from?: string
  to?: string
  limit?: number
}

export interface AgronomicOperationOutcomeProjection {
  projectionId: string
  projectionSource: 'agronomic_queue_outcome' | 'operation_history' | string
  userId: string
  gardenId: string
  taskId?: string | null
  queueItemId?: string | null
  decisionLedgerId?: string | null
  decisionSource?: string | null
  decisionFocus?: string | null
  plannedTaskType?: string | null
  plannedPlantName?: string | null
  plannedDate?: string | null
  taskCompleted?: boolean | null
  taskCompletedAt?: string | null
  outcomeCompletedAt?: string | null
  outcomeTaskType?: string | null
  outcomePlantName?: string | null
  operationSuccess?: boolean | null
  evidenceStatus?: string | null
  executionVerified?: boolean | null
  measuredOutcomeRecorded?: boolean | null
  executionEvidenceKind?: string | null
  executionEvidenceLogId?: string | null
  measurementEvidenceKind?: string | null
  measurementEvidenceRecordId?: string | null
  agronomicOutcomeStatus?: string | null
  zoneId?: string | null
  fieldRowId?: string | null
  treeId?: string | null
  plantId?: string | null
  operationSourceTable?: string | null
  operationSourceId?: string | null
  operationKind?: string | null
  operationCategory?: string | null
  operationDate?: string | null
  operationTimestamp?: string | null
  operationQuantity?: number | null
  operationUnit?: string | null
  operationProductName?: string | null
  hasMeasuredResult?: boolean | null
  resultClass?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface AgronomicOperationSignalProjection {
  projectionId: string
  sourceTable: string
  sourceRecordId: string
  userId: string
  gardenId: string
  taskId?: string | null
  parentOperationId?: string | null
  parentOperationTable?: string | null
  signalRole: string
  operationKind: string
  operationCategory: string
  signalDate: string
  signalAt: string
  zoneId?: string | null
  fieldRowId?: string | null
  treeId?: string | null
  plantId?: string | null
  quantity?: number | null
  unit?: string | null
  productName?: string | null
  actorType?: string | null
  sourceType?: string | null
  deviceId?: string | null
  decision?: string | null
  commandStatus?: string | null
  qualityScore?: number | null
  marketableYieldKg?: number | null
  rejectedYieldKg?: number | null
  brix?: number | null
  resultClass?: string | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface AgronomicPrecisionExecutionProjection {
  projectionId: string
  executionRecordId: string
  prescriptionMapId: string
  prescriptionZoneId?: string | null
  gardenId: string
  userId: string
  prescriptionMapName?: string | null
  prescriptionMapType?: string | null
  applicationDate: string
  productName: string
  productType?: string | null
  plannedRate?: number | null
  actualRate?: number | null
  unit?: string | null
  plannedAreaSqm?: number | null
  areaAppliedSqm?: number | null
  totalProductUsed?: number | null
  applicationAccuracy?: number | null
  applicationQuality?: number | null
  totalCost?: number | null
  executionStatus?: string | null
  sourceOperationType?: string | null
  sourceOperationId?: string | null
  prescriptionExportId?: string | null
  smartDeviceId?: string | null
  exportFormat?: string | null
  exportFieldStatus?: string | null
  varianceClass?: string | null
  rateDeviationPercent?: number | null
  areaCoveragePercent?: number | null
  executionMetadata?: Record<string, unknown> | null
  createdAt?: string | null
  updatedAt?: string | null
}
