import type { IStorageProvider } from '@/packages/core/storage/interface'
import type {
  FertilizerApplicationLogDB,
  GardenTask,
  HarvestLogData,
  MechanicalWorkRecord,
  TreatmentRecordDB,
} from '@/types'
import type { HealthAlert } from '@/types/healthAlert'
import type { GardenPlant, PlantOperation } from '@/types/individualPlant'
import type { WateringLog } from '@/types/irrigation'
import {
  getAgronomicDecisionLedgerEntries,
  type AgronomicDecisionLedgerEntry,
} from '@/services/agronomicDecisionLedgerService'
import {
  getAgronomicQueueOutcomeRecords,
  type AgronomicQueueOutcomeRecord,
} from '@/services/agronomicQueueOutcomeService'
import type {
  UnifiedAgronomicMemory,
  UnifiedAgronomicMemoryDerivedSignals,
  UnifiedAgronomicMemoryEvent,
  UnifiedAgronomicMemoryEventType,
  UnifiedAgronomicMemoryScope,
  UnifiedAgronomicMemorySection,
  UnifiedAgronomicPersistenceStrategy,
  UnifiedAgronomicSourceMapEntry,
} from '@/types/unifiedAgronomicMemory'

type UnifiedAgronomicMemoryStorage = Partial<
  Pick<
    IStorageProvider,
    | 'getGarden'
    | 'getGardenZone'
    | 'getGardenZones'
    | 'getFieldRow'
    | 'getFieldRows'
    | 'getIndividualPlant'
    | 'getIndividualPlants'
    | 'getPlantOperations'
    | 'getFieldRowOperations'
    | 'getPlantingBatches'
    | 'getTasks'
    | 'getWateringLogs'
    | 'getTreatments'
    | 'getFertilizerApplicationLogs'
    | 'getMechanicalWorks'
    | 'getHealthAlerts'
    | 'getHarvestLogs'
    | 'getPhenologyObservations'
    | 'getQualityResults'
    | 'getAgronomicMemoryEvents'
    | 'createAgronomicMemoryEvent'
    | 'getAgronomicDecisionLedgerEntries'
    | 'getAgronomicQueueOutcomeRecords'
  >
>

export const UNIFIED_AGRONOMIC_SOURCE_MAP: UnifiedAgronomicSourceMapEntry[] = [
  {
    service: 'directorService',
    stores: ['daily plan decisions', 'generated task prompts'],
    reads: ['garden', 'tasks', 'weather', 'lifecycle', 'health'],
    emits: ['suggested tasks', 'urgent alerts', 'baseline prompts'],
    persistence: 'derived',
  },
  {
    service: 'continuousMonitoringService',
    stores: ['monitoring snapshots', 'derived alerts'],
    reads: ['weather', 'tasks', 'health signals'],
    emits: ['monitoring recommendations'],
    persistence: 'derived',
  },
  {
    service: 'plantHealthMonitoringService',
    stores: ['health observations', 'phenology-backed health context'],
    reads: ['phenology observations', 'weather', 'health alerts'],
    emits: ['health risks', 'treatment guidance'],
    persistence: 'database',
  },
  {
    service: 'plantMonitoringService',
    stores: ['plant monitoring state'],
    reads: ['plants', 'tasks', 'photos'],
    emits: ['plant status signals'],
    persistence: 'derived',
  },
  {
    service: 'gardenMemoryService',
    stores: ['zone planting memories', 'tree memories', 'local correlations'],
    reads: ['local memory snapshots'],
    emits: ['zone patterns', 'best planting dates', 'correlations'],
    persistence: 'derived',
  },
  {
    service: 'agronomicDecisionLedgerService',
    stores: ['AI decision snapshots', 'task creation state', 'completion state'],
    reads: ['agronomic queue metadata'],
    emits: ['decision ledger entries'],
    persistence: 'ledger',
  },
  {
    service: 'dailyDiaryService',
    stores: ['daily weather logs', 'cultivation tracking', 'diary events'],
    reads: ['gardens', 'weather providers', 'environmental ledger'],
    emits: ['stress events', 'predictive insights'],
    persistence: 'database',
  },
  {
    service: 'environmentalMonitoringService',
    stores: ['weather lineage', 'forecast snapshots', 'zone environmental ledger'],
    reads: ['weather', 'sensor readings', 'site bindings'],
    emits: ['canonical environmental context'],
    persistence: 'database',
  },
  {
    service: 'fieldRowCropHistoryService',
    stores: ['crop history entries', 'planting context', 'rotation scores'],
    reads: ['field rows', 'weather/lunar context'],
    emits: ['rotation analysis', 'crop family history'],
    persistence: 'database',
  },
  {
    service: 'plantLifecycleService',
    stores: ['lifecycle events', 'notifications', 'yield closure'],
    reads: ['crop variety database', 'garden lifecycle rows'],
    emits: ['pending lifecycle notifications', 'lifecycle stats'],
    persistence: 'database',
  },
  {
    service: 'taskExecutionOrchestratorService',
    stores: ['execution launch context'],
    reads: ['task route params', 'task scope identifiers'],
    emits: ['watering/treatment/harvest/work bootstrap payloads'],
    persistence: 'derived',
  },
]

