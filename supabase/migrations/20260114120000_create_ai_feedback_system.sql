-- =====================================================
-- AI FEEDBACK SYSTEM - "4 HANDS" COLLABORATIVE AI
-- Sistema di feedback e apprendimento collaborativo
-- =====================================================

-- =====================================================
-- 1. AI SUGGESTIONS TABLE
-- Traccia tutte le suggerimenti AI generati
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Tipo e contesto del suggerimento
  suggestion_type VARCHAR(50) NOT NULL, -- 'DISEASE_PREVENTION', 'YIELD_OPTIMIZATION', 'RESOURCE_SAVING', 'PLANTING_PLAN', 'TREATMENT', 'IRRIGATION'
  context TEXT, -- Contesto in cui è stato generato
  
  -- Dati del suggerimento
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL, -- Spiegazione del ragionamento AI
  data_sources JSONB, -- Fonti dati usate per il suggerimento
  
  -- Predizione/Stima
  prediction_data JSONB, -- Dati predittivi (probabilità, resa prevista, risparmio, etc.)
  confidence_score DECIMAL(3,2), -- 0.00-1.00
  
  -- Azione suggerita
  suggested_action TEXT NOT NULL,
  action_priority VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  action_deadline TIMESTAMP,
  
  -- Parametri suggeriti
  suggested_parameters JSONB, -- Parametri specifici (quantità, prodotti, timing, etc.)
  
  -- Alternative
  alternatives JSONB, -- Suggerimenti alternativi
  
  -- Metriche di successo attese
  expected_outcomes JSONB, -- Risultati attesi se seguito
  
  -- Stato
  status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'MODIFIED', 'COMPLETED'
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Scadenza suggerimento
  
  -- Metadata
  metadata JSONB
);

-- Indici
CREATE INDEX idx_ai_suggestions_user ON ai_suggestions(user_id);
CREATE INDEX idx_ai_suggestions_garden ON ai_suggestions(garden_id);
CREATE INDEX idx_ai_suggestions_type ON ai_suggestions(suggestion_type);
CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_ai_suggestions_priority ON ai_suggestions(action_priority);
CREATE INDEX idx_ai_suggestions_created ON ai_suggestions(created_at DESC);

-- =====================================================
-- 2. USER DECISIONS TABLE
-- Traccia decisioni utente sui suggerimenti AI
-- =====================================================

CREATE TABLE IF NOT EXISTS user_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES ai_suggestions(id) ON DELETE CASCADE,
  
  -- Decisione
  decision VARCHAR(20) NOT NULL, -- 'ACCEPT', 'REJECT', 'MODIFY', 'DEFER'
  decision_reason TEXT, -- Motivazione utente
  
  -- Modifiche apportate (se MODIFY)
  modifications JSONB, -- Cosa ha modificato l'utente
  original_parameters JSONB, -- Parametri originali AI
  modified_parameters JSONB, -- Parametri modificati utente
  
  -- Feedback qualitativo
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5), -- 1-5 stelle
  feedback_comment TEXT,
  feedback_tags TEXT[], -- ['troppo_conservativo', 'ottimo', 'non_applicabile', etc.]
  
  -- Implementazione
  implemented BOOLEAN DEFAULT FALSE,
  implementation_date TIMESTAMP,
  implementation_notes TEXT,
  
  -- Timestamp
  decided_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB
);

-- Indici
CREATE INDEX idx_user_decisions_user ON user_decisions(user_id);
CREATE INDEX idx_user_decisions_suggestion ON user_decisions(suggestion_id);
CREATE INDEX idx_user_decisions_decision ON user_decisions(decision);
CREATE INDEX idx_user_decisions_decided ON user_decisions(decided_at DESC);

-- =====================================================
-- 3. SUCCESS METRICS TABLE
-- Traccia risultati effettivi vs predizioni AI
-- =====================================================

