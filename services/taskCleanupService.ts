/**
 * Task Cleanup Service
 *
 * Servizio per pulizia automatica di task vecchi completati
 * per evitare accumulo in database e localStorage
 *
 * Features:
 * - Archivia task completati più vecchi di N giorni
 * - Elimina task completati più vecchi di N mesi (se confermato)
 * - Mantiene task importanti indipendentemente dalla data
 * - Report di pulizia
 */

import { GardenTask } from '@/types';
import { IStorageProvider } from '@/packages/core/storage/interface';

export interface CleanupOptions {
  archiveAfterDays?: number; // Archivia task completati dopo N giorni (default: 90)
  deleteAfterDays?: number; // Elimina task completati dopo N giorni (default: 365)
  keepImportant?: boolean; // Mantieni task importanti (default: true)
  dryRun?: boolean; // Solo simula, non elimina (default: false)
}

export interface CleanupReport {
  totalTasksChecked: number;
  tasksArchived: number;
  tasksDeleted: number;
  tasksKept: number;
  spaceFreedKB: number;
  errors: string[];
}

const DEFAULT_OPTIONS: CleanupOptions = {
  archiveAfterDays: 90,
  deleteAfterDays: 365,
  keepImportant: true,
  dryRun: false,
};

/**
 * Determina se un task è "importante" e deve essere sempre conservato
 */
function isImportantTask(task: GardenTask): boolean {
  // Task con note dettagliate sono importanti
  if (task.notes && task.notes.length > 100) {
    return true;
  }

  // Task di tipo speciale sono importanti
  const importantTypes = [
    'Harvest', // Raccolti sempre importanti per statistiche
    'PlantingSeed', // Semine importanti per tracciabilità
    'Pruning', // Potature importanti per cronologia
    'Treatment', // Trattamenti importanti per registro
  ];

  if (task.taskType && importantTypes.includes(task.taskType)) {
    return true;
  }

  return false;
}

/**
 * Calcola dimensione approssimativa di un task in KB
 */
function getTaskSizeKB(task: GardenTask): number {
  const jsonString = JSON.stringify(task);
  const sizeInBytes = new Blob([jsonString]).size;
  return sizeInBytes / 1024;
}

/**
 * Pulisce task vecchi completati
 */
export async function cleanupCompletedTasks(
  storageProvider: IStorageProvider,
  gardenId?: string,
  options: CleanupOptions = {}
): Promise<CleanupReport> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const report: CleanupReport = {
    totalTasksChecked: 0,
    tasksArchived: 0,
    tasksDeleted: 0,
    tasksKept: 0,
    spaceFreedKB: 0,
    errors: [],
  };

  try {
    // Carica tutti i task
    const allTasks = await storageProvider.getTasks(gardenId);
    report.totalTasksChecked = allTasks.length;

    const now = new Date();
    const archiveCutoffDate = new Date();
    archiveCutoffDate.setDate(now.getDate() - (opts.archiveAfterDays || 90));

    const deleteCutoffDate = new Date();
    deleteCutoffDate.setDate(now.getDate() - (opts.deleteAfterDays || 365));

    for (const task of allTasks) {
      try {
        // Solo task completati
        if (!task.completed) {
          report.tasksKept++;
          continue;
        }

        // Mantieni task importanti
        if (opts.keepImportant && isImportantTask(task)) {
          report.tasksKept++;
          continue;
        }

        const taskDate = new Date(task.completedAt || task.date || task.startDate || '');

        // Elimina task molto vecchi
        if (taskDate < deleteCutoffDate) {
          const sizeKB = getTaskSizeKB(task);

          if (!opts.dryRun) {
            await storageProvider.deleteTask(task.id);
          }

          report.tasksDeleted++;
          report.spaceFreedKB += sizeKB;
        }
        // Archivia task vecchi (per ora solo conteggio, implementare archiving se necessario)
        else if (taskDate < archiveCutoffDate) {
          // TODO: Implementare archiving su tabella separata se necessario
          report.tasksArchived++;
        }
        // Mantieni task recenti
        else {
          report.tasksKept++;
        }
      } catch (taskError: any) {
        report.errors.push(`Error processing task ${task.id}: ${taskError.message}`);
      }
    }
  } catch (error: any) {
    report.errors.push(`Fatal error: ${error.message}`);
  }

  return report;
}

/**
 * Cleanup automatico con conferma sicurezza
 */
export async function autoCleanupTasks(
  storageProvider: IStorageProvider,
  gardenId?: string
): Promise<CleanupReport> {
  // Prima esegui dry run per vedere cosa verrebbe eliminato
  const dryRunReport = await cleanupCompletedTasks(storageProvider, gardenId, {
    dryRun: true,
  });

  console.log('📊 Task Cleanup Dry Run Report:');
  console.log(`   - Totale task controllati: ${dryRunReport.totalTasksChecked}`);
  console.log(`   - Task da eliminare: ${dryRunReport.tasksDeleted}`);
  console.log(`   - Task da archiviare: ${dryRunReport.tasksArchived}`);
  console.log(`   - Task da mantenere: ${dryRunReport.tasksKept}`);
  console.log(`   - Spazio da liberare: ${dryRunReport.spaceFreedKB.toFixed(2)} KB`);

  // Se ci sono task da eliminare, chiedi conferma
  if (dryRunReport.tasksDeleted > 0) {
    const confirmed = confirm(
      `⚠️ Task Cleanup\n\n` +
      `Verranno eliminati ${dryRunReport.tasksDeleted} task completati più vecchi di 1 anno.\n` +
      `Spazio liberato: ${dryRunReport.spaceFreedKB.toFixed(2)} KB\n\n` +
      `Confermi?`
    );

    if (!confirmed) {
      console.log('🚫 Cleanup annullato dall\'utente');
      return dryRunReport;
    }
  }

  // Esegui cleanup reale
  const report = await cleanupCompletedTasks(storageProvider, gardenId, {
    dryRun: false,
  });

  console.log('✅ Task Cleanup Completato:');
  console.log(`   - Task eliminati: ${report.tasksDeleted}`);
  console.log(`   - Spazio liberato: ${report.spaceFreedKB.toFixed(2)} KB`);

  if (report.errors.length > 0) {
    console.error('⚠️ Errori durante cleanup:', report.errors);
  }

  return report;
}

/**
 * Programma cleanup automatico periodico
 */
export function scheduleAutoCleanup(
  storageProvider: IStorageProvider,
  intervalDays: number = 7
): () => void {
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;

  const intervalId = setInterval(async () => {
    console.log('🧹 Avvio cleanup automatico task...');
    try {
      await autoCleanupTasks(storageProvider);
    } catch (error) {
      console.error('Errore durante cleanup automatico:', error);
    }
  }, intervalMs);

  // Esegui subito la prima volta
  setTimeout(() => {
    autoCleanupTasks(storageProvider).catch(console.error);
  }, 5000); // Dopo 5 secondi dal caricamento

  // Ritorna funzione per cancellare lo schedule
  return () => clearInterval(intervalId);
}

// Esponi nella console per uso manuale
if (typeof window !== 'undefined') {
  (window as any).cleanupOrtomioTasks = autoCleanupTasks;

  console.log(`🧹 Funzione cleanup disponibile:`);
  console.log(`   - cleanupOrtomioTasks(storageProvider, gardenId?) - Pulisce task vecchi`);
}
