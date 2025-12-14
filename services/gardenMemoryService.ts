/**
 * Garden Memory Service
 * Gestisce memoria contestuale profonda per zone, alberi, pattern e correlazioni
 */

import { ZoneMemory, TreeMemory, PlantingRecord, Correlation, LocalPattern, SeasonAnalysis } from '../types/memory';
import { Garden, GardenTask, HarvestLogData } from '../types';

/**
 * Salva contesto completo di una piantagione
 */
export async function savePlantingContext(
  zoneId: string,
  zoneName: string | undefined,
  gardenId: string,
  plantingData: {
    plant: string;
    variety?: string;
    method: 'Seed' | 'Seedling';
    date: Date;
    soilConditions: {
      type: string;
      pH?: number;
      compaction?: number;
    };
  },
  weatherConditions: {
    avgTemp: number;
    rain: number;
    frosts: number;
  }
): Promise<void> {
  // TODO: Implementare salvataggio in Supabase quando disponibile
  // Per ora, salva in localStorage come fallback
  const storageKey = `garden_memory_${gardenId}_zone_${zoneId}`;
  const existing = localStorage.getItem(storageKey);
  const memory: ZoneMemory = existing
    ? JSON.parse(existing)
    : {
        zoneId,
        zoneName,
        gardenId,
        plantingHistory: [],
        patterns: {
          recurringProblems: [],
          successfulTreatments: [],
        },
        correlations: [],
      };

  const record: PlantingRecord = {
    year: plantingData.date.getFullYear(),
    ...plantingData,
    soilConditions: plantingData.soilConditions,
    weatherConditions,
    result: {
      yield: 0, // Sarà aggiornato quando si registra raccolto
      quality: 0,
      problems: [],
      treatments: [],
    },
  };

  memory.plantingHistory.push(record);
  localStorage.setItem(storageKey, JSON.stringify(memory));
}

/**
 * Aggiorna risultato di una piantagione quando si registra raccolto
 */
export async function updatePlantingResult(
  zoneId: string,
  gardenId: string,
  plant: string,
  date: Date,
  result: {
    yield: number;
    quality: number;
    problems?: string[];
    treatments?: Array<{ product: string; date: Date; effective: boolean }>;
  }
): Promise<void> {
  const storageKey = `garden_memory_${gardenId}_zone_${zoneId}`;
  const existing = localStorage.getItem(storageKey);
  if (!existing) return;

  const memory: ZoneMemory = JSON.parse(existing);
  const record = memory.plantingHistory.find(
    (r) => r.plant === plant && r.date.getTime() === new Date(date).getTime()
  );

  if (record) {
    record.result = {
      yield: result.yield,
      quality: result.quality,
      problems: result.problems || [],
      treatments: result.treatments || [],
    };
    localStorage.setItem(storageKey, JSON.stringify(memory));
  }
}

/**
 * Recupera memoria completa di una zona
 */
export async function getZoneMemory(zoneId: string, gardenId: string): Promise<ZoneMemory | null> {
  const storageKey = `garden_memory_${gardenId}_zone_${zoneId}`;
  const existing = localStorage.getItem(storageKey);
  if (!existing) return null;

  const memory: ZoneMemory = JSON.parse(existing);
  
  // Calcola pattern da storia se non presenti
  if (memory.plantingHistory.length > 0 && !memory.patterns.bestPlantingDate) {
    calculateZonePatterns(memory);
  }

  return memory;
}

/**
 * Calcola pattern da storia piantagioni
 */
function calculateZonePatterns(memory: ZoneMemory): void {
  const successfulPlantings = memory.plantingHistory.filter(
    (r) => r.result.yield > 0 && r.result.quality >= 3
  );
  const failedPlantings = memory.plantingHistory.filter(
    (r) => r.result.yield === 0 || r.result.quality < 2
  );

  // Calcola date migliori/peggiori
  if (successfulPlantings.length > 0) {
    const avgBestDate = new Date(
      successfulPlantings.reduce((sum, r) => sum + r.date.getTime(), 0) / successfulPlantings.length
    );
    memory.patterns.bestPlantingDate = avgBestDate;
  }

  if (failedPlantings.length > 0) {
    const avgWorstDate = new Date(
      failedPlantings.reduce((sum, r) => sum + r.date.getTime(), 0) / failedPlantings.length
    );
    memory.patterns.worstPlantingDate = avgWorstDate;
  }

  // Rileva problemi ricorrenti
  const problemCounts = new Map<string, { count: number; months: Set<number> }>();
  memory.plantingHistory.forEach((r) => {
    r.result.problems.forEach((problem) => {
      const existing = problemCounts.get(problem) || { count: 0, months: new Set<number>() };
      existing.count++;
      existing.months.add(r.date.getMonth() + 1);
      problemCounts.set(problem, existing);
    });
  });

  memory.patterns.recurringProblems = Array.from(problemCounts.entries())
    .filter(([_, data]) => data.count >= 2) // Almeno 2 occorrenze
    .map(([problem, data]) => ({
      problem,
      frequency: data.count,
      months: Array.from(data.months),
    }));

  // Rileva trattamenti efficaci
  const treatmentSuccess = new Map<string, { successes: number; total: number }>();
  memory.plantingHistory.forEach((r) => {
    r.result.treatments.forEach((t) => {
      const key = `${r.result.problems.join(',')}_${t.product}`;
      const existing = treatmentSuccess.get(key) || { successes: 0, total: 0 };
      existing.total++;
      if (t.effective) existing.successes++;
      treatmentSuccess.set(key, existing);
    });
  });

  memory.patterns.successfulTreatments = Array.from(treatmentSuccess.entries())
    .map(([key, data]) => {
      const [problems, product] = key.split('_');
      return {
        problem: problems,
        treatment: product,
        successRate: data.successes / data.total,
      };
    })
    .filter((t) => t.successRate >= 0.6) // Almeno 60% successo
    .sort((a, b) => b.successRate - a.successRate);
}

