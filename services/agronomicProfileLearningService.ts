import type { IStorageProvider } from '@/packages/core/storage/interface'
import {
  getAgronomicMeasuredFeedbackRecords,
  type AgronomicMeasuredFeedbackFocus,
  type AgronomicMeasuredFeedbackRecord,
} from '@/services/agronomicMeasuredFeedbackService'
import { resolveAgronomicPriorityProfileSync } from '@/services/agronomicPriorityService'

export interface AgronomicProfileLearningSnapshot {
  id: string
  gardenId: string
  focus: AgronomicMeasuredFeedbackFocus
  profileId?: string
  zoneId?: string
  plantName?: string
  sampleCount: number
  adaptationStrength: number
  scoreAdjustment: number
  confidenceAdjustment: number
  updatedAt: string
  rationale: string[]
}

export interface AgronomicHealthLearningAdjustment {
  pressureBoost: number
  fungalHumidityThreshold: number
  fungalRainThreshold: number
  leafWetnessThreshold: number
  heatStressTemperatureThreshold: number
  hotDaysTriggerCount: number
  urgencyDaysOffset: number
  confidenceBoost: number
  notes: string[]
}

export interface AgronomicNutritionLearningAdjustment {
  effectivenessTargetPercent: number
  effectivenessAlertFloorPercent: number
  followUpRateThreshold: number
  confidenceBoost: number
  notes: string[]
}

export interface AgronomicQualityLearningAdjustment {
  qualityTargetRating: number
  qualityAlertFloorRating: number
  brixTarget: number
  notes: string[]
}

type AgronomicProfileLearningStorage = Pick<
  IStorageProvider,
  'getUserPreference' | 'setUserPreference'
>

const getAgronomicProfileLearningPreferenceKey = (gardenId: string) =>
  `agronomic_profile_learning:${gardenId}`

const normalizeText = (value?: string | null) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const roundMetric = (value: number, digits: number = 2) =>
  Number(value.toFixed(digits))

const average = (values: Array<number | undefined>): number | undefined => {
  const validValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (validValues.length === 0) {
    return undefined
  }

  return Number((validValues.reduce((sum, value) => sum + value, 0) / validValues.length).toFixed(2))
}

const getNumericMetricAverage = (
  records: AgronomicMeasuredFeedbackRecord[],
  key: string
): number | undefined =>
  average(
    records.map((record) => {
      const value = record.metrics[key]
      return typeof value === 'number' ? value : undefined
    })
  )

