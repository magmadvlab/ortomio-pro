/**
 * LocalStorage Provider Implementation
 * Wraps existing localStorage operations in IStorageProvider interface
 */

import { IStorageProvider } from '../core/storage/interface';
import { Garden, GardenTask, SmartDevice, SeedPacket, HarvestLogData, PlantPhotoLog } from '@/types';
import { StorageService } from '@/services/storageService';

export class LocalStorageProvider implements IStorageProvider {
  private readonly STORAGE_KEYS = {
    GARDENS: 'ortoGardens',
    TASKS: 'ortoTasks',
    DEVICES: 'ortoDevices',
    SEEDS: 'ortoSeedPackets',
    HARVESTS: 'ortHarvestLogs',
    PHOTOS: 'ortoPhotoLogs',
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
    return newTask;
  }

  async updateTask(id: string, updates: Partial<GardenTask>): Promise<GardenTask> {
    const tasks = StorageService.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    tasks[index] = { ...tasks[index], ...updates };
    StorageService.saveTasks(tasks);
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
}

