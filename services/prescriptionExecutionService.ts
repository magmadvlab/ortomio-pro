import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { QualityResult } from '@/types'
import type {
  PrescriptionExecutionRecord,
  PrescriptionExecutionStatus,
  PrescriptionMap,
} from '@/types/prescriptionMaps'
import {
  getScopedHealthMicroclimateSnapshot,
  healthRiskLevelToScore,
  type HealthMicroclimateSnapshot,
} from '@/services/healthMicroclimateService'

export interface PrescriptionExecutionZoneSummary {
  zoneId: string
  zoneName: string
  latestStatus: PrescriptionExecutionStatus | 'pending'
  latestExecution?: PrescriptionExecutionRecord
}

export interface PrescriptionExecutionSummary {
  totalZones: number
  completedZones: number
  partialZones: number
  missedZones: number
  pendingZones: number
  totalExecutedAreaSqm: number
  averageAccuracy?: number
  latestExecutionAt?: string
  zoneSummaries: PrescriptionExecutionZoneSummary[]
}

export type PrescriptionExecutionVarianceStatus =
  | 'pending'
  | 'aligned'
  | 'partial'
  | 'off_target'
  | 'missed'

export interface PrescriptionExecutionVarianceZone {
  zoneId: string
  zoneName: string
  latestStatus: PrescriptionExecutionStatus | 'pending'
  varianceStatus: PrescriptionExecutionVarianceStatus
  plannedRate: number
  actualRate?: number
  plannedAreaSqm: number
  areaAppliedSqm?: number
  rateDeviationPercent?: number
  areaCoveragePercent?: number
  adherenceScore: number
  latestExecution?: PrescriptionExecutionRecord
}

export interface PrescriptionExecutionVarianceSummary {
  totalZones: number
  alignedZones: number
  partialZones: number
  offTargetZones: number
  missedZones: number
  pendingZones: number
  averageAdherenceScore: number
  zoneVariances: PrescriptionExecutionVarianceZone[]
}

export type PrescriptionExecutionOutcomeStatus =
  | 'no_data'
  | 'positive'
  | 'mixed'
  | 'negative'

export interface PrescriptionExecutionOutcomeZone {
  zoneId: string
  zoneName: string
  latestStatus: PrescriptionExecutionStatus | 'pending'
  outcomeStatus: PrescriptionExecutionOutcomeStatus
  outcomeScore?: number
  outcomeRecordedAt?: string
  latestExecution?: PrescriptionExecutionRecord
  latestQualityResult?: QualityResult
}

export interface PrescriptionExecutionOutcomeSummary {
  totalZones: number
  zonesWithOutcome: number
  positiveZones: number
  mixedZones: number
  negativeZones: number
  noDataZones: number
  averageOutcomeScore: number
  zoneOutcomes: PrescriptionExecutionOutcomeZone[]
}

export type PrescriptionExecutionEfficacyStatus =
  | 'unknown'
  | 'low'
  | 'medium'
  | 'high'

export interface PrescriptionExecutionEfficacyZone {
  zoneId: string
  zoneName: string
  efficacyScore: number
  efficacyStatus: PrescriptionExecutionEfficacyStatus
  varianceStatus: PrescriptionExecutionVarianceStatus
  outcomeStatus: PrescriptionExecutionOutcomeStatus
  microclimateStatus: 'no_data' | 'stable' | 'watch' | 'critical'
  microclimateScore?: number
  soilResponseStatus: 'no_data' | 'responsive' | 'watch' | 'poor'
  soilResponseScore?: number
  fungalPressure?: HealthMicroclimateSnapshot['fungalPressure']
  waterStress?: HealthMicroclimateSnapshot['waterStress']
  heatStress?: HealthMicroclimateSnapshot['heatStress']
  cropContextId?: QualityResult['cropContextId']
  seasonLabel: string
}

export interface PrescriptionExecutionEfficacyBucket {
  key: string
  label: string
  averageScore: number
  zones: number
}

