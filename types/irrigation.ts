/**
 * Irrigation System Types
 * Modello dati per gestione impianti irrigui con zone e portate
 */

import { GardenBed } from './gardenBed';
import { GardenTask } from '../types';

export type WateringMethod = 
  | 'Manual'           // Annaffiatoio
  | 'Hose'             // Tubo + lancia
  | 'Dripline'          // Ala gocciolante
  | 'Drippers'          // Gocciolatori puntuali
  | 'MicroSprinkler'   // Micro-sprinkler
  | 'Sprinkler'        // Sprinkler tradizionale
  | 'Mixed';           // Misto

export type IrrigationComponentType = 
  | 'Dripline' 
  | 'Dripper' 
  | 'MicroSprinkler' 
  | 'MainLine' 
  | 'SecondaryLine' 
  | 'Filter' 
  | 'Reducer';

export interface IrrigationSystem {
  id: string;
  gardenId: string;
  name: string; // "Orto Casa", "Vigneto Nord"
  type?: 'Manual' | 'Drip' | 'Sprinkler' | 'Micro' | 'Soaker';
  waterSource?: 'Municipal' | 'Well' | 'Rainwater' | 'River' | 'Pond' | 'Consortium';
  pressureBar?: number;
  hasTimer?: boolean;
  hasValve?: boolean;
  notes?: string;
  // Collegamenti a strutture esistenti
  bedIds?: string[]; // Aiuole collegate
  rowIds?: string[]; // Filari collegati
  cultivationType?: 'orto' | 'frutteto' | 'uliveto' | 'vigneto' | 'serra' | 'giardino';
  createdAt: string;
  updatedAt: string;
}

export interface IrrigationZone {
  id: string;
  systemId: string;
  gardenId?: string;
  name: string; // "Aiuola 1", "Serretta", "Filare 2"
  areaSqm?: number;
  method: WateringMethod;
  flowRateLph: number; // Portata totale zona (L/h) - CAMPO CHIAVE
  valveId?: string; // ID SmartDevice se presente
  bedIds: string[]; // Aiuole/letti collegati
  plantTaskIds: string[]; // Task piante collegati (per calcolo fabbisogno)
  plantTypes?: string[];
  isAutomated?: boolean;
  schedule?: {
    days?: number[];
    time?: string;
    duration?: number;
  };
  lastWateredAt?: string;
  notes?: string;
  // Livello 2 (Pro): calcolo da componenti
  calculatedFromComponents?: boolean;
  // Configurazione specifica per metodo
  manualConfig?: {
    mode: 'liters' | 'minutes';
    estimatedFlowRateLph?: number; // Per modalità minuti
  };
  driplineConfig?: {
    lengthMeters: number;
    spacing?: number; // cm tra gocciolatori
    dripperFlowRate?: number; // L/h per gocciolatore
    flowRatePerMeter?: number; // L/h per metro (alternativa a spacing)
  };
  drippersConfig?: {
    count: number;
    flowRateLph: number; // L/h per gocciolatore
  };
  microSprinklerConfig?: {
    count: number;
    flowRateLph: number; // L/h per irrigatore
  };
  createdAt: string;
  updatedAt: string;
}

export interface IrrigationComponent {
  id: string;
  zoneId: string;
  type: IrrigationComponentType;
  // Per Dripline
  lengthMeters?: number;
  flowRatePerMeterLph?: number; // L/h per metro
  dripperSpacing?: number; // cm tra gocciolatori (se ala con gocciolatori)
  dripperFlowRateLph?: number; // L/h per gocciolatore
  // Per Dripper/MicroSprinkler
  quantity?: number;
  flowRateLph?: number; // L/h per unità
  // Metadata
  brand?: string;
  model?: string;
  notes?: string;
  createdAt: string;
}

export interface IrrigationTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  method: WateringMethod;
  defaultFlowRateLph: number; // Portata media suggerita
  typicalUse: string[]; // ["Orto aiuole", "Serra"]
  components: Array<{
    type: IrrigationComponentType;
    defaultQuantity?: number;
    defaultLength?: number;
    defaultFlowRate?: number;
    defaultFlowRatePerMeter?: number;
    defaultDripperSpacing?: number;
  }>;
}

export interface WateringLog {
  id: string;
  zoneId: string;
  gardenId?: string;
  bedId?: string;
  rowId?: string;
  wateredAt?: string; // ISO datetime
  date: string; // ISO date
  durationMinutes: number;
  litersApplied: number; // Calcolato: (flowRateLph / 60) * durationMinutes
  method: 'Manual' | 'Automatic' | 'Timer';
  weatherCondition?: string;
  soilMoistureBefore?: number;
  soilMoistureAfter?: number;
  airTemperatureC?: number;
  notes?: string;
  valveId?: string; // Se automatico
  completed: boolean;
  createdAt: string;
}

export interface IrrigationSchedule {
  zoneId: string;
  zoneName: string;
  litersNeeded: number; // Da waterRequirementEngine
  suggestedDurationMinutes: number; // Calcolato: (litersNeeded / (flowRateLph / 60))
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  nextWatering: string; // ISO date
  // Per zone manuali
  manualMode?: 'liters' | 'minutes';
  showLitersOnly?: boolean; // Se true, mostra solo litri senza minuti
  weatherAdjustment?: {
    action: 'PROCEED' | 'REDUCE' | 'CANCEL';
    adjustedDuration?: number;
    reason: string;
  };
  fertigationInfo?: {
    shouldFertigate: boolean;
    productName?: string;
    totalDosage?: number;
    unit?: 'ml' | 'g';
  };
}

export interface IrrigationTask {
  zoneId: string;
  zoneName: string;
  litersNeeded: number;
  durationMinutes: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  valveId?: string;
  // Per zone manuali
  manualMode?: 'liters' | 'minutes';
  showLitersOnly?: boolean; // Se true, mostra solo litri senza minuti
  weatherAdjustment?: {
    action: 'PROCEED' | 'REDUCE' | 'CANCEL';
    adjustedDuration?: number;
    reason: string;
  };
  fertigationInfo?: {
    shouldFertigate: boolean;
    productName?: string;
    totalDosage?: number;
    unit?: 'ml' | 'g';
  };
}

