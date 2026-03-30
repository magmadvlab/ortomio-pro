/**
 * Integrated Field Operations Service
 * Sistema completo per operazioni integrate: ORTO → FILARI → PIANTE → OPERAZIONI
 */

import { GardenPlant, PlantOperation } from '@/types/individualPlant'
import { createUnifiedOperationsService } from '@/services/unifiedOperationsService'

export interface FieldRowConfiguration {
  id: string
  gardenId: string
  name: string
  rowNumber: number
  lengthMeters: number
  distanceFromPreviousRow: number
  cultivar?: string
  plantSpacing: number // cm - Distanza tra piante
  plantedDate?: string
  orientation?: 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'
  
  // Configurazione irrigazione integrata
  irrigationConfig: {
    enabled: boolean
    irrigationType: 'drip' | 'sprinkler' | 'micro_sprinkler' | 'manual'
    tubeLength: number
    tubeDiameter: number // mm
    emitterSpacing: number // cm
    emitterFlowRate: number // L/h per gocciolatore
    flowRatePerMeter: number // L/h per metro
    totalFlowRate: number // L/h totale
    pressure: number // bar
    schedule: {
      frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly'
      times: string[]
      duration: number // minuti
    }
  }
  
  // Stato piante nel filare
  plantStatus: {
    totalPlants: number
    healthyPlants: number
    diseasedPlants: number
    harvestedPlants: number
    avgHealthScore: number
  }
  
  // Operazioni programmate
  scheduledOperations: FieldRowOperation[]
  
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FieldRowOperation {
  id: string
  fieldRowId: string
  operationType: 'irrigation' | 'fertilization' | 'treatment' | 'cultivation' | 'harvest'
  scheduledDate: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  
  // Configurazione operazione
  config: {
    // Irrigazione
    duration?: number // minuti
    waterAmount?: number // litri
    
    // Fertilizzazione
    fertilizerType?: string
    dosagePerPlant?: number // grammi per pianta
    totalDosage?: number // grammi totali
    fertilizerMethod?: 'soil' | 'foliar' | 'fertigation'
    
    // Trattamento
    treatmentType?: string
    productName?: string
    activeIngredient?: string
    concentration?: number // %
    applicationMethod?: 'spray' | 'soil' | 'systemic' | 'foliar' | 'fertigation'
    
    // Lavorazione
    cultivationType?: 'weeding' | 'hoeing' | 'mulching' | 'pruning'
    tools?: string
    
    // Raccolta
    expectedYield?: number // kg
    qualityGrade?: 'A' | 'B' | 'C'
    qualityScore?: number // 0-100
  }
  
  // Applicazione alle piante
  plantApplication: {
    applyToAllPlants: boolean
    specificPlantIds?: string[]
    plantPositions?: number[] // Posizioni nel filare
  }
  
  // Risultati
  results?: {
    plantsAffected: number
    actualAmount: number
    duration: number
    notes: string
    photos?: string[]
  }
  
  createdAt: string
  executedAt?: string
  operatorId?: string
}

export interface IntegratedOperationRequest {
  gardenId: string
  fieldRowIds: string[]
  operationType: 'irrigation' | 'fertilization' | 'treatment' | 'cultivation' | 'harvest'
  scheduledDate: string
  config: FieldRowOperation['config']
  plantApplication: FieldRowOperation['plantApplication']
  notes?: string
  sourceType?: 'manual' | 'iot' | 'orchestrator_auto' | 'orchestrator_sync'
  actorType?: 'manual' | 'iot' | 'orchestrator'
  deviceId?: string
  contextSnapshot?: PlantOperation['context']
  weatherConditions?: PlantOperation['weatherConditions']
  geoSnapshot?: PlantOperation['geoSnapshot']
}

export interface IntegratedOperationResult {
  success: boolean
  operationsCreated: number
  plantsAffected: number
  fieldRowsAffected: number
  totalAmount: number // Quantità totale applicata
  estimatedCost?: number
  errors?: string[]
  operationIds: string[]
}

/**
 * Servizio per operazioni integrate su filari e piante
 */
export class IntegratedFieldOperationsService {
  
