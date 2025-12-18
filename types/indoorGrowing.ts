/**
 * Indoor Growing and Hydroponic System Types
 * Support for all indoor growing systems: hydroponic, aquaponic, aeroponic
 */

/**
 * Tipo sistema idroponico
 */
export type HydroponicSystemType = 'NFT' | 'DWC' | 'EbbFlow' | 'Drip' | 'Wick' | 'Kratky';

/**
 * Tipo sistema acquaponico
 */
export type AquaponicSystemType = 'MediaBed' | 'NFT' | 'DWC' | 'Hybrid';

/**
 * Tipo sistema aeroponico
 */
export type AeroponicSystemType = 'HighPressure' | 'LowPressure' | 'Ultrasonic';

/**
 * Configurazione base per coltivazione indoor
 */
export interface IndoorGrowingConfig {
  // Illuminazione
  lighting: {
    type: 'LED' | 'HPS' | 'MH' | 'Fluorescent' | 'Natural' | 'Hybrid';
    wattage?: number; // Watt totali
    spectrum?: 'Full' | 'Vegetative' | 'Flowering' | 'Custom';
    hoursPerDay?: number; // Ore di luce al giorno
    lightHeight?: number; // Altezza luci in cm
  };
  
  // Clima
  climate: {
    temperature: {
      min: number; // °C
      max: number; // °C
      target: number; // °C
    };
    humidity: {
      min: number; // %
      max: number; // %
      target: number; // %
    };
    ventilation: {
      hasExtractor: boolean;
      hasIntake: boolean;
      hasCirculation: boolean;
      cfm?: number; // Cubic Feet per Minute
    };
    co2Enrichment?: {
      enabled: boolean;
      targetPpm?: number; // Parti per milione
    };
  };
  
  // Spazio
  growSpace: {
    width: number; // cm
    length: number; // cm
    height: number; // cm
    growArea?: number; // m² area coltivabile
  };
  
  // Controllo
  automation?: {
    hasTimer: boolean;
    hasSensorMonitoring: boolean;
    hasAutomatedNutrients: boolean;
    hasAutomatedPH: boolean;
    hasAutomatedEC: boolean;
  };
}

/**
 * Configurazione sistema idroponico
 */
export interface HydroponicSystemConfig {
  systemType: HydroponicSystemType;
  
  // Soluzione nutritiva
  nutrientSolution: {
    reservoirCapacity: number; // Litri
    currentVolume?: number; // Litri attuali
    phTarget: number; // pH target (es. 5.5-6.5)
    phCurrent?: number; // pH attuale
    ecTarget: number; // EC target (mS/cm)
    ecCurrent?: number; // EC attuale
    nutrientBrand?: string; // Marca nutrienti
    nutrientFormula?: string; // Formula NPK
  };
  
  // Sistema specifico NFT
  nftConfig?: {
    channelLength: number; // cm
    channelSlope: number; // % inclinazione
    flowRate: number; // L/min
    channelCount: number; // Numero canali
  };
  
  // Sistema specifico DWC
  dwcConfig?: {
    bucketSize: number; // Litri per secchio
    bucketCount: number; // Numero secchi
    airPumpPower?: number; // Watt pompa aria
    airStoneCount?: number; // Numero pietre porose
  };
  
  // Sistema specifico Ebb & Flow
  ebbFlowConfig?: {
    floodDepth: number; // cm profondità allagamento
    floodDuration: number; // minuti
    drainDuration: number; // minuti
    floodFrequency: number; // volte al giorno
  };
  
  // Sistema specifico Drip
  dripConfig?: {
    dripperFlowRate: number; // L/h per gocciolatore
    dripperCount: number; // Numero gocciolatori
    timerFrequency: number; // volte al giorno
    timerDuration: number; // minuti per ciclo
  };
  
  // Manutenzione
  maintenance: {
    lastReservoirChange?: string; // Data ultimo cambio soluzione
    changeFrequencyDays: number; // Giorni tra cambi
    lastPhCheck?: string; // Data ultimo controllo pH
    phCheckFrequencyDays: number; // Giorni tra controlli pH
  };
}

/**
 * Configurazione sistema acquaponico
 */
export interface AquaponicSystemConfig {
  systemType: AquaponicSystemType;
  
  // Vasca pesci
  fishTank: {
    capacity: number; // Litri
    currentVolume?: number; // Litri attuali
    fishSpecies?: string[]; // Specie pesci (es. ['Tilapia', 'Carpe'])
    fishCount?: number; // Numero pesci
    fishBiomass?: number; // kg biomassa pesci
  };
  