/**
 * Trova correlazioni per un fattore specifico
 */
export async function findCorrelations(
  zoneId: string,
  gardenId: string,
  factor: string
): Promise<Correlation[]> {
  const memory = await getZoneMemory(zoneId, gardenId);
  if (!memory) return [];

  return memory.correlations.filter((c) => c.factorType === factor);
}

/**
 * Ottiene data migliore per piantagione basata su storia
 */
export async function getBestPlantingDate(
  zoneId: string,
  gardenId: string,
  plantName: string
): Promise<Date | null> {
  const memory = await getZoneMemory(zoneId, gardenId);
  if (!memory) return null;

  // Cerca piantagioni della stessa pianta con buoni risultati
  const plantPlantings = memory.plantingHistory.filter(
    (r) => r.plant === plantName && r.result.yield > 0 && r.result.quality >= 3
  );

  if (plantPlantings.length === 0) {
    // Usa pattern generale della zona
    return memory.patterns.bestPlantingDate || null;
  }

  // Calcola media date migliori per questa pianta specifica
  const avgDate = new Date(
    plantPlantings.reduce((sum, r) => sum + r.date.getTime(), 0) / plantPlantings.length
  );
  return avgDate;
}

/**
 * Ottiene problemi ricorrenti nella zona
 */
export async function getRecurringProblems(
  zoneId: string,
  gardenId: string
): Promise<Array<{ problem: string; frequency: number; months: number[] }>> {
  const memory = await getZoneMemory(zoneId, gardenId);
  if (!memory) return [];

  return memory.patterns.recurringProblems;
}

/**
 * Salva memoria albero da frutto
 */
export async function saveTreeMemory(
  treeId: string,
  treeName: string,
  gardenId: string,
  treeData: {
    treeType?: 'Pome' | 'Stone' | 'Citrus' | 'Nut' | 'Berry';
    treeAge: number;
    production?: {
      year: number;
      yield: number;
      quality: number;
      alternance: 'carica' | 'scarica';
    };
    pruning?: {
      date: Date;
      type: string;
      result: 'good' | 'bad';
    };
  }
): Promise<void> {
  const storageKey = `garden_memory_${gardenId}_tree_${treeId}`;
  const existing = localStorage.getItem(storageKey);
  const treeMemory: TreeMemory = existing
    ? JSON.parse(existing)
    : {
        treeId,
        treeName,
        treeType: treeData.treeType,
        treeAge: treeData.treeAge,
        gardenId,
        productionHistory: [],
        alternancePattern: {},
        pruningHistory: [],
      };

  if (treeData.production) {
    treeMemory.productionHistory.push({
      year: treeData.production.year,
      yield: treeData.production.yield,
      quality: treeData.production.quality,
      alternance: treeData.production.alternance,
      treatments: [],
      pruning: {
        date: new Date(),
        type: 'unknown',
        result: 'good',
      },
    });

    // Aggiorna pattern alternanza
    if (treeData.production.alternance === 'carica') {
      treeMemory.alternancePattern.lastCarica = treeData.production.year;
    } else {
      treeMemory.alternancePattern.lastScarica = treeData.production.year;
    }

    // Predici prossima alternanza
    if (treeMemory.alternancePattern.lastCarica && treeMemory.alternancePattern.lastScarica) {
      const lastCarica = treeMemory.alternancePattern.lastCarica;
      const lastScarica = treeMemory.alternancePattern.lastScarica;
      treeMemory.alternancePattern.predictedNext =
        lastCarica > lastScarica ? 'scarica' : 'carica';
    }
  }

  if (treeData.pruning) {
    treeMemory.pruningHistory.push({
      date: treeData.pruning.date,
      type: treeData.pruning.type,
      result: treeData.pruning.result,
    });
  }

  localStorage.setItem(storageKey, JSON.stringify(treeMemory));
}

/**
 * Recupera memoria albero
 */
export async function getTreeMemory(treeId: string, gardenId: string): Promise<TreeMemory | null> {
  const storageKey = `garden_memory_${gardenId}_tree_${treeId}`;
  const existing = localStorage.getItem(storageKey);
  if (!existing) return null;

  return JSON.parse(existing);
}

