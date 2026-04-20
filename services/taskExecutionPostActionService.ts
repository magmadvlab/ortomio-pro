import type { GardenTask } from '@/types'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import {
  recordAgronomicMeasuredFeedback,
  type AgronomicMeasuredFeedbackRecord,
} from '@/services/agronomicMeasuredFeedbackService'
import { rebuildAgronomicProfileLearningSnapshots } from '@/services/agronomicProfileLearningService'
import {
  attachAgronomicQueueOperatorEvidence,
  syncAgronomicQueueOutcomeEvidence,
  type AgronomicQueueOperatorEvidence,
} from '@/services/agronomicQueueOutcomeService'

type TaskExecutionPostActionStorage = Pick<
  IStorageProvider,
  | 'getTask'
  | 'updateTask'
  | 'getUserPreference'
  | 'setUserPreference'
  | 'getTasks'
  | 'getWateringLogs'
  | 'getFertilizerApplicationLogs'
  | 'getTreatments'
  | 'getMechanicalWorks'
  | 'getHarvestLogs'
>

interface FinalizeTaskExecutionPostActionOptions {
  storageProvider: TaskExecutionPostActionStorage | null | undefined
  gardenId?: string
  sourceTaskId?: string
  markHarvestedTask?: boolean
  operatorEvidence?: AgronomicQueueOperatorEvidence | null
  measuredFeedback?:
    | AgronomicMeasuredFeedbackRecord
    | AgronomicMeasuredFeedbackRecord[]
    | null
  close?: () => void | Promise<void>
  refresh?: Array<() => void | Promise<void>>
}

const setTaskStageHarvestedIfNeeded = async (
  storageProvider: Pick<IStorageProvider, 'getTask' | 'updateTask'> | null | undefined,
  taskId?: string
) => {
  if (!storageProvider?.getTask || !storageProvider?.updateTask || !taskId) {
    return
  }

  const task = await storageProvider.getTask(taskId)
  if (!task) {
    return
  }

  if (task.stage === 'Harvested') {
    return
  }

  await storageProvider.updateTask(task.id, {
    ...task,
    stage: 'Harvested' as GardenTask['stage'],
  })
}

export async function finalizeTaskExecutionPostAction({
  storageProvider,
  gardenId,
  sourceTaskId,
  markHarvestedTask = false,
  operatorEvidence,
  measuredFeedback,
  close,
  refresh = [],
}: FinalizeTaskExecutionPostActionOptions): Promise<void> {
  await Promise.resolve(close?.())

  if (markHarvestedTask && sourceTaskId) {
    await setTaskStageHarvestedIfNeeded(storageProvider, sourceTaskId)
  }

  if (measuredFeedback) {
    await recordAgronomicMeasuredFeedback(storageProvider, measuredFeedback)
  }

  if (gardenId && sourceTaskId && operatorEvidence) {
    await attachAgronomicQueueOperatorEvidence(storageProvider, {
      gardenId,
      sourceTaskId,
      operatorEvidence,
    })
  }

  if (gardenId) {
    await rebuildAgronomicProfileLearningSnapshots(storageProvider, gardenId)
    await syncAgronomicQueueOutcomeEvidence(storageProvider, gardenId)
  }

  const reconciliationJobs: Array<Promise<unknown>> = []
  for (const refreshAction of refresh) {
    reconciliationJobs.push(Promise.resolve(refreshAction()))
  }

  await Promise.allSettled(reconciliationJobs)
}
