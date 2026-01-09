/**
 * Irrigation Service
 * Gestione zone irrigue, calcolo portata e conversione litri → minuti
 */

import { IrrigationZone, IrrigationComponent, IrrigationSchedule, WateringLog } from '../types/irrigation';
import { Garden, GardenTask } from '../types';
import { calculateWaterNeeds } from '../logic/waterRequirementEngine';
import { adjustIrrigationForRain, TaskAdjustment } from '../logic/rainManager';
import { WeatherForecast } from '../services/weatherService';
import { getMasterSheet } from './plantMasterService';

/**
 * Calcola portata ala gocciolante (dripline)
 * Formula:
 * - Con passo: portata = (lunghezza * 100 / passo) * L/h_goccia
 * - Con L/h per metro: portata = lunghezza * L/h_per_metro
 */
export function calculateDriplineFlowRate(
  lengthMeters: number,
  spacing?: number, // cm tra gocciolatori
  dripperFlowRate?: number, // L/h per gocciolatore
  flowRatePerMeter?: number // L/h per metro
): number {
  if (lengthMeters <= 0) return 0;
  
  if (spacing && dripperFlowRate) {
    // Calcolo con passo gocciolatori
    const dripperCount = Math.floor((lengthMeters * 100) / spacing);
    return Math.round(dripperCount * dripperFlowRate * 10) / 10;
  }
  
  if (flowRatePerMeter) {
    // Calcolo con L/h per metro
    return Math.round(lengthMeters * flowRatePerMeter * 10) / 10;
  }
  
  return 0;
}

/**
 * Calcola portata totale zona da componenti (Livello 2 - Pro)
 */
export function calculateZoneFlowRate(
  components: IrrigationComponent[]
): number {
  let totalLph = 0;
  
  for (const comp of components) {
    if (comp.type === 'Dripline') {
      if (comp.lengthMeters && comp.flowRatePerMeterLph) {
        // Ala gocciolante con portata per metro
        totalLph += comp.lengthMeters * comp.flowRatePerMeterLph;
      } else if (comp.lengthMeters && comp.dripperSpacing && comp.dripperFlowRateLph) {
        // Ala con gocciolatori a passo fisso
        const dripperCount = Math.floor((comp.lengthMeters * 100) / comp.dripperSpacing);
        totalLph += dripperCount * comp.dripperFlowRateLph;
      }
    } else if (comp.type === 'Dripper' || comp.type === 'MicroSprinkler') {
      if (comp.quantity && comp.flowRateLph) {
        totalLph += comp.quantity * comp.flowRateLph;
      }
    }
  }
  
  return Math.round(totalLph * 10) / 10; // Arrotonda a 1 decimale
}

/**
 * Converte litri necessari in minuti di irrigazione
 * Formula: minuti = litri / (L/h / 60)
 */
export function calculateIrrigationDuration(
  litersNeeded: number,
  flowRateLph: number
): number {
  if (flowRateLph <= 0) return 0;
  const minutes = (litersNeeded / (flowRateLph / 60));
  return Math.round(minutes * 10) / 10; // Arrotonda a 1 decimale
}

/**
 * Calcola programma irrigazione per una zona
 */
