/**
 * Tier Configuration System
 * Defines Free and Pro tiers with their limits and features
 */

export enum AppTier {
  FREE = 'FREE',
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
  },
};

/**
 * Get tier configuration
 */
export const getTierConfig = (tier: AppTier): TierConfig => {
  switch (tier) {
    case AppTier.PRO:
      return PRO_TIER;
    case AppTier.FREE:
    default:
      return FREE_TIER;
  }
};

