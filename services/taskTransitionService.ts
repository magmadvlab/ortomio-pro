import type { GardenTask } from '@/types'

export type GardenTaskOperationalStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export interface TaskTransitionInput {
  taskId: string
  nextStatus: GardenTaskOperationalStatus
  reason?: string
  idempotencyKey: string
}

export const validateTaskTransitionInput = (input: TaskTransitionInput) => {
  if (!input.taskId || !input.idempotencyKey) throw new Error('task transition identity required')
  if (['open', 'cancelled'].includes(input.nextStatus) && (input.reason?.trim().length || 0) < 3) {
    throw new Error('task transition reason required')
  }
}

export const transitionGardenTask = async (
  client: any,
  input: TaskTransitionInput
): Promise<GardenTask> => {
  validateTaskTransitionInput(input)
  const { data, error } = await client.rpc('transition_garden_task', {
    p_task_id: input.taskId,
    p_next_status: input.nextStatus,
    p_reason: input.reason || '',
    p_idempotency_key: input.idempotencyKey,
  })
  if (error) throw error
  if (!data) throw new Error('task transition was not persisted')
  return {
    ...data,
    id: data.id,
    gardenId: data.garden_id,
    plantName: data.plant_name,
    taskType: data.task_type,
    date: data.date,
    completed: data.completed,
    operationalStatus: data.operational_status,
    statusReason: data.status_reason,
    statusChangedAt: data.status_changed_at,
  } as GardenTask
}
