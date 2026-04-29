import { scoreAgronomicPriority, type AgronomicPriorityFocus } from '@/services/agronomicPriorityService'
import {
  buildAgronomicDecisionExplanation,
  resolveAgronomicDecisionUrgencyLabel,
} from '@/services/agronomicDecisionExplanationService'
import { resolveAgronomicPriorityProfileSync } from '@/services/agronomicPriorityService'
import {
  buildAgronomicEconomicPrioritySummary,
  formatAgronomicActionComparison,
  summarizeAgronomicEconomicObservations,
  type AgronomicActionComparisonSummary,
  type AgronomicEconomicPrioritySummary,
} from '@/services/agronomicEconomicPriorityService'
import {
  summarizeAgronomicMeasuredFeedback,
  type AgronomicMeasuredFeedbackRecord,
  type AgronomicMeasuredFeedbackSummary,
} from '@/services/agronomicMeasuredFeedbackService'
import type { ZoneEnvironmentalHistorySummary } from '@/services/environmentalMonitoringService'
import type { AgronomicRefinedContext, AgronomicSignalKey } from '@/types/agronomicKernel'
import type { HealthAlert } from '@/services/plantHealthMonitoringService'
import type { EfficiencyReport } from '@/types/irrigation'
import type {
  PrescriptionAgronomicIntelligenceSummary,
  PrescriptionAgronomicPriority,
} from '@/services/prescriptionAgronomicIntelligenceService'
import type { PrioritizedAction } from '@/services/directorService'

export interface AgronomicPhenologyQueueCandidate {
  id: string
  title: string
  stageKey: string
  stageLabel: string
  scopeLabel: string
  confidence: number
  profileId?: string
  source: 'observation' | 'agronomic_fallback'
  cropNameHint?: string
  availableSignals?: AgronomicSignalKey[]
  isDecisionCriticalStage?: boolean
  refinedContext?: AgronomicRefinedContext | null
}

export interface AgronomicActionQueueItem {
  id: string
  source: 'health' | 'irrigation' | 'prescription' | 'director' | 'phenology'
  title: string
  description: string
  scopeLabel?: string
  focus: AgronomicPriorityFocus
  priorityScore: number
  priorityConfidence: number
  agronomicProfileId?: string
  missingSignals: AgronomicSignalKey[]
  urgencyLabel: 'immediate' | 'next_cycle' | 'monitor'
  metadata?: Record<string, unknown>
}

export interface BuildAgronomicActionQueueInput {
  healthAlerts?: HealthAlert[]
  irrigationReports?: EfficiencyReport[]
  prescriptionSummary?: PrescriptionAgronomicIntelligenceSummary | null
  directorActions?: PrioritizedAction[]
  phenologyCandidates?: AgronomicPhenologyQueueCandidate[]
  measuredFeedbackRecords?: AgronomicMeasuredFeedbackRecord[]
  environmentalSummariesByZone?: Record<string, ZoneEnvironmentalHistorySummary | null | undefined>
}

const healthSeverityScore: Record<HealthAlert['severity'], number> = {
  critical: 96,
  high: 78,
  medium: 54,
  low: 30,
}

const healthAlertTypeLabels: Record<HealthAlert['type'], string> = {
  disease_risk: 'Rischio malattie',
  pest_alert: 'Allerta parassiti',
  nutrient_deficiency: 'Carenza nutrizionale',
  stress_symptoms: 'Segni di stress',
  harvest_timing: 'Finestra di raccolta',
  weather_stress: 'Stress meteo',
}

const getUrgencyLabel = (score: number): AgronomicActionQueueItem['urgencyLabel'] => {
  if (score >= 75) return 'immediate'
  if (score >= 45) return 'next_cycle'
  return 'monitor'
}

const resolveUrgencyLabel = (
  score: number,
  economicSummary?: AgronomicEconomicPrioritySummary | null
): AgronomicActionQueueItem['urgencyLabel'] =>
  economicSummary?.actionComparison?.recommendedUrgencyLabel || getUrgencyLabel(score)

const appendActionComparisonDescription = (
  description: string,
  economicSummary?: AgronomicEconomicPrioritySummary | null
): string => {
  const comparisonSummary = formatAgronomicActionComparison(economicSummary?.actionComparison)
  return [description?.trim(), comparisonSummary].filter(Boolean).join(' ')
}

const getActionComparison = (
  economicSummary?: AgronomicEconomicPrioritySummary | null
): AgronomicActionComparisonSummary | null => economicSummary?.actionComparison || null

