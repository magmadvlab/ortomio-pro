import {
  inferOperationalContextTagsFromProfile,
  inferOperationalContextTagsFromSite,
  inferOperationalContextTagsFromText,
  mergeOperationalContextTags,
} from '@/services/agronomicOperationalContextService'
import type {
  AgronomicCropProfile,
  AgronomicIrrigationMode,
  AgronomicOperationalContextTag,
  AgronomicProductionIntent,
  AgronomicRefinedContext,
  AgronomicSiteExposureClass,
  AgronomicSiteSlopeClass,
  AgronomicSystemType,
  CultivarContext,
  SiteOperationalProfile,
  SubSystemContext,
} from '@/types/agronomicKernel'

export interface BuildAgronomicRefinedContextInput {
  cropProfile?: AgronomicCropProfile | null
  operationalContextTags?: Array<AgronomicOperationalContextTag | null | undefined> | null
  textValues?: Array<string | null | undefined>
  cultivarId?: string | null
  cultivarLabel?: string | null
  variety?: string | null
  primaryCultivar?: string | null
  cropVariety?: string | null
  speciesLabel?: string | null
  productionIntent?: AgronomicProductionIntent | string | null
  systemType?: AgronomicSystemType | string | null
  gardenType?: string | null
  cultivationSystem?: string | null
  irrigationMode?: AgronomicIrrigationMode | string | null
  trainingSystem?: string | null
  rootstock?: string | null
  altitudeMeters?: number | null
  slopePercentage?: number | null
  sunExposure?: string | null
  soilType?: string | null
  terroir?: string | null
  siteTags?: Array<string | null | undefined> | null
}

export interface BuildAgronomicRefinedContextResult {
  refinedContext: AgronomicRefinedContext
  operationalContextTags: AgronomicOperationalContextTag[]
}

const normalizeToken = (value?: string | null) =>
  value
    ?.trim()
    .replace(/\s+/g, ' ')

const normalizeKey = (value?: string | null) =>
  normalizeToken(value)
    ?.toLowerCase()

const uniqueStrings = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map((value) => normalizeToken(value)).filter(Boolean))) as string[]

const hasValues = (value?: Record<string, unknown>) =>
  Boolean(
    value &&
      Object.values(value).some((entry) =>
        Array.isArray(entry) ? entry.length > 0 : entry !== undefined && entry !== null && entry !== ''
      )
  )

const siteTagSet = new Set<AgronomicOperationalContextTag>([
  'high_altitude_site',
  'coastal_site',
  'steep_slope_site',
  'exposed_site',
  'sheltered_site',
])

const toFiniteNumber = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

const normalizeProductionIntent = (
  value?: AgronomicProductionIntent | string | null,
  operationalContextTags: AgronomicOperationalContextTag[] = [],
  textValues: Array<string | null | undefined> = []
): AgronomicProductionIntent | undefined => {
  const normalizedValue = normalizeKey(value)

  switch (normalizedValue) {
    case 'wine':
    case 'wine_grape':
      return 'wine'
    case 'table_grape':
    case 'table grape':
      return 'table_grape'
    case 'oil':
    case 'oil_cultivar':
    case 'olive oil':
      return 'oil'
    case 'table_olive':
    case 'table olive':
      return 'table_olive'
    case 'fresh_market':
    case 'fresh market':
      return 'fresh_market'
    case 'processing':
      return 'processing'
    default:
      break
  }

  if (operationalContextTags.includes('wine_grape')) {
    return 'wine'
  }
  if (operationalContextTags.includes('table_grape')) {
    return 'table_grape'
  }
  if (operationalContextTags.includes('oil_cultivar')) {
    return 'oil'
  }
  if (operationalContextTags.includes('table_olive')) {
    return 'table_olive'
  }

  const haystack = textValues
    .map((value) => normalizeKey(value))
    .filter((value): value is string => Boolean(value))
    .join(' ')

  if (haystack.includes('vinificazione') || haystack.includes('uva da vino')) {
    return 'wine'
  }
  if (haystack.includes('uva da tavola')) {
    return 'table_grape'
  }
  if (haystack.includes('oliva da mensa')) {
    return 'table_olive'
  }
  if (haystack.includes('frantoio') || haystack.includes('olio')) {
    return 'oil'
  }
  if (haystack.includes('trasformazione') || haystack.includes('processing')) {
    return 'processing'
  }

  return undefined
}

