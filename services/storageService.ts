/**
 * Centralized localStorage service
 * This will be replaced by IStorageProvider in Phase 2
 */

import { Garden, GardenTask, SmartDevice } from '../types';

const STORAGE_KEYS = {
  GARDENS: 'ortoGardens',
  TASKS: 'ortoTasks',
  ACTIVE_GARDEN_ID: 'ortoActiveGardenId',
  DEVICES: 'ortoDevices',
  OLD_PROFILE: 'ortoProfile', // Legacy migration
} as const;

export class StorageService {
  // Gardens
  static getGardens(): Garden[] {
    const saved = localStorage.getItem(STORAGE_KEYS.GARDENS);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as Garden[];
    } catch (e) {
      console.error('Error parsing gardens from localStorage', e);
      return [];
    }
  }

  static saveGardens(gardens: Garden[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GARDENS, JSON.stringify(gardens));
    } catch (e) {
      console.error('Error saving gardens to localStorage', e);
    }
  }

  // Tasks
  static getTasks(): GardenTask[] {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as GardenTask[];
    } catch (e) {
      console.error('Error parsing tasks from localStorage', e);
      return [];
    }
  }

  static saveTasks(tasks: GardenTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage', e);
    }
  }

  // Active Garden ID
  static getActiveGardenId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_GARDEN_ID);
  }

  static saveActiveGardenId(gardenId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_GARDEN_ID, gardenId);
    } catch (e) {
      console.error('Error saving active garden ID to localStorage', e);
    }
  }

  // Smart Devices
  static getDevices(): SmartDevice[] {
    const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as SmartDevice[];
    } catch (e) {
      console.error('Error parsing devices from localStorage', e);
      return [];
    }
  }

  static saveDevices(devices: SmartDevice[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
    } catch (e) {
      console.error('Error saving devices to localStorage', e);
    }
  }

  // Legacy migration helpers
  static getOldProfile(): any {
    const saved = localStorage.getItem(STORAGE_KEYS.OLD_PROFILE);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing old profile from localStorage', e);
      return null;
    }
  }

  // Generic helpers
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

