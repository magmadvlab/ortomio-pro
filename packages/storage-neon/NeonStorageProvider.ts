/**
 * Neon PostgreSQL Storage Provider
 * Implements IStorageProvider using direct SQL via @neondatabase/serverless.
 * Server-side only — never import on the client.
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { IStorageProvider } from '../core/storage/interface';
import type {
  Garden,
  GardenTask,
  SmartDevice,
  SmartDeviceAutomationLog,
  SeedPacket,
  HarvestLogData,
  PlantPhotoLog,
  MechanicalWorkRecord,
  TreatmentRecordDB,
  FertilizerInventoryItemDB,
  PhytoInventoryItemDB,
  CompostLogDB,
  FertilizerApplicationLogDB,
  GardenRow,
  GardenZone,
  FieldRow,
  PlantingBatch,
  PhenologyObservation,
  QualityResult,
} from '@/types';
import type { CustomCrop, CropLearningEvent } from '@/types/customCrop';
import type { CustomPlan } from '@/types/customPlan';
import type { Agronomist, AgronomistConsultation, AgronomistAdvice } from '@/types/agronomist';
import type { GardenAccessory } from '@/types/accessories';
import type { HydroponicReading, AquaponicReading } from '@/types/indoorGrowing';
import type { GardenBed } from '@/types/gardenBed';
import type { SeedlingBatch } from '@/services/seedlingService';
import type { SaplingBatch } from '@/services/saplingService';
import type { CropArchetype, CropProfile, CropAlias, ArchetypeId, OfficialCrop } from '@/types/archetypes';
import type { IrrigationSystem, IrrigationZone, IrrigationComponent, WateringLog } from '@/types/irrigation';
import type { HealthAlert } from '@/types/healthAlert';
import type { PrescriptionExecutionRecord, PrescriptionMap, PrescriptionMapExportRecord } from '@/types/prescriptionMaps';
import type { PlantOperation, GardenPlant } from '@/types/individualPlant';
import type { AgronomicDecisionLedgerEntry } from '@/services/agronomicDecisionLedgerService';
import type { AgronomicQueueOutcomeRecord } from '@/services/agronomicQueueOutcomeService';
import type { FieldAlert } from '@/types/fieldAlerts';

export class NeonStorageProvider implements IStorageProvider {
  readonly persistenceKind = 'server' as const;
  private sql: NeonQueryFunction<false, false>;

  constructor(connectionString?: string) {
    const url = connectionString ?? process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not configured');
    this.sql = neon(url);
  }

  isAvailable(): boolean {
    return !!process.env.DATABASE_URL;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private mapGardenFromDB(db: any): Garden {
    return {
      id: db.id,
      name: db.name,
      coordinates: db.coordinates ?? undefined,
      sizeSqMeters: Number(db.size_sq_meters ?? 0),
      sizeUnit: db.size_unit,
      soilType: db.soil_type,
      soilPh: db.soil_ph ? Number(db.soil_ph) : undefined,
      primaryCrop: undefined,
      altitudeMeters: db.altitude_meters,
      delayFactorDays: db.delay_factor_days,
      sunExposure: db.sun_exposure,
      dailySunHours: db.daily_sun_hours,
      aspectDirection: db.aspect_direction,
      windProtection: db.wind_protection,
      hasCompostBin: db.has_compost_bin,
      isRaisedBed: db.is_raised_bed,
      gardenType: db.garden_type,
      greenhouseConfig: db.greenhouse_config,
      indoorConfig: db.indoor_config,
      hydroponicConfig: db.hydroponic_config,
      aquaponicConfig: db.aquaponic_config,
      aeroponicConfig: db.aeroponic_config,
      structureConfig: db.structure_config ?? undefined,
      vacationMode: db.vacation_mode,
      orchardConfig: db.orchard_config ?? undefined,
      oliveGroveConfig: db.olive_grove_config ?? undefined,
      vineyardConfig: db.vineyard_config ?? undefined,
      createdAt: db.created_at,
    };
  }

  private mapGardenZoneFromDB(db: any): GardenZone {
    return {
      id: db.id,
      gardenId: db.garden_id,
      name: db.name,
      description: db.description ?? undefined,
      area: db.area_sqm ? Number(db.area_sqm) : (db.size_sq_meters ? Number(db.size_sq_meters) : undefined),
      soilType: db.soil_type ?? undefined,
      sunExposure: db.sun_exposure ?? undefined,
      color: db.color ?? undefined,
    };
  }

  private mapPlantFromDB(db: any): GardenPlant {
    return {
      id: db.id,
      gardenId: db.garden_id,
      fieldRowId: db.field_row_id ?? undefined,
      fieldRowName: db.field_row_name ?? undefined,
      gardenRowId: db.garden_row_id ?? undefined,
      greenhouseBenchId: db.greenhouse_bench_id ?? undefined,
      benchRowNumber: db.bench_row_number ?? undefined,
      positionInBenchRow: db.position_in_bench_row ?? undefined,
      benchName: db.bench_name ?? undefined,
      positionInRow: db.position_in_row ?? undefined,
      plantCode: db.plant_code,
      plantName: db.plant_name,
      variety: db.variety ?? undefined,
      plantingDate: db.planting_date,
      transplantDate: db.transplant_date ?? undefined,
      sourceVivaio: db.source_vivaio ?? undefined,
      status: db.status,
      healthScore: db.health_score,
      stage: db.stage ?? undefined,
      greenhouseConditions: db.greenhouse_conditions ?? undefined,
      photos: db.photos ?? [],
      operations: db.operations ?? [],
      orchestratorEnabled: db.orchestrator_enabled ?? false,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    };
  }

  private mapFieldAlertFromDB(db: any): FieldAlert {
    return {
      id: db.id,
      gardenId: db.garden_id,
      category: db.category,
      severity: db.severity,
      message: db.message,
      computedAt: db.computed_at,
      expiresAt: db.expires_at,
      meta: db.meta ?? undefined,
    };
  }

  private notImplemented(method: string): never {
    throw new Error(`NeonStorageProvider.${method} not yet implemented`);
  }

  // ─── Gardens ──────────────────────────────────────────────────────────────

  async getGardens(): Promise<Garden[]> {
    const rows = await this.sql`SELECT * FROM gardens ORDER BY created_at DESC`;
    return rows.map(r => this.mapGardenFromDB(r));
  }

  async getGarden(id: string): Promise<Garden | null> {
    const rows = await this.sql`SELECT * FROM gardens WHERE id = ${id}`;
    return rows[0] ? this.mapGardenFromDB(rows[0]) : null;
  }

  async createGarden(garden: Omit<Garden, 'id' | 'createdAt'>): Promise<Garden> {
    const rows = await this.sql`
      INSERT INTO gardens (name, coordinates, size_sq_meters, size_unit, soil_type, soil_ph,
        altitude_meters, delay_factor_days, sun_exposure, daily_sun_hours, aspect_direction,
        wind_protection, has_compost_bin, is_raised_bed, garden_type,
        greenhouse_config, indoor_config, hydroponic_config, aquaponic_config, aeroponic_config,
        vacation_mode, orchard_config, olive_grove_config, vineyard_config)
      VALUES (
        ${garden.name},
        ${garden.coordinates ? JSON.stringify(garden.coordinates) : null},
        ${garden.sizeSqMeters ?? 0},
        ${garden.sizeUnit ?? null},
        ${garden.soilType ?? null},
        ${garden.soilPh ?? null},
        ${garden.altitudeMeters ?? null},
        ${garden.delayFactorDays ?? null},
        ${garden.sunExposure ?? null},
        ${garden.dailySunHours ?? null},
        ${garden.aspectDirection ?? null},
        ${garden.windProtection ?? null},
        ${garden.hasCompostBin ?? false},
        ${garden.isRaisedBed ?? false},
        ${garden.gardenType ?? null},
        ${garden.greenhouseConfig ? JSON.stringify(garden.greenhouseConfig) : null},
        ${garden.indoorConfig ? JSON.stringify(garden.indoorConfig) : null},
        ${garden.hydroponicConfig ? JSON.stringify(garden.hydroponicConfig) : null},
        ${garden.aquaponicConfig ? JSON.stringify(garden.aquaponicConfig) : null},
        ${garden.aeroponicConfig ? JSON.stringify(garden.aeroponicConfig) : null},
        ${garden.vacationMode ?? null},
        ${garden.orchardConfig ? JSON.stringify(garden.orchardConfig) : null},
        ${garden.oliveGroveConfig ? JSON.stringify(garden.oliveGroveConfig) : null},
        ${garden.vineyardConfig ? JSON.stringify(garden.vineyardConfig) : null}
      )
      RETURNING *`;
    return this.mapGardenFromDB(rows[0]);
  }

  async updateGarden(id: string, updates: Partial<Garden>): Promise<Garden> {
    const rows = await this.sql`
      UPDATE gardens SET
        name             = COALESCE(${updates.name ?? null}, name),
        size_sq_meters   = COALESCE(${updates.sizeSqMeters ?? null}, size_sq_meters),
        size_unit        = COALESCE(${updates.sizeUnit ?? null}, size_unit),
        soil_type        = COALESCE(${updates.soilType ?? null}, soil_type),
        soil_ph          = COALESCE(${updates.soilPh ?? null}, soil_ph),
        altitude_meters  = COALESCE(${updates.altitudeMeters ?? null}, altitude_meters),
        sun_exposure     = COALESCE(${updates.sunExposure ?? null}, sun_exposure),
        garden_type      = COALESCE(${updates.gardenType ?? null}, garden_type),
        vacation_mode    = COALESCE(${updates.vacationMode ?? null}, vacation_mode)
      WHERE id = ${id}
      RETURNING *`;
    return this.mapGardenFromDB(rows[0]);
  }

  async deleteGarden(id: string): Promise<void> {
    await this.sql`DELETE FROM gardens WHERE id = ${id}`;
  }

  // ─── Garden Zones ─────────────────────────────────────────────────────────

  async getGardenZones(gardenId: string): Promise<GardenZone[]> {
    const rows = await this.sql`
      SELECT * FROM garden_zones WHERE garden_id = ${gardenId} ORDER BY order_index, created_at`;
    return rows.map(r => this.mapGardenZoneFromDB(r));
  }

  async getGardenZone(id: string): Promise<GardenZone | null> {
    const rows = await this.sql`SELECT * FROM garden_zones WHERE id = ${id}`;
    return rows[0] ? this.mapGardenZoneFromDB(rows[0]) : null;
  }

  async createGardenZone(zone: Omit<GardenZone, 'id'>): Promise<GardenZone> {
    const rows = await this.sql`
      INSERT INTO garden_zones (garden_id, name, description, soil_type, sun_exposure, color)
      VALUES (
        ${zone.gardenId}, ${zone.name}, ${zone.description ?? null},
        ${zone.soilType ?? null}, ${zone.sunExposure ?? null}, ${zone.color ?? null}
      )
      RETURNING *`;
    return this.mapGardenZoneFromDB(rows[0]);
  }

  async updateGardenZone(id: string, updates: Partial<GardenZone>): Promise<GardenZone> {
    const rows = await this.sql`
      UPDATE garden_zones SET
        name        = COALESCE(${updates.name ?? null}, name),
        description = COALESCE(${updates.description ?? null}, description),
        soil_type   = COALESCE(${updates.soilType ?? null}, soil_type),
        sun_exposure= COALESCE(${updates.sunExposure ?? null}, sun_exposure),
        color       = COALESCE(${updates.color ?? null}, color),
        updated_at  = NOW()
      WHERE id = ${id}
      RETURNING *`;
    return this.mapGardenZoneFromDB(rows[0]);
  }

  async deleteGardenZone(id: string): Promise<void> {
    await this.sql`DELETE FROM garden_zones WHERE id = ${id}`;
  }

  // ─── Individual Plants ────────────────────────────────────────────────────

  async getIndividualPlants(gardenId: string): Promise<GardenPlant[]> {
    const rows = await this.sql`
      SELECT * FROM individual_plants WHERE garden_id = ${gardenId} ORDER BY created_at DESC`;
    return rows.map(r => this.mapPlantFromDB(r));
  }

  async getIndividualPlant(id: string): Promise<GardenPlant | null> {
    const rows = await this.sql`SELECT * FROM individual_plants WHERE id = ${id}`;
    return rows[0] ? this.mapPlantFromDB(rows[0]) : null;
  }

  async createIndividualPlant(plant: Omit<GardenPlant, 'id' | 'createdAt' | 'updatedAt'>): Promise<GardenPlant> {
    const rows = await this.sql`
      INSERT INTO garden_plants
        (garden_id, plant_code, plant_name, variety, planting_date,
         status, health_score, field_row_id, garden_row_id, position_in_row, photos)
      VALUES (
        ${plant.gardenId}, ${plant.plantCode}, ${plant.plantName},
        ${plant.variety ?? null}, ${plant.plantingDate ?? null},
        ${plant.status ?? 'healthy'}, ${plant.healthScore ?? 100},
        ${plant.fieldRowId ?? null}, ${plant.gardenRowId ?? null},
        ${plant.positionInRow ?? 0},
        ${plant.photos?.length ? JSON.stringify(plant.photos) : null}
      )
      RETURNING *`;
    return this.mapPlantFromDB(rows[0]);
  }

  async updateIndividualPlant(id: string, updates: Partial<GardenPlant>): Promise<GardenPlant> {
    const rows = await this.sql`
      UPDATE garden_plants SET
        plant_name   = COALESCE(${updates.plantName ?? null}, plant_name),
        variety      = COALESCE(${updates.variety ?? null}, variety),
        status       = COALESCE(${updates.status ?? null}, status),
        health_score = COALESCE(${updates.healthScore ?? null}, health_score),
        updated_at   = NOW()
      WHERE id = ${id}
      RETURNING *`;
    return this.mapPlantFromDB(rows[0]);
  }

  async deleteIndividualPlant(id: string): Promise<void> {
    await this.sql`DELETE FROM garden_plants WHERE id = ${id}`;
  }

  // ─── Field Alerts ─────────────────────────────────────────────────────────

  async getFieldAlerts(gardenId: string): Promise<FieldAlert[]> {
    const rows = await this.sql`
      SELECT * FROM field_alerts
      WHERE garden_id = ${gardenId} AND expires_at > NOW()
      ORDER BY computed_at DESC`;
    return rows.map(r => this.mapFieldAlertFromDB(r));
  }

  async upsertFieldAlerts(gardenId: string, alerts: FieldAlert[]): Promise<void> {
    if (!alerts.length) return;
    for (const alert of alerts) {
      await this.sql`
        INSERT INTO field_alerts
          (garden_id, category, severity, message, computed_at, expires_at, meta)
        VALUES (
          ${gardenId}, ${alert.category}, ${alert.severity}, ${alert.message},
          ${alert.computedAt}, ${alert.expiresAt},
          ${alert.meta ? JSON.stringify(alert.meta) : null}
        )
        ON CONFLICT DO NOTHING`;
    }
  }

  // ─── Stubs ────────────────────────────────────────────────────────────────

  async getTasks(): Promise<GardenTask[]> { return []; }
  async getTask(): Promise<GardenTask | null> { return null; }
  async createTask(): Promise<GardenTask> { return this.notImplemented('createTask'); }
  async updateTask(): Promise<GardenTask> { return this.notImplemented('updateTask'); }
  async deleteTask(): Promise<void> { return this.notImplemented('deleteTask'); }

  async getDevices(): Promise<SmartDevice[]> { return []; }
  async getDevice(): Promise<SmartDevice | null> { return null; }
  async createDevice(): Promise<SmartDevice> { return this.notImplemented('createDevice'); }
  async updateDevice(): Promise<SmartDevice> { return this.notImplemented('updateDevice'); }
  async deleteDevice(): Promise<void> { return this.notImplemented('deleteDevice'); }

  async getSeedPackets(): Promise<SeedPacket[]> { return []; }
  async getSeedPacket(): Promise<SeedPacket | null> { return null; }
  async createSeedPacket(): Promise<SeedPacket> { return this.notImplemented('createSeedPacket'); }
  async updateSeedPacket(): Promise<SeedPacket> { return this.notImplemented('updateSeedPacket'); }
  async deleteSeedPacket(): Promise<void> { return this.notImplemented('deleteSeedPacket'); }

  async getHarvestLogs(): Promise<HarvestLogData[]> { return []; }
  async createHarvestLog(): Promise<HarvestLogData> { return this.notImplemented('createHarvestLog'); }
  async updateHarvestLog(): Promise<HarvestLogData> { return this.notImplemented('updateHarvestLog'); }
  async deleteHarvestLog(): Promise<void> { return this.notImplemented('deleteHarvestLog'); }

  async getSeedlingBatches(): Promise<SeedlingBatch[]> { return []; }
  async getSeedlingBatch(): Promise<SeedlingBatch | null> { return null; }
  async createSeedlingBatch(): Promise<SeedlingBatch> { return this.notImplemented('createSeedlingBatch'); }
  async updateSeedlingBatch(): Promise<SeedlingBatch> { return this.notImplemented('updateSeedlingBatch'); }
  async deleteSeedlingBatch(): Promise<void> { return this.notImplemented('deleteSeedlingBatch'); }

  async getSaplingBatches(): Promise<SaplingBatch[]> { return []; }
  async getSaplingBatch(): Promise<SaplingBatch | null> { return null; }
  async createSaplingBatch(): Promise<SaplingBatch> { return this.notImplemented('createSaplingBatch'); }
  async updateSaplingBatch(): Promise<SaplingBatch> { return this.notImplemented('updateSaplingBatch'); }
  async deleteSaplingBatch(): Promise<void> { return this.notImplemented('deleteSaplingBatch'); }

  async getGardenBeds(): Promise<GardenBed[]> { return []; }
  async getGardenBed(): Promise<GardenBed | null> { return null; }
  async createGardenBed(): Promise<GardenBed> { return this.notImplemented('createGardenBed'); }
  async updateGardenBed(): Promise<GardenBed> { return this.notImplemented('updateGardenBed'); }
  async deleteGardenBed(): Promise<void> { return this.notImplemented('deleteGardenBed'); }

  async getGardenRows(): Promise<GardenRow[]> { return []; }
  async getGardenRow(): Promise<GardenRow | null> { return null; }
  async createGardenRow(): Promise<GardenRow> { return this.notImplemented('createGardenRow'); }
  async updateGardenRow(): Promise<GardenRow> { return this.notImplemented('updateGardenRow'); }
  async deleteGardenRow(): Promise<void> { return this.notImplemented('deleteGardenRow'); }

  async getMechanicalWorks(): Promise<MechanicalWorkRecord[]> { return []; }
  async getMechanicalWork(): Promise<MechanicalWorkRecord | null> { return null; }
  async createMechanicalWork(): Promise<MechanicalWorkRecord> { return this.notImplemented('createMechanicalWork'); }
  async updateMechanicalWork(): Promise<MechanicalWorkRecord> { return this.notImplemented('updateMechanicalWork'); }
  async deleteMechanicalWork(): Promise<void> { return this.notImplemented('deleteMechanicalWork'); }

  async getFertilizerInventory(): Promise<FertilizerInventoryItemDB[]> { return []; }
  async getFertilizerInventoryItem(): Promise<FertilizerInventoryItemDB | null> { return null; }
  async createFertilizerInventoryItem(): Promise<FertilizerInventoryItemDB> { return this.notImplemented('createFertilizerInventoryItem'); }
  async updateFertilizerInventoryItem(): Promise<FertilizerInventoryItemDB> { return this.notImplemented('updateFertilizerInventoryItem'); }
  async deleteFertilizerInventoryItem(): Promise<void> { return this.notImplemented('deleteFertilizerInventoryItem'); }

  async getPhytoInventory(): Promise<PhytoInventoryItemDB[]> { return []; }
  async getPhytoInventoryItem(): Promise<PhytoInventoryItemDB | null> { return null; }
  async createPhytoInventoryItem(): Promise<PhytoInventoryItemDB> { return this.notImplemented('createPhytoInventoryItem'); }
  async updatePhytoInventoryItem(): Promise<PhytoInventoryItemDB> { return this.notImplemented('updatePhytoInventoryItem'); }
  async deletePhytoInventoryItem(): Promise<void> { return this.notImplemented('deletePhytoInventoryItem'); }

  async getCompostLogs(): Promise<CompostLogDB[]> { return []; }
  async getCompostLog(): Promise<CompostLogDB | null> { return null; }
  async createCompostLog(): Promise<CompostLogDB> { return this.notImplemented('createCompostLog'); }
  async updateCompostLog(): Promise<CompostLogDB> { return this.notImplemented('updateCompostLog'); }
  async deleteCompostLog(): Promise<void> { return this.notImplemented('deleteCompostLog'); }

  async getFertilizerApplicationLogs(): Promise<FertilizerApplicationLogDB[]> { return []; }
  async getFertilizerApplicationLog(): Promise<FertilizerApplicationLogDB | null> { return null; }
  async createFertilizerApplicationLog(): Promise<FertilizerApplicationLogDB> { return this.notImplemented('createFertilizerApplicationLog'); }
  async updateFertilizerApplicationLog(): Promise<FertilizerApplicationLogDB> { return this.notImplemented('updateFertilizerApplicationLog'); }
  async deleteFertilizerApplicationLog(): Promise<void> { return this.notImplemented('deleteFertilizerApplicationLog'); }

  async getTreatments(): Promise<TreatmentRecordDB[]> { return []; }
  async getTreatment(): Promise<TreatmentRecordDB | null> { return null; }
  async createTreatment(): Promise<TreatmentRecordDB> { return this.notImplemented('createTreatment'); }
  async updateTreatment(): Promise<TreatmentRecordDB> { return this.notImplemented('updateTreatment'); }
  async deleteTreatment(): Promise<void> { return this.notImplemented('deleteTreatment'); }

  async getCustomCrops(): Promise<CustomCrop[]> { return []; }
  async getCustomCrop(): Promise<CustomCrop | null> { return null; }
  async createCustomCrop(): Promise<CustomCrop> { return this.notImplemented('createCustomCrop'); }
  async updateCustomCrop(): Promise<CustomCrop> { return this.notImplemented('updateCustomCrop'); }
  async deleteCustomCrop(): Promise<void> { return this.notImplemented('deleteCustomCrop'); }

  async recordLearningEvent(): Promise<CropLearningEvent> { return this.notImplemented('recordLearningEvent'); }
  async getLearningEvents(): Promise<CropLearningEvent[]> { return []; }

  async getArchetypes(): Promise<CropArchetype[]> { return []; }
  async getArchetype(): Promise<CropArchetype | null> { return null; }
  async getProfile(): Promise<CropProfile | null> { return null; }

  async searchAlias(): Promise<CropAlias | null> { return null; }
  async createAlias(): Promise<CropAlias> { return this.notImplemented('createAlias'); }
  async updateAlias(): Promise<CropAlias> { return this.notImplemented('updateAlias'); }
  async updateAliasConfidence(): Promise<void> { return this.notImplemented('updateAliasConfidence'); }
  async getAlias(): Promise<CropAlias | null> { return null; }
  async getAliasesByArchetype(): Promise<CropAlias[]> { return []; }
  async getAllAliases(): Promise<CropAlias[]> { return []; }

  async getOfficialCrop(): Promise<OfficialCrop | null> { return null; }
  async searchOfficialCrops(): Promise<OfficialCrop[]> { return []; }

  async getIrrigationSystems(): Promise<IrrigationSystem[]> { return []; }
  async getIrrigationSystem(): Promise<IrrigationSystem | null> { return null; }
  async createIrrigationSystem(): Promise<IrrigationSystem> { return this.notImplemented('createIrrigationSystem'); }
  async updateIrrigationSystem(): Promise<IrrigationSystem> { return this.notImplemented('updateIrrigationSystem'); }
  async deleteIrrigationSystem(): Promise<void> { return this.notImplemented('deleteIrrigationSystem'); }

  async getIrrigationZones(): Promise<IrrigationZone[]> { return []; }
  async getIrrigationZone(): Promise<IrrigationZone | null> { return null; }
  async createIrrigationZone(): Promise<IrrigationZone> { return this.notImplemented('createIrrigationZone'); }
  async updateIrrigationZone(): Promise<IrrigationZone> { return this.notImplemented('updateIrrigationZone'); }
  async deleteIrrigationZone(): Promise<void> { return this.notImplemented('deleteIrrigationZone'); }

  async getIrrigationComponents(): Promise<IrrigationComponent[]> { return []; }
  async getIrrigationComponent(): Promise<IrrigationComponent | null> { return null; }
  async createIrrigationComponent(): Promise<IrrigationComponent> { return this.notImplemented('createIrrigationComponent'); }
  async updateIrrigationComponent(): Promise<IrrigationComponent> { return this.notImplemented('updateIrrigationComponent'); }
  async deleteIrrigationComponent(): Promise<void> { return this.notImplemented('deleteIrrigationComponent'); }

  async getWateringLogs(): Promise<WateringLog[]> { return []; }
  async getWateringLog(): Promise<WateringLog | null> { return null; }
  async logWatering(): Promise<WateringLog> { return this.notImplemented('logWatering'); }
  async createWateringLog(): Promise<WateringLog> { return this.notImplemented('createWateringLog'); }
  async updateWateringLog(): Promise<WateringLog> { return this.notImplemented('updateWateringLog'); }
  async deleteWateringLog(): Promise<void> { return this.notImplemented('deleteWateringLog'); }

  async getFieldRows(): Promise<FieldRow[]> { return []; }
  async getFieldRow(): Promise<FieldRow | null> { return null; }
  async createFieldRow(): Promise<FieldRow> { return this.notImplemented('createFieldRow'); }
  async updateFieldRow(): Promise<FieldRow> { return this.notImplemented('updateFieldRow'); }
  async deleteFieldRow(): Promise<void> { return this.notImplemented('deleteFieldRow'); }

  async getPlantingBatches(): Promise<PlantingBatch[]> { return []; }
  async getPlantingBatch(): Promise<PlantingBatch | null> { return null; }
  async createPlantingBatch(): Promise<PlantingBatch> { return this.notImplemented('createPlantingBatch'); }
  async updatePlantingBatch(): Promise<PlantingBatch> { return this.notImplemented('updatePlantingBatch'); }
  async deletePlantingBatch(): Promise<void> { return this.notImplemented('deletePlantingBatch'); }

  async getHealthAlerts(): Promise<HealthAlert[]> { return []; }
  async getHealthAlert(): Promise<HealthAlert | null> { return null; }
  async createHealthAlert(): Promise<HealthAlert> { return this.notImplemented('createHealthAlert'); }
  async updateHealthAlert(): Promise<HealthAlert> { return this.notImplemented('updateHealthAlert'); }
  async deleteHealthAlert(): Promise<void> { return this.notImplemented('deleteHealthAlert'); }

  async createCustomPlan(): Promise<CustomPlan> { return this.notImplemented('createCustomPlan'); }
  async getCustomPlan(): Promise<CustomPlan | null> { return null; }
  async getUserCustomPlans(): Promise<CustomPlan[]> { return []; }
  async updateCustomPlan(): Promise<CustomPlan> { return this.notImplemented('updateCustomPlan'); }
  async deleteCustomPlan(): Promise<void> { return this.notImplemented('deleteCustomPlan'); }

  async createAgronomist(): Promise<Agronomist> { return this.notImplemented('createAgronomist'); }
  async getAgronomists(): Promise<Agronomist[]> { return []; }
  async updateAgronomist(): Promise<Agronomist> { return this.notImplemented('updateAgronomist'); }
  async deleteAgronomist(): Promise<void> { return this.notImplemented('deleteAgronomist'); }

  async createConsultation(): Promise<AgronomistConsultation> { return this.notImplemented('createConsultation'); }
  async getConsultations(): Promise<AgronomistConsultation[]> { return []; }

  async createAdvice(): Promise<AgronomistAdvice> { return this.notImplemented('createAdvice'); }
  async getAgronomistAdvice(): Promise<AgronomistAdvice[]> { return []; }
  async updateAdvice(): Promise<AgronomistAdvice> { return this.notImplemented('updateAdvice'); }

  async getAccessories(): Promise<GardenAccessory[]> { return []; }
  async getAccessory(): Promise<GardenAccessory | null> { return null; }
  async createAccessory(): Promise<GardenAccessory> { return this.notImplemented('createAccessory'); }
  async updateAccessory(): Promise<GardenAccessory> { return this.notImplemented('updateAccessory'); }
  async deleteAccessory(): Promise<void> { return this.notImplemented('deleteAccessory'); }

  async getHydroponicReadings(): Promise<HydroponicReading[]> { return []; }
  async createHydroponicReading(): Promise<HydroponicReading> { return this.notImplemented('createHydroponicReading'); }
  async getAquaponicReadings(): Promise<AquaponicReading[]> { return []; }
  async createAquaponicReading(): Promise<AquaponicReading> { return this.notImplemented('createAquaponicReading'); }
}