export interface PrescriptionExecutionEfficacySummary {
  totalZones: number
  scoredZones: number
  averageEfficacyScore: number
  averageMicroclimateScore: number
  averageSoilResponseScore: number
  highZones: number
  mediumZones: number
  lowZones: number
  unknownZones: number
  zoneScores: PrescriptionExecutionEfficacyZone[]
  cropContextScores: PrescriptionExecutionEfficacyBucket[]
  seasonScores: PrescriptionExecutionEfficacyBucket[]
}

const RATE_ALIGNED_THRESHOLD = 10
const RATE_PARTIAL_THRESHOLD = 25
const AREA_ALIGNED_THRESHOLD = 90
const AREA_PARTIAL_THRESHOLD = 50

const QUALITY_GRADE_SCORE: Record<NonNullable<QualityResult['qualityGrade']>, number> = {
  premium: 95,
  excellent: 88,
  good: 75,
  fair: 55,
  poor: 30,
}

const getSeasonLabel = (dateString: string) => {
  const month = new Date(dateString).getUTCMonth() + 1
  if (month === 12 || month <= 2) return 'Inverno'
  if (month <= 5) return 'Primavera'
  if (month <= 8) return 'Estate'
  return 'Autunno'
}

export function computeMicroclimateEfficacy(
  snapshot: HealthMicroclimateSnapshot | null | undefined
): {
  status: PrescriptionExecutionEfficacyZone['microclimateStatus']
  score?: number
  fungalPressure?: HealthMicroclimateSnapshot['fungalPressure']
  waterStress?: HealthMicroclimateSnapshot['waterStress']
  heatStress?: HealthMicroclimateSnapshot['heatStress']
} {
  if (!snapshot?.hasRecentData) {
    return { status: 'no_data' }
  }

  const weightedRisk =
    healthRiskLevelToScore(snapshot.waterStress) * 3 +
    healthRiskLevelToScore(snapshot.heatStress) * 2 +
    healthRiskLevelToScore(snapshot.fungalPressure) * 2
  const score = Number((100 - (weightedRisk / 21) * 100).toFixed(2))

  let status: PrescriptionExecutionEfficacyZone['microclimateStatus'] = 'stable'
  if (snapshot.waterStress === 'high' || snapshot.heatStress === 'high') {
    status = 'critical'
  } else if (
    snapshot.fungalPressure === 'high' ||
    snapshot.waterStress === 'medium' ||
    snapshot.heatStress === 'medium' ||
    snapshot.fungalPressure === 'medium'
  ) {
    status = 'watch'
  }

  return {
    status,
    score,
    fungalPressure: snapshot.fungalPressure,
    waterStress: snapshot.waterStress,
    heatStress: snapshot.heatStress,
  }
}

export function computeSoilResponseEfficacy(
  snapshot: HealthMicroclimateSnapshot | null | undefined,
  latestExecution: PrescriptionExecutionRecord | undefined
): {
  status: PrescriptionExecutionEfficacyZone['soilResponseStatus']
  score?: number
} {
  if (!snapshot?.hasRecentData || !latestExecution) {
    return { status: 'no_data' }
  }

  const soilReadingDates = [
    snapshot.readings.soilMoisture10cm?.reading_date,
    snapshot.readings.soilMoisture30cm?.reading_date,
    snapshot.readings.soilMoisture60cm?.reading_date,
    snapshot.readings.soilTensionKpa?.reading_date,
  ].filter((value): value is string => Boolean(value))

  const latestSoilReadingAt = soilReadingDates
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]

  if (!latestSoilReadingAt || new Date(latestSoilReadingAt).getTime() < new Date(latestExecution.applicationDate).getTime()) {
    return { status: 'no_data' }
  }

  const scoreInputs: number[] = []
  if (typeof snapshot.metrics.soilTensionKpa === 'number') {
    const tensionScore = Math.max(0, Math.min(100, 100 - ((snapshot.metrics.soilTensionKpa - 20) / 130) * 100))
    scoreInputs.push(Number(tensionScore.toFixed(2)))
  }
  if (typeof snapshot.metrics.soilMoisture30cm === 'number') {
    const moisture30Score = Math.max(0, Math.min(100, (snapshot.metrics.soilMoisture30cm / 30) * 100))
    scoreInputs.push(Number(moisture30Score.toFixed(2)))
  }
  if (typeof snapshot.metrics.soilMoisture60cm === 'number') {
    const moisture60Score = Math.max(0, Math.min(100, (snapshot.metrics.soilMoisture60cm / 32) * 100))
    scoreInputs.push(Number(moisture60Score.toFixed(2)))
  }

  const score = average(scoreInputs)
  if (score === undefined) {
    return { status: 'no_data' }
  }

  if (score >= 75) {
    return { status: 'responsive', score }
  }
  if (score >= 45) {
    return { status: 'watch', score }
  }

  return { status: 'poor', score }
}

