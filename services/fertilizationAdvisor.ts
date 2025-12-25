/**
 * Fertilization Advisor Service
 * Suggerisce fertilizzazioni basate su analisi foto e confronto crescita
 */

import { PlantPhotoLog } from '../types';
import { PhotoComparison } from './photoComparisonService';
import { PlantMasterSheet } from '../types';
import { getMasterSheetSync } from './plantMasterService';

export interface FertilizationSuggestion {
  needed: boolean;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  recommendedNutrients: {
    nitrogen?: boolean;
    phosphorus?: boolean;
    potassium?: boolean;
    micro?: boolean;
  };
  dosage: {
    amount: number; // grammi per m²
    frequency: string; // "ogni 2 settimane"
    method: 'foliar' | 'soil' | 'fertigation';
  };
  timing: {
    bestTime: string; // "subito" | "questa settimana" | "prossima settimana"
    urgency: 'immediate' | 'soon' | 'planned';
  };
  notes: string[];
}

/**
 * Analizza se è necessaria fertilizzazione basandosi su foto e confronto
 */
export function analyzeFertilizationNeed(
  currentPhoto: PlantPhotoLog,
  comparison: PhotoComparison | null,
  plantName: string,
  lifecycleState: string,
  daysFromPlanting: number
): FertilizationSuggestion {
  const masterData = getMasterSheetSync(plantName);
  const defaultSuggestion: FertilizationSuggestion = {
    needed: false,
    priority: 'low',
    reason: '',
    recommendedNutrients: {},
    dosage: {
      amount: 0,
      frequency: '',
      method: 'soil'
    },
    timing: {
      bestTime: '',
      urgency: 'planned'
    },
    notes: []
  };

  if (!masterData) {
    return defaultSuggestion;
  }

  const analysisResult = currentPhoto.analysisResult;
  if (!analysisResult) {
    return defaultSuggestion;
  }

  // Segnali che indicano bisogno di fertilizzazione
  const signals: string[] = [];
  let priority: 'high' | 'medium' | 'low' = 'low';
  let needed = false;

  // 1. Crescita lenta
  if (analysisResult.growthRate === 'slow') {
    signals.push('Crescita rallentata rilevata');
    priority = 'high';
    needed = true;
  }

  // 2. Confronto con foto precedente mostra declino
  if (comparison && comparison.growthDelta.growthRateChange === 'declined') {
    signals.push('Rallentamento crescita rispetto alla settimana scorsa');
    priority = 'high';
    needed = true;
  }

  // 3. LeafCount inferiore all'atteso
  if (analysisResult.leafCount !== undefined) {
    const expectedLeafCount = calculateExpectedLeafCount(daysFromPlanting, lifecycleState);
    if (expectedLeafCount && analysisResult.leafCount < expectedLeafCount * 0.7) {
      signals.push(`Foglie inferiori all'atteso (${analysisResult.leafCount} vs ${expectedLeafCount} attese)`);
      priority = 'medium';
      needed = true;
    }
  }

  // 4. Problemi visibili che possono indicare carenze
  if (analysisResult.issues && analysisResult.issues.length > 0) {
    const nutrientIssues = analysisResult.issues.filter(issue => 
      issue.toLowerCase().includes('giall') ||
      issue.toLowerCase().includes('clorosi') ||
      issue.toLowerCase().includes('debole') ||
      issue.toLowerCase().includes('pallid')
    );
    if (nutrientIssues.length > 0) {
      signals.push(`Problemi visibili: ${nutrientIssues.join(', ')}`);
      priority = 'high';
      needed = true;
    }
  }

  if (!needed) {
    return defaultSuggestion;
  }

  // Determina nutrienti necessari basandosi su fase e categoria pianta
  const recommendedNutrients = determineNutrients(masterData, lifecycleState, analysisResult);

  // Calcola dosaggio basato su categoria pianta e fase
  const dosage = calculateDosage(masterData, lifecycleState, priority);

  // Determina timing
  const timing = determineTiming(priority, lifecycleState);

  // Note aggiuntive
  const notes: string[] = [];
  if (lifecycleState === 'Nursing') {
    notes.push('In fase Nursing, usa fertilizzante liquido diluito (50% della dose normale)');
  } else if (lifecycleState === 'Hardening') {
    notes.push('In fase Hardening, aumenta gradualmente la concentrazione');
  }
  
  if (comparison && comparison.growthDelta.healthChange === 'worsened') {
    notes.push('Monitora la risposta dopo la fertilizzazione');
  }

  return {
    needed: true,
    priority,
    reason: signals.join('. '),
    recommendedNutrients,
    dosage,
    timing,
    notes
  };
}

