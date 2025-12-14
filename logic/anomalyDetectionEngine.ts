/**
 * Anomaly Detection Engine
 * Rileva anomalie sottili nei dati del giardino (crescita rallentata, pattern non attesi, ecc.)
 */

import { Garden, GardenTask } from '../types';
import { ZoneMemory, Correlation } from '../types/memory';
import { SensorReading } from '../services/iotSensorService';
import { getZoneMemory } from '../services/gardenMemoryService';

export interface Anomaly {
  id: string;
  type: 'growth' | 'pattern' | 'correlation' | 'sensor';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: Date;
  affectedZone?: string;
  affectedPlant?: string;
  possibleCauses: string[];
  suggestedActions: string[];
  confidence: number; // 0-1
}

/**
 * Rileva anomalie crescita
 */
export async function detectGrowthAnomalies(
  tasks: GardenTask[],
  sensorData?: SensorReading[]
): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  // Raggruppa task per pianta
  const plantGroups = new Map<string, GardenTask[]>();
  for (const task of tasks) {
    if (!plantGroups.has(task.plantName)) {
      plantGroups.set(task.plantName, []);
    }
    plantGroups.get(task.plantName)!.push(task);
  }

  for (const [plantName, plantTasks] of plantGroups) {
    // Verifica crescita rallentata
    const growthAnomaly = detectSlowGrowth(plantTasks, plantName);
    if (growthAnomaly) {
      anomalies.push(growthAnomaly);
    }

    // Verifica deviazioni da ciclo atteso
    const cycleAnomaly = detectCycleDeviation(plantTasks, plantName);
    if (cycleAnomaly) {
      anomalies.push(cycleAnomaly);
    }
  }

  return anomalies;
}

/**
 * Rileva crescita rallentata
 */
