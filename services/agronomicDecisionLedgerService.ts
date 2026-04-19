import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { GardenTask } from '@/types'
import type {
  AgronomicDecisionSnapshot,
  AgronomicQueueTaskDraft,
  AgronomicQueueTaskMetadata,
} from '@/services/agronomicQueueTaskService'

type AgronomicDecisionLedgerStorage = Pick<
  IStorageProvider,
  'getUserPreference' | 'setUserPreference'
>

export interface AgronomicDecisionLedgerEntry {
  id: string
  gardenId: string
  queueItemId: string
  source: AgronomicDecisionSnapshot['source']
  focus: AgronomicDecisionSnapshot['focus']
  agronomicProfileId?: string
  scopeLabel?: string
  plantName?: string
  taskSuggestedBy?: string
  taskId?: string
  taskType?: GardenTask['taskType']
  plannedDate?: string
  status: 'task_created' | 'completed'
  createdAt: string
  updatedAt: string
  taskCreatedAt?: string
  completedAt?: string
  decisionSnapshot: AgronomicDecisionSnapshot
}

export interface AgronomicDecisionLedgerSummary {
  totalEntries: number
  taskCreated: number
  completed: number
  withExplanation: number
  byFocus: Partial<Record<AgronomicDecisionSnapshot['focus'], number>>
  bySource: Partial<Record<AgronomicDecisionSnapshot['source'], number>>
  latestEntry?: AgronomicDecisionLedgerEntry
}

const getAgronomicDecisionLedgerPreferenceKey = (gardenId: string) =>
  `agronomic_decision_ledger:${gardenId}`

const sortLedgerEntries = (entries: AgronomicDecisionLedgerEntry[]) =>
  [...entries].sort(
    (left, right) =>
      new Date(right.updatedAt || right.createdAt).getTime() -
      new Date(left.updatedAt || left.createdAt).getTime()
  )

const saveLedgerEntries = async (
  storageProvider: AgronomicDecisionLedgerStorage,
  gardenId: string,
  entries: AgronomicDecisionLedgerEntry[]
) => {
  await storageProvider.setUserPreference?.(
    getAgronomicDecisionLedgerPreferenceKey(gardenId),
    sortLedgerEntries(entries)
  )
}

export async function getAgronomicDecisionLedgerEntries(
  storageProvider: AgronomicDecisionLedgerStorage | null | undefined,
  gardenId: string,
  options?: {
    agronomicProfileId?: string
    focus?: AgronomicDecisionSnapshot['focus']
    source?: AgronomicDecisionSnapshot['source']
    status?: AgronomicDecisionLedgerEntry['status']
    limit?: number
  }
): Promise<AgronomicDecisionLedgerEntry[]> {
  if (!storageProvider?.getUserPreference) {
    return []
  }

  const entries =
    (await storageProvider.getUserPreference<AgronomicDecisionLedgerEntry[]>(
      getAgronomicDecisionLedgerPreferenceKey(gardenId)
    )) || []

  const filtered = sortLedgerEntries(entries).filter((entry) => {
    if (options?.agronomicProfileId && entry.agronomicProfileId !== options.agronomicProfileId) {
      return false
    }
    if (options?.focus && entry.focus !== options.focus) {
      return false
    }
    if (options?.source && entry.source !== options.source) {
      return false
    }
    if (options?.status && entry.status !== options.status) {
      return false
    }
    return true
  })

  return typeof options?.limit === 'number' ? filtered.slice(0, options.limit) : filtered
}

export async function getAgronomicDecisionLedgerSummary(
  storageProvider: AgronomicDecisionLedgerStorage | null | undefined,
  gardenId: string
): Promise<AgronomicDecisionLedgerSummary> {
  const entries = await getAgronomicDecisionLedgerEntries(storageProvider, gardenId)

  return {
    totalEntries: entries.length,
    taskCreated: entries.filter((entry) => entry.status === 'task_created').length,
    completed: entries.filter((entry) => entry.status === 'completed').length,
    withExplanation: entries.filter((entry) => Boolean(entry.decisionSnapshot.decisionExplanation))
      .length,
    byFocus: entries.reduce((acc, entry) => {
      acc[entry.focus] = (acc[entry.focus] || 0) + 1
      return acc
    }, {} as AgronomicDecisionLedgerSummary['byFocus']),
    bySource: entries.reduce((acc, entry) => {
      acc[entry.source] = (acc[entry.source] || 0) + 1
      return acc
    }, {} as AgronomicDecisionLedgerSummary['bySource']),
    latestEntry: entries[0],
  }
}

const findExistingLedgerEntry = (
  entries: AgronomicDecisionLedgerEntry[],
  options: {
    queueItemId: string
    taskSuggestedBy?: string
  }
) =>
  entries.find(
    (entry) =>
      entry.queueItemId === options.queueItemId ||
      Boolean(
        options.taskSuggestedBy &&
          entry.taskSuggestedBy &&
          entry.taskSuggestedBy === options.taskSuggestedBy
      )
  )