CREATE TABLE IF NOT EXISTS success_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_id UUID REFERENCES ai_suggestions(id) ON DELETE SET NULL,
  decision_id UUID REFERENCES user_decisions(id) ON DELETE SET NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Tipo metrica
  metric_type VARCHAR(50) NOT NULL, -- 'DISEASE_OUTCOME', 'YIELD_ACTUAL', 'RESOURCE_USAGE', 'COST_SAVINGS'
  
  -- Predizione AI
  predicted_value DECIMAL(10,2),
  predicted_unit VARCHAR(50),
  prediction_confidence DECIMAL(3,2),
  
  -- Risultato effettivo
  actual_value DECIMAL(10,2),
  actual_unit VARCHAR(50),
  
  -- Accuratezza
  accuracy_percentage DECIMAL(5,2), -- Quanto era accurata la predizione
  variance DECIMAL(10,2), -- Differenza tra predetto e reale
  
  -- Fattori che hanno influenzato
  influencing_factors JSONB, -- Cosa ha causato differenze
  
  -- Valutazione utente
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  user_notes TEXT,
  
  -- Timestamp
  measured_at TIMESTAMP DEFAULT NOW(),
  measurement_period_start TIMESTAMP,
  measurement_period_end TIMESTAMP,
  
  -- Metadata
  metadata JSONB
);

-- Indici
CREATE INDEX idx_success_metrics_user ON success_metrics(user_id);
CREATE INDEX idx_success_metrics_suggestion ON success_metrics(suggestion_id);
CREATE INDEX idx_success_metrics_decision ON success_metrics(decision_id);
CREATE INDEX idx_success_metrics_type ON success_metrics(metric_type);
CREATE INDEX idx_success_metrics_measured ON success_metrics(measured_at DESC);

-- =====================================================
-- 4. LEARNING FEEDBACK TABLE
-- Sistema di apprendimento continuo
-- =====================================================

CREATE TABLE IF NOT EXISTS learning_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Pattern identificato
  pattern_type VARCHAR(50) NOT NULL, -- 'USER_PREFERENCE', 'CONTEXT_SPECIFIC', 'SEASONAL', 'CROP_SPECIFIC'
  pattern_description TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  
  -- Apprendimento
  learning_source VARCHAR(50), -- 'USER_DECISION', 'SUCCESS_METRIC', 'EXPLICIT_FEEDBACK'
  confidence_level DECIMAL(3,2), -- Quanto siamo sicuri di questo pattern
  
  -- Applicabilità
  applicable_to JSONB, -- A quali contesti si applica questo apprendimento
  
  -- Impatto
  impact_on_future_suggestions TEXT,
  adjustment_factor DECIMAL(5,2), -- Quanto modificare suggerimenti futuri
  
  -- Validazione
  times_validated INTEGER DEFAULT 0, -- Quante volte questo pattern si è confermato
  times_contradicted INTEGER DEFAULT 0, -- Quante volte è stato contraddetto
  
  -- Stato
  active BOOLEAN DEFAULT TRUE,
  
  -- Timestamp
  learned_at TIMESTAMP DEFAULT NOW(),
  last_validated_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB
);

-- Indici
CREATE INDEX idx_learning_feedback_user ON learning_feedback(user_id);
CREATE INDEX idx_learning_feedback_pattern ON learning_feedback(pattern_type);
CREATE INDEX idx_learning_feedback_active ON learning_feedback(active);
CREATE INDEX idx_learning_feedback_learned ON learning_feedback(learned_at DESC);

