/**
 * Space Calculator
 * Calcola spazio occupato/disponibile per letti e strutture
 */

import { GardenBed } from '../types/gardenBed';
import { GardenTask, PlantMasterSheet } from '../types';
import { parseSpacing } from './gardenLayoutEngine';

/**
 * Dettaglio spazio occupato da una pianta
 */
export interface PlantSpaceDetail {
  plantName: string;
  quantity: number;
  areaPerPlant: number;         // m² per pianta
  totalArea: number;            // m² totale per questa pianta
  spacing?: {
    row: number;                // cm sulla fila
    between: number;            // cm tra le file
  };
}

/**
 * Calcolo spazio per un letto
 */
export interface SpaceCalculation {
  bedId: string;
  bedName: string;
  totalArea: number;              // m² totale del letto
  occupiedArea: number;           // m² occupati da piante
  availableArea: number;          // m² disponibili
  occupancyPercentage: number;     // % occupazione
  plants: PlantSpaceDetail[];
}

/**
 * Calcolo spazio totale giardino
 */
export interface GardenSpaceCalculation {
  totalGardenArea: number;        // m² totale giardino
  totalBedsArea: number;         // m² totale letti definiti
  totalOccupiedArea: number;      // m² occupati da piante
  totalAvailableArea: number;     // m² disponibili
  bedsCalculations: SpaceCalculation[];
  unassignedTasksArea: number;    // m² occupati da task senza letto
}

/**
 * Calcola area per pianta basandosi su spacing
 */
function calculatePlantArea(
  plant: PlantMasterSheet,
  quantity: number
): { areaPerPlant: number; spacing?: { row: number; between: number } } {
  // Prova a prendere spacing da transplanting
  const spacingString = 
    plant.transplanting?.spacing || 
    '30cm x 30cm';
  
  const spacing = parseSpacing(spacingString);
  
  // Se spacing non parsabile, usa valori di default
  const defaultSpacing = { row: 30, between: 30 };
  const finalSpacing = spacing || defaultSpacing;
  
  // Calcola area per pianta in m²
  // Area = row (cm) * between (cm) / 10000
  const areaPerPlant = (finalSpacing.row * finalSpacing.between) / 10000;
  
  return {
    areaPerPlant,
    spacing: {
      row: finalSpacing.row,
      between: finalSpacing.between,
    },
  };
}

/**
 * Calcola spazio occupato/disponibile per un letto
 */
export function calculateBedSpace(
  bed: GardenBed,
  tasks: GardenTask[],
  masterSheets: Map<string, PlantMasterSheet>
): SpaceCalculation {
  // Filtra task associati a questo bed e non completati
  const bedTasks = tasks.filter(
    t => t.bedId === bed.id && !t.completed && t.plantName
  );
  
  const totalArea = bed.areaSqMeters || 0;
  let occupiedArea = 0;
  const plants: PlantSpaceDetail[] = [];
  
  // Raggruppa task per pianta
  const plantGroups = new Map<string, { task: GardenTask; count: number }>();
  
  bedTasks.forEach(task => {
    if (!task.plantName) return;
    
    const key = task.plantName.toLowerCase();
    const existing = plantGroups.get(key);
    
    if (existing) {
      existing.count += task.quantity || 1;
    } else {
      plantGroups.set(key, {
        task,
        count: task.quantity || 1,
      });
    }
  });
  
  // Calcola spazio per ogni pianta
  plantGroups.forEach(({ task, count }) => {
    const masterSheet = masterSheets.get(task.plantName.toLowerCase());
    
    if (!masterSheet) {
      // Se non troviamo il master sheet, usiamo stima conservativa
      console.warn(`Master sheet non trovato per ${task.plantName}, uso stima default`);
      const defaultArea = 0.09; // 30cm x 30cm = 0.09 m²
      const totalAreaForPlant = defaultArea * count;
      occupiedArea += totalAreaForPlant;
      
      plants.push({
        plantName: task.plantName,
        quantity: count,
        areaPerPlant: defaultArea,
        totalArea: totalAreaForPlant,
      });
      return;
    }
    
    const { areaPerPlant, spacing } = calculatePlantArea(masterSheet, count);
    const totalAreaForPlant = areaPerPlant * count;
    occupiedArea += totalAreaForPlant;
    
    plants.push({
      plantName: task.plantName,
      quantity: count,
      areaPerPlant,
      totalArea: totalAreaForPlant,
      spacing,
    });
  });
  
  const availableArea = Math.max(0, totalArea - occupiedArea);
  const occupancyPercentage = totalArea > 0 ? (occupiedArea / totalArea) * 100 : 0;
  
  return {
    bedId: bed.id,
    bedName: bed.name,
    totalArea,
    occupiedArea,
    availableArea,
    occupancyPercentage,
    plants,
  };
}

