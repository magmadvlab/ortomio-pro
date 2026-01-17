/**
 * Plant Monitoring System
 * Sistema completo per monitoraggio piante individuali con foto, maturazione, Brix e tracking cure
 * 
 * Data: 16 Gennaio 2026
 */

-- ============================================================================
-- TABELLA: plant_photos
-- Gestione foto piante con categorizzazione e analisi AI
-- ============================================================================

CREATE TABLE IF NOT EXISTS plant_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES garden_plants(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- URL foto
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Timestamp
  captured_at TIMESTAMPTZ NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Tipo foto
  photo_type TEXT NOT NULL CHECK (photo_type IN (
    'general',
    'health_issue',
    'treatment_before',
    'treatment_after',
    'maturity_check',
    'harvest',
    'growth_progress',
    'brix_measurement'
  )),
  
  -- Collegamento operazione (per before/after)
  linked_operation_id UUID REFERENCES plant_operations(id) ON DELETE SET NULL,
  is_before_photo BOOLEAN,
  
  -- Analisi AI (JSON)
  ai_analysis JSONB,
  -- Struttura: { healthScore, detectedIssues[], confidence, recommendations[], analyzedAt }
  
  -- Misurazione Brix (JSON)
  brix_measurement JSONB,
  -- Struttura: { value, measurementMethod, confidence, location, measuredAt }
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  location JSONB, -- { latitude, longitude }
  weather JSONB,  -- { temp, humidity, conditions }
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_plant_photos_plant_id ON plant_photos(plant_id);
CREATE INDEX idx_plant_photos_garden_id ON plant_photos(garden_id);
CREATE INDEX idx_plant_photos_captured_at ON plant_photos(captured_at DESC);
CREATE INDEX idx_plant_photos_photo_type ON plant_photos(photo_type);
CREATE INDEX idx_plant_photos_linked_operation ON plant_photos(linked_operation_id) WHERE linked_operation_id IS NOT NULL;

-- Trigger per updated_at
CREATE TRIGGER update_plant_photos_updated_at
  BEFORE UPDATE ON plant_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE plant_photos IS 'Foto piante con categorizzazione e analisi AI';

-- ============================================================================
-- TABELLA: maturity_stages
-- Tracking stati maturazione progressivi
-- ============================================================================

CREATE TABLE IF NOT EXISTS maturity_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES garden_plants(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Stadio fenologico
  stage TEXT NOT NULL CHECK (stage IN (
    'seedling',
    'vegetative',
    'flowering',
    'fruit_set',
    'immature',
    'veraison',
    'mature',
    'overripe',
    'senescent'
  )),
  
  -- Percentuale maturazione
  maturity_percentage INTEGER NOT NULL CHECK (maturity_percentage BETWEEN 0 AND 100),
  
  -- Indicatori specifici (JSON)
  indicators JSONB,
  -- Struttura: { colorChange, firmness, size, sugarContent, acidity, aroma }
  
  -- Stima raccolta
  days_to_optimal_harvest INTEGER,
  optimal_harvest_date DATE,
  
  -- Foto associate
  photo_ids UUID[],
  
  -- Metadata
  assessed_at TIMESTAMPTZ NOT NULL,
  assessed_by TEXT NOT NULL CHECK (assessed_by IN ('user', 'ai', 'sensor')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_maturity_stages_plant_id ON maturity_stages(plant_id);
CREATE INDEX idx_maturity_stages_garden_id ON maturity_stages(garden_id);
CREATE INDEX idx_maturity_stages_assessed_at ON maturity_stages(assessed_at DESC);
CREATE INDEX idx_maturity_stages_stage ON maturity_stages(stage);

COMMENT ON TABLE maturity_stages IS 'Stati maturazione progressivi per piante';

-- ============================================================================
-- TABELLA: treatment_tracking
-- Tracking cure con foto before/after
-- ============================================================================

CREATE TABLE IF NOT EXISTS treatment_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES garden_plants(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  operation_id UUID NOT NULL REFERENCES plant_operations(id) ON DELETE CASCADE,
  
  -- Issue identificato (JSON)
  issue JSONB NOT NULL,
  -- Struttura: { type, name, severity, detectedAt, detectionMethod }
  
  -- Foto before
  before_photos UUID[] NOT NULL,
  
  -- Trattamento applicato (JSON)
  treatment JSONB NOT NULL,
  -- Struttura: { productName, activeIngredient, dosage, unit, applicationMethod, appliedAt }
  
  -- Foto after (array di oggetti JSON)
  after_photos JSONB[] DEFAULT ARRAY[]::JSONB[],
  -- Struttura: [{ photoId, daysAfterTreatment, improvementScore, notes }]
  
  -- Outcome (JSON)
  outcome JSONB,
  -- Struttura: { status, finalHealthScore, daysToResolution, effectiveness, notes }
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_treatment_tracking_plant_id ON treatment_tracking(plant_id);
CREATE INDEX idx_treatment_tracking_garden_id ON treatment_tracking(garden_id);
CREATE INDEX idx_treatment_tracking_operation_id ON treatment_tracking(operation_id);
CREATE INDEX idx_treatment_tracking_created_at ON treatment_tracking(created_at DESC);

-- Trigger per updated_at
CREATE TRIGGER update_treatment_tracking_updated_at
  BEFORE UPDATE ON treatment_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE treatment_tracking IS 'Tracking trattamenti con foto before/after';

-- ============================================================================
-- TABELLA: brix_history
-- Storico misurazioni gradi Brix
-- ============================================================================

CREATE TABLE IF NOT EXISTS brix_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES garden_plants(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Misurazione
  brix_value DECIMAL(4,1) NOT NULL CHECK (brix_value BETWEEN 0 AND 30),
  measurement_date TIMESTAMPTZ NOT NULL,
  
  -- Metodo
  method TEXT NOT NULL CHECK (method IN ('refractometer', 'ai_estimation', 'manual')),
  confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
  
  -- Campione frutto (JSON)
  fruit_sample JSONB NOT NULL,
  -- Struttura: { location, fruitNumber, fruitSize, fruitColor }
  
  -- Condizioni (JSON)
  weather JSONB,
  -- Struttura: { temp, humidity, lastRainDays }
  
  -- Foto associata
  photo_id UUID REFERENCES plant_photos(id) ON DELETE SET NULL,
  
  -- Metadata
  measured_by TEXT NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_brix_history_plant_id ON brix_history(plant_id);
CREATE INDEX idx_brix_history_garden_id ON brix_history(garden_id);
CREATE INDEX idx_brix_history_measurement_date ON brix_history(measurement_date DESC);
CREATE INDEX idx_brix_history_method ON brix_history(method);

COMMENT ON TABLE brix_history IS 'Storico misurazioni gradi Brix';

-- ============================================================================
-- TABELLA: harvest_recommendations
-- Raccomandazioni raccolta basate su Brix e maturazione
-- ============================================================================

CREATE TABLE IF NOT EXISTS harvest_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES garden_plants(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Raccomandazione
  recommended_date DATE NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  
  -- Motivi (array di oggetti JSON)
  reasons JSONB[] NOT NULL,
  -- Struttura: [{ factor, value, weight, description }]
  
  -- Finestra ottimale (JSON)
  optimal_window JSONB NOT NULL,
  -- Struttura: { startDate, endDate, peakDate }
  
  -- Qualità attesa (JSON)
  expected_quality JSONB NOT NULL,
  -- Struttura: { grade, brixRange, shelfLife, marketValue }
  
  -- Rischi (array di oggetti JSON)
  risks JSONB[],
  -- Struttura: [{ type, severity, description, mitigation }]
  
  -- Metadata
  generated_at TIMESTAMPTZ NOT NULL,
  generated_by TEXT NOT NULL CHECK (generated_by IN ('ai', 'agronomist', 'system')),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_harvest_recommendations_plant_id ON harvest_recommendations(plant_id);
CREATE INDEX idx_harvest_recommendations_garden_id ON harvest_recommendations(garden_id);
CREATE INDEX idx_harvest_recommendations_recommended_date ON harvest_recommendations(recommended_date);
CREATE INDEX idx_harvest_recommendations_generated_at ON harvest_recommendations(generated_at DESC);

-- Trigger per last_updated
CREATE TRIGGER update_harvest_recommendations_last_updated
  BEFORE UPDATE ON harvest_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE harvest_recommendations IS 'Raccomandazioni raccolta basate su AI';

-- ============================================================================
-- RLS POLICIES
-- Row Level Security per tutte le tabelle
-- ============================================================================

-- Enable RLS
ALTER TABLE plant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE maturity_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE brix_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_recommendations ENABLE ROW LEVEL SECURITY;

-- plant_photos policies
CREATE POLICY "Users can view their own plant photos"
  ON plant_photos FOR SELECT
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own plant photos"
  ON plant_photos FOR INSERT
  WITH CHECK (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own plant photos"
  ON plant_photos FOR UPDATE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own plant photos"
  ON plant_photos FOR DELETE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

-- maturity_stages policies
CREATE POLICY "Users can view their own maturity stages"
  ON maturity_stages FOR SELECT
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own maturity stages"
  ON maturity_stages FOR INSERT
  WITH CHECK (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own maturity stages"
  ON maturity_stages FOR UPDATE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own maturity stages"
  ON maturity_stages FOR DELETE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

-- treatment_tracking policies
CREATE POLICY "Users can view their own treatment tracking"
  ON treatment_tracking FOR SELECT
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own treatment tracking"
  ON treatment_tracking FOR INSERT
  WITH CHECK (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own treatment tracking"
  ON treatment_tracking FOR UPDATE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own treatment tracking"
  ON treatment_tracking FOR DELETE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

-- brix_history policies
CREATE POLICY "Users can view their own brix history"
  ON brix_history FOR SELECT
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own brix history"
  ON brix_history FOR INSERT
  WITH CHECK (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own brix history"
  ON brix_history FOR UPDATE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own brix history"
  ON brix_history FOR DELETE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

-- harvest_recommendations policies
CREATE POLICY "Users can view their own harvest recommendations"
  ON harvest_recommendations FOR SELECT
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own harvest recommendations"
  ON harvest_recommendations FOR INSERT
  WITH CHECK (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own harvest recommendations"
  ON harvest_recommendations FOR UPDATE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own harvest recommendations"
  ON harvest_recommendations FOR DELETE
  USING (garden_id IN (
    SELECT id FROM gardens WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- FUNZIONI HELPER
-- ============================================================================

-- Funzione per calcolare trend Brix
CREATE OR REPLACE FUNCTION calculate_brix_trend(p_plant_id UUID)
RETURNS TABLE (
  current_brix DECIMAL,
  average_brix DECIMAL,
  min_brix DECIMAL,
  max_brix DECIMAL,
  trend TEXT,
  weekly_increase DECIMAL,
  measurement_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH brix_data AS (
    SELECT
      brix_value,
      measurement_date,
      ROW_NUMBER() OVER (ORDER BY measurement_date DESC) as rn
    FROM brix_history
    WHERE plant_id = p_plant_id
    ORDER BY measurement_date DESC
  ),
  stats AS (
    SELECT
      (SELECT brix_value FROM brix_data WHERE rn = 1) as current_val,
      AVG(brix_value) as avg_val,
      MIN(brix_value) as min_val,
      MAX(brix_value) as max_val,
      COUNT(*) as count_val
    FROM brix_data
  ),
  trend_calc AS (
    SELECT
      CASE
        WHEN COUNT(*) >= 2 THEN
          ((SELECT brix_value FROM brix_data WHERE rn = 1) - 
           (SELECT brix_value FROM brix_data WHERE rn = 2)) /
          NULLIF(EXTRACT(EPOCH FROM (
            (SELECT measurement_date FROM brix_data WHERE rn = 1) - 
            (SELECT measurement_date FROM brix_data WHERE rn = 2)
          )) / 86400, 0) * 7
        ELSE 0
      END as weekly_inc
    FROM brix_data
  )
  SELECT
    ROUND(stats.current_val, 1),
    ROUND(stats.avg_val, 1),
    ROUND(stats.min_val, 1),
    ROUND(stats.max_val, 1),
    CASE
      WHEN trend_calc.weekly_inc > 0.5 THEN 'increasing'
      WHEN trend_calc.weekly_inc < -0.5 THEN 'decreasing'
      ELSE 'stable'
    END,
    ROUND(trend_calc.weekly_inc, 1),
    stats.count_val::INTEGER
  FROM stats, trend_calc;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_brix_trend IS 'Calcola trend Brix per una pianta';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON plant_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON maturity_stages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON treatment_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON brix_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON harvest_recommendations TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION calculate_brix_trend TO authenticated;

-- ============================================================================
-- FINE MIGRATION
-- ============================================================================
