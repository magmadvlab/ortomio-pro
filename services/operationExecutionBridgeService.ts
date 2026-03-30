import type { FertilizerApplicationLogDB, GardenTask } from '../types'
import type { WateringLog } from '../types/microzoneTracking'
import type { NutritionTreatment } from '../types/nutrition'
import {
  createUnifiedOperationsService,
  type UnifiedOperationRequest,
  type UnifiedOperationResponse
} from './unifiedOperationsService'
import { appendSourceTaskReference } from './taskExecutionTraceService'

type LegacyWateringExecutionInput = Omit<WateringLog, 'id' | 'createdAt'> & {
  rowId?: string
}

const normalizeTimeFromTimestamp = (timestamp?: string, fallback = '12:00'): string => {
  if (!timestamp || typeof timestamp !== 'string') return fallback
  const [, timePart] = timestamp.split('T')
  if (!timePart) return fallback
  return timePart.slice(0, 5) || fallback
}

const buildWeatherConditions = (input: {
  condition?: string
  temperature?: number
  weatherConditions?: any
}) => {
  if (input.weatherConditions && typeof input.weatherConditions === 'object') {
    return input.weatherConditions
  }

  if (!input.condition && !Number.isFinite(input.temperature)) {
    return undefined
  }

  return {
    condition: input.condition,
    temp: Number.isFinite(input.temperature) ? input.temperature : undefined
  }
}

const resolveWateringTarget = (log: LegacyWateringExecutionInput) => {
  const gardenRowId = log.bedRowId || log.rowId
  if (gardenRowId) {
    return { gardenRowId }
  }

  if (log.fieldRowId) {
    return { fieldRowId: log.fieldRowId }
  }

  return null
}

const resolveFertilizerTarget = (
  task: GardenTask,
  log: Omit<FertilizerApplicationLogDB, 'id' | 'createdAt'>
) => {
  if (log.bedRowId) {
    return { gardenRowId: log.bedRowId }
  }

  if (log.fieldRowId) {
    return { fieldRowId: log.fieldRowId }
  }

  if (task.rowId) {
    return { gardenRowId: task.rowId }
  }

  return null
}

type FieldRowUnifiedExecutionInput = {
  gardenId: string
  fieldRowId?: string
  gardenRowId?: string
  plantIds?: string[]
  operationType: 'watering' | 'fertilizing' | 'treatment' | 'work'
  operationDate: string
  operationTime?: string
  quantity?: number
  unit?: string
  productName?: string
  durationMinutes?: number
  method?: string
  areaSqm?: number
  notes?: string
  sourceTaskId?: string
  propagateToPlants?: boolean
  sourceType?: UnifiedOperationRequest['sourceType']
  actorType?: UnifiedOperationRequest['actorType']
  deviceId?: string
  contextSnapshot?: UnifiedOperationRequest['contextSnapshot']
  weatherConditions?: UnifiedOperationRequest['weatherConditions']
  geoSnapshot?: UnifiedOperationRequest['geoSnapshot']
}

export async function executeFieldRowOperationThroughUnifiedService(
  storageProvider: any,
  input: FieldRowUnifiedExecutionInput
): Promise<UnifiedOperationResponse> {
  if (!input.gardenRowId && !input.fieldRowId && (!input.plantIds || input.plantIds.length === 0)) {
    throw new Error('Target spaziale mancante per l’operazione filare')
  }

  const unifiedOperationsService = createUnifiedOperationsService(storageProvider)
  const level: UnifiedOperationRequest['level'] =
    input.plantIds?.length ? 'plant' : 'row'

  const response = await unifiedOperationsService.executeUnifiedOperation({
    level,
    gardenId: input.gardenId,
    gardenRowId: input.gardenRowId,
    fieldRowId: input.fieldRowId,
    plantIds: input.plantIds,
    operationType: input.operationType,
    operationDate: input.operationDate,
    operationTime: input.operationTime,
    quantity: input.quantity,
    unit: input.unit,
    productName: input.productName,
    durationMinutes: input.durationMinutes,
    method: input.method,
    areaSqm: input.areaSqm,
    notes: input.notes,
    sourceTaskId: input.sourceTaskId,
    propagateToPlants: input.propagateToPlants,
    sourceType: input.sourceType || 'manual',
    actorType: input.actorType || 'manual',
    deviceId: input.deviceId,
    contextSnapshot: input.contextSnapshot,
    weatherConditions: input.weatherConditions,
    geoSnapshot: input.geoSnapshot
  })

  if (!response.success) {
    throw new Error((response.errors || ['Errore esecuzione operazione unificata']).join('\n'))
  }

  return response
}

