/**
 * Migration Wizard Component
 * Guides users through migrating data from localStorage to Supabase
 */

import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { getSupabaseClient } from '../config/supabase';
import { Garden, GardenTask, SmartDevice, SeedPacket } from '../types';
import { Loader2, CheckCircle, AlertTriangle, Database, Cloud, ArrowRight } from 'lucide-react';

interface MigrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface MigrationStats {
  gardens: number;
  tasks: number;
  devices: number;
  seeds: number;
  errors: number;
}

const MigrationWizard: React.FC<MigrationWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'preview' | 'migrating' | 'complete' | 'error'>('preview');
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();
  if (!supabase) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Supabase non configurato. Configura le credenziali prima di migrare.</p>
      </div>
    );
  }

  const previewData = () => {
    const gardens = StorageService.getGardens();
    const tasks = StorageService.getTasks();
    const devices = StorageService.getDevices();
    
    // Get seeds from localStorage
    const seedsJson = localStorage.getItem('ortoSeedPackets');
    const seeds = seedsJson ? JSON.parse(seedsJson) : [];

    setStats({
      gardens: gardens.length,
      tasks: tasks.length,
      devices: devices.length,
      seeds: seeds.length,
      errors: 0,
    });
  };

  React.useEffect(() => {
    previewData();
  }, []);

  const startMigration = async () => {
    setStep('migrating');
    setProgress(0);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utente non autenticato. Effettua il login prima di migrare.');
      }

      const gardens = StorageService.getGardens();
      const tasks = StorageService.getTasks();
      const devices = StorageService.getDevices();
      const seedsJson = localStorage.getItem('ortoSeedPackets');
      const seeds = seedsJson ? JSON.parse(seedsJson) : [];

      let errors = 0;
      const total = gardens.length + tasks.length + seeds.length;
      let completed = 0;

      // Migrate Gardens
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
          completed++;
          setProgress((completed / total) * 100);
        } catch (e) {
          console.error('Error migrating garden:', e);
          errors++;
        }
      }

      // Migrate Tasks
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
          completed++;
          setProgress((completed / total) * 100);
        } catch (e) {
          console.error('Error migrating task:', e);
          errors++;
        }
      }

      // Migrate Seeds
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
          completed++;
          setProgress((completed / total) * 100);
        } catch (e) {
          console.error('Error migrating seed:', e);
          errors++;
        }
      }

      setStats(prev => prev ? { ...prev, errors } : null);
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Errore durante la migrazione');
      setStep('error');
    }
  };

  if (step === 'preview' && stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Database size={24} className="text-blue-600" />
          <h3 className="text-lg md:text-xl font-bold text-gray-800">Migrazione Dati</h3>
        </div>

        <p className="text-gray-600 mb-6">
          Migra i tuoi dati da localStorage a Supabase per sincronizzazione cloud e backup automatico.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-gray-800 mb-3">Dati da migrare:</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Orti:</span>
              <span className="font-bold">{stats.gardens}</span>
            </div>
            <div className="flex justify-between">
              <span>Task:</span>
              <span className="font-bold">{stats.tasks}</span>
            </div>
            <div className="flex justify-between">
              <span>Dispositivi IoT:</span>
              <span className="font-bold">{stats.devices}</span>
            </div>
            <div className="flex justify-between">
              <span>Buste Semi:</span>
              <span className="font-bold">{stats.seeds}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={startMigration}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3"
          >
            <Cloud size={18} />
            Inizia Migrazione
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annulla
          </button>
        </div>
      </div>
    );
  }

  if (step === 'migrating') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Migrazione in corso...</h3>
          <p className="text-gray-600 mb-4">Non chiudere questa finestra</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">{Math.round(progress)}% completato</p>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Migrazione Completata!</h3>
          <p className="text-gray-600 mb-4">
            I tuoi dati sono stati migrati con successo a Supabase.
          </p>
          {stats && stats.errors > 0 && (
            <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-3 mb-4">
              <p className="text-yellow-full max-w-sm text-sm">
                ⚠️ {stats.errors} errori durante la migrazione. Controlla i log per dettagli.
              </p>
            </div>
          )}
          <button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Continua
          </button>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-600" />
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Errore durante la migrazione</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep('preview')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              Riprova
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MigrationWizard;

