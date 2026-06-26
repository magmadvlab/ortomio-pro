/**
 * DIRECTOR SERVICE - Orchestratore Predittivo Semplificato
 * 
 * Coordina i servizi esistenti e prioritizza suggerimenti AI.
 * Usa collaborativeAIService per storage e dailyDiaryService per dati.
 * 
 * @version 3.0.0 - Semplificato e funzionante
 * @date 2026-01-20
 */

import { getSupabaseClient } from '@/config/supabase'
import { getDefaultStorageProvider } from '@/packages/core/storage/factory'
import type { IStorageProvider } from '@/packages/core/storage/interface'
import { collaborativeAIService } from './collaborativeAIService'
import { dailyDiaryService } from './dailyDiaryService'
import { advancedIrrigationService } from '@/services/advancedIrrigationService'
import {
  buildAgronomicActionQueue,
  type AgronomicActionQueueItem,
  type AgronomicPhenologyQueueCandidate,
} from '@/services/agronomicActionQueueService'
import { getAgronomicMeasuredFeedbackRecords } from '@/services/agronomicMeasuredFeedbackService'
import type { AISuggestion } from '@/types/aiFeedback'
import {
  resolveAgronomicPriorityProfileSync,
  scoreAgronomicPriority,
  type AgronomicPriorityFocus,
} from '@/services/agronomicPriorityService'
import {
  buildAgronomicEconomicPrioritySummary,
  type AgronomicEconomicPrioritySummary,
} from '@/services/agronomicEconomicPriorityService'
import {
  buildAgronomicDecisionExplanation,
  type AgronomicDecisionExplanation,
} from '@/services/agronomicDecisionExplanationService'
import {
  buildAgronomicRefinedContext,
} from '@/services/agronomicRefinedContextService'
import { resolveGardenContext } from '@/services/gardenContextResolverService'
import type { EfficiencyReport } from '@/types/irrigation'
import type {
  AgronomicRefinedContext,
  AgronomicOperationalContextTag,
  AgronomicSignalKey,
  AgronomicScopeDescriptor,
} from '@/types/agronomicKernel'
import type { Garden, GardenTask, SmartDevice } from '@/types'
import { getCurrentPhenologyState } from '@/services/phenologyService'
import { plantHealthMonitoringService } from '@/services/plantHealthMonitoringService'
import { PrescriptionMapsService } from '@/services/prescriptionMapsService'
import type { PrescriptionAgronomicIntelligenceSummary } from '@/services/prescriptionAgronomicIntelligenceService'
import {
  getEnvironmentalMonitoringSnapshot,
  getPersistedGardenEnvironmentalHistorySummary,
  getPersistedZoneEnvironmentalHistorySummary,
  type GardenEnvironmentalHistorySummary,
} from '@/services/environmentalMonitoringService'
import {
  getAgronomicDecisionLedgerEntries,
  getAgronomicDecisionLedgerSummary,
  type AgronomicDecisionLedgerEntry,
  type AgronomicDecisionLedgerSummary,
} from '@/services/agronomicDecisionLedgerService'
import {
  getHealthScopeInsights,
  type HealthScopeInsight,
} from '@/services/healthScopeService'
import {
  buildTaskExecutionUrl,
  type TaskExecutionContext,
} from '@/services/taskExecutionLaunchService'
import { generateUrgentAlerts, getDailyGardenPlan } from '@/logic/director'
import type { UrgentAlert } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

export interface PrioritizedAction {
  id: string
  type: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  urgency: number
  impact: number
  feasibility: number
  cost: number
  priorityScore: number
  suggestedDate?: Date
  dependencies: string[]
  source: 'ai_suggestion' | 'diary_event' | 'harvest_recommendation'
  sourceId?: string
  reasoning?: string
  confidence?: number
  agronomicProfileId?: string
  operationalContextTags?: AgronomicOperationalContextTag[]
  refinedContext?: AgronomicRefinedContext | null
  priorityConfidence?: number
  missingSignals?: AgronomicSignalKey[]
  agronomicFocus?: AgronomicPriorityFocus
  economicSummary?: AgronomicEconomicPrioritySummary | null
  decisionExplanation?: AgronomicDecisionExplanation | null
  actionComparisonExplanation?: string | null
}

export interface DailyBriefing {
  date: Date
  gardenId: string
  gardenName?: string
  summary: string
  criticalActions: PrioritizedAction[]
  transversalQueue: AgronomicActionQueueItem[]
  weatherSummary: {
    temp_min?: number
    temp_max?: number
    precipitation_mm?: number
    conditions?: string
  }
  agronomicInsights: {
    gdd_base_10?: number
    heat_stress_hours?: number
    water_stress_index?: number
    photoperiod_hours?: number
  }
  environmentalSummary?: {
    weatherSourceClass?: string
    weatherPrimarySource?: string
    weatherSignalQuality?: string
    weatherRegionalConfidence?: string
    weatherLocalConfidence?: string
    sensorPrecedence?: string
    sensorSignals?: string[]
    soilWaterStressLevel?: string
    circulationNotes?: string[]
    siteBindingNotes?: string[]
    recentHighDiseasePressureDays?: number
    recentHighSoilWaterStressDays?: number
    recentLowDryingPowerDays?: number
  }
  lunarPhase?: {
    phase?: string
    favorable_for?: string[]
  }
  recommendations: string[]
  stats: {
    totalSuggestions: number
    criticalCount: number
    highCount: number
    avgConfidence: number
  }
}

