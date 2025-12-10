/**
 * Supabase Storage Provider Implementation
 * Implements IStorageProvider for cloud storage via Supabase
 */

import { IStorageProvider } from '../core/storage/interface';
import { Garden, GardenTask, SmartDevice, SeedPacket, HarvestLogData, PlantPhotoLog } from '@/types';
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
    if (!user) throw new Error('User not authenticated');

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
}

