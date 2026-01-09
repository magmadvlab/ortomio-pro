/**
 * Service per gestione completa lavorazioni meccaniche
 * Allineato a irrigationService e fertilizationService
 * Traccia: DOVE (zone/file), COSA (tipo), QUANDO (date), COME (attrezzatura)
 */

import { Garden } from '../types'
import { WorkType, EquipmentType } from '../logic/mechanicalWorkEngine'

// ============================================
// TYPES
// ============================================

export interface MechanicalWorkLog {
  id?: string
  gardenId: string

  // COSA (What)
  workType: WorkType
  description?: string

  // DOVE (Where)
  zoneId?: string
  rowIds?: string[] // File specifici
  bedIds?: string[] // Aiuole
  areaCoveredSqm?: number

  // QUANDO (When)
  workDate: string // Data effettiva lavorazione (ISO)
  scheduledDate?: string // Data pianificata (se riprogrammato)

  // COME (How)
  equipmentType: EquipmentType
  equipmentAttachment?: string // es. "Aratro a versoio" se equipmentType = 'Tractor'
  depthCm?: number
  durationMinutes?: number

  // CHI (Who)
  operatorName?: string

  // COSTO
  cost?: number // Euro

  // METEO
  weatherConditions?: {
    temperature?: number
    rainMm?: number
    soilMoisture?: 'dry' | 'optimal' | 'wet'
  }

  // METADATA
  photos?: string[]
  notes?: string
  completed: boolean
  workMetadata?: Record<string, any> // JSONB per dati extra

  createdAt?: string
  updatedAt?: string
}

export interface MechanicalWorkSequence {
  id?: string
  name: string
  description?: string
  gardenType?: string
  season?: 'Spring' | 'Summer' | 'Autumn' | 'Winter'
  steps: MechanicalWorkStep[]
}

export interface MechanicalWorkStep {
  order: number
  workType: WorkType
  name: string
  timing: string
  instructions: string[]
  depthCm?: number
  equipment?: EquipmentType
}

