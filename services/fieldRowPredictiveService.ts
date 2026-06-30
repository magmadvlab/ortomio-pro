/**
 * Field Row Predictive Service
 * Integra i field rows nel sistema predittivo del Director
 * Genera predizioni specifiche per ogni filare basate su:
 * - Configurazione filare (coltura, spaziatura, irrigazione)
 * - Dati meteo e terreno
 * - Storico operazioni
 * - Stato piante individuali
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'
import { directorService } from '@/services/directorService'
import { predictOptimalHarvestDate, predictYield, predictDiseaseRisk, predictWaterRequirement } from './predictiveAnalyticsService'
import { getMasterSheetSync } from './plantMasterService'
import { getWeatherForecast } from './weatherService'
import { resolveGardenContext } from '@/services/gardenContextResolverService'

export interface FieldRowPrediction {
  fieldRowId: string
  fieldRowName: string
  cultivar?: string
  
  // Predizioni principali
  harvestPrediction?: {
    optimalDate: Date
    confidence: number
    daysRemaining: number
    factors: string[]
  }
  
  yieldPrediction?: {
    expectedKg: number
    expectedKgPerSqm: number
    confidence: number
    optimizationTips: string[]
  }
  
  healthStatus: {
    overallScore: number // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    mainIssues: string[]
    preventiveActions: string[]
  }
  
  waterRequirement: {
    next7Days: number // litri totali
    dailyAverage: number // litri/giorno
    irrigationSchedule: string[]
    rainAdjustment: string
  }
  
  // Operazioni consigliate
  recommendedActions: Array<{
    action: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    timing: string
    reason: string
    estimatedCost?: number
  }>
  
  // Metriche performance
  performance: {
    plantCount: number
    activeCount: number
    healthyCount: number
    problemCount: number
    lastOperationDate?: string
    nextOperationDue?: string
  }
  
  // Integrazione Director
  directorInsights: {
    lifecyclePhase: string
    seasonalAdvice: string[]
    lunarTiming: string
    weatherAlerts: string[]
  }
  
  lastUpdated: string
}

export interface FieldRowAnalysisContext {
  garden: Garden
  gardenContext?: {
    history?: unknown
    structure?: unknown
    site?: unknown
    systems?: unknown
    crop?: unknown
    weather?: unknown
  } | null
  fieldRows: any[]
  individualPlants: any[]
  recentOperations: any[]
  weatherForecast: any
  tasks: GardenTask[]
}

type FieldRowContext = {
  gardenId: string
  fieldRowId: string
  fieldRowName: string
  plantedDate?: string
  cultivar?: string
  zoneId?: string
  areaSqm?: number
  irrigationEnabled?: boolean
  plantingAgeDays?: number
  gardenContext?: FieldRowAnalysisContext['gardenContext']
  weatherForecast?: FieldRowAnalysisContext['weatherForecast']
}

/**
 * SERVIZIO PRINCIPALE
 */
export class FieldRowPredictiveService {
  private storageProvider: any
  private cache: Map<string, FieldRowPrediction> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minuti

  constructor(storageProvider: any) {
    this.storageProvider = storageProvider
  }

  /**
   * Analizza tutti i field rows di un giardino e genera predizioni
   */
  async analyzeAllFieldRows(gardenId: string): Promise<Map<string, FieldRowPrediction>> {
    try {
      console.log('🔮 Starting field rows predictive analysis for garden:', gardenId)
      
      // Carica dati necessari
      const context = await this.loadAnalysisContext(gardenId)
      
      const predictions = new Map<string, FieldRowPrediction>()
      
      // Analizza ogni field row
      for (const fieldRow of context.fieldRows) {
        try {
          const prediction = await this.analyzeFieldRow(fieldRow, context)
          predictions.set(fieldRow.id, prediction)
          
          // Cache per 30 minuti
          this.cache.set(fieldRow.id, prediction)
          this.cacheExpiry.set(fieldRow.id, Date.now() + this.CACHE_DURATION)
          
        } catch (error) {
          console.error(`Error analyzing field row ${fieldRow.id}:`, error)
          
          // Crea predizione di fallback
          predictions.set(fieldRow.id, this.createFallbackPrediction(fieldRow))
        }
      }
      
      console.log('✅ Field rows analysis completed:', predictions.size, 'predictions generated')
      return predictions
      
    } catch (error) {
      console.error('Error in analyzeAllFieldRows:', error)
      return new Map()
    }
  }