const normalizeSystemType = (
  value?: AgronomicSystemType | string | null,
  operationalContextTags: AgronomicOperationalContextTag[] = [],
  textValues: Array<string | null | undefined> = []
): AgronomicSystemType | undefined => {
  const normalizedValue = normalizeKey(value)

  switch (normalizedValue) {
    case 'open_field':
    case 'open field':
    case 'campo aperto':
      return 'open_field'
    case 'protected_culture':
    case 'protected culture':
    case 'greenhouse':
    case 'serra':
      return 'protected_culture'
    case 'orchard':
    case 'frutteto':
      return 'orchard'
    case 'vineyard':
    case 'vigneto':
      return 'vineyard'
    case 'olive_grove':
    case 'olive grove':
    case 'oliveto':
      return 'olive_grove'
    case 'indoor':
      return 'indoor'
    case 'hydroponic':
    case 'idroponic':
    case 'idroponico':
      return 'hydroponic'
    case 'aquaponic':
    case 'acquaponico':
      return 'aquaponic'
    case 'aeroponic':
    case 'aeroponico':
      return 'aeroponic'
    case 'mixed':
      return 'mixed'
    default:
      break
  }

  const taggedSystem = operationalContextTags.find((tag) =>
    [
      'open_field',
      'protected_culture',
      'orchard',
      'vineyard',
      'olive_grove',
      'indoor',
      'hydroponic',
      'aquaponic',
      'aeroponic',
      'mixed',
    ].includes(tag)
  )
  if (taggedSystem) {
    return taggedSystem as AgronomicSystemType
  }

  const inferredTags = inferOperationalContextTagsFromText(...textValues)
  const inferredSystem = inferredTags.find((tag) =>
    [
      'open_field',
      'protected_culture',
      'orchard',
      'vineyard',
      'olive_grove',
      'indoor',
      'hydroponic',
      'aquaponic',
      'aeroponic',
      'mixed',
    ].includes(tag)
  )

  return inferredSystem as AgronomicSystemType | undefined
}

const normalizeIrrigationMode = (
  value?: AgronomicIrrigationMode | string | null,
  operationalContextTags: AgronomicOperationalContextTag[] = [],
  textValues: Array<string | null | undefined> = []
): AgronomicIrrigationMode | undefined => {
  const normalizedValue = normalizeKey(value)

  switch (normalizedValue) {
    case 'rainfed':
    case 'dryland':
    case 'asciutta':
      return 'rainfed'
    case 'manual_irrigation':
    case 'manual irrigation':
    case 'manual':
      return 'manual_irrigation'
    case 'pressurized_irrigation':
    case 'pressurized irrigation':
    case 'drip':
    case 'sprinkler':
      return 'pressurized_irrigation'
    default:
      break
  }

  if (operationalContextTags.includes('pressurized_irrigation')) {
    return 'pressurized_irrigation'
  }
  if (operationalContextTags.includes('manual_irrigation')) {
    return 'manual_irrigation'
  }
  if (operationalContextTags.includes('rainfed')) {
    return 'rainfed'
  }

  const inferredTags = inferOperationalContextTagsFromText(...textValues)
  if (inferredTags.includes('pressurized_irrigation')) {
    return 'pressurized_irrigation'
  }
  if (inferredTags.includes('manual_irrigation')) {
    return 'manual_irrigation'
  }
  if (inferredTags.includes('rainfed')) {
    return 'rainfed'
  }

  return undefined
}

const resolveSiteExposureClass = (
  input?: {
    sunExposure?: string | null
    operationalContextTags?: AgronomicOperationalContextTag[]
  }
): AgronomicSiteExposureClass | undefined => {
  const sunExposure = normalizeKey(input?.sunExposure)
  const operationalContextTags = input?.operationalContextTags || []

  if (sunExposure === 'full' || sunExposure === 'exposed' || operationalContextTags.includes('exposed_site')) {
    return 'exposed'
  }
  if (
    sunExposure === 'shade' ||
    sunExposure === 'partial' ||
    sunExposure === 'partsun' ||
    sunExposure === 'sheltered' ||
    operationalContextTags.includes('sheltered_site')
  ) {
    return 'sheltered'
  }
  if (sunExposure) {
    return 'balanced'
  }

  return operationalContextTags.some((tag) => siteTagSet.has(tag)) ? 'balanced' : undefined
}

