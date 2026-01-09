/**
 * Servizio per rilevamento automatico di frutteti, oliveti e vigneti esistenti
 * Analizza i task esistenti nel giardino per determinare se esiste già una configurazione
 */

import { Garden, GardenTask } from '../types';
import { FruitTreeCrop } from '../types/fruitTree';
import { OliveCrop } from '../types/olive';
import { VineCrop } from '../types/vine';
import { FruitTreeCategory } from '../types/orchardTypes';
import { getMasterSheet } from './plantMasterService';
import { getCategoryForMasterSheet } from './fruitTreeCategoryService';

export type OliveType = 'OIL' | 'TABLE' | 'DUAL_PURPOSE';
export type VineType = 'WINE' | 'TABLE';

export interface OrchardDetectionResult {
  exists: boolean;
  category?: FruitTreeCategory;
  count?: number;
  varieties?: string[];
}

export interface OliveGroveDetectionResult {
  exists: boolean;
  type?: OliveType;
  count?: number;
  varieties?: string[];
}

export interface VineyardDetectionResult {
  exists: boolean;
  type?: VineType;
  count?: number;
  varieties?: string[];
  trainingSystem?: 'Guyot' | 'Cordon' | 'Pergola' | 'Alberello';
}

/**
 * Rileva se esiste già un frutteto nel giardino analizzando i task esistenti
 */
export async function detectExistingOrchard(
  gardenId: string,
  tasks: GardenTask[]
): Promise<OrchardDetectionResult> {
  // Filtra solo task di alberi da frutto (con verifica async)
  const fruitTreeTasksPromises = tasks.map(async (t) => {
    if (!t.fruitTreeData) return null;
    const master = await getMasterSheet(t.plantName);
    return master?.cropType === 'FruitTree' ? t : null;
  });
  const fruitTreeTasksResults = await Promise.all(fruitTreeTasksPromises);
  const fruitTreeTasks = fruitTreeTasksResults.filter((t): t is GardenTask => t !== null);
  
  if (fruitTreeTasks.length === 0) {
    return { exists: false };
  }
  
  // Determina categoria dominante
  const categories: FruitTreeCategory[] = [];
  const varieties: string[] = [];
  
  for (const task of fruitTreeTasks) {
    const master = await getMasterSheet(task.plantName);
    if (master && 'cropType' in master && master.cropType === 'FruitTree') {
      const category = getCategoryForMasterSheet(master as FruitTreeCrop);
      if (category) {
        categories.push(category);
      }
      if (task.variety) {
        varieties.push(task.variety);
      } else {
        varieties.push(task.plantName);
      }
    }
  }
  
  // Conta occorrenze per categoria
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<FruitTreeCategory, number>);
  
  // Trova categoria dominante
  const dominantCategory = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as FruitTreeCategory | undefined;
  
  return {
    exists: true,
    category: dominantCategory || undefined,
    count: fruitTreeTasks.length,
    varieties: [...new Set(varieties)] // Rimuovi duplicati
  };
}

/**
 * Rileva se esiste già un oliveto nel giardino
 */
export async function detectExistingOliveGrove(
  gardenId: string,
  tasks: GardenTask[]
): Promise<OliveGroveDetectionResult> {
  // Filtra solo task di olivi (con verifica async)
  const oliveTasksPromises = tasks.map(async (t) => {
    if (!t.oliveData) return null;
    const master = await getMasterSheet(t.plantName);
    return master?.cropType === 'Olive' ? t : null;
  });
  const oliveTasksResults = await Promise.all(oliveTasksPromises);
  const oliveTasks = oliveTasksResults.filter((t): t is GardenTask => t !== null);
  
  if (oliveTasks.length === 0) {
    return { exists: false };
  }
  
  // Determina tipo dominante
  const types: OliveType[] = [];
  const varieties: string[] = [];
  
  for (const task of oliveTasks) {
    if (task.oliveData?.varietyType) {
      // Mappa i valori dal task ai tipi corretti
      const varietyType = task.oliveData.varietyType;
      if (varietyType === 'Oil') {
        types.push('OIL');
      } else if (varietyType === 'Table') {
        types.push('TABLE');
      } else if (varietyType === 'Dual-purpose') {
        types.push('DUAL_PURPOSE');
      }
    }
    if (task.variety) {
      varieties.push(task.variety);
    } else {
      varieties.push(task.plantName);
    }
  }
  
  // Conta occorrenze per tipo
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<OliveType, number>);
  
  // Trova tipo dominante
  const dominantType = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as OliveType | undefined;
  
  return {
    exists: true,
    type: dominantType || 'DUAL_PURPOSE',
    count: oliveTasks.length,
    varieties: [...new Set(varieties)]
  };
}

/**
 * Rileva se esiste già un vigneto nel giardino
 */
export async function detectExistingVineyard(
  gardenId: string,
  tasks: GardenTask[]
): Promise<VineyardDetectionResult> {
  // Filtra solo task di viti (con verifica async)
  const vineTasksPromises = tasks.map(async (t) => {
    if (!t.vineData) return null;
    const master = await getMasterSheet(t.plantName);
    return master?.cropType === 'Vine' ? t : null;
  });
  const vineTasksResults = await Promise.all(vineTasksPromises);
  const vineTasks = vineTasksResults.filter((t): t is GardenTask => t !== null);
  
  if (vineTasks.length === 0) {
    return { exists: false };
  }
  
  // Determina tipo dominante e sistema allevamento
  const types: VineType[] = [];
  const trainingSystems: Array<'Guyot' | 'Cordon' | 'Pergola' | 'Alberello'> = [];
  const varieties: string[] = [];
  
  for (const task of vineTasks) {
    if (task.vineData?.varietyType) {
      // Mappa i valori dal task ai tipi corretti
      const varietyType = task.vineData.varietyType;
      if (varietyType === 'Wine') {
        types.push('WINE');
      } else if (varietyType === 'Table' || varietyType === 'Raisin') {
        types.push('TABLE');
      }
    }
    if (task.vineData?.trainingSystem) {
      trainingSystems.push(task.vineData.trainingSystem);
    }
    if (task.variety) {
      varieties.push(task.variety);
    } else {
      varieties.push(task.plantName);
    }
  }
  
  // Conta occorrenze per tipo
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<VineType, number>);
  
  // Trova tipo dominante
  const dominantType = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as VineType | undefined;
  
  // Trova sistema allevamento più comune
  const trainingSystemCounts = trainingSystems.reduce((acc, sys) => {
    acc[sys] = (acc[sys] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantTrainingSystem = Object.entries(trainingSystemCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as 'Guyot' | 'Cordon' | 'Pergola' | 'Alberello' | undefined;
  
  return {
    exists: true,
    type: dominantType || 'WINE',
    count: vineTasks.length,
    varieties: [...new Set(varieties)],
    trainingSystem: dominantTrainingSystem
  };
}

/**
 * Categorizza un albero da frutto in base al master sheet
 * Wrapper per getCategoryForMasterSheet per compatibilità
 */
export function categorizeFruitTree(master: FruitTreeCrop): FruitTreeCategory | null {
  return getCategoryForMasterSheet(master);
}

