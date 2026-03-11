-- =====================================================
-- SCRIPT 7: Fix remaining Functions search_path - PART 4
-- Esegui questo direttamente nell'editor SQL di Supabase
-- Ultime funzioni con "SET search_path = public"
-- =====================================================

-- 58. get_zone_history
CREATE OR REPLACE FUNCTION public.get_zone_history(p_zone_id UUID)
RETURNS TABLE (
  event_date TIMESTAMP,
  event_type TEXT,
  description TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT zh.created_at, zh.event_type, zh.description
  FROM zone_history zh
  WHERE zh.zone_id = p_zone_id
  ORDER BY zh.created_at DESC;
END;
$$;

-- 59. calculate_zone_soil_health
CREATE OR REPLACE FUNCTION public.calculate_zone_soil_health(p_zone_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE((
    SELECT AVG(health_score)
    FROM land_zones
    WHERE id = p_zone_id
  ), 0);
END;
$$;

-- 60. get_zone_rotation_suggestions
CREATE OR REPLACE FUNCTION public.get_zone_rotation_suggestions(p_zone_id UUID)
RETURNS TABLE (
  suggested_crop TEXT,
  compatibility_score NUMERIC,
  min_days_since_crop INTEGER
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT rc.suggested_crop, rc.compatibility_score, rc.min_days
  FROM crop_rotation_config rc
  WHERE rc.applicable_zone_id IS NULL OR rc.applicable_zone_id = p_zone_id;
END;
$$;

-- 61. calculate_plants_in_row
CREATE OR REPLACE FUNCTION public.calculate_plants_in_row(p_row_length NUMERIC, p_spacing NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF p_spacing IS NULL OR p_spacing = 0 THEN
    RETURN 0;
  END IF;
  RETURN FLOOR(p_row_length / p_spacing);
END;
$$;

-- 62. calculate_min_row_length
CREATE OR REPLACE FUNCTION public.calculate_min_row_length(p_plant_count INTEGER, p_spacing NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN p_plant_count * p_spacing;
END;
$$;

-- 63. calculate_tree_age
CREATE OR REPLACE FUNCTION public.calculate_tree_age(p_planting_date DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM CURRENT_DATE - p_planting_date) / 365.25;
END;
$$;

-- 64. update_bio_compliance_score
CREATE OR REPLACE FUNCTION public.update_bio_compliance_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE bio_certifications
  SET compliance_score = (
    SELECT AVG(requirement_completion) FROM bio_certifications_requirements
    WHERE certification_id = NEW.certification_id
  )
  WHERE id = NEW.certification_id;
  RETURN NEW;
END;
$$;

-- 65. generate_plant_code
CREATE OR REPLACE FUNCTION public.generate_plant_code(p_row_code TEXT, p_position INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN p_row_code || '-' || LPAD(p_position::TEXT, 3, '0');
END;
$$;

-- 66. update_orchard_statistics
CREATE OR REPLACE FUNCTION public.update_orchard_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE orchards
  SET 
    total_trees = (SELECT COUNT(*) FROM orchard_trees WHERE orchard_id = NEW.orchard_id),
    healthy_trees = (SELECT COUNT(*) FROM orchard_trees WHERE orchard_id = NEW.orchard_id AND health_status = 'healthy'),
    diseased_trees = (SELECT COUNT(*) FROM orchard_trees WHERE orchard_id = NEW.orchard_id AND health_status = 'diseased'),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.orchard_id;
  RETURN NEW;
END;
$$;

-- 67. create_bio_certification_from_garden
CREATE OR REPLACE FUNCTION public.create_bio_certification_from_garden(p_garden_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cert_id UUID;
BEGIN
  INSERT INTO bio_certifications (garden_id, status, created_at)
  VALUES (p_garden_id, 'PENDING', CURRENT_TIMESTAMP)
  RETURNING id INTO v_cert_id;
  RETURN v_cert_id;
END;
$$;

-- 68. validate_field_row_fits_in_zone
CREATE OR REPLACE FUNCTION public.validate_field_row_fits_in_zone(p_row_id UUID, p_zone_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_row_area NUMERIC;
  v_zone_area NUMERIC;
BEGIN
  SELECT area_sqm INTO v_row_area
  FROM field_rows WHERE id = p_row_id;
  
  SELECT area_sqm INTO v_zone_area
  FROM land_zones WHERE id = p_zone_id;
  
  RETURN COALESCE(v_row_area, 0) <= COALESCE(v_zone_area, 0);
END;
$$;

-- 69. advance_cultivation_phase
CREATE OR REPLACE FUNCTION public.advance_cultivation_phase(p_plan_id UUID, p_new_phase TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE planting_plans
  SET current_phase = p_new_phase,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_plan_id;
  RETURN TRUE;
END;
$$;

-- 70. get_available_materials
CREATE OR REPLACE FUNCTION public.get_available_materials(p_farm_id UUID)
RETURNS TABLE (
  material_id UUID,
  material_name TEXT,
  quantity_available NUMERIC,
  unit TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.name, mi.quantity, m.unit
  FROM materials m
  JOIN material_inventory mi ON mi.material_id = m.id
  WHERE mi.farm_id = p_farm_id AND mi.quantity > 0;
END;
$$;

-- 71. update_plan_quantity_from_transition
CREATE OR REPLACE FUNCTION public.update_plan_quantity_from_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE planting_plans
  SET planned_quantity = planned_quantity - NEW.consumed_quantity,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.plan_id;
  RETURN NEW;
END;
$$;

-- 72. consume_seed_inventory
CREATE OR REPLACE FUNCTION public.consume_seed_inventory(p_seed_id UUID, p_quantity NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE seed_inventory
  SET quantity = quantity - p_quantity,
      updated_at = CURRENT_TIMESTAMP
  WHERE seed_id = p_seed_id AND quantity >= p_quantity;
  RETURN FOUND;
END;
$$;

-- 73. manage_sapling_inventory
CREATE OR REPLACE FUNCTION public.manage_sapling_inventory(p_sapling_id UUID, p_quantity INTEGER, p_operation TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF p_operation = 'ADD' THEN
    UPDATE sapling_inventory
    SET quantity = quantity + p_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE sapling_id = p_sapling_id;
  ELSIF p_operation = 'REMOVE' THEN
    UPDATE sapling_inventory
    SET quantity = quantity - p_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE sapling_id = p_sapling_id AND quantity >= p_quantity;
  END IF;
  RETURN FOUND;
END;
$$;

-- 74. advance_cultivation_phase_validated
CREATE OR REPLACE FUNCTION public.advance_cultivation_phase_validated(p_plan_id UUID, p_new_phase TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_current_phase TEXT;
BEGIN
  SELECT current_phase INTO v_current_phase
  FROM planting_plans
  WHERE id = p_plan_id;
  
  IF is_valid_phase_transition(v_current_phase, p_new_phase) THEN
    PERFORM advance_cultivation_phase(p_plan_id, p_new_phase);
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$;

-- 75. is_valid_phase_transition
CREATE OR REPLACE FUNCTION public.is_valid_phase_transition(p_from_phase TEXT, p_to_phase TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN (p_from_phase, p_to_phase) IN (
    ('PLANNING', 'PREPARATION'),
    ('PREPARATION', 'PLANTING'),
    ('PLANTING', 'GROWING'),
    ('GROWING', 'HARVESTING'),
    ('HARVESTING', 'STORAGE'),
    ('STORAGE', 'COMPLETED')
  );
END;
$$;

SELECT 'SUCCESS: 18 more functions updated with search_path = public ✅' as result;
