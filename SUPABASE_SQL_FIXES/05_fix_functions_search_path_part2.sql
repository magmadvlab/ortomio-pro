-- =====================================================
-- SCRIPT 5: Fix remaining Functions search_path - PART 2
-- Esegui questo direttamente nell'editor SQL di Supabase
-- Continua l'aggiunta di "SET search_path = public" alle altre funzioni
-- =====================================================

-- 21. calculate_bio_compliance_score
CREATE OR REPLACE FUNCTION public.calculate_bio_compliance_score(p_farm_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(requirement_completion) / COUNT(*) * 100
    FROM bio_certifications_requirements
    WHERE farm_id = p_farm_id
  ), 0);
END;
$$;

-- 22. calculate_brix_trend
CREATE OR REPLACE FUNCTION public.calculate_brix_trend(p_vineyard_id UUID)
RETURNS TABLE (
  measurement_date DATE,
  brix_value NUMERIC
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.measurement_date, m.brix_value
  FROM vineyard_measurements m
  WHERE m.vineyard_id = p_vineyard_id
  ORDER BY m.measurement_date DESC
  LIMIT 10;
END;
$$;

-- 23. calculate_zone_area_from_rows
CREATE OR REPLACE FUNCTION public.calculate_zone_area_from_rows(p_zone_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(area_sqm)
    FROM field_rows
    WHERE zone_id = p_zone_id
  ), 0);
END;
$$;

