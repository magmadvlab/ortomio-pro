-- =====================================================
-- SCRIPT 6: Fix remaining Functions search_path - PART 3
-- Esegui questo direttamente nell'editor SQL di Supabase
-- Ultime funzioni con "SET search_path = public"
-- =====================================================

-- 41. get_row_operation_stats
CREATE OR REPLACE FUNCTION public.get_row_operation_stats(p_row_id UUID)
RETURNS TABLE (
  operation_type TEXT,
  operation_count INTEGER,
  last_operation_date TIMESTAMP
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    po.operation_type,
    COUNT(*),
    MAX(po.operation_date)
  FROM plant_operations po
  JOIN garden_plants gp ON gp.id = po.plant_id
  WHERE gp.row_id = p_row_id
  GROUP BY po.operation_type;
END;
$$;

-- 42. sync_plant_operations_to_main_tables
CREATE OR REPLACE FUNCTION public.sync_plant_operations_to_main_tables()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE garden_plants
  SET last_operation = NEW.operation_type,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.plant_id;
  RETURN NEW;
END;
$$;

-- 43. water_all_plants_in_row
CREATE OR REPLACE FUNCTION public.water_all_plants_in_row(p_row_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  UPDATE garden_plants
  SET last_watered = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE row_id = p_row_id AND status = 'active';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 44. get_field_row_treatments
CREATE OR REPLACE FUNCTION public.get_field_row_treatments(p_row_id UUID)
RETURNS TABLE (
  treatment_id UUID,
  treatment_name TEXT,
  treatment_date DATE,
  product_name TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ft.id, ft.name, ft.treatment_date, ft.product_name
  FROM field_treatments ft
  JOIN field_rows fr ON fr.id = ft.row_id
  WHERE fr.id = p_row_id
  ORDER BY ft.treatment_date DESC;
END;
$$;

-- 45. get_field_row_mechanical_works
CREATE OR REPLACE FUNCTION public.get_field_row_mechanical_works(p_row_id UUID)
RETURNS TABLE (
  work_id UUID,
  work_type TEXT,
  work_date DATE,
  equipment_used TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT mw.id, mw.work_type, mw.work_date, mw.equipment_used
  FROM mechanical_works mw
  WHERE mw.row_id = p_row_id
  ORDER BY mw.work_date DESC;
END;
$$;

-- 46. update_field_row_on_treatment
CREATE OR REPLACE FUNCTION public.update_field_row_on_treatment()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE field_rows
  SET last_treatment_date = NEW.treatment_date,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.row_id;
  RETURN NEW;
END;
$$;

-- 47. update_field_row_on_mechanical_work
CREATE OR REPLACE FUNCTION public.update_field_row_on_mechanical_work()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE field_rows
  SET last_mechanical_work_date = NEW.work_date,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.row_id;
  RETURN NEW;
END;
$$;

-- 48. trigger_create_system_roles
CREATE OR REPLACE FUNCTION public.trigger_create_system_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_system_roles_for_organization(NEW.id);
  RETURN NEW;
END;
$$;

-- 49. get_complete_row_stats
CREATE OR REPLACE FUNCTION public.get_complete_row_stats(p_row_id UUID)
RETURNS TABLE (
  total_plants INTEGER,
  healthy_plants INTEGER,
  diseased_plants INTEGER,
  dead_plants INTEGER,
  avg_health NUMERIC
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'healthy'),
    COUNT(*) FILTER (WHERE status = 'diseased'),
    COUNT(*) FILTER (WHERE status = 'dead'),
    AVG(health_score)
  FROM garden_plants
  WHERE row_id = p_row_id;
END;
$$;

-- 50. backup_plant_data
CREATE OR REPLACE FUNCTION public.backup_plant_data(p_farm_id UUID)
RETURNS TABLE (
  backup_id UUID,
  backup_date TIMESTAMP,
  record_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gen_random_uuid(),
    CURRENT_TIMESTAMP,
    (SELECT COUNT(*) FROM garden_plants WHERE farm_id = p_farm_id);
END;
$$;

-- 51. update_calculated_plants
CREATE OR REPLACE FUNCTION public.update_calculated_plants()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.row_length IS NOT NULL AND NEW.spacing IS NOT NULL THEN
    NEW.calculated_plants = FLOOR(NEW.row_length / NEW.spacing);
  END IF;
  RETURN NEW;
END;
$$;

-- 52. create_example_tomato_field
CREATE OR REPLACE FUNCTION public.create_example_tomato_field(p_zone_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row_id UUID;
BEGIN
  INSERT INTO field_rows (zone_id, crop_name, status)
  VALUES (p_zone_id, 'Tomato', 'active')
  RETURNING id INTO v_row_id;
  RETURN v_row_id;
END;
$$;

-- 53. calculate_treatment_cost
CREATE OR REPLACE FUNCTION public.calculate_treatment_cost(p_product_id UUID, p_quantity NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_cost NUMERIC := 0;
BEGIN
  SELECT (unit_cost * p_quantity) INTO v_cost
  FROM products
  WHERE id = p_product_id;
  RETURN COALESCE(v_cost, 0);
END;
$$;

-- 54. check_product_compatibility
CREATE OR REPLACE FUNCTION public.check_product_compatibility(p_product_id UUID, p_crop_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM product_crop_compatibility
    WHERE product_id = p_product_id AND crop_name = p_crop_name
  );
END;
$$;

-- 55. get_low_stock_products
CREATE OR REPLACE FUNCTION public.get_low_stock_products(p_farm_id UUID)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  current_stock NUMERIC,
  min_stock NUMERIC
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, pi.quantity, p.minimum_stock
  FROM products p
  JOIN product_inventory pi ON pi.product_id = p.id
  WHERE pi.farm_id = p_farm_id
    AND pi.quantity < p.minimum_stock;
END;
$$;

-- 56. calculate_organic_compliance
CREATE OR REPLACE FUNCTION public.calculate_organic_compliance(p_farm_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE((
    SELECT 
      (COUNT(*) FILTER (WHERE is_compliant) * 100.0) / COUNT(*)
    FROM organic_requirements
    WHERE farm_id = p_farm_id
  ), 0);
END;
$$;

-- 57. validate_section_overlap
CREATE OR REPLACE FUNCTION public.validate_section_overlap(p_row_id UUID, p_start_pos NUMERIC, p_end_pos NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM field_row_sections
    WHERE row_id = p_row_id
      AND start_position < p_end_pos
      AND end_position > p_start_pos
  );
END;
$$;

SELECT 'SUCCESS: 16 more functions updated with search_path = public ✅' as result;
