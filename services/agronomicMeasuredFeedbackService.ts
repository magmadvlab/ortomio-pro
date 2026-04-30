import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { WateringLog } from '@/types/microzoneTracking'
import type { NutritionTreatment } from '@/types/nutrition'
import type { MechanicalWorkLog } from '@/services/mechanicalWorkService'
import type { HarvestLogData } from '@/types'
import {
  estimateHarvestOperationEconomics,
  estimateIrrigationOperationEconomics,
  estimateMechanicalOperationEconomics,
} from '@/services/agronomicOperationalEconomicsService'
import { parseTaskExecutionQuickPayloadNotes } from '@/services/taskExecutionQuickPayloadService'

export type AgronomicMeasuredFeedbackFocus =
  | 'water'
  | 'nutrition'
  | 'quality'
  | 'operations'

export type AgronomicMeasuredFeedbackOperation =
  | 'watering'
  | 'nutrition'
  | 'harvest'
  | 'mechanical_work'

export interface AgronomicMeasuredFeedbackRecord {
  id: string
  gardenId: string
  sourceTaskId?: string
  operation: AgronomicMeasuredFeedbackOperation
  focus: AgronomicMeasuredFeedbackFocus
  recordedAt: string
  plantName?: string
  zoneId?: string
  rowId?: string
  notes?: string
  summary: string
  metrics: Record<string, string | number | boolean | null>
}

export interface AgronomicMeasuredFeedbackSummary {
  sampleCount: number
  matchedBy: 'zone' | 'plant' | 'focus'
  latestRecordedAt?: string
  scoreAdjustment: number
  confidenceAdjustment: number
  positiveSignals: number
  negativeSignals: number
  rationale: string[]
}

type MeasuredFeedbackStorage = Pick<
  IStorageProvider,
  'getUserPreference' | 'setUserPreference'
>

type MeasuredWateringFeedbackLog = Pick<
  WateringLog,
  | 'gardenId'
  | 'taskId'
  | 'zoneId'
  | 'date'
  | 'litersApplied'
  | 'durationMinutes'
  | 'method'
  | 'soilMoistureBefore'
  | 'soilMoistureAfter'
  | 'airTemperatureC'
  | 'notes'
> & {
  rowId?: string
}

const getMeasuredFeedbackPreferenceKey = (gardenId: string) =>
  `agronomic_measured_feedback:${gardenId}`

const average = (values: Array<number | undefined>): number | undefined => {
  const validValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (validValues.length === 0) {
    return undefined
  }

  return Number((validValues.reduce((sum, value) => sum + value, 0) / validValues.length).toFixed(2))
}

const getDateOnly = (value?: string): string =>
  value?.includes('T') ? value.split('T')[0] : value || new Date().toISOString().split('T')[0]

const normalizeText = (value?: string | null) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

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

export async function getAgronomicMeasuredFeedbackRecords(
  storageProvider: MeasuredFeedbackStorage | null | undefined,
  gardenId: string
): Promise<AgronomicMeasuredFeedbackRecord[]> {
  if (!storageProvider?.getUserPreference) {
    return []
  }

  const records =
    (await storageProvider.getUserPreference<AgronomicMeasuredFeedbackRecord[]>(
      getMeasuredFeedbackPreferenceKey(gardenId)
    )) || []

  return [...records].sort(
    (left, right) =>
      new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime()
  )
}

