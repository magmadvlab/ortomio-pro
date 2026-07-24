/**
 * Storage Provider Interface
 * Abstract interface for storage operations (localStorage or Supabase)
 */

import { Garden, GardenTask, SmartDevice, SmartDeviceAutomationLog, SeedPacket, HarvestLogData, PlantPhotoLog, MechanicalWorkRecord, TreatmentRecordDB, FertilizerInventoryItemDB, PhytoInventoryItemDB, CompostLogDB, FertilizerApplicationLogDB, GardenRow, GardenZone, FieldRow, PlantingBatch, PhenologyObservation, QualityResult } from '../../../types';
import { CustomPlan } from '../../../types/customPlan';
import { Agronomist, AgronomistConsultation, AgronomistAdvice } from '../../../types/agronomist';
import { SeedlingBatch } from '../../../services/seedlingService';
import { SaplingBatch } from '../../../services/saplingService';
import { GardenAccessory } from '../../../types/accessories';
import { HydroponicReading, AquaponicReading } from '../../../types/indoorGrowing';
import { GardenBed } from '../../../types/gardenBed';
import { CustomCrop, CropLearningEvent } from '../../../types/customCrop';
import { CropArchetype, CropProfile, CropAlias, ArchetypeId, OfficialCrop } from '../../../types/archetypes';
import { IrrigationSystem, IrrigationZone, IrrigationComponent, WateringLog } from '../../../types/irrigation';
import { HealthAlert } from '../../../types/healthAlert';
import { PrescriptionExecutionRecord, PrescriptionMap, PrescriptionMapExportRecord } from '../../../types/prescriptionMaps';
import type { PlantOperation } from '../../../types/individualPlant';
import type { AgronomicDecisionLedgerEntry } from '../../../services/agronomicDecisionLedgerService';
import type { AgronomicQueueOutcomeRecord } from '../../../services/agronomicQueueOutcomeService';
import type {
  AgronomicOperationOutcomeProjection,
  AgronomicOperationSignalProjection,
  AgronomicPrecisionExecutionProjection,
  OperationalLedgerProjectionFilters,
} from '../../../types/operationalLedger';
import type { FieldAlert } from '../../../types/fieldAlerts';
import type { DiaryEvent, DiaryEventCreate } from '../../../types/diary';
import type { UnifiedAgronomicMemoryEvent } from '../../../types/unifiedAgronomicMemory';

export interface IStorageProvider {
  readonly persistenceKind?: 'local' | 'cloud' | 'server';
  // Canonical durable diary and agronomic memory. Optional for legacy providers;
  // critical writers must fail closed when these capabilities are unavailable.
  getDiaryEvents?(gardenId: string, filters?: { dateFrom?: string; dateTo?: string; type?: DiaryEvent['type']; category?: DiaryEvent['category']; includeVoided?: boolean }): Promise<DiaryEvent[]>;
  createDiaryEvent?(event: DiaryEventCreate): Promise<DiaryEvent>;
  updateDiaryEvent?(id: string, updates: Partial<DiaryEvent>): Promise<DiaryEvent>;
  voidDiaryEvent?(id: string, reason: string): Promise<DiaryEvent>;
  getAgronomicMemoryEvents?(gardenId: string): Promise<UnifiedAgronomicMemoryEvent[]>;
  createAgronomicMemoryEvent?(event: UnifiedAgronomicMemoryEvent): Promise<UnifiedAgronomicMemoryEvent>;

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
  archiveTask?(id: string): Promise<void>;

  // Challenge completions (optional)
  getChallengeCompletions?(userId: string): Promise<Array<{ challenge_id: string }>>;

