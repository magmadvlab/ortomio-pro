export type ControlledEnvironmentType =
  | 'greenhouse'
  | 'indoor'
  | 'hydroponic'
  | 'aquaponic'
  | 'aeroponic';

export type ControlledEnvironmentSystemMode =
  | 'soil_protected'
  | 'recirculating'
  | 'drain_to_waste';

export type ControlledEnvironmentLoopType =
  | 'nft'
  | 'dwc'
  | 'ebb_flow'
  | 'drip_recirculating'
  | 'aquaponic_media_bed'
  | 'aquaponic_nft'
  | 'aeroponic'
  | 'manual_climate'
  | 'bench_irrigated';

export type ControlledEnvironmentGrowSiteType =
  | 'channel'
  | 'tower'
  | 'bucket'
  | 'table'
  | 'bed'
  | 'raft'
  | 'media_bed'
  | 'grow_tray'
  | 'net_pot_lane'
  | 'bench'
  | 'container'
  | 'pot'
  | 'tank';

export type ControlledEnvironmentExecutionMode = 'outdoor' | 'recirculating';

export type ControlledEnvironmentOperationType =
  | 'solution_prepare'
  | 'solution_change'
  | 'solution_top_up'
  | 'ph_adjustment'
  | 'ec_adjustment'
  | 'circulation_cycle'
  | 'flush'
  | 'oxygenation'
  | 'fish_feed'
  | 'biofilter_maintenance'
  | 'water_test'
  | 'system_clean'
  | 'transplant'
  | 'pruning'
  | 'harvest'
  | 'treatment'
  | 'inspection';

export type ControlledEnvironmentObservationType =
  | 'reading'
  | 'inspection'
  | 'ai_photo'
  | 'plant_health'
  | 'root_health'
  | 'water_quality'
  | 'fish_health'
  | 'equipment_status';

export type ControlledEnvironmentObservationSource =
  | 'manual'
  | 'sensor'
  | 'iot'
  | 'ai';

export type ControlledEnvironmentOutcomeType =
  | 'growth_response'
  | 'yield_response'
  | 'root_issue'
  | 'toxicity'
  | 'deficiency'
  | 'disease'
  | 'fish_loss'
  | 'water_instability';

export interface ControlledEnvironmentProfile {
  id: string;
  gardenId: string;
  environmentType: ControlledEnvironmentType;
  systemMode: ControlledEnvironmentSystemMode;
  validFrom: string;
  validTo?: string;
  lightingProfile?: Record<string, unknown>;
  climateProfile?: Record<string, unknown>;
  structureProfile?: Record<string, unknown>;
  automationProfile?: Record<string, unknown>;
}

export interface ReservoirProfile {
  id: string;
  gardenId: string;
  environmentProfileId: string;
  name: string;
  capacityLiters?: number;
  usableVolumeLiters?: number;
  waterSource?: string;
  isShared?: boolean;
  validFrom: string;
  validTo?: string;
}

export interface LoopProfile {
  id: string;
  gardenId: string;
  environmentProfileId: string;
  reservoirId?: string;
  loopType: ControlledEnvironmentLoopType;
  pumpFlowRate?: number;
  cycleFrequency?: number;
  cycleDuration?: number;
  drainMode?: string;
  validFrom: string;
  validTo?: string;
}

export interface GrowSiteProfile {
  id: string;
  gardenId: string;
  environmentProfileId: string;
  loopId?: string;
  siteType: ControlledEnvironmentGrowSiteType;
  siteName: string;
  positionIndex?: number;
  capacityPlants?: number;
  rowLikeIndex?: number;
  zoneLikeLabel?: string;
  validFrom: string;
  validTo?: string;
}

export interface SolutionSnapshot {
  ph?: number;
  ec?: number;
  temperatureCelsius?: number;
  dissolvedOxygen?: number;
  reservoirVolumeLiters?: number;
  salinity?: number;
  orp?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
}

export interface ControlledEnvironmentExecution {
  id: string;
  gardenId: string;
  environmentProfileId: string;
  reservoirId?: string;
  loopId?: string;
  growSiteIds?: string[];
  plantIds?: string[];
  executionMode: 'recirculating';
  operationType: ControlledEnvironmentOperationType;
  operationDate: string;
  operationTime?: string;
  sourceType?: 'manual' | 'iot' | 'orchestrator_auto' | 'orchestrator_sync';
  actorType?: 'manual' | 'iot' | 'orchestrator';
  parentExecutionId?: string;
  notes?: string;
  solutionSnapshot?: SolutionSnapshot;
  waterAddedLiters?: number;
  solutionRemovedLiters?: number;
  nutrientProductId?: string;
  nutrientProductName?: string;
  nutrientDoseAmount?: number;
  nutrientDoseUnit?: string;
  phAdjusterProductId?: string;
  phAdjusterAmount?: number;
  bufferAdded?: string;
  fishFeedType?: string;
  fishFeedAmountGrams?: number;
  createdAt: string;
}

export interface ControlledEnvironmentObservation {
  id: string;
  gardenId: string;
  environmentProfileId: string;
  reservoirId?: string;
  loopId?: string;
  growSiteId?: string;
  plantId?: string;
  observationType: ControlledEnvironmentObservationType;
  observedAt: string;
  source: ControlledEnvironmentObservationSource;
  payload: Record<string, unknown>;
  notes?: string;
  createdAt: string;
}

export interface ControlledEnvironmentOutcome {
  id: string;
  gardenId: string;
  executionId: string;
  growSiteId?: string;
  plantId?: string;
  outcomeType: ControlledEnvironmentOutcomeType;
  measuredAt: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  createdAt: string;
}

export interface ControlledEnvironmentReadingSummary {
  id: string;
  sourceKind: 'hydroponic' | 'aquaponic' | 'greenhouse' | 'observation' | 'sensor';
  recordedAt: string;
  title: string;
  metrics: Record<string, unknown>;
  notes?: string;
}

export interface ControlledEnvironmentDashboardData {
  environmentProfile: ControlledEnvironmentProfile;
  reservoirs: ReservoirProfile[];
  loops: LoopProfile[];
  growSites: GrowSiteProfile[];
  executions: ControlledEnvironmentExecution[];
  observations: ControlledEnvironmentObservation[];
  readings: ControlledEnvironmentReadingSummary[];
  recentOutcomeCount: number;
  linkedPlantCount: number;
  structuralInsights: string[];
  sensorSnapshot?: Record<string, number | string>;
}