const buildSnapshotFromRecords = (
  gardenId: string,
  focus: AgronomicMeasuredFeedbackFocus,
  records: AgronomicMeasuredFeedbackRecord[]
): AgronomicProfileLearningSnapshot | null => {
  if (records.length === 0) {
    return null
  }

  const sortedRecords = [...records].sort(
    (left, right) =>
      new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime()
  )
  const latestRecord = sortedRecords[0]
  const sampleCount = sortedRecords.length
  const profileId = latestRecord.plantName
    ? resolveAgronomicPriorityProfileSync({ hints: [latestRecord.plantName] })?.profile.id
    : undefined
  const rationale: string[] = []
  let scoreAdjustment = 0

  if (focus === 'water') {
    const moistureDelta = getNumericMetricAverage(sortedRecords, 'averageSoilMoistureDelta')
    if (typeof moistureDelta === 'number') {
      if (moistureDelta <= 0) {
        scoreAdjustment += 8
        rationale.push('Memoria sito-specifica: risposta idrica storicamente insufficiente.')
      } else if (moistureDelta >= 4) {
        scoreAdjustment -= 4
        rationale.push('Memoria sito-specifica: buona risposta idrica storica.')
      }
    }
  }

  if (focus === 'nutrition') {
    const effectivenessScore = getNumericMetricAverage(sortedRecords, 'effectivenessScore')
    if (typeof effectivenessScore === 'number') {
      if (effectivenessScore < 5) {
        scoreAdjustment += 8
        rationale.push('Memoria sito-specifica: efficacia trattamenti sotto target.')
      } else if (effectivenessScore >= 7) {
        scoreAdjustment -= 4
        rationale.push('Memoria sito-specifica: efficacia trattamenti buona e ripetibile.')
      }
    }
  }

  if (focus === 'quality') {
    const qualityRating = getNumericMetricAverage(sortedRecords, 'qualityRating')
    if (typeof qualityRating === 'number') {
      if (qualityRating < 3) {
        scoreAdjustment += 7
        rationale.push('Memoria sito-specifica: qualita raccolta sotto soglia.')
      } else if (qualityRating >= 4) {
        scoreAdjustment -= 4
        rationale.push('Memoria sito-specifica: qualita raccolta buona nelle ultime campagne.')
      }
    }
  }

  if (focus === 'operations') {
    const cost = getNumericMetricAverage(sortedRecords, 'cost')
    const durationMinutes = getNumericMetricAverage(sortedRecords, 'durationMinutes')
    if (typeof cost === 'number' && cost > 0 && typeof durationMinutes === 'number' && durationMinutes > 90) {
      scoreAdjustment += 3
      rationale.push('Memoria sito-specifica: operazioni storicamente costose o lente.')
    }
  }

  const adaptationStrength = Number(Math.min(1, 0.25 + sampleCount * 0.08).toFixed(2))
  const confidenceAdjustment = Number(Math.min(0.14, adaptationStrength * 0.12).toFixed(2))

  return {
    id: `agro_learning:${focus}:${latestRecord.zoneId || 'all'}:${profileId || normalizeText(latestRecord.plantName) || 'generic'}`,
    gardenId,
    focus,
    profileId,
    zoneId: latestRecord.zoneId,
    plantName: latestRecord.plantName,
    sampleCount,
    adaptationStrength,
    scoreAdjustment,
    confidenceAdjustment,
    updatedAt: latestRecord.recordedAt,
    rationale,
  }
}

export async function getAgronomicProfileLearningSnapshots(
  storageProvider: AgronomicProfileLearningStorage | null | undefined,
  gardenId: string
): Promise<AgronomicProfileLearningSnapshot[]> {
  if (!storageProvider?.getUserPreference) {
    return []
  }

  return (
    (await storageProvider.getUserPreference<AgronomicProfileLearningSnapshot[]>(
      getAgronomicProfileLearningPreferenceKey(gardenId)
    )) || []
  )
}

export async function rebuildAgronomicProfileLearningSnapshots(
  storageProvider: AgronomicProfileLearningStorage | null | undefined,
  gardenId: string
): Promise<AgronomicProfileLearningSnapshot[]> {
  if (!storageProvider?.getUserPreference || !storageProvider?.setUserPreference) {
    return []
  }

  const records = await getAgronomicMeasuredFeedbackRecords(storageProvider, gardenId)
  const groupedRecords = new Map<string, AgronomicMeasuredFeedbackRecord[]>()

  for (const record of records.slice(0, 60)) {
    const key = [
      record.focus,
      record.zoneId || 'all',
      normalizeText(record.plantName) || 'generic',
    ].join(':')
    groupedRecords.set(key, [...(groupedRecords.get(key) || []), record])
  }

  const snapshots = Array.from(groupedRecords.values())
    .map((group) => buildSnapshotFromRecords(gardenId, group[0].focus, group))
    .filter((snapshot): snapshot is AgronomicProfileLearningSnapshot => Boolean(snapshot))

  await storageProvider.setUserPreference(
    getAgronomicProfileLearningPreferenceKey(gardenId),
    snapshots
  )

  return snapshots
}

