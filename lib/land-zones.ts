export const LAND_ZONE_SHAPES = ['rectangle', 'custom'] as const
export const LAND_ZONE_STATUSES = ['active', 'resting'] as const

export type LandZoneShape = (typeof LAND_ZONE_SHAPES)[number]
export type LandZoneStatus = (typeof LAND_ZONE_STATUSES)[number]

export type LandZoneInput = {
  zoneName: string
  zoneCode?: string
  shapeType: LandZoneShape
  areaSquareMeters?: number
  lengthMeters?: number
  widthMeters?: number
  currentStatus?: LandZoneStatus
  soilType?: string
  notes?: string
}

export type ValidatedLandZoneInput = {
  zone_name: string
  zone_code: string | null
  shape_type: LandZoneShape
  area_hectares: number
  length_meters: number | null
  width_meters: number | null
  current_status: LandZoneStatus
  soil_type: string | null
  notes: string | null
}

const finitePositive = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

const optionalText = (value: unknown, maxLength: number): string | null => {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') throw new Error('invalid_text')
  const normalized = value.trim()
  if (!normalized) return null
  if (normalized.length > maxLength) throw new Error('text_too_long')
  return normalized
}

export function validateLandZoneInput(value: unknown): ValidatedLandZoneInput {
  if (!value || typeof value !== 'object') throw new Error('invalid_zone')
  const input = value as Record<string, unknown>
  const zoneName = optionalText(input.zoneName, 120)
  if (!zoneName) throw new Error('zone_name_required')

  const shapeType = input.shapeType
  if (!LAND_ZONE_SHAPES.includes(shapeType as LandZoneShape)) {
    throw new Error('invalid_shape_type')
  }

  let areaSquareMeters: number
  let lengthMeters: number | null = null
  let widthMeters: number | null = null
  if (shapeType === 'rectangle') {
    if (!finitePositive(input.lengthMeters) || !finitePositive(input.widthMeters)) {
      throw new Error('rectangle_dimensions_required')
    }
    lengthMeters = input.lengthMeters
    widthMeters = input.widthMeters
    areaSquareMeters = lengthMeters * widthMeters
  } else {
    if (!finitePositive(input.areaSquareMeters)) throw new Error('area_required')
    areaSquareMeters = input.areaSquareMeters
  }

  if (areaSquareMeters > 100_000_000) throw new Error('area_too_large')
  const currentStatus = input.currentStatus ?? 'active'
  if (!LAND_ZONE_STATUSES.includes(currentStatus as LandZoneStatus)) {
    throw new Error('invalid_status')
  }

  return {
    zone_name: zoneName,
    zone_code: optionalText(input.zoneCode, 40),
    shape_type: shapeType as LandZoneShape,
    area_hectares: Number((areaSquareMeters / 10_000).toFixed(4)),
    length_meters: lengthMeters,
    width_meters: widthMeters,
    current_status: currentStatus as LandZoneStatus,
    soil_type: optionalText(input.soilType, 80),
    notes: optionalText(input.notes, 2_000),
  }
}
