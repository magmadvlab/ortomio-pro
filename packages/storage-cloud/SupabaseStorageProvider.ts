/**
 * Supabase Storage Provider Implementation
 * Implements IStorageProvider for cloud storage via Supabase
 */

import { IStorageProvider } from '../core/storage/interface';
import { Garden, GardenTask, SmartDevice, SeedPacket, HarvestLogData, PlantPhotoLog, MechanicalWorkRecord, TreatmentRecordDB } from '@/types';
import { CustomCrop, CropLearningEvent } from '@/types/customCrop';
import { CustomPlan } from '@/types/customPlan';
import { Agronomist, AgronomistConsultation, AgronomistAdvice } from '@/types/agronomist';
import { GardenAccessory } from '@/types/accessories';
import { HydroponicReading, AquaponicReading } from '@/types/indoorGrowing';
import { GardenBed } from '@/types/gardenBed';
import { SeedlingBatch } from '@/services/seedlingService';
import { SaplingBatch } from '@/services/saplingService';
import { getSupabaseClient } from '@/config/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CropArchetype, CropProfile, CropAlias, ArchetypeId, OfficialCrop } from '@/types/archetypes';
import { IrrigationSystem, IrrigationZone, IrrigationComponent, WateringLog } from '@/types/irrigation';
import { sendNotification, createTaskCompletedNotification, createTaskReminderNotification } from '@/services/notificationService';

export class SupabaseStorageProvider implements IStorageProvider {
  private client: SupabaseClient | null;

