/**
 * Plant-Row Sync Service
 * Handles synchronization between row-level and plant-level operations
 * Maintains data consistency and provides sync monitoring
 */


import { GardenPlant, PlantOperation } from '../types/individualPlant';
import { PreciseIrrigationService, DripperConfig, PlantPosition, WaterDistributionResult } from './preciseIrrigationService';


export interface SyncConfiguration {
  autoSyncEnabled: boolean;
  syncOnRowOperations: boolean;
  syncOnPlantOperations: boolean;
  batchSize: number;
  retryAttempts: number;
  retryDelayMs: number;
}

export interface SyncStatus {
  isRunning: boolean;
  lastSyncDate?: string;
  pendingOperations: number;
  failedOperations: number;
  totalSynced: number;
}

export interface SyncResult {
  success: boolean;
  operationsProcessed: number;
  plantsAffected: number;
  errors: string[];
  syncLogId?: string;
  plantOperationIds?: string[];
}

export interface PlantRowMapping {
  plantId: string;
  plantCode: string;
  gardenRowId?: string;
  fieldRowId?: string;
  rowName?: string;
  positionInRow: number;
  isActive: boolean;
}

/**
 * PLANT-ROW SYNC SERVICE
 */
export class PlantRowSyncService {
  private storageProvider: any;
  private config: SyncConfiguration;
  private syncStatus: SyncStatus;

