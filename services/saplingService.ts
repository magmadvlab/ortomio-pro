/**
 * Sapling Service
 * Gestione alberelli per nuovi impianti di frutteti, uliveti, vigneti
 */

import { Garden } from '../types';
import { FruitTreeCrop } from '../types/fruitTree';
import { OliveCrop } from '../types/olive';
import { VineCrop } from '../types/vine';
import { getMasterSheet } from './plantMasterService';
import { fruitTreeMasterSheets } from '../data/fruitTreeMasterSheets';
import { oliveMasterSheets } from '../data/oliveMasterSheets';
import { vineMasterSheets } from '../data/vineMasterSheets';

export type SaplingType = 'FruitTree' | 'Olive' | 'Vine';

export interface SaplingBatch {
  id: string;
  plantName: string;
  variety?: string;
  saplingType: SaplingType;
  purchaseDate: string; // ISO date string
  plantingDate?: string; // ISO date string - quando messo a dimora
  quantity: number;
  location: string; // Nome area/letto dove piantare
  phase: 'Purchased' | 'Planted' | 'Establishing' | 'Growing' | 'ReadyToOrchard';
  currentQuantity?: number; // Sopravvissuti
  expectedEstablishmentDate?: string; // ISO date string - quando dovrebbe attecchire
  rootstock?: string; // Portinnesto (per frutteti)
  spacing?: string; // Distanza tra piante
  notes?: string;
  photoLog?: { date: string; image: string; notes?: string }[];
  gardenId: string;
  // Collegamento a impianto specializzato (quando creato)
  specializedCropId?: string;
}

/**
 * Crea un nuovo batch di alberelli
 */
export const createSaplingBatch = (
  plantName: string,
  saplingType: SaplingType,
  purchaseDate: string,
  quantity: number,
  location: string,
  gardenId: string,
  variety?: string,
  rootstock?: string,
  spacing?: string
): SaplingBatch => {
  // Verifica che la pianta esista nel database appropriato
  let masterData: FruitTreeCrop | OliveCrop | VineCrop | null = null;
  
  if (saplingType === 'FruitTree') {
    masterData = fruitTreeMasterSheets.find(s => 
      s.id.toLowerCase().includes(plantName.toLowerCase()) ||
      s.commonName.toLowerCase().includes(plantName.toLowerCase())
    ) as FruitTreeCrop | undefined || null;
  } else if (saplingType === 'Olive') {
    masterData = oliveMasterSheets.find(s => 
      s.id.toLowerCase().includes(plantName.toLowerCase()) ||
      s.commonName.toLowerCase().includes(plantName.toLowerCase())
    ) as OliveCrop | undefined || null;
  } else if (saplingType === 'Vine') {
    masterData = vineMasterSheets.find(s => 
      s.id.toLowerCase().includes(plantName.toLowerCase()) ||
      s.commonName.toLowerCase().includes(plantName.toLowerCase())
    ) as VineCrop | undefined || null;
  }

  if (!masterData) {
    throw new Error(`Pianta ${plantName} non trovata nel database per tipo ${saplingType}`);
  }

  // Calcola data attecchimento attesa (basata su tipo)
  const establishmentDays = getEstablishmentDays(saplingType);
  const purchase = new Date(purchaseDate);
  const expectedEstablishment = new Date(purchase);
  expectedEstablishment.setDate(expectedEstablishment.getDate() + establishmentDays);

  return {
    id: crypto.randomUUID(),
    plantName,
    variety,
    saplingType,
    purchaseDate,
    quantity,
    location,
    phase: 'Purchased',
    currentQuantity: quantity,
    expectedEstablishmentDate: expectedEstablishment.toISOString().split('T')[0],
    rootstock,
    spacing,
    gardenId,
    photoLog: []
  };
};

/**
 * Ottieni giorni di attecchimento in base al tipo
 */