export async function calculateZoneIrrigationSchedule(
  zone: IrrigationZone,
  plantTaskIds: string[],
  tasks: GardenTask[],
  garden: Garden,
  weather: WeatherForecast | null
): Promise<IrrigationSchedule> {
  // Somma fabbisogno di tutte le piante nella zona
  let totalLiters = 0;
  
  for (const taskId of plantTaskIds) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) continue;
    
    const masterData = await getMasterSheet(task.plantName);
    if (!masterData) continue;
    
    const waterNeeds = calculateWaterNeeds(task, masterData, garden, tasks);
    if (waterNeeds) {
      totalLiters += waterNeeds.litersPerDay;
    }
  }
  
  // Se non ci sono piante associate o litri = 0, non generare schedule
  if (totalLiters <= 0 || plantTaskIds.length === 0) {
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      litersNeeded: 0,
      suggestedDurationMinutes: 0,
      priority: 'Low',
      nextWatering: new Date().toISOString().split('T')[0],
    };
  }
  
  // Gestione zone manuali
  const isManual = zone.method === 'Manual';
  const hasNoFlowRate = zone.flowRateLph <= 0;
  
  // Se zona manuale senza portata, mostra solo litri
  if (isManual && hasNoFlowRate) {
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      litersNeeded: totalLiters,
      suggestedDurationMinutes: 0,
      priority: totalLiters > 100 ? 'High' : totalLiters > 50 ? 'Medium' : 'Low',
      nextWatering: new Date().toISOString().split('T')[0],
      manualMode: zone.manualConfig?.mode || 'liters',
      showLitersOnly: true,
    };
  }
  
  // Calcola durata (per zone con portata o manuali con portata)
  const durationMinutes = calculateIrrigationDuration(totalLiters, zone.flowRateLph);
  
  // Aggiusta per pioggia
  let weatherAdjustment;
  if (weather && zone.valveId) {
    const mockTask: GardenTask = {
      id: zone.id,
      taskType: 'Treatment', // Using 'Treatment' as generic type for irrigation mock task
      date: new Date().toISOString(),
      plantName: zone.name,
      durationMinutes,
      gardenId: garden.id,
      completed: false,
    };
    const adjustment = adjustIrrigationForRain(mockTask, [weather], garden);
    
    // Map 'SKIP' to 'CANCEL' for IrrigationSchedule type compatibility
    const mappedAction = adjustment.action === 'SKIP' ? 'CANCEL' : adjustment.action;
    
    weatherAdjustment = {
      action: mappedAction as 'PROCEED' | 'REDUCE' | 'CANCEL',
      adjustedDuration: adjustment.adjustedDuration,
      reason: adjustment.message
    };
  }
  
  // Determina priorità
  let priority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
  if (totalLiters > 100) {
    priority = 'High';
  } else if (totalLiters > 50) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }
  
  // Se aggiustamento meteo cancella, priorità rimane ma duration = 0
  if (weatherAdjustment?.action === 'CANCEL') {
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      litersNeeded: totalLiters,
      suggestedDurationMinutes: 0,
      priority,
      nextWatering: new Date().toISOString().split('T')[0],
      weatherAdjustment
    };
  }
  
  // Applica durata aggiustata se presente
  const finalDuration = weatherAdjustment?.adjustedDuration ?? durationMinutes;
  
  return {
    zoneId: zone.id,
    zoneName: zone.name,
    litersNeeded: totalLiters,
    suggestedDurationMinutes: finalDuration,
    priority,
    nextWatering: new Date().toISOString().split('T')[0],
    manualMode: isManual ? (zone.manualConfig?.mode || 'minutes') : undefined,
    showLitersOnly: false, // Zone con portata mostrano sempre minuti
    weatherAdjustment
  };
}

/**
 * Calcola litri applicati da durata e portata
 */
export function calculateLitersApplied(
  durationMinutes: number,
  flowRateLph: number
): number {
  return Math.round((flowRateLph / 60) * durationMinutes * 10) / 10;
}

/**
 * Crea una nuova zona irrigua
 */
export function createIrrigationZone(
  systemId: string,
  name: string,
  method: IrrigationZone['method'],
  flowRateLph: number,
  bedIds: string[] = [],
  plantTaskIds: string[] = [],
  valveId?: string,
  notes?: string
): IrrigationZone {
  return {
    id: crypto.randomUUID(),
    systemId,
    name,
    method,
    flowRateLph,
    valveId,
    bedIds,
    plantTaskIds,
    notes,
    calculatedFromComponents: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Aggiorna portata zona da componenti
 */
export function updateZoneFlowRateFromComponents(
  zone: IrrigationZone,
  components: IrrigationComponent[]
): IrrigationZone {
  const calculatedFlowRate = calculateZoneFlowRate(components);
  return {
    ...zone,
    flowRateLph: calculatedFlowRate,
    calculatedFromComponents: true,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Crea log irrigazione
 */
export function createWateringLog(
  zoneId: string,
  durationMinutes: number,
  flowRateLph: number,
  method: 'Manual' | 'Automatic' | 'Timer',
  valveId?: string,
  notes?: string
): WateringLog {
  const litersApplied = calculateLitersApplied(durationMinutes, flowRateLph);
  
  return {
    id: crypto.randomUUID(),
    zoneId,
    date: new Date().toISOString().split('T')[0],
    durationMinutes,
    litersApplied,
    method,
    notes,
    valveId,
    completed: true,
    createdAt: new Date().toISOString()
  };
}

