/**
 * LocalStorage Provider Implementation
 * Wraps existing localStorage operations in IStorageProvider interface
 */

import { IStorageProvider } from '../core/storage/interface';
import { Garden, GardenTask, SmartDevice, SeedPacket, HarvestLogData, PlantPhotoLog, MechanicalWorkRecord, TreatmentRecordDB } from '@/types';
import { CustomCrop, CropLearningEvent } from '@/types/customCrop';
import { CustomPlan } from '@/types/customPlan';
import { Agronomist, AgronomistConsultation, AgronomistAdvice } from '@/types/agronomist';
import { StorageService } from '@/services/storageService';
import { saveAutoBackup } from '@/services/autoBackupService';
import { SeedlingBatch } from '@/services/seedlingService';
import { GardenAccessory } from '@/types/accessories';
import { HydroponicReading, AquaponicReading } from '@/types/indoorGrowing';
import { GardenBed } from '@/types/gardenBed';
import { CropArchetype, CropProfile, CropAlias, ArchetypeId, OfficialCrop } from '@/types/archetypes';
import { IrrigationSystem, IrrigationZone, IrrigationComponent, WateringLog } from '@/types/irrigation';

export class LocalStorageProvider implements IStorageProvider {
  private readonly STORAGE_KEYS = {
    GARDENS: 'ortoGardens',
    TASKS: 'ortoTasks',
    DEVICES: 'ortoDevices',
    SEEDS: 'ortoSeedPackets',
    HARVESTS: 'ortHarvestLogs',
    PHOTOS: 'ortoPhotoLogs',
    CUSTOM_PLANS: 'ortoCustomPlans',
    AGRONOMISTS: 'ortoAgronomists',
    CONSULTATIONS: 'ortoConsultations',
    ADVICE: 'ortoAgronomistAdvice',
    SEEDLING_BATCHES: 'ortSeedlingBatches',
    ACCESSORIES: 'ortoAccessories',
    HYDROPONIC_READINGS: 'ortoHydroponicReadings',
    AQUAPONIC_READINGS: 'ortoAquaponicReadings',
    GARDEN_BEDS: 'ortoGardenBeds',
    IRRIGATION_SYSTEMS: 'ortoIrrigationSystems',
    IRRIGATION_ZONES: 'ortoIrrigationZones',
    IRRIGATION_COMPONENTS: 'ortoIrrigationComponents',
    WATERING_LOGS: 'ortoWateringLogs',
  } as const;

  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Gardens
  async getGardens(): Promise<Garden[]> {
    return StorageService.getGardens();
  }

  async getGarden(id: string): Promise<Garden | null> {
    const gardens = await this.getGardens();
    return gardens.find(g => g.id === id) || null;
  }

  async createGarden(garden: Omit<Garden, 'id' | 'createdAt'>): Promise<Garden> {
    const newGarden: Garden = {
      ...garden,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const gardens = await this.getGardens();
    gardens.push(newGarden);
    StorageService.saveGardens(gardens);
    
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this, newGarden.id).catch(err => 
      console.error('Error saving auto backup after createGarden:', err)
    );
    
    return newGarden;
  }

