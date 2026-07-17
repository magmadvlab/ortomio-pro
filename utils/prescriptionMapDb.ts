import type { PrescriptionMap, PrescriptionZone } from '@/types/prescriptionMaps'

type DbRecord = Record<string, unknown>

const deriveApplicationRate = (zones: PrescriptionZone[], fallbackUnit = 'kg/ha') => {
  if (zones.length === 0) {
    return {
      min: 0,
      max: 0,
      unit: fallbackUnit,
    }
  }

  const rates = zones.map((zone) => zone.prescription.applicationRate)
  return {
    min: Math.min(...rates),
    max: Math.max(...rates),
    unit: zones[0]?.prescription.unit || fallbackUnit,
  }
}

export const mapPrescriptionZoneFromDb = (db: DbRecord): PrescriptionZone => ({
  id: String(db.id),
  prescriptionMapId: String(db.prescription_map_id),
  zoneNumber: Number(db.zone_number),
  zoneName: String(db.zone_name),
  zoneType: db.zone_type as PrescriptionZone['zoneType'],
  geometry: db.geometry as PrescriptionZone['geometry'],
  centroid: db.centroid as PrescriptionZone['centroid'],
  areaSqm: Number(db.area_sqm),
  prescription: db.prescription as PrescriptionZone['prescription'],
  sourceData: (db.source_data as PrescriptionZone['sourceData']) ?? {},
  dataQuality: Number(db.data_quality ?? 0),
  confidence: Number(db.confidence ?? 0),
  createdAt: String(db.created_at ?? new Date().toISOString()),
  updatedAt: String(db.updated_at ?? db.created_at ?? new Date().toISOString()),
})

export const mapPrescriptionZoneToDb = (zone: Partial<PrescriptionZone>): DbRecord => {
  const db: DbRecord = {}
  if (zone.id !== undefined) db.id = zone.id
  if (zone.prescriptionMapId !== undefined) db.prescription_map_id = zone.prescriptionMapId
  if (zone.zoneNumber !== undefined) db.zone_number = zone.zoneNumber
  if (zone.zoneName !== undefined) db.zone_name = zone.zoneName
  if (zone.zoneType !== undefined) db.zone_type = zone.zoneType
  if (zone.geometry !== undefined) db.geometry = zone.geometry
  if (zone.centroid !== undefined) db.centroid = zone.centroid
  if (zone.areaSqm !== undefined) db.area_sqm = zone.areaSqm
  if (zone.prescription !== undefined) db.prescription = zone.prescription
  if (zone.sourceData !== undefined) db.source_data = zone.sourceData
  if (zone.dataQuality !== undefined) db.data_quality = zone.dataQuality
  if (zone.confidence !== undefined) db.confidence = zone.confidence
  if (zone.createdAt !== undefined) db.created_at = zone.createdAt
  if (zone.updatedAt !== undefined) db.updated_at = zone.updatedAt
  return db
}

