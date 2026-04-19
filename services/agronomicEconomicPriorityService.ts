import type { AgronomicMeasuredFeedbackRecord } from '@/services/agronomicMeasuredFeedbackService'
import type { ZoneEnvironmentalHistorySummary } from '@/services/environmentalMonitoringService'
import {
  getAgronomicCropProfileById,
  resolveAgronomicCropProfileSync,
} from '@/services/agronomicKernelService'
import type {
  AgronomicActionComparisonTuning,
  AgronomicActionScenarioTuning,
  AgronomicCropProfile,
  AgronomicOperationalContextTag,
} from '@/types/agronomicKernel'

export type AgronomicEconomicFocus = 'water' | 'nutrition' | 'health' | 'quality'

export type AgronomicEconomicSource =
  | 'health'
  | 'irrigation'
  | 'prescription'
  | 'director'
  | 'phenology'

export type AgronomicActionAlternative = 'intervene_now' | 'next_cycle' | 'monitor'

export interface AgronomicEconomicPriorityInput {
  source: AgronomicEconomicSource
  focus: AgronomicEconomicFocus
  priorityScore: number
  priorityConfidence?: number
  urgencyLabel?: 'immediate' | 'next_cycle' | 'monitor'
  agronomicProfileId?: string | null
  cropNameHint?: string | null
  operationalContextTags?: AgronomicOperationalContextTag[] | null
  isCriticalStage?: boolean
  interventionCost?: number | null
  costOfDelay?: number | null
  valueProtected?: number | null
  severity?: 'critical' | 'high' | 'medium' | 'low' | null
  efficacyScore?: number | null
  averageEfficiency?: number | null
  uniformityCoefficient?: number | null
  waterUseEfficiency?: number | null
  benchmarkGap?: number | null
  qualityScoreGap?: number | null
  observationSummary?: AgronomicEconomicObservationSummary | null
  environmentalSummary?: ZoneEnvironmentalHistorySummary | null
}

export interface AgronomicEconomicPrioritySummary {
  status: 'favorable' | 'watch' | 'defensive' | 'unknown'
  estimatedInterventionCost: number | null
  estimatedCostOfDelay: number | null
  estimatedValueProtected: number | null
  estimatedNetImpact: number | null
  roiRatio: number | null
  actionComparison?: AgronomicActionComparisonSummary | null
  scoreAdjustment: number
  confidenceAdjustment: number
  rationale: string[]
}

export interface AgronomicActionScenarioSummary {
  action: AgronomicActionAlternative
  urgencyLabel: NonNullable<AgronomicEconomicPriorityInput['urgencyLabel']>
  estimatedInterventionCost: number
  estimatedCostOfDelay: number
  estimatedValueProtected: number
  estimatedNetImpact: number
  roiRatio: number | null
  rationale: string[]
}

export interface AgronomicActionComparisonSummary {
  recommendedAction: AgronomicActionAlternative
  recommendedUrgencyLabel: NonNullable<AgronomicEconomicPriorityInput['urgencyLabel']>
  dominanceMargin: number
  explanation: string
  scenarios: AgronomicActionScenarioSummary[]
}

export interface AgronomicEconomicObservationSummary {
  sampleCount: number
  matchedBy: 'zone' | 'plant' | 'focus'
  averageObservedInterventionCost: number | null
  averageObservedValueProtected: number | null
  averageObservedNetImpact: number | null
  averageObservedRoiRatio: number | null
  observedCostSampleCount: number
  observedValueSampleCount: number
  dataQuality: 'observed' | 'inventory_derived' | 'estimated' | 'mixed' | 'unknown'
  confidenceAdjustment: number
  rationale: string[]
}

interface AgronomicCropEconomicModel {
  profile?: AgronomicCropProfile | null
  operationalContextTags: AgronomicOperationalContextTag[]
  interventionCostMultiplier: number
  delayCostMultiplier: number
  protectedValueMultiplier: number
  rationale: string[]
  actionComparisonTuning?: AgronomicActionComparisonTuning | null
}