const resolveQueueRefinedContext = (
  refinedContext?: AgronomicRefinedContext | null,
  decisionExplanation?: { refinedContext?: AgronomicRefinedContext | null } | null
): AgronomicRefinedContext | null =>
  refinedContext || decisionExplanation?.refinedContext || null

const summarizeFeedbackForQueueItem = (
  records: AgronomicMeasuredFeedbackRecord[] | undefined,
  focus: AgronomicPriorityFocus,
  options?: {
    zoneId?: string
    plantName?: string
  }
): AgronomicMeasuredFeedbackSummary | null => {
  return summarizeAgronomicMeasuredFeedback(records || [], {
    focus,
    zoneId: options?.zoneId,
    plantName: options?.plantName,
  })
}

const getHealthSeverityScore = (severity: HealthAlert['severity']) => healthSeverityScore[severity]

const inferHealthAlertSignals = (alert: HealthAlert): AgronomicSignalKey[] => {
  switch (alert.type) {
    case 'disease_risk':
      return ['weather_current', 'weather_forecast', 'leaf_wetness', 'dew_point']
    case 'pest_alert':
      return ['weather_current', 'weather_forecast']
    case 'harvest_timing':
      return ['phenology_observation', 'quality_result', 'weather_forecast']
    case 'weather_stress':
      return ['weather_current', 'weather_forecast', 'vpd']
    case 'nutrient_deficiency':
      return ['quality_result', 'operation_ledger']
    case 'stress_symptoms':
    default:
      return ['weather_current']
  }
}

const buildHealthEconomicSummary = (
  alert: HealthAlert
): AgronomicEconomicPrioritySummary =>
  buildAgronomicEconomicPrioritySummary({
    source: 'health',
    focus: 'health',
    priorityScore: getHealthSeverityScore(alert.severity),
    priorityConfidence: alert.confidence,
    severity: alert.severity,
    cropNameHint: alert.plantName,
  })

const toHealthQueueItems = (
  alerts: HealthAlert[],
  measuredFeedbackRecords?: AgronomicMeasuredFeedbackRecord[]
): AgronomicActionQueueItem[] => {
  return alerts.map((alert) => {
    const resolvedAgronomicProfile = resolveAgronomicPriorityProfileSync({
      hints: [alert.plantName, ...alert.triggers],
    })
    const availableSignals = inferHealthAlertSignals(alert)
    const economicSummary = buildHealthEconomicSummary(alert)
    const measuredFeedbackSummary = summarizeFeedbackForQueueItem(
      measuredFeedbackRecords,
      'health',
      { plantName: alert.plantName }
    )
    const priorityResult = scoreAgronomicPriority({
      baseScore: healthSeverityScore[alert.severity],
      confidence: alert.confidence,
      resolvedProfile: resolvedAgronomicProfile,
      focus: 'health',
      availableSignals,
      isCriticalStage: false,
      measuredFeedbackSummary,
      economicSummary,
    })
    const decisionExplanation = buildAgronomicDecisionExplanation({
      source: 'health',
      focus: 'health',
      priorityResult,
      urgencyLabel:
        priorityResult.economicSummary?.actionComparison?.recommendedUrgencyLabel ||
        resolveAgronomicDecisionUrgencyLabel(priorityResult.score),
      resolvedProfile: resolvedAgronomicProfile,
      availableSignals,
      isCriticalStage: alert.severity === 'critical' || alert.type === 'harvest_timing',
    })

    return {
      id: `health:${alert.id}`,
      source: 'health',
      title: `${alert.plantName} - ${healthAlertTypeLabels[alert.type]}`,
      description: appendActionComparisonDescription(alert.description, economicSummary),
      scopeLabel: alert.plantName,
      focus: 'health',
      priorityScore: priorityResult.score,
      priorityConfidence: priorityResult.confidence,
      agronomicProfileId: resolvedAgronomicProfile?.profile.id,
      missingSignals: priorityResult.signalCoverage.missingP0Signals,
      urgencyLabel: resolveUrgencyLabel(priorityResult.score, economicSummary),
      metadata: {
        severity: alert.severity,
        type: alert.type,
        triggers: alert.triggers,
        decisionExplanation,
        measuredFeedbackRationale: priorityResult.measuredFeedbackSummary?.rationale,
        economicSummary: priorityResult.economicSummary,
        actionComparison: getActionComparison(priorityResult.economicSummary),
      },
    }
  })
}