  async updateGarden(id: string, updates: Partial<Garden>): Promise<Garden> {
    const gardens = await this.getGardens();
    const index = gardens.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error(`Garden with id ${id} not found`);
    }
    gardens[index] = { ...gardens[index], ...updates };
    StorageService.saveGardens(gardens);
    
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this, id).catch(err => 
      console.error('Error saving auto backup after updateGarden:', err)
    );
    
    return gardens[index];
  }

  async deleteGarden(id: string): Promise<void> {
    const gardens = await this.getGardens();
    const filtered = gardens.filter(g => g.id !== id);
    StorageService.saveGardens(filtered);
  }

  // Tasks
  async getTasks(gardenId?: string): Promise<GardenTask[]> {
    const tasks = StorageService.getTasks();
    if (gardenId) {
      return tasks.filter(t => t.gardenId === gardenId);
    }
    return tasks;
  }

  async getTask(id: string): Promise<GardenTask | null> {
    const tasks = await this.getTasks();
    return tasks.find(t => t.id === id) || null;
  }

  async createTask(task: Omit<GardenTask, 'id'>): Promise<GardenTask> {
    const newTask: GardenTask = {
      ...task,
      id: crypto.randomUUID(),
    };
    const tasks = StorageService.getTasks();
    tasks.push(newTask);
    StorageService.saveTasks(tasks);
    
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this, task.gardenId).catch(err => 
      console.error('Error saving auto backup after createTask:', err)
    );
    
    return newTask;
  }

  async updateTask(id: string, updates: Partial<GardenTask>): Promise<GardenTask> {
    const tasks = StorageService.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    const task = tasks[index];
    tasks[index] = { ...task, ...updates };
    StorageService.saveTasks(tasks);
    
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this, task.gardenId).catch(err => 
      console.error('Error saving auto backup after updateTask:', err)
    );
    
    return tasks[index];
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = StorageService.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    StorageService.saveTasks(filtered);
  }

  // Smart Devices
  async getDevices(gardenId?: string): Promise<SmartDevice[]> {
    const devices = StorageService.getDevices();
    if (gardenId) {
      return devices.filter(d => d.gardenId === gardenId);
    }
    return devices;
  }

  async getDevice(id: string): Promise<SmartDevice | null> {
    const devices = await this.getDevices();
    return devices.find(d => d.id === id) || null;
  }

  async createDevice(device: Omit<SmartDevice, 'id' | 'lastUpdate'>): Promise<SmartDevice> {
    const newDevice: SmartDevice = {
      ...device,
      id: crypto.randomUUID(),
      lastUpdate: new Date().toISOString(),
    };
    const devices = StorageService.getDevices();
    devices.push(newDevice);
    StorageService.saveDevices(devices);
    return newDevice;
  }

  async updateDevice(id: string, updates: Partial<SmartDevice>): Promise<SmartDevice> {
    const devices = StorageService.getDevices();
    const index = devices.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`Device with id ${id} not found`);
    }
    devices[index] = { ...devices[index], ...updates, lastUpdate: new Date().toISOString() };
    StorageService.saveDevices(devices);
    return devices[index];
  }

  async deleteDevice(id: string): Promise<void> {
    const devices = StorageService.getDevices();
    const filtered = devices.filter(d => d.id !== id);
    StorageService.saveDevices(filtered);
  }

  // Seed Inventory
  async getSeedPackets(gardenId?: string): Promise<SeedPacket[]> {
    const saved = localStorage.getItem(this.STORAGE_KEYS.SEEDS);
    if (!saved) return [];
    try {
      const packets = JSON.parse(saved) as SeedPacket[];
      if (gardenId) {
        return packets.filter(p => p.gardenId === gardenId);
      }
      return packets;
    } catch {
      return [];
    }
  }

  async getSeedPacket(id: string): Promise<SeedPacket | null> {
    const packets = await this.getSeedPackets();
    return packets.find(p => p.id === id) || null;
  }

  async createSeedPacket(packet: Omit<SeedPacket, 'id'>): Promise<SeedPacket> {
    const newPacket: SeedPacket = {
      ...packet,
      id: crypto.randomUUID(),
    };
    const packets = await this.getSeedPackets();
    packets.push(newPacket);
    localStorage.setItem(this.STORAGE_KEYS.SEEDS, JSON.stringify(packets));
    
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this, packet.gardenId).catch(err => 
      console.error('Error saving auto backup after createSeedPacket:', err)
    );
    
    return newPacket;
  }

  async updateSeedPacket(id: string, updates: Partial<SeedPacket>): Promise<SeedPacket> {
    const packets = await this.getSeedPackets();
    const index = packets.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Seed packet with id ${id} not found`);
    }
    packets[index] = { ...packets[index], ...updates };
    localStorage.setItem(this.STORAGE_KEYS.SEEDS, JSON.stringify(packets));
    return packets[index];
  }

  async deleteSeedPacket(id: string): Promise<void> {
    const packets = await this.getSeedPackets();
    const filtered = packets.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.SEEDS, JSON.stringify(filtered));
  }

  // Harvest Logs
  async getHarvestLogs(gardenId?: string): Promise<HarvestLogData[]> {
    const saved = localStorage.getItem(this.STORAGE_KEYS.HARVESTS);
    if (!saved) return [];
    try {
      const logs = JSON.parse(saved) as HarvestLogData[];
      if (gardenId) {
        // HarvestLogData doesn't have gardenId directly, but we can filter by taskId
        const tasks = await this.getTasks(gardenId);
        const taskIds = new Set(tasks.map(t => t.id));
        return logs.filter(log => {
          // If log has taskId, check if it belongs to this garden
          // Otherwise, include all (legacy data)
          return !log.id || taskIds.has(log.id);
        });
      }
      return logs;
    } catch {
      return [];
    }
  }

  async createHarvestLog(log: Omit<HarvestLogData, 'id'>): Promise<HarvestLogData> {
    const newLog: HarvestLogData = {
      ...log,
      id: crypto.randomUUID(),
    };
    const logs = await this.getHarvestLogs();
    logs.push(newLog);
    localStorage.setItem(this.STORAGE_KEYS.HARVESTS, JSON.stringify(logs));
    
    // Trigger backup automatico (non bloccare se fallisce)
    // Per harvest logs, dobbiamo trovare il gardenId dal task associato
    // Per ora, facciamo backup di tutti i giardini
    saveAutoBackup(this).catch(err => 
      console.error('Error saving auto backup after createHarvestLog:', err)
    );
    
    return newLog;
  }

  async updateHarvestLog(id: string, updates: Partial<HarvestLogData>): Promise<HarvestLogData> {
    const logs = await this.getHarvestLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error(`Harvest log with id ${id} not found`);
    }
    logs[index] = { ...logs[index], ...updates };
    localStorage.setItem(this.STORAGE_KEYS.HARVESTS, JSON.stringify(logs));
    return logs[index];
  }

  async deleteHarvestLog(id: string): Promise<void> {
    const logs = await this.getHarvestLogs();
    const filtered = logs.filter(l => l.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.HARVESTS, JSON.stringify(filtered));
  }

  // Seedling Batches
  async getSeedlingBatches(gardenId?: string): Promise<SeedlingBatch[]> {
    const saved = localStorage.getItem(this.STORAGE_KEYS.SEEDLING_BATCHES);
    if (!saved) return [];
    try {
      const batches = JSON.parse(saved) as SeedlingBatch[];
      if (gardenId) {
        return batches.filter(b => b.gardenId === gardenId);
      }
      return batches;
    } catch {
      return [];
    }
  }

  async getSeedlingBatch(id: string): Promise<SeedlingBatch | null> {
    const batches = await this.getSeedlingBatches();
    return batches.find(b => b.id === id) || null;
  }

  async createSeedlingBatch(batch: Omit<SeedlingBatch, 'id'>): Promise<SeedlingBatch> {
    const newBatch: SeedlingBatch = {
      ...batch,
      id: crypto.randomUUID(),
    };
    const batches = await this.getSeedlingBatches();
    batches.push(newBatch);
    localStorage.setItem(this.STORAGE_KEYS.SEEDLING_BATCHES, JSON.stringify(batches));
    
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this, batch.gardenId).catch(err => 
      console.error('Error saving auto backup after createSeedlingBatch:', err)
    );
    
    return newBatch;
  }

  async updateSeedlingBatch(id: string, updates: Partial<SeedlingBatch>): Promise<SeedlingBatch> {
    const batches = await this.getSeedlingBatches();
    const index = batches.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error(`Seedling batch with id ${id} not found`);
    }
    const batch = batches[index];
    batches[index] = { ...batch, ...updates };
    localStorage.setItem(this.STORAGE_KEYS.SEEDLING_BATCHES, JSON.stringify(batches));
    
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this, batch.gardenId).catch(err => 
      console.error('Error saving auto backup after updateSeedlingBatch:', err)
    );
    
    return batches[index];
  }

  async deleteSeedlingBatch(id: string): Promise<void> {
    const batches = await this.getSeedlingBatches();
    const filtered = batches.filter(b => b.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.SEEDLING_BATCHES, JSON.stringify(filtered));
  }

  // Custom Plans
  private getCustomPlans(): CustomPlan[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_PLANS);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as CustomPlan[];
    } catch {
      return [];
    }
  }

  private saveCustomPlans(plans: CustomPlan[]): void {
    localStorage.setItem(this.STORAGE_KEYS.CUSTOM_PLANS, JSON.stringify(plans));
  }

  async createCustomPlan(plan: Omit<CustomPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomPlan> {
    const newPlan: CustomPlan = {
      ...plan,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const plans = this.getCustomPlans();
    plans.push(newPlan);
    this.saveCustomPlans(plans);
    return newPlan;
  }

  async getCustomPlan(id: string): Promise<CustomPlan | null> {
    const plans = this.getCustomPlans();
    return plans.find(p => p.id === id) || null;
  }

  async getUserCustomPlans(userId: string, gardenId?: string): Promise<CustomPlan[]> {
    const plans = this.getCustomPlans();
    let filtered = plans.filter(p => p.userId === userId);
    if (gardenId) {
      filtered = filtered.filter(p => !p.gardenId || p.gardenId === gardenId);
    }
    return filtered;
  }

  async updateCustomPlan(id: string, updates: Partial<CustomPlan>): Promise<CustomPlan> {
    const plans = this.getCustomPlans();
    const index = plans.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Custom plan with id ${id} not found`);
    }
    plans[index] = { ...plans[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveCustomPlans(plans);
    return plans[index];
  }

  async deleteCustomPlan(id: string): Promise<void> {
    const plans = this.getCustomPlans();
    const filtered = plans.filter(p => p.id !== id);
    this.saveCustomPlans(filtered);
  }

  // Agronomists
  private getAllAgronomists(): Agronomist[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.AGRONOMISTS);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as Agronomist[];
    } catch {
      return [];
    }
  }

  private saveAgronomists(agronomists: Agronomist[]): void {
    localStorage.setItem(this.STORAGE_KEYS.AGRONOMISTS, JSON.stringify(agronomists));
  }

  async createAgronomist(agronomist: Omit<Agronomist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agronomist> {
    const newAgronomist: Agronomist = {
      ...agronomist,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const agronomists = this.getAllAgronomists();
    agronomists.push(newAgronomist);
    this.saveAgronomists(agronomists);
    return newAgronomist;
  }

  async getAgronomists(userId: string): Promise<Agronomist[]> {
    const agronomists = this.getAllAgronomists();
    return agronomists.filter(a => a.userId === userId);
  }

  async updateAgronomist(id: string, updates: Partial<Agronomist>): Promise<Agronomist> {
    const agronomists = this.getAllAgronomists();
    const index = agronomists.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Agronomist with id ${id} not found`);
    }
    agronomists[index] = { ...agronomists[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveAgronomists(agronomists);
    return agronomists[index];
  }

  async deleteAgronomist(id: string): Promise<void> {
    const agronomists = this.getAllAgronomists();
    const filtered = agronomists.filter(a => a.id !== id);
    this.saveAgronomists(filtered);
  }

  // Consultations
  private getAllConsultations(): AgronomistConsultation[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.CONSULTATIONS);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as AgronomistConsultation[];
    } catch {
      return [];
    }
  }

  private saveConsultations(consultations: AgronomistConsultation[]): void {
    localStorage.setItem(this.STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultations));
  }

  async createConsultation(consultation: Omit<AgronomistConsultation, 'id' | 'createdAt'>): Promise<AgronomistConsultation> {
    const newConsultation: AgronomistConsultation = {
      ...consultation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const consultations = this.getAllConsultations();
    consultations.push(newConsultation);
    this.saveConsultations(consultations);
    return newConsultation;
  }

  async getConsultations(userId: string, agronomistId?: string): Promise<AgronomistConsultation[]> {
    const consultations = this.getAllConsultations();
    let filtered = consultations.filter(c => c.userId === userId);
    if (agronomistId) {
      filtered = filtered.filter(c => c.agronomistId === agronomistId);
    }
    return filtered;
  }

  // Advice
  private getAdvice(): AgronomistAdvice[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.ADVICE);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as AgronomistAdvice[];
    } catch {
      return [];
    }
  }

  private saveAdvice(advice: AgronomistAdvice[]): void {
    localStorage.setItem(this.STORAGE_KEYS.ADVICE, JSON.stringify(advice));
  }

  async createAdvice(advice: Omit<AgronomistAdvice, 'id' | 'createdAt'>): Promise<AgronomistAdvice> {
    const newAdvice: AgronomistAdvice = {
      ...advice,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const allAdvice = this.getAdvice();
    allAdvice.push(newAdvice);
    this.saveAdvice(allAdvice);
    return newAdvice;
  }

  async getAgronomistAdvice(taskId: string): Promise<AgronomistAdvice[]> {
    const allAdvice = this.getAdvice();
    return allAdvice.filter(a => a.taskId === taskId);
  }

  async updateAdvice(id: string, updates: Partial<AgronomistAdvice>): Promise<AgronomistAdvice> {
    const allAdvice = this.getAdvice();
    const index = allAdvice.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Advice with id ${id} not found`);
    }
    allAdvice[index] = { ...allAdvice[index], ...updates };
    this.saveAdvice(allAdvice);
    return allAdvice[index];
  }

  // Garden Accessories
  private getAllAccessories(): GardenAccessory[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.ACCESSORIES);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as GardenAccessory[];
    } catch {
      return [];
    }
  }

  private saveAccessories(accessories: GardenAccessory[]): void {
    localStorage.setItem(this.STORAGE_KEYS.ACCESSORIES, JSON.stringify(accessories));
  }

  async getAccessories(gardenId?: string): Promise<GardenAccessory[]> {
    const allAccessories = this.getAllAccessories();
    if (gardenId) {
      return allAccessories.filter(a => a.gardenId === gardenId);
    }
    return allAccessories;
  }

  async getAccessory(id: string): Promise<GardenAccessory | null> {
    const allAccessories = this.getAllAccessories();
    return allAccessories.find(a => a.id === id) || null;
  }

  async createAccessory(accessory: Omit<GardenAccessory, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenAccessory> {
    const newAccessory: GardenAccessory = {
      ...accessory,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const allAccessories = this.getAllAccessories();
    allAccessories.push(newAccessory);
    this.saveAccessories(allAccessories);
    return newAccessory;
  }

  async updateAccessory(id: string, updates: Partial<GardenAccessory>): Promise<GardenAccessory> {
    const allAccessories = this.getAllAccessories();
    const index = allAccessories.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Accessory with id ${id} not found`);
    }
    allAccessories[index] = { ...allAccessories[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveAccessories(allAccessories);
    return allAccessories[index];
  }

  async deleteAccessory(id: string): Promise<void> {
    const allAccessories = this.getAllAccessories();
    const filtered = allAccessories.filter(a => a.id !== id);
    this.saveAccessories(filtered);
  }

  // Hydroponic Readings
  private getAllHydroponicReadings(): HydroponicReading[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.HYDROPONIC_READINGS);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as HydroponicReading[];
    } catch {
      return [];
    }
  }

  private saveHydroponicReadings(readings: HydroponicReading[]): void {
    localStorage.setItem(this.STORAGE_KEYS.HYDROPONIC_READINGS, JSON.stringify(readings));
  }

  async getHydroponicReadings(gardenId: string, limit?: number): Promise<HydroponicReading[]> {
    const allReadings = this.getAllHydroponicReadings();
    const filtered = allReadings
      .filter(r => r.gardenId === gardenId)
      .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async createHydroponicReading(reading: Omit<HydroponicReading, 'id' | 'createdAt'>): Promise<HydroponicReading> {
    const newReading: HydroponicReading = {
      ...reading,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const allReadings = this.getAllHydroponicReadings();
    allReadings.push(newReading);
    this.saveHydroponicReadings(allReadings);
    return newReading;
  }

  // Aquaponic Readings
  private getAllAquaponicReadings(): AquaponicReading[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.AQUAPONIC_READINGS);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as AquaponicReading[];
    } catch {
      return [];
    }
  }

  private saveAquaponicReadings(readings: AquaponicReading[]): void {
    localStorage.setItem(this.STORAGE_KEYS.AQUAPONIC_READINGS, JSON.stringify(readings));
  }

  async getAquaponicReadings(gardenId: string, limit?: number): Promise<AquaponicReading[]> {
    const allReadings = this.getAllAquaponicReadings();
    const filtered = allReadings
      .filter(r => r.gardenId === gardenId)
      .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async createAquaponicReading(reading: Omit<AquaponicReading, 'id' | 'createdAt'>): Promise<AquaponicReading> {
    const newReading: AquaponicReading = {
      ...reading,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const allReadings = this.getAllAquaponicReadings();
    allReadings.push(newReading);
    this.saveAquaponicReadings(allReadings);
    return newReading;
  }

  // Garden Beds
  private getAllGardenBeds(): GardenBed[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.GARDEN_BEDS);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Assicurati che sia sempre un array
      if (!Array.isArray(parsed)) {
        console.warn('GardenBeds data is not an array, resetting to empty array');
        localStorage.removeItem(this.STORAGE_KEYS.GARDEN_BEDS);
        return [];
      }
      return parsed as GardenBed[];
    } catch (error) {
      console.error('Error parsing GardenBeds from localStorage:', error);
      // Se i dati sono corrotti, rimuovili
      localStorage.removeItem(this.STORAGE_KEYS.GARDEN_BEDS);
      return [];
    }
  }

  private saveGardenBeds(beds: GardenBed[]): void {
    localStorage.setItem(this.STORAGE_KEYS.GARDEN_BEDS, JSON.stringify(beds));
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this).catch(err => 
      console.error('Error saving auto backup after saveGardenBeds:', err)
    );
  }

  async getGardenBeds(gardenId: string): Promise<GardenBed[]> {
    const allBeds = this.getAllGardenBeds();
    // Protezione aggiuntiva: assicurati che allBeds sia un array
    if (!Array.isArray(allBeds)) {
      console.error('getAllGardenBeds() did not return an array:', allBeds);
      return [];
    }
    return allBeds.filter(b => b.gardenId === gardenId);
  }

  async getGardenBed(id: string): Promise<GardenBed | null> {
    const allBeds = this.getAllGardenBeds();
    return allBeds.find(b => b.id === id) || null;
  }

  async createGardenBed(bed: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenBed> {
    const newBed: GardenBed = {
      ...bed,
      id: `bed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Calcola area automaticamente
    if (newBed.shape === 'Rectangle' && newBed.lengthCm && newBed.widthCm) {
      newBed.areaSqMeters = (newBed.lengthCm * newBed.widthCm) / 10000;
    } else if (newBed.shape === 'Circle' && newBed.diameterCm) {
      newBed.areaSqMeters = (Math.PI * Math.pow(newBed.diameterCm / 2, 2)) / 10000;
    }
    
    const allBeds = this.getAllGardenBeds();
    allBeds.push(newBed);
    this.saveGardenBeds(allBeds);
    return newBed;
  }

  async updateGardenBed(id: string, updates: Partial<GardenBed>): Promise<GardenBed> {
    const allBeds = this.getAllGardenBeds();
    const index = allBeds.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error(`GardenBed with id ${id} not found`);
    }
    
    const updatedBed: GardenBed = {
      ...allBeds[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // Ricalcola area se dimensioni sono cambiate
    if (updates.lengthCm !== undefined || updates.widthCm !== undefined || updates.diameterCm !== undefined) {
      if (updatedBed.shape === 'Rectangle' && updatedBed.lengthCm && updatedBed.widthCm) {
        updatedBed.areaSqMeters = (updatedBed.lengthCm * updatedBed.widthCm) / 10000;
      } else if (updatedBed.shape === 'Circle' && updatedBed.diameterCm) {
        updatedBed.areaSqMeters = (Math.PI * Math.pow(updatedBed.diameterCm / 2, 2)) / 10000;
      }
    }
    
    allBeds[index] = updatedBed;
    this.saveGardenBeds(allBeds);
    return updatedBed;
  }

  async deleteGardenBed(id: string): Promise<void> {
    const allBeds = this.getAllGardenBeds();
    const filtered = allBeds.filter(b => b.id !== id);
    this.saveGardenBeds(filtered);
  }

  // Mechanical Work
  async getMechanicalWorks(gardenId?: string): Promise<MechanicalWorkRecord[]> {
    const key = 'ortomio_mechanical_works';
    const allWorks = JSON.parse(localStorage.getItem(key) || '[]') as MechanicalWorkRecord[];
    
    let filtered = allWorks;
    if (gardenId) {
      filtered = allWorks.filter(w => w.garden_id === gardenId);
    }
    
    return filtered.sort((a, b) => new Date(b.work_date).getTime() - new Date(a.work_date).getTime());
  }

  async getMechanicalWork(id: string): Promise<MechanicalWorkRecord | null> {
    const allWorks = await this.getMechanicalWorks();
    return allWorks.find(w => w.id === id) || null;
  }

  async createMechanicalWork(work: Omit<MechanicalWorkRecord, 'id' | 'user_id' | 'created_at'>): Promise<MechanicalWorkRecord> {
    const key = 'ortomio_mechanical_works';
    const allWorks = JSON.parse(localStorage.getItem(key) || '[]') as MechanicalWorkRecord[];
    
    const newWork: MechanicalWorkRecord = {
      ...work,
      id: crypto.randomUUID(),
      user_id: 'local_user',
      created_at: new Date().toISOString(),
    };
    
    allWorks.push(newWork);
    localStorage.setItem(key, JSON.stringify(allWorks));
    return newWork;
  }

  async updateMechanicalWork(id: string, updates: Partial<MechanicalWorkRecord>): Promise<MechanicalWorkRecord> {
    const key = 'ortomio_mechanical_works';
    const allWorks = JSON.parse(localStorage.getItem(key) || '[]') as MechanicalWorkRecord[];
    const index = allWorks.findIndex(w => w.id === id);
    
    if (index === -1) {
      throw new Error(`MechanicalWork with id ${id} not found`);
    }
    
    const updatedWork: MechanicalWorkRecord = {
      ...allWorks[index],
      ...updates,
    };
    
    allWorks[index] = updatedWork;
    localStorage.setItem(key, JSON.stringify(allWorks));
    return updatedWork;
  }

  async deleteMechanicalWork(id: string): Promise<void> {
    const key = 'ortomio_mechanical_works';
    const allWorks = JSON.parse(localStorage.getItem(key) || '[]') as MechanicalWorkRecord[];
    const filtered = allWorks.filter(w => w.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  // Treatments
  async getTreatments(gardenId?: string): Promise<TreatmentRecordDB[]> {
    const key = 'ortomio_treatments';
    const allTreatments = JSON.parse(localStorage.getItem(key) || '[]') as TreatmentRecordDB[];
    
    let filtered = allTreatments;
    if (gardenId) {
      filtered = allTreatments.filter(t => t.garden_id === gardenId);
    }
    
    return filtered.sort((a, b) => new Date(b.treatment_date).getTime() - new Date(a.treatment_date).getTime());
  }

  async getTreatment(id: string): Promise<TreatmentRecordDB | null> {
    const allTreatments = await this.getTreatments();
    return allTreatments.find(t => t.id === id) || null;
  }

  async createTreatment(treatment: Omit<TreatmentRecordDB, 'id' | 'user_id' | 'created_at'>): Promise<TreatmentRecordDB> {
    const key = 'ortomio_treatments';
    const allTreatments = JSON.parse(localStorage.getItem(key) || '[]') as TreatmentRecordDB[];
    
    const newTreatment: TreatmentRecordDB = {
      ...treatment,
      id: crypto.randomUUID(),
      user_id: 'local_user',
      created_at: new Date().toISOString(),
    };
    
    allTreatments.push(newTreatment);
    localStorage.setItem(key, JSON.stringify(allTreatments));
    return newTreatment;
  }

  async updateTreatment(id: string, updates: Partial<TreatmentRecordDB>): Promise<TreatmentRecordDB> {
    const key = 'ortomio_treatments';
    const allTreatments = JSON.parse(localStorage.getItem(key) || '[]') as TreatmentRecordDB[];
    const index = allTreatments.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Treatment with id ${id} not found`);
    }
    
    const updatedTreatment: TreatmentRecordDB = {
      ...allTreatments[index],
      ...updates,
    };
    
    allTreatments[index] = updatedTreatment;
    localStorage.setItem(key, JSON.stringify(allTreatments));
    return updatedTreatment;
  }

  async deleteTreatment(id: string): Promise<void> {
    const key = 'ortomio_treatments';
    const allTreatments = JSON.parse(localStorage.getItem(key) || '[]') as TreatmentRecordDB[];
    const filtered = allTreatments.filter(t => t.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  // Custom Crops
  async getCustomCrops(gardenId?: string): Promise<CustomCrop[]> {
    const key = 'ortomio_custom_crops';
    const allCrops = JSON.parse(localStorage.getItem(key) || '[]') as CustomCrop[];
    
    let filtered = allCrops;
    if (gardenId) {
      filtered = allCrops.filter(c => c.garden_id === gardenId);
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getCustomCrop(id: string): Promise<CustomCrop | null> {
    const allCrops = await this.getCustomCrops();
    return allCrops.find(c => c.id === id) || null;
  }

  async createCustomCrop(crop: Omit<CustomCrop, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CustomCrop> {
    const key = 'ortomio_custom_crops';
    const allCrops = JSON.parse(localStorage.getItem(key) || '[]') as CustomCrop[];
    
    const newCrop: CustomCrop = {
      ...crop,
      id: crypto.randomUUID(),
      user_id: 'local_user',
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
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    allCrops.push(newCrop);
    localStorage.setItem(key, JSON.stringify(allCrops));
    return newCrop;
  }

  async updateCustomCrop(id: string, updates: Partial<CustomCrop>): Promise<CustomCrop> {
    const key = 'ortomio_custom_crops';
    const allCrops = JSON.parse(localStorage.getItem(key) || '[]') as CustomCrop[];
    const index = allCrops.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`CustomCrop with id ${id} not found`);
    }
    
    const updatedCrop: CustomCrop = {
      ...allCrops[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    allCrops[index] = updatedCrop;
    localStorage.setItem(key, JSON.stringify(allCrops));
    return updatedCrop;
  }

  async deleteCustomCrop(id: string): Promise<void> {
    const key = 'ortomio_custom_crops';
    const allCrops = JSON.parse(localStorage.getItem(key) || '[]') as CustomCrop[];
    const filtered = allCrops.filter(c => c.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  // Learning Events
  async recordLearningEvent(event: Omit<CropLearningEvent, 'id' | 'created_at'>): Promise<CropLearningEvent> {
    const key = 'ortomio_learning_events';
    const allEvents = JSON.parse(localStorage.getItem(key) || '[]') as CropLearningEvent[];
    
    const newEvent: CropLearningEvent = {
      ...event,
      id: crypto.randomUUID(),
      user_id: 'local_user',
      created_at: new Date().toISOString(),
    };
    
    allEvents.push(newEvent);
    localStorage.setItem(key, JSON.stringify(allEvents));
    return newEvent;
  }

  async getLearningEvents(cropId: string): Promise<CropLearningEvent[]> {
    const key = 'ortomio_learning_events';
    const allEvents = JSON.parse(localStorage.getItem(key) || '[]') as CropLearningEvent[];
    
    return allEvents
      .filter(e => e.custom_crop_id === cropId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Sistema Archetipi
  async getArchetypes(): Promise<CropArchetype[]> {
    // Archetipi sono dati statici
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
    const key = 'ortomio_crop_aliases';
    const aliases = JSON.parse(localStorage.getItem(key) || '[]') as CropAlias[];
    const { normalizeText } = await import('../../utils/textNormalizer');
    const normalizedQuery = normalizeText(query);
    
    const matches = aliases.filter(a => {
      const aliasNormalized = normalizeText(a.aliasText);
      // Cerca su aliasText (case-insensitive) o normalized_alias se disponibile
      const textMatch = aliasNormalized === normalizedQuery || 
                       a.aliasText.toLowerCase() === query.toLowerCase().trim();
      if (!textMatch) return false;
      if (region && a.region !== region) return false;
      if (province && a.province !== province) return false;
      return true;
    });
    
    if (matches.length === 0) return null;
    
    // Ritorna quello con confidence più alta
    return matches.sort((a, b) => b.confidence - a.confidence)[0];
  }

  async createAlias(alias: Omit<CropAlias, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<CropAlias> {
    const key = 'ortomio_crop_aliases';
    const aliases = JSON.parse(localStorage.getItem(key) || '[]') as CropAlias[];
    const { normalizeText } = await import('../../utils/textNormalizer');
    
    // Auto-popola normalized_alias
    const normalizedAlias = normalizeText(alias.aliasText);
    
    const newAlias: CropAlias = {
      ...alias,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 1
    };
    
    // Aggiungi normalized_alias se non presente (per retrocompatibilità)
    (newAlias as any).normalizedAlias = normalizedAlias;
    
    aliases.push(newAlias);
    localStorage.setItem(key, JSON.stringify(aliases));
    return newAlias;
  }

  async updateAliasConfidence(aliasId: string, confidence: number): Promise<void> {
    const key = 'ortomio_crop_aliases';
    const aliases = JSON.parse(localStorage.getItem(key) || '[]') as CropAlias[];
    const index = aliases.findIndex(a => a.id === aliasId);
    
    if (index === -1) throw new Error(`Alias with id ${aliasId} not found`);
    
    aliases[index].confidence = Math.max(0, Math.min(1, confidence));
    aliases[index].updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(aliases));
  }

  async getAlias(aliasId: string): Promise<CropAlias | null> {
    const key = 'ortomio_crop_aliases';
    const aliases = JSON.parse(localStorage.getItem(key) || '[]') as CropAlias[];
    return aliases.find(a => a.id === aliasId) || null;
  }

  async updateAlias(aliasId: string, updates: Partial<CropAlias>): Promise<CropAlias> {
    const key = 'ortomio_crop_aliases';
    const aliases = JSON.parse(localStorage.getItem(key) || '[]') as CropAlias[];
    const index = aliases.findIndex(a => a.id === aliasId);
    
    if (index === -1) throw new Error(`Alias with id ${aliasId} not found`);
    
    aliases[index] = {
      ...aliases[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(aliases));
    return aliases[index];
  }

  async getAliasesByArchetype(archetypeId: ArchetypeId): Promise<CropAlias[]> {
    const key = 'ortomio_crop_aliases';
    const aliases = JSON.parse(localStorage.getItem(key) || '[]') as CropAlias[];
    
    return aliases
      .filter(a => a.archetypeId === archetypeId)
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  // Official Crops
  async getOfficialCrop(name: string): Promise<OfficialCrop | null> {
    const key = 'ortomio_official_crops';
    const crops = JSON.parse(localStorage.getItem(key) || '[]') as OfficialCrop[];
    const { normalizeText } = await import('../../utils/textNormalizer');
    const normalizedName = normalizeText(name);
    
    // Cerca su name (case-insensitive) o normalized_name se disponibile
    return crops.find(c => {
      const cropNormalized = normalizeText(c.name);
      return cropNormalized === normalizedName || c.name.toLowerCase() === name.toLowerCase();
    }) || null;
  }

  async searchOfficialCrops(query: string): Promise<OfficialCrop[]> {
    const key = 'ortomio_official_crops';
    const crops = JSON.parse(localStorage.getItem(key) || '[]') as OfficialCrop[];
    
    // Se query vuota, restituisci tutti (limitato a 200 per performance)
    if (!query || query.trim().length === 0) {
      return crops.slice(0, 200);
    }
    
    const { normalizeText } = await import('../../utils/textNormalizer');
    const normalizedQuery = normalizeText(query);
    
    return crops
      .filter(c => {
        const cropNormalized = normalizeText(c.name);
        return cropNormalized.includes(normalizedQuery) || 
               c.name.toLowerCase().includes(query.toLowerCase());
      })
      .slice(0, 50);
  }

  async getAllAliases(): Promise<CropAlias[]> {
    const key = 'ortomio_crop_aliases';
    return JSON.parse(localStorage.getItem(key) || '[]') as CropAlias[];
  }

  // Irrigation Systems
  async getIrrigationSystems(gardenId: string): Promise<IrrigationSystem[]> {
    const key = this.STORAGE_KEYS.IRRIGATION_SYSTEMS;
    const systems = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationSystem[];
    return systems.filter(s => s.gardenId === gardenId);
  }

  async getIrrigationSystem(id: string): Promise<IrrigationSystem | null> {
    const key = this.STORAGE_KEYS.IRRIGATION_SYSTEMS;
    const systems = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationSystem[];
    return systems.find(s => s.id === id) || null;
  }

  async createIrrigationSystem(system: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationSystem> {
    const key = this.STORAGE_KEYS.IRRIGATION_SYSTEMS;
    const systems = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationSystem[];
    const newSystem: IrrigationSystem = {
      ...system,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    systems.push(newSystem);
    localStorage.setItem(key, JSON.stringify(systems));
    return newSystem;
  }

  async updateIrrigationSystem(id: string, updates: Partial<IrrigationSystem>): Promise<IrrigationSystem> {
    const key = this.STORAGE_KEYS.IRRIGATION_SYSTEMS;
    const systems = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationSystem[];
    const index = systems.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Irrigation system with id ${id} not found`);
    
    systems[index] = {
      ...systems[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(systems));
    return systems[index];
  }

  async deleteIrrigationSystem(id: string): Promise<void> {
    const key = this.STORAGE_KEYS.IRRIGATION_SYSTEMS;
    const systems = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationSystem[];
    const filtered = systems.filter(s => s.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  // Irrigation Zones
  async getIrrigationZones(systemId: string): Promise<IrrigationZone[]> {
    const key = this.STORAGE_KEYS.IRRIGATION_ZONES;
    const zones = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationZone[];
    return zones.filter(z => z.systemId === systemId);
  }

  async getIrrigationZone(id: string): Promise<IrrigationZone | null> {
    const key = this.STORAGE_KEYS.IRRIGATION_ZONES;
    const zones = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationZone[];
    return zones.find(z => z.id === id) || null;
  }

  async createIrrigationZone(zone: Omit<IrrigationZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationZone> {
    const key = this.STORAGE_KEYS.IRRIGATION_ZONES;
    const zones = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationZone[];
    const newZone: IrrigationZone = {
      ...zone,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    zones.push(newZone);
    localStorage.setItem(key, JSON.stringify(zones));
    return newZone;
  }

  async updateIrrigationZone(id: string, updates: Partial<IrrigationZone>): Promise<IrrigationZone> {
    const key = this.STORAGE_KEYS.IRRIGATION_ZONES;
    const zones = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationZone[];
    const index = zones.findIndex(z => z.id === id);
    if (index === -1) throw new Error(`Irrigation zone with id ${id} not found`);
    
    zones[index] = {
      ...zones[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(zones));
    return zones[index];
  }

  async deleteIrrigationZone(id: string): Promise<void> {
    const key = this.STORAGE_KEYS.IRRIGATION_ZONES;
    const zones = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationZone[];
    const filtered = zones.filter(z => z.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    
    // Elimina anche i componenti associati
    const componentsKey = this.STORAGE_KEYS.IRRIGATION_COMPONENTS;
    const components = JSON.parse(localStorage.getItem(componentsKey) || '[]') as IrrigationComponent[];
    const filteredComponents = components.filter(c => c.zoneId !== id);
    localStorage.setItem(componentsKey, JSON.stringify(filteredComponents));
  }

  // Irrigation Components
  async getIrrigationComponents(zoneId: string): Promise<IrrigationComponent[]> {
    const key = this.STORAGE_KEYS.IRRIGATION_COMPONENTS;
    const components = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationComponent[];
    return components.filter(c => c.zoneId === zoneId);
  }

  async getIrrigationComponent(id: string): Promise<IrrigationComponent | null> {
    const key = this.STORAGE_KEYS.IRRIGATION_COMPONENTS;
    const components = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationComponent[];
    return components.find(c => c.id === id) || null;
  }

  async createIrrigationComponent(component: Omit<IrrigationComponent, 'id' | 'createdAt'>): Promise<IrrigationComponent> {
    const key = this.STORAGE_KEYS.IRRIGATION_COMPONENTS;
    const components = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationComponent[];
    const newComponent: IrrigationComponent = {
      ...component,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    components.push(newComponent);
    localStorage.setItem(key, JSON.stringify(components));
    return newComponent;
  }

  async updateIrrigationComponent(id: string, updates: Partial<IrrigationComponent>): Promise<IrrigationComponent> {
    const key = this.STORAGE_KEYS.IRRIGATION_COMPONENTS;
    const components = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationComponent[];
    const index = components.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Irrigation component with id ${id} not found`);
    
    components[index] = {
      ...components[index],
      ...updates
    };
    localStorage.setItem(key, JSON.stringify(components));
    return components[index];
  }

  async deleteIrrigationComponent(id: string): Promise<void> {
    const key = this.STORAGE_KEYS.IRRIGATION_COMPONENTS;
    const components = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationComponent[];
    const filtered = components.filter(c => c.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  // Watering Logs
  async getWateringLogs(zoneId: string, startDate?: string, endDate?: string): Promise<WateringLog[]> {
    const key = this.STORAGE_KEYS.WATERING_LOGS;
    let logs = JSON.parse(localStorage.getItem(key) || '[]') as WateringLog[];
    logs = logs.filter(l => l.zoneId === zoneId);
    
    if (startDate) {
      logs = logs.filter(l => l.date >= startDate);
    }
    if (endDate) {
      logs = logs.filter(l => l.date <= endDate);
    }
    
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getWateringLog(id: string): Promise<WateringLog | null> {
    const key = this.STORAGE_KEYS.WATERING_LOGS;
    const logs = JSON.parse(localStorage.getItem(key) || '[]') as WateringLog[];
    return logs.find(l => l.id === id) || null;
  }

  async logWatering(log: Omit<WateringLog, 'id' | 'createdAt'>): Promise<WateringLog> {
    const key = this.STORAGE_KEYS.WATERING_LOGS;
    const logs = JSON.parse(localStorage.getItem(key) || '[]') as WateringLog[];
    const newLog: WateringLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    logs.push(newLog);
    localStorage.setItem(key, JSON.stringify(logs));
    return newLog;
  }

  async updateWateringLog(id: string, updates: Partial<WateringLog>): Promise<WateringLog> {
    const key = this.STORAGE_KEYS.WATERING_LOGS;
    const logs = JSON.parse(localStorage.getItem(key) || '[]') as WateringLog[];
    const index = logs.findIndex(l => l.id === id);
    if (index === -1) throw new Error(`Watering log with id ${id} not found`);
    
    logs[index] = {
      ...logs[index],
      ...updates
    };
    localStorage.setItem(key, JSON.stringify(logs));
    return logs[index];
  }

  async deleteWateringLog(id: string): Promise<void> {
    const key = this.STORAGE_KEYS.WATERING_LOGS;
    const logs = JSON.parse(localStorage.getItem(key) || '[]') as WateringLog[];
    const filtered = logs.filter(l => l.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }
}

