import {
  AGRONOMIC_VALIDATION_SCENARIOS,
  type AgronomicValidationCandidateFixture,
  type AgronomicValidationScenarioFixture,
} from '@/data/agronomicValidationScenarios'
import {
  buildAgronomicEconomicPrioritySummary,
  type AgronomicEconomicPrioritySummary,
} from '@/services/agronomicEconomicPriorityService'
import {
  buildAgronomicDecisionExplanation,
  type AgronomicDecisionExplanation,
} from '@/services/agronomicDecisionExplanationService'
import {
  resolveAgronomicPriorityProfileSync,
  scoreAgronomicPriority,
} from '@/services/agronomicPriorityService'

export interface AgronomicValidationCandidateResult {
  id: string
  focus: AgronomicValidationCandidateFixture['focus']
  source: AgronomicValidationCandidateFixture['source']
  priorityScore: number
  priorityConfidence: number
  economicSummary: AgronomicEconomicPrioritySummary
  decisionExplanation: AgronomicDecisionExplanation
}

export interface AgronomicValidationScenarioResult {
  scenarioId: string
  label: string
  resolvedProfileId: string | null
  topCandidateId: string | null
  topScore: number | null
  topConfidence: number | null
  roiDirection: 'positive' | 'watch' | 'defensive' | 'unknown'
  candidates: AgronomicValidationCandidateResult[]
}

const deriveRoiDirection = (
  summary?: AgronomicEconomicPrioritySummary | null
): AgronomicValidationScenarioResult['roiDirection'] => {
  if (!summary) {
    return 'unknown'
  }

  if (summary.status === 'favorable') {
    return 'positive'
  }

  if (summary.status === 'watch') {
    return 'watch'
  }

  if (summary.status === 'defensive') {
    return 'defensive'
  }

  return 'unknown'
}

const buildCandidateResult = (
  scenario: AgronomicValidationScenarioFixture,
  candidate: AgronomicValidationCandidateFixture
): AgronomicValidationCandidateResult => {
  const resolvedProfile = resolveAgronomicPriorityProfileSync({
    hints: [
      scenario.agronomicProfileId,
      scenario.cropNameHint,
    ],
    fallbackProfileId: scenario.agronomicProfileId,
  })

  const economicSummary = buildAgronomicEconomicPrioritySummary({
    source: candidate.source,
    focus: candidate.focus,
    priorityScore: candidate.baseScore,
    priorityConfidence: candidate.confidence,
    urgencyLabel: candidate.urgencyLabel,
    agronomicProfileId: scenario.agronomicProfileId || resolvedProfile?.profile.id,
    cropNameHint: scenario.cropNameHint,
    isCriticalStage: candidate.isCriticalStage,
    severity: candidate.severity,
    averageEfficiency: candidate.averageEfficiency,
    uniformityCoefficient: candidate.uniformityCoefficient,
    waterUseEfficiency: candidate.waterUseEfficiency,
    efficacyScore: candidate.efficacyScore,
    qualityScoreGap: candidate.qualityScoreGap,
    benchmarkGap: candidate.benchmarkGap,
    environmentalSummary: scenario.environmentalSummary,
  })
  const priorityResult = scoreAgronomicPriority({
    baseScore: candidate.baseScore,
    confidence: candidate.confidence,
    resolvedProfile,
    focus: candidate.focus,
    availableSignals: candidate.availableSignals || [],
    isCriticalStage: candidate.isCriticalStage,
    environmentalSummary: scenario.environmentalSummary,
    economicSummary,
  })

  return {
    id: candidate.id,
    focus: candidate.focus,
    source: candidate.source,
    priorityScore: priorityResult.score,
    priorityConfidence: priorityResult.confidence,
    economicSummary,
    decisionExplanation: buildAgronomicDecisionExplanation({
      source: candidate.source,
      focus: candidate.focus,
      priorityResult,
      urgencyLabel:
        economicSummary.actionComparison?.recommendedUrgencyLabel || candidate.urgencyLabel,
      resolvedProfile,
      availableSignals: candidate.availableSignals || [],
      isCriticalStage: candidate.isCriticalStage,
    }),
  }
}

export function runAgronomicValidationScenario(
  scenario: AgronomicValidationScenarioFixture
): AgronomicValidationScenarioResult {
  const resolvedProfile = resolveAgronomicPriorityProfileSync({
    hints: [scenario.agronomicProfileId, scenario.cropNameHint],
    fallbackProfileId: scenario.agronomicProfileId,
  })
  const candidates = scenario.candidates
    .map((candidate) => buildCandidateResult(scenario, candidate))
    .sort((left, right) => {
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore
      }

      return right.priorityConfidence - left.priorityConfidence
    })

  const topCandidate = candidates[0]

  return {
    scenarioId: scenario.id,
    label: scenario.label,
    resolvedProfileId: resolvedProfile?.profile.id || null,
    topCandidateId: topCandidate?.id || null,
    topScore: topCandidate?.priorityScore ?? null,
    topConfidence: topCandidate?.priorityConfidence ?? null,
    roiDirection: deriveRoiDirection(topCandidate?.economicSummary),
    candidates,
  }
}

export function runAgronomicValidationHarness(
  scenarios: AgronomicValidationScenarioFixture[] = AGRONOMIC_VALIDATION_SCENARIOS
): AgronomicValidationScenarioResult[] {
  return scenarios.map((scenario) => runAgronomicValidationScenario(scenario))
}
