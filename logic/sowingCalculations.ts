/**
 * Utility per calcoli automatici relativi a semina e germinazione
 * Calcola piantine attese, area occupata, date trapianto, ecc.
 */

import { PlantMasterSheet } from '../types';

/**
 * Calcola il numero atteso di piantine basato su semi e tasso di germinazione
 * 
 * @param seeds - Numero di semi seminati
 * @param germinationRate - Tasso di germinazione (0-1, es. 0.8 = 80%)
 * @returns Numero atteso di piantine
 */
export function calculateExpectedSeedlings(seeds: number, germinationRate: number): number {
  if (seeds <= 0 || germinationRate < 0 || germinationRate > 1) {
    return 0;
  }
  return Math.round(seeds * germinationRate);
}

/**
 * Calcola l'area occupata durante la germinazione basata su dimensione vassoio
 * 
 * @param traySize - Dimensione vassoio (es. "50 celle", "128 celle")
 * @param cellsPerTray - Numero di celle per vassoio (se non specificato, cerca di parsare da traySize)
 * @returns Area in metri quadri
 */
export function calculateGerminationArea(traySize: string, cellsPerTray?: number): number {
  // Se cellsPerTray è specificato, usalo
  let cells = cellsPerTray;
  
  // Altrimenti prova a parsare da traySize
  if (!cells) {
    const match = traySize.match(/(\d+)/);
    if (match) {
      cells = parseInt(match[1], 10);
    }
  }
  
  if (!cells || cells <= 0) {
    // Default: vassoio standard 50 celle ≈ 0.25 m²
    return 0.25;
  }
  
  // Stima area per cella: celle piccole ≈ 5cm², celle grandi ≈ 10cm²
  // Media: ~7cm² per cella
  const areaPerCellSqm = cells <= 50 ? 0.0007 : 0.0005; // Celle più piccole = più area per cella
  return cells * areaPerCellSqm;
}

/**
 * Calcola l'area occupata dopo il trapianto basata su numero di piantine e spacing
 * 
 * @param seedlings - Numero di piantine da trapiantare
 * @param spacing - Spacing tra le piante in cm {x: distanza sulla fila, y: distanza tra le file}
 * @returns Area in metri quadri
 */
export function calculateFinalPlantingArea(
  seedlings: number, 
  spacing: { x: number; y: number }
): number {
  if (seedlings <= 0 || spacing.x <= 0 || spacing.y <= 0) {
    return 0;
  }
  
  // Area per pianta in m²
  const areaPerPlantSqm = (spacing.x * spacing.y) / 10000; // Converti cm² in m²
  
  return seedlings * areaPerPlantSqm;
}

/**
 * Stima la data di trapianto basata su data semina e dati della pianta
 * 
 * @param sowingDate - Data semina
 * @param plantData - Dati master della pianta (PlantMasterSheet)
 * @returns Data stimata di trapianto (ISO string)
 */
export function estimateTransplantDate(
  sowingDate: Date | string,
  plantData: PlantMasterSheet
): string {
  const sowing = typeof sowingDate === 'string' ? new Date(sowingDate) : sowingDate;
  
  // Calcola giorni totali: germinazione + nursing + hardening
  const avgGerminationDays = plantData.germination?.emergenceDays
    ? (plantData.germination.emergenceDays.min + plantData.germination.emergenceDays.max) / 2
    : 10; // Default 10 giorni
  
  const nursingDays = plantData.seedlingCare?.transplantWhen
    ? 30 // Default 30 giorni di nursing
    : 25;
  
  const hardeningDays = 10; // Default 10 giorni di hardening
  
  const totalDays = Math.round(avgGerminationDays + nursingDays + hardeningDays);
  
  const transplantDate = new Date(sowing);
  transplantDate.setDate(transplantDate.getDate() + totalDays);
  
  return transplantDate.toISOString().split('T')[0];
}

/**
 * Calcola il tasso di germinazione default basato sui dati della pianta
 * 
 * @param plantData - Dati master della pianta
 * @returns Tasso di germinazione (0-1)
 */
export function getDefaultGerminationRate(plantData: PlantMasterSheet): number {
  // Tasso default basato su tipo di pianta
  // Ortaggi comuni: 70-90%
  // Erbe aromatiche: 60-80%
  // Fiori: 50-70%
  
  // Per ora usiamo un default conservativo di 75%
  // In futuro si può migliorare basandosi su dati storici o tipo di pianta
  return 0.75;
}

/**
 * Calcola il numero di celle necessarie per un numero di semi
 * 
 * @param seeds - Numero di semi
 * @param seedsPerCell - Semi per cella (default: 2)
 * @returns Numero di celle necessarie
 */
export function calculateRequiredCells(seeds: number, seedsPerCell: number = 2): number {
  if (seeds <= 0 || seedsPerCell <= 0) {
    return 0;
  }
  return Math.ceil(seeds / seedsPerCell);
}

/**
 * Calcola il numero di vassoi necessari per un numero di celle
 * 
 * @param cells - Numero di celle necessarie
 * @param traySize - Dimensione vassoio (es. "50 celle")
 * @returns Numero di vassoi necessari
 */
export function calculateRequiredTrays(cells: number, traySize: string): number {
  const match = traySize.match(/(\d+)/);
  if (!match) {
    return 1; // Default: 1 vassoio
  }
  
  const cellsPerTray = parseInt(match[1], 10);
  if (cellsPerTray <= 0) {
    return 1;
  }
  
  return Math.ceil(cells / cellsPerTray);
}

