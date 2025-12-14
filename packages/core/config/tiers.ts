/**
 * Tier Configuration System
 * Defines Free and Pro tiers with their limits and features
 */

export enum AppTier {
  FREE = 'FREE',
  PRO = 'PRO', // Legacy, will be migrated to PRO_CONSUMER
  PRO_CONSUMER = 'PRO_CONSUMER',
  PRO_PROFESSIONAL = 'PRO_PROFESSIONAL',
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
    rotationEngine: false,
    companionPlanting: false,
    cloudSync: false,
    exportData: false,
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
    rotationEngine: true,
    companionPlanting: true,
    cloudSync: true,
    exportData: true,
    
    // Consumer Features (legacy PRO has these)
    recipes: true,
    guides: true,
    community: true,
    
    // Professional Features (legacy PRO has basic versions)
    advancedAnalytics: false,
    treatmentRegister: false,
    nutrientCalculator: false,
    cropRotation: true,
    exportCSV: false,
    exportPDF: false,
  },
};

export const PRO_CONSUMER_TIER: TierConfig = {
  tier: AppTier.PRO_CONSUMER,
  name: 'Pro Consumer',
  limits: {
    maxGardens: -1, // Unlimited
    maxTasksPerGarden: -1, // Unlimited
    maxSeedPackets: -1, // Unlimited
    maxHarvestLogs: -1, // Unlimited
    maxPhotoLogs: -1, // Unlimited
    maxSeedlingBatches: -1, // Unlimited
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

export const PRO_PROFESSIONAL_TIER: TierConfig = {
  tier: AppTier.PRO_PROFESSIONAL,
  name: 'Pro Professional',
  limits: {
    maxGardens: -1, // Unlimited
    maxTasksPerGarden: -1, // Unlimited
    maxSeedPackets: -1, // Unlimited
    maxHarvestLogs: -1, // Unlimited
    maxPhotoLogs: -1, // Unlimited
    maxSeedlingBatches: -1, // Unlimited
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
 */
export const getTierConfig = (tier: AppTier | string): TierConfig => {
  switch (tier) {
    case AppTier.PRO:
    case 'PRO':
      return PRO_TIER;
    case AppTier.PRO_CONSUMER:
    case 'PRO_CONSUMER':
      return PRO_CONSUMER_TIER;
    case AppTier.PRO_PROFESSIONAL:
    case 'PRO_PROFESSIONAL':
      return PRO_PROFESSIONAL_TIER;
    case AppTier.FREE:
    case 'FREE':
    default:
      return FREE_TIER;
  }
};

