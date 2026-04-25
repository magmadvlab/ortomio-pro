import type { GardenTask } from '@/types'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import {
  getAgronomicMeasuredFeedbackRecords,
  type AgronomicMeasuredFeedbackRecord,
} from '@/services/agronomicMeasuredFeedbackService'
import {
  parseAgronomicQueueSuggestedBy,
  parseAgronomicQueueTaskMetadata,
  type AgronomicQueueTaskMetadata,
} from '@/services/agronomicQueueTaskService'
import { markAgronomicDecisionCompleted } from '@/services/agronomicDecisionLedgerService'
import { extractSourceTaskReference } from '@/services/taskExecutionTraceService'
import type { WateringLog } from '@/types/irrigation'
import type {
  FertilizerApplicationLogDB,
  HarvestLogData,
  MechanicalWorkRecord,
  TreatmentRecordDB,
} from '@/types'

export interface AgronomicQueueOutcomeRecord {
  id: string
  gardenId: string
  taskId: string
  queueItemId: string
  completedAt: string
  taskType: GardenTask['taskType']
  plantName: string
  schedulingType?: GardenTask['schedulingType']
  success: boolean
  notes?: string
  metadata?: AgronomicQueueTaskMetadata | null
  executionEvidence?: AgronomicQueueExecutionEvidence | null
  measurementEvidence?: AgronomicQueueMeasurementEvidence | null
  evidenceSnapshot?: AgronomicQueueOutcomeEvidenceSnapshot | null
  operatorEvidence?: AgronomicQueueOperatorEvidence | null
}

export interface AgronomicQueueOutcomeSummary {
  totalCompleted: number
  completedThisWeek: number
  averagePriorityScore: number
  explainedDecisions: number
  verifiedExecutions: number
  measuredOutcomes: number
  bySource: Partial<Record<NonNullable<AgronomicQueueTaskMetadata['source']>, number>>
  latestOutcome?: AgronomicQueueOutcomeRecord
}

export interface AgronomicQueueExecutionEvidence {
  kind: 'watering' | 'fertilization' | 'treatment' | 'mechanical_work'
  logId: string
  executionDate: string
  confidence: 'high' | 'medium'
  rationale: string
}

export interface AgronomicQueueMeasurementEvidence {
  kind: 'harvest'
  recordId: string
  recordedAt: string
  rationale: string
}

export interface AgronomicQueueMeasuredOutcome {
  status: 'positive' | 'mixed' | 'negative' | 'unknown'
  matchedBy: 'task' | 'plant' | 'focus' | 'none'
  recordedAt?: string
  summary?: string
}

export interface AgronomicQueueOutcomeEvidenceSnapshot {
  status: 'pending' | 'completed_unverified' | 'execution_verified' | 'outcome_measured'
  executionVerified: boolean
  measuredOutcomeRecorded: boolean
  highConfidenceExecution: boolean
  operatorEvidenceCaptured: boolean
  lastEvidenceAt?: string
  agronomicOutcome: AgronomicQueueMeasuredOutcome
}

export interface AgronomicQueueOperatorEvidence {
  operation: 'watering' | 'nutrition' | 'harvest' | 'mechanical_work'
  recordedAt: string
  summary: string
  notes?: string
  operatorName?: string
  photoCount?: number
  followUpRequired?: boolean
  metrics: Record<string, string | number | boolean | null>
}

const getOutcomePreferenceKey = (gardenId: string) =>
  `agronomic_queue_outcomes:${gardenId}`

const normalizeDateOnly = (value?: string | null): string | null => {
  if (!value) return null
  return value.includes('T') ? value.split('T')[0] : value
}

const getDayDistance = (left?: string | null, right?: string | null): number => {
  const leftDate = normalizeDateOnly(left)
  const rightDate = normalizeDateOnly(right)
  if (!leftDate || !rightDate) {
    return Number.POSITIVE_INFINITY
  }

  const leftTime = new Date(leftDate).getTime()
  const rightTime = new Date(rightDate).getTime()
  return Math.abs(leftTime - rightTime) / (24 * 60 * 60 * 1000)
}

const includesTaskReference = (
  value: string | null | undefined,
  task: GardenTask
): boolean => {
  if (!value) {
    return false
  }

  return (
    value.includes(task.id) ||
    (task.suggestedBy ? value.includes(task.suggestedBy) : false) ||
    extractSourceTaskReference(value) === task.id
  )
}

const normalizeText = (value?: string | null): string =>
  (value || '').trim().toLowerCase()

