import type { AgronomicMeasuredFeedbackRecord } from '@/services/agronomicMeasuredFeedbackService'

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
  confidenceAdjustment: number
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

const getNumericMetric = (record: AgronomicMeasuredFeedbackRecord, keys: string[]): number | null => {
  for (const key of keys) {
    const value = record.metrics[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return null
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

  const averageObservedInterventionCost = average(
    recentRecords.map((record) => getNumericMetric(record, ['cost', 'totalCost', 'estimatedCost']))
  )
  const averageObservedValueProtected = average(
    recentRecords.map((record) => getNumericMetric(record, ['estimatedValue', 'valueProtected', 'revenue']))
  )
  const averageObservedNetImpact = average(
    recentRecords.map((record) => {
      const explicitNet = getNumericMetric(record, ['netImpact'])
      if (typeof explicitNet === 'number') {
        return explicitNet
      }

      const cost = getNumericMetric(record, ['cost', 'totalCost', 'estimatedCost'])
      const value = getNumericMetric(record, ['estimatedValue', 'valueProtected', 'revenue'])
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

      const cost = getNumericMetric(record, ['cost', 'totalCost', 'estimatedCost'])
      const value = getNumericMetric(record, ['estimatedValue', 'valueProtected', 'revenue'])
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

  return {
    sampleCount: recentRecords.length,
    matchedBy,
    averageObservedInterventionCost,
    averageObservedValueProtected,
    averageObservedNetImpact,
    averageObservedRoiRatio,
    confidenceAdjustment: clamp(0.02 + recentRecords.length * 0.01, 0.02, 0.12),
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
  if (typeof input.observationSummary?.averageObservedInterventionCost === 'number') {
    return roundMetric(Math.max(0, input.observationSummary.averageObservedInterventionCost), 0)
  }

  if (typeof input.interventionCost === 'number' && Number.isFinite(input.interventionCost)) {
    return roundMetric(Math.max(0, input.interventionCost), 0)
  }

  switch (input.source) {
    case 'director':
      return roundMetric(32 + input.priorityScore * 0.18, 0)
    case 'irrigation': {
      const efficiencyGap = Math.max(0, 100 - (input.averageEfficiency ?? 78))
      const uniformityGap = Math.max(0, 100 - (input.uniformityCoefficient ?? 82))
      const waterUseGap = Math.max(0, 100 - (input.waterUseEfficiency ?? 76))
      return roundMetric(18 + efficiencyGap * 0.32 + uniformityGap * 0.14 + waterUseGap * 0.18, 0)
    }
    case 'prescription': {
      const efficacyGap = Math.max(0, 100 - (input.efficacyScore ?? 72))
      const benchmarkGap = Math.max(0, input.benchmarkGap ?? input.qualityScoreGap ?? 0)
      return roundMetric(26 + efficacyGap * 0.38 + benchmarkGap * 0.45, 0)
    }
    case 'health':
      return roundMetric(24 + input.priorityScore * 0.14 + severityWeight(input.severity), 0)
    case 'phenology':
      return roundMetric(10 + (input.qualityScoreGap ?? 0) * 0.35 + input.priorityScore * 0.05, 0)
    default:
      return roundMetric(20 + input.priorityScore * 0.12, 0)
  }
}

const deriveCostOfDelay = (input: AgronomicEconomicPriorityInput): number => {
  if (typeof input.costOfDelay === 'number' && Number.isFinite(input.costOfDelay)) {
    return roundMetric(Math.max(0, input.costOfDelay), 0)
  }

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

  return roundMetric(costOfDelay, 0)
}

const deriveValueProtected = (
  input: AgronomicEconomicPriorityInput,
  interventionCost: number,
  costOfDelay: number
): number => {
  if (typeof input.observationSummary?.averageObservedValueProtected === 'number') {
    return roundMetric(Math.max(0, input.observationSummary.averageObservedValueProtected), 0)
  }

  if (typeof input.valueProtected === 'number' && Number.isFinite(input.valueProtected)) {
    return roundMetric(Math.max(0, input.valueProtected), 0)
  }

  const multiplierByFocus: Record<AgronomicEconomicFocus, number> = {
    water: 1.18,
    nutrition: 1.28,
    health: 1.45,
    quality: 1.4,
  }

  return roundMetric(
    Math.max(interventionCost * 1.2, costOfDelay * multiplierByFocus[input.focus]),
    0
  )
}

export function buildAgronomicEconomicPrioritySummary(
  input: AgronomicEconomicPriorityInput
): AgronomicEconomicPrioritySummary {
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
      (input.observationSummary?.confidenceAdjustment || 0),
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
