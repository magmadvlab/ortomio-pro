/**
 * Seasonal Plant Suggestions Service
 * Suggerisce piante in base alla classificazione stagionale dell'orto
 */

import { SeasonalSunWindow, GardenClassification } from './seasonalSunWindows';
import { PlantMasterSheet, getAllMasterSheets } from '../data/plantMasterSheets';
import { calculateDailySunHours, Obstacle3D } from './preciseSunCalculator';
import { Garden } from '../types';
import {
  getSoilCompatibility,
  adjustDateForSoilType,
  calculateSoilWarmingDelay,
} from '../utils/soilTemperatureUtils';
import {
  calculateAltitudePlantingDelay,
  adjustPlantingDates,
} from '../utils/altitudeUtils';

export interface PlantSuggestionForWindow {
  plantName: string;
  plantId: string;
  category: 'Estivo' | 'Primaverile' | 'Autunnale' | 'FogliaEstiva';
  method: 'Seed' | 'Seedling';
  reason: string;
  suitabilityScore: number; // 0-1
  plantingWindow: { start: Date; end: Date };
}

/**
 * Suggerisce piante in base alla classificazione stagionale dell'orto
 * 
 * @param classification Classificazione del tipo di orto
 * @param windows Finestre stagionali solari
 * @param lat Latitudine (per calcolo date precise)
 * @param lng Longitudine (per calcolo date precise)
 * @param obstacles Ostacoli 3D (opzionale, per calcolo date precise)
 * @param year Anno per cui calcolare (default: anno corrente)
 * @returns Array di suggerimenti piante
 */
/**
 * Determina tipo pianta per calcolo ritardo altitudine
 */
function getPlantTypeForAltitude(plantName: string): 'early' | 'standard' | 'late' {
  const nameUpper = plantName.toUpperCase();
  
  const earlyPlants = ['LATTUGA', 'INSALATA', 'RUCOLA', 'SPINACIO', 'RAVANELLO', 'RAPANELLO'];
  if (earlyPlants.some(name => nameUpper.includes(name))) {
    return 'early';
  }
  
  const latePlants = ['POMODORO', 'PEPERONE', 'MELANZANA', 'ZUCCHINA', 'CETRIOLO'];
  if (latePlants.some(name => nameUpper.includes(name))) {
    return 'late';
  }
  
  return 'standard';
}

/**
 * Aggiusta data considerando terreno e altitudine
 */
function adjustDateForConditions(
  baseDate: Date,
  soilType?: Garden['soilType'],
  altitudeMeters?: number,
  plantType: 'early' | 'standard' | 'late' = 'standard'
): Date {
  let adjustedDate = new Date(baseDate);

  // 1. Applica ritardo altitudine
  if (altitudeMeters && altitudeMeters > 200) {
    const altitudeDelay = calculateAltitudePlantingDelay(altitudeMeters, plantType);
    adjustedDate.setDate(adjustedDate.getDate() + altitudeDelay);
  }

  // 2. Applica correzione tipo terreno
  const soilDelay = calculateSoilWarmingDelay(soilType);
  adjustedDate.setDate(adjustedDate.getDate() + soilDelay);

  return adjustedDate;
}