function getEstablishmentDays(saplingType: SaplingType): number {
  switch (saplingType) {
    case 'FruitTree':
      return 90; // 3 mesi per attecchimento alberi da frutto
    case 'Olive':
      return 120; // 4 mesi per olivi
    case 'Vine':
      return 60; // 2 mesi per viti
    default:
      return 90;
  }
}

/**
 * Calcola data messa a dimora ottimale
 */
export const calculateOptimalPlantingDate = (
  saplingType: SaplingType,
  targetEstablishmentDate: string,
  garden: Garden
): string | null => {
  const establishmentDays = getEstablishmentDays(saplingType);
  const targetDate = new Date(targetEstablishmentDate);
  const optimalPlanting = new Date(targetDate);
  optimalPlanting.setDate(optimalPlanting.getDate() - establishmentDays);

  // Verifica che la data non sia nel passato
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (optimalPlanting < today) {
    return null;
  }

  return optimalPlanting.toISOString().split('T')[0];
};

/**
 * Ottieni timeline per un batch
 */
export const getSaplingTimeline = (batch: SaplingBatch): {
  phase: SaplingBatch['phase'];
  daysInPhase: number;
  nextPhase?: SaplingBatch['phase'];
  daysToNextPhase?: number;
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let referenceDate: Date;
  if (batch.plantingDate) {
    referenceDate = new Date(batch.plantingDate);
  } else {
    referenceDate = new Date(batch.purchaseDate);
  }
  referenceDate.setHours(0, 0, 0, 0);
  
  const daysSinceReference = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
  const establishmentDays = getEstablishmentDays(batch.saplingType);

  let phase: SaplingBatch['phase'] = batch.phase;
  let daysInPhase = daysSinceReference;
  let nextPhase: SaplingBatch['phase'] | undefined;
  let daysToNextPhase: number | undefined;

  if (!batch.plantingDate) {
    phase = 'Purchased';
    nextPhase = 'Planted';
  } else if (daysSinceReference < establishmentDays) {
    phase = 'Establishing';
    daysInPhase = daysSinceReference;
    nextPhase = 'Growing';
    daysToNextPhase = establishmentDays - daysSinceReference;
  } else if (daysSinceReference < establishmentDays + 180) {
    phase = 'Growing';
    daysInPhase = daysSinceReference - establishmentDays;
    nextPhase = 'ReadyToOrchard';
    daysToNextPhase = (establishmentDays + 180) - daysSinceReference;
  } else {
    phase = 'ReadyToOrchard';
    daysInPhase = daysSinceReference - (establishmentDays + 180);
  }

  return { phase, daysInPhase, nextPhase, daysToNextPhase };
};

/**
 * Verifica se il batch è pronto per creare impianto
 */
