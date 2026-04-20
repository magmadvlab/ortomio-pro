import type { IStorageProvider } from '@/packages/core/storage/interface'
import {
  getAgronomicMeasuredFeedbackRecords,
  type AgronomicMeasuredFeedbackRecord,
} from '@/services/agronomicMeasuredFeedbackService'
import {
  getAgronomicDecisionLedgerEntries,
  type AgronomicDecisionLedgerEntry,
} from '@/services/agronomicDecisionLedgerService'
import {
  getAgronomicQueueOutcomeRecords,
  type AgronomicQueueExecutionEvidence,
  type AgronomicQueueMeasuredOutcome,
  type AgronomicQueueMeasurementEvidence,
  type AgronomicQueueOutcomeRecord,
} from '@/services/agronomicQueueOutcomeService'

type AgronomicDecisionLedgerAnalyticsStorage = Pick<IStorageProvider, 'getUserPreference'>

export interface AgronomicMeasuredOutcome extends AgronomicQueueMeasuredOutcome {}

export interface AgronomicDecisionLedgerProfileSummary {
  profileId: string
  entries: number
  completed: number
  completionRate: number
}

export interface AgronomicDecisionLedgerAnalyticsSummary {
  totalEntries: number
  openEntries: number
  completedEntries: number
  urgentEntries: number
  urgentCompleted: number
  urgentVerifiedExecutions: number
  urgentHighConfidenceExecutions: number
  urgentMeasuredOutcomes: number
  agronomicMeasuredOutcomes: number
  agronomicPositiveOutcomes: number
  agronomicNegativeOutcomes: number
  urgentAgronomicPositiveOutcomes: number
  urgentAgronomicNegativeOutcomes: number
  completionRate: number
  explainedRate: number
  verifiedExecutionRate: number
  highConfidenceExecutionRate: number
  measuredOutcomeRate: number
  averagePriorityScore: number
  averagePriorityConfidence: number
  averageCompletionDays: number | null
  byFocus: Partial<Record<AgronomicDecisionLedgerEntry['focus'], number>>
  bySource: Partial<Record<AgronomicDecisionLedgerEntry['source'], number>>
  topProfiles: AgronomicDecisionLedgerProfileSummary[]
  latestCompleted?: AgronomicDecisionLedgerEntry
}

export interface AgronomicDecisionLedgerHistoryItem {
  entryId: string
  queueItemId: string
  source: AgronomicDecisionLedgerEntry['source']
  focus: AgronomicDecisionLedgerEntry['focus']
  agronomicProfileId?: string
  scopeLabel?: string
  plantName?: string
  taskType?: AgronomicDecisionLedgerEntry['taskType']
  priorityScore: number
  priorityConfidence: number
  urgencyLabel: AgronomicDecisionLedgerEntry['decisionSnapshot']['urgencyLabel']
  status: AgronomicDecisionLedgerEntry['status']
  createdAt: string
  completedAt?: string
  executionEvidence?: AgronomicQueueExecutionEvidence | null
  measurementEvidence?: AgronomicQueueMeasurementEvidence | null
  evidenceStatus: 'pending' | 'completed_unverified' | 'execution_verified' | 'outcome_measured'
  agronomicOutcome: AgronomicMeasuredOutcome
  agronomicRationale: string[]
  economicRationale: string[]
}

const roundMetric = (value: number, digits: number = 2) =>
  Number(value.toFixed(digits))

const getElapsedDays = (
  start?: string,
  end?: string
): number | null => {
  if (!start || !end) {
    return null
  }

  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime < startTime) {
    return null
  }

  return (endTime - startTime) / (24 * 60 * 60 * 1000)
}

const buildOutcomeMaps = (records: AgronomicQueueOutcomeRecord[]) => ({
  byQueueItemId: new Map(records.map((record) => [record.queueItemId, record])),
  byTaskId: new Map(records.filter((record) => record.taskId).map((record) => [record.taskId, record])),
})

const resolveMatchingOutcome = (
  entry: AgronomicDecisionLedgerEntry,
  outcomeMaps: ReturnType<typeof buildOutcomeMaps>
): AgronomicQueueOutcomeRecord | null =>
  (entry.taskId ? outcomeMaps.byTaskId.get(entry.taskId) : undefined) ||
  outcomeMaps.byQueueItemId.get(entry.queueItemId) ||
  null

const normalizeText = (value?: string | null) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

const resolveFocusForMeasuredFeedback = (
  focus: AgronomicDecisionLedgerEntry['focus']
): AgronomicMeasuredFeedbackRecord['focus'] | null => {
  if (focus === 'health') {
    return null
  }

  return focus
}

