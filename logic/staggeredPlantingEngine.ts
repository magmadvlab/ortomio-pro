/**
 * Staggered Planting Engine (Scaglionatura) - VERSIONE PROFESSIONALE
 * Calcola scaglionamento basato su gestione operativa e capacità di raccolta
 * PRINCIPIO: Ogni coltura su scala commerciale beneficia dello scaglionamento
 */

import { PlantMasterSheet } from '../types';

export interface StaggeredPlantingAdvice {
  recommended: boolean;
  reason: string;
  optimalBatches: number;
  optimalIntervalDays: number;
  expectedHarvestWindow: {
    firstHarvest: Date;
    lastHarvest: Date;
    totalDays: number;
  };
  benefits: string[];
  operationalBenefits: {
    harvestCapacityManagement: string;
    laborDistribution: string;
    marketRiskReduction: string;
    qualityMaintenance: string;
  };
}

/**
 * Configurazione scaglionamento per gestione operativa professionale
 * Basata su: capacità raccolta, deperibilità, finestra commerciale
 */
const PROFESSIONAL_STAGGERING_CONFIG: Record<string, { 
  batches: number; 
  interval: number; 
  reason: string;
  harvestWindow: number; // giorni di finestra raccolta per lotto
}> = {
  // ORTAGGI A CICLO BREVE - Scaglionamento per continuità
  'LATTUGA': { batches: 4, interval: 14, reason: 'Ciclo breve, deperibilità alta', harvestWindow: 7 },
  'RAVANELLO': { batches: 5, interval: 10, reason: 'Ciclo velocissimo, qualità degrada rapidamente', harvestWindow: 5 },
  'SPINACI': { batches: 4, interval: 14, reason: 'Foglie tenere, finestra raccolta limitata', harvestWindow: 10 },
  'RUCOLA': { batches: 4, interval: 12, reason: 'Crescita rapida, qualità ottimale solo giovane', harvestWindow: 7 },
  
  // ORTAGGI A CICLO MEDIO - Scaglionamento per gestione operativa
  'POMODORO': { batches: 3, interval: 21, reason: 'Gestione raccolta intensiva, distribuzione carico lavoro', harvestWindow: 14 },
  'PEPERONE': { batches: 3, interval: 21, reason: 'Raccolta manuale intensiva, evita picchi operativi', harvestWindow: 21 },
  'MELANZANA': { batches: 3, interval: 21, reason: 'Raccolta frequente richiesta, distribuzione manodopera', harvestWindow: 14 },
  'ZUCCHINA': { batches: 2, interval: 21, reason: 'Produzione continua, evita sovraccarico raccolta', harvestWindow: 30 },
  'CETRIOLO': { batches: 2, interval: 21, reason: 'Raccolta quotidiana necessaria, gestione operativa', harvestWindow: 30 },
  
  // LEGUMINOSE - Scaglionamento per mercato e lavorazione
  'FAGIOLO': { batches: 3, interval: 14, reason: 'Concentrazione raccolta, distribuzione per mercato', harvestWindow: 10 },
  'PISELLO': { batches: 3, interval: 14, reason: 'Finestra raccolta stretta, qualità degrada velocemente', harvestWindow: 7 },
  'FAVA': { batches: 2, interval: 21, reason: 'Raccolta manuale, distribuzione carico operativo', harvestWindow: 14 },
  
  // ERBE AROMATICHE - Scaglionamento per qualità
  'BASILICO': { batches: 3, interval: 21, reason: 'Qualità foglie giovani, raccolta continua', harvestWindow: 45 },
  'PREZZEMOLO': { batches: 3, interval: 30, reason: 'Raccolta scalare, mantenimento qualità', harvestWindow: 60 },
  
  // RADICI - Scaglionamento per conservazione e mercato
  'CAROTA': { batches: 3, interval: 21, reason: 'Calibri diversi, distribuzione mercato', harvestWindow: 30 },
  'BARBABIETOLA': { batches: 2, interval: 28, reason: 'Gestione calibri, evita sovraproduzione', harvestWindow: 21 },
  'CIPOLLA': { batches: 2, interval: 30, reason: 'Maturazione scalare, gestione conservazione', harvestWindow: 14 },
  
  // BRASSICACEE - Scaglionamento per qualità e mercato
  'CAVOLO': { batches: 2, interval: 21, reason: 'Evita sovramaturazione, distribuzione mercato', harvestWindow: 21 },
  'CAVOLFIORE': { batches: 3, interval: 14, reason: 'Finestra qualità stretta, gestione operativa', harvestWindow: 7 },
  'BROCCOLO': { batches: 3, interval: 14, reason: 'Qualità degrada rapidamente, raccolta frequente', harvestWindow: 7 },
};

