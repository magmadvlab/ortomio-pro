import { z } from 'zod'

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => value >= '1900-01-01' && value <= '2200-12-31' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, 'Data non valida')
export const planningTaskSchema = z.object({
  plantName: z.string().trim().min(1).max(200),
  taskType: z.enum(['Sowing', 'Transplant', 'Harvest']),
  date,
  quantity: z.number().int().positive().max(1000000).optional(),
  fieldRowId: z.string().uuid().optional(),
  notes: z.string().trim().max(2000).optional(),
}).strict()
export type PlanningTaskDraft = z.infer<typeof planningTaskSchema>
export function validateSuggestionTasks(type: string, tasks: unknown): PlanningTaskDraft[] {
  if (!['PLANTING_PLAN', 'HARVEST_TIMING', 'ROTATION_PLAN'].includes(type)) throw new Error('Tipo di suggerimento non pianificabile.')
  const parsed = z.array(planningTaskSchema).min(1).max(20).parse(tasks)
  if (parsed.some(task => type === 'HARVEST_TIMING' ? task.taskType !== 'Harvest' : !['Sowing', 'Transplant'].includes(task.taskType))) {
    throw new Error('Le attività non corrispondono al tipo di suggerimento.')
  }
  return parsed
}