export async function recordAgronomicMeasuredFeedback(
  storageProvider: MeasuredFeedbackStorage | null | undefined,
  feedback:
    | AgronomicMeasuredFeedbackRecord
    | AgronomicMeasuredFeedbackRecord[]
    | null
    | undefined
): Promise<AgronomicMeasuredFeedbackRecord[]> {
  if (!storageProvider?.getUserPreference || !storageProvider?.setUserPreference || !feedback) {
    return []
  }

  const feedbackRecords = (Array.isArray(feedback) ? feedback : [feedback]).filter(Boolean)
  if (feedbackRecords.length === 0) {
    return []
  }

  const gardenIds = [...new Set(feedbackRecords.map((record) => record.gardenId))]
  if (gardenIds.length !== 1) {
    return []
  }

  const gardenId = gardenIds[0]
  const existingRecords = await getAgronomicMeasuredFeedbackRecords(storageProvider, gardenId)
  const mergedRecords = [
    ...feedbackRecords,
    ...existingRecords.filter(
      (existingRecord) => !feedbackRecords.some((nextRecord) => nextRecord.id === existingRecord.id)
    ),
  ]

  await storageProvider.setUserPreference(
    getMeasuredFeedbackPreferenceKey(gardenId),
    mergedRecords
  )

  return mergedRecords
}

export function summarizeAgronomicMeasuredFeedback(
  records: AgronomicMeasuredFeedbackRecord[],
  options: {
    focus: 'water' | 'nutrition' | 'health' | 'quality'
    zoneId?: string | null
    plantName?: string | null
  }
): AgronomicMeasuredFeedbackSummary | null {
  if (options.focus === 'health') {
    return null
  }

  const focusRecords = records.filter((record) => record.focus === options.focus)
  if (focusRecords.length === 0) {
    return null
  }

  const normalizedPlantName = normalizeText(options.plantName)
  const zoneRecords = options.zoneId
    ? focusRecords.filter((record) => record.zoneId === options.zoneId)
    : []
  const plantRecords = normalizedPlantName
    ? focusRecords.filter((record) => normalizeText(record.plantName) === normalizedPlantName)
    : []

  const matchedRecords =
    zoneRecords.length > 0
      ? zoneRecords
      : plantRecords.length > 0
        ? plantRecords
        : focusRecords
  const matchedBy: AgronomicMeasuredFeedbackSummary['matchedBy'] =
    zoneRecords.length > 0 ? 'zone' : plantRecords.length > 0 ? 'plant' : 'focus'
  const recentRecords = [...matchedRecords]
    .sort(
      (left, right) =>
        new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime()
    )
    .slice(0, 6)

  let scoreAdjustment = 0
  let positiveSignals = 0
  let negativeSignals = 0
  const rationale: string[] = []

  if (options.focus === 'water') {
    const moistureDelta = getNumericMetricAverage(recentRecords, 'averageSoilMoistureDelta')
    if (typeof moistureDelta === 'number') {
      if (moistureDelta <= 0) {
        scoreAdjustment += 8
        negativeSignals += 1
        rationale.push('Storico irriguo con delta umidita insufficiente dopo l’esecuzione.')
      } else if (moistureDelta >= 4) {
        scoreAdjustment -= 5
        positiveSignals += 1
        rationale.push('Storico irriguo con risposta idrica positiva sul suolo.')
      }
    }
  }

  if (options.focus === 'nutrition') {
    const effectivenessScore = getNumericMetricAverage(recentRecords, 'effectivenessScore')
    const followUpRate = average(
      recentRecords.map((record) =>
        record.metrics.followUpRequired === true ? 1 : record.metrics.followUpRequired === false ? 0 : undefined
      )
    )

    if (typeof effectivenessScore === 'number') {
      if (effectivenessScore < 5) {
        scoreAdjustment += 8
        negativeSignals += 1
        rationale.push('Storico trattamenti con efficacia osservata bassa.')
      } else if (effectivenessScore >= 7) {
        scoreAdjustment -= 5
        positiveSignals += 1
        rationale.push('Storico trattamenti con efficacia osservata alta.')
      }
    }

    if (typeof followUpRate === 'number' && followUpRate >= 0.5) {
      scoreAdjustment += 4
      negativeSignals += 1
      rationale.push('Molti interventi precedenti hanno richiesto follow-up aggiuntivo.')
    }
  }

  if (options.focus === 'quality') {
    const qualityRating = getNumericMetricAverage(recentRecords, 'qualityRating')
    const brix = getNumericMetricAverage(recentRecords, 'brix')

    if (typeof qualityRating === 'number') {
      if (qualityRating < 3) {
        scoreAdjustment += 7
        negativeSignals += 1
        rationale.push('Storico raccolta con rating qualitativo sotto soglia.')
      } else if (qualityRating >= 4) {
        scoreAdjustment -= 4
        positiveSignals += 1
        rationale.push('Storico raccolta con qualita osservata buona o alta.')
      }
    }

    if (typeof brix === 'number' && brix >= 12) {
      scoreAdjustment -= 2
      positiveSignals += 1
      rationale.push('Storico qualitativo con solidi solubili soddisfacenti.')
    }
  }

  const confidenceAdjustment = Math.min(
    0.12,
    recentRecords.length * 0.02 + (matchedBy === 'focus' ? 0 : 0.02)
  )

  return {
    sampleCount: recentRecords.length,
    matchedBy,
    latestRecordedAt: recentRecords[0]?.recordedAt,
    scoreAdjustment,
    confidenceAdjustment,
    positiveSignals,
    negativeSignals,
    rationale,
  }
}

