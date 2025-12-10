/**
 * Export Service
 * Export completo dati giardino per backup e portabilità
 */

import { IStorageProvider } from '../packages/core/storage/interface';
import { Garden, GardenTask, HarvestLogData, SeedPacket } from '../types';

export interface ExportData {
  version: string;
  exportDate: string;
  garden: Garden;
  tasks: GardenTask[];
  harvests: HarvestLogData[];
  seedInventory: SeedPacket[];
  metadata?: {
    totalTasks: number;
    totalHarvests: number;
    totalSeeds: number;
  };
}

/**
 * Esporta tutti i dati di un giardino in formato JSON
 */
export const exportGardenData = async (
  gardenId: string,
  storage: IStorageProvider
): Promise<Blob> => {
  // Recupera tutti i dati
  const gardens = await storage.getGardens();
  const garden = gardens.find(g => g.id === gardenId);

  if (!garden) {
    throw new Error(`Giardino con ID ${gardenId} non trovato`);
  }

  const tasks = await storage.getTasks();
  const gardenTasks = tasks.filter(t => t.gardenId === gardenId);

  const harvests = await storage.getHarvestLogs(gardenId);
  const seeds = await storage.getSeedPackets(gardenId);

  // Costruisci oggetto export
  const exportData: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    garden,
    tasks: gardenTasks,
    harvests,
    seedInventory: seeds,
    metadata: {
      totalTasks: gardenTasks.length,
      totalHarvests: harvests.length,
      totalSeeds: seeds.length,
    },
  };

  // Converti in JSON e crea Blob
  const json = JSON.stringify(exportData, null, 2);
  return new Blob([json], { type: 'application/json' });
};

/**
 * Scarica il file export
 */
export const downloadExport = async (
  gardenId: string,
  storage: IStorageProvider,
  filename?: string
): Promise<void> => {
  const blob = await exportGardenData(gardenId, storage);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `ortomio-export-${gardenId}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

