/**
 * Utility functions for soil temperature and type calculations
 * These functions consider how different soil types affect heating and planting timing
 */

import { Garden } from '../types';

/**
 * Calcola il ritardo/anticipo di riscaldamento del suolo in base al tipo di terreno
 * 
 * Terreni scuri (argillosi, torbosi) assorbono più calore e si scaldano prima
 * Terreni chiari (sabbiosi, calcarei) riflettono più calore e si scaldano dopo
 * 
 * @param soilType - Tipo di terreno
 * @returns Giorni di anticipo (negativo) o ritardo (positivo) rispetto a terreno standard
 */
export function calculateSoilWarmingDelay(soilType?: Garden['soilType']): number {
  if (!soilType || soilType === 'Loamy' || soilType === 'Silty') {
    return 0; // Terreni medi: nessun aggiustamento
  }

  // Terreni scuri: si scaldano prima → anticipo di 3-7 giorni
  if (soilType === 'Clay' || soilType === 'Peaty') {
    // Argilloso: anticipo di ~5 giorni
    // Torboso: anticipo di ~7 giorni (più scuro)
    return soilType === 'Peaty' ? -7 : -5;
  }

  // Terreni chiari: si scaldano dopo → ritardo di 3-7 giorni
  if (soilType === 'Sandy' || soilType === 'Chalky') {
    // Sabbioso: ritardo di ~5 giorni
    // Calcareo: ritardo di ~3 giorni (meno estremo)
    return soilType === 'Sandy' ? 5 : 3;
  }

  return 0;
}

/**
 * Calcola la temperatura effettiva del suolo basata su tipo terreno e temperatura aria
 * 
 * Terreni scuri assorbono più calore solare e mantengono temperatura più alta
 * Terreni chiari riflettono più calore e mantengono temperatura più bassa
 * 
 * @param soilType - Tipo di terreno
 * @param airTemp - Temperatura aria in °C
 * @returns Temperatura effettiva suolo in °C
 */
export function calculateSoilHeatingRate(
  soilType: Garden['soilType'] | undefined,
  airTemp: number
): number {
  if (!soilType || soilType === 'Loamy' || soilType === 'Silty') {
    return airTemp; // Terreni medi: temperatura aria
  }

  // Terreni scuri: +2-3°C rispetto aria
  if (soilType === 'Clay' || soilType === 'Peaty') {
    return airTemp + (soilType === 'Peaty' ? 3 : 2);
  }

  // Terreni chiari: -1-2°C rispetto aria
  if (soilType === 'Sandy' || soilType === 'Chalky') {
    return airTemp - (soilType === 'Sandy' ? 2 : 1);
  }

  return airTemp;
}

/**
 * Verifica se il terreno è pronto per semina/trapianto
 * Considera riscaldamento suolo per tipo terreno
 * 
 * @param soilType - Tipo di terreno
 * @param airTemp - Temperatura aria in °C
 * @param minTemp - Temperatura minima richiesta dalla pianta in °C
 * @returns true se terreno è pronto, false altrimenti
 */
export function isSoilReadyForPlanting(
  soilType: Garden['soilType'] | undefined,
  airTemp: number,
  minTemp: number
): boolean {
  const soilTemp = calculateSoilHeatingRate(soilType, airTemp);
  return soilTemp >= minTemp;
}

/**
 * Verifica compatibilità pianta con tipo terreno
 * Alcune piante hanno preferenze forti per terreni specifici
 * 
 * @param plantName - Nome della pianta
 * @param soilType - Tipo di terreno
 * @returns Oggetto con compatibilità e motivo
 */
export function getSoilCompatibility(
  plantName: string,
  soilType?: Garden['soilType']
): {
  compatible: boolean;
  reason?: string;
  optimalSoilTypes?: Garden['soilType'][];
  avoidSoilTypes?: Garden['soilType'][];
} {
  if (!soilType) {
    return { compatible: true }; // Se tipo terreno non specificato, assumiamo compatibile
  }

  const plantNameUpper = plantName.toUpperCase();

  // Piante che preferiscono terreni sabbiosi (ben drenati)
  const sandyLovers = ['CAROTA', 'RAPANELLO', 'RAVANELLO', 'PATATA DOLCE'];
  if (sandyLovers.some(name => plantNameUpper.includes(name))) {
    if (soilType === 'Sandy' || soilType === 'Loamy') {
      return {
        compatible: true,
        reason: 'Terreno ideale per questa pianta. Terreni sabbiosi favoriscono sviluppo radici.',
        optimalSoilTypes: ['Sandy', 'Loamy'],
      };
    }
    if (soilType === 'Clay') {
      return {
        compatible: false,
        reason: 'Terreno argilloso non ideale. Rischi di ristagni idrici e radici deformate. Considera varietà resistenti o migliora drenaggio.',
        optimalSoilTypes: ['Sandy', 'Loamy'],
        avoidSoilTypes: ['Clay'],
      };
    }
  }

  // Piante che preferiscono terreni argillosi (ritenzione idrica)
  const clayLovers = ['POMODORO', 'PEPERONE', 'MELANZANA', 'ZUCCHINA'];
  if (clayLovers.some(name => plantNameUpper.includes(name))) {
    if (soilType === 'Clay' || soilType === 'Loamy') {
      return {
        compatible: true,
        reason: 'Terreno ideale per piante da frutto. Buona ritenzione idrica e nutrienti.',
        optimalSoilTypes: ['Clay', 'Loamy'],
      };
    }
    if (soilType === 'Sandy') {
      return {
        compatible: true, // Compatibile ma richiede più attenzione
        reason: 'Terreno sabbioso richiede irrigazione più frequente e concimazione regolare.',
        optimalSoilTypes: ['Clay', 'Loamy'],
      };
    }
  }

  // Piante che preferiscono terreni torbosi (acidi)
  const peatyLovers = ['MIRTILLO', 'LAMPONE', 'FRAGOLA'];
  if (peatyLovers.some(name => plantNameUpper.includes(name))) {
    if (soilType === 'Peaty') {
      return {
        compatible: true,
        reason: 'Terreno torboso ideale per piante acidofile.',
        optimalSoilTypes: ['Peaty'],
      };
    }
    if (soilType === 'Chalky') {
      return {
        compatible: false,
        reason: 'Terreno calcareo troppo alcalino. Queste piante preferiscono terreni acidi.',
        optimalSoilTypes: ['Peaty'],
        avoidSoilTypes: ['Chalky'],
      };
    }
  }

  // Default: compatibile ma senza preferenze specifiche
  return {
    compatible: true,
    reason: 'Pianta adattabile a vari tipi di terreno.',
  };
}

/**
 * Aggiusta una data di semina/trapianto considerando il riscaldamento del suolo
 * 
 * @param baseDate - Data base
 * @param soilType - Tipo di terreno
 * @returns Data aggiustata (anticipata o ritardata)
 */
export function adjustDateForSoilType(
  baseDate: Date,
  soilType?: Garden['soilType']
): Date {
  const delay = calculateSoilWarmingDelay(soilType);
  const adjustedDate = new Date(baseDate);
  adjustedDate.setDate(adjustedDate.getDate() + delay);
  return adjustedDate;
}

