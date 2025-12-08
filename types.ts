
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  PLANNER = 'PLANNER',
  JOURNAL = 'JOURNAL',
  ADVICE = 'ADVICE',
  HARVEST = 'HARVEST',
  SMART = 'SMART'
}

export interface Garden {
  id: string;
  name: string;
  coordinates?: GeoLocation;
  sizeSqMeters: number; 
  soilType?: 'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty';
  soilPh?: number;
  createdAt: string;
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
}

export type GrowingLocation = 'Pot' | 'Ground' | 'RaisedBed';

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
  season?: 'Summer' | 'Winter'; // Season classification
  date: string; // ISO date string
  expectedTransplantDate?: string; // If started from seed
  completed: boolean;
  notes?: string;
  nextDueDate?: string; // For recurring tasks or follow-ups
  images?: string[]; // Base64 encoded images
  lastPhotoDate?: string; // To track weekly updates
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
