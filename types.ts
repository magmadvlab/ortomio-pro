
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

export interface WinterPreparationTask {
  id: string;
  category: 'Soil' | 'Fertilization' | 'Structure' | 'Planning';
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  dueMonth: number; // 1-12
  estimatedTime: string; // "2 ore", "30 minuti"
  materials?: string[]; // ["Letame: 50kg", "Compost: 30kg"]
  instructions: string[]; // Step-by-step instructions
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
  sunExposure?: 'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade'; // Esposizione al sole
  sunHours?: number; // Ore di sole dirette al giorno (calcolato o manuale)
  orientation?: 'North' | 'South' | 'East' | 'West' | 'Northeast' | 'Northwest' | 'Southeast' | 'Southwest'; // Orientamento orto
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
  stage?: 'Germination' | 'Vegetative' | 'ReadyToTransplant' | 'Flowering' | 'Fruiting' | 'Harvested';
  lifecycleState?: 'Sowing' | 'Germination' | 'Nursing' | 'Hardening' | 'Transplanting' | 'Production'; // Fase del ciclo vitale
  season?: 'Summer' | 'Winter'; // Season classification
  date: string; // ISO date string
  expectedTransplantDate?: string; // If started from seed
  moonPhase?: MoonPhase; // Fase lunare al momento della semina/trapianto
  completed: boolean;
  notes?: string;
  nextDueDate?: string; // For recurring tasks or follow-ups
  images?: string[]; // Base64 encoded images
  lastPhotoDate?: string; // To track weekly updates
  // Visual Garden Planner
  gridPosition?: { x: number; y: number }; // Posizione nella griglia (in cm)
  gridRotation?: number; // Rotazione per orientamento file (0-360 gradi)
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

// Companion Planting
export interface CompanionRule {
  plant1: string; // Nome specie (es. "POMODORO")
  plant2: string; // Nome specie (es. "BASILICO")
  relationship: 'Beneficial' | 'Neutral' | 'Harmful';
  reason: string; // Spiegazione del perché
  spacingModifier?: number; // cm aggiuntivi o ridotti (positivo = più distanza, negativo = meno distanza)
}

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

export interface IrrigationDetails {
  litersPerPlantPerDay: {
    germination: number; // Litri per pianta al giorno durante germinazione
    vegetative: number; // Litri per pianta al giorno durante crescita vegetativa
    production: number; // Litri per pianta al giorno durante produzione/fioritura
  };
  frequency: {
    germination: string; // "Ogni 2-3 giorni"
    vegetative: string; // "Ogni 1-2 giorni"
    production: string; // "Ogni giorno" o "Due volte al giorno"
  };
  method: 'Drip' | 'Sprinkler' | 'Manual' | 'Flood'; // Metodo di irrigazione consigliato
  criticalPeriods?: Array<{
    phase: string; // "Fioritura", "Fruttificazione", etc.
    days: number[]; // Range di giorni (es. [45, 60])
    multiplier: number; // Moltiplicatore fabbisogno (es. 1.5 = +50%)
  }>;
}

export interface PlantMasterSheet {
  id: string;
  commonName: string; // "POMODORO"
  nutrientCategory: NutrientCategory; // Categoria nutrizionale per motore logico
  scientificName: string;
  family: string; // "Solanaceae", "Cucurbitaceae", etc.
  
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
  
  // Dettagli irrigazione specifici (opzionale)
  irrigationDetails?: IrrigationDetails;
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
