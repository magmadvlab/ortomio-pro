/**
 * AI Feedback System Types
 * Sistema collaborativo "4 mani" - AI + Utente
 */

// =====================================================
// AI SUGGESTION TYPES
// =====================================================

export type SuggestionType =
  | 'DISEASE_PREVENTION'
  | 'YIELD_OPTIMIZATION'
  | 'RESOURCE_SAVING'
  | 'PLANTING_PLAN'
  | 'TREATMENT'
  | 'IRRIGATION'
  | 'FERTILIZATION'
  | 'HARVEST_TIMING'
  | 'ROTATION_PLAN'

export type SuggestionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'MODIFIED'
  | 'COMPLETED'
  | 'EXPIRED'

export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface DataSource {
  type:
    | 'weather'
    | 'soil'
    | 'plant_health'
    | 'historical'
    | 'user_preference'
    | 'market_data'
    | 'local_sensor'
    | 'user_observation'
    | 'satellite'
    | 'irrigation_meter'
  timestamp: string
  data: Record<string, unknown>
  reliability: number // 0-1
}

export interface PredictionData {
  probability?: number
  expectedYield?: number
  expectedSavings?: number
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  timeframe?: string
  confidence: number
}

export interface ExpectedOutcome {
  metric: string
  expectedValue: number
  unit: string
  timeframe: string
  confidence: number
}

export interface AISuggestion {
  id: string
  user_id: string
  garden_id?: string
  
  // Tipo e contesto
  suggestion_type: SuggestionType
  context?: string
  
  // Contenuto
  title: string
  description: string
  reasoning: string // Spiegazione del ragionamento AI
  data_sources: DataSource[]
  
  // Predizione
  prediction_data: PredictionData
  confidence_score: number // 0-1
  
  // Azione
  suggested_action: string
  action_priority: ActionPriority
  action_deadline?: string
  
  // Parametri
  suggested_parameters: Record<string, unknown>
  
  // Alternative
  alternatives?: Array<{
    title: string
    description: string
    parameters: Record<string, unknown>
    pros: string[]
    cons: string[]
  }>
  
  // Risultati attesi
  expected_outcomes: ExpectedOutcome[]
  
  // Stato
  status: SuggestionStatus
  
  // Timestamp
  created_at: string
  expires_at?: string
  
  metadata?: Record<string, unknown>
}

// =====================================================
// USER DECISION TYPES
// =====================================================

export type DecisionType = 'ACCEPT' | 'REJECT' | 'MODIFY' | 'DEFER'

export interface UserDecision {
  id: string
  user_id: string
  suggestion_id: string
  
  // Decisione
  decision: DecisionType
  decision_reason?: string
  
  // Modifiche
  modifications?: Record<string, unknown>
  original_parameters?: Record<string, unknown>
  modified_parameters?: Record<string, unknown>
  
  // Feedback
  feedback_rating?: number // 1-5
  feedback_comment?: string
  feedback_tags?: string[]
  
  // Implementazione
  implemented: boolean
  implementation_date?: string
  implementation_notes?: string
  
  // Timestamp
  decided_at: string
  
  metadata?: Record<string, unknown>
}

// =====================================================
// SUCCESS METRICS TYPES
// =====================================================

export type MetricType =
  | 'DISEASE_OUTCOME'
  | 'YIELD_ACTUAL'
  | 'RESOURCE_USAGE'
  | 'COST_SAVINGS'
  | 'TIME_SAVINGS'
  | 'QUALITY_IMPROVEMENT'

export interface SuccessMetric {
  id: string
  user_id: string
  suggestion_id?: string
  decision_id?: string
  garden_id: string
  
  // Tipo
  metric_type: MetricType
  
  // Predizione
  predicted_value: number
  predicted_unit: string
  prediction_confidence: number
  
  // Realtà
  actual_value: number
  actual_unit: string
  
  // Accuratezza
  accuracy_percentage: number
  variance: number
  
  // Fattori
  influencing_factors?: Array<{
    factor: string
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    description: string
  }>
  
  // Valutazione utente
  user_satisfaction?: number // 1-5
  user_notes?: string
  
  // Timestamp
  measured_at: string
  measurement_period_start?: string
  measurement_period_end?: string
  
  metadata?: Record<string, unknown>
}

// =====================================================
// LEARNING FEEDBACK TYPES
// =====================================================

