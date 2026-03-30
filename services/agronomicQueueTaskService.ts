import type { GardenTask } from '@/types'
import type { AgronomicSignalKey } from '@/types/agronomicKernel'
import type { AgronomicActionQueueItem } from '@/services/agronomicActionQueueService'

export interface AgronomicQueueTaskDraft {
  id: string
  sourceQueueId: string
  source: AgronomicActionQueueItem['source']
  title: string
  priorityScore: number
  priorityConfidence: number
  urgencyLabel: AgronomicActionQueueItem['urgencyLabel']
  missingSignals: AgronomicSignalKey[]
  task: Omit<GardenTask, 'id'>
}

export interface AgronomicQueueTaskMetadata {
  queueItemId: string
  source: AgronomicActionQueueItem['source']
  focus: AgronomicActionQueueItem['focus']
  priorityScore: number
  priorityConfidence: number
  urgencyLabel: AgronomicActionQueueItem['urgencyLabel']
  agronomicProfileId?: string
  missingSignals: AgronomicSignalKey[]
}

export const AGRONOMIC_QUEUE_SUGGESTED_BY_PREFIX = 'agronomic_queue:'
const AGRONOMIC_QUEUE_META_MARKER = 'AQ_META::'

const toISODate = (date: Date): string => date.toISOString().split('T')[0]