export const UNIFIED_AGRONOMIC_PERSISTENCE_STRATEGY: UnifiedAgronomicPersistenceStrategy[] = [
  {
    section: 'garden_profile',
    primary: 'database',
    rationale: 'Garden facts are durable scope roots and should come from the garden record.',
  },
  {
    section: 'zone_profile',
    primary: 'database',
    rationale: 'Zones are operational scopes used by irrigation, treatments, and advice.',
  },
  {
    section: 'field_row_profile',
    primary: 'database',
    rationale: 'Field rows are the smallest durable crop-row context before individual plants.',
  },
  {
    section: 'plant_profile',
    primary: 'database',
    rationale: 'Individual plant state is durable when plant tracking is enabled.',
  },
  {
    section: 'weather_history_forecast',
    primary: 'database',
    fallback: 'user_preference_snapshot',
    rationale: 'Weather history, forecast lineage, and observations affect repeatable decisions.',
  },
  {
    section: 'soil_exposure_context',
    primary: 'database',
    rationale: 'Soil and exposure are inherited from garden, zone, and row profile facts.',
  },
  {
    section: 'lifecycle_state',
    primary: 'database',
    fallback: 'user_preference_snapshot',
    rationale: 'Lifecycle stage drives timing and should remain available across AI surfaces.',
  },
  {
    section: 'task_history',
    primary: 'database',
    rationale: 'Tasks are operational commitments and must carry scoped identifiers.',
  },
  {
    section: 'treatment_history',
    primary: 'operation_ledger',
    fallback: 'user_preference_snapshot',
    rationale: 'Executed treatments, irrigation, fertilization, and work are memory write events.',
  },
  {
    section: 'disease_health_history',
    primary: 'database',
    rationale: 'Health alerts and plant status must be queryable for future risk decisions.',
  },
  {
    section: 'outcomes_learning_signals',
    primary: 'decision_ledger',
    fallback: 'user_preference_snapshot',
    rationale: 'Decisions, task outcomes, and harvest/quality results close the learning loop.',
  },
]

const nowIso = () => new Date().toISOString()

const createId = (prefix: string) => {
  const uuid = globalThis.crypto?.randomUUID?.()
  return `${prefix}:${uuid || `${Date.now()}:${Math.random().toString(36).slice(2)}`}`
}

const normalizeDate = (value?: string | null): string | null => {
  if (!value) return null
  return value.includes('T') ? value : `${value}T00:00:00.000Z`
}

const compactDates = (values: Array<string | null | undefined>): string[] =>
  values
    .map(normalizeDate)
    .filter((value): value is string => Boolean(value))
    .sort()

const latestDate = (values: Array<string | null | undefined>): string | undefined =>
  compactDates(values).at(-1)

const oldestDate = (values: Array<string | null | undefined>): string | undefined =>
  compactDates(values)[0]

const safeRead = async <T>(reader: (() => Promise<T> | undefined) | undefined, fallback: T): Promise<T> => {
  if (!reader) return fallback

  try {
    const result = await reader()
    return result === undefined ? fallback : result
  } catch (error) {
    console.warn('Unified agronomic memory read skipped', error)
    return fallback
  }
}