export type DirectorScopeDescriptor = AgronomicScopeDescriptor

export interface DirectorPlannerQueueContext {
  gardenId: string
  date: Date
  queue: AgronomicActionQueueItem[]
  criticalActions: PrioritizedAction[]
  recommendations: string[]
  environmentalSummary?: DailyBriefing['environmentalSummary']
  stats: DailyBriefing['stats']
}

export interface DirectorChatContext {
  scope: DirectorScopeDescriptor
  currentPriorities: Array<{
    id: string
    title: string
    focus: AgronomicPriorityFocus
    urgencyLabel: AgronomicActionQueueItem['urgencyLabel']
    priorityScore: number
    scopeLabel?: string
  }>
  criticalActions: Array<Pick<PrioritizedAction, 'id' | 'title' | 'type' | 'priorityScore' | 'reasoning'>>
  missingSignals: AgronomicSignalKey[]
  routingHints: Array<{
    queueItemId: string
    suggestedAction: string
    route?: string
  }>
  decisionExplanations: Array<{
    queueItemId: string
    explanation: AgronomicDecisionExplanation
  }>
}

export interface DirectorHealthSupportContext {
  gardenId: string
  insights: HealthScopeInsight[]
  queueItems: AgronomicActionQueueItem[]
}

export interface DirectorExecutionLaunchContext {
  gardenId: string
  tasks: Array<{
    taskId: string
    taskType: string
    plantName: string
    url: string
    context: TaskExecutionContext
  }>
}

export interface DirectorDecisionMemoryContext {
  gardenId: string
  summary: AgronomicDecisionLedgerSummary
  entries: AgronomicDecisionLedgerEntry[]
}

export interface DirectorFieldRowInsights {
  scope: DirectorScopeDescriptor
  lifecyclePhase: string
  seasonalAdvice: string[]
  lunarTiming: string
  weatherAlerts: string[]
}

// ============================================================================
// DIRECTOR SERVICE
// ============================================================================

class DirectorService {
  private storageProvider: IStorageProvider | null = null
  
