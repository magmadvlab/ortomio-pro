/**
 * Supabase Storage Provider Implementation
 * Implements IStorageProvider for cloud storage via Supabase
 */

import { IStorageProvider } from '../core/storage/interface';
import { Garden, GardenTask, SmartDevice, SeedPacket, HarvestLogData, PlantPhotoLog } from '@/types';
import { CustomPlan } from '@/types/customPlan';
import { Agronomist, AgronomistConsultation, AgronomistAdvice } from '@/types/agronomist';
import { GardenAccessory } from '@/types/accessories';
import { HydroponicReading, AquaponicReading } from '@/types/indoorGrowing';
import { GardenBed } from '@/types/gardenBed';
import { SeedlingBatch } from '@/services/seedlingService';
import { getSupabaseClient } from '@/config/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

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
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated. Please log in to sync your data, or the app will use local storage automatically.');
    }

    const dbGarden = this.mapGardenToDB(garden);
    const { data, error } = await client
      .from('gardens')
      .insert({ ...dbGarden, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
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
    return this.mapTaskFromDB(data);
  }

  async updateTask(id: string, updates: Partial<GardenTask>): Promise<GardenTask> {
    const client = this.ensureClient();
    const dbUpdates = this.mapTaskToDB(updates as GardenTask);
    const { data, error } = await client
      .from('garden_tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapTaskFromDB(data);
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
    return this.mapHarvestLogFromDB(data);
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
      vacationMode: db.vacation_mode,
      createdAt: db.created_at,
    };
  }

  private mapGardenToDB(garden: Partial<Garden>): any {
    const db: any = {};
    if (garden.name !== undefined) db.name = garden.name;
    if (garden.coordinates !== undefined) db.coordinates = garden.coordinates;
    if (garden.sizeSqMeters !== undefined) db.size_sq_meters = garden.sizeSqMeters;
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
    if (garden.vacationMode !== undefined) db.vacation_mode = garden.vacationMode;
    return db;
  }

  private mapGardensFromDB(dbArray: any[]): Garden[] {
    return dbArray.map(db => this.mapGardenFromDB(db));
  }

  private mapTaskFromDB(db: any): GardenTask {
    return {
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
    };
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
      sun_exposure: bed.sunExposure,
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
      sunExposure: db.sun_exposure,
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
    return (data || []) as SeedlingBatch[];
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
    return data as SeedlingBatch;
  }

  async createSeedlingBatch(batch: Omit<SeedlingBatch, 'id'>): Promise<SeedlingBatch> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('seedling_batches')
      .insert(batch)
      .select()
      .single();
    
    if (error) throw error;
    return data as SeedlingBatch;
  }

  async updateSeedlingBatch(id: string, updates: Partial<SeedlingBatch>): Promise<SeedlingBatch> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('seedling_batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as SeedlingBatch;
  }

  async deleteSeedlingBatch(id: string): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client
      .from('seedling_batches')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