export function findAgronomicProfileLearningSnapshot(
  snapshots: AgronomicProfileLearningSnapshot[],
  options: {
    focus: AgronomicMeasuredFeedbackFocus
    zoneId?: string | null
    plantName?: string | null
    profileId?: string | null
  }
): AgronomicProfileLearningSnapshot | null {
  const normalizedPlantName = normalizeText(options.plantName)

  const rankedSnapshots = snapshots
    .filter((snapshot) => snapshot.focus === options.focus)
    .sort((left, right) => {
      const leftSpecificity =
        (left.zoneId && left.zoneId === options.zoneId ? 3 : 0) +
        (left.profileId && left.profileId === options.profileId ? 2 : 0) +
        (normalizeText(left.plantName) && normalizeText(left.plantName) === normalizedPlantName ? 1 : 0)
      const rightSpecificity =
        (right.zoneId && right.zoneId === options.zoneId ? 3 : 0) +
        (right.profileId && right.profileId === options.profileId ? 2 : 0) +
        (normalizeText(right.plantName) && normalizeText(right.plantName) === normalizedPlantName ? 1 : 0)

      if (rightSpecificity !== leftSpecificity) {
        return rightSpecificity - leftSpecificity
      }

      return right.sampleCount - left.sampleCount
    })

  return rankedSnapshots[0] || null
}

const getSnapshotPressure = (snapshot: AgronomicProfileLearningSnapshot | null): number => {
  if (!snapshot || snapshot.scoreAdjustment <= 0) {
    return 0
  }

  return Math.min(1, (snapshot.scoreAdjustment / 10) * snapshot.adaptationStrength)
}

const getSnapshotResilience = (snapshot: AgronomicProfileLearningSnapshot | null): number => {
  if (!snapshot || snapshot.scoreAdjustment >= 0) {
    return 0
  }

  return Math.min(1, (Math.abs(snapshot.scoreAdjustment) / 10) * snapshot.adaptationStrength)
}

const buildLearningNotes = (
  label: string,
  snapshot: AgronomicProfileLearningSnapshot | null
): string[] => {
  if (!snapshot?.rationale?.length) {
    return []
  }

  return snapshot.rationale.slice(0, 2).map((note) => `${label}: ${note}`)
}

export function buildAgronomicHealthLearningAdjustment(
  snapshots: AgronomicProfileLearningSnapshot[],
  options: {
    zoneId?: string | null
    plantName?: string | null
    profileId?: string | null
  }
): AgronomicHealthLearningAdjustment {
  const waterSnapshot = findAgronomicProfileLearningSnapshot(snapshots, {
    focus: 'water',
    zoneId: options.zoneId,
    plantName: options.plantName,
    profileId: options.profileId,
  })
  const nutritionSnapshot = findAgronomicProfileLearningSnapshot(snapshots, {
    focus: 'nutrition',
    zoneId: options.zoneId,
    plantName: options.plantName,
    profileId: options.profileId,
  })
  const qualitySnapshot = findAgronomicProfileLearningSnapshot(snapshots, {
    focus: 'quality',
    zoneId: options.zoneId,
    plantName: options.plantName,
    profileId: options.profileId,
  })

  const waterPressure = getSnapshotPressure(waterSnapshot)
  const nutritionPressure = getSnapshotPressure(nutritionSnapshot)
  const qualityPressure = getSnapshotPressure(qualitySnapshot)
  const resilience =
    getSnapshotResilience(waterSnapshot) * 0.6 +
    getSnapshotResilience(nutritionSnapshot) * 0.25 +
    getSnapshotResilience(qualitySnapshot) * 0.35

  const pressureBoost = Math.max(
    0,
    Math.round(waterPressure * 3 + nutritionPressure * 2 + qualityPressure * 2 - resilience * 2)
  )

  return {
    pressureBoost,
    fungalHumidityThreshold: Math.round(
      clamp(80 - waterPressure * 4 - qualityPressure * 3 + resilience * 2, 70, 82)
    ),
    fungalRainThreshold: roundMetric(
      clamp(1 - waterPressure * 0.45 - qualityPressure * 0.25 + resilience * 0.2, 0, 1.4),
      1
    ),
    leafWetnessThreshold: Math.round(
      clamp(50 - waterPressure * 6 + resilience * 3, 40, 55)
    ),
    heatStressTemperatureThreshold: Math.round(
      clamp(30 - waterPressure * 2 - qualityPressure + resilience, 27, 31)
    ),
    hotDaysTriggerCount: pressureBoost >= 4 ? 1 : resilience >= 0.55 ? 3 : 2,
    urgencyDaysOffset: pressureBoost >= 4 ? -1 : 0,
    confidenceBoost: roundMetric(
      clamp(
        waterPressure * 0.03 + nutritionPressure * 0.02 + qualityPressure * 0.02,
        0,
        0.07
      )
    ),
    notes: [
      ...buildLearningNotes('Acqua', waterSnapshot),
      ...buildLearningNotes('Trattamenti', nutritionSnapshot),
      ...buildLearningNotes('Qualita', qualitySnapshot),
    ].slice(0, 4),
  }
}

