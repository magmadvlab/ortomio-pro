
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  PLANNER = 'PLANNER',
  JOURNAL = 'JOURNAL',
  ADVICE = 'ADVICE',
  HARVEST = 'HARVEST',
  SMART = 'SMART',
  CALENDAR = 'CALENDAR'
}

export interface VacationTask {
  id: string;
  priority: 'Critical' | 'High' | 'Medium';
  category: 'Harvest' | 'Watering' | 'Protection' | 'Soil';
  title: string;
  description: string;
  dueDate: string; // Prima della partenza (ISO string)
  estimatedTime: string; // "30 minuti"
  completed?: boolean;
}

export interface VacationPlan {
  gardenId: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  tasks: VacationTask[];
  createdAt: string; // ISO string
}

// Director Types - Orchestratore Centrale
export interface UrgentAlert {
  type: 'Frost' | 'Heat' | 'Drought' | 'Storm' | 'Planning' | 'Succession' | 'SolarCompatibility' | 'SoilCompatibility' | 'SoilTemperature' | 'Safety';
  message: string;
  action: string;
  blockOperations?: boolean; // Blocca trapianti/operazioni delicate
  proactiveContext?: {
    historicalPattern?: string;
    currentConditions?: string;
    predictedRisk?: string;
    confidence: number;
  };
  timing?: 'now' | 'tomorrow' | 'this_week';
}

export interface ClimateWarning {
  type: 'Temperature' | 'Rain' | 'Wind' | 'Humidity';
  severity: 'Low' | 'Medium' | 'High';
  message: string;
  recommendation: string;
}

export interface LifecycleTask {
  taskId: string;
  plantName: string;
  phase: string;
  message: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  action?: string;
}

export interface NutrientTask {
  plantName: string;
  element: 'N' | 'P' | 'K' | 'Micro' | 'None';
  adviceTitle: string;
  adviceBody: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface HealthTask {
  plantName: string;
  productToUse: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  actionType: 'Prevent' | 'Monitor';
  filteredReason?: string; // Spiega perché alcuni prodotti non sono disponibili (es. manca patentino)
}

export interface LunarAdvice {
  phase: string;
  phaseName: string;
  advice: string;
  idealFor: string[];
}

// Solar Classification Types
import { SeasonalSunWindow, GardenClassification } from './services/seasonalSunWindows';
import { PlantingWindow } from './services/plantingWindowOptimizer';
import { PlantSuggestionForWindow } from './services/seasonalPlantSuggestions';

// Advanced Growing Systems Types
import { 
  IndoorGrowingConfig, 
  HydroponicSystemConfig, 
  AquaponicSystemConfig, 
  AeroponicSystemConfig,
  HydroponicTaskData,
  AquaponicTaskData,
  AeroponicTaskData
} from './types/indoorGrowing';
import { GreenhouseConfig } from './types/greenhouse';
import { ArchetypeId } from './types/archetypes';

// Re-export ArchetypeId for convenience
export type { ArchetypeId };

export interface SolarClassificationData {
  windows: SeasonalSunWindow[];
  classification: GardenClassification;
  plantingWindows: PlantingWindow[];
  compatibilityAlerts: UrgentAlert[]; // Piante incompatibili con tipo orto
  optimizedSuggestions: PlantSuggestionForWindow[];
}

export interface DailyPlan {
  date: string;
  urgentAlerts: UrgentAlert[];
  lifecycleTasks: LifecycleTask[];
  nutrientTasks: NutrientTask[];
  healthTasks: HealthTask[];
  climateWarnings: ClimateWarning[];
  lunarAdvice?: LunarAdvice;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  // Nuovi task per lavorazioni meccaniche e potatura alberi
  mechanicalWorkTasks?: MechanicalWorkTask[];
  treePruningTasks?: TreePruningTask[];
  pendingSuggestions?: GardenTask[]; // Task suggeriti non ancora completati
  solarClassification?: SolarClassificationData; // Classificazione solare stagionale
  irrigationTasks?: import('./types/irrigation').IrrigationTask[]; // Task irrigazione per zone
}

// Work types for mechanical operations
export type MechanicalWorkType = 
  // Suolo (esistenti)
  | 'Plowing' | 'Subsoiling' | 'Harrowing' | 'Tilling' | 'Rolling' | 'Hoeing' | 'EarthingUp' | 'Mulching' | 'PostSowingRolling'
  // Preparazione Terreno (nuove)
  | 'Clearing' | 'Stumping' | 'StoneRemoval' | 'Leveling' | 'DeepSubsoiling'
  | 'Digging' | 'DeepHarrowing' | 'Crumbling' | 'Scraping' | 'SurfaceLeveling'
  // Tecniche Moderne
  | 'MinimumTillage' | 'StripTillage' | 'NoTill'
  // Chioma
  | 'FormativePruning' | 'MaintenancePruning' | 'RejuvenationPruning' | 'SummerPruning' | 'WinterPruning'
  | 'Thinning' | 'Suckering' | 'Defoliation' | 'Tying' | 'OliveShredding' | 'RunnerManagement'
  | 'StrawberryMulching' | 'StrawberryCleaning' | 'CaneRemoval' | 'TipPruning' | 'RaspberryTying'
  | 'SuckerThinning' | 'FruitBagging' | 'ExoticThinning' | 'Shredding'
  // Generale
  | 'Topping' | 'Pruning'

// Equipment types for mechanical operations
export type MechanicalEquipmentType = 
  // Trattore e attrezzi trattore
  | 'Tractor' | 'RotaryHarrow' | 'Shredder' | 'FertilizerSpreader' | 'Seeder'
  | 'Topper' | 'Defoliator' | 'PrePruner' | 'Thinner'
  // Piccoli mezzi
  | 'Rototiller' | 'Cultivator' | 'Mower' | 'BrushCutter' | 'TrackedCart' | 'BackpackSprayer'
  // Attrezzi elettrificati
  | 'ElectricTier' | 'ElectricPruner' | 'TelescopicPruner'
  // Manuale
  | 'Manual'

export interface MechanicalWorkTask {
  taskId?: string; // Se già creato come GardenTask
  workType: MechanicalWorkType;
  suggestedDate: string;
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  instructions: string[];
  equipmentType: MechanicalEquipmentType;
  equipmentAttachment?: string; // Attrezzo specifico quando equipmentType = 'Tractor'
  area?: number;
  weatherWarning?: string;
}

export interface TreePruningTask {
  taskId?: string; // Se già creato come GardenTask
  treeType: 'Pome' | 'Stone' | 'Citrus' | 'Nut' | 'Berry';
  suggestedDate: string;
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  instructions: string[];
  pruningType: 'Formative' | 'Maintenance' | 'Rejuvenation';
  season: 'Winter' | 'Summer';
  lunarAdvice?: string;
}

/**
 * Input visivo per esposizione solare (wizard semplificato)
 */
export interface VisualSunInputData {
  position: 'campo' | 'muro' | 'balcone';
  morningSun: number; // 1-5 scala
  noonSun: number; // 1-5 scala
  afternoonSun: number; // 1-5 scala
  obstacles: string[]; // ['edificio_sud', 'albero', 'nessuno']
}

/**
 * Tipo spazio coltivabile
 */
export type GardenType = 
  | 'OpenField'           // Campo aperto tradizionale
  | 'Greenhouse'          // Serra tradizionale
  | 'Tunnel'              // Tunnel/polytunnel
  | 'RaisedBed'           // Aiuola/cassone rialzato
  | 'Pot'                 // Vasi/Contenitori
  | 'Container'           // Contenitori generici
  | 'Indoor'              // Indoor generico
  | 'Hydroponic'          // Idroponica generica
  | 'Aquaponic'           // Acquaponica
  | 'Aeroponic'           // Aeroponica
  | 'NFT'                 // Nutrient Film Technique
  | 'DWC'                 // Deep Water Culture
  | 'EbbFlow'             // Ebb and Flow / Flood and Drain
  | 'Drip'                // Drip System
  | 'Wick'                // Wick System
  | 'Kratky'              // Kratky Method (passive)
  | 'Orchard'             // Frutteto
  | 'OliveGrove'          // Oliveto
  | 'Vineyard';           // Vigneto

/**
 * Configurazione dettagliata delle strutture del giardino
 * Permette di salvare i dettagli completi di tutte le strutture configurate
 * per permettere modifiche successive e tracciabilità completa
 */
export interface StructureConfig {
  openField?: {
    size: number;
    unit: 'sqm' | 'are' | 'hectare';
  };
  pots?: Array<{
    count: number;
    diameter: number; // cm
  }>;
  beds?: Array<{
    count: number;
    length: number; // cm
    width: number; // cm
    height: number; // cm
    holes?: number; // numero buchi/piante per letto
  }>;
  containers?: Array<{
    count: number;
    length: number; // cm
    width: number; // cm
    height: number; // cm
    holes?: number; // numero piante per cassone
  }>;
  tanks?: Array<{
    count: number;
    length: number; // cm
    width: number; // cm
    height: number; // cm
    holes?: number; // numero piante per vasca
  }>;
}

export interface Garden {
  id: string;
  name: string;
  coordinates?: GeoLocation;
  sizeSqMeters: number; // Sempre in m² per calcoli interni
  sizeUnit?: 'sqm' | 'are' | 'hectare'; // Unità di misura per display (default: 'sqm')
  soilType?: 'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty';
  soilPh?: number;
  createdAt: string;
  vacationMode?: VacationPlan; // Piano di vacanza attivo
  