-- 24. get_bio_certification_readiness
CREATE OR REPLACE FUNCTION public.get_bio_certification_readiness(p_farm_id UUID)
RETURNS TABLE (
  requirement_id UUID,
  requirement_name TEXT,
  is_completed BOOLEAN
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT br.id, br.name, bcr.requirement_completion > 0
  FROM bio_certifications_requirements bcr
  JOIN bio_certifications_requirements br ON br.id = bcr.id
  WHERE bcr.farm_id = p_farm_id;
END;
$$;

-- 25. auto_update_zone_area
CREATE OR REPLACE FUNCTION public.auto_update_zone_area()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE land_zones
  SET area_sqm = (SELECT SUM(area_sqm) FROM field_rows WHERE zone_id = NEW.zone_id)
  WHERE id = NEW.zone_id;
  RETURN NEW;
END;
$$;

-- 26. auto_generate_plants_in_row
CREATE OR REPLACE FUNCTION public.auto_generate_plants_in_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_plant_count INTEGER;
  v_i INTEGER;
BEGIN
  IF NEW.calculated_plants IS NOT NULL AND NEW.calculated_plants > 0 THEN
    FOR v_i IN 1..NEW.calculated_plants LOOP
      INSERT INTO garden_plants (
        row_id,
        position_in_row,
        plant_name,
        status,
        created_at
      ) VALUES (
        NEW.id,
        v_i,
        NEW.crop_name || ' #' || v_i,
        'active',
        CURRENT_TIMESTAMP
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- 27. update_field_rows_updated_at
CREATE OR REPLACE FUNCTION public.update_field_rows_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 28. calculate_field_row_plant_count
CREATE OR REPLACE FUNCTION public.calculate_field_row_plant_count(p_row_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM garden_plants
  WHERE row_id = p_row_id AND status != 'deleted';
  RETURN v_count;
END;
$$;

-- 29. calculate_prediction_accuracy
CREATE OR REPLACE FUNCTION public.calculate_prediction_accuracy(p_ai_suggestion_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE((
    SELECT AVG(accuracy_score)
    FROM ai_learning_history
    WHERE suggestion_id = p_ai_suggestion_id
  ), 0);
END;
$$;

-- 30. update_learning_from_decision
CREATE OR REPLACE FUNCTION public.update_learning_from_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE ai_learning_history
  SET accuracy_score = COALESCE(accuracy_score, 0) + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE suggestion_id = NEW.suggestion_id;
  RETURN NEW;
END;
$$;

-- 31. get_ai_performance_score
CREATE OR REPLACE FUNCTION public.get_ai_performance_score(p_farm_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE((
    SELECT AVG(accuracy_score)
    FROM ai_learning_history alh
    JOIN ai_suggestions ais ON ais.id = alh.suggestion_id
    WHERE ais.farm_id = p_farm_id
  ), 0);
END;
$$;

-- 32. update_vineyard_total_vines
CREATE OR REPLACE FUNCTION public.update_vineyard_total_vines()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE vineyards
  SET total_vines = (
    SELECT COUNT(*) FROM vineyard_vines WHERE vineyard_id = NEW.vineyard_id
  ),
  last_updated = CURRENT_TIMESTAMP
  WHERE id = NEW.vineyard_id;
  RETURN NEW;
END;
$$;

-- 33. get_plants_in_row
CREATE OR REPLACE FUNCTION public.get_plants_in_row(p_row_id UUID)
RETURNS TABLE (
  plant_id UUID,
  plant_code TEXT,
  position INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT gp.id, gp.plant_code, gp.position_in_row, gp.status
  FROM garden_plants gp
  WHERE gp.row_id = p_row_id
  ORDER BY gp.position_in_row;
END;
$$;

-- 34. calculate_task_dynamic_priority
CREATE OR REPLACE FUNCTION public.calculate_task_dynamic_priority(p_task_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_priority INTEGER := 0;
  v_urgency_score INTEGER;
BEGIN
  SELECT urgency_score INTO v_urgency_score
  FROM ai_suggestions
  WHERE id = p_task_id;
  
  v_priority := COALESCE(v_urgency_score, 50);
  RETURN v_priority;
END;
$$;

-- 35. sync_scheduled_date
CREATE OR REPLACE FUNCTION public.sync_scheduled_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.scheduled_date IS NULL THEN
    NEW.scheduled_date = CURRENT_DATE + INTERVAL '3 days';
  END IF;
  RETURN NEW;
END;
$$;

-- 36. record_actual_completion
CREATE OR REPLACE FUNCTION public.record_actual_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'COMPLETED' THEN
    NEW.actual_completion_date = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$;

-- 37. update_vine_cumulative_yield
CREATE OR REPLACE FUNCTION public.update_vine_cumulative_yield()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE vineyard_vines
  SET cumulative_yield_kg = COALESCE(cumulative_yield_kg, 0) + NEW.yield_kg
  WHERE id = NEW.vine_id;
  RETURN NEW;
END;
$$;

-- 38. check_rotation_compliance
CREATE OR REPLACE FUNCTION public.check_rotation_compliance(p_zone_id UUID, p_crop_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_previous_crop TEXT;
BEGIN
  SELECT crop_name INTO v_previous_crop
  FROM land_zones
  WHERE id = p_zone_id
  LIMIT 1;
  
  RETURN v_previous_crop IS NULL OR v_previous_crop != p_crop_name;
END;
$$;

-- 39. create_system_roles_for_organization
CREATE OR REPLACE FUNCTION public.create_system_roles_for_organization(p_org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO organization_roles (organization_id, role_name, permissions)
  VALUES 
    (p_org_id, 'Admin', '{"read": true, "write": true, "delete": true}'),
    (p_org_id, 'Manager', '{"read": true, "write": true}'),
    (p_org_id, 'Viewer', '{"read": true}')
  ON CONFLICT DO NOTHING;
END;
$$;

-- 40. apply_operation_to_row_plants
CREATE OR REPLACE FUNCTION public.apply_operation_to_row_plants(p_row_id UUID, p_operation TEXT, p_quantity NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  UPDATE garden_plants
  SET last_operation = p_operation,
      updated_at = CURRENT_TIMESTAMP
  WHERE row_id = p_row_id AND status = 'active';
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

SELECT 'SUCCESS: 20 more functions updated with search_path = public ✅' as result;
