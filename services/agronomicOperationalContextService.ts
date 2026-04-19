import type {
  AgronomicCropProfile,
  AgronomicOperationalContextTag,
} from '@/types/agronomicKernel'
import type { IrrigationSystem } from '@/types/irrigation'

const normalizeToken = (value?: string | null) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

export const mergeOperationalContextTags = (
  ...groups: Array<Array<AgronomicOperationalContextTag | null | undefined> | null | undefined>
): AgronomicOperationalContextTag[] =>
  Array.from(
    new Set(
      groups.flatMap((group) =>
        (group || []).filter(
          (tag): tag is AgronomicOperationalContextTag => typeof tag === 'string' && tag.length > 0
        )
      )
    )
  )

export const inferOperationalContextTagsFromText = (
  ...values: Array<string | null | undefined>
): AgronomicOperationalContextTag[] => {
  const haystack = values
    .map((value) => normalizeToken(value))
    .filter((value): value is string => Boolean(value))
    .join(' ')

  if (!haystack) {
    return []
  }

  const tags = new Set<AgronomicOperationalContextTag>()

  if (
    haystack.includes('serra') ||
    haystack.includes('greenhouse') ||
    haystack.includes('protected')
  ) {
    tags.add('protected_culture')
  }
  if (
    haystack.includes('campo aperto') ||
    haystack.includes('open field') ||
    haystack.includes('open-field')
  ) {
    tags.add('open_field')
  }
  if (haystack.includes('frutteto') || haystack.includes('orchard')) {
    tags.add('orchard')
  }
  if (haystack.includes('vigneto') || haystack.includes('vineyard')) {
    tags.add('vineyard')
  }
  if (haystack.includes('oliveto') || haystack.includes('olive grove')) {
    tags.add('olive_grove')
  }
  if (haystack.includes('indoor')) {
    tags.add('indoor')
  }
  if (haystack.includes('hydroponic') || haystack.includes('idropon')) {
    tags.add('hydroponic')
  }
  if (haystack.includes('aquaponic') || haystack.includes('acquapon')) {
    tags.add('aquaponic')
  }
  if (haystack.includes('aeroponic') || haystack.includes('aeropon')) {
    tags.add('aeroponic')
  }
  if (
    haystack.includes('rainfed') ||
    haystack.includes('dryland') ||
    haystack.includes('asciutta') ||
    haystack.includes('seccagno')
  ) {
    tags.add('rainfed')
  }
  if (
    haystack.includes('drip') ||
    haystack.includes('goccia') ||
    haystack.includes('sprinkler') ||
    haystack.includes('microjet') ||
    haystack.includes('micro-sprinkler') ||
    haystack.includes('subsurface')
  ) {
    tags.add('pressurized_irrigation')
  }
  if (haystack.includes('manual')) {
    tags.add('manual_irrigation')
  }
  if (
    haystack.includes('broadacre') ||
    haystack.includes('estensiv') ||
    haystack.includes('field scale') ||
    haystack.includes('campo grande')
  ) {
    tags.add('broadacre_scale')
  }
  if (
    haystack.includes('wine grape') ||
    haystack.includes('uva da vino') ||
    haystack.includes('vinificazione') ||
    haystack.includes('docg') ||
    haystack.includes('doc ')
  ) {
    tags.add('wine_grape')
  }
  if (
    haystack.includes('table grape') ||
    haystack.includes('uva da tavola') ||
    haystack.includes('raisin')
  ) {
    tags.add('table_grape')
  }
  if (
    haystack.includes('olive oil') ||
    haystack.includes('olio') ||
    haystack.includes('frantoio')
  ) {
    tags.add('oil_cultivar')
  }
  if (
    haystack.includes('table olive') ||
    haystack.includes('oliva da mensa')
  ) {
    tags.add('table_olive')
  }
  if (
    haystack.includes('coastal') ||
    haystack.includes('costa') ||
    haystack.includes('mare') ||
    haystack.includes('marittim')
  ) {
    tags.add('coastal_site')
  }
  if (
    haystack.includes('high altitude') ||
    haystack.includes('alta quota') ||
    haystack.includes('mountain')
  ) {
    tags.add('high_altitude_site')
  }
  if (
    haystack.includes('nft') ||
    haystack.includes('nutrient film')
  ) {
    tags.add('nft_system')
  }
  if (
    haystack.includes('dwc') ||
    haystack.includes('deep water culture')
  ) {
    tags.add('dwc_system')
  }
  if (
    haystack.includes('ebbflow') ||
    haystack.includes('ebb flow') ||
    haystack.includes('flood and drain')
  ) {
    tags.add('ebb_flow_system')
  }
  if (haystack.includes('media bed')) {
    tags.add('media_bed_system')
  }
  if (
    haystack.includes('high pressure aeroponic') ||
    haystack.includes('high pressure')
  ) {
    tags.add('high_pressure_aeroponic')
  }

  return Array.from(tags)
}