/**
 * Determina quali nutrienti sono necessari
 */
function determineNutrients(
  masterData: PlantMasterSheet,
  lifecycleState: string,
  analysisResult: PlantPhotoLog['analysisResult']
): FertilizationSuggestion['recommendedNutrients'] {
  const nutrients: FertilizationSuggestion['recommendedNutrients'] = {};

  // In base alla categoria della pianta
  if (masterData.nutrientCategory === 'LEAFY') {
    nutrients.nitrogen = true; // Foglie necessitano azoto
  } else if (masterData.nutrientCategory === 'FRUITING') {
    nutrients.phosphorus = true; // Frutti necessitano fosforo
    nutrients.potassium = true; // E potassio
  } else if (masterData.nutrientCategory === 'ROOT') {
    nutrients.potassium = true; // Radici necessitano potassio
  }

  // In base alla fase
  if (lifecycleState === 'Nursing' || lifecycleState === 'Germination') {
    nutrients.nitrogen = true; // Crescita iniziale necessita azoto
    nutrients.micro = true; // Microelementi importanti per sviluppo
  } else if (lifecycleState === 'Hardening' || lifecycleState === 'Transplanting') {
    nutrients.phosphorus = true; // Sviluppo radici
  }

  // Se ci sono problemi visibili, aggiungi microelementi
  if (analysisResult?.issues && analysisResult.issues.length > 0) {
    nutrients.micro = true;
  }

  return nutrients;
}

/**
 * Calcola dosaggio raccomandato
 */
function calculateDosage(
  masterData: PlantMasterSheet,
  lifecycleState: string,
  priority: 'high' | 'medium' | 'low'
): FertilizationSuggestion['dosage'] {
  // Dosaggi base per categoria (grammi per m²)
  let baseAmount = 30; // Default

  if (masterData.nutrientCategory === 'LEAFY') {
    baseAmount = 40; // Piante da foglia necessitano più fertilizzante
  } else if (masterData.nutrientCategory === 'ROOT') {
    baseAmount = 25; // Piante da radice meno
  }

  // Aggiusta per fase
  if (lifecycleState === 'Nursing' || lifecycleState === 'Germination') {
    baseAmount = baseAmount * 0.5; // Metà dose per piantine giovani
  }

  // Aggiusta per priorità
  if (priority === 'high') {
    baseAmount = baseAmount * 1.2; // 20% in più se urgente
  } else if (priority === 'low') {
    baseAmount = baseAmount * 0.8; // 20% in meno se non urgente
  }

  // Determina metodo in base alla fase
  let method: 'foliar' | 'soil' | 'fertigation' = 'soil';
  if (lifecycleState === 'Nursing') {
    method = 'foliar'; // Foliare per piantine giovani
  } else if (lifecycleState === 'Production') {
    method = 'fertigation'; // Fertirrigazione per produzione
  }

  return {
    amount: Math.round(baseAmount),
    frequency: priority === 'high' ? 'ogni settimana' : 'ogni 2 settimane',
    method
  };
}

/**
 * Determina timing ottimale
 */
function determineTiming(
  priority: 'high' | 'medium' | 'low',
  lifecycleState: string
): FertilizationSuggestion['timing'] {
  if (priority === 'high') {
    return {
      bestTime: 'subito',
      urgency: 'immediate'
    };
  } else if (priority === 'medium') {
    return {
      bestTime: 'questa settimana',
      urgency: 'soon'
    };
  } else {
    return {
      bestTime: 'prossima settimana',
      urgency: 'planned'
    };
  }
}

/**
 * Calcola numero atteso di foglie basato su giorni e fase
 */
function calculateExpectedLeafCount(
  daysFromPlanting: number,
  lifecycleState: string
): number | undefined {
  if (lifecycleState === 'Germination') {
    return 0; // Solo cotiledoni
  } else if (lifecycleState === 'Nursing') {
    // ~1 foglia ogni settimana nelle prime settimane
    return Math.min(4, Math.floor(daysFromPlanting / 7));
  } else if (lifecycleState === 'Hardening' || lifecycleState === 'Transplanting') {
    // Dopo 30 giorni, crescita più rapida
    return 4 + Math.floor((daysFromPlanting - 30) / 5);
  }
  return undefined; // Production troppo variabile
}




