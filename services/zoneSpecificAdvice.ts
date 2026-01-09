/**
 * Zone Specific Advice Service
 * Calcola suggerimenti specifici per zona dell'orto
 */

import { GardenZone } from './zoneMappingService';
import { GardenTask, PlantMasterSheet } from '../types';
import { calculateWaterNeeds } from '../logic/waterRequirementEngine';
import { calculateNutrientNeeds } from '../logic/nutrientEngine';
import { getMasterSheetSync } from './plantMasterService';

export interface ZoneSpecificAdvice {
  zoneId: string;
  zoneName: string;
  irrigationAdvice: {
    frequency: string;
    amountPerSqm: number; // Litri per m²
    totalAmount: number; // Litri totali per zona
    timing: 'morning' | 'evening' | 'flexible';
    notes: string[];
  };
  fertilizationAdvice: {
    shouldFertilize: boolean;
    elementFocus: 'N' | 'P' | 'K' | 'Micro' | 'None';
    dosagePerSqm: number; // Grammi per m²
    totalDosage: number; // Grammi totali per zona
    frequency: string;
    notes: string[];
  };
  timingAdvice: {
    bestTimeOfDay: string;
    bestDaysOfWeek: string[];
    avoidDays: string[];
    notes: string[];
  };
}

/**
 * Calcola suggerimenti irrigazione per una zona specifica
 */
export function calculateZoneIrrigationAdvice(
  zone: GardenZone,
  tasks: GardenTask[],
  masterDataMap: Map<string, PlantMasterSheet>,
  garden: any // Garden type
): ZoneSpecificAdvice['irrigationAdvice'] {
  // Filtra task per questa zona
  const zoneTasks = tasks.filter(t => t.bedId === zone.id);

  if (zoneTasks.length === 0) {
    return {
      frequency: 'Nessun task in questa zona',
      amountPerSqm: 0,
      totalAmount: 0,
      timing: 'flexible',
      notes: ['Nessuna pianta in questa zona']
    };
  }

  // Calcola fabbisogno idrico totale per zona
  let totalLitersPerDay = 0;
  const notes: string[] = [];

  for (const task of zoneTasks) {
    const masterData = masterDataMap.get(task.plantName);
    if (!masterData) continue;

    const waterNeeds = calculateWaterNeeds(task, masterData, garden, tasks);
    if (waterNeeds) {
      totalLitersPerDay += waterNeeds.litersPerDay;
    }
  }

  // Aggiusta per caratteristiche zona
  let adjustedLitersPerDay = totalLitersPerDay;

  // Modificatori per tipo terreno zona
  if (zone.soilType === 'Sandy') {
    adjustedLitersPerDay *= 1.2; // +20% per terreno sabbioso
    notes.push('Terreno sabbioso: aumenta irrigazione del 20%');
  } else if (zone.soilType === 'Clay') {
    adjustedLitersPerDay *= 0.9; // -10% per terreno argilloso
    notes.push('Terreno argilloso: riduci irrigazione del 10%');
  }

  // Modificatori per capacità idrica
  if (zone.waterCapacity && zone.waterCapacity < 50) {
    adjustedLitersPerDay *= 1.15; // +15% se bassa capacità idrica
    notes.push('Bassa capacità idrica: aumenta frequenza irrigazione');
  }

  // Calcola litri per m²
  const areaSqM = zone.areaSqMeters || 1; // Default 1 m² se non specificato
  const litersPerSqm = adjustedLitersPerDay / areaSqM;

  // Determina frequenza
  let frequency = 'Ogni 2-3 giorni';
  if (zone.soilType === 'Sandy') {
    frequency = 'Ogni 1-2 giorni';
  } else if (zone.soilType === 'Clay') {
    frequency = 'Ogni 3-4 giorni';
  }

  // Determina timing ottimale
  let timing: 'morning' | 'evening' | 'flexible' = 'flexible';
  if (zone.sunExposure === 'FullSun') {
    timing = 'evening'; // Sera per evitare evaporazione
  } else if (zone.sunExposure === 'Shade') {
    timing = 'morning'; // Mattina per zone ombreggiate
  }

  return {
    frequency,
    amountPerSqm: Math.round(litersPerSqm * 10) / 10,
    totalAmount: Math.round(adjustedLitersPerDay * 10) / 10,
    timing,
    notes
  };
}

/**
 * Calcola suggerimenti fertilizzazione per una zona specifica
 */