  // Filtrazione
  filtration: {
    hasMechanicalFilter: boolean; // Filtro meccanico
    hasBiologicalFilter: boolean; // Filtro biologico (biofilter)
    biofilterMedia?: string; // Materiale biofilter (es. 'Clay pebbles', 'Lava rock')
    biofilterVolume?: number; // Litri volume biofilter
  };
  
  // Parametri acqua
  waterQuality: {
    phTarget: number; // pH target (es. 6.8-7.2)
    phCurrent?: number; // pH attuale
    ammoniaTarget: number; // mg/L ammoniaca target (< 0.5)
    ammoniaCurrent?: number; // mg/L ammoniaca attuale
    nitriteTarget: number; // mg/L nitriti target (< 0.5)
    nitriteCurrent?: number; // mg/L nitriti attuali
    nitrateTarget: number; // mg/L nitrati target (20-80)
    nitrateCurrent?: number; // mg/L nitrati attuali
    temperature: {
      min: number; // °C
      max: number; // °C
      current?: number; // °C attuale
    };
    dissolvedOxygen?: number; // mg/L ossigeno disciolto
  };
  
  // Ciclo acqua
  waterCycle: {
    pumpFlowRate: number; // L/min portata pompa
    cycleFrequency: number; // volte al giorno
    cycleDuration: number; // minuti per ciclo
  };
  
  // Manutenzione
  maintenance: {
    lastWaterTest?: string; // Data ultimo test acqua
    testFrequencyDays: number; // Giorni tra test
    lastFishFeed?: string; // Data ultimo pasto pesci
    feedFrequency: number; // volte al giorno
    feedAmount?: number; // grammi per pasto
  };
}

/**
 * Configurazione sistema aeroponico
 */
export interface AeroponicSystemConfig {
  systemType: AeroponicSystemType;
  
  // Nebulizzazione
  misting: {
    nozzleCount: number; // Numero ugelli
    nozzleFlowRate: number; // L/h per ugello
    mistFrequency: number; // volte al giorno
    mistDuration: number; // secondi per ciclo
    mistInterval: number; // minuti tra cicli
    pressure?: number; // PSI pressione (per high pressure)
  };
  
  // Soluzione nutritiva
  nutrientSolution: {
    reservoirCapacity: number; // Litri
    currentVolume?: number; // Litri attuali
    phTarget: number; // pH target
    phCurrent?: number; // pH attuale
    ecTarget: number; // EC target
    ecCurrent?: number; // EC attuale
  };
  
  // Root chamber (camera radici)
  rootChamber: {
    volume: number; // Litri
    hasDrainage: boolean;
    hasVentilation: boolean;
  };
  
  // Manutenzione
  maintenance: {
    lastNozzleClean?: string; // Data ultima pulizia ugelli
    cleanFrequencyDays: number; // Giorni tra pulizie
    lastReservoirChange?: string; // Data ultimo cambio soluzione
    changeFrequencyDays: number; // Giorni tra cambi
  };
}

/**
 * Lettura parametri idroponica
 */
export interface HydroponicReading {
  id: string;
  gardenId: string;
  readingDate: string; // ISO date string
  ph?: number;
  ec?: number; // mS/cm
  waterTemperature?: number; // °C
  reservoirVolume?: number; // Litri
  notes?: string;
  createdAt: string;
}

/**
 * Lettura parametri acquaponica
 */
export interface AquaponicReading {
  id: string;
  gardenId: string;
  readingDate: string; // ISO date string
  ph?: number;
  ammonia?: number; // mg/L
  nitrite?: number; // mg/L
  nitrate?: number; // mg/L
  waterTemperature?: number; // °C
  dissolvedOxygen?: number; // mg/L
  notes?: string;
  createdAt: string;
}

/**
 * Dati idroponici per GardenTask
 */
export interface HydroponicTaskData {
  systemType: HydroponicSystemType;
  reservoirId?: string; // ID serbatoio se multipli
  channelId?: string; // ID canale per NFT
  bucketId?: string; // ID secchio per DWC
  phAtPlanting?: number;
  ecAtPlanting?: number;
}

/**
 * Dati acquaponici per GardenTask
 */
export interface AquaponicTaskData {
  systemType: AquaponicSystemType;
  bedId?: string; // ID letto per MediaBed
  phAtPlanting?: number;
  ammoniaAtPlanting?: number;
}

/**
 * Dati aeroponici per GardenTask
 */
export interface AeroponicTaskData {
  systemType: AeroponicSystemType;
  chamberId?: string; // ID camera radici
  phAtPlanting?: number;
  ecAtPlanting?: number;
}