const touchesScope = (
  item: Record<string, any>,
  scope: UnifiedAgronomicMemoryScope,
  plant?: GardenPlant | null
): boolean => {
  if (item.gardenId && item.gardenId !== scope.gardenId) return false
  if (item.garden_id && item.garden_id !== scope.gardenId) return false

  if (scope.plantId) {
    const directPlantMatch =
      item.plantId === scope.plantId ||
      item.plant_id === scope.plantId ||
      item.id === scope.plantId

    if (directPlantMatch) {
      return true
    }

    const plantNameMatch = Boolean(
      plant?.plantName &&
        (item.plantName === plant.plantName || item.plant_name === plant.plantName)
    )

    if (!plantNameMatch) {
      return false
    }

    const itemFieldRowId = item.fieldRowId || item.field_row_id || item.rowId || item.row_id
    if (scope.fieldRowId && itemFieldRowId && itemFieldRowId !== scope.fieldRowId) {
      return false
    }

    const itemZoneId = item.zoneId || item.zone_id || item.bedId || item.bed_id
    if (scope.zoneId && itemZoneId && itemZoneId !== scope.zoneId) {
      return false
    }

    return true
  }

  if (scope.fieldRowId) {
    return (
      item.fieldRowId === scope.fieldRowId ||
      item.field_row_id === scope.fieldRowId ||
      item.rowId === scope.fieldRowId ||
      item.row_id === scope.fieldRowId ||
      item.gardenRowId === scope.fieldRowId ||
      item.garden_row_id === scope.fieldRowId ||
      (Array.isArray(item.rowIds) && item.rowIds.includes(scope.fieldRowId))
    )
  }

  if (scope.zoneId) {
    return (
      item.zoneId === scope.zoneId ||
      item.zone_id === scope.zoneId ||
      item.bedId === scope.zoneId ||
      item.bed_id === scope.zoneId
    )
  }

  return true
}

const filterScoped = <T extends Record<string, any>>(
  items: T[],
  scope: UnifiedAgronomicMemoryScope,
  plant?: GardenPlant | null
): T[] => items.filter((item) => touchesScope(item, scope, plant))

const resolveTaskScopeIdentifiers = (task: GardenTask) => ({
  zoneId: task.zoneId || task.bedId,
  fieldRowId: task.rowId,
})

export class UnifiedAgronomicMemoryService {
  constructor(private readonly storageProvider: UnifiedAgronomicMemoryStorage | null | undefined) {}

  async appendEvent(
    input: Omit<UnifiedAgronomicMemoryEvent, 'id' | 'occurredAt'> & {
      id?: string
      occurredAt?: string
    }
  ): Promise<UnifiedAgronomicMemoryEvent | null> {
    if (!this.storageProvider?.createAgronomicMemoryEvent) {
      throw new Error('Cloud agronomic memory capability unavailable')
    }

    const event: UnifiedAgronomicMemoryEvent = {
      ...input,
      id: input.id || createId(`uam:${input.type}`),
      occurredAt: input.occurredAt || nowIso(),
    }
    return this.storageProvider.createAgronomicMemoryEvent(event)
  }

  async recordTaskExecutionOutcome(input: {
    gardenId: string
    task: GardenTask
    eventType?: UnifiedAgronomicMemoryEventType
    summary?: string
    payload?: Record<string, unknown>
  }): Promise<UnifiedAgronomicMemoryEvent | null> {
    const identifiers = resolveTaskScopeIdentifiers(input.task)

    return this.appendEvent({
      gardenId: input.gardenId,
      type: input.eventType || 'task_execution',
      sourceService: 'unifiedAgronomicMemoryService',
      taskId: input.task.id,
      zoneId: identifiers.zoneId,
      fieldRowId: identifiers.fieldRowId,
      summary:
        input.summary ||
        `${input.task.taskType} ${input.task.completed ? 'completed' : 'updated'} for ${input.task.plantName}`,
      payload: {
        taskType: input.task.taskType,
        plantName: input.task.plantName,
        completed: input.task.completed,
        completedAt: input.task.completedAt || input.task.actualCompletedDate,
        ...input.payload,
      },
    })
  }

  async readGardenMemory(gardenId: string): Promise<UnifiedAgronomicMemory> {
    return this.readMemory({ type: 'garden', gardenId })
  }

  async readZoneMemory(gardenId: string, zoneId: string): Promise<UnifiedAgronomicMemory> {
    return this.readMemory({ type: 'zone', gardenId, zoneId })
  }

