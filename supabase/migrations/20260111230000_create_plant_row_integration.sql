-- =====================================================
-- PLANT_ROW_INTEGRATION
-- Auto-generated migration for missing database objects
-- Generated: 2026-01-11T13:34:02.642Z
-- =====================================================

-- MISSING TABLES
-- The following tables are missing and will be created:
-- - operation_sync_log

-- =====================================================
-- PLANT-ROW INTEGRATION MIGRATION
-- Connects individual plant tracking with row tracking
-- =====================================================

-- 1. EXTEND INDIVIDUAL PLANTS SCHEMA
-- Connect plants to rows (garden_rows or field_rows)
ALTER TABLE individual_plants 
ADD COLUMN garden_row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL,
ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;

-- Constraint: plant can only be in one type of row
ALTER TABLE individual_plants 
ADD CONSTRAINT check_single_row_type 
CHECK (
  (garden_row_id IS NOT NULL AND field_row_id IS NULL) OR
  (garden_row_id IS NULL AND field_row_id IS NOT NULL) OR
  (garden_row_id IS NULL AND field_row_id IS NULL)
);

-- Index for performance
CREATE INDEX idx_individual_plants_garden_row_id ON individual_plants(garden_row_id);
CREATE INDEX idx_individual_plants_field_row_id ON individual_plants(field_row_id);

-- 2. EXTEND PLANT OPERATIONS SCHEMA  
-- Connect plant operations to source row operations
ALTER TABLE plant_operations
ADD COLUMN source_watering_log_id UUID REFERENCES watering_logs(id) ON DELETE SET NULL,
ADD COLUMN source_fertilizer_log_id UUID REFERENCES fertilizer_application_logs(id) ON DELETE SET NULL,
ADD COLUMN source_treatment_id UUID REFERENCES treatment_register(id) ON DELETE SET NULL,
ADD COLUMN auto_generated BOOLEAN DEFAULT FALSE;

-- Index for tracking source operations
CREATE INDEX idx_plant_operations_source_watering ON plant_operations(source_watering_log_id);
CREATE INDEX idx_plant_operations_source_fertilizer ON plant_operations(source_fertilizer_log_id);
CREATE INDEX idx_plant_operations_source_treatment ON plant_operations(source_treatment_id);
CREATE INDEX idx_plant_operations_auto_generated ON plant_operations(auto_generated);

-- 3. EXTEND PLANT HARVESTS SCHEMA
-- Connect harvests to source operations if needed
ALTER TABLE plant_harvests
ADD COLUMN source_operation_id UUID REFERENCES plant_operations(id) ON DELETE SET NULL;

