import { GardenTask, PlantMasterSheet, Garden } from '../types';
import { WeatherForecast } from '../services/weatherService';
import { calculatePlantDaysActive } from '../services/taskCalculationService';
import { calculateRootDepth } from './rootDepthCalculator';

export interface WaterNeeds {
  litersPerDay: number; // Litri totali per giorno per questa pianta
  litersPerPlant: number; // Litri per singola pianta
  frequency: string; // "Ogni 1-2 giorni"
  method: 'Drip' | 'Sprinkler' | 'Manual' | 'Flood';
  phase: 'germination' | 'vegetative' | 'production';
  modifiers: {
    soilType?: string; // Modificatore terreno
    temperature?: string; // Modificatore temperatura
    criticalPeriod?: boolean; // Se è in periodo critico
  };
}

export interface TotalGardenWaterNeeds {
  totalLitersPerDay: number;
  breakdown: Array<{
    plantName: string;
    liters: number;
    plants: number;
  }>;
  recommendations: string[];
}

/**
 * Calcola il fabbisogno idrico per una singola pianta
 */
export const calculateWaterNeeds = (
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: Garden,
  allTasks: GardenTask[] = []
): WaterNeeds | null => {
  // Se non ci sono dati irrigazione dettagliati, usa valori di default
  if (!masterData.irrigationDetails) {
    // Fallback: stima basata su categoria
    const defaultLiters = {
      'FRUITING': { germination: 0.1, vegetative: 1.5, production: 2.5 },
      'LEAFY': { germination: 0.05, vegetative: 0.6, production: 0.8 },
      'ROOT': { germination: 0.05, vegetative: 0.4, production: 0.5 },
      'LEGUME': { germination: 0.1, vegetative: 1.0, production: 1.5 },
      'GENERIC': { germination: 0.1, vegetative: 1.0, production: 1.5 }
    };
    
    const defaults = defaultLiters[masterData.nutrientCategory] || defaultLiters['GENERIC'];
    const daysActive = calculatePlantDaysActive(allTasks, task.plantName, task.variety);
    
    let phase: 'germination' | 'vegetative' | 'production' = 'vegetative';
    if (daysActive === null || daysActive <= 20) {
      phase = 'germination';
    } else if (daysActive > 50) {
      phase = 'production';
    }
    
    const litersPerPlant = defaults[phase];
    const quantity = task.currentQuantity || task.initialQuantity || 1;
    
    return {
      litersPerDay: litersPerPlant * quantity,
      litersPerPlant,
      frequency: phase === 'germination' ? 'Ogni 2-3 giorni' : phase === 'vegetative' ? 'Ogni 1-2 giorni' : 'Ogni giorno',
      method: 'Drip',
      phase,
      modifiers: {}
    };
  }
  
  // Usa dati dettagliati
  const irrigation = masterData.irrigationDetails;
  const daysActive = calculatePlantDaysActive(allTasks, task.plantName, task.variety);
  
  // Determina fase corrente
  let phase: 'germination' | 'vegetative' | 'production' = 'vegetative';
  if (daysActive === null || daysActive <= 20) {
    phase = 'germination';
  } else if (daysActive > 50) {
    phase = 'production';
  }
  
  // Recupera litri per fase
  let litersPerPlant = irrigation.litersPerPlantPerDay[phase];
  
  // Applica modificatori periodo critico
  let criticalPeriod = false;
  if (irrigation.criticalPeriods && daysActive !== null) {
    for (const period of irrigation.criticalPeriods) {
      if (daysActive >= period.days[0] && daysActive <= period.days[1]) {
        litersPerPlant *= period.multiplier;
        criticalPeriod = true;
        break;
      }
    }
  }
  
  // Applica modificatori terreno
  let soilModifier = '';
  if (garden.soilType === 'Sandy') {
    litersPerPlant *= 1.2; // +20% per terreno sabbioso
    soilModifier = 'Terreno sabbioso: +20% acqua';
  } else if (garden.soilType === 'Clay') {
    litersPerPlant *= 0.9; // -10% per terreno argilloso
    soilModifier = 'Terreno argilloso: -10% acqua';
  }
  
  // Calcola totale per tutte le piante
  const quantity = task.currentQuantity || task.initialQuantity || 1;
  const totalLiters = litersPerPlant * quantity;
  
  return {
    litersPerDay: totalLiters,
    litersPerPlant,
    frequency: irrigation.frequency[phase],
    method: irrigation.method || 'Drip',
    phase,
    modifiers: {
      soilType: soilModifier || undefined,
      criticalPeriod: criticalPeriod || undefined
    }
  };
};