  /**
   * Analizza un singolo field row
   */
  async analyzeFieldRow(fieldRow: any, context: FieldRowAnalysisContext): Promise<FieldRowPrediction> {
    // Controlla cache
    const cached = this.getCachedPrediction(fieldRow.id)
    if (cached) return cached

    console.log('🔍 Analyzing field row:', fieldRow.name)

    // Piante di questo filare
    const rowPlants = context.individualPlants.filter(p => p.fieldRowId === fieldRow.id)
    const rowOperations = context.recentOperations.filter(op => 
      op.fieldRowId === fieldRow.id || rowPlants.some(p => p.id === op.plantId)
    )

    // Master data per la coltura
    const masterData = fieldRow.cultivar ? getMasterSheetSync(fieldRow.cultivar) : null
    const rowContext = this.buildFieldRowContext(fieldRow, context)

    // Crea task virtuale per le predizioni
    const virtualTask: GardenTask = {
      id: `virtual-${fieldRow.id}`,
      gardenId: context.garden.id,
      zoneId: fieldRow.zoneId || undefined,
      plantName: fieldRow.cultivar || 'Coltura non specificata',
      taskType: 'Sowing',
      date: fieldRow.planted_date || new Date().toISOString().split('T')[0],
      completed: false,
      isSuggested: false,
      suggestedBy: 'field_row_analysis',
      notes: `Virtual task for field row ${fieldRow.name}`
    }

    // Predizioni principali
    const harvestPrediction = masterData ? await this.predictHarvest(virtualTask, masterData, context, rowContext) : undefined
    const yieldPrediction = masterData ? await this.predictYield(virtualTask, masterData, context, rowOperations, rowContext) : undefined
    const healthStatus = await this.analyzeHealthStatus(fieldRow, rowPlants, rowOperations, context, rowContext)
    const waterRequirement = masterData ? await this.predictWaterRequirement(virtualTask, masterData, context, rowContext) : this.getDefaultWaterRequirement(fieldRow, rowContext)

    // Operazioni consigliate
    const recommendedActions = await this.generateRecommendedActions(fieldRow, rowPlants, context, {
      harvestPrediction,
      yieldPrediction,
      healthStatus
    })

    // Metriche performance
    const performance = this.calculatePerformanceMetrics(fieldRow, rowPlants, rowOperations)

    // Integrazione Director
    const directorInsights = await this.getDirectorInsights(fieldRow, context)

    const prediction: FieldRowPrediction = {
      fieldRowId: fieldRow.id,
      fieldRowName: fieldRow.name,
      cultivar: fieldRow.cultivar,
      harvestPrediction,
      yieldPrediction,
      healthStatus,
      waterRequirement,
      recommendedActions,
      performance,
      directorInsights,
      lastUpdated: new Date().toISOString()
    }

    console.log('✅ Field row analysis completed:', fieldRow.name)
    return prediction
  }

  /**
   * Carica contesto per l'analisi
   */
  private async loadAnalysisContext(gardenId: string): Promise<FieldRowAnalysisContext> {
    const [resolvedGardenContext, garden, fieldRows, individualPlants, tasks] = await Promise.all([
      resolveGardenContext(this.storageProvider, gardenId).catch(() => null),
      this.storageProvider.getGarden(gardenId),
      this.storageProvider.getFieldRows(gardenId),
      this.storageProvider.getIndividualPlants?.(gardenId) || [],
      this.storageProvider.getTasks(gardenId)
    ])

    // Carica operazioni recenti (ultimi 90 giorni)
    const recentOperations = await this.loadRecentOperations(gardenId)

    // Carica previsioni meteo
    let weatherForecast = null
    if (garden.coordinates) {
      try {
        weatherForecast = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude)
      } catch (error) {
        console.warn('Could not load weather forecast:', error)
      }
    }

