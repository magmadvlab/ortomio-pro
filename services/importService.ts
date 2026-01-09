/**
 * Import Service
 * Import dati giardino da file JSON con validazione
 */

import { IStorageProvider } from '../packages/core/storage/interface';
import { Garden, GardenTask, HarvestLogData, SeedPacket } from '../types';
import { ExportData } from './exportService';

export interface ImportResult {
  success: boolean;
  importedGarden?: Garden;
  tasksImported: number;
  harvestsImported: number;
  seedsImported: number;
  errors?: string[];
}

/**
 * Valida struttura dati export
 */
const validateExportData = (data: any): data is ExportData => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.version || !data.exportDate || !data.garden) {
    return false;
  }

  // Verifica versione compatibile
  if (data.version !== '1.0') {
    return false;
  }

  // Verifica struttura garden
  if (!data.garden.id || !data.garden.name || !data.garden.createdAt) {
    return false;
  }

  return true;
};

/**
 * Importa dati giardino da file JSON
 */
export const importGardenData = async (
  file: File,
  userId: string,
  storage: IStorageProvider
): Promise<ImportResult> => {
  const errors: string[] = [];

  try {
    // Leggi file
    const text = await file.text();
    const data = JSON.parse(text);

    // Valida struttura
    if (!validateExportData(data)) {
      throw new Error('Formato file non valido o versione incompatibile. Assicurati di importare un file export di OrtoMio AI.');
    }

    // Crea nuovo giardino (genera nuovo ID per evitare conflitti)
    const newGarden: Garden = {
      ...data.garden,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    // Salva giardino
    const importedGarden = await storage.createGarden(newGarden);

    // Importa tasks
    let tasksImported = 0;
    for (const task of data.tasks || []) {
      try {
        const newTask: GardenTask = {
          ...task,
          id: crypto.randomUUID(),
          gardenId: importedGarden.id,
        };
        await storage.createTask(newTask);
        tasksImported++;
      } catch (error: any) {
        errors.push(`Errore import task ${task.id}: ${error.message}`);
      }
    }

    // Importa harvests
    let harvestsImported = 0;
    for (const harvest of data.harvests || []) {
      try {
        const newHarvest: HarvestLogData = {
          ...harvest,
          id: crypto.randomUUID(),
        };
        await storage.createHarvestLog(newHarvest);
        harvestsImported++;
      } catch (error: any) {
        errors.push(`Errore import harvest ${harvest.id}: ${error.message}`);
      }
    }

    // Importa seed inventory
    let seedsImported = 0;
    for (const seed of data.seedInventory || []) {
      try {
        const newSeed: SeedPacket = {
          ...seed,
          id: crypto.randomUUID(),
          gardenId: importedGarden.id,
        };
        await storage.createSeedPacket(newSeed);
        seedsImported++;
      } catch (error: any) {
        errors.push(`Errore import seed ${seed.id}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      importedGarden,
      tasksImported,
      harvestsImported,
      seedsImported,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      tasksImported: 0,
      harvestsImported: 0,
      seedsImported: 0,
      errors: [error.message || 'Errore sconosciuto durante import'],
    };
  }
};

/**
 * Verifica se un file è un export valido senza importarlo
 */
export const validateExportFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!validateExportData(data)) {
      return {
        valid: false,
        error: 'Formato file non valido o versione incompatibile.',
      };
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Errore durante la lettura del file.',
    };
  }
};

