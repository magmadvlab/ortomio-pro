type AnyRecord = Record<string, unknown>

export type PlantOperationLineageInput = {
  gardenId?: string | null
  plantId?: string | null
  fieldRowId?: string | null
  gardenRowId?: string | null
  operationContext?: unknown
  context?: unknown
  eventType?: string | null
}

const isRecord = (value: unknown): value is AnyRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asStringOrUndefined = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const buildFallbackContext = (timestamp: string): AnyRecord => ({
  timestamp,
  weather: {
    temperature: 20,
    humidity: 60,
    precipitation: 0,
    windSpeed: 0,
    condition: 'unknown',
    pressure: 1013,
    source: 'fallback',
    sourceClass: 'synthetic_fallback',
    primarySource: 'fallback_estimated',
    signalQuality: 'estimated',
    regionalConfidence: 'low',
    localConfidence: 'low',
  },
  lunar: {
    phase: 'unknown',
    phaseEmoji: '🌙',
    illumination: 0,
    isWaxing: false,
    dayInCycle: 0,
  },
  season: 'unknown',
  daylight: {
    sunrise: '00:00',
    sunset: '00:00',
    hoursOfLight: 0,
  },
})

const readIdentity = (context: AnyRecord | null): {
  gardenId?: string
  plantId?: string
  fieldRowId?: string
  gardenRowId?: string
} => {
  const identity = isRecord(context?.identity) ? context.identity : null
  const lineage = isRecord(context?.lineage) ? context.lineage : null

  return {
    gardenId:
      asStringOrUndefined(identity?.gardenId) ||
      asStringOrUndefined(lineage?.gardenId),
    plantId:
      asStringOrUndefined(identity?.plantId) ||
      asStringOrUndefined(lineage?.plantId),
    fieldRowId:
      asStringOrUndefined(identity?.fieldRowId) ||
      asStringOrUndefined(lineage?.fieldRowId),
    gardenRowId:
      asStringOrUndefined(identity?.gardenRowId) ||
      asStringOrUndefined(lineage?.gardenRowId),
  }
}

export function ensurePlantOperationLineageContext(
  input: PlantOperationLineageInput
): AnyRecord {
  const existing =
    (isRecord(input.operationContext) ? input.operationContext : null) ||
    (isRecord(input.context) ? input.context : null)
  const nowIso = new Date().toISOString()
  const fallback = buildFallbackContext(nowIso)
  const existingIdentity = readIdentity(existing)

  const gardenId = asStringOrUndefined(input.gardenId) || existingIdentity.gardenId
  const plantId = asStringOrUndefined(input.plantId) || existingIdentity.plantId
  const fieldRowId = asStringOrUndefined(input.fieldRowId) || existingIdentity.fieldRowId
  const gardenRowId = asStringOrUndefined(input.gardenRowId) || existingIdentity.gardenRowId

  const merged: AnyRecord = {
    ...fallback,
    ...(existing || {}),
  }

  const existingIdentityRecord = isRecord(merged.identity) ? merged.identity : {}
  merged.identity = {
    ...existingIdentityRecord,
    gardenId: gardenId || null,
    plantId: plantId || null,
    fieldRowId: fieldRowId || null,
    gardenRowId: gardenRowId || null,
  }

  const existingLineageRecord = isRecord(merged.lineage) ? merged.lineage : {}
  const chain = fieldRowId || gardenRowId
    ? ['garden', 'field_row', 'plant']
    : ['garden', 'plant']

  merged.lineage = {
    ...existingLineageRecord,
    chain,
    onboardingRoot: 'garden',
    contextVersion: 'v1',
    eventType: asStringOrUndefined(input.eventType) || asStringOrUndefined(existingLineageRecord.eventType) || 'operation_write',
    gardenId: gardenId || null,
    plantId: plantId || null,
    fieldRowId: fieldRowId || null,
    gardenRowId: gardenRowId || null,
  }

  const timestamp = asStringOrUndefined(merged.timestamp)
  merged.timestamp = timestamp || nowIso

  return merged
}

export function extractRowScopeFromOperationContext(context: unknown): {
  fieldRowId?: string
  gardenRowId?: string
} {
  if (!isRecord(context)) return {}
  const identity = isRecord(context.identity) ? context.identity : null
  const lineage = isRecord(context.lineage) ? context.lineage : null

  const fieldRowId =
    asStringOrUndefined(identity?.fieldRowId) ||
    asStringOrUndefined(lineage?.fieldRowId)
  const gardenRowId =
    asStringOrUndefined(identity?.gardenRowId) ||
    asStringOrUndefined(lineage?.gardenRowId)

  return {
    fieldRowId,
    gardenRowId,
  }
}