-- 4. CREATE OPERATION SYNC TRACKING TABLE
-- Track synchronization between row and plant operations
CREATE TABLE operation_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source operation (row level)
  source_type TEXT NOT NULL CHECK (source_type IN ('watering', 'fertilizer', 'treatment')),
  source_operation_id UUID NOT NULL,
  
  -- Target operations (plant level)
  plants_affected INTEGER NOT NULL DEFAULT 0,
  operations_created INTEGER NOT NULL DEFAULT 0,
  
  -- Sync metadata
  sync_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_status TEXT NOT NULL DEFAULT 'completed' CHECK (sync_status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  
  -- Garden context
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for sync tracking
CREATE INDEX idx_operation_sync_log_source ON operation_sync_log(source_type, source_operation_id);
CREATE INDEX idx_operation_sync_log_garden ON operation_sync_log(garden_id);
CREATE INDEX idx_operation_sync_log_date ON operation_sync_log(sync_date);

-- 5. CREATE FUNCTIONS FOR AUTO-SYNC

-- Function to get plants in a row
CREATE OR REPLACE FUNCTION get_plants_in_row(
  p_garden_row_id UUID DEFAULT NULL,
  p_field_row_id UUID DEFAULT NULL
) RETURNS TABLE (
  plant_id UUID,
  plant_code TEXT,
  plant_name TEXT,
  position_in_row INTEGER
) AS $$
BEGIN
  IF p_garden_row_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      ip.id,
      ip.plant_code,
      ip.plant_name,
      ip.position_in_row
    FROM individual_plants ip
    WHERE ip.garden_row_id = p_garden_row_id
      AND ip.status NOT IN ('dead', 'harvested')
    ORDER BY ip.position_in_row;
  ELSIF p_field_row_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      ip.id,
      ip.plant_code,
      ip.plant_name,
      ip.position_in_row
    FROM individual_plants ip
    WHERE ip.field_row_id = p_field_row_id
      AND ip.status NOT IN ('dead', 'harvested')
    ORDER BY ip.position_in_row;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to sync watering operations to plants
CREATE OR REPLACE FUNCTION sync_watering_to_plants(
  p_watering_log_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_watering_log watering_logs%ROWTYPE;
  v_plant RECORD;
  v_operations_created INTEGER := 0;
  v_plants_affected INTEGER := 0;
BEGIN
  -- Get watering log details
  SELECT * INTO v_watering_log
  FROM watering_logs
  WHERE id = p_watering_log_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Get plants in the row
  FOR v_plant IN 
    SELECT * FROM get_plants_in_row(
      CASE WHEN v_watering_log.row_id IS NOT NULL THEN v_watering_log.row_id END,
      CASE WHEN v_watering_log.field_row_id IS NOT NULL THEN v_watering_log.field_row_id END
    )
  LOOP
    -- Create plant operation
    INSERT INTO plant_operations (
      plant_id,
      garden_id,
      operation_type,
      operation_category,
      operation_date,
      operation_time,
      quantity,
      unit,
      notes,
      source_watering_log_id,
      auto_generated,
      created_at,
      updated_at
    ) VALUES (
      v_plant.plant_id,
      v_watering_log.garden_id,
      'watering',
      'irrigation',
      v_watering_log.date,
      EXTRACT(HOUR FROM v_watering_log.watered_at)::TEXT || ':' || 
      LPAD(EXTRACT(MINUTE FROM v_watering_log.watered_at)::TEXT, 2, '0'),
      v_watering_log.liters_applied,
      'L',
      'Auto-generato da irrigazione filare: ' || COALESCE(v_watering_log.notes, ''),
      p_watering_log_id,
      TRUE,
      NOW(),
      NOW()
    );
    
    v_operations_created := v_operations_created + 1;
    v_plants_affected := v_plants_affected + 1;
  END LOOP;
  
  -- Log sync operation
  INSERT INTO operation_sync_log (
    source_type,
    source_operation_id,
    plants_affected,
    operations_created,
    garden_id
  ) VALUES (
    'watering',
    p_watering_log_id,
    v_plants_affected,
    v_operations_created,
    v_watering_log.garden_id
  );
  
  RETURN v_operations_created;
END;
$$ LANGUAGE plpgsql;

-- Function to sync fertilizer operations to plants
CREATE OR REPLACE FUNCTION sync_fertilizer_to_plants(
  p_fertilizer_log_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_fertilizer_log fertilizer_application_logs%ROWTYPE;
  v_plant RECORD;
  v_operations_created INTEGER := 0;
  v_plants_affected INTEGER := 0;
  v_quantity_per_plant NUMERIC;
BEGIN
  -- Get fertilizer log details
  SELECT * INTO v_fertilizer_log
  FROM fertilizer_application_logs
  WHERE id = p_fertilizer_log_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Count plants in row first
  SELECT COUNT(*) INTO v_plants_affected
  FROM get_plants_in_row(
    CASE WHEN v_fertilizer_log.bed_row_id IS NOT NULL THEN v_fertilizer_log.bed_row_id END,
    CASE WHEN v_fertilizer_log.field_row_id IS NOT NULL THEN v_fertilizer_log.field_row_id END
  );
  
  IF v_plants_affected = 0 THEN
    RETURN 0;
  END IF;
  
  -- Calculate quantity per plant
  v_quantity_per_plant := COALESCE(v_fertilizer_log.dosage_amount, 0) / v_plants_affected;
  
  -- Get plants in the row
  FOR v_plant IN 
    SELECT * FROM get_plants_in_row(
      CASE WHEN v_fertilizer_log.bed_row_id IS NOT NULL THEN v_fertilizer_log.bed_row_id END,
      CASE WHEN v_fertilizer_log.field_row_id IS NOT NULL THEN v_fertilizer_log.field_row_id END
    )
  LOOP
    -- Create plant operation
    INSERT INTO plant_operations (
      plant_id,
      garden_id,
      operation_type,
      operation_category,
      operation_date,
      quantity,
      unit,
      product_name,
      notes,
      source_fertilizer_log_id,
      auto_generated,
      created_at,
      updated_at
    ) VALUES (
      v_plant.plant_id,
      v_fertilizer_log.garden_id,
      'fertilizing',
      'nutrition',
      v_fertilizer_log.application_date,
      v_quantity_per_plant,
      v_fertilizer_log.dosage_unit,
      v_fertilizer_log.fertilizer_product_name,
      'Auto-generato da fertilizzazione filare: ' || COALESCE(v_fertilizer_log.notes, ''),
      p_fertilizer_log_id,
      TRUE,
      NOW(),
      NOW()
    );
    
    v_operations_created := v_operations_created + 1;
  END LOOP;
  
  -- Log sync operation
  INSERT INTO operation_sync_log (
    source_type,
    source_operation_id,
    plants_affected,
    operations_created,
    garden_id
  ) VALUES (
    'fertilizer',
    p_fertilizer_log_id,
    v_plants_affected,
    v_operations_created,
    v_fertilizer_log.garden_id
  );
  
  RETURN v_operations_created;
END;
$$ LANGUAGE plpgsql;

-- Function to sync treatment operations to plants
CREATE OR REPLACE FUNCTION sync_treatment_to_plants(
  p_treatment_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_treatment treatment_register%ROWTYPE;
  v_plant RECORD;
  v_operations_created INTEGER := 0;
  v_plants_affected INTEGER := 0;
  v_quantity_per_plant NUMERIC;
BEGIN
  -- Get treatment details
  SELECT * INTO v_treatment
  FROM treatment_register
  WHERE id = p_treatment_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Count plants in row first
  SELECT COUNT(*) INTO v_plants_affected
  FROM get_plants_in_row(
    CASE WHEN v_treatment.bed_row_id IS NOT NULL THEN v_treatment.bed_row_id END,
    CASE WHEN v_treatment.field_row_id IS NOT NULL THEN v_treatment.field_row_id END
  );
  
  IF v_plants_affected = 0 THEN
    RETURN 0;
  END IF;
  
  -- Calculate quantity per plant
  v_quantity_per_plant := COALESCE(v_treatment.dosage, 0) / v_plants_affected;
  
  -- Get plants in the row
  FOR v_plant IN 
    SELECT * FROM get_plants_in_row(
      CASE WHEN v_treatment.bed_row_id IS NOT NULL THEN v_treatment.bed_row_id END,
      CASE WHEN v_treatment.field_row_id IS NOT NULL THEN v_treatment.field_row_id END
    )
  LOOP
    -- Create plant operation
    INSERT INTO plant_operations (
      plant_id,
      garden_id,
      operation_type,
      operation_category,
      operation_date,
      quantity,
      unit,
      product_name,
      notes,
      source_treatment_id,
      auto_generated,
      created_at,
      updated_at
    ) VALUES (
      v_plant.plant_id,
      v_treatment.garden_id,
      'treatment',
      'protection',
      v_treatment.treatment_date,
      v_quantity_per_plant,
      v_treatment.dosage_unit,
      v_treatment.product_name,
      'Auto-generato da trattamento filare: ' || 
      COALESCE(v_treatment.notes, '') || 
      ' (Motivo: ' || COALESCE(v_treatment.reason, 'non specificato') || ')',
      p_treatment_id,
      TRUE,
      NOW(),
      NOW()
    );
    
    v_operations_created := v_operations_created + 1;
  END LOOP;
  
  -- Log sync operation
  INSERT INTO operation_sync_log (
    source_type,
    source_operation_id,
    plants_affected,
    operations_created,
    garden_id
  ) VALUES (
    'treatment',
    p_treatment_id,
    v_plants_affected,
    v_operations_created,
    v_treatment.garden_id
  );
  
  RETURN v_operations_created;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE TRIGGERS FOR AUTO-SYNC

-- Trigger for watering logs
CREATE OR REPLACE FUNCTION trigger_sync_watering_to_plants()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if operation affects a row with plants
  IF (NEW.row_id IS NOT NULL OR NEW.field_row_id IS NOT NULL) THEN
    PERFORM sync_watering_to_plants(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_watering_log_insert
  AFTER INSERT ON watering_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_watering_to_plants();

-- Trigger for fertilizer logs
CREATE OR REPLACE FUNCTION trigger_sync_fertilizer_to_plants()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if operation affects a row with plants
  IF (NEW.bed_row_id IS NOT NULL OR NEW.field_row_id IS NOT NULL) THEN
    PERFORM sync_fertilizer_to_plants(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_fertilizer_log_insert
  AFTER INSERT ON fertilizer_application_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_fertilizer_to_plants();

-- Trigger for treatments
CREATE OR REPLACE FUNCTION trigger_sync_treatment_to_plants()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if operation affects a row with plants
  IF (NEW.bed_row_id IS NOT NULL OR NEW.field_row_id IS NOT NULL) THEN
    PERFORM sync_treatment_to_plants(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_treatment_insert
  AFTER INSERT ON treatment_register
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_treatment_to_plants();

-- 7. CREATE VIEWS FOR UNIFIED OPERATIONS

-- View for unified operations across all levels
CREATE OR REPLACE VIEW unified_operations AS
SELECT 
  'watering' as operation_level,
  'row' as granularity_level,
  wl.id as operation_id,
  wl.garden_id,
  wl.date as operation_date,
  wl.watered_at as operation_timestamp,
  'watering' as operation_type,
  'irrigation' as operation_category,
  wl.liters_applied as quantity,
  'L' as unit,
  NULL as product_name,
  wl.notes,
  wl.row_id as garden_row_id,
  wl.field_row_id,
  NULL as plant_id,
  FALSE as auto_generated,
  wl.created_at
FROM watering_logs wl

UNION ALL

SELECT 
  'fertilizer' as operation_level,
  'row' as granularity_level,
  fal.id as operation_id,
  fal.garden_id,
  fal.application_date as operation_date,
  fal.application_date::timestamptz as operation_timestamp,
  'fertilizing' as operation_type,
  'nutrition' as operation_category,
  fal.dosage_amount as quantity,
  fal.dosage_unit as unit,
  fal.fertilizer_product_name as product_name,
  fal.notes,
  fal.bed_row_id as garden_row_id,
  fal.field_row_id,
  NULL as plant_id,
  FALSE as auto_generated,
  fal.created_at
FROM fertilizer_application_logs fal

UNION ALL

SELECT 
  'treatment' as operation_level,
  'row' as granularity_level,
  tr.id as operation_id,
  tr.garden_id,
  tr.treatment_date as operation_date,
  tr.treatment_date::timestamptz as operation_timestamp,
  'treatment' as operation_type,
  'protection' as operation_category,
  tr.dosage as quantity,
  tr.dosage_unit as unit,
  tr.product_name,
  tr.notes,
  tr.bed_row_id as garden_row_id,
  tr.field_row_id,
  NULL as plant_id,
  FALSE as auto_generated,
  tr.created_at
FROM treatment_register tr

UNION ALL

SELECT 
  'plant' as operation_level,
  'plant' as granularity_level,
  po.id as operation_id,
  po.garden_id,
  po.operation_date,
  (po.operation_date || ' ' || COALESCE(po.operation_time, '12:00'))::timestamptz as operation_timestamp,
  po.operation_type,
  po.operation_category,
  po.quantity,
  po.unit,
  po.product_name,
  po.notes,
  ip.garden_row_id,
  ip.field_row_id,
  po.plant_id,
  po.auto_generated,
  po.created_at
FROM plant_operations po
LEFT JOIN individual_plants ip ON po.plant_id = ip.id;

-- 8. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE operation_sync_log IS 'Tracks synchronization between row-level and plant-level operations';
COMMENT ON FUNCTION sync_watering_to_plants(UUID) IS 'Automatically creates plant operations from row watering operations';
COMMENT ON FUNCTION sync_fertilizer_to_plants(UUID) IS 'Automatically creates plant operations from row fertilizer operations';
COMMENT ON FUNCTION sync_treatment_to_plants(UUID) IS 'Automatically creates plant operations from row treatment operations';
COMMENT ON VIEW unified_operations IS 'Unified view of all operations across row and plant levels';

-- 9. GRANT PERMISSIONS (if using RLS)
-- These would be adjusted based on your RLS policies
-- ALTER TABLE operation_sync_log ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own sync logs" ON operation_sync_log FOR SELECT USING (auth.uid() IN (SELECT user_id FROM gardens WHERE id = garden_id));

-- Migration completed successfully
SELECT 'Plant-Row Integration Migration Completed Successfully' as status;
-- Migration completed
SELECT 'Migration completed successfully' as status;
