import { PlantMasterSheet, GardenTask } from '../types';

export interface Spacing {
  row: number; // Distanza sulla fila (cm)
  between: number; // Distanza tra le file (cm)
}

export interface Footprint {
  width: number; // Larghezza ingombro (cm)
  height: number; // Altezza ingombro (cm)
  radius: number; // Raggio per collision detection circolare (cm)
}

/**
 * Parsa una stringa di spacing come "40cm sulla fila, 60cm tra le file"
 * in un oggetto numerico. Gestisce formati per ortaggi, frutteti, viti e olivi.
 */
export const parseSpacing = (spacingString: string): Spacing | null => {
  if (!spacingString || !spacingString.trim()) {
    return null;
  }
  
  const cleaned = spacingString.toLowerCase().trim();
  
  // Pattern 1: Ortaggi tradizionali "Xcm sulla fila, Ycm tra le file"
  const pattern1 = /(\d+)\s*cm\s*(?:sulla|sulle|sul)\s*(?:fila|file).*?(\d+)\s*cm\s*(?:tra|fra)\s*(?:le\s*)?(?:file|fila)/;
  const match1 = cleaned.match(pattern1);
  if (match1) {
    return {
      row: parseInt(match1[1], 10),
      between: parseInt(match1[2], 10)
    };
  }
  
  // Pattern 2: Viti "X-Ym sulla fila, Z-Wm tra le file"
  const pattern2 = /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*m\s*(?:sulla|sulle|sul)\s*(?:fila|file).*?(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*m\s*(?:tra|fra)\s*(?:le\s*)?(?:file|fila)/;
  const match2 = cleaned.match(pattern2);
  if (match2) {
    const rowMin = parseFloat(match2[1]);
    const rowMax = parseFloat(match2[2]);
    const betweenMin = parseFloat(match2[3]);
    const betweenMax = parseFloat(match2[4]);
    return {
      row: ((rowMin + rowMax) / 2) * 100, // Converti metri in cm
      between: ((betweenMin + betweenMax) / 2) * 100
    };
  }
  
  // Pattern 3: Frutteti/Olivi "X-Ym tra gli alberi"
  const pattern3 = /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*m\s*(?:tra|fra)\s*(?:gli|le)\s*(?:alberi|piante)/;
  const match3 = cleaned.match(pattern3);
  if (match3) {
    const min = parseFloat(match3[1]);
    const max = parseFloat(match3[2]);
    const avg = (min + max) / 2;
    // Per frutteti, usa distanza media come spacing quadrato
    return {
      row: avg * 100, // Converti metri in cm
      between: avg * 100
    };
  }
  
  // Pattern 4: Frutteti/Olivi "Xm tra gli alberi" (singolo valore)
  const pattern4 = /(\d+(?:\.\d+)?)\s*m\s*(?:tra|fra)\s*(?:gli|le)\s*(?:alberi|piante)/;
  const match4 = cleaned.match(pattern4);
  if (match4) {
    const dist = parseFloat(match4[1]) * 100; // Converti metri in cm
    return {
      row: dist,
      between: dist
    };
  }
  
  // Pattern 5: "X-Ycm" (assume stesso valore per entrambi)
  const pattern5 = /(\d+)(?:\s*-\s*(\d+))?\s*cm/;
  const match5 = cleaned.match(pattern5);
  if (match5) {
    const val1 = parseInt(match5[1], 10);
    const val2 = match5[2] ? parseInt(match5[2], 10) : val1;
    return {
      row: Math.min(val1, val2),
      between: Math.max(val1, val2)
    };
  }
  
  // Pattern 6: Singolo numero (assume stesso valore)
  const pattern6 = /(\d+)/;
  const match6 = cleaned.match(pattern6);
  if (match6) {
    const val = parseInt(match6[1], 10);
    return { row: val, between: val };
  }
  
  console.warn(`Impossibile parsare spacing: "${spacingString}"`);
  return null;
};

/**
 * Calcola l'ingombro (footprint) di una pianta basandosi sui dati master
 */
export const calculateFootprint = (masterData: PlantMasterSheet): Footprint => {
  const spacing = parseSpacing(masterData.transplanting.spacing);
  if (!spacing) {
    // Default se spacing non parsabile
    return {
      width: 30,
      height: 30,
      radius: 15
    };
  }
  
  // L'ingombro è basato sulla distanza di trapianto
  // Usiamo la distanza maggiore tra row e between come diametro base
  const maxSpacing = Math.max(spacing.row, spacing.between);
  
  // Il footprint è un cerchio con raggio = metà della distanza maggiore
  // Questo garantisce che due piante non si sovrappongano
  const radius = maxSpacing / 2;
  
  return {
    width: maxSpacing,
    height: maxSpacing,
    radius
  };
};

/**
 * Calcola la distanza tra due punti nella griglia
 */
const calculateDistance = (
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Verifica se due piante sono troppo vicine (collisione)
 */
export const checkCollision = (
  task1: GardenTask,
  task2: GardenTask,
  masterData1: PlantMasterSheet,
  masterData2: PlantMasterSheet
): { hasCollision: boolean; distance: number; minRequired: number; message?: string } => {
  if (!task1.gridPosition || !task2.gridPosition) {
    return { hasCollision: false, distance: Infinity, minRequired: 0 };
  }
  
  const footprint1 = calculateFootprint(masterData1);
  const footprint2 = calculateFootprint(masterData2);
  
  // Distanza minima richiesta: somma dei raggi
  const minRequired = footprint1.radius + footprint2.radius;
  
  // Distanza effettiva
  const distance = calculateDistance(task1.gridPosition, task2.gridPosition);
  
  const hasCollision = distance < minRequired;
  
  let message: string | undefined;
  if (hasCollision) {
    const deficit = minRequired - distance;
    message = `Troppo vicine! ${task1.plantName} e ${task2.plantName} sono a ${distance.toFixed(0)}cm ma servono almeno ${minRequired.toFixed(0)}cm. Sposta di almeno ${deficit.toFixed(0)}cm.`;
  }
  
  return { hasCollision, distance, minRequired, message };
};

/**
 * Verifica collisioni multiple per una pianta rispetto a tutte le altre
 */
export const checkAllCollisions = (
  task: GardenTask,
  allTasks: GardenTask[],
  masterDataMap: Map<string, PlantMasterSheet>
): Array<{ task: GardenTask; collision: ReturnType<typeof checkCollision> }> => {
  if (!task.gridPosition) return [];
  
  const masterData1 = masterDataMap.get(task.plantName);
  if (!masterData1) return [];
  
  const collisions: Array<{ task: GardenTask; collision: ReturnType<typeof checkCollision> }> = [];
  
  for (const otherTask of allTasks) {
    if (otherTask.id === task.id || !otherTask.gridPosition) continue;
    
    const masterData2 = masterDataMap.get(otherTask.plantName);
    if (!masterData2) continue;
    
    const collision = checkCollision(task, otherTask, masterData1, masterData2);
    if (collision.hasCollision) {
      collisions.push({ task: otherTask, collision });
    }
  }
  
  return collisions;
};

/**
 * Suggerisce un orientamento ottimale per le file
 * Basato sulla forma dell'orto e sulle distanze
 */
export const suggestRotation = (
  masterData: PlantMasterSheet,
  gardenWidth: number, // Larghezza orto in cm
  gardenHeight: number // Altezza orto in cm
): number => {
  const spacing = parseSpacing(masterData.transplanting.spacing);
  if (!spacing) {
    return 0; // Default
  }
  
  // Se la distanza tra le file è maggiore, orienta le file orizzontalmente (0°)
  // Se la distanza sulla fila è maggiore, orienta le file verticalmente (90°)
  if (spacing.between > spacing.row) {
    // File orizzontali (piante in riga)
    return 0;
  } else {
    // File verticali (piante in colonna)
    return 90;
  }
};

/**
 * Suggerisce una posizione iniziale per una nuova pianta
 * Basato su rotazioni colturali e distanze minime
 */
export const suggestInitialPosition = (
  task: GardenTask,
  allTasks: GardenTask[],
  masterData: PlantMasterSheet,
  gardenWidth: number,
  gardenHeight: number
): { x: number; y: number; rotation: number } | null => {
  const footprint = calculateFootprint(masterData);
  const spacing = parseSpacing(masterData.transplanting.spacing);
  if (!spacing) {
    // Se spacing non disponibile, restituisci posizione centrale
    return {
      x: gardenWidth / 2,
      y: gardenHeight / 2,
      rotation: 0
    };
  }
  
  // Inizia da una posizione sicura (margine)
  const margin = footprint.radius + 20; // 20cm di margine
  
  // Prova posizioni in griglia
  for (let y = margin; y < gardenHeight - margin; y += spacing.between) {
    for (let x = margin; x < gardenWidth - margin; x += spacing.row) {
      const testPosition = { x, y };
      const testTask = { ...task, gridPosition: testPosition };
      
      // Verifica collisioni (dovremmo avere masterDataMap, ma per semplicità controlliamo solo posizione)
      let hasCollision = false;
      for (const otherTask of allTasks) {
        if (!otherTask.gridPosition) continue;
        const distance = calculateDistance(testPosition, otherTask.gridPosition);
        if (distance < footprint.radius * 2) {
          hasCollision = true;
          break;
        }
      }
      
      if (!hasCollision) {
        return {
          x,
          y,
          rotation: suggestRotation(masterData, gardenWidth, gardenHeight)
        };
      }
    }
  }
  
  // Se non trova spazio, restituisce una posizione centrale
  return {
    x: gardenWidth / 2,
    y: gardenHeight / 2,
    rotation: 0
  };
};

/**
 * Calcola il numero massimo di piante che possono essere piantate in un orto
 */
export const calculateMaxPlants = (
  masterData: PlantMasterSheet,
  gardenSizeSqMeters: number
): { maxPlants: number; layout: 'rows' | 'square'; efficiency: number } => {
  const spacing = parseSpacing(masterData.transplanting.spacing);
  if (!spacing) {
    return { maxPlants: 0, layout: 'rows', efficiency: 0 };
  }
  
  // Converti m² in cm²
  const gardenSizeCm = Math.sqrt(gardenSizeSqMeters * 10000);
  
  // Calcola layout a file
  const plantsPerRow = Math.floor(gardenSizeCm / spacing.row);
  const numRows = Math.floor(gardenSizeCm / spacing.between);
  const maxPlantsRows = plantsPerRow * numRows;
  
  // Calcola layout quadrato (più compatto)
  const plantsPerSide = Math.floor(gardenSizeCm / spacing.row);
  const maxPlantsSquare = plantsPerSide * plantsPerSide;
  
  // Scegli il layout migliore
  if (maxPlantsRows > maxPlantsSquare) {
    return {
      maxPlants: maxPlantsRows,
      layout: 'rows',
      efficiency: (maxPlantsRows * spacing.row * spacing.between) / (gardenSizeCm * gardenSizeCm)
    };
  } else {
    return {
      maxPlants: maxPlantsSquare,
      layout: 'square',
      efficiency: (maxPlantsSquare * spacing.row * spacing.row) / (gardenSizeCm * gardenSizeCm)
    };
  }
};

/**
 * Suggerisce un layout ottimale per una pianta
 */
export const suggestOptimalLayout = (
  masterData: PlantMasterSheet,
  gardenWidth: number,
  gardenHeight: number
): string => {
  const spacing = parseSpacing(masterData.transplanting.spacing);
  if (!spacing) {
    return 'Distanze non disponibili';
  }
  
  const plantsPerRow = Math.floor(gardenWidth / spacing.row);
  const numRows = Math.floor(gardenHeight / spacing.between);
  
  return `Layout consigliato: ${plantsPerRow} piante per fila × ${numRows} file = ${plantsPerRow * numRows} piante totali`;
};

/**
 * Calcola la densità ottimale
 */
export const calculateOptimalDensity = (
  masterData: PlantMasterSheet,
  currentQuantity: number,
  gardenSizeSqMeters: number
): { optimal: number; canIncrease: boolean; canDecrease: boolean; suggestion: string } => {
  const maxInfo = calculateMaxPlants(masterData, gardenSizeSqMeters);
  
  const canIncrease = currentQuantity < maxInfo.maxPlants;
  const canDecrease = currentQuantity > maxInfo.maxPlants * 0.8; // Se è oltre l'80% del massimo
  
  let suggestion = '';
  if (currentQuantity < maxInfo.maxPlants * 0.5) {
    suggestion = `Puoi aumentare fino a ${maxInfo.maxPlants} piante`;
  } else if (currentQuantity > maxInfo.maxPlants) {
    suggestion = `Troppe piante! Massimo consigliato: ${maxInfo.maxPlants}`;
  } else {
    suggestion = `Quantità ottimale: ${currentQuantity} piante su ${maxInfo.maxPlants} possibili`;
  }
  
  return {
    optimal: maxInfo.maxPlants,
    canIncrease,
    canDecrease,
    suggestion
  };
};

/**
 * Verifica spacing per consociazioni
 */
export const checkCompanionSpacing = (
  plant1: PlantMasterSheet,
  plant2: PlantMasterSheet,
  distance: number // Distanza attuale in cm
): { compatible: boolean; suggestedDistance?: number; reason: string } => {
  const spacing1 = parseSpacing(plant1.transplanting.spacing);
  const spacing2 = parseSpacing(plant2.transplanting.spacing);
  
  if (!spacing1 || !spacing2) {
    return { compatible: true, reason: 'Distanze non disponibili' };
  }
  
  // Distanza minima consigliata: media delle distanze sulla fila
  const minDistance = (spacing1.row + spacing2.row) / 2;
  
  if (distance < minDistance * 0.7) {
    return {
      compatible: false,
      suggestedDistance: minDistance,
      reason: `Distanza troppo ravvicinata. Consigliato almeno ${minDistance}cm`
    };
  }
  
  return {
    compatible: true,
    reason: 'Distanza adeguata per consociazioni'
  };
};

/**
 * Determina tipo di coltura dal master sheet
 */
export const getCropType = (masterData: PlantMasterSheet): 'vegetable' | 'orchard' | 'vineyard' | 'olive' => {
  // Verifica se è coltura specializzata (ha campo cropType)
  if ('cropType' in masterData) {
    const cropType = (masterData as any).cropType;
    if (cropType === 'FruitTree') return 'orchard';
    if (cropType === 'Vine') return 'vineyard';
    if (cropType === 'Olive') return 'olive';
  }
  
  // Fallback: verifica per nome comune
  const name = masterData.commonName.toLowerCase();
  if (name.includes('vite') || name.includes('vigneto')) return 'vineyard';
  if (name.includes('olivo') || name.includes('oliva')) return 'olive';
  if (name.includes('melo') || name.includes('pero') || name.includes('ciliegio') || 
      name.includes('pesco') || name.includes('albicocco') || name.includes('susino') ||
      name.includes('mandorlo') || name.includes('nocciolo')) return 'orchard';
  
  return 'vegetable';
};

/**
 * Calcola layout per frutteti (spacing quadrato)
 */
export const calculateOrchardLayout = (
  spacing: Spacing,
  areaSqm: number,
  numPlants?: number
): {
  maxPlants: number;
  plantsPerRow: number;
  numRows: number;
  layout: string;
  areaNeeded?: number;
} => {
  if (numPlants) {
    // Calcola area necessaria per numero piante
    const areaPerPlant = (spacing.row * spacing.between) / 10000; // m²
    const totalArea = numPlants * areaPerPlant;
    const sideNeeded = Math.sqrt(totalArea * 10000); // cm
    const plantsPerRow = Math.floor(sideNeeded / spacing.row);
    const numRows = Math.ceil(numPlants / plantsPerRow);
    
    return {
      maxPlants: numPlants,
      plantsPerRow,
      numRows,
      layout: `${plantsPerRow} alberi per fila × ${numRows} file = ${numPlants} alberi totali`,
      areaNeeded: totalArea
    };
  } else {
    // Calcola numero massimo piante per area
    const sideCm = Math.sqrt(areaSqm * 10000);
    const plantsPerRow = Math.floor(sideCm / spacing.row);
    const numRows = Math.floor(sideCm / spacing.between);
    const maxPlants = plantsPerRow * numRows;
    
    return {
      maxPlants,
      plantsPerRow,
      numRows,
      layout: `${plantsPerRow} alberi per fila × ${numRows} file = ${maxPlants} alberi totali`
    };
  }
};

/**
 * Calcola layout per viti (spacing rettangolare)
 */
export const calculateVineyardLayout = (
  spacing: Spacing,
  areaSqm: number,
  numPlants?: number
): {
  maxPlants: number;
  plantsPerRow: number;
  numRows: number;
  layout: string;
  areaNeeded?: number;
} => {
  if (numPlants) {
    // Calcola area necessaria per numero piante
    const areaPerPlant = (spacing.row * spacing.between) / 10000; // m²
    const totalArea = numPlants * areaPerPlant;
    // Per layout rettangolare, calcola proporzioni basate su spacing
    const ratio = spacing.between / spacing.row;
    const length = Math.sqrt(totalArea * 10000 * ratio);
    const width = Math.sqrt(totalArea * 10000 / ratio);
    const plantsPerRow = Math.floor(length / spacing.row);
    const numRows = Math.ceil(numPlants / plantsPerRow);
    
    return {
      maxPlants: numPlants,
      plantsPerRow,
      numRows,
      layout: `${plantsPerRow} viti per fila × ${numRows} file = ${numPlants} viti totali`,
      areaNeeded: totalArea
    };
  } else {
    // Calcola numero massimo piante per area
    const sideCm = Math.sqrt(areaSqm * 10000);
    const plantsPerRow = Math.floor(sideCm / spacing.row);
    const numRows = Math.floor(sideCm / spacing.between);
    const maxPlants = plantsPerRow * numRows;
    
    return {
      maxPlants,
      plantsPerRow,
      numRows,
      layout: `${plantsPerRow} viti per fila × ${numRows} file = ${maxPlants} viti totali`
    };
  }
};

/**
 * Calcola layout per olivi (spacing quadrato tradizionale)
 * Simile a frutteti ma con distanze tipicamente più ampie
 */
export const calculateOliveLayout = (
  spacing: Spacing,
  areaSqm: number,
  numPlants?: number
): {
  maxPlants: number;
  plantsPerRow: number;
  numRows: number;
  layout: string;
  areaNeeded?: number;
} => {
  // Usa stessa logica di frutteti (layout quadrato)
  return calculateOrchardLayout(spacing, areaSqm, numPlants);
};

/**
 * Helper per ottenere master sheet considerando varietà specifiche
 * Nota: Questa funzione deve essere chiamata con getMasterSheetSync come parametro
 * per evitare dipendenze circolari
 */
export const getMasterSheetForPlant = (
  plantName: string,
  variety: string | undefined,
  getMasterSheetSyncFn: (name: string) => any
): any => {
  // Se c'è una varietà, prova prima a cercare master sheet specifico per varietà
  if (variety && variety.trim()) {
    // Prova combinazione completa: "PIANTA VARIETÀ"
    const varietyName = `${plantName} ${variety}`.trim();
    const varietyMaster = getMasterSheetSyncFn(varietyName);
    if (varietyMaster) {
      return varietyMaster;
    }
    
    // Prova anche solo con la varietà (per frutteti specializzati come "melo-golden")
    const varietyOnly = getMasterSheetSyncFn(variety.trim());
    if (varietyOnly) {
      return varietyOnly;
    }
  }
  
  // Fallback: cerca master sheet base
  return getMasterSheetSyncFn(plantName);
};