  /**
   * Calcola configurazione automatica per un filare
   */
  calculateFieldRowConfiguration(
    lengthMeters: number,
    plantSpacing: number,
    irrigationType: 'drip' | 'sprinkler' | 'micro_sprinkler' | 'manual'
  ): Partial<FieldRowConfiguration['irrigationConfig']> {
    
    const totalPlants = Math.floor((lengthMeters * 100) / plantSpacing)
    
    if (irrigationType === 'drip') {
      const emitterSpacing = 30 // cm standard
      const emittersCount = Math.ceil(lengthMeters * 100 / emitterSpacing)
      const emitterFlowRate = 2.0 // L/h standard
      const totalFlowRate = emittersCount * emitterFlowRate
      const flowRatePerMeter = totalFlowRate / lengthMeters
      
      return {
        tubeLength: lengthMeters,
        emitterSpacing,
        emitterFlowRate,
        flowRatePerMeter: Math.round(flowRatePerMeter * 100) / 100,
        totalFlowRate: Math.round(totalFlowRate * 100) / 100
      }
    }
    
    if (irrigationType === 'sprinkler') {
      const sprinklersCount = Math.ceil(lengthMeters / 6) // Ogni 6m
      const sprinklerFlowRate = 15 // L/h per sprinkler
      const totalFlowRate = sprinklersCount * sprinklerFlowRate
      
      return {
        tubeLength: lengthMeters,
        emitterSpacing: 600, // 6m tra sprinkler
        emitterFlowRate: sprinklerFlowRate,
        flowRatePerMeter: Math.round((totalFlowRate / lengthMeters) * 100) / 100,
        totalFlowRate
      }
    }
    
    return {
      tubeLength: lengthMeters,
      emitterSpacing: 0,
      emitterFlowRate: 0,
      flowRatePerMeter: 0,
      totalFlowRate: 0
    }
  }
  
  /**
   * Crea operazione integrata su filari e piante
   */
  async createIntegratedOperation(
    request: IntegratedOperationRequest,
    fieldRows: FieldRowConfiguration[],
    plants: GardenPlant[],
    storageProvider?: any
  ): Promise<IntegratedOperationResult> {
    if (!storageProvider) {
      return {
        success: false,
        operationsCreated: 0,
        plantsAffected: 0,
        fieldRowsAffected: 0,
        totalAmount: 0,
        errors: ['Storage provider richiesto: il circuito legacy in memoria è stato dismesso'],
        operationIds: []
      }
    }

    return this.createPersistedIntegratedOperation(request, fieldRows, plants, storageProvider)
  }
  
  /**
   * Calcola quantità necessaria per l'operazione
   */
  private calculateOperationAmount(
    operationType: string,
    config: FieldRowOperation['config'],
    plantCount: number,
    fieldRow: FieldRowConfiguration
  ): number {
    
    switch (operationType) {
      case 'irrigation':
        // Calcola litri necessari
        const duration = config.duration || 30 // minuti
        const flowRate = this.getFieldRowFlowRateLph(fieldRow) || 10 // L/h
        return Math.round((flowRate * duration / 60) * 100) / 100
        
      case 'fertilization':
        // Calcola grammi totali
        const dosagePerPlant = config.dosagePerPlant || 50 // grammi
        return dosagePerPlant * plantCount
        
      case 'treatment':
        // Calcola litri soluzione
        const solutionPerPlant = 0.5 // litri per pianta
        return Math.round(solutionPerPlant * plantCount * 100) / 100
        
      default:
        return 0
    }
  }

