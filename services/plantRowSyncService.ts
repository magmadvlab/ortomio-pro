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
            const row = fieldRows?.find(r => r.id === plant.fieldRowId);
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
      errors: []
    };

    try {
      this.syncStatus.isRunning = true;
      const preciseIrrigationService = new PreciseIrrigationService();

      let operationsCreated = 0;

      // 1. Get Operation Details
      let operationDetails: any;
      let rowId: string | undefined;
      let rowType: 'garden_row' | 'field_row' | undefined;
      let durationMinutes = 0;
      let totalAmount = 0;
      let unit = '';
      let productName = '';
      let notes = '';

      if (operationType === 'watering') {
        operationDetails = await this.storageProvider.getWateringLog?.(operationId);
        if (!operationDetails) throw new Error(`Watering log ${operationId} not found`);

        // Try to find row ID from zone/bed linkage (simplified for now)
        // Ideally operationDetails should have rowId or we infer it from zone
        // Assuming operationDetails has enough info or we can't sync perfectly yet
        // For FieldRows, they might be directly linked.
        // If operation is on a ZONE, we need to find all rows in that zone.
        // This is complex. Let's assume operation might have a 'rowId' or we process all rows in the zone.

        durationMinutes = operationDetails.duration_minutes || 0;
        totalAmount = operationDetails.liters_total || 0;
        unit = 'L';
        notes = operationDetails.notes;

        // If operation is on a zone, find rows
        const zoneId = operationDetails.zone_id; // Assuming this exists
        if (zoneId) {
          // Get all rows in this zone
          // We'll process each row. But for simplicity, let's just create generic ops if we can't do precise.
          // But we WANT precise.
          // Let's defer to a helper that handles "Zone to Rows" distribution?
          // For now, let's assume we can get a list of rows affected.
        }
      } else if (operationType === 'fertilizer') {
        operationDetails = await this.storageProvider.getFertilizerApplicationLog?.(operationId);
        if (!operationDetails) throw new Error(`Fertilizer log ${operationId} not found`);
        totalAmount = operationDetails.quantity || 0;
        unit = operationDetails.unit || 'kg';
        productName = operationDetails.fertilizer_name || 'Fertilizer';
        notes = operationDetails.notes;
      }

      // Hack: To make this work without complex zone logic refactoring,
      // let's assume we can interact with "Field Rows" directly or via matching.
      // If we can't find specific row info, we fall back to simple distribution.

      // Get all plants for the Garden (we can filter by zone/row later)
      const gardenId = operationDetails?.garden_id;
      if (!gardenId) throw new Error('Garden ID not found in operation');

      const mappings = await this.getPlantRowMappings(gardenId);

      // Filter mappings that are relevant to this operation
      // This is the tricky part: matching Operation -> Zone -> Rows -> Plants
      // For now, let's try to match by Zone ID if available
      const zoneId = operationDetails?.zone_id || operationDetails?.bed_id;

      let targetMappings = mappings;
      if (zoneId) {
        // Filter plants in this zone (need to lookup row -> zone)
        // Mappings have fieldRowId or gardenRowId. We need to check if those rows are in the zone.
        // This requires fetching rows details.
        // Optimization: Fetch all rows for the garden once.
        const fieldRows = await this.storageProvider.getFieldRows?.(gardenId) || [];
        const gardenRows = await this.storageProvider.getGardenRows?.(zoneId) || []; // gardenRows are per bed/zone usually

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
        if (row.irrigationConfig) {
          // Parse if string or use if object
          const config = typeof row.irrigationConfig === 'string' ? JSON.parse(row.irrigationConfig) : row.irrigationConfig;
          if (config.dripperFlowRate) dripperConfig.flowRateLph = config.dripperFlowRate;
          if (config.dripperSpacing) dripperConfig.spacingCm = config.dripperSpacing;
        }

        // Prepare Plant Positions
        const plantPositions: PlantPosition[] = plantMappings.map(m => ({
          id: m.plantId,
          distanceFromStartCm: (m.positionInRow || 0) * (row.plantSpacing ? row.plantSpacing * 100 : 30) // Estimate distance if not explicit
        }));

        // Calculate Water Distribution
        let distribution: WaterDistributionResult[] = [];

        if (operationType === 'watering') {
          distribution = preciseIrrigationService.calculateWatering(
            (row.lengthMeters || 10) * 100,
            dripperConfig,
            plantPositions,
            durationMinutes
          );
        } else {
          // For fertilizer, we can use the same distribution logic effectively
          // treating "duration" as "amount" if we normalize, or just applying proportional logic
          // Simplest: Distribute Total Amount based on Water Distribution Ratio
          // Simulate a watering event to get ratios
          const waterDist = preciseIrrigationService.calculateWatering(
            (row.lengthMeters || 10) * 100,
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

            await this.storageProvider.createPlantOperation?.({
              gardenId,
              plantId,
              operationType,
              operationDate: new Date().toISOString(), // Or operation date
              quantity: Number(dist.litersReceived.toFixed(3)),
              unit: unit,
              productName: productName,
              notes: notes ? `${notes} (Calc: ${dist.efficiency.toFixed(2)}x eff)` : undefined,
              parentOperationId: operationId,
              parentOperationTable: operationType === 'watering' ? 'watering_logs' : 'fertilizer_logs'
            });
            operationsCreated++;
          }
        }
      }

      result.operationsProcessed = operationsCreated;
      result.plantsAffected = operationsCreated;
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