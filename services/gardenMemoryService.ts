/**
 * Garden Memory Service
 * Gestisce memoria contestuale profonda per zone, alberi, pattern e correlazioni
 */

import { ZoneMemory, TreeMemory, PlantingRecord, Correlation, LocalPattern, SeasonAnalysis } from '../types/memory';
import { Garden, GardenTask, HarvestLogData } from '../types';
import { CustomCrop } from '../types/customCrop';
import { useStorage } from '../packages/core/hooks/useStorage';
import { getSupabaseClient } from '@/config/supabase';

type MemoryScope = 'zone' | 'tree';

const memoryEventId = (scope: MemoryScope, scopeId: string) => `garden-memory:${scope}:${scopeId}`;

const getCloudClient = () => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Cloud agronomic memory unavailable');
  }
  return client;
};

const readMemorySnapshot = async <T>(
  gardenId: string,
  scope: MemoryScope,
  scopeId: string
): Promise<T | null> => {
  const client = getCloudClient();
  const { data, error } = await client
    .from('agronomic_memory_events')
    .select('payload')
    .eq('garden_id', gardenId)
    .eq('id', memoryEventId(scope, scopeId))
    .maybeSingle();

  if (error) throw error;
  return (data?.payload as { memory?: T } | null)?.memory ?? null;
};

const writeMemorySnapshot = async <T>(
  gardenId: string,
  scope: MemoryScope,
  scopeId: string,
  memory: T
): Promise<void> => {
  const client = getCloudClient();
  const occurredAt = new Date().toISOString();
  const { error } = await client.from('agronomic_memory_events').upsert({
    id: memoryEventId(scope, scopeId),
    garden_id: gardenId,
    event_type: 'outcome',
    source_service: 'gardenMemoryService',
    zone_id: scope === 'zone' ? scopeId : null,
    plant_id: scope === 'tree' ? scopeId : null,
    summary: `${scope} memory snapshot`,
    payload: { memory },
    occurred_at: occurredAt,
  }, { onConflict: 'id' });

  if (error) throw error;
};

const reviveZoneMemory = (memory: ZoneMemory): ZoneMemory => ({
  ...memory,
  plantingHistory: memory.plantingHistory.map((record) => ({
    ...record,
    date: new Date(record.date),
    result: {
      ...record.result,
      treatments: record.result.treatments.map((treatment) => ({
        ...treatment,
        date: new Date(treatment.date),
      })),
    },
  })),
  patterns: {
    ...memory.patterns,
    bestPlantingDate: memory.patterns.bestPlantingDate
      ? new Date(memory.patterns.bestPlantingDate)
      : undefined,
    worstPlantingDate: memory.patterns.worstPlantingDate
      ? new Date(memory.patterns.worstPlantingDate)
      : undefined,
  },
});

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
  const existing = await readMemorySnapshot<ZoneMemory>(gardenId, 'zone', zoneId);
  const memory: ZoneMemory = existing
    ? reviveZoneMemory(existing)
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
  await writeMemorySnapshot(gardenId, 'zone', zoneId, memory);
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
  const existing = await readMemorySnapshot<ZoneMemory>(gardenId, 'zone', zoneId);
  if (!existing) return;

  const memory = reviveZoneMemory(existing);
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
    await writeMemorySnapshot(gardenId, 'zone', zoneId, memory);
  }
}

/**
 * Recupera memoria completa di una zona
 */
export async function getZoneMemory(zoneId: string, gardenId: string): Promise<ZoneMemory | null> {
  const existing = await readMemorySnapshot<ZoneMemory>(gardenId, 'zone', zoneId);
  if (!existing) return null;

  const memory = reviveZoneMemory(existing);
  
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
  const existing = await readMemorySnapshot<TreeMemory>(gardenId, 'tree', treeId);
  const treeMemory: TreeMemory = existing
    ? existing
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

  await writeMemorySnapshot(gardenId, 'tree', treeId, treeMemory);
}

/**
 * Recupera memoria albero
 */
export async function getTreeMemory(treeId: string, gardenId: string): Promise<TreeMemory | null> {
  return readMemorySnapshot<TreeMemory>(gardenId, 'tree', treeId);
}
