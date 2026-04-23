import type { HarvestLogData } from '@/types'
import type { WateringLog } from '@/types/microzoneTracking'
import type { NutritionTreatment } from '@/types/nutrition'
import type { MechanicalWorkLog } from '@/services/mechanicalWorkService'
import type { AgronomicQueueOperatorEvidence } from '@/services/agronomicQueueOutcomeService'

const average = (values: Array<number | undefined>): number | null => {
  const validValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (validValues.length === 0) {
    return null
  }

  return Number((validValues.reduce((sum, value) => sum + value, 0) / validValues.length).toFixed(2))
}

export function buildWateringOperatorEvidence(
  logs: Array<
    Pick<
      WateringLog,
      | 'date'
      | 'litersApplied'
      | 'durationMinutes'
      | 'method'
      | 'soilMoistureBefore'
      | 'soilMoistureAfter'
      | 'airTemperatureC'
      | 'notes'
      | 'zoneId'
      | 'bedRowId'
    >
  >
): AgronomicQueueOperatorEvidence | null {
  if (!logs.length) {
    return null
  }

  const firstLog = logs[0]
  const totalLiters = Number(
    logs.reduce((sum, log) => sum + (typeof log.litersApplied === 'number' ? log.litersApplied : 0), 0).toFixed(2)
  )
  const zoneCount = new Set(logs.map((log) => log.zoneId).filter(Boolean)).size
  const rowCount = new Set(logs.map((log) => log.bedRowId).filter(Boolean)).size

  return {
    operation: 'watering',
    recordedAt: firstLog.date,
    summary:
      logs.length > 1
        ? `Irrigazione registrata su ${logs.length} scope con ${totalLiters} L complessivi.`
        : `Irrigazione registrata con ${totalLiters} L applicati.`,
    notes: firstLog.notes,
    metrics: {
      logsCount: logs.length,
      totalLiters,
      averageDurationMinutes: average(logs.map((log) => log.durationMinutes)),
      averageSoilMoistureBefore: average(logs.map((log) => log.soilMoistureBefore)),
      averageSoilMoistureAfter: average(logs.map((log) => log.soilMoistureAfter)),
      averageAirTemperatureC: average(logs.map((log) => log.airTemperatureC)),
      method: firstLog.method || null,
      zoneCount: zoneCount || null,
      rowCount: rowCount || null,
    },
  }
}

export function buildNutritionOperatorEvidence(
  treatment: Pick<
    NutritionTreatment,
    | 'actualApplicationDate'
    | 'scheduledDate'
    | 'productName'
    | 'operatorName'
    | 'dosage'
    | 'dosageUnit'
    | 'applicationDurationMinutes'
    | 'actualCoverage'
    | 'effectiveness'
    | 'followUpRequired'
    | 'followUpDate'
    | 'photosBeforeIds'
    | 'photosAfterIds'
    | 'notes'
    | 'treatmentType'
  >
): AgronomicQueueOperatorEvidence | null {
  const recordedAt = treatment.actualApplicationDate || treatment.scheduledDate
  if (!recordedAt) {
    return null
  }

  const photoCount =
    (treatment.photosBeforeIds?.length || 0) + (treatment.photosAfterIds?.length || 0)

  return {
    operation: 'nutrition',
    recordedAt,
    summary: `Trattamento ${treatment.productName} registrato come eseguito.`,
    notes: treatment.notes,
    operatorName: treatment.operatorName || undefined,
    photoCount: photoCount || undefined,
    followUpRequired: Boolean(treatment.followUpRequired),
    metrics: {
      treatmentType: treatment.treatmentType,
      dosage: treatment.dosage,
      dosageUnit: treatment.dosageUnit,
      applicationDurationMinutes: treatment.applicationDurationMinutes ?? null,
      actualCoverage: treatment.actualCoverage ?? null,
      effectivenessScore: treatment.effectiveness ?? null,
      followUpDate: treatment.followUpDate || null,
      photosBeforeCount: treatment.photosBeforeIds?.length || 0,
      photosAfterCount: treatment.photosAfterIds?.length || 0,
    },
  }
}

export function buildHarvestOperatorEvidence(
  harvest: Pick<
    HarvestLogData,
    | 'date'
    | 'plantName'
    | 'quantity'
    | 'unit'
    | 'rating'
    | 'brix'
    | 'marketValue'
    | 'notes'
  >
): AgronomicQueueOperatorEvidence | null {
  if (!harvest.date) {
    return null
  }

  return {
    operation: 'harvest',
    recordedAt: harvest.date,
    summary: `Raccolto ${harvest.plantName}: ${harvest.quantity} ${harvest.unit}.`,
    notes: harvest.notes,
    metrics: {
      quantity: harvest.quantity,
      unit: harvest.unit,
      qualityRating: harvest.rating ?? null,
      brix: harvest.brix ?? null,
      marketValue: harvest.marketValue ?? null,
    },
  }
}

export function buildMechanicalOperatorEvidence(
  log: Pick<
    MechanicalWorkLog,
    | 'workType'
    | 'workDate'
    | 'durationMinutes'
    | 'areaCoveredSqm'
    | 'depthCm'
    | 'equipmentType'
    | 'operatorName'
    | 'cost'
    | 'notes'
  >
): AgronomicQueueOperatorEvidence | null {
  if (!log.workDate) {
    return null
  }

  return {
    operation: 'mechanical_work',
    recordedAt: log.workDate,
    summary: `Lavorazione ${log.workType} registrata come eseguita.`,
    notes: log.notes,
    operatorName: log.operatorName || undefined,
    metrics: {
      workType: log.workType,
      durationMinutes: log.durationMinutes ?? null,
      areaCoveredSqm: log.areaCoveredSqm ?? null,
      depthCm: log.depthCm ?? null,
      equipmentType: log.equipmentType ?? null,
      cost: log.cost ?? null,
    },
  }
}
