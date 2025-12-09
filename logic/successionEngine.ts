import { PlantMasterSheet, GardenTask } from '../types';
import { getAllMasterSheets } from '../services/plantMasterService';

export interface SuccessionSuggestion {
  plant: PlantMasterSheet;
  reason: string;
  startSowingDate: Date;
  transplantDate: Date;
  daysUntilSpaceFree: number;
}

/**
 * Determina la stagione successiva basandosi sul mese corrente
 */
const getNextSeason = (currentMonth: number): 'Spring' | 'Summer' | 'Autumn' | 'Winter' => {
  // Mesi: 0 = Gennaio, 11 = Dicembre
  if (currentMonth >= 2 && currentMonth <= 4) return 'Summer'; // Marzo-Maggio -> Estate
  if (currentMonth >= 5 && currentMonth <= 7) return 'Autumn'; // Giugno-Agosto -> Autunno
  if (currentMonth >= 8 && currentMonth <= 10) return 'Winter'; // Settembre-Novembre -> Inverno
  return 'Spring'; // Dicembre-Febbraio -> Primavera
};

/**
 * Verifica se una pianta è adatta a una stagione specifica
 * Basato su logica euristica: analizza il campo transplanting.when e le informazioni disponibili
 */
const isSuitableForSeason = (plant: PlantMasterSheet, season: 'Spring' | 'Summer' | 'Autumn' | 'Winter'): boolean => {
  const when = plant.transplanting.when.toLowerCase();
  
  // Mappatura stagioni -> mesi italiani
  const seasonMonths: Record<string, number[]> = {
    'Spring': [2, 3, 4], // Marzo, Aprile, Maggio
    'Summer': [5, 6, 7], // Giugno, Luglio, Agosto
    'Autumn': [8, 9, 10], // Settembre, Ottobre, Novembre
    'Winter': [11, 0, 1], // Dicembre, Gennaio, Febbraio
  };
  
  const months = seasonMonths[season] || [];
  
  // Cerca riferimenti a mesi nella descrizione
  const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
                      'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  
  for (const month of months) {
    if (when.includes(monthNames[month])) {
      return true;
    }
  }
  
  // Logica euristica basata su famiglia e tipo
  // Piante estive: Solanaceae (pomodoro, peperoncino), Cucurbitaceae (zucchine)
  if (season === 'Summer') {
    return plant.family === 'Solanaceae' || plant.family === 'Cucurbitaceae';
  }
  
  // Piante autunnali/invernali: Asteraceae (lattuga, radicchio), Brassicaceae (cavoli)
  if (season === 'Autumn' || season === 'Winter') {
    return plant.family === 'Asteraceae' || 
           plant.commonName.toUpperCase().includes('CAVOLO') ||
           plant.commonName.toUpperCase().includes('LATTUGA') ||
           plant.commonName.toUpperCase().includes('RADICCHIO');
  }
  
  // Piante primaverili: molte famiglie, ma escludiamo quelle estive
  if (season === 'Spring') {
    return plant.family !== 'Solanaceae' && plant.family !== 'Cucurbitaceae';
  }
  
  return false;
};

/**
 * Calcola il timing per la successione
 * Determina quando iniziare a seminare il sostituto per essere pronti quando lo spazio si libera
 */
const calculateSuccessionTiming = (
  harvestDate: Date,
  nextPlant: PlantMasterSheet
): { startSowing: Date; transplantDate: Date } => {
  // Tempo medio per germinazione + nursing (circa 30-45 giorni per la maggior parte delle piante)
  const avgNursingDays = 35;
  
  // Calcola quando iniziare a seminare (circa 35 giorni prima della raccolta)
  const startSowing = new Date(harvestDate);
  startSowing.setDate(startSowing.getDate() - avgNursingDays);
  
  // La data di trapianto è quando lo spazio si libera (giorno della raccolta o poco dopo)
  const transplantDate = new Date(harvestDate);
  transplantDate.setDate(transplantDate.getDate() + 2); // 2 giorni dopo la raccolta per preparare il terreno
  
  return { startSowing, transplantDate };
};