  // GEO-CLIMA
  altitudeMeters?: number;
  delayFactorDays?: number; // Giorni ritardo semina vs costa (fallback se no altitudine)
  visualSunInput?: VisualSunInputData; // Salva input originale del wizard visivo
  
  // MICRO-CLIMA
  sunExposure?: 'FullSun' | 'PartSun' | 'Shade';
  dailySunHours?: number;
  aspectDirection?: 'North' | 'South' | 'East' | 'West' | 'Flat';
  windProtection?: 'High' | 'Medium' | 'Low';
  obstacles?: Array<{
    azimuth: number;        // 0-360°
    height: number;         // metri
    distance: number;       // metri
    widthDegrees: number;  // gradi
    type?: 'Building' | 'Tree' | 'Mountain' | 'Other';
  }>;
  photoNorthOffset?: number; // Offset in gradi (0-360) tra Nord reale e Nord nella foto 360°
  
  // INFRASTRUTTURA
  hasCompostBin?: boolean;
  isRaisedBed?: boolean;
  
  // NUOVO: Tipo spazio coltivabile e configurazioni avanzate
  gardenType?: GardenType;
  greenhouseConfig?: GreenhouseConfig;
  indoorConfig?: IndoorGrowingConfig;
  hydroponicConfig?: HydroponicSystemConfig;
  aquaponicConfig?: AquaponicSystemConfig;
  aeroponicConfig?: AeroponicSystemConfig;
  
  // Configurazione dettagliata strutture (vasi, cassoni, vasche, letti, campo aperto)
  structureConfig?: StructureConfig;
  
  // SOLAR ENGINE - Punti mappati dell'orto
  points?: GardenPoint[]; // Punti mappati dell'orto con score
  
  // NUOVO: Configurazioni colture legnose specializzate (Pro Feature)
  orchardConfig?: {
    category: 'DRUPACEE' | 'POMACEE' | 'AGRUMI' | 'FRUTTA_GUSCIO' | 
              'MEDITERRANEA' | 'KIWI' | 'ESOTICHE';
    profileId: string; // ID CropProfile da fruitTreeProfiles
    establishedDate?: string; // Data impianto (ISO string)
    totalTrees?: number; // Numero totale alberi
    varieties?: string[]; // Varietà presenti nel frutteto
  };
  
  oliveGroveConfig?: {
    type: 'OIL' | 'TABLE' | 'DUAL_PURPOSE';
    establishedDate?: string;
    totalTrees?: number;
    varieties?: string[];
  };
  