  private async createPersistedIntegratedOperation(
    request: IntegratedOperationRequest,
    fieldRows: FieldRowConfiguration[],
    plants: GardenPlant[],
    storageProvider: any
  ): Promise<IntegratedOperationResult> {
    try {
      const unifiedOperationsService = createUnifiedOperationsService(storageProvider)
      const operationIds: string[] = []
      const rowIdsAffected = new Set<string>()
      const errors: string[] = []
      let operationsCreated = 0
      let plantsAffected = 0
      let totalAmount = 0

      for (const fieldRowId of request.fieldRowIds) {
        const fieldRow = fieldRows.find(fr => fr.id === fieldRowId)
        if (!fieldRow) {
          errors.push(`Filare ${fieldRowId} non trovato`)
          continue
        }

        const fieldRowPlants = plants.filter(p => p.fieldRowId === fieldRowId)
        const targetPlants = this.getTargetPlantsForRow(fieldRowId, plants, request.plantApplication)
        if (targetPlants.length === 0) continue

        const operationAmount = this.calculateOperationAmount(
          request.operationType,
          request.config,
          targetPlants.length,
          fieldRow
        )
        const unifiedOperationType = this.mapToUnifiedOperationType(request.operationType)
        if (!unifiedOperationType) {
          errors.push(`Tipo operazione ${request.operationType} non supportato dal ledger unificato`)
          continue
        }

        const { operationDate, operationTime } = this.parseScheduledDateTime(request.scheduledDate)
        const applyToEntireRow = request.plantApplication.applyToAllPlants || targetPlants.length === fieldRowPlants.length
        const baseRequest = {
          gardenId: request.gardenId,
          operationType: unifiedOperationType,
          operationDate,
          operationTime,
          quantity: applyToEntireRow
            ? operationAmount
            : this.roundTo3(operationAmount / Math.max(targetPlants.length, 1)),
          unit: this.getOperationUnit(request.operationType, request.config),
          productName: this.getOperationProductName(request.operationType, request.config),
          notes: this.composeOperationNotes(request, fieldRow),
          propagateToPlants: applyToEntireRow,
          sourceType: request.sourceType || 'manual',
          actorType: request.actorType || 'manual',
          deviceId: request.deviceId,
          contextSnapshot: request.contextSnapshot,
          weatherConditions: request.weatherConditions,
          geoSnapshot: request.geoSnapshot
        }

        const response = applyToEntireRow
          ? await unifiedOperationsService.executeUnifiedOperation({
              ...baseRequest,
              level: 'row',
              fieldRowId
            })
          : await unifiedOperationsService.executeUnifiedOperation({
              ...baseRequest,
              level: 'plant',
              plantIds: targetPlants.map(plant => plant.id)
            })

        if (response.success) {
          operationsCreated += response.operationsCreated
          plantsAffected += unifiedOperationType === 'work' && applyToEntireRow
            ? targetPlants.length
            : response.plantsAffected
          totalAmount += operationAmount
          rowIdsAffected.add(fieldRowId)
          operationIds.push(...response.rowOperationIds, ...response.plantOperationIds)
        }

        if (response.errors?.length) {
          errors.push(...response.errors)
        }
      }

      return {
        success: operationsCreated > 0,
        operationsCreated,
        plantsAffected,
        fieldRowsAffected: rowIdsAffected.size,
        totalAmount: this.roundTo2(totalAmount),
        errors: errors.length > 0 ? errors : undefined,
        operationIds
      }
    } catch (error) {
      return {
        success: false,
        operationsCreated: 0,
        plantsAffected: 0,
        fieldRowsAffected: 0,
        totalAmount: 0,
        errors: [error instanceof Error ? error.message : 'Errore sconosciuto'],
        operationIds: []
      }
    }
  }

  private getTargetPlantsForRow(
    fieldRowId: string,
    plants: GardenPlant[],
    plantApplication: FieldRowOperation['plantApplication']
  ): GardenPlant[] {
    const fieldRowPlants = plants.filter(p => p.fieldRowId === fieldRowId)
    if (plantApplication.applyToAllPlants) {
      return fieldRowPlants
    }
    if (plantApplication.specificPlantIds?.length) {
      return fieldRowPlants.filter(p => plantApplication.specificPlantIds!.includes(p.id))
    }
    if (plantApplication.plantPositions?.length) {
      return fieldRowPlants.filter(p => plantApplication.plantPositions!.includes(p.positionInRow || 0))
    }
    return []
  }

  private getFieldRowFlowRateLph(fieldRow: FieldRowConfiguration): number {
    const irrigation = fieldRow.irrigationConfig
    if (!irrigation?.enabled) return 0
    if (irrigation.totalFlowRate > 0) return irrigation.totalFlowRate
    if (irrigation.flowRatePerMeter > 0 && fieldRow.lengthMeters > 0) {
      return irrigation.flowRatePerMeter * fieldRow.lengthMeters
    }
    if (
      irrigation.irrigationType === 'drip' &&
      irrigation.emitterSpacing > 0 &&
      irrigation.emitterFlowRate > 0 &&
      fieldRow.lengthMeters > 0
    ) {
      const emitterCount = Math.floor((fieldRow.lengthMeters * 100) / irrigation.emitterSpacing)
      return emitterCount * irrigation.emitterFlowRate
    }
    return 0
  }

  private mapToUnifiedOperationType(
    operationType: IntegratedOperationRequest['operationType']
  ): 'watering' | 'fertilizing' | 'treatment' | 'work' | null {
    if (operationType === 'irrigation') return 'watering'
    if (operationType === 'fertilization') return 'fertilizing'
    if (operationType === 'treatment') return 'treatment'
    if (operationType === 'cultivation') return 'work'
    return null
  }

  private getOperationUnit(
    operationType: IntegratedOperationRequest['operationType'],
    config: FieldRowOperation['config']
  ): string {
    if (operationType === 'irrigation') return 'L'
    if (operationType === 'fertilization') return 'g'
    if (operationType === 'treatment') return 'L'
    if (operationType === 'cultivation') return config.tools ? 'sessione' : 'sessione'
    return 'unit'
  }

  private getOperationProductName(
    operationType: IntegratedOperationRequest['operationType'],
    config: FieldRowOperation['config']
  ): string | undefined {
    if (operationType === 'fertilization') return config.fertilizerType || 'Fertilizzazione'
    if (operationType === 'treatment') return config.productName || 'Trattamento'
    if (operationType === 'cultivation') return config.cultivationType || 'Lavorazione'
    return undefined
  }