export async function executeWateringLogThroughUnifiedService(
  storageProvider: any,
  log: LegacyWateringExecutionInput
) {
  const target = resolveWateringTarget(log)
  if (!target) {
    throw new Error(
      'Questa irrigazione non ha un filare associato. Registra l\'esecuzione da un filare specifico oppure collega la zona ai filari serviti.'
    )
  }

  const response = await executeFieldRowOperationThroughUnifiedService(storageProvider, {
    gardenId: log.gardenId,
    ...target,
    operationType: 'watering',
    operationDate: log.date,
    operationTime: normalizeTimeFromTimestamp(log.wateredAt),
    quantity: log.litersApplied,
    unit: 'L',
    durationMinutes: log.durationMinutes,
    method: log.method,
    notes: [log.notes, log.durationMinutes ? `Durata ${log.durationMinutes} min` : undefined]
      .filter(Boolean)
      .join(' | ') || undefined,
    sourceTaskId: log.taskId,
    weatherConditions: buildWeatherConditions({
      condition: log.weatherCondition,
      temperature: log.airTemperatureC
    }),
    propagateToPlants: true,
    sourceType: 'manual',
    actorType: 'manual'
  })

  return response
}

export async function executeTaskFertilizationThroughUnifiedService(
  storageProvider: any,
  task: GardenTask,
  log: Omit<FertilizerApplicationLogDB, 'id' | 'createdAt'>
) {
  const target = resolveFertilizerTarget(task, log)
  if (!target) {
    throw new Error(
      'Questo task non ha un target spaziale preciso. Registra la fertilizzazione dal filare o dalla pianta corretta per mantenere lo storico coerente.'
    )
  }

  const response = await executeFieldRowOperationThroughUnifiedService(storageProvider, {
    gardenId: log.gardenId,
    ...target,
    operationType: 'fertilizing',
    operationDate: log.applicationDate,
    quantity: log.dosageAmount,
    unit: log.dosageUnit,
    productName: log.fertilizerProductName,
    method: log.method,
    areaSqm: log.areaSqm || undefined,
    notes: [
      appendSourceTaskReference(log.notes || undefined, task.id),
      `Task sorgente: ${task.id}`,
      task.plantName ? `Pianta task: ${task.plantName}` : undefined
    ].filter(Boolean).join(' | ') || undefined,
    sourceTaskId: task.id,
    weatherConditions: buildWeatherConditions({
      weatherConditions: log.weatherConditions
    }),
    propagateToPlants: true,
    sourceType: 'manual',
    actorType: 'manual'
  })

  return response
}

export async function executeNutritionTreatmentThroughUnifiedService(
  storageProvider: any,
  treatment: NutritionTreatment
) {
  const unifiedOperationsService = createUnifiedOperationsService(storageProvider)

  const level: UnifiedOperationRequest['level'] =
    treatment.plantIds && treatment.plantIds.length > 0
      ? 'plant'
      : treatment.fieldRowId
        ? 'row'
        : 'garden'

  const response = await unifiedOperationsService.executeUnifiedOperation({
    level,
    gardenId: treatment.gardenId,
    fieldRowId: treatment.fieldRowId,
    plantIds: treatment.plantIds,
    operationType: treatment.treatmentType === 'fertilization' ? 'fertilizing' : 'treatment',
    operationDate: treatment.actualApplicationDate || treatment.scheduledDate,
    operationTime: treatment.applicationTime,
    quantity: treatment.dosage,
    unit: treatment.dosageUnit,
    productName: treatment.productName,
    durationMinutes: treatment.applicationDurationMinutes,
    method: treatment.applicationMethod,
    notes: [
      treatment.sourceTaskId
        ? appendSourceTaskReference(treatment.notes, treatment.sourceTaskId)
        : treatment.notes,
      `Nutrition treatment source: ${treatment.id}`,
      treatment.operatorName ? `Operatore: ${treatment.operatorName}` : undefined
    ].filter(Boolean).join(' | ') || undefined,
    sourceTaskId: treatment.sourceTaskId,
    weatherConditions: treatment.weatherConditions
      ? {
          condition: treatment.weatherConditions.conditions,
          temperature: treatment.weatherConditions.temperatureCelsius,
          humidity: treatment.weatherConditions.humidityPercentage,
          windSpeed: treatment.weatherConditions.windSpeedKmh,
          rainfall: treatment.weatherConditions.rainfall24h,
          pressure: treatment.weatherConditions.pressure
        }
      : undefined,
    propagateToPlants: true,
    sourceType: 'manual',
    actorType: 'manual'
  })

  if (!response.success) {
    throw new Error((response.errors || ['Errore registrazione operazione nutrizione']).join('\n'))
  }

  return response
}