  vineyardConfig?: {
    type: 'WINE' | 'TABLE';
    establishedDate?: string;
    totalVines?: number;
    varieties?: string[];
    trainingSystem?: 'Guyot' | 'Cordon' | 'Pergola' | 'Alberello';
  };
}

export type SoilType = 'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty';

/**
 * Punto dell'orto con caratteristiche solari specifiche
 */
export interface GardenPoint {
  id: string;
  name: string;
  // Posizione nella griglia (0-100%) - supporta sia 'position' che 'coordinates' per retrocompatibilità
  position: { x: number; y: number };
  coordinates?: { x: number; y: number }; // Alias per retrocompatibilità, usa 'position' per nuovo codice
  size?: number; // m² del punto
  sunExposure?: 'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade';
  dailySunHours?: number;
  visualSunInput?: VisualSunInputData;
  obstacles?: Array<{
    azimuth: number;
    height: number;
    distance: number;
    widthDegrees: number;
    type?: 'Building' | 'Tree' | 'Mountain' | 'Other';
  }>;
  score?: {
    pointId: string;
    pointName: string;
    scores: {
      ortoEstivo: number;
      fogliaPrimavera: number;
      fogliaEstate: number;
      aromatiche: number;
    };
    recommendations: Array<{
      category: string;
      score: number;
      message: string;
      cycles: number;
      resaStimata: number;
    }>;
  };
  notes?: string;
}

// Deprecated in favor of Garden, keeping for transition types if needed
export interface GardenProfile extends Omit<Garden, 'id' | 'name' | 'createdAt'> {}

export interface UserProfile {
  id: string;
  tier?: 'FREE' | 'PRO_CONSUMER' | 'PRO_PROFESSIONAL';
  ai_credits_total?: number;
  ai_credits_used?: number;
  ai_credits_reset_date?: string;
  pesticideLicense?: {
    number: string;
    expiryDate: string;
    isValid: boolean;
  };
  preferredTreatmentType?: 'organic' | 'classic' | 'mixed';
  expertise?: 'beginner' | 'intermediate' | 'expert';
  preferences?: {
    detailLevel?: 'minimal' | 'standard' | 'detailed';
    preferredCommunicationStyle?: 'conversational' | 'technical' | 'brief';
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Compatibilità pianta con tipo terreno
 */
export interface SoilCompatibility {
  compatible: boolean;
  reason?: string;
  optimalSoilTypes?: Garden['soilType'][];
  avoidSoilTypes?: Garden['soilType'][];
}

export interface SmartDevice {
    id: string;
    gardenId: string;
    name: string;
    type: 'Sensor' | 'Valve' | 'Hub';
    moisture: number; // 0-100%
    isValveOpen: boolean;
    flowRateLpm: number; // Liters per minute (Simulated hardware spec)
    sessionLiters: number; // Liters dispensed in current session
    targetLiters: number; // Auto-shutoff target. 0 = manual only.
    autoThreshold: number; // Auto-start moisture threshold. 0 = disabled.
    autoMode: boolean; // Is automation enabled?
    lastUpdate: string;
}

export interface PlantSuggestion {
  name: string;
  scientificName?: string;
  description: string;
  plantingWindow: string; // Generic window
  harvestTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  waterNeeds: 'Low' | 'Medium' | 'High';
}

export interface SpecificPlantInfo {
  name: string;
  variety: string;
  seedSowingWindow: string; // When to sow seeds
  transplantWindow: string; // When to transplant seedlings
  harvestWindow: string;
  notes: string;
  successionIntervalDays?: number; // Days between batches for continuous harvest
  masterSheetId?: string; // Reference to PlantMasterSheet if used (for retrocompatibility)
  // Soil & Harvest
  soil: {
      phMin: number;
      phMax: number;
      typeDescription: string; // e.g. "Sandy loam, well drained"
  };
  harvest: {
      minBrix?: number; // Minimum sugar content for harvest
      visualSigns: string; // e.g. "Deep red color, firm but yielding"
  };
  // Indoor specific info
  indoor?: {
    lightHours: number; // e.g. 14-16 hours
    germinationTemp: string; // e.g. "20-25°C"
    daysToGerminate: string; // e.g. "5-10 days"
    transplantSize: string; // e.g. "15cm or 4 true leaves"
  };
  irrigation: {
    frequency: string; // e.g. "Every 2 days"
    method: string; // e.g. "Drip irrigation at base"
    tips: string;
  };
  fertilizer: {
    organicType: string; // e.g. "Manure pellets"
    organicDosageGm2: number; // Grams per square meter
    classicType: string; // e.g. "NPK 15-15-15"
    classicDosageGm2: number; // Grams per square meter
    timing: string; // When to apply
    scheduleDays?: number[]; // Days after planting to fertilize again (e.g. [30, 60])
  };
  // Complete beginner-friendly guide
  guide: {
    introduction: string; // Friendly introduction (2-3 sentences)
    sowingSteps: string[]; // Step-by-step sowing guide (5-7 steps)
    transplantSteps: string[]; // Step-by-step transplant guide (4-6 steps)
    careTips: string[]; // Daily/weekly care tips (5-7 tips)
    commonMistakes?: string[]; // Common mistakes to avoid (3-5 mistakes)
    harvestGuide: string; // Detailed harvest explanation (3-4 sentences)
  };
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  servings?: number;
  prepTime?: string;
}

export interface HarvestLogData {
    id?: string; // Unique ID for specific log entry
    plantName?: string; // Nome pianta (da database o calcolato)
    gardenId?: string; // ID giardino
    taskId?: string; // ID task associato
    quantity: number;
    unit: 'kg' | 'g' | 'units';
    rating: 1 | 2 | 3 | 4 | 5; // Quality stars
    date: string;
    photo?: string;
    brix?: number;
    notes?: string;
    suggestedRecipes?: Recipe[]; // Ricette suggerite per questo raccolto
    // Campi calcolati per analytics (non salvati nel DB)
    marketValue?: number; // Valore di mercato per kg
    costPerKg?: number; // Costo per kg
    areaSqm?: number; // Area coltivata in m²
    
    // Specialized Crop Harvest Data (Pro Features)
    strawberryHarvest?: {
      harvestType?: 'FirstFlush' | 'MainHarvest' | 'LateHarvest';
      berrySize?: 'Small' | 'Medium' | 'Large';
      qualityNotes?: string;
    };
    fruitTreeHarvest?: {
      treeAge?: number;
      fruitSize?: 'Small' | 'Medium' | 'Large';
      qualityGrade?: 'Extra' | 'First' | 'Second';
      storagePotential?: number; // Giorni conservazione
    };
    aromaticHarvest?: {
      harvestPart?: 'Leaves' | 'Flowers' | 'Stems' | 'Roots' | 'Seeds';
      requiresDrying?: boolean;
      dryingMethod?: 'Air' | 'Dehydrator' | 'Oven';
      essentialOilExtracted?: number; // ml
    };
    oliveHarvest?: {
      oliveQuantity: number; // kg
      millingDate?: string;
      oilProduced?: number; // litri
      oilQuality?: {
        acidity: number; // % acido oleico
        peroxide: number; // meq O2/kg
        polyphenols: number; // mg/kg
      };
      millingNotes?: string;
      harvestMethod?: 'Manual' | 'Mechanical' | 'Shaking';
    };
    vineHarvest?: {
      grapeQuantity: number; // kg
      brixAtHarvest: number;
      winemakingDate?: string;
      wineProduced?: number; // litri
      wineType?: 'Red' | 'White' | 'Rosé' | 'Sparkling';
      wineAnalysis?: {
        alcohol: number; // % vol
        acidity: number; // g/L
        pH: number;
        residualSugar?: number; // g/L
        totalSulfur?: number; // mg/L
      };
      harvestMethod?: 'Manual' | 'Mechanical';
    };
}

export type GrowingLocation = 
  | 'Pot' 
  | 'Ground' 
  | 'RaisedBed'
  | 'Tray' // Vassoio per semina
  | 'Greenhouse'
  | 'HydroponicNFT'
  | 'HydroponicDWC'
  | 'HydroponicEbbFlow'
  | 'HydroponicDrip'
  | 'HydroponicWick'
  | 'HydroponicKratky'
  | 'Aquaponic'
  | 'Aeroponic'
  | 'Indoor';

// Moon Phase Types
export type MoonPhase = 
  | 'New'           // Luna Nuova
  | 'WaxingCrescent' // Crescente
  | 'FirstQuarter'   // Primo Quarto
  | 'WaxingGibbous'  // Gibbosa Crescente
  | 'Full'           // Luna Piena
  | 'WaningGibbous'  // Gibbosa Calante
  | 'LastQuarter'    // Ultimo Quarto
  | 'WaningCrescent'; // Calante

export interface GardenTask {
  id: string;
  gardenId: string; // Link to specific garden
  bedId?: string; // ID della zona/letto di coltivazione (opzionale)
  zoneId?: string; // ID della zona precision agriculture (opzionale)
  quantity?: number; // Quantità di piante (opzionale, default: 1)
  plantName: string;
  variety?: string; // e.g., "Datterino"
  plantingMethod?: 'Seed' | 'Seedling' | 'Sapling'; // Started from seed, seedling, or sapling
  
  // Tracking origine pianta
    seedPacketId?: string; // ID del pacchetto di semi usato (se plantingMethod === 'Seed')
    seedlingBatchId?: string; // ID del batch di piantine usato (se plantingMethod === 'Seedling')
    saplingBatchId?: string; // ID del batch di alberelli usato (se plantingMethod === 'Sapling')
  
  // Statistics Tracking
  locationType?: GrowingLocation; // Where is it growing?
  initialQuantity?: number; // How many seeds/plants started
  currentQuantity?: number; // How many survived/are active
  
  taskType: 'Sowing' | 'Transplant' | 'Fertilize' | 'Prune' | 'Harvest' | 'Treatment' | 'Plowing' | 'Subsoiling' | 'Harrowing' | 'Tilling' | 'Rolling' | 'Hoeing' | 'EarthingUp' | 'Mulching' | 'PostSowingRolling' | 'Clearing' | 'Stumping' | 'StoneRemoval' | 'Leveling' | 'DeepSubsoiling' | 'Digging' | 'DeepHarrowing' | 'Crumbling' | 'Scraping' | 'SurfaceLeveling' | 'MinimumTillage' | 'StripTillage' | 'NoTill' | 'FormativePruning' | 'MaintenancePruning' | 'RejuvenationPruning' | 'SummerPruning' | 'WinterPruning' | 'Thinning' | 'Suckering' | 'Defoliation' | 'Tying' | 'OliveShredding' | 'RunnerManagement' | 'StrawberryMulching' | 'StrawberryCleaning' | 'CaneRemoval' | 'TipPruning' | 'RaspberryTying' | 'SuckerThinning' | 'FruitBagging' | 'ExoticThinning' | 'Shredding' | 'Topping' | 'Pruning' | 'TreePruning';
  durationMinutes?: number; // Durata task (es. irrigazione in minuti)
  stage?: 'Germination' | 'Vegetative' | 'ReadyToTransplant' | 'Flowering' | 'Fruiting' | 'Harvested';
  lifecycleState?: 'Sowing' | 'Germination' | 'Nursing' | 'IntermediateRepotting' | 'Hardening' | 'Transplanting' | 'Production' | 'Disposal'; // Fase del ciclo vitale
  season?: 'Summer' | 'Winter'; // Season classification
  date: string; // ISO date string
  expectedTransplantDate?: string; // If started from seed
  moonPhase?: MoonPhase; // Fase lunare al momento della semina/trapianto
  completed: boolean;
  // Tracking suggerimenti vs completamenti reali
  suggestedDate?: string; // Data suggerita dall'orchestrator (ISO string)
  actualCompletedDate?: string; // Data effettiva di completamento (ISO string, diversa da date se completato in data diversa)
  isSuggested?: boolean; // true se generato automaticamente dall'orchestrator
  suggestedBy?: string; // ID del task/sistema che ha suggerito questo task
  notes?: string;
  nextDueDate?: string; // For recurring tasks or follow-ups
  treatmentProductId?: string; // ID prodotto trattamento (se taskType è 'Treatment')
  images?: string[]; // Base64 encoded images
  lastPhotoDate?: string; // To track weekly updates
  // Visual Garden Planner
  gridPosition?: { x: number; y: number }; // Posizione nella griglia (in cm)
  gridRotation?: number; // Rotazione per orientamento file (0-360 gradi)
  // Fertigation Tracking
  fertigationDate?: string; // Data ultima fertirrigazione (ISO string)
  lastFertigationDate?: string; // Alias per retrocompatibilità
  // Lifecycle Coach Responses
  userResponses?: {
    germinationConfirmed?: boolean; // Utente ha confermato la germinazione
    transplantReady?: boolean; // Utente ha confermato che è pronto per trapianto
    [key: string]: boolean | undefined; // Estendibile per altre risposte
  };
  // Harvest Specifics for Planner/Journal tracking
  recordedBrix?: number;
  harvestReadyAnalysis?: string; // AI response on readiness
  // Harvest History (Partial harvests)
  harvestHistory?: HarvestLogData[];
  // Final Harvest Data (Legacy/Summary)
  finalHarvest?: HarvestLogData;
  
  // Specialized Crop Data (Pro Features)
  strawberryData?: {
    varietyType: 'June-bearing' | 'Ever-bearing' | 'Day-neutral';
    runnerAction?: 'Remove' | 'Keep' | 'Propagate';
    mulchingApplied?: boolean;
    renovationCompleted?: boolean;
  };
  fruitTreeData?: {
    treeAge: number;
    pruningType?: 'Formative' | 'Maintenance' | 'Rejuvenation';
    pruningSeason?: 'Winter' | 'Summer';
    graftingInfo?: {
      type: string;
      date: string;
      success: boolean;
    };
    fruitThinning?: {
      date: string;
      quantityRemoved: number;
    };
  };
  aromaticData?: {
    harvestType: 'Leaves' | 'Flowers' | 'Stems' | 'Roots' | 'Seeds';
    harvestTiming: 'BeforeFlowering' | 'DuringFlowering' | 'AfterFlowering';
    multiplicationMethod?: 'Seed' | 'Cutting' | 'Division' | 'Layering';
  };
  oliveData?: {
    varietyType: 'Table' | 'Oil' | 'Dual-purpose';
    harvestMethod?: 'Manual' | 'Mechanical' | 'Shaking';
    pruningType?: 'Winter' | 'Summer';
  };
  vineData?: {
    varietyType: 'Wine' | 'Table' | 'Raisin';
    trainingSystem?: 'Guyot' | 'Cordon' | 'Pergola' | 'Alberello';
    pruningType?: 'Winter' | 'Summer';
    operationType?: 'Pruning' | 'Tying' | 'ShootThinning' | 'LeafRemoval';
  };
  exoticFruitData?: {
    fruitType: 'Tropical' | 'Subtropical' | 'MediterraneanExotic';
    greenhouseRequired: boolean;
    currentTemp?: number;  // Current monitored temperature
    climateStatus?: 'Optimal' | 'Warning' | 'Critical';
    greenhouseSettings?: {
      temp: number;
      humidity: number;
      ventilation: boolean;
    };
  };
  raspberryData?: {
    varietyType: 'Summer-bearing' | 'Ever-bearing' | 'Fall-bearing';
    canesType: 'Primocane' | 'Floricane';
    trainingSystem: 'Trellis' | 'Free-standing';
    pruningCompleted?: boolean;
    canesRemoved?: number;
    supportInstalled?: boolean;
  };
  // Lavorazioni meccaniche per terreni più grandi
  mechanicalWorkData?: {
    workType: MechanicalWorkType;
    equipmentType?: MechanicalEquipmentType;
    equipmentAttachment?: string; // Attrezzo specifico quando equipmentType = 'Tractor'
    workMetadata?: {
      category?: 'Soil' | 'Canopy' | 'General';
      cropId?: string;
      cropName?: string;
      period?: { month?: number[]; phenologicalPhase?: string; daysAfterSowing?: number };
      equipment?: string[];
      standardCost?: number;
      description?: string;
    };
    depth?: number; // cm
    area?: number; // m²
  };
  // Potatura alberi (inclusi agrumi)
  treePruningData?: {
    treeType?: 'Pome' | 'Stone' | 'Citrus' | 'Nut' | 'Berry';
    pruningType?: 'Formative' | 'Maintenance' | 'Rejuvenation';
    season?: 'Winter' | 'Summer';
  };
  // NUOVO: Dati per sistemi idroponici/acquaponici/aeroponici
  hydroponicData?: HydroponicTaskData;
  aquaponicData?: AquaponicTaskData;
  aeroponicData?: AeroponicTaskData;
  
  // Sistema Archetipi 3 Livelli
  archetypeId?: ArchetypeId; // Riferimento all'archetipo della coltura
  rootZoneDepthCm?: number; // Override profondità radici in cm (se diversa dal default archetipo)
  irrigationSetup?: {
    method: 'Drip' | 'Sprinkler' | 'Manual' | 'Flood' | 'NFT' | 'DWC' | 'EbbFlow' | 'Wick' | 'Kratky';
    flowRateLpm?: number; // Portata impianto (litri/minuto)
    areaSqm?: number; // Area irrigata (m²)
    sensorData?: {
      hasMoistureSensor: boolean;
      hasECSensor: boolean;
      hasPHSensor: boolean;
    };
  };
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface TreatmentAdvice {
  problem: string;
  description: string; // Detailed analysis of the visual symptoms
  symptoms: string[]; // List of specific symptoms
  cause: string; // Underlying cause (environmental, biological, etc.)
  severity: 'Low' | 'Medium' | 'High' | 'Critical'; // Severity estimation
  immediateAction: string; // What to do right now
  longTermCare: string; // How to prevent it next time
  steps: string[];
  organic: boolean;
  products?: string[];
}

// Plant Database Types
export interface PlantVariety {
  id: string;
  name: string; // "Datterino", "Cuor di bue"
  synonyms?: string[]; // Nomi alternativi/sinonimi (es. "Sin. Datterino di Pachino")
  speciesId: string; // Riferimento alla specie
  notes?: string; // Note specifiche sulla varietà
}

export interface PlantSpecies {
  id: string;
  commonName: string; // "POMODORO", "AGLIO"
  scientificName: string; // "Solanum lycopersicum L."
  category?: string; // "Ortaggio", "Erba aromatica", "Legume", etc.
  varieties: PlantVariety[];
}

// Plant Master Sheet System Types
export interface BehavioralTag {
  id: string;
  name: string; // "Indeterminato", "Determinato", "Chinense", "Annuum"
  description: string;
  additionalInstructions: string[]; // Istruzioni extra da aggiungere alla guida
}

// Crop Type for Specialized Crops (Pro Features)
export type CropType = 
  | 'Annual'      // Colture annuali (pomodori, zucchine, etc.)
  | 'Perennial'   // Colture perenni (asparagi, etc.)
  | 'Tree'        // Alberi generici
  | 'Strawberry'  // Fragole (Pro)
  | 'FruitTree'   // Frutteti (Pro)
  | 'Aromatic'    // Erbe aromatiche
  | 'Medicinal'   // Erbe officinali
  | 'Olive'       // Olivo (Pro)
  | 'Vine'        // Vite (Pro)
  | 'ExoticFruit' // Frutta esotica (Pro)
  | 'Raspberry';  // Lamponi (Pro)

// Nutrient Category for Nutritional Engine
export type NutrientCategory = 
  | 'LEAFY'    // Foglia (Lattuga, Biete) -> Vuole AZOTO
  | 'FRUITING' // Frutto (Pomodoro, Zucchina) -> Vuole POTASSIO in fioritura
  | 'ROOT'     // Radice (Carota, Cipolla) -> Vuole FOSFORO/POTASSIO
  | 'LEGUME'   // Fissatori (Fagioli) -> Autosufficienti (No Azoto)
  | 'GENERIC'; // Default

// Treatment Type for Health Protection Engine
export type TreatmentType = 
  | 'PREVENTIVE' // Zeolite, Propoli (Rinforzante/Barriera)
  | 'CURATIVE'   // Bacillus, Rame (Quando il problema c'è)
  | 'REPELLENT'; // Olio di Neem, Aglio (Allontana)

export interface PlantProtectionProduct {
  id: string;
  name: string; // es. "Zeolite Cubana", "Olio di Neem"
  type: TreatmentType;
  allowedInOrganic: boolean; // Bio?
  target: string[]; // es. ["Afidi", "Oidio", "Cimici"]
  frequencyDays: number; // Ogni quanto darlo in prevenzione (es. 15gg)
  dosage: string; // es. "5ml per litro"
  notes: string; // es. "Non dare sotto il sole forte"
  applicationMethod?: 'Foliar' | 'Soil' | 'Both'; // Come applicarlo
  bestTime?: 'Morning' | 'Evening' | 'Any'; // Quando applicarlo
  requiresLicense?: boolean; // Richiede patentino fitosanitario
  safetyInterval?: number; // Giorni di carenza (tempo di attesa prima di raccogliere)
}

export interface PlantMasterSheet {
  id: string;
  commonName: string; // "POMODORO"
  nutrientCategory: NutrientCategory; // Categoria nutrizionale per motore logico
  scientificName: string;
  family: string; // "Solanaceae", "Cucurbitaceae", etc.
  cropType?: CropType; // Tipo di coltura (opzionale, per estensioni Pro)
  season?: 'Spring' | 'Summer' | 'Autumn' | 'Winter'; // Stagione preferita per trapianto
  
  // FASE 0: Strumenti necessari
  requiredTools: {
    seedTray: boolean; // Semenzaio alveolato
    seedTrayType?: string; // "alveolato" | "vasetti"
    seedSoil: boolean; // Terriccio da semina
    heatingMat: boolean; // Tappetino riscaldante (opzionale)
    sprayer: boolean; // Nebulizzatore
    additionalTools?: string[]; // Strumenti extra specifici
  };
  
  // FASE 1: Germinazione (Dati Parametrici)
  germination: {
    preSoak: boolean; // Amollo necessario?
    sowingDepth: number; // cm (es. 0.5)
    idealTemp: string; // "20-24°C"
    minTemp: number; // Temperatura minima per germinare (es. 12)
    optimalTemp?: number; // Temperatura ottimale per germinare (es. 22)
    maxTemp?: number; // Temperatura massima per germinare (es. 30)
    optimalTempRange?: { min: number; max: number }; // Range temperatura ottimale preciso
    heatingMatTemp?: number; // Temperatura specifica tappetino riscaldante (°C)
    humidityLevel?: 'High' | 'Medium' | 'Low'; // Livello umidità richiesto
    lightRequirement: 'Dark' | 'Light' | 'Either'; // Buio o luce per germinare
    emergenceDays: { min: number; max: number }; // Range giorni per emergenza (es. { min: 7, max: 14 })
    coveringNeeded: boolean; // Pellicola trasparente?
    coveringType?: 'PlasticLid' | 'PlasticWrap' | 'None'; // Tipo copertura
    coveringInstructions?: string; // Quando togliere la copertura
    coveringRemoveWhen?: string; // Istruzioni precise quando togliere (es. "appena emergono i cotiledoni")
    soilMoistureCheck?: string; // Come verificare umidità terreno (es. "tocca con dito - deve essere umido ma non bagnato")
    ventilationNeeded?: boolean; // Se serve ventilazione durante germinazione
    alternativeMethod?: { // Metodo alternativo di germinazione (es. scottex)
      name: string;
      description: string;
      instructions: string[];
      advantages?: string[];
    };
    moldPrevention?: string; // Istruzioni per prevenire muffa sui semi
  };
  
  // FASE 2: Gestione Piantina (Nursing)
  seedlingCare: {
    transplantWhen: string; // "alla seconda coppia di foglie vere"
    lightNeeds: string; // "Tanta luce diretta o lampade LED"
    lightHours?: number; // Ore di luce necessarie
    lightDetails?: {
      type?: 'LED' | 'Fluorescent' | 'Natural' | 'Mixed'; // Tipo luce
      distance?: number; // Distanza dalla pianta in cm
      hours: number; // Ore di luce necessarie
      intensity?: 'Low' | 'Medium' | 'High'; // Intensità luce
      spectrum?: 'Full' | 'Blue' | 'Red' | 'Mixed'; // Spettro luce
    };
    temperature: string; // Temperatura durante nursing
    temperatureRange?: { min: number; max: number }; // Range temperatura preciso
    watering: string; // "Solo quando il terriccio è quasi asciutto"
    wateringMethod?: 'Top' | 'Bottom' | 'Spray'; // Metodo irrigazione preferito
    bottomWateringDepth?: number; // cm acqua per bottom watering
    bottomWateringDuration?: number; // minuti immersione per bottom watering
    ventilation?: {
      needed: boolean; // Serve ventilazione?
      method?: string; // Metodo (es. "ventilatore leggero", "finestra aperta")
      duration?: string; // Durata (es. "2-3 ore al giorno")
    };
    firstFertilization?: {
      when: string; // Quando fertilizzare (es. "dopo 2 settimane", "alla seconda coppia di foglie")
      type: string; // Tipo fertilizzante (es. "concime liquido bilanciato")
      dilution?: string; // Diluizione (es. "1/4 della dose consigliata")
    };
    warning?: string; // "Altrimenti la pianta fila"
    wateringTiming?: string; // Quando innaffiare (es. "fine giornata per evitare effetto lente")
    soilCare?: string; // Cura del terreno (es. "smuovi con forchetta quando secco")
    commonIssues?: { // Problemi comuni durante la crescita
      trappedCotyledons?: {
        problem: string;
        solution: string;
        prevention?: string;
      };
      [key: string]: any; // Permette altri problemi comuni
    };
  };
  
  // FASE 2.5: Rinvaso Intermedio (opzionale, tra Nursing e Hardening)
  intermediateRepotting?: {
    needed: boolean; // Serve rinvaso intermedio?
    when?: string; // Quando fare il rinvaso (es. "25-30 giorni dopo la semina", "quando le radici escono dai fori") - richiesto se needed: true
    trigger?: string; // Trigger per rinvaso (es. "radici visibili dai fori di drenaggio", "pianta troppo grande per il contenitore")
    containerSize?: string; // Dimensione contenitore (es. "vaso 10cm", "vaso 12cm")
    soilMix?: string; // Mix terreno per rinvaso (es. "terriccio universale + 30% perlite")
    buryStem?: boolean; // Interrare parte del gambo nel rinvaso?
    buryStemInstructions?: string; // Istruzioni seppellimento gambo
    aftercare?: string; // Cura dopo rinvaso (es. "mantieni umido per 2-3 giorni, poi normale")
  };

  // FASE 3: Hardening (Preparazione al trapianto finale)
  hardening?: {
    duration: number; // Durata hardening in giorni (tipicamente 7-10)
    procedure: {
      days1to3: string; // Istruzioni giorni 1-3
      days4to6: string; // Istruzioni giorni 4-6
      days7to10: string; // Istruzioni giorni 7-10
      finalCheck?: string; // Controllo finale prima del trapianto
    };
    temperatureMin: number; // Temperatura minima notturna durante hardening
  };

  // FASE 4: Trapianto (Messa a dimora finale)
  transplanting: {
    when: string; // "Quando le notturne superano i 10°C stabilmente"
    minTemp: number; // Temperatura minima notturna per trapianto (es. 12)
    spacing: string; // "40cm sulla fila, 60cm tra le file"
    holeDepth: number; // cm
    holeWidth: number; // cm
    soilRequirements: string; // "Ricco di azoto e ben drenato"
    buryStem?: boolean; // Interrare parte del gambo? (pomodori sì)
    buryStemInstructions?: string; // "Interra fino alle prime foglie vere"
    protectionNeeded?: boolean; // Protezione dal sole?
    protectionInstructions?: string;
    // Opzioni dettagliate per messa a dimora
    finalPlanting?: {
      containerOptions?: {
        minSize?: string; // Dimensione minima vaso (es. "vaso 30cm")
        soilMix?: string; // Mix terreno per vaso
        drainage?: string; // Requisiti drenaggio
      };
      groundPlanting?: {
        soilPrep?: string; // Preparazione terreno (es. "vanga profonda 40cm, aggiungi compost")
        spacing?: string; // Spaziatura specifica per terra
      };
      raisedBed?: {
        bedHeight?: number; // Altezza cassone in cm
        soilMix?: string; // Mix terreno per cassone
        spacing?: string; // Spaziatura specifica per cassone
      };
      supportInstallation?: {
        when: 'AtTransplant' | 'BeforeFlowering' | 'AsNeeded'; // Quando installare supporto
        instructions?: string; // Istruzioni installazione
      };
      finalFertilization?: {
        type: 'Vegetative' | 'Flowering' | 'Balanced'; // Tipo concimazione fase-specifica
        product?: string; // Prodotto consigliato
        timing?: string; // Quando applicare
      };
    };
  };
  
  // Supporto e accessori necessari
  supportRequirements?: {
    needsSupport: boolean; // Necessita supporto?
    supportType?: 'Stake' | 'Trellis' | 'Cage' | 'Net' | 'Espalier'; // Tipo supporto principale
    climbingType?: 'Twining' | 'Tendril' | 'Scrambling' | 'None'; // Tipo arrampicamento
    supportHeight?: number; // Altezza supporto necessaria (cm)
    supportTiming?: 'AtTransplant' | 'BeforeFlowering' | 'AsNeeded'; // Quando installare
    additionalAccessories?: Array<{
      type: 'Net' | 'Wire' | 'Stake' | 'Trellis' | 'Cage';
      purpose: 'InsectProtection' | 'Shade' | 'Harvest' | 'WindProtection';
      required: boolean; // Obbligatorio o consigliato
      timing?: string; // Quando necessario
    }>;
    notes?: string; // Note specifiche sul supporto
  };
  
  // Tag comportamentali disponibili per questa specie
  availableTags: string[]; // Array di ID dei BehavioralTag
  
  // Istruzioni base comuni a tutte le varietà
  baseInstructions: {
    introduction: string; // 2-3 frasi
    commonMistakes: string[]; // 4 errori comuni
    harvestGuide: string; // 3-4 frasi
    growthNotes?: string[]; // Note sulla crescita (es. forma a Y, potatura)
    seedExtraction?: { // Istruzioni per estrazione e conservazione semi
      instructions: string[];
      drying?: {
        method: string;
        steps: string[];
      };
    };
  };
  
  // Note comparative e specifiche per famiglia botanica
  familySpecificNotes?: {
    growthSpeed?: 'Slow' | 'Medium' | 'Fast' | 'Explosive'; // Velocità crescita
    sowingTimingAdvice?: string; // Es. "Semina 30-40 giorni dopo i peperoncini"
    containerSizeAdvice?: string; // Es. "Usa vasetti grandi subito, non vaschette piccole"
    transplantSensitivity?: 'Low' | 'Medium' | 'High'; // Sensibilità ai trapianti
    specialCareInstructions?: string[]; // Istruzioni specifiche per questa specie
    comparisonWithSimilar?: string; // Confronto con specie simili
  };
  
  // Note sulla pulizia e disinfezione attrezzature
  equipmentCleaning?: {
    seedTrayCleaning?: string; // Istruzioni specifiche per pulizia vaschette
    heatingMatCleaning?: string; // Istruzioni per pulizia tappetino riscaldante
    soilReuse?: 'Never' | 'CompostOnly' | 'Allowed'; // Riutilizzo terriccio
    sterilizationRequired?: boolean; // Se richiede sterilizzazione
  };
  
  // Finestra di raccolta (opzionale)
  // Può essere una stringa (es. "60-90 giorni") o un oggetto con mesi (per colture specializzate)
  harvestWindow?: string | { startMonth: number; endMonth: number; };
  
  // Dettagli irrigazione per fase (opzionale)
  irrigationDetails?: {
    litersPerPlantPerDay: {
      germination: number;
      vegetative: number;
      production: number;
    };
    criticalPeriods?: Array<{
      days: [number, number]; // Range giorni attivi
      multiplier: number; // Moltiplicatore per periodo critico
    }>;
    frequency: {
      germination: string; // "Ogni 2-3 giorni"
      vegetative: string; // "Ogni 1-2 giorni"
      production: string; // "Ogni giorno"
    };
    method?: 'Drip' | 'Sprinkler' | 'Manual' | 'Flood';
  };
  
  // Suscettibilità e strategia di difesa (opzionale)
  susceptibility?: {
    fungalDiseases: string[]; // es. ["Oidio", "Peronospora"]
    pests: string[]; // es. ["Afidi", "Ragnetto Rosso"]
    preventiveStrategy: 'HIGH' | 'MEDIUM' | 'LOW'; // Quanto va protetta?
    criticalPeriods?: { // Periodi critici per trattamenti
      season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
      daysActive: { min: number; max: number };
      risk: 'High' | 'Medium' | 'Low';
    }[];
  };
  
  // NEW: Visual category for UI (Level 1 - User-facing)
  visualCategory?: 'Orto' | 'Frutteto' | 'Vigneto' | 'Uliveto' | 
                   'Agrumeto' | 'PiccoliFrutti' | 'Aromatiche' | 
                   'Ornamentali' | 'Cereali' | 'Leguminose' | 
                   'Industriali' | 'Foraggere' | 'Forestali' | 
                   'Esotici';
  
  // NEW: AI Metadata (Level 2 - For intelligent suggestions)
  aiMetadata?: {
    harvestedOrgan?: 'Leaf' | 'Fruit' | 'Root' | 'Bulb' | 'Flower' | 'Seed' | 'Stem';
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    compatibleSystems?: Array<'Soil' | 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'Indoor'>;
    lifecycle?: 'Annual' | 'Biennial' | 'Perennial';
    climateNeeds?: {
      sunExposure?: 'Full' | 'Partial' | 'Shade';
      minTemp?: number;
      maxTemp?: number;
      idealTempRange?: string;
      frostTolerant?: boolean;
      heatTolerant?: boolean;
    };
    timeline?: {
      indoorSowingMonths?: number[];
      transplantMonths?: number[];
      harvestMonths?: number[];
      cycleDurationDays?: number;
    };
    rotation?: {
      idealAfter?: string[];
      avoidAfter?: string[];
      yearsBreak?: number;
    };
    companionships?: {
      beneficial?: string[];
      harmful?: string[];
      neutral?: string[];
    };
  };
}

export interface VarietyMapping {
  varietyName: string;
  speciesId: string; // Riferimento a PlantMasterSheet.id
  tags: string[]; // ID dei BehavioralTag applicabili
  notes?: string; // Note specifiche per questa varietà
}

// Seed Inventory Types
export interface SeedPacket {
  id: string;
  varietyId: string; // Riferimento a PlantVariety.id o varietyName
  varietyName: string; // Nome varietà (es. "Datterino")
  speciesName: string; // Nome specie (es. "POMODORO")
  purchaseDate: string; // Data acquisto (ISO string)
  expiryYear: number; // Anno di scadenza (es. 2026)
  isOpen: boolean; // Busta aperta?
  quantityRemaining: 'High' | 'Medium' | 'Low' | 'Empty'; // Mantenuto per retrocompatibilità
  initialQuantity?: number; // Quantità iniziale di semi nel pacchetto (es. 100)
  currentQuantity?: number; // Quantità corrente rimanente (es. 90 dopo aver usato 10)
  notes?: string;
  gardenId: string; // A quale orto appartiene
}

// Visual Garden Planner Types
export interface GardenLayout {
  gardenId: string;
  gridSize: { width: number; height: number }; // Dimensioni griglia in celle
  cellSize: number; // Dimensione cella in cm
  tasks: { 
    taskId: string; 
    position: { x: number; y: number }; 
    rotation: number 
  }[];
}

// Re-export specialized crop types for convenience
export type {
  StrawberryCrop,
  StrawberryTask,
  StrawberryHarvest
} from './types/strawberry';

export type {
  FruitTreeCrop,
  FruitTreeTask,
  PruningRecord,
  GraftingRecord,
  FruitTreeHarvest
} from './types/fruitTree';

export type {
  AromaticMedicinalCrop,
  AromaticTask,
  DryingRecord,
  AromaticHarvest
} from './types/aromatic';

export type {
  OliveCrop,
  OliveTask,
  OilQuality,
  OliveMilling,
  OliveHarvest
} from './types/olive';

export type {
  VineCrop,
  VineTask,
  WineAnalysis,
  WinemakingRecord,
  VineHarvest
} from './types/vine';

export type {
  RaspberryCrop,
  RaspberryTask,
  RaspberryHarvest
} from './types/raspberry';

export type {
  ExoticFruitCrop,
  ExoticFruitTaskData
} from './types/exoticFruit';

// Advanced Growing Systems Types
export type {
  IndoorGrowingConfig,
  HydroponicSystemConfig,
  AquaponicSystemConfig,
  AeroponicSystemConfig,
  HydroponicTaskData,
  AquaponicTaskData,
  AeroponicTaskData,
  HydroponicReading,
  AquaponicReading,
  HydroponicSystemType,
  AquaponicSystemType,
  AeroponicSystemType
} from './types/indoorGrowing';

export type {
  GreenhouseConfig,
  GreenhouseStructureType,
  GreenhouseCoveringType,
  ArchMaterial
} from './types/greenhouse';

export type {
  GardenAccessory,
  AccessoryCategory,
  SupportType,
  NettingType,
  WireType,
  AccessoryMaterial
} from './types/accessories';

export type {
  BedType,
  BedShape,
  StructureType,
  GardenBed
} from './types/gardenBed';

// ============================================
// ROTAZIONE CULTURALE (Memory of Soil)
// ============================================

export interface BedHistory {
  bedId: string;
  plantingHistory: {
    year: number;
    season: 'Summer' | 'Winter';
    plantFamily: string; // 'Solanaceae', 'Cucurbitaceae', etc.
    plantId: string; // Riferimento a plantMasterSheets.id
    plantName: string; // Cache per query veloci
    plantedAt?: string; // ISO date
    harvestedAt?: string; // ISO date
  }[];
}

export interface RotationAdvice {
  allowed: boolean;
  severity: 'ERROR' | 'WARNING' | 'SUCCESS' | 'INFO';
  message: string;
  suggestion?: string; // Pianta alternativa suggerita
  lastPlanting?: {
    plantName: string;
    plantFamily: string;
    year: number;
    season: 'Summer' | 'Winter';
  };
}

// ============================================
// CONSOCIAZIONI (Companion Planting)
// ============================================

export interface CompanionRule {
  // Formato 1: Per database strutturato
  plantId?: string; // Riferimento a plantMasterSheets.id
  goodCompanions?: string[]; // Array di plantMasterSheets.id
  badCompanions?: string[]; // Array di plantMasterSheets.id
  
  // Formato 2: Per database relazionale (data/companionPlanting.ts)
  plant1?: string;
  plant2?: string;
  relationship?: 'Beneficial' | 'Harmful' | 'Neutral';
  spacingModifier?: number; // Modificatore distanza in cm
  
  // Campi comuni
  benefit?: string; // Descrizione beneficio
  reason?: string; // Motivo incompatibilità
  distanceMin?: number; // Distanza minima in cm (default 200cm)
}

export interface CompanionAdvice {
  severity: 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';
  message: string;
  conflicts?: Array<{
    plantName: string;
    reason: string;
  }>;
  suggestions?: Array<{
    plantName: string;
    benefit: string;
  }>;
}

// ============================================
// TIME-LAPSE E ANALISI FOTO
// ============================================

export interface PlantPhotoLog {
  id: string;
  taskId: string;
  gardenId: string;
  photoUrl: string; // URL Supabase Storage o base64
  photoDate: string; // ISO date
  daysFromPlanting: number;
  analysisResult?: {
    isHealthy: boolean;
    growthRate: 'normal' | 'slow' | 'fast';
    issues?: string[]; // Array di problemi rilevati
    phase?: string; // Fase rilevata (es. "Vegetative", "Flowering")
    leafCount?: number; // Numero foglie vere rilevate
  };
  notes?: string;
  createdAt: string; // ISO date
  // Estensioni per agricoltura di precisione
  previousPhotoId?: string; // ID foto precedente per confronto
  growthComparison?: {
    leafCountDelta?: number;
    growthRateChange: 'improved' | 'stable' | 'declined';
    daysBetween: number;
    healthChange: 'improved' | 'stable' | 'worsened';
    recommendations: string[];
  };
  fertilizationSuggestion?: {
    needed: boolean;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    recommendedNutrients: {
      nitrogen?: boolean;
      phosphorus?: boolean;
      potassium?: boolean;
      micro?: boolean;
    };
    dosage: {
      amount: number;
      frequency: string;
      method: 'foliar' | 'soil' | 'fertigation';
    };
    timing: {
      bestTime: string;
      urgency: 'immediate' | 'soon' | 'planned';
    };
    notes: string[];
  };
}

// ============================================
// ANALISI RESA ECONOMICA
// ============================================

export interface HarvestAnalytics {
  totalKgProduced: number;
  marketValueEuro: number;
  estimatedCosts: {
    water: number; // €
    fertilizer: number; // €
    seeds: number; // €
    tools?: number; // € (opzionale)
  };
  netSavings: number; // marketValueEuro - estimatedCosts total
  harvestCount: number;
  avgRating: number; // Media rating qualità (1-5)
  byMonth?: Array<{
    month: number; // 1-12
    kg: number;
    harvests: number;
    value: number; // €
  }>;
  byPlant?: Array<{
    plantName: string;
    totalKg: number;
    harvests: number;
    value: number; // €
  }>;
}

export interface MarketPrice {
  plantName: string;
  pricePerKg: number; // €/kg (biologico)
  season?: 'Summer' | 'Winter'; // Prezzo varia per stagione
  region?: string; // Opzionale: prezzo per regione
}

// ============================================
// WATER REQUIREMENT ENGINE
// ============================================

export interface WaterNeeds {
  litersPerDay: number; // Litri totali per giorno per questa pianta
  litersPerPlant: number; // Litri per singola pianta
  frequency: string; // "Ogni 1-2 giorni"
  method: 'Drip' | 'Sprinkler' | 'Manual' | 'Flood';
  phase: 'germination' | 'vegetative' | 'production';
  modifiers: {
    soilType?: string; // Modificatore terreno
    temperature?: string; // Modificatore temperatura
    criticalPeriod?: boolean; // Se è in periodo critico
  };
}

export interface TotalGardenWaterNeeds {
  totalLitersPerDay: number;
  breakdown: Array<{
    plantName: string;
    liters: number;
    plants: number;
  }>;
  recommendations: string[];
}

// ============================================
// WINTER PREPARATION ENGINE
// ============================================

export interface WinterPreparationTask {
  id: string;
  category: 'Structure' | 'Fertilization' | 'Soil' | 'Planning';
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  dueMonth: number; // 1-12
  estimatedTime: string; // "1-2 ore"
  materials: string[];
  instructions: string[];
}

// ============================================
// FERTILIZER ENGINE TYPES
// ============================================

// Re-export from data/fertilizers.ts for convenience
export type { FertilizerProduct, CoverCrop } from './data/fertilizers';

// ============================================
// PHYTO ENGINE TYPES
// ============================================

// Re-export from data/phytoproducts.ts for convenience
export type { PhytoProduct } from './data/phytoproducts';

// Treatment Record (from services/treatmentRegistryService.ts) - Legacy interface
export interface TreatmentRecord {
  id: string;
  gardenId: string;
  taskId?: string;
  productId: string;
  productName: string;
  plantName: string;
  treatmentDate: Date;
  dosage: string;
  applicationMethod: string;
  targetPestDisease: string;
  weatherConditions?: {
    temp: number;
    humidity: number;
    wind: number;
  };
  safetyIntervalEndDate: Date;
  notes?: string;
  createdAt: Date;
}

// ============================================
// DATABASE RECORDS (for storageProvider)
// ============================================

// Mechanical Work Record (per database)
export interface MechanicalWorkRecord {
  id: string
  user_id: string
  garden_id?: string
  work_type: MechanicalWorkType
  work_date: string // ISO date string
  area_m2: number
  depth_cm?: number
  equipment_type?: string
  equipment_attachment?: string
  work_metadata?: {
    category?: 'Soil' | 'Canopy' | 'General'
    cropId?: string
    cropName?: string
    period?: { month?: number[]; phenologicalPhase?: string; daysAfterSowing?: number }
    equipment?: string[]
    standardCost?: number
    description?: string
  }
  weather_conditions?: {
    temp?: number
    humidity?: number
    wind?: string
    rain?: boolean
  }
  operator_name?: string
  notes?: string
  created_at: string
}

// Treatment Record (per database)
export interface TreatmentRecordDB {
  id: string
  user_id: string
  garden_id?: string
  crop_name: string
  treatment_date: string // ISO date string
  product_name: string
  active_ingredient?: string
  dosage?: number
  dosage_unit?: 'ml' | 'g' | 'kg' | 'L'
  area_treated?: number
  method?: 'spray' | 'soil' | 'seed' | 'foliar'
  reason?: 'preventive' | 'curative' | 'pest_control' | 'disease_control' | 'nutrient'
  weather_conditions?: {
    temp?: number
    humidity?: number
    wind?: string
  }
  operator_name?: string
  notes?: string
  created_at: string
}

// ============================================
// TILLAGE ENGINE TYPES
// ============================================

// Re-export from logic/tillageEngine.ts for convenience
export type { TillageWork, TillageWorkType, TillageProblem } from './logic/tillageEngine';

// Re-export from data/tillageTools.ts for convenience
export type { TillageTool } from './data/tillageTools';
