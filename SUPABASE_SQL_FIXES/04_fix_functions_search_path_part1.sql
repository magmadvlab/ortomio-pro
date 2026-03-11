-- =====================================================
-- SCRIPT 4: Fix Functions search_path (0011_function_search_path_mutable)
-- Esegui questo direttamente nell'editor SQL di Supabase
-- Aggiunge "SET search_path = public" a tutte le funzioni
-- =====================================================

-- 1. update_haccp_certification_status
CREATE OR REPLACE FUNCTION public.update_haccp_certification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id UUID;
BEGIN
  UPDATE haccp_certifications
  SET status = 'CERTIFIED'
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- 2. update_plant_taxonomy_updated_at
CREATE OR REPLACE FUNCTION public.update_plant_taxonomy_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 3. trigger_update_interventions_updated_at
CREATE OR REPLACE FUNCTION public.trigger_update_interventions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 4. update_planting_plans_updated_at
CREATE OR REPLACE FUNCTION public.update_planting_plans_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 5. update_vineyard_advanced_updated_at
CREATE OR REPLACE FUNCTION public.update_vineyard_advanced_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 6. update_olive_advanced_updated_at
CREATE OR REPLACE FUNCTION public.update_olive_advanced_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 7. calculate_section_plant_count
CREATE OR REPLACE FUNCTION public.calculate_section_plant_count(p_section_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM garden_plants
  WHERE section_id = p_section_id AND status != 'deleted';
  RETURN v_count;
END;
$$;

-- 8. update_organic_certification_status
CREATE OR REPLACE FUNCTION public.update_organic_certification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE organic_certifications
  SET status = 'CERTIFIED'
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- 9. get_zone_active_field_rows
CREATE OR REPLACE FUNCTION public.get_zone_active_field_rows(p_zone_id UUID)
RETURNS TABLE (
  row_id UUID,
  row_name TEXT,
  crop_name TEXT,
  status TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT fr.id, fr.name, fr.crop_name, fr.status
  FROM field_rows fr
  WHERE fr.zone_id = p_zone_id AND fr.is_active = true;
END;
$$;

-- 10. count_zone_active_field_rows
CREATE OR REPLACE FUNCTION public.count_zone_active_field_rows(p_zone_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM field_rows
  WHERE zone_id = p_zone_id AND is_active = true;
  RETURN v_count;
END;
$$;

-- 11. initialize_default_certifications
CREATE OR REPLACE FUNCTION public.initialize_default_certifications(p_farm_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO haccp_certifications (farm_id, certification_type, status)
  VALUES (p_farm_id, 'HACCP', 'PENDING')
  ON CONFLICT DO NOTHING;
END;
$$;

-- 12. get_orchard_dashboard_data
CREATE OR REPLACE FUNCTION public.get_orchard_dashboard_data(p_orchard_id UUID)
RETURNS TABLE (
  total_trees BIGINT,
  healthy_trees BIGINT,
  diseased_trees BIGINT,
  avg_health NUMERIC
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE health_status = 'healthy'),
    COUNT(*) FILTER (WHERE health_status = 'diseased'),
    AVG(health_score)
  FROM orchard_trees
  WHERE orchard_id = p_orchard_id;
END;
$$;

-- 13. search_plant_synonyms
CREATE OR REPLACE FUNCTION public.search_plant_synonyms(p_search_term TEXT)
RETURNS TABLE (
  plant_id UUID,
  canonical_name TEXT,
  synonym TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT pt.id, pt.canonical_name, ps.synonym_name
  FROM plant_taxonomy pt
  LEFT JOIN plant_synonyms ps ON pt.id = ps.plant_id
  WHERE pt.canonical_name ILIKE '%' || p_search_term || '%'
     OR ps.synonym_name ILIKE '%' || p_search_term || '%';
END;
$$;

-- 14. search_plant_canonical
CREATE OR REPLACE FUNCTION public.search_plant_canonical(p_canonical_name TEXT)
RETURNS TABLE (
  plant_id UUID,
  canonical_name TEXT,
  family TEXT,
  genus TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT id, canonical_name, family, genus
  FROM plant_taxonomy
  WHERE canonical_name ILIKE p_canonical_name;
END;
$$;

-- 15. trigger_calculate_priority
CREATE OR REPLACE FUNCTION public.trigger_calculate_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_urgency INTEGER := 0;
  v_impact INTEGER := 0;
  v_feasibility INTEGER := 0;
  v_cost INTEGER := 0;
BEGIN
  CASE NEW.action_priority
    WHEN 'CRITICAL' THEN v_urgency := 40;
    WHEN 'HIGH' THEN v_urgency := 30;
    WHEN 'MEDIUM' THEN v_urgency := 20;
    WHEN 'LOW' THEN v_urgency := 10;
    ELSE v_urgency := 15;
  END CASE;
  
  v_impact := COALESCE(FLOOR(NEW.confidence_score * 30), 15);
  v_feasibility := 18;
  v_cost := 7;
  
  NEW.priority_score := v_urgency + v_impact + v_feasibility + v_cost;
  
  NEW.urgency_breakdown := jsonb_build_object(
    'urgency', v_urgency,
    'impact', v_impact,
    'feasibility', v_feasibility,
    'cost', v_cost
  );
  
  RETURN NEW;
END;
$$;

-- 16. update_tree_age
CREATE OR REPLACE FUNCTION public.update_tree_age()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.age_years = EXTRACT(YEAR FROM CURRENT_DATE - NEW.planting_date) / 365.25;
  RETURN NEW;
END;
$$;

-- 17. trigger_update_orchard_stats
CREATE OR REPLACE FUNCTION public.trigger_update_orchard_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE orchards
  SET total_trees = (SELECT COUNT(*) FROM orchard_trees WHERE orchard_id = NEW.orchard_id),
      last_updated = CURRENT_TIMESTAMP
  WHERE id = NEW.orchard_id;
  RETURN NEW;
END;
$$;

-- 18. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 19. update_updated_at_column_sync
CREATE OR REPLACE FUNCTION public.update_updated_at_column_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 20. create_standard_field_row_sections
CREATE OR REPLACE FUNCTION public.create_standard_field_row_sections(p_row_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO field_row_sections (row_id, section_name, created_at)
  SELECT p_row_id, 'Section ' || (ROW_NUMBER() OVER ()), CURRENT_TIMESTAMP
  FROM generate_series(1, 5);
END;
$$;

SELECT 'SUCCESS: 20 functions updated with search_path = public ✅' as result;