const getLatestExecutionByZone = (records: PrescriptionExecutionRecord[]) => {
  const latestByZone = new Map<string, PrescriptionExecutionRecord>()

  for (const record of records) {
    if (!record.prescriptionZoneId) continue
    const existing = latestByZone.get(record.prescriptionZoneId)
    if (!existing || new Date(record.applicationDate).getTime() > new Date(existing.applicationDate).getTime()) {
      latestByZone.set(record.prescriptionZoneId, record)
    }
  }

  return latestByZone
}

const average = (values: number[]) => {
  if (values.length === 0) {
    return undefined
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
}

const computeOutcomeScore = (qualityResult: QualityResult) => {
  const values: number[] = []

  if (typeof qualityResult.qualityScore === 'number') {
    values.push(qualityResult.qualityScore)
  }

  if (typeof qualityResult.brix === 'number') {
    values.push(Math.min(100, Number((qualityResult.brix * 5).toFixed(2))))
  }

  if (typeof qualityResult.defectIncidencePercentage === 'number') {
    values.push(Math.max(0, Number((100 - qualityResult.defectIncidencePercentage).toFixed(2))))
  }

  if (
    typeof qualityResult.marketableYieldKg === 'number' &&
    (typeof qualityResult.rejectedYieldKg === 'number' || qualityResult.marketableYieldKg > 0)
  ) {
    const denominator = qualityResult.marketableYieldKg + (qualityResult.rejectedYieldKg || 0)
    if (denominator > 0) {
      values.push(Number(((qualityResult.marketableYieldKg / denominator) * 100).toFixed(2)))
    }
  }

  if (qualityResult.qualityGrade) {
    values.push(QUALITY_GRADE_SCORE[qualityResult.qualityGrade])
  }

  return average(values)
}

export async function getPrescriptionExecutionSummary(
  storageProvider: Pick<IStorageProvider, 'getPrescriptionExecutionRecords'> | null | undefined,
  prescriptionMap: PrescriptionMap
): Promise<PrescriptionExecutionSummary> {
  if (!storageProvider?.getPrescriptionExecutionRecords) {
    const zoneSummaries: PrescriptionExecutionZoneSummary[] = prescriptionMap.zones.map((zone) => ({
      zoneId: zone.id,
      zoneName: zone.zoneName,
      latestStatus: 'pending',
    }))

    return {
      totalZones: prescriptionMap.zones.length,
      completedZones: 0,
      partialZones: 0,
      missedZones: 0,
      pendingZones: prescriptionMap.zones.length,
      totalExecutedAreaSqm: 0,
      zoneSummaries,
    }
  }

  const records = await storageProvider.getPrescriptionExecutionRecords(prescriptionMap.id)
  const latestByZone = getLatestExecutionByZone(records)

  const zoneSummaries: PrescriptionExecutionZoneSummary[] = prescriptionMap.zones.map((zone) => {
    const latestExecution = latestByZone.get(zone.id)
    return {
      zoneId: zone.id,
      zoneName: zone.zoneName,
      latestStatus: latestExecution?.executionStatus || 'pending',
      latestExecution,
    }
  })

  const latestExecutions = zoneSummaries
    .map((summary) => summary.latestExecution)
    .filter((record): record is PrescriptionExecutionRecord => Boolean(record))

  const accuracyValues = latestExecutions
    .map((record) => record.applicationAccuracy)
    .filter((value): value is number => typeof value === 'number')

  return {
    totalZones: prescriptionMap.zones.length,
    completedZones: zoneSummaries.filter((summary) => summary.latestStatus === 'completed').length,
    partialZones: zoneSummaries.filter((summary) => summary.latestStatus === 'partial').length,
    missedZones: zoneSummaries.filter((summary) => summary.latestStatus === 'missed').length,
    pendingZones: zoneSummaries.filter((summary) => summary.latestStatus === 'pending').length,
    totalExecutedAreaSqm: Number(
      latestExecutions.reduce((sum, record) => sum + (record.areaAppliedSqm || 0), 0).toFixed(2)
    ),
    averageAccuracy:
      accuracyValues.length > 0
        ? Number((accuracyValues.reduce((sum, value) => sum + value, 0) / accuracyValues.length).toFixed(2))
        : undefined,
    latestExecutionAt: latestExecutions
      .map((record) => record.applicationDate)
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0],
    zoneSummaries,
  }
}

