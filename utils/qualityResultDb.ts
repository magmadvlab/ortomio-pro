import type { QualityResult } from '@/types'

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? undefined : numericValue
}

export const mapQualityResultFromDb = (
  db: Record<string, unknown>
): QualityResult => ({
  id: String(db.id),
  gardenId: String(db.garden_id),
  cropContextId: db.crop_context_id as QualityResult['cropContextId'],
  scopeType: db.scope_type as QualityResult['scopeType'],
  scopeId: db.scope_id ? String(db.scope_id) : undefined,
  zoneId: db.zone_id ? String(db.zone_id) : undefined,
  fieldRowId: db.field_row_id ? String(db.field_row_id) : undefined,
  treeId: db.tree_id ? String(db.tree_id) : undefined,
  plantId: db.plant_id ? String(db.plant_id) : undefined,
  harvestLogId: db.harvest_log_id ? String(db.harvest_log_id) : undefined,
  lotCode: db.lot_code ? String(db.lot_code) : undefined,
  sampleLabel: db.sample_label ? String(db.sample_label) : undefined,
  sampleSize: toOptionalNumber(db.sample_size),
  recordedAt: String(db.recorded_at ?? db.created_at ?? new Date().toISOString()),
  source: db.source as QualityResult['source'],
  qualityGrade: db.quality_grade as QualityResult['qualityGrade'],
  qualityScore: toOptionalNumber(db.quality_score),
  marketableYieldKg: toOptionalNumber(db.marketable_yield_kg),
  rejectedYieldKg: toOptionalNumber(db.rejected_yield_kg),
  brix: toOptionalNumber(db.brix),
  acidity: toOptionalNumber(db.acidity),
  ph: toOptionalNumber(db.ph),
  firmness: toOptionalNumber(db.firmness),
  dryMatterPercentage: toOptionalNumber(db.dry_matter_percentage),
  oilContentPercentage: toOptionalNumber(db.oil_content_percentage),
  oilYieldPercentage: toOptionalNumber(db.oil_yield_percentage),
  defectIncidencePercentage: toOptionalNumber(db.defect_incidence_percentage),
  notes: db.notes ? String(db.notes) : undefined,
  metadata: (db.metadata as QualityResult['metadata']) ?? undefined,
  createdAt: String(db.created_at ?? new Date().toISOString()),
  updatedAt: String(db.updated_at ?? db.created_at ?? new Date().toISOString()),
})

export const mapQualityResultToDb = (
  result: Partial<QualityResult>
) => {
  const db: Record<string, unknown> = {}

  if (result.gardenId !== undefined) db.garden_id = result.gardenId
  if (result.cropContextId !== undefined) db.crop_context_id = result.cropContextId
  if (result.scopeType !== undefined) db.scope_type = result.scopeType
  if (result.scopeId !== undefined) db.scope_id = result.scopeId
  if (result.zoneId !== undefined) db.zone_id = result.zoneId
  if (result.fieldRowId !== undefined) db.field_row_id = result.fieldRowId
  if (result.treeId !== undefined) db.tree_id = result.treeId
  if (result.plantId !== undefined) db.plant_id = result.plantId
  if (result.harvestLogId !== undefined) db.harvest_log_id = result.harvestLogId
  if (result.lotCode !== undefined) db.lot_code = result.lotCode
  if (result.sampleLabel !== undefined) db.sample_label = result.sampleLabel
  if (result.sampleSize !== undefined) db.sample_size = result.sampleSize
  if (result.recordedAt !== undefined) db.recorded_at = result.recordedAt
  if (result.source !== undefined) db.source = result.source
  if (result.qualityGrade !== undefined) db.quality_grade = result.qualityGrade
  if (result.qualityScore !== undefined) db.quality_score = result.qualityScore
  if (result.marketableYieldKg !== undefined) db.marketable_yield_kg = result.marketableYieldKg
  if (result.rejectedYieldKg !== undefined) db.rejected_yield_kg = result.rejectedYieldKg
  if (result.brix !== undefined) db.brix = result.brix
  if (result.acidity !== undefined) db.acidity = result.acidity
  if (result.ph !== undefined) db.ph = result.ph
  if (result.firmness !== undefined) db.firmness = result.firmness
  if (result.dryMatterPercentage !== undefined) db.dry_matter_percentage = result.dryMatterPercentage
  if (result.oilContentPercentage !== undefined) db.oil_content_percentage = result.oilContentPercentage
  if (result.oilYieldPercentage !== undefined) db.oil_yield_percentage = result.oilYieldPercentage
  if (result.defectIncidencePercentage !== undefined) db.defect_incidence_percentage = result.defectIncidencePercentage
  if (result.notes !== undefined) db.notes = result.notes
  if (result.metadata !== undefined) db.metadata = result.metadata
  if (result.createdAt !== undefined) db.created_at = result.createdAt
  if (result.updatedAt !== undefined) db.updated_at = result.updatedAt

  return db
}
