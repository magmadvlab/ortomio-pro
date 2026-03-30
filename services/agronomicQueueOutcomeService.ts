import type { GardenTask } from '@/types'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import {
  parseAgronomicQueueSuggestedBy,
  parseAgronomicQueueTaskMetadata,
  type AgronomicQueueTaskMetadata,
} from '@/services/agronomicQueueTaskService'
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
}

export interface AgronomicQueueOutcomeSummary {
  totalCompleted: number
  completedThisWeek: number
  averagePriorityScore: number
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

export async function getAgronomicQueueOutcomeRecords(
  storageProvider: Pick<IStorageProvider, 'getUserPreference'> | null | undefined,
  gardenId: string
): Promise<AgronomicQueueOutcomeRecord[]> {
  if (!storageProvider?.getUserPreference) {
    return []
  }

  const records =
    (await storageProvider.getUserPreference<AgronomicQueueOutcomeRecord[]>(
      getOutcomePreferenceKey(gardenId)
    )) || []

  return [...records].sort(
    (left, right) =>
      new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime()
  )
}

export async function recordAgronomicQueueTaskOutcome(
  storageProvider:
    | Pick<IStorageProvider, 'getUserPreference' | 'setUserPreference'>
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

  await storageProvider.setUserPreference(getOutcomePreferenceKey(task.gardenId), [
    nextRecord,
    ...existingRecords,
  ])

  return nextRecord
}

const matchWateringEvidence = (
  task: GardenTask,
  logs: WateringLog[]
): AgronomicQueueExecutionEvidence | null => {
  const candidates = logs.filter((log) => getDayDistance(log.date, task.completedAt || task.date) <= 1)
  const strongCandidate = candidates.find(
    (log) => log.taskId === task.id || includesTaskReference(log.notes, task)
  )
  if (strongCandidate) {
    return {
      kind: 'watering',
      logId: strongCandidate.id,
      executionDate: strongCandidate.date,
      confidence: 'high',
      rationale:
        strongCandidate.taskId === task.id
          ? 'Log irrigazione agganciato direttamente al task.'
          : 'Log irrigazione con riferimento esplicito al task nelle note.',
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
    recordId: matched.id,
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

  const [records, tasks, wateringLogs, fertilizerLogs, treatments, mechanicalWorks, harvestLogs] =
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
    }
  })

  await storageProvider.setUserPreference(getOutcomePreferenceKey(gardenId), updatedRecords)
  return updatedRecords
}

export async function getAgronomicQueueOutcomeSummary(
  storageProvider:
    | Pick<
        IStorageProvider,
        | 'getUserPreference'
        | 'setUserPreference'
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
    verifiedExecutions: records.filter((record) => Boolean(record.executionEvidence)).length,
    measuredOutcomes: records.filter((record) => Boolean(record.measurementEvidence)).length,
    bySource,
    latestOutcome: records[0],
  }
}