/**
 * Calcola scaglionamento professionale basato su superficie e gestione operativa
 */
export const calculateStaggeredPlanting = (
  plant: PlantMasterSheet,
  startDate: Date = new Date(),
  surfaceHectares: number = 1, // NUOVO: considera la superficie
  harvestCapacityPerDay: number = 0.5 // NUOVO: ettari raccoglibili al giorno
): StaggeredPlantingAdvice => {
  const plantName = plant.commonName.toUpperCase();
  const config = PROFESSIONAL_STAGGERING_CONFIG[plantName];

  // LOGICA PROFESSIONALE: Calcola scaglionamento basato su capacità operativa
  let batches: number;
  let interval: number;
  let reason: string;
  let harvestWindow: number;

  if (config) {
    // Usa configurazione predefinita come base
    batches = config.batches;
    interval = config.interval;
    reason = config.reason;
    harvestWindow = config.harvestWindow;
  } else {
    // FALLBACK INTELLIGENTE: Calcola basandosi su caratteristiche della pianta
    const isLeafy = plant.family === 'Asteraceae' || plant.family === 'Brassicaceae';
    const isFruit = plant.family === 'Solanaceae' || plant.family === 'Cucurbitaceae';
    const isRoot = plant.family === 'Apiaceae' || plant.family === 'Amaranthaceae';
    
    if (isLeafy) {
      batches = 4;
      interval = 14;
      reason = 'Ortaggi a foglia: qualità degrada rapidamente, raccolta frequente';
      harvestWindow = 7;
    } else if (isFruit) {
      batches = 3;
      interval = 21;
      reason = 'Ortaggi da frutto: gestione raccolta intensiva, distribuzione carico lavoro';
      harvestWindow = 14;
    } else if (isRoot) {
      batches = 2;
      interval = 28;
      reason = 'Ortaggi da radice: gestione calibri, distribuzione mercato';
      harvestWindow = 21;
    } else {
      batches = 2;
      interval = 21;
      reason = 'Gestione operativa standard: evita concentrazione raccolta';
      harvestWindow = 14;
    }
  }

  // ADATTAMENTO PER SUPERFICIE GRANDE
  if (surfaceHectares > 2) {
    // Per superfici grandi, aumenta il numero di lotti
    const additionalBatches = Math.ceil(surfaceHectares / 2);
    batches = Math.min(batches + additionalBatches, 6); // Max 6 lotti
    
    // Riduci intervallo per superfici molto grandi
    if (surfaceHectares > 5) {
      interval = Math.max(interval - 7, 7); // Min 7 giorni
    }
    
    reason += ` - Superficie ${surfaceHectares}ha richiede distribuzione raccolta`;
  }

  // CALCOLO CAPACITÀ RACCOLTA
  const totalHarvestDays = surfaceHectares / harvestCapacityPerDay;
  if (totalHarvestDays > harvestWindow) {
    // Se serve più tempo per raccogliere di quanto la qualità permetta
    const neededBatches = Math.ceil(totalHarvestDays / harvestWindow);
    batches = Math.max(batches, neededBatches);
    reason += ` - Capacità raccolta richiede ${neededBatches} lotti minimi`;
  }

  // Calcola date e finestre
  const firstHarvest = new Date(startDate);
  firstHarvest.setDate(firstHarvest.getDate() + (plant.daysToMaturity || 70));

  const lastPlantingDate = new Date(startDate);
  lastPlantingDate.setDate(lastPlantingDate.getDate() + ((batches - 1) * interval));

  const lastHarvest = new Date(lastPlantingDate);
  lastHarvest.setDate(lastHarvest.getDate() + (plant.daysToMaturity || 70) + harvestWindow);

  const totalDays = Math.ceil((lastHarvest.getTime() - firstHarvest.getTime()) / (1000 * 60 * 60 * 24));

  // Benefici operativi specifici
  const operationalBenefits = {
    harvestCapacityManagement: `Distribuzione raccolta su ${totalDays} giorni invece di ${harvestWindow}`,
    laborDistribution: `Fabbisogno manodopera distribuito: ${Math.ceil(surfaceHectares/batches)}ha per lotto`,
    marketRiskReduction: `Riduzione rischio mercato: ${batches} finestre di vendita diverse`,
    qualityMaintenance: `Qualità ottimale: raccolta in finestre di ${harvestWindow} giorni per lotto`
  };

  const benefits = [
    'Distribuzione carico di lavoro operativo',
    'Riduzione rischio concentrazione raccolta',
    'Ottimizzazione qualità prodotto',
    'Diversificazione finestre di mercato',
    'Gestione efficiente manodopera',
    'Riduzione perdite da sovramaturazione'
  ];

  return {
    recommended: true, // SEMPRE raccomandato per uso professionale
    reason,
    optimalBatches: batches,
    optimalIntervalDays: interval,
    expectedHarvestWindow: {
      firstHarvest,
      lastHarvest,
      totalDays,
    },
    benefits,
    operationalBenefits,
  };
};