const toIrrigationQueueItems = (
  reports: EfficiencyReport[],
  measuredFeedbackRecords?: AgronomicMeasuredFeedbackRecord[],
  environmentalSummariesByZone?: Record<string, ZoneEnvironmentalHistorySummary | null | undefined>
): AgronomicActionQueueItem[] => {
  return reports.map((report) => {
    const environmentalSummary = environmentalSummariesByZone?.[report.zoneId]
    const observationSummary = summarizeAgronomicEconomicObservations(measuredFeedbackRecords || [], {
      focus: 'water',
      zoneId: report.zoneId,
    })
    const measuredFeedbackSummary = summarizeFeedbackForQueueItem(
      measuredFeedbackRecords,
      'water',
      { zoneId: report.zoneId }
    )
    const economicSummary = buildAgronomicEconomicPrioritySummary({
      source: 'irrigation',
      focus: 'water',
      priorityScore: report.priorityScore ?? 40,
      priorityConfidence: report.priorityConfidence ?? 0.55,
      agronomicProfileId: report.agronomicProfileId,
      cropNameHint: report.zoneName,
      operationalContextTags: report.operationalContextTags,
      averageEfficiency: report.averageEfficiency,
      uniformityCoefficient: report.uniformityCoefficient,
      waterUseEfficiency: report.waterUseEfficiency,
      observationSummary,
      environmentalSummary,
    })
    const priorityResult = scoreAgronomicPriority({
      baseScore: report.priorityScore ?? 40,
      confidence: report.priorityConfidence ?? 0.55,
      focus: 'water',
      measuredFeedbackSummary,
      environmentalSummary,
      economicSummary,
    })
    const refinedContext = resolveQueueRefinedContext(
      report.refinedContext,
      report.decisionExplanation
    )

    return {
      id: `irrigation:${report.zoneId}:${report.period}`,
      source: 'irrigation',
      title: `Irrigazione ${report.zoneName}`,
      description: appendActionComparisonDescription(report.recommendations.join(' '), economicSummary),
      scopeLabel: report.zoneName,
      focus: 'water',
      priorityScore: priorityResult.score,
      priorityConfidence: priorityResult.confidence,
      agronomicProfileId: report.agronomicProfileId,
      missingSignals: report.missingSignals || [],
      urgencyLabel: resolveUrgencyLabel(priorityResult.score, economicSummary),
      metadata: {
        averageEfficiency: report.averageEfficiency,
        uniformityCoefficient: report.uniformityCoefficient,
        waterUseEfficiency: report.waterUseEfficiency,
        period: report.period,
        refinedContext,
        decisionExplanation: report.decisionExplanation,
        measuredFeedbackRationale: priorityResult.measuredFeedbackSummary?.rationale,
        economicSummary: priorityResult.economicSummary,
        environmentalSummary: priorityResult.environmentalSummary,
        actionComparison: getActionComparison(priorityResult.economicSummary),
      },
    }
  })
}

const toPrescriptionQueueItems = (
  summary: PrescriptionAgronomicIntelligenceSummary | null | undefined,
  measuredFeedbackRecords?: AgronomicMeasuredFeedbackRecord[],
  environmentalSummariesByZone?: Record<string, ZoneEnvironmentalHistorySummary | null | undefined>
): AgronomicActionQueueItem[] => {
  if (!summary) {
    return []
  }

  return summary.operationalPriorities.map((priority: PrescriptionAgronomicPriority) => {
    const environmentalSummary = priority.zoneId
      ? environmentalSummariesByZone?.[priority.zoneId]
      : undefined
    const observationSummary = summarizeAgronomicEconomicObservations(measuredFeedbackRecords || [], {
      focus: 'nutrition',
      zoneId: priority.zoneId,
      plantName: summary.benchmarkCropLabel,
    })
    const measuredFeedbackSummary = summarizeFeedbackForQueueItem(
      measuredFeedbackRecords,
      'nutrition',
      { zoneId: priority.zoneId, plantName: summary.benchmarkCropLabel }
    )
    const economicSummary = buildAgronomicEconomicPrioritySummary({
      source: 'prescription',
      focus: 'nutrition',
      priorityScore: priority.priorityScore,
      priorityConfidence: priority.priorityConfidence ?? 0.6,
      urgencyLabel: priority.urgency,
      agronomicProfileId: priority.agronomicProfileId,
      cropNameHint: summary.benchmarkCropLabel,
      operationalContextTags: priority.operationalContextTags,
      efficacyScore: priority.efficacyScore,
      observationSummary,
      environmentalSummary,
    })
    const priorityResult = scoreAgronomicPriority({
      baseScore: priority.priorityScore,
      confidence: priority.priorityConfidence ?? 0.6,
      focus: 'nutrition',
      measuredFeedbackSummary,
      environmentalSummary,
      economicSummary,
    })

    return {
      id: `prescription:${priority.id}`,
      source: 'prescription',
      title: `Prescription ${priority.scopeLabel}`,
      description: appendActionComparisonDescription(priority.rationale, economicSummary),
      scopeLabel: priority.scopeLabel,
      focus: 'nutrition',
      priorityScore: priorityResult.score,
      priorityConfidence: priorityResult.confidence,
      agronomicProfileId: priority.agronomicProfileId,
      missingSignals: priority.missingSignals || [],
      urgencyLabel: resolveUrgencyLabel(priorityResult.score, economicSummary),
      metadata: {
        drivers: priority.drivers,
        recommendedAction: priority.recommendedAction,
        efficacyScore: priority.efficacyScore,
        refinedContext: priority.refinedContext,
        decisionExplanation: priority.decisionExplanation,
        measuredFeedbackRationale: priorityResult.measuredFeedbackSummary?.rationale,
        economicSummary: priorityResult.economicSummary,
        environmentalSummary: priorityResult.environmentalSummary,
        actionComparison: getActionComparison(priorityResult.economicSummary),
      },
    }
  })
}

