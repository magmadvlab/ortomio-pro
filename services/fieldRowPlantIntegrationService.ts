/**
 * Field Row Plant Integration Service
 * Servizio per integrare i filari con il sistema di tracciamento piante individuali
 */

import { GardenPlant } from '@/types/individualPlant'
import { Garden } from '@/types'

export interface FieldRow {
  id: string
  gardenId: string
  name: string
  rowNumber: number
  lengthMeters: number
  distanceFromPreviousRow?: number
  cultivar?: string
  plantSpacing?: number
  plantedDate?: string
  orientation?: string
  isActive: boolean
  plantCount?: number
}

export interface PlantGenerationConfig {
  fieldRowId: string
  plantName: string
  variety?: string
  plantingDate: string
  plantSpacing: number // cm
  rowLength: number // meters
  startingPosition?: number // Default 1
}

/**
 * Genera piante individuali da un filare
 */
export function generatePlantsFromFieldRow(
  config: PlantGenerationConfig,
  gardenId: string
): GardenPlant[] {
  const plants: GardenPlant[] = []
  
  // Calcola numero di piante nel filare
  const rowLengthCm = config.rowLength * 100
  const maxPlants = Math.floor(rowLengthCm / config.plantSpacing)
  
  // Genera codici pianta (es. F1-P001, F1-P002, etc.)
  const rowNumber = config.fieldRowId.slice(-2) // Usa ultimi 2 caratteri come numero filare
  
  for (let i = 0; i < maxPlants; i++) {
    const positionInRow = (config.startingPosition || 1) + i
    const plantCode = `F${rowNumber}-P${positionInRow.toString().padStart(3, '0')}`
    
    const plant: GardenPlant = {
      id: `plant_${config.fieldRowId}_${positionInRow}`,
      gardenId,
      fieldRowId: config.fieldRowId,
      positionInRow,
      plantCode,
      plantName: config.plantName,
      variety: config.variety,
      plantingDate: config.plantingDate,
      status: 'healthy',
      healthScore: 85, // Salute iniziale buona
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    plants.push(plant)
  }
  
  return plants
}

/**
 * Calcola statistiche per un filare
 */
export function calculateFieldRowStats(
  fieldRow: FieldRow,
  plants: GardenPlant[]
): {
  totalPlants: number
  healthyPlants: number
  diseasedPlants: number
  avgHealthScore: number
  plantDensity: number // piante per metro
  estimatedYield?: number
} {
  const rowPlants = plants.filter(p => p.fieldRowId === fieldRow.id)
  
  const healthyCount = rowPlants.filter(p => p.status === 'healthy').length
  const diseasedCount = rowPlants.filter(p => p.status === 'diseased').length
  const avgHealth = rowPlants.length > 0 
    ? rowPlants.reduce((sum, p) => sum + p.healthScore, 0) / rowPlants.length 
    : 0
  
  return {
    totalPlants: rowPlants.length,
    healthyPlants: healthyCount,
    diseasedPlants: diseasedCount,
    avgHealthScore: Math.round(avgHealth),
    plantDensity: fieldRow.lengthMeters > 0 ? rowPlants.length / fieldRow.lengthMeters : 0,
    estimatedYield: estimateYieldFromPlants(rowPlants)
  }
}

/**
 * Stima la resa basata sulle piante
 */
function estimateYieldFromPlants(plants: GardenPlant[]): number {
  // Stima semplificata basata su salute e numero piante
  const avgHealth = plants.length > 0 
    ? plants.reduce((sum, p) => sum + p.healthScore, 0) / plants.length 
    : 0
  
  // Stima: ogni pianta sana produce circa 2kg, ridotto per salute
  const baseYieldPerPlant = 2 // kg
  const healthMultiplier = avgHealth / 100
  
  return Math.round(plants.length * baseYieldPerPlant * healthMultiplier * 100) / 100
}

/**
 * Crea mapping tra filari e piante per il SmartPlantManager
 */
export function createFieldRowPlantMapping(
  fieldRows: FieldRow[],
  plants: GardenPlant[]
): Array<{
  fieldRow: FieldRow
  plants: GardenPlant[]
  stats: ReturnType<typeof calculateFieldRowStats>
}> {
  return fieldRows.map(fieldRow => {
    const rowPlants = plants.filter(p => p.fieldRowId === fieldRow.id)
    const stats = calculateFieldRowStats(fieldRow, plants)
    
    return {
      fieldRow,
      plants: rowPlants,
      stats
    }
  })
}

/**
 * Genera piante demo per testing
 */
export function generateDemoPlants(
  fieldRows: FieldRow[],
  gardenId: string
): GardenPlant[] {
  const allPlants: GardenPlant[] = []
  
  fieldRows.forEach((row, rowIndex) => {
    if (!row.cultivar || !row.plantSpacing) return
    
    const config: PlantGenerationConfig = {
      fieldRowId: row.id,
      plantName: row.cultivar.split(' ')[0] || 'Pianta',
      variety: row.cultivar.includes(' ') ? row.cultivar.split(' ').slice(1).join(' ') : undefined,
      plantingDate: row.plantedDate || new Date().toISOString().split('T')[0],
      plantSpacing: row.plantSpacing,
      rowLength: row.lengthMeters
    }
    
    const rowPlants = generatePlantsFromFieldRow(config, gardenId)
    
    // Aggiungi variazione realistica alla salute
    rowPlants.forEach((plant, plantIndex) => {
      // Simula variazione naturale di salute (70-95%)
      plant.healthScore = Math.floor(70 + Math.random() * 25)
      
      // Simula alcuni problemi occasionali
      if (Math.random() < 0.1) { // 10% chance
        plant.status = 'diseased'
        plant.healthScore = Math.floor(30 + Math.random() * 40)
      }
      
      // Simula alcune piante raccolte
      if (Math.random() < 0.05) { // 5% chance
        plant.status = 'harvested'
        plant.healthScore = 0
      }
    })
    
    allPlants.push(...rowPlants)
  })
  
  return allPlants
}

/**
 * Servizio principale per l'integrazione
 */
export class FieldRowPlantIntegrationService {
  private plants: Map<string, GardenPlant[]> = new Map()
  
  /**
   * Inizializza piante per un orto basandosi sui filari
   */
  async initializePlantsFromFieldRows(
    gardenId: string,
    fieldRows: FieldRow[]
  ): Promise<GardenPlant[]> {
    const plants = generateDemoPlants(fieldRows, gardenId)
    this.plants.set(gardenId, plants)
    return plants
  }
  
  /**
   * Ottiene piante per un orto
   */
  getPlantsForGarden(gardenId: string): GardenPlant[] {
    return this.plants.get(gardenId) || []
  }
  
  /**
   * Ottiene piante per un filare specifico
   */
  getPlantsForFieldRow(fieldRowId: string): GardenPlant[] {
    const allPlants = Array.from(this.plants.values()).flat()
    return allPlants.filter(p => p.fieldRowId === fieldRowId)
  }
  
  /**
   * Aggiorna una pianta
   */
  updatePlant(plantId: string, updates: Partial<GardenPlant>): boolean {
    for (const [gardenId, plants] of this.plants.entries()) {
      const plantIndex = plants.findIndex(p => p.id === plantId)
      if (plantIndex !== -1) {
        plants[plantIndex] = { ...plants[plantIndex], ...updates, updatedAt: new Date().toISOString() }
        return true
      }
    }
    return false
  }
  
  /**
   * Ottiene statistiche per tutti i filari di un orto
   */
  getFieldRowsStats(gardenId: string, fieldRows: FieldRow[]): Array<{
    fieldRow: FieldRow
    stats: ReturnType<typeof calculateFieldRowStats>
  }> {
    const plants = this.getPlantsForGarden(gardenId)
    
    return fieldRows.map(fieldRow => ({
      fieldRow,
      stats: calculateFieldRowStats(fieldRow, plants)
    }))
  }
}

// Singleton instance
export const fieldRowPlantIntegrationService = new FieldRowPlantIntegrationService()