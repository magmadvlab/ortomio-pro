/**
 * LocalStorage Provider Implementation
 * Wraps existing localStorage operations in IStorageProvider interface
 */

import { IStorageProvider } from '../core/storage/interface';
import { Garden, GardenTask, SmartDevice, SeedPacket, HarvestLogData, PlantPhotoLog } from '@/types';
import { CustomPlan } from '@/types/customPlan';
import { Agronomist, AgronomistConsultation, AgronomistAdvice } from '@/types/agronomist';
import { StorageService } from '@/services/storageService';
import { saveAutoBackup } from '@/services/autoBackupService';
import { SeedlingBatch } from '@/services/seedlingService';
import { GardenAccessory } from '@/types/accessories';
import { HydroponicReading, AquaponicReading } from '@/types/indoorGrowing';
import { GardenBed } from '@/types/gardenBed';

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
  private getHydroponicReadings(): HydroponicReading[] {
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
    const allReadings = this.getHydroponicReadings();
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
    const allReadings = this.getHydroponicReadings();
    allReadings.push(newReading);
    this.saveHydroponicReadings(allReadings);
    return newReading;
  }

  // Aquaponic Readings
  private getAquaponicReadings(): AquaponicReading[] {
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
    const allReadings = this.getAquaponicReadings();
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
    const allReadings = this.getAquaponicReadings();
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
    saveAutoBackup();
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
}