/**
 * Calcola spazio totale per il giardino
 */
export function calculateGardenSpace(
  garden: { sizeSqMeters?: number; areaSqMeters?: number },
  beds: GardenBed[],
  tasks: GardenTask[],
  masterSheets: Map<string, PlantMasterSheet>
): GardenSpaceCalculation {
  const totalGardenArea = garden.sizeSqMeters || garden.areaSqMeters || 0;
  
  // Calcola spazio per ogni letto
  const bedsCalculations = beds.map(bed => 
    calculateBedSpace(bed, tasks, masterSheets)
  );
  
  // Calcola totale spazio letti
  const totalBedsArea = beds.reduce(
    (sum, bed) => sum + (bed.areaSqMeters || 0),
    0
  );
  
  // Calcola totale spazio occupato nei letti
  const totalOccupiedArea = bedsCalculations.reduce(
    (sum, calc) => sum + calc.occupiedArea,
    0
  );
  
  // Calcola spazio occupato da task senza letto assegnato
  const unassignedTasks = tasks.filter(
    t => !t.bedId && !t.completed && t.plantName
  );
  
  let unassignedTasksArea = 0;
  unassignedTasks.forEach(task => {
    const masterSheet = masterSheets.get(task.plantName.toLowerCase());
    if (masterSheet) {
      const { areaPerPlant } = calculatePlantArea(masterSheet, task.quantity || 1);
      unassignedTasksArea += areaPerPlant * (task.quantity || 1);
    } else {
      // Stima conservativa
      unassignedTasksArea += 0.09 * (task.quantity || 1);
    }
  });
  
  const totalAvailableArea = Math.max(0, totalGardenArea - totalOccupiedArea - unassignedTasksArea);
  
  return {
    totalGardenArea,
    totalBedsArea,
    totalOccupiedArea,
    totalAvailableArea,
    bedsCalculations,
    unassignedTasksArea,
  };
}

/**
 * Calcola spazio per una struttura (serra/idroponica)
 */
export function calculateStructureSpace(
  structureType: 'Greenhouse' | 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'Indoor',
  structureConfig: any,
  beds: GardenBed[],
  tasks: GardenTask[],
  masterSheets: Map<string, PlantMasterSheet>
): SpaceCalculation | null {
  // Filtra letti associati a questa struttura
  const structureBeds = beds.filter(b => 
    b.structureType === structureType || 
    (b.bedType === structureType)
  );
  
  if (structureBeds.length === 0) {
    return null;
  }
  
  // Calcola spazio totale struttura
  // Per serre/idroponiche, usa le dimensioni dalla config se disponibili
  let totalArea = 0;
  
  if (structureConfig?.growSpace?.growArea) {
    totalArea = structureConfig.growSpace.growArea;
  } else if (structureConfig?.width && structureConfig?.length) {
    // Converti da cm a m²
    totalArea = (structureConfig.width * structureConfig.length) / 10000;
  } else {
    // Somma area di tutti i letti associati
    totalArea = structureBeds.reduce((sum, bed) => sum + (bed.areaSqMeters || 0), 0);
  }
  
  // Calcola spazio occupato da tutti i letti dentro la struttura
  let occupiedArea = 0;
  const allPlants: PlantSpaceDetail[] = [];
  
  structureBeds.forEach(bed => {
    const bedCalc = calculateBedSpace(bed, tasks, masterSheets);
    occupiedArea += bedCalc.occupiedArea;
    allPlants.push(...bedCalc.plants);
  });
  
  const availableArea = Math.max(0, totalArea - occupiedArea);
  const occupancyPercentage = totalArea > 0 ? (occupiedArea / totalArea) * 100 : 0;
  
  return {
    bedId: `structure_${structureType}`,
    bedName: `Struttura ${structureType}`,
    totalArea,
    occupiedArea,
    availableArea,
    occupancyPercentage,
    plants: allPlants,
  };
}

