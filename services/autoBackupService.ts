/**
 * Auto Backup Service
 * Salva automaticamente backup dopo operazioni importanti
 * Mantiene ultimi N backup in localStorage
 */

import { IStorageProvider } from '../packages/core/storage/interface';
import { exportGardenData, ExportData } from './exportService';

export interface BackupMetadata {
  id: string;
  timestamp: string;
  gardenId: string;
  gardenName: string;
  size: number; // bytes
  version: string;
}

export interface RestoreResult {
  success: boolean;
  gardensRestored: number;
  tasksRestored: number;
  harvestsRestored: number;
  seedsRestored: number;
  errors?: string[];
}

const BACKUP_STORAGE_KEY = 'ortomio_auto_backups';
const MAX_BACKUPS = 10;
const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minuti - debounce per evitare troppe scritture

let lastBackupTime = 0;
let backupTimer: NodeJS.Timeout | null = null;

/**
 * Salva backup automatico dopo operazione importante
 * Usa debounce per evitare troppe scritture
 */
export async function saveAutoBackup(
  storage: IStorageProvider,
  gardenId?: string
): Promise<void> {
  const now = Date.now();
  
  // Debounce: salva solo se passati almeno BACKUP_INTERVAL ms dall'ultimo backup
  if (now - lastBackupTime < BACKUP_INTERVAL) {
    // Cancella timer precedente e programma nuovo backup
    if (backupTimer) {
      clearTimeout(backupTimer);
    }
    
    backupTimer = setTimeout(() => {
      performBackup(storage, gardenId);
    }, BACKUP_INTERVAL - (now - lastBackupTime));
    
    return;
  }
  
  await performBackup(storage, gardenId);
}

/**
 * Esegue effettivamente il backup
 */