export const mapPrescriptionMapFromDb = (
  db: DbRecord,
  zones: PrescriptionZone[] = []
): PrescriptionMap => {
  const totalAreaSqm = Number(db.total_area_sqm ?? 0)
  const totalZones = Number(db.total_zones ?? zones.length ?? 0)
  const costAnalysis = (db.cost_analysis as PrescriptionMap['costAnalysis']) ?? undefined

  return {
    id: String(db.id),
    gardenId: String(db.garden_id),
    gardenName: String(db.garden_name),
    name: String(db.name),
    description: db.description ? String(db.description) : undefined,
    mapType: db.map_type as PrescriptionMap['mapType'],
    generationDate: String(db.generation_date ?? db.created_at ?? new Date().toISOString()),
    dataSourcePeriod: (db.data_source_period as PrescriptionMap['dataSourcePeriod']) ?? {
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    },
    dataSources: (db.data_sources as PrescriptionMap['dataSources']) ?? {
      ndviData: false,
      plantLevelData: false,
      rowLevelData: false,
      soilData: false,
      weatherData: false,
    },
    zones,
    totalZones,
    totalAreaSqm,
    exportFormats: (db.export_formats as PrescriptionMap['exportFormats']) ?? {
      shapefile: false,
      kml: false,
      isoxml: false,
      geojson: false,
      csv: false,
    },
    areaHectares: Number((totalAreaSqm / 10000).toFixed(2)),
    zonesCount: totalZones,
    applicationRate: deriveApplicationRate(zones),
    costSavings: Number(costAnalysis?.savingsVsUniform ?? 0),
    inputReduction: Number(costAnalysis?.inputReduction ?? 0),
    status: (db.status as PrescriptionMap['status']) ?? 'completed',
    versionNumber: Number(db.version_number ?? 1),
    versionLabel: db.version_label ? String(db.version_label) : `v${Number(db.version_number ?? 1)}`,
    rootVersionId: db.root_version_id ? String(db.root_version_id) : String(db.id),
    parentVersionId: db.parent_version_id ? String(db.parent_version_id) : undefined,
    lastExportedAt: db.last_exported_at ? String(db.last_exported_at) : undefined,
    exportCount: Number(db.export_count ?? 0),
    lastExecutedAt: db.last_executed_at ? String(db.last_executed_at) : undefined,
    algorithmMetadata: (db.algorithm_metadata as PrescriptionMap['algorithmMetadata']) ?? undefined,
    contentChecksum: db.content_checksum ? String(db.content_checksum) : undefined,
    validationStatus: db.validation_status as PrescriptionMap['validationStatus'],
    qualityScore: Number(db.quality_score ?? 0),
    dataCompleteness: Number(db.data_completeness ?? 0),
    validationErrors: (db.validation_errors as string[]) ?? undefined,
    costAnalysis,
    createdAt: String(db.created_at ?? new Date().toISOString()),
    updatedAt: String(db.updated_at ?? db.created_at ?? new Date().toISOString()),
    createdBy: db.created_by ? String(db.created_by) : undefined,
  }
}

export const mapPrescriptionMapToDb = (map: Partial<PrescriptionMap>): DbRecord => {
  const db: DbRecord = {}
  if (map.id !== undefined) db.id = map.id
  if (map.gardenId !== undefined) db.garden_id = map.gardenId
  if (map.gardenName !== undefined) db.garden_name = map.gardenName
  if (map.name !== undefined) db.name = map.name
  if (map.description !== undefined) db.description = map.description
  if (map.mapType !== undefined) db.map_type = map.mapType
  if (map.generationDate !== undefined) db.generation_date = map.generationDate
  if (map.dataSourcePeriod !== undefined) db.data_source_period = map.dataSourcePeriod
  if (map.dataSources !== undefined) db.data_sources = map.dataSources
  if (map.totalZones !== undefined) db.total_zones = map.totalZones
  if (map.totalAreaSqm !== undefined) db.total_area_sqm = map.totalAreaSqm
  if (map.exportFormats !== undefined) db.export_formats = map.exportFormats
  if (map.status !== undefined) db.status = map.status
  if (map.versionNumber !== undefined) db.version_number = map.versionNumber
  if (map.versionLabel !== undefined) db.version_label = map.versionLabel
  if (map.rootVersionId !== undefined) db.root_version_id = map.rootVersionId
  if (map.parentVersionId !== undefined) db.parent_version_id = map.parentVersionId
  if (map.lastExportedAt !== undefined) db.last_exported_at = map.lastExportedAt
  if (map.exportCount !== undefined) db.export_count = map.exportCount
  if (map.lastExecutedAt !== undefined) db.last_executed_at = map.lastExecutedAt
  if (map.algorithmMetadata !== undefined) db.algorithm_metadata = map.algorithmMetadata
  if (map.contentChecksum !== undefined) db.content_checksum = map.contentChecksum
  if (map.validationStatus !== undefined) db.validation_status = map.validationStatus
  if (map.qualityScore !== undefined) db.quality_score = map.qualityScore
  if (map.dataCompleteness !== undefined) db.data_completeness = map.dataCompleteness
  if (map.validationErrors !== undefined) db.validation_errors = map.validationErrors
  if (map.costAnalysis !== undefined) db.cost_analysis = map.costAnalysis
  if (map.createdAt !== undefined) db.created_at = map.createdAt
  if (map.updatedAt !== undefined) db.updated_at = map.updatedAt
  if (map.createdBy !== undefined) db.created_by = map.createdBy
  return db
}