/**
 * Get suggested batches for a plant based on professional configuration
 */
export const getSuggestedBatches = (plant: PlantMasterSheet, surfaceHectares: number = 1): { batches: number; interval: number } => {
  const plantName = plant.commonName.toUpperCase();
  const config = PROFESSIONAL_STAGGERING_CONFIG[plantName];

  if (config) {
    let batches = config.batches;
    
    // Adatta per superficie grande
    if (surfaceHectares > 2) {
      const additionalBatches = Math.ceil(surfaceHectares / 2);
      batches = Math.min(batches + additionalBatches, 6);
    }
    
    return { batches, interval: config.interval };
  }

  // Fallback basato su famiglia botanica
  const isLeafy = plant.family === 'Asteraceae' || plant.family === 'Brassicaceae';
  const isFruit = plant.family === 'Solanaceae' || plant.family === 'Cucurbitaceae';
  const isRoot = plant.family === 'Apiaceae' || plant.family === 'Amaranthaceae';

  let batches = 2;
  let interval = 21;

  if (isLeafy) {
    batches = 4;
    interval = 14;
  } else if (isFruit) {
    batches = 3;
    interval = 21;
  } else if (isRoot) {
    batches = 2;
    interval = 28;
  }

  // Adatta per superficie
  if (surfaceHectares > 2) {
    batches = Math.min(batches + Math.ceil(surfaceHectares / 2), 6);
  }

  return { batches, interval };
};

/**
 * Calculate next batch date
 */
export const getNextBatchDate = (
  firstBatchDate: Date,
  batchNumber: number,
  intervalDays: number
): Date => {
  const nextDate = new Date(firstBatchDate);
  nextDate.setDate(nextDate.getDate() + (batchNumber * intervalDays));
  return nextDate;
};

/**
 * Generate all batch dates for staggered planting
 */
export const generateBatchDates = (
  startDate: Date,
  numBatches: number,
  intervalDays: number
): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < numBatches; i++) {
    const batchDate = new Date(startDate);
    batchDate.setDate(batchDate.getDate() + (i * intervalDays));
    dates.push(batchDate);
  }
  return dates;
};

