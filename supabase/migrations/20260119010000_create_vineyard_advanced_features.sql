-- ============================================================================
-- VINEYARD ADVANCED FEATURES MIGRATION
-- Creates tables for Ravaz Index, Grape Maturity Tracking, and Green Operations
-- ============================================================================

-- ============================================================================
-- BUD LOAD AND RAVAZ INDEX TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vineyard_bud_load (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vineyard_id UUID NOT NULL REFERENCES vineyard_configurations(id) ON DELETE CASCADE,
  season TEXT NOT NULL, -- e.g., "2025-2026"
  pruning_date DATE NOT NULL,
  pruning_wood_weight DECIMAL(10, 2) NOT NULL, -- kg
  harvest_date DATE,
  grape_yield DECIMAL(10, 2) NOT NULL, -- kg
  ravaz_index DECIMAL(10, 2), -- Calculated: grape_yield / pruning_wood_weight
  buds_per_vine INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_vineyard_season UNIQUE (vineyard_id, season)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_vineyard_bud_load_vineyard ON vineyard_bud_load(vineyard_id);
CREATE INDEX IF NOT EXISTS idx_vineyard_bud_load_season ON vineyard_bud_load(season);

-- RLS Policies
ALTER TABLE vineyard_bud_load ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their vineyard bud load data"
  ON vineyard_bud_load FOR SELECT
  USING (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their vineyard bud load data"
  ON vineyard_bud_load FOR INSERT
  WITH CHECK (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their vineyard bud load data"
  ON vineyard_bud_load FOR UPDATE
  USING (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their vineyard bud load data"
  ON vineyard_bud_load FOR DELETE
  USING (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- GRAPE MATURITY TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vineyard_maturity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vineyard_id UUID NOT NULL REFERENCES vineyard_configurations(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  brix DECIMAL(5, 2) NOT NULL, -- °Brix (sugar content)
  ph DECIMAL(4, 2),
  total_acidity DECIMAL(5, 2), -- g/L
  malic_acid DECIMAL(5, 2), -- g/L
  tartaric_acid DECIMAL(5, 2), -- g/L
  estimated_alcohol DECIMAL(5, 2), -- % vol (calculated from Brix)
  berry_weight DECIMAL(5, 2), -- grams
  berry_color TEXT CHECK (berry_color IN ('green', 'yellow', 'pink', 'red', 'purple', 'black')),
  tasting_notes TEXT,
  harvest_recommendation TEXT CHECK (harvest_recommendation IN ('too-early', 'wait', 'optimal', 'harvest-soon', 'overripe')),
  location TEXT, -- zone or block
  variety TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vineyard_maturity_vineyard ON vineyard_maturity_tracking(vineyard_id);
CREATE INDEX IF NOT EXISTS idx_vineyard_maturity_date ON vineyard_maturity_tracking(measurement_date);

-- RLS Policies
ALTER TABLE vineyard_maturity_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their vineyard maturity data"
  ON vineyard_maturity_tracking FOR SELECT
  USING (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their vineyard maturity data"
  ON vineyard_maturity_tracking FOR INSERT
  WITH CHECK (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their vineyard maturity data"
  ON vineyard_maturity_tracking FOR UPDATE
  USING (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their vineyard maturity data"
  ON vineyard_maturity_tracking FOR DELETE
  USING (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- GREEN OPERATIONS TABLE (Defoliation, Topping, Thinning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vineyard_green_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vineyard_id UUID NOT NULL REFERENCES vineyard_configurations(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('defoliation', 'topping', 'shoot-thinning', 'cluster-thinning')),
  operation_date DATE NOT NULL,
  intensity TEXT CHECK (intensity IN ('light', 'medium', 'heavy')),
  zone TEXT CHECK (zone IN ('basal', 'apical', 'lateral', 'all')),
  affected_vines INTEGER,
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2),
  operator TEXT,
  notes TEXT,
  photos TEXT[], -- Array of photo URLs
  
  -- Defoliation specific
  leaves_removed TEXT CHECK (leaves_removed IN ('basal', 'apical', 'both')),
  timing TEXT CHECK (timing IN ('pre-flowering', 'fruit-set', 'veraison', 'pre-harvest')),
  
  -- Topping/Shoot thinning specific
  shoots_removed INTEGER,
  height_reduction_cm INTEGER,
  vigor_control TEXT CHECK (vigor_control IN ('low', 'medium', 'high')),
  
  -- Cluster thinning specific
  clusters_per_vine INTEGER,
  clusters_removed INTEGER,
  target_yield_kg DECIMAL(10, 2),
  quality_goal TEXT CHECK (quality_goal IN ('standard', 'premium', 'reserve')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vineyard_green_ops_vineyard ON vineyard_green_operations(vineyard_id);
CREATE INDEX IF NOT EXISTS idx_vineyard_green_ops_type ON vineyard_green_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_vineyard_green_ops_date ON vineyard_green_operations(operation_date);

-- RLS Policies
ALTER TABLE vineyard_green_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their vineyard green operations"
  ON vineyard_green_operations FOR SELECT
  USING (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their vineyard green operations"
  ON vineyard_green_operations FOR INSERT
  WITH CHECK (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their vineyard green operations"
  ON vineyard_green_operations FOR UPDATE
  USING (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their vineyard green operations"
  ON vineyard_green_operations FOR DELETE
  USING (
    vineyard_id IN (
      SELECT id FROM vineyard_configurations
      WHERE garden_id IN (
        SELECT id FROM gardens WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_vineyard_advanced_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vineyard_bud_load_updated_at
  BEFORE UPDATE ON vineyard_bud_load
  FOR EACH ROW
  EXECUTE FUNCTION update_vineyard_advanced_updated_at();

CREATE TRIGGER update_vineyard_maturity_updated_at
  BEFORE UPDATE ON vineyard_maturity_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_vineyard_advanced_updated_at();

CREATE TRIGGER update_vineyard_green_ops_updated_at
  BEFORE UPDATE ON vineyard_green_operations
  FOR EACH ROW
  EXECUTE FUNCTION update_vineyard_advanced_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE vineyard_bud_load IS 'Tracks bud load and Ravaz Index for vineyard balance management';
COMMENT ON TABLE vineyard_maturity_tracking IS 'Tracks grape maturity parameters (Brix, pH, acidity) for harvest timing';
COMMENT ON TABLE vineyard_green_operations IS 'Tracks green operations (defoliation, topping, thinning) for vineyard management';

COMMENT ON COLUMN vineyard_bud_load.ravaz_index IS 'Ravaz Index = grape_yield / pruning_wood_weight. Optimal: 5-10';
COMMENT ON COLUMN vineyard_maturity_tracking.brix IS 'Sugar content in degrees Brix. Wine grapes: 18-26°Bx';
COMMENT ON COLUMN vineyard_maturity_tracking.estimated_alcohol IS 'Estimated alcohol content (% vol) = Brix * 0.6';
