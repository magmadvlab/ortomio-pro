/**
 * iCloud Sync Service
 * Sincronizzazione con iCloud Drive per iOS
 * Usa Capacitor Filesystem API per accesso file system
 */

import { ExportData } from './exportService';
import { CloudBackup } from './cloudSyncService';

/**
 * Sincronizza dati su iCloud Drive
 */
export async function syncToiCloud(data: ExportData): Promise<void> {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    
    const filename = `ortomio-backup-${data.garden.id}-${new Date().toISOString().split('T')[0]}.json`;
    const path = `OrtoMio/Backups/${filename}`;
    
    // Crea directory se non esiste
    try {
      await Filesystem.mkdir({
        path: 'OrtoMio/Backups',
        directory: Directory.ExternalStorage, // iCloud Drive
        recursive: true,
      });
    } catch (error: any) {
      // Directory potrebbe già esistere, ignora errore
      if (error.message && !error.message.includes('already exists')) {
        throw error;
      }
    }
    
    // Salva file su iCloud Drive
    await Filesystem.writeFile({
      path,
      data: JSON.stringify(data, null, 2),
      directory: Directory.ExternalStorage,
    });
    
    console.log('✅ Backup sincronizzato su iCloud Drive:', path);
  } catch (error: any) {
    // Se Capacitor non disponibile o errore, fallback silenzioso
    if (error.message && error.message.includes('Capacitor')) {
      console.warn('Capacitor not available, iCloud sync skipped');
      return;
    }
    throw error;
  }
}

/**
 * Cerca backup iCloud disponibili
 */
export async function detectiCloudBackups(): Promise<CloudBackup[]> {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    
    // Leggi directory backup
    const result = await Filesystem.readdir({
      path: 'OrtoMio/Backups',
      directory: Directory.ExternalStorage,
    });
    
    const backups: CloudBackup[] = [];
    
    for (const file of result.files) {
      if (file.name.startsWith('ortomio-backup-') && file.name.endsWith('.json')) {
        // Estrai gardenId e timestamp dal filename
        const match = file.name.match(/ortomio-backup-([^-]+)-(\d{4}-\d{2}-\d{2})\.json/);
        const timestamp = match 
          ? `${match[2]}T00:00:00.000Z`
          : new Date().toISOString();
        
        backups.push({
          source: 'icloud',
          filename: file.name,
          path: `OrtoMio/Backups/${file.name}`,
          timestamp,
          size: file.size || 0,
          gardenId: match ? match[1] : undefined,
        });
      }
    }
    
    return backups;
  } catch (error: any) {
    // Se Capacitor non disponibile o directory non esiste, ritorna array vuoto
    if (error.message && (error.message.includes('Capacitor') || error.message.includes('does not exist'))) {
      return [];
    }
    throw error;
  }
}

/**
 * Ripristina da iCloud
 */
export async function restoreFromiCloud(backup: CloudBackup): Promise<ExportData | null> {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    
    const file = await Filesystem.readFile({
      path: backup.path!,
      directory: Directory.ExternalStorage,
    });
    
    return JSON.parse(file.data as string) as ExportData;
  } catch (error) {
    console.error('Error restoring from iCloud:', error);
    return null;
  }
}







