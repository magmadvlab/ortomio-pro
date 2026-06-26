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

export interface AgronomicScopeDescriptor {
  primaryScope: AgronomicPrimaryScope;
  gardenId: string;
  gardenName?: string;
  zoneId?: string;
  zoneName?: string;
  rowId?: string;
  rowName?: string;
  rowNumber?: string;
  fieldRowId?: string;
  treeId?: string;
  plantId?: string;
  plantName?: string;
  scopeLabel?: string;
}

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

export type AgronomicDecisionFocus =
  | 'water'
  | 'nutrition'
  | 'health'
  | 'quality';

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

export interface AgronomicPriorityModifier {
  baseScoreDelta?: number;
  criticalStageWeight?: number;
  signalCoverageWeight?: number;
  environmentalPressureWeight?: number;
  confidenceDelta?: number;
}

export interface AgronomicEconomicModifier {
  interventionCostMultiplier?: number;
  delayCostMultiplier?: number;
  protectedValueMultiplier?: number;
  rationale?: string[];
}

export interface AgronomicIrrigationTuning {
  baseAdjustment?: number;
  sensitiveStageAdjustment?: number;
  measuredFeedbackWeight?: number;
  rationale?: string[];
}

export interface AgronomicActionScenarioTuning {
  interventionCostMultiplier?: number;
  residualDelayMultiplier?: number;
  protectedValueMultiplier?: number;
}

export type AgronomicOperationalContextTag =
  | AgronomicSystemType
  | 'rainfed'
  | 'pressurized_irrigation'
  | 'manual_irrigation'
  | 'broadacre_scale'
  | 'wine_grape'
  | 'table_grape'
  | 'oil_cultivar'
  | 'table_olive'
  | 'high_altitude_site'
  | 'coastal_site'
  | 'steep_slope_site'
  | 'exposed_site'
  | 'sheltered_site'
  | 'nft_system'
  | 'dwc_system'
  | 'ebb_flow_system'
  | 'media_bed_system'
  | 'high_pressure_aeroponic';

export type AgronomicProductionIntent =
  | 'wine'
  | 'table_grape'
  | 'oil'
  | 'table_olive'
  | 'fresh_market'
  | 'processing';

export type AgronomicIrrigationMode =
  | 'rainfed'
  | 'manual_irrigation'
  | 'pressurized_irrigation';

export type AgronomicSiteExposureClass =
  | 'sheltered'
  | 'balanced'
  | 'exposed'
  | 'unknown';

export type AgronomicSiteSlopeClass =
  | 'flat'
  | 'rolling'
  | 'steep'
  | 'unknown';

export interface CultivarContext {
  cultivarId?: string;
  cultivarLabel?: string;
  speciesLabel?: string;
  productionIntent?: AgronomicProductionIntent;
}

export interface SubSystemContext {
  systemType?: AgronomicSystemType;
  irrigationMode?: AgronomicIrrigationMode;
  trainingSystem?: string;
  rootstock?: string;
}

export interface SiteOperationalProfile {
  altitudeMeters?: number;
  slopePercentage?: number;
  dailySunHours?: number;
  photoperiodHours?: number;
  sunExposure?: string;
  aspectDirection?: string;
  windProtection?: string;
  soilType?: string;
  soilPh?: number;
  terroir?: string;
  shadowObstaclesCount?: number;
  exposureClass?: AgronomicSiteExposureClass;
  slopeClass?: AgronomicSiteSlopeClass;
  siteTags?: AgronomicOperationalContextTag[];
}

export interface AgronomicRefinedContext {
  cultivarContext?: CultivarContext;
  subSystemContext?: SubSystemContext;
  siteOperationalProfile?: SiteOperationalProfile;
}

export interface AgronomicActionComparisonTuning {
  immediate?: AgronomicActionScenarioTuning;
  nextCycle?: AgronomicActionScenarioTuning;
  monitor?: AgronomicActionScenarioTuning;
  nextCyclePreferenceThresholdMultiplier?: number;
  rationale?: string[];
}

export interface AgronomicActionComparisonContextOverride {
  requiredTags: AgronomicOperationalContextTag[];
  tuning: AgronomicActionComparisonTuning;
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
  decisionModifiers?: Partial<Record<AgronomicDecisionFocus, AgronomicPriorityModifier>>;
  economicModifiers?: Partial<Record<AgronomicDecisionFocus, AgronomicEconomicModifier>>;
  irrigationTuning?: AgronomicIrrigationTuning;
  actionComparisonTuning?: Partial<Record<AgronomicDecisionFocus, AgronomicActionComparisonTuning>>;
  actionComparisonContextOverrides?: Partial<
    Record<AgronomicDecisionFocus, AgronomicActionComparisonContextOverride[]>
  >;
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