export function buildWateringMeasuredFeedback(
  logs: MeasuredWateringFeedbackLog[],
  options?: {
    gardenId?: string
    plantName?: string
  }
): AgronomicMeasuredFeedbackRecord | null {
  const validLogs = logs.filter(Boolean)
  if (validLogs.length === 0) {
    return null
  }

  const firstLog = validLogs[0]
  const gardenId = firstLog.gardenId || options?.gardenId
  if (!gardenId) {
    return null
  }

  const averageBefore = average(validLogs.map((log) => log.soilMoistureBefore))
  const averageAfter = average(validLogs.map((log) => log.soilMoistureAfter))
  const totalLiters = Number(validLogs.reduce((sum, log) => sum + (log.litersApplied || 0), 0).toFixed(2))
  const totalDuration = Number(validLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0).toFixed(2))
  const economicAssessments = validLogs.map((log) =>
    estimateIrrigationOperationEconomics({
      litersApplied: log.litersApplied || 0,
      durationMinutes: log.durationMinutes || 0,
      method: log.method,
    })
  )
  const estimatedWaterCost = Number(
    economicAssessments.reduce((sum, assessment) => sum + (assessment.waterCost || 0), 0).toFixed(2)
  )
  const estimatedEnergyCost = Number(
    economicAssessments.reduce((sum, assessment) => sum + (assessment.energyCost || 0), 0).toFixed(2)
  )
  const estimatedLaborCost = Number(
    economicAssessments.reduce((sum, assessment) => sum + (assessment.laborCost || 0), 0).toFixed(2)
  )
  const totalCost = Number(
    economicAssessments.reduce((sum, assessment) => sum + assessment.estimatedCost, 0).toFixed(2)
  )
  const quickPayload = parseTaskExecutionQuickPayloadNotes(firstLog.notes)

  return {
    id: `agro_feedback:watering:${firstLog.taskId || firstLog.zoneId}:${getDateOnly(firstLog.date)}`,
    gardenId,
    sourceTaskId: firstLog.taskId,
    operation: 'watering',
    focus: 'water',
    recordedAt: firstLog.date,
    plantName: options?.plantName,
    zoneId: firstLog.zoneId,
    rowId: validLogs.length === 1 ? firstLog.rowId : undefined,
    notes: firstLog.notes,
    summary:
      validLogs.length > 1
        ? `Irrigazione eseguita su ${validLogs.length} filari con ${totalLiters} L complessivi.`
        : `Irrigazione eseguita con ${totalLiters} L applicati.`,
    metrics: {
      rowCount: validLogs.length,
      totalLitersApplied: totalLiters,
      totalDurationMinutes: totalDuration,
      averageLitersPerRow: validLogs.length > 0 ? Number((totalLiters / validLogs.length).toFixed(2)) : null,
      averageDurationPerRowMinutes: validLogs.length > 0 ? Number((totalDuration / validLogs.length).toFixed(2)) : null,
      averageSoilMoistureBefore: averageBefore ?? null,
      averageSoilMoistureAfter: averageAfter ?? null,
      averageSoilMoistureDelta:
        typeof averageBefore === 'number' && typeof averageAfter === 'number'
          ? Number((averageAfter - averageBefore).toFixed(2))
          : null,
      averageAirTemperatureC: average(validLogs.map((log) => log.airTemperatureC)) ?? null,
      quickOutcome: quickPayload.outcome,
      followUpRequired: quickPayload.followUpRequired,
      estimatedWaterCost,
      estimatedEnergyCost,
      estimatedLaborCost,
      estimatedCost: totalCost,
      totalCost,
      costSource: 'estimated',
    },
  }
}

