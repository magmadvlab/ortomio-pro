export type ControlledEnvironmentExecutionMode =
  | 'recirculating'
  | 'drain_to_waste'
  | 'batch';

export type ControlledEnvironmentOperationType =
  | 'solution_top_up'
  | 'solution_change'
  | 'nutrient_dose'
  | 'ph_adjustment'
  | 'fish_feed';

export type ControlledEnvironmentSourceType =
  | 'manual'
  | 'iot'
  | 'orchestrator_auto'
  | 'orchestrator_sync';

export type ControlledEnvironmentActorType =
  | 'manual'
  | 'iot'
  | 'orchestrator';

export interface SolutionSnapshot {
  measuredAt?: string;
  ph?: number;
  ec?: number;
  temperatureC?: number;
  dissolvedOxygenMgL?: number;
  waterLevelLiters?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface ControlledEnvironmentExecution {
  id: string;
  gardenId: string;
  environmentProfileId: string;
  reservoirId?: string;
  loopId?: string;
  growSiteIds?: string[];
  plantIds?: string[];
  executionMode: ControlledEnvironmentExecutionMode;
  operationType: ControlledEnvironmentOperationType;
  operationDate: string;
  operationTime?: string;
  sourceType: ControlledEnvironmentSourceType;
  actorType: ControlledEnvironmentActorType;
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
  observationDate: string;
  observationTime?: string;
  reservoirId?: string;
  loopId?: string;
  growSiteIds?: string[];
  solutionSnapshot?: SolutionSnapshot;
  notes?: string;
  createdAt: string;
}

export interface ControlledEnvironmentOutcome {
  id: string;
  gardenId: string;
  executionId: string;
  outcomeDate: string;
  status: 'completed' | 'partial' | 'failed';
  notes?: string;
  metrics?: Record<string, unknown>;
  createdAt: string;
}
