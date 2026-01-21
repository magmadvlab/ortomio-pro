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
import { collaborativeAIService } from './collaborativeAIService'
import { dailyDiaryService } from './dailyDiaryService'
import type { AISuggestion } from '@/types/aiFeedback'

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
}

export interface DailyBriefing {
  date: Date
  gardenId: string
  gardenName?: string
  summary: string
  criticalActions: PrioritizedAction[]
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
  
  private getClient() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available')
    }
    return client
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
      
      // 3. Prioritizza suggerimenti
      const prioritized = await this.prioritizeSuggestions(suggestions)
      
      // 4. Converti in azioni
      const actions = prioritized.map(s => this.suggestionToAction(s))
      
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
    // Calcola score basato su priorità e confidence
    const priorityScores = { CRITICAL: 100, HIGH: 75, MEDIUM: 50, LOW: 25 }
    const baseScore = priorityScores[suggestion.action_priority] || 50
    const confidenceBonus = (suggestion.confidence_score || 0.5) * 20
    const priorityScore = baseScore + confidenceBonus
    
    return {
      id: suggestion.id,
      type: suggestion.action_priority as any || 'MEDIUM',
      title: suggestion.title,
      description: suggestion.description || '',
      urgency: priorityScore,
      impact: suggestion.confidence_score * 100,
      feasibility: 80, // Default
      cost: 50, // Default
      priorityScore,
      dependencies: [],
      source: 'ai_suggestion',
      sourceId: suggestion.id,
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence_score
    }
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
