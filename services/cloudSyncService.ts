/**
 * Cloud Sync Service
 * Sincronizzazione con iCloud (iOS) e Google Drive (Android)
 * Fallback a localStorage per desktop/web
 */

import { ExportData } from './exportService';
import { getDeviceInfo } from './deviceDetectionService';

export interface CloudBackup {
  source: 'icloud' | 'google_drive' | 'local';
  filename: string;
  path?: string;
  fileId?: string;
  timestamp: string;
  size: number;
  gardenId?: string;
  gardenName?: string;
}

/**
 * Rileva piattaforma corrente
 */
export function detectPlatform(): 'ios' | 'android' | 'desktop' | 'web' {
  const deviceInfo = getDeviceInfo();
  return deviceInfo.platform;
}

/**
 * Sincronizza dati su cloud (iCloud/Google Drive)
 * Fallback a localStorage per desktop/web
 */
export async function syncToCloud(data: ExportData): Promise<void> {
  const platform = detectPlatform();
  
  try {
    if (platform === 'ios') {
      await syncToiCloud(data);
    } else if (platform === 'android') {
      await syncToGoogleDrive(data);
    } else {
      // Desktop/web: salva backup locale esteso
      await saveWebBackup(data);
    }
  } catch (error) {
    console.error('Error syncing to cloud:', error);
    // Fallback: salva sempre backup locale
    await saveWebBackup(data);
  }
}

/**
 * Cerca backup cloud disponibili
 */
export async function detectCloudBackups(): Promise<CloudBackup[]> {
  const platform = detectPlatform();
  const backups: CloudBackup[] = [];
  
  try {
    if (platform === 'ios') {
      const iCloudBackups = await detectiCloudBackups();
      backups.push(...iCloudBackups);
    } else if (platform === 'android') {
      const driveBackups = await detectGoogleDriveBackups();
      backups.push(...driveBackups);
    }
    
    // Aggiungi sempre backup locali
    const localBackups = detectLocalBackups();
    backups.push(...localBackups);
    
    // Ordina per timestamp (più recente prima)
    backups.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return backups;
  } catch (error) {
    console.error('Error detecting cloud backups:', error);
    // Fallback: ritorna solo backup locali
    return detectLocalBackups();
  }
}

/**
 * Ripristina da backup cloud
 */
export async function restoreFromCloud(backup: CloudBackup): Promise<ExportData | null> {
  try {
    if (backup.source === 'icloud') {
      return await restoreFromiCloud(backup);
    } else if (backup.source === 'google_drive') {
      return await restoreFromGoogleDrive(backup);
    } else {
      // Backup locale
      return await restoreFromLocal(backup);
    }
  } catch (error) {
    console.error('Error restoring from cloud:', error);
    return null;
  }
}

// ========== iCloud Sync (iOS) ==========

/**
 * Sincronizza su iCloud (iOS)
 */
async function syncToiCloud(data: ExportData): Promise<void> {
  const { syncToiCloud: synciCloud } = await import('./icloudSyncService');
  await synciCloud(data);
}

/**
 * Cerca backup iCloud disponibili
 */
async function detectiCloudBackups(): Promise<CloudBackup[]> {
  const { detectiCloudBackups: detectiCloud } = await import('./icloudSyncService');
  return await detectiCloud();
}

/**
 * Ripristina da iCloud
 */
async function restoreFromiCloud(backup: CloudBackup): Promise<ExportData | null> {
  const { restoreFromiCloud: restoreiCloud } = await import('./icloudSyncService');
  return await restoreiCloud(backup);
}

// ========== Google Drive Sync (Android) ==========

/**
 * Sincronizza su Google Drive (Android)
 */
async function syncToGoogleDrive(data: ExportData): Promise<void> {
  const { syncToGoogleDrive: syncDrive } = await import('./googleDriveSyncService');
  await syncDrive(data);
}

/**
 * Cerca backup Google Drive disponibili
 */
async function detectGoogleDriveBackups(): Promise<CloudBackup[]> {
  const { detectGoogleDriveBackups: detectDrive } = await import('./googleDriveSyncService');
  return await detectDrive();
}

/**
 * Ripristina da Google Drive
 */
async function restoreFromGoogleDrive(backup: CloudBackup): Promise<ExportData | null> {
  const { restoreFromGoogleDrive: restoreDrive } = await import('./googleDriveSyncService');
  return await restoreDrive(backup);
}

// ========== Local Backup (Desktop/Web) ==========

/**
 * Salva backup locale esteso (per desktop/web)
 */
async function saveWebBackup(data: ExportData): Promise<void> {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      data,
      version: '2.0',
      source: 'local',
    };
    
    localStorage.setItem('ortomio_full_backup', JSON.stringify(backup));
    
    // Mantieni anche ultimi 3 backup completi
    const backupHistory = getBackupHistory();
    backupHistory.push(backup);
    
    // Mantieni solo ultimi 3
    if (backupHistory.length > 3) {
      backupHistory.shift();
    }
    
    localStorage.setItem('ortomio_backup_history', JSON.stringify(backupHistory));
  } catch (error) {
    console.error('Error saving web backup:', error);
  }
}

/**
 * Cerca backup locali disponibili
 */
function detectLocalBackups(): CloudBackup[] {
  const backups: CloudBackup[] = [];
  
  try {
    // Backup completo corrente
    const fullBackup = localStorage.getItem('ortomio_full_backup');
    if (fullBackup) {
      const backup = JSON.parse(fullBackup);
      backups.push({
        source: 'local',
        filename: 'ortomio-full-backup.json',
        timestamp: backup.timestamp,
        size: new Blob([fullBackup]).size,
        gardenId: backup.data?.garden?.id,
        gardenName: backup.data?.garden?.name,
      });
    }
    
    // Backup history
    const backupHistory = getBackupHistory();
    backupHistory.forEach((backup, index) => {
      backups.push({
        source: 'local',
        filename: `ortomio-backup-${index}.json`,
        timestamp: backup.timestamp,
        size: new Blob([JSON.stringify(backup)]).size,
        gardenId: backup.data?.garden?.id,
        gardenName: backup.data?.garden?.name,
      });
    });
  } catch (error) {
    console.error('Error detecting local backups:', error);
  }
  
  return backups;
}

/**
 * Ripristina da backup locale
 */
async function restoreFromLocal(backup: CloudBackup): Promise<ExportData | null> {
  try {
    if (backup.filename === 'ortomio-full-backup.json') {
      const fullBackup = localStorage.getItem('ortomio_full_backup');
      if (fullBackup) {
        const parsed = JSON.parse(fullBackup);
        return parsed.data as ExportData;
      }
    } else {
      // Backup dalla history
      const backupHistory = getBackupHistory();
      const index = parseInt(backup.filename.match(/ortomio-backup-(\d+)\.json/)?.[1] || '0');
      if (backupHistory[index]) {
        return backupHistory[index].data as ExportData;
      }
    }
  } catch (error) {
    console.error('Error restoring from local:', error);
  }
  
  return null;
}

/**
 * Ottiene backup history
 */
function getBackupHistory(): Array<{ timestamp: string; data: ExportData; version: string; source: string }> {
  try {
    const stored = localStorage.getItem('ortomio_backup_history');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Estrae timestamp da filename
 */
function extractTimestampFromFilename(filename: string): string {
  // ortomio-backup-{gardenId}-{YYYY-MM-DD}.json
  const match = filename.match(/ortomio-backup-[^-]+-(\d{4}-\d{2}-\d{2})\.json/);
  if (match) {
    return `${match[1]}T00:00:00.000Z`;
  }
  return new Date().toISOString();
}