  constructor() {
    this.client = getSupabaseClient();
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  private ensureClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not available. Check configuration.');
    }
    return this.client;
  }

  // Gardens
  async getGardens(): Promise<Garden[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('gardens')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return this.mapGardensFromDB(data || []);
  }

  async getGarden(id: string): Promise<Garden | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('gardens')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.mapGardenFromDB(data);
  }

  async createGarden(garden: Omit<Garden, 'id' | 'createdAt'>): Promise<Garden> {
    const client = this.ensureClient();
    
    // Verify user authentication with detailed logging
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError) {
      console.error('Auth error in createGarden:', authError);
      throw new Error('Authentication error. Please log in again.');
    }
    
    if (!user) {
      console.error('No user found in createGarden');
      throw new Error('User not authenticated. Please log in to sync your data, or the app will use local storage automatically.');
    }

    console.log('Creating garden for user:', user.id, 'Garden name:', garden.name);

    // Ensure profile exists before creating garden - use maybeSingle() to avoid 406 error
    const { data: profile, error: profileCheckError } = await client
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileCheckError) {
      console.error('Error checking profile:', profileCheckError);
      // Continue anyway - we'll try to create profile
    }
    
    if (!profile) {
      console.log('Profile not found, creating default profile for user:', user.id);
      // Create profile if it doesn't exist
      const { error: profileError } = await client
        .from('profiles')
        .insert({
          id: user.id,
          tier: 'FREE',
          ai_credits_total: 3,
          ai_credits_used: 0,
        });
      
      if (profileError) {
        // If profile was just created by another request (race condition), that's ok
        if (profileError.code === '23505') {
          console.log('Profile already exists (created by another request)');
        } else {
          console.error('Error creating profile before garden creation:', profileError);
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }
      } else {
        console.log('Profile created successfully for user:', user.id);
      }
    } else {
      console.log('Profile exists for user:', user.id);
    }

    const dbGarden = this.mapGardenToDB(garden);
    
    // Ensure required fields are present
    if (!dbGarden.name) {
      throw new Error('Garden name is required');
    }
    
    console.log('Inserting garden into database:', {
      name: dbGarden.name,
      user_id: user.id,
      size_sq_meters: dbGarden.size_sq_meters ?? 0,
      garden_type: dbGarden.garden_type
    });
    
    const { data, error } = await client
      .from('gardens')
      .insert({ 
        ...dbGarden, 
        user_id: user.id,
        size_sq_meters: dbGarden.size_sq_meters ?? 0,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating garden:', error);
      console.error('Garden data attempted:', { ...dbGarden, user_id: user.id });
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to create garden: ${error.message}`);
    }
    
    console.log('Garden created successfully:', data.id);
    return this.mapGardenFromDB(data);
  }

  async updateGarden(id: string, updates: Partial<Garden>): Promise<Garden> {
    const client = this.ensureClient();
    const dbUpdates = this.mapGardenToDB(updates as Garden);
    const { data, error } = await client
      .from('gardens')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapGardenFromDB(data);
  }

  async deleteGarden(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('gardens')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Tasks
  async getTasks(gardenId?: string): Promise<GardenTask[]> {
    const client = this.ensureClient();
    let query = client.from('garden_tasks').select('*');
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return this.mapTasksFromDB(data || []);
  }

  async getTask(id: string): Promise<GardenTask | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('garden_tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapTaskFromDB(data);
  }

  async createTask(task: Omit<GardenTask, 'id'>): Promise<GardenTask> {
    const client = this.ensureClient();
    const dbTask = this.mapTaskToDB(task);
    const { data, error } = await client
      .from('garden_tasks')
      .insert(dbTask)
      .select()
      .single();
    
    if (error) throw error;
    const createdTask = this.mapTaskFromDB(data);
    
    // Invia notifica solo per task manuali (non suggeriti)
    if (!task.isSuggested) {
      try {
        const { data: { user } } = await client.auth.getUser();
        if (user?.email) {
          const { data: garden } = await client
            .from('gardens')
            .select('user_id')
            .eq('id', createdTask.gardenId)
            .single();
          
          if (garden) {
            await sendNotification({
              userId: garden.user_id,
              userEmail: user.email,
              type: 'task_created',
              subject: `📝 Nuovo task creato: ${createdTask.plantName}`,
              templateData: {
                taskId: createdTask.id,
                plantName: createdTask.plantName,
                taskType: createdTask.taskType,
                date: createdTask.date,
              },
            }, client).catch(err => {
              console.error('Error sending task created notification:', err);
            });
          }
        }
      } catch (err) {
        // Non bloccare operazione se notifica fallisce
        console.error('Error sending notification:', err);
      }
    }
    
    return createdTask;
  }

  async updateTask(id: string, updates: Partial<GardenTask>): Promise<GardenTask> {
    const client = this.ensureClient();
    
    // Ottieni task corrente per verificare se viene completato
    const { data: currentTask } = await client
      .from('garden_tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    const dbUpdates = this.mapTaskToDB(updates as GardenTask);
    const { data, error } = await client
      .from('garden_tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    const updatedTask = this.mapTaskFromDB(data);
    
    // Invia notifica se task è stato completato
    if (updates.completed === true && currentTask && !currentTask.completed) {
      try {
        const { data: { user } } = await client.auth.getUser();
        if (user?.email) {
          const { data: garden } = await client
            .from('gardens')
            .select('user_id')
            .eq('id', updatedTask.gardenId)
            .single();
          
          if (garden) {
            const notification = createTaskCompletedNotification(
              garden.user_id,
              user.email,
              {
                id: updatedTask.id,
                plant_name: updatedTask.plantName,
                task_type: updatedTask.taskType,
                date: updatedTask.date,
              }
            );
            await sendNotification(notification, client).catch(err => {
              console.error('Error sending task completed notification:', err);
            });
          }
        }
      } catch (err) {
        // Non bloccare operazione se notifica fallisce
        console.error('Error sending notification:', err);
      }
    }
    
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('garden_tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Smart Devices (stored in localStorage for now, can be migrated later)
  async getDevices(gardenId?: string): Promise<SmartDevice[]> {
    // TODO: Implement Supabase table for devices
    // For now, fallback to localStorage
    const saved = localStorage.getItem('ortoDevices');
    if (!saved) return [];
    try {
      const devices = JSON.parse(saved) as SmartDevice[];
      if (gardenId) {
        return devices.filter(d => d.gardenId === gardenId);
      }
      return devices;
    } catch {
      return [];
    }
  }

  async getDevice(id: string): Promise<SmartDevice | null> {
    const devices = await this.getDevices();
    return devices.find(d => d.id === id) || null;
  }

  async createDevice(device: Omit<SmartDevice, 'id' | 'lastUpdate'>): Promise<SmartDevice> {
    // TODO: Implement Supabase table for devices
    const newDevice: SmartDevice = {
      ...device,
      id: crypto.randomUUID(),
      lastUpdate: new Date().toISOString(),
    };
    const devices = await this.getDevices();
    devices.push(newDevice);
    localStorage.setItem('ortoDevices', JSON.stringify(devices));
    return newDevice;
  }

  async updateDevice(id: string, updates: Partial<SmartDevice>): Promise<SmartDevice> {
    // TODO: Implement Supabase table for devices
    const devices = await this.getDevices();
    const index = devices.findIndex(d => d.id === id);
    if (index === -1) throw new Error(`Device with id ${id} not found`);
    devices[index] = { ...devices[index], ...updates, lastUpdate: new Date().toISOString() };
    localStorage.setItem('ortoDevices', JSON.stringify(devices));
    return devices[index];
  }

  async deleteDevice(id: string): Promise<void> {
    // TODO: Implement Supabase table for devices
    const devices = await this.getDevices();
    const filtered = devices.filter(d => d.id !== id);
    localStorage.setItem('ortoDevices', JSON.stringify(filtered));
  }

  // Seed Inventory
  async getSeedPackets(gardenId?: string): Promise<SeedPacket[]> {
    const client = this.ensureClient();
    let query = client.from('seed_inventory').select('*');
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return this.mapSeedPacketsFromDB(data || []);
  }

  async getSeedPacket(id: string): Promise<SeedPacket | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('seed_inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapSeedPacketFromDB(data);
  }

  async createSeedPacket(packet: Omit<SeedPacket, 'id'>): Promise<SeedPacket> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dbPacket = this.mapSeedPacketToDB(packet);
    const { data, error } = await client
      .from('seed_inventory')
      .insert({ ...dbPacket, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapSeedPacketFromDB(data);
  }

  async updateSeedPacket(id: string, updates: Partial<SeedPacket>): Promise<SeedPacket> {
    const client = this.ensureClient();
    const dbUpdates = this.mapSeedPacketToDB(updates as SeedPacket);
    const { data, error } = await client
      .from('seed_inventory')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapSeedPacketFromDB(data);
  }

  async deleteSeedPacket(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('seed_inventory')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Harvest Logs
  async getHarvestLogs(gardenId?: string): Promise<HarvestLogData[]> {
    const client = this.ensureClient();
    let query = client.from('harvest_logs').select('*');
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }
    
    const { data, error } = await query.order('harvest_date', { ascending: false });
    if (error) throw error;
    return this.mapHarvestLogsFromDB(data || []);
  }

  async createHarvestLog(log: Omit<HarvestLogData, 'id'>): Promise<HarvestLogData> {
    const client = this.ensureClient();
    const dbLog = this.mapHarvestLogToDB(log);
    const { data, error } = await client
      .from('harvest_logs')
      .insert(dbLog)
      .select()
      .single();
    
    if (error) throw error;
    const createdLog = this.mapHarvestLogFromDB(data);
    
    // Invia notifica per raccolto registrato
    try {
      const { data: { user } } = await client.auth.getUser();
      if (user?.email) {
        const { data: garden } = await client
          .from('gardens')
          .select('user_id')
          .eq('id', createdLog.gardenId)
          .single();
        
        if (garden) {
          await sendNotification({
            userId: garden.user_id,
            userEmail: user.email,
            type: 'harvest_logged',
            subject: `🌾 Raccolto registrato: ${createdLog.plantName}`,
            templateData: {
              harvestId: createdLog.id,
              plantName: createdLog.plantName,
              quantity: createdLog.quantity,
              unit: createdLog.unit,
              harvestDate: createdLog.date,
            },
          }, client).catch(err => {
            console.error('Error sending harvest notification:', err);
          });
        }
      }
    } catch (err) {
      // Non bloccare operazione se notifica fallisce
      console.error('Error sending notification:', err);
    }
    
    return createdLog;
  }

  async updateHarvestLog(id: string, updates: Partial<HarvestLogData>): Promise<HarvestLogData> {
    const client = this.ensureClient();
    const dbUpdates = this.mapHarvestLogToDB(updates as HarvestLogData);
    const { data, error } = await client
      .from('harvest_logs')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapHarvestLogFromDB(data);
  }

  async deleteHarvestLog(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('harvest_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Pro Features
  async uploadPhoto(file: File, taskId: string, gardenId: string): Promise<string> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${gardenId}/${taskId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await client.storage
      .from('plant-photos')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = client.storage
      .from('plant-photos')
      .getPublicUrl(data.path);
    
    return publicUrl;
  }

  async getPhotoLogs(taskId: string): Promise<PlantPhotoLog[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('photo_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('photo_date', { ascending: true });
    
    if (error) throw error;
    return this.mapPhotoLogsFromDB(data || []);
  }

  async createPhotoLog(log: Omit<PlantPhotoLog, 'id' | 'createdAt'>): Promise<PlantPhotoLog> {
    const client = this.ensureClient();
    const dbLog = this.mapPhotoLogToDB(log);
    const { data, error } = await client
      .from('photo_logs')
      .insert(dbLog)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapPhotoLogFromDB(data);
  }

  // Mapper functions (DB <-> TypeScript)
  private mapGardenFromDB(db: any): Garden {
    return {
      id: db.id,
      name: db.name,
      coordinates: db.coordinates,
      sizeSqMeters: Number(db.size_sq_meters),
      sizeUnit: db.size_unit,
      soilType: db.soil_type,
      soilPh: db.soil_ph ? Number(db.soil_ph) : undefined,
      altitudeMeters: db.altitude_meters,
      delayFactorDays: db.delay_factor_days,
      sunExposure: db.sun_exposure,
      dailySunHours: db.daily_sun_hours,
      aspectDirection: db.aspect_direction,
      windProtection: db.wind_protection,
      hasCompostBin: db.has_compost_bin,
      isRaisedBed: db.is_raised_bed,
      gardenType: db.garden_type,
      greenhouseConfig: db.greenhouse_config,
      indoorConfig: db.indoor_config,
      hydroponicConfig: db.hydroponic_config,
      aquaponicConfig: db.aquaponic_config,
      aeroponicConfig: db.aeroponic_config,
      // Note: structure_config, orchard_config, olive_grove_config, vineyard_config 
      // non esistono nello schema del database online
      structureConfig: undefined, // db.structure_config non esiste nel DB
      vacationMode: db.vacation_mode,
      orchardConfig: undefined, // db.orchard_config non esiste nel DB
      oliveGroveConfig: undefined, // db.olive_grove_config non esiste nel DB
      vineyardConfig: undefined, // db.vineyard_config non esiste nel DB
      createdAt: db.created_at,
    };
  }

  private mapGardenToDB(garden: Partial<Garden>): any {
    const db: any = {};
    if (garden.name !== undefined) db.name = garden.name;
    if (garden.coordinates !== undefined) db.coordinates = garden.coordinates;
    if (garden.sizeSqMeters !== undefined) db.size_sq_meters = garden.sizeSqMeters;
    if (garden.sizeUnit !== undefined) db.size_unit = garden.sizeUnit;
    if (garden.soilType !== undefined) db.soil_type = garden.soilType;
    if (garden.soilPh !== undefined) db.soil_ph = garden.soilPh;
    if (garden.altitudeMeters !== undefined) db.altitude_meters = garden.altitudeMeters;
    if (garden.delayFactorDays !== undefined) db.delay_factor_days = garden.delayFactorDays;
    if (garden.sunExposure !== undefined) db.sun_exposure = garden.sunExposure;
    if (garden.dailySunHours !== undefined) db.daily_sun_hours = garden.dailySunHours;
    if (garden.aspectDirection !== undefined) db.aspect_direction = garden.aspectDirection;
    if (garden.windProtection !== undefined) db.wind_protection = garden.windProtection;
    if (garden.hasCompostBin !== undefined) db.has_compost_bin = garden.hasCompostBin;
    if (garden.isRaisedBed !== undefined) db.is_raised_bed = garden.isRaisedBed;
    if (garden.gardenType !== undefined) db.garden_type = garden.gardenType;
    if (garden.greenhouseConfig !== undefined) db.greenhouse_config = garden.greenhouseConfig;
    if (garden.indoorConfig !== undefined) db.indoor_config = garden.indoorConfig;
    if (garden.hydroponicConfig !== undefined) db.hydroponic_config = garden.hydroponicConfig;
    if (garden.aquaponicConfig !== undefined) db.aquaponic_config = garden.aquaponicConfig;
    if (garden.aeroponicConfig !== undefined) db.aeroponic_config = garden.aeroponicConfig;
    // Note: structure_config, orchard_config, olive_grove_config, vineyard_config 
    // non esistono nello schema del database online, quindi non vengono inseriti
    // if (garden.structureConfig !== undefined) db.structure_config = garden.structureConfig;
    if (garden.vacationMode !== undefined) db.vacation_mode = garden.vacationMode;
    // if (garden.orchardConfig !== undefined) db.orchard_config = garden.orchardConfig;
    // if (garden.oliveGroveConfig !== undefined) db.olive_grove_config = garden.oliveGroveConfig;
    // if (garden.vineyardConfig !== undefined) db.vineyard_config = garden.vineyardConfig;
    return db;
  }

  private mapGardensFromDB(dbArray: any[]): Garden[] {
    return dbArray.map(db => this.mapGardenFromDB(db));
  }

  private mapTaskFromDB(db: any): GardenTask {
    const task: Partial<GardenTask> = {
      id: db.id,
      gardenId: db.garden_id,
      plantName: db.plant_name,
      variety: db.variety,
      plantingMethod: db.planting_method,
      locationType: db.location_type,
      initialQuantity: db.initial_quantity,
      currentQuantity: db.current_quantity,
      taskType: db.task_type,
      stage: db.stage,
      lifecycleState: db.lifecycle_state,
      season: db.season,
      date: db.date,
      expectedTransplantDate: db.expected_transplant_date,
      moonPhase: db.moon_phase,
      completed: db.completed,
      notes: db.notes,
      nextDueDate: db.next_due_date,
      treatmentProductId: db.treatment_product_id,
      gridPosition: db.grid_position,
      gridRotation: db.grid_rotation,
      userResponses: db.user_responses,
      sowingDetails: db.sowing_details,
      recordedBrix: db.recorded_brix ? Number(db.recorded_brix) : undefined,
      harvestReadyAnalysis: db.harvest_ready_analysis,
      harvestHistory: db.harvest_history,
      finalHarvest: db.final_harvest,
      strawberryData: db.strawberry_data,
      fruitTreeData: db.fruit_tree_data,
      aromaticData: db.aromatic_data,
      oliveData: db.olive_data,
      vineData: db.vine_data,
      images: db.images,
      lastPhotoDate: db.last_photo_date,
      // Sistema Archetipi
      archetypeId: db.archetype_id,
      rootZoneDepthCm: db.root_zone_depth_cm,
      irrigationSetup: db.irrigation_setup,
      // Tracking origine pianta
      seedPacketId: db.seed_packet_id,
      seedlingBatchId: db.seedling_batch_id,
      saplingBatchId: db.sapling_batch_id,
      bedId: db.bed_id,
      // Precision Agriculture
      zoneId: db.zone_id,
      // Tracking suggerimenti
      suggestedDate: db.suggested_date,
      actualCompletedDate: db.actual_completed_date,
      isSuggested: db.is_suggested,
      suggestedBy: db.suggested_by,
      // Scheduling fields
      scheduledDate: db.scheduled_date,
      schedulingType: db.scheduling_type,
      recurrencePattern: db.recurrence_pattern,
      // Specialized Crop Data (mancanti)
      exoticFruitData: db.exotic_fruit_data,
      mechanicalWorkData: db.mechanical_work_data,
      treePruningData: db.tree_pruning_data,
      hydroponicData: db.hydroponic_data,
      aquaponicData: db.aquaponic_data,
      aeroponicData: db.aeroponic_data,
    };
    return task as GardenTask;
  }

  private mapTaskToDB(task: Partial<GardenTask>): any {
    const db: any = {};
    if (task.gardenId !== undefined) db.garden_id = task.gardenId;
    if (task.plantName !== undefined) db.plant_name = task.plantName;
    if (task.variety !== undefined) db.variety = task.variety;
    if (task.plantingMethod !== undefined) db.planting_method = task.plantingMethod;
    if (task.locationType !== undefined) db.location_type = task.locationType;
    if (task.initialQuantity !== undefined) db.initial_quantity = task.initialQuantity;
    if (task.currentQuantity !== undefined) db.current_quantity = task.currentQuantity;
    if (task.taskType !== undefined) db.task_type = task.taskType;
    if (task.stage !== undefined) db.stage = task.stage;
    if (task.lifecycleState !== undefined) db.lifecycle_state = task.lifecycleState;
    if (task.season !== undefined) db.season = task.season;
    if (task.date !== undefined) db.date = task.date;
    if (task.expectedTransplantDate !== undefined) db.expected_transplant_date = task.expectedTransplantDate;
    if (task.moonPhase !== undefined) db.moon_phase = task.moonPhase;
    if (task.completed !== undefined) db.completed = task.completed;
    if (task.notes !== undefined) db.notes = task.notes;
    if (task.nextDueDate !== undefined) db.next_due_date = task.nextDueDate;
    if (task.treatmentProductId !== undefined) db.treatment_product_id = task.treatmentProductId;
    if (task.gridPosition !== undefined) db.grid_position = task.gridPosition;
    if (task.gridRotation !== undefined) db.grid_rotation = task.gridRotation;
    if (task.userResponses !== undefined) db.user_responses = task.userResponses;
    if (task.sowingDetails !== undefined) db.sowing_details = task.sowingDetails;
    if (task.recordedBrix !== undefined) db.recorded_brix = task.recordedBrix;
    if (task.harvestReadyAnalysis !== undefined) db.harvest_ready_analysis = task.harvestReadyAnalysis;
    if (task.harvestHistory !== undefined) db.harvest_history = task.harvestHistory;
    if (task.finalHarvest !== undefined) db.final_harvest = task.finalHarvest;
    if (task.strawberryData !== undefined) db.strawberry_data = task.strawberryData;
    if (task.fruitTreeData !== undefined) db.fruit_tree_data = task.fruitTreeData;
    if (task.aromaticData !== undefined) db.aromatic_data = task.aromaticData;
    if (task.oliveData !== undefined) db.olive_data = task.oliveData;
    if (task.vineData !== undefined) db.vine_data = task.vineData;
    if (task.images !== undefined) db.images = task.images;
    if (task.lastPhotoDate !== undefined) db.last_photo_date = task.lastPhotoDate;
    // Sistema Archetipi
    if (task.archetypeId !== undefined) db.archetype_id = task.archetypeId;
    if (task.rootZoneDepthCm !== undefined) db.root_zone_depth_cm = task.rootZoneDepthCm;
    if (task.irrigationSetup !== undefined) db.irrigation_setup = task.irrigationSetup;
    // Tracking origine pianta
    if (task.seedPacketId !== undefined) db.seed_packet_id = task.seedPacketId;
    if (task.seedlingBatchId !== undefined) db.seedling_batch_id = task.seedlingBatchId;
    if (task.saplingBatchId !== undefined) db.sapling_batch_id = task.saplingBatchId;
    if (task.bedId !== undefined) db.bed_id = task.bedId;
    // Precision Agriculture
    if (task.zoneId !== undefined) db.zone_id = task.zoneId;
    // Tracking suggerimenti
    if (task.suggestedDate !== undefined) db.suggested_date = task.suggestedDate;
    if (task.actualCompletedDate !== undefined) db.actual_completed_date = task.actualCompletedDate;
    if (task.isSuggested !== undefined) db.is_suggested = task.isSuggested;
    if (task.suggestedBy !== undefined) db.suggested_by = task.suggestedBy;
    // Scheduling fields
    if (task.scheduledDate !== undefined) db.scheduled_date = task.scheduledDate;
    if (task.schedulingType !== undefined) db.scheduling_type = task.schedulingType;
    if (task.recurrencePattern !== undefined) db.recurrence_pattern = task.recurrencePattern;
    // Specialized Crop Data
    if (task.exoticFruitData !== undefined) db.exotic_fruit_data = task.exoticFruitData;
    if (task.mechanicalWorkData !== undefined) db.mechanical_work_data = task.mechanicalWorkData;
    if (task.treePruningData !== undefined) db.tree_pruning_data = task.treePruningData;
    if (task.hydroponicData !== undefined) db.hydroponic_data = task.hydroponicData;
    if (task.aquaponicData !== undefined) db.aquaponic_data = task.aquaponicData;
    if (task.aeroponicData !== undefined) db.aeroponic_data = task.aeroponicData;
    return db;
  }

  private mapTasksFromDB(dbArray: any[]): GardenTask[] {
    return dbArray.map(db => this.mapTaskFromDB(db));
  }

  private mapSeedPacketFromDB(db: any): SeedPacket {
    return {
      id: db.id,
      varietyId: db.variety_id,
      varietyName: db.variety_name,
      speciesName: db.species_name,
      purchaseDate: db.purchase_date,
      expiryYear: db.expiry_year,
      isOpen: db.is_open,
      quantityRemaining: db.quantity_remaining,
      initialQuantity: db.initial_quantity !== null && db.initial_quantity !== undefined ? db.initial_quantity : undefined,
      currentQuantity: db.current_quantity !== null && db.current_quantity !== undefined ? db.current_quantity : undefined,
      // Nuovi campi per quantità flessibili
      quantityDisplay: db.quantity_display || undefined,
      quantityMin: db.quantity_min !== null && db.quantity_min !== undefined ? db.quantity_min : undefined,
      quantityMax: db.quantity_max !== null && db.quantity_max !== undefined ? db.quantity_max : undefined,
      quantityExact: db.quantity_exact !== null && db.quantity_exact !== undefined ? db.quantity_exact : undefined,
      notes: db.notes,
      gardenId: db.garden_id,
    };
  }

  private mapSeedPacketToDB(packet: Partial<SeedPacket>): any {
    const db: any = {};
    if (packet.varietyId !== undefined) db.variety_id = packet.varietyId;
    if (packet.varietyName !== undefined) db.variety_name = packet.varietyName;
    if (packet.speciesName !== undefined) db.species_name = packet.speciesName;
    if (packet.purchaseDate !== undefined) db.purchase_date = packet.purchaseDate;
    if (packet.expiryYear !== undefined) db.expiry_year = packet.expiryYear;
    if (packet.isOpen !== undefined) db.is_open = packet.isOpen;
    if (packet.quantityRemaining !== undefined) db.quantity_remaining = packet.quantityRemaining;
    if (packet.initialQuantity !== undefined) db.initial_quantity = packet.initialQuantity;
    if (packet.currentQuantity !== undefined) db.current_quantity = packet.currentQuantity;
    // Nuovi campi per quantità flessibili
    if (packet.quantityDisplay !== undefined) db.quantity_display = packet.quantityDisplay;
    if (packet.quantityMin !== undefined) db.quantity_min = packet.quantityMin;
    if (packet.quantityMax !== undefined) db.quantity_max = packet.quantityMax;
    if (packet.quantityExact !== undefined) db.quantity_exact = packet.quantityExact;
    if (packet.notes !== undefined) db.notes = packet.notes;
    if (packet.gardenId !== undefined) db.garden_id = packet.gardenId;
    return db;
  }

  private mapSeedPacketsFromDB(dbArray: any[]): SeedPacket[] {
    return dbArray.map(db => this.mapSeedPacketFromDB(db));
  }

  private mapHarvestLogFromDB(db: any): HarvestLogData {
    return {
      id: db.id,
      plantName: db.plant_name,
      gardenId: db.garden_id,
      taskId: db.task_id,
      quantity: Number(db.quantity),
      unit: db.unit,
      rating: db.rating,
      date: db.harvest_date,
      photo: db.photo,
      brix: db.brix ? Number(db.brix) : undefined,
      notes: db.notes,
      suggestedRecipes: db.suggested_recipes,
      strawberryHarvest: db.strawberry_harvest,
      fruitTreeHarvest: db.fruit_tree_harvest,
      aromaticHarvest: db.aromatic_harvest,
      oliveHarvest: db.olive_harvest,
      vineHarvest: db.vine_harvest,
    };
  }

  private mapHarvestLogToDB(log: Partial<HarvestLogData>): any {
    const db: any = {};
    if (log.plantName !== undefined) db.plant_name = log.plantName;
    if (log.gardenId !== undefined) db.garden_id = log.gardenId;
    if (log.taskId !== undefined) db.task_id = log.taskId;
    if (log.quantity !== undefined) db.quantity = log.quantity;
    if (log.unit !== undefined) db.unit = log.unit;
    if (log.rating !== undefined) db.rating = log.rating;
    if (log.date !== undefined) db.harvest_date = log.date;
    if (log.photo !== undefined) db.photo = log.photo;
    if (log.brix !== undefined) db.brix = log.brix;
    if (log.notes !== undefined) db.notes = log.notes;
    if (log.suggestedRecipes !== undefined) db.suggested_recipes = log.suggestedRecipes;
    if (log.strawberryHarvest !== undefined) db.strawberry_harvest = log.strawberryHarvest;
    if (log.fruitTreeHarvest !== undefined) db.fruit_tree_harvest = log.fruitTreeHarvest;
    if (log.aromaticHarvest !== undefined) db.aromatic_harvest = log.aromaticHarvest;
    if (log.oliveHarvest !== undefined) db.olive_harvest = log.oliveHarvest;
    if (log.vineHarvest !== undefined) db.vine_harvest = log.vineHarvest;
    return db;
  }

  private mapHarvestLogsFromDB(dbArray: any[]): HarvestLogData[] {
    return dbArray.map(db => this.mapHarvestLogFromDB(db));
  }

  private mapPhotoLogFromDB(db: any): PlantPhotoLog {
    return {
      id: db.id,
      taskId: db.task_id,
      gardenId: db.garden_id,
      photoUrl: db.photo_url,
      photoDate: db.photo_date,
      daysFromPlanting: db.days_from_planting,
      analysisResult: db.analysis_result,
      notes: db.notes,
      createdAt: db.created_at,
    };
  }

  private mapPhotoLogToDB(log: Partial<PlantPhotoLog>): any {
    const db: any = {};
    if (log.taskId !== undefined) db.task_id = log.taskId;
    if (log.gardenId !== undefined) db.garden_id = log.gardenId;
    if (log.photoUrl !== undefined) db.photo_url = log.photoUrl;
    if (log.photoDate !== undefined) db.photo_date = log.photoDate;
    if (log.daysFromPlanting !== undefined) db.days_from_planting = log.daysFromPlanting;
    if (log.analysisResult !== undefined) db.analysis_result = log.analysisResult;
    if (log.notes !== undefined) db.notes = log.notes;
    return db;
  }

  private mapPhotoLogsFromDB(dbArray: any[]): PlantPhotoLog[] {
    return dbArray.map(db => this.mapPhotoLogFromDB(db));
  }

  // Custom Plans
  async createCustomPlan(plan: Omit<CustomPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomPlan> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dbPlan = {
      user_id: user.id,
      garden_id: plan.gardenId || null,
      name: plan.name,
      description: plan.description || null,
      base_master_sheet_id: plan.baseMasterSheetId,
      overrides: plan.overrides,
      custom_notes: plan.customNotes || [],
      custom_methods: plan.customMethods || [],
      additional_parameters: plan.additionalParameters || {},
      is_public: plan.isPublic || false,
    };

    const { data, error } = await client
      .from('custom_plans')
      .insert(dbPlan)
      .select()
      .single();

    if (error) throw error;
    return this.mapCustomPlanFromDB(data);
  }

  async getCustomPlan(id: string): Promise<CustomPlan | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('custom_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapCustomPlanFromDB(data);
  }

  async getUserCustomPlans(userId: string, gardenId?: string): Promise<CustomPlan[]> {
    const client = this.ensureClient();
    let query = client
      .from('custom_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (gardenId) {
      query = query.or(`garden_id.is.null,garden_id.eq.${gardenId}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(db => this.mapCustomPlanFromDB(db));
  }

  async updateCustomPlan(id: string, updates: Partial<CustomPlan>): Promise<CustomPlan> {
    const client = this.ensureClient();
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.overrides !== undefined) dbUpdates.overrides = updates.overrides;
    if (updates.customNotes !== undefined) dbUpdates.custom_notes = updates.customNotes;
    if (updates.customMethods !== undefined) dbUpdates.custom_methods = updates.customMethods;
    if (updates.additionalParameters !== undefined) dbUpdates.additional_parameters = updates.additionalParameters;
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;

    const { data, error } = await client
      .from('custom_plans')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapCustomPlanFromDB(data);
  }

  async deleteCustomPlan(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('custom_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapCustomPlanFromDB(db: any): CustomPlan {
    // This is a simplified mapping - CustomPlan extends PlantMasterSheet
    // In a real implementation, we'd need to fetch the base master sheet and merge
    return {
      id: db.id,
      baseMasterSheetId: db.base_master_sheet_id,
      userId: db.user_id,
      gardenId: db.garden_id,
      name: db.name,
      description: db.description,
      overrides: db.overrides || {},
      customNotes: db.custom_notes || [],
      customMethods: db.custom_methods || [],
      additionalParameters: db.additional_parameters || {},
      isPublic: db.is_public || false,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
      // Base PlantMasterSheet fields would be merged from base master sheet
      // For now, return minimal structure
    } as CustomPlan;
  }

  // Agronomists
  async createAgronomist(agronomist: Omit<Agronomist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agronomist> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dbAgronomist = {
      user_id: user.id,
      name: agronomist.name,
      email: agronomist.email || null,
      phone: agronomist.phone || null,
      specialization: agronomist.specialization || [],
      notes: agronomist.notes || null,
      preferred_contact_method: agronomist.preferredContactMethod,
      consultation_frequency: agronomist.consultationFrequency || null,
    };

    const { data, error } = await client
      .from('agronomists')
      .insert(dbAgronomist)
      .select()
      .single();

    if (error) throw error;
    return this.mapAgronomistFromDB(data);
  }

  async getAgronomists(userId: string): Promise<Agronomist[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('agronomists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(db => this.mapAgronomistFromDB(db));
  }

  async updateAgronomist(id: string, updates: Partial<Agronomist>): Promise<Agronomist> {
    const client = this.ensureClient();
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.specialization !== undefined) dbUpdates.specialization = updates.specialization;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.preferredContactMethod !== undefined) dbUpdates.preferred_contact_method = updates.preferredContactMethod;
    if (updates.consultationFrequency !== undefined) dbUpdates.consultation_frequency = updates.consultationFrequency;

    const { data, error } = await client
      .from('agronomists')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapAgronomistFromDB(data);
  }

  async deleteAgronomist(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('agronomists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapAgronomistFromDB(db: any): Agronomist {
    return {
      id: db.id,
      userId: db.user_id,
      name: db.name,
      email: db.email,
      phone: db.phone,
      specialization: db.specialization || [],
      notes: db.notes,
      preferredContactMethod: db.preferred_contact_method,
      consultationFrequency: db.consultation_frequency,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    };
  }

  // Consultations
  async createConsultation(consultation: Omit<AgronomistConsultation, 'id' | 'createdAt'>): Promise<AgronomistConsultation> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dbConsultation = {
      agronomist_id: consultation.agronomistId,
      user_id: user.id,
      garden_id: consultation.gardenId || null,
      task_id: consultation.taskId || null,
      date: consultation.date,
      consultation_type: consultation.consultationType,
      topic: consultation.topic,
      advice: consultation.advice,
      notes: consultation.notes || null,
      attachments: consultation.attachments || [],
    };

    const { data, error } = await client
      .from('agronomist_consultations')
      .insert(dbConsultation)
      .select()
      .single();

    if (error) throw error;
    return this.mapConsultationFromDB(data);
  }

  async getConsultations(userId: string, agronomistId?: string): Promise<AgronomistConsultation[]> {
    const client = this.ensureClient();
    let query = client
      .from('agronomist_consultations')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (agronomistId) {
      query = query.eq('agronomist_id', agronomistId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(db => this.mapConsultationFromDB(db));
  }

  private mapConsultationFromDB(db: any): AgronomistConsultation {
    return {
      id: db.id,
      agronomistId: db.agronomist_id,
      userId: db.user_id,
      gardenId: db.garden_id,
      taskId: db.task_id,
      date: db.date,
      consultationType: db.consultation_type,
      topic: db.topic,
      advice: db.advice || [],
      notes: db.notes,
      attachments: db.attachments || [],
      createdAt: db.created_at,
    };
  }

  // Advice
  async createAdvice(advice: Omit<AgronomistAdvice, 'id' | 'createdAt'>): Promise<AgronomistAdvice> {
    const client = this.ensureClient();
    const dbAdvice = {
      consultation_id: advice.consultationId,
      task_id: advice.taskId || null,
      advice_text: advice.adviceText,
      category: advice.category,
      priority: advice.priority,
      apply_date: advice.applyDate || null,
      apply_season: advice.applySeason || [],
      applied: advice.applied || false,
      applied_date: advice.appliedDate || null,
      result: advice.result || null,
    };

    const { data, error } = await client
      .from('agronomist_advice')
      .insert(dbAdvice)
      .select()
      .single();

    if (error) throw error;
    return this.mapAdviceFromDB(data);
  }

  async getAgronomistAdvice(taskId: string): Promise<AgronomistAdvice[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('agronomist_advice')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(db => this.mapAdviceFromDB(db));
  }

  async updateAdvice(id: string, updates: Partial<AgronomistAdvice>): Promise<AgronomistAdvice> {
    const client = this.ensureClient();
    const dbUpdates: any = {};
    if (updates.adviceText !== undefined) dbUpdates.advice_text = updates.adviceText;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.applyDate !== undefined) dbUpdates.apply_date = updates.applyDate;
    if (updates.applySeason !== undefined) dbUpdates.apply_season = updates.applySeason;
    if (updates.applied !== undefined) dbUpdates.applied = updates.applied;
    if (updates.appliedDate !== undefined) dbUpdates.applied_date = updates.appliedDate;
    if (updates.result !== undefined) dbUpdates.result = updates.result;

    const { data, error } = await client
      .from('agronomist_advice')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapAdviceFromDB(data);
  }

  private mapAdviceFromDB(db: any): AgronomistAdvice {
    return {
      id: db.id,
      consultationId: db.consultation_id,
      taskId: db.task_id,
      adviceText: db.advice_text,
      category: db.category,
      priority: db.priority,
      applyDate: db.apply_date,
      applySeason: db.apply_season || [],
      applied: db.applied || false,
      appliedDate: db.applied_date,
      result: db.result,
      createdAt: db.created_at,
    };
  }

  // Garden Accessories
  async getAccessories(gardenId?: string): Promise<GardenAccessory[]> {
    const client = this.ensureClient();
    let query = client.from('garden_accessories').select('*');
    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(db => this.mapAccessoryFromDB(db));
  }

  async getAccessory(id: string): Promise<GardenAccessory | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('garden_accessories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.mapAccessoryFromDB(data);
  }

  async createAccessory(accessory: Omit<GardenAccessory, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenAccessory> {
    const client = this.ensureClient();
    const dbData: any = {
      garden_id: accessory.gardenId,
      name: accessory.name,
      category: accessory.category,
      material: accessory.material,
      quantity: accessory.quantity,
      length_cm: accessory.length,
      height_cm: accessory.height,
      width_cm: accessory.width,
      diameter_cm: accessory.diameter,
      mesh_size_mm: accessory.meshSize,
      used_for: accessory.usedFor,
      installation_date: accessory.installationDate,
      expected_lifespan_years: accessory.expectedLifespan,
      last_maintenance: accessory.lastMaintenance,
      needs_replacement: accessory.needsReplacement || false,
      position: accessory.position,
    };
    if (accessory.supportType) dbData.support_type = accessory.supportType;
    if (accessory.nettingType) dbData.netting_type = accessory.nettingType;
    if (accessory.wireType) dbData.wire_type = accessory.wireType;

    const { data, error } = await client
      .from('garden_accessories')
      .insert(dbData)
      .select()
      .single();
    if (error) throw error;
    return this.mapAccessoryFromDB(data);
  }

  async updateAccessory(id: string, updates: Partial<GardenAccessory>): Promise<GardenAccessory> {
    const client = this.ensureClient();
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.supportType !== undefined) dbUpdates.support_type = updates.supportType;
    if (updates.nettingType !== undefined) dbUpdates.netting_type = updates.nettingType;
    if (updates.wireType !== undefined) dbUpdates.wire_type = updates.wireType;
    if (updates.material !== undefined) dbUpdates.material = updates.material;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.length !== undefined) dbUpdates.length_cm = updates.length;
    if (updates.height !== undefined) dbUpdates.height_cm = updates.height;
    if (updates.width !== undefined) dbUpdates.width_cm = updates.width;
    if (updates.diameter !== undefined) dbUpdates.diameter_cm = updates.diameter;
    if (updates.meshSize !== undefined) dbUpdates.mesh_size_mm = updates.meshSize;
    if (updates.usedFor !== undefined) dbUpdates.used_for = updates.usedFor;
    if (updates.installationDate !== undefined) dbUpdates.installation_date = updates.installationDate;
    if (updates.expectedLifespan !== undefined) dbUpdates.expected_lifespan_years = updates.expectedLifespan;
    if (updates.lastMaintenance !== undefined) dbUpdates.last_maintenance = updates.lastMaintenance;
    if (updates.needsReplacement !== undefined) dbUpdates.needs_replacement = updates.needsReplacement;
    if (updates.position !== undefined) dbUpdates.position = updates.position;

    const { data, error } = await client
      .from('garden_accessories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.mapAccessoryFromDB(data);
  }

  async deleteAccessory(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('garden_accessories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private mapAccessoryFromDB(db: any): GardenAccessory {
    return {
      id: db.id,
      gardenId: db.garden_id,
      name: db.name,
      category: db.category,
      supportType: db.support_type,
      nettingType: db.netting_type,
      wireType: db.wire_type,
      material: db.material,
      quantity: db.quantity,
      length: db.length_cm,
      height: db.height_cm,
      width: db.width_cm,
      diameter: db.diameter_cm,
      meshSize: db.mesh_size_mm,
      usedFor: db.used_for || [],
      installationDate: db.installation_date,
      expectedLifespan: db.expected_lifespan_years,
      lastMaintenance: db.last_maintenance,
      needsReplacement: db.needs_replacement || false,
      position: db.position,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    };
  }

  // Hydroponic Readings
  async getHydroponicReadings(gardenId: string, limit?: number): Promise<HydroponicReading[]> {
    const client = this.ensureClient();
    let query = client
      .from('hydroponic_readings')
      .select('*')
      .eq('garden_id', gardenId)
      .order('reading_date', { ascending: false });
    if (limit) {
      query = query.limit(limit);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(db => this.mapHydroponicReadingFromDB(db));
  }

  async createHydroponicReading(reading: Omit<HydroponicReading, 'id' | 'createdAt'>): Promise<HydroponicReading> {
    const client = this.ensureClient();
    const dbData: any = {
      garden_id: reading.gardenId,
      reading_date: reading.readingDate,
      ph: reading.ph,
      ec: reading.ec,
      water_temperature: reading.waterTemperature,
      reservoir_volume: reading.reservoirVolume,
      notes: reading.notes,
    };
    const { data, error } = await client
      .from('hydroponic_readings')
      .insert(dbData)
      .select()
      .single();
    if (error) throw error;
    return this.mapHydroponicReadingFromDB(data);
  }

  private mapHydroponicReadingFromDB(db: any): HydroponicReading {
    return {
      id: db.id,
      gardenId: db.garden_id,
      readingDate: db.reading_date,
      ph: db.ph,
      ec: db.ec,
      waterTemperature: db.water_temperature,
      reservoirVolume: db.reservoir_volume,
      notes: db.notes,
      createdAt: db.created_at,
    };
  }

  // Aquaponic Readings
  async getAquaponicReadings(gardenId: string, limit?: number): Promise<AquaponicReading[]> {
    const client = this.ensureClient();
    let query = client
      .from('aquaponic_readings')
      .select('*')
      .eq('garden_id', gardenId)
      .order('reading_date', { ascending: false });
    if (limit) {
      query = query.limit(limit);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(db => this.mapAquaponicReadingFromDB(db));
  }

  async createAquaponicReading(reading: Omit<AquaponicReading, 'id' | 'createdAt'>): Promise<AquaponicReading> {
    const client = this.ensureClient();
    const dbData: any = {
      garden_id: reading.gardenId,
      reading_date: reading.readingDate,
      ph: reading.ph,
      ammonia: reading.ammonia,
      nitrite: reading.nitrite,
      nitrate: reading.nitrate,
      water_temperature: reading.waterTemperature,
      dissolved_oxygen: reading.dissolvedOxygen,
      notes: reading.notes,
    };
    const { data, error } = await client
      .from('aquaponic_readings')
      .insert(dbData)
      .select()
      .single();
    if (error) throw error;
    return this.mapAquaponicReadingFromDB(data);
  }

  private mapAquaponicReadingFromDB(db: any): AquaponicReading {
    return {
      id: db.id,
      gardenId: db.garden_id,
      readingDate: db.reading_date,
      ph: db.ph,
      ammonia: db.ammonia,
      nitrite: db.nitrite,
      nitrate: db.nitrate,
      waterTemperature: db.water_temperature,
      dissolvedOxygen: db.dissolved_oxygen,
      notes: db.notes,
      createdAt: db.created_at,
    };
  }

  // Garden Beds
  async getGardenBeds(gardenId: string): Promise<GardenBed[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('garden_beds')
      .select('*')
      .eq('garden_id', gardenId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(db => this.mapGardenBedFromDB(db));
  }

  async getGardenBed(id: string): Promise<GardenBed | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('garden_beds')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.mapGardenBedFromDB(data);
  }

  async createGardenBed(bed: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenBed> {
    const client = this.ensureClient();
    
    // Calcola area automaticamente
    let areaSqMeters = bed.areaSqMeters;
    if (!areaSqMeters) {
      if (bed.shape === 'Rectangle' && bed.lengthCm && bed.widthCm) {
        areaSqMeters = (bed.lengthCm * bed.widthCm) / 10000;
      } else if (bed.shape === 'Circle' && bed.diameterCm) {
        areaSqMeters = (Math.PI * Math.pow(bed.diameterCm / 2, 2)) / 10000;
      }
    }
    
    const dbData: any = {
      garden_id: bed.gardenId,
      name: bed.name,
      bed_type: bed.bedType,
      shape: bed.shape,
      length_cm: bed.lengthCm,
      width_cm: bed.widthCm,
      diameter_cm: bed.diameterCm,
      size_sq_meters: areaSqMeters,
      position: bed.position,
      soil_type: bed.soilType,
      ...(bed.sunExposure !== undefined && { sun_exposure: bed.sunExposure }),
      daily_sun_hours: bed.dailySunHours,
      structure_id: bed.structureId,
      structure_type: bed.structureType,
      is_covered: bed.isCovered || false,
      covering_structure_id: bed.coveringStructureId,
      notes: bed.notes,
    };
    
    const { data, error } = await client
      .from('garden_beds')
      .insert(dbData)
      .select()
      .single();
    if (error) throw error;
    return this.mapGardenBedFromDB(data);
  }

  async updateGardenBed(id: string, updates: Partial<GardenBed>): Promise<GardenBed> {
    const client = this.ensureClient();
    
    // Ricalcola area se dimensioni sono cambiate
    let areaSqMeters = updates.areaSqMeters;
    if (updates.lengthCm !== undefined || updates.widthCm !== undefined || updates.diameterCm !== undefined) {
      const currentBed = await this.getGardenBed(id);
      if (currentBed) {
        const shape = updates.shape || currentBed.shape;
        const lengthCm = updates.lengthCm ?? currentBed.lengthCm;
        const widthCm = updates.widthCm ?? currentBed.widthCm;
        const diameterCm = updates.diameterCm ?? currentBed.diameterCm;
        
        if (shape === 'Rectangle' && lengthCm && widthCm) {
          areaSqMeters = (lengthCm * widthCm) / 10000;
        } else if (shape === 'Circle' && diameterCm) {
          areaSqMeters = (Math.PI * Math.pow(diameterCm / 2, 2)) / 10000;
        }
      }
    }
    
    const dbData: any = {};
    if (updates.name !== undefined) dbData.name = updates.name;
    if (updates.bedType !== undefined) dbData.bed_type = updates.bedType;
    if (updates.shape !== undefined) dbData.shape = updates.shape;
    if (updates.lengthCm !== undefined) dbData.length_cm = updates.lengthCm;
    if (updates.widthCm !== undefined) dbData.width_cm = updates.widthCm;
    if (updates.diameterCm !== undefined) dbData.diameter_cm = updates.diameterCm;
    if (areaSqMeters !== undefined) dbData.size_sq_meters = areaSqMeters;
    if (updates.position !== undefined) dbData.position = updates.position;
    if (updates.soilType !== undefined) dbData.soil_type = updates.soilType;
    if (updates.sunExposure !== undefined) dbData.sun_exposure = updates.sunExposure;
    if (updates.dailySunHours !== undefined) dbData.daily_sun_hours = updates.dailySunHours;
    if (updates.structureId !== undefined) dbData.structure_id = updates.structureId;
    if (updates.structureType !== undefined) dbData.structure_type = updates.structureType;
    if (updates.isCovered !== undefined) dbData.is_covered = updates.isCovered;
    if (updates.coveringStructureId !== undefined) dbData.covering_structure_id = updates.coveringStructureId;
    if (updates.notes !== undefined) dbData.notes = updates.notes;
    
    const { data, error } = await client
      .from('garden_beds')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.mapGardenBedFromDB(data);
  }

  async deleteGardenBed(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('garden_beds')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Sync method (optional in interface)
  async sync(): Promise<void> {
    // Per Supabase, la sincronizzazione è automatica (tutte le operazioni CRUD sono già sincronizzate)
    // Questo metodo può essere usato per forzare refresh o aggiornare timestamp
    const client = this.ensureClient();
    
    try {
      // Verifica connessione facendo una query leggera
      await client.from('gardens').select('id').limit(1);
    } catch (error) {
      // Se c'è un errore, lo rilanciamo per permettere gestione errori nel chiamante
      throw error;
    }
  }

  private mapGardenBedFromDB(db: any): GardenBed {
    return {
      id: db.id,
      gardenId: db.garden_id,
      name: db.name,
      bedType: db.bed_type,
      shape: db.shape,
      lengthCm: db.length_cm,
      widthCm: db.width_cm,
      diameterCm: db.diameter_cm,
      areaSqMeters: db.size_sq_meters,
      position: db.position,
      soilType: db.soil_type,
      sunExposure: db.sun_exposure || undefined,
      dailySunHours: db.daily_sun_hours,
      structureId: db.structure_id,
      structureType: db.structure_type,
      isCovered: db.is_covered || false,
      coveringStructureId: db.covering_structure_id,
      notes: db.notes,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    };
  }

  // Seedling Batches
  async getSeedlingBatches(gardenId?: string): Promise<SeedlingBatch[]> {
    const client = this.ensureClient();
    let query = client.from('seedling_batches').select('*');
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(db => this.mapSeedlingBatchFromDB(db));
  }

  async getSeedlingBatch(id: string): Promise<SeedlingBatch | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('seedling_batches')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.mapSeedlingBatchFromDB(data);
  }

  private mapSeedlingBatchFromDB(db: any): SeedlingBatch {
    return {
      id: db.id,
      plantName: db.plant_name,
      variety: db.variety,
      sowingDate: db.sowing_date,
      quantity: db.quantity,
      initialQuantity: db.initial_quantity !== null && db.initial_quantity !== undefined ? db.initial_quantity : undefined,
      location: db.location,
      phase: db.phase,
      currentQuantity: db.current_quantity !== null && db.current_quantity !== undefined ? db.current_quantity : undefined,
      expectedTransplantDate: db.expected_transplant_date,
      notes: db.notes,
      photoLog: db.photo_log || [],
      gardenId: db.garden_id,
      source: db.source,
      purchaseDate: db.purchase_date,
      nurseryName: db.nursery_name,
    };
  }

  private mapSeedlingBatchToDB(batch: Partial<SeedlingBatch>): any {
    const db: any = {};
    if (batch.plantName !== undefined) db.plant_name = batch.plantName;
    if (batch.variety !== undefined) db.variety = batch.variety;
    if (batch.sowingDate !== undefined) db.sowing_date = batch.sowingDate;
    if (batch.quantity !== undefined) db.quantity = batch.quantity;
    if (batch.initialQuantity !== undefined) db.initial_quantity = batch.initialQuantity;
    if (batch.location !== undefined) db.location = batch.location;
    if (batch.phase !== undefined) db.phase = batch.phase;
    if (batch.currentQuantity !== undefined) db.current_quantity = batch.currentQuantity;
    if (batch.expectedTransplantDate !== undefined) db.expected_transplant_date = batch.expectedTransplantDate;
    if (batch.notes !== undefined) db.notes = batch.notes;
    if (batch.photoLog !== undefined) db.photo_log = batch.photoLog;
    if (batch.gardenId !== undefined) db.garden_id = batch.gardenId;
    if (batch.source !== undefined) db.source = batch.source;
    if (batch.purchaseDate !== undefined) db.purchase_date = batch.purchaseDate;
    if (batch.nurseryName !== undefined) db.nursery_name = batch.nurseryName;
    return db;
  }

  async createSeedlingBatch(batch: Omit<SeedlingBatch, 'id'>): Promise<SeedlingBatch> {
    const client = this.ensureClient();
    const dbBatch = this.mapSeedlingBatchToDB(batch);
    const { data, error } = await client
      .from('seedling_batches')
      .insert(dbBatch)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapSeedlingBatchFromDB(data);
  }

  async updateSeedlingBatch(id: string, updates: Partial<SeedlingBatch>): Promise<SeedlingBatch> {
    const client = this.ensureClient();
    const dbUpdates = this.mapSeedlingBatchToDB(updates);
    const { data, error } = await client
      .from('seedling_batches')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapSeedlingBatchFromDB(data);
  }

  async deleteSeedlingBatch(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('seedling_batches')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Sapling Batches
  private mapSaplingBatchFromDB(db: any): SaplingBatch {
    return {
      id: db.id,
      plantName: db.plant_name,
      variety: db.variety,
      saplingType: db.sapling_type,
      purchaseDate: db.purchase_date,
      plantingDate: db.planting_date,
      quantity: db.quantity,
      initialQuantity: db.initial_quantity !== null && db.initial_quantity !== undefined ? db.initial_quantity : undefined,
      location: db.location,
      phase: db.phase,
      currentQuantity: db.current_quantity !== null && db.current_quantity !== undefined ? db.current_quantity : undefined,
      expectedEstablishmentDate: db.expected_establishment_date,
      rootstock: db.rootstock,
      spacing: db.spacing,
      notes: db.notes,
      photoLog: db.photo_log || [],
      gardenId: db.garden_id,
      specializedCropId: db.specialized_crop_id,
    };
  }

  private mapSaplingBatchToDB(batch: Partial<SaplingBatch>): any {
    const db: any = {};
    if (batch.plantName !== undefined) db.plant_name = batch.plantName;
    if (batch.variety !== undefined) db.variety = batch.variety;
    if (batch.saplingType !== undefined) db.sapling_type = batch.saplingType;
    if (batch.purchaseDate !== undefined) db.purchase_date = batch.purchaseDate;
    if (batch.plantingDate !== undefined) db.planting_date = batch.plantingDate;
    if (batch.quantity !== undefined) db.quantity = batch.quantity;
    if (batch.initialQuantity !== undefined) db.initial_quantity = batch.initialQuantity;
    if (batch.location !== undefined) db.location = batch.location;
    if (batch.phase !== undefined) db.phase = batch.phase;
    if (batch.currentQuantity !== undefined) db.current_quantity = batch.currentQuantity;
    if (batch.expectedEstablishmentDate !== undefined) db.expected_establishment_date = batch.expectedEstablishmentDate;
    if (batch.rootstock !== undefined) db.rootstock = batch.rootstock;
    if (batch.spacing !== undefined) db.spacing = batch.spacing;
    if (batch.notes !== undefined) db.notes = batch.notes;
    if (batch.photoLog !== undefined) db.photo_log = batch.photoLog;
    if (batch.gardenId !== undefined) db.garden_id = batch.gardenId;
    if (batch.specializedCropId !== undefined) db.specialized_crop_id = batch.specializedCropId;
    return db;
  }

  async getSaplingBatches(gardenId?: string): Promise<SaplingBatch[]> {
    const client = this.ensureClient();
    let query = client.from('sapling_batches').select('*');
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(db => this.mapSaplingBatchFromDB(db));
  }

  async getSaplingBatch(id: string): Promise<SaplingBatch | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('sapling_batches')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.mapSaplingBatchFromDB(data);
  }

  async createSaplingBatch(batch: Omit<SaplingBatch, 'id'>): Promise<SaplingBatch> {
    const client = this.ensureClient();
    const dbBatch = this.mapSaplingBatchToDB(batch);
    const { data, error } = await client
      .from('sapling_batches')
      .insert(dbBatch)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapSaplingBatchFromDB(data);
  }

  async updateSaplingBatch(id: string, updates: Partial<SaplingBatch>): Promise<SaplingBatch> {
    const client = this.ensureClient();
    const dbUpdates = this.mapSaplingBatchToDB(updates);
    const { data, error } = await client
      .from('sapling_batches')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapSaplingBatchFromDB(data);
  }

  async deleteSaplingBatch(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('sapling_batches')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Mechanical Work
  async getMechanicalWorks(gardenId?: string): Promise<MechanicalWorkRecord[]> {
    const client = this.ensureClient();
    let query = client
      .from('mechanical_work_register')
      .select('*')
      .order('work_date', { ascending: false });
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(db => this.mapMechanicalWorkFromDB(db));
  }

  async getMechanicalWork(id: string): Promise<MechanicalWorkRecord | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('mechanical_work_register')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.mapMechanicalWorkFromDB(data);
  }

  async createMechanicalWork(work: Omit<MechanicalWorkRecord, 'id' | 'user_id' | 'created_at'>): Promise<MechanicalWorkRecord> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await client
      .from('mechanical_work_register')
      .insert({
        user_id: user.id,
        garden_id: work.garden_id || null,
        work_type: work.work_type,
        work_date: work.work_date,
        area_m2: work.area_m2,
        depth_cm: work.depth_cm || null,
        equipment_type: work.equipment_type || null,
        equipment_attachment: work.equipment_attachment || null,
        work_metadata: work.work_metadata || null,
        weather_conditions: work.weather_conditions || null,
        operator_name: work.operator_name || null,
        notes: work.notes || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapMechanicalWorkFromDB(data);
  }

  async updateMechanicalWork(id: string, updates: Partial<MechanicalWorkRecord>): Promise<MechanicalWorkRecord> {
    const client = this.ensureClient();
    const dbData: any = {};
    
    if (updates.garden_id !== undefined) dbData.garden_id = updates.garden_id || null;
    if (updates.work_type !== undefined) dbData.work_type = updates.work_type;
    if (updates.work_date !== undefined) dbData.work_date = updates.work_date;
    if (updates.area_m2 !== undefined) dbData.area_m2 = updates.area_m2;
    if (updates.depth_cm !== undefined) dbData.depth_cm = updates.depth_cm || null;
    if (updates.equipment_type !== undefined) dbData.equipment_type = updates.equipment_type || null;
    if (updates.equipment_attachment !== undefined) dbData.equipment_attachment = updates.equipment_attachment || null;
    if (updates.work_metadata !== undefined) dbData.work_metadata = updates.work_metadata || null;
    if (updates.weather_conditions !== undefined) dbData.weather_conditions = updates.weather_conditions || null;
    if (updates.operator_name !== undefined) dbData.operator_name = updates.operator_name || null;
    if (updates.notes !== undefined) dbData.notes = updates.notes || null;
    
    const { data, error } = await client
      .from('mechanical_work_register')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapMechanicalWorkFromDB(data);
  }

  async deleteMechanicalWork(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('mechanical_work_register')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  private mapMechanicalWorkFromDB(db: any): MechanicalWorkRecord {
    return {
      id: db.id,
      user_id: db.user_id,
      garden_id: db.garden_id,
      work_type: db.work_type,
      work_date: db.work_date,
      area_m2: parseFloat(db.area_m2),
      depth_cm: db.depth_cm ? parseFloat(db.depth_cm) : undefined,
      equipment_type: db.equipment_type,
      equipment_attachment: db.equipment_attachment,
      work_metadata: db.work_metadata,
      weather_conditions: db.weather_conditions,
      operator_name: db.operator_name,
      notes: db.notes,
      created_at: db.created_at,
    };
  }

  // Treatments
  async getTreatments(gardenId?: string): Promise<TreatmentRecordDB[]> {
    const client = this.ensureClient();
    let query = client
      .from('treatment_register')
      .select('*')
      .order('treatment_date', { ascending: false });
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(db => this.mapTreatmentFromDB(db));
  }

  async getTreatment(id: string): Promise<TreatmentRecordDB | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('treatment_register')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.mapTreatmentFromDB(data);
  }

  async createTreatment(treatment: Omit<TreatmentRecordDB, 'id' | 'user_id' | 'created_at'>): Promise<TreatmentRecordDB> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await client
      .from('treatment_register')
      .insert({
        user_id: user.id,
        garden_id: treatment.garden_id || null,
        crop_name: treatment.crop_name,
        treatment_date: treatment.treatment_date,
        product_name: treatment.product_name,
        active_ingredient: treatment.active_ingredient || null,
        dosage: treatment.dosage || null,
        dosage_unit: treatment.dosage_unit || null,
        area_treated: treatment.area_treated || null,
        method: treatment.method || null,
        reason: treatment.reason || null,
        weather_conditions: treatment.weather_conditions || null,
        operator_name: treatment.operator_name || null,
        notes: treatment.notes || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapTreatmentFromDB(data);
  }

  async updateTreatment(id: string, updates: Partial<TreatmentRecordDB>): Promise<TreatmentRecordDB> {
    const client = this.ensureClient();
    const dbData: any = {};
    
    if (updates.garden_id !== undefined) dbData.garden_id = updates.garden_id || null;
    if (updates.crop_name !== undefined) dbData.crop_name = updates.crop_name;
    if (updates.treatment_date !== undefined) dbData.treatment_date = updates.treatment_date;
    if (updates.product_name !== undefined) dbData.product_name = updates.product_name;
    if (updates.active_ingredient !== undefined) dbData.active_ingredient = updates.active_ingredient || null;
    if (updates.dosage !== undefined) dbData.dosage = updates.dosage || null;
    if (updates.dosage_unit !== undefined) dbData.dosage_unit = updates.dosage_unit || null;
    if (updates.area_treated !== undefined) dbData.area_treated = updates.area_treated || null;
    if (updates.method !== undefined) dbData.method = updates.method || null;
    if (updates.reason !== undefined) dbData.reason = updates.reason || null;
    if (updates.weather_conditions !== undefined) dbData.weather_conditions = updates.weather_conditions || null;
    if (updates.operator_name !== undefined) dbData.operator_name = updates.operator_name || null;
    if (updates.notes !== undefined) dbData.notes = updates.notes || null;
    
    const { data, error } = await client
      .from('treatment_register')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapTreatmentFromDB(data);
  }

  async deleteTreatment(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('treatment_register')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  private mapTreatmentFromDB(db: any): TreatmentRecordDB {
    return {
      id: db.id,
      user_id: db.user_id,
      garden_id: db.garden_id,
      crop_name: db.crop_name,
      treatment_date: db.treatment_date,
      product_name: db.product_name,
      active_ingredient: db.active_ingredient,
      dosage: db.dosage ? parseFloat(db.dosage) : undefined,
      dosage_unit: db.dosage_unit,
      area_treated: db.area_treated ? parseFloat(db.area_treated) : undefined,
      method: db.method,
      reason: db.reason,
      weather_conditions: db.weather_conditions,
      operator_name: db.operator_name,
      notes: db.notes,
      created_at: db.created_at,
    };
  }

  // Custom Crops
  async getCustomCrops(gardenId?: string): Promise<CustomCrop[]> {
    const client = this.ensureClient();
    let query = client
      .from('custom_crops')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(db => this.mapCustomCropFromDB(db));
  }

  async getCustomCrop(id: string): Promise<CustomCrop | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('custom_crops')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapCustomCropFromDB(data);
  }

  async createCustomCrop(crop: Omit<CustomCrop, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CustomCrop> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await client
      .from('custom_crops')
      .insert({
        user_id: user.id,
        garden_id: crop.garden_id || null,
        common_name: crop.common_name,
        scientific_name: crop.scientific_name || null,
        family: crop.family || null,
        initial_data: crop.initial_data || {},
        learned_patterns: crop.learned_patterns || {
          plantingTiming: { successfulDates: [], failedDates: [], confidence: 0 },
          harvestTiming: { successfulDates: [], confidence: 0 },
          successfulWorks: [],
          successfulTreatments: [],
          recurringProblems: []
        },
        stats: crop.stats || {
          totalPlantings: 0,
          totalHarvests: 0,
          successRate: 0
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapCustomCropFromDB(data);
  }

  async updateCustomCrop(id: string, updates: Partial<CustomCrop>): Promise<CustomCrop> {
    const client = this.ensureClient();
    const dbData: any = {};
    
    if (updates.garden_id !== undefined) dbData.garden_id = updates.garden_id || null;
    if (updates.common_name !== undefined) dbData.common_name = updates.common_name;
    if (updates.scientific_name !== undefined) dbData.scientific_name = updates.scientific_name || null;
    if (updates.family !== undefined) dbData.family = updates.family || null;
    if (updates.initial_data !== undefined) dbData.initial_data = updates.initial_data;
    if (updates.learned_patterns !== undefined) dbData.learned_patterns = updates.learned_patterns;
    if (updates.stats !== undefined) dbData.stats = updates.stats;
    
    const { data, error } = await client
      .from('custom_crops')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapCustomCropFromDB(data);
  }

  async deleteCustomCrop(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('custom_crops')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  private mapCustomCropFromDB(db: any): CustomCrop {
    return {
      id: db.id,
      user_id: db.user_id,
      garden_id: db.garden_id,
      common_name: db.common_name,
      scientific_name: db.scientific_name,
      family: db.family,
      initial_data: db.initial_data,
      learned_patterns: db.learned_patterns || {
        plantingTiming: { successfulDates: [], failedDates: [], confidence: 0 },
        harvestTiming: { successfulDates: [], confidence: 0 },
        successfulWorks: [],
        successfulTreatments: [],
        recurringProblems: []
      },
      stats: db.stats || {
        totalPlantings: 0,
        totalHarvests: 0,
        successRate: 0
      },
      created_at: db.created_at,
      updated_at: db.updated_at,
    };
  }

  // Learning Events
  async recordLearningEvent(event: Omit<CropLearningEvent, 'id' | 'created_at'>): Promise<CropLearningEvent> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await client
      .from('crop_learning_events')
      .insert({
        custom_crop_id: event.custom_crop_id || null,
        user_id: user.id,
        garden_id: event.garden_id || null,
        event_type: event.event_type,
        event_data: event.event_data,
        outcome: event.outcome || null
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapLearningEventFromDB(data);
  }

  async getLearningEvents(cropId: string): Promise<CropLearningEvent[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('crop_learning_events')
      .select('*')
      .eq('custom_crop_id', cropId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(db => this.mapLearningEventFromDB(db));
  }

  private mapLearningEventFromDB(db: any): CropLearningEvent {
    return {
      id: db.id,
      custom_crop_id: db.custom_crop_id,
      user_id: db.user_id,
      garden_id: db.garden_id,
      event_type: db.event_type,
      event_data: db.event_data,
      outcome: db.outcome,
      created_at: db.created_at,
    };
  }

  // Sistema Archetipi
  async getArchetypes(): Promise<CropArchetype[]> {
    // Archetipi sono dati statici, non vengono dal database
    const { archetypes } = await import('../../data/archetypes');
    return archetypes;
  }

  async getArchetype(id: ArchetypeId): Promise<CropArchetype | null> {
    const { getArchetypeById } = await import('../../data/archetypes');
    return getArchetypeById(id) || null;
  }

  async getProfile(archetypeId: ArchetypeId): Promise<CropProfile | null> {
    const { getProfileByArchetypeId } = await import('../../data/archetypeProfiles');
    return getProfileByArchetypeId(archetypeId) || null;
  }

  // Aliases
  async searchAlias(query: string, region?: string, province?: string): Promise<CropAlias | null> {
    const client = this.ensureClient();
    const { normalizeText } = await import('../../utils/textNormalizer');
    const normalizedQuery = normalizeText(query);
    
    // Cerca prima su alias_text (case-insensitive)
    let queryBuilder = client
      .from('crop_aliases')
      .select('*')
      .ilike('alias_text', query.trim());
    
    if (region) {
      queryBuilder = queryBuilder.eq('region', region);
    }
    if (province) {
      queryBuilder = queryBuilder.eq('province', province);
    }
    
    let { data, error } = await queryBuilder.order('confidence', { ascending: false }).limit(1);
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table crop_aliases not found - migration 03_plant_taxonomy.sql may not be applied');
      return null;
    }
    if (error) throw error;
    if (data && data.length > 0) {
      return this.mapAliasFromDB(data[0]);
    }
    
    // Se non trovato, cerca su normalized_alias
    queryBuilder = client
      .from('crop_aliases')
      .select('*')
      .eq('normalized_alias', normalizedQuery);
    
    if (region) {
      queryBuilder = queryBuilder.eq('region', region);
    }
    if (province) {
      queryBuilder = queryBuilder.eq('province', province);
    }
    
    ({ data, error } = await queryBuilder.order('confidence', { ascending: false }).limit(1));
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table crop_aliases not found - migration 03_plant_taxonomy.sql may not be applied');
      return null;
    }
    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    return this.mapAliasFromDB(data[0]);
  }

  async createAlias(alias: Omit<CropAlias, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<CropAlias> {
    const client = this.ensureClient();
    const { data: { user } } = await client.auth.getUser();
    const { normalizeText } = await import('../../utils/textNormalizer');
    
    // Auto-popola normalized_alias
    const normalizedAlias = normalizeText(alias.aliasText);
    
    const { data, error } = await client
      .from('crop_aliases')
      .insert({
        alias_text: alias.aliasText,
        normalized_alias: normalizedAlias,
        archetype_id: alias.archetypeId,
        region: alias.region || null,
        province: alias.province || null,
        confidence: alias.confidence || 1.0,
        created_by: alias.createdBy || user?.id || null,
        usage_count: 1
      })
      .select()
      .single();
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table crop_aliases not found - migration 03_plant_taxonomy.sql may not be applied');
      throw new Error('Table crop_aliases not found. Please apply migration 03_plant_taxonomy.sql');
    }
    if (error) throw error;
    return this.mapAliasFromDB(data);
  }

  async updateAliasConfidence(aliasId: string, confidence: number): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('crop_aliases')
      .update({ confidence: Math.max(0, Math.min(1, confidence)) })
      .eq('id', aliasId);
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table crop_aliases not found - migration 03_plant_taxonomy.sql may not be applied');
      throw new Error('Table crop_aliases not found. Please apply migration 03_plant_taxonomy.sql');
    }
    if (error) throw error;
  }

  async getAlias(aliasId: string): Promise<CropAlias | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('crop_aliases')
      .select('*')
      .eq('id', aliasId)
      .single();
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table crop_aliases not found - migration 03_plant_taxonomy.sql may not be applied');
      return null;
    }
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return this.mapAliasFromDB(data);
  }

  async updateAlias(aliasId: string, updates: Partial<CropAlias>): Promise<CropAlias> {
    const client = this.ensureClient();
    const dbUpdates: any = {};
    
    if (updates.aliasText !== undefined) {
      dbUpdates.alias_text = updates.aliasText;
      // Aggiorna anche normalized_alias se aliasText cambia
      const { normalizeText } = await import('../../utils/textNormalizer');
      dbUpdates.normalized_alias = normalizeText(updates.aliasText);
    }
    if (updates.archetypeId !== undefined) dbUpdates.archetype_id = updates.archetypeId;
    if (updates.region !== undefined) dbUpdates.region = updates.region;
    if (updates.province !== undefined) dbUpdates.province = updates.province;
    if (updates.confidence !== undefined) dbUpdates.confidence = updates.confidence;
    if (updates.usageCount !== undefined) dbUpdates.usage_count = updates.usageCount;
    
    const { data, error } = await client
      .from('crop_aliases')
      .update(dbUpdates)
      .eq('id', aliasId)
      .select()
      .single();
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table crop_aliases not found - migration 03_plant_taxonomy.sql may not be applied');
      throw new Error('Table crop_aliases not found. Please apply migration 03_plant_taxonomy.sql');
    }
    if (error) throw error;
    return this.mapAliasFromDB(data);
  }

  async getAliasesByArchetype(archetypeId: ArchetypeId): Promise<CropAlias[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('crop_aliases')
      .select('*')
      .eq('archetype_id', archetypeId)
      .order('usage_count', { ascending: false });
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table crop_aliases not found - migration 03_plant_taxonomy.sql may not be applied');
      return [];
    }
    if (error) throw error;
    return (data || []).map(db => this.mapAliasFromDB(db));
  }

  async getAllAliases(): Promise<CropAlias[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('crop_aliases')
      .select('*')
      .order('usage_count', { ascending: false });
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table crop_aliases not found - migration 03_plant_taxonomy.sql may not be applied');
      return [];
    }
    if (error) throw error;
    return (data || []).map(db => this.mapAliasFromDB(db));
  }

  // Official Crops
  async getOfficialCrop(name: string): Promise<OfficialCrop | null> {
    const client = this.ensureClient();
    
    // Cerca prima su name (case-insensitive)
    let { data, error } = await client
      .from('official_crops')
      .select('*')
      .ilike('name', name)
      .limit(1)
      .single();
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table official_crops not found - migration 03_plant_taxonomy.sql may not be applied');
      return null;
    }
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (data) {
      return this.mapOfficialCropFromDB(data);
    }
    
    // Se non trovato, cerca su normalized_name
    const { normalizeText } = await import('../../utils/textNormalizer');
    const normalizedName = normalizeText(name);
    
    ({ data, error } = await client
      .from('official_crops')
      .select('*')
      .eq('normalized_name', normalizedName)
      .limit(1)
      .single());
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table official_crops not found - migration 03_plant_taxonomy.sql may not be applied');
      return null;
    }
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data ? this.mapOfficialCropFromDB(data) : null;
  }

  async searchOfficialCrops(query: string): Promise<OfficialCrop[]> {
    const client = this.ensureClient();
    
    // Se query vuota, restituisci tutti i crops (limitato a 200 per performance fuzzy search)
    if (!query || query.trim().length === 0) {
      const { data, error } = await client
        .from('official_crops')
        .select('*')
        .order('name', { ascending: true })
        .limit(200);
      
      // PGRST205 = table not found (migration not applied)
      if (error && error.code === 'PGRST205') {
        console.warn('Table official_crops not found - migration 03_plant_taxonomy.sql may not be applied');
        return [];
      }
      if (error) throw error;
      return (data || []).map(db => this.mapOfficialCropFromDB(db));
    }
    
    // Cerca su name e normalized_name
    const { normalizeText } = await import('../../utils/textNormalizer');
    const normalizedQuery = normalizeText(query);
    
    const { data, error } = await client
      .from('official_crops')
      .select('*')
      .or(`name.ilike.%${query}%,normalized_name.eq.${normalizedQuery}`)
      .limit(50);
    
    // PGRST205 = table not found (migration not applied)
    if (error && error.code === 'PGRST205') {
      console.warn('Table official_crops not found - migration 03_plant_taxonomy.sql may not be applied');
      return [];
    }
    if (error) throw error;
    return (data || []).map(db => this.mapOfficialCropFromDB(db));
  }

  private mapAliasFromDB(db: any): CropAlias {
    return {
      id: db.id,
      aliasText: db.alias_text,
      archetypeId: db.archetype_id,
      region: db.region,
      province: db.province,
      confidence: Number(db.confidence),
      createdBy: db.created_by,
      usageCount: db.usage_count || 1,
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  }

  private mapOfficialCropFromDB(db: any): OfficialCrop {
    return {
      id: db.id,
      name: db.name,
      archetypeId: db.archetype_id,
      profileOverrideId: db.profile_override_id,
      scientificName: db.scientific_name
    };
  }

  // Irrigation Systems
  async getIrrigationSystems(gardenId: string): Promise<IrrigationSystem[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('irrigation_systems')
      .select('*')
      .eq('garden_id', gardenId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(db => this.mapIrrigationSystemFromDB(db));
  }

  async getIrrigationSystem(id: string): Promise<IrrigationSystem | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('irrigation_systems')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapIrrigationSystemFromDB(data);
  }

  async createIrrigationSystem(system: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationSystem> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('irrigation_systems')
      .insert({
        garden_id: system.gardenId,
        name: system.name
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapIrrigationSystemFromDB(data);
  }

  async updateIrrigationSystem(id: string, updates: Partial<IrrigationSystem>): Promise<IrrigationSystem> {
    const client = this.ensureClient();
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    
    const { data, error } = await client
      .from('irrigation_systems')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapIrrigationSystemFromDB(data);
  }

  async deleteIrrigationSystem(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('irrigation_systems')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Irrigation Zones
  async getIrrigationZones(systemId: string): Promise<IrrigationZone[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('irrigation_zones')
      .select('*')
      .eq('system_id', systemId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(db => this.mapIrrigationZoneFromDB(db));
  }

  async getIrrigationZone(id: string): Promise<IrrigationZone | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('irrigation_zones')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapIrrigationZoneFromDB(data);
  }

  async createIrrigationZone(zone: Omit<IrrigationZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationZone> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('irrigation_zones')
      .insert({
        system_id: zone.systemId,
        name: zone.name,
        method: zone.method,
        flow_rate_lph: zone.flowRateLph,
        valve_id: zone.valveId || null,
        bed_ids: zone.bedIds || [],
        plant_task_ids: zone.plantTaskIds || [],
        notes: zone.notes || null,
        calculated_from_components: zone.calculatedFromComponents || false
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapIrrigationZoneFromDB(data);
  }

  async updateIrrigationZone(id: string, updates: Partial<IrrigationZone>): Promise<IrrigationZone> {
    const client = this.ensureClient();
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.method !== undefined) dbUpdates.method = updates.method;
    if (updates.flowRateLph !== undefined) dbUpdates.flow_rate_lph = updates.flowRateLph;
    if (updates.valveId !== undefined) dbUpdates.valve_id = updates.valveId || null;
    if (updates.bedIds !== undefined) dbUpdates.bed_ids = updates.bedIds;
    if (updates.plantTaskIds !== undefined) dbUpdates.plant_task_ids = updates.plantTaskIds;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.calculatedFromComponents !== undefined) dbUpdates.calculated_from_components = updates.calculatedFromComponents;
    
    const { data, error } = await client
      .from('irrigation_zones')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapIrrigationZoneFromDB(data);
  }

  async deleteIrrigationZone(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('irrigation_zones')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Irrigation Components
  async getIrrigationComponents(zoneId: string): Promise<IrrigationComponent[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('irrigation_components')
      .select('*')
      .eq('zone_id', zoneId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(db => this.mapIrrigationComponentFromDB(db));
  }

  async getIrrigationComponent(id: string): Promise<IrrigationComponent | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('irrigation_components')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapIrrigationComponentFromDB(data);
  }

  async createIrrigationComponent(component: Omit<IrrigationComponent, 'id' | 'createdAt'>): Promise<IrrigationComponent> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('irrigation_components')
      .insert({
        zone_id: component.zoneId,
        type: component.type,
        length_meters: component.lengthMeters || null,
        flow_rate_per_meter_lph: component.flowRatePerMeterLph || null,
        dripper_spacing: component.dripperSpacing || null,
        dripper_flow_rate_lph: component.dripperFlowRateLph || null,
        quantity: component.quantity || null,
        flow_rate_lph: component.flowRateLph || null,
        brand: component.brand || null,
        model: component.model || null,
        notes: component.notes || null
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapIrrigationComponentFromDB(data);
  }

  async updateIrrigationComponent(id: string, updates: Partial<IrrigationComponent>): Promise<IrrigationComponent> {
    const client = this.ensureClient();
    const dbUpdates: any = {};
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.lengthMeters !== undefined) dbUpdates.length_meters = updates.lengthMeters || null;
    if (updates.flowRatePerMeterLph !== undefined) dbUpdates.flow_rate_per_meter_lph = updates.flowRatePerMeterLph || null;
    if (updates.dripperSpacing !== undefined) dbUpdates.dripper_spacing = updates.dripperSpacing || null;
    if (updates.dripperFlowRateLph !== undefined) dbUpdates.dripper_flow_rate_lph = updates.dripperFlowRateLph || null;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity || null;
    if (updates.flowRateLph !== undefined) dbUpdates.flow_rate_lph = updates.flowRateLph || null;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand || null;
    if (updates.model !== undefined) dbUpdates.model = updates.model || null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    
    const { data, error } = await client
      .from('irrigation_components')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapIrrigationComponentFromDB(data);
  }

  async deleteIrrigationComponent(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('irrigation_components')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Watering Logs
  async getWateringLogs(zoneId: string, startDate?: string, endDate?: string): Promise<WateringLog[]> {
    const client = this.ensureClient();
    let query = client
      .from('watering_logs')
      .select('*')
      .eq('zone_id', zoneId);
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(db => this.mapWateringLogFromDB(db));
  }

  async getWateringLog(id: string): Promise<WateringLog | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('watering_logs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapWateringLogFromDB(data);
  }

  async logWatering(log: Omit<WateringLog, 'id' | 'createdAt'>): Promise<WateringLog> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('watering_logs')
      .insert({
        zone_id: log.zoneId,
        date: log.date,
        duration_minutes: log.durationMinutes,
        liters_applied: log.litersApplied,
        method: log.method,
        notes: log.notes || null,
        valve_id: log.valveId || null,
        completed: log.completed
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapWateringLogFromDB(data);
  }

  async updateWateringLog(id: string, updates: Partial<WateringLog>): Promise<WateringLog> {
    const client = this.ensureClient();
    const dbUpdates: any = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.durationMinutes !== undefined) dbUpdates.duration_minutes = updates.durationMinutes;
    if (updates.litersApplied !== undefined) dbUpdates.liters_applied = updates.litersApplied;
    if (updates.method !== undefined) dbUpdates.method = updates.method;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.valveId !== undefined) dbUpdates.valve_id = updates.valveId || null;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    
    const { data, error } = await client
      .from('watering_logs')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapWateringLogFromDB(data);
  }

  async deleteWateringLog(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('watering_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Mappers
  private mapIrrigationSystemFromDB(db: any): IrrigationSystem {
    return {
      id: db.id,
      gardenId: db.garden_id,
      name: db.name,
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  }

  private mapIrrigationZoneFromDB(db: any): IrrigationZone {
    return {
      id: db.id,
      systemId: db.system_id,
      name: db.name,
      method: db.method,
      flowRateLph: Number(db.flow_rate_lph),
      valveId: db.valve_id || undefined,
      bedIds: db.bed_ids || [],
      plantTaskIds: db.plant_task_ids || [],
      notes: db.notes || undefined,
      calculatedFromComponents: db.calculated_from_components || false,
      createdAt: db.created_at,
      updatedAt: db.updated_at
    };
  }

  private mapIrrigationComponentFromDB(db: any): IrrigationComponent {
    return {
      id: db.id,
      zoneId: db.zone_id,
      type: db.type,
      lengthMeters: db.length_meters ? Number(db.length_meters) : undefined,
      flowRatePerMeterLph: db.flow_rate_per_meter_lph ? Number(db.flow_rate_per_meter_lph) : undefined,
      dripperSpacing: db.dripper_spacing ? Number(db.dripper_spacing) : undefined,
      dripperFlowRateLph: db.dripper_flow_rate_lph ? Number(db.dripper_flow_rate_lph) : undefined,
      quantity: db.quantity || undefined,
      flowRateLph: db.flow_rate_lph ? Number(db.flow_rate_lph) : undefined,
      brand: db.brand || undefined,
      model: db.model || undefined,
      notes: db.notes || undefined,
      createdAt: db.created_at
    };
  }

  private mapWateringLogFromDB(db: any): WateringLog {
    return {
      id: db.id,
      zoneId: db.zone_id,
      date: db.date,
      durationMinutes: db.duration_minutes,
      litersApplied: Number(db.liters_applied),
      method: db.method,
      notes: db.notes || undefined,
      valveId: db.valve_id || undefined,
      completed: db.completed,
      createdAt: db.created_at
    };
  }
}

