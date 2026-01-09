/**
 * Rotation Optimizer
 * Ottimizza rotazioni automaticamente considerando famiglie botaniche, esigenze nutrizionali, successioni stagionali
 */

import { PlantMasterSheet } from '../types';
import { getMasterSheetSync } from '../services/plantMasterService';
import { getPlantFamily as getTaxonomyPlantFamily } from '../services/plantTaxonomyService';
import { Season } from '../utils/seasonalAdjustment';

export interface BedRotation {
  bedId: string;
  bedName: string;
  year: number;
  quarters: {
    Q1?: string; // plantName
    Q2?: string;
    Q3?: string;
    Q4?: string;
  };
  history: Array<{
    year: number;
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    plantName: string;
    family: string;
  }>;
}

// Database famiglie botaniche
export const plantFamilies: Record<string, string[]> = {
  'Solanaceae': ['Pomodoro', 'Peperone', 'Melanzana', 'Patata'],
  'Cucurbitaceae': ['Zucchina', 'Cetriolo', 'Melone', 'Anguria', 'Zucca'],
  'Leguminose': ['Fagiolo', 'Pisello', 'Fava', 'Fagiolino'],
  'Ombrellifere': ['Carota', 'Sedano', 'Prezzemolo', 'Finocchio'],
  'Liliacee': ['Cipolla', 'Aglio', 'Porro', 'Scalogno'],
  'Brassicaceae': ['Cavolo', 'Broccolo', 'Rapa', 'Ravanello', 'Cavolfiore'],
  'Asteraceae': ['Lattuga', 'Indivia', 'Radicchio'],
  'Chenopodiaceae': ['Bietola', 'Spinacio']
};

/**
 * Ottieni famiglia botanica di una pianta (versione asincrona con taxonomy service)
 */
export const getPlantFamilyAsync = async (plantName: string): Promise<string | null> => {
  return await getTaxonomyPlantFamily(plantName);
};

/**
 * Ottieni famiglia botanica di una pianta (versione sincrona per retrocompatibilità)
 * Usa PlantMasterSheet come fallback
 */
export const getPlantFamilySync = (plantName: string): string | null => {
  const masterData = getMasterSheetSync(plantName);
  if (masterData?.family) {
    return masterData.family;
  }
  
  // Fallback: cerca nel database locale
  for (const [family, plants] of Object.entries(plantFamilies)) {
    if (plants.some(p => p.toLowerCase().includes(plantName.toLowerCase()) || plantName.toLowerCase().includes(p.toLowerCase()))) {
      return family;
    }
  }
  
  return null;
};

/**
 * @deprecated Usa getPlantFamilySync o getPlantFamilyAsync
 * Mantenuto per retrocompatibilità
 */
export const getPlantFamily = getPlantFamilySync;

/**
 * Verifica se due piante sono della stessa famiglia (versione sincrona)
 */
export const areSameFamily = (plant1: string, plant2: string): boolean => {
  const family1 = getPlantFamilySync(plant1);
  const family2 = getPlantFamilySync(plant2);
  return family1 !== null && family1 === family2;
};

/**
 * Verifica se due piante sono della stessa famiglia (versione asincrona)
 */
export const areSameFamilyAsync = async (plant1: string, plant2: string): Promise<boolean> => {
  const family1 = await getPlantFamilyAsync(plant1);
  const family2 = await getPlantFamilyAsync(plant2);
  return family1 !== null && family1 === family2;
};

/**
 * Ottimizza rotazione per un letto
 */
export const optimizeBedRotation = (
  bedRotation: BedRotation,
  availablePlants: string[],
  targetYear: number
): {
  optimized: BedRotation;
  suggestions: string[];
  warnings: string[];
} => {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  
  const optimized: BedRotation = {
    ...bedRotation,
    year: targetYear,
    quarters: { ...bedRotation.quarters }
  };

  // Analizza storia per evitare ripetizioni
  const last3Years = bedRotation.history
    .filter(h => h.year >= targetYear - 3)
    .map(h => ({ plant: h.plantName, family: h.family }));

  // Per ogni quarter, suggerisci pianta ottimale
  const quarters: Array<'Q1' | 'Q2' | 'Q3' | 'Q4'> = ['Q1', 'Q2', 'Q3', 'Q4'];
  
  for (const quarter of quarters) {
    if (optimized.quarters[quarter]) continue; // Già assegnata

    // Evita piante stessa famiglia degli ultimi 3 anni
    const forbiddenFamilies = new Set(
      last3Years
        .filter(h => {
          // Considera solo quarters precedenti o stesso quarter anni precedenti
          const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
          const currentQuarterIdx = quarterOrder.indexOf(quarter);
          const historyQuarterIdx = quarterOrder.indexOf(h.plant ? 'Q1' : 'Q1'); // Semplificato
          return true; // Considera tutte le piante degli ultimi 3 anni
        })
        .map(h => h.family)
    );

    // Cerca pianta ottimale
    let bestPlant: string | null = null;
    let bestScore = 0;

    for (const plant of availablePlants) {
      const family = getPlantFamilySync(plant);
      if (!family) continue;

      // Skip se stessa famiglia recente
      if (forbiddenFamilies.has(family)) {
        continue;
      }

      // Score basato su:
      // 1. Leguminose dopo solanacee (arricchiscono terreno)
      const lastPlant = last3Years[last3Years.length - 1]?.plant;
      if (lastPlant) {
        const lastFamily = getPlantFamilySync(lastPlant);
        if (lastFamily === 'Solanaceae' && family === 'Leguminose') {
          bestPlant = plant;
          bestScore = 100;
          break; // Perfetto match
        }
      }

      // 2. Piante diverse da ultime 2
      const recentPlants = last3Years.slice(-2).map(h => h.plant);
      if (!recentPlants.includes(plant)) {
        const score = 50;
        if (score > bestScore) {
          bestScore = score;
          bestPlant = plant;
        }
      }
    }

    if (bestPlant) {
      optimized.quarters[quarter] = bestPlant;
      suggestions.push(`${quarter}: ${bestPlant} (ottimale per rotazione)`);
    } else {
      warnings.push(`${quarter}: Nessuna pianta ottimale trovata, considera rotazione manuale`);
    }
  }

  return { optimized, suggestions, warnings };
};

/**
 * Verifica compatibilità successione
 */
export const isGoodSuccession = (
  previousPlant: string,
  nextPlant: string
): { compatible: boolean; reason: string } => {
  const prevFamily = getPlantFamilySync(previousPlant);
  const nextFamily = getPlantFamilySync(nextPlant);

  if (!prevFamily || !nextFamily) {
    return { compatible: true, reason: 'Famiglia non identificata' };
  }

  // Stessa famiglia = non compatibile
  if (prevFamily === nextFamily) {
    return { compatible: false, reason: `Stessa famiglia botanica: ${prevFamily}` };
  }

  // Leguminose dopo solanacee = ottimo
  if (prevFamily === 'Solanaceae' && nextFamily === 'Fabaceae') {
    return { compatible: true, reason: 'Leguminose arricchiscono terreno dopo solanacee' };
  }

  // Solanacee dopo leguminose = buono
  if (prevFamily === 'Fabaceae' && nextFamily === 'Solanaceae') {
    return { compatible: true, reason: 'Solanacee beneficiano di azoto da leguminose' };
  }

  return { compatible: true, reason: 'Successione compatibile' };
};

