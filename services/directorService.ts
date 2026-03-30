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
import type { AgronomicSignalKey } from '@/types/agronomicKernel'
import type { Garden, GardenTask, SmartDevice } from '@/types'
import { getCurrentPhenologyState } from '@/services/phenologyService'
import { plantHealthMonitoringService } from '@/services/plantHealthMonitoringService'
import { PrescriptionMapsService } from '@/services/prescriptionMapsService'
import type { PrescriptionAgronomicIntelligenceSummary } from '@/services/prescriptionAgronomicIntelligenceService'

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
  priorityConfidence?: number
  missingSignals?: AgronomicSignalKey[]
  agronomicFocus?: AgronomicPriorityFocus
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
      
      // 2. Ottieni suggerimenti AI attivi
      const suggestions = await collaborativeAIService.getActiveSuggestions(userId, gardenId)
      
      // 3. Converti in azioni e prioritizza con contratto agronomico condiviso
      const actions = suggestions
        .map((suggestion) => this.suggestionToAction(suggestion))
        .sort((left, right) => right.priorityScore - left.priorityScore)
      const transversalQueue = await this.buildTransversalQueue(gardenId, actions)
      
      // 5. Filtra azioni critiche
      const criticalActions = actions.filter(a => 
        a.type === 'CRITICAL' || a.type === 'HIGH'
      ).slice(0, 5)
      
      // 6. Genera raccomandazioni testuali
      const recommendations = this.generateRecommendations(diaryEntry, criticalActions)
      
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
        lunarPhase: undefined, // TODO: aggiungere calcolo fase lunare
        recommendations,
        stats
      }
      
    } catch (error) {
      console.error('Error generating daily briefing:', error)
      throw error
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
  private suggestionToAction(suggestion: AISuggestion): PrioritizedAction {
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
    const priorityResult = scoreAgronomicPriority({
      baseScore,
      confidence: suggestion.confidence_score || suggestion.prediction_data?.confidence || 0.5,
      resolvedProfile: resolvedAgronomicProfile,
      focus: agronomicFocus,
      availableSignals: this.getAvailableSignalsFromSuggestion(suggestion),
    })
    
    return {
      id: suggestion.id,
      type: suggestion.action_priority as any || 'MEDIUM',
      title: suggestion.title,
      description: suggestion.description || '',
      urgency: priorityResult.score,
      impact: suggestion.confidence_score * 100,
      feasibility: 80, // Default
      cost: 50, // Default
      priorityScore: priorityResult.score,
      dependencies: [],
      source: 'ai_suggestion',
      sourceId: suggestion.id,
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence_score,
      agronomicProfileId: resolvedAgronomicProfile?.profile.id,
      priorityConfidence: priorityResult.confidence,
      missingSignals: priorityResult.signalCoverage.missingP0Signals,
      agronomicFocus,
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

    if (!garden) {
      return buildAgronomicActionQueue({
        directorActions,
        irrigationReports,
        prescriptionSummary,
        measuredFeedbackRecords,
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
    }).slice(0, 12)
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
    actions: PrioritizedAction[]
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
    const suggestions = await collaborativeAIService.getActiveSuggestions(userId, gardenId)
    const prioritized = await this.prioritizeSuggestions(suggestions)
    
    return prioritized
      .filter(s => s.action_priority === 'CRITICAL' || s.action_priority === 'HIGH')
      .map(s => this.suggestionToAction(s))
      .slice(0, 10)
  }
  
  /**
   * Ottieni tutte le azioni prioritizzate
   */
  async getAllPrioritizedActions(userId: string, gardenId?: string): Promise<PrioritizedAction[]> {
    const suggestions = await collaborativeAIService.getActiveSuggestions(userId, gardenId)
    const prioritized = await this.prioritizeSuggestions(suggestions)
    
    return prioritized.map(s => this.suggestionToAction(s))
  }
}

// Export singleton
export const directorService = new DirectorService()
export default directorService