async function performBackup(
  storage: IStorageProvider,
  gardenId?: string
): Promise<void> {
  try {
    lastBackupTime = Date.now();
    
    const gardens = await storage.getGardens();
    
    // Se specificato gardenId, backup solo di quel giardino
    // Altrimenti backup di tutti i giardini
    const gardensToBackup = gardenId 
      ? gardens.filter(g => g.id === gardenId)
      : gardens;
    
    if (gardensToBackup.length === 0) {
      return; // Nessun giardino da salvare
    }
    
    // Per ogni giardino, crea un backup separato
    for (const garden of gardensToBackup) {
      const exportBlob = await exportGardenData(garden.id, storage);
      const exportText = await exportBlob.text();
      const exportData: ExportData = JSON.parse(exportText);
      
      // Comprimi JSON (rimuovi spazi)
      const compressedJson = JSON.stringify(exportData);
      
      const backup: BackupMetadata & { data: ExportData } = {
        id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        gardenId: garden.id,
        gardenName: garden.name,
        size: new Blob([compressedJson]).size,
        version: exportData.version || '1.0',
        data: exportData,
      };
      
      // Salva backup
      const backups = getBackups();
      backups.push(backup);
      
      // Mantieni solo ultimi MAX_BACKUPS backup per questo giardino
      const gardenBackups = backups.filter(b => b.gardenId === garden.id);
      if (gardenBackups.length > MAX_BACKUPS) {
        // Rimuovi backup più vecchi per questo giardino
        gardenBackups.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const toRemove = gardenBackups.slice(0, gardenBackups.length - MAX_BACKUPS);
        toRemove.forEach(oldBackup => {
          const index = backups.findIndex(b => b.id === oldBackup.id);
          if (index !== -1) {
            backups.splice(index, 1);
          }
        });
      }
      
      // Salva in localStorage
      try {
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
      } catch (error: any) {
        // Se localStorage è pieno, rimuovi backup più vecchi
        if (error.name === 'QuotaExceededError') {
          cleanOldBackups(MAX_BACKUPS / 2); // Riduci a metà
          // Riprova
          localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error saving auto backup:', error);
    // Non bloccare operazioni principali se backup fallisce
  }
}

/**
 * Ottiene lista backup disponibili
 */
export function getBackups(): Array<BackupMetadata & { data: ExportData }> {
  try {
    const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading backups:', error);
    return [];
  }
}

/**
 * Ottiene solo metadata dei backup (senza dati completi)
 */
export function getBackupMetadata(): BackupMetadata[] {
  const backups = getBackups();
  return backups.map(({ data, ...metadata }) => metadata);
}

/**
 * Ottiene backup specifico per ID
 */
export function getBackup(backupId: string): (BackupMetadata & { data: ExportData }) | null {
  const backups = getBackups();
  return backups.find(b => b.id === backupId) || null;
}

/**
 * Ripristina backup specifico
 */
export async function restoreBackup(
  backupId: string,
  storage: IStorageProvider
): Promise<RestoreResult> {
  const backup = getBackup(backupId);
  if (!backup) {
    return {
      success: false,
      gardensRestored: 0,
      tasksRestored: 0,
      harvestsRestored: 0,
      seedsRestored: 0,
      errors: ['Backup non trovato'],
    };
  }
  
  return await restoreFromExportData(backup.data, storage);
}

/**
 * Ripristina da ExportData
 */
export async function restoreFromExportData(
  exportData: ExportData,
  storage: IStorageProvider
): Promise<RestoreResult> {
  const errors: string[] = [];
  let gardensRestored = 0;
  let tasksRestored = 0;
  let harvestsRestored = 0;
  let seedsRestored = 0;
  
  try {
    // Crea nuovo giardino (genera nuovo ID per evitare conflitti)
    const newGarden = {
      ...exportData.garden,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const restoredGarden = await storage.createGarden(newGarden);
    gardensRestored = 1;
    
    // Ripristina task
    for (const task of exportData.tasks || []) {
      try {
        const { id, ...taskWithoutId } = task;
        await storage.createTask({
          ...taskWithoutId,
          gardenId: restoredGarden.id,
        });
        tasksRestored++;
      } catch (error: any) {
        errors.push(`Errore import task: ${error.message}`);
      }
    }
    
    // Ripristina raccolti
    for (const harvest of exportData.harvests || []) {
      try {
        const { id: harvestId, ...harvestWithoutId } = harvest;
        await storage.createHarvestLog(harvestWithoutId);
        harvestsRestored++;
      } catch (error: any) {
        errors.push(`Errore import harvest: ${error.message}`);
      }
    }
    
    // Ripristina semi
    for (const seed of exportData.seedInventory || []) {
      try {
        const { id: seedId, ...seedWithoutId } = seed;
        await storage.createSeedPacket({
          ...seedWithoutId,
          gardenId: restoredGarden.id,
        });
        seedsRestored++;
      } catch (error: any) {
        errors.push(`Errore import seed: ${error.message}`);
      }
    }
    
    return {
      success: errors.length === 0,
      gardensRestored,
      tasksRestored,
      harvestsRestored,
      seedsRestored,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      gardensRestored,
      tasksRestored,
      harvestsRestored,
      seedsRestored,
      errors: [error.message || 'Errore durante ripristino'],
    };
  }
}

/**
 * Rimuove backup vecchi, mantiene solo ultimi N
 */
export function cleanOldBackups(maxBackups: number = MAX_BACKUPS): void {
  try {
    const backups = getBackups();
    
    // Raggruppa per gardenId
    const backupsByGarden = new Map<string, Array<BackupMetadata & { data: ExportData }>>();
    
    backups.forEach(backup => {
      if (!backupsByGarden.has(backup.gardenId)) {
        backupsByGarden.set(backup.gardenId, []);
      }
      backupsByGarden.get(backup.gardenId)!.push(backup);
    });
    
    // Per ogni giardino, mantieni solo ultimi maxBackups
    const cleanedBackups: Array<BackupMetadata & { data: ExportData }> = [];
    
    backupsByGarden.forEach((gardenBackups, gardenId) => {
      // Ordina per timestamp (più recente prima)
      gardenBackups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Mantieni solo ultimi maxBackups
      cleanedBackups.push(...gardenBackups.slice(0, maxBackups));
    });
    
    // Salva backup puliti
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(cleanedBackups));
  } catch (error) {
    console.error('Error cleaning old backups:', error);
  }
}

/**
 * Ottiene ultimo backup per giardino specifico
 */
export function getLastBackup(gardenId: string): (BackupMetadata & { data: ExportData }) | null {
  const backups = getBackups();
  const gardenBackups = backups
    .filter(b => b.gardenId === gardenId)
    .sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  
  return gardenBackups.length > 0 ? gardenBackups[0] : null;
}

/**
 * Ottiene ultimo backup disponibile (qualsiasi giardino)
 */
export function getLatestBackup(): (BackupMetadata & { data: ExportData }) | null {
  const backups = getBackups();
  if (backups.length === 0) {
    return null;
  }
  
  backups.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return backups[0];
}