/**
 * Trova il sostituto perfetto per una successione
 * Considera: rotazione colturale (famiglia diversa) + stagionalità
 */
export const checkEmptySpaceOpportunity = (
  harvestTask: GardenTask,
  allMasterSheets: PlantMasterSheet[],
  currentDate: Date = new Date()
): SuccessionSuggestion | null => {
  // Trova la pianta rimossa
  const removedPlant = allMasterSheets.find(p => 
    p.commonName.toUpperCase() === harvestTask.plantName.toUpperCase()
  );
  
  if (!removedPlant) {
    return null;
  }
  
  const removedFamily = removedPlant.family;
  const currentMonth = currentDate.getMonth();
  const nextSeason = getNextSeason(currentMonth);
  
  // Calcola quando lo spazio si libererà (basato su harvestWindow o stima)
  // Per ora usiamo una stima: se la pianta è in produzione avanzata, assumiamo raccolta tra 20-30 giorni
  const estimatedHarvestDate = new Date(currentDate);
  estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + 25); // Stima: 25 giorni
  
  // Trova il sostituto perfetto
  const suggestion = allMasterSheets.find(plant => {
    // NON della stessa famiglia (rotazione)
    if (plant.family === removedFamily) return false;
    
    // Adatta alla prossima stagione
    if (!isSuitableForSeason(plant, nextSeason)) return false;
    
    // Non suggerire piante troppo simili (stesso nutrientCategory potrebbe competere)
    // Per ora accettiamo tutte, ma potremmo raffinare
    
    return true;
  });
  
  if (!suggestion) {
    return null;
  }
  
  const { startSowing, transplantDate } = calculateSuccessionTiming(estimatedHarvestDate, suggestion);
  const daysUntilSpaceFree = Math.ceil((estimatedHarvestDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    plant: suggestion,
    reason: `Hai liberato uno spazio! È il momento perfetto per mettere ${suggestion.commonName.toLowerCase()}. Essendo di una famiglia diversa (${suggestion.family}), sfrutterà nutrienti diversi e romperà il ciclo delle malattie.`,
    startSowingDate: startSowing,
    transplantDate: transplantDate,
    daysUntilSpaceFree: daysUntilSpaceFree,
  };
};

/**
 * Trova tutte le opportunità di successione per un giardino
 * Analizza tutte le piante in produzione avanzata
 */
export const findAllSuccessionOpportunities = (
  tasks: GardenTask[],
  currentDate: Date = new Date()
): SuccessionSuggestion[] => {
  const allMasterSheets = getAllMasterSheets();
  const suggestions: SuccessionSuggestion[] = [];
  
  // Trova piante in produzione avanzata (90+ giorni o con lifecycleState Production)
  const productionTasks = tasks.filter(task => {
    if (task.lifecycleState === 'Production') return true;
    
    // Calcola giorni dalla semina
    const taskDate = new Date(task.date);
    const daysAlive = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAlive >= 90;
  });
  
  for (const task of productionTasks) {
    const suggestion = checkEmptySpaceOpportunity(task, allMasterSheets, currentDate);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  }
  
  return suggestions;
};

/**
 * Verifica se una pianta è in fase di produzione avanzata e potrebbe essere sostituita presto
 */
export const isPlantNearHarvestEnd = (
  task: GardenTask,
  masterData: PlantMasterSheet,
  currentDate: Date = new Date()
): boolean => {
  if (task.lifecycleState === 'Production') {
    const taskDate = new Date(task.date);
    const daysAlive = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Se la pianta ha più di 90 giorni, è probabile che stia finendo il ciclo
    // Per piante a ciclo breve (lattuga, ravanelli), il ciclo è più corto
    const isShortCycle = masterData.family === 'Asteraceae' || 
                         masterData.commonName.toUpperCase().includes('LATTUGA') ||
                         masterData.commonName.toUpperCase().includes('RAVANELLO');
    
    if (isShortCycle && daysAlive >= 40) return true;
    if (!isShortCycle && daysAlive >= 90) return true;
  }
  
  return false;
};




