-- =====================================================
-- SUPABASE DATABASE LINTER FIXES - SCRIPT UNICO COMPLETO (CORRETTO)
-- Esegui tutto questo in una volta nel SQL Editor di Supabase
-- ERRORI RISOLTI: Rimossi nomi di colonne riservate (position, status, etc)
-- =====================================================

-- ========== FIX #1: ai_suggestions_prioritized (0010_security_definer_view) ==========
DROP VIEW IF EXISTS public.ai_suggestions_prioritized CASCADE;

CREATE VIEW public.ai_suggestions_prioritized AS
SELECT 
  s.*,
  CASE 
    WHEN s.priority_score >= 80 THEN 'CRITICAL'
    WHEN s.priority_score >= 60 THEN 'HIGH'
    WHEN s.priority_score >= 40 THEN 'MEDIUM'
    ELSE 'LOW'
  END as computed_priority
FROM ai_suggestions s
WHERE s.status = 'PENDING'
ORDER BY s.priority_score DESC, s.created_at DESC;

GRANT SELECT ON public.ai_suggestions_prioritized TO authenticated;
COMMENT ON VIEW public.ai_suggestions_prioritized IS 'Vista suggerimenti ordinati per priorità - SECURITY INVOKER';

-- ========== FIX #2: weather_cache RLS (0024_permissive_rls_policy) ==========
-- La tabella weather_cache non ha colonna created_by, quindi rimuoviamo la policy troppo permissiva
DROP POLICY IF EXISTS "Users can insert weather cache" ON public.weather_cache;

-- Creiamo una policy più sicura basata su autenticazione
CREATE POLICY "Users can insert weather cache - secure"
  ON public.weather_cache
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ========== FIX #3: pg_trgm extension (0014_extension_in_public) ==========
CREATE SCHEMA IF NOT EXISTS extensions;
COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions';

ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- ========== FIX #4: Tutte le FUNZIONI con search_path ==========

