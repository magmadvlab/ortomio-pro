/**
 * Tier Configuration System
 * Defines Free and Pro tiers with their limits and features
 */

export enum AppTier {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PRO = 'PRO',
}

export interface TierConfig {
  tier: AppTier;
  name: string;
  limits: {
    maxGardens: number;
    maxTasksPerGarden: number;
    maxSeedPackets: number;
    maxHarvestLogs: number;
    maxPhotoLogs?: number; // Pro only
    maxSeedlingBatches?: number; // Free: max 3 batch semenzai
    maxSaplingBatches?: number; // Free: max batch alberelli
    maxPhotosPerBatch?: number; // Free: max 5 foto per batch
  };
  features: {
    // Core Features (available in both tiers)
    basicPlanner: boolean;
    basicJournal: boolean;
    basicHarvestLog: boolean;
    seedInventory: boolean;
    lunarCalendar: boolean;
    lifecycleEngine: boolean;
    nutrientEngine: boolean;
    healthEngine: boolean;
    
    // Pro Features
    visualGardenPlanner: boolean;
    photoTimeLapse: boolean;
    harvestAnalytics: boolean;
    advancedWeather: boolean;
    photoOnboarding: boolean;
    diseaseDiagnosis: boolean; // AI diagnosis con foto
    seedlingManagement: boolean; // Gestione avanzata semenzai
    annualPlanner: boolean; // Pianificazione annuale
    specializedCrops: boolean; // Strawberries, Fruit Trees, Olives, Vines
    advancedSystems: boolean; // Serre, Idroponica, Acquaponica, Aeroponica
    rotationEngine: boolean;
    companionPlanting: boolean;
    cloudSync: boolean;
    exportData: boolean;
    
    // Consumer Features (PRO Consumer only)
    recipes: boolean; // Ricette AI
    guides: boolean; // Guide approfondite
    community: boolean; // Community features
    
    // Professional Features (PRO Professional only)
    advancedAnalytics: boolean; // Analytics avanzate con ROI
    treatmentRegister: boolean; // Registro trattamenti
    nutrientCalculator: boolean; // Calcolatore NPK preciso
    cropRotation: boolean; // Rotazione colturale multi-anno
    exportCSV: boolean; // Export CSV
    exportPDF: boolean; // Export PDF
  };
}

export const FREE_TIER: TierConfig = {
  tier: AppTier.FREE,
  name: 'Free',
  limits: {
    maxGardens: 1,
    maxTasksPerGarden: 50,
    maxSeedPackets: 20,
    maxHarvestLogs: 100,
    maxSeedlingBatches: 3, // Free: max 3 batch semenzai
    maxSaplingBatches: 2, // Free: max 2 batch alberelli
    maxPhotosPerBatch: 5, // Free: max 5 foto per batch
  },
  features: {
    // Core Features
    basicPlanner: true,
    basicJournal: true,
    basicHarvestLog: true,
    seedInventory: true,
    lunarCalendar: true,
    lifecycleEngine: true,
    nutrientEngine: true,
    healthEngine: true,
    
    // Pro Features (disabled)
    visualGardenPlanner: false,
    photoTimeLapse: false,
    harvestAnalytics: false,
    advancedWeather: false,
    photoOnboarding: false,
    diseaseDiagnosis: false,
    seedlingManagement: false,
    annualPlanner: false,
    specializedCrops: false,
    advancedSystems: false,
    rotationEngine: false,
    companionPlanting: false,
    cloudSync: false,
    exportData: false,
    
    // Consumer Features (disabled)
    recipes: false,
    guides: false,
    community: false,
    
    // Professional Features (disabled)
    advancedAnalytics: false,
    treatmentRegister: false,
    nutrientCalculator: false,
    cropRotation: false,
    exportCSV: false,
    exportPDF: false,
  },
};