  // Smart Devices
  getDevices(gardenId?: string): Promise<SmartDevice[]>;
  getDevice(id: string): Promise<SmartDevice | null>;
  createDevice(device: Omit<SmartDevice, 'id' | 'lastUpdate'>): Promise<SmartDevice>;
  updateDevice(id: string, updates: Partial<SmartDevice>): Promise<SmartDevice>;
  deleteDevice(id: string): Promise<void>;
  getSmartDeviceAutomationLogs?(gardenId?: string, deviceId?: string): Promise<SmartDeviceAutomationLog[]>;
  createSmartDeviceAutomationLog?(log: Omit<SmartDeviceAutomationLog, 'id' | 'createdAt'>): Promise<SmartDeviceAutomationLog>;
  getPhenologyObservations?(
    gardenId: string,
    options?: {
      cropContextId?: PhenologyObservation['cropContextId'];
      scopeType?: PhenologyObservation['scopeType'];
      scopeId?: string;
      zoneId?: string;
      fieldRowId?: string;
      treeId?: string;
      plantId?: string;
      limit?: number;
    }
  ): Promise<PhenologyObservation[]>;
  createPhenologyObservation?(
    observation: Omit<PhenologyObservation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PhenologyObservation>;
  getQualityResults?(
    gardenId: string,
    options?: {
      cropContextId?: QualityResult['cropContextId'];
      scopeType?: QualityResult['scopeType'];
      scopeId?: string;
      zoneId?: string;
      fieldRowId?: string;
      treeId?: string;
      plantId?: string;
      harvestLogId?: string;
      lotCode?: string;
      limit?: number;
    }
  ): Promise<QualityResult[]>;
  createQualityResult?(
    result: Omit<QualityResult, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QualityResult>;
  updateQualityResult?(
    id: string,
    updates: Partial<QualityResult>
  ): Promise<QualityResult>;
  getPrescriptionMaps?(gardenId: string): Promise<PrescriptionMap[]>;
  getPrescriptionMap?(id: string): Promise<PrescriptionMap | null>;
  createPrescriptionMap?(
    map: Omit<PrescriptionMap, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PrescriptionMap>;
  updatePrescriptionMap?(id: string, updates: Partial<PrescriptionMap>): Promise<PrescriptionMap>;
  deletePrescriptionMap?(id: string): Promise<void>;
  getPrescriptionExecutionRecords?(
    prescriptionMapId: string,
    options?: {
      prescriptionZoneId?: string;
      executionStatus?: PrescriptionExecutionRecord['executionStatus'];
      limit?: number;
    }
  ): Promise<PrescriptionExecutionRecord[]>;
  createPrescriptionExecutionRecord?(
    record: Omit<PrescriptionExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PrescriptionExecutionRecord>;
  updatePrescriptionExecutionRecord?(
    id: string,
    updates: Partial<PrescriptionExecutionRecord>
  ): Promise<PrescriptionExecutionRecord>;
  getPrescriptionMapExportRecords?(
    prescriptionMapId: string,
    options?: {
      format?: PrescriptionMapExportRecord['format'];
      status?: PrescriptionMapExportRecord['status'];
      limit?: number;
    }
  ): Promise<PrescriptionMapExportRecord[]>;
  createPrescriptionMapExportRecord?(
    record: Omit<PrescriptionMapExportRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PrescriptionMapExportRecord>;
  updatePrescriptionMapExportRecord?(
    id: string,
    updates: Partial<PrescriptionMapExportRecord>
  ): Promise<PrescriptionMapExportRecord>;
  getAgronomicOperationOutcomeProjection?(
    filters?: OperationalLedgerProjectionFilters
  ): Promise<AgronomicOperationOutcomeProjection[]>;
  getAgronomicOperationSignalProjection?(
    filters?: OperationalLedgerProjectionFilters
  ): Promise<AgronomicOperationSignalProjection[]>;
  getAgronomicPrecisionExecutionProjection?(
    filters?: OperationalLedgerProjectionFilters & {
      prescriptionMapId?: string;
      executionStatus?: string;
    }
  ): Promise<AgronomicPrecisionExecutionProjection[]>;

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

  // Sapling Batches
  getSaplingBatches(gardenId?: string): Promise<SaplingBatch[]>;
  getSaplingBatch(id: string): Promise<SaplingBatch | null>;
  createSaplingBatch(batch: Omit<SaplingBatch, 'id'>): Promise<SaplingBatch>;
  updateSaplingBatch(id: string, updates: Partial<SaplingBatch>): Promise<SaplingBatch>;
  deleteSaplingBatch(id: string): Promise<void>;

  // Pro Features (optional - may not be available in Free tier)
  uploadPhoto?(file: File, taskId: string, gardenId: string): Promise<string>; // Returns photo URL
  getPhotoLogs?(taskId: string): Promise<PlantPhotoLog[]>;
  createPhotoLog?(log: Omit<PlantPhotoLog, 'id' | 'createdAt'>): Promise<PlantPhotoLog>;

  // Sync (for cloud providers)
  sync?(): Promise<void>;

  // User Preferences / Small KV Storage (optional)
  getUserPreference?<T = any>(key: string): Promise<T | null>;
  setUserPreference?<T = any>(key: string, value: T): Promise<void>;

  // Canonical operational ledger (cloud providers should persist these in normalized tables)
  getAgronomicDecisionLedgerEntries?(gardenId: string): Promise<AgronomicDecisionLedgerEntry[]>;
  upsertAgronomicDecisionLedgerEntry?(entry: AgronomicDecisionLedgerEntry): Promise<AgronomicDecisionLedgerEntry>;
  getAgronomicQueueOutcomeRecords?(gardenId: string): Promise<AgronomicQueueOutcomeRecord[]>;
  upsertAgronomicQueueOutcomeRecord?(record: AgronomicQueueOutcomeRecord): Promise<AgronomicQueueOutcomeRecord>;

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

  // Garden Rows (Filari)
  getGardenRows(bedId: string): Promise<GardenRow[]>;
  getGardenRow(id: string): Promise<GardenRow | null>;
  createGardenRow(row: Omit<GardenRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenRow>;
  updateGardenRow(id: string, updates: Partial<GardenRow>): Promise<GardenRow>;
  deleteGardenRow(id: string): Promise<void>;

  // Mechanical Work (Pro Feature)
  getMechanicalWorks(gardenId?: string, options?: { dateFrom?: string; dateTo?: string }): Promise<MechanicalWorkRecord[]>;
  getMechanicalWork(id: string): Promise<MechanicalWorkRecord | null>;
  createMechanicalWork(work: Omit<MechanicalWorkRecord, 'id' | 'user_id' | 'created_at'>): Promise<MechanicalWorkRecord>;
  updateMechanicalWork(id: string, updates: Partial<MechanicalWorkRecord>): Promise<MechanicalWorkRecord>;
  deleteMechanicalWork(id: string): Promise<void>;

  // Fertilizer Inventory
  getFertilizerInventory(gardenId: string): Promise<FertilizerInventoryItemDB[]>;
  getFertilizerInventoryItem(id: string): Promise<FertilizerInventoryItemDB | null>;
  createFertilizerInventoryItem(item: Omit<FertilizerInventoryItemDB, 'id' | 'created_at' | 'updated_at'>): Promise<FertilizerInventoryItemDB>;
  updateFertilizerInventoryItem(id: string, updates: Partial<FertilizerInventoryItemDB>): Promise<FertilizerInventoryItemDB>;
  deleteFertilizerInventoryItem(id: string): Promise<void>;

  // Phyto Inventory
  getPhytoInventory(gardenId: string): Promise<PhytoInventoryItemDB[]>;
  getPhytoInventoryItem(id: string): Promise<PhytoInventoryItemDB | null>;
  createPhytoInventoryItem(item: Omit<PhytoInventoryItemDB, 'id' | 'created_at' | 'updated_at'>): Promise<PhytoInventoryItemDB>;
  updatePhytoInventoryItem(id: string, updates: Partial<PhytoInventoryItemDB>): Promise<PhytoInventoryItemDB>;
  deletePhytoInventoryItem(id: string): Promise<void>;

  // Compost Logs
  getCompostLogs(gardenId: string): Promise<CompostLogDB[]>;
  getCompostLog(id: string): Promise<CompostLogDB | null>;
  createCompostLog(log: Omit<CompostLogDB, 'id' | 'created_at' | 'updated_at'>): Promise<CompostLogDB>;
  updateCompostLog(id: string, updates: Partial<CompostLogDB>): Promise<CompostLogDB>;
  deleteCompostLog(id: string): Promise<void>;

  // Fertilizer Application Logs
  getFertilizerApplicationLogs(gardenId: string, options?: { taskId?: string; bedId?: string; from?: string; to?: string }): Promise<FertilizerApplicationLogDB[]>;
  getFertilizerApplicationLog(id: string): Promise<FertilizerApplicationLogDB | null>;
  createFertilizerApplicationLog(log: Omit<FertilizerApplicationLogDB, 'id' | 'createdAt'>): Promise<FertilizerApplicationLogDB>;
  updateFertilizerApplicationLog(id: string, updates: Partial<FertilizerApplicationLogDB>): Promise<FertilizerApplicationLogDB>;
  deleteFertilizerApplicationLog(id: string): Promise<void>;

  // Treatments (Pro Feature)
  getTreatments(gardenId?: string, options?: { dateFrom?: string; dateTo?: string }): Promise<TreatmentRecordDB[]>;
  getTreatment(id: string): Promise<TreatmentRecordDB | null>;
  createTreatment(treatment: Omit<TreatmentRecordDB, 'id' | 'user_id' | 'created_at'>): Promise<TreatmentRecordDB>;
  updateTreatment(id: string, updates: Partial<TreatmentRecordDB>): Promise<TreatmentRecordDB>;
  deleteTreatment(id: string): Promise<void>;

  // Custom Crops (Pro Feature)
  getCustomCrops(gardenId?: string): Promise<CustomCrop[]>;
  getCustomCrop(id: string): Promise<CustomCrop | null>;
  createCustomCrop(crop: Omit<CustomCrop, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CustomCrop>;
  updateCustomCrop(id: string, updates: Partial<CustomCrop>): Promise<CustomCrop>;
  deleteCustomCrop(id: string): Promise<void>;

  // Learning Events (Pro Feature)
  recordLearningEvent(event: Omit<CropLearningEvent, 'id' | 'created_at'>): Promise<CropLearningEvent>;
  getLearningEvents(cropId: string): Promise<CropLearningEvent[]>;

  // Archetype System
  getArchetypes(): Promise<CropArchetype[]>;
  getArchetype(id: ArchetypeId): Promise<CropArchetype | null>;
  getProfile(archetypeId: ArchetypeId): Promise<CropProfile | null>;

  // Crop Aliases
  searchAlias(query: string, region?: string, province?: string): Promise<CropAlias | null>;
  createAlias(alias: Omit<CropAlias, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<CropAlias>;
  updateAlias(aliasId: string, updates: Partial<CropAlias>): Promise<CropAlias>;
  updateAliasConfidence(aliasId: string, confidence: number): Promise<void>;
  getAlias(aliasId: string): Promise<CropAlias | null>;
  getAliasesByArchetype(archetypeId: ArchetypeId): Promise<CropAlias[]>;
  getAllAliases(): Promise<CropAlias[]>;

  // Official Crops
  getOfficialCrop(name: string): Promise<OfficialCrop | null>;
  searchOfficialCrops(query: string): Promise<OfficialCrop[]>;

  // Irrigation Systems
  getIrrigationSystems(gardenId: string): Promise<IrrigationSystem[]>;
  getIrrigationSystem(id: string): Promise<IrrigationSystem | null>;
  createIrrigationSystem(system: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationSystem>;
  updateIrrigationSystem(id: string, updates: Partial<IrrigationSystem>): Promise<IrrigationSystem>;
  deleteIrrigationSystem(id: string): Promise<void>;

  // Irrigation Zones
  getIrrigationZones(systemId: string): Promise<IrrigationZone[]>;
  getIrrigationZones(systemId?: string, gardenId?: string): Promise<IrrigationZone[]>;
  getIrrigationZone(id: string): Promise<IrrigationZone | null>;
  createIrrigationZone(zone: Omit<IrrigationZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationZone>;
  updateIrrigationZone(id: string, updates: Partial<IrrigationZone>): Promise<IrrigationZone>;
  deleteIrrigationZone(id: string): Promise<void>;

  // Irrigation Components (Pro Feature)
  getIrrigationComponents(zoneId: string): Promise<IrrigationComponent[]>;
  getIrrigationComponent(id: string): Promise<IrrigationComponent | null>;
  createIrrigationComponent(component: Omit<IrrigationComponent, 'id' | 'createdAt'>): Promise<IrrigationComponent>;
  updateIrrigationComponent(id: string, updates: Partial<IrrigationComponent>): Promise<IrrigationComponent>;
  deleteIrrigationComponent(id: string): Promise<void>;

  // Watering Logs
  getWateringLogs(zoneId: string, startDate?: string, endDate?: string): Promise<WateringLog[]>;
  getWateringLogs(zoneId?: string, gardenId?: string, dateRange?: { from: string; to: string }): Promise<WateringLog[]>;
  getWateringLog(id: string): Promise<WateringLog | null>;
  logWatering(log: Omit<WateringLog, 'id' | 'createdAt'>): Promise<WateringLog>;
  createWateringLog(log: Omit<WateringLog, 'id' | 'createdAt'>): Promise<WateringLog>;
  updateWateringLog(id: string, updates: Partial<WateringLog>): Promise<WateringLog>;
  deleteWateringLog(id: string): Promise<void>;

  // Garden Zones (Advanced Multi-Zone Management)
  getGardenZones(gardenId: string): Promise<GardenZone[]>;
  getGardenZone(id: string): Promise<GardenZone | null>;
  createGardenZone(zone: Omit<GardenZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenZone>;
  updateGardenZone(id: string, updates: Partial<GardenZone>): Promise<GardenZone>;
  deleteGardenZone(id: string): Promise<void>;

  // Field Rows (Open Field Rows)
  getFieldRows(gardenId?: string, zoneId?: string): Promise<FieldRow[]>;
  getFieldRow(id: string): Promise<FieldRow | null>;
  createFieldRow(row: Omit<FieldRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<FieldRow>;
  updateFieldRow(id: string, updates: Partial<FieldRow>): Promise<FieldRow>;
  deleteFieldRow(id: string): Promise<void>;

  // Planting Batches (Scalar Planting Tracking)
  getPlantingBatches(gardenId?: string, fieldRowId?: string): Promise<PlantingBatch[]>;
  getPlantingBatch(id: string): Promise<PlantingBatch | null>;
  createPlantingBatch(batch: Omit<PlantingBatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlantingBatch>;
  updatePlantingBatch(id: string, updates: Partial<PlantingBatch>): Promise<PlantingBatch>;
  deletePlantingBatch(id: string): Promise<void>;

  // Health Alerts (Salute Proattiva)
  getHealthAlerts(gardenId?: string): Promise<HealthAlert[]>;
  getHealthAlert(id: string): Promise<HealthAlert | null>;
  createHealthAlert(alert: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthAlert>;
  updateHealthAlert(id: string, updates: Partial<HealthAlert>): Promise<HealthAlert>;
  deleteHealthAlert(id: string): Promise<void>;

  // Individual Plants (Plant Tracking)
  getIndividualPlants?(gardenId: string): Promise<import('../../../types/individualPlant').GardenPlant[]>;
  getIndividualPlant?(id: string): Promise<import('../../../types/individualPlant').GardenPlant | null>;
  createIndividualPlant?(plant: Omit<import('../../../types/individualPlant').GardenPlant, 'id' | 'createdAt' | 'updatedAt'>): Promise<import('../../../types/individualPlant').GardenPlant>;
  updateIndividualPlant?(id: string, updates: Partial<import('../../../types/individualPlant').GardenPlant>): Promise<import('../../../types/individualPlant').GardenPlant>;
  deleteIndividualPlant?(id: string): Promise<void>;

  // Individual Plant Operations
  getPlantOperations?(plantId: string): Promise<any[]>;
  getFieldRowOperations?(fieldRowId: string, gardenId: string): Promise<PlantOperation[]>;
  createPlantOperation?(operation: any): Promise<any>;

  // Individual Plant Harvests
  getPlantHarvests?(plantId: string): Promise<import('../../../types/individualPlant').PlantHarvest[]>;
  createPlantHarvest?(harvest: Omit<import('../../../types/individualPlant').PlantHarvest, 'id' | 'createdAt'>): Promise<import('../../../types/individualPlant').PlantHarvest>;
  updatePlantHarvest?(id: string, updates: Partial<import('../../../types/individualPlant').PlantHarvest>): Promise<import('../../../types/individualPlant').PlantHarvest>;
  deletePlantHarvest?(id: string): Promise<void>;

  // Greenhouse Benches (Bancali Serra)
  getGreenhouseBenches?(gardenId: string): Promise<import('../../../types/greenhouseBench').GreenhouseBench[]>;
  getGreenhouseBench?(id: string): Promise<import('../../../types/greenhouseBench').GreenhouseBench | null>;
  createGreenhouseBench?(bench: Omit<import('../../../types/greenhouseBench').GreenhouseBench, 'id' | 'createdAt' | 'updatedAt'>): Promise<import('../../../types/greenhouseBench').GreenhouseBench>;
  updateGreenhouseBench?(id: string, updates: Partial<import('../../../types/greenhouseBench').GreenhouseBench>): Promise<import('../../../types/greenhouseBench').GreenhouseBench>;
  deleteGreenhouseBench?(id: string): Promise<void>;

  // Greenhouse Readings (Letture Parametri Serra)
  getGreenhouseReadings?(gardenId: string, limit?: number): Promise<import('../../../types/greenhouseReading').GreenhouseReading[]>;
  getGreenhouseReading?(id: string): Promise<import('../../../types/greenhouseReading').GreenhouseReading | null>;
  createGreenhouseReading?(reading: Omit<import('../../../types/greenhouseReading').GreenhouseReading, 'id' | 'createdAt' | 'updatedAt'>): Promise<import('../../../types/greenhouseReading').GreenhouseReading>;
  updateGreenhouseReading?(id: string, updates: Partial<import('../../../types/greenhouseReading').GreenhouseReading>): Promise<import('../../../types/greenhouseReading').GreenhouseReading>;
  deleteGreenhouseReading?(id: string): Promise<void>;

  // Controlled Environment Ledgers
  getControlledEnvironmentExecutions?(gardenId: string): Promise<import('../../../types/controlledEnvironment').ControlledEnvironmentExecution[]>;
  createControlledEnvironmentExecution?(execution: Omit<import('../../../types/controlledEnvironment').ControlledEnvironmentExecution, 'id' | 'createdAt'>): Promise<import('../../../types/controlledEnvironment').ControlledEnvironmentExecution>;
  getControlledEnvironmentObservations?(gardenId: string): Promise<import('../../../types/controlledEnvironment').ControlledEnvironmentObservation[]>;
  createControlledEnvironmentObservation?(observation: Omit<import('../../../types/controlledEnvironment').ControlledEnvironmentObservation, 'id' | 'createdAt'>): Promise<import('../../../types/controlledEnvironment').ControlledEnvironmentObservation>;
  getControlledEnvironmentOutcomes?(gardenId: string): Promise<import('../../../types/controlledEnvironment').ControlledEnvironmentOutcome[]>;
  createControlledEnvironmentOutcome?(outcome: Omit<import('../../../types/controlledEnvironment').ControlledEnvironmentOutcome, 'id' | 'createdAt'>): Promise<import('../../../types/controlledEnvironment').ControlledEnvironmentOutcome>;

  // Check if provider is available
  isAvailable(): boolean;

  // Field Alerts (Farm Command Center)
  getFieldAlerts(gardenId: string): Promise<FieldAlert[]>;
  upsertFieldAlerts(gardenId: string, alerts: FieldAlert[]): Promise<void>;
}
