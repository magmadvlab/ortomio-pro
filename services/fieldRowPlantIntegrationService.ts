/**
 * Field Row Plant Integration Service
 * Servizio per integrare i filari con il sistema di tracciamento piante individuali
 */

import { GardenPlant } from '@/types/individualPlant'

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
  // Legacy/snake_case compatibility
  garden_id?: string
  row_number?: number
  length_meters?: number
  plant_spacing?: number
  plant_count?: number
  planted_date?: string
}

export interface PlantGenerationConfig {
  fieldRowId: string
  rowNumber?: number
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
  const safeSpacing = config.plantSpacing > 0 ? config.plantSpacing : 50
  const safeRowLength = config.rowLength > 0 ? config.rowLength : 1
  const rowLengthCm = safeRowLength * 100
  const maxPlants = Math.max(1, Math.floor(rowLengthCm / safeSpacing))
  
  // Genera codici pianta (es. F1-P001, F1-P002, etc.)
  const rowNumber = config.rowNumber && config.rowNumber > 0
    ? config.rowNumber
    : extractRowNumber(config.fieldRowId)
  
  // Genera contesto di impianto di default
  const plantingDate = new Date(config.plantingDate);
  const defaultContext = generateDefaultPlantingContext(plantingDate);
  
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
      plantedDate: config.plantingDate,
      plantingContext: defaultContext, // Aggiungi contesto
      source: 'seed', // Default: da seme
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

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function extractRowNumber(rowIdentifier: string): number {
  const match = rowIdentifier.match(/(\d+)/g)
  if (!match || match.length === 0) return 1
  const parsed = Number(match[match.length - 1])
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function normalizeFieldRow(rawRow: any): FieldRow {
  const rowNumber = toNumber(rawRow.rowNumber ?? rawRow.row_number) || extractRowNumber(rawRow.name || rawRow.id || '1')
  const lengthMeters = toNumber(rawRow.lengthMeters ?? rawRow.length_meters) || 0
  const plantSpacing = toNumber(rawRow.plantSpacing ?? rawRow.plant_spacing)
  const plantCount = toNumber(rawRow.plantCount ?? rawRow.plant_count)

  return {
    id: rawRow.id || `row_${rowNumber}`,
    gardenId: rawRow.gardenId ?? rawRow.garden_id ?? '',
    name: rawRow.name || `Filare ${rowNumber}`,
    rowNumber,
    lengthMeters,
    distanceFromPreviousRow: toNumber(rawRow.distanceFromPreviousRow ?? rawRow.distance_from_previous_row),
    cultivar: rawRow.cultivar || undefined,
    plantSpacing,
    plantedDate: rawRow.plantedDate ?? rawRow.planted_date ?? undefined,
    orientation: rawRow.orientation ?? undefined,
    isActive: rawRow.isActive ?? true,
    plantCount,
    garden_id: rawRow.garden_id,
    row_number: toNumber(rawRow.row_number),
    length_meters: toNumber(rawRow.length_meters),
    plant_spacing: toNumber(rawRow.plant_spacing),
    plant_count: toNumber(rawRow.plant_count),
    planted_date: rawRow.planted_date
  }
}

/**
 * Genera un contesto di impianto di default basato sulla data
 */
function generateDefaultPlantingContext(plantingDate: Date): any {
  const month = plantingDate.getMonth();
  
  // Determina stagione
  let season = 'spring';
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'autumn';
  else season = 'winter';
  
  // Temperatura media per stagione
  const tempByseason = {
    spring: 18,
    summer: 28,
    autumn: 15,
    winter: 8
  };
  
  // Fase lunare approssimativa (basata sul giorno del mese)
  const dayOfMonth = plantingDate.getDate();
  let moonPhase = 'Crescente';
  let moonEmoji = '🌒';
  let illumination = 50;
  
  if (dayOfMonth <= 7) {
    moonPhase = 'Crescente';
    moonEmoji = '🌒';
    illumination = 25;
  } else if (dayOfMonth <= 14) {
    moonPhase = 'Primo Quarto';
    moonEmoji = '🌓';
    illumination = 50;
  } else if (dayOfMonth <= 21) {
    moonPhase = 'Piena';
    moonEmoji = '🌕';
    illumination = 100;
  } else {
    moonPhase = 'Calante';
    moonEmoji = '🌘';
    illumination = 25;
  }
  
  // Ore di luce per stagione
  const daylightByseason = {
    spring: { hours: 13, sunrise: '06:30', sunset: '19:30' },
    summer: { hours: 15, sunrise: '05:30', sunset: '20:30' },
    autumn: { hours: 11, sunrise: '07:00', sunset: '18:00' },
    winter: { hours: 9, sunrise: '07:30', sunset: '16:30' }
  };
  
  return {
    weather: {
      temp: tempByseason[season as keyof typeof tempByseason],
      humidity: 65,
      condition: 'sunny'
    },
    moon: {
      phase: moonPhase,
      emoji: moonEmoji,
      illumination,
      waxing: dayOfMonth <= 14
    },
    season,
    daylight: daylightByseason[season as keyof typeof daylightByseason]
  };
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
  
  fieldRows.forEach((rawRow, rowIndex) => {
    const row = normalizeFieldRow(rawRow)
    if (!row.cultivar) return

    // Tolleranza dati incompleti: usa plantCount o fallback spacing standard
    const fallbackSpacing = 50
    const estimatedCountFromLegacy = row.plantCount && row.plantCount > 0 ? row.plantCount : undefined
    const normalizedSpacing = row.plantSpacing && row.plantSpacing > 0
      ? row.plantSpacing
      : (
          estimatedCountFromLegacy && row.lengthMeters > 0
            ? Math.max(10, Math.round((row.lengthMeters * 100) / estimatedCountFromLegacy))
            : fallbackSpacing
        )
    const estimatedPlants = estimatedCountFromLegacy || Math.max(1, Math.floor((Math.max(row.lengthMeters, 1) * 100) / normalizedSpacing))
    const normalizedRowLength = Math.max(
      row.lengthMeters || 0,
      (estimatedPlants * normalizedSpacing) / 100
    )

    const config: PlantGenerationConfig = {
      fieldRowId: row.id,
      rowNumber: row.rowNumber,
      plantName: row.cultivar.split(' ')[0] || 'Pianta',
      variety: row.cultivar.includes(' ') ? row.cultivar.split(' ').slice(1).join(' ') : undefined,
      plantingDate: row.plantedDate || new Date().toISOString().split('T')[0],
      plantSpacing: normalizedSpacing,
      rowLength: normalizedRowLength
    }
    
    const rowPlants = generatePlantsFromFieldRow(config, gardenId)
      .slice(0, estimatedPlants)
      .map(plant => ({
        ...plant,
        fieldRowName: row.name
      }))
    
    // Aggiungi variazione realistica alla salute
    rowPlants.forEach((plant, plantIndex) => {
      // Variazione deterministica: evita numeri casuali diversi a ogni refresh
      const pattern = (rowIndex * 37 + plantIndex * 13) % 100
      plant.healthScore = 70 + (pattern % 26)
      
      // Simula alcuni problemi occasionali
      if (pattern < 10) { // ~10%
        plant.status = 'diseased'
        plant.healthScore = 30 + (pattern % 40)
      }
      
      // Simula alcune piante raccolte
      if (pattern >= 10 && pattern < 15) { // ~5%
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
