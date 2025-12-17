/**
 * Task Completion Hook
 * Registra automaticamente eventi di apprendimento quando vengono completati task
 */

import { GardenTask } from '../types';
import { CustomCrop, CropLearningEvent } from '../types/customCrop';
import { useStorage } from '../packages/core/hooks/useStorage';
import { getMasterSheet } from './plantMasterService';
import { processEvent } from './learningEngine';

/**
 * Verifica se una pianta è una coltura personalizzata
 */
export const isCustomCrop = async (plantName: string): Promise<CustomCrop | null> => {
  const { storageProvider } = useStorage();
  const crops = await storageProvider.getCustomCrops();
  return crops.find(c => c.common_name.toLowerCase() === plantName.toLowerCase()) || null;
};

/**
 * Hook che si attiva quando un task viene completato
 * Registra automaticamente eventi di apprendimento per colture personalizzate
 */
export const handleTaskCompletion = async (
  task: GardenTask,
  outcome?: {
    success: boolean;
    yield?: number;
    quality?: number;
    notes?: string;
  }
): Promise<void> => {
  try {
    // Verifica se la pianta è una coltura personalizzata
    const customCrop = await isCustomCrop(task.plantName);
    
    if (!customCrop) {
      // Non è una coltura personalizzata, non fare nulla
      return;
    }

    const { storageProvider } = useStorage();
    
    // Determina il tipo di evento in base al taskType
    let eventType: CropLearningEvent['event_type'] | null = null;
    let eventData: any = {
      date: task.date,
      plantName: task.plantName
    };

    switch (task.taskType) {
      case 'Sowing':
      case 'Transplant':
        eventType = 'planting';
        eventData.quantity = task.initialQuantity || task.currentQuantity || 1;
        break;
        
      case 'Harvest':
        eventType = 'harvest';
        eventData.quantity = task.currentQuantity || 1;
        if (outcome?.yield) {
          eventData.yield = outcome.yield;
        }
        if (outcome?.quality) {
          eventData.quality = outcome.quality;
        }
        break;
        
      case 'Fertilize':
        eventType = 'fertilize';
        eventData.productName = task.treatmentProductId || 'Unknown';
        break;
        
      case 'Treatment':
        eventType = 'treatment';
        eventData.productName = task.treatmentProductId || 'Unknown';
        // Cerca di estrarre il problema dalle note
        if (task.notes) {
          eventData.problem = task.notes;
        }
        break;
        
      case 'Plowing':
      case 'Subsoiling':
      case 'Harrowing':
      case 'Tilling':
      case 'Rolling':
      case 'Hoeing':
      case 'EarthingUp':
      case 'Mulching':
      case 'PostSowingRolling':
      case 'Clearing':
      case 'Stumping':
      case 'StoneRemoval':
      case 'Leveling':
      case 'DeepSubsoiling':
      case 'Digging':
      case 'DeepHarrowing':
      case 'Crumbling':
      case 'Scraping':
      case 'SurfaceLeveling':
      case 'MinimumTillage':
      case 'StripTillage':
      case 'NoTill':
        eventType = 'work';
        // Cast necessario perché TypeScript non riconosce tutti i valori di MechanicalWorkType come validi per taskType
        eventData.workType = task.taskType as any;
        break;
        
      default:
        // Altri tipi di task non vengono registrati come eventi di apprendimento
        return;
    }

    if (!eventType) {
      return;
    }

    // Crea l'evento di apprendimento
    const learningEvent: Omit<CropLearningEvent, 'id' | 'created_at'> = {
      custom_crop_id: customCrop.id,
      user_id: '', // Verrà impostato dal storage provider
      garden_id: task.gardenId,
      event_type: eventType,
      event_data: eventData,
      outcome: outcome ? {
        success: outcome.success,
        yield: outcome.yield,
        quality: outcome.quality,
        notes: outcome.notes
      } : undefined
    };

    // Registra l'evento
    await storageProvider.recordLearningEvent(learningEvent);
    
    // Processa l'evento per aggiornare i pattern
    await processEvent(customCrop.id, {
      ...learningEvent,
      id: '', // Verrà generato
      created_at: new Date().toISOString()
    } as CropLearningEvent);
    
  } catch (error) {
    // Non bloccare il flusso se c'è un errore nell'apprendimento
    console.error('Error in task completion hook:', error);
  }
};

/**
 * Registra un problema per una coltura personalizzata
 */
export const recordProblem = async (
  plantName: string,
  problem: string,
  gardenId: string
): Promise<void> => {
  try {
    const customCrop = await isCustomCrop(plantName);
    
    if (!customCrop) {
      return;
    }

    const { storageProvider } = useStorage();
    
    const learningEvent: Omit<CropLearningEvent, 'id' | 'created_at'> = {
      custom_crop_id: customCrop.id,
      user_id: '',
      garden_id: gardenId,
      event_type: 'problem',
      event_data: {
        date: new Date().toISOString(),
        plantName,
        problem
      }
    };

    await storageProvider.recordLearningEvent(learningEvent);
    await processEvent(customCrop.id, {
      ...learningEvent,
      id: '',
      created_at: new Date().toISOString()
    } as CropLearningEvent);
    
  } catch (error) {
    console.error('Error recording problem:', error);
  }
};