const resolveMeasuredFeedbackFocus = (
  task: GardenTask,
  metadata?: AgronomicQueueTaskMetadata | null
): AgronomicMeasuredFeedbackRecord['focus'] | null => {
  if (metadata?.focus && metadata.focus !== 'health') {
    return metadata.focus
  }

  if (task.taskType === 'Irrigation') {
    return 'water'
  }

  if (task.taskType === 'Fertilize' || task.taskType === 'Treatment') {
    return 'nutrition'
  }

  if (task.taskType === 'Harvest') {
    return 'quality'
  }

  if (mechanicalTaskTypes.has(task.taskType)) {
    return 'operations'
  }

  return null
}

const getNumericMetric = (record: AgronomicMeasuredFeedbackRecord, key: string): number | null => {
  const value = record.metrics[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

const resolveAgronomicOutcomeFromMeasuredFeedback = (
  task: GardenTask,
  records: AgronomicMeasuredFeedbackRecord[],
  metadata?: AgronomicQueueTaskMetadata | null
): AgronomicQueueMeasuredOutcome => {
  const feedbackFocus = resolveMeasuredFeedbackFocus(task, metadata)
  if (!feedbackFocus) {
    return { status: 'unknown', matchedBy: 'none' }
  }

  const focusRecords = records.filter((record) => record.focus === feedbackFocus)
  const taskRecords = focusRecords.filter((record) => record.sourceTaskId === task.id)
  const plantRecords =
    task.plantName
      ? focusRecords.filter(
          (record) => normalizeText(record.plantName) === normalizeText(task.plantName)
        )
      : []

  const matchedRecords =
    taskRecords.length > 0
      ? taskRecords
      : plantRecords.length > 0
        ? plantRecords
        : focusRecords

  const matchedBy: AgronomicQueueMeasuredOutcome['matchedBy'] =
    taskRecords.length > 0
      ? 'task'
      : plantRecords.length > 0
        ? 'plant'
        : matchedRecords.length > 0
          ? 'focus'
          : 'none'

  const latestRecord = [...matchedRecords].sort(
    (left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime()
  )[0]

  if (!latestRecord) {
    return { status: 'unknown', matchedBy: 'none' }
  }

  let status: AgronomicQueueMeasuredOutcome['status'] = 'mixed'

  if (feedbackFocus === 'water') {
    const moistureDelta = getNumericMetric(latestRecord, 'averageSoilMoistureDelta')
    status =
      moistureDelta === null
        ? 'unknown'
        : moistureDelta <= 0
          ? 'negative'
          : moistureDelta >= 4
            ? 'positive'
            : 'mixed'
  } else if (feedbackFocus === 'nutrition') {
    const effectivenessScore = getNumericMetric(latestRecord, 'effectivenessScore')
    const followUpRequired = latestRecord.metrics.followUpRequired === true
    status =
      effectivenessScore === null
        ? followUpRequired
          ? 'negative'
          : 'unknown'
        : effectivenessScore < 5 || followUpRequired
          ? 'negative'
          : effectivenessScore >= 7
            ? 'positive'
            : 'mixed'
  } else if (feedbackFocus === 'quality') {
    const qualityRating = getNumericMetric(latestRecord, 'qualityRating')
    const brix = getNumericMetric(latestRecord, 'brix')
    status =
      qualityRating === null && brix === null
        ? 'unknown'
        : qualityRating !== null && qualityRating < 3
          ? 'negative'
          : (qualityRating !== null && qualityRating >= 4) || (brix !== null && brix >= 12)
            ? 'positive'
            : 'mixed'
  } else {
    status = latestRecord.summary ? 'mixed' : 'unknown'
  }

  return {
    status,
    matchedBy,
    recordedAt: latestRecord.recordedAt,
    summary: latestRecord.summary,
  }
}

const buildOutcomeEvidenceSnapshot = (
  task: GardenTask,
  record: AgronomicQueueOutcomeRecord,
  feedbackRecords: AgronomicMeasuredFeedbackRecord[]
): AgronomicQueueOutcomeEvidenceSnapshot => {
  const agronomicOutcome = resolveAgronomicOutcomeFromMeasuredFeedback(
    task,
    feedbackRecords,
    record.metadata
  )
  const executionVerified = Boolean(record.executionEvidence)
  const measuredOutcomeRecorded = Boolean(record.measurementEvidence)
  const highConfidenceExecution = record.executionEvidence?.confidence === 'high'
  const operatorEvidenceCaptured = Boolean(record.operatorEvidence)

  let status: AgronomicQueueOutcomeEvidenceSnapshot['status'] = 'completed_unverified'
  if (measuredOutcomeRecorded) {
    status = 'outcome_measured'
  } else if (executionVerified) {
    status = 'execution_verified'
  }

  const lastEvidenceAt =
    record.measurementEvidence?.recordedAt ||
    record.operatorEvidence?.recordedAt ||
    agronomicOutcome.recordedAt ||
    record.executionEvidence?.executionDate ||
    record.completedAt

  return {
    status,
    executionVerified,
    measuredOutcomeRecorded,
    highConfidenceExecution,
    operatorEvidenceCaptured,
    lastEvidenceAt,
    agronomicOutcome,
  }
}

const mechanicalTaskTypes = new Set<GardenTask['taskType']>([
  'Plowing',
  'Subsoiling',
  'Harrowing',
  'Tilling',
  'Rolling',
  'Hoeing',
  'EarthingUp',
  'Mulching',
  'PostSowingRolling',
  'Clearing',
  'Stumping',
  'StoneRemoval',
  'Leveling',
  'DeepSubsoiling',
  'Digging',
  'DeepHarrowing',
  'Crumbling',
  'Scraping',
  'SurfaceLeveling',
  'MinimumTillage',
  'StripTillage',
  'NoTill',
  'FormativePruning',
  'MaintenancePruning',
  'RejuvenationPruning',
  'SummerPruning',
  'WinterPruning',
  'Thinning',
  'Suckering',
  'Defoliation',
  'Tying',
  'OliveShredding',
  'RunnerManagement',
  'StrawberryMulching',
  'StrawberryCleaning',
  'CaneRemoval',
  'TipPruning',
  'RaspberryTying',
  'SuckerThinning',
  'FruitBagging',
  'ExoticThinning',
  'Shredding',
  'Topping',
  'Pruning',
  'TreePruning',
])

const sortOutcomeRecords = (records: AgronomicQueueOutcomeRecord[]) =>
  [...records].sort(
    (left, right) =>
      new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime()
  )

export async function getAgronomicQueueOutcomeRecords(
  storageProvider:
    | Pick<
        IStorageProvider,
        'getUserPreference' | 'getAgronomicQueueOutcomeRecords' | 'upsertAgronomicQueueOutcomeRecord'
      >
    | null
    | undefined,
  gardenId: string
): Promise<AgronomicQueueOutcomeRecord[]> {
  if (storageProvider?.getAgronomicQueueOutcomeRecords) {
    try {
      const dbRecords = await storageProvider.getAgronomicQueueOutcomeRecords(gardenId)
      if (dbRecords.length > 0) {
        return sortOutcomeRecords(dbRecords)
      }
    } catch (error) {
      console.warn('Falling back to preference-backed agronomic queue outcomes', error)
    }
  }

  if (!storageProvider?.getUserPreference) {
    return []
  }

  const records =
    (await storageProvider.getUserPreference<AgronomicQueueOutcomeRecord[]>(
      getOutcomePreferenceKey(gardenId)
    )) || []

  if (records.length > 0 && storageProvider.upsertAgronomicQueueOutcomeRecord) {
    try {
      await Promise.all(
        records.map((record) => storageProvider.upsertAgronomicQueueOutcomeRecord!(record))
      )
    } catch (error) {
      console.warn('Unable to migrate preference-backed agronomic queue outcomes to DB', error)
    }
  }

  return sortOutcomeRecords(records)
}

export async function recordAgronomicQueueTaskOutcome(
  storageProvider:
    | Pick<
        IStorageProvider,
        | 'getUserPreference'
        | 'setUserPreference'
        | 'getAgronomicQueueOutcomeRecords'
        | 'upsertAgronomicQueueOutcomeRecord'
        | 'getAgronomicDecisionLedgerEntries'
        | 'upsertAgronomicDecisionLedgerEntry'
      >
    | null
    | undefined,
  task: GardenTask,
  options?: {
    success?: boolean
    notes?: string
    completedAt?: string
  }
): Promise<AgronomicQueueOutcomeRecord | null> {
  if (!storageProvider?.getUserPreference || !storageProvider?.setUserPreference) {
    return null
  }

  const queueItemId = parseAgronomicQueueSuggestedBy(task.suggestedBy)
  if (!queueItemId) {
    return null
  }

  const existingRecords = await getAgronomicQueueOutcomeRecords(storageProvider, task.gardenId)
  const alreadyRecorded = existingRecords.find((record) => record.taskId === task.id)
  if (alreadyRecorded) {
    return alreadyRecorded
  }

  const completedAt =
    options?.completedAt ||
    task.completedAt ||
    task.actualCompletedDate ||
    new Date().toISOString()
  const metadata = parseAgronomicQueueTaskMetadata(task.notes)

  const nextRecord: AgronomicQueueOutcomeRecord = {
    id: `aq_outcome:${task.id}`,
    gardenId: task.gardenId,
    taskId: task.id,
    queueItemId,
    completedAt,
    taskType: task.taskType,
    plantName: task.plantName,
    schedulingType: task.schedulingType,
    success: options?.success ?? true,
    notes: options?.notes || task.notes,
    metadata,
  }

  if (storageProvider.upsertAgronomicQueueOutcomeRecord) {
    await storageProvider.upsertAgronomicQueueOutcomeRecord(nextRecord)
  } else {
    await storageProvider.setUserPreference(getOutcomePreferenceKey(task.gardenId), [
      nextRecord,
      ...existingRecords,
    ])
  }

  await markAgronomicDecisionCompleted(storageProvider, task.gardenId, {
    queueItemId,
    completedAt,
    taskId: task.id,
    taskSuggestedBy: task.suggestedBy,
    taskType: task.taskType,
    plantName: task.plantName,
    plannedDate: task.date,
    metadata,
  })

  return nextRecord
}

export async function attachAgronomicQueueOperatorEvidence(
  storageProvider:
    | Pick<
        IStorageProvider,
        'getUserPreference' | 'setUserPreference' | 'getAgronomicQueueOutcomeRecords' | 'upsertAgronomicQueueOutcomeRecord'
      >
    | null
    | undefined,
  options: {
    gardenId: string
    sourceTaskId?: string
    operatorEvidence?: AgronomicQueueOperatorEvidence | null
  }
): Promise<AgronomicQueueOutcomeRecord | null> {
  if (
    !storageProvider?.getUserPreference ||
    !storageProvider?.setUserPreference ||
    !options.sourceTaskId ||
    !options.operatorEvidence
  ) {
    return null
  }

  const existingRecords = await getAgronomicQueueOutcomeRecords(storageProvider, options.gardenId)
  const targetRecord = existingRecords.find((record) => record.taskId === options.sourceTaskId)
  if (!targetRecord) {
    return null
  }

  const updatedRecord: AgronomicQueueOutcomeRecord = {
    ...targetRecord,
    operatorEvidence: options.operatorEvidence,
  }

  const nextRecords = existingRecords.map((record) =>
    record.id === targetRecord.id ? updatedRecord : record
  )

  if (storageProvider.upsertAgronomicQueueOutcomeRecord) {
    await storageProvider.upsertAgronomicQueueOutcomeRecord(updatedRecord)
  } else {
    await storageProvider.setUserPreference(getOutcomePreferenceKey(options.gardenId), nextRecords)
  }
  return updatedRecord
}

const matchWateringEvidence = (
  task: GardenTask,
  logs: WateringLog[]
): AgronomicQueueExecutionEvidence | null => {
  const candidates = logs.filter((log) => getDayDistance(log.date, task.completedAt || task.date) <= 1)
  const strongCandidate = candidates.find((log) => includesTaskReference(log.notes, task))
  if (strongCandidate) {
    return {
      kind: 'watering',
      logId: strongCandidate.id,
      executionDate: strongCandidate.date,
      confidence: 'high',
      rationale: 'Log irrigazione con riferimento esplicito al task nelle note.',
    }
  }

  if (candidates.length === 1) {
    return {
      kind: 'watering',
      logId: candidates[0].id,
      executionDate: candidates[0].date,
      confidence: 'medium',
      rationale: 'Unico log irrigazione registrato in finestra stretta intorno al completamento del task.',
    }
  }

  return null
}

const matchFertilizationEvidence = (
  task: GardenTask,
  logs: FertilizerApplicationLogDB[]
): AgronomicQueueExecutionEvidence | null => {
  const candidates = logs.filter((log) => getDayDistance(log.applicationDate, task.completedAt || task.date) <= 2)
  const strongCandidate = candidates.find(
    (log) =>
      log.taskId === task.id ||
      includesTaskReference(log.notes || undefined, task)
  )
  if (strongCandidate) {
    return {
      kind: 'fertilization',
      logId: strongCandidate.id,
      executionDate: strongCandidate.applicationDate,
      confidence: 'high',
      rationale: 'Log fertilizzazione agganciato direttamente al task o alle sue note.',
    }
  }

  const scopedCandidate = candidates.find(
    (log) =>
      (task.bedId && log.bedId === task.bedId) ||
      (task.zoneId && log.zoneId === task.zoneId) ||
      (task.rowId && (log.bedRowId === task.rowId || log.fieldRowId === task.rowId))
  )
  if (scopedCandidate) {
    return {
      kind: 'fertilization',
      logId: scopedCandidate.id,
      executionDate: scopedCandidate.applicationDate,
      confidence: 'medium',
      rationale: 'Log fertilizzazione trovato sulla stessa finestra temporale e stesso scope operativo.',
    }
  }

  return null
}

const matchTreatmentEvidence = (
  task: GardenTask,
  logs: TreatmentRecordDB[]
): AgronomicQueueExecutionEvidence | null => {
  const candidates = logs.filter((log) => getDayDistance(log.treatment_date, task.completedAt || task.date) <= 2)
  const strongCandidate = candidates.find(
    (log) =>
      includesTaskReference(log.notes, task) ||
      normalizeText(log.crop_name) === normalizeText(task.plantName)
  )
  if (strongCandidate) {
    return {
      kind: 'treatment',
      logId: strongCandidate.id,
      executionDate: strongCandidate.treatment_date,
      confidence: includesTaskReference(strongCandidate.notes, task) ? 'high' : 'medium',
      rationale: includesTaskReference(strongCandidate.notes, task)
        ? 'Log trattamento con riferimento esplicito al task.'
        : 'Log trattamento con stessa coltura e stessa finestra temporale.',
    }
  }

  return null
}

const matchMechanicalEvidence = (
  task: GardenTask,
  logs: MechanicalWorkRecord[]
): AgronomicQueueExecutionEvidence | null => {
  const candidates = logs.filter(
    (log) =>
      getDayDistance(log.work_date, task.completedAt || task.date) <= 2 &&
      normalizeText(log.work_type) === normalizeText(task.taskType)
  )
  const strongCandidate = candidates.find((log) => includesTaskReference(log.notes, task))
  if (strongCandidate) {
    return {
      kind: 'mechanical_work',
      logId: strongCandidate.id,
      executionDate: strongCandidate.work_date,
      confidence: 'high',
      rationale: 'Log lavorazione meccanica con tipo coerente e riferimento esplicito al task.',
    }
  }

  if (candidates.length === 1) {
    return {
      kind: 'mechanical_work',
      logId: candidates[0].id,
      executionDate: candidates[0].work_date,
      confidence: 'medium',
      rationale: 'Unica lavorazione meccanica con stesso tipo nella finestra del task completato.',
    }
  }

  return null
}

const matchHarvestMeasurementEvidence = (
  task: GardenTask,
  logs: HarvestLogData[]
): AgronomicQueueMeasurementEvidence | null => {
  const candidates = logs.filter(
    (log) =>
      getDayDistance(log.date, task.completedAt || task.date) <= 3 &&
      (log.taskId === task.id || normalizeText(log.plantName) === normalizeText(task.plantName))
  )

  const matched = candidates[0]
  if (!matched) {
    return null
  }

  return {
    kind: 'harvest',
    recordId: matched.id || `harvest:${task.id}:${matched.date}`,
    recordedAt: matched.date,
    rationale:
      matched.taskId === task.id
        ? 'Raccolta registrata direttamente sul task.'
        : 'Raccolta registrata sulla stessa coltura nella finestra temporale del task.',
  }
}

export async function syncAgronomicQueueOutcomeEvidence(
  storageProvider:
    | Pick<
        IStorageProvider,
        | 'getUserPreference'
        | 'setUserPreference'
        | 'getAgronomicQueueOutcomeRecords'
        | 'upsertAgronomicQueueOutcomeRecord'
        | 'getTasks'
        | 'getWateringLogs'
        | 'getFertilizerApplicationLogs'
        | 'getTreatments'
        | 'getMechanicalWorks'
        | 'getHarvestLogs'
      >
    | null
    | undefined,
  gardenId: string
): Promise<AgronomicQueueOutcomeRecord[]> {
  if (
    !storageProvider?.getUserPreference ||
    !storageProvider?.setUserPreference ||
    !storageProvider.getTasks
  ) {
    return []
  }

  const [records, tasks, wateringLogs, fertilizerLogs, treatments, mechanicalWorks, harvestLogs, measuredFeedbackRecords] =
    await Promise.all([
      getAgronomicQueueOutcomeRecords(storageProvider, gardenId),
      storageProvider.getTasks(gardenId).catch(() => []),
      storageProvider.getWateringLogs(undefined, gardenId, {
        from: normalizeDateOnly(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) || '',
        to: normalizeDateOnly(new Date().toISOString()) || '',
      }).catch(() => []),
      storageProvider.getFertilizerApplicationLogs(gardenId).catch(() => []),
      storageProvider.getTreatments(gardenId).catch(() => []),
      storageProvider.getMechanicalWorks(gardenId).catch(() => []),
      storageProvider.getHarvestLogs(gardenId).catch(() => []),
      getAgronomicMeasuredFeedbackRecords(storageProvider, gardenId).catch(() => []),
    ])

  const updatedRecords = records.map((record) => {
    const task = tasks.find((candidate) => candidate.id === record.taskId)
    if (!task) {
      return record
    }

    let executionEvidence = record.executionEvidence || null
    let measurementEvidence = record.measurementEvidence || null

    if (!executionEvidence) {
      if (task.taskType === 'Irrigation') {
        executionEvidence = matchWateringEvidence(task, wateringLogs)
      } else if (task.taskType === 'Fertilize') {
        executionEvidence = matchFertilizationEvidence(task, fertilizerLogs)
      } else if (task.taskType === 'Treatment') {
        executionEvidence = matchTreatmentEvidence(task, treatments)
      } else if (mechanicalTaskTypes.has(task.taskType)) {
        executionEvidence = matchMechanicalEvidence(task, mechanicalWorks)
      }
    }

    if (!measurementEvidence && task.taskType === 'Harvest') {
      measurementEvidence = matchHarvestMeasurementEvidence(task, harvestLogs)
    }

    return {
      ...record,
      executionEvidence,
      measurementEvidence,
      operatorEvidence: record.operatorEvidence || null,
      evidenceSnapshot: buildOutcomeEvidenceSnapshot(
        task,
        {
          ...record,
          executionEvidence,
          measurementEvidence,
          operatorEvidence: record.operatorEvidence || null,
        },
        measuredFeedbackRecords
      ),
    }
  })

  if (storageProvider.upsertAgronomicQueueOutcomeRecord) {
    await Promise.all(
      updatedRecords.map((record) => storageProvider.upsertAgronomicQueueOutcomeRecord!(record))
    )
  } else {
    await storageProvider.setUserPreference(getOutcomePreferenceKey(gardenId), updatedRecords)
  }
  return updatedRecords
}

export async function getAgronomicQueueOutcomeSummary(
  storageProvider:
    | Pick<
        IStorageProvider,
        | 'getUserPreference'
        | 'setUserPreference'
        | 'getAgronomicQueueOutcomeRecords'
        | 'upsertAgronomicQueueOutcomeRecord'
        | 'getTasks'
        | 'getWateringLogs'
        | 'getFertilizerApplicationLogs'
        | 'getTreatments'
        | 'getMechanicalWorks'
        | 'getHarvestLogs'
      >
    | null
    | undefined,
  gardenId: string
): Promise<AgronomicQueueOutcomeSummary> {
  const records = await syncAgronomicQueueOutcomeEvidence(storageProvider, gardenId)
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000

  const bySource = records.reduce((acc, record) => {
    const source = record.metadata?.source
    if (source) {
      acc[source] = (acc[source] || 0) + 1
    }
    return acc
  }, {} as AgronomicQueueOutcomeSummary['bySource'])

  const averagePriorityScore =
    records.length > 0
      ? Number(
          (
            records.reduce(
              (sum, record) => sum + (record.metadata?.priorityScore || 0),
              0
            ) / records.length
          ).toFixed(1)
        )
      : 0

  return {
    totalCompleted: records.length,
    completedThisWeek: records.filter(
      (record) => new Date(record.completedAt).getTime() >= weekStart
    ).length,
    averagePriorityScore,
    explainedDecisions: records.filter(
      (record) =>
        Boolean(record.metadata?.decisionExplanation) ||
        Boolean(record.metadata?.decisionSnapshot?.decisionExplanation)
    ).length,
    verifiedExecutions: records.filter((record) => Boolean(record.executionEvidence)).length,
    measuredOutcomes: records.filter((record) => Boolean(record.measurementEvidence)).length,
    bySource,
    latestOutcome: records[0],
  }
}
