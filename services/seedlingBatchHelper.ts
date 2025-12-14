/**
 * Seedling Batch Helper
 * Funzioni helper per filtrare e gestire batch di piantine
 */

import { SeedlingBatch } from './seedlingService';
import { Garden } from '../types';
import { isReadyToTransplant } from './seedlingService';

/**
 * Ottiene tutti i batch pronti per trapianto per una specifica pianta
 */
export function getReadyBatchesForPlant(
  plantName: string,
  batches: SeedlingBatch[],
  garden?: Garden
): SeedlingBatch[] {
  if (!garden) {
    return batches.filter(b => 
      b.plantName.toLowerCase() === plantName.toLowerCase() &&
      (b.phase === 'ReadyToTransplant' || b.phase === 'Hardening')
    );
  }

  return batches.filter(batch => {
    if (batch.plantName.toLowerCase() !== plantName.toLowerCase()) {
      return false;
    }

    const readyCheck = isReadyToTransplant(batch, garden);
    return readyCheck.ready;
  });
}

/**
 * Verifica se esiste almeno un batch pronto per una specifica pianta
 */
export function hasReadyBatchForPlant(
  plantName: string,
  batches: SeedlingBatch[],
  garden?: Garden
): boolean {
  return getReadyBatchesForPlant(plantName, batches, garden).length > 0;
}

/**
 * Ottiene la prossima data di trapianto per una specifica pianta
 */
export function getNextTransplantDate(
  plantName: string,
  batches: SeedlingBatch[],
  garden?: Garden
): Date | null {
  const readyBatches = getReadyBatchesForPlant(plantName, batches, garden);
  
  if (readyBatches.length === 0) {
    return null;
  }

  // Ordina per expectedTransplantDate crescente
  const sortedBatches = readyBatches.sort((a, b) => {
    const dateA = a.expectedTransplantDate ? new Date(a.expectedTransplantDate).getTime() : Infinity;
    const dateB = b.expectedTransplantDate ? new Date(b.expectedTransplantDate).getTime() : Infinity;
    return dateA - dateB;
  });

  const nextBatch = sortedBatches[0];
  if (!nextBatch.expectedTransplantDate) {
    return null;
  }

  return new Date(nextBatch.expectedTransplantDate);
}

/**
 * Ottiene tutti i batch pronti per trapianto (qualsiasi pianta)
 */
export function getAllReadyBatches(
  batches: SeedlingBatch[],
  garden?: Garden
): SeedlingBatch[] {
  if (!garden) {
    return batches.filter(b => 
      b.phase === 'ReadyToTransplant' || 
      (b.phase === 'Hardening' && b.currentQuantity && b.currentQuantity > 0)
    );
  }

  return batches.filter(batch => {
    const readyCheck = isReadyToTransplant(batch, garden);
    return readyCheck.ready;
  });
}

/**
 * Conta il numero totale di piantine pronte per trapianto
 */
export function countReadySeedlings(
  batches: SeedlingBatch[],
  garden?: Garden
): number {
  const readyBatches = getAllReadyBatches(batches, garden);
  return readyBatches.reduce((total, batch) => {
    return total + (batch.currentQuantity || 0);
  }, 0);
}

/**
 * Ottiene i prossimi N batch pronti ordinati per data di trapianto
 */
export function getNextReadyBatches(
  batches: SeedlingBatch[],
  limit: number = 3,
  garden?: Garden
): SeedlingBatch[] {
  const readyBatches = getAllReadyBatches(batches, garden);
  
  // Ordina per expectedTransplantDate crescente
  const sorted = readyBatches.sort((a, b) => {
    const dateA = a.expectedTransplantDate ? new Date(a.expectedTransplantDate).getTime() : Infinity;
    const dateB = b.expectedTransplantDate ? new Date(b.expectedTransplantDate).getTime() : Infinity;
    return dateA - dateB;
  });

  return sorted.slice(0, limit);
}


