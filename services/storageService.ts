/**
 * Centralized localStorage service
 * This will be replaced by IStorageProvider in Phase 2
 */

import { Garden, GardenTask, SmartDevice, SmartDeviceAutomationLog, PhenologyObservation, QualityResult } from '../types';
import { normalizeSmartDeviceScope } from '../utils/smartDeviceScope';

const STORAGE_KEYS = {
  GARDENS: 'ortoGardens',
  TASKS: 'ortoTasks',
  ACTIVE_GARDEN_ID: 'ortoActiveGardenId',
  DEVICES: 'ortoDevices',
  SMART_DEVICE_AUTOMATION_LOGS: 'ortoSmartDeviceAutomationLogs',
  PHENOLOGY_OBSERVATIONS: 'ortoPhenologyObservations',
  QUALITY_RESULTS: 'ortoQualityResults',
  PRESCRIPTION_MAPS: 'ortoPrescriptionMaps',
  PRESCRIPTION_EXECUTIONS: 'ortoPrescriptionExecutions',
  PRESCRIPTION_EXPORTS: 'ortoPrescriptionExports',
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
      const devices = JSON.parse(saved) as SmartDevice[];
      return devices.map(device => normalizeSmartDeviceScope(device));
    } catch (e) {
      console.error('Error parsing devices from localStorage', e);
      return [];
    }
  }

  static saveDevices(devices: SmartDevice[]): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.DEVICES,
        JSON.stringify(devices.map(device => normalizeSmartDeviceScope(device)))
      );
    } catch (e) {
      console.error('Error saving devices to localStorage', e);
    }
  }

  static getSmartDeviceAutomationLogs(): SmartDeviceAutomationLog[] {
    const saved = localStorage.getItem(STORAGE_KEYS.SMART_DEVICE_AUTOMATION_LOGS);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as SmartDeviceAutomationLog[];
    } catch (e) {
      console.error('Error parsing smart device automation logs from localStorage', e);
      return [];
    }
  }

  static saveSmartDeviceAutomationLogs(logs: SmartDeviceAutomationLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SMART_DEVICE_AUTOMATION_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving smart device automation logs to localStorage', e);
    }
  }

  static getPhenologyObservations(): PhenologyObservation[] {
    const saved = localStorage.getItem(STORAGE_KEYS.PHENOLOGY_OBSERVATIONS);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as PhenologyObservation[];
    } catch (e) {
      console.error('Error parsing phenology observations from localStorage', e);
      return [];
    }
  }

  static savePhenologyObservations(observations: PhenologyObservation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PHENOLOGY_OBSERVATIONS, JSON.stringify(observations));
    } catch (e) {
      console.error('Error saving phenology observations to localStorage', e);
    }
  }

  static getQualityResults(): QualityResult[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUALITY_RESULTS);
      if (!saved) return [];
      return JSON.parse(saved) as QualityResult[];
    } catch (e) {
      console.error('Error parsing quality results from localStorage', e);
      return [];
    }
  }

  static saveQualityResults(results: QualityResult[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUALITY_RESULTS, JSON.stringify(results));
    } catch (e) {
      console.error('Error saving quality results to localStorage', e);
    }
  }

  static getPrescriptionMaps<T = unknown>(): T[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRESCRIPTION_MAPS);
      if (!saved) return [];
      return JSON.parse(saved) as T[];
    } catch (e) {
      console.error('Error parsing prescription maps from localStorage', e);
      return [];
    }
  }

  static savePrescriptionMaps<T = unknown>(maps: T[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTION_MAPS, JSON.stringify(maps));
    } catch (e) {
      console.error('Error saving prescription maps to localStorage', e);
    }
  }

  static getPrescriptionExecutions<T = unknown>(): T[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRESCRIPTION_EXECUTIONS);
      if (!saved) return [];
      return JSON.parse(saved) as T[];
    } catch (e) {
      console.error('Error parsing prescription executions from localStorage', e);
      return [];
    }
  }

  static savePrescriptionExecutions<T = unknown>(records: T[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTION_EXECUTIONS, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving prescription executions to localStorage', e);
    }
  }

  static getPrescriptionExports<T = unknown>(): T[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRESCRIPTION_EXPORTS);
      if (!saved) return [];
      return JSON.parse(saved) as T[];
    } catch (e) {
      console.error('Error parsing prescription exports from localStorage', e);
      return [];
    }
  }

  static savePrescriptionExports<T = unknown>(records: T[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTION_EXPORTS, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving prescription exports to localStorage', e);
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