  private getClient() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available')
    }
    return client
  }

  private getStorageProvider(): IStorageProvider {
    if (!this.storageProvider) {
      this.storageProvider = getDefaultStorageProvider()
    }

    return this.storageProvider
  }
  
  // --------------------------------------------------------------------------
  // DAILY BRIEFING - Funzione principale
  // --------------------------------------------------------------------------
  
  /**
   * Genera briefing giornaliero orchestrato
   */
  async getDailyBriefing(userId: string, gardenId: string): Promise<DailyBriefing> {
    try {
      const today = new Date()
      
      // 1. Ottieni dati dal diario automatico
      const diaryEntry = await dailyDiaryService.getDailyEntry(gardenId, today)
      const [environmentalSummary, environmentalHistorySummary] = await Promise.all([
        getEnvironmentalMonitoringSnapshot({
          userId,
          gardenId,
          date: today,
        }).catch(() => null),
        this.getGardenEnvironmentalHistorySummary(userId, gardenId, today),
      ])
      
      // 2. Ottieni suggerimenti AI attivi
      const [suggestions, gardenForContext] = await Promise.all([
        collaborativeAIService.getActiveSuggestions(userId, gardenId),
        resolveGardenContext(this.getStorageProvider(), gardenId).then((resolved) => resolved?.garden || null),
      ])
      
      // 3. Converti in azioni e prioritizza con contratto agronomico condiviso
      const actions = suggestions
        .map((suggestion) => this.suggestionToAction(suggestion, gardenForContext))
        .sort((left, right) => right.priorityScore - left.priorityScore)
      const transversalQueue = await this.buildTransversalQueue(userId, gardenId, actions)
      
      // 5. Filtra azioni critiche
      const criticalActions = actions.filter(a => 
        a.type === 'CRITICAL' || a.type === 'HIGH'
      ).slice(0, 5)
      
      // 6. Genera raccomandazioni testuali
      const recommendations = this.generateRecommendations(
        diaryEntry,
        criticalActions,
        environmentalHistorySummary
      )
      
      // 7. Calcola statistiche
      const stats = {
        totalSuggestions: suggestions.length,
        criticalCount: actions.filter(a => a.type === 'CRITICAL').length,
        highCount: actions.filter(a => a.type === 'HIGH').length,
        avgConfidence: suggestions.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / suggestions.length || 0
      }
      
      // 8. Genera summary
      const summary = this.generateSummary(diaryEntry, criticalActions, stats)
      
      // 9. Estrai dati meteo e agronomici
      const weatherSummary = diaryEntry?.weather ? {
        temp_min: diaryEntry.weather.temp_min,
        temp_max: diaryEntry.weather.temp_max,
        precipitation_mm: diaryEntry.weather.precipitation_mm,
        conditions: diaryEntry.weather.weather_conditions
      } : {}
      
      const agronomicInsights = diaryEntry?.tracking?.[0] ? {
        gdd_base_10: diaryEntry.tracking[0].daily_gdd,
        heat_stress_hours: diaryEntry.tracking[0].heat_stress_index,
        water_stress_index: diaryEntry.tracking[0].water_stress_index,
        photoperiod_hours: 0 // TODO: calcolare
      } : {}
      
      return {
        date: today,
        gardenId,
        summary,
        criticalActions,
        transversalQueue,
        weatherSummary,
        agronomicInsights,
        environmentalSummary: environmentalSummary
          ? {
              weatherSourceClass: environmentalSummary.weather.sourceClass,
              weatherPrimarySource: environmentalSummary.weather.primarySource,
              weatherSignalQuality: environmentalSummary.weather.signalQuality,
              weatherRegionalConfidence: environmentalSummary.weather.regionalConfidence,
              weatherLocalConfidence: environmentalSummary.weather.localConfidence,
              sensorPrecedence: environmentalSummary.sensors.precedence,
              sensorSignals: environmentalSummary.sensors.availableSignals,
              soilWaterStressLevel: environmentalSummary.soilWater.stressLevel,
              circulationNotes: environmentalSummary.circulation.notes,
              siteBindingNotes: environmentalSummary.weather.siteBinding?.notes,
              recentHighDiseasePressureDays:
                environmentalHistorySummary?.highDiseasePressureDays,
              recentHighSoilWaterStressDays:
                environmentalHistorySummary?.highSoilWaterStressDays,
              recentLowDryingPowerDays:
                environmentalHistorySummary?.lowDryingPowerDays,
            }
          : undefined,
        lunarPhase: undefined, // TODO: aggiungere calcolo fase lunare
        recommendations,
        stats
      }
      
    } catch (error) {
      console.error('Error generating daily briefing:', error)
      throw error
    }
  }

  async getPlannerQueueContext(
    userId: string,
    gardenId: string
  ): Promise<DirectorPlannerQueueContext> {
    const briefing = await this.getDailyBriefing(userId, gardenId)

    return {
      gardenId,
      date: briefing.date,
      queue: briefing.transversalQueue,
      criticalActions: briefing.criticalActions,
      recommendations: briefing.recommendations,
      environmentalSummary: briefing.environmentalSummary,
      stats: briefing.stats,
    }
  }

  async getChatContext(userId: string, gardenId: string): Promise<DirectorChatContext> {
    const briefing = await this.getDailyBriefing(userId, gardenId)
    const missingSignals = Array.from(
      new Set(briefing.transversalQueue.flatMap((item) => item.missingSignals || []))
    )

    return {
      scope: {
        primaryScope: 'site',
        gardenId,
        gardenName: briefing.gardenName,
      },
      currentPriorities: briefing.transversalQueue.slice(0, 5).map((item) => ({
        id: item.id,
        title: item.title,
        focus: item.focus,
        urgencyLabel: item.urgencyLabel,
        priorityScore: item.priorityScore,
        scopeLabel: item.scopeLabel,
      })),
      criticalActions: briefing.criticalActions.slice(0, 5).map((action) => ({
        id: action.id,
        title: action.title,
        type: action.type,
        priorityScore: action.priorityScore,
        reasoning: action.reasoning,
      })),
      missingSignals,
      routingHints: briefing.transversalQueue.slice(0, 5).map((item) => ({
        queueItemId: item.id,
        suggestedAction: item.urgencyLabel === 'immediate' ? 'review-now' : 'review-in-planner',
        route: '/app/planner',
      })),
      decisionExplanations: briefing.transversalQueue
        .filter((item) => item.metadata?.decisionExplanation)
        .slice(0, 5)
        .map((item) => ({
          queueItemId: item.id,
          explanation: item.metadata!.decisionExplanation as AgronomicDecisionExplanation,
        })),
    }
  }

  async getHealthSupportContext(
    userId: string,
    gardenId: string
  ): Promise<DirectorHealthSupportContext> {
    const storageProvider = this.getStorageProvider()
    const [resolvedGardenContext, tasks, briefing] = await Promise.all([
      resolveGardenContext(storageProvider, gardenId),
      storageProvider.getTasks(gardenId).catch(() => []),
      this.getDailyBriefing(userId, gardenId),
    ])
    const insights = resolvedGardenContext?.garden
      ? await getHealthScopeInsights(resolvedGardenContext.garden, tasks, storageProvider).catch(() => [])
      : []

    return {
      gardenId,
      insights,
      queueItems: briefing.transversalQueue.filter(
        (item) => item.source === 'health' || item.focus === 'health'
      ),
    }
  }

  async getExecutionLaunchContext(gardenId: string): Promise<DirectorExecutionLaunchContext> {
    const storageProvider = this.getStorageProvider()
    const tasks = await storageProvider.getTasks(gardenId).catch(() => [])

    return {
      gardenId,
      tasks: tasks.filter((task) => !task.completed).reduce<DirectorExecutionLaunchContext['tasks']>(
        (launchTasks, task) => {
          const url = buildTaskExecutionUrl(task)
          if (!url) {
            return launchTasks
          }

          const route = url.startsWith('/app/nutrition')
            ? 'nutrition'
            : url.startsWith('/app/irrigation')
              ? 'irrigation'
              : url.startsWith('/app/harvest')
                ? 'harvest'
                : 'mechanical-work'

          launchTasks.push({
            taskId: task.id,
            taskType: String(task.taskType),
            plantName: task.plantName,
            url,
            context: {
              route,
              sourceTaskId: task.id,
              taskType: task.taskType,
              plantName: task.plantName,
              zoneId: task.zoneId,
              rowId: task.rowId,
              rowNumber: typeof task.rowNumber === 'number' ? String(task.rowNumber) : undefined,
              date: task.nextDueDate || task.date,
            },
          })

          return launchTasks
        },
        []
      ),
    }
  }

  async getDecisionMemoryContext(gardenId: string): Promise<DirectorDecisionMemoryContext> {
    const storageProvider = this.getStorageProvider()
    const [summary, entries] = await Promise.all([
      getAgronomicDecisionLedgerSummary(storageProvider, gardenId),
      getAgronomicDecisionLedgerEntries(storageProvider, gardenId, { limit: 10 }),
    ])

    return {
      gardenId,
      summary,
      entries,
    }
  }

  async getLegacyDailyPlanBridge(
    ...args: Parameters<typeof getDailyGardenPlan>
  ): ReturnType<typeof getDailyGardenPlan> {
    return getDailyGardenPlan(...args)
  }

  async getOperationalDailyPlan(
    ...args: Parameters<typeof getDailyGardenPlan>
  ): ReturnType<typeof getDailyGardenPlan> {
    const plan = await this.getLegacyDailyPlanBridge(...args)
    return this.normalizeLegacyDailyPlanShape(plan)
  }

  async getUrgentWeatherAlerts(garden: Garden, currentDate: Date = new Date()): Promise<UrgentAlert[]> {
    return generateUrgentAlerts(garden, currentDate)
  }

  async getFieldRowDirectorInsights(input: {
    garden: Garden
    tasks: GardenTask[]
    fieldRow: {
      id: string
      name?: string
      zoneId?: string
      cultivar?: string
    }
    currentDate?: Date
    storageProvider?: unknown
  }): Promise<DirectorFieldRowInsights> {
    const dailyPlan = await this.getOperationalDailyPlan(
      input.garden,
      input.tasks,
      input.currentDate || new Date(),
      undefined,
      undefined,
      undefined,
      input.storageProvider
    )
    const cultivar = input.fieldRow.cultivar?.toLowerCase()
    const relevantLifecycleTasks = (dailyPlan.lifecycleTasks || []).filter((task) =>
      cultivar ? task.plantName?.toLowerCase().includes(cultivar) : false
    )

    return {
      scope: {
        primaryScope: 'row',
        gardenId: input.garden.id,
        gardenName: input.garden.name,
        zoneId: input.fieldRow.zoneId,
        rowId: input.fieldRow.id,
        fieldRowId: input.fieldRow.id,
        rowName: input.fieldRow.name,
        plantName: input.fieldRow.cultivar,
      },
      lifecyclePhase:
        relevantLifecycleTasks.length > 0 ? relevantLifecycleTasks[0].phase : 'Fase non determinata',
      seasonalAdvice: (dailyPlan.baselinePrompts || []).slice(0, 3).map((prompt) => prompt.title),
      lunarTiming: dailyPlan.lunarAdvice
        ? `${dailyPlan.lunarAdvice.phaseName}: ${dailyPlan.lunarAdvice.advice}`
        : 'Informazioni lunari non disponibili',
      weatherAlerts: (dailyPlan.climateWarnings || []).slice(0, 2).map((warning) => warning.message),
    }
  }

  private normalizeLegacyDailyPlanShape(plan: Awaited<ReturnType<typeof getDailyGardenPlan>>) {
    return {
      ...plan,
      urgentAlerts: Array.isArray((plan as any)?.urgentAlerts) ? (plan as any).urgentAlerts : [],
      climateWarnings: Array.isArray((plan as any)?.climateWarnings) ? (plan as any).climateWarnings : [],
      lifecycleTasks: Array.isArray((plan as any)?.lifecycleTasks) ? (plan as any).lifecycleTasks : [],
      nutrientTasks: Array.isArray((plan as any)?.nutrientTasks) ? (plan as any).nutrientTasks : [],
      healthTasks: Array.isArray((plan as any)?.healthTasks) ? (plan as any).healthTasks : [],
      baselinePrompts: Array.isArray((plan as any)?.baselinePrompts) ? (plan as any).baselinePrompts : [],
      irrigationTasks: Array.isArray((plan as any)?.irrigationTasks) ? (plan as any).irrigationTasks : [],
    }
  }
  
  // --------------------------------------------------------------------------
  // PRIORITIZATION
  // --------------------------------------------------------------------------
  
  /**
   * Prioritizza suggerimenti usando confidence_score e action_priority
   */
  private async prioritizeSuggestions(suggestions: AISuggestion[]): Promise<AISuggestion[]> {
    return suggestions
      .sort((a, b) => {
        // Prima per priorità azione, poi per confidence
        const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
        const aPriority = priorityOrder[a.action_priority] || 0
        const bPriority = priorityOrder[b.action_priority] || 0
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }
        
        return (b.confidence_score || 0) - (a.confidence_score || 0)
      })
  }
  
  /**
   * Converti suggerimento AI in azione prioritizzata
   */
  private suggestionToAction(suggestion: AISuggestion, garden?: Garden | null): PrioritizedAction {
    // Calcola score basato su priorità, confidenza e copertura agronomica
    const priorityScores = { CRITICAL: 100, HIGH: 75, MEDIUM: 50, LOW: 25 }
    const baseScore = priorityScores[suggestion.action_priority] || 50
    const agronomicFocus = this.getAgronomicFocusFromSuggestion(suggestion)
    const resolvedAgronomicProfile = resolveAgronomicPriorityProfileSync({
      hints: [
        suggestion.context,
        suggestion.title,
        suggestion.description,
        suggestion.metadata?.plantName,
        suggestion.metadata?.cropName,
        suggestion.metadata?.gardenType,
      ],
      fallbackProfileId: this.getFallbackAgronomicProfileIdFromSuggestion(suggestion),
    })
    const refinedContextResult = buildAgronomicRefinedContext({
      cropProfile: resolvedAgronomicProfile?.profile,
      textValues: [
        suggestion.context,
        suggestion.title,
        suggestion.description,
        suggestion.metadata?.plantName,
        suggestion.metadata?.cropName,
        suggestion.metadata?.gardenType,
        garden?.name,
        garden?.primaryCrop?.canonicalPlantName,
        garden?.primaryCrop?.label,
        garden?.primaryCrop?.cropType,
        garden?.gardenType,
        garden?.soilType,
        garden?.sunExposure,
        garden?.aspectDirection,
        garden?.windProtection,
      ],
      cultivarId: suggestion.metadata?.cultivarId || suggestion.metadata?.varietyId,
      cultivarLabel:
        suggestion.metadata?.cultivar ||
        suggestion.metadata?.variety ||
        suggestion.metadata?.cropVariety,
      speciesLabel:
        suggestion.metadata?.plantName ||
        suggestion.metadata?.cropName ||
        suggestion.context,
      productionIntent: suggestion.metadata?.varietyType,
      gardenType: suggestion.metadata?.gardenType || garden?.gardenType,
      cultivationSystem: suggestion.metadata?.cultivationSystem,
      irrigationMode: suggestion.metadata?.irrigationMode,
      trainingSystem: suggestion.metadata?.trainingSystem,
      rootstock: suggestion.metadata?.rootstock,
      altitudeMeters: suggestion.metadata?.altitudeMeters ?? garden?.altitudeMeters,
      slopePercentage: suggestion.metadata?.slopePercentage,
      dailySunHours: garden?.dailySunHours,
      sunExposure: suggestion.metadata?.sunExposure || garden?.sunExposure,
      aspectDirection: garden?.aspectDirection,
      windProtection: garden?.windProtection,
      soilType: suggestion.metadata?.soilType || garden?.soilType,
      soilPh: garden?.soilPh,
      terroir: suggestion.metadata?.terroir,
      shadowObstaclesCount: Array.isArray(garden?.obstacles) ? garden.obstacles.length : undefined,
    })
    const operationalContextTags = refinedContextResult.operationalContextTags
    const economicSummary = buildAgronomicEconomicPrioritySummary({
      source: 'director',
      focus: agronomicFocus,
      priorityScore: baseScore,
      priorityConfidence: suggestion.confidence_score || suggestion.prediction_data?.confidence || 0.5,
      agronomicProfileId: resolvedAgronomicProfile?.profile.id,
      operationalContextTags,
      refinedContext: refinedContextResult.refinedContext,
      cropNameHint:
        suggestion.metadata?.plantName ||
        suggestion.metadata?.cropName ||
        suggestion.context ||
        suggestion.title,
    })
    const priorityResult = scoreAgronomicPriority({
      baseScore,
      confidence: suggestion.confidence_score || suggestion.prediction_data?.confidence || 0.5,
      resolvedProfile: resolvedAgronomicProfile,
      focus: agronomicFocus,
      availableSignals: this.getAvailableSignalsFromSuggestion(suggestion),
      economicSummary,
      refinedContext: refinedContextResult.refinedContext,
    })
    const decisionExplanation = buildAgronomicDecisionExplanation({
      source: 'director',
      focus: agronomicFocus,
      priorityResult,
      urgencyLabel:
        priorityResult.economicSummary?.actionComparison?.recommendedUrgencyLabel || undefined,
      resolvedProfile: resolvedAgronomicProfile,
      availableSignals: this.getAvailableSignalsFromSuggestion(suggestion),
      isCriticalStage: suggestion.action_priority === 'CRITICAL',
      refinedContext: refinedContextResult.refinedContext,
    })
    
    return {
      id: suggestion.id,
      type: suggestion.action_priority as any || 'MEDIUM',
      title: suggestion.title,
      description: suggestion.description || '',
      urgency: priorityResult.score,
      impact: suggestion.confidence_score * 100,
      feasibility: 80, // Default
      cost: economicSummary.estimatedInterventionCost || 50,
      priorityScore: priorityResult.score,
      dependencies: [],
      source: 'ai_suggestion',
      sourceId: suggestion.id,
      reasoning: [suggestion.reasoning, economicSummary.actionComparison?.explanation]
        .filter(Boolean)
        .join(' '),
      confidence: suggestion.confidence_score,
      agronomicProfileId: resolvedAgronomicProfile?.profile.id,
      operationalContextTags,
      refinedContext: refinedContextResult.refinedContext,
      priorityConfidence: priorityResult.confidence,
      missingSignals: priorityResult.signalCoverage.missingP0Signals,
      agronomicFocus,
      economicSummary,
      decisionExplanation,
      actionComparisonExplanation: economicSummary.actionComparison?.explanation || null,
    }
  }

  private getAgronomicFocusFromSuggestion(suggestion: AISuggestion): AgronomicPriorityFocus {
    switch (suggestion.suggestion_type) {
      case 'IRRIGATION':
        return 'water'
      case 'FERTILIZATION':
      case 'PLANTING_PLAN':
      case 'ROTATION_PLAN':
        return 'nutrition'
      case 'HARVEST_TIMING':
      case 'YIELD_OPTIMIZATION':
        return 'quality'
      case 'DISEASE_PREVENTION':
      case 'TREATMENT':
      case 'RESOURCE_SAVING':
      default:
        return 'health'
    }
  }

  private getFallbackAgronomicProfileIdFromSuggestion(suggestion: AISuggestion): string | null {
    const haystack = [
      suggestion.context,
      suggestion.title,
      suggestion.description,
      suggestion.metadata?.gardenType,
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' ')
      .toLowerCase()

    if (haystack.includes('vigneto') || haystack.includes('vineyard')) {
      return 'vineyard_quality'
    }

    if (haystack.includes('oliveto') || haystack.includes('olive')) {
      return 'olive_grove_oil'
    }

    if (haystack.includes('frutteto') || haystack.includes('orchard')) {
      return 'orchard_generic'
    }

    if (
      haystack.includes('serra') ||
      haystack.includes('greenhouse') ||
      haystack.includes('hydroponic') ||
      haystack.includes('aquaponic') ||
      haystack.includes('aeroponic')
    ) {
      return 'controlled_environment_leafy'
    }

    return null
  }

  private getAvailableSignalsFromSuggestion(suggestion: AISuggestion): Set<AgronomicSignalKey> {
    const signals = new Set<AgronomicSignalKey>()

    for (const source of suggestion.data_sources || []) {
      switch (source.type) {
        case 'weather':
          signals.add('weather_current')
          signals.add('weather_forecast')
          signals.add('rain_gauge_local')
          break
        case 'soil':
          signals.add('soil_moisture_30cm')
          signals.add('soil_tension_kpa')
          break
        case 'plant_health':
          signals.add('leaf_wetness')
          signals.add('canopy_temperature')
          signals.add('phenology_observation')
          break
        case 'historical':
          signals.add('operation_ledger')
          signals.add('quality_result')
          break
        case 'market_data':
          signals.add('quality_result')
          break
        case 'local_sensor':
          signals.add('flow_rate_actual')
          signals.add('line_pressure')
          signals.add('ndvi')
          signals.add('satellite_vigor')
          break
        case 'user_observation':
          signals.add('phenology_observation')
          signals.add('canopy_temperature')
          break
        case 'satellite':
          signals.add('ndvi')
          signals.add('satellite_vigor')
          break
        case 'irrigation_meter':
          signals.add('flow_rate_actual')
          signals.add('line_pressure')
          break
        default:
          break
      }
    }

    if (suggestion.suggestion_type === 'IRRIGATION') {
      signals.add('operation_ledger')
    }

    return signals
  }

  private async buildTransversalQueue(
    userId: string,
    gardenId: string,
    directorActions: PrioritizedAction[]
  ): Promise<AgronomicActionQueueItem[]> {
    const storageProvider = this.getStorageProvider()
    const [garden, tasks, devices, prescriptionSummary, irrigationReports, measuredFeedbackRecords] = await Promise.all([
      storageProvider.getGarden(gardenId).catch(() => null),
      storageProvider.getTasks(gardenId).catch(() => [] as GardenTask[]),
      storageProvider.getDevices(gardenId).catch(() => [] as SmartDevice[]),
      this.getLatestPrescriptionSummary(storageProvider, gardenId),
      this.getIrrigationReports(storageProvider, gardenId),
      getAgronomicMeasuredFeedbackRecords(storageProvider, gardenId).catch(() => []),
    ])
    const environmentalSummariesByZone = await this.getEnvironmentalSummariesByZone(
      userId,
      irrigationReports,
      prescriptionSummary
    )

    if (!garden) {
      return buildAgronomicActionQueue({
        directorActions,
        irrigationReports,
        prescriptionSummary,
        measuredFeedbackRecords,
        environmentalSummariesByZone,
      }).slice(0, 12)
    }

    const dominantCropName = this.getDominantCropName(tasks)
    const [healthAlerts, phenologyCandidate] = await Promise.all([
      plantHealthMonitoringService
        .analyzeGardenHealth(garden, tasks, { devices, storageProvider })
        .catch(() => []),
      this.buildPhenologyCandidate(storageProvider, garden, dominantCropName),
    ])

    return buildAgronomicActionQueue({
      healthAlerts,
      irrigationReports,
      prescriptionSummary,
      directorActions,
      phenologyCandidates: phenologyCandidate ? [phenologyCandidate] : [],
      measuredFeedbackRecords,
      environmentalSummariesByZone,
    }).slice(0, 12)
  }

  private async getEnvironmentalSummariesByZone(
    userId: string,
    irrigationReports: EfficiencyReport[],
    prescriptionSummary: PrescriptionAgronomicIntelligenceSummary | null
  ): Promise<Record<string, Awaited<ReturnType<typeof getPersistedZoneEnvironmentalHistorySummary>>>> {
    const today = new Date().toISOString().split('T')[0]
    const startDate = new Date(`${today}T12:00:00.000Z`)
    startDate.setDate(startDate.getDate() - 6)

    const zoneIds = Array.from(
      new Set([
        ...irrigationReports.map((report) => report.zoneId).filter(Boolean),
        ...(prescriptionSummary?.operationalPriorities || []).map((priority) => priority.zoneId).filter(Boolean),
      ])
    )

    if (zoneIds.length === 0) {
      return {}
    }

    const summaries = await Promise.all(
      zoneIds.map(async (zoneId) => ({
        zoneId,
        summary: await getPersistedZoneEnvironmentalHistorySummary({
          userId,
          zoneId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: today,
        }).catch(() => null),
      }))
    )

    return Object.fromEntries(
      summaries.map((entry) => [entry.zoneId, entry.summary])
    )
  }

  private async getLatestPrescriptionSummary(
    storageProvider: IStorageProvider,
    gardenId: string
  ): Promise<PrescriptionAgronomicIntelligenceSummary | null> {
    if (typeof storageProvider.getPrescriptionMaps !== 'function') {
      return null
    }

    const maps = await storageProvider.getPrescriptionMaps(gardenId).catch(() => [])
    const latestMap = [...maps].sort(
      (left, right) =>
        new Date(right.generationDate).getTime() - new Date(left.generationDate).getTime()
    )[0]

    if (!latestMap) {
      return null
    }

    return new PrescriptionMapsService(storageProvider)
      .getPrescriptionAgronomicIntelligenceSummary(latestMap)
      .catch(() => null)
  }

  private async getIrrigationReports(
    storageProvider: IStorageProvider,
    gardenId: string
  ) {
    const zones = await storageProvider.getIrrigationZones(undefined, gardenId).catch(() => [])
    const reports = await Promise.allSettled(
      zones.slice(0, 4).map((zone) =>
        advancedIrrigationService.getIrrigationEfficiencyReport(zone.id, 'month', {
          cropName: zone.name,
        })
      )
    )

    return reports
      .filter(
        (result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof advancedIrrigationService.getIrrigationEfficiencyReport>>> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value)
      .sort((left, right) => (right.priorityScore || 0) - (left.priorityScore || 0))
  }

  private async buildPhenologyCandidate(
    storageProvider: IStorageProvider,
    garden: Garden,
    dominantCropName?: string
  ): Promise<AgronomicPhenologyQueueCandidate | null> {
    const phenology = await getCurrentPhenologyState(storageProvider, garden, {}, {
      cropName: dominantCropName,
    }).catch(() => null)

    if (!phenology) {
      return null
    }

    const normalizedStageKey = phenology.stageKey.toLowerCase()
    const isDecisionCriticalStage =
      normalizedStageKey.includes('flower') ||
      normalizedStageKey.includes('anthesis') ||
      normalizedStageKey.includes('fruit') ||
      normalizedStageKey.includes('harvest') ||
      normalizedStageKey.includes('grain')
    const resolvedAgronomicProfile = resolveAgronomicPriorityProfileSync({
      hints: [
        dominantCropName,
        phenology.scopeLabel,
        garden.primaryCrop?.canonicalPlantName,
        garden.primaryCrop?.label,
        garden.primaryCrop?.cropType,
        garden.gardenType,
      ],
      fallbackProfileId: phenology.profileId,
    })
    const refinedContextResult = buildAgronomicRefinedContext({
      cropProfile: resolvedAgronomicProfile?.profile,
      textValues: [
        dominantCropName,
        phenology.scopeLabel,
        garden.primaryCrop?.canonicalPlantName,
        garden.primaryCrop?.label,
        garden.primaryCrop?.cropType,
        garden.gardenType,
      ],
      speciesLabel:
        dominantCropName ||
        garden.primaryCrop?.canonicalPlantName ||
        garden.primaryCrop?.label,
      gardenType: garden.gardenType,
      altitudeMeters: garden.altitudeMeters,
      sunExposure: garden.sunExposure,
      soilType: garden.soilType,
    })

    return {
      id: `${garden.id}:${phenology.stageKey}`,
      title: dominantCropName
        ? `Verifica fase fenologica ${dominantCropName}`
        : 'Verifica fase fenologica',
      stageKey: phenology.stageKey,
      stageLabel: phenology.stageLabel,
      scopeLabel: phenology.scopeLabel,
      confidence: phenology.confidence,
      profileId: phenology.profileId,
      source: phenology.source,
      cropNameHint: dominantCropName,
      availableSignals:
        phenology.source === 'observation'
          ? (['phenology_observation'] satisfies AgronomicSignalKey[])
          : [],
      isDecisionCriticalStage,
      refinedContext: refinedContextResult.refinedContext,
    }
  }

  private getDominantCropName(tasks: GardenTask[]): string | undefined {
    const counts = new Map<string, number>()

    for (const task of tasks) {
      const plantName = task.plantName?.trim()
      if (!plantName) {
        continue
      }

      counts.set(plantName, (counts.get(plantName) || 0) + 1)
    }

    return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0]
  }
  
  // --------------------------------------------------------------------------
  // RECOMMENDATIONS GENERATOR
  // --------------------------------------------------------------------------
  
  /**
   * Genera raccomandazioni testuali basate su dati
   */
  private generateRecommendations(
    diaryEntry: any,
    actions: PrioritizedAction[],
    environmentalHistorySummary?: GardenEnvironmentalHistorySummary | null
  ): string[] {
    const recommendations: string[] = []
    
    // Raccomandazioni meteo
    if (diaryEntry?.weather_data) {
      const weather = diaryEntry.weather_data
      
      if (weather.precipitation_mm > 20) {
        recommendations.push('⛈️ Pioggia abbondante prevista: evita irrigazioni e trattamenti')
      }
      
      if (weather.temp_max > 35) {
        recommendations.push('🌡️ Temperature elevate: aumenta frequenza irrigazioni')
      }
      
      if (weather.temp_min < 5) {
        recommendations.push('❄️ Rischio gelate: proteggi piante sensibili')
      }
    }
    
    // Raccomandazioni agronomiche
    if (diaryEntry?.agronomic_data) {
      const agro = diaryEntry.agronomic_data
      
      if (agro.heat_stress_hours > 4) {
        recommendations.push('🔥 Stress termico rilevato: ombreggia piante sensibili')
      }
      
      if (agro.water_stress_index > 0.7) {
        recommendations.push('💧 Stress idrico elevato: irrigazione urgente necessaria')
      }
      
      if (agro.gdd_base_10 > 100) {
        recommendations.push('📈 Accumulo GDD significativo: monitora sviluppo colture')
      }
    }

    if (environmentalHistorySummary) {
      if (environmentalHistorySummary.highDiseasePressureDays >= 2) {
        recommendations.push(
          '🦠 Pressione ambientale persistente: mantieni monitoraggio fungino e usa finestre asciutte per i trattamenti'
        )
      }

      if (
        environmentalHistorySummary.highSoilWaterStressDays >= 2 ||
        environmentalHistorySummary.deficitWaterBalanceDays >= 3
      ) {
        recommendations.push(
          '💧 Deficit idrico persistente: verifica uniformita irrigua e priorita le zone piu stressate'
        )
      }

      if (environmentalHistorySummary.lowDryingPowerDays >= 2) {
        recommendations.push(
          '🌫️ Bassa capacita di asciugatura negli ultimi giorni: evita interventi fogliari senza vera finestra asciutta'
        )
      }
    }
    
    // Raccomandazioni lunari
    if (diaryEntry?.lunar_phase?.favorable_for) {
      const favorable = diaryEntry.lunar_phase.favorable_for
      if (favorable.length > 0) {
        recommendations.push(`🌙 Fase lunare favorevole per: ${favorable.join(', ')}`)
      }
    }
    
    // Raccomandazioni da azioni critiche
    if (actions.length > 0) {
      recommendations.push(`⚡ ${actions.length} azioni prioritarie richiedono attenzione`)
    }
    
    return recommendations
  }

  private async getGardenEnvironmentalHistorySummary(
    userId: string,
    gardenId: string,
    date: Date
  ): Promise<GardenEnvironmentalHistorySummary | null> {
    const endDate = date.toISOString().split('T')[0]
    const startDate = new Date(date)
    startDate.setDate(startDate.getDate() - 6)

    return getPersistedGardenEnvironmentalHistorySummary({
      userId,
      gardenId,
      startDate: startDate.toISOString().split('T')[0],
      endDate,
    }).catch(() => null)
  }
  
  /**
   * Genera summary testuale
   */
  private generateSummary(
    diaryEntry: any,
    actions: PrioritizedAction[],
    stats: any
  ): string {
    const parts: string[] = []
    
    // Meteo
    if (diaryEntry?.weather_data) {
      const w = diaryEntry.weather_data
      parts.push(`Meteo: ${w.temp_min}°-${w.temp_max}°C`)
      if (w.precipitation_mm > 0) {
        parts.push(`${w.precipitation_mm}mm pioggia`)
      }
    }
    
    // Azioni
    if (stats.criticalCount > 0) {
      parts.push(`${stats.criticalCount} azioni critiche`)
    } else if (stats.highCount > 0) {
      parts.push(`${stats.highCount} azioni prioritarie`)
    } else {
      parts.push('Nessuna azione urgente')
    }
    
    return parts.join(' • ')
  }
  
  // --------------------------------------------------------------------------
  // UTILITY
  // --------------------------------------------------------------------------
  
  /**
   * Ottieni azioni urgenti (CRITICAL + HIGH)
   */
  async getUrgentActions(userId: string, gardenId?: string): Promise<PrioritizedAction[]> {
    const [suggestions, gardenForContext] = await Promise.all([
      collaborativeAIService.getActiveSuggestions(userId, gardenId),
      gardenId ? resolveGardenContext(this.getStorageProvider(), gardenId).then((resolved) => resolved?.garden || null) : Promise.resolve(null),
    ])
    const prioritized = await this.prioritizeSuggestions(suggestions)
    
    return prioritized
      .filter(s => s.action_priority === 'CRITICAL' || s.action_priority === 'HIGH')
      .map(s => this.suggestionToAction(s, gardenForContext))
      .slice(0, 10)
  }
  
  /**
   * Ottieni tutte le azioni prioritizzate
   */
  async getAllPrioritizedActions(userId: string, gardenId?: string): Promise<PrioritizedAction[]> {
    const [suggestions, gardenForContext] = await Promise.all([
      collaborativeAIService.getActiveSuggestions(userId, gardenId),
      gardenId ? resolveGardenContext(this.getStorageProvider(), gardenId).then((resolved) => resolved?.garden || null) : Promise.resolve(null),
    ])
    const prioritized = await this.prioritizeSuggestions(suggestions)
    
    return prioritized.map(s => this.suggestionToAction(s, gardenForContext))
  }
}

// Export singleton
export const directorService = new DirectorService()
export default directorService
