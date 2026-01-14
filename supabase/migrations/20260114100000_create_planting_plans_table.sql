-- =====================================================
-- PLANTING PLANS TABLE
-- Tabella per pianificazione coltivazioni con rotazione
-- =====================================================

CREATE TABLE IF NOT EXISTS planting_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL,
  field_row_section_id UUID REFERENCES field_row_sections(id) ON DELETE SET NULL,
  
  -- Plant info
  plant_variety_id UUID REFERENCES plant_varieties(id) ON DELETE SET NULL,
  plant_name TEXT NOT NULL,
  plant_family TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Dates
  planned_planting_date DATE NOT NULL,
  planned_harvest_date DATE,
  actual_planting_date DATE,
  actual_harvest_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN (
    'PLANNED', 'PLANTED', 'GROWING', 'HARVESTED', 'CANCELLED'
  )),
  
  -- Rotation integration
  rotation_plan_id UUID REFERENCES crop_rotation_plans(id) ON DELETE SET NULL,
  follows_rotation_advice BOOLEAN DEFAULT false,
  rotation_score INTEGER CHECK (rotation_score >= 0 AND rotation_score <= 100),
  rotation_warnings TEXT[],
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_planting_plans_garden ON planting_plans(garden_id);
CREATE INDEX idx_planting_plans_field_row ON planting_plans(field_row_id);
CREATE INDEX idx_planting_plans_zone ON planting_plans(zone_id);
CREATE INDEX idx_planting_plans_status ON planting_plans(status);
CREATE INDEX idx_planting_plans_planned_date ON planting_plans(planned_planting_date);
CREATE INDEX idx_planting_plans_rotation ON planting_plans(rotation_plan_id);

-- RLS
ALTER TABLE planting_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage planting plans" ON planting_plans
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_planting_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_planting_plans_updated_at
  BEFORE UPDATE ON planting_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_planting_plans_updated_at();

-- Function to check rotation compatibility
CREATE OR REPLACE FUNCTION check_rotation_compatibility(
  p_field_row_id UUID,
  p_plant_family TEXT
) RETURNS JSONB AS $$
DECLARE
  v_last_family TEXT;
  v_result JSONB;
BEGIN
  -- Get last crop family from history
  SELECT plant_family INTO v_last_family
  FROM crop_rotation_history
  WHERE field_row_id = p_field_row_id
  AND harvest_date IS NOT NULL
  ORDER BY harvest_date DESC
  LIMIT 1;
  
  IF v_last_family IS NULL THEN
    -- No history, all good
    v_result := jsonb_build_object(
      'compatible', true,
      'score', 100,
      'warnings', ARRAY[]::TEXT[]
    );
  ELSIF v_last_family = p_plant_family THEN
    -- Same family, not recommended
    v_result := jsonb_build_object(
      'compatible', false,
      'score', 20,
      'warnings', ARRAY[
        'Stessa famiglia botanica del raccolto precedente',
        'Rischio accumulo patogeni specifici',
        'Consigliato alternare con famiglia diversa'
      ]
    );
  ELSE
    -- Different family, good
    v_result := jsonb_build_object(
      'compatible', true,
      'score', 80,
      'warnings', ARRAY[]::TEXT[]
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for calendar display
CREATE OR REPLACE VIEW planting_calendar AS
SELECT 
  pp.id,
  pp.garden_id,
  pp.plant_name,
  pp.plant_family,
  pp.quantity,
  pp.planned_planting_date,
  pp.planned_harvest_date,
  pp.actual_planting_date,
  pp.actual_harvest_date,
  pp.status,
  pp.follows_rotation_advice,
  pp.rotation_score,
  pp.rotation_warnings,
  g.name as garden_name,
  z.name as zone_name,
  fr.name as field_row_name,
  frs.name as section_name
FROM planting_plans pp
LEFT JOIN gardens g ON pp.garden_id = g.id
LEFT JOIN zones z ON pp.zone_id = z.id
LEFT JOIN field_rows fr ON pp.field_row_id = fr.id
LEFT JOIN field_row_sections frs ON pp.field_row_section_id = frs.id
ORDER BY pp.planned_planting_date;
