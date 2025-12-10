/**
 * Bed Service
 * CRUD operations for garden beds and planting history
 * Currently uses localStorage, will be migrated to IStorageProvider in Phase 6
 */

import { BedHistory } from '../types';

const STORAGE_KEY = 'ortoBedHistory';

export class BedService {
  /**
   * Get bed history for a specific bed
   */
  static getBedHistory(bedId: string): BedHistory | null {
    const all = this.getAllBedHistory();
    return all.find(b => b.bedId === bedId) || null;
  }

  /**
   * Get all bed histories
   */
  static getAllBedHistory(): BedHistory[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as BedHistory[];
    } catch {
      return [];
    }
  }

  /**
   * Save bed history
   */
  static saveBedHistory(bedHistory: BedHistory): void {
    const all = this.getAllBedHistory();
    const index = all.findIndex(b => b.bedId === bedHistory.bedId);
    
    if (index >= 0) {
      all[index] = bedHistory;
    } else {
      all.push(bedHistory);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  /**
   * Add planting record to bed history
   */
  static addPlantingRecord(
    bedId: string,
    plantId: string,
    plantName: string,
    plantFamily: string,
    season: 'Summer' | 'Winter',
    year: number,
    plantedAt?: string,
    harvestedAt?: string
  ): void {
    const history = this.getBedHistory(bedId) || {
      bedId,
      plantingHistory: [],
    };

    history.plantingHistory.unshift({
      year,
      season,
      plantFamily,
      plantId,
      plantName,
      plantedAt,
      harvestedAt,
    });

    this.saveBedHistory(history);
  }

  /**
   * Get last planting for a bed
   */
  static getLastPlanting(bedId: string): BedHistory['plantingHistory'][0] | null {
    const history = this.getBedHistory(bedId);
    if (!history || history.plantingHistory.length === 0) {
      return null;
    }
    return history.plantingHistory[0];
  }
}