export function buildAgronomicNutritionLearningAdjustment(
  snapshots: AgronomicProfileLearningSnapshot[],
  options: {
    zoneId?: string | null
    plantName?: string | null
    profileId?: string | null
  }
): AgronomicNutritionLearningAdjustment {
  const nutritionSnapshot = findAgronomicProfileLearningSnapshot(snapshots, {
    focus: 'nutrition',
    zoneId: options.zoneId,
    plantName: options.plantName,
    profileId: options.profileId,
  })
  const qualitySnapshot = findAgronomicProfileLearningSnapshot(snapshots, {
    focus: 'quality',
    zoneId: options.zoneId,
    plantName: options.plantName,
    profileId: options.profileId,
  })

  const nutritionPressure = getSnapshotPressure(nutritionSnapshot)
  const qualityPressure = getSnapshotPressure(qualitySnapshot) * 0.7
  const resilience =
    getSnapshotResilience(nutritionSnapshot) * 0.8 +
    getSnapshotResilience(qualitySnapshot) * 0.2

  return {
    effectivenessTargetPercent: Math.round(
      clamp(70 + nutritionPressure * 8 + qualityPressure * 4 - resilience * 4, 66, 80)
    ),
    effectivenessAlertFloorPercent: Math.round(
      clamp(60 + nutritionPressure * 12 + qualityPressure * 6 - resilience * 6, 54, 74)
    ),
    followUpRateThreshold: roundMetric(
      clamp(0.5 - nutritionPressure * 0.18 - qualityPressure * 0.08 + resilience * 0.1, 0.25, 0.65)
    ),
    confidenceBoost: roundMetric(
      clamp(nutritionPressure * 0.04 + qualityPressure * 0.02, 0, 0.08)
    ),
    notes: [
      ...buildLearningNotes('Trattamenti', nutritionSnapshot),
      ...buildLearningNotes('Qualita', qualitySnapshot),
    ].slice(0, 4),
  }
}

export function buildAgronomicQualityLearningAdjustment(
  snapshots: AgronomicProfileLearningSnapshot[],
  options: {
    zoneId?: string | null
    plantName?: string | null
    profileId?: string | null
  }
): AgronomicQualityLearningAdjustment {
  const qualitySnapshot = findAgronomicProfileLearningSnapshot(snapshots, {
    focus: 'quality',
    zoneId: options.zoneId,
    plantName: options.plantName,
    profileId: options.profileId,
  })
  const qualityPressure = getSnapshotPressure(qualitySnapshot)
  const resilience = getSnapshotResilience(qualitySnapshot)

  return {
    qualityTargetRating: roundMetric(
      clamp(4 + qualityPressure * 0.5 - resilience * 0.3, 3.6, 4.5),
      1
    ),
    qualityAlertFloorRating: roundMetric(
      clamp(3 + qualityPressure * 0.5 - resilience * 0.25, 2.8, 3.8),
      1
    ),
    brixTarget: Math.round(clamp(12 + qualityPressure * 1.5 - resilience, 11, 14)),
    notes: buildLearningNotes('Qualita', qualitySnapshot).slice(0, 3),
  }
}
