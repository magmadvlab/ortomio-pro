/**
 * Plant-Row Sync Service
 * Handles synchronization between row-level and plant-level operations
 * Maintains data consistency and provides sync monitoring
 */

import { GardenPlant, PlantOperation } from '../types/individualPlant';

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
      // This would query individual_plants with row information
      const plants = await this.getGardenPlants(gardenId);
      
      const mappings: PlantRowMapping[] = [];
      
      for (const plant of plants) {
        let rowName: string | undefined;
        
        // Get row name
        if (plant.gardenRowId) {
          const row = await this.storageProvider.getGardenRow?.(plant.gardenRowId);
          rowName = row?.name;
        } else if (plant.fieldRowId) {
          const row = await this.storageProvider.getFieldRow?.(plant.fieldRowId);
          rowName = row?.name;
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

      // Call appropriate database function based on operation type
      let syncFunction: string;
      switch (operationType) {
        case 'watering':
          syncFunction = 'sync_watering_to_plants';
          break;
        case 'fertilizer':
          syncFunction = 'sync_fertilizer_to_plants';
          break;
        case 'treatment':
          syncFunction = 'sync_treatment_to_plants';
          break;
        default:
          result.errors.push('Unsupported operation type');
          return result;
      }

      // Execute sync function (this would call the database function)
      const operationsCreated = await this.executeSyncFunction(syncFunction, operationId);
      
      result.operationsProcessed = operationsCreated;
      result.plantsAffected = await this.countAffectedPlants(operationType, operationId);
      result.success = operationsCreated > 0;
      
      // Get sync log ID
      result.syncLogId = await this.getLatestSyncLogId(operationType, operationId);
      
      // Update status
      this.syncStatus.totalSynced += operationsCreated;
      this.syncStatus.lastSyncDate = new Date().toISOString();

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Sync failed');
      this.syncStatus.failedOperations += 1;
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
      // This would query individual_plants table
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('Error getting garden plants:', error);
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