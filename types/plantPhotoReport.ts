import { z } from 'zod'
const description = z.string().trim().min(1).max(1200)
export const reportSchema = z.object({
  observation: description,
  hypotheses: z.array(z.object({
    cause: description, category: z.enum(['nutrizione','acqua','fitosanitario','altro']),
    check: description, action: description, substance: description.nullable(),
  })).max(4),
  followUp: description,
})
export type PlantPhotoReport = z.infer<typeof reportSchema>

export function readPlantPhotoReport(value: unknown) {
  return reportSchema.safeParse(value).data
}