const toDirectorQueueItems = (
  actions: PrioritizedAction[],
  measuredFeedbackRecords?: AgronomicMeasuredFeedbackRecord[]
): AgronomicActionQueueItem[] => {
  return actions.map((action) => {
    const focus = action.agronomicFocus || 'health'
    const observationSummary = summarizeAgronomicEconomicObservations(measuredFeedbackRecords || [], {
      focus,
      plantName: action.title,
    })
    const measuredFeedbackSummary = summarizeFeedbackForQueueItem(
      measuredFeedbackRecords,
      focus,
      { plantName: action.title }
    )
    const economicSummary =
      action.economicSummary ||
      buildAgronomicEconomicPrioritySummary({
        source: 'director',
        focus,
        priorityScore: action.priorityScore,
        priorityConfidence: action.priorityConfidence ?? action.confidence ?? 0.55,
        agronomicProfileId: action.agronomicProfileId,
        operationalContextTags: action.operationalContextTags,
        cropNameHint: action.title,
        interventionCost: action.cost,
        observationSummary,
      })
    const priorityResult = scoreAgronomicPriority({
      baseScore: action.priorityScore,
      confidence: action.priorityConfidence ?? action.confidence ?? 0.55,
      focus,
      measuredFeedbackSummary,
      economicSummary,
    })

    return {
      id: `director:${action.id}`,
      source: 'director',
      title: action.title,
      description: appendActionComparisonDescription(action.description, economicSummary),
      focus,
      priorityScore: priorityResult.score,
      priorityConfidence: priorityResult.confidence,
      agronomicProfileId: action.agronomicProfileId,
      missingSignals: action.missingSignals || [],
      urgencyLabel: resolveUrgencyLabel(priorityResult.score, economicSummary),
      metadata: {
        source: action.source,
        type: action.type,
        reasoning: action.reasoning,
        refinedContext: action.refinedContext,
        decisionExplanation: action.decisionExplanation,
        measuredFeedbackRationale: priorityResult.measuredFeedbackSummary?.rationale,
        economicSummary: priorityResult.economicSummary,
        actionComparison: getActionComparison(priorityResult.economicSummary),
      },
    }
  })
}

