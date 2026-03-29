import type { PhenologyObservation } from '@/types'

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? undefined : numericValue
}

export const mapPhenologyObservationFromDb = (
  db: Record<string, unknown>
): PhenologyObservation => ({
  id: String(db.id),
  gardenId: String(db.garden_id),
  cropContextId: db.crop_context_id as PhenologyObservation['cropContextId'],
  scopeType: db.scope_type as PhenologyObservation['scopeType'],
  scopeId: db.scope_id ? String(db.scope_id) : undefined,
  zoneId: db.zone_id ? String(db.zone_id) : undefined,
  fieldRowId: db.field_row_id ? String(db.field_row_id) : undefined,
  treeId: db.tree_id ? String(db.tree_id) : undefined,
  plantId: db.plant_id ? String(db.plant_id) : undefined,
  observedAt: String(db.observed_at ?? db.created_at ?? new Date().toISOString()),
  phenologyStage: db.phenology_stage as PhenologyObservation['phenologyStage'],
  bbchCode: db.bbch_code ? String(db.bbch_code) : undefined,
  stageIntensity: toOptionalNumber(db.stage_intensity),
  confidenceLevel: toOptionalNumber(db.confidence_level),
  observationSource: db.observation_source as PhenologyObservation['observationSource'],
  notes: db.notes ? String(db.notes) : undefined,
  metadata: (db.metadata as PhenologyObservation['metadata']) ?? undefined,
  createdAt: String(db.created_at ?? new Date().toISOString()),
  updatedAt: String(db.updated_at ?? db.created_at ?? new Date().toISOString()),
})

export const mapPhenologyObservationToDb = (
  observation: Partial<PhenologyObservation>
) => {
  const db: Record<string, unknown> = {}

  if (observation.gardenId !== undefined) db.garden_id = observation.gardenId
  if (observation.cropContextId !== undefined) db.crop_context_id = observation.cropContextId
  if (observation.scopeType !== undefined) db.scope_type = observation.scopeType
  if (observation.scopeId !== undefined) db.scope_id = observation.scopeId
  if (observation.zoneId !== undefined) db.zone_id = observation.zoneId
  if (observation.fieldRowId !== undefined) db.field_row_id = observation.fieldRowId
  if (observation.treeId !== undefined) db.tree_id = observation.treeId
  if (observation.plantId !== undefined) db.plant_id = observation.plantId
  if (observation.observedAt !== undefined) db.observed_at = observation.observedAt
  if (observation.phenologyStage !== undefined) db.phenology_stage = observation.phenologyStage
  if (observation.bbchCode !== undefined) db.bbch_code = observation.bbchCode
  if (observation.stageIntensity !== undefined) db.stage_intensity = observation.stageIntensity
  if (observation.confidenceLevel !== undefined) db.confidence_level = observation.confidenceLevel
  if (observation.observationSource !== undefined) db.observation_source = observation.observationSource
  if (observation.notes !== undefined) db.notes = observation.notes
  if (observation.metadata !== undefined) db.metadata = observation.metadata
  if (observation.createdAt !== undefined) db.created_at = observation.createdAt
  if (observation.updatedAt !== undefined) db.updated_at = observation.updatedAt

  return db
}