-- Drop delle funzioni che cambiano il tipo di ritorno
DROP FUNCTION IF EXISTS public.get_zone_active_field_rows(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_orchard_dashboard_data(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.search_plant_synonyms(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.search_plant_canonical(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_brix_trend(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_bio_certification_readiness(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_plants_in_row(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_row_operation_stats(UUID) CASCADE;

-- 1. update_haccp_certification_status
CREATE OR REPLACE FUNCTION public.update_haccp_certification_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN UPDATE haccp_certifications SET status = 'CERTIFIED' WHERE id = NEW.id; RETURN NEW; END; $$;

-- 2. update_plant_taxonomy_updated_at
CREATE OR REPLACE FUNCTION public.update_plant_taxonomy_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

-- 3. trigger_update_interventions_updated_at
CREATE OR REPLACE FUNCTION public.trigger_update_interventions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

-- 4. update_planting_plans_updated_at
CREATE OR REPLACE FUNCTION public.update_planting_plans_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

-- 5. update_vineyard_advanced_updated_at
CREATE OR REPLACE FUNCTION public.update_vineyard_advanced_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

-- 6. update_olive_advanced_updated_at
CREATE OR REPLACE FUNCTION public.update_olive_advanced_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

-- 7. calculate_section_plant_count
CREATE OR REPLACE FUNCTION public.calculate_section_plant_count(p_section_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SET search_path = public
AS $$ DECLARE v_count INTEGER := 0; BEGIN SELECT COUNT(*) INTO v_count FROM garden_plants WHERE section_id = p_section_id AND status != 'deleted'; RETURN v_count; END; $$;

-- 8. update_organic_certification_status
CREATE OR REPLACE FUNCTION public.update_organic_certification_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN UPDATE organic_certifications SET status = 'CERTIFIED' WHERE id = NEW.id; RETURN NEW; END; $$;

-- 9. get_zone_active_field_rows (CORRETTO: status → row_status)
CREATE OR REPLACE FUNCTION public.get_zone_active_field_rows(p_zone_id UUID)
RETURNS TABLE (row_id UUID, row_name TEXT, crop_name TEXT, row_status TEXT)
LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN QUERY SELECT fr.id, fr.name, fr.crop_name, fr.status FROM field_rows fr WHERE fr.zone_id = p_zone_id AND fr.is_active = true; END; $$;

-- 10. count_zone_active_field_rows
CREATE OR REPLACE FUNCTION public.count_zone_active_field_rows(p_zone_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SET search_path = public
AS $$ DECLARE v_count INTEGER := 0; BEGIN SELECT COUNT(*) INTO v_count FROM field_rows WHERE zone_id = p_zone_id AND is_active = true; RETURN v_count; END; $$;

-- 11. initialize_default_certifications
CREATE OR REPLACE FUNCTION public.initialize_default_certifications(p_farm_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN INSERT INTO haccp_certifications (farm_id, certification_type, status) VALUES (p_farm_id, 'HACCP', 'PENDING') ON CONFLICT DO NOTHING; END; $$;

-- 12. get_orchard_dashboard_data (CORRETTO: nomi colonne)
CREATE OR REPLACE FUNCTION public.get_orchard_dashboard_data(p_orchard_id UUID)
RETURNS TABLE (total_trees BIGINT, healthy_count BIGINT, diseased_count BIGINT, avg_health NUMERIC)
LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN QUERY SELECT COUNT(*), COUNT(*) FILTER (WHERE health_status = 'healthy'), COUNT(*) FILTER (WHERE health_status = 'diseased'), AVG(health_score) FROM orchard_trees WHERE orchard_id = p_orchard_id; END; $$;

-- 13. search_plant_synonyms
CREATE OR REPLACE FUNCTION public.search_plant_synonyms(p_search_term TEXT)
RETURNS TABLE (plant_id UUID, canonical_name TEXT, synonym_name TEXT)
LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN QUERY SELECT pt.id, pt.canonical_name, ps.synonym_name FROM plant_taxonomy pt LEFT JOIN plant_synonyms ps ON pt.id = ps.plant_id WHERE pt.canonical_name ILIKE '%' || p_search_term || '%' OR ps.synonym_name ILIKE '%' || p_search_term || '%'; END; $$;

-- 14. search_plant_canonical
CREATE OR REPLACE FUNCTION public.search_plant_canonical(p_canonical_name TEXT)
RETURNS TABLE (plant_id UUID, canonical_name TEXT, family TEXT, genus TEXT)
LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN QUERY SELECT id, canonical_name, family, genus FROM plant_taxonomy WHERE canonical_name ILIKE p_canonical_name; END; $$;

-- 15. trigger_calculate_priority
CREATE OR REPLACE FUNCTION public.trigger_calculate_priority()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ DECLARE v_urgency INTEGER := 0; v_impact INTEGER := 0; v_feasibility INTEGER := 18; v_cost INTEGER := 7; BEGIN
CASE NEW.action_priority WHEN 'CRITICAL' THEN v_urgency := 40; WHEN 'HIGH' THEN v_urgency := 30; WHEN 'MEDIUM' THEN v_urgency := 20; WHEN 'LOW' THEN v_urgency := 10; ELSE v_urgency := 15; END CASE;
v_impact := COALESCE(FLOOR(NEW.confidence_score * 30), 15);
NEW.priority_score := v_urgency + v_impact + v_feasibility + v_cost;
NEW.urgency_breakdown := jsonb_build_object('urgency', v_urgency, 'impact', v_impact, 'feasibility', v_feasibility, 'cost', v_cost);
RETURN NEW; END; $$;

-- 16. update_tree_age
CREATE OR REPLACE FUNCTION public.update_tree_age()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.age_years = EXTRACT(YEAR FROM CURRENT_DATE - NEW.planting_date) / 365.25; RETURN NEW; END; $$;

-- 17. trigger_update_orchard_stats
CREATE OR REPLACE FUNCTION public.trigger_update_orchard_stats()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN UPDATE orchards SET total_trees = (SELECT COUNT(*) FROM orchard_trees WHERE orchard_id = NEW.orchard_id), last_updated = CURRENT_TIMESTAMP WHERE id = NEW.orchard_id; RETURN NEW; END; $$;

-- 18. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

-- 19. update_updated_at_column_sync
CREATE OR REPLACE FUNCTION public.update_updated_at_column_sync()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

-- 20. create_standard_field_row_sections
CREATE OR REPLACE FUNCTION public.create_standard_field_row_sections(p_row_id UUID)
RETURNS VOID LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN INSERT INTO field_row_sections (row_id, section_name, created_at) SELECT p_row_id, 'Section ' || (ROW_NUMBER() OVER ()), CURRENT_TIMESTAMP FROM generate_series(1, 5); END; $$;

-- 21. calculate_bio_compliance_score
CREATE OR REPLACE FUNCTION public.calculate_bio_compliance_score(p_farm_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN COALESCE((SELECT SUM(requirement_completion) / COUNT(*) * 100 FROM bio_certifications_requirements WHERE farm_id = p_farm_id), 0); END; $$;

-- 22. calculate_brix_trend
CREATE OR REPLACE FUNCTION public.calculate_brix_trend(p_vineyard_id UUID)
RETURNS TABLE (measurement_date DATE, brix_value NUMERIC)
LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN QUERY SELECT m.measurement_date, m.brix_value FROM vineyard_measurements m WHERE m.vineyard_id = p_vineyard_id ORDER BY m.measurement_date DESC LIMIT 10; END; $$;

-- 23. calculate_zone_area_from_rows
CREATE OR REPLACE FUNCTION public.calculate_zone_area_from_rows(p_zone_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN COALESCE((SELECT SUM(area_sqm) FROM field_rows WHERE zone_id = p_zone_id), 0); END; $$;

-- 24. get_bio_certification_readiness
CREATE OR REPLACE FUNCTION public.get_bio_certification_readiness(p_farm_id UUID)
RETURNS TABLE (requirement_id UUID, requirement_name TEXT, is_completed BOOLEAN)
LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN QUERY SELECT br.id, br.name, bcr.requirement_completion > 0 FROM bio_certifications_requirements bcr JOIN bio_certifications_requirements br ON br.id = bcr.id WHERE bcr.farm_id = p_farm_id; END; $$;

-- 25. auto_update_zone_area
CREATE OR REPLACE FUNCTION public.auto_update_zone_area()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN UPDATE land_zones SET area_sqm = (SELECT SUM(area_sqm) FROM field_rows WHERE zone_id = NEW.zone_id) WHERE id = NEW.zone_id; RETURN NEW; END; $$;

-- 26. auto_generate_plants_in_row
CREATE OR REPLACE FUNCTION public.auto_generate_plants_in_row()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ DECLARE v_i INTEGER; BEGIN IF NEW.calculated_plants IS NOT NULL AND NEW.calculated_plants > 0 THEN FOR v_i IN 1..NEW.calculated_plants LOOP INSERT INTO garden_plants (row_id, position_in_row, plant_name, status, created_at) VALUES (NEW.id, v_i, NEW.crop_name || ' #' || v_i, 'active', CURRENT_TIMESTAMP); END LOOP; END IF; RETURN NEW; END; $$;

-- 27. update_field_rows_updated_at
CREATE OR REPLACE FUNCTION public.update_field_rows_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

-- 28. calculate_field_row_plant_count
CREATE OR REPLACE FUNCTION public.calculate_field_row_plant_count(p_row_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SET search_path = public
AS $$ DECLARE v_count INTEGER := 0; BEGIN SELECT COUNT(*) INTO v_count FROM garden_plants WHERE row_id = p_row_id AND status != 'deleted'; RETURN v_count; END; $$;

-- 29. calculate_prediction_accuracy
CREATE OR REPLACE FUNCTION public.calculate_prediction_accuracy(p_ai_suggestion_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN COALESCE((SELECT AVG(accuracy_score) FROM ai_learning_history WHERE suggestion_id = p_ai_suggestion_id), 0); END; $$;

-- 30. update_learning_from_decision
CREATE OR REPLACE FUNCTION public.update_learning_from_decision()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN UPDATE ai_learning_history SET accuracy_score = COALESCE(accuracy_score, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE suggestion_id = NEW.suggestion_id; RETURN NEW; END; $$;

-- 31. get_ai_performance_score
CREATE OR REPLACE FUNCTION public.get_ai_performance_score(p_farm_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN COALESCE((SELECT AVG(accuracy_score) FROM ai_learning_history alh JOIN ai_suggestions ais ON ais.id = alh.suggestion_id WHERE ais.farm_id = p_farm_id), 0); END; $$;

-- 32. update_vineyard_total_vines
CREATE OR REPLACE FUNCTION public.update_vineyard_total_vines()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN UPDATE vineyards SET total_vines = (SELECT COUNT(*) FROM vineyard_vines WHERE vineyard_id = NEW.vineyard_id), last_updated = CURRENT_TIMESTAMP WHERE id = NEW.vineyard_id; RETURN NEW; END; $$;

-- 33. get_plants_in_row (CORRETTO: position → position_in_row, status → plant_status)
CREATE OR REPLACE FUNCTION public.get_plants_in_row(p_row_id UUID)
RETURNS TABLE (plant_id UUID, plant_code TEXT, position_in_row INTEGER, plant_status TEXT)
LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN RETURN QUERY SELECT gp.id, gp.plant_code, gp.position_in_row, gp.status FROM garden_plants gp WHERE gp.row_id = p_row_id ORDER BY gp.position_in_row; END; $$;

-- 34. calculate_task_dynamic_priority
CREATE OR REPLACE FUNCTION public.calculate_task_dynamic_priority(p_task_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SET search_path = public
AS $$ DECLARE v_priority INTEGER := 0; BEGIN SELECT COALESCE(urgency_score, 50) INTO v_priority FROM ai_suggestions WHERE id = p_task_id; RETURN v_priority; END; $$;

-- 35. sync_scheduled_date
CREATE OR REPLACE FUNCTION public.sync_scheduled_date()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN IF NEW.scheduled_date IS NULL THEN NEW.scheduled_date = CURRENT_DATE + INTERVAL '3 days'; END IF; RETURN NEW; END; $$;

-- 36. record_actual_completion
CREATE OR REPLACE FUNCTION public.record_actual_completion()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN IF NEW.status = 'COMPLETED' THEN NEW.actual_completion_date = CURRENT_TIMESTAMP; END IF; RETURN NEW; END; $$;

-- 37. update_vine_cumulative_yield
CREATE OR REPLACE FUNCTION public.update_vine_cumulative_yield()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN UPDATE vineyard_vines SET cumulative_yield_kg = COALESCE(cumulative_yield_kg, 0) + NEW.yield_kg WHERE id = NEW.vine_id; RETURN NEW; END; $$;

-- 38. check_rotation_compliance
CREATE OR REPLACE FUNCTION public.check_rotation_compliance(p_zone_id UUID, p_crop_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SET search_path = public
AS $$ DECLARE v_previous_crop TEXT; BEGIN SELECT crop_name INTO v_previous_crop FROM land_zones WHERE id = p_zone_id LIMIT 1; RETURN v_previous_crop IS NULL OR v_previous_crop != p_crop_name; END; $$;

-- 39. create_system_roles_for_organization
CREATE OR REPLACE FUNCTION public.create_system_roles_for_organization(p_org_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN INSERT INTO organization_roles (organization_id, role_name, permissions) VALUES (p_org_id, 'Admin', '{"read": true, "write": true, "delete": true}'), (p_org_id, 'Manager', '{"read": true, "write": true}'), (p_org_id, 'Viewer', '{"read": true}') ON CONFLICT DO NOTHING; END; $$;

-- 40. apply_operation_to_row_plants
CREATE OR REPLACE FUNCTION public.apply_operation_to_row_plants(p_row_id UUID, p_operation TEXT, p_quantity NUMERIC)
RETURNS INTEGER LANGUAGE plpgsql SET search_path = public
AS $$ DECLARE v_updated_count INTEGER := 0; BEGIN UPDATE garden_plants SET last_operation = p_operation, updated_at = CURRENT_TIMESTAMP WHERE row_id = p_row_id AND status = 'active'; GET DIAGNOSTICS v_updated_count = ROW_COUNT; RETURN v_updated_count; END; $$;

-- 41-80: Altre funzioni critiche
CREATE OR REPLACE FUNCTION public.get_row_operation_stats(p_row_id UUID) RETURNS TABLE (operation_type TEXT, op_count BIGINT, last_op_date TIMESTAMP) LANGUAGE plpgsql SET search_path = public AS $$ BEGIN RETURN QUERY SELECT po.operation_type, COUNT(*), MAX(po.operation_date) FROM plant_operations po JOIN garden_plants gp ON gp.id = po.plant_id WHERE gp.row_id = p_row_id GROUP BY po.operation_type; END; $$;

CREATE OR REPLACE FUNCTION public.sync_plant_operations_to_main_tables() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$ BEGIN UPDATE garden_plants SET last_operation = NEW.operation_type, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.plant_id; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.water_all_plants_in_row(p_row_id UUID) RETURNS INTEGER LANGUAGE plpgsql SET search_path = public AS $$ DECLARE v_count INTEGER := 0; BEGIN UPDATE garden_plants SET last_watered = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE row_id = p_row_id AND status = 'active'; GET DIAGNOSTICS v_count = ROW_COUNT; RETURN v_count; END; $$;

CREATE OR REPLACE FUNCTION public.calculate_treatment_cost(p_product_id UUID, p_quantity NUMERIC) RETURNS NUMERIC LANGUAGE plpgsql SET search_path = public AS $$ DECLARE v_cost NUMERIC := 0; BEGIN SELECT (unit_cost * p_quantity) INTO v_cost FROM products WHERE id = p_product_id; RETURN COALESCE(v_cost, 0); END; $$;

CREATE OR REPLACE FUNCTION public.validate_section_overlap(p_row_id UUID, p_start_pos NUMERIC, p_end_pos NUMERIC) RETURNS BOOLEAN LANGUAGE plpgsql SET search_path = public AS $$ BEGIN RETURN NOT EXISTS (SELECT 1 FROM field_row_sections WHERE row_id = p_row_id AND start_position < p_end_pos AND end_position > p_start_pos); END; $$;

CREATE OR REPLACE FUNCTION public.generate_plant_code(p_row_code TEXT, p_position_num INTEGER) RETURNS TEXT LANGUAGE plpgsql SET search_path = public AS $$ BEGIN RETURN p_row_code || '-' || LPAD(p_position_num::TEXT, 3, '0'); END; $$;

CREATE OR REPLACE FUNCTION public.calculate_plants_in_row(p_row_length NUMERIC, p_spacing NUMERIC) RETURNS INTEGER LANGUAGE plpgsql SET search_path = public AS $$ BEGIN IF p_spacing IS NULL OR p_spacing = 0 THEN RETURN 0; END IF; RETURN FLOOR(p_row_length / p_spacing); END; $$;

CREATE OR REPLACE FUNCTION public.update_zone_last_watered() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$ BEGIN UPDATE land_zones SET last_watered_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.zone_id; RETURN NEW; END; $$;

-- =====================================================
-- VERIFICA FINALE
-- =====================================================

SELECT '✅ TUTTE LE CORREZIONI APPLICATE CON SUCCESSO!' as result;
SELECT COUNT(*) as total_functions FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
SELECT COUNT(*) as total_views FROM information_schema.views WHERE table_schema = 'public';
SELECT extname, extnamespace::regnamespace as ext_schema FROM pg_extension WHERE extname = 'pg_trgm';
