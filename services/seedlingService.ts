/**
 * Seedling Service
 * Gestione batch semenzai con tracking dettagliato
 */

import { PlantMasterSheet, Garden } from '../types';
import { getMasterSheetSync } from './plantMasterService';

export interface SeedlingBatch {
  id: string;
  plantName: string;
  variety?: string;
  sowingDate: string; // ISO date string (per semine) o purchaseDate (per acquisti)
  quantity: number; // Mantenuto per retrocompatibilità
  initialQuantity?: number; // Quantità iniziale di piantine (es. 20)
  currentQuantity?: number; // Quantità corrente disponibile (es. 18 dopo averne usate 2)
  survivingQuantity?: number; // Alias legacy per currentQuantity
  location: 'Indoor' | 'Greenhouse' | 'ColdFrame';
  phase: 'Sowing' | 'Germination' | 'Nursing' | 'Hardening' | 'ReadyToTransplant';
  expectedTransplantDate?: string; // ISO date string
  notes?: string;
  photoLog?: { date: string; image: string; notes?: string }[];
  gardenId: string;
  
  // NUOVO: Distingue tra semine in casa e acquisti al vivaio
  source?: 'home' | 'nursery'; // 'home' = seminate in casa, 'nursery' = acquistate al vivaio
  purchaseDate?: string; // Data acquisto (solo per source='nursery')
  nurseryName?: string; // Nome vivaio (opzionale)
}

/**
 * Crea un nuovo batch di semenzai
 */
export const createSeedlingBatch = (
  plantName: string,
  sowingDate: string,
  quantity: number,
  location: 'Indoor' | 'Greenhouse' | 'ColdFrame',
  gardenId: string,
  variety?: string
): SeedlingBatch => {
  const masterData = getMasterSheetSync(plantName);
  if (!masterData) {
    throw new Error(`Pianta ${plantName} non trovata nel database`);
  }

  // Calcola data trapianto attesa (basata su germination + nursing + hardening)
  const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
  const nursingDays = 30; // Fase nursing standard
  const hardeningDays = 10; // Fase hardening standard
  const totalDays = avgGerminationDays + nursingDays + hardeningDays;

  const sowing = new Date(sowingDate);
  const expectedTransplant = new Date(sowing);
  expectedTransplant.setDate(expectedTransplant.getDate() + totalDays);

  return {
    id: crypto.randomUUID(),
    plantName,
    variety,
    sowingDate,
    quantity,
    initialQuantity: quantity, // Imposta initialQuantity = quantity per nuovi batch
    currentQuantity: quantity,
    survivingQuantity: quantity,
    location,
    phase: 'Sowing',
    expectedTransplantDate: expectedTransplant.toISOString().split('T')[0],
    gardenId,
    photoLog: []
  };
};

/**
 * Calcola data semina ottimale per un target di trapianto
 */
export const calculateOptimalSowingDate = (
  plantName: string,
  targetTransplantDate: string,
  garden: Garden
): string | null => {
  const masterData = getMasterSheetSync(plantName);
  if (!masterData) return null;

  // Calcola giorni necessari (germinazione + nursing + hardening)
  const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
  const nursingDays = 30;
  const hardeningDays = 10;
  const totalDays = avgGerminationDays + nursingDays + hardeningDays;

  const targetDate = new Date(targetTransplantDate);
  const optimalSowing = new Date(targetDate);
  optimalSowing.setDate(optimalSowing.getDate() - totalDays);

  // Verifica che la data non sia nel passato
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (optimalSowing < today) {
    return null; // Troppo tardi per seminare
  }

  return optimalSowing.toISOString().split('T')[0];
};

/**
 * Ottieni timeline per un batch
 */
export const getSeedlingTimeline = (batch: SeedlingBatch): {
  phase: SeedlingBatch['phase'];
  daysInPhase: number;
  nextPhase?: SeedlingBatch['phase'];
  daysToNextPhase?: number;
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sowingDate = new Date(batch.sowingDate);
  sowingDate.setHours(0, 0, 0, 0);
  const daysSinceSowing = Math.floor((today.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));

  const masterData = getMasterSheetSync(batch.plantName);
  if (!masterData) {
    return { phase: batch.phase, daysInPhase: daysSinceSowing };
  }

  const avgGerminationDays = (masterData.germination.emergenceDays.min + masterData.germination.emergenceDays.max) / 2;
  const nursingDays = 30;
  const hardeningDays = 10;

  let phase: SeedlingBatch['phase'] = 'Sowing';
  let daysInPhase = daysSinceSowing;
  let nextPhase: SeedlingBatch['phase'] | undefined;
  let daysToNextPhase: number | undefined;

  if (daysSinceSowing < avgGerminationDays) {
    phase = 'Germination';
    daysInPhase = daysSinceSowing;
    nextPhase = 'Nursing';
    daysToNextPhase = avgGerminationDays - daysSinceSowing;
  } else if (daysSinceSowing < avgGerminationDays + nursingDays) {
    phase = 'Nursing';
    daysInPhase = daysSinceSowing - avgGerminationDays;
    nextPhase = 'Hardening';
    daysToNextPhase = (avgGerminationDays + nursingDays) - daysSinceSowing;
  } else if (daysSinceSowing < avgGerminationDays + nursingDays + hardeningDays) {
    phase = 'Hardening';
    daysInPhase = daysSinceSowing - (avgGerminationDays + nursingDays);
    nextPhase = 'ReadyToTransplant';
    daysToNextPhase = (avgGerminationDays + nursingDays + hardeningDays) - daysSinceSowing;
  } else {
    phase = 'ReadyToTransplant';
    daysInPhase = daysSinceSowing - (avgGerminationDays + nursingDays + hardeningDays);
  }

  return { phase, daysInPhase, nextPhase, daysToNextPhase };
};

