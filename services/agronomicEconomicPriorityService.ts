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

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const roundMetric = (value: number, digits: number = 2) =>
  Number(value.toFixed(digits))

const toCurrency = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? `€${roundMetric(value, 0)}` : null

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

  const confidenceAdjustment = clamp(0.02 + explicitInputs * 0.01, 0.02, 0.1)

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
