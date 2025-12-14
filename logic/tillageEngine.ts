/**
 * Tillage Engine
 * Gestisce tutte le lavorazioni terra: principali, complementari, no-dig
 * Estende/espande mechanicalWorkEngine con funzionalità complete
 */

import { Garden } from '../types';
import { SoilState } from '../services/soilStateService';
import { calculateTemperaDate, isSoilInTempera, getOptimalWorkWindow as getSoilOptimalWorkWindow } from './soilTimingEngine';
import { getWeatherForecast } from '../services/weatherService';

export type TillageWorkType =
  | 'Vangatura'
  | 'Aratura'
  | 'Fresatura'
  | 'Scasso'
  | 'Zappatura'
  | 'Sarchiatura'
  | 'Rincalzatura'
  | 'Erpicatura'
  | 'Rullatura'
  | 'Pacciamatura'
  | 'NoDig';

export interface TillageWork {
  workType: TillageWorkType;
  priority: 'high' | 'medium' | 'low';
  message: string;
  suggestedDate: Date;
  optimalWindow: { start: Date; end: Date };
  depth?: number; // cm
  area?: number; // m²
  tool?: string; // ID attrezzo consigliato
  instructions: string[];
  weatherWarning?: string;
  reason: string;
}

export interface TillageProblem {
  type: 'compaction' | 'hardpan' | 'erosion' | 'inversion';
  severity: 'low' | 'medium' | 'high';
  description: string;
  solution: string[];
}

/**
 * Suggerisce lavorazione terra
 */