export function calculateZoneFertilizationAdvice(
  zone: GardenZone,
  tasks: GardenTask[],
  masterDataMap: Map<string, PlantMasterSheet>,
  daysActive: number
): ZoneSpecificAdvice['fertilizationAdvice'] {
  const zoneTasks = tasks.filter(t => t.bedId === zone.id);

  if (zoneTasks.length === 0) {
    return {
      shouldFertilize: false,
      elementFocus: 'None',
      dosagePerSqm: 0,
      totalDosage: 0,
      frequency: 'N/A',
      notes: ['Nessuna pianta in questa zona']
    };
  }

  // Aggrega fabbisogno nutrizionale di tutte le piante nella zona
  let totalDosageN = 0;
  let totalDosageP = 0;
  let totalDosageK = 0;
  const notes: string[] = [];

  for (const task of zoneTasks) {
    const masterData = masterDataMap.get(task.plantName);
    if (!masterData) continue;

    const nutrientAdvice = calculateNutrientNeeds(
      masterData,
      daysActive,
      zone.soilType || 'Loamy',
      task.taskType
    );

    if (nutrientAdvice.shouldFertilize) {
      // Stima dosaggio basato su elemento focus
      const baseDosage = 30; // grammi per m² base
      
      if (nutrientAdvice.elementFocus === 'N') {
        totalDosageN += baseDosage;
      } else if (nutrientAdvice.elementFocus === 'P') {
        totalDosageP += baseDosage;
      } else if (nutrientAdvice.elementFocus === 'K') {
        totalDosageK += baseDosage;
      }

      notes.push(`${task.plantName}: ${nutrientAdvice.adviceTitle}`);
    }
  }

  // Determina elemento focus principale
  let elementFocus: 'N' | 'P' | 'K' | 'Micro' | 'None' = 'None';
  if (totalDosageN > totalDosageP && totalDosageN > totalDosageK) {
    elementFocus = 'N';
  } else if (totalDosageP > totalDosageK) {
    elementFocus = 'P';
  } else if (totalDosageK > 0) {
    elementFocus = 'K';
  }

  const shouldFertilize = totalDosageN > 0 || totalDosageP > 0 || totalDosageK > 0;

  // Calcola dosaggio totale
  const totalDosage = totalDosageN + totalDosageP + totalDosageK;
  const areaSqM = zone.areaSqMeters || 1;
  const dosagePerSqm = totalDosage / areaSqM;

  // Aggiusta per pH zona
  if (zone.soilPh) {
    if (zone.soilPh < 6.0) {
      notes.push('pH basso: considera correzione pH prima di fertilizzare');
    } else if (zone.soilPh > 7.5) {
      notes.push('pH alto: alcuni nutrienti potrebbero essere meno disponibili');
    }
  }

  return {
    shouldFertilize,
    elementFocus,
    dosagePerSqm: Math.round(dosagePerSqm * 10) / 10,
    totalDosage: Math.round(totalDosage * 10) / 10,
    frequency: shouldFertilize ? 'Ogni 2-3 settimane' : 'N/A',
    notes
  };
}

/**
 * Calcola suggerimenti timing operazioni per zona
 */
export function calculateZoneTimingAdvice(
  zone: GardenZone
): ZoneSpecificAdvice['timingAdvice'] {
  const notes: string[] = [];
  let bestTimeOfDay = 'Mattina (8-10) o Sera (18-20)';
  const bestDaysOfWeek: string[] = [];
  const avoidDays: string[] = [];

  // Timing basato su esposizione solare
  if (zone.sunExposure === 'FullSun') {
    bestTimeOfDay = 'Sera (dopo le 18)';
    notes.push('Zona molto soleggiata: irriga la sera per evitare evaporazione');
  } else if (zone.sunExposure === 'Shade') {
    bestTimeOfDay = 'Mattina (8-10)';
    notes.push('Zona ombreggiata: irriga la mattina');
  }

  // Timing basato su tipo terreno
  if (zone.soilType === 'Clay') {
    notes.push('Terreno argilloso: evita irrigazione quando terreno è già bagnato');
    avoidDays.push('Dopo pioggia');
  } else if (zone.soilType === 'Sandy') {
    notes.push('Terreno sabbioso: può necessitare irrigazione più frequente');
  }

  return {
    bestTimeOfDay,
    bestDaysOfWeek,
    avoidDays,
    notes
  };
}

/**
 * Calcola suggerimenti completi per una zona
 */
export function calculateCompleteZoneAdvice(
  zone: GardenZone,
  tasks: GardenTask[],
  masterDataMap: Map<string, PlantMasterSheet>,
  garden: any,
  daysActive: number
): ZoneSpecificAdvice {
  return {
    zoneId: zone.id,
    zoneName: zone.name,
    irrigationAdvice: calculateZoneIrrigationAdvice(zone, tasks, masterDataMap, garden),
    fertilizationAdvice: calculateZoneFertilizationAdvice(zone, tasks, masterDataMap, daysActive),
    timingAdvice: calculateZoneTimingAdvice(zone)
  };
}