function detectSlowGrowth(tasks: GardenTask[], plantName: string): Anomaly | null {
  // Cerca task di trapianto e raccolta
  const transplantTask = tasks.find((t) => t.taskType === 'Transplant');
  const harvestTask = tasks.find((t) => t.taskType === 'Harvest');

  if (!transplantTask || !harvestTask) return null;

  // Calcola giorni tra trapianto e raccolta
  const transplantDate = new Date(transplantTask.date);
  const harvestDate = new Date(harvestTask.date);
  const daysToHarvest = Math.ceil(
    (harvestDate.getTime() - transplantDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Tempi attesi per piante comuni (giorni)
  const expectedDays: Record<string, number> = {
    Pomodoro: 90,
    Zucchina: 60,
    Peperone: 90,
    Melanzana: 100,
    Lattuga: 60,
    Basilico: 40,
  };

  const expected = expectedDays[plantName] || 80;
  const delay = daysToHarvest - expected;

  // Se ritardo significativo (>20%)
  if (delay > expected * 0.2) {
    return {
      id: `growth-${plantName}-${Date.now()}`,
      type: 'growth',
      severity: delay > expected * 0.5 ? 'high' : 'medium',
      description: `${plantName}: crescita rallentata. Raccolta dopo ${daysToHarvest} giorni invece di ${expected} attesi (ritardo: +${delay} giorni)`,
      detectedAt: new Date(),
      affectedPlant: plantName,
      possibleCauses: [
        'Terreno non ottimale',
        'Irrigazione insufficiente',
        'Carenze nutrizionali',
        'Condizioni meteo avverse',
        'Malattie o parassiti',
      ],
      suggestedActions: [
        'Verifica umidità terreno',
        'Controlla foglie per segni di carenze',
        'Verifica pH terreno',
        'Considera concimazione',
      ],
      confidence: 0.7,
    };
  }

  return null;
}

/**
 * Rileva deviazioni da ciclo atteso
 */
function detectCycleDeviation(tasks: GardenTask[], plantName: string): Anomaly | null {
  // Verifica se fasi del ciclo sono in ordine corretto
  const phases = ['Sowing', 'Transplant', 'Flowering', 'Fruiting', 'Harvest'];
  const taskPhases = tasks.map((t) => t.taskType).filter((t) => phases.includes(t));

  // Verifica se mancano fasi critiche
  if (taskPhases.includes('Transplant') && !taskPhases.includes('Flowering')) {
    const transplantDate = tasks.find((t) => t.taskType === 'Transplant')?.date;
    if (transplantDate) {
      const daysSinceTransplant = Math.ceil(
        (new Date().getTime() - new Date(transplantDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Se passati più di 60 giorni senza fioritura
      if (daysSinceTransplant > 60) {
        return {
          id: `cycle-${plantName}-${Date.now()}`,
          type: 'pattern',
          severity: 'medium',
          description: `${plantName}: nessuna fioritura dopo ${daysSinceTransplant} giorni dal trapianto`,
          detectedAt: new Date(),
          affectedPlant: plantName,
          possibleCauses: [
            'Eccesso azoto (crescita vegetativa invece di fioritura)',
            'Condizioni meteo non ottimali',
            'Stress idrico',
            'Varietà non adatta al periodo',
          ],
          suggestedActions: [
            'Verifica rapporto NPK del concime',
            'Riduci azoto se eccessivo',
            'Aumenta fosforo per favorire fioritura',
            'Verifica condizioni meteo',
          ],
          confidence: 0.6,
        };
      }
    }
  }

  return null;
}

/**
 * Rileva deviazioni da pattern attesi
 */
export async function detectPatternMismatches(
  expectedPattern: { description: string; expectedDate?: Date; expectedValue?: number },
  actualData: { date?: Date; value?: number },
  memory?: ZoneMemory
): Promise<Anomaly | null> {
  if (!expectedPattern.expectedDate || !actualData.date) return null;

  const daysDiff = Math.abs(
    (actualData.date.getTime() - expectedPattern.expectedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Se deviazione significativa (>30 giorni)
  if (daysDiff > 30) {
    return {
      id: `pattern-${Date.now()}`,
      type: 'pattern',
      severity: daysDiff > 60 ? 'high' : 'medium',
      description: `Pattern atteso non si verifica. Deviazione di ${daysDiff} giorni`,
      detectedAt: new Date(),
      possibleCauses: [
        'Condizioni meteo diverse dall\'atteso',
        'Cambiamenti nel terreno',
        'Gestione diversa rispetto agli anni precedenti',
      ],
      suggestedActions: [
        'Verifica condizioni meteo correnti vs storico',
        'Rivedi pratiche di gestione',
        'Considera adattamenti al piano',
      ],
      confidence: 0.65,
    };
  }

  return null;
}

/**
 * Rileva correlazioni che non funzionano
 */
export async function detectCorrelationMismatches(
  correlations: Correlation[],
  currentData: Record<string, any>,
  garden: Garden
): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  for (const correlation of correlations) {
    if (correlation.strength < 0.5) continue; // Solo correlazioni forti

    // Verifica se condizione correlata è presente ma risultato atteso non si verifica
    const conditionPresent = checkCorrelationCondition(correlation, currentData);

    if (conditionPresent && correlation.impactType === 'positive') {
      // Condizione positiva presente ma risultato non positivo
      anomalies.push({
        id: `correlation-${correlation.factorType}-${Date.now()}`,
        type: 'correlation',
        severity: 'medium',
        description: `Correlazione positiva "${correlation.factorDescription || correlation.factorType}" presente ma risultato atteso non si verifica`,
        detectedAt: new Date(),
        possibleCauses: [
          'Altri fattori negativi che compensano',
          'Correlazione non più valida',
          'Condizioni diverse rispetto al passato',
        ],
        suggestedActions: [
          'Verifica altri fattori che potrebbero influenzare',
          'Rivedi correlazione storica',
        ],
        confidence: 0.5,
      });
    }
  }

  return anomalies;
}

/**
 * Verifica se condizione correlata è presente
 */
function checkCorrelationCondition(correlation: Correlation, currentData: Record<string, any>): boolean {
  const factorType = correlation.factorType.toLowerCase();

  if (factorType.includes('early_planting')) {
    return currentData.earlyPlanting === true;
  }

  if (factorType.includes('high_rain')) {
    return currentData.rainfall > 500; // mm
  }

  if (factorType.includes('clay_soil')) {
    return currentData.soilType === 'Clay';
  }

  return false;
}

/**
 * Genera alert per anomalia
 */
export function generateAnomalyAlert(anomaly: Anomaly): {
  type: 'Anomaly';
  message: string;
  action: string;
  severity: 'low' | 'medium' | 'high';
} {
  return {
    type: 'Anomaly',
    message: `⚠️ ANOMALIA RILEVATA: ${anomaly.description}`,
    action: anomaly.suggestedActions.join('. '),
    severity: anomaly.severity,
  };
}

