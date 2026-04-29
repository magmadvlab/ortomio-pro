import type { AgronomicEconomicPrioritySummary } from '@/services/agronomicEconomicPriorityService'
import type { AgronomicMeasuredFeedbackSummary } from '@/services/agronomicMeasuredFeedbackService'
import type { ZoneEnvironmentalHistorySummary } from '@/types/environmental'
import type {
  AgronomicDecisionFocus,
  AgronomicRefinedContext,
  AgronomicProfileResolutionSource,
  AgronomicSignalKey,
  ResolvedAgronomicCropProfile,
} from '@/types/agronomicKernel'
import type { AgronomicPriorityScoreResult } from '@/services/agronomicPriorityService'

export type AgronomicDecisionSource =
  | 'health'
  | 'irrigation'
  | 'prescription'
  | 'director'
  | 'phenology'

export type AgronomicDecisionUrgencyLabel = 'immediate' | 'next_cycle' | 'monitor'

export interface AgronomicDecisionProfileResolution {
  profileId: string
  profileLabel: string
  resolutionSource: AgronomicProfileResolutionSource
  matchedBy: string
  warnings: string[]
}

export interface AgronomicDecisionSignalSummary {
  availableSignals: AgronomicSignalKey[]
  requiredP0Signals: AgronomicSignalKey[]
  coveredP0Signals: AgronomicSignalKey[]
  missingP0Signals: AgronomicSignalKey[]
  coverageRatio: number
}

export interface AgronomicDecisionExplanation {
  source: AgronomicDecisionSource
  focus: AgronomicDecisionFocus
  score: number
  confidence: number
  urgencyLabel: AgronomicDecisionUrgencyLabel
  isCriticalStage: boolean
  profileResolution: AgronomicDecisionProfileResolution | null
  signals: AgronomicDecisionSignalSummary
  measuredFeedbackSummary: AgronomicMeasuredFeedbackSummary | null
  economicSummary: AgronomicEconomicPrioritySummary | null
  environmentalSummary: ZoneEnvironmentalHistorySummary | null
  agronomicRationale: string[]
  economicRationale: string[]
  warnings: string[]
  refinedContext?: AgronomicRefinedContext | null
  contextRationale?: string[]
}

export interface BuildAgronomicDecisionExplanationInput {
  source: AgronomicDecisionSource
  focus: AgronomicDecisionFocus
  priorityResult: AgronomicPriorityScoreResult
  urgencyLabel?: AgronomicDecisionUrgencyLabel
  resolvedProfile?: ResolvedAgronomicCropProfile | null
  availableSignals?: Iterable<AgronomicSignalKey>
  isCriticalStage?: boolean
  refinedContext?: AgronomicRefinedContext | null
}

const dedupeStrings = (values: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  )

const humanizeProductionIntent = (value?: string | null): string | null => {
  switch (value) {
    case 'wine':
      return 'vino'
    case 'table_grape':
      return 'uva da tavola'
    case 'oil':
      return 'olio'
    case 'table_olive':
      return 'oliva da mensa'
    case 'fresh_market':
      return 'mercato fresco'
    case 'processing':
      return 'trasformazione'
    default:
      return value ? value.replace(/_/g, ' ') : null
  }
}

export const resolveAgronomicDecisionUrgencyLabel = (
  score: number
): AgronomicDecisionUrgencyLabel => {
  if (score >= 75) return 'immediate'
  if (score >= 45) return 'next_cycle'
  return 'monitor'
}

export function buildAgronomicDecisionExplanation(
  input: BuildAgronomicDecisionExplanationInput
): AgronomicDecisionExplanation {
  const availableSignals = Array.from(new Set(input.availableSignals || []))
  const signalCoverage = input.priorityResult.signalCoverage
  const resolvedProfile = input.resolvedProfile
  const profileResolution = resolvedProfile
    ? {
        profileId: resolvedProfile.profile.id,
        profileLabel: resolvedProfile.profile.label,
        resolutionSource: resolvedProfile.source,
        matchedBy: resolvedProfile.matchedBy,
        warnings: resolvedProfile.warnings || [],
      }
    : null

  const warnings = dedupeStrings([
    ...(resolvedProfile?.warnings || []),
    !resolvedProfile ? 'Profilo colturale non risolto nel flusso corrente.' : null,
    resolvedProfile?.source === 'fallback'
      ? 'Profilo colturale risolto tramite fallback.'
      : null,
    signalCoverage.missingP0Signals.length > 0
      ? `Segnali P0 mancanti: ${signalCoverage.missingP0Signals.join(', ')}.`
      : null,
  ])

  const agronomicRationale = dedupeStrings([
    input.isCriticalStage ? 'Finestra decisionale marcata come critica.' : null,
    resolvedProfile
      ? `Profilo risolto: ${resolvedProfile.profile.label} (${resolvedProfile.source}).`
      : null,
    ...(input.priorityResult.measuredFeedbackSummary?.rationale || []),
  ])
  const refinedContext = input.refinedContext || null
  const contextRationale = dedupeStrings([
    refinedContext?.cultivarContext?.cultivarLabel
      ? `Cultivar considerata: ${refinedContext.cultivarContext.cultivarLabel}.`
      : null,
    refinedContext?.cultivarContext?.productionIntent
      ? `Intento produttivo: ${humanizeProductionIntent(refinedContext.cultivarContext.productionIntent)}.`
      : null,
    refinedContext?.subSystemContext?.systemType
      ? `Sottosistema: ${refinedContext.subSystemContext.systemType}.`
      : null,
    refinedContext?.subSystemContext?.irrigationMode
      ? `Gestione irrigua: ${refinedContext.subSystemContext.irrigationMode}.`
      : null,
    refinedContext?.siteOperationalProfile?.exposureClass
      ? `Esposizione sito: ${refinedContext.siteOperationalProfile.exposureClass}.`
      : null,
    refinedContext?.siteOperationalProfile?.slopeClass
      ? `Pendenza sito: ${refinedContext.siteOperationalProfile.slopeClass}.`
      : null,
    refinedContext?.siteOperationalProfile?.soilType
      ? `Suolo: ${refinedContext.siteOperationalProfile.soilType}.`
      : null,
  ])

  return {
    source: input.source,
    focus: input.focus,
    score: input.priorityResult.score,
    confidence: input.priorityResult.confidence,
    urgencyLabel:
      input.urgencyLabel || resolveAgronomicDecisionUrgencyLabel(input.priorityResult.score),
    isCriticalStage: Boolean(input.isCriticalStage),
    profileResolution,
    signals: {
      availableSignals,
      requiredP0Signals: signalCoverage.requiredP0Signals,
      coveredP0Signals: signalCoverage.coveredP0Signals,
      missingP0Signals: signalCoverage.missingP0Signals,
      coverageRatio: signalCoverage.coverageRatio,
    },
    measuredFeedbackSummary: input.priorityResult.measuredFeedbackSummary || null,
    economicSummary: input.priorityResult.economicSummary || null,
    environmentalSummary: input.priorityResult.environmentalSummary || null,
    agronomicRationale,
    economicRationale: dedupeStrings(input.priorityResult.economicSummary?.rationale || []),
    warnings,
    refinedContext,
    contextRationale,
  }
}
