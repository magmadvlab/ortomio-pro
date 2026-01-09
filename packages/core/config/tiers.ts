/**
 * Tier Configuration System
 * OrtoMio PRO - Solo versione professionale
 */

export enum AppTier {
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
    maxPhotoLogs: number;
    maxSeedlingBatches: number;
    maxSaplingBatches: number;
    maxPhotosPerBatch: number;
  };
  features: {
    // Core Features
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
    diseaseDiagnosis: boolean;
    seedlingManagement: boolean;
    annualPlanner: boolean;
    specializedCrops: boolean;
    advancedSystems: boolean;
    rotationEngine: boolean;
    companionPlanting: boolean;
    cloudSync: boolean;
    exportData: boolean;
    
    // Consumer Features
    recipes: boolean;
    guides: boolean;
    community: boolean;
    
    // Professional Features
    advancedAnalytics: boolean;
    treatmentRegister: boolean;
    nutrientCalculator: boolean;
    cropRotation: boolean;
    exportCSV: boolean;
    exportPDF: boolean;
  };
}

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
    // Core Features - ALL ENABLED
    basicPlanner: true,
    basicJournal: true,
    basicHarvestLog: true,
    seedInventory: true,
    lunarCalendar: true,
    lifecycleEngine: true,
    nutrientEngine: true,
    healthEngine: true,
    
    // Pro Features - ALL ENABLED
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
    
    // Consumer Features - ALL ENABLED
    recipes: true,
    guides: true,
    community: true,
    
    // Professional Features - ALL ENABLED
    advancedAnalytics: true,
    treatmentRegister: true,
    nutrientCalculator: true,
    cropRotation: true,
    exportCSV: true,
    exportPDF: true,
  },
};

/**
 * Get tier configuration - Always returns PRO
 * Supports migration from old tier names for backward compatibility
 */
export const getTierConfig = (tier?: AppTier | string): TierConfig => {
  // Always return PRO tier - this is a PRO-only app
  return PRO_TIER;
};

// Legacy exports for backward compatibility
export const FREE_TIER = PRO_TIER;
export const PLUS_TIER = PRO_TIER;