const addDays = (baseDate: Date, days: number): Date => {
  const nextDate = new Date(baseDate)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const resolveTaskType = (item: AgronomicActionQueueItem): GardenTask['taskType'] => {
  if (item.source === 'phenology') {
    return item.urgencyLabel === 'immediate' && item.focus === 'quality' ? 'Harvest' : 'Photo'
  }

  if (item.source === 'irrigation' || item.focus === 'water') {
    return 'Irrigation'
  }

  if (item.source === 'prescription' || item.focus === 'nutrition') {
    return 'Fertilize'
  }

  if (item.focus === 'quality') {
    return 'Harvest'
  }

  return 'Treatment'
}

const resolveTaskDate = (item: AgronomicActionQueueItem): string => {
  const today = new Date()

  if (item.urgencyLabel === 'immediate') {
    return toISODate(today)
  }

  if (item.urgencyLabel === 'next_cycle') {
    return toISODate(addDays(today, 2))
  }

  return toISODate(addDays(today, 5))
}

const resolveSchedulingType = (
  item: AgronomicActionQueueItem
): GardenTask['schedulingType'] => {
  return item.urgencyLabel === 'immediate' ? 'Immediate' : 'Scheduled'
}

const resolveDurationMinutes = (taskType: GardenTask['taskType']): number => {
  switch (taskType) {
    case 'Photo':
      return 10
    case 'Harvest':
      return 35
    case 'Fertilize':
      return 30
    case 'Irrigation':
      return 25
    case 'Treatment':
    default:
      return 20
  }
}

const resolvePlantName = (item: AgronomicActionQueueItem): string => {
  if (item.scopeLabel && item.scopeLabel.trim().length > 0) {
    return item.scopeLabel
  }

  return item.title
    .replace(/^Irrigazione\s+/i, '')
    .replace(/^Prescription\s+/i, '')
    .replace(/^Verifica fase fenologica\s+/i, '')
    .trim()
}

export const parseAgronomicQueueSuggestedBy = (value?: string | null): string | null => {
  if (!value || !value.startsWith(AGRONOMIC_QUEUE_SUGGESTED_BY_PREFIX)) {
    return null
  }

  return value.slice(AGRONOMIC_QUEUE_SUGGESTED_BY_PREFIX.length) || null
}

export const buildAgronomicQueueTaskMetadata = (
  item: AgronomicActionQueueItem
): AgronomicQueueTaskMetadata => ({
  queueItemId: item.id,
  source: item.source,
  focus: item.focus,
  priorityScore: item.priorityScore,
  priorityConfidence: item.priorityConfidence,
  urgencyLabel: item.urgencyLabel,
  agronomicProfileId: item.agronomicProfileId,
  missingSignals: item.missingSignals,
})

export const parseAgronomicQueueTaskMetadata = (
  notes?: string | null
): AgronomicQueueTaskMetadata | null => {
  return splitAgronomicQueueTaskNotes(notes).metadata
}

const buildTaskNotes = (item: AgronomicActionQueueItem): string => {
  const metadata = buildAgronomicQueueTaskMetadata(item)
  const parts = [
    `Origine coda trasversale: ${item.source}.`,
    `Focus agronomico: ${item.focus}.`,
    item.description,
    item.missingSignals.length > 0
      ? `Segnali P0 mancanti: ${item.missingSignals.join(', ')}.`
      : 'Copertura P0 sufficiente per questo suggerimento.',
    `${AGRONOMIC_QUEUE_META_MARKER}${JSON.stringify(metadata)}`,
  ].filter(Boolean)

  return parts.join(' ')
}

export const stripAgronomicQueueTaskMetadata = (notes?: string | null): string => {
  return splitAgronomicQueueTaskNotes(notes).visibleNotes
}

export const preserveAgronomicQueueTaskMetadata = (
  originalNotes: string | null | undefined,
  visibleNotes: string | null | undefined
): string | undefined => {
  const { metadata } = splitAgronomicQueueTaskNotes(originalNotes)
  const cleanedVisibleNotes = visibleNotes?.trim()

  if (!metadata) {
    return cleanedVisibleNotes || undefined
  }

  const serializedMetadata = `${AGRONOMIC_QUEUE_META_MARKER}${JSON.stringify(metadata)}`
  return [cleanedVisibleNotes, serializedMetadata].filter(Boolean).join(' ')
}

function splitAgronomicQueueTaskNotes(notes?: string | null): {
  visibleNotes: string
  metadata: AgronomicQueueTaskMetadata | null
} {
  if (!notes || !notes.includes(AGRONOMIC_QUEUE_META_MARKER)) {
    return {
      visibleNotes: notes?.trim() || '',
      metadata: null,
    }
  }

  const markerIndex = notes.indexOf(AGRONOMIC_QUEUE_META_MARKER)
  const visibleNotes = notes.slice(0, markerIndex).trim()
  const rawPayload = notes.slice(markerIndex + AGRONOMIC_QUEUE_META_MARKER.length).trim()

  if (!rawPayload) {
    return {
      visibleNotes,
      metadata: null,
    }
  }

  try {
    return {
      visibleNotes,
      metadata: JSON.parse(rawPayload) as AgronomicQueueTaskMetadata,
    }
  } catch {
    return {
      visibleNotes: notes.trim(),
      metadata: null,
    }
  }
}

export function buildAgronomicQueueTaskDrafts(
  gardenId: string,
  queue: AgronomicActionQueueItem[],
  existingTasks: GardenTask[]
): AgronomicQueueTaskDraft[] {
  return queue.flatMap((item) => {
    const taskType = resolveTaskType(item)
    const suggestedBy = `${AGRONOMIC_QUEUE_SUGGESTED_BY_PREFIX}${item.id}`
    const alreadyOpen = existingTasks.some(
      (task) =>
        task.gardenId === gardenId &&
        task.suggestedBy === suggestedBy &&
        !task.completed
    )

    if (alreadyOpen) {
      return []
    }

    const date = resolveTaskDate(item)

    return [
      {
        id: `draft:${item.id}`,
        sourceQueueId: item.id,
        source: item.source,
        title: item.title,
        priorityScore: item.priorityScore,
        priorityConfidence: item.priorityConfidence,
        urgencyLabel: item.urgencyLabel,
        missingSignals: item.missingSignals,
        task: {
          gardenId,
          plantName: resolvePlantName(item),
          taskType,
          date,
          nextDueDate: date,
          completed: false,
          isSuggested: true,
          aiGenerated: true,
          suggestedBy,
          suggestedDate: new Date().toISOString(),
          schedulingType: resolveSchedulingType(item),
          durationMinutes: resolveDurationMinutes(taskType),
          notes: buildTaskNotes(item),
        },
      },
    ]
  })
}