  constructor(storageProvider: any, config?: Partial<SyncConfiguration>) {
    this.storageProvider = storageProvider;
    this.config = {
      autoSyncEnabled: true,
      syncOnRowOperations: true,
      syncOnPlantOperations: false, // Usually one-way: row → plant
      batchSize: 50,
      retryAttempts: 3,
      retryDelayMs: 1000,
      ...config
    };
    this.syncStatus = {
      isRunning: false,
      pendingOperations: 0,
      failedOperations: 0,
      totalSynced: 0
    };
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Update sync configuration
   */
  updateConfig(newConfig: Partial<SyncConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get plant-row mappings for a garden
   */
  async getPlantRowMappings(gardenId: string): Promise<PlantRowMapping[]> {
    try {
      console.log('🔗 PLANT ROW SYNC DEBUG - Getting mappings for garden:', gardenId)
      console.log('🔗 PLANT ROW SYNC DEBUG - Storage provider:', this.storageProvider?.constructor?.name)

      // This would query individual_plants with row information
      console.log('🔗 PLANT ROW SYNC DEBUG - Getting garden plants...')
      const plants = await this.getGardenPlants(gardenId);
      console.log('🔗 PLANT ROW SYNC DEBUG - Plants loaded:', plants?.length || 0)

      const mappings: PlantRowMapping[] = [];

      for (const plant of plants) {
        let rowName: string | undefined;

        // Get row name safely
        if (plant.gardenRowId) {
          try {
            console.log('🔗 PLANT ROW SYNC DEBUG - Getting garden row:', plant.gardenRowId)
            const row = await this.storageProvider.getGardenRow?.(plant.gardenRowId);
            rowName = row?.name;
            console.log('🔗 PLANT ROW SYNC DEBUG - Garden row name:', rowName)
          } catch (error) {
            console.warn('🔗 PLANT ROW SYNC WARN - Error getting garden row:', error);
          }
        } else if (plant.fieldRowId) {
          try {
            console.log('🔗 PLANT ROW SYNC DEBUG - Getting field row:', plant.fieldRowId)
            const fieldRows = await this.storageProvider.getFieldRows?.(gardenId);
            const row = fieldRows?.find((r: any) => r.id === plant.fieldRowId);
            rowName = row?.name;
            console.log('🔗 PLANT ROW SYNC DEBUG - Field row name:', rowName)
          } catch (error) {
            console.warn('🔗 PLANT ROW SYNC WARN - Error getting field row:', error);
          }
        }

        mappings.push({
          plantId: plant.id,
          plantCode: plant.plantCode,
          gardenRowId: plant.gardenRowId,
          fieldRowId: plant.fieldRowId,
          rowName,
          positionInRow: plant.positionInRow,
          isActive: plant.status !== 'dead' && plant.status !== 'harvested'
        });
      }

      return mappings;
    } catch (error) {
      console.error('Error getting plant-row mappings:', error);
      return [];
    }
  }

  /**
   * Sync specific row operation to plants
   */
  /**
   * Sync specific row operation to plants
   */
  async syncRowOperationToPlants(
    operationType: 'watering' | 'fertilizer' | 'treatment',
    operationId: string
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      operationsProcessed: 0,
      plantsAffected: 0,
      errors: [],
      plantOperationIds: []
    };

    try {
      this.syncStatus.isRunning = true;
      const preciseIrrigationService = new PreciseIrrigationService();
      const toNumber = (value: unknown): number => {
        if (value === null || value === undefined) return 0;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };
      const parseConfig = (value: unknown): Record<string, any> | undefined => {
        if (!value) return undefined;
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return undefined;
          }
        }
        if (typeof value === 'object') return value as Record<string, any>;
        return undefined;
      };
      const getRowLengthMeters = (row: any): number => {
        return toNumber(row?.lengthMeters ?? row?.length_meters) || 0;
      };
      const getRowPlantSpacingCm = (row: any): number => {
        return toNumber(row?.plantSpacing ?? row?.plant_spacing) || 30;
      };

      let operationsCreated = 0;
      const createdPlantOperationIds: string[] = [];

      // 1. Get Operation Details
      let operationDetails: any;
      let durationMinutes = 0;
      let totalAmount = 0;
      let unit = '';
      let productName = '';
      let notes = '';
      let operationDate = '';
      let operationTime: string | undefined;
      let parentOperationTable: 'watering_logs' | 'fertilizer_application_logs' | 'treatment_register' = 'watering_logs';
      let derivedOperationType: 'watering' | 'fertilizing' | 'treatment' = 'watering';
      let weatherConditions: Record<string, any> | undefined;

      if (operationType === 'watering') {
        operationDetails = await this.storageProvider.getWateringLog?.(operationId);
        if (!operationDetails) throw new Error(`Watering log ${operationId} not found`);

        durationMinutes = toNumber(operationDetails.durationMinutes ?? operationDetails.duration_minutes);
        totalAmount = toNumber(
          operationDetails.litersApplied
          ?? operationDetails.liters_applied
          ?? operationDetails.litersTotal
          ?? operationDetails.liters_total
        );
        unit = 'L';
        notes = operationDetails.notes;
        operationDate = operationDetails.date || operationDetails.operationDate || new Date().toISOString().split('T')[0];
        operationTime = typeof operationDetails.wateredAt === 'string' && operationDetails.wateredAt.includes('T')
          ? operationDetails.wateredAt.split('T')[1]?.slice(0, 5)
          : undefined;
        parentOperationTable = 'watering_logs';
        derivedOperationType = 'watering';
        weatherConditions = {
          condition: operationDetails.weatherCondition || operationDetails.weather_condition,
          temp: toNumber(operationDetails.airTemperatureC ?? operationDetails.air_temperature_c) || undefined
        };
      } else if (operationType === 'fertilizer') {
        operationDetails = await this.storageProvider.getFertilizerApplicationLog?.(operationId);
        if (!operationDetails) throw new Error(`Fertilizer log ${operationId} not found`);
        totalAmount = toNumber(operationDetails.dosageAmount ?? operationDetails.dosage_amount ?? operationDetails.quantity);
        unit = operationDetails.dosageUnit || operationDetails.dosage_unit || operationDetails.unit || 'kg';
        productName = operationDetails.fertilizerProductName || operationDetails.fertilizer_product_name || operationDetails.fertilizer_name || 'Fertilizer';
        notes = operationDetails.notes;
        operationDate = operationDetails.applicationDate || operationDetails.application_date || new Date().toISOString().split('T')[0];
        parentOperationTable = 'fertilizer_application_logs';
        derivedOperationType = 'fertilizing';
        weatherConditions = operationDetails.weatherConditions || operationDetails.weather_conditions || undefined;
      } else {
        operationDetails = await this.storageProvider.getTreatment?.(operationId);
        if (!operationDetails) throw new Error(`Treatment ${operationId} not found`);
        totalAmount = toNumber(operationDetails.dosage);
        unit = operationDetails.dosage_unit || 'ml';
        productName = operationDetails.product_name || 'Treatment';
        notes = operationDetails.notes;
        operationDate = operationDetails.treatment_date || new Date().toISOString().split('T')[0];
        parentOperationTable = 'treatment_register';
        derivedOperationType = 'treatment';
        weatherConditions = operationDetails.weather_conditions || undefined;
      }

      // Get all plants for the Garden (we can filter by zone/row later)
      const gardenId = operationDetails?.gardenId || operationDetails?.garden_id;
      if (!gardenId) throw new Error('Garden ID not found in operation');

      const mappings = await this.getPlantRowMappings(gardenId);

      const explicitFieldRowId = operationDetails?.fieldRowId || operationDetails?.field_row_id;
      const explicitGardenRowId =
        operationDetails?.bedRowId ||
        operationDetails?.bed_row_id ||
        operationDetails?.rowId ||
        operationDetails?.row_id;
      const zoneId = operationDetails?.zoneId || operationDetails?.zone_id || operationDetails?.bedId || operationDetails?.bed_id;

      let targetMappings = mappings;
      if (explicitFieldRowId || explicitGardenRowId) {
        targetMappings = mappings.filter(m =>
          (explicitFieldRowId && m.fieldRowId === explicitFieldRowId) ||
          (explicitGardenRowId && m.gardenRowId === explicitGardenRowId)
        );
      } else if (zoneId) {
        const fieldRows = await this.storageProvider.getFieldRows?.(gardenId) || [];
        const gardenRows = await this.storageProvider.getGardenRows?.(zoneId) || [];

        const validRowIds = new Set([
          ...fieldRows.filter((r: any) => r.zoneId === zoneId).map((r: any) => r.id),
          ...gardenRows.map((r: any) => r.id)
        ]);

        targetMappings = mappings.filter(m =>
          (m.fieldRowId && validRowIds.has(m.fieldRowId)) ||
          (m.gardenRowId && validRowIds.has(m.gardenRowId))
        );
      }

      console.log(`Syncing ${operationType} to ${targetMappings.length} plants`);

      // Group by Row to apply Precise Irrigation per Row
      const rows = new Map<string, typeof targetMappings>();
      for (const m of targetMappings) {
        const rId = m.fieldRowId || m.gardenRowId || 'unknown';
        if (!rows.has(rId)) rows.set(rId, []);
        rows.get(rId)?.push(m);
      }

      for (const [rId, plantMappings] of rows) {
        if (rId === 'unknown') continue;

        // Get Row Config
        // We need to know if it's field or garden row to fetch config
        let row: any = await this.storageProvider.getFieldRow?.(rId);
        if (!row) row = await this.storageProvider.getGardenRow?.(rId);

        if (!row) continue;

        // Prepare Dripper Config (simulated or real)
        const dripperConfig: DripperConfig = {
          flowRateLph: 2.0, // Default
          spacingCm: 30,    // Default
          wettingRadiusCm: 15 // Default
        };

        // Override with real config if available (e.g. from irrigationConfig json)
        const config = parseConfig(row.irrigationLine ?? row.irrigationConfig);
        if (config) {
          const spacingCm = toNumber(config.emitterSpacingCm ?? config.emitterSpacing ?? config.dripperSpacing);
          if (spacingCm > 0) {
            dripperConfig.spacingCm = spacingCm;
          }

          const pressureBar = toNumber(config.pressureBar ?? config.pressure);
          const nominalPressureBar = toNumber(config.nominalPressureBar ?? config.referencePressureBar) || 1.5;
          const pressureFactor = pressureBar > 0 && nominalPressureBar > 0
            ? Math.sqrt(pressureBar / nominalPressureBar)
            : 1;

          const emitterFlowRateLph = toNumber(config.emitterFlowRateLph ?? config.emitterFlowRate ?? config.dripperFlowRate);
          if (emitterFlowRateLph > 0) {
            dripperConfig.flowRateLph = emitterFlowRateLph * pressureFactor;
          }

          const flowRatePerMeterLph = toNumber(config.flowRatePerMeterLph ?? config.flowRatePerMeter);
          if (flowRatePerMeterLph > 0 && dripperConfig.spacingCm > 0) {
            const inferredEmitterFlow = flowRatePerMeterLph * (dripperConfig.spacingCm / 100);
            if (inferredEmitterFlow > 0) {
              dripperConfig.flowRateLph = inferredEmitterFlow;
            }
          }

          const totalFlowRateLph = toNumber(config.totalFlowRate);
          const rowLengthMeters = getRowLengthMeters(row);
          if (
            totalFlowRateLph > 0 &&
            dripperConfig.spacingCm > 0 &&
            rowLengthMeters > 0 &&
            !flowRatePerMeterLph
          ) {
            const emitterCount = Math.max(1, Math.floor((rowLengthMeters * 100) / dripperConfig.spacingCm));
            dripperConfig.flowRateLph = totalFlowRateLph / emitterCount;
          }
        }

        // Prepare Plant Positions
        const plantSpacingCm = getRowPlantSpacingCm(row);
        const plantPositions: PlantPosition[] = plantMappings.map(m => ({
          id: m.plantId,
          // positionInRow is an ordinal index, while plantSpacing is already in cm.
          distanceFromStartCm: Math.max((m.positionInRow || 1) - 1, 0) * plantSpacingCm
        }));

        // Calculate Water Distribution
        let distribution: WaterDistributionResult[] = [];

        if (operationType === 'watering') {
          if (durationMinutes > 0) {
            distribution = preciseIrrigationService.calculateWatering(
              Math.max(getRowLengthMeters(row), 10) * 100,
              dripperConfig,
              plantPositions,
              durationMinutes
            );
          } else if (totalAmount > 0) {
            // Se manca la durata ma esistono litri totali, distribuisci proporzionalmente tra le piante.
            const baseDistribution = preciseIrrigationService.calculateWatering(
              Math.max(getRowLengthMeters(row), 10) * 100,
              dripperConfig,
              plantPositions,
              30
            );
            const baseTotal = baseDistribution.reduce((sum, p) => sum + p.litersReceived, 0);
            distribution = baseDistribution.map(p => ({
              ...p,
              litersReceived: baseTotal > 0 ? (p.litersReceived / baseTotal) * totalAmount : 0
            }));
          } else {
            distribution = [];
          }
        } else {
          // For fertilizer, we can use the same distribution logic effectively
          // treating "duration" as "amount" if we normalize, or just applying proportional logic
          // Simplest: Distribute Total Amount based on Water Distribution Ratio
          // Simulate a watering event to get ratios
          const waterDist = preciseIrrigationService.calculateWatering(
            Math.max(getRowLengthMeters(row), 10) * 100,
            dripperConfig,
            plantPositions,
            30 // Arbitrary 30 mins to get ratios
          );

          const totalSimulatedWater = waterDist.reduce((sum, p) => sum + p.litersReceived, 0);

          distribution = waterDist.map(p => ({
            ...p,
            litersReceived: totalSimulatedWater > 0 ? (p.litersReceived / totalSimulatedWater) * totalAmount : 0
          }));
        }

        // Create Operations
        for (const dist of distribution) {
          if (dist.litersReceived > 0 || operationType !== 'watering') {
            const plantId = dist.plantId;
            const createdOperation = await this.storageProvider.createPlantOperation?.({
              gardenId,
              plantId,
              operationType: derivedOperationType,
              operationDate,
              operationTime,
              quantity: Number(dist.litersReceived.toFixed(3)),
              unit: unit,
              productName: productName,
              notes: notes ? `${notes} (Calc: ${dist.efficiency.toFixed(2)}x eff)` : undefined,
              parentOperationId: operationId,
              parentOperationTable,
              sourceType: 'orchestrator_sync',
              actorType: 'orchestrator',
              weatherConditions
            });
            operationsCreated++;
            if (createdOperation?.id) {
              createdPlantOperationIds.push(createdOperation.id);
            }
          }
        }
      }

      result.operationsProcessed = operationsCreated;
      result.plantsAffected = createdPlantOperationIds.length;
      result.plantOperationIds = createdPlantOperationIds;
      result.success = operationsCreated > 0;

      // Update status
      this.syncStatus.totalSynced += operationsCreated;
      this.syncStatus.lastSyncDate = new Date().toISOString();

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Sync failed');
      this.syncStatus.failedOperations += 1;
      console.error('SYNC ERROR DETAILS:', error);
    } finally {
      this.syncStatus.isRunning = false;
    }

