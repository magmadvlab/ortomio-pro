/**
 * Global Search Service
 * Provides unified search across multiple data types (tasks, harvests, seeds, gardens, etc.)
 */

import { IStorageProvider } from '../packages/core/storage/interface';

export interface SearchResult {
  type: 'task' | 'harvest' | 'seed' | 'garden' | 'treatment' | 'mechanical';
  id: string;
  title: string;
  description: string;
  date?: string;
  plantName?: string;
  relevanceScore: number;
}

/**
 * Search across all data types
 * @param query - Search query string
 * @param storageProvider - Storage provider instance
 * @returns Array of search results sorted by relevance
 */
export async function searchAll(
  query: string,
  storageProvider: IStorageProvider
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  const userId = 'current-user-id'; // TODO: Get from auth context

  try {
    // Search in Tasks
    const tasks = await storageProvider.getTasks();
    tasks.forEach((task) => {
      const relevance = calculateRelevance(searchTerm, [
        task.plantName,
        task.variety,
        task.notes,
        task.taskType,
      ]);
      if (relevance > 0) {
        results.push({
          type: 'task',
          id: task.id,
          title: `${task.taskType}: ${task.plantName || 'Task'}`,
          description: task.notes || task.taskType,
          date: task.date,
          plantName: task.plantName,
          relevanceScore: relevance,
        });
      }
    });

    // Search in Harvest Logs
    const harvests = await storageProvider.getHarvestLogs(userId);
    harvests.forEach((harvest) => {
      const relevance = calculateRelevance(searchTerm, [
        harvest.plantName,
        harvest.notes,
        harvest.plantName,
      ]);
      if (relevance > 0) {
        results.push({
          type: 'harvest',
          id: harvest.id,
          title: `Raccolto: ${harvest.plantName || 'Raccolto'}`,
          description: harvest.notes || `Quantità: ${harvest.quantity} ${harvest.unit}`,
          date: harvest.date,
          plantName: harvest.plantName,
          relevanceScore: relevance,
        });
      }
    });

    // Search in Seed Inventory
    const seeds = await storageProvider.getSeedInventory(userId);
    seeds.forEach((seed) => {
      const relevance = calculateRelevance(searchTerm, [
        seed.plantName,
        seed.variety,
        seed.brand,
        seed.notes,
      ]);
      if (relevance > 0) {
        results.push({
          type: 'seed',
          id: seed.id,
          title: `Seme: ${seed.plantName || 'Seme'}`,
          description: `${seed.variety || ''} ${seed.brand || ''}`.trim() || seed.notes || '',
          plantName: seed.plantName,
          relevanceScore: relevance,
        });
      }
    });

    // Search in Gardens
    const gardens = await storageProvider.getGardens(userId);
    gardens.forEach((garden) => {
      const relevance = calculateRelevance(searchTerm, [garden.name, garden.notes]);
      if (relevance > 0) {
        results.push({
          type: 'garden',
          id: garden.id,
          title: `Orto: ${garden.name}`,
          description: garden.notes || `Dimensione: ${garden.area} m²`,
          relevanceScore: relevance,
        });
      }
    });

    // Search in Treatments (if available)
    try {
      const treatments = await storageProvider.getTreatments?.(userId);
      if (treatments) {
        treatments.forEach((treatment: any) => {
          const relevance = calculateRelevance(searchTerm, [
            treatment.plantName,
            treatment.product,
            treatment.notes,
          ]);
          if (relevance > 0) {
            results.push({
              type: 'treatment',
              id: treatment.id,
              title: `Trattamento: ${treatment.plantName || 'Trattamento'}`,
              description: treatment.product || treatment.notes || '',
              date: treatment.date,
              plantName: treatment.plantName,
              relevanceScore: relevance,
            });
          }
        });
      }
    } catch (e) {
      // Treatments might not be available
    }

    // Search in Mechanical Work (if available)
    try {
      const mechanicalWork = await storageProvider.getMechanicalWork?.(userId);
      if (mechanicalWork) {
        mechanicalWork.forEach((work: any) => {
          const relevance = calculateRelevance(searchTerm, [work.workType, work.notes]);
          if (relevance > 0) {
            results.push({
              type: 'mechanical',
              id: work.id,
              title: `Lavorazione: ${work.workType || 'Lavorazione'}`,
              description: work.notes || work.workType,
              date: work.date,
              relevanceScore: relevance,
            });
          }
        });
      }
    } catch (e) {
      // Mechanical work might not be available
    }

    // Sort by relevance score (descending)
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('Error in global search:', error);
    return [];
  }
}

/**
 * Calculate relevance score for a search term against multiple fields
 * @param searchTerm - Lowercase search term
 * @param fields - Array of fields to search in
 * @returns Relevance score (0-100)
 */
function calculateRelevance(searchTerm: string, fields: (string | undefined)[]): number {
  let score = 0;
  const words = searchTerm.split(/\s+/).filter((w) => w.length > 0);

  fields.forEach((field) => {
    if (!field) return;
    const fieldLower = field.toLowerCase();

    words.forEach((word) => {
      if (fieldLower === word) {
        score += 50; // Exact match
      } else if (fieldLower.startsWith(word)) {
        score += 30; // Starts with
      } else if (fieldLower.includes(word)) {
        score += 10; // Contains
      }
    });
  });

  return Math.min(score, 100);
}