export const PLUS_TIER: TierConfig = {
  tier: AppTier.PLUS,
  name: 'Plus',
  limits: {
    maxGardens: -1, // Unlimited
    maxTasksPerGarden: -1, // Unlimited
    maxSeedPackets: -1, // Unlimited
    maxHarvestLogs: -1, // Unlimited
    maxPhotoLogs: -1, // Unlimited
    maxSeedlingBatches: -1, // Unlimited
    maxSaplingBatches: -1, // Unlimited
    maxPhotosPerBatch: -1, // Unlimited
  },
  features: {
    // Core Features
    basicPlanner: true,
    basicJournal: true,
    basicHarvestLog: true,
    seedInventory: true,
    lunarCalendar: true,
    lifecycleEngine: true,
    nutrientEngine: true,
    healthEngine: true,
    
    // Pro Features (all enabled)
    visualGardenPlanner: true,
    photoTimeLapse: true,
    harvestAnalytics: true,
    advancedWeather: true,
    photoOnboarding: true,
    diseaseDiagnosis: true,
    seedlingManagement: true,
    annualPlanner: true,
    specializedCrops: true,
    advancedSystems: true,
    rotationEngine: true,
    companionPlanting: true,
    cloudSync: true,
    exportData: true,
    
    // Consumer Features (ENABLED)
    recipes: true, // ✅ Ricette AI
    guides: true, // ✅ Guide approfondite
    community: true, // ✅ Community features
    
    // Professional Features (DISABLED)
    advancedAnalytics: false,
    treatmentRegister: false,
    nutrientCalculator: false,
    cropRotation: true,
    exportCSV: false,
    exportPDF: false,
  },
};

export const PRO_TIER: TierConfig = {
  tier: AppTier.PRO,
  name: 'Pro',
  limits: {
    maxGardens: -1, // Unlimited
    maxTasksPerGarden: -1, // Unlimited
    maxSeedPackets: -1, // Unlimited
    maxHarvestLogs: -1, // Unlimited
    maxPhotoLogs: -1, // Unlimited
    maxSeedlingBatches: -1, // Unlimited
    maxSaplingBatches: -1, // Unlimited
    maxPhotosPerBatch: -1, // Unlimited
  },
  features: {
    // Core Features
    basicPlanner: true,
    basicJournal: true,
    basicHarvestLog: true,
    seedInventory: true,
    lunarCalendar: true,
    lifecycleEngine: true,
    nutrientEngine: true,
    healthEngine: true,
    
    // Pro Features (all enabled)
    visualGardenPlanner: true,
    photoTimeLapse: true,
    harvestAnalytics: true,
    advancedWeather: true,
    photoOnboarding: true,
    diseaseDiagnosis: true,
    seedlingManagement: true,
    annualPlanner: true,
    specializedCrops: true,
    advancedSystems: true,
    rotationEngine: true,
    companionPlanting: true,
    cloudSync: true,
    exportData: true,
    
    // Consumer Features (DISABLED - no recipes for professionals)
    recipes: false, // ❌ NO ricette
    guides: false, // ❌ NO guide
    community: false, // ❌ NO community
    
    // Professional Features (ENABLED)
    advancedAnalytics: true, // ✅ Analytics avanzate con ROI
    treatmentRegister: true, // ✅ Registro trattamenti
    nutrientCalculator: true, // ✅ Calcolatore NPK preciso
    cropRotation: true, // ✅ Rotazione colturale
    exportCSV: true, // ✅ Export CSV
    exportPDF: true, // ✅ Export PDF
  },
};


/**
 * Get tier configuration
 * Supports migration from old tier names for backward compatibility
 */
export const getTierConfig = (tier: AppTier | string): TierConfig => {
  switch (tier) {
    case AppTier.PLUS:
    case 'PLUS':
      return PLUS_TIER;
    case AppTier.PRO:
    case 'PRO':
      return PRO_TIER;
    case AppTier.FREE:
    case 'FREE':
      return FREE_TIER;
    // Legacy tier migration (backward compatibility)
    case 'PRO_CONSUMER':
      return PLUS_TIER; // Migrate PRO_CONSUMER to PLUS
    case 'PRO_PROFESSIONAL':
      return PRO_TIER; // Migrate PRO_PROFESSIONAL to PRO
    default:
      return FREE_TIER;
  }
};

