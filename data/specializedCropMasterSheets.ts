/**
 * File di esportazione per tutti i master sheets delle colture specializzate (Pro Features)
 * Questo file facilita l'importazione di tutte le varietà specializzate
 */

export { strawberryMasterSheets } from './strawberryMasterSheets';
export { fruitTreeMasterSheets } from './fruitTreeMasterSheets';
export { oliveMasterSheets } from './oliveMasterSheets';
export { vineMasterSheets } from './vineMasterSheets';

// Le erbe aromatiche sono già incluse in plantMasterSheets.ts
// e possono essere filtrate per cropType === 'Aromatic' || 'Medicinal'

/**
 * Funzione helper per ottenere tutti i master sheets specializzati
 */
import { PlantMasterSheet } from '../types';
import { strawberryMasterSheets } from './strawberryMasterSheets';
import { fruitTreeMasterSheets } from './fruitTreeMasterSheets';
import { oliveMasterSheets } from './oliveMasterSheets';
import { vineMasterSheets } from './vineMasterSheets';
import { plantMasterSheets } from './plantMasterSheets';

export const getAllSpecializedMasterSheets = (): PlantMasterSheet[] => {
  return [
    ...strawberryMasterSheets,
    ...fruitTreeMasterSheets,
    ...oliveMasterSheets,
    ...vineMasterSheets,
    // Filtra erbe aromatiche da plantMasterSheets
    ...plantMasterSheets.filter(p => p.cropType === 'Aromatic' || p.cropType === 'Medicinal')
  ];
};

/**
 * Funzione helper per ottenere master sheets per tipo di coltura
 */
export const getMasterSheetsByCropType = (cropType: string): PlantMasterSheet[] => {
  switch (cropType) {
    case 'Strawberry':
      return strawberryMasterSheets;
    case 'FruitTree':
      return fruitTreeMasterSheets;
    case 'Olive':
      return oliveMasterSheets;
    case 'Vine':
      return vineMasterSheets;
    case 'Aromatic':
    case 'Medicinal':
      return plantMasterSheets.filter(p => p.cropType === cropType);
    default:
      return [];
  }
};

