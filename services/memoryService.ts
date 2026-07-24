/**
 * Memory Service
 * Estende gardenMemoryService per supportare colture personalizzate
 */

import { CustomCrop, CropLearningEvent } from '../types/customCrop';
import type { IStorageProvider } from '../packages/core/storage/interface';
import { generateSuggestions } from './learningEngine';

/**
 * Registra un evento per una coltura personalizzata nel sistema di memoria
 */
export const recordCustomCropEvent = async (
  storageProvider: IStorageProvider,
  customCropId: string,
  event: CropLearningEvent
): Promise<void> => {
  // Registra l'evento di apprendimento
  await storageProvider.recordLearningEvent({
    ...event,
    custom_crop_id: customCropId
  });
  
  // Aggiorna anche la memoria del giardino se necessario
  // (questo può essere esteso in futuro per correlazioni più avanzate)
};

/**
 * Recupera pattern per una coltura personalizzata
 */
export const getCustomCropPatterns = async (
  storageProvider: IStorageProvider,
  customCropId: string
): Promise<CustomCrop['learned_patterns'] | null> => {
  const crop = await storageProvider.getCustomCrop(customCropId);
  
  if (!crop) {
    return null;
  }
  
  return crop.learned_patterns;
};

/**
 * Suggerisce basandosi sulla memoria esistente per colture personalizzate
 */
export const suggestBasedOnMemory = async (
  storageProvider: IStorageProvider,
  customCropId: string,
  operation: 'planting' | 'harvest' | 'work' | 'treatment'
): Promise<string | null> => {
  const crop = await storageProvider.getCustomCrop(customCropId);
  
  if (!crop) {
    return null;
  }
  
  const suggestions = generateSuggestions(crop);
  
  switch (operation) {
    case 'planting':
      return suggestions.planting || null;
    case 'harvest':
      return suggestions.harvest || null;
    case 'work':
      return suggestions.works && suggestions.works.length > 0 
        ? suggestions.works[0] 
        : null;
    case 'treatment':
      return suggestions.treatments && suggestions.treatments.length > 0
        ? suggestions.treatments[0]
        : null;
    default:
      return null;
  }
};