const resolveSiteSlopeClass = (
  input?: {
    slopePercentage?: number | null
    operationalContextTags?: AgronomicOperationalContextTag[]
  }
): AgronomicSiteSlopeClass | undefined => {
  const slopePercentage = toFiniteNumber(input?.slopePercentage)
  const operationalContextTags = input?.operationalContextTags || []

  if (slopePercentage === undefined) {
    return operationalContextTags.includes('steep_slope_site') ? 'steep' : undefined
  }
  if (slopePercentage >= 12) {
    return 'steep'
  }
  if (slopePercentage >= 3) {
    return 'rolling'
  }
  return 'flat'
}

export const normalizeCultivarContext = (
  input: Pick<
    BuildAgronomicRefinedContextInput,
    'cultivarId' | 'cultivarLabel' | 'variety' | 'primaryCultivar' | 'cropVariety' | 'speciesLabel' | 'productionIntent' | 'operationalContextTags' | 'textValues'
  >
): CultivarContext | undefined => {
  const operationalContextTags = mergeOperationalContextTags(input.operationalContextTags)
  const cultivarLabel = uniqueStrings([
    input.cultivarLabel,
    input.primaryCultivar,
    input.cropVariety,
    input.variety,
  ])[0]
  const cultivarContext: CultivarContext = {
    cultivarId: normalizeKey(input.cultivarId)?.replace(/\s+/g, '_'),
    cultivarLabel,
    speciesLabel: normalizeToken(input.speciesLabel),
    productionIntent: normalizeProductionIntent(
      input.productionIntent,
      operationalContextTags,
      input.textValues || [cultivarLabel]
    ),
  }

  return hasValues(cultivarContext) ? cultivarContext : undefined
}

export const resolveSubSystemContext = (
  input: Pick<
    BuildAgronomicRefinedContextInput,
    'cropProfile' | 'operationalContextTags' | 'textValues' | 'systemType' | 'gardenType' | 'cultivationSystem' | 'irrigationMode' | 'trainingSystem' | 'rootstock'
  >
): SubSystemContext | undefined => {
  const operationalContextTags = mergeOperationalContextTags(
    input.operationalContextTags,
    inferOperationalContextTagsFromProfile(input.cropProfile),
    inferOperationalContextTagsFromText(
      ...(input.textValues || []),
      input.systemType,
      input.gardenType,
      input.cultivationSystem,
      input.irrigationMode,
    )
  )

  const subSystemContext: SubSystemContext = {
    systemType: normalizeSystemType(
      input.systemType || input.gardenType || input.cultivationSystem,
      operationalContextTags,
      [input.systemType, input.gardenType, input.cultivationSystem, ...(input.textValues || [])]
    ),
    irrigationMode: normalizeIrrigationMode(
      input.irrigationMode,
      operationalContextTags,
      [input.irrigationMode, ...(input.textValues || [])]
    ),
    trainingSystem: normalizeToken(input.trainingSystem),
    rootstock: normalizeToken(input.rootstock),
  }

  return hasValues(subSystemContext) ? subSystemContext : undefined
}

export const resolveSiteOperationalProfile = (
  input: Pick<
    BuildAgronomicRefinedContextInput,
    'operationalContextTags' | 'textValues' | 'altitudeMeters' | 'slopePercentage' | 'sunExposure' | 'soilType' | 'terroir' | 'siteTags'
  >
): SiteOperationalProfile | undefined => {
  const operationalContextTags = mergeOperationalContextTags(
    input.operationalContextTags,
    inferOperationalContextTagsFromText(
      ...(input.textValues || []),
      input.terroir,
      ...(input.siteTags || [])
    ),
    inferOperationalContextTagsFromSite({
      altitudeMeters: input.altitudeMeters,
      slopePercentage: input.slopePercentage,
      sunExposure: input.sunExposure,
    })
  )
  const siteTags = operationalContextTags.filter((tag) => siteTagSet.has(tag))
  const siteOperationalProfile: SiteOperationalProfile = {
    altitudeMeters: toFiniteNumber(input.altitudeMeters),
    slopePercentage: toFiniteNumber(input.slopePercentage),
    sunExposure: normalizeToken(input.sunExposure),
    soilType: normalizeToken(input.soilType),
    exposureClass: resolveSiteExposureClass({
      sunExposure: input.sunExposure,
      operationalContextTags,
    }),
    slopeClass: resolveSiteSlopeClass({
      slopePercentage: input.slopePercentage,
      operationalContextTags,
    }),
    siteTags: siteTags.length > 0 ? siteTags : undefined,
  }

  return hasValues(siteOperationalProfile) ? siteOperationalProfile : undefined
}

