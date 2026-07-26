/**
 * Plant Operations Service
 * Servizio per gestire operazioni su piante individuali
 */

import { 
  GardenPlant, 
  PlantOperation, 
  PlantHarvest, 
  BulkRowOperation,
  BulkOperationResult 
} from '../types/individualPlant';
import type { IStorageProvider } from '@/packages/core/storage/interface';

type PlantOperationsStorage = Pick<IStorageProvider, 'getIndividualPlant' | 'getIndividualPlants' | 'getPlantOperations' | 'createPlantOperation' | 'updateIndividualPlant' | 'uploadPhoto'>;

const requireStorageMethod = <K extends keyof PlantOperationsStorage>(storage: Partial<PlantOperationsStorage>, method: K): NonNullable<PlantOperationsStorage[K]> => {
  if ((storage as IStorageProvider).persistenceKind === 'local') throw new Error('Plant operations require durable cloud storage');
  const implementation = storage[method];
  if (!implementation) throw new Error(`Cloud plant persistence capability unavailable: ${method}`);
  return implementation.bind(storage) as NonNullable<PlantOperationsStorage[K]>;
};

/**
 * OPERAZIONI SINGOLE PIANTE
 */
export const createPlantOperation = async (
  storageProvider: Partial<PlantOperationsStorage>,
  plantId: string,
  gardenId: string,
  operation: Partial<PlantOperation> & { idempotencyKey?: string }
): Promise<PlantOperation> => {
  const create = requireStorageMethod(storageProvider, 'createPlantOperation');
  const candidate: Omit<PlantOperation, 'id' | 'createdAt' | 'updatedAt'> & { idempotencyKey: string } = {
    plantId,
    gardenId,
    operationType: operation.operationType!,
    operationCategory: getOperationCategory(operation.operationType!),
    date: operation.date || operation.operationDate || new Date().toISOString().split('T')[0],
    operationDate: operation.operationDate || operation.date || new Date().toISOString().split('T')[0],
    operationTime: operation.operationTime,
    quantity: operation.quantity,
    unit: operation.unit,
    productName: operation.productName,
    concentration: operation.concentration,
    effectivenessScore: operation.effectivenessScore,
    plantResponse: operation.plantResponse,
    weatherConditions: operation.weatherConditions,
    photos: operation.photos || [],
    notes: operation.notes,
    idempotencyKey: (operation as any).idempotencyKey || crypto.randomUUID(),
    sourceType: operation.sourceType || 'manual',
    actorType: operation.actorType || 'manual',
    recordedBy: operation.recordedBy || 'user',
  };
  const saved = await create(candidate);
  const read = requireStorageMethod(storageProvider, 'getPlantOperations');
  const persisted = (await read(plantId)).find((item: PlantOperation) => item.id === saved.id);
  if (!persisted) throw new Error('Plant operation write could not be verified after persistence');
  return persisted;
};

/**
 * OPERAZIONI DI MASSA
 */
