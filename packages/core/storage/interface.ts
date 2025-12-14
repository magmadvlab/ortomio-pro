/**
 * Storage Provider Interface
 * Abstract interface for storage operations (localStorage or Supabase)
 */

import { Garden, GardenTask, SmartDevice, SeedPacket, HarvestLogData, PlantPhotoLog } from '../../../types';
import { CustomPlan } from '../../../types/customPlan';
import { Agronomist, AgronomistConsultation, AgronomistAdvice } from '../../../types/agronomist';
import { SeedlingBatch } from '../../../services/seedlingService';
import { GardenAccessory } from '../../../types/accessories';
import { HydroponicReading, AquaponicReading } from '../../../types/indoorGrowing';
import { GardenBed } from '../../../types/gardenBed';

export interface IStorageProvider {
  // Gardens
  getGardens(): Promise<Garden[]>;
  getGarden(id: string): Promise<Garden | null>;
  createGarden(garden: Omit<Garden, 'id' | 'createdAt'>): Promise<Garden>;
  updateGarden(id: string, updates: Partial<Garden>): Promise<Garden>;
  deleteGarden(id: string): Promise<void>;
  
  // Tasks
  getTasks(gardenId?: string): Promise<GardenTask[]>;
  getTask(id: string): Promise<GardenTask | null>;
  createTask(task: Omit<GardenTask, 'id'>): Promise<GardenTask>;
  updateTask(id: string, updates: Partial<GardenTask>): Promise<GardenTask>;
  deleteTask(id: string): Promise<void>;
  
  // Smart Devices
  getDevices(gardenId?: string): Promise<SmartDevice[]>;
  getDevice(id: string): Promise<SmartDevice | null>;
  createDevice(device: Omit<SmartDevice, 'id' | 'lastUpdate'>): Promise<SmartDevice>;
  updateDevice(id: string, updates: Partial<SmartDevice>): Promise<SmartDevice>;
  deleteDevice(id: string): Promise<void>;
  
  // Seed Inventory
  getSeedPackets(gardenId?: string): Promise<SeedPacket[]>;
  getSeedPacket(id: string): Promise<SeedPacket | null>;
  createSeedPacket(packet: Omit<SeedPacket, 'id'>): Promise<SeedPacket>;
  updateSeedPacket(id: string, updates: Partial<SeedPacket>): Promise<SeedPacket>;
  deleteSeedPacket(id: string): Promise<void>;
  
  // Harvest Logs
  getHarvestLogs(gardenId?: string): Promise<HarvestLogData[]>;
  createHarvestLog(log: Omit<HarvestLogData, 'id'>): Promise<HarvestLogData>;
  updateHarvestLog(id: string, updates: Partial<HarvestLogData>): Promise<HarvestLogData>;
  deleteHarvestLog(id: string): Promise<void>;
  
  // Seedling Batches
  getSeedlingBatches(gardenId?: string): Promise<SeedlingBatch[]>;
  getSeedlingBatch(id: string): Promise<SeedlingBatch | null>;
  createSeedlingBatch(batch: Omit<SeedlingBatch, 'id'>): Promise<SeedlingBatch>;
  updateSeedlingBatch(id: string, updates: Partial<SeedlingBatch>): Promise<SeedlingBatch>;
  deleteSeedlingBatch(id: string): Promise<void>;
  
  // Pro Features (optional - may not be available in Free tier)
  uploadPhoto?(file: File, taskId: string, gardenId: string): Promise<string>; // Returns photo URL
  getPhotoLogs?(taskId: string): Promise<PlantPhotoLog[]>;
  createPhotoLog?(log: Omit<PlantPhotoLog, 'id' | 'createdAt'>): Promise<PlantPhotoLog>;
  
  // Sync (for cloud providers)
  sync?(): Promise<void>;
  
  // Custom Plans (Pro Feature)
  createCustomPlan(plan: Omit<CustomPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomPlan>;
  getCustomPlan(id: string): Promise<CustomPlan | null>;
  getUserCustomPlans(userId: string, gardenId?: string): Promise<CustomPlan[]>;
  updateCustomPlan(id: string, updates: Partial<CustomPlan>): Promise<CustomPlan>;
  deleteCustomPlan(id: string): Promise<void>;
  
  // Agronomists (Pro Feature)
  createAgronomist(agronomist: Omit<Agronomist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agronomist>;
  getAgronomists(userId: string): Promise<Agronomist[]>;
  updateAgronomist(id: string, updates: Partial<Agronomist>): Promise<Agronomist>;
  deleteAgronomist(id: string): Promise<void>;
  
  // Agronomist Consultations
  createConsultation(consultation: Omit<AgronomistConsultation, 'id' | 'createdAt'>): Promise<AgronomistConsultation>;
  getConsultations(userId: string, agronomistId?: string): Promise<AgronomistConsultation[]>;
  
  // Agronomist Advice
  createAdvice(advice: Omit<AgronomistAdvice, 'id' | 'createdAt'>): Promise<AgronomistAdvice>;
  getAgronomistAdvice(taskId: string): Promise<AgronomistAdvice[]>;
  updateAdvice(id: string, updates: Partial<AgronomistAdvice>): Promise<AgronomistAdvice>;
  
  // Garden Accessories (Pro Feature)
  getAccessories(gardenId?: string): Promise<GardenAccessory[]>;
  getAccessory(id: string): Promise<GardenAccessory | null>;
  createAccessory(accessory: Omit<GardenAccessory, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenAccessory>;
  updateAccessory(id: string, updates: Partial<GardenAccessory>): Promise<GardenAccessory>;
  deleteAccessory(id: string): Promise<void>;
  
  // Hydroponic Readings (Pro Feature)
  getHydroponicReadings(gardenId: string, limit?: number): Promise<HydroponicReading[]>;
  createHydroponicReading(reading: Omit<HydroponicReading, 'id' | 'createdAt'>): Promise<HydroponicReading>;
  
  // Aquaponic Readings (Pro Feature)
  getAquaponicReadings(gardenId: string, limit?: number): Promise<AquaponicReading[]>;
  createAquaponicReading(reading: Omit<AquaponicReading, 'id' | 'createdAt'>): Promise<AquaponicReading>;
  
  // Garden Beds (Zones)
  getGardenBeds(gardenId: string): Promise<GardenBed[]>;
  getGardenBed(id: string): Promise<GardenBed | null>;
  createGardenBed(bed: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenBed>;
  updateGardenBed(id: string, updates: Partial<GardenBed>): Promise<GardenBed>;
  deleteGardenBed(id: string): Promise<void>;
  
  // Check if provider is available
  isAvailable(): boolean;
}

