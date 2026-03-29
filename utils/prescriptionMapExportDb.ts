import type { PrescriptionMapExportRecord } from '@/types/prescriptionMaps'

type DbRecord = Record<string, unknown>

const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? undefined : numericValue
}

export const mapPrescriptionMapExportRecordFromDb = (db: DbRecord): PrescriptionMapExportRecord => ({
  id: String(db.id),
  prescriptionMapId: String(db.prescription_map_id),
  gardenId: String(db.garden_id ?? ''),
  versionNumber: Number(db.version_number ?? 1),
  format: (db.export_format ?? db.format) as PrescriptionMapExportRecord['format'],
  coordinateSystem: ((db.export_configuration as Record<string, unknown> | undefined)?.coordinateSystem
    ?? db.coordinate_system
    ?? 'WGS84') as PrescriptionMapExportRecord['coordinateSystem'],
  compression: Boolean((db.export_configuration as Record<string, unknown> | undefined)?.compression ?? db.compression),
  includeMetadata: Boolean((db.export_configuration as Record<string, unknown> | undefined)?.includeMetadata ?? db.include_metadata),
  includePreview: Boolean((db.export_configuration as Record<string, unknown> | undefined)?.includePreview ?? db.include_preview),
  fileName: String(db.file_name ?? 'export'),
  filePath: db.file_path ? String(db.file_path) : undefined,
  downloadUrl: db.download_url ? String(db.download_url) : undefined,
  fileSize: toOptionalNumber(db.file_size_bytes ?? db.file_size),
  status: (db.field_status as PrescriptionMapExportRecord['status'])
    ?? (Number(db.download_count ?? 0) > 0 ? 'downloaded' : 'generated'),
  machineryBrand: db.machinery_brand ? String(db.machinery_brand) : undefined,
  machineryModel: db.machinery_model ? String(db.machinery_model) : undefined,
  machineryProfileId: db.machinery_profile_id ? String(db.machinery_profile_id) : undefined,
  compatibilityScore: toOptionalNumber(db.compatibility_score),
  warnings: (db.warnings as string[]) ?? undefined,
  metadata: (db.metadata as PrescriptionMapExportRecord['metadata'])
    ?? (db.export_configuration as PrescriptionMapExportRecord['metadata'])
    ?? undefined,
  exportedAt: String(db.exported_at ?? db.created_at ?? new Date().toISOString()),
  downloadedAt: db.last_downloaded_at ? String(db.last_downloaded_at) : (db.downloaded_at ? String(db.downloaded_at) : undefined),
  fieldImportedAt: db.field_imported_at ? String(db.field_imported_at) : undefined,
  appliedAt: db.applied_at ? String(db.applied_at) : undefined,
  createdAt: String(db.created_at ?? new Date().toISOString()),
  updatedAt: String(db.updated_at ?? db.created_at ?? new Date().toISOString()),
})

export const mapPrescriptionMapExportRecordToDb = (
  record: Partial<PrescriptionMapExportRecord>
): DbRecord => {
  const db: DbRecord = {}
  if (record.id !== undefined) db.id = record.id
  if (record.prescriptionMapId !== undefined) db.prescription_map_id = record.prescriptionMapId
  if (record.gardenId !== undefined) db.garden_id = record.gardenId
  if (record.versionNumber !== undefined) db.version_number = record.versionNumber
  if (record.format !== undefined) db.export_format = record.format
  if (
    record.coordinateSystem !== undefined
    || record.compression !== undefined
    || record.includeMetadata !== undefined
    || record.includePreview !== undefined
  ) {
    db.export_configuration = {
      coordinateSystem: record.coordinateSystem,
      compression: record.compression,
      includeMetadata: record.includeMetadata,
      includePreview: record.includePreview,
    }
  }
  if (record.fileName !== undefined) db.file_name = record.fileName
  if (record.filePath !== undefined) db.file_path = record.filePath
  if (record.downloadUrl !== undefined) db.download_url = record.downloadUrl
  if (record.fileSize !== undefined) db.file_size_bytes = record.fileSize
  if (record.status !== undefined) db.field_status = record.status
  if (record.machineryBrand !== undefined) db.machinery_brand = record.machineryBrand
  if (record.machineryModel !== undefined) db.machinery_model = record.machineryModel
  if (record.machineryProfileId !== undefined) db.machinery_profile_id = record.machineryProfileId
  if (record.compatibilityScore !== undefined) db.compatibility_score = record.compatibilityScore
  if (record.warnings !== undefined) db.warnings = record.warnings
  if (record.metadata !== undefined) db.metadata = record.metadata
  if (record.exportedAt !== undefined) db.created_at = record.exportedAt
  if (record.downloadedAt !== undefined) db.last_downloaded_at = record.downloadedAt
  if (record.fieldImportedAt !== undefined) db.field_imported_at = record.fieldImportedAt
  if (record.appliedAt !== undefined) db.applied_at = record.appliedAt
  if (record.createdAt !== undefined) db.created_at = record.createdAt
  if (record.updatedAt !== undefined) db.updated_at = record.updatedAt
  return db
}