export const createBulkOperation = async (
  storageProvider: Partial<PlantOperationsStorage>,
  gardenId: string,
  operation: BulkRowOperation,
  photos?: File[]
): Promise<BulkOperationResult> => {
  try {
    const plantIds = operation.plantIds || [];
    const operationsCreated: string[] = [];
    
    // Upload foto se presenti
    let photoUrls: string[] = [];
    if (photos && photos.length > 0) {
      photoUrls = await uploadPhotos(storageProvider, gardenId, photos);
    }

    // Crea operazioni per ogni pianta
    for (const plantId of plantIds) {
      const plantOperation = await createPlantOperation(storageProvider, plantId, gardenId, {
        operationType: operation.operationType,
        operationDate: operation.operationDate,
        quantity: operation.quantityPerPlant,
        unit: operation.unit,
        productName: operation.productName,
        notes: operation.notes,
        photos: photoUrls,
        idempotencyKey: `${operation.operationDate}:${operation.operationType}:${plantId}:${operation.rowId || operation.fieldRowId || 'selection'}`,
      });
      
      operationsCreated.push(plantOperation.id);
    }

    // Aggiorna salute piante se necessario
    if (operation.operationType === 'treatment') {
      // Lo stato salute cambia solo dopo un outcome osservato, non al semplice write.
    }

    return {
      success: true,
      operationsCreated: operationsCreated.length,
      plantsAffected: plantIds.length,
      operationIds: operationsCreated
    };
    
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return {
      success: false,
      operationsCreated: 0,
      plantsAffected: 0,
      operationIds: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

/**
 * AGGIORNAMENTO SALUTE PIANTE
 */
export const updatePlantHealth = async (
  storageProvider: Partial<PlantOperationsStorage>,
  plantId: string,
  healthData: {
    healthScore?: number;
    status?: GardenPlant['status'];
    notes?: string;
    photos?: string[];
  }
): Promise<void> => {
  const getPlant = requireStorageMethod(storageProvider, 'getIndividualPlant');
  const update = requireStorageMethod(storageProvider, 'updateIndividualPlant');
  const plant = await getPlant(plantId);
  if (!plant) throw new Error('Plant not found');
  await update(plantId, { ...healthData, photos: healthData.photos || plant.photos });
};

export const updateBulkPlantHealth = async (
  storageProvider: Partial<PlantOperationsStorage>,
  plantIds: string[],
  healthData: {
    healthScore?: number;
    status?: GardenPlant['status'];
    notes?: string;
    photos?: string[];
  }
): Promise<void> => {
  for (const plantId of plantIds) {
    await updatePlantHealth(storageProvider, plantId, healthData);
  }
};

/**
 * CALCOLI AUTOMATICI SALUTE
 */
export const calculateHealthImpact = (
  currentHealth: number,
  operationType: PlantOperation['operationType'],
  effectiveness?: number
): number => {
  const baseImpact: Partial<Record<PlantOperation['operationType'], number>> = {
    watering: 2,
    fertilizing: 3,
    treatment: 5,
    pruning: 1,
    harvest: 0,
    transplanting: -2,
    thinning: 1,
    staking: 1,
    mulching: 2,
    health: 0,
    work: 0
  };

  const impact = baseImpact[operationType] || 0;
  const effectivenessMultiplier = effectiveness ? effectiveness / 5 : 1; // 1-10 scale to 0.2-2
  
  const newHealth = Math.min(100, Math.max(0, currentHealth + (impact * effectivenessMultiplier)));
  return Math.round(newHealth);
};

export const updatePlantsHealthAfterTreatment = async (): Promise<void> => {
  throw new Error('Treatment alone cannot mutate plant health; record a measured observation outcome')
};

/**
 * GESTIONE FOTO
 */
export const uploadPhotos = async (storageProvider: Partial<PlantOperationsStorage>, gardenId: string, photos: File[]): Promise<string[]> => {
  const upload = requireStorageMethod(storageProvider, 'uploadPhoto');
  return Promise.all(photos.map(file => upload(file, `plant-operation-${crypto.randomUUID()}`, gardenId)));
};

export const compressPhoto = (file: File, maxWidth: number = 800): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * STRATEGIE FOTO INTELLIGENTI
 */
export const selectRepresentativePlants = (
  plants: GardenPlant[],
  count: number = 10
): GardenPlant[] => {
  // Seleziona piante rappresentative per ogni stato di salute
  const healthRanges = [
    { min: 90, max: 100, label: 'excellent' },
    { min: 70, max: 89, label: 'good' },
    { min: 50, max: 69, label: 'fair' },
    { min: 0, max: 49, label: 'poor' }
  ];
  
  const representative: GardenPlant[] = [];
  const plantsPerRange = Math.ceil(count / healthRanges.length);
  
  for (const range of healthRanges) {
    const plantsInRange = plants.filter(p => 
      p.healthScore >= range.min && p.healthScore <= range.max
    );
    
    if (plantsInRange.length > 0) {
      // Seleziona piante distribuite uniformemente nel filare
      const step = Math.max(1, Math.floor(plantsInRange.length / plantsPerRange));
      for (let i = 0; i < plantsInRange.length && representative.length < count; i += step) {
        representative.push(plantsInRange[i]);
      }
    }
  }
  
  return representative.slice(0, count);
};

export const selectProblemPlants = (plants: GardenPlant[]): GardenPlant[] => {
  return plants.filter(p => 
    p.status === 'diseased' || 
    p.status === 'dead' || 
    p.healthScore < 70
  );
};

/**
 * HELPER FUNCTIONS
 */
const getOperationCategory = (
  operationType: PlantOperation['operationType']
): PlantOperation['operationCategory'] => {
  const categoryMap: Record<string, PlantOperation['operationCategory']> = {
    'watering': 'irrigation',
    'fertilizing': 'nutrition',
    'treatment': 'protection',
    'pruning': 'maintenance',
    'harvest': 'maintenance',
    'transplanting': 'maintenance',
    'thinning': 'maintenance',
    'staking': 'maintenance',
    'mulching': 'maintenance'
  };
  
  return categoryMap[operationType] || 'maintenance';
};

/**
 * STATISTICHE E ANALYTICS
 */
export const getPlantOperationStats = async (
  storageProvider: Partial<PlantOperationsStorage>,
  plantId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{
  totalOperations: number;
  operationsByType: Record<string, number>;
  lastOperation?: PlantOperation;
  healthTrend: 'improving' | 'stable' | 'declining';
}> => {
  const operations = (await requireStorageMethod(storageProvider, 'getPlantOperations')(plantId)) as PlantOperation[];
  const filtered = operations.filter(item => { const date = item.operationDate || item.date; return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo) });
  const scores = filtered.flatMap(item => item.effectivenessScore === undefined ? [] : [item.effectivenessScore]);
  return {
    totalOperations: filtered.length,
    operationsByType: filtered.reduce<Record<string, number>>((result, item) => ({ ...result, [item.operationType]: (result[item.operationType] || 0) + 1 }), {}),
    lastOperation: filtered[0],
    healthTrend: scores.length < 2 ? 'stable' : scores[0] > scores[scores.length - 1] ? 'improving' : scores[0] < scores[scores.length - 1] ? 'declining' : 'stable'
  };
};

export const getRowOperationStats = async (
  storageProvider: Partial<PlantOperationsStorage>,
  gardenId: string,
  rowId: string,
  fieldRowId?: string
): Promise<{
  totalPlants: number;
  plantsWithOperations: number;
  avgOperationsPerPlant: number;
  lastOperationDate?: string;
  healthDistribution: Record<string, number>;
}> => {
  const plants = await requireStorageMethod(storageProvider, 'getIndividualPlants')(gardenId);
  const scoped = plants.filter(plant => plant.gardenRowId === rowId || plant.fieldRowId === fieldRowId);
  const histories = await Promise.all(scoped.map(plant => requireStorageMethod(storageProvider, 'getPlantOperations')(plant.id)));
  const healthDistribution = scoped.reduce<Record<string, number>>((result, plant) => {
    const key = plant.healthScore >= 90 ? 'excellent' : plant.healthScore >= 70 ? 'good' : plant.healthScore >= 50 ? 'fair' : 'poor';
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
  const dates = histories.flat().map(item => item.operationDate || item.date).filter(Boolean).sort().reverse();
  return {
    totalPlants: scoped.length,
    plantsWithOperations: histories.filter(items => items.length > 0).length,
    avgOperationsPerPlant: scoped.length ? histories.reduce((sum, items) => sum + items.length, 0) / scoped.length : 0,
    lastOperationDate: dates[0],
    healthDistribution,
  };
};

const plantOperationsService = {
  createPlantOperation,
  createBulkOperation,
  updatePlantHealth,
  updateBulkPlantHealth,
  calculateHealthImpact,
  uploadPhotos,
  compressPhoto,
  selectRepresentativePlants,
  selectProblemPlants,
  getPlantOperationStats,
  getRowOperationStats
};

export default plantOperationsService;
