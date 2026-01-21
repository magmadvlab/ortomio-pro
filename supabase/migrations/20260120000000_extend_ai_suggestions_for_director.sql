-- ============================================================================
-- EXTEND AI SUGGESTIONS FOR DIRECTOR SERVICE
-- Data: 2026-01-20
-- Descrizione: Estende ai_suggestions con campi per prioritizzazione Director
-- ============================================================================

-- Aggiungi campi per prioritizzazione Director
ALTER TABLE ai_suggestions 
  ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  ADD COLUMN IF NOT EXISTS urgency_breakdown JSONB DEFAULT '{"urgency": 0, "impact": 0, "feasibility": 0, "cost": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS conflicts_with UUID[],
  ADD COLUMN IF NOT EXISTS sequencing_order INTEGER,
  ADD COLUMN IF NOT EXISTS coordinated_by TEXT,
  ADD COLUMN IF NOT EXISTS coordination_timestamp TIMESTAMPTZ;

-- Aggiungi indici per performance
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_priority_score 
  ON ai_suggestions(priority_score DESC) 
  WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_coordinated 
  ON ai_suggestions(coordinated_by, coordination_timestamp DESC);

-- Commenti
COMMENT ON COLUMN ai_suggestions.priority_score IS 'Score priorità calcolato da Director (0-100)';
COMMENT ON COLUMN ai_suggestions.urgency_breakdown IS 'Breakdown score: urgency, impact, feasibility, cost';
COMMENT ON COLUMN ai_suggestions.conflicts_with IS 'Array di IDs suggerimenti in conflitto';
COMMENT ON COLUMN ai_suggestions.sequencing_order IS 'Ordine sequenziamento azioni';
COMMENT ON COLUMN ai_suggestions.coordinated_by IS 'Chi ha coordinato: director_service, manual, etc';

-- ============================================================================
-- TRIGGER: Auto-calcola priority score
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_calculate_priority()
RETURNS TRIGGER AS $$
DECLARE
  v_urgency INTEGER := 0;
  v_impact INTEGER := 0;
  v_feasibility INTEGER := 0;
  v_cost INTEGER := 0;
BEGIN
  -- Calcola urgency (0-40)
  CASE NEW.action_priority
    WHEN 'CRITICAL' THEN v_urgency := 40;
    WHEN 'HIGH' THEN v_urgency := 30;
    WHEN 'MEDIUM' THEN v_urgency := 20;
    WHEN 'LOW' THEN v_urgency := 10;
    ELSE v_urgency := 15;
  END CASE;
  
  -- Calcola impact (0-30) basato su confidence
  v_impact := COALESCE(FLOOR(NEW.confidence_score * 30), 15);
  
  -- Feasibility (0-20) - default alto
  v_feasibility := 18;
  
  -- Cost (0-10) - default medio
  v_cost := 7;
  
  -- Calcola priority score totale
  NEW.priority_score := v_urgency + v_impact + v_feasibility + v_cost;
  
  -- Salva breakdown
  NEW.urgency_breakdown := jsonb_build_object(
    'urgency', v_urgency,
    'impact', v_impact,
    'feasibility', v_feasibility,
    'cost', v_cost
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_suggestions_priority ON ai_suggestions;
CREATE TRIGGER trigger_ai_suggestions_priority
  BEFORE INSERT OR UPDATE ON ai_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_priority();

COMMENT ON TRIGGER trigger_ai_suggestions_priority ON ai_suggestions IS 'Auto-calcola priority score e breakdown';

-- ============================================================================
-- VIEW: Suggerimenti prioritizzati
-- ============================================================================

CREATE OR REPLACE VIEW ai_suggestions_prioritized AS
SELECT 
  s.*,
  CASE 
    WHEN s.priority_score >= 80 THEN 'CRITICAL'
    WHEN s.priority_score >= 60 THEN 'HIGH'
    WHEN s.priority_score >= 40 THEN 'MEDIUM'
    ELSE 'LOW'
  END as computed_priority
FROM ai_suggestions s
WHERE s.status = 'PENDING'
ORDER BY s.priority_score DESC, s.created_at DESC;

COMMENT ON VIEW ai_suggestions_prioritized IS 'Vista suggerimenti ordinati per priorità';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Director Service extensions applied successfully';
  RAISE NOTICE '📊 Added columns: priority_score, urgency_breakdown, conflicts_with, sequencing_order';
  RAISE NOTICE '🔧 Created trigger: trigger_calculate_priority';
  RAISE NOTICE '👁️  Created view: ai_suggestions_prioritized';
END $$;
