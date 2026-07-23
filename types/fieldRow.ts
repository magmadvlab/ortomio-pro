/**
 * Field Row (Filare) Types
 * Sistema per gestire filari di campo aperto con produzioni scalari
 */

export interface FieldRow {
  id: string
  gardenId: string
  zoneId?: string | null  // Optional: può appartenere a una zona specifica

  // Identificazione
  name: string  // es. "Fila 1", "Filare Pomodori Nord"
  rowNumber: number  // Numero progressivo filare
  row_number?: number

  // Dimensioni
  lengthMeters: number  // Lunghezza filare in metri
  length_meters?: number
  distanceFromPreviousRow?: number  // Distanza dal filare precedente (cm)
  distance_from_previous_row?: number
  plantSpacing?: number  // Distanza tra piante nel filare (cm)
  plant_spacing?: number

  // Coltura
  cultivar?: string  // es. "Pomodoro Datterino", "Lattuga Romana"
  plantCount?: number  // Numero piante nel filare (auto-calcolato)

  // Orientamento
  orientation?: 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'  // Orientamento filare
  rowOrdering?: FieldRowOrdering
  plantOrderingInRow?: FieldRowOrdering

  // Irrigazione (opzionale)
  irrigationLine?: {
    lineType: 'Dripline' | 'PipeWithDrippers' | 'MicroSprinkler'
    pipeDiameterMm?: number
    emitterSpacingCm?: number
    emitterFlowRateLph?: number
  }
  irrigationConfig?: FieldRow['irrigationLine']

  // Tracking produzioni scalari
  plantedDate?: string  // Data semina/trapianto (ISO string)
  planted_date?: string
  isActive: boolean  // Se il filare è attualmente in produzione

  // Metadata
  notes?: string
  createdAt: string
  updatedAt: string
}

export type FieldRowOrdering =
  | 'west_to_east'
  | 'east_to_west'
  | 'north_to_south'
  | 'south_to_north'

export type FieldRowAxis = '' | 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'

export const FIELD_ROW_ORDERING_OPTIONS: Array<{
  value: FieldRowOrdering
  label: string
}> = [
  { value: 'west_to_east', label: 'Ovest -> Est' },
  { value: 'east_to_west', label: 'Est -> Ovest' },
  { value: 'north_to_south', label: 'Nord -> Sud' },
  { value: 'south_to_north', label: 'Sud -> Nord' },
]

/**
 * Batch di semina/trapianto scalare
 * Traccia ogni "lotto" di piante piantate in momenti diversi
 */
export interface PlantingBatch {
  id: string
  fieldRowId: string
  gardenId: string

  // Identificazione batch
  batchNumber: number  // Es. 1 = prima semina, 2 = seconda semina scalare, etc.
  plantName: string
  variety?: string

  // Quantità
  plantsCount: number  // Numero piante in questo batch
  seedsUsed?: number  // Semi usati per questo batch (se da seme)

  // Date
  sowingDate?: string  // Data semina (se da seme)
  transplantingDate?: string  // Data trapianto (se da piantina)
  expectedHarvestDate?: string  // Data raccolta stimata

  // Tracking origine
  seedPacketId?: string  // ID busta semi usata
  seedlingBatchId?: string  // ID batch piantine usato

  // Stato
  status: 'Planned' | 'Sown' | 'Transplanted' | 'Growing' | 'Harvesting' | 'Completed'
  currentQuantity: number  // Piante ancora vive in questo batch

  // Metadata
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Zona dell'orto con filari
 * Permette di dividere l'orto in zone con diversi cultivar
 */
export interface GardenZone {
  id: string
  gardenId: string

  // Identificazione
  name: string  // es. "Zona Nord", "Settore Pomodori"
  description?: string

  // Dimensioni
  sizeSqMeters: number
  dimensions?: { length: number; width: number }  // In metri

  // Posizione (per visual mapping futuro)
  position?: {
    x: number  // % 0-100
    y: number  // % 0-100
  }

  // Coltura principale zona
  primaryCultivar?: string
  cropType?: 'Vegetables' | 'Fruits' | 'Herbs' | 'Mixed'

  // Filari in questa zona
  fieldRows?: string[]  // Array di IDs di FieldRow

  // Caratteristiche specifiche zona
  soilType?: 'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty'
  soilPh?: number
  sunExposure?: 'FullSun' | 'PartSun' | 'Shade'

  // Metadata
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Helper type per calcoli occupazione
 */
export interface FieldRowOccupancy {
  fieldRowId: string
  fieldRowName: string
  totalLength: number  // Lunghezza totale filare (m)
  maxPlants: number  // Numero massimo piante possibili
  currentPlants: number  // Piante attualmente presenti (tutti i batch)
  occupancyPercentage: number  // % occupazione
  batches: {
    batchId: string
    batchNumber: number
    plantsCount: number
    plantedDate: string
    status: PlantingBatch['status']
  }[]
}

/**
 * Helper type per vista calendario produzioni scalari
 */
export interface ScalarProductionCalendar {
  gardenId: string
  zoneId?: string
  fieldRowId?: string

  // Timeline produzioni
  timeline: Array<{
    date: string  // ISO date
    events: Array<{
      type: 'Sowing' | 'Transplanting' | 'ExpectedHarvest' | 'ActualHarvest'
      batchId: string
      batchNumber: number
      plantName: string
      quantity: number
      fieldRowName: string
    }>
  }>

  // Statistiche
  totalBatches: number
  activeBatches: number
  harvestDistributionDays: number  // Giorni tra primo e ultimo raccolto previsto
}
