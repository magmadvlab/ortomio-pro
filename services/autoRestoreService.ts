/**
 * Auto Restore Service
 * Ripristino automatico al primo avvio
 * Cerca backup cloud disponibili e ripristina automaticamente
 */

import { IStorageProvider } from '../packages/core/storage/interface';
import { isFirstLaunch, markLaunchComplete } from './deviceDetectionService';
import { detectCloudBackups, restoreFromCloud, CloudBackup } from './cloudSyncService';
import { restoreFromExportData, RestoreResult } from './autoBackupService';

export interface AutoRestoreResult {
  restored: boolean;
  reason?: string;
  backupUsed?: CloudBackup;
  gardensRestored?: number;
  tasksRestored?: number;
  harvestsRestored?: number;
  seedsRestored?: number;
  error?: Error;
}

/**
 * Tenta ripristino automatico se necessario
 */
export async function attemptAutoRestore(
  storage: IStorageProvider
): Promise<AutoRestoreResult> {
  // 1. Verifica se è primo avvio
  if (!isFirstLaunch()) {
    return { restored: false, reason: 'not_first_launch' };
  }
  
  // 2. Verifica se ci sono dati locali esistenti
  try {
    const existingGardens = await storage.getGardens();
    if (existingGardens.length > 0) {
      // Ci sono già dati locali, non fare restore automatico
      markLaunchComplete();
      return { restored: false, reason: 'local_data_exists' };
    }
  } catch (error) {
    console.error('Error checking existing gardens:', error);
    // Continua comunque con restore
  }
  
  // 3. Cerca backup cloud disponibili
  let availableBackups: CloudBackup[] = [];
  try {
    availableBackups = await detectCloudBackups();
  } catch (error) {
    console.error('Error detecting cloud backups:', error);
    return { restored: false, reason: 'backup_detection_failed', error: error as Error };
  }
  
  if (availableBackups.length === 0) {
    markLaunchComplete();
    return { restored: false, reason: 'no_backups_found' };
  }
  
  // 4. Prendi backup più recente
  const latestBackup = availableBackups[0];
  
  // 5. Ripristina automaticamente (SILENZIOSAMENTE)
  try {
    const exportData = await restoreFromCloud(latestBackup);
    
    if (!exportData) {
      markLaunchComplete();
      return { restored: false, reason: 'backup_restore_failed' };
    }
    
    const restoreResult = await restoreFromExportData(exportData, storage);
    
    if (restoreResult.success) {
      // Marca launch come completato
      markLaunchComplete();
      
      return {
        restored: true,
        backupUsed: latestBackup,
        gardensRestored: restoreResult.gardensRestored,
        tasksRestored: restoreResult.tasksRestored,
        harvestsRestored: restoreResult.harvestsRestored,
        seedsRestored: restoreResult.seedsRestored,
      };
    } else {
      markLaunchComplete();
      return {
        restored: false,
        reason: 'restore_failed',
        error: new Error(restoreResult.errors?.join(', ') || 'Unknown restore error'),
      };
    }
  } catch (error) {
    console.error('Auto-restore failed:', error);
    markLaunchComplete();
    return { restored: false, reason: 'restore_exception', error: error as Error };
  }
}

/**
 * Ripristina da backup specifico
 */
export async function restoreFromBackup(
  backup: CloudBackup,
  storage: IStorageProvider
): Promise<RestoreResult> {
  try {
    const exportData = await restoreFromCloud(backup);
    
    if (!exportData) {
      return {
        success: false,
        gardensRestored: 0,
        tasksRestored: 0,
        harvestsRestored: 0,
        seedsRestored: 0,
        errors: ['Impossibile leggere backup'],
      };
    }
    
    return await restoreFromExportData(exportData, storage);
  } catch (error: any) {
    return {
      success: false,
      gardensRestored: 0,
      tasksRestored: 0,
      harvestsRestored: 0,
      seedsRestored: 0,
      errors: [error.message || 'Errore durante ripristino'],
    };
  }
}








