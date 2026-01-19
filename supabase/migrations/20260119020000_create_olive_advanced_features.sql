-- ============================================================================
-- OLIVE GROVE ADVANCED FEATURES MIGRATION
-- Creates tables for Olive Maturity Tracking and Olive Fly Monitoring
-- ============================================================================

-- ============================================================================
-- OLIVE MATURITY TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS olive_maturity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  olive_grove_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  
  -- Invaiatura (Color Change)
  invaiatura_percentage DECIMAL(5, 2) NOT NULL CHECK (invaiatura_percentage >= 0 AND invaiatura_percentage <= 100),
  color_stage TEXT NOT NULL CHECK (color_stage IN ('green', 'yellow-green', 'purple-spots', 'purple', 'black')),
  
  -- Physical Parameters
  pulp_firmness TEXT CHECK (pulp_firmness IN ('very-hard', 'hard', 'medium', 'soft', 'very-soft')),
  detachment_force TEXT CHECK (detachment_force IN ('very-high', 'high', 'medium', 'low', 'very-low')),
  
  -- Oil Content Estimation
  estimated_oil_content DECIMAL(5, 2) CHECK (estimated_oil_content >= 0 AND estimated_oil_content <= 30),
  oil_quality_prediction TEXT CHECK (oil_quality_prediction IN ('excellent', 'good', 'fair', 'poor')),
  
  -- Maturity Index (Jaén Index 0-7)
  maturity_index DECIMAL(3, 1) CHECK (maturity_index >= 0 AND maturity_index <= 7),
  
  -- Harvest Recommendation
  harvest_recommendation TEXT CHECK (harvest_recommendation IN ('too-early', 'wait', 'optimal-oil', 'optimal-table', 'harvest-soon', 'overripe')),
  harvest_window_days INTEGER,
  
  -- Location and Notes
  location TEXT,
  variety TEXT,
  sample_size INTEGER,
  notes TEXT,
  photos TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_olive_maturity_grove ON olive_maturity_tracking(olive_grove_id);
CREATE INDEX IF NOT EXISTS idx_olive_maturity_date ON olive_maturity_tracking(measurement_date);

-- RLS Policies
ALTER TABLE olive_maturity_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their olive maturity data"
  ON olive_maturity_tracking FOR SELECT
  USING (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their olive maturity data"
  ON olive_maturity_tracking FOR INSERT
  WITH CHECK (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their olive maturity data"
  ON olive_maturity_tracking FOR UPDATE
  USING (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their olive maturity data"
  ON olive_maturity_tracking FOR DELETE
  USING (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- OLIVE FLY TRAPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS olive_fly_traps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  olive_grove_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  trap_code TEXT NOT NULL,
  trap_type TEXT NOT NULL CHECK (trap_type IN ('chromotropic', 'pheromone', 'food-bait', 'mcphail')),
  installation_date DATE NOT NULL,
  location TEXT NOT NULL,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_trap_code_per_grove UNIQUE (olive_grove_id, trap_code)
);

CREATE INDEX IF NOT EXISTS idx_olive_fly_traps_grove ON olive_fly_traps(olive_grove_id);
CREATE INDEX IF NOT EXISTS idx_olive_fly_traps_active ON olive_fly_traps(is_active);

-- RLS Policies
ALTER TABLE olive_fly_traps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their olive fly traps"
  ON olive_fly_traps FOR SELECT
  USING (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their olive fly traps"
  ON olive_fly_traps FOR INSERT
  WITH CHECK (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their olive fly traps"
  ON olive_fly_traps FOR UPDATE
  USING (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their olive fly traps"
  ON olive_fly_traps FOR DELETE
  USING (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- OLIVE FLY MONITORING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS olive_fly_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trap_id UUID REFERENCES olive_fly_traps(id) ON DELETE SET NULL,
  olive_grove_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  inspection_date DATE NOT NULL,
  
  -- Captures
  adults_captured INTEGER NOT NULL DEFAULT 0,
  females_captured INTEGER,
  males_captured INTEGER,
  
  -- Infestation Assessment
  olives_sampled INTEGER,
  olives_infested INTEGER,
  infestation_percentage DECIMAL(5, 2),
  
  -- Damage Level
  damage_level TEXT NOT NULL CHECK (damage_level IN ('none', 'low', 'medium', 'high', 'severe')),
  
  -- Intervention Threshold
  threshold_exceeded BOOLEAN DEFAULT false,
  intervention_recommended BOOLEAN DEFAULT false,
  intervention_urgency TEXT CHECK (intervention_urgency IN ('none', 'monitor', 'plan', 'immediate')),
  
  -- Weather Conditions
  temperature DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  
  -- Notes and Actions
  notes TEXT,
  treatment_applied BOOLEAN DEFAULT false,
  treatment_date DATE,
  treatment_product TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_olive_fly_monitoring_grove ON olive_fly_monitoring(olive_grove_id);
CREATE INDEX IF NOT EXISTS idx_olive_fly_monitoring_trap ON olive_fly_monitoring(trap_id);
CREATE INDEX IF NOT EXISTS idx_olive_fly_monitoring_date ON olive_fly_monitoring(inspection_date);
CREATE INDEX IF NOT EXISTS idx_olive_fly_monitoring_threshold ON olive_fly_monitoring(threshold_exceeded);

-- RLS Policies
ALTER TABLE olive_fly_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their olive fly monitoring"
  ON olive_fly_monitoring FOR SELECT
  USING (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their olive fly monitoring"
  ON olive_fly_monitoring FOR INSERT
  WITH CHECK (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their olive fly monitoring"
  ON olive_fly_monitoring FOR UPDATE
  USING (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their olive fly monitoring"
  ON olive_fly_monitoring FOR DELETE
  USING (
    olive_grove_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_olive_advanced_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_olive_maturity_updated_at
  BEFORE UPDATE ON olive_maturity_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_olive_advanced_updated_at();

CREATE TRIGGER update_olive_fly_traps_updated_at
  BEFORE UPDATE ON olive_fly_traps
  FOR EACH ROW
  EXECUTE FUNCTION update_olive_advanced_updated_at();

CREATE TRIGGER update_olive_fly_monitoring_updated_at
  BEFORE UPDATE ON olive_fly_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION update_olive_advanced_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE olive_maturity_tracking IS 'Tracks olive maturity parameters (invaiatura, oil content) for harvest timing';
COMMENT ON TABLE olive_fly_traps IS 'Manages olive fly monitoring traps (Bactrocera oleae)';
COMMENT ON TABLE olive_fly_monitoring IS 'Records olive fly captures and infestation levels';

COMMENT ON COLUMN olive_maturity_tracking.maturity_index IS 'Jaén Maturity Index (0-7). Optimal for oil: 2.0-3.5';
COMMENT ON COLUMN olive_maturity_tracking.invaiatura_percentage IS 'Percentage of olives changing color (0-100%)';
COMMENT ON COLUMN olive_fly_monitoring.threshold_exceeded IS 'True if captures exceed intervention threshold';
COMMENT ON COLUMN olive_fly_monitoring.infestation_percentage IS 'Percentage of infested olives. >10% requires intervention';
