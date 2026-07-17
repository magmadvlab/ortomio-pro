/**
 * LocalStorage Provider Implementation
 * Wraps existing localStorage operations in IStorageProvider interface
 */

import { IStorageProvider } from '../core/storage/interface';
import { Garden, GardenTask, SmartDevice, SmartDeviceAutomationLog, SeedPacket, HarvestLogData, PlantPhotoLog, MechanicalWorkRecord, TreatmentRecordDB, FertilizerInventoryItemDB, PhytoInventoryItemDB, CompostLogDB, FertilizerApplicationLogDB, PhenologyObservation, QualityResult } from '@/types';
import { CustomCrop, CropLearningEvent } from '@/types/customCrop';
import { CustomPlan } from '@/types/customPlan';
import { Agronomist, AgronomistConsultation, AgronomistAdvice } from '@/types/agronomist';
import { StorageService } from '@/services/storageService';
import { saveAutoBackup } from '@/services/autoBackupService';
import { SeedlingBatch } from '@/services/seedlingService';
import { SaplingBatch } from '@/services/saplingService';
import { GardenAccessory } from '@/types/accessories';
import { HydroponicReading, AquaponicReading } from '@/types/indoorGrowing';
import { GardenBed } from '@/types/gardenBed';
import { GardenRow } from '@/types';
import { CropArchetype, CropProfile, CropAlias, ArchetypeId, OfficialCrop } from '@/types/archetypes';
import { IrrigationSystem, IrrigationZone, IrrigationComponent, WateringLog } from '@/types/irrigation';
import { HealthAlert } from '@/types/healthAlert';
import type { PrescriptionExecutionRecord, PrescriptionMap, PrescriptionMapExportRecord } from '@/types/prescriptionMaps';
import type { PlantOperation } from '@/types/individualPlant';
import { normalizeGeoCoordinates } from '@/utils/coordinates';
import {
  ensurePlantOperationLineageContext,
  extractRowScopeFromOperationContext,
} from '@/utils/plantOperationLineage';
import {
  hasAgronomicScope,
  normalizeSmartDeviceScope,
  touchesAgronomicScope,
  validateSmartDeviceScope,
} from '@/utils/smartDeviceScope';
import type { FieldAlert } from '@/types/fieldAlerts';

export class LocalStorageProvider implements IStorageProvider {
  readonly persistenceKind = 'local' as const;
  private readonly STORAGE_KEYS = {
    GARDENS: 'ortoGardens',
    TASKS: 'ortoTasks',
    DEVICES: 'ortoDevices',
    SMART_DEVICE_AUTOMATION_LOGS: 'ortoSmartDeviceAutomationLogs',
    PHENOLOGY_OBSERVATIONS: 'ortoPhenologyObservations',
    QUALITY_RESULTS: 'ortoQualityResults',
    PRESCRIPTION_MAPS: 'ortoPrescriptionMaps',
    PRESCRIPTION_EXECUTIONS: 'ortoPrescriptionExecutions',
    SEEDS: 'ortoSeedPackets',
    HARVESTS: 'ortHarvestLogs',
    PHOTOS: 'ortoPhotoLogs',
    CUSTOM_PLANS: 'ortoCustomPlans',
    AGRONOMISTS: 'ortoAgronomists',
    CONSULTATIONS: 'ortoConsultations',
    ADVICE: 'ortoAgronomistAdvice',
    SEEDLING_BATCHES: 'ortSeedlingBatches',
    SAPLING_BATCHES: 'ortSaplingBatches',
    ACCESSORIES: 'ortoAccessories',
    HYDROPONIC_READINGS: 'ortoHydroponicReadings',
    AQUAPONIC_READINGS: 'ortoAquaponicReadings',
    GARDEN_BEDS: 'ortoGardenBeds',
    GARDEN_ROWS: 'ortoGardenRows',
    IRRIGATION_SYSTEMS: 'ortoIrrigationSystems',
    IRRIGATION_ZONES: 'ortoIrrigationZones',
    IRRIGATION_COMPONENTS: 'ortoIrrigationComponents',
    WATERING_LOGS: 'ortoWateringLogs',
    HEALTH_ALERTS: 'ortoHealthAlerts',
    FERTILIZER_INVENTORY: 'ortoFertilizerInventory',
    PHYTO_INVENTORY: 'ortoPhytoInventory',
    COMPOST_LOGS: 'ortoCompostLogs',
    FERTILIZER_APPLICATION_LOGS: 'ortoFertilizerApplicationLogs',
    INDIVIDUAL_PLANTS: 'ortoIndividualPlants',
    FIELD_ROWS: 'ortoFieldRows',
  } as const;

  private getUserPreferenceKey(key: string): string {
    return `ortomio_user_pref_${key}`;
  }

  private normalizeGardenCoordinates(value: any): Garden['coordinates'] | undefined {
    return normalizeGeoCoordinates(value);
  }

  private normalizeGarden(garden: Garden): Garden {
    return {
      ...garden,
      coordinates: this.normalizeGardenCoordinates((garden as any).coordinates),
    };
  }

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

