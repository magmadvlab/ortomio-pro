export type MonitoringSourceKind = 'observed' | 'predicted' | 'simulated'

export const monitoringRunKey = (gardenId: string, checkedAt: Date) =>
  `${gardenId}:${checkedAt.toISOString().slice(0, 10)}:${Math.floor(checkedAt.getUTCHours() / 12)}`

export const monitoringTaskSourceKey = (fingerprint: string) => `monitoring:${fingerprint}`

export const confidenceForMonitoringSource = (
  sourceKind: MonitoringSourceKind,
  proposedConfidence: number,
) => {
  const finite = Number.isFinite(proposedConfidence) ? proposedConfidence : 0
  const cap = sourceKind === 'observed' ? 0.99 : sourceKind === 'predicted' ? 0.85 : 0.35
  return Number(Math.max(0, Math.min(cap, finite)).toFixed(4))
}