-- =====================================================
-- 5. AI TRANSPARENCY LOG
-- Log completo di come l'AI arriva alle decisioni
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_transparency_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES ai_suggestions(id) ON DELETE CASCADE,
  
  -- Processo decisionale
  decision_tree JSONB NOT NULL, -- Albero decisionale completo
  data_inputs JSONB NOT NULL, -- Tutti i dati in input
  weights_applied JSONB, -- Pesi applicati a vari fattori
  rules_triggered JSONB, -- Regole che hanno scattato
  
  -- Calcoli
  calculations JSONB, -- Calcoli matematici eseguiti
  thresholds_used JSONB, -- Soglie usate per decisioni
  
  -- Alternative considerate
  alternatives_evaluated JSONB, -- Altre opzioni considerate e perché scartate
  
  -- Fonti dati
  weather_data_used JSONB,
  soil_data_used JSONB,
  plant_health_data_used JSONB,
  historical_data_used JSONB,
  user_preferences_used JSONB,
  
  -- Modelli AI
  models_used TEXT[], -- Quali modelli AI sono stati usati
  model_versions TEXT[], -- Versioni dei modelli
  
  -- Timestamp
  logged_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB
);

-- Indici
CREATE INDEX idx_ai_transparency_suggestion ON ai_transparency_log(suggestion_id);
CREATE INDEX idx_ai_transparency_logged ON ai_transparency_log(logged_at DESC);

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- AI Suggestions
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI suggestions"
  ON ai_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI suggestions"
  ON ai_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI suggestions"
  ON ai_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- User Decisions
ALTER TABLE user_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own decisions"
  ON user_decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decisions"
  ON user_decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions"
  ON user_decisions FOR UPDATE
  USING (auth.uid() = user_id);

-- Success Metrics
ALTER TABLE success_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metrics"
  ON success_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON success_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON success_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- Learning Feedback
ALTER TABLE learning_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning feedback"
  ON learning_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning feedback"
  ON learning_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning feedback"
  ON learning_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- AI Transparency Log
