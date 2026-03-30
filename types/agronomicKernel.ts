import type { FunctionalCategory } from '../data/plantTaxonomy';
import type { ArchetypeId } from './archetypes';

export type AgronomicSystemType =
  | 'open_field'
  | 'protected_culture'
  | 'orchard'
  | 'vineyard'
  | 'olive_grove'
  | 'indoor'
  | 'hydroponic'
  | 'aquaponic'
  | 'aeroponic'
  | 'mixed';

export type AgronomicPrimaryScope =
  | 'site'
  | 'plot'
  | 'zone'
  | 'row'
  | 'plant'
  | 'tree'
  | 'bed'
  | 'reservoir'
  | 'loop';

export type AgronomicLifecycle =
  | 'annual'
  | 'biennial'
  | 'perennial';

export type AgronomicWaterStrategy =
  | 'uniform_supply'
  | 'deficit_sensitive'
  | 'quality_oriented'
  | 'stress_tolerant'
  | 'recirculating';

export type AgronomicNutritionStrategy =
  | 'balanced_growth'
  | 'nitrogen_sensitive'
  | 'quality_finish'
  | 'vegetative_push'
  | 'fruiting_support'
  | 'solution_driven';

export type AgronomicHealthPriority =
  | 'foliar_disease'
  | 'root_disease'
  | 'sap_sucking_pests'
  | 'fruit_quality_pressure'
  | 'water_stress'
  | 'nutrient_imbalance'
  | 'weed_competition';

export type AgronomicSignalKey =
  | 'weather_current'
  | 'weather_forecast'
  | 'leaf_wetness'
  | 'dew_point'
  | 'vpd'
  | 'rain_gauge_local'
  | 'soil_moisture_10cm'
  | 'soil_moisture_30cm'
  | 'soil_moisture_60cm'
  | 'soil_tension_kpa'
  | 'canopy_temperature'
  | 'flow_rate_actual'
  | 'line_pressure'
  | 'water_salinity'
  | 'water_ph'
  | 'water_bicarbonates'
  | 'phenology_observation'
  | 'quality_result'
  | 'operation_ledger'
  | 'ndvi'
  | 'satellite_vigor';

export type AgronomicSignalPriority = 'P0' | 'P1' | 'P2';

export interface AgronomicSignalRequirement {
  key: AgronomicSignalKey;
  priority: AgronomicSignalPriority;
  reason: string;
}

export interface AgronomicRootProfile {
  effectiveDepthCmMin: number;
  effectiveDepthCmMax: number;
  rootingPattern: 'shallow' | 'medium' | 'deep' | 'layered';
}

export interface AgronomicPhenologyProfile {
  stages: string[];
  decisionCriticalStages: string[];
}

export interface AgronomicWaterProfile {
  strategy: AgronomicWaterStrategy;
  rootProfile: AgronomicRootProfile;
  sensitiveStages: string[];
  recommendedSignals: AgronomicSignalRequirement[];
}

export interface AgronomicNutritionProfile {
  strategy: AgronomicNutritionStrategy;
  highDemandStages: string[];
  recommendedSignals: AgronomicSignalRequirement[];
}

export interface AgronomicHealthProfile {
  priorities: AgronomicHealthPriority[];
  recommendedSignals: AgronomicSignalRequirement[];
}

export interface AgronomicQualityProfile {
  targetMetrics: string[];
  recommendedSignals: AgronomicSignalRequirement[];
}

export interface AgronomicCropProfile {
  id: string;
  label: string;
  cropFamily: string;
  lifecycle: AgronomicLifecycle;
  systems: AgronomicSystemType[];
  primaryScope: AgronomicPrimaryScope;
  functionalCategory?: FunctionalCategory;
  archetypeIds?: ArchetypeId[];
  supportedPlantIds?: string[];
  tags: string[];
  phenology: AgronomicPhenologyProfile;
  water: AgronomicWaterProfile;
  nutrition: AgronomicNutritionProfile;
  health: AgronomicHealthProfile;
  quality: AgronomicQualityProfile;
}

export type AgronomicProfileResolutionSource =
  | 'plant_id'
  | 'taxonomy'
  | 'custom_crop'
  | 'functional_category'
  | 'fallback';

export interface ResolvedAgronomicCropProfile {
  profile: AgronomicCropProfile;
  source: AgronomicProfileResolutionSource;
  matchedBy: string;
  warnings: string[];
}