export type PatternType =
  | 'USER_PREFERENCE'
  | 'CONTEXT_SPECIFIC'
  | 'SEASONAL'
  | 'CROP_SPECIFIC'
  | 'WEATHER_DEPENDENT'
  | 'SOIL_DEPENDENT'

export type LearningSource = 'USER_DECISION' | 'SUCCESS_METRIC' | 'EXPLICIT_FEEDBACK'

export interface LearningFeedback {
  id: string
  user_id: string
  
  // Pattern
  pattern_type: PatternType
  pattern_description: string
  pattern_data: Record<string, unknown>
  
  // Apprendimento
  learning_source: LearningSource
  confidence_level: number // 0-1
  
  // Applicabilità
  applicable_to?: Record<string, unknown>
  
  // Impatto
  impact_on_future_suggestions: string
  adjustment_factor: number
  
  // Validazione
  times_validated: number
  times_contradicted: number
  
  // Stato
  active: boolean
  
  // Timestamp
  learned_at: string
  last_validated_at?: string
  
  metadata?: Record<string, unknown>
}

// =====================================================
// AI TRANSPARENCY TYPES
// =====================================================

export interface DecisionTreeNode {
  condition: string
  result: string
  weight: number
  children?: DecisionTreeNode[]
}

export interface AITransparencyLog {
  id: string
  suggestion_id: string
  
  // Processo decisionale
  decision_tree: DecisionTreeNode[]
  data_inputs: Record<string, unknown>
  weights_applied: Record<string, number>
  rules_triggered: Array<{
    rule: string
    triggered: boolean
    impact: number
  }>
  
  // Calcoli
  calculations: Array<{
    step: string
    formula: string
    inputs: Record<string, unknown>
    output: unknown
  }>
  thresholds_used: Record<string, number>
  
  // Alternative
  alternatives_evaluated: Array<{
    option: string
    score: number
    reason_not_chosen: string
  }>
  
  // Fonti dati
  weather_data_used?: Record<string, unknown>
  soil_data_used?: Record<string, unknown>
  plant_health_data_used?: Record<string, unknown>
  historical_data_used?: Record<string, unknown>
  user_preferences_used?: Record<string, unknown>
  
  // Modelli
  models_used: string[]
  model_versions: string[]
  
  // Timestamp
  logged_at: string
  
  metadata?: Record<string, unknown>
}

// =====================================================
// AI PERFORMANCE TYPES
// =====================================================

export interface AIPerformanceScore {
  total_suggestions: number
  accepted_suggestions: number
  rejected_suggestions: number
  modified_suggestions: number
  acceptance_rate: number // percentage
  average_accuracy: number // percentage
  average_satisfaction: number // 0-100
  performance_score: number // 0-100
}

// =====================================================
// COLLABORATIVE UI TYPES
// =====================================================

export interface SuggestionCardProps {
  suggestion: AISuggestion
  onAccept: (suggestionId: string) => void
  onReject: (suggestionId: string, reason?: string) => void
  onModify: (suggestionId: string, modifications: Record<string, unknown>) => void
  onViewTransparency: (suggestionId: string) => void
}

export interface TransparencyPanelProps {
  suggestion: AISuggestion
  transparencyLog: AITransparencyLog
  onClose: () => void
}

export interface FeedbackFormProps {
  suggestion: AISuggestion
  decision: UserDecision
  onSubmit: (feedback: {
    rating: number
    comment?: string
    tags?: string[]
  }) => void
}

export interface SuccessTrackingProps {
  suggestion: AISuggestion
  decision: UserDecision
  onRecordMetric: (metric: Partial<SuccessMetric>) => void
}

// =====================================================
// HELPER TYPES
// =====================================================

export interface SuggestionFilter {
  types?: SuggestionType[]
  priorities?: ActionPriority[]
  statuses?: SuggestionStatus[]
  dateFrom?: string
  dateTo?: string
  gardenId?: string
}

export interface LearningInsight {
  pattern: LearningFeedback
  examples: Array<{
    suggestion: AISuggestion
    decision: UserDecision
  }>
  recommendation: string
}

export interface AIAdaptation {
  user_id: string
  learned_preferences: LearningFeedback[]
  suggested_adjustments: Array<{
    area: string
    current_behavior: string
    suggested_behavior: string
    reason: string
  }>
}