export function buildNutritionMeasuredFeedback(
  treatment: Pick<
    NutritionTreatment,
    | 'id'
    | 'gardenId'
    | 'sourceTaskId'
    | 'zoneId'
    | 'fieldRowId'
    | 'productName'
    | 'treatmentType'
    | 'actualApplicationDate'
    | 'scheduledDate'
    | 'dosage'
    | 'dosageUnit'
    | 'applicationDurationMinutes'
    | 'actualCoverage'
    | 'effectiveness'
    | 'plantResponse'
    | 'followUpRequired'
    | 'followUpDate'
    | 'productCost'
    | 'laborCost'
    | 'equipmentCost'
    | 'totalCost'
    | 'notes'
  >
): AgronomicMeasuredFeedbackRecord {
  const derivedTotalCost =
    treatment.totalCost ??
    [treatment.productCost, treatment.laborCost, treatment.equipmentCost]
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
      .reduce((sum, value) => sum + value, 0)

  return {
    id: `agro_feedback:nutrition:${treatment.id}:${getDateOnly(treatment.actualApplicationDate || treatment.scheduledDate)}`,
    gardenId: treatment.gardenId,
    sourceTaskId: treatment.sourceTaskId,
    operation: 'nutrition',
    focus: 'nutrition',
    recordedAt: treatment.actualApplicationDate || treatment.scheduledDate,
    zoneId: treatment.zoneId,
    rowId: treatment.fieldRowId,
    notes: treatment.notes,
    summary: `Trattamento ${treatment.productName} registrato come eseguito.`,
    metrics: {
      treatmentType: treatment.treatmentType,
      dosage: treatment.dosage,
      dosageUnit: treatment.dosageUnit,
      applicationDurationMinutes: treatment.applicationDurationMinutes ?? null,
      actualCoverage: treatment.actualCoverage ?? null,
      effectivenessScore: treatment.effectiveness ?? null,
      plantResponse: treatment.plantResponse || null,
      followUpRequired: treatment.followUpRequired,
      followUpDate: treatment.followUpDate || null,
      productCost: treatment.productCost ?? null,
      laborCost: treatment.laborCost ?? null,
      equipmentCost: treatment.equipmentCost ?? null,
      cost: derivedTotalCost || null,
      totalCost: derivedTotalCost || null,
      actualCost: treatment.totalCost ?? null,
      costSource: treatment.totalCost ? 'observed' : 'estimated',
    },
  }
}