  async getUserPreference<T = any>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.getUserPreferenceKey(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setUserPreference<T = any>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.getUserPreferenceKey(key), JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  // Gardens
  async getGardens(): Promise<Garden[]> {
    const rawGardens = StorageService.getGardens();
    const gardens = rawGardens.map((garden) => this.normalizeGarden(garden));

    const hasLegacyCoordinates = rawGardens.some((garden, index) => {
      const original = (garden as any)?.coordinates;
      const normalized = gardens[index]?.coordinates;

      if (original && typeof original === 'object') {
        const originalRecord = original as Record<string, unknown>;
        if (
          originalRecord.lat !== undefined ||
          originalRecord.lon !== undefined ||
          originalRecord.lng !== undefined
        ) {
          return true;
        }
      }

      const originalLatitude = (original as any)?.latitude;
      const originalLongitude = (original as any)?.longitude;

      return (
        normalized?.latitude !== originalLatitude ||
        normalized?.longitude !== originalLongitude
      );
    });

    if (hasLegacyCoordinates) {
      StorageService.saveGardens(gardens);
    }

    return gardens;
  }

  async getGarden(id: string): Promise<Garden | null> {
    const gardens = await this.getGardens();
    return gardens.find(g => g.id === id) || null;
  }

  async createGarden(garden: Omit<Garden, 'id' | 'createdAt'>): Promise<Garden> {
    const newGarden: Garden = {
      ...garden,
      coordinates: this.normalizeGardenCoordinates((garden as any).coordinates),
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
    gardens[index] = this.normalizeGarden({
      ...gardens[index],
      ...updates,
    });
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
    const normalizedDevice = validateSmartDeviceScope(device, { requireScope: true })
    const newDevice: SmartDevice = {
      ...normalizedDevice,
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
    const currentDevice = normalizeSmartDeviceScope(devices[index])
    const mergedDevice = normalizeSmartDeviceScope({
      ...currentDevice,
      ...updates,
      lastUpdate: new Date().toISOString(),
    })
    const shouldRequireScope = hasAgronomicScope(currentDevice) || touchesAgronomicScope(updates)
    devices[index] = validateSmartDeviceScope(mergedDevice, { requireScope: shouldRequireScope }) as SmartDevice
    StorageService.saveDevices(devices);
    return devices[index];
  }

  async deleteDevice(id: string): Promise<void> {
    const devices = StorageService.getDevices();
    const filtered = devices.filter(d => d.id !== id);
    StorageService.saveDevices(filtered);
  }

  async getSmartDeviceAutomationLogs(gardenId?: string, deviceId?: string): Promise<SmartDeviceAutomationLog[]> {
    const logs = StorageService.getSmartDeviceAutomationLogs()
      .sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime())

    return logs.filter(log => {
      if (gardenId && log.gardenId !== gardenId) return false
      if (deviceId && log.deviceId !== deviceId) return false
      return true
    })
  }

  async createSmartDeviceAutomationLog(
    log: Omit<SmartDeviceAutomationLog, 'id' | 'createdAt'>
  ): Promise<SmartDeviceAutomationLog> {
    const newLog: SmartDeviceAutomationLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    const logs = StorageService.getSmartDeviceAutomationLogs()
    logs.unshift(newLog)
    StorageService.saveSmartDeviceAutomationLogs(logs.slice(0, 500))
    return newLog
  }

  async getPhenologyObservations(
    gardenId: string,
    options?: {
      cropContextId?: PhenologyObservation['cropContextId']
      scopeType?: PhenologyObservation['scopeType']
      scopeId?: string
      zoneId?: string
      fieldRowId?: string
      treeId?: string
      plantId?: string
      limit?: number
    }
  ): Promise<PhenologyObservation[]> {
    const observations = StorageService.getPhenologyObservations()
      .filter(observation => observation.gardenId === gardenId)
      .filter(observation => !options?.cropContextId || observation.cropContextId === options.cropContextId)
      .filter(observation => !options?.scopeType || observation.scopeType === options.scopeType)
      .filter(observation => !options?.scopeId || observation.scopeId === options.scopeId)
      .filter(observation => !options?.zoneId || observation.zoneId === options.zoneId)
      .filter(observation => !options?.fieldRowId || observation.fieldRowId === options.fieldRowId)
      .filter(observation => !options?.treeId || observation.treeId === options.treeId)
      .filter(observation => !options?.plantId || observation.plantId === options.plantId)
      .sort((left, right) => new Date(right.observedAt).getTime() - new Date(left.observedAt).getTime())

    return typeof options?.limit === 'number' ? observations.slice(0, options.limit) : observations
  }

  async createPhenologyObservation(
    observation: Omit<PhenologyObservation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PhenologyObservation> {
    const newObservation: PhenologyObservation = {
      ...observation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const observations = StorageService.getPhenologyObservations()
    observations.unshift(newObservation)
    StorageService.savePhenologyObservations(observations.slice(0, 1000))
    return newObservation
  }

  async getQualityResults(
    gardenId: string,
    options?: {
      cropContextId?: QualityResult['cropContextId']
      scopeType?: QualityResult['scopeType']
      scopeId?: string
      zoneId?: string
      fieldRowId?: string
      treeId?: string
      plantId?: string
      harvestLogId?: string
      lotCode?: string
      limit?: number
    }
  ): Promise<QualityResult[]> {
    const results = StorageService.getQualityResults()
      .filter((result) => result.gardenId === gardenId)
      .filter((result) => !options?.cropContextId || result.cropContextId === options.cropContextId)
      .filter((result) => !options?.scopeType || result.scopeType === options.scopeType)
      .filter((result) => !options?.scopeId || result.scopeId === options.scopeId)
      .filter((result) => !options?.zoneId || result.zoneId === options.zoneId)
      .filter((result) => !options?.fieldRowId || result.fieldRowId === options.fieldRowId)
      .filter((result) => !options?.treeId || result.treeId === options.treeId)
      .filter((result) => !options?.plantId || result.plantId === options.plantId)
      .filter((result) => !options?.harvestLogId || result.harvestLogId === options.harvestLogId)
      .filter((result) => !options?.lotCode || result.lotCode === options.lotCode)
      .sort((left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime())

    if (typeof options?.limit === 'number') {
      return results.slice(0, options.limit)
    }

    return results
  }

  async createQualityResult(
    result: Omit<QualityResult, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QualityResult> {
    const newResult: QualityResult = {
      ...result,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const results = StorageService.getQualityResults()
    results.unshift(newResult)
    StorageService.saveQualityResults(results.slice(0, 2000))
    return newResult
  }

  async updateQualityResult(
    id: string,
    updates: Partial<QualityResult>
  ): Promise<QualityResult> {
    const results = StorageService.getQualityResults()
    const index = results.findIndex((result) => result.id === id)

    if (index === -1) {
      throw new Error(`Quality result ${id} not found`)
    }

    const updatedResult: QualityResult = {
      ...results[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }

    results[index] = updatedResult
    StorageService.saveQualityResults(results)
    return updatedResult
  }

  async getPrescriptionMaps(gardenId: string): Promise<PrescriptionMap[]> {
    return StorageService.getPrescriptionMaps<PrescriptionMap>()
      .filter((map) => map.gardenId === gardenId)
      .sort((left, right) => new Date(right.generationDate).getTime() - new Date(left.generationDate).getTime())
  }

  async getPrescriptionMap(id: string): Promise<PrescriptionMap | null> {
    return StorageService.getPrescriptionMaps<PrescriptionMap>().find((map) => map.id === id) || null
  }

  async createPrescriptionMap(
    map: Omit<PrescriptionMap, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PrescriptionMap> {
    const newMapId = crypto.randomUUID()
    const newMap: PrescriptionMap = {
      ...map,
      id: newMapId,
      zones: map.zones.map((zone, index) => ({
        ...zone,
        id: zone.id || crypto.randomUUID(),
        prescriptionMapId: newMapId,
        zoneNumber: zone.zoneNumber || index + 1,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const maps = StorageService.getPrescriptionMaps<PrescriptionMap>()
    maps.unshift(newMap)
    StorageService.savePrescriptionMaps(maps.slice(0, 300))
    return newMap
  }

  async updatePrescriptionMap(id: string, updates: Partial<PrescriptionMap>): Promise<PrescriptionMap> {
    const maps = StorageService.getPrescriptionMaps<PrescriptionMap>()
    const index = maps.findIndex((map) => map.id === id)

    if (index === -1) {
      throw new Error(`Prescription map ${id} not found`)
    }

    const updatedMap: PrescriptionMap = {
      ...maps[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }

    maps[index] = updatedMap
    StorageService.savePrescriptionMaps(maps)
    return updatedMap
  }

  async deletePrescriptionMap(id: string): Promise<void> {
    const maps = StorageService.getPrescriptionMaps<PrescriptionMap>()
    StorageService.savePrescriptionMaps(maps.filter((map) => map.id !== id))
  }

  async getPrescriptionExecutionRecords(
    prescriptionMapId: string,
    options?: {
      prescriptionZoneId?: string
      executionStatus?: PrescriptionExecutionRecord['executionStatus']
      limit?: number
    }
  ): Promise<PrescriptionExecutionRecord[]> {
    const records = StorageService.getPrescriptionExecutions<PrescriptionExecutionRecord>()
      .filter((record) => record.prescriptionMapId === prescriptionMapId)
      .filter((record) => !options?.prescriptionZoneId || record.prescriptionZoneId === options.prescriptionZoneId)
      .filter((record) => !options?.executionStatus || record.executionStatus === options.executionStatus)
      .sort((left, right) => new Date(right.applicationDate).getTime() - new Date(left.applicationDate).getTime())

    if (typeof options?.limit === 'number') {
      return records.slice(0, options.limit)
    }

    return records
  }

  async createPrescriptionExecutionRecord(
    record: Omit<PrescriptionExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PrescriptionExecutionRecord> {
    const newRecord: PrescriptionExecutionRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const records = StorageService.getPrescriptionExecutions<PrescriptionExecutionRecord>()
    records.unshift(newRecord)
    StorageService.savePrescriptionExecutions(records.slice(0, 1000))
    return newRecord
  }

  async updatePrescriptionExecutionRecord(
    id: string,
    updates: Partial<PrescriptionExecutionRecord>
  ): Promise<PrescriptionExecutionRecord> {
    const records = StorageService.getPrescriptionExecutions<PrescriptionExecutionRecord>()
    const index = records.findIndex((record) => record.id === id)

    if (index === -1) {
      throw new Error(`Prescription execution ${id} not found`)
    }

    const updatedRecord: PrescriptionExecutionRecord = {
      ...records[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }

    records[index] = updatedRecord
    StorageService.savePrescriptionExecutions(records)
    return updatedRecord
  }

  async getPrescriptionMapExportRecords(
    prescriptionMapId: string,
    options?: {
      format?: PrescriptionMapExportRecord['format']
      status?: PrescriptionMapExportRecord['status']
      limit?: number
    }
  ): Promise<PrescriptionMapExportRecord[]> {
    const records = StorageService.getPrescriptionExports<PrescriptionMapExportRecord>()
      .filter((record) => record.prescriptionMapId === prescriptionMapId)
      .filter((record) => !options?.format || record.format === options.format)
      .filter((record) => !options?.status || record.status === options.status)
      .sort((left, right) => new Date(right.exportedAt).getTime() - new Date(left.exportedAt).getTime())

    if (typeof options?.limit === 'number') {
      return records.slice(0, options.limit)
    }

    return records
  }

  async createPrescriptionMapExportRecord(
    record: Omit<PrescriptionMapExportRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PrescriptionMapExportRecord> {
    const newRecord: PrescriptionMapExportRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const records = StorageService.getPrescriptionExports<PrescriptionMapExportRecord>()
    records.unshift(newRecord)
    StorageService.savePrescriptionExports(records.slice(0, 1000))
    return newRecord
  }

  async updatePrescriptionMapExportRecord(
    id: string,
    updates: Partial<PrescriptionMapExportRecord>
  ): Promise<PrescriptionMapExportRecord> {
    const records = StorageService.getPrescriptionExports<PrescriptionMapExportRecord>()
    const index = records.findIndex((record) => record.id === id)

    if (index === -1) {
      throw new Error(`Prescription export ${id} not found`)
    }

    const updatedRecord: PrescriptionMapExportRecord = {
      ...records[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }

    records[index] = updatedRecord
    StorageService.savePrescriptionExports(records)
    return updatedRecord
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

  // Sapling Batches
  async getSaplingBatches(gardenId?: string): Promise<SaplingBatch[]> {
    const saved = localStorage.getItem(this.STORAGE_KEYS.SAPLING_BATCHES);
    if (!saved) return [];
    try {
      const batches = JSON.parse(saved) as SaplingBatch[];
      if (gardenId) {
        return batches.filter(b => b.gardenId === gardenId);
      }
      return batches;
    } catch {
      return [];
    }
  }

  async getSaplingBatch(id: string): Promise<SaplingBatch | null> {
    const batches = await this.getSaplingBatches();
    return batches.find(b => b.id === id) || null;
  }

  async createSaplingBatch(batch: Omit<SaplingBatch, 'id'>): Promise<SaplingBatch> {
    const newBatch: SaplingBatch = {
      ...batch,
      id: crypto.randomUUID(),
    };
    const batches = await this.getSaplingBatches();
    batches.push(newBatch);
    localStorage.setItem(this.STORAGE_KEYS.SAPLING_BATCHES, JSON.stringify(batches));
    
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this, batch.gardenId).catch(err => 
      console.error('Error saving auto backup after createSaplingBatch:', err)
    );
    
    return newBatch;
  }

  async updateSaplingBatch(id: string, updates: Partial<SaplingBatch>): Promise<SaplingBatch> {
    const batches = await this.getSaplingBatches();
    const index = batches.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error(`Sapling batch with id ${id} not found`);
    }
    const batch = batches[index];
    batches[index] = { ...batch, ...updates };
    localStorage.setItem(this.STORAGE_KEYS.SAPLING_BATCHES, JSON.stringify(batches));
    
    // Trigger backup automatico (non bloccare se fallisce)
    saveAutoBackup(this, batch.gardenId).catch(err => 
      console.error('Error saving auto backup after updateSaplingBatch:', err)
    );
    
    return batches[index];
  }

  async deleteSaplingBatch(id: string): Promise<void> {
    const batches = await this.getSaplingBatches();
    const filtered = batches.filter(b => b.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.SAPLING_BATCHES, JSON.stringify(filtered));
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

  // Garden Rows (Filari)
  private getAllGardenRows(): GardenRow[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.GARDEN_ROWS);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        console.warn('GardenRows data is not an array, resetting to empty array');
        localStorage.removeItem(this.STORAGE_KEYS.GARDEN_ROWS);
        return [];
      }
      return parsed as GardenRow[];
    } catch (error) {
      console.error('Error parsing GardenRows from localStorage:', error);
      localStorage.removeItem(this.STORAGE_KEYS.GARDEN_ROWS);
      return [];
    }
  }

  private saveGardenRows(rows: GardenRow[]): void {
    localStorage.setItem(this.STORAGE_KEYS.GARDEN_ROWS, JSON.stringify(rows));
    saveAutoBackup(this).catch(() => {});
  }

  async getGardenRows(bedId: string): Promise<GardenRow[]> {
    const all = this.getAllGardenRows();
    return all
      .filter((r) => r.bedId === bedId)
      .sort((a, b) => {
        const an = typeof a.rowNumber === 'number' ? a.rowNumber : Number.POSITIVE_INFINITY;
        const bn = typeof b.rowNumber === 'number' ? b.rowNumber : Number.POSITIVE_INFINITY;
        if (an !== bn) return an - bn;
        return (a.name || '').localeCompare(b.name || '');
      });
  }

  async getGardenRow(id: string): Promise<GardenRow | null> {
    return this.getAllGardenRows().find((r) => r.id === id) || null;
  }

  async createGardenRow(row: Omit<GardenRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenRow> {
    const all = this.getAllGardenRows();
    const created: GardenRow = {
      ...row,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(created);
    this.saveGardenRows(all);
    return created;
  }

  async updateGardenRow(id: string, updates: Partial<GardenRow>): Promise<GardenRow> {
    const all = this.getAllGardenRows();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`GardenRow with id ${id} not found`);

    const updated: GardenRow = {
      ...all[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    this.saveGardenRows(all);
    return updated;
  }

  async deleteGardenRow(id: string): Promise<void> {
    const all = this.getAllGardenRows();
    const filtered = all.filter((r) => r.id !== id);
    this.saveGardenRows(filtered);
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
  async getMechanicalWorks(gardenId?: string, options?: { dateFrom?: string; dateTo?: string }): Promise<MechanicalWorkRecord[]> {
    const key = 'ortomio_mechanical_works';
    const allWorks = JSON.parse(localStorage.getItem(key) || '[]') as MechanicalWorkRecord[];

    let filtered = allWorks;
    if (gardenId) {
      filtered = allWorks.filter(w => w.garden_id === gardenId);
    }
    if (options?.dateFrom) {
      filtered = filtered.filter(w => w.work_date >= options.dateFrom!);
    }
    if (options?.dateTo) {
      filtered = filtered.filter(w => w.work_date <= options.dateTo!);
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

  // Fertilizer Inventory
  private getAllFertilizerInventoryItems(): FertilizerInventoryItemDB[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.FERTILIZER_INVENTORY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as FertilizerInventoryItemDB[]) : [];
    } catch {
      return [];
    }
  }

  private saveAllFertilizerInventoryItems(items: FertilizerInventoryItemDB[]): void {
    localStorage.setItem(this.STORAGE_KEYS.FERTILIZER_INVENTORY, JSON.stringify(items));
  }

  async getFertilizerInventory(gardenId: string): Promise<FertilizerInventoryItemDB[]> {
    return this.getAllFertilizerInventoryItems().filter((i) => i.garden_id === gardenId);
  }

  async getFertilizerInventoryItem(id: string): Promise<FertilizerInventoryItemDB | null> {
    return this.getAllFertilizerInventoryItems().find((i) => i.id === id) || null;
  }

  async createFertilizerInventoryItem(
    item: Omit<FertilizerInventoryItemDB, 'id' | 'created_at' | 'updated_at'>
  ): Promise<FertilizerInventoryItemDB> {
    const all = this.getAllFertilizerInventoryItems();
    const now = new Date().toISOString();
    const created: FertilizerInventoryItemDB = {
      ...item,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    all.push(created);
    this.saveAllFertilizerInventoryItems(all);
    saveAutoBackup(this, item.garden_id).catch(() => {});
    return created;
  }

  async updateFertilizerInventoryItem(
    id: string,
    updates: Partial<FertilizerInventoryItemDB>
  ): Promise<FertilizerInventoryItemDB> {
    const all = this.getAllFertilizerInventoryItems();
    const index = all.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`FertilizerInventoryItem with id ${id} not found`);
    const updated: FertilizerInventoryItemDB = {
      ...all[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    all[index] = updated;
    this.saveAllFertilizerInventoryItems(all);
    saveAutoBackup(this, updated.garden_id).catch(() => {});
    return updated;
  }

  async deleteFertilizerInventoryItem(id: string): Promise<void> {
    const all = this.getAllFertilizerInventoryItems();
    const item = all.find((i) => i.id === id);
    const filtered = all.filter((i) => i.id !== id);
    this.saveAllFertilizerInventoryItems(filtered);
    if (item) saveAutoBackup(this, item.garden_id).catch(() => {});
  }

  // Phyto Inventory
  private getAllPhytoInventoryItems(): PhytoInventoryItemDB[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.PHYTO_INVENTORY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as PhytoInventoryItemDB[]) : [];
    } catch {
      return [];
    }
  }

  private saveAllPhytoInventoryItems(items: PhytoInventoryItemDB[]): void {
    localStorage.setItem(this.STORAGE_KEYS.PHYTO_INVENTORY, JSON.stringify(items));
  }

  async getPhytoInventory(gardenId: string): Promise<PhytoInventoryItemDB[]> {
    return this.getAllPhytoInventoryItems().filter((i) => i.garden_id === gardenId);
  }

  async getPhytoInventoryItem(id: string): Promise<PhytoInventoryItemDB | null> {
    return this.getAllPhytoInventoryItems().find((i) => i.id === id) || null;
  }

  async createPhytoInventoryItem(
    item: Omit<PhytoInventoryItemDB, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PhytoInventoryItemDB> {
    const all = this.getAllPhytoInventoryItems();
    const now = new Date().toISOString();
    const created: PhytoInventoryItemDB = {
      ...item,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    all.push(created);
    this.saveAllPhytoInventoryItems(all);
    saveAutoBackup(this, item.garden_id).catch(() => {});
    return created;
  }

  async updatePhytoInventoryItem(id: string, updates: Partial<PhytoInventoryItemDB>): Promise<PhytoInventoryItemDB> {
    const all = this.getAllPhytoInventoryItems();
    const index = all.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`PhytoInventoryItem with id ${id} not found`);
    const updated: PhytoInventoryItemDB = {
      ...all[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    all[index] = updated;
    this.saveAllPhytoInventoryItems(all);
    saveAutoBackup(this, updated.garden_id).catch(() => {});
    return updated;
  }

  async deletePhytoInventoryItem(id: string): Promise<void> {
    const all = this.getAllPhytoInventoryItems();
    const item = all.find((i) => i.id === id);
    const filtered = all.filter((i) => i.id !== id);
    this.saveAllPhytoInventoryItems(filtered);
    if (item) saveAutoBackup(this, item.garden_id).catch(() => {});
  }

  // Compost Logs
  private getAllCompostLogs(): CompostLogDB[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.COMPOST_LOGS);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as CompostLogDB[]) : [];
    } catch {
      return [];
    }
  }

  private saveAllCompostLogs(logs: CompostLogDB[]): void {
    localStorage.setItem(this.STORAGE_KEYS.COMPOST_LOGS, JSON.stringify(logs));
  }

  async getCompostLogs(gardenId: string): Promise<CompostLogDB[]> {
    return this.getAllCompostLogs()
      .filter((l) => l.garden_id === gardenId)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }

  async getCompostLog(id: string): Promise<CompostLogDB | null> {
    return this.getAllCompostLogs().find((l) => l.id === id) || null;
  }

  async createCompostLog(log: Omit<CompostLogDB, 'id' | 'created_at' | 'updated_at'>): Promise<CompostLogDB> {
    const all = this.getAllCompostLogs();
    const now = new Date().toISOString();
    const created: CompostLogDB = {
      ...log,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    all.push(created);
    this.saveAllCompostLogs(all);
    saveAutoBackup(this, log.garden_id).catch(() => {});
    return created;
  }

  async updateCompostLog(id: string, updates: Partial<CompostLogDB>): Promise<CompostLogDB> {
    const all = this.getAllCompostLogs();
    const index = all.findIndex((l) => l.id === id);
    if (index === -1) throw new Error(`CompostLog with id ${id} not found`);
    const updated: CompostLogDB = {
      ...all[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    all[index] = updated;
    this.saveAllCompostLogs(all);
    saveAutoBackup(this, updated.garden_id).catch(() => {});
    return updated;
  }

  async deleteCompostLog(id: string): Promise<void> {
    const all = this.getAllCompostLogs();
    const log = all.find((l) => l.id === id);
    const filtered = all.filter((l) => l.id !== id);
    this.saveAllCompostLogs(filtered);
    if (log) saveAutoBackup(this, log.garden_id).catch(() => {});
  }

  // Fertilizer Application Logs
  private getAllFertilizerApplicationLogs(): FertilizerApplicationLogDB[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.FERTILIZER_APPLICATION_LOGS);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as FertilizerApplicationLogDB[]) : [];
    } catch {
      return [];
    }
  }

  private saveAllFertilizerApplicationLogs(logs: FertilizerApplicationLogDB[]): void {
    localStorage.setItem(this.STORAGE_KEYS.FERTILIZER_APPLICATION_LOGS, JSON.stringify(logs));
  }

  async getFertilizerApplicationLogs(
    gardenId: string,
    options?: { taskId?: string; bedId?: string; from?: string; to?: string }
  ): Promise<FertilizerApplicationLogDB[]> {
    let logs = this.getAllFertilizerApplicationLogs().filter((l) => l.gardenId === gardenId);
    if (options?.taskId) logs = logs.filter((l) => l.taskId === options.taskId);
    if (options?.bedId) logs = logs.filter((l) => l.bedId === options.bedId);
    if (options?.from) logs = logs.filter((l) => new Date(l.applicationDate) >= new Date(options.from!));
    if (options?.to) logs = logs.filter((l) => new Date(l.applicationDate) <= new Date(options.to!));
    return logs.sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
  }

  async getFertilizerApplicationLog(id: string): Promise<FertilizerApplicationLogDB | null> {
    return this.getAllFertilizerApplicationLogs().find((l) => l.id === id) || null;
  }

  async createFertilizerApplicationLog(
    log: Omit<FertilizerApplicationLogDB, 'id' | 'createdAt'>
  ): Promise<FertilizerApplicationLogDB> {
    const all = this.getAllFertilizerApplicationLogs();
    const created: FertilizerApplicationLogDB = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    } as any;
    all.push(created);
    this.saveAllFertilizerApplicationLogs(all);
    saveAutoBackup(this, (log as any).garden_id || log.gardenId).catch(() => {});
    return created;
  }

  async updateFertilizerApplicationLog(
    id: string,
    updates: Partial<FertilizerApplicationLogDB>
  ): Promise<FertilizerApplicationLogDB> {
    const all = this.getAllFertilizerApplicationLogs();
    const idx = all.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Fertilizer application log with id ${id} not found`);

    const updated: FertilizerApplicationLogDB = {
      ...all[idx],
      ...updates,
      id: all[idx].id,
      createdAt: all[idx].createdAt,
    } as any;

    all[idx] = updated;
    this.saveAllFertilizerApplicationLogs(all);
    saveAutoBackup(this, updated.gardenId).catch(() => {});
    return updated;
  }

  async deleteFertilizerApplicationLog(id: string): Promise<void> {
    const all = this.getAllFertilizerApplicationLogs();
    const log = all.find((l) => l.id === id);
    const filtered = all.filter((l) => l.id !== id);
    this.saveAllFertilizerApplicationLogs(filtered);
    if (log) saveAutoBackup(this, log.gardenId).catch(() => {});
  }

  // Treatments
  async getTreatments(gardenId?: string, options?: { dateFrom?: string; dateTo?: string }): Promise<TreatmentRecordDB[]> {
    const key = 'ortomio_treatments';
    const allTreatments = JSON.parse(localStorage.getItem(key) || '[]') as TreatmentRecordDB[];

    let filtered = allTreatments;
    if (gardenId) {
      filtered = allTreatments.filter(t => t.garden_id === gardenId);
    }
    if (options?.dateFrom) {
      filtered = filtered.filter(t => t.treatment_date >= options.dateFrom!);
    }
    if (options?.dateTo) {
      filtered = filtered.filter(t => t.treatment_date <= options.dateTo!);
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
    if (typeof localStorage === 'undefined') {
      return [];
    }

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
  async getIrrigationZones(systemId: string): Promise<IrrigationZone[]>;
  async getIrrigationZones(systemId?: string, gardenId?: string): Promise<IrrigationZone[]>;
  async getIrrigationZones(systemId?: string, gardenId?: string): Promise<IrrigationZone[]> {
    const key = this.STORAGE_KEYS.IRRIGATION_ZONES;
    let zones = JSON.parse(localStorage.getItem(key) || '[]') as IrrigationZone[];

    if (systemId) {
      zones = zones.filter(z => z.systemId === systemId);
    }
    if (gardenId) {
      zones = zones.filter(z => z.gardenId === gardenId);
    }

    if (!systemId && !gardenId) {
      throw new Error('getIrrigationZones requires systemId or gardenId');
    }

    return zones;
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
  async getWateringLogs(zoneId: string, startDate?: string, endDate?: string): Promise<WateringLog[]>;
  async getWateringLogs(zoneId?: string, gardenId?: string, dateRange?: { from: string; to: string }): Promise<WateringLog[]>;
  async getWateringLogs(
    zoneId?: string,
    arg2?: string,
    arg3?: string | { from: string; to: string }
  ): Promise<WateringLog[]> {
    const key = this.STORAGE_KEYS.WATERING_LOGS;
    let logs = JSON.parse(localStorage.getItem(key) || '[]') as WateringLog[];

    // Signature A: (zoneId, startDate?, endDate?)
    if (zoneId && (typeof arg3 === 'string' || arg3 === undefined)) {
      const startDate = arg2;
      const endDate = arg3;
      logs = logs.filter(l => l.zoneId === zoneId);

      if (startDate) logs = logs.filter(l => l.date >= startDate);
      if (endDate) logs = logs.filter(l => l.date <= endDate);
    } else {
      // Signature B: (zoneId?, gardenId?, dateRange?)
      const gardenId = arg2;
      const dateRange = typeof arg3 === 'object' ? arg3 : undefined;

      if (zoneId) logs = logs.filter(l => l.zoneId === zoneId);
      if (gardenId) logs = logs.filter(l => l.gardenId === gardenId);

      if (!zoneId && !gardenId) {
        throw new Error('getWateringLogs requires zoneId or gardenId');
      }

      if (dateRange?.from) logs = logs.filter(l => l.date >= dateRange.from);
      if (dateRange?.to) logs = logs.filter(l => l.date <= dateRange.to);
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
      wateredAt: log.wateredAt || new Date().toISOString(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    logs.push(newLog);
    localStorage.setItem(key, JSON.stringify(logs));
    return newLog;
  }

  async createWateringLog(log: Omit<WateringLog, 'id' | 'createdAt'>): Promise<WateringLog> {
    return this.logWatering(log);
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

  // Health Alerts (Salute Proattiva)
  async getHealthAlerts(gardenId?: string): Promise<HealthAlert[]> {
    const key = this.STORAGE_KEYS.HEALTH_ALERTS;
    let alerts = JSON.parse(localStorage.getItem(key) || '[]') as HealthAlert[];

    if (gardenId) {
      alerts = alerts.filter(a => a.gardenId === gardenId);
    }

    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getHealthAlert(id: string): Promise<HealthAlert | null> {
    const key = this.STORAGE_KEYS.HEALTH_ALERTS;
    const alerts = JSON.parse(localStorage.getItem(key) || '[]') as HealthAlert[];
    return alerts.find(a => a.id === id) || null;
  }

  async createHealthAlert(alert: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthAlert> {
    const key = this.STORAGE_KEYS.HEALTH_ALERTS;
    const alerts = JSON.parse(localStorage.getItem(key) || '[]') as HealthAlert[];
    const now = new Date().toISOString();
    const newAlert: HealthAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    alerts.push(newAlert);
    localStorage.setItem(key, JSON.stringify(alerts));
    return newAlert;
  }

  async updateHealthAlert(id: string, updates: Partial<HealthAlert>): Promise<HealthAlert> {
    const key = this.STORAGE_KEYS.HEALTH_ALERTS;
    const alerts = JSON.parse(localStorage.getItem(key) || '[]') as HealthAlert[];
    const index = alerts.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Health alert with id ${id} not found`);

    alerts[index] = {
      ...alerts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(alerts));
    return alerts[index];
  }

  async deleteHealthAlert(id: string): Promise<void> {
    const key = this.STORAGE_KEYS.HEALTH_ALERTS;
    const alerts = JSON.parse(localStorage.getItem(key) || '[]') as HealthAlert[];
    const filtered = alerts.filter(a => a.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  // Garden Zones (stub implementations - features not available in local mode)
  async getGardenZones(gardenId: string): Promise<any[]> {
    return [];
  }

  async getGardenZone(id: string): Promise<any | null> {
    return null;
  }

  async createGardenZone(zone: any): Promise<any> {
    throw new Error('Garden zones not supported in local storage mode');
  }

  async updateGardenZone(id: string, updates: any): Promise<any> {
    throw new Error('Garden zones not supported in local storage mode');
  }

  async deleteGardenZone(id: string): Promise<void> {
    throw new Error('Garden zones not supported in local storage mode');
  }

  // Field Rows (Local Storage Implementation)
  async getFieldRows(gardenId?: string, zoneId?: string): Promise<any[]> {
    try {
      if (!gardenId) return [];
      
      const key = `ortoFieldRows_${gardenId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      
      const fieldRows = JSON.parse(raw);
      
      // Filter by zone if specified
      if (zoneId) {
        return fieldRows.filter((row: any) => row.zoneId === zoneId);
      }
      
      return fieldRows;
    } catch (error) {
      console.error('Error loading field rows:', error);
      return [];
    }
  }

  async getFieldRow(id: string): Promise<any | null> {
    try {
      // Search across all gardens for the field row
      const gardens = await this.getGardens();
      for (const garden of gardens) {
        const fieldRows = await this.getFieldRows(garden.id);
        const fieldRow = fieldRows.find((row: any) => row.id === id);
        if (fieldRow) return fieldRow;
      }
      return null;
    } catch (error) {
      console.error('Error loading field row:', error);
      return null;
    }
  }

  async createFieldRow(row: any): Promise<any> {
    try {
      const newRow = {
        ...row,
        id: row.id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const key = `ortoFieldRows_${row.gardenId}`;
      const existing = await this.getFieldRows(row.gardenId);
      const updated = [...existing, newRow];
      
      localStorage.setItem(key, JSON.stringify(updated));
      console.log('✅ Field row saved to localStorage:', newRow.name);
      
      return newRow;
    } catch (error) {
      console.error('Error creating field row:', error);
      throw error;
    }
  }

  async updateFieldRow(id: string, updates: any): Promise<any> {
    try {
      const fieldRow = await this.getFieldRow(id);
      if (!fieldRow) throw new Error('Field row not found');

      const updatedRow = {
        ...fieldRow,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const key = `ortoFieldRows_${fieldRow.gardenId}`;
      const existing = await this.getFieldRows(fieldRow.gardenId);
      const updated = existing.map((row: any) => row.id === id ? updatedRow : row);
      
      localStorage.setItem(key, JSON.stringify(updated));
      console.log('✅ Field row updated in localStorage:', updatedRow.name);
      
      return updatedRow;
    } catch (error) {
      console.error('Error updating field row:', error);
      throw error;
    }
  }

  async deleteFieldRow(id: string): Promise<void> {
    try {
      const fieldRow = await this.getFieldRow(id);
      if (!fieldRow) return;

      const key = `ortoFieldRows_${fieldRow.gardenId}`;
      const existing = await this.getFieldRows(fieldRow.gardenId);
      const updated = existing.filter((row: any) => row.id !== id);
      
      localStorage.setItem(key, JSON.stringify(updated));
      console.log('✅ Field row deleted from localStorage:', id);
    } catch (error) {
      console.error('Error deleting field row:', error);
      throw error;
    }
  }

  // Planting Batches (stub implementations - features not available in local mode)
  async getPlantingBatches(gardenId?: string, fieldRowId?: string): Promise<any[]> {
    return [];
  }

  async getPlantingBatch(id: string): Promise<any | null> {
    return null;
  }

  async createPlantingBatch(batch: any): Promise<any> {
    throw new Error('Planting batches not supported in local storage mode');
  }

  async updatePlantingBatch(id: string, updates: any): Promise<any> {
    throw new Error('Planting batches not supported in local storage mode');
  }

  async deletePlantingBatch(id: string): Promise<void> {
    throw new Error('Planting batches not supported in local storage mode');
  }

  // Individual Plants (Plant Tracking)
  async getIndividualPlants(gardenId: string): Promise<import('@/types/individualPlant').GardenPlant[]> {
    try {
      const key = `ortoIndividualPlants_${gardenId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (error) {
      console.error('Error loading individual plants:', error);
      return [];
    }
  }

  async getIndividualPlant(id: string): Promise<import('@/types/individualPlant').GardenPlant | null> {
    try {
      // Search across all gardens for the plant
      const gardens = await this.getGardens();
      for (const garden of gardens) {
        const plants = await this.getIndividualPlants(garden.id);
        const plant = plants.find(p => p.id === id);
        if (plant) return plant;
      }
      return null;
    } catch (error) {
      console.error('Error loading individual plant:', error);
      return null;
    }
  }

  async createIndividualPlant(plant: Omit<import('@/types/individualPlant').GardenPlant, 'id' | 'createdAt' | 'updatedAt'>): Promise<import('@/types/individualPlant').GardenPlant> {
    try {
      const newPlant: import('@/types/individualPlant').GardenPlant = {
        ...plant,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const key = `ortoIndividualPlants_${plant.gardenId}`;
      const existing = await this.getIndividualPlants(plant.gardenId);
      const updated = [...existing, newPlant];
      
      localStorage.setItem(key, JSON.stringify(updated));
      console.log('✅ Individual plant saved to localStorage:', newPlant.plantCode);
      
      return newPlant;
    } catch (error) {
      console.error('Error creating individual plant:', error);
      throw error;
    }
  }

  async updateIndividualPlant(id: string, updates: Partial<import('@/types/individualPlant').GardenPlant>): Promise<import('@/types/individualPlant').GardenPlant> {
    try {
      const plant = await this.getIndividualPlant(id);
      if (!plant) throw new Error('Plant not found');

      const updatedPlant = {
        ...plant,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const key = `ortoIndividualPlants_${plant.gardenId}`;
      const existing = await this.getIndividualPlants(plant.gardenId);
      const updated = existing.map(p => p.id === id ? updatedPlant : p);
      
      localStorage.setItem(key, JSON.stringify(updated));
      console.log('✅ Individual plant updated in localStorage:', updatedPlant.plantCode);
      
      return updatedPlant;
    } catch (error) {
      console.error('Error updating individual plant:', error);
      throw error;
    }
  }

  async deleteIndividualPlant(id: string): Promise<void> {
    try {
      const plant = await this.getIndividualPlant(id);
      if (!plant) return;

      const key = `ortoIndividualPlants_${plant.gardenId}`;
      const existing = await this.getIndividualPlants(plant.gardenId);
      const updated = existing.filter(p => p.id !== id);
      
      localStorage.setItem(key, JSON.stringify(updated));
      console.log('✅ Individual plant deleted from localStorage:', id);
    } catch (error) {
      console.error('Error deleting individual plant:', error);
      throw error;
    }
  }

  // Individual Plant Operations (local fallback)
  async getFieldRowOperations(fieldRowId: string, gardenId: string): Promise<PlantOperation[]> {
    try {
      const [wateringLogs, fertilizerLogs, treatmentLogs, mechanicalWorks] = await Promise.all([
        this.getWateringLogs(undefined, gardenId).catch(() => []),
        this.getFertilizerApplicationLogs(gardenId).catch(() => []),
        this.getTreatments(gardenId).catch(() => []),
        this.getMechanicalWorks(gardenId).catch(() => []),
      ]);

      const operations: PlantOperation[] = [
        ...wateringLogs
          .filter(log => log.fieldRowId === fieldRowId)
          .map((log): PlantOperation => ({
            id: `watering-${log.id}`,
            plantId: fieldRowId,
            gardenId,
            fieldRowId,
            operationType: 'watering',
            operationCategory: 'irrigation',
            date: log.wateredAt || log.date,
            operationDate: log.date,
            operationTime: log.wateredAt ? String(log.wateredAt).slice(11, 16) : undefined,
            quantity: log.litersApplied,
            waterAmount: log.litersApplied,
            unit: 'L',
            duration: log.durationMinutes,
            weatherConditions: {
              condition: log.weatherCondition,
              temperature: log.airTemperatureC,
            },
            photos: [],
            notes: log.notes,
            parentOperationId: log.id,
            parentOperationTable: 'watering_logs',
            sourceType: 'orchestrator_sync',
            actorType: 'orchestrator',
            recordedBy: 'system',
            createdAt: log.createdAt,
            updatedAt: log.createdAt,
          })),
        ...fertilizerLogs
          .filter(log => log.fieldRowId === fieldRowId)
          .map((log): PlantOperation => ({
            id: `fertilizer-${log.id}`,
            plantId: fieldRowId,
            gardenId,
            fieldRowId,
            operationType: 'fertilizing',
            operationCategory: 'nutrition',
            date: log.applicationDate,
            operationDate: log.applicationDate,
            quantity: log.dosageAmount,
            unit: log.dosageUnit,
            productName: log.fertilizerProductName,
            weatherConditions: log.weatherConditions || undefined,
            photos: [],
            notes: log.notes || undefined,
            parentOperationId: log.id,
            parentOperationTable: 'fertilizer_application_logs',
            sourceType: 'orchestrator_sync',
            actorType: 'orchestrator',
            recordedBy: 'system',
            createdAt: log.createdAt,
            updatedAt: log.createdAt,
          })),
        ...treatmentLogs
          .filter(log => log.field_row_id === fieldRowId)
          .map((log): PlantOperation => ({
            id: `treatment-${log.id}`,
            plantId: fieldRowId,
            gardenId,
            fieldRowId,
            operationType: 'treatment',
            operationCategory: 'protection',
            date: log.treatment_date,
            operationDate: log.treatment_date,
            quantity: log.dosage,
            unit: log.dosage_unit,
            productName: log.product_name,
            targetPest: log.reason,
            treatmentType: log.reason === 'preventive' ? 'preventive' : 'curative',
            weatherConditions: log.weather_conditions || undefined,
            photos: [],
            notes: log.notes,
            parentOperationId: log.id,
            parentOperationTable: 'treatment_register',
            sourceType: 'orchestrator_sync',
            actorType: 'orchestrator',
            recordedBy: 'system',
            createdAt: log.created_at,
            updatedAt: log.created_at,
          })),
        ...mechanicalWorks
          .filter(log => log.field_row_id === fieldRowId)
          .map((log): PlantOperation => ({
            id: `work-${log.id}`,
            plantId: fieldRowId,
            gardenId,
            fieldRowId,
            operationType: 'work',
            operationCategory: 'maintenance',
            date: log.work_date,
            operationDate: log.work_date,
            quantity: log.area_m2,
            unit: 'm²',
            productName: log.equipment_type || log.work_type,
            workType: log.work_type,
            weatherConditions: log.weather_conditions || undefined,
            photos: [],
            notes: log.notes,
            parentOperationId: log.id,
            parentOperationTable: 'mechanical_work_register',
            sourceType: 'orchestrator_sync',
            actorType: 'orchestrator',
            recordedBy: 'system',
            createdAt: log.created_at,
            updatedAt: log.created_at,
          })),
      ];

      return operations.sort((a, b) => new Date(b.operationDate || b.date).getTime() - new Date(a.operationDate || a.date).getTime());
    } catch (error) {
      console.error('Error loading field row operations:', error);
      return [];
    }
  }

  async getPlantOperations(plantId: string): Promise<any[]> {
    try {
      const key = 'ortoIndividualPlantOperations';
      const raw = localStorage.getItem(key);
      if (!raw) return [];

      const allOps = JSON.parse(raw);
      return allOps
        .filter((op: any) => op.plantId === plantId)
        .map((op: any) => {
          const parsedNotes = this.parsePlantOperationNotes(op.notes);
          const operationContext = ensurePlantOperationLineageContext({
            gardenId: op.gardenId,
            plantId: op.plantId,
            operationContext:
              op.operationContext ||
              op.context ||
              parsedNotes.metadata?.operationContext ||
              parsedNotes.metadata?.context,
            eventType: 'operation_read',
          });
          const rowScope = extractRowScopeFromOperationContext(operationContext);
          const weatherConditions =
            op.weatherConditions ||
            parsedNotes.metadata?.weatherConditions;
          const geoSnapshot =
            op.geoSnapshot ||
            parsedNotes.metadata?.geoSnapshot;
          const actorType =
            op.actorType ||
            parsedNotes.metadata?.actorType;
          const deviceId =
            op.deviceId ||
            parsedNotes.metadata?.deviceId;

          return {
            ...op,
            notes: parsedNotes.cleanNotes,
            context: operationContext,
            operationContext,
            fieldRowId: rowScope.fieldRowId || op.fieldRowId,
            gardenRowId: rowScope.gardenRowId || op.gardenRowId,
            weatherConditions,
            geoSnapshot,
            actorType,
            deviceId,
          };
        })
        .sort((a: any, b: any) => new Date(b.operationDate || b.date).getTime() - new Date(a.operationDate || a.date).getTime());
    } catch (error) {
      console.error('Error loading plant operations:', error);
      return [];
    }
  }

  async createPlantOperation(operation: any): Promise<any> {
    try {
      const key = 'ortoIndividualPlantOperations';
      const raw = localStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : [];

      const operationDate = operation.date || operation.operationDate || new Date().toISOString().split('T')[0];
      const operationTime = operation.operationTime || undefined;
      const sourceType = operation.sourceType
        || (operation.parentOperationTable === 'iot_sensor' ? 'iot' : undefined)
        || (operation.parentOperationTable === 'manual_orchestrator' ? 'manual' : 'manual');
      const operationContext = ensurePlantOperationLineageContext({
        gardenId: operation.gardenId,
        plantId: operation.plantId,
        fieldRowId: operation.fieldRowId,
        gardenRowId: operation.gardenRowId,
        operationContext: operation.operationContext,
        context: operation.context,
        eventType: 'operation_write',
      });
      const rowScope = extractRowScopeFromOperationContext(operationContext);
      const weatherConditions = operation.weatherConditions || undefined;
      const geoSnapshot = operation.geoSnapshot || undefined;
      const actorType = operation.actorType || undefined;
      const deviceId = operation.deviceId || undefined;
      const metadata = {
        operationContext,
        weatherConditions,
        geoSnapshot,
        actorType,
        deviceId,
        sourceType: operation.sourceType || undefined,
      };
      const hasMetadata = Object.values(metadata).some((value) => value !== undefined && value !== null);
      const notesWithMetadata = this.composePlantOperationNotes(operation.notes, hasMetadata ? metadata : undefined);

      const newOperation = {
        id: operation.id || crypto.randomUUID(),
        plantId: operation.plantId,
        gardenId: operation.gardenId,
        operationType: operation.operationType,
        operationCategory: this.getPlantOperationCategory(operation.operationType),
        date: operationTime ? `${operationDate}T${operationTime}:00` : operationDate,
        operationDate,
        operationTime,
        quantity: operation.quantity !== undefined ? Number(operation.quantity) : undefined,
        unit: operation.unit,
        productName: operation.productName,
        notes: notesWithMetadata,
        context: operationContext,
        operationContext,
        fieldRowId: rowScope.fieldRowId || operation.fieldRowId,
        gardenRowId: rowScope.gardenRowId || operation.gardenRowId,
        weatherConditions,
        geoSnapshot,
        photos: operation.photos || [],
        parentOperationId: operation.parentOperationId || undefined,
        parentOperationTable: operation.parentOperationTable || undefined,
        sourceType,
        actorType,
        deviceId,
        recordedBy: sourceType === 'iot' ? 'iot' : 'user',
        createdAt: operation.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(key, JSON.stringify([newOperation, ...existing]));
      return newOperation;
    } catch (error) {
      console.error('Error creating plant operation:', error);
      throw error;
    }
  }

  private getPlantOperationCategory(operationType: string): 'irrigation' | 'nutrition' | 'protection' | 'maintenance' {
    if (operationType === 'watering') return 'irrigation';
    if (operationType === 'fertilizing') return 'nutrition';
    if (operationType === 'treatment') return 'protection';
    return 'maintenance';
  }

  private composePlantOperationNotes(
    notes?: string | null,
    metadata?: Record<string, any>
  ): string | undefined {
    const base = (notes || '').trim();
    if (!metadata || Object.keys(metadata).length === 0) {
      return base || undefined;
    }

    const marker = `[ORCH_CTX]${JSON.stringify(metadata)}`;
    return base ? `${base}\n${marker}` : marker;
  }

  private parsePlantOperationNotes(notes?: string | null): {
    cleanNotes?: string;
    metadata?: Record<string, any>;
  } {
    const raw = notes || '';
    const marker = '[ORCH_CTX]';
    const markerIndex = raw.lastIndexOf(marker);

    if (markerIndex === -1) {
      return { cleanNotes: raw || undefined, metadata: undefined };
    }

    const rawMetadata = raw.slice(markerIndex + marker.length).trim();
    const cleanNotes = raw.slice(0, markerIndex).trim();

    try {
      return {
        cleanNotes: cleanNotes || undefined,
        metadata: rawMetadata ? JSON.parse(rawMetadata) : undefined,
      };
    } catch (_error) {
      return { cleanNotes: raw || undefined, metadata: undefined };
    }
  }

  async getFieldAlerts(_gardenId: string): Promise<FieldAlert[]> {
    return [];
  }

  async upsertFieldAlerts(_gardenId: string, _alerts: FieldAlert[]): Promise<void> {
    // localStorage non persiste alert calcolati server-side
  }
}