    return {
      garden: resolvedGardenContext?.garden || garden,
      gardenContext: resolvedGardenContext || null,
      fieldRows: fieldRows || [],
      individualPlants,
      recentOperations,
      weatherForecast,
      tasks: tasks || []
    }
  }

  /**
   * Carica operazioni recenti
   */
  private async loadRecentOperations(gardenId: string): Promise<any[]> {
    const operations: any[] = []
    
    try {
      // Fertilizzazioni
      if (this.storageProvider.getFertilizerApplicationLogs) {
        const fertilizations = await this.storageProvider.getFertilizerApplicationLogs(gardenId)
        operations.push(...(fertilizations || []).map((f: any) => ({ ...f, type: 'fertilization' })))
      }

      // Trattamenti
      if (this.storageProvider.getTreatments) {
        const treatments = await this.storageProvider.getTreatments(gardenId)
        operations.push(...(treatments || []).map((t: any) => ({ ...t, type: 'treatment' })))
      }

      // Irrigazioni
      if (this.storageProvider.getWateringLogs) {
        const irrigations = await this.storageProvider.getWateringLogs(undefined, gardenId)
        operations.push(...(irrigations || []).map((i: any) => ({ ...i, type: 'irrigation' })))
      }
    } catch (error) {
      console.warn('Error loading recent operations:', error)
    }

    return operations
  }

  /**
   * Predice data raccolto per field row
   */
  private async predictHarvest(task: GardenTask, masterData: any, context: FieldRowAnalysisContext, rowContext?: FieldRowContext) {
    try {
      const prediction = await predictOptimalHarvestDate(task, masterData, context.garden)
      
      const daysRemaining = Math.ceil(
        (prediction.optimalHarvestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        optimalDate: prediction.optimalHarvestDate,
        confidence: prediction.confidence,
        daysRemaining: Math.max(0, daysRemaining),
        factors: [
          `Fase: ${prediction.factors.currentPhase}`,
          `Crescita: ${prediction.factors.growthRate}`,
          `Meteo: ${prediction.factors.weatherConditions}`,
          `Giorni attivi: ${prediction.factors.daysActive}`
        ]
      }
    } catch (error) {
      console.error('Error predicting harvest:', error)
      return undefined
    }
  }

  /**
   * Predice resa per field row
   */
  private async predictYield(task: GardenTask, masterData: any, context: FieldRowAnalysisContext, operations: any[], rowContext?: FieldRowContext) {
    try {
      // Simula harvest logs da operazioni
      const harvestLogs = operations
        .filter(op => op.type === 'harvest')
        .map(op => ({
          plantName: task.plantName,
          date: op.date || op.harvest_date || new Date().toISOString().split('T')[0],
          quantity: op.quantity || 1,
          unit: op.unit || 'kg',
          rating: typeof op.rating === 'number' ? op.rating : 3
        }))

      const prediction = await predictYield(task, masterData, context.garden, harvestLogs)
      
      const optimizationTips: string[] = []
      
      // Suggerimenti basati su fertilizzazioni
      const recentFertilizations = operations.filter(op => 
        op.type === 'fertilization' && 
        new Date(op.application_date || op.date).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      )
      
      if (recentFertilizations.length === 0) {
        optimizationTips.push('Considera fertilizzazione per aumentare resa')
      }

      // Suggerimenti basati su irrigazione
      if (context.weatherForecast && context.weatherForecast.rainForecastMm < 5) {
        optimizationTips.push('Aumenta irrigazione per condizioni secche')
      }

      if (rowContext?.plantingAgeDays !== undefined) {
        if (rowContext.plantingAgeDays < 21) {
          optimizationTips.push('Filare giovane: privilegia stabilizzazione e irrigazione controllata')
        } else if (rowContext.plantingAgeDays > 60) {
          optimizationTips.push('Filare maturo: verifica stress produttivo e bilancia carico vegetativo')
        }
      }

      return {
        expectedKg: prediction.predictedYieldKg,
        expectedKgPerSqm: prediction.predictedYieldPerSqm,
        confidence: prediction.confidence,
        optimizationTips
      }
    } catch (error) {
      console.error('Error predicting yield:', error)
      return undefined
    }
  }

  /**
   * Analizza stato salute field row
   */
  private async analyzeHealthStatus(fieldRow: any, plants: any[], operations: any[], context: FieldRowAnalysisContext, rowContext?: FieldRowContext) {
    let overallScore = 100
    const mainIssues: string[] = []
    const preventiveActions: string[] = []

    // Analisi irrigazione
    if (fieldRow.irrigationConfig?.enabled) {
      const lastIrrigation = operations
        .filter(op => op.type === 'irrigation')
        .sort((a, b) => new Date(b.date || b.application_date).getTime() - new Date(a.date || a.application_date).getTime())[0]
      
      if (!lastIrrigation || this.daysSince(lastIrrigation.date || lastIrrigation.application_date) > 5) {
        overallScore -= 20
        mainIssues.push('Irrigazione non recente')
        preventiveActions.push('Verifica sistema irrigazione')
      }
    }

    if (rowContext?.plantingAgeDays !== undefined) {
      if (rowContext.plantingAgeDays <= 14) {
        preventiveActions.push('Filare in avvio: monitora attecchimento e stress idrico')
      } else if (rowContext.plantingAgeDays >= 45) {
        preventiveActions.push('Filare consolidato: confronta vigore e carico con lo storico del garden')
      }
    }

    // Analisi fertilizzazione
    const lastFertilization = operations
      .filter(op => op.type === 'fertilization')
      .sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())[0]
    
    if (!lastFertilization || this.daysSince(lastFertilization.application_date) > 30) {
      overallScore -= 15
      mainIssues.push('Fertilizzazione non recente')
      preventiveActions.push('Pianifica fertilizzazione')
    }

    // Analisi piante individuali
    if (plants.length > 0) {
      const healthyPlants = plants.filter(p => p.status === 'healthy' || !p.status).length
      const healthRatio = healthyPlants / plants.length
      
      if (healthRatio < 0.8) {
        overallScore -= 25
        mainIssues.push(`${plants.length - healthyPlants} piante con problemi`)
        preventiveActions.push('Ispeziona piante problematiche')
      }
    }

    // Analisi meteo
    if (context.weatherForecast) {
      if (context.weatherForecast.temperature > 35) {
        overallScore -= 10
        mainIssues.push('Stress da caldo')
        preventiveActions.push('Aumenta irrigazione e ombreggiatura')
      }
      
      if (context.weatherForecast.temperature < 5) {
        overallScore -= 15
        mainIssues.push('Rischio gelo')
        preventiveActions.push('Proteggi dal freddo')
      }
    }

    // Determina livello rischio
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (overallScore < 30) riskLevel = 'critical'
    else if (overallScore < 50) riskLevel = 'high'
    else if (overallScore < 70) riskLevel = 'medium'

    return {
      overallScore: Math.max(0, overallScore),
      riskLevel,
      mainIssues,
      preventiveActions
    }
  }

  /**
   * Predice fabbisogno idrico
   */
  private async predictWaterRequirement(task: GardenTask, masterData: any, context: FieldRowAnalysisContext, rowContext?: FieldRowContext) {
    try {
      const prediction = await predictWaterRequirement(task, masterData, context.garden)
      
      const next7Days = prediction.next7Days.reduce((sum, day) => sum + day.totalLiters, 0)
      const referenceArea = rowContext?.areaSqm || context.garden.sizeSqMeters || 1
      const dailyAverage = prediction.averageDailyRequirement * referenceArea
      
      const irrigationSchedule: string[] = []
      prediction.next7Days.forEach((day, index) => {
        if (day.totalLiters > dailyAverage * 1.2) {
          irrigationSchedule.push(`Giorno ${index + 1}: ${day.totalLiters.toFixed(1)}L (${day.reason})`)
        }
      })

      let rainAdjustment = 'Nessun aggiustamento necessario'
      if (context.weatherForecast?.rainForecastMm > 10) {
        rainAdjustment = `Riduci irrigazione: previsti ${context.weatherForecast.rainForecastMm}mm di pioggia`
      } else if (context.weatherForecast?.rainForecastMm === 0) {
        rainAdjustment = 'Aumenta irrigazione: nessuna pioggia prevista'
      }

      if (rowContext?.plantingAgeDays !== undefined) {
        if (rowContext.plantingAgeDays < 21) {
          rainAdjustment = `${rainAdjustment}. Filare giovane: evita sbalzi eccessivi.`
        } else if (rowContext.plantingAgeDays > 60) {
          rainAdjustment = `${rainAdjustment}. Filare adulto: calibra sui volumi storici del singolo filare.`
        }
      }

      return {
        next7Days: Math.round(next7Days),
        dailyAverage: Math.round(dailyAverage),
        irrigationSchedule,
        rainAdjustment
      }
    } catch (error) {
      console.error('Error predicting water requirement:', error)
      return this.getDefaultWaterRequirement(null)
    }
  }

  /**
   * Fabbisogno idrico di default
   */
  private getDefaultWaterRequirement(fieldRow: any, rowContext?: FieldRowContext) {
    const areaSqm = fieldRow?.length_meters * (fieldRow?.width_meters || 1) || 10
    const dailyAverage = (rowContext?.areaSqm || areaSqm) * 2 // 2L per m² al giorno
    
    return {
      next7Days: Math.round(dailyAverage * 7),
      dailyAverage: Math.round(dailyAverage),
      irrigationSchedule: ['Irrigazione standard giornaliera'],
      rainAdjustment: 'Verifica previsioni meteo'
    }
  }

  private buildFieldRowContext(fieldRow: any, context: FieldRowAnalysisContext): FieldRowContext {
    const plantedDate = fieldRow.planted_date || fieldRow.plantedDate || context.tasks.find(task => (task as any).fieldRowId === fieldRow.id)?.date
    const plantingAgeDays = plantedDate ? this.daysSince(plantedDate) : undefined

    return {
      gardenId: context.garden.id,
      fieldRowId: fieldRow.id,
      fieldRowName: fieldRow.name,
      plantedDate,
      cultivar: fieldRow.cultivar,
      zoneId: fieldRow.zoneId,
      areaSqm: fieldRow.areaSqm || (fieldRow.length_meters && fieldRow.width_meters ? fieldRow.length_meters * fieldRow.width_meters : undefined),
      irrigationEnabled: Boolean(fieldRow.irrigationConfig?.enabled),
      plantingAgeDays,
      gardenContext: context.gardenContext,
      weatherForecast: context.weatherForecast,
    }
  }

  /**
   * Genera azioni consigliate
   */
  private async generateRecommendedActions(
    fieldRow: any, 
    plants: any[], 
    context: FieldRowAnalysisContext,
    predictions: any
  ) {
    const actions: FieldRowPrediction['recommendedActions'] = []

    // Azioni basate su salute
    if (predictions.healthStatus?.riskLevel === 'high' || predictions.healthStatus?.riskLevel === 'critical') {
      actions.push({
        action: 'Ispezione urgente filare',
        priority: 'critical',
        timing: 'Oggi',
        reason: `Salute filare compromessa (${predictions.healthStatus.overallScore}/100)`,
        estimatedCost: 0
      })
    }

    // Azioni basate su raccolto
    if (predictions.harvestPrediction?.daysRemaining <= 7 && predictions.harvestPrediction.daysRemaining > 0) {
      actions.push({
        action: 'Prepara raccolta',
        priority: 'high',
        timing: `Tra ${predictions.harvestPrediction.daysRemaining} giorni`,
        reason: 'Raccolto ottimale imminente',
        estimatedCost: 0
      })
    }

    // Azioni basate su irrigazione
    if (fieldRow.irrigationConfig?.enabled && context.weatherForecast?.rainForecastMm === 0) {
      actions.push({
        action: 'Verifica irrigazione',
        priority: 'medium',
        timing: 'Prossimi 2 giorni',
        reason: 'Nessuna pioggia prevista',
        estimatedCost: 0
      })
    }

    // Azioni basate su fertilizzazione
    if (predictions.yieldPrediction?.optimizationTips.includes('fertilizzazione')) {
      actions.push({
        action: 'Fertilizzazione di supporto',
        priority: 'medium',
        timing: 'Prossima settimana',
        reason: 'Ottimizzazione resa',
        estimatedCost: 15
      })
    }

    return actions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  /**
   * Calcola metriche performance
   */
  private calculatePerformanceMetrics(fieldRow: any, plants: any[], operations: any[]) {
    const plantCount = plants.length
    const activeCount = plants.filter(p => p.status !== 'dead' && p.status !== 'harvested').length
    const healthyCount = plants.filter(p => p.status === 'healthy' || !p.status).length
    const problemCount = plantCount - healthyCount

    const lastOperation = operations
      .sort((a, b) => new Date(b.date || b.application_date).getTime() - new Date(a.date || a.application_date).getTime())[0]
    
    const lastOperationDate = lastOperation ? (lastOperation.date || lastOperation.application_date) : undefined

    // Prossima operazione dovuta (semplificata)
    let nextOperationDue: string | undefined
    if (lastOperationDate) {
      const lastDate = new Date(lastOperationDate)
      const nextDate = new Date(lastDate.getTime() + 14 * 24 * 60 * 60 * 1000) // +14 giorni
      if (nextDate > new Date()) {
        nextOperationDue = nextDate.toISOString().split('T')[0]
      }
    }

    return {
      plantCount,
      activeCount,
      healthyCount,
      problemCount,
      lastOperationDate,
      nextOperationDue
    }
  }

  /**
   * Ottiene insights dal Director
   */
  private async getDirectorInsights(fieldRow: any, context: FieldRowAnalysisContext) {
    try {
      const insights = await directorService.getFieldRowDirectorInsights({
        garden: context.garden,
        tasks: context.tasks,
        fieldRow,
        storageProvider: this.storageProvider,
      })

      return {
        lifecyclePhase: insights.lifecyclePhase,
        seasonalAdvice: insights.seasonalAdvice,
        lunarTiming: insights.lunarTiming,
        weatherAlerts: insights.weatherAlerts
      }
    } catch (error) {
      console.error('Error getting Director insights:', error)
      return {
        lifecyclePhase: 'Non disponibile',
        seasonalAdvice: [],
        lunarTiming: 'Non disponibile',
        weatherAlerts: []
      }
    }
  }

  /**
   * Utility functions
   */
  private getCachedPrediction(fieldRowId: string): FieldRowPrediction | null {
    const expiry = this.cacheExpiry.get(fieldRowId)
    if (expiry && Date.now() < expiry) {
      return this.cache.get(fieldRowId) || null
    }
    
    // Rimuovi cache scaduta
    this.cache.delete(fieldRowId)
    this.cacheExpiry.delete(fieldRowId)
    return null
  }

  private createFallbackPrediction(fieldRow: any): FieldRowPrediction {
    return {
      fieldRowId: fieldRow.id,
      fieldRowName: fieldRow.name,
      cultivar: fieldRow.cultivar,
      healthStatus: {
        overallScore: 50,
        riskLevel: 'medium',
        mainIssues: ['Analisi non disponibile'],
        preventiveActions: ['Verifica manualmente']
      },
      waterRequirement: this.getDefaultWaterRequirement(fieldRow),
      recommendedActions: [{
        action: 'Ispezione manuale',
        priority: 'medium',
        timing: 'Quando possibile',
        reason: 'Analisi automatica non riuscita'
      }],
      performance: {
        plantCount: 0,
        activeCount: 0,
        healthyCount: 0,
        problemCount: 0
      },
      directorInsights: {
        lifecyclePhase: 'Non disponibile',
        seasonalAdvice: [],
        lunarTiming: 'Non disponibile',
        weatherAlerts: []
      },
      lastUpdated: new Date().toISOString()
    }
  }

  private daysSince(dateString: string): number {
    const date = new Date(dateString)
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * API pubbliche
   */
  
  /**
   * Ottiene predizione per un singolo field row
   */
  async getFieldRowPrediction(fieldRowId: string): Promise<FieldRowPrediction | null> {
    // Controlla cache
    const cached = this.getCachedPrediction(fieldRowId)
    if (cached) return cached

    try {
      // Carica field row
      const fieldRow = await this.storageProvider.getFieldRow(fieldRowId)
      if (!fieldRow) return null

      // Carica contesto
      const context = await this.loadAnalysisContext(fieldRow.gardenId)
      
      // Analizza
      return await this.analyzeFieldRow(fieldRow, context)
    } catch (error) {
      console.error('Error getting field row prediction:', error)
      return null
    }
  }

  /**
   * Invalida cache per un field row
   */
  invalidateCache(fieldRowId?: string) {
    if (fieldRowId) {
      this.cache.delete(fieldRowId)
      this.cacheExpiry.delete(fieldRowId)
    } else {
      this.cache.clear()
      this.cacheExpiry.clear()
    }
  }

  /**
   * Ottiene statistiche cache
   */
  getCacheStats() {
    return {
      cached: this.cache.size,
      expired: Array.from(this.cacheExpiry.entries()).filter(([_, expiry]) => Date.now() >= expiry).length
    }
  }
}

/**
 * FACTORY FUNCTION
 */
export function createFieldRowPredictiveService(storageProvider: any): FieldRowPredictiveService {
  return new FieldRowPredictiveService(storageProvider)
}

/**
 * HOOK PER REACT
 */
export function useFieldRowPredictions(gardenId: string) {
  const [predictions, setPredictions] = useState<Map<string, FieldRowPrediction>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { storageProvider } = useStorage()
  const service = useMemo(() => createFieldRowPredictiveService(storageProvider), [storageProvider])

  const loadPredictions = useCallback(async () => {
    if (!gardenId) return

    setLoading(true)
    setError(null)

    try {
      const newPredictions = await service.analyzeAllFieldRows(gardenId)
      setPredictions(newPredictions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento predizioni')
    } finally {
      setLoading(false)
    }
  }, [gardenId, service])

  useEffect(() => {
    loadPredictions()
  }, [loadPredictions])

  return {
    predictions,
    loading,
    error,
    reload: loadPredictions,
    invalidateCache: (fieldRowId?: string) => service.invalidateCache(fieldRowId)
  }
}

export default FieldRowPredictiveService
