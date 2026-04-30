import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { GardenTask } from '@/types'
import {
  buildAgronomicQueueTaskOperationalSummary,
  type AgronomicQueueTaskOperationalSummary,
  stripAgronomicQueueTaskMetadata,
} from '@/services/agronomicQueueTaskService'

type TaskExecutionBannerStorage = Pick<IStorageProvider, 'getTask'>

export interface TaskExecutionBannerDetails {
  sourceTask: GardenTask
  visibleNotes?: string
  operationalSummary: AgronomicQueueTaskOperationalSummary | null
  mobileSummaryChips: string[]
}

export async function loadTaskExecutionBannerDetails(
  storageProvider: TaskExecutionBannerStorage | null | undefined,
  sourceTaskId?: string
): Promise<TaskExecutionBannerDetails | null> {
  if (!storageProvider?.getTask || !sourceTaskId) {
    return null
  }

  try {
    const sourceTask = await storageProvider.getTask(sourceTaskId)
    if (!sourceTask) {
      return null
    }

    const visibleNotes = stripAgronomicQueueTaskMetadata(sourceTask.notes)

    return {
      sourceTask,
      visibleNotes: visibleNotes || undefined,
      operationalSummary: buildAgronomicQueueTaskOperationalSummary(sourceTask),
      mobileSummaryChips: buildTaskExecutionMobileSummaryChips(sourceTask),
    }
  } catch {
    return null
  }
}

function buildTaskExecutionMobileSummaryChips(task: GardenTask): string[] {
  const operationalSummary = buildAgronomicQueueTaskOperationalSummary(task)
  if (!operationalSummary) {
    return []
  }

  return [
    operationalSummary.mobileActionLabel,
    operationalSummary.focusLabel,
    operationalSummary.urgencyLabel,
    operationalSummary.mobileEvidencePrompt,
  ].filter((value, index, items) => Boolean(value) && items.indexOf(value) === index)
}
