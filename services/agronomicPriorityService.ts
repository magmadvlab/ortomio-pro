import {
  getAgronomicCropProfileById,
  resolveAgronomicCropProfileSync,
} from '@/services/agronomicKernelService'
import type { AgronomicEconomicPrioritySummary } from '@/services/agronomicEconomicPriorityService'
import type { AgronomicMeasuredFeedbackSummary } from '@/services/agronomicMeasuredFeedbackService'
import type { ZoneEnvironmentalHistorySummary } from '@/services/environmentalMonitoringService'
import type {
  AgronomicCropProfile,
  AgronomicSignalKey,
  AgronomicSignalRequirement,
  ResolvedAgronomicCropProfile,
} from '@/types/agronomicKernel'

export type AgronomicPriorityFocus = 'water' | 'nutrition' | 'health' | 'quality'

export interface AgronomicSignalCoverage {
  requiredP0Signals: AgronomicSignalKey[]
  coveredP0Signals: AgronomicSignalKey[]
  missingP0Signals: AgronomicSignalKey[]
  coverageRatio: number
}

export interface AgronomicPriorityResolutionInput {
  hints?: Array<string | null | undefined>
  fallbackProfileId?: string | null
}

export interface AgronomicPriorityScoreInput {
  baseScore: number
  confidence?: number
  resolvedProfile?: ResolvedAgronomicCropProfile | null
  focus: AgronomicPriorityFocus
  availableSignals?: Iterable<AgronomicSignalKey>
  isCriticalStage?: boolean
  measuredFeedbackSummary?: AgronomicMeasuredFeedbackSummary | null
  economicSummary?: AgronomicEconomicPrioritySummary | null
  environmentalSummary?: ZoneEnvironmentalHistorySummary | null
}

