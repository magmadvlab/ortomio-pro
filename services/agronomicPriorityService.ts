import {
  getAgronomicCropProfileById,
  resolveAgronomicCropProfileSync,
} from '@/services/agronomicKernelService'
import type { AgronomicMeasuredFeedbackSummary } from '@/services/agronomicMeasuredFeedbackService'
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
}

export interface AgronomicPriorityScoreResult {
  score: number
  confidence: number
  signalCoverage: AgronomicSignalCoverage
  measuredFeedbackSummary?: AgronomicMeasuredFeedbackSummary | null
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
  const signalCoverage = buildAgronomicSignalCoverage(
    input.resolvedProfile,
    input.focus,
    input.availableSignals
  )

  let score = input.baseScore
  score += Math.round((normalizedConfidence - 0.5) * 18)
  score += Math.round((signalCoverage.coverageRatio - 0.5) * 14)

  if (input.isCriticalStage) {
    score += 6
  }

  if (input.measuredFeedbackSummary) {
    score += input.measuredFeedbackSummary.scoreAdjustment
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
        (input.measuredFeedbackSummary?.confidenceAdjustment || 0)
    )
  )

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    confidence: derivedConfidence,
    signalCoverage,
    measuredFeedbackSummary: input.measuredFeedbackSummary || null,
  }
}