  async readFieldRowMemory(gardenId: string, fieldRowId: string): Promise<UnifiedAgronomicMemory> {
    return this.readMemory({ type: 'fieldRow', gardenId, fieldRowId })
  }

  async readPlantMemory(gardenId: string, plantId: string): Promise<UnifiedAgronomicMemory> {
    return this.readMemory({ type: 'plant', gardenId, plantId })
  }

  async readMemory(scopeInput: UnifiedAgronomicMemoryScope): Promise<UnifiedAgronomicMemory> {
    const garden = await safeRead(() => this.storageProvider?.getGarden?.(scopeInput.gardenId), null)
    const plant = scopeInput.plantId
      ? await safeRead(() => this.storageProvider?.getIndividualPlant?.(scopeInput.plantId!), null)
      : null
    const effectiveFieldRowId = scopeInput.fieldRowId || plant?.fieldRowId
    const fieldRow = effectiveFieldRowId
      ? await safeRead(() => this.storageProvider?.getFieldRow?.(effectiveFieldRowId), null)
      : null
    const effectiveZoneId = scopeInput.zoneId || fieldRow?.zoneId || undefined
    const zone = effectiveZoneId
      ? await safeRead(() => this.storageProvider?.getGardenZone?.(effectiveZoneId), null)
      : null
    const scope: UnifiedAgronomicMemoryScope = {
      ...scopeInput,
      zoneId: effectiveZoneId,
      fieldRowId: effectiveFieldRowId,
    }

    const [
      allTasks,
      allWateringLogs,
      allTreatments,
      allFertilizerApplications,
      allMechanicalWorks,
      allHealthAlerts,
      allHarvestLogs,
      plantingBatches,
      phenologyObservations,
      qualityResults,
      plantOperations,
      fieldRowOperations,
      memoryEvents,
      decisionLedger,
      queueOutcomes,
    ] = await Promise.all([
      safeRead(() => this.storageProvider?.getTasks?.(scope.gardenId), [] as GardenTask[]),
      safeRead(
        () => this.storageProvider?.getWateringLogs?.(undefined, scope.gardenId),
        [] as WateringLog[]
      ),
      safeRead(() => this.storageProvider?.getTreatments?.(scope.gardenId), [] as TreatmentRecordDB[]),
      safeRead(
        () => this.storageProvider?.getFertilizerApplicationLogs?.(scope.gardenId),
        [] as FertilizerApplicationLogDB[]
      ),
      safeRead(
        () => this.storageProvider?.getMechanicalWorks?.(scope.gardenId),
        [] as MechanicalWorkRecord[]
      ),
      safeRead(() => this.storageProvider?.getHealthAlerts?.(scope.gardenId), [] as HealthAlert[]),
      safeRead(() => this.storageProvider?.getHarvestLogs?.(scope.gardenId), [] as HarvestLogData[]),
      safeRead(
        () => this.storageProvider?.getPlantingBatches?.(scope.gardenId, scope.fieldRowId),
        []
      ),
      safeRead(
        () =>
          this.storageProvider?.getPhenologyObservations?.(scope.gardenId, {
            zoneId: scope.zoneId,
            fieldRowId: scope.fieldRowId,
            plantId: scope.plantId,
            limit: 100,
          }),
        []
      ),
      safeRead(
        () =>
          this.storageProvider?.getQualityResults?.(scope.gardenId, {
            zoneId: scope.zoneId,
            fieldRowId: scope.fieldRowId,
            plantId: scope.plantId,
            limit: 100,
          }),
        []
      ),
      scope.plantId
        ? safeRead(() => this.storageProvider?.getPlantOperations?.(scope.plantId!), [] as PlantOperation[])
        : Promise.resolve([] as PlantOperation[]),
      scope.fieldRowId
        ? safeRead(
            () => this.storageProvider?.getFieldRowOperations?.(scope.fieldRowId!, scope.gardenId),
            [] as PlantOperation[]
          )
        : Promise.resolve([] as PlantOperation[]),
      this.getEvents(scope.gardenId),
      getAgronomicDecisionLedgerEntries(this.storageProvider, scope.gardenId),
      getAgronomicQueueOutcomeRecords(this.storageProvider, scope.gardenId),
    ])

    const taskHistory = filterScoped(allTasks, scope, plant)
    const wateringLogs = filterScoped(allWateringLogs as unknown as Record<string, any>[], scope, plant) as WateringLog[]
    const treatments = filterScoped(allTreatments as unknown as Record<string, any>[], scope, plant) as TreatmentRecordDB[]
    const fertilizerApplications = filterScoped(
      allFertilizerApplications as unknown as Record<string, any>[],
      scope,
      plant
    ) as FertilizerApplicationLogDB[]
    const mechanicalWorks = filterScoped(
      allMechanicalWorks as unknown as Record<string, any>[],
      scope,
      plant
    ) as MechanicalWorkRecord[]
    const healthAlerts = filterScoped(allHealthAlerts as unknown as Record<string, any>[], scope, plant) as HealthAlert[]
    const harvestLogs = filterScoped(allHarvestLogs as unknown as Record<string, any>[], scope, plant) as HarvestLogData[]
    const scopedEvents = filterScoped(memoryEvents as unknown as Record<string, any>[], scope, plant) as UnifiedAgronomicMemoryEvent[]
    const scopedDecisionLedger = filterScoped(
      decisionLedger as unknown as Record<string, any>[],
      scope,
      plant
    ) as AgronomicDecisionLedgerEntry[]
    const scopedQueueOutcomes = filterScoped(
      queueOutcomes as unknown as Record<string, any>[],
      scope,
      plant
    ) as AgronomicQueueOutcomeRecord[]
    const scopedPlantOperations = [...plantOperations, ...fieldRowOperations]

    const dateSignals = [
      ...taskHistory.map((task) => task.completedAt || task.actualCompletedDate || task.date),
      ...wateringLogs.map((log: any) => log.date || log.wateringDate || log.createdAt),
      ...treatments.map((treatment: any) => treatment.treatment_date || treatment.date || treatment.created_at),
      ...fertilizerApplications.map((entry: any) => entry.applicationDate || entry.application_date || entry.createdAt),
      ...mechanicalWorks.map((work: any) => work.workDate || work.work_date || work.created_at),
      ...healthAlerts.map((alert) => alert.createdAt || alert.updatedAt),
      ...harvestLogs.map((log: any) => log.harvestDate || log.date || log.createdAt),
      ...scopedEvents.map((event) => event.occurredAt),
      ...scopedQueueOutcomes.map((outcome) => outcome.completedAt),
    ]

    const missingSections = this.resolveMissingSections(scope, {
      garden,
      zone,
      fieldRow,
      plant,
      taskHistory,
      treatmentCount:
        wateringLogs.length +
        treatments.length +
        fertilizerApplications.length +
        mechanicalWorks.length +
        scopedPlantOperations.length,
      healthAlerts,
      harvestLogs,
      decisionLedger: scopedDecisionLedger,
      queueOutcomes: scopedQueueOutcomes,
    })

    const derivedSignals = this.buildDerivedSignals(scope, {
      taskHistory,
      healthAlerts,
      latestOperationAt: latestDate(dateSignals),
      latestOutcomeAt: latestDate([
        ...harvestLogs.map((log: any) => log.harvestDate || log.date || log.createdAt),
        ...scopedQueueOutcomes.map((outcome) => outcome.completedAt),
        ...qualityResults.map((result) => result.recordedAt || result.createdAt),
      ]),
    })

    return {
      scope,
      gardenProfile: garden,
      zoneProfile: zone,
      fieldRowProfile: fieldRow,
      plantProfile: plant,
      weatherHistoryAndForecast: {
        wateringLogs,
        phenologyObservations,
        qualityResults,
      },
      soilAndExposureContext: {
        soilType: zone?.soilType || garden?.soilType,
        soilPh: garden?.soilPh,
        sunExposure: zone?.sunExposure || garden?.sunExposure,
        dailySunHours: garden?.dailySunHours,
        altitudeMeters: garden?.altitudeMeters,
        fieldRowOrientation: fieldRow?.orientation,
      },
      lifecycleState: {
        plantingBatches,
        currentStage: plant?.stage || taskHistory.find((task) => task.stage)?.stage,
        latestPlantingDate: latestDate([
          plant?.plantingDate,
          plant?.plantedDate,
          fieldRow?.plantedDate,
          ...plantingBatches.map((batch) => batch.transplantingDate || batch.sowingDate),
        ]),
        expectedHarvestDate:
          plant?.expectedHarvestDate ||
          latestDate(plantingBatches.map((batch) => batch.expectedHarvestDate)),
      },
      taskHistory,
      treatmentHistory: {
        treatments,
        fertilizerApplications,
        wateringLogs,
        mechanicalWorks,
        plantOperations: scopedPlantOperations,
      },
      diseaseHealthHistory: {
        healthAlerts,
        plantHealthScore: plant?.healthScore,
        plantStatus: plant?.status,
      },
      outcomesAndLearningSignals: {
        harvestLogs,
        decisionLedger: scopedDecisionLedger,
        queueOutcomes: scopedQueueOutcomes,
        memoryEvents: scopedEvents,
      },
      derivedSignals,
      freshness: {
        refreshedAt: nowIso(),
        oldestRelevantRecordAt: oldestDate(dateSignals),
        newestRelevantRecordAt: latestDate(dateSignals),
        confidence: this.resolveConfidence(missingSections),
        missingSections,
      },
    }
  }