export function suggestPlantsForGardenType(
  classification: GardenClassification,
  windows: SeasonalSunWindow[],
  lat: number,
  lng: number,
  obstacles: Obstacle3D[] = [],
  year: number = new Date().getFullYear(),
  soilType?: Garden['soilType'],
  altitudeMeters?: number
): PlantSuggestionForWindow[] {
  const suggestions: PlantSuggestionForWindow[] = [];
  const allPlants = getAllMasterSheets();
  
  const giuLug = windows.find(w => w.period === 'Giu-Lug');
  const febMar = windows.find(w => w.period === 'Feb-Mar');
  const aprMag = windows.find(w => w.period === 'Apr-Mag');
  const agoSet = windows.find(w => w.period === 'Ago-Set');
  
  if (!giuLug || !febMar || !aprMag || !agoSet) {
    return suggestions;
  }
  
  // ORTO ESTIVO
  if (classification.type === 'Estivo' || classification.summerScore >= 0.7) {
    if (giuLug.avgHours >= 6) {
      const estivePlants = allPlants.filter(p => 
        p.nutrientCategory === 'FRUITING' &&
        ['POMODORO', 'PEPERONE', 'PEPERONCINO', 'MELANZANA', 'ZUCCHINA', 'ZUCCHINO', 'CETRIOLO'].includes(p.commonName.toUpperCase())
      );
      
      estivePlants.forEach(plant => {
        // Verifica compatibilità terreno
        const soilCompatibility = getSoilCompatibility(plant.commonName, soilType);
        if (!soilCompatibility.compatible) {
          return; // Salta piante non compatibili
        }

        const baseStartDate = findFirstDateWithHours(lat, lng, obstacles, year, 6, [5, 6, 7]); // Maggio-Giugno-Luglio
        const baseEndDate = findLastDateWithHours(lat, lng, obstacles, year, 6, [6, 7, 8], 8); // Max stress 8h
        
        // Applica aggiustamenti terreno e altitudine
        const plantType = getPlantTypeForAltitude(plant.commonName);
        const adjustedStartDate = adjustDateForConditions(baseStartDate, soilType, altitudeMeters, plantType);
        const adjustedEndDate = adjustDateForConditions(baseEndDate, soilType, altitudeMeters, plantType);

        // Calcola suitability score (ridotto se terreno non ottimale)
        let suitabilityScore = classification.summerScore;
        if (soilCompatibility.optimalSoilTypes && soilType && !soilCompatibility.optimalSoilTypes.includes(soilType)) {
          suitabilityScore *= 0.8; // Riduce del 20% se terreno non ottimale
        } else if (soilCompatibility.optimalSoilTypes && soilType && soilCompatibility.optimalSoilTypes.includes(soilType)) {
          suitabilityScore *= 1.1; // Aumenta del 10% se terreno ottimale
        }

        let reason = 'Orto estivo con sole continuo ottimale per piante da frutto. Resa massima garantita.';
        if (altitudeMeters && altitudeMeters > 200) {
          reason += ` Finestra aggiustata per altitudine ${altitudeMeters}m.`;
        }
        if (soilType && soilCompatibility.optimalSoilTypes && soilCompatibility.optimalSoilTypes.includes(soilType)) {
          reason += ` Terreno ${soilType} ideale per questa pianta.`;
        }
        
        suggestions.push({
          plantName: plant.commonName,
          plantId: plant.id,
          category: 'Estivo',
          method: 'Seedling', // Trapianto piantine
          reason,
          suitabilityScore: Math.min(1, suitabilityScore), // Limita a 1
          plantingWindow: {
            start: adjustedStartDate,
            end: adjustedEndDate,
          },
        });
      });
    }
  }
  
  // ORTO PRIMAVERILE/AUTUNNALE
  if (classification.type === 'NonEstivo' || classification.springAutumnScore >= 0.7) {
    const marAprAvg = (febMar.avgHours + aprMag.avgHours) / 2;
    if (marAprAvg >= 3 && giuLug.avgHours <= 7) {
      const primaveriliPlants = allPlants.filter(p => {
        const nameUpper = p.commonName.toUpperCase();
        return (
          (p.nutrientCategory === 'LEAFY' || p.nutrientCategory === 'ROOT') &&
          (
            nameUpper.includes('INSALATA') ||
            nameUpper.includes('LATTUGA') ||
            nameUpper === 'SPINACIO' ||
            nameUpper === 'RUCOLA' ||
            nameUpper === 'BIETA' ||
            nameUpper === 'PISELLO' ||
            nameUpper === 'CIPOLLA' ||
            nameUpper === 'FAVA'
          )
        );
      });
      
      primaveriliPlants.forEach(plant => {
        // Verifica compatibilità terreno
        const soilCompatibility = getSoilCompatibility(plant.commonName, soilType);
        if (!soilCompatibility.compatible) {
          return; // Salta piante non compatibili
        }

        const baseStartDate = findFirstDateWithHours(lat, lng, obstacles, year, 3, [2, 3, 4]); // Febbraio-Marzo-Aprile
        const baseEndDate = findLastDateWithHours(lat, lng, obstacles, year, 3, [4, 5], 7); // Max stress 7h
        
        // Applica aggiustamenti terreno e altitudine
        const plantType = getPlantTypeForAltitude(plant.commonName);
        const adjustedStartDate = adjustDateForConditions(baseStartDate, soilType, altitudeMeters, plantType);
        const adjustedEndDate = adjustDateForConditions(baseEndDate, soilType, altitudeMeters, plantType);

        // Calcola suitability score
        let suitabilityScore = classification.springAutumnScore;
        if (soilCompatibility.optimalSoilTypes && soilType && !soilCompatibility.optimalSoilTypes.includes(soilType)) {
          suitabilityScore *= 0.8;
        } else if (soilCompatibility.optimalSoilTypes && soilType && soilCompatibility.optimalSoilTypes.includes(soilType)) {
          suitabilityScore *= 1.1;
        }

        let reason = 'Orto primaverile/autunnale con sole moderato ideale per foglie e radici. Produzione più lunga e meno stress.';
        if (altitudeMeters && altitudeMeters > 200) {
          reason += ` Finestra aggiustata per altitudine ${altitudeMeters}m.`;
        }
        if (soilType && soilCompatibility.optimalSoilTypes && soilCompatibility.optimalSoilTypes.includes(soilType)) {
          reason += ` Terreno ${soilType} ideale per questa pianta.`;
        }
        
        suggestions.push({
          plantName: plant.commonName,
          plantId: plant.id,
          category: 'Primaverile',
          method: 'Seed', // Semina diretta
          reason,
          suitabilityScore: Math.min(1, suitabilityScore),
          plantingWindow: {
            start: adjustedStartDate,
            end: adjustedEndDate,
          },
        });
      });
    }
  }
  
  // ORTO FOGLIA ESTIVA (ombra intelligente)
  if (giuLug.avgHours >= 3 && giuLug.avgHours <= 5 && 
      giuLug.peakHours && giuLug.peakHours.end <= 13) {
    // Sole solo mattino
    const fogliaEstivaPlants = allPlants.filter(p => {
      const nameUpper = p.commonName.toUpperCase();
      return (
        p.nutrientCategory === 'LEAFY' &&
        (
          nameUpper === 'BASILICO' ||
          nameUpper === 'PREZZEMOLO' ||
          nameUpper === 'CORIANDOLO' ||
          nameUpper.includes('LATTUGA ESTIVA')
        )
      );
    });
    
    fogliaEstivaPlants.forEach(plant => {
      const startDate = new Date(year, 5, 1); // Giugno
      const endDate = new Date(year, 8, 30); // Agosto
      
      suggestions.push({
        plantName: plant.commonName,
        plantId: plant.id,
        category: 'FogliaEstiva',
        method: 'Seed', // Cicli rapidi
        reason: 'Sole mattutino con ombra pomeridiana ideale per foglie estive. Cicli rapidi ogni 30-40 giorni.',
        suitabilityScore: 0.8,
        plantingWindow: {
          start: startDate,
          end: endDate,
        },
      });
    });
  }
  
  // ORTO MISTO - Suggerimenti aggiuntivi
  if (classification.type === 'Misto') {
    // Se ha caratteristiche estive ma non ottimali
    if (classification.summerScore >= 0.3 && classification.summerScore < 0.7) {
      const estiveModerate = allPlants.filter(p => 
        p.nutrientCategory === 'FRUITING' &&
        ['POMODORO', 'ZUCCHINA'].includes(p.commonName.toUpperCase())
      ).slice(0, 2); // Solo 2 piante principali
      
      estiveModerate.forEach(plant => {
        const startDate = findFirstDateWithHours(lat, lng, obstacles, year, 5, [5, 6]); // Maggio-Giugno
        const endDate = findLastDateWithHours(lat, lng, obstacles, year, 5, [7, 8], 8);
        
        suggestions.push({
          plantName: plant.commonName,
          plantId: plant.id,
          category: 'Estivo',
          method: 'Seedling',
          reason: 'Possibile coltivazione estiva con resa moderata. Sole disponibile ma non ottimale.',
          suitabilityScore: classification.summerScore,
          plantingWindow: {
            start: startDate,
            end: endDate,
          },
        });
      });
    }
    
    // Se ha caratteristiche primaverili/autunnali
    if (classification.springAutumnScore >= 0.3) {
      const primaveriliModerate = allPlants.filter(p => 
        p.nutrientCategory === 'LEAFY' &&
        ['INSALATA', 'SPINACIO', 'RUCOLA'].includes(p.commonName.toUpperCase())
      ).slice(0, 3);
      
      primaveriliModerate.forEach(plant => {
        const startDate = findFirstDateWithHours(lat, lng, obstacles, year, 3, [3, 4]); // Marzo-Aprile
        const endDate = findLastDateWithHours(lat, lng, obstacles, year, 3, [5, 6], 7);
        
        suggestions.push({
          plantName: plant.commonName,
          plantId: plant.id,
          category: 'Primaverile',
          method: 'Seed',
          reason: 'Possibile coltivazione primaverile/autunnale con sole moderato.',
          suitabilityScore: classification.springAutumnScore,
          plantingWindow: {
            start: startDate,
            end: endDate,
          },
        });
      });
    }
  }
  
  return suggestions.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

/**
 * Trova la prima data quando supera una soglia di ore di sole
 */
function findFirstDateWithHours(
  lat: number,
  lng: number,
  obstacles: Obstacle3D[],
  year: number,
  minHours: number,
  months: number[]
): Date {
  for (const month of months) {
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const hours = calculateDailySunHours(lat, lng, date, obstacles);
      if (hours >= minHours) {
        return date;
      }
    }
  }
  // Default: primo giorno del primo mese
  return new Date(year, months[0] - 1, 1);
}

/**
 * Trova l'ultima data quando supera una soglia di ore di sole
 * o quando supera un limite di stress
 */
function findLastDateWithHours(
  lat: number,
  lng: number,
  obstacles: Obstacle3D[],
  year: number,
  minHours: number,
  months: number[],
  maxStressHours?: number
): Date {
  let lastValidDate: Date | null = null;
  
  for (const month of months) {
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = daysInMonth; day >= 1; day--) {
      const date = new Date(year, month - 1, day);
      const hours = calculateDailySunHours(lat, lng, date, obstacles);
      
      // Se supera limite stress, fermati
      if (maxStressHours && hours > maxStressHours) {
        break;
      }
      
      // Se supera soglia minima, salva come ultima data valida
      if (hours >= minHours) {
        if (!lastValidDate || date > lastValidDate) {
          lastValidDate = date;
        }
      }
    }
  }
  
  // Default: ultimo giorno dell'ultimo mese
  return lastValidDate || new Date(year, months[months.length - 1] - 1, new Date(year, months[months.length - 1], 0).getDate());
}

