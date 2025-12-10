/**
 * Soil pH Engine
 * Verifica compatibilità pH tra pianta e terreno
 */

import { PlantMasterSheet } from '../types';
import { getAllMasterSheets } from '../services/plantMasterService';
import { plantPHData } from '../data/plantPHData';

export interface PHRequirement {
  ideal: { min: number; max: number };
  tolerable: { min: number; max: number };
  category: 'acidophilic' | 'neutral' | 'alkaline';
}

export interface PHAdvice {
  compatible: boolean;
  severity: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' | 'CRITICAL';
  message: string;
  suggestion?: string;
  alternatives?: PlantMasterSheet[];
}

/**
 * Verifica compatibilità pH tra pianta e terreno
 */
export const checkPHCompatibility = (
  plant: PlantMasterSheet,
  soilPH: number
): PHAdvice => {
  // Cerca requisiti pH per questa pianta
  const phReq = plantPHData[plant.id] || plantPHData[plant.commonName.toLowerCase()];
  
  if (!phReq) {
    // Nessun dato pH disponibile per questa pianta
    return {
      compatible: true,
      severity: 'ACCEPTABLE',
      message: `Nessun dato pH specifico disponibile per ${plant.commonName}. Verifica manualmente la compatibilità.`,
    };
  }

  // Controllo range ideale
  if (soilPH >= phReq.ideal.min && soilPH <= phReq.ideal.max) {
    return {
      compatible: true,
      severity: 'OPTIMAL',
      message: `✅ pH perfetto (${soilPH.toFixed(1)}) per ${plant.commonName}. Range ideale: ${phReq.ideal.min}-${phReq.ideal.max}.`,
    };
  }

  // Controllo range tollerabile
  if (soilPH >= phReq.tolerable.min && soilPH <= phReq.tolerable.max) {
    const suggestion = soilPH < phReq.ideal.min
      ? `Aggiungi zolfo o torba per acidificare il terreno fino a pH ${phReq.ideal.min}-${phReq.ideal.max}`
      : `Aggiungi calce o cenere per alcalinizzare il terreno fino a pH ${phReq.ideal.min}-${phReq.ideal.max}`;

    return {
      compatible: true,
      severity: 'ACCEPTABLE',
      message: `⚠️ pH accettabile ma non ideale (${soilPH.toFixed(1)}). ${plant.commonName} preferisce pH ${phReq.ideal.min}-${phReq.ideal.max}.`,
      suggestion,
    };
  }

  // Incompatibile
  const alternatives = getAlternativePlants(soilPH);
  
  return {
    compatible: false,
    severity: 'CRITICAL',
    message: `🔴 pH incompatibile! ${plant.commonName} richiede pH ${phReq.tolerable.min}-${phReq.tolerable.max}, ma il terreno ha pH ${soilPH.toFixed(1)}. La pianta non crescerà bene.`,
    suggestion: soilPH < phReq.tolerable.min
      ? `Aggiungi calce o cenere per aumentare il pH, oppure scegli una pianta acidofila`
      : `Aggiungi zolfo o torba per diminuire il pH, oppure scegli una pianta alcalina`,
    alternatives: alternatives.length > 0 ? alternatives : undefined,
  };
};

/**
 * Suggerisce piante compatibili con il pH esistente
 */
const getAlternativePlants = (soilPH: number): PlantMasterSheet[] => {
  const allPlants = getAllMasterSheets();
  
  return allPlants.filter(plant => {
    const phReq = plantPHData[plant.id] || plantPHData[plant.commonName.toLowerCase()];
    if (!phReq) return false;
    
    return soilPH >= phReq.tolerable.min && soilPH <= phReq.tolerable.max;
  });
};

/**
 * Ottiene il range pH ideale per una pianta
 */
export const getPlantPHRange = (plant: PlantMasterSheet): PHRequirement | null => {
  return plantPHData[plant.id] || plantPHData[plant.commonName.toLowerCase()] || null;
};