export async function suggestTillageWork(
  garden: Garden,
  zoneId: string,
  soilState?: SoilState,
  plannedPlanting?: { plantName: string; date: Date }
): Promise<TillageWork | null> {
  if (!garden.coordinates) {
    return null;
  }

  // Verifica se terreno è in tempera
  const temperaCheck = await isSoilInTempera(garden, {
    lastRainDate: soilState?.lastRainDate,
    lastRainAmount: soilState?.lastRainAmount,
    currentTemp: undefined,
  });

  if (!temperaCheck.isTempera) {
    return {
      workType: 'Vangatura',
      priority: 'low',
      message: `Terreno non ancora in tempera: ${temperaCheck.reason}`,
      suggestedDate: new Date(),
      optimalWindow: { start: new Date(), end: new Date() },
      instructions: ['Aspetta che terreno sia in tempera prima di lavorare'],
      reason: temperaCheck.reason,
    };
  }

  // Determina tipo lavorazione necessario
  let workType: TillageWorkType = 'Vangatura';
  let reason = 'Preparazione terreno per nuova stagione';

  if (plannedPlanting) {
    const daysUntilPlanting = Math.ceil(
      (plannedPlanting.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilPlanting <= 7) {
      workType = 'Vangatura';
      reason = `Preparazione terreno per ${plannedPlanting.plantName} tra ${daysUntilPlanting} giorni`;
    } else if (daysUntilPlanting <= 14) {
      workType = 'Zappatura';
      reason = `Preparazione superficiale per ${plannedPlanting.plantName}`;
    }
  }

  // Verifica compattazione
  if (soilState && soilState.compaction < 0.5) {
    workType = 'Sarchiatura';
    reason = 'Terreno compattato. Sarchiatura migliorerà aerazione';
  }

  // Calcola finestra ottimale
  const optimalWindow = await getSoilOptimalWorkWindow(
    garden,
    soilState?.lastRainDate || new Date(),
    soilState?.lastRainAmount || 0
  );

  // Genera istruzioni
  const instructions = generateWorkInstructions(workType, garden, soilState);

  return {
    workType,
    priority: plannedPlanting && plannedPlanting.date.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 ? 'high' : 'medium',
    message: `Lavorazione consigliata: ${workType}`,
    suggestedDate: optimalWindow.startDate,
    optimalWindow: { start: optimalWindow.startDate, end: optimalWindow.endDate },
    depth: getWorkDepth(workType),
    area: garden.sizeSqMeters,
    instructions,
    reason,
  };
}

/**
 * Calcola quando terreno sarà in tempera (wrapper per soilTimingEngine)
 */
export async function calculateTemperaTiming(
  garden: Garden,
  lastRainDate: Date,
  lastRainAmount: number
): Promise<{ isTempera: boolean; date?: Date; reason: string }> {
  if (!garden.coordinates) {
    return { isTempera: false, reason: 'Coordinate non disponibili' };
  }

  const temperaDate = await calculateTemperaDate(garden, lastRainDate, lastRainAmount);
  const check = await isSoilInTempera(garden, {
    lastRainDate,
    lastRainAmount,
  });

  return {
    isTempera: check.isTempera,
    date: temperaDate,
    reason: check.reason,
  };
}

/**
 * Ottiene finestra ottimale lavorazione
 */
export async function getOptimalWorkWindow(
  garden: Garden,
  soilState?: SoilState
): Promise<{ start: Date; end: Date; confidence: number; reason: string }> {
  if (!garden.coordinates || !soilState?.lastRainDate) {
    return {
      start: new Date(),
      end: new Date(),
      confidence: 0,
      reason: 'Dati insufficienti',
    };
  }

  const window = await getSoilOptimalWorkWindow(
    garden,
    soilState.lastRainDate,
    soilState.lastRainAmount || 0
  );

  return {
    start: window.startDate,
    end: window.endDate,
    confidence: window.confidence,
    reason: window.reason,
  };
}

/**
 * Suggerisce metodo lavorazione
 */
export function suggestTillageMethod(
  area: number,
  soilType: Garden['soilType'],
  equipmentAvailable: string[] = []
): { method: TillageWorkType; tool?: string; reason: string } {
  // Area piccola: manuale
  if (area < 100) {
    return {
      method: 'Vangatura',
      tool: 'vanga',
      reason: 'Area piccola, lavorazione manuale sufficiente',
    };
  }

  // Area media: motozappa o manuale
  if (area < 1000) {
    if (equipmentAvailable.includes('motozappa')) {
      return {
        method: 'Fresatura',
        tool: 'motozappa',
        reason: 'Area media, motozappa consigliata',
      };
    }
    return {
      method: 'Vangatura',
      tool: 'vanga',
      reason: 'Area media, lavorazione manuale possibile',
    };
  }

  // Area grande: trattore
  if (area >= 1000) {
    if (equipmentAvailable.includes('trattore')) {
      return {
        method: 'Aratura',
        tool: 'trattore_aratro',
        reason: 'Area grande, trattore necessario',
      };
    }
    return {
      method: 'Fresatura',
      tool: 'motocoltivatore',
      reason: 'Area grande, motocoltivatore consigliato',
    };
  }

  return {
    method: 'Vangatura',
    reason: 'Metodo standard',
  };
}

/**
 * Rileva problemi lavorazione
 */
export function checkTillageProblems(
  soilState: SoilState,
  history: Array<{ workType: string; date: Date; depth?: number }>
): TillageProblem[] {
  const problems: TillageProblem[] = [];

  // Verifica compattazione
  if (soilState.compaction < 0.3) {
    problems.push({
      type: 'compaction',
      severity: 'high',
      description: 'Terreno molto compatto. Aerazione insufficiente.',
      solution: [
        'Esegui sarchiatura profonda',
        'Aggiungi sostanza organica (compost)',
        'Evita calpestio quando terreno è bagnato',
      ],
    });
  }

  // Verifica suola di lavorazione (stessa profondità ripetuta)
  if (history.length >= 3) {
    const depths = history
      .filter((h) => h.depth)
      .map((h) => h.depth!)
      .slice(-3);

    if (depths.length === 3 && depths.every((d) => Math.abs(d - depths[0]) < 5)) {
      problems.push({
        type: 'hardpan',
        severity: 'medium',
        description: `Suola di lavorazione rilevata a ${depths[0]}cm. Stessa profondità ripetuta.`,
        solution: [
          'Varia profondità lavorazione',
          'Esegui scasso profondo ogni 3-4 anni',
          'Usa forca invece di vanga per rompere suola',
        ],
      });
    }
  }

  return problems;
}

/**
 * Genera istruzioni lavorazione
 */
function generateWorkInstructions(
  workType: TillageWorkType,
  garden: Garden,
  soilState?: SoilState
): string[] {
  const instructions: string[] = [];

  switch (workType) {
    case 'Vangatura':
      instructions.push('Scava buche profonde 30-40cm');
      instructions.push('Rivolta zolle per esporre terreno inferiore');
      instructions.push('Rimuovi sassi e radici');
      if (soilState && soilState.compaction < 0.5) {
        instructions.push('Aggiungi compost durante vangatura per migliorare struttura');
      }
      break;

    case 'Sarchiatura':
      instructions.push('Lavora superficie 5-10cm di profondità');
      instructions.push('Rompi crosta superficiale');
      instructions.push('Elimina infestanti');
      instructions.push('Arieggia terreno senza rivoltare strati');
      break;

    case 'Rincalzatura':
      instructions.push('Accumula terreno attorno a base pianta');
      instructions.push('Altezza cumulo: 10-15cm');
      instructions.push('Utile per patate, porri, finocchi, asparagi');
      break;

    case 'Pacciamatura':
      instructions.push('Stendi materiale organico (paglia, cartone, compost)');
      instructions.push('Spessore: 5-10cm');
      instructions.push('Lascia spazio attorno a colletto piante');
      break;

    case 'NoDig':
      instructions.push('NON lavorare terreno');
      instructions.push('Stendi cartone + compost sopra terreno');
      instructions.push('Piantare direttamente nel compost');
      instructions.push('Ottimo per terreni già strutturati');
      break;

    default:
      instructions.push(`Esegui ${workType} secondo metodo standard`);
  }

  return instructions;
}

/**
 * Ottiene profondità lavorazione
 */
function getWorkDepth(workType: TillageWorkType): number {
  const depths: Record<TillageWorkType, number> = {
    Vangatura: 40,
    Aratura: 30,
    Fresatura: 20,
    Scasso: 60,
    Zappatura: 15,
    Sarchiatura: 8,
    Rincalzatura: 0, // Superficiale
    Erpicatura: 5,
    Rullatura: 0,
    Pacciamatura: 0,
    NoDig: 0,
  };

  return depths[workType] || 20;
}

