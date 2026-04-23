/**
 * Collaborative AI Service
 * Sistema "4 mani" - Dialogo collaborativo tra AI e Utente
 */

import { getSupabaseClient } from '@/config/supabase'
import type {
  AISuggestion,
  UserDecision,
  SuccessMetric,
  LearningFeedback,
  AITransparencyLog,
  AIPerformanceScore,
  SuggestionType,
  DecisionType,
  MetricType,
  SuggestionFilter
} from '@/types/aiFeedback'

class CollaborativeAIService {
  
  private getClient() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client not available')
    }
    return client
  }
  
  // =====================================================
  // AI SUGGESTIONS
  // =====================================================
  
  /**
   * Crea un nuovo suggerimento AI
   */
  async createSuggestion(suggestion: Omit<AISuggestion, 'id' | 'created_at'>): Promise<AISuggestion | null> {
    try {
      const { data, error } = await this.getClient()
        .from('ai_suggestions')
        .insert([suggestion])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating AI suggestion:', error)
      return null
    }
  }
  
  /**
   * Ottieni suggerimenti per utente
   */
  async getSuggestions(
    userId: string,
    filter?: SuggestionFilter
  ): Promise<AISuggestion[]> {
    try {
      let query = this.getClient()
        .from('ai_suggestions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      // Applica filtri
      if (filter?.types && filter.types.length > 0) {
        query = query.in('suggestion_type', filter.types)
      }
      if (filter?.priorities && filter.priorities.length > 0) {
        query = query.in('action_priority', filter.priorities)
      }
      if (filter?.statuses && filter.statuses.length > 0) {
        query = query.in('status', filter.statuses)
      }
      if (filter?.gardenId) {
        query = query.eq('garden_id', filter.gardenId)
      }
      if (filter?.dateFrom) {
        query = query.gte('created_at', filter.dateFrom)
      }
      if (filter?.dateTo) {
        query = query.lte('created_at', filter.dateTo)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      return []
    }
  }
  
  /**
   * Ottieni suggerimenti attivi (pending)
   */
  async getActiveSuggestions(userId: string, gardenId?: string): Promise<AISuggestion[]> {
    return this.getSuggestions(userId, {
      statuses: ['PENDING'],
      gardenId
    })
  }
  
  /**
   * Ottieni suggerimenti critici
   */
  async getCriticalSuggestions(userId: string, gardenId?: string): Promise<AISuggestion[]> {
    return this.getSuggestions(userId, {
      statuses: ['PENDING'],
      priorities: ['CRITICAL', 'HIGH'],
      gardenId
    })
  }
  
  /**
   * Aggiorna stato suggerimento
   */
  async updateSuggestionStatus(
    suggestionId: string,
    status: AISuggestion['status']
  ): Promise<boolean> {
    try {
      const { error } = await this.getClient()
        .from('ai_suggestions')
        .update({ status })
        .eq('id', suggestionId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating suggestion status:', error)
      return false
    }
  }
  
  // =====================================================
  // USER DECISIONS
  // =====================================================
  
  /**
   * Registra decisione utente
   */
  async recordDecision(decision: Omit<UserDecision, 'id' | 'decided_at'>): Promise<UserDecision | null> {
    try {
      // Inserisci decisione
      const { data, error } = await this.getClient()
        .from('user_decisions')
        .insert([decision])
        .select()
        .single()
      
      if (error) throw error
      
      // Aggiorna stato suggerimento
      const newStatus = decision.decision === 'ACCEPT' ? 'ACCEPTED' :
                       decision.decision === 'REJECT' ? 'REJECTED' :
                       decision.decision === 'MODIFY' ? 'MODIFIED' : 'PENDING'
      
      await this.updateSuggestionStatus(decision.suggestion_id, newStatus)
      
      return data
    } catch (error) {
      console.error('Error recording decision:', error)
      return null
    }
  }
  
  /**
   * Accetta suggerimento
   */
  async acceptSuggestion(
    userId: string,
    suggestionId: string,
    notes?: string
  ): Promise<UserDecision | null> {
    return this.recordDecision({
      user_id: userId,
      suggestion_id: suggestionId,
      decision: 'ACCEPT',
      decision_reason: notes,
      implemented: false
    })
  }
  
  /**
   * Rifiuta suggerimento
   */
  async rejectSuggestion(
    userId: string,
    suggestionId: string,
    reason: string
  ): Promise<UserDecision | null> {
    return this.recordDecision({
      user_id: userId,
      suggestion_id: suggestionId,
      decision: 'REJECT',
      decision_reason: reason,
      implemented: false
    })
  }
  
  /**
   * Modifica suggerimento
   */
  async modifySuggestion(
    userId: string,
    suggestionId: string,
    originalParameters: Record<string, any>,
    modifiedParameters: Record<string, any>,
    reason?: string
  ): Promise<UserDecision | null> {
    const modifications: Record<string, any> = {}
    
    // Identifica cosa è stato modificato
    for (const key in modifiedParameters) {
      if (originalParameters[key] !== modifiedParameters[key]) {
        modifications[key] = {
          original: originalParameters[key],
          modified: modifiedParameters[key]
        }
      }
    }
    
    return this.recordDecision({
      user_id: userId,
      suggestion_id: suggestionId,
      decision: 'MODIFY',
      decision_reason: reason,
      modifications,
      original_parameters: originalParameters,
      modified_parameters: modifiedParameters,
      implemented: false
    })
  }
  
  /**
   * Ottieni decisioni utente
   */
  async getUserDecisions(userId: string, suggestionId?: string): Promise<UserDecision[]> {
    try {
      let query = this.getClient()
        .from('user_decisions')
        .select('*')
        .eq('user_id', userId)
        .order('decided_at', { ascending: false })
      
      if (suggestionId) {
        query = query.eq('suggestion_id', suggestionId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching decisions:', error)
      return []
    }
  }
  
  /**
   * Aggiorna feedback su decisione
   */
  async updateDecisionFeedback(
    decisionId: string,
    feedback: {
      rating: number
      comment?: string
      tags?: string[]
    }
  ): Promise<boolean> {
    try {
      const { error } = await this.getClient()
        .from('user_decisions')
        .update({
          feedback_rating: feedback.rating,
          feedback_comment: feedback.comment,
          feedback_tags: feedback.tags
        })
        .eq('id', decisionId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating decision feedback:', error)
      return false
    }
  }
  
  /**
   * Marca decisione come implementata
   */
  async markAsImplemented(
    decisionId: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.getClient()
        .from('user_decisions')
        .update({
          implemented: true,
          implementation_date: new Date().toISOString(),
          implementation_notes: notes
        })
        .eq('id', decisionId)
      
      if (error) throw error
      
      // Aggiorna anche il suggerimento a COMPLETED
      const { data: decision } = await this.getClient()
        .from('user_decisions')
        .select('suggestion_id')
        .eq('id', decisionId)
        .single()
      
      if (decision) {
        await this.updateSuggestionStatus(decision.suggestion_id, 'COMPLETED')
      }
      
      return true
    } catch (error) {
      console.error('Error marking as implemented:', error)
      return false
    }
  }
  
  // =====================================================
  // SUCCESS METRICS
  // =====================================================
  
  /**
   * Registra metrica di successo
   */
  async recordSuccessMetric(metric: Omit<SuccessMetric, 'id' | 'measured_at'>): Promise<SuccessMetric | null> {
    try {
      // Calcola accuratezza
      const accuracy = this.calculateAccuracy(metric.predicted_value, metric.actual_value)
      const variance = metric.actual_value - metric.predicted_value
      
      const { data, error } = await this.getClient()
        .from('success_metrics')
        .insert([{
          ...metric,
          accuracy_percentage: accuracy,
          variance
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error recording success metric:', error)
      return null
    }
  }
  
  /**
   * Ottieni metriche di successo
   */
  async getSuccessMetrics(
    userId: string,
    suggestionId?: string
  ): Promise<SuccessMetric[]> {
    try {
      let query = this.getClient()
        .from('success_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
      
      if (suggestionId) {
        query = query.eq('suggestion_id', suggestionId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching success metrics:', error)
      return []
    }
  }
  
  /**
   * Calcola accuratezza predizione
   */
  private calculateAccuracy(predicted: number, actual: number): number {
    if (predicted === 0) return 0
    return 100 - (Math.abs(predicted - actual) / predicted * 100)
  }
  
  // =====================================================
  // LEARNING FEEDBACK
  // =====================================================
  
  /**
   * Ottieni pattern di apprendimento
   */
  async getLearningPatterns(userId: string): Promise<LearningFeedback[]> {
    try {
      const { data, error } = await this.getClient()
        .from('learning_feedback')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('confidence_level', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching learning patterns:', error)
      return []
    }
  }
  
  /**
   * Applica apprendimento a nuovi suggerimenti
   */
  async applyLearning(
    userId: string,
    suggestionType: SuggestionType,
    baseParameters: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      // Carica pattern rilevanti
      const patterns = await this.getLearningPatterns(userId)
      
      // Filtra pattern applicabili a questo tipo di suggerimento
      const relevantPatterns = patterns.filter(p => 
        p.pattern_data.suggestion_type === suggestionType ||
        !p.pattern_data.suggestion_type
      )
      
      // Applica aggiustamenti
      let adjustedParameters = { ...baseParameters }
      
      for (const pattern of relevantPatterns) {
        if (pattern.confidence_level > 0.6) { // Solo pattern con alta confidenza
          // Applica adjustment_factor ai parametri
          if (pattern.pattern_data.parameter_adjustments) {
            for (const [key, adjustment] of Object.entries(pattern.pattern_data.parameter_adjustments)) {
              if (adjustedParameters[key] !== undefined) {
                adjustedParameters[key] = adjustedParameters[key] * (adjustment as number)
              }
            }
          }
        }
      }
      
      return adjustedParameters
    } catch (error) {
      console.error('Error applying learning:', error)
      return baseParameters
    }
  }
  
  // =====================================================
  // AI TRANSPARENCY
  // =====================================================
  
  /**
   * Registra log di trasparenza
   */
  async logTransparency(log: Omit<AITransparencyLog, 'id' | 'logged_at'>): Promise<AITransparencyLog | null> {
    try {
      const { data, error } = await this.getClient()
        .from('ai_transparency_log')
        .insert([log])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error logging transparency:', error)
      return null
    }
  }
  
  /**
   * Ottieni log di trasparenza per suggerimento
   */
  async getTransparencyLog(suggestionId: string): Promise<AITransparencyLog | null> {
    try {
      const { data, error } = await this.getClient()
        .from('ai_transparency_log')
        .select('*')
        .eq('suggestion_id', suggestionId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching transparency log:', error)
      return null
    }
  }
  
  // =====================================================
  // AI PERFORMANCE
  // =====================================================
  
  /**
   * Ottieni performance score AI
   */
  async getAIPerformanceScore(userId: string): Promise<AIPerformanceScore | null> {
    try {
      const { data, error } = await this.getClient()
        .rpc('get_ai_performance_score', { p_user_id: userId })
        .single()
      
      if (error) throw error
      if (!data || typeof data !== 'object') {
        return null
      }
      return data as AIPerformanceScore
    } catch (error) {
      console.error('Error fetching AI performance score:', error)
      return null
    }
  }
  
  /**
   * Ottieni statistiche suggerimenti
   */
  async getSuggestionStats(userId: string, gardenId?: string) {
    try {
      const suggestions = await this.getSuggestions(userId, { gardenId })
      
      const stats = {
        total: suggestions.length,
        byStatus: {
          pending: suggestions.filter(s => s.status === 'PENDING').length,
          accepted: suggestions.filter(s => s.status === 'ACCEPTED').length,
          rejected: suggestions.filter(s => s.status === 'REJECTED').length,
          modified: suggestions.filter(s => s.status === 'MODIFIED').length,
          completed: suggestions.filter(s => s.status === 'COMPLETED').length
        },
        byPriority: {
          critical: suggestions.filter(s => s.action_priority === 'CRITICAL').length,
          high: suggestions.filter(s => s.action_priority === 'HIGH').length,
          medium: suggestions.filter(s => s.action_priority === 'MEDIUM').length,
          low: suggestions.filter(s => s.action_priority === 'LOW').length
        },
        byType: suggestions.reduce((acc, s) => {
          acc[s.suggestion_type] = (acc[s.suggestion_type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        averageConfidence: suggestions.reduce((sum, s) => sum + s.confidence_score, 0) / suggestions.length || 0
      }
      
      return stats
    } catch (error) {
      console.error('Error calculating suggestion stats:', error)
      return null
    }
  }
  
  /**
   * Ottieni trend accuratezza nel tempo
   */
  async getAccuracyTrend(userId: string, days: number = 30) {
    try {
      const dateFrom = new Date()
      dateFrom.setDate(dateFrom.getDate() - days)
      
      const { data, error } = await this.getClient()
        .from('success_metrics')
        .select('measured_at, accuracy_percentage, metric_type')
        .eq('user_id', userId)
        .gte('measured_at', dateFrom.toISOString())
        .order('measured_at', { ascending: true })
      
      if (error) throw error
      
      // Raggruppa per giorno
      const dailyAccuracy = (data || []).reduce((acc, metric) => {
        const date = metric.measured_at.split('T')[0]
        if (!acc[date]) {
          acc[date] = { total: 0, count: 0 }
        }
        acc[date].total += metric.accuracy_percentage
        acc[date].count += 1
        return acc
      }, {} as Record<string, { total: number, count: number }>)
      
      // Calcola media giornaliera
      const trend = Object.entries(dailyAccuracy).map(([date, { total, count }]) => ({
        date,
        accuracy: total / count
      }))
      
      return trend
    } catch (error) {
      console.error('Error calculating accuracy trend:', error)
      return []
    }
  }
}

export const collaborativeAIService = new CollaborativeAIService()
export default collaborativeAIService
