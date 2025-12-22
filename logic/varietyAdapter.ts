'use client';

import { PlantMasterSheet, VarietyMapping } from '../types';

/**
 * Adatta i dati di germinazione in base ai tag comportamentali della varietà
 * Esempio: varietà Chinense hanno tempi di germinazione più lunghi e temperatura più alta
 */
export function adaptGerminationForVariety(
  masterData: PlantMasterSheet,
  varietyTags: string[]
): Partial<PlantMasterSheet['germination']> {
  const adaptations: Partial<PlantMasterSheet['germination']> = {};

  // Adattamento per varietà Chinense (peperoncini)
  if (varietyTags.includes('chinense')) {
    adaptations.emergenceDays = {
      min: 14,
      max: 28 // Più lungo rispetto al default 7-21
    };
    
    if (masterData.germination.optimalTempRange) {
      adaptations.optimalTempRange = {
        min: Math.max(masterData.germination.optimalTempRange.min, 24),
        max: Math.max(masterData.germination.optimalTempRange.max, 28)
      };
    } else {
      adaptations.optimalTempRange = { min: 24, max: 28 };
    }
    
    adaptations.heatingMatTemp = 26; // Temperatura più alta per Chinense
    adaptations.coveringInstructions = 'Tieni la pellicola più a lungo - le varietà Chinense germinano più lentamente';
  }

  // Adattamento per varietà Annuum (peperoncini)
  if (varietyTags.includes('annuum')) {
    adaptations.emergenceDays = {
      min: 7,
      max: 14 // Più veloce rispetto al default
    };
    
    if (masterData.germination.optimalTempRange) {
      adaptations.optimalTempRange = {
        min: Math.min(masterData.germination.optimalTempRange.min, 20),
        max: Math.min(masterData.germination.optimalTempRange.max, 24)
      };
    } else {
      adaptations.optimalTempRange = { min: 20, max: 24 };
    }
    
    adaptations.heatingMatTemp = 22; // Temperatura standard per Annuum
  }

  return adaptations;
}

/**
 * Adatta i dati di nursing in base ai tag comportamentali della varietà
 */
export function adaptNursingForVariety(
  masterData: PlantMasterSheet,
  varietyTags: string[]
): Partial<PlantMasterSheet['seedlingCare']> {
  const adaptations: Partial<PlantMasterSheet['seedlingCare']> = {};

  // Adattamento per varietà Chinense
  if (varietyTags.includes('chinense')) {
    adaptations.temperatureRange = { min: 22, max: 26 }; // Più caldo
    adaptations.warning = 'Le varietà Chinense sono molto sensibili agli sbalzi termici. Mantieni temperatura costante a 24°C.';
    
    if (masterData.seedlingCare.lightDetails) {
      adaptations.lightDetails = {
        ...masterData.seedlingCare.lightDetails,
        hours: 16, // Più ore di luce per Chinense
        intensity: 'High'
      };
    }
  }

  // Adattamento per varietà Annuum
  if (varietyTags.includes('annuum')) {
    adaptations.temperatureRange = { min: 20, max: 24 }; // Standard
  }

  // Adattamento per varietà indeterminate (pomodori)
  if (varietyTags.includes('indeterminate')) {
    adaptations.warning = 'Varietà indeterminata: crescerà in altezza all\'infinito. Prepara supporti alti (minimo 1,80m).';
    
    if (masterData.seedlingCare.lightDetails) {
      adaptations.lightDetails = {
        ...masterData.seedlingCare.lightDetails,
        hours: 14,
        intensity: 'High'
      };
    }
  }

  // Adattamento per varietà determinate (pomodori)
  if (varietyTags.includes('determinate')) {
    adaptations.warning = 'Varietà determinata: crescita limitata a cespuglio. Supporto basso sufficiente (50-60cm).';
  }

  return adaptations;
}

/**
 * Adatta i dati di trapianto in base ai tag comportamentali della varietà
 */
export function adaptTransplantingForVariety(
  masterData: PlantMasterSheet,
  varietyTags: string[]
): Partial<PlantMasterSheet['transplanting']> {
  const adaptations: Partial<PlantMasterSheet['transplanting']> = {};

  // Adattamento per varietà indeterminate
  if (varietyTags.includes('indeterminate')) {
    if (masterData.transplanting.finalPlanting?.supportInstallation) {
      adaptations.finalPlanting = {
        ...masterData.transplanting.finalPlanting,
        supportInstallation: {
          when: 'AtTransplant',
          instructions: 'INSTALLA SUBITO un tutore alto almeno 1,80m. La pianta crescerà continuamente in altezza.'
        }
      };
    }
  }

  // Adattamento per varietà determinate
  if (varietyTags.includes('determinate')) {
    if (masterData.transplanting.finalPlanting?.supportInstallation) {
      adaptations.finalPlanting = {
        ...masterData.transplanting.finalPlanting,
        supportInstallation: {
          when: 'AsNeeded',
          instructions: 'Supporto basso opzionale (50-60cm). La pianta si fermerà naturalmente.'
        }
      };
    }
  }

  // Adattamento per varietà Chinense
  if (varietyTags.includes('chinense')) {
    adaptations.minTemp = Math.max(masterData.transplanting.minTemp || 15, 18); // Più caldo
    adaptations.protectionInstructions = 'Le varietà Chinense sono molto sensibili al freddo. Proteggi dal vento e dal freddo notturno per almeno 1 settimana dopo il trapianto.';
  }

  return adaptations;
}

/**
 * Applica tutti gli adattamenti per una varietà specifica
 * Restituisce una copia dei dati master con gli adattamenti applicati
 */
export function adaptMasterDataForVariety(
  masterData: PlantMasterSheet,
  varietyName?: string,
  varietyTags?: string[]
): PlantMasterSheet {
  // Se non abbiamo tag, prova a trovarli dalla mappatura varietà
  let tags = varietyTags || [];
  
  if (!tags.length && varietyName) {
    const { varietyMappings } = require('../data/varietyMappings');
    const mapping = varietyMappings.find((vm: VarietyMapping) => 
      vm.varietyName.toLowerCase() === varietyName.toLowerCase()
    );
    if (mapping) {
      tags = mapping.tags;
    }
  }

  if (!tags.length) {
    // Nessun adattamento necessario
    return masterData;
  }

  // Applica adattamenti
  const adapted: PlantMasterSheet = {
    ...masterData,
    germination: {
      ...masterData.germination,
      ...adaptGerminationForVariety(masterData, tags)
    },
    seedlingCare: {
      ...masterData.seedlingCare,
      ...adaptNursingForVariety(masterData, tags)
    },
    transplanting: {
      ...masterData.transplanting,
      ...adaptTransplantingForVariety(masterData, tags)
    }
  };

  return adapted;
}

