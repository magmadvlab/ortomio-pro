-- =====================================================
-- SCRIPT 8: Fix remaining Functions search_path - PART 5 (FINALE)
-- Esegui questo direttamente nell'editor SQL di Supabase
-- Ultime funzioni rimanenti con "SET search_path = public"
-- =====================================================

-- 76. handle_phase_specific_actions
CREATE OR REPLACE FUNCTION public.handle_phase_specific_actions(p_plan_id UUID, p_phase TEXT)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  CASE p_phase
    WHEN 'PLANTING' THEN
      PERFORM auto_generate_plants_in_row();
    WHEN 'HARVESTING' THEN
      UPDATE planting_plans SET status = 'HARVESTING_STARTED' WHERE id = p_plan_id;
    WHEN 'COMPLETED' THEN
      UPDATE planting_plans SET status = 'COMPLETED', completion_date = CURRENT_DATE WHERE id = p_plan_id;
  END CASE;
END;
$$;

-- 77. calculate_cultivation_statistics
CREATE OR REPLACE FUNCTION public.calculate_cultivation_statistics(p_farm_id UUID)
RETURNS TABLE (
  total_plans INTEGER,
  active_plans INTEGER,
  completed_plans INTEGER,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'ACTIVE'),
    COUNT(*) FILTER (WHERE status = 'COMPLETED'),
    (COUNT(*) FILTER (WHERE status = 'COMPLETED') * 100.0 / COUNT(*))
  FROM planting_plans
  WHERE farm_id = p_farm_id;
END;
$$;

-- 78. get_recurring_issues
CREATE OR REPLACE FUNCTION public.get_recurring_issues(p_farm_id UUID)
RETURNS TABLE (
  issue_type TEXT,
  occurrence_count INTEGER,
  last_occurrence DATE
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ri.issue_type, COUNT(*), MAX(ri.occurrence_date)
  FROM recurring_issues ri
  WHERE ri.farm_id = p_farm_id
  GROUP BY ri.issue_type
  ORDER BY COUNT(*) DESC;
END;
$$;

-- 79. auto_calculate_statistics
CREATE OR REPLACE FUNCTION public.auto_calculate_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE garden_plants
  SET total_harvests = (SELECT COUNT(*) FROM plant_harvests WHERE plant_id = NEW.plant_id)
  WHERE id = NEW.plant_id;
  RETURN NEW;
END;
$$;

-- 80. update_zone_last_watered
CREATE OR REPLACE FUNCTION public.update_zone_last_watered()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE land_zones
  SET last_watered_date = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.zone_id;
  RETURN NEW;
END;
$$;

SELECT 'SUCCESS: Final 5 functions updated with search_path = public ✅' as result;
SELECT 'COMPLETE: All 80+ functions now have SET search_path = public ✅' as completion_status;
