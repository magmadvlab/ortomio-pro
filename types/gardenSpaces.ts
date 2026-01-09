/**
 * Garden Spaces Types
 * Struttura gerarchica per Campo Aperto, Serra e Indoor
 */

import { GreenhouseConfig, GreenhouseStructureType } from './greenhouse'
import {
  HydroponicSystemConfig,
  AquaponicSystemConfig,
  AeroponicSystemConfig
} from './indoorGrowing'

/**
 * Sistema di coltivazione (Suolo vs Fuori Suolo)
 */
export type GrowingSystem =
  | 'Soil'          // In terra
  | 'Hydroponic'    // Idroponica
  | 'Aquaponic'     // Acquaponica
  | 'Aeroponic'     // Aeroponica
  | 'Substrate'     // Substrato inerte

/**
 * Strutture comuni (usate sia in campo che in serra)
 */
export interface SpaceStructures {
  pots?: Array<{
    count: number
    diameter: number  // cm
  }>

  containers?: Array<{
    count: number
    length: number   // cm
    width: number    // cm
    height: number   // cm
  }>

  beds?: Array<{
    count: number
    length: number   // cm
    width: number    // cm
    height: number   // cm
  }>

  // NUOVO: Filari
  rows?: Array<{
    count: number
    length: number      // m
    spacing: number     // cm tra piante
    rowSpacing?: number // cm tra filari
  }>
}

/**
 * Configurazione Campo Aperto
 */
export interface OpenFieldSpace {
  // Sistema di coltivazione
  system: GrowingSystem

  // Dimensioni totali
  size: number
  unit: 'sqm' | 'are' | 'hectare'

  // Strutture presenti (se system = 'Soil')
  structures?: SpaceStructures

  // Config specifica fuori suolo (se system != 'Soil')
  hydroponicConfig?: HydroponicSystemConfig
  aquaponicConfig?: AquaponicSystemConfig
  aeroponicConfig?: AeroponicSystemConfig
}

/**
 * Dimensioni serra
 */
export interface GreenhouseDimensions {
  width: number         // Larghezza (m)
  length: number        // Lunghezza (m)
  grondaHeight: number  // Altezza gronda (m)
  ridgeHeight: number   // Altezza colmo (m)
}

/**
 * Configurazione Serra
 */
export interface GreenhouseSpace {
  // Tipologia strutturale
  structureType: GreenhouseStructureType

  // Dimensioni
  dimensions: GreenhouseDimensions

  // Sistema di coltivazione
  system: GrowingSystem

  // Strutture interne (se system = 'Soil')
  structures?: SpaceStructures

  // Config specifica fuori suolo (se system != 'Soil')
  hydroponicConfig?: HydroponicSystemConfig
  aquaponicConfig?: AquaponicSystemConfig
  aeroponicConfig?: AeroponicSystemConfig

  // Info aggiuntive (dalla vecchia GreenhouseConfig)
  coveringType?: string
  coveringThickness?: number
  archSpacing?: number
  archMaterial?: string
  hasVentilation?: boolean
  hasHeating?: boolean
  minTemp?: number
  maxTemp?: number
}

/**
 * Tipo sistema indoor
 */
export type IndoorSystemType =
  | 'Hydroponic'
  | 'Aquaponic'
  | 'Aeroponic'
  | 'Vertical'
  | 'GrowBox'

/**
 * Configurazione Indoor
 */
export interface IndoorSpace {
  // Tipo sistema (sempre fuori suolo)
  systemType: IndoorSystemType

  // Config specifica per tipo
  hydroponicConfig?: HydroponicSystemConfig
  aquaponicConfig?: AquaponicSystemConfig
  aeroponicConfig?: AeroponicSystemConfig
  verticalConfig?: VerticalFarmingConfig
  growBoxConfig?: GrowBoxConfig
}

/**
 * Vertical Farming Config
 */
export interface VerticalFarmingConfig {
  levels: number
  towerCount?: number
  ledType?: string
  ledWatts?: number
  area?: number  // m²
}

/**
 * Grow Box Config
 */
export interface GrowBoxConfig {
  count: number
  length: number   // cm
  width: number    // cm
  height: number   // cm
  ledWatts?: number
}

/**
 * Helper type: Riassunto spazi presenti
 */
export interface GardenSpacesInfo {
  hasOpenField: boolean
  hasGreenhouse: boolean
  hasIndoor: boolean

  openFieldSpace?: OpenFieldSpace
  greenhouseSpace?: GreenhouseSpace
  indoorSpace?: IndoorSpace
}
