/**
 * Soil Inference Engine
 * Infers soil characteristics from observed indicator plants
 */

import { SoilIndicatorPlant, soilIndicators } from '../data/soilIndicators';
import { SoilType, Garden } from '../types';

export interface SoilInference {
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedPH?: number;
  likelySoilType?: SoilType;
  estimatedNutrientLevel?: 'poor' | 'medium' | 'rich';
  estimatedMoisture?: 'dry' | 'medium' | 'wet';
  evidence: string[]; // Nomi delle piante osservate
  message: string;
}

/**
 * Calcola la moda (valore più frequente) di un array
 */
const mode = <T>(arr: T[]): T | undefined => {
  if (arr.length === 0) return undefined;
  
  const frequency: Map<T, number> = new Map();
  let maxCount = 0;
  let modeValue: T | undefined;

  for (const value of arr) {
    const count = (frequency.get(value) || 0) + 1;
    frequency.set(value, count);
    
    if (count > maxCount) {
      maxCount = count;
      modeValue = value;
    }
  }

  return modeValue;
};

/**
 * Infers soil characteristics from observed indicator plants
 */
export const inferSoilFromIndicators = (
  observedPlants: string[]
): SoilInference => {
  if (!observedPlants || observedPlants.length === 0) {
    return {
      confidence: 'LOW',
      message: 'Nessuna pianta indicatrice osservata. Impossibile inferire caratteristiche del terreno.',
      evidence: [],
    };
  }

  // Trova corrispondenze tra piante osservate e database
  const matches: SoilIndicatorPlant[] = observedPlants
    .map(plantName => {
      const normalized = plantName.toLowerCase().trim();
      return soilIndicators.find(
        ind => ind.name.toLowerCase().includes(normalized) ||
               ind.scientificName.toLowerCase().includes(normalized)
      );
    })
    .filter((ind): ind is SoilIndicatorPlant => ind !== undefined);

  if (matches.length === 0) {
    return {
      confidence: 'LOW',
      message: 'Nessuna pianta indicatrice riconosciuta tra quelle osservate.',
      evidence: observedPlants,
    };
  }

  // Aggrega inferenze
  const phValues: number[] = [];
  const soilTypes: SoilType[] = [];
  const nutrientLevels: Array<'poor' | 'medium' | 'rich'> = [];
  const moistureLevels: Array<'dry' | 'medium' | 'wet'> = [];

  for (const match of matches) {
    if (match.indicates.phRange) {
      const avgPH = (match.indicates.phRange.min + match.indicates.phRange.max) / 2;
      phValues.push(avgPH);
    }
    if (match.indicates.soilType) {
      soilTypes.push(...match.indicates.soilType);
    }
    if (match.indicates.nutrientLevel) {
      nutrientLevels.push(match.indicates.nutrientLevel);
    }
    if (match.indicates.moisture) {
      moistureLevels.push(match.indicates.moisture);
    }
  }

  // Calcola valori aggregati
  const avgPH = phValues.length > 0
    ? phValues.reduce((a, b) => a + b, 0) / phValues.length
    : undefined;

  const mostCommonSoilType = mode(soilTypes);
  const mostCommonNutrientLevel = mode(nutrientLevels);
  const mostCommonMoisture = mode(moistureLevels);

  // Determina confidence
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (matches.length >= 3 && avgPH !== undefined && mostCommonSoilType) {
    confidence = 'HIGH';
  } else if (matches.length >= 2) {
    confidence = 'MEDIUM';
  }

  // Costruisci messaggio
  const evidenceNames = matches.map(m => m.name);
  let message = `In base alle piante spontanee osservate (${evidenceNames.join(', ')}), `;

  if (avgPH !== undefined) {
    message += `il terreno ha probabilmente pH ~${avgPH.toFixed(1)}. `;
  }

  if (mostCommonSoilType) {
    message += `Tipo terreno probabile: ${mostCommonSoilType}. `;
  }

  if (mostCommonNutrientLevel) {
    const nutrientLabel = mostCommonNutrientLevel === 'rich' ? 'ricco' : mostCommonNutrientLevel === 'medium' ? 'medio' : 'povero';
    message += `Livello nutrienti: ${nutrientLabel}. `;
  }

  if (mostCommonMoisture) {
    const moistureLabel = mostCommonMoisture === 'wet' ? 'umido' : mostCommonMoisture === 'medium' ? 'medio' : 'secco';
    message += `Umidità: ${moistureLabel}.`;
  }

  return {
    confidence,
    estimatedPH: avgPH,
    likelySoilType: mostCommonSoilType,
    estimatedNutrientLevel: mostCommonNutrientLevel,
    estimatedMoisture: mostCommonMoisture,
    evidence: evidenceNames,
    message: message.trim(),
  };
};

/**
 * Applica inferenza al profilo giardino (aggiorna valori se non già presenti)
 */
export const applyInferenceToGarden = (
  inference: SoilInference,
  garden: Garden
): Partial<Garden> => {
  const updates: Partial<Garden> = {};

  // Aggiorna solo se non già specificato
  if (inference.estimatedPH && !garden.soilPh) {
    updates.soilPh = inference.estimatedPH;
  }

  if (inference.likelySoilType && !garden.soilType) {
    updates.soilType = inference.likelySoilType;
  }

  return updates;
};