export const inferOperationalContextTagsFromSite = (input?: {
  altitudeMeters?: number | null
  slopePercentage?: number | null
  sunExposure?: string | null
}): AgronomicOperationalContextTag[] => {
  if (!input) {
    return []
  }

  const tags = new Set<AgronomicOperationalContextTag>()
  const altitudeMeters =
    typeof input.altitudeMeters === 'number' && Number.isFinite(input.altitudeMeters)
      ? input.altitudeMeters
      : null
  const slopePercentage =
    typeof input.slopePercentage === 'number' && Number.isFinite(input.slopePercentage)
      ? input.slopePercentage
      : null
  const sunExposure = normalizeToken(input.sunExposure)

  if (altitudeMeters !== null && altitudeMeters >= 600) {
    tags.add('high_altitude_site')
  }
  if (slopePercentage !== null && slopePercentage >= 12) {
    tags.add('steep_slope_site')
  }
  if (sunExposure === 'full' || sunExposure === 'exposed') {
    tags.add('exposed_site')
  } else if (sunExposure === 'shade' || sunExposure === 'partial' || sunExposure === 'sheltered') {
    tags.add('sheltered_site')
  }

  return Array.from(tags)
}

export const inferOperationalContextTagsFromProfile = (
  profile?: AgronomicCropProfile | null
): AgronomicOperationalContextTag[] => {
  if (!profile) {
    return []
  }

  const tags = new Set<AgronomicOperationalContextTag>()

  if (profile.systems.length === 1) {
    tags.add(profile.systems[0])
  }

  if (
    profile.tags.some((tag) =>
      ['broadacre', 'field_scale', 'extensive', 'protein_crop'].includes(tag)
    )
  ) {
    tags.add('broadacre_scale')
  }

  return Array.from(tags)
}

export const inferOperationalContextTagsFromIrrigationSystems = (
  systems: IrrigationSystem[]
): AgronomicOperationalContextTag[] => {
  const tags = new Set<AgronomicOperationalContextTag>()
  const hasPressurizedSystem = systems.some((system) =>
    ['drip', 'sprinkler', 'micro', 'subsurface'].includes(system.systemType || '') ||
    ['Drip', 'Sprinkler', 'MicroSprinkler', 'Micro', 'Soaker'].includes(system.type || '')
  )
  const hasManualOnly =
    !hasPressurizedSystem &&
    systems.some((system) => system.systemType === 'manual' || system.type === 'Manual')

  if (hasPressurizedSystem) {
    tags.add('pressurized_irrigation')
  } else if (hasManualOnly) {
    tags.add('manual_irrigation')
  }

  if (systems.some((system) => system.cultivationType === 'serra')) {
    tags.add('protected_culture')
  }
  if (systems.some((system) => system.cultivationType === 'campo_aperto')) {
    tags.add('open_field')
  }
  if (systems.some((system) => system.cultivationType === 'frutteto')) {
    tags.add('orchard')
  }
  if (systems.some((system) => system.cultivationType === 'vigneto')) {
    tags.add('vineyard')
  }
  if (systems.some((system) => system.cultivationType === 'uliveto')) {
    tags.add('olive_grove')
  }
  if (systems.some((system) => system.notes?.toLowerCase().includes('nft'))) {
    tags.add('nft_system')
  }
  if (systems.some((system) => system.notes?.toLowerCase().includes('ebb'))) {
    tags.add('ebb_flow_system')
  }

  return Array.from(tags)
}