export interface MechanicalWorkStats {
  totalWorks: number
  totalAreaWorked: number
  totalCost: number
  totalHours: number
  workTypeBreakdown: Record<WorkType, number>
  mostCommonWork: WorkType
  busiestMonth: number
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Crea nuovo log lavorazione meccanica
 */
export async function createMechanicalWorkLog(
  log: MechanicalWorkLog
): Promise<MechanicalWorkLog> {
  // Validazioni
  if (!log.gardenId) {
    throw new Error('gardenId è obbligatorio')
  }
  if (!log.workType) {
    throw new Error('workType è obbligatorio')
  }
  if (!log.workDate) {
    throw new Error('workDate è obbligatoria')
  }
  if (!log.equipmentType) {
    throw new Error('equipmentType è obbligatorio')
  }

  // Per ora mock - implementazione reale in SupabaseStorageProvider
  return {
    ...log,
    id: `mech-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Recupera storico lavorazioni per giardino
 */
export async function getMechanicalWorkLogs(
  gardenId: string,
  filters?: {
    workType?: WorkType
    startDate?: string
    endDate?: string
    zoneId?: string
    completed?: boolean
  }
): Promise<MechanicalWorkLog[]> {
  // Mock - implementazione reale in StorageProvider
  return []
}

/**
 * Aggiorna log lavorazione
 */
export async function updateMechanicalWorkLog(
  id: string,
  updates: Partial<MechanicalWorkLog>
): Promise<MechanicalWorkLog> {
  // Mock
  return { ...updates, id } as MechanicalWorkLog
}

/**
 * Elimina log lavorazione
 */
export async function deleteMechanicalWorkLog(id: string): Promise<void> {
  // Mock
}

// ============================================
// SEQUENCE OPERATIONS
// ============================================

/**
 * Recupera sequenze standard disponibili
 */
export async function getMechanicalWorkSequences(filters?: {
  gardenType?: string
  season?: string
}): Promise<MechanicalWorkSequence[]> {
  // Mock - ritorna sequenze pre-definite dal database
  return [
    {
      id: 'seq-1',
      name: 'Preparazione Orto Estivo Completa',
      description: 'Sequenza completa per preparare orto per colture estive',
      gardenType: 'OpenField',
      season: 'Winter',
      steps: [
        {
          order: 1,
          workType: 'Plowing', // Nota: dovrebbe essere 'Fertilize' ma non è WorkType
          name: 'Concimazione di fondo',
          timing: 'Febbraio (dopo ultime gelate)',
          instructions: [
            'Distribuire letame maturo o compost (3-5 kg/m²)',
            'Usare stallatico pellettato per orti piccoli'
          ],
          depthCm: 0
        },
        {
          order: 2,
          workType: 'Plowing',
          name: 'Vangatura profonda',
          timing: 'Dopo concimazione',
          instructions: [
            'Vangare a 30-40 cm di profondità',
            'Interrare il concime distribuito',
            'Rompere zolle grandi'
          ],
          depthCm: 35,
          equipment: 'Manual'
        },
        {
          order: 3,
          workType: 'Harrowing',
          name: 'Frangizollatura',
          timing: '1-2 giorni dopo vangatura',
          instructions: [
            'Sbriciolare zolle con zappa o rastrello',
            'Portare terreno a grana fine',
            'Rimuovere sassi e radici'
          ],
          depthCm: 15,
          equipment: 'Manual'
        },
        {
          order: 4,
          workType: 'Plowing',
          name: 'Aratura superficiale',
          timing: 'Dopo frangizollatura (terreni grandi >500m²)',
          instructions: [
            'Solo per terreni grandi',
            'Arare a 20-25 cm',
            'Livellare superficie'
          ],
          depthCm: 22,
          equipment: 'Rototiller'
        },
        {
          order: 5,
          workType: 'Tilling',
          name: 'Fresatura finale',
          timing: '1-2 settimane prima del trapianto',
          instructions: [
            'Fresare a 15-20 cm per letto di semina',
            'Rimuovere ultime infestanti',
            'Livellare perfettamente'
          ],
          depthCm: 18,
          equipment: 'Rototiller'
        }
      ]
    },
    {
      id: 'seq-2',
      name: 'Manutenzione Orto in Produzione',
      description: 'Lavorazioni durante ciclo produttivo',
      gardenType: 'OpenField',
      season: 'Summer',
      steps: [
        {
          order: 1,
          workType: 'Hoeing',
          name: 'Sarchiatura per erbe spontanee',
          timing: 'Ogni 2-3 settimane durante crescita',
          instructions: [
            'Zappare superficialmente tra le file',
            'Rimuovere erbe infestanti',
            'Arieggiare terreno'
          ],
          depthCm: 5,
          equipment: 'Manual'
        },
        {
          order: 2,
          workType: 'EarthingUp',
          name: 'Rincalzatura piante',
          timing: 'Quando piante raggiungono 20-30 cm',
          instructions: [
            'Accumulare terra alla base delle piante',
            'Favorisce radicazione aggiuntiva',
            'Protegge da vento'
          ],
          depthCm: 10,
          equipment: 'Manual'
        },
        {
          order: 3,
          workType: 'Mulching',
          name: 'Pacciamatura',
          timing: 'Dopo trapianto o quando piante sono stabilite',
          instructions: [
            'Distribuire paglia o film plastico',
            'Riduce evaporazione e infestanti',
            'Mantiene umidità costante'
          ],
          depthCm: 0,
          equipment: 'Manual'
        }
      ]
    }
  ]
}

/**
 * Ottiene prossima lavorazione suggerita in sequenza
 */
export async function getNextWorkInSequence(
  gardenId: string,
  sequenceId: string
): Promise<MechanicalWorkStep | null> {
  // Mock - chiama funzione PostgreSQL get_next_work_in_sequence
  return null
}

/**
 * Inizia sequenza per giardino
 * Crea task pianificati per tutti gli step della sequenza
 */
export async function startWorkSequence(
  gardenId: string,
  sequenceId: string
): Promise<MechanicalWorkLog[]> {
  const sequence = (await getMechanicalWorkSequences()).find(s => s.id === sequenceId)
  if (!sequence) {
    throw new Error('Sequenza non trovata')
  }

  // Crea un task per ogni step della sequenza
  const tasks: MechanicalWorkLog[] = []

  for (const step of sequence.steps) {
    const scheduledDate = calculateScheduledDate(step.timing)

    tasks.push({
      gardenId,
      workType: step.workType,
      description: step.name,
      scheduledDate,
      workDate: scheduledDate, // Inizialmente uguale
      equipmentType: step.equipment || 'Manual',
      depthCm: step.depthCm,
      notes: step.instructions.join('\n'),
      completed: false,
      workMetadata: {
        sequenceId,
        sequenceOrder: step.order,
        sequenceName: sequence.name
      }
    })
  }

  // Salva tutti i task
  const created: MechanicalWorkLog[] = []
  for (const task of tasks) {
    created.push(await createMechanicalWorkLog(task))
  }

  return created
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Calcola statistiche lavorazioni per giardino
 */
export async function getMechanicalWorkStats(
  gardenId: string,
  year?: number
): Promise<MechanicalWorkStats> {
  // Mock - chiama funzione PostgreSQL get_mechanical_work_stats
  return {
    totalWorks: 0,
    totalAreaWorked: 0,
    totalCost: 0,
    totalHours: 0,
    workTypeBreakdown: {} as Record<WorkType, number>,
    mostCommonWork: 'Tilling',
    busiestMonth: 3
  }
}

/**
 * Calcola costo totale lavorazioni per periodo
 */
export async function calculateWorkCosts(
  gardenId: string,
  startDate: string,
  endDate: string
): Promise<{
  totalCost: number
  costByType: Record<WorkType, number>
  costByEquipment: Record<EquipmentType, number>
}> {
  const logs = await getMechanicalWorkLogs(gardenId, { startDate, endDate, completed: true })

  let totalCost = 0
  const costByType: Partial<Record<WorkType, number>> = {}
  const costByEquipment: Partial<Record<EquipmentType, number>> = {}

  for (const log of logs) {
    const cost = log.cost || 0
    totalCost += cost

    costByType[log.workType] = (costByType[log.workType] || 0) + cost
    costByEquipment[log.equipmentType] = (costByEquipment[log.equipmentType] || 0) + cost
  }

  return {
    totalCost,
    costByType: costByType as Record<WorkType, number>,
    costByEquipment: costByEquipment as Record<EquipmentType, number>
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Calcola data suggerita da timing testuale
 */
function calculateScheduledDate(timing: string): string {
  const now = new Date()

  // Parse timing (es. "Febbraio (dopo ultime gelate)", "1-2 giorni dopo vangatura")
  if (timing.toLowerCase().includes('febbraio')) {
    return new Date(now.getFullYear(), 1, 15).toISOString().split('T')[0] // 15 febbraio
  }
  if (timing.toLowerCase().includes('marzo')) {
    return new Date(now.getFullYear(), 2, 10).toISOString().split('T')[0] // 10 marzo
  }
  if (timing.toLowerCase().includes('aprile')) {
    return new Date(now.getFullYear(), 3, 10).toISOString().split('T')[0] // 10 aprile
  }

  // Default: 7 giorni da oggi
  const future = new Date(now)
  future.setDate(future.getDate() + 7)
  return future.toISOString().split('T')[0]
}

/**
 * Valida condizioni meteo per lavorazione
 */
export async function validateWeatherConditions(
  workType: WorkType,
  scheduledDate: string,
  garden: Garden
): Promise<{
  suitable: boolean
  warnings: string[]
  suggestedDate?: string
}> {
  const warnings: string[] = []
  let suitable = true

  // Per lavorazioni del suolo, check pioggia
  const soilWorks: WorkType[] = ['Plowing', 'Tilling', 'Harrowing', 'Hoeing']
  if (soilWorks.includes(workType)) {
    // TODO: integrate with weatherAwareTaskScheduler
    // const forecast = await getWeatherForecast7Days(garden.coordinates)
    // if (forecast.rainMm > 10) {
    //   suitable = false
    //   warnings.push('Pioggia prevista - terreno sarà troppo bagnato')
    // }
  }

  return {
    suitable,
    warnings
  }
}

/**
 * Suggerisce attrezzatura ottimale in base a dimensione area
 */
export function suggestEquipment(
  workType: WorkType,
  areaSqm: number
): {
  equipmentType: EquipmentType
  reason: string
} {
  // Lavorazioni del suolo
  if (['Plowing', 'Tilling', 'Harrowing'].includes(workType)) {
    if (areaSqm > 5000) {
      return {
        equipmentType: 'Tractor',
        reason: 'Area > 5000m² - trattore consigliato per efficienza'
      }
    }
    if (areaSqm > 500) {
      return {
        equipmentType: 'Rototiller',
        reason: 'Area 500-5000m² - motozappa ottimale'
      }
    }
    return {
      equipmentType: 'Manual',
      reason: 'Area < 500m² - lavorazione manuale sufficiente'
    }
  }

  // Potature
  if (workType.includes('Pruning')) {
    return {
      equipmentType: 'ElectricPruner',
      reason: 'Forbici elettriche per precisione e velocità'
    }
  }

  // Default
  return {
    equipmentType: 'Manual',
    reason: 'Lavorazione manuale standard'
  }
}
