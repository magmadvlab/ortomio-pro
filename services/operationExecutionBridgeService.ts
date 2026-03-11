import type { FertilizerApplicationLogDB, GardenTask } from '../types'
import type { WateringLog } from '../types/microzoneTracking'
import { createUnifiedOperationsService } from './unifiedOperationsService'

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

  const unifiedOperationsService = createUnifiedOperationsService(storageProvider)
  const response = await unifiedOperationsService.executeUnifiedOperation({
    level: 'row',
    gardenId: log.gardenId,
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
    weatherConditions: buildWeatherConditions({
      condition: log.weatherCondition,
      temperature: log.airTemperatureC
    }),
    propagateToPlants: true,
    sourceType: 'manual',
    actorType: 'manual',
    ...target
  })

  if (!response.success) {
    throw new Error((response.errors || ['Errore esecuzione irrigazione']).join('\n'))
  }

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

  const unifiedOperationsService = createUnifiedOperationsService(storageProvider)
  const response = await unifiedOperationsService.executeUnifiedOperation({
    level: 'row',
    gardenId: log.gardenId,
    operationType: 'fertilizing',
    operationDate: log.applicationDate,
    quantity: log.dosageAmount,
    unit: log.dosageUnit,
    productName: log.fertilizerProductName,
    method: log.method,
    areaSqm: log.areaSqm || undefined,
    notes: [
      log.notes || undefined,
      `Task sorgente: ${task.id}`,
      task.plantName ? `Pianta task: ${task.plantName}` : undefined
    ].filter(Boolean).join(' | ') || undefined,
    weatherConditions: buildWeatherConditions({
      weatherConditions: log.weatherConditions
    }),
    propagateToPlants: true,
    sourceType: 'manual',
    actorType: 'manual',
    ...target
  })

  if (!response.success) {
    throw new Error((response.errors || ['Errore esecuzione fertilizzazione']).join('\n'))
  }

  return response
}
