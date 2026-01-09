import { PlantMasterSheet, Garden } from '../types';
import { getAllMasterSheets } from '../services/plantMasterService';

export interface Area {
  id: string;
  name: string;
  dailySunHours: number; // Ore di sole effettive
  sunExposure: 'FullSun' | 'PartSun' | 'Shade';
  aspectDirection?: 'North' | 'South' | 'East' | 'West' | 'Flat';
}

export interface PlacementAdvice {
  canPlant: boolean;
  recommendedArea?: Area;
  warning?: string;
  alternatives?: PlantMasterSheet[];
}

/**
 * Estrae ore di luce necessarie da una pianta
 * Cerca in seedlingCare.lightHours o stima da lightNeeds
 */
const extractLightRequirement = (plant: PlantMasterSheet): number => {
  // Se c'è lightHours esplicito, usalo
  if (plant.seedlingCare?.lightHours) {
    return plant.seedlingCare.lightHours;
  }

  // Stima da lightNeeds string
  const lightNeeds = plant.seedlingCare?.lightNeeds?.toLowerCase() || '';
  
  if (lightNeeds.includes('tanta') || lightNeeds.includes('pieno sole') || lightNeeds.includes('full sun')) {
    return 8; // Piante che richiedono pieno sole
  }
  
  if (lightNeeds.includes('mezza') || lightNeeds.includes('part sun') || lightNeeds.includes('partsun')) {
    return 4; // Piante che tollerano mezz'ombra
  }
  
  if (lightNeeds.includes('ombra') || lightNeeds.includes('shade')) {
    return 2; // Piante che preferiscono ombra
  }

  // Default: 6 ore (mezza giornata)
  return 6;
};

/**
 * Suggerisce posizionamento di una pianta in base a esposizione solare disponibile
 */
export const suggestPlantPlacement = (
  plant: PlantMasterSheet,
  availableAreas: Area[],
  garden?: Garden
): PlacementAdvice => {
  const plantSunRequirement = extractLightRequirement(plant);

  // Se il giardino ha un'esposizione globale, usa quella come fallback
  if (!availableAreas || availableAreas.length === 0) {
    if (garden?.dailySunHours) {
      const globalArea: Area = {
        id: 'global',
        name: 'Giardino',
        dailySunHours: garden.dailySunHours,
        sunExposure: garden.sunExposure || 'PartSun'
      };
      availableAreas = [globalArea];
    } else {
      return {
        canPlant: false,
        warning: `Impossibile determinare esposizione solare. Configura le ore di sole nel profilo del giardino.`
      };
    }
  }

  // Trova aree adatte (con abbastanza sole)
  const suitableAreas = availableAreas.filter(area => 
    area.dailySunHours >= plantSunRequirement
  );

  if (suitableAreas.length === 0) {
    // Nessuna area adatta - suggerisci alternative
    const alternatives = getShadeTolerantPlants(plantSunRequirement);
    
    return {
      canPlant: false,
      warning: `${plant.commonName} necessita almeno ${plantSunRequirement}h di sole al giorno. Le aree disponibili hanno massimo ${Math.max(...availableAreas.map(a => a.dailySunHours))}h.`,
      alternatives
    };
  }

  // Trova l'area migliore (più sole, ma non eccessivo)
  const bestArea = suitableAreas.reduce((best, current) => {
    // Preferisci aree con sole leggermente superiore al minimo (non troppo caldo)
    const bestDiff = Math.abs(best.dailySunHours - plantSunRequirement);
    const currentDiff = Math.abs(current.dailySunHours - plantSunRequirement);
    
    return currentDiff < bestDiff ? current : best;
  });

  return {
    canPlant: true,
    recommendedArea: bestArea
  };
};

/**
 * Restituisce piante che tollerano ombra (per aree con poco sole)
 */
export const getShadeTolerantPlants = (
  maxSunHours?: number
): PlantMasterSheet[] => {
  const allPlants = getAllMasterSheets();
  
  // Piante che tollerano ombra (spinaci, lattuga, biete, ravanelli)
  const shadeTolerant = allPlants.filter(plant => {
    const lightReq = extractLightRequirement(plant);
    
    // Se maxSunHours è specificato, filtra per quello
    if (maxSunHours !== undefined) {
      return lightReq <= maxSunHours;
    }
    
    // Altrimenti, restituisci piante con requisito basso (<= 4h)
    return lightReq <= 4;
  });

  // Ordina per requisito luce crescente
  return shadeTolerant.sort((a, b) => 
    extractLightRequirement(a) - extractLightRequirement(b)
  );
};

/**
 * Verifica se un'area è adatta per una pianta specifica
 */
export const isAreaSuitableForPlant = (
  area: Area,
  plant: PlantMasterSheet
): boolean => {
  const plantSunRequirement = extractLightRequirement(plant);
  return area.dailySunHours >= plantSunRequirement;
};

/**
 * Suggerisce miglioramenti per aumentare esposizione solare
 */
export const suggestSunImprovements = (
  area: Area,
  requiredHours: number
): string[] => {
  const suggestions: string[] = [];
  const deficit = requiredHours - area.dailySunHours;

  if (deficit <= 0) {
    return suggestions; // Nessun miglioramento necessario
  }

  if (area.aspectDirection === 'North') {
    suggestions.push('Considera di spostare le piante in un\'area con esposizione Sud o Est');
  }

  if (area.sunExposure === 'Shade') {
    suggestions.push('Riduci ostacoli (alberi, edifici) che bloccano il sole');
    suggestions.push('Usa riflettori o pannelli bianchi per aumentare luce riflessa');
  }

  if (deficit > 2) {
    suggestions.push(`Deficit di ${deficit}h: considera piante alternative che tollerano ombra`);
  }

  return suggestions;
};

