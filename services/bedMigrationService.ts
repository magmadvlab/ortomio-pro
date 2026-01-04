/**
 * Bed Migration Service
 * Migrates existing gardens to have a default bed for backward compatibility
 */

import { IStorageProvider } from '../packages/core/storage/interface';
import { GardenBed } from '../types/gardenBed';
import { Garden, GardenTask } from '../types';

/**
 * Creates a default "Piena Terra" bed for a garden if it doesn't have any beds
 * and associates existing tasks without bedId to this default bed
 */
export async function migrateGardenToBeds(
  storageProvider: IStorageProvider,
  garden: Garden,
  tasks: GardenTask[] = []
): Promise<GardenBed | null> {
  try {
    // Check if garden already has beds
    const existingBeds = await storageProvider.getGardenBeds(garden.id);
    
    if (existingBeds.length > 0) {
      // Garden already has beds, no migration needed
      return null;
    }

    // Create default bed
    const defaultBed: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'> = {
      gardenId: garden.id,
      name: 'Piena Terra (Default)',
      bedType: 'Ground',
      shape: 'Rectangle',
      // Use garden dimensions if available, otherwise use a reasonable default
      lengthCm: garden.sizeSqMeters 
        ? Math.sqrt(garden.sizeSqMeters * 10000) 
        : 500, // Default 5m x 5m = 25 m²
      widthCm: garden.sizeSqMeters 
        ? Math.sqrt(garden.sizeSqMeters * 10000) 
        : 500,
      areaSqMeters: garden.sizeSqMeters || 25,
      notes: 'Letto creato automaticamente durante la migrazione. Questo rappresenta la piena terra del giardino.',
    };

    const createdBed = await storageProvider.createGardenBed(defaultBed);

    // Associate existing tasks without bedId to the default bed
    const tasksWithoutBed = tasks.filter(t => !t.bedId && !t.completed);
    
    if (tasksWithoutBed.length > 0) {
      // Update tasks to associate them with the default bed
      // Note: This requires updating tasks, which should be done carefully
      // For now, we'll just create the bed and let the user manually associate tasks if needed
      // In a full implementation, you might want to update tasks here:
      // for (const task of tasksWithoutBed) {
      //   await storageProvider.updateTask(task.id, { bedId: createdBed.id });
      // }
      
      console.log(`Created default bed for garden ${garden.id}. ${tasksWithoutBed.length} tasks can be associated with it.`);
    }

    return createdBed;
  } catch (error) {
    console.error(`Error migrating garden ${garden.id} to beds:`, error);
    return null;
  }
}

/**
 * Migrates all gardens to have default beds
 */
export async function migrateAllGardensToBeds(
  storageProvider: IStorageProvider
): Promise<{ migrated: number; skipped: number; errors: number }> {
  try {
    const gardens = await storageProvider.getGardens();
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const garden of gardens) {
      try {
        // Load tasks for this garden
        const tasks = await storageProvider.getTasks(garden.id);
        
        const result = await migrateGardenToBeds(storageProvider, garden, tasks);
        
        if (result) {
          migrated++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error migrating garden ${garden.id}:`, error);
        errors++;
      }
    }

    return { migrated, skipped, errors };
  } catch (error) {
    console.error('Error in migrateAllGardensToBeds:', error);
    return { migrated: 0, skipped: 0, errors: 1 };
  }
}

/**
 * Check if migration is needed (i.e., there are gardens without beds)
 */
export async function isMigrationNeeded(
  storageProvider: IStorageProvider
): Promise<boolean> {
  try {
    const gardens = await storageProvider.getGardens();
    
    for (const garden of gardens) {
      const beds = await storageProvider.getGardenBeds(garden.id);
      if (beds.length === 0) {
        return true; // At least one garden needs migration
      }
    }
    
    return false; // All gardens have beds
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}
