const getNumericMetric = (record: AgronomicMeasuredFeedbackRecord, key: string) => {
  const value = record.metrics[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

const resolveAgronomicMeasuredOutcome = (
  entry: AgronomicDecisionLedgerEntry,
  outcome: AgronomicQueueOutcomeRecord | null,
  feedbackRecords: AgronomicMeasuredFeedbackRecord[]
): AgronomicMeasuredOutcome => {
  if (outcome?.evidenceSnapshot?.agronomicOutcome) {
    return outcome.evidenceSnapshot.agronomicOutcome
  }

  const feedbackFocus = resolveFocusForMeasuredFeedback(entry.focus)
  if (!feedbackFocus) {
    return { status: 'unknown', matchedBy: 'none' }
  }

  const focusRecords = feedbackRecords.filter((record) => record.focus === feedbackFocus)
  const taskRecords =
    entry.taskId
      ? focusRecords.filter((record) => record.sourceTaskId === entry.taskId)
      : []
  const plantRecords =
    entry.plantName
      ? focusRecords.filter(
          (record) => normalizeText(record.plantName) === normalizeText(entry.plantName)
        )
      : []
  const matchedRecords =
    taskRecords.length > 0
      ? taskRecords
      : plantRecords.length > 0
        ? plantRecords
        : focusRecords
  const matchedBy: AgronomicMeasuredOutcome['matchedBy'] =
    taskRecords.length > 0
      ? 'task'
      : plantRecords.length > 0
        ? 'plant'
        : matchedRecords.length > 0
          ? 'focus'
          : 'none'

  const latestRecord = [...matchedRecords]
    .sort(
      (left, right) =>
        new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime()
    )[0]

  if (!latestRecord) {
    return { status: 'unknown', matchedBy: 'none' }
  }

  let status: AgronomicMeasuredOutcome['status'] = 'mixed'

  if (feedbackFocus === 'water') {
    const moistureDelta = getNumericMetric(latestRecord, 'averageSoilMoistureDelta')
    status =
      moistureDelta === null
        ? 'unknown'
        : moistureDelta <= 0
          ? 'negative'
          : moistureDelta >= 4
            ? 'positive'
            : 'mixed'
  } else if (feedbackFocus === 'nutrition') {
    const effectivenessScore = getNumericMetric(latestRecord, 'effectivenessScore')
    const followUpRequired = latestRecord.metrics.followUpRequired === true
    status =
      effectivenessScore === null
        ? followUpRequired
          ? 'negative'
          : 'unknown'
        : effectivenessScore < 5 || followUpRequired
          ? 'negative'
          : effectivenessScore >= 7
            ? 'positive'
            : 'mixed'
  } else if (feedbackFocus === 'quality') {
    const qualityRating = getNumericMetric(latestRecord, 'qualityRating')
    const brix = getNumericMetric(latestRecord, 'brix')
    status =
      qualityRating === null && brix === null
        ? 'unknown'
        : (qualityRating !== null && qualityRating < 3)
            ? 'negative'
            : (qualityRating !== null && qualityRating >= 4) || (brix !== null && brix >= 12)
              ? 'positive'
              : 'mixed'
  }

  return {
    status,
    matchedBy,
    recordedAt: latestRecord.recordedAt,
    summary: latestRecord.summary,
  }
}

const resolveEvidenceStatus = (
  entry: AgronomicDecisionLedgerEntry,
  outcome?: AgronomicQueueOutcomeRecord | null
): AgronomicDecisionLedgerHistoryItem['evidenceStatus'] => {
  if (outcome?.evidenceSnapshot?.status) {
    return outcome.evidenceSnapshot.status
  }

  if (entry.status !== 'completed') {
    return 'pending'
  }

  if (outcome?.measurementEvidence) {
    return 'outcome_measured'
  }

  if (outcome?.executionEvidence) {
    return 'execution_verified'
  }

  return 'completed_unverified'
}

export async function getAgronomicDecisionLedgerHistory(
  storageProvider: AgronomicDecisionLedgerAnalyticsStorage | null | undefined,
  gardenId: string,
  options?: {
    profileIds?: string[]
    completedOnly?: boolean
    limit?: number
  }
): Promise<AgronomicDecisionLedgerHistoryItem[]> {
  const [entries, outcomeRecords, feedbackRecords] = await Promise.all([
    getAgronomicDecisionLedgerEntries(storageProvider, gardenId),
    getAgronomicQueueOutcomeRecords(storageProvider, gardenId),
    getAgronomicMeasuredFeedbackRecords(storageProvider, gardenId),
  ])

  const outcomeMaps = buildOutcomeMaps(outcomeRecords)
  const profileFilter = new Set((options?.profileIds || []).filter(Boolean))

  const history = entries
    .filter((entry) => {
      if (options?.completedOnly && entry.status !== 'completed') {
        return false
      }
      if (profileFilter.size > 0 && (!entry.agronomicProfileId || !profileFilter.has(entry.agronomicProfileId))) {
        return false
      }
      return true
    })
    .map((entry) => {
      const outcome = resolveMatchingOutcome(entry, outcomeMaps)
      const agronomicOutcome = resolveAgronomicMeasuredOutcome(entry, outcome, feedbackRecords)
      return {
        entryId: entry.id,
        queueItemId: entry.queueItemId,
        source: entry.source,
        focus: entry.focus,
        agronomicProfileId: entry.agronomicProfileId,
        scopeLabel: entry.scopeLabel,
        plantName: entry.plantName,
        taskType: entry.taskType,
        priorityScore: entry.decisionSnapshot.priorityScore,
        priorityConfidence: entry.decisionSnapshot.priorityConfidence,
        urgencyLabel: entry.decisionSnapshot.urgencyLabel,
        status: entry.status,
        createdAt: entry.createdAt,
        completedAt: entry.completedAt,
        executionEvidence: outcome?.executionEvidence || null,
        measurementEvidence: outcome?.measurementEvidence || null,
        evidenceStatus: resolveEvidenceStatus(entry, outcome),
        agronomicOutcome,
        agronomicRationale: entry.decisionSnapshot.decisionExplanation?.agronomicRationale || [],
        economicRationale: entry.decisionSnapshot.decisionExplanation?.economicRationale || [],
      }
    })

  return typeof options?.limit === 'number' ? history.slice(0, options.limit) : history
}

export async function getAgronomicDecisionLedgerAnalyticsSummary(
  storageProvider: AgronomicDecisionLedgerAnalyticsStorage | null | undefined,
  gardenId: string
): Promise<AgronomicDecisionLedgerAnalyticsSummary> {
  const [entries, outcomeRecords, feedbackRecords] = await Promise.all([
    getAgronomicDecisionLedgerEntries(storageProvider, gardenId),
    getAgronomicQueueOutcomeRecords(storageProvider, gardenId),
    getAgronomicMeasuredFeedbackRecords(storageProvider, gardenId),
  ])

  const outcomeMaps = buildOutcomeMaps(outcomeRecords)
  const completedEntries = entries.filter((entry) => entry.status === 'completed')
  const entriesWithExplanation = entries.filter((entry) =>
    Boolean(entry.decisionSnapshot.decisionExplanation)
  )
  const verifiedEntries = completedEntries.filter((entry) =>
    Boolean(resolveMatchingOutcome(entry, outcomeMaps)?.executionEvidence)
  )
  const highConfidenceVerifiedEntries = completedEntries.filter(
    (entry) => resolveMatchingOutcome(entry, outcomeMaps)?.executionEvidence?.confidence === 'high'
  )
  const measuredEntries = completedEntries.filter((entry) =>
    Boolean(resolveMatchingOutcome(entry, outcomeMaps)?.measurementEvidence)
  )
  const urgentEntries = entries.filter((entry) => entry.decisionSnapshot.urgencyLabel === 'immediate')
  const urgentCompletedEntries = urgentEntries.filter((entry) => entry.status === 'completed')
  const urgentVerifiedEntries = urgentCompletedEntries.filter((entry) =>
    Boolean(resolveMatchingOutcome(entry, outcomeMaps)?.executionEvidence)
  )
  const urgentHighConfidenceEntries = urgentCompletedEntries.filter(
    (entry) => resolveMatchingOutcome(entry, outcomeMaps)?.executionEvidence?.confidence === 'high'
  )
  const urgentMeasuredEntries = urgentCompletedEntries.filter((entry) =>
    Boolean(resolveMatchingOutcome(entry, outcomeMaps)?.measurementEvidence)
  )
  const completionDays = completedEntries
    .map((entry) => getElapsedDays(entry.taskCreatedAt || entry.createdAt, entry.completedAt))
    .filter((value): value is number => typeof value === 'number')
  const measuredAgronomicOutcomes = completedEntries
    .map((entry) => resolveAgronomicMeasuredOutcome(entry, resolveMatchingOutcome(entry, outcomeMaps), feedbackRecords))
    .filter((outcome) => outcome.status !== 'unknown')
  const positiveAgronomicOutcomes = measuredAgronomicOutcomes.filter(
    (outcome) => outcome.status === 'positive'
  )
  const negativeAgronomicOutcomes = measuredAgronomicOutcomes.filter(
    (outcome) => outcome.status === 'negative'
  )
  const urgentAgronomicOutcomes = urgentCompletedEntries.map((entry) =>
    resolveAgronomicMeasuredOutcome(entry, resolveMatchingOutcome(entry, outcomeMaps), feedbackRecords)
  )
  const urgentPositiveAgronomicOutcomes = urgentAgronomicOutcomes.filter(
    (outcome) => outcome.status === 'positive'
  )
  const urgentNegativeAgronomicOutcomes = urgentAgronomicOutcomes.filter(
    (outcome) => outcome.status === 'negative'
  )
  const profileSummaries = Array.from(
    entries.reduce((acc, entry) => {
      const profileId = entry.agronomicProfileId
      if (!profileId) {
        return acc
      }

      const current = acc.get(profileId) || { profileId, entries: 0, completed: 0 }
      current.entries += 1
      if (entry.status === 'completed') {
        current.completed += 1
      }
      acc.set(profileId, current)
      return acc
    }, new Map<string, { profileId: string; entries: number; completed: number }>()).values()
  )
    .map((entry) => ({
      ...entry,
      completionRate: entry.entries > 0 ? roundMetric(entry.completed / entry.entries, 2) : 0,
    }))
    .sort((left, right) => {
      if (right.entries !== left.entries) {
        return right.entries - left.entries
      }

      return right.completed - left.completed
    })
    .slice(0, 3)

  return {
    totalEntries: entries.length,
    openEntries: entries.filter((entry) => entry.status !== 'completed').length,
    completedEntries: completedEntries.length,
    urgentEntries: urgentEntries.length,
    urgentCompleted: urgentCompletedEntries.length,
    urgentVerifiedExecutions: urgentVerifiedEntries.length,
    urgentHighConfidenceExecutions: urgentHighConfidenceEntries.length,
    urgentMeasuredOutcomes: urgentMeasuredEntries.length,
    agronomicMeasuredOutcomes: measuredAgronomicOutcomes.length,
    agronomicPositiveOutcomes: positiveAgronomicOutcomes.length,
    agronomicNegativeOutcomes: negativeAgronomicOutcomes.length,
    urgentAgronomicPositiveOutcomes: urgentPositiveAgronomicOutcomes.length,
    urgentAgronomicNegativeOutcomes: urgentNegativeAgronomicOutcomes.length,
    completionRate: entries.length > 0 ? roundMetric(completedEntries.length / entries.length, 2) : 0,
    explainedRate: entries.length > 0 ? roundMetric(entriesWithExplanation.length / entries.length, 2) : 0,
    verifiedExecutionRate:
      completedEntries.length > 0
        ? roundMetric(verifiedEntries.length / completedEntries.length, 2)
        : 0,
    highConfidenceExecutionRate:
      verifiedEntries.length > 0
        ? roundMetric(highConfidenceVerifiedEntries.length / verifiedEntries.length, 2)
        : 0,
    measuredOutcomeRate:
      completedEntries.length > 0
        ? roundMetric(measuredEntries.length / completedEntries.length, 2)
        : 0,
    averagePriorityScore:
      entries.length > 0
        ? roundMetric(
            entries.reduce((sum, entry) => sum + entry.decisionSnapshot.priorityScore, 0) /
              entries.length,
            1
          )
        : 0,
    averagePriorityConfidence:
      entries.length > 0
        ? roundMetric(
            entries.reduce((sum, entry) => sum + entry.decisionSnapshot.priorityConfidence, 0) /
              entries.length,
            2
          )
        : 0,
    averageCompletionDays:
      completionDays.length > 0
        ? roundMetric(
            completionDays.reduce((sum, value) => sum + value, 0) / completionDays.length,
            1
          )
        : null,
    byFocus: entries.reduce((acc, entry) => {
      acc[entry.focus] = (acc[entry.focus] || 0) + 1
      return acc
    }, {} as AgronomicDecisionLedgerAnalyticsSummary['byFocus']),
    bySource: entries.reduce((acc, entry) => {
      acc[entry.source] = (acc[entry.source] || 0) + 1
      return acc
    }, {} as AgronomicDecisionLedgerAnalyticsSummary['bySource']),
    topProfiles: profileSummaries,
    latestCompleted: completedEntries[0],
  }
}