export interface AgronomicPriorityScoreResult {
  score: number
  confidence: number
  signalCoverage: AgronomicSignalCoverage
  measuredFeedbackSummary?: AgronomicMeasuredFeedbackSummary | null
  economicSummary?: AgronomicEconomicPrioritySummary | null
  environmentalSummary?: ZoneEnvironmentalHistorySummary | null
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const alignScoreToEconomicRecommendation = (
  score: number,
  economicSummary?: AgronomicEconomicPrioritySummary | null
): number => {
  const comparison = economicSummary?.actionComparison
  if (!comparison) {
    return score
  }

  switch (comparison.recommendedUrgencyLabel) {
    case 'immediate':
      return clamp(Math.max(score, comparison.dominanceMargin >= 20 ? 78 : 75), 0, 100)
    case 'next_cycle':
      return clamp(score, 45, comparison.dominanceMargin >= 20 ? 72 : 74)
    case 'monitor':
    default:
      return clamp(
        Math.min(score, comparison.dominanceMargin >= 20 ? 38 : 44),
        0,
        44
      )
  }
}

const normalizeHint = (value?: string | null) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

const getFocusSignals = (
  profile: AgronomicCropProfile,
  focus: AgronomicPriorityFocus
): AgronomicSignalRequirement[] => {
  switch (focus) {
    case 'water':
      return profile.water.recommendedSignals
    case 'nutrition':
      return profile.nutrition.recommendedSignals
    case 'health':
      return profile.health.recommendedSignals
    case 'quality':
      return profile.quality.recommendedSignals
    default:
      return []
  }
}

export async function resolveAgronomicPriorityProfile(
  input: AgronomicPriorityResolutionInput
): Promise<ResolvedAgronomicCropProfile | null> {
  return resolveAgronomicPriorityProfileSync(input)
}

export function resolveAgronomicPriorityProfileSync(
  input: AgronomicPriorityResolutionInput
): ResolvedAgronomicCropProfile | null {
  const normalizedHints = (input.hints || [])
    .map((hint) => normalizeHint(hint))
    .filter((hint): hint is string => Boolean(hint))

  for (const hint of normalizedHints) {
    const directProfile = getAgronomicCropProfileById(hint)
    if (directProfile) {
      return {
        profile: directProfile,
        source: 'fallback',
        matchedBy: hint,
        warnings: ['Priority profile resolved from explicit profile id hint.'],
      }
    }

    const resolvedProfile = resolveAgronomicCropProfileSync({ plantId: hint })
    if (resolvedProfile.profile && resolvedProfile.source !== 'fallback') {
      return resolvedProfile
    }
  }

  if (input.fallbackProfileId) {
    const fallbackProfile = getAgronomicCropProfileById(input.fallbackProfileId)
    if (fallbackProfile) {
      return {
        profile: fallbackProfile,
        source: 'fallback',
        matchedBy: input.fallbackProfileId,
        warnings: ['Priority profile resolved from fallback profile id.'],
      }
    }
  }

  return null
}

export function buildAgronomicSignalCoverage(
  resolvedProfile: ResolvedAgronomicCropProfile | null | undefined,
  focus: AgronomicPriorityFocus,
  availableSignals: Iterable<AgronomicSignalKey> = []
): AgronomicSignalCoverage {
  const availableSignalSet = new Set(availableSignals)
  const requiredP0Signals = resolvedProfile
    ? getFocusSignals(resolvedProfile.profile, focus)
        .filter((signal) => signal.priority === 'P0')
        .map((signal) => signal.key)
    : []

  if (requiredP0Signals.length === 0) {
    return {
      requiredP0Signals: [],
      coveredP0Signals: [],
      missingP0Signals: [],
      coverageRatio: 1,
    }
  }

  const coveredP0Signals = requiredP0Signals.filter((signal) => availableSignalSet.has(signal))
  const missingP0Signals = requiredP0Signals.filter((signal) => !availableSignalSet.has(signal))

  return {
    requiredP0Signals,
    coveredP0Signals,
    missingP0Signals,
    coverageRatio: coveredP0Signals.length / requiredP0Signals.length,
  }
}

export function scoreAgronomicPriority(
  input: AgronomicPriorityScoreInput
): AgronomicPriorityScoreResult {
  const normalizedConfidence = Math.max(0, Math.min(1, input.confidence ?? 0.5))
  const focusModifier = input.resolvedProfile?.profile.decisionModifiers?.[input.focus]
  const signalCoverage = buildAgronomicSignalCoverage(
    input.resolvedProfile,
    input.focus,
    input.availableSignals
  )

  let score = input.baseScore
  score += Math.round((normalizedConfidence - 0.5) * 18)
  score += Math.round(
    (signalCoverage.coverageRatio - 0.5) * 14 * (focusModifier?.signalCoverageWeight ?? 1)
  )

  if (focusModifier?.baseScoreDelta) {
    score += focusModifier.baseScoreDelta
  }

  if (input.isCriticalStage) {
    score += Math.round(6 * (focusModifier?.criticalStageWeight ?? 1))
  }

  if (input.measuredFeedbackSummary) {
    score += input.measuredFeedbackSummary.scoreAdjustment
  }

  if (input.economicSummary) {
    score += input.economicSummary.scoreAdjustment
  }

  if (input.environmentalSummary) {
    const environmentalScoreAdjustment =
      input.focus === 'water'
        ? input.environmentalSummary.highSoilWaterStressDays >= 4 ||
          input.environmentalSummary.latestSoilWaterStressLevel === 'high'
          ? 9
          : input.environmentalSummary.mediumSoilWaterStressDays >= 3
            ? 5
            : 0
        : input.focus === 'nutrition'
          ? input.environmentalSummary.highSoilWaterStressDays >= 3 ||
            input.environmentalSummary.highDiseasePressureDays >= 3
            ? 6
            : input.environmentalSummary.mediumSoilWaterStressDays >= 2
              ? 3
              : 0
          : input.environmentalSummary.highDiseasePressureDays >= 4
            ? 4
            : 0

    score += Math.round(
      environmentalScoreAdjustment * (focusModifier?.environmentalPressureWeight ?? 1)
    )
  }

  switch (input.resolvedProfile?.source) {
    case 'plant_id':
      score += 4
      break
    case 'custom_crop':
      score += 3
      break
    case 'taxonomy':
    case 'functional_category':
      score += 2
      break
    case 'fallback':
      score -= 3
      break
    default:
      break
  }

  const sourceConfidenceAdjustment = input.resolvedProfile
    ? input.resolvedProfile.source === 'fallback'
      ? -0.08
      : input.resolvedProfile.source === 'plant_id'
        ? 0.05
        : 0.02
    : -0.05

  const derivedConfidence = Math.max(
    0.3,
    Math.min(
      0.98,
      normalizedConfidence * 0.72 +
        signalCoverage.coverageRatio * 0.2 +
        0.08 +
        sourceConfidenceAdjustment +
        (focusModifier?.confidenceDelta || 0) +
        (input.measuredFeedbackSummary?.confidenceAdjustment || 0) +
        (input.economicSummary?.confidenceAdjustment || 0) +
        (
          input.environmentalSummary
            ? Math.max(
                -0.02,
                Math.min(
                  0.08,
                  input.environmentalSummary.entries >= 4 ? 0.03 : 0.01 +
                  input.environmentalSummary.sensorLocalDays * 0.01
                )
              )
            : 0
        )
    )
  )

  const alignedScore = alignScoreToEconomicRecommendation(Math.round(score), input.economicSummary)

  return {
    score: clamp(alignedScore, 0, 100),
    confidence: clamp(derivedConfidence, 0.3, 0.98),
    signalCoverage,
    measuredFeedbackSummary: input.measuredFeedbackSummary || null,
    economicSummary: input.economicSummary || null,
    environmentalSummary: input.environmentalSummary || null,
  }
}
