/**
 * Fertilization Calculator Service
 * Calcola dosaggi precisi basati su analisi suolo e fabbisogno pianta
 */

import { SoilAnalysis } from './soilAnalysisService';
import { PlantMasterSheet } from '../types';

export interface FertilizationCalculation {
  needed: boolean;
  elementFocus: 'N' | 'P' | 'K' | 'Micro' | 'None';
  totalDosage: number; // Grammi totali
  dosagePerSqm: number; // Grammi per m²
  frequency: string;
  timing: {
    bestTime: string;
    urgency: 'immediate' | 'soon' | 'planned';
  };
  recommendedProducts: Array<{
    name: string;
    npk: string; // Es. "10-5-5"
    dosage: number;
    unit: string;
    reason: string;
  }>;
  notes: string[];
}

/**
 * Calcola dosaggio fertilizzazione basato su analisi suolo e fabbisogno pianta
 */
export function calculatePreciseFertilization(
  soilAnalysis: SoilAnalysis,
  plantMasterData: PlantMasterSheet,
  phase: 'Establishment' | 'Vegetative' | 'Reproductive',
  areaSqMeters: number = 1
): FertilizationCalculation {
  const notes: string[] = [];
  const recommendedProducts: FertilizationCalculation['recommendedProducts'] = [];
  
  let totalDosageN = 0;
  let totalDosageP = 0;
  let totalDosageK = 0;
  let elementFocus: 'N' | 'P' | 'K' | 'Micro' | 'None' = 'None';
  let needed = false;

  // Valori ottimali di riferimento
  const optimalValues = {
    nitrogenN: 20,
    phosphorusP: 15,
    potassiumK: 200
  };

  // Fabbisogno pianta per fase (grammi per m²)
  const plantNeeds = getPlantNutrientNeeds(plantMasterData, phase);

  // Calcola carenze
  if (soilAnalysis.nitrogenN !== undefined && soilAnalysis.nitrogenN < optimalValues.nitrogenN) {
    const deficiency = optimalValues.nitrogenN - soilAnalysis.nitrogenN;
    const plantNeed = plantNeeds.nitrogen;
    const totalNeed = deficiency + plantNeed;
    
    totalDosageN = totalNeed * areaSqMeters;
    elementFocus = 'N';
    needed = true;

    recommendedProducts.push({
      name: 'Concime azotato (Nitrato ammonico 33-0-0)',
      npk: '33-0-0',
      dosage: Math.round(totalDosageN / 0.33), // 33% N
      unit: 'g',
      reason: `Carenza azoto: ${soilAnalysis.nitrogenN.toFixed(1)} mg/kg + fabbisogno pianta`
    });
  }

  if (soilAnalysis.phosphorusP !== undefined && soilAnalysis.phosphorusP < optimalValues.phosphorusP) {
    const deficiency = optimalValues.phosphorusP - soilAnalysis.phosphorusP;
    const plantNeed = plantNeeds.phosphorus;
    const totalNeed = deficiency + plantNeed;
    
    totalDosageP = totalNeed * areaSqMeters;
    if (elementFocus === 'None') elementFocus = 'P';
    needed = true;

    recommendedProducts.push({
      name: 'Concime fosfatico (Perfosfato 0-20-0)',
      npk: '0-20-0',
      dosage: Math.round(totalDosageP / 0.20), // 20% P
      unit: 'g',
      reason: `Carenza fosforo: ${soilAnalysis.phosphorusP.toFixed(1)} mg/kg + fabbisogno pianta`
    });
  }

  if (soilAnalysis.potassiumK !== undefined && soilAnalysis.potassiumK < optimalValues.potassiumK) {
    const deficiency = optimalValues.potassiumK - soilAnalysis.potassiumK;
    const plantNeed = plantNeeds.potassium;
    const totalNeed = deficiency + plantNeed;
    
    totalDosageK = totalNeed * areaSqMeters;
    if (elementFocus === 'None') elementFocus = 'K';
    needed = true;

    recommendedProducts.push({
      name: 'Concime potassico (Solfato di potassio 0-0-50)',
      npk: '0-0-50',
      dosage: Math.round(totalDosageK / 0.50), // 50% K
      unit: 'g',
      reason: `Carenza potassio: ${soilAnalysis.potassiumK.toFixed(1)} mg/kg + fabbisogno pianta`
    });
  }

  // Se tutti e tre sono necessari, suggerisci concime completo
  if (totalDosageN > 0 && totalDosageP > 0 && totalDosageK > 0) {
    recommendedProducts.unshift({
      name: 'Concime completo NPK (es. 10-10-10)',
      npk: '10-10-10',
      dosage: Math.max(
        Math.round(totalDosageN / 0.10),
        Math.round(totalDosageP / 0.10),
        Math.round(totalDosageK / 0.10)
      ),
      unit: 'g',
      reason: 'Carenze multiple: suggerito concime completo'
    });
  }

  // Verifica micro-nutrienti
  const microDeficiencies: string[] = [];
  if (soilAnalysis.ironFe !== undefined && soilAnalysis.ironFe < 5) {
    microDeficiencies.push('Ferro');
  }
  if (soilAnalysis.zincZn !== undefined && soilAnalysis.zincZn < 2) {
    microDeficiencies.push('Zinco');
  }
  if (soilAnalysis.manganeseMn !== undefined && soilAnalysis.manganeseMn < 10) {
    microDeficiencies.push('Manganese');
  }

  if (microDeficiencies.length > 0) {
    recommendedProducts.push({
      name: 'Concime microelementi',
      npk: '0-0-0',
      dosage: 20,
      unit: 'g/m²',
      reason: `Carenze: ${microDeficiencies.join(', ')}`
    });
    if (elementFocus === 'None') elementFocus = 'Micro';
    needed = true;
  }

  // Note aggiuntive
  if (soilAnalysis.ph !== undefined) {
    if (soilAnalysis.ph < 6.0) {
      notes.push('pH basso: alcuni nutrienti potrebbero essere meno disponibili');
    } else if (soilAnalysis.ph > 7.5) {
      notes.push('pH alto: ferro e manganese potrebbero essere meno disponibili');
    }
  }

  if (soilAnalysis.organicMatterPercent !== undefined && soilAnalysis.organicMatterPercent < 3) {
    notes.push('Bassa materia organica: considera aggiunta di compost');
  }

  // Determina timing
  const urgency = determineUrgency(soilAnalysis, plantNeeds);
  const bestTime = urgency === 'immediate' ? 'subito' : 
                   urgency === 'soon' ? 'questa settimana' : 
                   'prossima settimana';

  const totalDosage = totalDosageN + totalDosageP + totalDosageK;
  const dosagePerSqm = totalDosage / areaSqMeters;

  return {
    needed,
    elementFocus,
    totalDosage: Math.round(totalDosage * 10) / 10,
    dosagePerSqm: Math.round(dosagePerSqm * 10) / 10,
    frequency: phase === 'Establishment' ? 'Una volta' : 'Ogni 2-3 settimane',
    timing: {
      bestTime,
      urgency
    },
    recommendedProducts,
    notes
  };
}

