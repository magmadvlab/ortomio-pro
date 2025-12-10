
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  PLANNER = 'PLANNER',
  JOURNAL = 'JOURNAL',
  ADVICE = 'ADVICE',
  HARVEST = 'HARVEST',
  SMART = 'SMART'
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
  type: 'Frost' | 'Heat' | 'Drought' | 'Storm';
  message: string;
  action: string;
  blockOperations?: boolean; // Blocca trapianti/operazioni delicate
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
}

export interface LunarAdvice {
  phase: string;
  phaseName: string;
  advice: string;
  idealFor: string[];
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
}

export interface Garden {
  id: string;
  name: string;
  coordinates?: GeoLocation;
  sizeSqMeters: number; 
  soilType?: 'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty';
  soilPh?: number;
  createdAt: string;
  vacationMode?: VacationPlan; // Piano di vacanza attivo
  
  // GEO-CLIMA
  altitudeMeters?: number;
  delayFactorDays?: number; // Giorni ritardo semina vs costa (fallback se no altitudine)
  
  // MICRO-CLIMA
  sunExposure?: 'FullSun' | 'PartSun' | 'Shade';
  dailySunHours?: number;
  aspectDirection?: 'North' | 'South' | 'East' | 'West' | 'Flat';
  windProtection?: 'High' | 'Medium' | 'Low';
  
  // INFRASTRUTTURA
  hasCompostBin?: boolean;
  isRaisedBed?: boolean;
}

// Deprecated in favor of Garden, keeping for transition types if needed
export interface GardenProfile extends Omit<Garden, 'id' | 'name' | 'createdAt'> {}

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
    quantity: number;
    unit: 'kg' | 'g' | 'units';
    rating: 1 | 2 | 3 | 4 | 5; // Quality stars
    date: string;
    photo?: string;
    brix?: number;
    notes?: string;
    suggestedRecipes?: Recipe[]; // Ricette suggerite per questo raccolto
    
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

export type GrowingLocation = 'Pot' | 'Ground' | 'RaisedBed';

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
  plantName: string;
  variety?: string; // e.g., "Datterino"
  plantingMethod?: 'Seed' | 'Seedling'; // Started from seed or bought plant
  
  // Statistics Tracking
  locationType?: GrowingLocation; // Where is it growing?
  initialQuantity?: number; // How many seeds/plants started
  currentQuantity?: number; // How many survived/are active
  
  taskType: 'Sowing' | 'Transplant' | 'Fertilize' | 'Prune' | 'Harvest' | 'Treatment';
  durationMinutes?: number; // Durata task (es. irrigazione in minuti)
  stage?: 'Germination' | 'Vegetative' | 'ReadyToTransplant' | 'Flowering' | 'Fruiting' | 'Harvested';
  lifecycleState?: 'Sowing' | 'Germination' | 'Nursing' | 'Hardening' | 'Transplanting' | 'Production'; // Fase del ciclo vitale
  season?: 'Summer' | 'Winter'; // Season classification
  date: string; // ISO date string
  expectedTransplantDate?: string; // If started from seed
  moonPhase?: MoonPhase; // Fase lunare al momento della semina/trapianto
  completed: boolean;
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
  | 'Vine';       // Vite (Pro)

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
}

export interface PlantMasterSheet {
  id: string;
  commonName: string; // "POMODORO"
  nutrientCategory: NutrientCategory; // Categoria nutrizionale per motore logico
  scientificName: string;
  family: string; // "Solanaceae", "Cucurbitaceae", etc.
  cropType?: CropType; // Tipo di coltura (opzionale, per estensioni Pro)
  
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
    lightRequirement: 'Dark' | 'Light' | 'Either'; // Buio o luce per germinare
    emergenceDays: { min: number; max: number }; // Range giorni per emergenza (es. { min: 7, max: 14 })
    coveringNeeded: boolean; // Pellicola trasparente?
    coveringInstructions?: string; // Quando togliere la copertura
  };
  
  // FASE 2: Gestione Piantina (Nursing)
  seedlingCare: {
    transplantWhen: string; // "alla seconda coppia di foglie vere"
    lightNeeds: string; // "Tanta luce diretta o lampade LED"
    lightHours?: number; // Ore di luce necessarie
    watering: string; // "Solo quando il terriccio è quasi asciutto"
    warning?: string; // "Altrimenti la pianta fila"
    temperature: string; // Temperatura durante nursing
  };
  
  // FASE 3: Trapianto (Messa a dimora)
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
  };
  
  // Tag comportamentali disponibili per questa specie
  availableTags: string[]; // Array di ID dei BehavioralTag
  
  // Istruzioni base comuni a tutte le varietà
  baseInstructions: {
    introduction: string; // 2-3 frasi
    commonMistakes: string[]; // 4 errori comuni
    harvestGuide: string; // 3-4 frasi
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
  quantityRemaining: 'High' | 'Medium' | 'Low' | 'Empty';
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
  plantId: string; // Riferimento a plantMasterSheets.id
  goodCompanions: string[]; // Array di plantMasterSheets.id
  badCompanions: string[]; // Array di plantMasterSheets.id
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