    return result;
  }

  /**
   * Sync all pending operations
   */
  async syncAllPendingOperations(gardenId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      operationsProcessed: 0,
      plantsAffected: 0,
      errors: []
    };

    try {
      this.syncStatus.isRunning = true;

      // Get pending operations (operations that haven't been synced yet)
      const pendingOperations = await this.getPendingOperations(gardenId);

      let totalProcessed = 0;
      const affectedPlants = new Set<string>();

      // Process in batches
      for (let i = 0; i < pendingOperations.length; i += this.config.batchSize) {
        const batch = pendingOperations.slice(i, i + this.config.batchSize);

        for (const operation of batch) {
          try {
            const syncResult = await this.syncRowOperationToPlants(
              operation.type,
              operation.id
            );

            if (syncResult.success) {
              totalProcessed += syncResult.operationsProcessed;
              // Add affected plants to set (would need to get actual plant IDs)
            } else {
              result.errors.push(...syncResult.errors);
            }
          } catch (error) {
            result.errors.push(`Failed to sync ${operation.type} ${operation.id}: ${error}`);
          }
        }

        // Small delay between batches to avoid overwhelming the database
        if (i + this.config.batchSize < pendingOperations.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      result.operationsProcessed = totalProcessed;
      result.plantsAffected = affectedPlants.size;
      result.success = totalProcessed > 0;

      // Update status
      this.syncStatus.totalSynced += totalProcessed;
      this.syncStatus.pendingOperations = Math.max(0, this.syncStatus.pendingOperations - totalProcessed);
      this.syncStatus.lastSyncDate = new Date().toISOString();

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Batch sync failed');
    } finally {
      this.syncStatus.isRunning = false;
    }

    return result;
  }

  /**
   * Assign plants to rows
   */
  async assignPlantsToRow(
    plantIds: string[],
    rowId: string,
    rowType: 'garden_row' | 'field_row'
  ): Promise<{ success: boolean; plantsAssigned: number; errors: string[] }> {
    try {
      let plantsAssigned = 0;
      const errors: string[] = [];

      for (const plantId of plantIds) {
        try {
          // Update plant with row assignment
          await this.updatePlantRowAssignment(plantId, rowId, rowType);
          plantsAssigned++;
        } catch (error) {
          errors.push(`Failed to assign plant ${plantId}: ${error}`);
        }
      }

      return {
        success: plantsAssigned > 0,
        plantsAssigned,
        errors
      };
    } catch (error) {
      return {
        success: false,
        plantsAssigned: 0,
        errors: [error instanceof Error ? error.message : 'Assignment failed']
      };
    }
  }

  /**
   * Remove plants from rows
   */
  async removePlantsFromRow(plantIds: string[]): Promise<{ success: boolean; plantsRemoved: number; errors: string[] }> {
    try {
      let plantsRemoved = 0;
      const errors: string[] = [];

      for (const plantId of plantIds) {
        try {
          // Clear row assignment
          await this.updatePlantRowAssignment(plantId, null, null);
          plantsRemoved++;
        } catch (error) {
          errors.push(`Failed to remove plant ${plantId}: ${error}`);
        }
      }

      return {
        success: plantsRemoved > 0,
        plantsRemoved,
        errors
      };
    } catch (error) {
      return {
        success: false,
        plantsRemoved: 0,
        errors: [error instanceof Error ? error.message : 'Removal failed']
      };
    }
  }

  /**
   * Get sync statistics for dashboard
   */
  async getSyncStatistics(gardenId: string): Promise<{
    totalPlants: number;
    plantsInRows: number;
    plantsWithoutRows: number;
    recentSyncOperations: number;
    syncSuccessRate: number;
    lastSyncDate?: string;
  }> {
    try {
      const mappings = await this.getPlantRowMappings(gardenId);
      const totalPlants = mappings.length;
      const plantsInRows = mappings.filter(m => m.gardenRowId || m.fieldRowId).length;
      const plantsWithoutRows = totalPlants - plantsInRows;

      // Get recent sync logs (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentSyncLogs = await this.getRecentSyncLogs(gardenId, yesterday.toISOString());
      const recentSyncOperations = recentSyncLogs.length;

      const successfulSyncs = recentSyncLogs.filter(log => log.syncStatus === 'completed').length;
      const syncSuccessRate = recentSyncOperations > 0 ? (successfulSyncs / recentSyncOperations) * 100 : 100;

      return {
        totalPlants,
        plantsInRows,
        plantsWithoutRows,
        recentSyncOperations,
        syncSuccessRate,
        lastSyncDate: this.syncStatus.lastSyncDate
      };
    } catch (error) {
      console.error('Error getting sync statistics:', error);
      return {
        totalPlants: 0,
        plantsInRows: 0,
        plantsWithoutRows: 0,
        recentSyncOperations: 0,
        syncSuccessRate: 0
      };
    }
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private async getGardenPlants(gardenId: string): Promise<GardenPlant[]> {
    try {
      console.log('🔗 PLANT ROW SYNC DEBUG - getGardenPlants called for garden:', gardenId)
      console.log('🔗 PLANT ROW SYNC DEBUG - getIndividualPlants available:', typeof this.storageProvider.getIndividualPlants)

      // Use storageProvider to get individual plants
      if (this.storageProvider.getIndividualPlants) {
        console.log('🔗 PLANT ROW SYNC DEBUG - Calling getIndividualPlants...')
        const plants = await this.storageProvider.getIndividualPlants(gardenId);
        console.log('🔗 PLANT ROW SYNC DEBUG - getIndividualPlants returned:', plants?.length || 0, 'plants')
        return plants;
      }

      // Fallback: return empty array if method doesn't exist
      console.warn('🔗 PLANT ROW SYNC WARN - getIndividualPlants method not available in storageProvider');
      return [];
    } catch (error: any) {
      console.error('🔗 PLANT ROW SYNC ERROR - Error getting garden plants:');
      console.error('🔗 PLANT ROW SYNC ERROR - Error message:', error?.message || 'Unknown error');
      console.error('🔗 PLANT ROW SYNC ERROR - Error code:', error?.code || 'No code');
      console.error('🔗 PLANT ROW SYNC ERROR - Error details:', error?.details || 'No details');
      console.error('🔗 PLANT ROW SYNC ERROR - Error hint:', error?.hint || 'No hint');

      // Return empty array instead of throwing to prevent cascading failures
      return [];
    }
  }

  private async executeSyncFunction(functionName: string, operationId: string): Promise<number> {
    try {
      // This would execute the database function
      // For now, return 0 as placeholder
      return 0;
    } catch (error) {
      console.error(`Error executing sync function ${functionName}:`, error);
      return 0;
    }
  }

  private async countAffectedPlants(operationType: string, operationId: string): Promise<number> {
    try {
      // This would count plants affected by the operation
      // For now, return 0 as placeholder
      return 0;
    } catch (error) {
      console.error('Error counting affected plants:', error);
      return 0;
    }
  }

  private async getLatestSyncLogId(operationType: string, operationId: string): Promise<string | undefined> {
    try {
      // This would query operation_sync_log table
      // For now, return undefined as placeholder
      return undefined;
    } catch (error) {
      console.error('Error getting sync log ID:', error);
      return undefined;
    }
  }

  private async getPendingOperations(gardenId: string): Promise<Array<{ id: string; type: 'watering' | 'fertilizer' | 'treatment' }>> {
    try {
      // This would query for operations that haven't been synced yet
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  }

  private async updatePlantRowAssignment(
    plantId: string,
    rowId: string | null,
    rowType: 'garden_row' | 'field_row' | null
  ): Promise<void> {
    try {
      // This would update the individual_plants table
      // For now, just log the operation
      console.log(`Updating plant ${plantId} assignment to ${rowType} ${rowId}`);
    } catch (error) {
      console.error('Error updating plant row assignment:', error);
      throw error;
    }
  }

  private async getRecentSyncLogs(gardenId: string, fromDate: string): Promise<Array<{ syncStatus: string }>> {
    try {
      // This would query operation_sync_log table
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('Error getting recent sync logs:', error);
      return [];
    }
  }
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Create plant-row sync service instance
 */
export const createPlantRowSyncService = (
  storageProvider: any,
  config?: Partial<SyncConfiguration>
) => {
  return new PlantRowSyncService(storageProvider, config);
};

/**
 * Auto-sync row operation to plants
 */
export const autoSyncRowOperation = async (
  storageProvider: any,
  operationType: 'watering' | 'fertilizer' | 'treatment',
  operationId: string
): Promise<SyncResult> => {
  const syncService = createPlantRowSyncService(storageProvider);
  return await syncService.syncRowOperationToPlants(operationType, operationId);
};

/**
 * Batch assign plants to row with position calculation
 */
export const batchAssignPlantsToRow = async (
  storageProvider: any,
  plantIds: string[],
  rowId: string,
  rowType: 'garden_row' | 'field_row',
  startPosition: number = 1
): Promise<{ success: boolean; plantsAssigned: number; errors: string[] }> => {
  try {
    const syncService = createPlantRowSyncService(storageProvider);

    // Assign plants with sequential positions
    let plantsAssigned = 0;
    const errors: string[] = [];

    for (let i = 0; i < plantIds.length; i++) {
      try {
        await syncService.assignPlantsToRow([plantIds[i]], rowId, rowType);

        // Update position in row
        // This would need additional method to update position

        plantsAssigned++;
      } catch (error) {
        errors.push(`Failed to assign plant ${plantIds[i]}: ${error}`);
      }
    }

    return {
      success: plantsAssigned > 0,
      plantsAssigned,
      errors
    };
  } catch (error) {
    return {
      success: false,
      plantsAssigned: 0,
      errors: [error instanceof Error ? error.message : 'Batch assignment failed']
    };
  }
};

export default PlantRowSyncService;
