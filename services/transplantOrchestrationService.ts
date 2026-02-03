/**
 * Transplant Orchestration Service
 * Gestisce il trapianto dal vivaio all'orto con monitoraggio individuale
 */

import { GardenPlant } from '@/types/individualPlant'
import { SeedlingBatch } from '@/services/seedlingService'
import { Garden } from '@/types'

export interface TransplantOperation {
  id: string
  batchId: string
  gardenId: string
  fieldRowId: string
  transplantDate: string
  quantityToTransplant: number
  startingPosition: number
  plantSpacing: number // cm
  notes?: string
  status: 'planned' | 'in_progress' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
}

export interface TransplantResult {
  success: boolean
  plantsCreated: GardenPlant[]
  transplantOperation: TransplantOperation
  orchestratorActivated: boolean
  errors?: string[]
}

/**
 * Servizio per orchestrare il trapianto dal vivaio all'orto
 */
export class TransplantOrchestrationService {
  
  /**
   * Pianifica un trapianto dal vivaio a un filare specifico
   */
  async planTransplant(
    batch: SeedlingBatch,
    fieldRowId: string,
    gardenId: string,
    quantity: number,
    plantSpacing: number,
    startingPosition: number = 1
  ): Promise<TransplantOperation> {
    
    const operation: TransplantOperation = {
      id: `transplant_${Date.now()}`,
      batchId: batch.id,
      gardenId,
      fieldRowId,
      transplantDate: new Date().toISOString().split('T')[0],
      quantityToTransplant: Math.min(quantity, batch.survivingQuantity),
      startingPosition,
      plantSpacing,
      status: 'planned',
      createdAt: new Date().toISOString(),
      notes: `Trapianto ${batch.plantName} (${batch.variety || 'varietà standard'}) dal vivaio al filare`
    }
    
    return operation
  }
  
  /**
   * Esegue il trapianto creando piante individuali nell'orto
   */
  async executeTransplant(
    operation: TransplantOperation,
    batch: SeedlingBatch,
    fieldRow: any
  ): Promise<TransplantResult> {
    
    try {
      // 1. Crea piante individuali nell'orto
      const plantsCreated: GardenPlant[] = []
      
      for (let i = 0; i < operation.quantityToTransplant; i++) {
        const positionInRow = operation.startingPosition + i
        const plantCode = this.generatePlantCode(fieldRow, positionInRow)
        
        const plant: GardenPlant = {
          id: `plant_${operation.fieldRowId}_${positionInRow}`,
          gardenId: operation.gardenId,
          fieldRowId: operation.fieldRowId,
          fieldRowName: fieldRow.name,
          positionInRow,
          plantCode,
          plantName: batch.plantName,
          variety: batch.variety,
          plantingDate: operation.transplantDate,
          transplantDate: operation.transplantDate,
          sourceVivaio: {
            batchId: batch.id,
            originalSeedDate: batch.seedDate,
            vivaioPhase: batch.phase,
            transplantOperation: operation.id
          },
          status: 'healthy',
          healthScore: 85, // Salute iniziale buona post-trapianto
          stage: 'transplanted', // Nuova fase: appena trapiantato
          photos: [],
          operations: [{
            id: `op_transplant_${Date.now()}`,
            type: 'transplant',
            date: operation.transplantDate,
            notes: `Trapiantato dal vivaio - Batch: ${batch.id}`,
            operatorId: 'system',
            success: true
          }],
          orchestratorEnabled: true, // ATTIVA L'ORCHESTRATOR
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        plantsCreated.push(plant)
      }
      
      // 2. Aggiorna stato operazione
      const completedOperation: TransplantOperation = {
        ...operation,
        status: 'completed',
        completedAt: new Date().toISOString()
      }
      
      // 3. Attiva orchestrator per ogni pianta
      const orchestratorActivated = await this.activateOrchestrator(plantsCreated)
      
      return {
        success: true,
        plantsCreated,
        transplantOperation: completedOperation,
        orchestratorActivated,
      }
      
    } catch (error) {
      return {
        success: false,
        plantsCreated: [],
        transplantOperation: { ...operation, status: 'failed' },
        orchestratorActivated: false,
        errors: [error instanceof Error ? error.message : 'Errore sconosciuto']
      }
    }
  }
  
  /**
   * Genera codice pianta univoco
   */
  private generatePlantCode(fieldRow: any, position: number): string {
    const rowNumber = fieldRow.rowNumber || fieldRow.name.match(/\d+/)?.[0] || '01'
    return `F${rowNumber.padStart(2, '0')}-P${position.toString().padStart(3, '0')}`
  }
  
  /**
   * Attiva l'orchestrator per le piante trapiantate
   */
  private async activateOrchestrator(plants: GardenPlant[]): Promise<boolean> {
    try {
      // Per ogni pianta, crea il piano di monitoraggio orchestrato
      for (const plant of plants) {
        await this.createOrchestrationPlan(plant)
      }
      return true
    } catch (error) {
      console.error('Errore attivazione orchestrator:', error)
      return false
    }
  }
  
  /**
   * Crea piano di orchestrazione per una pianta
   */
  private async createOrchestrationPlan(plant: GardenPlant): Promise<void> {
    // Piano orchestrato per fasi di crescita
    const orchestrationPlan = {
      plantId: plant.id,
      phases: [
        {
          name: 'post_transplant',
          duration: 7, // giorni
          monitoring: ['stress_idrico', 'attecchimento', 'crescita_fogliare'],
          actions: ['irrigazione_frequente', 'ombreggiatura_se_necessario']
        },
        {
          name: 'vegetative_growth',
          duration: 21,
          monitoring: ['altezza', 'numero_foglie', 'salute_generale'],
          actions: ['fertilizzazione_azotata', 'potatura_formazione']
        },
        {
          name: 'flowering',
          duration: 14,
          monitoring: ['fioritura', 'impollinazione', 'allegagione'],
          actions: ['fertilizzazione_fosforo_potassio', 'supporti_se_necessario']
        },
        {
          name: 'fruiting',
          duration: 30,
          monitoring: ['sviluppo_frutti', 'maturazione', 'parassiti'],
          actions: ['irrigazione_controllata', 'raccolta_programmata']
        }
      ],
      currentPhase: 'post_transplant',
      startDate: plant.transplantDate || plant.plantingDate,
      orchestratorActive: true
    }
    
    // Salva il piano (implementazione storage specifica)
    console.log(`🤖 Orchestrator attivato per ${plant.plantCode}:`, orchestrationPlan)
  }
  
  /**
   * Aggiorna batch vivaio dopo trapianto
   */
  async updateVivaioAfterTransplant(
    batchId: string,
    quantityTransplanted: number
  ): Promise<void> {
    // Riduce la quantità disponibile nel vivaio
    // Aggiorna stato batch se completamente trapiantato
    console.log(`📦 Vivaio aggiornato: -${quantityTransplanted} piantine dal batch ${batchId}`)
  }
}

// Singleton instance
export const transplantOrchestrationService = new TransplantOrchestrationService()