ALTER TABLE ai_transparency_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transparency logs for their suggestions"
  ON ai_transparency_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_suggestions
      WHERE ai_suggestions.id = ai_transparency_log.suggestion_id
      AND ai_suggestions.user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Funzione per calcolare accuratezza predizioni
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy(
  p_predicted DECIMAL,
  p_actual DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  IF p_predicted = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN 100 - (ABS(p_predicted - p_actual) / p_predicted * 100);
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiornare learning feedback basato su decisioni
CREATE OR REPLACE FUNCTION update_learning_from_decision()
RETURNS TRIGGER AS $$
DECLARE
  v_suggestion ai_suggestions%ROWTYPE;
  v_pattern_exists BOOLEAN;
BEGIN
  -- Carica suggerimento
  SELECT * INTO v_suggestion
  FROM ai_suggestions
  WHERE id = NEW.suggestion_id;
  
  -- Se utente ha rifiutato, impara dalla decisione
  IF NEW.decision = 'REJECT' THEN
    -- Controlla se esiste già un pattern simile
    SELECT EXISTS(
      SELECT 1 FROM learning_feedback
      WHERE user_id = NEW.user_id
      AND pattern_type = 'USER_PREFERENCE'
      AND pattern_data->>'suggestion_type' = v_suggestion.suggestion_type
    ) INTO v_pattern_exists;
    
    IF NOT v_pattern_exists THEN
      -- Crea nuovo pattern di apprendimento
      INSERT INTO learning_feedback (
        user_id,
        pattern_type,
        pattern_description,
        pattern_data,
        learning_source,
        confidence_level,
        impact_on_future_suggestions
      ) VALUES (
        NEW.user_id,
        'USER_PREFERENCE',
        'User tends to reject ' || v_suggestion.suggestion_type || ' suggestions',
        jsonb_build_object(
          'suggestion_type', v_suggestion.suggestion_type,
          'rejection_reason', NEW.decision_reason,
          'context', v_suggestion.context
        ),
        'USER_DECISION',
        0.5,
        'Reduce frequency or adjust parameters for this type of suggestion'
      );
    ELSE
      -- Incrementa validazione pattern esistente
      UPDATE learning_feedback
      SET times_validated = times_validated + 1,
          confidence_level = LEAST(confidence_level + 0.1, 1.0),
          last_validated_at = NOW()
      WHERE user_id = NEW.user_id
      AND pattern_type = 'USER_PREFERENCE'
      AND pattern_data->>'suggestion_type' = v_suggestion.suggestion_type;
    END IF;
  END IF;
  
  -- Se utente ha accettato, rinforza pattern positivo
  IF NEW.decision = 'ACCEPT' THEN
    UPDATE learning_feedback
    SET times_validated = times_validated + 1,
        confidence_level = LEAST(confidence_level + 0.05, 1.0),
        last_validated_at = NOW()
    WHERE user_id = NEW.user_id
    AND pattern_type = 'USER_PREFERENCE'
    AND pattern_data->>'suggestion_type' = v_suggestion.suggestion_type;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per apprendimento automatico
CREATE TRIGGER trigger_learn_from_decision
  AFTER INSERT ON user_decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_from_decision();

-- Funzione per calcolare score AI complessivo
CREATE OR REPLACE FUNCTION get_ai_performance_score(p_user_id UUID)
RETURNS TABLE (
  total_suggestions BIGINT,
  accepted_suggestions BIGINT,
  rejected_suggestions BIGINT,
  modified_suggestions BIGINT,
  acceptance_rate DECIMAL,
  average_accuracy DECIMAL,
  average_satisfaction DECIMAL,
  performance_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH suggestion_stats AS (
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'ACCEPTED') as accepted,
      COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
      COUNT(*) FILTER (WHERE status = 'MODIFIED') as modified
    FROM ai_suggestions
    WHERE user_id = p_user_id
  ),
  metric_stats AS (
    SELECT
      AVG(accuracy_percentage) as avg_accuracy,
      AVG(user_satisfaction) as avg_satisfaction
    FROM success_metrics
    WHERE user_id = p_user_id
  )
  SELECT
    ss.total,
    ss.accepted,
    ss.rejected,
    ss.modified,
    CASE WHEN ss.total > 0 THEN (ss.accepted::DECIMAL / ss.total * 100) ELSE 0 END,
    COALESCE(ms.avg_accuracy, 0),
    COALESCE(ms.avg_satisfaction, 0) * 20, -- Convert 1-5 to 0-100
    -- Performance score: media ponderata di acceptance rate, accuracy e satisfaction
    (
      CASE WHEN ss.total > 0 THEN (ss.accepted::DECIMAL / ss.total * 100) ELSE 0 END * 0.3 +
      COALESCE(ms.avg_accuracy, 0) * 0.4 +
      COALESCE(ms.avg_satisfaction, 0) * 20 * 0.3
    )
  FROM suggestion_stats ss
  CROSS JOIN metric_stats ms;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTI E DOCUMENTAZIONE
-- =====================================================

COMMENT ON TABLE ai_suggestions IS 'Traccia tutti i suggerimenti AI generati per gli utenti';
COMMENT ON TABLE user_decisions IS 'Traccia le decisioni degli utenti sui suggerimenti AI';
COMMENT ON TABLE success_metrics IS 'Traccia i risultati effettivi vs predizioni AI';
COMMENT ON TABLE learning_feedback IS 'Sistema di apprendimento continuo basato su feedback utente';
COMMENT ON TABLE ai_transparency_log IS 'Log completo del processo decisionale AI per trasparenza';

COMMENT ON COLUMN ai_suggestions.reasoning IS 'Spiegazione in linguaggio naturale del ragionamento AI';
COMMENT ON COLUMN ai_suggestions.data_sources IS 'Fonti dati usate: weather, soil, plant_health, historical, etc.';
COMMENT ON COLUMN ai_suggestions.confidence_score IS 'Quanto l''AI è sicura di questo suggerimento (0-1)';
COMMENT ON COLUMN user_decisions.modifications IS 'Parametri modificati dall''utente rispetto al suggerimento AI';
COMMENT ON COLUMN success_metrics.accuracy_percentage IS 'Quanto era accurata la predizione AI (0-100%)';
COMMENT ON COLUMN learning_feedback.pattern_data IS 'Dati del pattern identificato per apprendimento futuro';
