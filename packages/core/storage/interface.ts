/**
 * Storage Provider Interface
 * Abstract interface for storage operations (localStorage or Supabase)
 */

import { Garden, GardenTask, SmartDevice, SeedPacket, HarvestLogData, PlantPhotoLog } from '../../../types';

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
  
  // Pro Features (optional - may not be available in Free tier)
  uploadPhoto?(file: File, taskId: string, gardenId: string): Promise<string>; // Returns photo URL
  getPhotoLogs?(taskId: string): Promise<PlantPhotoLog[]>;
  createPhotoLog?(log: Omit<PlantPhotoLog, 'id' | 'createdAt'>): Promise<PlantPhotoLog>;
  
  // Sync (for cloud providers)
  sync?(): Promise<void>;
  
  // Check if provider is available
  isAvailable(): boolean;
}

