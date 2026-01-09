/**
 * Solar Classification Helper
 * Funzioni helper per calcolare e validare la classificazione solare stagionale
 */

import { Garden } from '../types';
import {
  calculateSeasonalWindows,
  classifyGardenType,
  SeasonalSunWindow,
  GardenClassification,
} from '../services/seasonalSunWindows';
import {
  findPlantingWindows,
  PlantingWindow,
  adjustForPlantingMethod,
} from '../services/plantingWindowOptimizer';
import {
  suggestPlantsForGardenType,
  PlantSuggestionForWindow,
} from '../services/seasonalPlantSuggestions';
import { SolarClassificationData, UrgentAlert } from '../types';
import { getMasterSheet } from '../services/plantMasterService';
import { SeedlingBatch } from '../services/seedlingService';
import { hasReadyBatchForPlant } from '../services/seedlingBatchHelper';

/**
 * Calcola la classificazione solare completa per un giardino
 */
export async function calculateGardenSolarClassification(
  garden: Garden,
  currentDate: Date = new Date(),
  historicalWeather?: any,
  seedlingBatches?: SeedlingBatch[]
): Promise<SolarClassificationData | null> {
  // Verifica che le coordinate siano disponibili
  if (!garden.coordinates) {
    return null;
  }

  const lat = garden.coordinates.latitude;
  const lng = garden.coordinates.longitude;
  const obstacles = garden.obstacles || [];
  const year = currentDate.getFullYear();

  try {
    // Calcola finestre stagionali
    const windows = calculateSeasonalWindows(lat, lng, obstacles, year);

    // Classifica tipo di orto
    const classification = classifyGardenType(windows);

    // Trova finestre di impianto ottimali (con aggiustamenti terreno, altitudine e temperatura)
    let plantingWindows = findPlantingWindows(
      classification,
      windows,
      lat,
      lng,
      obstacles,
      year,
      garden.soilType,
      garden.altitudeMeters,
      historicalWeather || undefined
    );

    // Applica aggiustamenti basati su batch pronti
    if (seedlingBatches && seedlingBatches.length > 0) {
      plantingWindows = plantingWindows.map(window => {
        // Verifica se esiste un batch pronto per una delle piante raccomandate
        const hasReadyBatch = window.recommendedPlants.some(plantName =>
          hasReadyBatchForPlant(plantName, seedlingBatches, garden)
        );

        if (hasReadyBatch) {
          // Se esiste batch pronto, usa Seedling (non anticipare)
          return {
            ...window,
            method: 'Seedling' as const,
            adjustedStartDate: window.startDate, // Usa data direttamente
          };
        } else {
          // Se non esiste batch, usa Seed (anticipa)
          const adjustedWindow = adjustForPlantingMethod(
            window,
            'Seed',
            window.recommendedPlants[0] // Usa prima pianta per calcolo preciso
          );
          return {
            ...window,
            method: 'Seed' as const,
            adjustedStartDate: adjustedWindow.adjustedStartDate,
          };
        }
      });
    } else {
      // Se non ci sono batch, applica aggiustamento Seed di default
      plantingWindows = plantingWindows.map(window => {
        const adjustedWindow = adjustForPlantingMethod(
          window,
          'Seed',
          window.recommendedPlants[0]
        );
        return {
          ...window,
          method: 'Seed' as const,
          adjustedStartDate: adjustedWindow.adjustedStartDate,
        };
      });
    }

    // Ottieni suggerimenti piante ottimizzati
    const optimizedSuggestions = suggestPlantsForGardenType(
      classification,
      windows,
      lat,
      lng,
      obstacles,
      year
    );

    // Valida compatibilità piante esistenti (sarà fatto nel Director)
    const compatibilityAlerts: UrgentAlert[] = [];

    return {
      windows,
      classification,
      plantingWindows,
      compatibilityAlerts,
      optimizedSuggestions,
    };
  } catch (error) {
    console.error('Error calculating solar classification:', error);
    return null;
  }
}

/**
 * Valida se una pianta è compatibile con il tipo di orto
 */
