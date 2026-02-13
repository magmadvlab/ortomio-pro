/**
 * Traduzioni per i tipi di task dall'inglese all'italiano
 * Utilizzato per localizzare l'interfaccia utente
 */

export const TASK_TYPE_TRANSLATIONS: Record<string, string> = {
  // Task principali
  'Sowing': 'Semina',
  'Transplant': 'Trapianto',
  'Fertilize': 'Fertilizzazione',
  'Prune': 'Potatura',
  'Harvest': 'Raccolta',
  'Treatment': 'Trattamento',
  'Irrigation': 'Irrigazione',
  'Photo': 'Foto',
  
  // Lavorazioni del terreno
  'Plowing': 'Aratura',
  'Subsoiling': 'Ripuntatura',
  'Harrowing': 'Erpicatura',
  'Tilling': 'Fresatura',
  'Rolling': 'Rullatura',
  'Hoeing': 'Zappatura',
  'EarthingUp': 'Rincalzatura',
  'Mulching': 'Pacciamatura',
  'PostSowingRolling': 'Rullatura Post-Semina',
  'Clearing': 'Spietramento',
  'Stumping': 'Estirpazione Ceppi',
  'StoneRemoval': 'Rimozione Sassi',
  'Leveling': 'Livellamento',
  'DeepSubsoiling': 'Ripuntatura Profonda',
  'Digging': 'Vangatura',
  'DeepHarrowing': 'Erpicatura Profonda',
  'Crumbling': 'Sminuzzamento',
  'Scraping': 'Raschiatura',
  'SurfaceLeveling': 'Livellamento Superficiale',
  'MinimumTillage': 'Lavorazione Minima',
  'StripTillage': 'Lavorazione a Strisce',
  'NoTill': 'Semina su Sodo',
  
  // Potature specializzate
  'FormativePruning': 'Potatura di Formazione',
  'MaintenancePruning': 'Potatura di Mantenimento',
  'RejuvenationPruning': 'Potatura di Ringiovanimento',
  'SummerPruning': 'Potatura Estiva',
  'WinterPruning': 'Potatura Invernale',
  'Thinning': 'Diradamento',
  'Suckering': 'Scacchiatura',
  'Defoliation': 'Defogliazione',
  'Tying': 'Legatura',
  
  // Operazioni specifiche per colture
  'OliveShredding': 'Trinciatura Olive',
  'RunnerManagement': 'Gestione Stoloni',
  'StrawberryMulching': 'Pacciamatura Fragole',
  'StrawberryCleaning': 'Pulizia Fragole',
  'CaneRemoval': 'Rimozione Tralci',
  'TipPruning': 'Cimatura',
  'RaspberryTying': 'Legatura Lamponi',
  'SuckerThinning': 'Diradamento Polloni',
  'FruitBagging': 'Insacchettamento Frutti',
  'ExoticThinning': 'Diradamento Esotici',
  'Shredding': 'Trinciatura',
  'Topping': 'Spuntatura',
  'TreePruning': 'Potatura Alberi',
  
  // Operazioni idroponiche
  'HydroNutrientCheck': 'Controllo Nutrienti',
  'HydroSolutionChange': 'Cambio Soluzione',
  'HydroSystemClean': 'Pulizia Sistema',
  'HydroPhAdjust': 'Correzione pH',
  'HydroEcAdjust': 'Correzione EC',
  'HydroAlgaeControl': 'Controllo Alghe',
  'HydroEquipmentCheck': 'Controllo Attrezzature',
  
  // Operazioni acquaponiche
  'AquaponicFishFeed': 'Alimentazione Pesci',
  'AquaponicWaterTest': 'Test Acqua',
  'AquaponicFilterClean': 'Pulizia Filtri',
  
  // Operazioni aeroponiche
  'AeroponicNozzleClean': 'Pulizia Ugelli',
  'AeroponicPressureCheck': 'Controllo Pressione',
  
  // Operazioni di manutenzione
  'Weeding': 'Diserbo',
  'Staking': 'Tutoraggio',
  'Watering': 'Annaffiatura',
  'Monitoring': 'Monitoraggio',
  'Inspection': 'Ispezione',
  'Cleaning': 'Pulizia',
  'Maintenance': 'Manutenzione'
};

/**
 * Traduce un task type dall'inglese all'italiano
 * @param taskType - Il tipo di task in inglese
 * @returns Il tipo di task tradotto in italiano, o il valore originale se non trovato
 */
export function translateTaskType(taskType: string): string {
  return TASK_TYPE_TRANSLATIONS[taskType] || taskType;
}

/**
 * Ottiene tutti i task types disponibili in italiano
 * @returns Array di task types tradotti
 */
export function getTranslatedTaskTypes(): string[] {
  return Object.values(TASK_TYPE_TRANSLATIONS);
}

/**
 * Ottiene una mappa completa inglese -> italiano
 * @returns Record con tutte le traduzioni
 */
export function getTaskTypeTranslations(): Record<string, string> {
  return TASK_TYPE_TRANSLATIONS;
}

/**
 * Trova il task type inglese dalla traduzione italiana
 * @param italianTaskType - Il tipo di task in italiano
 * @returns Il tipo di task in inglese, o il valore originale se non trovato
 */
export function getEnglishTaskType(italianTaskType: string): string {
  const entry = Object.entries(TASK_TYPE_TRANSLATIONS).find(
    ([, italian]) => italian === italianTaskType
  );
  return entry ? entry[0] : italianTaskType;
}

/**
 * Task types più comuni per l'interfaccia utente
 */
export const COMMON_TASK_TYPES = [
  'Sowing',
  'Transplant', 
  'Fertilize',
  'Prune',
  'Harvest',
  'Treatment',
  'Irrigation',
  'Weeding',
  'Mulching',
  'Staking',
  'Thinning'
];

/**
 * Ottiene i task types comuni tradotti in italiano
 */
export function getCommonTaskTypesItalian(): Array<{english: string, italian: string}> {
  return COMMON_TASK_TYPES.map(taskType => ({
    english: taskType,
    italian: translateTaskType(taskType)
  }));
}