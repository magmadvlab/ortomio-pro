import {
  getAgronomicCropProfileById,
  resolveAgronomicCropProfileSync,
} from '@/services/agronomicKernelService'
import type { AgronomicEconomicPrioritySummary } from '@/services/agronomicEconomicPriorityService'
import type { AgronomicMeasuredFeedbackSummary } from '@/services/agronomicMeasuredFeedbackService'
import type { ZoneEnvironmentalHistorySummary } from '@/services/environmentalMonitoringService'
import type {
  AgronomicCropProfile,
  AgronomicRefinedContext,
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
  refinedContext?: AgronomicRefinedContext | null
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

const normalizeText = (value?: string | null) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

const isSandySoil = (soilType?: string | null) => {
  const normalized = normalizeText(soilType)
  return Boolean(
    normalized && ['sand', 'sandy', 'sabbioso', 'sabbia'].some((token) => normalized.includes(token))
  )
}

const isClaySoil = (soilType?: string | null) => {
  const normalized = normalizeText(soilType)
  return Boolean(
    normalized &&
      ['clay', 'heavy clay', 'argilla', 'argilloso'].some((token) => normalized.includes(token))
  )
}

const resolveRefinedContextScoreAdjustment = (
  focus: AgronomicPriorityFocus,
  refinedContext?: AgronomicRefinedContext | null
): number => {
  const site = refinedContext?.siteOperationalProfile

  const soilPh = site?.soilPh
  const dailySunHours = site?.dailySunHours
  const shadowObstaclesCount = site?.shadowObstaclesCount || 0
  const windProtection = normalizeText(site?.windProtection)
  const exposedToWind = Boolean(
    windProtection && ['low', 'bassa', 'scarsa', 'none', 'no'].includes(windProtection)
  )

  let adjustment = 0

  if (site) {
    if (focus === 'water') {
      if (isSandySoil(site.soilType)) adjustment += 4
      if (isClaySoil(site.soilType)) adjustment += 1
      if (site.exposureClass === 'exposed') adjustment += 3
      if (exposedToWind) adjustment += 2
      if (typeof dailySunHours === 'number') {
        if (dailySunHours >= 8) adjustment += 4
        else if (dailySunHours >= 6) adjustment += 2
        else if (dailySunHours <= 3.5) adjustment -= 3
      }
      if (shadowObstaclesCount >= 2) adjustment -= 2
    }

    if (focus === 'health') {
      if (site.exposureClass === 'sheltered') adjustment += 2
      if (typeof dailySunHours === 'number' && dailySunHours <= 4) adjustment += 3
      if (shadowObstaclesCount >= 2) adjustment += 3
      if (isClaySoil(site.soilType)) adjustment += 1
      if (site.exposureClass === 'exposed' && typeof dailySunHours === 'number' && dailySunHours >= 7) {
        adjustment -= 2
      }
    }

    if (focus === 'nutrition') {
      if (typeof soilPh === 'number') {
        if (soilPh < 5.8 || soilPh > 7.8) adjustment += 6
        else if (soilPh < 6.2 || soilPh > 7.3) adjustment += 3
      }
      if (isSandySoil(site.soilType)) adjustment += 2
      if (isClaySoil(site.soilType)) adjustment += 1
    }

    if (focus === 'quality') {
      if ((site.altitudeMeters || 0) >= 700) adjustment += 3
      if (site.slopeClass === 'steep') adjustment += 1
      if (typeof dailySunHours === 'number' && dailySunHours <= 4) adjustment += 3
      if (typeof soilPh === 'number' && (soilPh < 5.8 || soilPh > 7.8)) adjustment += 2
    }

    // Photoperiod: high evapotranspiration in long days, disease pressure in short days
    if (typeof site.photoperiodHours === 'number') {
      if (focus === 'water' && site.photoperiodHours > 14) adjustment += 1
      if (focus === 'health' && site.photoperiodHours < 10) adjustment += 1
    }
  }

  // Site-only adjustment: clamped with the original ceiling of 8
  const siteAdjustment = clamp(Math.round(adjustment), -4, 8)

  const subSystem = refinedContext?.subSystemContext
  const rootstock = normalizeText(subSystem?.rootstock)
  const trainingSystem = normalizeText(subSystem?.trainingSystem)

  const isDroughtTolerantRootstock = Boolean(
    rootstock &&
      ['110r', '140ru', '1103p', '775p', '99r', '41b'].some((rs) => rootstock.includes(rs))
  )
  const isVigorousRootstock = Boolean(
    rootstock &&
      ['so4', 'so 4', '101-14', '420a', 'kober 5bb', '5bb'].some((rs) => rootstock.includes(rs))
  )
  const isQualityTrainingSystem = Boolean(
    trainingSystem &&
      ['guyot', 'alberello', 'cordone speronato', 'sylvoz'].some((ts) => trainingSystem.includes(ts))
  )
  const isHighYieldTrainingSystem = Boolean(
    trainingSystem &&
      ['pergola', 'tendone', 'gdc', 'cassone'].some((ts) => trainingSystem.includes(ts))
  )

  let subSystemAdjustment = 0

  if (focus === 'water') {
    if (isDroughtTolerantRootstock) subSystemAdjustment += 3
    if (isVigorousRootstock) subSystemAdjustment += 1
  }

  if (focus === 'nutrition') {
    if (isVigorousRootstock) subSystemAdjustment += 2
  }

  if (focus === 'quality') {
    if (isQualityTrainingSystem) subSystemAdjustment += 2
    if (isHighYieldTrainingSystem) subSystemAdjustment -= 1
  }

  // Combined: ceiling raised only when subSystem pushes past 8
  return clamp(siteAdjustment + subSystemAdjustment, -4, 12)
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

  const refinedContextScoreAdjustment = resolveRefinedContextScoreAdjustment(
    input.focus,
    input.refinedContext
  )
  score += refinedContextScoreAdjustment

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
        (refinedContextScoreAdjustment !== 0
          ? Math.min(0.04, Math.abs(refinedContextScoreAdjustment) * 0.006)
          : 0) +
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
