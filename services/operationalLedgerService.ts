import type { IStorageProvider } from '@/packages/core/storage/interface'
import type {
  AgronomicOperationOutcomeProjection,
  AgronomicOperationSignalProjection,
  AgronomicPrecisionExecutionProjection,
  OperationalLedgerProjectionFilters,
} from '@/types/operationalLedger'

type OperationalLedgerStorage = Pick<
  IStorageProvider,
  | 'getAgronomicOperationOutcomeProjection'
  | 'getAgronomicOperationSignalProjection'
  | 'getAgronomicPrecisionExecutionProjection'
>

export interface OperationalLedgerUnifiedEvent {
  id: string
  family: 'outcome' | 'signal' | 'precision_execution'
  source: string
  gardenId: string
  taskId?: string | null
  occurredAt?: string | null
  category?: string | null
  kind?: string | null
  resultClass?: string | null
  hasMeasuredResult: boolean
  hasExecutionEvidence: boolean
  sourceRecordId?: string | null
}

export interface OperationalLedgerSummary {
  totalEvents: number
  outcomeEvents: number
  signalEvents: number
  precisionExecutionEvents: number
  measuredResultEvents: number
  verifiedExecutionEvents: number
  byCategory: Record<string, number>
  byResultClass: Record<string, number>
  latestEvent?: OperationalLedgerUnifiedEvent
  events: OperationalLedgerUnifiedEvent[]
}

const increment = (target: Record<string, number>, key: string | null | undefined) => {
  const normalizedKey = key || 'unknown'
  target[normalizedKey] = (target[normalizedKey] || 0) + 1
}

const getTime = (value?: string | null) => {
  if (!value) return 0
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

const normalizeOutcomeEvent = (
  row: AgronomicOperationOutcomeProjection
): OperationalLedgerUnifiedEvent => ({
  id: row.projectionId,
  family: 'outcome',
  source: row.projectionSource,
  gardenId: row.gardenId,
  taskId: row.taskId,
  occurredAt: row.operationTimestamp || row.outcomeCompletedAt || row.taskCompletedAt || row.createdAt,
  category: row.operationCategory || row.decisionFocus,
  kind: row.operationKind || row.executionEvidenceKind || row.outcomeTaskType || row.plannedTaskType,
  resultClass: row.resultClass,
  hasMeasuredResult: row.hasMeasuredResult === true || row.measuredOutcomeRecorded === true,
  hasExecutionEvidence: row.executionVerified === true || Boolean(row.executionEvidenceLogId),
  sourceRecordId: row.operationSourceId || row.executionEvidenceLogId || row.measurementEvidenceRecordId,
})

const normalizeSignalEvent = (
  row: AgronomicOperationSignalProjection
): OperationalLedgerUnifiedEvent => ({
  id: row.projectionId,
  family: 'signal',
  source: row.sourceTable,
  gardenId: row.gardenId,
  taskId: row.taskId,
  occurredAt: row.signalAt || row.createdAt,
  category: row.operationCategory,
  kind: row.operationKind,
  resultClass: row.resultClass,
  hasMeasuredResult:
    row.signalRole === 'measured_quality_result' ||
    row.resultClass === 'measured_result' ||
    row.resultClass === 'beneficial' ||
    row.resultClass === 'negative_quality',
  hasExecutionEvidence:
    row.signalRole === 'plant_operation' ||
    row.signalRole === 'device_automation' ||
    row.signalRole === 'prescription_export',
  sourceRecordId: row.sourceRecordId,
})

const normalizePrecisionEvent = (
  row: AgronomicPrecisionExecutionProjection
): OperationalLedgerUnifiedEvent => ({
  id: row.projectionId,
  family: 'precision_execution',
  source: 'variable_rate_applications',
  gardenId: row.gardenId,
  taskId: null,
  occurredAt: row.applicationDate || row.createdAt,
  category: 'precision_execution',
  kind: row.sourceOperationType || row.productType || row.prescriptionMapType || 'variable_rate_application',
  resultClass: row.varianceClass || row.executionStatus,
  hasMeasuredResult: false,
  hasExecutionEvidence: row.executionStatus !== 'planned_or_unknown',
  sourceRecordId: row.executionRecordId,
})

export async function getOperationalLedgerUnifiedEvents(
  storageProvider: OperationalLedgerStorage | null | undefined,
  gardenId: string,
  filters?: Omit<OperationalLedgerProjectionFilters, 'gardenId'>
): Promise<OperationalLedgerUnifiedEvent[]> {
  if (!storageProvider) {
    return []
  }

  const queryFilters: OperationalLedgerProjectionFilters = {
    ...filters,
    gardenId,
  }

  const [outcomes, signals, precisionExecutions] = await Promise.all([
    storageProvider.getAgronomicOperationOutcomeProjection?.(queryFilters).catch(() => []) || [],
    storageProvider.getAgronomicOperationSignalProjection?.(queryFilters).catch(() => []) || [],
    storageProvider.getAgronomicPrecisionExecutionProjection?.(queryFilters).catch(() => []) || [],
  ])

  return [
    ...outcomes.map(normalizeOutcomeEvent),
    ...signals.map(normalizeSignalEvent),
    ...precisionExecutions.map(normalizePrecisionEvent),
  ].sort((left, right) => getTime(right.occurredAt) - getTime(left.occurredAt))
}

export async function getOperationalLedgerSummary(
  storageProvider: OperationalLedgerStorage | null | undefined,
  gardenId: string,
  filters?: Omit<OperationalLedgerProjectionFilters, 'gardenId'>
): Promise<OperationalLedgerSummary> {
  const events = await getOperationalLedgerUnifiedEvents(storageProvider, gardenId, filters)

  const byCategory: Record<string, number> = {}
  const byResultClass: Record<string, number> = {}

  for (const event of events) {
    increment(byCategory, event.category)
    increment(byResultClass, event.resultClass)
  }

  return {
    totalEvents: events.length,
    outcomeEvents: events.filter((event) => event.family === 'outcome').length,
    signalEvents: events.filter((event) => event.family === 'signal').length,
    precisionExecutionEvents: events.filter((event) => event.family === 'precision_execution').length,
    measuredResultEvents: events.filter((event) => event.hasMeasuredResult).length,
    verifiedExecutionEvents: events.filter((event) => event.hasExecutionEvidence).length,
    byCategory,
    byResultClass,
    latestEvent: events[0],
    events,
  }
}
