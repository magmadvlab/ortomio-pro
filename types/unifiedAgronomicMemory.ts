import type { Garden, GardenTask, GardenZone, FieldRow, PlantingBatch } from '@/types'
import type { HealthAlert } from '@/types/healthAlert'
import type { GardenPlant, PlantOperation } from '@/types/individualPlant'
import type { WateringLog } from '@/types/irrigation'
import type {
  FertilizerApplicationLogDB,
  HarvestLogData,
  MechanicalWorkRecord,
  TreatmentRecordDB,
} from '@/types'
import type { AgronomicDecisionLedgerEntry } from '@/services/agronomicDecisionLedgerService'
import type { AgronomicQueueOutcomeRecord } from '@/services/agronomicQueueOutcomeService'
import type { PhenologyObservation, QualityResult } from '@/types'

export type UnifiedAgronomicMemoryScopeType = 'garden' | 'zone' | 'fieldRow' | 'plant'

export interface UnifiedAgronomicMemoryScope {
  type: UnifiedAgronomicMemoryScopeType
  gardenId: string
  zoneId?: string
  fieldRowId?: string
  plantId?: string
}

export type UnifiedAgronomicMemoryEventType =
  | 'planting'
  | 'transplanting'
  | 'irrigation'
  | 'fertilization'
  | 'treatment'
  | 'mechanical_work'
  | 'health_alert'
  | 'photo_analysis'
  | 'harvest'
  | 'weather_update'
  | 'lifecycle_milestone'
  | 'ai_advice'
  | 'task_execution'
  | 'outcome'

export interface UnifiedAgronomicMemoryEvent {
  id: string
  gardenId: string
  type: UnifiedAgronomicMemoryEventType
  occurredAt: string
  zoneId?: string
  fieldRowId?: string
  plantId?: string
  taskId?: string
  sourceService: string
  summary: string
  payload?: Record<string, unknown>
}

export interface UnifiedAgronomicFreshness {
  refreshedAt: string
  oldestRelevantRecordAt?: string
  newestRelevantRecordAt?: string
  confidence: 'high' | 'medium' | 'low'
  missingSections: UnifiedAgronomicMemorySection[]
}

export type UnifiedAgronomicMemorySection =
  | 'garden_profile'
  | 'zone_profile'
  | 'field_row_profile'
  | 'plant_profile'
  | 'weather_history_forecast'
  | 'soil_exposure_context'
  | 'lifecycle_state'
  | 'task_history'
  | 'treatment_history'
  | 'disease_health_history'
  | 'outcomes_learning_signals'

export interface UnifiedAgronomicMemoryDerivedSignals {
  openTaskCount: number
  completedTaskCount: number
  activeHealthAlertCount: number
  latestOperationAt?: string
  latestOutcomeAt?: string
  hasScopedIdentifiers: boolean
  inheritedContext: Array<'garden' | 'zone' | 'fieldRow'>
}

export interface UnifiedAgronomicMemory {
  scope: UnifiedAgronomicMemoryScope
  gardenProfile: Garden | null
  zoneProfile?: GardenZone | null
  fieldRowProfile?: FieldRow | null
  plantProfile?: GardenPlant | null
  weatherHistoryAndForecast: {
    wateringLogs: WateringLog[]
    phenologyObservations: PhenologyObservation[]
    qualityResults: QualityResult[]
  }
  soilAndExposureContext: {
    soilType?: Garden['soilType'] | string
    soilPh?: number
    sunExposure?: string
    dailySunHours?: number
    altitudeMeters?: number
    fieldRowOrientation?: FieldRow['orientation']
  }
  lifecycleState: {
    plantingBatches: PlantingBatch[]
    currentStage?: string
    latestPlantingDate?: string
    expectedHarvestDate?: string
  }
  taskHistory: GardenTask[]
  treatmentHistory: {
    treatments: TreatmentRecordDB[]
    fertilizerApplications: FertilizerApplicationLogDB[]
    wateringLogs: WateringLog[]
    mechanicalWorks: MechanicalWorkRecord[]
    plantOperations: PlantOperation[]
  }
  diseaseHealthHistory: {
    healthAlerts: HealthAlert[]
    plantHealthScore?: number
    plantStatus?: GardenPlant['status']
  }
  outcomesAndLearningSignals: {
    harvestLogs: HarvestLogData[]
    decisionLedger: AgronomicDecisionLedgerEntry[]
    queueOutcomes: AgronomicQueueOutcomeRecord[]
    memoryEvents: UnifiedAgronomicMemoryEvent[]
  }
  derivedSignals: UnifiedAgronomicMemoryDerivedSignals
  freshness: UnifiedAgronomicFreshness
}

export interface UnifiedAgronomicSourceMapEntry {
  service: string
  stores: string[]
  reads: string[]
  emits: string[]
  persistence: 'database' | 'ledger' | 'local_fallback' | 'derived'
}

export interface UnifiedAgronomicPersistenceStrategy {
  section: UnifiedAgronomicMemorySection
  primary: 'database' | 'decision_ledger' | 'operation_ledger' | 'user_preference_snapshot' | 'derived'
  fallback?: 'user_preference_snapshot' | 'local_memory'
  rationale: string
}
