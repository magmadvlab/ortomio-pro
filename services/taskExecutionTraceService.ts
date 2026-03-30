import type { GardenTask } from '@/types'

const SOURCE_TASK_MARKER = 'SOURCE_TASK::'

export const buildSourceTaskReference = (taskId: string): string =>
  `${SOURCE_TASK_MARKER}${taskId}`

export const extractSourceTaskReference = (notes?: string | null): string | null => {
  if (!notes || !notes.includes(SOURCE_TASK_MARKER)) {
    return null
  }

  const match = notes.match(/SOURCE_TASK::([A-Za-z0-9-]+)/)
  return match?.[1] || null
}

export const appendSourceTaskReference = (
  notes: string | null | undefined,
  taskOrId: GardenTask | string
): string => {
  const taskId = typeof taskOrId === 'string' ? taskOrId : taskOrId.id
  const reference = buildSourceTaskReference(taskId)

  if (notes?.includes(reference)) {
    return notes
  }

  return [notes?.trim(), reference].filter(Boolean).join(' | ')
}