interface AgronomicObservationActionAdjustment {
  interventionCostMultiplier: number
  residualDelayMultiplier: number
  protectedValueMultiplier: number
  rationale: string[]
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const roundMetric = (value: number, digits: number = 2) =>
  Number(value.toFixed(digits))

const toCurrency = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? `€${roundMetric(value, 0)}` : null

const average = (values: Array<number | null | undefined>): number | null => {
  const validValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (validValues.length === 0) {
    return null
  }

  return roundMetric(validValues.reduce((sum, value) => sum + value, 0) / validValues.length)
}

const normalizeText = (value?: string | null) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

const humanizeAgronomicActionAlternative = (action: AgronomicActionAlternative): string => {
  switch (action) {
    case 'intervene_now':
      return 'intervenire ora'
    case 'next_cycle':
      return 'agire nel prossimo ciclo'
    case 'monitor':
    default:
      return 'monitorare'
  }
}

const isSystemContextTag = (
  value?: AgronomicOperationalContextTag | null
): value is Extract<
  AgronomicOperationalContextTag,
  | 'open_field'
  | 'protected_culture'
  | 'orchard'
  | 'vineyard'
  | 'olive_grove'
  | 'indoor'
  | 'hydroponic'
  | 'aquaponic'
  | 'aeroponic'
  | 'mixed'
> =>
  value === 'open_field' ||
  value === 'protected_culture' ||
  value === 'orchard' ||
  value === 'vineyard' ||
  value === 'olive_grove' ||
  value === 'indoor' ||
  value === 'hydroponic' ||
  value === 'aquaponic' ||
  value === 'aeroponic' ||
  value === 'mixed'

const mergeActionScenarioTuning = (
  base: AgronomicActionScenarioTuning | null | undefined,
  override: AgronomicActionScenarioTuning | null | undefined
): AgronomicActionScenarioTuning | null => {
  if (!base && !override) {
    return null
  }

  return {
    interventionCostMultiplier:
      (base?.interventionCostMultiplier ?? 1) * (override?.interventionCostMultiplier ?? 1),
    residualDelayMultiplier:
      (base?.residualDelayMultiplier ?? 1) * (override?.residualDelayMultiplier ?? 1),
    protectedValueMultiplier:
      (base?.protectedValueMultiplier ?? 1) * (override?.protectedValueMultiplier ?? 1),
  }
}

const mergeActionComparisonTuning = (
  base: AgronomicActionComparisonTuning | null | undefined,
  override: AgronomicActionComparisonTuning | null | undefined
): AgronomicActionComparisonTuning | null => {
  if (!base && !override) {
    return null
  }

  const rationale = [
    ...(base?.rationale || []),
    ...(override?.rationale || []),
  ]

  return {
    immediate: mergeActionScenarioTuning(base?.immediate, override?.immediate) || undefined,
    nextCycle: mergeActionScenarioTuning(base?.nextCycle, override?.nextCycle) || undefined,
    monitor: mergeActionScenarioTuning(base?.monitor, override?.monitor) || undefined,
    nextCyclePreferenceThresholdMultiplier:
      (base?.nextCyclePreferenceThresholdMultiplier ?? 1) *
      (override?.nextCyclePreferenceThresholdMultiplier ?? 1),
    rationale: rationale.length > 0 ? Array.from(new Set(rationale)) : undefined,
  }
}

const deriveOperationalContextTags = (
  profile: AgronomicCropProfile,
  explicitTags?: AgronomicOperationalContextTag[] | null
): AgronomicOperationalContextTag[] => {
  const contextTags = new Set<AgronomicOperationalContextTag>(
    (explicitTags || []).filter(
      (tag): tag is AgronomicOperationalContextTag => typeof tag === 'string' && tag.length > 0
    )
  )

  const explicitSystemTags = (explicitTags || []).filter(isSystemContextTag)
  if (explicitSystemTags.length === 0 && profile.systems.length === 1) {
    contextTags.add(profile.systems[0])
  }

  if (
    profile.tags.some((tag) =>
      ['broadacre', 'field_scale', 'extensive', 'protein_crop'].includes(tag)
    )
  ) {
    contextTags.add('broadacre_scale')
  }

  return Array.from(contextTags)
}

const getObservationReliability = (
  observationSummary?: AgronomicEconomicObservationSummary | null
): number => {
  if (!observationSummary) {
    return 0
  }

  const sampleWeight = clamp(observationSummary.sampleCount / 6, 0.25, 1)
  const specificityWeight =
    observationSummary.matchedBy === 'zone'
      ? 1
      : observationSummary.matchedBy === 'plant'
        ? 0.88
        : 0.72
  const qualityWeight =
    observationSummary.dataQuality === 'observed' ||
    observationSummary.dataQuality === 'inventory_derived'
      ? 1
      : observationSummary.dataQuality === 'mixed'
        ? 0.82
        : observationSummary.dataQuality === 'estimated'
          ? 0.64
          : 0.5

  return clamp(sampleWeight * specificityWeight * qualityWeight, 0, 1)
}

const resolveObservationActionAdjustment = (
  input: AgronomicEconomicPriorityInput,
  action: AgronomicActionAlternative
): AgronomicObservationActionAdjustment => {
  const observationSummary = input.observationSummary
  if (!observationSummary) {
    return {
      interventionCostMultiplier: 1,
      residualDelayMultiplier: 1,
      protectedValueMultiplier: 1,
      rationale: [],
    }
  }

  const reliability = getObservationReliability(observationSummary)
  if (reliability <= 0) {
    return {
      interventionCostMultiplier: 1,
      residualDelayMultiplier: 1,
      protectedValueMultiplier: 1,
      rationale: [],
    }
  }

  const observedRoi = observationSummary.averageObservedRoiRatio
  const observedNetImpact = observationSummary.averageObservedNetImpact
  const rationale: string[] = []
  let interventionCostMultiplier = 1
  let residualDelayMultiplier = 1
  let protectedValueMultiplier = 1

  if (
    (typeof observedRoi === 'number' && observedRoi <= 0) ||
    (typeof observedNetImpact === 'number' && observedNetImpact <= 0)
  ) {
    if (action === 'intervene_now') {
      interventionCostMultiplier *= 1 + 0.28 * reliability
      residualDelayMultiplier *= 1 + 0.18 * reliability
      protectedValueMultiplier *= 1 - 0.36 * reliability
    } else if (action === 'next_cycle') {
      protectedValueMultiplier *= 1 - 0.14 * reliability
      residualDelayMultiplier *= 1 - 0.22 * reliability
    } else {
      interventionCostMultiplier *= 0.78
      residualDelayMultiplier *= 1 - 0.62 * reliability
      protectedValueMultiplier *= 1 + 0.12 * reliability
    }

    rationale.push('Storico osservato debole: interventi analoghi hanno avuto ritorno economico limitato.')
  } else if (
    (typeof observedRoi === 'number' && observedRoi >= 1.2) ||
    (typeof observedNetImpact === 'number' && observedNetImpact >= 25)
  ) {
    if (action === 'intervene_now') {
      protectedValueMultiplier *= 1 + 0.12 * reliability
      residualDelayMultiplier *= 1 - 0.1 * reliability
    } else if (action === 'next_cycle') {
      protectedValueMultiplier *= 1 + 0.04 * reliability
    } else {
      protectedValueMultiplier *= 1 - 0.12 * reliability
      residualDelayMultiplier *= 1 + 0.06 * reliability
    }

    rationale.push('Storico osservato favorevole: interventi comparabili hanno protetto valore in modo consistente.')
  } else if (
    typeof observedRoi === 'number' &&
    observedRoi > 0 &&
    observedRoi < 0.8
  ) {
    if (action === 'intervene_now') {
      protectedValueMultiplier *= 1 - 0.15 * reliability
    } else if (action === 'next_cycle') {
      interventionCostMultiplier *= 1 - 0.12 * reliability
      protectedValueMultiplier *= 1 + 0.16 * reliability
      residualDelayMultiplier *= 1 - 0.22 * reliability
    } else {
      residualDelayMultiplier *= 0.94
    }

    rationale.push('Storico osservato prudente: c e valore economico, ma non abbastanza da forzare sempre l intervento immediato.')
  }

  return {
    interventionCostMultiplier: roundMetric(interventionCostMultiplier, 3),
    residualDelayMultiplier: roundMetric(residualDelayMultiplier, 3),
    protectedValueMultiplier: roundMetric(protectedValueMultiplier, 3),
    rationale,
  }
}

const getTextMetric = (record: AgronomicMeasuredFeedbackRecord, keys: string[]): string | null => {
  for (const key of keys) {
    const value = record.metrics[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return null
}

const blendObservedWithModeled = (
  observedValue: number | null | undefined,
  modeledValue: number | null | undefined,
  sampleCount: number,
  options?: {
    minObservedWeight?: number
    maxObservedWeight?: number
  }
): number | null => {
  const hasObserved = typeof observedValue === 'number' && Number.isFinite(observedValue)
  const hasModeled = typeof modeledValue === 'number' && Number.isFinite(modeledValue)

  if (!hasObserved && !hasModeled) {
    return null
  }

  if (hasObserved && !hasModeled) {
    return roundMetric(observedValue as number, 0)
  }

  if (!hasObserved && hasModeled) {
    return roundMetric(modeledValue as number, 0)
  }

  const minObservedWeight = options?.minObservedWeight ?? 0.45
  const maxObservedWeight = options?.maxObservedWeight ?? 0.8
  const observedWeight = clamp(
    minObservedWeight + sampleCount * 0.05,
    minObservedWeight,
    maxObservedWeight
  )

  return roundMetric(
    (observedValue as number) * observedWeight +
      (modeledValue as number) * (1 - observedWeight),
    0
  )
}

const getNumericMetric = (record: AgronomicMeasuredFeedbackRecord, keys: string[]): number | null => {
  for (const key of keys) {
    const value = record.metrics[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return null
}

const resolveAgronomicCropEconomicModel = (
  input: Pick<
    AgronomicEconomicPriorityInput,
    'agronomicProfileId' | 'cropNameHint' | 'focus' | 'isCriticalStage' | 'operationalContextTags'
  >
): AgronomicCropEconomicModel => {
  const profile =
    (input.agronomicProfileId
      ? getAgronomicCropProfileById(input.agronomicProfileId)
      : null) ||
    (input.cropNameHint
      ? resolveAgronomicCropProfileSync({ plantId: input.cropNameHint }).profile
      : null)

  if (!profile) {
    return {
      profile: null,
      operationalContextTags: [],
      interventionCostMultiplier: 1,
      delayCostMultiplier: 1,
      protectedValueMultiplier: 1,
      rationale: [],
      actionComparisonTuning: null,
    }
  }

  let interventionCostMultiplier = 1
  let delayCostMultiplier = 1
  let protectedValueMultiplier = 1
  const rationale: string[] = []
  const tags = new Set(profile.tags)
  const operationalContextTags = deriveOperationalContextTags(profile, input.operationalContextTags)
  const operationalContextTagSet = new Set(operationalContextTags)
  const focusModifier = profile.economicModifiers?.[input.focus]

  if (profile.lifecycle === 'perennial') {
    interventionCostMultiplier *= 1.08
    delayCostMultiplier *= 1.12
    protectedValueMultiplier *= 1.16
    rationale.push('Profilo poliennale: carry-over economico piu alto tra campagne.')
  }

  if (
    operationalContextTagSet.has('broadacre_scale') ||
    tags.has('broadacre') ||
    tags.has('field_scale') ||
    tags.has('extensive')
  ) {
    interventionCostMultiplier *= 1.08
    delayCostMultiplier *= 1.04
    protectedValueMultiplier *= 1.06
    rationale.push('Scala estensiva: costo operativo piu distribuito ma impatto totale piu ampio.')
  }

  if (
    tags.has('quality') ||
    tags.has('quality_sensitive') ||
    tags.has('quality_driven') ||
    tags.has('market_quality') ||
    tags.has('wine') ||
    tags.has('oil_quality')
  ) {
    delayCostMultiplier *= 1.14
    protectedValueMultiplier *= 1.18
    rationale.push('Profilo orientato alla qualita: il ritardo pesa di piu sul valore commerciale.')
  }

  if (tags.has('winter_cereals') || tags.has('cereals')) {
    interventionCostMultiplier *= 0.92
    delayCostMultiplier *= 1.06
    protectedValueMultiplier *= 1.02
    rationale.push('Cereali vernini: intervento relativamente efficiente ma finestra fenologica sensibile.')
  }

  if (tags.has('brassicas')) {
    interventionCostMultiplier *= 1.02
    delayCostMultiplier *= 1.12
    protectedValueMultiplier *= 1.12
    rationale.push('Brassicacee di pieno campo: qualita e uniformita degradano rapidamente fuori finestra.')
  }

  if (tags.has('legume')) {
    interventionCostMultiplier *= 0.98
    delayCostMultiplier *= 1.05
    protectedValueMultiplier *= 1.04
    rationale.push('Leguminose: buona efficienza input, ma fioritura e allegagione restano sensibili.')
  }

  if (tags.has('artichoke')) {
    interventionCostMultiplier *= 1.05
    delayCostMultiplier *= 1.16
    protectedValueMultiplier *= 1.18
    rationale.push('Carciofo: il ritardo impatta calibro, compattezza e continuita dei tagli.')
  }

  if (tags.has('industrial')) {
    interventionCostMultiplier *= 1.12
    delayCostMultiplier *= 1.08
    protectedValueMultiplier *= 1.12
    rationale.push('Coltura industriale: input e superfici aumentano il peso economico per decisione.')
  }

  if (tags.has('orchard') || tags.has('woody')) {
    interventionCostMultiplier *= 1.1
    delayCostMultiplier *= 1.16
    protectedValueMultiplier *= 1.2
    rationale.push('Arboree: valore per unita e carry-over stagionale piu alti.')
  }

  if (tags.has('olive')) {
    interventionCostMultiplier *= 1.02
    delayCostMultiplier *= 1.12
    protectedValueMultiplier *= 1.16
    rationale.push('Olivo: stress e timing influenzano resa in olio e difetti.')
  }

  if (tags.has('vineyard')) {
    interventionCostMultiplier *= 1.08
    delayCostMultiplier *= 1.18
    protectedValueMultiplier *= 1.24
    rationale.push('Vigneto: maturazione e qualita enologica rendono il ritardo piu costoso.')
  }

  if (
    operationalContextTagSet.has('protected_culture') ||
    operationalContextTagSet.has('indoor') ||
    operationalContextTagSet.has('hydroponic') ||
    operationalContextTagSet.has('aquaponic') ||
    operationalContextTagSet.has('aeroponic')
  ) {
    interventionCostMultiplier *= 1.1
    delayCostMultiplier *= 1.18
    protectedValueMultiplier *= 1.16
    rationale.push('Sistema protetto o controllato: costo operativo piu alto ma risposta economica piu immediata.')
  }

  if (input.focus === 'water') {
    if (profile.water.strategy === 'stress_tolerant') {
      delayCostMultiplier *= 0.92
      protectedValueMultiplier *= 0.96
      rationale.push('Strategia idrica tollerante allo stress: il costo del ritardo e piu contenuto.')
    }

    if (profile.water.strategy === 'deficit_sensitive') {
      delayCostMultiplier *= 1.12
      rationale.push('Strategia idrica sensibile al deficit: il ritardo irriguo pesa di piu.')
    }

    if (profile.water.strategy === 'quality_oriented') {
      delayCostMultiplier *= 1.08
      protectedValueMultiplier *= 1.08
      rationale.push('Acqua legata alla qualita: il volume corretto protegge anche il prezzo finale.')
    }
  }

  if (input.focus === 'nutrition') {
    if (profile.nutrition.strategy === 'quality_finish') {
      delayCostMultiplier *= 1.12
      protectedValueMultiplier *= 1.12
      rationale.push('Nutrizione di finitura: fuori timing cala il valore finale del raccolto.')
    }

    if (profile.nutrition.strategy === 'nitrogen_sensitive') {
      delayCostMultiplier *= 1.08
      rationale.push("Profilo sensibile all'azoto: finestra nutrizionale economicamente piu stretta.")
    }
  }

  if (
    input.focus === 'quality' &&
    profile.quality.targetMetrics.some((metric) =>
      ['brix', 'oil_quality', 'protein', 'shelf_life', 'head_compactness', 'fruit_size'].includes(metric)
    )
  ) {
    delayCostMultiplier *= 1.14
    protectedValueMultiplier *= 1.16
    rationale.push('Metriche qualitative premium: il valore protetto per punto di qualita e piu alto.')
  }

  if (input.focus === 'health' && profile.health.priorities.includes('fruit_quality_pressure')) {
    delayCostMultiplier *= 1.08
    protectedValueMultiplier *= 1.08
    rationale.push('Pressione sanitaria sulla qualita commerciale: il ritardo ha costo indiretto sul lotto.')
  }

  if (input.isCriticalStage) {
    delayCostMultiplier *= 1.12
    protectedValueMultiplier *= 1.06
    rationale.push('Stadio decisionale critico: la finestra economica e piu stretta.')
  }

  if (focusModifier?.interventionCostMultiplier) {
    interventionCostMultiplier *= focusModifier.interventionCostMultiplier
  }

  if (focusModifier?.delayCostMultiplier) {
    delayCostMultiplier *= focusModifier.delayCostMultiplier
  }

  if (focusModifier?.protectedValueMultiplier) {
    protectedValueMultiplier *= focusModifier.protectedValueMultiplier
  }

  if (focusModifier?.rationale?.length) {
    rationale.push(...focusModifier.rationale)
  }

  const actionComparisonTuning = (profile.actionComparisonContextOverrides?.[input.focus] || []).reduce(
    (resolvedTuning, override) =>
      override.requiredTags.every((tag) => operationalContextTagSet.has(tag))
        ? mergeActionComparisonTuning(resolvedTuning, override.tuning)
        : resolvedTuning,
    profile.actionComparisonTuning?.[input.focus] || null
  )

  return {
    profile,
    operationalContextTags,
    interventionCostMultiplier: roundMetric(interventionCostMultiplier, 3),
    delayCostMultiplier: roundMetric(delayCostMultiplier, 3),
    protectedValueMultiplier: roundMetric(protectedValueMultiplier, 3),
    rationale,
    actionComparisonTuning,
  }
}

const getActionScenarioProfileTuning = (
  tuning: AgronomicActionComparisonTuning | null | undefined,
  action: AgronomicActionAlternative
): AgronomicActionScenarioTuning | null => {
  if (!tuning) {
    return null
  }

  switch (action) {
    case 'intervene_now':
      return tuning.immediate || null
    case 'next_cycle':
      return tuning.nextCycle || null
    case 'monitor':
    default:
      return tuning.monitor || null
  }
}

export function summarizeAgronomicEconomicObservations(
  records: AgronomicMeasuredFeedbackRecord[],
  options: {
    focus: AgronomicEconomicFocus
    zoneId?: string | null
    plantName?: string | null
  }
): AgronomicEconomicObservationSummary | null {
  if (options.focus === 'health') {
    return null
  }

  const focusRecords = records.filter((record) => record.focus === options.focus)
  if (focusRecords.length === 0) {
    return null
  }

  const normalizedPlantName = normalizeText(options.plantName)
  const zoneRecords = options.zoneId
    ? focusRecords.filter((record) => record.zoneId === options.zoneId)
    : []
  const plantRecords = normalizedPlantName
    ? focusRecords.filter((record) => normalizeText(record.plantName) === normalizedPlantName)
    : []

  const matchedRecords =
    zoneRecords.length > 0
      ? zoneRecords
      : plantRecords.length > 0
        ? plantRecords
        : focusRecords
  const matchedBy: AgronomicEconomicObservationSummary['matchedBy'] =
    zoneRecords.length > 0 ? 'zone' : plantRecords.length > 0 ? 'plant' : 'focus'

  const recentRecords = [...matchedRecords]
    .sort((left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime())
    .slice(0, 8)

  const costValues = recentRecords
    .map((record) => getNumericMetric(record, ['actualCost', 'cost', 'totalCost', 'estimatedCost']))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  const valueValues = recentRecords
    .map((record) =>
      getNumericMetric(record, [
        'economicValue',
        'estimatedValue',
        'valueProtected',
        'estimatedRevenue',
        'revenue',
      ])
    )
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  const averageObservedInterventionCost = average(costValues)
  const averageObservedValueProtected = average(valueValues)
  const averageObservedNetImpact = average(
    recentRecords.map((record) => {
      const explicitNet = getNumericMetric(record, ['netImpact', 'estimatedNetImpact'])
      if (typeof explicitNet === 'number') {
        return explicitNet
      }

      const cost = getNumericMetric(record, ['actualCost', 'cost', 'totalCost', 'estimatedCost'])
      const value = getNumericMetric(record, [
        'economicValue',
        'estimatedValue',
        'valueProtected',
        'estimatedRevenue',
        'revenue',
      ])
      if (typeof cost === 'number' && typeof value === 'number') {
        return value - cost
      }

      return null
    })
  )
  const averageObservedRoiRatio = average(
    recentRecords.map((record) => {
      const explicitRoi = getNumericMetric(record, ['roiRatio', 'roi'])
      if (typeof explicitRoi === 'number') {
        return explicitRoi
      }

      const cost = getNumericMetric(record, ['actualCost', 'cost', 'totalCost', 'estimatedCost'])
      const value = getNumericMetric(record, [
        'economicValue',
        'estimatedValue',
        'valueProtected',
        'estimatedRevenue',
        'revenue',
      ])
      if (typeof cost === 'number' && cost > 0 && typeof value === 'number') {
        return (value - cost) / cost
      }

      return null
    })
  )

  if (
    averageObservedInterventionCost === null &&
    averageObservedValueProtected === null &&
    averageObservedNetImpact === null &&
    averageObservedRoiRatio === null
  ) {
    return null
  }

  const costSources = recentRecords
    .map((record) => getTextMetric(record, ['costSource']))
    .filter((value): value is string => Boolean(value))
  const uniqueCostSources = new Set(costSources)
  const dataQuality: AgronomicEconomicObservationSummary['dataQuality'] =
    uniqueCostSources.size === 0
      ? 'unknown'
      : uniqueCostSources.size > 1
        ? 'mixed'
        : uniqueCostSources.has('observed')
          ? 'observed'
          : uniqueCostSources.has('inventory_derived')
            ? 'inventory_derived'
            : 'estimated'

  const rationale: string[] = []
  if (averageObservedInterventionCost !== null) {
    rationale.push(`Costo osservato medio ${toCurrency(averageObservedInterventionCost)}.`)
  }
  if (averageObservedValueProtected !== null) {
    rationale.push(`Valore osservato medio ${toCurrency(averageObservedValueProtected)}.`)
  }
  if (averageObservedRoiRatio !== null) {
    rationale.push(`ROI osservato medio ${averageObservedRoiRatio.toFixed(1)}x.`)
  }
  if (dataQuality === 'observed' || dataQuality === 'inventory_derived') {
    rationale.push('Base economica supportata da costi osservati o derivati da inventario.')
  } else if (dataQuality === 'estimated') {
    rationale.push('Base economica storica ancora prevalentemente stimata.')
  }

  return {
    sampleCount: recentRecords.length,
    matchedBy,
    averageObservedInterventionCost,
    averageObservedValueProtected,
    averageObservedNetImpact,
    averageObservedRoiRatio,
    observedCostSampleCount: costValues.length,
    observedValueSampleCount: valueValues.length,
    dataQuality,
    confidenceAdjustment: clamp(
      0.02 +
        recentRecords.length * 0.008 +
        (matchedBy === 'focus' ? 0 : 0.015) +
        (dataQuality === 'observed' || dataQuality === 'inventory_derived'
          ? 0.025
          : dataQuality === 'mixed'
            ? 0.015
            : 0),
      0.02,
      0.14
    ),
    rationale,
  }
}

const urgencyMultiplier = (
  urgencyLabel?: AgronomicEconomicPriorityInput['urgencyLabel']
): number => {
  switch (urgencyLabel) {
    case 'immediate':
      return 1.45
    case 'next_cycle':
      return 1.12
    case 'monitor':
    default:
      return 0.88
  }
}

const getAlternativeUrgencyLabel = (
  action: AgronomicActionAlternative
): NonNullable<AgronomicEconomicPriorityInput['urgencyLabel']> => {
  switch (action) {
    case 'intervene_now':
      return 'immediate'
    case 'next_cycle':
      return 'next_cycle'
    case 'monitor':
    default:
      return 'monitor'
  }
}

const getScenarioInterventionMultiplier = (
  input: AgronomicEconomicPriorityInput,
  action: AgronomicActionAlternative
): number => {
  const priorityPressure = clamp(input.priorityScore / 100, 0.05, 1)

  switch (action) {
    case 'intervene_now':
      return 1
    case 'next_cycle':
      return clamp(
        input.focus === 'water'
          ? 0.88 + priorityPressure * 0.06
          : input.focus === 'nutrition'
            ? 0.9 + priorityPressure * 0.07
            : 0.94 + priorityPressure * 0.05,
        0.88,
        1
      )
    case 'monitor':
    default:
      return 0.12
  }
}

const getScenarioProtectedValueMultiplier = (
  input: AgronomicEconomicPriorityInput,
  action: AgronomicActionAlternative
): number => {
  const priorityPressure = clamp(input.priorityScore / 100, 0.05, 1)
  const confidencePressure = clamp(input.priorityConfidence ?? 0.55, 0.35, 0.98)

  switch (action) {
    case 'intervene_now':
      return clamp(
        (input.isCriticalStage ? 0.64 : 0.55) +
          priorityPressure * 0.36 +
          (confidencePressure - 0.5) * 0.12,
        0.6,
        1
      )
    case 'next_cycle': {
      const immediateMultiplier = getScenarioProtectedValueMultiplier(input, 'intervene_now')
      if (input.isCriticalStage) {
        return clamp(immediateMultiplier * 0.74, 0.42, 0.84)
      }

      if (input.focus === 'quality' || input.focus === 'health') {
        return clamp(immediateMultiplier * 0.84, 0.46, 0.9)
      }

      return clamp(immediateMultiplier * 0.92, 0.52, 0.94)
    }
    case 'monitor':
    default:
      return clamp(
        input.isCriticalStage
          ? 0.08
          : 0.16 +
              (1 - priorityPressure) * 0.42 +
              (0.7 - confidencePressure) * 0.08,
        input.isCriticalStage ? 0.08 : 0.18,
        0.58
      )
  }
}

const getScenarioResidualDelayMultiplier = (
  input: AgronomicEconomicPriorityInput,
  action: AgronomicActionAlternative
): number => {
  const priorityPressure = clamp(input.priorityScore / 100, 0.05, 1)

  switch (action) {
    case 'intervene_now':
      return clamp(0.03 + priorityPressure * 0.04, 0.03, 0.08)
    case 'next_cycle': {
      const focusPressure = input.focus === 'quality' || input.focus === 'health' ? 0.05 : 0
      const criticalPressure = input.isCriticalStage ? 0.12 : 0
      return clamp(0.12 + priorityPressure * 0.16 + focusPressure + criticalPressure, 0.14, 0.55)
    }
    case 'monitor':
    default:
      return clamp(
        0.26 +
          priorityPressure * 0.38 +
          (input.focus === 'quality' || input.focus === 'health' ? 0.06 : 0) +
          (input.isCriticalStage ? 0.16 : 0),
        0.28,
        0.96
      )
  }
}

const buildAgronomicActionScenario = (
  input: AgronomicEconomicPriorityInput,
  action: AgronomicActionAlternative
): AgronomicActionScenarioSummary => {
  const urgencyLabel = getAlternativeUrgencyLabel(action)
  const scenarioInput = {
    ...input,
    urgencyLabel,
  }
  const baseInterventionCost = deriveInterventionCost(scenarioInput)
  const baseCostOfDelay = deriveCostOfDelay(scenarioInput)
  const baseProtectedValue = deriveValueProtected(
    scenarioInput,
    baseInterventionCost,
    baseCostOfDelay
  )
  const cropEconomicModel = resolveAgronomicCropEconomicModel(input)
  const profileActionTuning = getActionScenarioProfileTuning(
    cropEconomicModel.actionComparisonTuning,
    action
  )
  const observationAdjustment = resolveObservationActionAdjustment(input, action)
  const estimatedInterventionCost = roundMetric(
    baseInterventionCost *
      getScenarioInterventionMultiplier(input, action) *
      (profileActionTuning?.interventionCostMultiplier ?? 1) *
      observationAdjustment.interventionCostMultiplier,
    0
  )
  const estimatedCostOfDelay = roundMetric(
    baseCostOfDelay *
      getScenarioResidualDelayMultiplier(input, action) *
      (profileActionTuning?.residualDelayMultiplier ?? 1) *
      observationAdjustment.residualDelayMultiplier,
    0
  )
  const estimatedValueProtected = roundMetric(
    baseProtectedValue *
      getScenarioProtectedValueMultiplier(input, action) *
      (profileActionTuning?.protectedValueMultiplier ?? 1) *
      observationAdjustment.protectedValueMultiplier,
    0
  )
  const estimatedNetImpact = roundMetric(
    estimatedValueProtected - estimatedInterventionCost - estimatedCostOfDelay,
    0
  )
  const roiRatio =
    estimatedInterventionCost > 0
      ? roundMetric(estimatedNetImpact / estimatedInterventionCost, 2)
      : null

  const rationale: string[] = []
  if (action === 'intervene_now') {
    rationale.push('Riduce al minimo l esposizione al ritardo e massimizza il valore protetto.')
  } else if (action === 'next_cycle') {
    rationale.push('Conserva parte del valore ma assorbe una quota materiale del costo del ritardo.')
  } else {
    rationale.push('Minimizza il costo operativo oggi ma lascia gran parte del rischio in campo.')
  }

  if (input.isCriticalStage && action !== 'intervene_now') {
    rationale.push('Lo stadio critico rende piu fragile il valore recuperabile posticipo o monitoraggio.')
  }
  if (cropEconomicModel.actionComparisonTuning?.rationale?.length) {
    rationale.push(...cropEconomicModel.actionComparisonTuning.rationale.slice(0, 1))
  }
  if (observationAdjustment.rationale.length > 0) {
    rationale.push(...observationAdjustment.rationale)
  }

  return {
    action,
    urgencyLabel,
    estimatedInterventionCost,
    estimatedCostOfDelay,
    estimatedValueProtected,
    estimatedNetImpact,
    roiRatio,
    rationale,
  }
}

export function buildAgronomicActionComparison(
  input: AgronomicEconomicPriorityInput
): AgronomicActionComparisonSummary {
  const cropEconomicModel = resolveAgronomicCropEconomicModel(input)
  const nextCyclePreferenceThresholdMultiplier =
    cropEconomicModel.actionComparisonTuning?.nextCyclePreferenceThresholdMultiplier ?? 1
  const scenarios: AgronomicActionScenarioSummary[] = [
    buildAgronomicActionScenario(input, 'intervene_now'),
    buildAgronomicActionScenario(input, 'next_cycle'),
    buildAgronomicActionScenario(input, 'monitor'),
  ]

  const rankedScenarios = [...scenarios].sort((left, right) => {
    if (right.estimatedNetImpact !== left.estimatedNetImpact) {
      return right.estimatedNetImpact - left.estimatedNetImpact
    }

    if ((right.roiRatio ?? Number.NEGATIVE_INFINITY) !== (left.roiRatio ?? Number.NEGATIVE_INFINITY)) {
      return (right.roiRatio ?? Number.NEGATIVE_INFINITY) - (left.roiRatio ?? Number.NEGATIVE_INFINITY)
    }

    return left.estimatedInterventionCost - right.estimatedInterventionCost
  })

  const immediateScenario = scenarios.find((scenario) => scenario.action === 'intervene_now')
  const nextCycleScenario = scenarios.find((scenario) => scenario.action === 'next_cycle')
  const priorityConfidence = clamp(input.priorityConfidence ?? 0.55, 0.3, 0.98)

  let recommendedScenario = rankedScenarios[0]
  let runnerUpScenario = rankedScenarios[1] || rankedScenarios[0]
  let explanation = ''
  let dominanceMargin = roundMetric(
    recommendedScenario.estimatedNetImpact - runnerUpScenario.estimatedNetImpact,
    0
  )

  const shouldPreferNextCycle =
    Boolean(immediateScenario) &&
    Boolean(nextCycleScenario) &&
    !input.isCriticalStage &&
    input.priorityScore >= 28 &&
    input.priorityScore <= 70 &&
    priorityConfidence <= 0.82 &&
    (nextCycleScenario?.estimatedNetImpact || 0) > 0 &&
    (immediateScenario?.estimatedNetImpact || 0) > (nextCycleScenario?.estimatedNetImpact || 0) &&
    (immediateScenario?.estimatedNetImpact || 0) - (nextCycleScenario?.estimatedNetImpact || 0) <=
      Math.max(36, (immediateScenario?.estimatedInterventionCost || 0) * 0.32) *
        nextCyclePreferenceThresholdMultiplier

  if (shouldPreferNextCycle && nextCycleScenario && immediateScenario) {
    recommendedScenario = nextCycleScenario
    runnerUpScenario = immediateScenario
    dominanceMargin = roundMetric(
      Math.max(6, (immediateScenario.estimatedNetImpact - nextCycleScenario.estimatedNetImpact) * 0.5),
      0
    )
    const marginLabel = toCurrency(dominanceMargin) || `€${dominanceMargin}`
    explanation = `agire nel prossimo ciclo prevale su intervenire ora: il costo opportunita stimato resta limitato (${marginLabel}) e consente una finestra operativa piu ordinata.`
  } else {
    const marginLabel = toCurrency(dominanceMargin) || `€${dominanceMargin}`
    explanation =
      dominanceMargin > 0
        ? `${humanizeAgronomicActionAlternative(recommendedScenario.action)} domina rispetto a ${humanizeAgronomicActionAlternative(runnerUpScenario.action)} con margine stimato ${marginLabel} di impatto netto.`
        : `${humanizeAgronomicActionAlternative(recommendedScenario.action)} resta l opzione preferita, ma il vantaggio sulle alternative e contenuto.`
  }

  return {
    recommendedAction: recommendedScenario.action,
    recommendedUrgencyLabel: recommendedScenario.urgencyLabel,
    dominanceMargin,
    explanation,
    scenarios,
  }
}

const severityWeight = (
  severity?: AgronomicEconomicPriorityInput['severity']
): number => {
  switch (severity) {
    case 'critical':
      return 24
    case 'high':
      return 16
    case 'medium':
      return 8
    case 'low':
    default:
      return 0
  }
}

const deriveInterventionCost = (input: AgronomicEconomicPriorityInput): number => {
  const cropEconomicModel = resolveAgronomicCropEconomicModel(input)
  const observedCost =
    typeof input.observationSummary?.averageObservedInterventionCost === 'number'
      ? Math.max(0, input.observationSummary.averageObservedInterventionCost)
      : null
  const explicitCost =
    typeof input.interventionCost === 'number' && Number.isFinite(input.interventionCost)
      ? Math.max(0, input.interventionCost) * cropEconomicModel.interventionCostMultiplier
      : null

  let modeledCost: number | null = explicitCost

  if (modeledCost === null) {
    switch (input.source) {
      case 'director':
        modeledCost =
          (32 + input.priorityScore * 0.18) * cropEconomicModel.interventionCostMultiplier
        break
      case 'irrigation': {
        const efficiencyGap = Math.max(0, 100 - (input.averageEfficiency ?? 78))
        const uniformityGap = Math.max(0, 100 - (input.uniformityCoefficient ?? 82))
        const waterUseGap = Math.max(0, 100 - (input.waterUseEfficiency ?? 76))
        modeledCost =
          (18 + efficiencyGap * 0.32 + uniformityGap * 0.14 + waterUseGap * 0.18) *
          cropEconomicModel.interventionCostMultiplier
        break
      }
      case 'prescription': {
        const efficacyGap = Math.max(0, 100 - (input.efficacyScore ?? 72))
        const benchmarkGap = Math.max(0, input.benchmarkGap ?? input.qualityScoreGap ?? 0)
        modeledCost =
          (26 + efficacyGap * 0.38 + benchmarkGap * 0.45) *
          cropEconomicModel.interventionCostMultiplier
        break
      }
      case 'health':
        modeledCost =
          (24 + input.priorityScore * 0.14 + severityWeight(input.severity)) *
          cropEconomicModel.interventionCostMultiplier
        break
      case 'phenology':
        modeledCost =
          (10 + (input.qualityScoreGap ?? 0) * 0.35 + input.priorityScore * 0.05) *
          cropEconomicModel.interventionCostMultiplier
        break
      default:
        modeledCost =
          (20 + input.priorityScore * 0.12) * cropEconomicModel.interventionCostMultiplier
    }
  }

  return (
    blendObservedWithModeled(
      observedCost,
      modeledCost,
      input.observationSummary?.observedCostSampleCount || input.observationSummary?.sampleCount || 0
    ) || 0
  )
}

const hasPersistentEnvironmentalDeficit = (
  environmentalSummary?: ZoneEnvironmentalHistorySummary | null
) =>
  (environmentalSummary?.highSoilWaterStressDays || 0) >= 2 ||
  (environmentalSummary?.deficitWaterBalanceDays || 0) >= 3

const hasPersistentEnvironmentalHumidity = (
  environmentalSummary?: ZoneEnvironmentalHistorySummary | null
) =>
  (environmentalSummary?.highDiseasePressureDays || 0) >= 2 ||
  (environmentalSummary?.surplusWaterBalanceDays || 0) >= 2 ||
  (environmentalSummary?.lowDryingPowerDays || 0) >= 2

const deriveCostOfDelay = (input: AgronomicEconomicPriorityInput): number => {
  if (typeof input.costOfDelay === 'number' && Number.isFinite(input.costOfDelay)) {
    return roundMetric(Math.max(0, input.costOfDelay), 0)
  }

  const cropEconomicModel = resolveAgronomicCropEconomicModel(input)

  const baseByFocus: Record<AgronomicEconomicFocus, number> = {
    water: 42,
    nutrition: 54,
    health: 68,
    quality: 72,
  }

  let costOfDelay =
    baseByFocus[input.focus] * urgencyMultiplier(input.urgencyLabel) + input.priorityScore * 0.42

  if (input.focus === 'water') {
    costOfDelay += Math.max(0, 100 - (input.averageEfficiency ?? 80)) * 0.45
    costOfDelay += Math.max(0, 100 - (input.waterUseEfficiency ?? 78)) * 0.4
  }

  if (input.focus === 'nutrition') {
    costOfDelay += Math.max(0, 100 - (input.efficacyScore ?? 72)) * 0.5
  }

  if (input.focus === 'quality') {
    costOfDelay += Math.max(0, input.qualityScoreGap ?? input.benchmarkGap ?? 0) * 1.1
  }

  if (input.focus === 'health') {
    costOfDelay += severityWeight(input.severity)
  }

  if (hasPersistentEnvironmentalDeficit(input.environmentalSummary)) {
    if (input.focus === 'water') {
      costOfDelay += 18
    } else if (input.focus === 'nutrition') {
      costOfDelay += 10
    } else if (input.focus === 'quality') {
      costOfDelay += 14
    }
  }

  if (hasPersistentEnvironmentalHumidity(input.environmentalSummary)) {
    if (input.focus === 'health') {
      costOfDelay += 18
    } else if (input.focus === 'nutrition') {
      costOfDelay += 8
    } else if (input.focus === 'quality') {
      costOfDelay += 10
    }
  }

  return roundMetric(costOfDelay * cropEconomicModel.delayCostMultiplier, 0)
}

const deriveValueProtected = (
  input: AgronomicEconomicPriorityInput,
  interventionCost: number,
  costOfDelay: number
): number => {
  const cropEconomicModel = resolveAgronomicCropEconomicModel(input)
  const observedValue =
    typeof input.observationSummary?.averageObservedValueProtected === 'number'
      ? Math.max(0, input.observationSummary.averageObservedValueProtected)
      : null
  const explicitValue =
    typeof input.valueProtected === 'number' && Number.isFinite(input.valueProtected)
      ? Math.max(0, input.valueProtected) * cropEconomicModel.protectedValueMultiplier
      : null

  const multiplierByFocus: Record<AgronomicEconomicFocus, number> = {
    water: 1.18,
    nutrition: 1.28,
    health: 1.45,
    quality: 1.4,
  }

  const modeledValue =
    explicitValue ??
    Math.max(interventionCost * 1.2, costOfDelay * multiplierByFocus[input.focus]) *
      cropEconomicModel.protectedValueMultiplier

  const environmentalProtectedValueMultiplier =
    hasPersistentEnvironmentalDeficit(input.environmentalSummary) && input.focus !== 'health'
      ? 1.08
      : hasPersistentEnvironmentalHumidity(input.environmentalSummary) && input.focus !== 'water'
        ? 1.1
        : 1

  return (
    blendObservedWithModeled(
      observedValue,
      modeledValue * environmentalProtectedValueMultiplier,
      input.observationSummary?.observedValueSampleCount || input.observationSummary?.sampleCount || 0,
      {
        minObservedWeight: 0.5,
        maxObservedWeight: 0.82,
      }
    ) || 0
  )
}

export function buildAgronomicEconomicPrioritySummary(
  input: AgronomicEconomicPriorityInput
): AgronomicEconomicPrioritySummary {
  const cropEconomicModel = resolveAgronomicCropEconomicModel(input)
  const actionComparison = buildAgronomicActionComparison(input)
  const recommendedScenario =
    actionComparison.scenarios.find(
      (scenario) => scenario.action === actionComparison.recommendedAction
    ) || actionComparison.scenarios[0]
  const interventionCost = recommendedScenario?.estimatedInterventionCost || 0
  const costOfDelay = recommendedScenario?.estimatedCostOfDelay || 0
  const valueProtected = recommendedScenario?.estimatedValueProtected || 0
  const estimatedNetImpact = recommendedScenario?.estimatedNetImpact || 0
  const roiRatio = recommendedScenario?.roiRatio ?? null

  let status: AgronomicEconomicPrioritySummary['status'] = 'unknown'
  if (roiRatio !== null) {
    if (
      estimatedNetImpact > 0 &&
      (roiRatio >= 0.75 || valueProtected >= interventionCost + costOfDelay)
    ) {
      status = 'favorable'
    } else if (estimatedNetImpact >= 0 || roiRatio > 0) {
      status = 'watch'
    } else {
      status = 'defensive'
    }
  }

  let scoreAdjustment = 0
  switch (status) {
    case 'favorable':
      scoreAdjustment += roiRatio !== null && roiRatio >= 1.5 ? 8 : 5
      break
    case 'watch':
      scoreAdjustment += 2
      break
    case 'defensive':
      scoreAdjustment -= 3
      break
    default:
      break
  }

  if (costOfDelay >= interventionCost * 2) {
    scoreAdjustment += 3
  } else if (costOfDelay < interventionCost * 0.8) {
    scoreAdjustment -= 2
  }

  if (typeof input.observationSummary?.averageObservedRoiRatio === 'number') {
    if (input.observationSummary.averageObservedRoiRatio >= 1.2) {
      scoreAdjustment += 4
    } else if (input.observationSummary.averageObservedRoiRatio <= 0) {
      scoreAdjustment -= 3
    }
  }

  switch (actionComparison.recommendedAction) {
    case 'intervene_now':
      scoreAdjustment += actionComparison.dominanceMargin >= 20 ? 6 : 3
      break
    case 'next_cycle':
      scoreAdjustment += status === 'favorable' ? 1 : -1
      break
    case 'monitor':
      scoreAdjustment -= actionComparison.dominanceMargin >= 20 ? 8 : 5
      break
    default:
      break
  }

  const explicitInputs = [
    input.interventionCost,
    input.costOfDelay,
    input.valueProtected,
    input.averageEfficiency,
    input.waterUseEfficiency,
    input.efficacyScore,
    input.qualityScoreGap,
    input.benchmarkGap,
  ].filter((value) => typeof value === 'number' && Number.isFinite(value)).length

  const confidenceAdjustment = clamp(
    0.02 +
      explicitInputs * 0.01 +
      (input.observationSummary?.confidenceAdjustment || 0) +
      Math.min(0.03, Math.max(0, actionComparison.dominanceMargin) / 400) +
      (input.environmentalSummary
        ? 0.01 +
          Math.min(0.02, (input.environmentalSummary.sensorLocalDays || 0) * 0.005)
        : 0),
    0.02,
    0.16
  )

  const rationale: string[] = []
  const interventionLabel = toCurrency(interventionCost)
  const delayLabel = toCurrency(costOfDelay)
  const valueLabel = toCurrency(valueProtected)

  if (interventionLabel) {
    rationale.push(`Costo stimato intervento ${interventionLabel}.`)
  }
  if (delayLabel) {
    rationale.push(`Costo atteso del ritardo ${delayLabel}.`)
  }
  if (valueLabel) {
    rationale.push(`Valore protetto stimato ${valueLabel}.`)
  }
  if (roiRatio !== null) {
    rationale.push(
      roiRatio >= 1
        ? `ROI atteso favorevole (${roiRatio.toFixed(1)}x).`
        : roiRatio > 0
          ? `ROI atteso positivo ma prudente (${roiRatio.toFixed(1)}x).`
          : `ROI atteso debole o negativo (${roiRatio.toFixed(1)}x).`
    )
  }
  if (input.observationSummary?.rationale?.length) {
    rationale.push(...input.observationSummary.rationale.slice(0, 2))
  }
  if (input.environmentalSummary) {
    if (hasPersistentEnvironmentalDeficit(input.environmentalSummary)) {
      rationale.push('Storico ambientale: deficit idrico persistente aumenta il costo del ritardo.')
    }
    if (hasPersistentEnvironmentalHumidity(input.environmentalSummary)) {
      rationale.push('Storico ambientale: umidita persistente aumenta il valore da proteggere nella finestra utile.')
    }
  }
  if (cropEconomicModel.rationale.length > 0) {
    rationale.push(...cropEconomicModel.rationale.slice(0, 2))
  }
  rationale.push(actionComparison.explanation)

  return {
    status,
    estimatedInterventionCost: interventionCost,
    estimatedCostOfDelay: costOfDelay,
    estimatedValueProtected: valueProtected,
    estimatedNetImpact,
    roiRatio,
    actionComparison,
    scoreAdjustment,
    confidenceAdjustment,
    rationale,
  }
}

export const formatAgronomicActionComparison = (
  summary?: AgronomicActionComparisonSummary | null
): string | null => {
  if (!summary) {
    return null
  }

  const winningScenario = summary.scenarios.find(
    (scenario) => scenario.action === summary.recommendedAction
  )
  if (!winningScenario) {
    return summary.explanation
  }

  const impactLabel = toCurrency(winningScenario.estimatedNetImpact)
  return [
    summary.explanation,
    impactLabel ? `Impatto netto atteso ${impactLabel}.` : null,
  ]
    .filter(Boolean)
    .join(' ')
}

export const formatAgronomicEconomicSummary = (
  summary?: AgronomicEconomicPrioritySummary | null
): string | null => {
  if (!summary) {
    return null
  }

  const parts: string[] = []
  if (typeof summary.estimatedInterventionCost === 'number') {
    parts.push(`costo ${toCurrency(summary.estimatedInterventionCost)}`)
  }
  if (typeof summary.estimatedCostOfDelay === 'number') {
    parts.push(`ritardo ${toCurrency(summary.estimatedCostOfDelay)}`)
  }
  if (typeof summary.estimatedNetImpact === 'number') {
    parts.push(`impatto netto ${toCurrency(summary.estimatedNetImpact)}`)
  }
  if (typeof summary.roiRatio === 'number') {
    parts.push(`ROI ${summary.roiRatio.toFixed(1)}x`)
  }

  return parts.join(' · ') || null
}
