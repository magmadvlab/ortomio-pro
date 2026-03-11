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

/**
 * OPERAZIONI SINGOLE PIANTE
 */
export const createPlantOperation = async (
  plantId: string,
  gardenId: string,
  operation: Partial<PlantOperation>
): Promise<PlantOperation> => {
  // TODO: Implementare con storage provider
  const newOperation: PlantOperation = {
    id: crypto.randomUUID(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Simula salvataggio
  console.log('Creating plant operation:', newOperation);
  
  return newOperation;
};

/**
 * OPERAZIONI DI MASSA
 */
export const createBulkOperation = async (
  operation: BulkRowOperation,
  photos?: File[]
): Promise<BulkOperationResult> => {
  try {
    const plantIds = operation.plantIds || [];
    const operationsCreated: string[] = [];
    
    // Upload foto se presenti
    let photoUrls: string[] = [];
    if (photos && photos.length > 0) {
      photoUrls = await uploadPhotos(photos);
    }

    // Crea operazioni per ogni pianta
    for (const plantId of plantIds) {
      const plantOperation = await createPlantOperation(plantId, '', {
        operationType: operation.operationType,
        operationDate: operation.operationDate,
        quantity: operation.quantityPerPlant,
        unit: operation.unit,
        productName: operation.productName,
        notes: operation.notes,
        photos: photoUrls
      });
      
      operationsCreated.push(plantOperation.id);
    }

    // Aggiorna salute piante se necessario
    if (operation.operationType === 'treatment') {
      await updatePlantsHealthAfterTreatment(plantIds);
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
  plantId: string,
  healthData: {
    healthScore?: number;
    status?: GardenPlant['status'];
    notes?: string;
    photos?: string[];
  }
): Promise<void> => {
  // TODO: Implementare con storage provider
  console.log('Updating plant health:', plantId, healthData);
  
  // Simula aggiornamento
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const updateBulkPlantHealth = async (
  plantIds: string[],
  healthData: {
    healthScore?: number;
    status?: GardenPlant['status'];
    notes?: string;
    photos?: string[];
  }
): Promise<void> => {
  for (const plantId of plantIds) {
    await updatePlantHealth(plantId, healthData);
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

export const updatePlantsHealthAfterTreatment = async (plantIds: string[]): Promise<void> => {
  // TODO: Implementare logica per aggiornare salute dopo trattamenti
  console.log('Updating health for plants after treatment:', plantIds.length);
  
  // Simula miglioramento salute per piante malate
  for (const plantId of plantIds) {
    // In un'implementazione reale, caricheresti la pianta dal database
    // e aggiorneresti la salute basandoti sul tipo di trattamento
    await updatePlantHealth(plantId, {
      healthScore: 85, // Miglioramento dopo trattamento
      notes: 'Salute migliorata dopo trattamento'
    });
  }
};

/**
 * GESTIONE FOTO
 */
export const uploadPhotos = async (photos: File[]): Promise<string[]> => {
  // TODO: Implementare upload reale
  console.log('Uploading photos:', photos.length);
  
  // Simula upload
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Restituisce URLs fake
  return photos.map((_, index) => `https://example.com/photo-${Date.now()}-${index}.jpg`);
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
  plantId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{
  totalOperations: number;
  operationsByType: Record<string, number>;
  lastOperation?: PlantOperation;
  healthTrend: 'improving' | 'stable' | 'declining';
}> => {
  // TODO: Implementare con storage provider
  console.log('Getting operation stats for plant:', plantId);
  
  // Simula statistiche
  return {
    totalOperations: 15,
    operationsByType: {
      watering: 8,
      fertilizing: 4,
      treatment: 2,
      pruning: 1
    },
    healthTrend: 'improving'
  };
};

export const getRowOperationStats = async (
  rowId: string,
  fieldRowId?: string
): Promise<{
  totalPlants: number;
  plantsWithOperations: number;
  avgOperationsPerPlant: number;
  lastOperationDate?: string;
  healthDistribution: Record<string, number>;
}> => {
  // TODO: Implementare con storage provider
  console.log('Getting row operation stats:', rowId, fieldRowId);
  
  // Simula statistiche
  return {
    totalPlants: 101,
    plantsWithOperations: 95,
    avgOperationsPerPlant: 12.5,
    lastOperationDate: new Date().toISOString().split('T')[0],
    healthDistribution: {
      excellent: 45,
      good: 35,
      fair: 15,
      poor: 6
    }
  };
};

export default {
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
