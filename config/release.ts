export const RELEASE_THRESHOLDS = {
  criticalWriteFailureRatePct: 1,
  commandRetryRatePct: 5,
  monitoringFailureRatePct: 1,
  deadLetterCount: 0,
  missingPredictionOutcomeRatePct: 20,
  p95LatencyMs: 2000,
} as const

export type ReleaseMetrics = {
  criticalWrites: number
  criticalWriteFailures: number
  commands: number
  retriedCommands: number
  deadLetters: number
  monitoringRuns: number
  failedMonitoringRuns: number
  maturePredictions: number
  predictionsWithoutOutcome: number
  p95LatencyMs: number
}

const rate = (part: number, total: number) => total > 0 ? (part / total) * 100 : 0

export function evaluateReleaseMetrics(metrics: ReleaseMetrics) {
  const calculated = {
    criticalWriteFailureRatePct: rate(metrics.criticalWriteFailures, metrics.criticalWrites),
    commandRetryRatePct: rate(metrics.retriedCommands, metrics.commands),
    monitoringFailureRatePct: rate(metrics.failedMonitoringRuns, metrics.monitoringRuns),
    missingPredictionOutcomeRatePct: rate(metrics.predictionsWithoutOutcome, metrics.maturePredictions),
  }
  const violations: string[] = []
  if (calculated.criticalWriteFailureRatePct > RELEASE_THRESHOLDS.criticalWriteFailureRatePct) violations.push('critical_write_failure_rate')
  if (calculated.commandRetryRatePct > RELEASE_THRESHOLDS.commandRetryRatePct) violations.push('command_retry_rate')
  if (calculated.monitoringFailureRatePct > RELEASE_THRESHOLDS.monitoringFailureRatePct) violations.push('monitoring_failure_rate')
  if (metrics.deadLetters > RELEASE_THRESHOLDS.deadLetterCount) violations.push('dead_letters')
  if (calculated.missingPredictionOutcomeRatePct > RELEASE_THRESHOLDS.missingPredictionOutcomeRatePct) violations.push('missing_prediction_outcomes')
  if (metrics.p95LatencyMs > RELEASE_THRESHOLDS.p95LatencyMs) violations.push('p95_latency')
  return { calculated, thresholds: RELEASE_THRESHOLDS, violations, rollbackRequired: violations.length > 0 }
}