export const deriveOperationalContextTagsFromRefinedContext = (
  context?: AgronomicRefinedContext | null
): AgronomicOperationalContextTag[] => {
  if (!context) {
    return []
  }

  const tags: AgronomicOperationalContextTag[] = []

  if (context.subSystemContext?.systemType) {
    tags.push(context.subSystemContext.systemType)
  }
  if (context.subSystemContext?.irrigationMode) {
    tags.push(context.subSystemContext.irrigationMode)
  }

  switch (context.cultivarContext?.productionIntent) {
    case 'wine':
      tags.push('wine_grape')
      break
    case 'table_grape':
      tags.push('table_grape')
      break
    case 'oil':
      tags.push('oil_cultivar')
      break
    case 'table_olive':
      tags.push('table_olive')
      break
    default:
      break
  }

  if ((context.siteOperationalProfile?.altitudeMeters || 0) >= 600) {
    tags.push('high_altitude_site')
  }
  if ((context.siteOperationalProfile?.slopePercentage || 0) >= 12) {
    tags.push('steep_slope_site')
  }
  if (context.siteOperationalProfile?.exposureClass === 'exposed') {
    tags.push('exposed_site')
  }
  if (context.siteOperationalProfile?.exposureClass === 'sheltered') {
    tags.push('sheltered_site')
  }

  return mergeOperationalContextTags(tags, context.siteOperationalProfile?.siteTags)
}

export const buildAgronomicRefinedContext = (
  input: BuildAgronomicRefinedContextInput
): BuildAgronomicRefinedContextResult => {
  const baseOperationalContextTags = mergeOperationalContextTags(
    input.operationalContextTags,
    inferOperationalContextTagsFromProfile(input.cropProfile),
    inferOperationalContextTagsFromText(
      ...(input.textValues || []),
      input.cultivarLabel,
      input.variety,
      input.primaryCultivar,
      input.cropVariety,
      input.speciesLabel,
      input.productionIntent,
      input.systemType,
      input.gardenType,
      input.cultivationSystem,
      input.irrigationMode,
      input.trainingSystem,
      input.rootstock,
      input.terroir,
      ...(input.siteTags || [])
    ),
    inferOperationalContextTagsFromSite({
      altitudeMeters: input.altitudeMeters,
      slopePercentage: input.slopePercentage,
      sunExposure: input.sunExposure,
    })
  )

  const refinedContext: AgronomicRefinedContext = {}

  const cultivarContext = normalizeCultivarContext({
    cultivarId: input.cultivarId,
    cultivarLabel: input.cultivarLabel,
    variety: input.variety,
    primaryCultivar: input.primaryCultivar,
    cropVariety: input.cropVariety,
    speciesLabel: input.speciesLabel,
    productionIntent: input.productionIntent,
    operationalContextTags: baseOperationalContextTags,
    textValues: [...(input.textValues || []), input.terroir],
  })
  if (cultivarContext) {
    refinedContext.cultivarContext = cultivarContext
  }

  const subSystemContext = resolveSubSystemContext({
    cropProfile: input.cropProfile,
    operationalContextTags: baseOperationalContextTags,
    textValues: [...(input.textValues || []), input.terroir],
    systemType: input.systemType,
    gardenType: input.gardenType,
    cultivationSystem: input.cultivationSystem,
    irrigationMode: input.irrigationMode,
    trainingSystem: input.trainingSystem,
    rootstock: input.rootstock,
  })
  if (subSystemContext) {
    refinedContext.subSystemContext = subSystemContext
  }

  const siteOperationalProfile = resolveSiteOperationalProfile({
    operationalContextTags: baseOperationalContextTags,
    textValues: input.textValues,
    altitudeMeters: input.altitudeMeters,
    slopePercentage: input.slopePercentage,
    sunExposure: input.sunExposure,
    soilType: input.soilType,
    terroir: input.terroir,
    siteTags: input.siteTags,
  })
  if (siteOperationalProfile) {
    refinedContext.siteOperationalProfile = siteOperationalProfile
  }

  return {
    refinedContext,
    operationalContextTags: mergeOperationalContextTags(
      baseOperationalContextTags,
      deriveOperationalContextTagsFromRefinedContext(refinedContext)
    ),
  }
}