export function buildHarvestMeasuredFeedback(
  harvest: Pick<
    HarvestLogData,
    | 'gardenId'
    | 'taskId'
    | 'plantName'
    | 'quantity'
    | 'unit'
    | 'rating'
    | 'date'
    | 'brix'
    | 'marketValue'
    | 'costPerKg'
    | 'notes'
  >
): AgronomicMeasuredFeedbackRecord | null {
  if (!harvest.gardenId) {
    return null
  }

  const qualityScore =
    typeof harvest.rating === 'number' ? Number((harvest.rating * 20).toFixed(1)) : null
  const economics = estimateHarvestOperationEconomics(harvest)
  const estimatedValue =
    typeof economics.economicValue === 'number' ? economics.economicValue : null
  const estimatedUnitPrice =
    estimatedValue !== null &&
    harvest.unit !== 'units' &&
    harvest.quantity > 0
      ? Number((estimatedValue / (harvest.unit === 'g' ? harvest.quantity / 1000 : harvest.quantity)).toFixed(2))
      : null
  const quickPayload = parseTaskExecutionQuickPayloadNotes(harvest.notes)

  return {
    id: `agro_feedback:harvest:${harvest.taskId || harvest.plantName}:${getDateOnly(harvest.date)}`,
    gardenId: harvest.gardenId,
    sourceTaskId: harvest.taskId,
    operation: 'harvest',
    focus: 'quality',
    recordedAt: harvest.date,
    plantName: harvest.plantName,
    notes: harvest.notes,
    summary: `Raccolto registrato: ${harvest.quantity} ${harvest.unit}.`,
    metrics: {
      quantity: harvest.quantity,
      unit: harvest.unit,
      qualityRating: harvest.rating ?? null,
      qualityScore,
      brix: harvest.brix ?? null,
      quickOutcome: quickPayload.outcome,
      followUpRequired: quickPayload.followUpRequired,
      estimatedUnitPrice,
      estimatedValue,
      cost: economics.estimatedCost,
      estimatedCost: economics.estimatedCost,
      actualCost: economics.actualCost ?? null,
      costSource: economics.costSource,
      netImpact: economics.netEconomicImpact ?? null,
    },
  }
}

export function buildMechanicalMeasuredFeedback(
  log: Pick<
    MechanicalWorkLog,
    | 'gardenId'
    | 'workType'
    | 'workDate'
    | 'durationMinutes'
    | 'areaCoveredSqm'
    | 'depthCm'
    | 'cost'
    | 'equipmentType'
    | 'operatorName'
    | 'notes'
  >,
  options?: {
    sourceTaskId?: string
    zoneId?: string
    rowId?: string
    plantName?: string
  }
): AgronomicMeasuredFeedbackRecord | null {
  if (!log.gardenId) {
    return null
  }

  const economics = estimateMechanicalOperationEconomics({
    area_m2: log.areaCoveredSqm || 0,
    equipment_type: log.equipmentType,
    operator_name: log.operatorName,
    work_metadata: {
      durationMinutes: log.durationMinutes,
      cost: log.cost,
    },
  })
  const quickPayload = parseTaskExecutionQuickPayloadNotes(log.notes)

  return {
    id: `agro_feedback:mechanical:${options?.sourceTaskId || log.workType}:${getDateOnly(log.workDate)}`,
    gardenId: log.gardenId,
    sourceTaskId: options?.sourceTaskId,
    operation: 'mechanical_work',
    focus: 'operations',
    recordedAt: log.workDate,
    plantName: options?.plantName,
    zoneId: options?.zoneId,
    rowId: options?.rowId,
    notes: log.notes,
    summary: `Lavorazione ${log.workType} registrata come eseguita.`,
    metrics: {
      workType: log.workType,
      durationMinutes: log.durationMinutes ?? null,
      areaCoveredSqm: log.areaCoveredSqm ?? null,
      depthCm: log.depthCm ?? null,
      quickOutcome: quickPayload.outcome,
      followUpRequired: quickPayload.followUpRequired,
      cost: economics.actualCost ?? economics.estimatedCost,
      estimatedCost: economics.estimatedCost,
      actualCost: economics.actualCost ?? null,
      laborCost: economics.laborCost ?? null,
      equipmentCost: economics.equipmentCost ?? null,
      costSource: economics.costSource,
      equipmentType: log.equipmentType ?? null,
      operatorName: log.operatorName ?? null,
    },
  }
}