export async function recordAgronomicDecisionTaskCreation(
  storageProvider: AgronomicDecisionLedgerStorage | null | undefined,
  gardenId: string,
  draft: AgronomicQueueTaskDraft
): Promise<AgronomicDecisionLedgerEntry | null> {
  if (
    !storageProvider?.getUserPreference ||
    !storageProvider?.setUserPreference ||
    !draft.decisionSnapshot
  ) {
    return null
  }

  const decisionCapturedAt =
    draft.decisionSnapshot?.capturedAt || draft.task.suggestedDate || new Date().toISOString()
  const now = new Date().toISOString()
  const existingEntries = await getAgronomicDecisionLedgerEntries(storageProvider, gardenId)
  const existing = findExistingLedgerEntry(existingEntries, {
    queueItemId: draft.sourceQueueId,
    taskSuggestedBy: draft.task.suggestedBy,
  })

  const nextEntry: AgronomicDecisionLedgerEntry = {
    id: existing?.id || `aq_ledger:${draft.sourceQueueId}`,
    gardenId,
    queueItemId: draft.sourceQueueId,
    source: draft.decisionSnapshot.source,
    focus: draft.decisionSnapshot.focus,
    agronomicProfileId: draft.decisionSnapshot.agronomicProfileId,
    scopeLabel: draft.decisionSnapshot.scopeLabel,
    plantName: draft.task.plantName,
    taskSuggestedBy: draft.task.suggestedBy,
    taskId: existing?.taskId,
    taskType: draft.task.taskType,
    plannedDate: draft.task.date,
    status: existing?.status === 'completed' ? 'completed' : 'task_created',
    createdAt: existing?.createdAt || decisionCapturedAt,
    updatedAt: now,
    taskCreatedAt: existing?.taskCreatedAt || decisionCapturedAt,
    completedAt: existing?.completedAt,
    decisionSnapshot: draft.decisionSnapshot,
  }

  const nextEntries = existing
    ? existingEntries.map((entry) => (entry.id === existing.id ? nextEntry : entry))
    : [nextEntry, ...existingEntries]

  await saveLedgerEntries(storageProvider, gardenId, nextEntries)
  return nextEntry
}

const buildSnapshotFromMetadata = (
  metadata?: AgronomicQueueTaskMetadata | null
): AgronomicDecisionSnapshot | null => metadata?.decisionSnapshot || null

export async function markAgronomicDecisionCompleted(
  storageProvider: AgronomicDecisionLedgerStorage | null | undefined,
  gardenId: string,
  input: {
    queueItemId: string
    completedAt: string
    taskId?: string
    taskSuggestedBy?: string
    taskType?: GardenTask['taskType']
    plantName?: string
    plannedDate?: string
    metadata?: AgronomicQueueTaskMetadata | null
  }
): Promise<AgronomicDecisionLedgerEntry | null> {
  if (!storageProvider?.getUserPreference || !storageProvider?.setUserPreference) {
    return null
  }

  const now = new Date().toISOString()
  const existingEntries = await getAgronomicDecisionLedgerEntries(storageProvider, gardenId)
  const existing = findExistingLedgerEntry(existingEntries, {
    queueItemId: input.queueItemId,
    taskSuggestedBy: input.taskSuggestedBy,
  })
  const snapshot = existing?.decisionSnapshot || buildSnapshotFromMetadata(input.metadata)
  const decisionCapturedAt =
    snapshot?.capturedAt || existing?.taskCreatedAt || existing?.createdAt || input.completedAt

  if (!snapshot) {
    return null
  }

  const nextEntry: AgronomicDecisionLedgerEntry = {
    id: existing?.id || `aq_ledger:${input.queueItemId}`,
    gardenId,
    queueItemId: input.queueItemId,
    source: snapshot.source,
    focus: snapshot.focus,
    agronomicProfileId: snapshot.agronomicProfileId,
    scopeLabel: snapshot.scopeLabel,
    plantName: input.plantName || existing?.plantName,
    taskSuggestedBy: input.taskSuggestedBy || existing?.taskSuggestedBy,
    taskId: input.taskId || existing?.taskId,
    taskType: input.taskType || existing?.taskType,
    plannedDate: input.plannedDate || existing?.plannedDate,
    status: 'completed',
    createdAt: existing?.createdAt || decisionCapturedAt,
    updatedAt: now,
    taskCreatedAt: existing?.taskCreatedAt || decisionCapturedAt,
    completedAt: input.completedAt,
    decisionSnapshot: snapshot,
  }

  const nextEntries = existing
    ? existingEntries.map((entry) => (entry.id === existing.id ? nextEntry : entry))
    : [nextEntry, ...existingEntries]

  await saveLedgerEntries(storageProvider, gardenId, nextEntries)
  return nextEntry
}