/**
 * Verifica se è il momento di iniziare hardening
 */
export const shouldStartHardening = (
  batch: SeedlingBatch,
  garden: Garden
): { shouldStart: boolean; reason?: string } => {
  const timeline = getSeedlingTimeline(batch);
  
  if (timeline.phase !== 'Nursing') {
    return { shouldStart: false, reason: 'Non ancora in fase nursing' };
  }

  // Inizia hardening quando mancano 10-14 giorni al trapianto previsto
  if (timeline.daysToNextPhase && timeline.daysToNextPhase <= 14) {
    return { 
      shouldStart: true, 
      reason: `Mancano ${timeline.daysToNextPhase} giorni al trapianto previsto` 
    };
  }

  return { shouldStart: false };
};

/**
 * Verifica se il batch è pronto per trapianto
 */
export const isReadyToTransplant = (
  batch: SeedlingBatch,
  garden: Garden
): { ready: boolean; reason?: string; warnings?: string[] } => {
  // Piantine acquistate sono sempre pronte (se hanno quantità disponibile)
  if (batch.source === 'nursery') {
    if (!batch.currentQuantity || batch.currentQuantity === 0) {
      return { ready: false, reason: 'Nessuna piantina disponibile' };
    }
    return { ready: true };
  }
  
  // Per semine in casa, usa la logica esistente
  const timeline = getSeedlingTimeline(batch);
  const warnings: string[] = [];

  if (timeline.phase !== 'ReadyToTransplant' && timeline.phase !== 'Hardening') {
    return { ready: false, reason: 'Non ancora pronto per trapianto' };
  }

  // Verifica che ci siano piantine sopravvissute
  if (!batch.currentQuantity || batch.currentQuantity === 0) {
    return { ready: false, reason: 'Nessuna piantina sopravvissuta' };
  }

  // Verifica che la fase hardening sia completata (almeno 7 giorni)
  if (timeline.phase === 'Hardening' && timeline.daysInPhase < 7) {
    return { 
      ready: false, 
      reason: `Hardening in corso: ${timeline.daysInPhase} giorni (minimo 7 giorni richiesti)` 
    };
  }

  // Warnings
  if (batch.currentQuantity < batch.quantity * 0.5) {
    warnings.push(`Solo ${batch.currentQuantity}/${batch.quantity} piantine sopravvissute (50% o meno)`);
  }

  if (timeline.phase === 'Hardening' && timeline.daysInPhase < 10) {
    warnings.push('Hardening ancora in corso, considera di aspettare altri giorni');
  }

  return { 
    ready: timeline.phase === 'ReadyToTransplant' || (timeline.phase === 'Hardening' && timeline.daysInPhase >= 7),
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

/**
 * Aggiorna fase di un batch
 */
export const updateBatchPhase = (
  batch: SeedlingBatch,
  newPhase: SeedlingBatch['phase']
): SeedlingBatch => {
  return {
    ...batch,
    phase: newPhase
  };
};

/**
 * Aggiungi foto al log
 */
export const addPhotoToLog = (
  batch: SeedlingBatch,
  image: string,
  notes?: string
): SeedlingBatch => {
  return {
    ...batch,
    photoLog: [
      ...(batch.photoLog || []),
      {
        date: new Date().toISOString().split('T')[0],
        image,
        notes
      }
    ]
  };
};

/**
 * Aggiorna quantità sopravvissute
 */
export const updateSurvivalCount = (
  batch: SeedlingBatch,
  currentQuantity: number
): SeedlingBatch => {
  const nextQuantity = Math.max(0, Math.min(currentQuantity, batch.quantity))
  return {
    ...batch,
    currentQuantity: nextQuantity,
    survivingQuantity: nextQuantity
  };
};

/**
 * Crea un batch di piantine acquistate al vivaio
 * Queste sono già pronte per trapianto (fase ReadyToTransplant)
 */
export const createPurchasedSeedlingBatch = (
  plantName: string,
  purchaseDate: string,
  quantity: number,
  gardenId: string,
  variety?: string,
  nurseryName?: string,
  notes?: string
): SeedlingBatch => {
  const masterData = getMasterSheetSync(plantName);
  if (!masterData) {
    throw new Error(`Pianta ${plantName} non trovata nel database`);
  }

  return {
    id: crypto.randomUUID(),
    plantName,
    variety,
    sowingDate: purchaseDate, // Usa purchaseDate come sowingDate per compatibilità
    purchaseDate,
    quantity,
    initialQuantity: quantity, // Imposta initialQuantity = quantity per piantine acquistate
    location: 'Indoor', // Default, può essere modificato dopo
    phase: 'ReadyToTransplant', // Piantine acquistate sono già pronte
    currentQuantity: quantity, // Tutte disponibili inizialmente
    survivingQuantity: quantity,
    expectedTransplantDate: purchaseDate, // Può essere trapiantate subito
    gardenId,
    source: 'nursery',
    nurseryName,
    notes,
    photoLog: []
  };
};
