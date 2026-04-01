import type { AgronomicMeasuredFeedbackRecord } from '@/services/agronomicMeasuredFeedbackService'
import type { ZoneEnvironmentalHistorySummary } from '@/services/environmentalMonitoringService'
import {
  getAgronomicCropProfileById,
  resolveAgronomicCropProfileSync,
} from '@/services/agronomicKernelService'
import type { AgronomicCropProfile } from '@/types/agronomicKernel'

export type AgronomicEconomicFocus = 'water' | 'nutrition' | 'health' | 'quality'

export type AgronomicEconomicSource =
  | 'health'
  | 'irrigation'
  | 'prescription'
  | 'director'
  | 'phenology'

export interface AgronomicEconomicPriorityInput {
  source: AgronomicEconomicSource
  focus: AgronomicEconomicFocus
  priorityScore: number
  priorityConfidence?: number
  urgencyLabel?: 'immediate' | 'next_cycle' | 'monitor'
  agronomicProfileId?: string | null
  cropNameHint?: string | null
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
  scoreAdjustment: number
  confidenceAdjustment: number
  rationale: string[]
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
  interventionCostMultiplier: number
  delayCostMultiplier: number
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
    'agronomicProfileId' | 'cropNameHint' | 'focus' | 'isCriticalStage'
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
      interventionCostMultiplier: 1,
      delayCostMultiplier: 1,
      protectedValueMultiplier: 1,
      rationale: [],
    }
  }

  let interventionCostMultiplier = 1
  let delayCostMultiplier = 1
  let protectedValueMultiplier = 1
  const rationale: string[] = []
  const tags = new Set(profile.tags)

  if (profile.lifecycle === 'perennial') {
    interventionCostMultiplier *= 1.08
    delayCostMultiplier *= 1.12
    protectedValueMultiplier *= 1.16
    rationale.push('Profilo poliennale: carry-over economico piu alto tra campagne.')
  }

  if (tags.has('broadacre') || tags.has('field_scale') || tags.has('extensive')) {
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
    profile.systems.includes('protected_culture') ||
    profile.systems.includes('indoor') ||
    profile.systems.includes('hydroponic') ||
    profile.systems.includes('aquaponic') ||
    profile.systems.includes('aeroponic')
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

  return {
    profile,
    interventionCostMultiplier: roundMetric(interventionCostMultiplier, 3),
    delayCostMultiplier: roundMetric(delayCostMultiplier, 3),
    protectedValueMultiplier: roundMetric(protectedValueMultiplier, 3),
    rationale,
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
  const interventionCost = deriveInterventionCost(input)
  const costOfDelay = deriveCostOfDelay(input)
  const valueProtected = deriveValueProtected(input, interventionCost, costOfDelay)
  const estimatedNetImpact = roundMetric(valueProtected - interventionCost, 0)
  const roiRatio =
    interventionCost > 0 ? roundMetric(estimatedNetImpact / interventionCost, 2) : null

  let status: AgronomicEconomicPrioritySummary['status'] = 'unknown'
  if (roiRatio !== null) {
    if (roiRatio >= 1 || costOfDelay >= interventionCost * 1.5) {
      status = 'favorable'
    } else if (roiRatio > 0 || costOfDelay >= interventionCost) {
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

  return {
    status,
    estimatedInterventionCost: interventionCost,
    estimatedCostOfDelay: costOfDelay,
    estimatedValueProtected: valueProtected,
    estimatedNetImpact,
    roiRatio,
    scoreAdjustment,
    confidenceAdjustment,
    rationale,
  }
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