export const isReadyToOrchard = (
  batch: SaplingBatch,
  garden: Garden
): { ready: boolean; reason?: string; warnings?: string[] } => {
  const timeline = getSaplingTimeline(batch);
  const warnings: string[] = [];

  if (timeline.phase !== 'ReadyToOrchard' && timeline.phase !== 'Growing') {
    return { ready: false, reason: 'Non ancora pronto per creare impianto' };
  }

  // Deve essere stato piantato
  if (!batch.plantingDate) {
    return { ready: false, reason: 'Alberello non ancora messo a dimora' };
  }

  // Verifica che ci siano alberelli sopravvissuti
  if (!batch.currentQuantity || batch.currentQuantity === 0) {
    return { ready: false, reason: 'Nessun alberello sopravvissuto' };
  }

  // Warnings
  if (batch.currentQuantity < batch.quantity * 0.7) {
    warnings.push(`Solo ${batch.currentQuantity}/${batch.quantity} alberelli sopravvissuti (70% o meno)`);
  }

  if (timeline.phase === 'Growing' && timeline.daysInPhase < 90) {
    warnings.push('Alberello ancora in fase di crescita, considera di aspettare altri mesi');
  }

  return { 
    ready: timeline.phase === 'ReadyToOrchard' || (timeline.phase === 'Growing' && timeline.daysInPhase >= 90),
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

/**
 * Aggiorna fase di un batch
 */
export const updateSaplingPhase = (
  batch: SaplingBatch,
  newPhase: SaplingBatch['phase']
): SaplingBatch => {
  return {
    ...batch,
    phase: newPhase
  };
};

/**
 * Registra messa a dimora
 */
export const recordPlanting = (
  batch: SaplingBatch,
  plantingDate: string,
  actualQuantity?: number
): SaplingBatch => {
  const establishmentDays = getEstablishmentDays(batch.saplingType);
  const planting = new Date(plantingDate);
  const expectedEstablishment = new Date(planting);
  expectedEstablishment.setDate(expectedEstablishment.getDate() + establishmentDays);

  return {
    ...batch,
    plantingDate,
    phase: 'Planted',
    currentQuantity: actualQuantity ?? batch.currentQuantity,
    expectedEstablishmentDate: expectedEstablishment.toISOString().split('T')[0]
  };
};

/**
 * Aggiungi foto al log
 */
export const addPhotoToLog = (
  batch: SaplingBatch,
  image: string,
  notes?: string
): SaplingBatch => {
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
 * Aggiorna quantità sopravvissuti
 */
export const updateSurvivalCount = (
  batch: SaplingBatch,
  currentQuantity: number
): SaplingBatch => {
  return {
    ...batch,
    currentQuantity: Math.max(0, Math.min(currentQuantity, batch.quantity))
  };
};

/**
 * Collega batch a impianto specializzato creato
 */
export const linkToSpecializedCrop = (
  batch: SaplingBatch,
  specializedCropId: string
): SaplingBatch => {
  return {
    ...batch,
    specializedCropId,
    phase: 'ReadyToOrchard'
  };
};

/**
 * Usa alberelli per una piantagione (riduce la quantità disponibile)
 * Questa funzione viene chiamata quando si crea un task di trapianto con alberelli
 * 
 * @param storageProvider - Storage provider per accedere ai batch
 * @param batchId - ID del batch di alberelli
 * @param quantity - Quantità di alberelli da usare
 * @returns true se l'operazione è riuscita, false altrimenti
 */
export const useSaplingForPlanting = async (
  storageProvider: any, // IStorageProvider
  batchId: string,
  quantity: number
): Promise<boolean> => {
  try {
    const batch = await storageProvider.getSaplingBatch(batchId);
    if (!batch || (batch.currentQuantity || 0) < quantity) {
      return false;
    }
    
    const newQuantity = Math.max(0, (batch.currentQuantity || 0) - quantity);
    await storageProvider.updateSaplingBatch(batchId, {
      ...batch,
      currentQuantity: newQuantity
    });
    
    return true;
  } catch (error) {
    console.error('Error using sapling batch for planting:', error);
    return false;
  }
};

/**
 * Crea un nuovo impianto specializzato da un batch di alberelli
 * Questa funzione viene chiamata quando un alberello è pronto per essere trasformato in un impianto permanente
 * 
 * @param batch - Batch di alberelli pronto
 * @param gardenId - ID del giardino
 * @returns ID dell'impianto creato (da implementare con storage provider)
 */
export const createOrchardFromSapling = async (
  batch: SaplingBatch,
  gardenId: string
): Promise<string> => {
  // TODO: Implementare creazione impianto specializzato
  // 1. Crea un nuovo GardenTask con tipo appropriato (FruitTree, Olive, Vine)
  // 2. Imposta treeAge a 0 (nuovo impianto)
  // 3. Usa dati dal batch (varietà, portinnesto, posizione)
  // 4. Collega il batch all'impianto creato con linkToSpecializedCrop
  // 5. Salva nel storage provider
  
  const specializedCropId = crypto.randomUUID();
  
  // Per ora restituiamo solo l'ID, l'implementazione completa richiede:
  // - Accesso al storage provider
  // - Creazione del GardenTask appropriato
  // - Integrazione con director per gestire il nuovo impianto
  
  return specializedCropId;
};