export async function getPrescriptionExecutionVarianceSummary(
  storageProvider: Pick<IStorageProvider, 'getPrescriptionExecutionRecords'> | null | undefined,
  prescriptionMap: PrescriptionMap
): Promise<PrescriptionExecutionVarianceSummary> {
  if (!storageProvider?.getPrescriptionExecutionRecords) {
    return {
      totalZones: prescriptionMap.zones.length,
      alignedZones: 0,
      partialZones: 0,
      offTargetZones: 0,
      missedZones: 0,
      pendingZones: prescriptionMap.zones.length,
      averageAdherenceScore: 0,
      zoneVariances: prescriptionMap.zones.map((zone) => ({
        zoneId: zone.id,
        zoneName: zone.zoneName,
        latestStatus: 'pending',
        varianceStatus: 'pending',
        plannedRate: zone.prescription.applicationRate,
        plannedAreaSqm: zone.areaSqm,
        adherenceScore: 0,
      })),
    }
  }

  const records = await storageProvider.getPrescriptionExecutionRecords(prescriptionMap.id)
  const latestByZone = getLatestExecutionByZone(records)

  const zoneVariances: PrescriptionExecutionVarianceZone[] = prescriptionMap.zones.map((zone) => {
    const latestExecution = latestByZone.get(zone.id)
    const plannedRate = zone.prescription.applicationRate
    const plannedAreaSqm = zone.areaSqm
    const actualRate = latestExecution?.actualRate
    const areaAppliedSqm = latestExecution?.areaAppliedSqm

    const rateDeviationPercent = typeof actualRate === 'number' && plannedRate > 0
      ? Number((Math.abs(((actualRate - plannedRate) / plannedRate) * 100)).toFixed(2))
      : undefined

    const areaCoveragePercent = typeof areaAppliedSqm === 'number' && plannedAreaSqm > 0
      ? Number(Math.min(100, (areaAppliedSqm / plannedAreaSqm) * 100).toFixed(2))
      : undefined

    let varianceStatus: PrescriptionExecutionVarianceStatus = 'pending'
    let adherenceScore = 0

    if (latestExecution?.executionStatus === 'missed') {
      varianceStatus = 'missed'
      adherenceScore = 0
    } else if (latestExecution) {
      const normalizedRateScore = typeof rateDeviationPercent === 'number'
        ? Math.max(0, 100 - rateDeviationPercent)
        : 0
      const normalizedAreaScore = typeof areaCoveragePercent === 'number'
        ? areaCoveragePercent
        : 0

      adherenceScore = Number(((normalizedRateScore * 0.6) + (normalizedAreaScore * 0.4)).toFixed(2))

      const isAligned = latestExecution.executionStatus === 'completed'
        && (rateDeviationPercent ?? 100) <= RATE_ALIGNED_THRESHOLD
        && (areaCoveragePercent ?? 0) >= AREA_ALIGNED_THRESHOLD

      const isPartial = latestExecution.executionStatus === 'partial'
        || ((rateDeviationPercent ?? 100) <= RATE_PARTIAL_THRESHOLD
          && (areaCoveragePercent ?? 0) >= AREA_PARTIAL_THRESHOLD)

      if (isAligned) {
        varianceStatus = 'aligned'
      } else if (isPartial) {
        varianceStatus = 'partial'
      } else {
        varianceStatus = 'off_target'
      }
    }

    return {
      zoneId: zone.id,
      zoneName: zone.zoneName,
      latestStatus: latestExecution?.executionStatus || 'pending',
      varianceStatus,
      plannedRate,
      actualRate,
      plannedAreaSqm,
      areaAppliedSqm,
      rateDeviationPercent,
      areaCoveragePercent,
      adherenceScore,
      latestExecution,
    }
  })

  return {
    totalZones: prescriptionMap.zones.length,
    alignedZones: zoneVariances.filter((zone) => zone.varianceStatus === 'aligned').length,
    partialZones: zoneVariances.filter((zone) => zone.varianceStatus === 'partial').length,
    offTargetZones: zoneVariances.filter((zone) => zone.varianceStatus === 'off_target').length,
    missedZones: zoneVariances.filter((zone) => zone.varianceStatus === 'missed').length,
    pendingZones: zoneVariances.filter((zone) => zone.varianceStatus === 'pending').length,
    averageAdherenceScore: Number((
      zoneVariances.reduce((sum, zone) => sum + zone.adherenceScore, 0) / Math.max(zoneVariances.length, 1)
    ).toFixed(2)),
    zoneVariances,
  }
}