const toPhenologyQueueItems = (
  candidates: AgronomicPhenologyQueueCandidate[],
  measuredFeedbackRecords?: AgronomicMeasuredFeedbackRecord[]
): AgronomicActionQueueItem[] => {
  return candidates.map((candidate) => {
    const resolvedAgronomicProfile = resolveAgronomicPriorityProfileSync({
      hints: [candidate.cropNameHint, candidate.scopeLabel],
      fallbackProfileId: candidate.profileId,
    })
    const observationSummary = summarizeAgronomicEconomicObservations(measuredFeedbackRecords || [], {
      focus: 'quality',
      plantName: candidate.cropNameHint || candidate.scopeLabel,
    })
    const measuredFeedbackSummary = summarizeFeedbackForQueueItem(
      measuredFeedbackRecords,
      'quality',
      { plantName: candidate.cropNameHint || candidate.scopeLabel }
    )
    const economicSummary = buildAgronomicEconomicPrioritySummary({
      source: 'phenology',
      focus: 'quality',
      priorityScore: candidate.isDecisionCriticalStage ? 72 : 46,
      priorityConfidence: candidate.confidence,
      urgencyLabel: candidate.isDecisionCriticalStage ? 'immediate' : 'next_cycle',
      agronomicProfileId: candidate.profileId,
      cropNameHint: candidate.cropNameHint || candidate.scopeLabel,
      isCriticalStage: candidate.isDecisionCriticalStage,
      interventionCost: candidate.source === 'observation' ? 8 : 12,
      qualityScoreGap: candidate.isDecisionCriticalStage ? 10 : 4,
      observationSummary,
    })
    const priorityResult = scoreAgronomicPriority({
      baseScore: candidate.isDecisionCriticalStage ? 72 : 46,
      confidence: candidate.confidence,
      resolvedProfile: resolvedAgronomicProfile,
      focus: 'quality',
      availableSignals: candidate.availableSignals || [],
      isCriticalStage: candidate.isDecisionCriticalStage,
      measuredFeedbackSummary,
      economicSummary,
    })
    const decisionExplanation = buildAgronomicDecisionExplanation({
      source: 'phenology',
      focus: 'quality',
      priorityResult,
      urgencyLabel:
        priorityResult.economicSummary?.actionComparison?.recommendedUrgencyLabel ||
        resolveAgronomicDecisionUrgencyLabel(priorityResult.score),
      resolvedProfile: resolvedAgronomicProfile,
      availableSignals: candidate.availableSignals || [],
      isCriticalStage: candidate.isDecisionCriticalStage,
      refinedContext: candidate.refinedContext,
    })
    const refinedContext = resolveQueueRefinedContext(
      candidate.refinedContext,
      decisionExplanation
    )

    return {
      id: `phenology:${candidate.id}`,
      source: 'phenology',
      title: candidate.title,
      description: appendActionComparisonDescription(
        candidate.source === 'agronomic_fallback'
          ? `Fase ${candidate.stageLabel} stimata sullo scope ${candidate.scopeLabel}. Conviene confermare con osservazione o sensore.`
          : `Fase ${candidate.stageLabel} osservata sullo scope ${candidate.scopeLabel}.`,
        economicSummary
      ),
      scopeLabel: candidate.scopeLabel,
      focus: 'quality',
      priorityScore: priorityResult.score,
      priorityConfidence: priorityResult.confidence,
      agronomicProfileId: resolvedAgronomicProfile?.profile.id || candidate.profileId,
      missingSignals: priorityResult.signalCoverage.missingP0Signals,
      urgencyLabel: resolveUrgencyLabel(priorityResult.score, economicSummary),
      metadata: {
        stageKey: candidate.stageKey,
        stageLabel: candidate.stageLabel,
        source: candidate.source,
        refinedContext,
        decisionExplanation,
        measuredFeedbackRationale: priorityResult.measuredFeedbackSummary?.rationale,
        economicSummary: priorityResult.economicSummary,
        actionComparison: getActionComparison(priorityResult.economicSummary),
      },
    }
  })
}

export function buildAgronomicActionQueue(
  input: BuildAgronomicActionQueueInput
): AgronomicActionQueueItem[] {
  const queue = [
    ...toHealthQueueItems(input.healthAlerts || [], input.measuredFeedbackRecords),
    ...toIrrigationQueueItems(
      input.irrigationReports || [],
      input.measuredFeedbackRecords,
      input.environmentalSummariesByZone
    ),
    ...toPrescriptionQueueItems(
      input.prescriptionSummary,
      input.measuredFeedbackRecords,
      input.environmentalSummariesByZone
    ),
    ...toDirectorQueueItems(input.directorActions || [], input.measuredFeedbackRecords),
    ...toPhenologyQueueItems(input.phenologyCandidates || [], input.measuredFeedbackRecords),
  ]

  return queue.sort((left, right) => {
    if (right.priorityScore !== left.priorityScore) {
      return right.priorityScore - left.priorityScore
    }

    const rightDominanceMargin =
      ((right.metadata?.actionComparison as AgronomicActionComparisonSummary | null | undefined)
        ?.dominanceMargin || 0)
    const leftDominanceMargin =
      ((left.metadata?.actionComparison as AgronomicActionComparisonSummary | null | undefined)
        ?.dominanceMargin || 0)

    if (rightDominanceMargin !== leftDominanceMargin) {
      return rightDominanceMargin - leftDominanceMargin
    }

    return right.priorityConfidence - left.priorityConfidence
  })
}