  private async getEvents(gardenId: string): Promise<UnifiedAgronomicMemoryEvent[]> {
    if (!this.storageProvider?.getAgronomicMemoryEvents) return []
    return this.storageProvider.getAgronomicMemoryEvents(gardenId)
  }

  private resolveMissingSections(scope: UnifiedAgronomicMemoryScope, input: {
    garden: unknown
    zone: unknown
    fieldRow: unknown
    plant: unknown
    taskHistory: GardenTask[]
    treatmentCount: number
    healthAlerts: HealthAlert[]
    harvestLogs: HarvestLogData[]
    decisionLedger: AgronomicDecisionLedgerEntry[]
    queueOutcomes: AgronomicQueueOutcomeRecord[]
  }): UnifiedAgronomicMemorySection[] {
    const missing: UnifiedAgronomicMemorySection[] = []
    if (!input.garden) missing.push('garden_profile')
    if (scope.type === 'zone' || scope.type === 'fieldRow' || scope.type === 'plant') {
      if (scope.zoneId && !input.zone) missing.push('zone_profile')
    }
    if (scope.type === 'fieldRow' || scope.type === 'plant') {
      if (scope.fieldRowId && !input.fieldRow) missing.push('field_row_profile')
    }
    if (scope.type === 'plant' && !input.plant) missing.push('plant_profile')
    if (input.taskHistory.length === 0) missing.push('task_history')
    if (input.treatmentCount === 0) missing.push('treatment_history')
    if (input.healthAlerts.length === 0) missing.push('disease_health_history')
    if (input.harvestLogs.length === 0 && input.decisionLedger.length === 0 && input.queueOutcomes.length === 0) {
      missing.push('outcomes_learning_signals')
    }
    return missing
  }