export async function getPrescriptionExecutionOutcomeSummary(
  storageProvider: Pick<IStorageProvider, 'getPrescriptionExecutionRecords' | 'getQualityResults'> | null | undefined,
  prescriptionMap: PrescriptionMap
): Promise<PrescriptionExecutionOutcomeSummary> {
  if (!storageProvider?.getPrescriptionExecutionRecords || !storageProvider.getQualityResults) {
    return {
      totalZones: prescriptionMap.zones.length,
      zonesWithOutcome: 0,
      positiveZones: 0,
      mixedZones: 0,
      negativeZones: 0,
      noDataZones: prescriptionMap.zones.length,
      averageOutcomeScore: 0,
      zoneOutcomes: prescriptionMap.zones.map((zone) => ({
        zoneId: zone.id,
        zoneName: zone.zoneName,
        latestStatus: 'pending',
        outcomeStatus: 'no_data',
      })),
    }
  }

  const records = await storageProvider.getPrescriptionExecutionRecords(prescriptionMap.id)
  const latestByZone = getLatestExecutionByZone(records)

  const zoneOutcomes: PrescriptionExecutionOutcomeZone[] = await Promise.all(
    prescriptionMap.zones.map(async (zone) => {
      const latestExecution = latestByZone.get(zone.id)

      if (!latestExecution || latestExecution.executionStatus === 'missed') {
        return {
          zoneId: zone.id,
          zoneName: zone.zoneName,
          latestStatus: latestExecution?.executionStatus || 'pending',
          outcomeStatus: 'no_data' as const,
          latestExecution,
        }
      }

      const qualityResults = await storageProvider.getQualityResults!(prescriptionMap.gardenId, {
        zoneId: zone.id,
        limit: 12,
      })

      const eligibleResults = qualityResults
        .filter((result) => new Date(result.recordedAt).getTime() >= new Date(latestExecution.applicationDate).getTime())
        .sort((left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime())

      const latestQualityResult = eligibleResults[0]
      const outcomeScore = latestQualityResult ? computeOutcomeScore(latestQualityResult) : undefined

      let outcomeStatus: PrescriptionExecutionOutcomeStatus = 'no_data'
      if (typeof outcomeScore === 'number') {
        if (outcomeScore >= 75) {
          outcomeStatus = 'positive'
        } else if (outcomeScore >= 45) {
          outcomeStatus = 'mixed'
        } else {
          outcomeStatus = 'negative'
        }
      }

      return {
        zoneId: zone.id,
        zoneName: zone.zoneName,
        latestStatus: latestExecution.executionStatus,
        outcomeStatus,
        outcomeScore,
        outcomeRecordedAt: latestQualityResult?.recordedAt,
        latestExecution,
        latestQualityResult,
      }
    })
  )

  const outcomeScores = zoneOutcomes
    .map((zone) => zone.outcomeScore)
    .filter((score): score is number => typeof score === 'number')

  return {
    totalZones: prescriptionMap.zones.length,
    zonesWithOutcome: zoneOutcomes.filter((zone) => zone.outcomeStatus !== 'no_data').length,
    positiveZones: zoneOutcomes.filter((zone) => zone.outcomeStatus === 'positive').length,
    mixedZones: zoneOutcomes.filter((zone) => zone.outcomeStatus === 'mixed').length,
    negativeZones: zoneOutcomes.filter((zone) => zone.outcomeStatus === 'negative').length,
    noDataZones: zoneOutcomes.filter((zone) => zone.outcomeStatus === 'no_data').length,
    averageOutcomeScore: average(outcomeScores) || 0,
    zoneOutcomes,
  }
}

export async function getPrescriptionExecutionEfficacySummary(
  storageProvider: Pick<IStorageProvider, 'getPrescriptionExecutionRecords' | 'getQualityResults' | 'getGarden'> | null | undefined,
  prescriptionMap: PrescriptionMap
): Promise<PrescriptionExecutionEfficacySummary> {
  const varianceSummary = await getPrescriptionExecutionVarianceSummary(storageProvider, prescriptionMap)
  const outcomeSummary = await getPrescriptionExecutionOutcomeSummary(storageProvider, prescriptionMap)
  const garden = storageProvider?.getGarden ? await storageProvider.getGarden(prescriptionMap.gardenId).catch(() => null) : null

  const zoneScores = await Promise.all(prescriptionMap.zones.map(async (zone) => {
    const variance = varianceSummary.zoneVariances.find((entry) => entry.zoneId === zone.id)
    const outcome = outcomeSummary.zoneOutcomes.find((entry) => entry.zoneId === zone.id)
    const microclimate = garden
      ? await getScopedHealthMicroclimateSnapshot(garden, { zoneId: zone.id }).catch(() => null)
      : null
    const microclimateEfficacy = computeMicroclimateEfficacy(microclimate)
    const soilResponseEfficacy = computeSoilResponseEfficacy(microclimate, outcome?.latestExecution || variance?.latestExecution)

    const weightedComponents: Array<{ value: number; weight: number }> = []
    if (variance && variance.adherenceScore > 0) {
      weightedComponents.push({ value: variance.adherenceScore, weight: 0.35 })
    }
    if (typeof outcome?.outcomeScore === 'number') {
      weightedComponents.push({ value: outcome.outcomeScore, weight: 0.35 })
    }
    if (typeof microclimateEfficacy.score === 'number') {
      weightedComponents.push({ value: microclimateEfficacy.score, weight: 0.15 })
    }
    if (typeof soilResponseEfficacy.score === 'number') {
      weightedComponents.push({ value: soilResponseEfficacy.score, weight: 0.15 })
    }

    const totalWeight = weightedComponents.reduce((sum, component) => sum + component.weight, 0)
    const efficacyScore = weightedComponents.length > 0
      ? Number((
          weightedComponents.reduce((sum, component) => sum + component.value * component.weight, 0) /
          totalWeight
        ).toFixed(2))
      : 0

    let efficacyStatus: PrescriptionExecutionEfficacyStatus = 'unknown'
    if (efficacyScore >= 80) {
      efficacyStatus = 'high'
    } else if (efficacyScore >= 55) {
      efficacyStatus = 'medium'
    } else if (efficacyScore > 0) {
      efficacyStatus = 'low'
    }

    const referenceDate =
      outcome?.outcomeRecordedAt ||
      outcome?.latestExecution?.applicationDate ||
      prescriptionMap.generationDate

    return {
      zoneId: zone.id,
      zoneName: zone.zoneName,
      efficacyScore,
      efficacyStatus,
      varianceStatus: variance?.varianceStatus || 'pending',
      outcomeStatus: outcome?.outcomeStatus || 'no_data',
      microclimateStatus: microclimateEfficacy.status,
      microclimateScore: microclimateEfficacy.score,
      soilResponseStatus: soilResponseEfficacy.status,
      soilResponseScore: soilResponseEfficacy.score,
      fungalPressure: microclimateEfficacy.fungalPressure,
      waterStress: microclimateEfficacy.waterStress,
      heatStress: microclimateEfficacy.heatStress,
      cropContextId: outcome?.latestQualityResult?.cropContextId,
      seasonLabel: getSeasonLabel(referenceDate),
    }
  }))

  const scoredZones = zoneScores.filter((zone) => zone.efficacyStatus !== 'unknown')
  const microclimateScores = zoneScores
    .map((zone) => zone.microclimateScore)
    .filter((score): score is number => typeof score === 'number')
  const soilResponseScores = zoneScores
    .map((zone) => zone.soilResponseScore)
    .filter((score): score is number => typeof score === 'number')

  const buildBucketScores = (
    items: PrescriptionExecutionEfficacyZone[],
    resolver: (item: PrescriptionExecutionEfficacyZone) => { key: string; label: string }
  ): PrescriptionExecutionEfficacyBucket[] => {
    const buckets = new Map<string, { label: string; scores: number[] }>()

    for (const item of items) {
      const bucket = resolver(item)
      if (!buckets.has(bucket.key)) {
        buckets.set(bucket.key, { label: bucket.label, scores: [] })
      }
      buckets.get(bucket.key)?.scores.push(item.efficacyScore)
    }

    return Array.from(buckets.entries())
      .map(([key, value]) => ({
        key,
        label: value.label,
        averageScore: average(value.scores) || 0,
        zones: value.scores.length,
      }))
      .sort((left, right) => right.averageScore - left.averageScore)
  }

  return {
    totalZones: prescriptionMap.zones.length,
    scoredZones: scoredZones.length,
    averageEfficacyScore: average(scoredZones.map((zone) => zone.efficacyScore)) || 0,
    averageMicroclimateScore: average(microclimateScores) || 0,
    averageSoilResponseScore: average(soilResponseScores) || 0,
    highZones: zoneScores.filter((zone) => zone.efficacyStatus === 'high').length,
    mediumZones: zoneScores.filter((zone) => zone.efficacyStatus === 'medium').length,
    lowZones: zoneScores.filter((zone) => zone.efficacyStatus === 'low').length,
    unknownZones: zoneScores.filter((zone) => zone.efficacyStatus === 'unknown').length,
    cropContextScores: buildBucketScores(scoredZones, (item) => ({
      key: item.cropContextId || 'unclassified',
      label: item.cropContextId || 'non classificata',
    })),
    seasonScores: buildBucketScores(zoneScores, (item) => ({
      key: item.seasonLabel,
      label: item.seasonLabel,
    })),
    zoneScores,
  }
}
