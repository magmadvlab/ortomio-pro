/**
 * Integrated Field Operations Service
 * Sistema completo per operazioni integrate: ORTO → FILARI → PIANTE → OPERAZIONI
 */

import { GardenPlant } from '@/types/individualPlant'
import { Garden } from '@/types'

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
    
    // Trattamento
    treatmentType?: string
    productName?: string
    concentration?: number // %
    applicationMethod?: 'spray' | 'soil' | 'systemic'
    
    // Lavorazione
    cultivationType?: 'weeding' | 'hoeing' | 'mulching' | 'pruning'
    
    // Raccolta
    expectedYield?: number // kg
    qualityGrade?: 'A' | 'B' | 'C'
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
    plants: GardenPlant[]
  ): Promise<IntegratedOperationResult> {
    
    try {
      const operationsCreated: string[] = []
      let totalPlantsAffected = 0
      let totalAmount = 0
      
      // Per ogni filare selezionato
      for (const fieldRowId of request.fieldRowIds) {
        const fieldRow = fieldRows.find(fr => fr.id === fieldRowId)
        if (!fieldRow) continue
        
        // Trova piante nel filare
        const fieldRowPlants = plants.filter(p => p.fieldRowId === fieldRowId)
        
        // Determina piante da trattare
        let targetPlants: GardenPlant[] = []
        if (request.plantApplication.applyToAllPlants) {
          targetPlants = fieldRowPlants
        } else if (request.plantApplication.specificPlantIds) {
          targetPlants = fieldRowPlants.filter(p => 
            request.plantApplication.specificPlantIds!.includes(p.id)
          )
        } else if (request.plantApplication.plantPositions) {
          targetPlants = fieldRowPlants.filter(p => 
            request.plantApplication.plantPositions!.includes(p.positionInRow || 0)
          )
        }
        
        if (targetPlants.length === 0) continue
        
        // Calcola quantità per questo filare
        const operationAmount = this.calculateOperationAmount(
          request.operationType,
          request.config,
          targetPlants.length,
          fieldRow
        )
        
        // Crea operazione per il filare
        const operation: FieldRowOperation = {
          id: `op_${Date.now()}_${fieldRowId}`,
          fieldRowId,
          operationType: request.operationType,
          scheduledDate: request.scheduledDate,
          status: 'scheduled',
          config: {
            ...request.config,
            totalDosage: operationAmount
          },
          plantApplication: {
            applyToAllPlants: request.plantApplication.applyToAllPlants,
            specificPlantIds: targetPlants.map(p => p.id),
            plantPositions: targetPlants.map(p => p.positionInRow || 0)
          },
          createdAt: new Date().toISOString()
        }
        
        operationsCreated.push(operation.id)
        totalPlantsAffected += targetPlants.length
        totalAmount += operationAmount
        
        // Registra operazione su ogni pianta individuale
        for (const plant of targetPlants) {
          await this.registerPlantOperation(plant, operation, request)
        }
      }
      
      return {
        success: true,
        operationsCreated: operationsCreated.length,
        plantsAffected: totalPlantsAffected,
        fieldRowsAffected: request.fieldRowIds.length,
        totalAmount,
        operationIds: operationsCreated
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
        const flowRate = fieldRow.irrigationConfig.totalFlowRate || 10 // L/h
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
  
  /**
   * Registra operazione su pianta individuale
   */
  private async registerPlantOperation(
    plant: GardenPlant,
    fieldRowOperation: FieldRowOperation,
    request: IntegratedOperationRequest
  ): Promise<void> {
    
    const plantOperation = {
      id: `plant_op_${Date.now()}_${plant.id}`,
      type: fieldRowOperation.operationType,
      date: fieldRowOperation.scheduledDate,
      fieldRowOperationId: fieldRowOperation.id,
      notes: `${this.getOperationDescription(fieldRowOperation)} - Filare: ${plant.fieldRowName}`,
      operatorId: 'system',
      success: true,
      config: fieldRowOperation.config
    }
    
    // Aggiorna pianta con nuova operazione
    if (!plant.operations) plant.operations = []
    plant.operations.push(plantOperation)
    plant.updatedAt = new Date().toISOString()
    
    console.log(`✅ Operazione registrata su ${plant.plantCode}:`, plantOperation)
  }
  
  /**
   * Genera descrizione operazione
   */
  private getOperationDescription(operation: FieldRowOperation): string {
    switch (operation.operationType) {
      case 'irrigation':
        return `Irrigazione ${operation.config.duration}min (${operation.config.waterAmount}L)`
      case 'fertilization':
        return `Fertilizzazione ${operation.config.fertilizerType} (${operation.config.dosagePerPlant}g/pianta)`
      case 'treatment':
        return `Trattamento ${operation.config.productName} (${operation.config.concentration}%)`
      case 'cultivation':
        return `Lavorazione ${operation.config.cultivationType}`
      case 'harvest':
        return `Raccolta (${operation.config.expectedYield}kg stimati)`
      default:
        return 'Operazione'
    }
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