/**
 * Ottiene fabbisogno nutrizionale pianta per fase
 */
function getPlantNutrientNeeds(
  plant: PlantMasterSheet,
  phase: 'Establishment' | 'Vegetative' | 'Reproductive'
): { nitrogen: number; phosphorus: number; potassium: number } {
  // Fabbisogno base per categoria pianta (grammi per m²)
  const baseNeeds: Record<string, Record<string, { n: number; p: number; k: number }>> = {
    'LEAFY': {
      'Establishment': { n: 5, p: 3, k: 4 },
      'Vegetative': { n: 15, p: 5, k: 10 },
      'Reproductive': { n: 10, p: 3, k: 8 }
    },
    'FRUITING': {
      'Establishment': { n: 5, p: 5, k: 4 },
      'Vegetative': { n: 10, p: 8, k: 12 },
      'Reproductive': { n: 8, p: 12, k: 15 }
    },
    'ROOT': {
      'Establishment': { n: 3, p: 5, k: 4 },
      'Vegetative': { n: 8, p: 10, k: 12 },
      'Reproductive': { n: 5, p: 8, k: 15 }
    },
    'LEGUME': {
      'Establishment': { n: 2, p: 3, k: 2 },
      'Vegetative': { n: 3, p: 4, k: 5 },
      'Reproductive': { n: 2, p: 3, k: 6 }
    }
  };

  const category = plant.nutrientCategory || 'GENERIC';
  const needs = baseNeeds[category]?.[phase] || baseNeeds['LEAFY'][phase];

  return {
    nitrogen: needs.n,
    phosphorus: needs.p,
    potassium: needs.k
  };
}

/**
 * Determina urgenza fertilizzazione
 */
function determineUrgency(
  soilAnalysis: SoilAnalysis,
  plantNeeds: { nitrogen: number; phosphorus: number; potassium: number }
): 'immediate' | 'soon' | 'planned' {
  const optimalValues = {
    nitrogenN: 20,
    phosphorusP: 15,
    potassiumK: 200
  };

  let criticalDeficiencies = 0;

  if (soilAnalysis.nitrogenN !== undefined && 
      soilAnalysis.nitrogenN < optimalValues.nitrogenN * 0.5) {
    criticalDeficiencies++;
  }
  if (soilAnalysis.phosphorusP !== undefined && 
      soilAnalysis.phosphorusP < optimalValues.phosphorusP * 0.5) {
    criticalDeficiencies++;
  }
  if (soilAnalysis.potassiumK !== undefined && 
      soilAnalysis.potassiumK < optimalValues.potassiumK * 0.5) {
    criticalDeficiencies++;
  }

  if (criticalDeficiencies >= 2) {
    return 'immediate';
  } else if (criticalDeficiencies === 1) {
    return 'soon';
  } else {
    return 'planned';
  }
}