  private composeOperationNotes(
    request: IntegratedOperationRequest,
    fieldRow: FieldRowConfiguration
  ): string | undefined {
    const details: string[] = [`Filare: ${fieldRow.name}`]

    if (request.operationType === 'irrigation' && request.config.duration) {
      details.push(`Durata: ${request.config.duration} min`)
    }

    if (request.operationType === 'fertilization') {
      if (request.config.dosagePerPlant !== undefined) {
        details.push(`Dose/pianta: ${request.config.dosagePerPlant} g`)
      }
      if (request.config.fertilizerMethod) {
        details.push(`Metodo: ${request.config.fertilizerMethod}`)
      }
    }

    if (request.operationType === 'treatment') {
      if (request.config.treatmentType) details.push(`Tipo: ${request.config.treatmentType}`)
      if (request.config.activeIngredient) details.push(`Principio attivo: ${request.config.activeIngredient}`)
      if (request.config.concentration !== undefined) details.push(`Concentrazione: ${request.config.concentration}%`)
      if (request.config.applicationMethod) details.push(`Applicazione: ${request.config.applicationMethod}`)
    }

    if (request.operationType === 'cultivation') {
      if (request.config.cultivationType) details.push(`Lavorazione: ${request.config.cultivationType}`)
      if (request.config.tools) details.push(`Attrezzi: ${request.config.tools}`)
    }

    const detailText = details.join(' | ')
    return request.notes?.trim()
      ? `${request.notes.trim()}\n\n${detailText}`
      : detailText
  }

  private parseScheduledDateTime(scheduledDate: string): { operationDate: string; operationTime?: string } {
    if (scheduledDate.includes('T')) {
      const [operationDate, rawTime] = scheduledDate.split('T')
      return {
        operationDate,
        operationTime: rawTime?.slice(0, 5) || undefined
      }
    }

    return {
      operationDate: scheduledDate,
      operationTime: '12:00'
    }
  }

  private roundTo2(value: number): number {
    return Math.round(value * 100) / 100
  }

  private roundTo3(value: number): number {
    return Math.round(value * 1000) / 1000
  }
  
  /**
   * Esegue operazione programmata
   */
  async executeScheduledOperation(
    operationId: string,
    fieldRow: FieldRowConfiguration,
    plants: GardenPlant[]
  ): Promise<IntegratedOperationResult> {
    
    const operation = fieldRow.scheduledOperations.find(op => op.id === operationId)
    if (!operation) {
      return {
        success: false,
        operationsCreated: 0,
        plantsAffected: 0,
        fieldRowsAffected: 0,
        totalAmount: 0,
        errors: ['Operazione non trovata'],
        operationIds: []
      }
    }
    
    // Aggiorna stato operazione
    operation.status = 'completed'
    operation.executedAt = new Date().toISOString()
    
    // Registra risultati
    const targetPlants = plants.filter(p => 
      operation.plantApplication.specificPlantIds?.includes(p.id)
    )
    
    operation.results = {
      plantsAffected: targetPlants.length,
      actualAmount: operation.config.totalDosage || 0,
      duration: operation.config.duration || 0,
      notes: `Operazione completata su ${targetPlants.length} piante`
    }
    
    return {
      success: true,
      operationsCreated: 1,
      plantsAffected: targetPlants.length,
      fieldRowsAffected: 1,
      totalAmount: operation.config.totalDosage || 0,
      operationIds: [operationId]
    }
  }
  
  /**
   * Ottieni statistiche filare
   */
  getFieldRowStatistics(
    fieldRow: FieldRowConfiguration,
    plants: GardenPlant[]
  ): FieldRowConfiguration['plantStatus'] {
    
    const fieldRowPlants = plants.filter(p => p.fieldRowId === fieldRow.id)
    
    const healthyPlants = fieldRowPlants.filter(p => p.status === 'healthy').length
    const diseasedPlants = fieldRowPlants.filter(p => p.status === 'diseased').length
    const harvestedPlants = fieldRowPlants.filter(p => p.status === 'harvested').length
    
    const avgHealthScore = fieldRowPlants.length > 0
      ? Math.round(fieldRowPlants.reduce((sum, p) => sum + p.healthScore, 0) / fieldRowPlants.length)
      : 0
    
    return {
      totalPlants: fieldRowPlants.length,
      healthyPlants,
      diseasedPlants,
      harvestedPlants,
      avgHealthScore
    }
  }
}

// Singleton instance
export const integratedFieldOperationsService = new IntegratedFieldOperationsService()
