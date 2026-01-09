/**
 * Migration Tool
 * Command-line script to migrate data from localStorage to Supabase
 * Can be run from Node.js or browser console
 */

import { StorageService } from '../services/storageService';
import { getSupabaseClient } from '../config/supabase';
import { Garden, GardenTask } from '../types';

interface MigrationResult {
  success: boolean;
  gardens: { migrated: number; errors: number };
  tasks: { migrated: number; errors: number };
  seeds: { migrated: number; errors: number };
  errors: string[];
}

/**
 * Migrate all data from localStorage to Supabase
 */
export const migrateLocalToCloud = async (): Promise<MigrationResult> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not available. Check configuration.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated. Please log in first.');
  }

  const result: MigrationResult = {
    success: true,
    gardens: { migrated: 0, errors: 0 },
    tasks: { migrated: 0, errors: 0 },
    seeds: { migrated: 0, errors: 0 },
    errors: [],
  };

  // Migrate Gardens
  const gardens = StorageService.getGardens();
  for (const garden of gardens) {
    try {
      const { error } = await supabase
        .from('gardens')
        .upsert({
          id: garden.id,
          user_id: user.id,
          name: garden.name,
          coordinates: garden.coordinates,
          size_sq_meters: garden.sizeSqMeters,
          soil_type: garden.soilType,
          soil_ph: garden.soilPh,
          altitude_meters: garden.altitudeMeters,
          delay_factor_days: garden.delayFactorDays,
          sun_exposure: garden.sunExposure,
          daily_sun_hours: garden.dailySunHours,
          aspect_direction: garden.aspectDirection,
          wind_protection: garden.windProtection,
          has_compost_bin: garden.hasCompostBin,
          is_raised_bed: garden.isRaisedBed,
          vacation_mode: garden.vacationMode,
          created_at: garden.createdAt,
        }, {
          onConflict: 'id',
        });

      if (error) throw error;
      result.gardens.migrated++;
    } catch (error: any) {
      result.gardens.errors++;
      result.errors.push(`Garden ${garden.id}: ${error.message}`);
    }
  }

  // Migrate Tasks
  const tasks = StorageService.getTasks();
  for (const task of tasks) {
    try {
      const { error } = await supabase
        .from('garden_tasks')
        .upsert({
          id: task.id,
          garden_id: task.gardenId,
          plant_name: task.plantName,
          variety: task.variety,
          planting_method: task.plantingMethod,
          location_type: task.locationType,
          initial_quantity: task.initialQuantity,
          current_quantity: task.currentQuantity,
          task_type: task.taskType,
          stage: task.stage,
          lifecycle_state: task.lifecycleState,
          season: task.season,
          date: task.date,
          expected_transplant_date: task.expectedTransplantDate,
          moon_phase: task.moonPhase,
          completed: task.completed,
          notes: task.notes,
          next_due_date: task.nextDueDate,
          treatment_product_id: task.treatmentProductId,
          grid_position: task.gridPosition,
          grid_rotation: task.gridRotation,
          user_responses: task.userResponses,
          recorded_brix: task.recordedBrix,
          harvest_ready_analysis: task.harvestReadyAnalysis,
          harvest_history: task.harvestHistory,
          final_harvest: task.finalHarvest,
          strawberry_data: task.strawberryData,
          fruit_tree_data: task.fruitTreeData,
          aromatic_data: task.aromaticData,
          olive_data: task.oliveData,
          vine_data: task.vineData,
          images: task.images,
          last_photo_date: task.lastPhotoDate,
        }, {
          onConflict: 'id',
        });

      if (error) throw error;
      result.tasks.migrated++;
    } catch (error: any) {
      result.tasks.errors++;
      result.errors.push(`Task ${task.id}: ${error.message}`);
    }
  }

  // Migrate Seeds
  const seedsJson = localStorage.getItem('ortoSeedPackets');
  if (seedsJson) {
    try {
      const seeds = JSON.parse(seedsJson);
      for (const seed of seeds) {
        try {
          const { error } = await supabase
            .from('seed_inventory')
            .upsert({
              id: seed.id,
              user_id: user.id,
              garden_id: seed.gardenId,
              variety_id: seed.varietyId,
              variety_name: seed.varietyName,
              species_name: seed.speciesName,
              purchase_date: seed.purchaseDate,
              expiry_year: seed.expiryYear,
              is_open: seed.isOpen,
              quantity_remaining: seed.quantityRemaining,
              notes: seed.notes,
            }, {
              onConflict: 'id',
            });

          if (error) throw error;
          result.seeds.migrated++;
        } catch (error: any) {
          result.seeds.errors++;
          result.errors.push(`Seed ${seed.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      result.errors.push(`Seeds parsing: ${error.message}`);
    }
  }

  if (result.errors.length > 0) {
    result.success = false;
  }

  return result;
};

/**
 * Create backup of localStorage data before migration
 */
export const createBackup = (): string => {
  const backup = {
    gardens: StorageService.getGardens(),
    tasks: StorageService.getTasks(),
    devices: StorageService.getDevices(),
    seeds: localStorage.getItem('ortoSeedPackets'),
    timestamp: new Date().toISOString(),
  };

  const backupJson = JSON.stringify(backup, null, 2);
  
  // Save to localStorage as backup
  localStorage.setItem('ortoBackup_' + Date.now(), backupJson);
  
  return backupJson;
};

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  (window as any).migrateLocalToCloud = migrateLocalToCloud;
  (window as any).createBackup = createBackup;
}