export function validatePlantCompatibility(
  plantName: string,
  classification: GardenClassification,
  windows: SeasonalSunWindow[]
): {
  compatible: boolean;
  reason?: string;
  alternativePlants?: string[];
} {
  const masterData = getMasterSheet(plantName);
  if (!masterData) {
    return { compatible: true }; // Se non trovata, assumiamo compatibile
  }

  const giuLug = windows.find((w) => w.period === 'Giu-Lug');
  const febMar = windows.find((w) => w.period === 'Feb-Mar');
  const aprMag = windows.find((w) => w.period === 'Apr-Mag');

  if (!giuLug || !febMar || !aprMag) {
    return { compatible: true }; // Se dati mancanti, assumiamo compatibile
  }

  // Piante estive richiedono orto estivo
  const summerPlants = [
    'Pomodoro',
    'Peperone',
    'Melanzana',
    'Zucchina',
    'Cetriolo',
    'Fagiolino',
    'Pomodoro Ciliegino',
    'Pomodoro San Marzano',
  ];

  // Piante primaverili/autunnali preferiscono orto non estivo
  const springAutumnPlants = [
    'Lattuga',
    'Spinaci',
    'Rucola',
    'Bietola',
    'Piselli',
    'Cipolla',
    'Fava',
    'Carota',
    'Ravanello',
  ];

  const isSummerPlant = summerPlants.some(
    (name) => plantName.toLowerCase().includes(name.toLowerCase())
  );
  const isSpringAutumnPlant = springAutumnPlants.some(
    (name) => plantName.toLowerCase().includes(name.toLowerCase())
  );

  // Validazione per orto estivo
  if (classification.type === 'Estivo') {
    if (isSpringAutumnPlant && giuLug.avgHours > 7) {
      return {
        compatible: false,
        reason: `Pianta primaverile/autunnale in orto estivo (${giuLug.avgHours.toFixed(1)}h sole Giu-Lug). Potrebbe soffrire il caldo estivo.`,
        alternativePlants: ['Pomodoro', 'Peperone', 'Zucchina', 'Melanzana'],
      };
    }
  }

  // Validazione per orto non estivo
  if (classification.type === 'NonEstivo') {
    if (isSummerPlant && giuLug.avgHours < 6) {
      return {
        compatible: false,
        reason: `Pianta estiva in orto non estivo (${giuLug.avgHours.toFixed(1)}h sole Giu-Lug). Resa limitata senza sole estivo sufficiente.`,
        alternativePlants: ['Lattuga', 'Spinaci', 'Rucola', 'Bietola', 'Piselli'],
      };
    }
  }

  // Validazione per orto misto
  if (classification.type === 'Misto') {
    // Piante estive richiedono almeno 5h in Giu-Lug
    if (isSummerPlant && giuLug.avgHours < 5) {
      return {
        compatible: false,
        reason: `Pianta estiva in orto misto con sole limitato (${giuLug.avgHours.toFixed(1)}h sole Giu-Lug). Considera varietà più tolleranti.`,
        alternativePlants: ['Lattuga estiva', 'Basilico', 'Prezzemolo'],
      };
    }
  }

  return { compatible: true };
}

/**
 * Ottiene suggerimenti piante ottimizzati per il tipo di orto
 */
export function getOptimizedPlantSuggestions(
  classification: GardenClassification,
  windows: SeasonalSunWindow[],
  currentDate: Date
): PlantSuggestionForWindow[] {
  if (!classification || !windows || windows.length === 0) {
    return [];
  }

  const lat = 0; // Sarà passato dal chiamante se necessario
  const lng = 0; // Sarà passato dal chiamante se necessario
  const obstacles: any[] = [];
  const year = currentDate.getFullYear();

  try {
    const suggestions = suggestPlantsForGardenType(
      classification,
      windows,
      lat,
      lng,
      obstacles,
      year
    );

    // Filtra suggerimenti per finestre di impianto attive
    const now = currentDate;
    const activeSuggestions = suggestions.filter((s) => {
      return s.plantingWindow.start <= now && s.plantingWindow.end >= now;
    });

    // Ordina per suitability score (migliori prima)
    return activeSuggestions.sort(
      (a, b) => b.suitabilityScore - a.suitabilityScore
    );
  } catch (error) {
    console.error('Error getting optimized plant suggestions:', error);
    return [];
  }
}