/**
 * Calcola il fabbisogno idrico totale per tutto l'orto
 */
export const calculateTotalGardenWaterNeeds = (
  tasks: GardenTask[],
  garden: Garden
): TotalGardenWaterNeeds => {
  const activeTasks = tasks.filter(
    t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
  );
  
  const breakdown: Array<{ plantName: string; liters: number; plants: number }> = [];
  let totalLiters = 0;
  const recommendations: string[] = [];
  
  for (const task of activeTasks) {
    // Dobbiamo importare getMasterSheet
    const { getMasterSheet } = require('../services/plantMasterService');
    const master = getMasterSheet(task.plantName);
    if (!master) continue;
    
    const waterNeeds = calculateWaterNeeds(task, master, garden, tasks);
    if (!waterNeeds) continue;
    
    const quantity = task.currentQuantity || task.initialQuantity || 1;
    breakdown.push({
      plantName: task.plantName,
      liters: waterNeeds.litersPerDay,
      plants: quantity
    });
    
    totalLiters += waterNeeds.litersPerDay;
    
    // Aggiungi raccomandazioni
    if (waterNeeds.modifiers.criticalPeriod) {
      recommendations.push(`${task.plantName}: periodo critico, aumenta irrigazione`);
    }
  }
  
  // Raccomandazioni generali
  if (totalLiters > 50) {
    recommendations.push('Fabbisogno idrico elevato: considera sistema irrigazione automatico');
  }
  if (totalLiters > 100) {
    recommendations.push('Fabbisogno molto elevato: verifica capacità serbatoio/pozzo');
  }
  
  return {
    totalLitersPerDay: Math.round(totalLiters * 10) / 10, // Arrotonda a 1 decimale
    breakdown,
    recommendations
  };
};

/**
 * Genera un programma di irrigazione specifico per una pianta
 */
export const getWateringSchedule = (
  task: GardenTask,
  masterData: PlantMasterSheet,
  weather: WeatherForecast | null,
  garden: Garden,
  allTasks: GardenTask[] = []
): {
  schedule: string;
  nextWatering: string;
  amount: string;
  notes: string[];
} => {
  const waterNeeds = calculateWaterNeeds(task, masterData, garden, allTasks);
  if (!waterNeeds) {
    return {
      schedule: 'Dati non disponibili',
      nextWatering: 'N/A',
      amount: 'N/A',
      notes: []
    };
  }
  
  const totalLiters = waterNeeds.litersPerDay;
  
  // Considera meteo
  let nextWatering = 'Oggi';
  let notes: string[] = [];
  
  if (weather) {
    if (weather.rainMm >= 5) {
      nextWatering = 'Dopo la pioggia';
      notes.push(`Previsti ${weather.rainMm}mm di pioggia - sospendi irrigazione`);
    } else if (weather.rainMm > 0 && weather.rainMm < 5) {
      nextWatering = 'Domani';
      notes.push(`Pioggia leggera prevista (${weather.rainMm}mm) - riduci irrigazione del 50%`);
    } else if (weather.tempMax > 30) {
      nextWatering = 'Oggi (urgente)';
      notes.push(`Temperatura alta (${weather.tempMax}°C) - aumenta irrigazione del 30%`);
    } else {
      nextWatering = 'Oggi';
    }
    
    if (weather.tempMax && weather.tempMax > 35) {
      notes.push('Caldo estremo previsto - considera irrigazione due volte al giorno');
    }
  }
  
  // Aggiungi note da modificatori
  if (waterNeeds.modifiers.soilType) {
    notes.push(waterNeeds.modifiers.soilType);
  }
  if (waterNeeds.modifiers.criticalPeriod) {
    notes.push('Periodo critico: aumenta irrigazione');
  }
  
  return {
    schedule: waterNeeds.frequency,
    nextWatering,
    amount: `${Math.round(totalLiters * 10) / 10}L totali (${Math.round(waterNeeds.litersPerPlant * 10) / 10}L per pianta)`,
    notes
  };
};