  private buildDerivedSignals(
    scope: UnifiedAgronomicMemoryScope,
    input: {
      taskHistory: GardenTask[]
      healthAlerts: HealthAlert[]
      latestOperationAt?: string
      latestOutcomeAt?: string
    }
  ): UnifiedAgronomicMemoryDerivedSignals {
    const inheritedContext: UnifiedAgronomicMemoryDerivedSignals['inheritedContext'] = ['garden']
    if (scope.zoneId && scope.type !== 'zone') inheritedContext.push('zone')
    if (scope.fieldRowId && scope.type === 'plant') inheritedContext.push('fieldRow')

    return {
      openTaskCount: input.taskHistory.filter((task) => !task.completed).length,
      completedTaskCount: input.taskHistory.filter((task) => task.completed).length,
      activeHealthAlertCount: input.healthAlerts.filter((alert: any) => alert.status !== 'resolved').length,
      latestOperationAt: input.latestOperationAt,
      latestOutcomeAt: input.latestOutcomeAt,
      hasScopedIdentifiers: Boolean(scope.zoneId || scope.fieldRowId || scope.plantId),
      inheritedContext,
    }
  }

  private resolveConfidence(missingSections: UnifiedAgronomicMemorySection[]): 'high' | 'medium' | 'low' {
    if (missingSections.includes('garden_profile')) {
      return 'low'
    }

    if (missingSections.length <= 2) {
      return 'high'
    }

    if (missingSections.length <= 5) {
      return 'medium'
    }

    return 'low'
  }
}

export const createUnifiedAgronomicMemoryService = (
  storageProvider: UnifiedAgronomicMemoryStorage | null | undefined
) => new UnifiedAgronomicMemoryService(storageProvider)
