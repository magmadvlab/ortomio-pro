-- Forward-only repair verified against the 2026-11-18 schema snapshot.
-- No synthetic values or historical harvest attribution are backfilled.
BEGIN;

ALTER TABLE public.irrigation_zones
  ADD COLUMN IF NOT EXISTS soil_type text,
  ADD COLUMN IF NOT EXISTS drainage_quality text,
  ADD COLUMN IF NOT EXISTS water_retention text,
  ADD COLUMN IF NOT EXISTS slope_percentage numeric,
  ADD COLUMN IF NOT EXISTS sun_exposure text,
  ADD COLUMN IF NOT EXISTS ph_level numeric,
  ADD COLUMN IF NOT EXISTS organic_matter_percentage numeric,
  ADD COLUMN IF NOT EXISTS efficiency_percentage numeric;

CREATE TABLE IF NOT EXISTS public.water_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.irrigation_zones(id) ON DELETE CASCADE,
  calculation_date date NOT NULL,
  et0_mm numeric NOT NULL CHECK (et0_mm >= 0),
  kc_coefficient numeric NOT NULL CHECK (kc_coefficient >= 0),
  etc_mm numeric NOT NULL CHECK (etc_mm >= 0),
  crop_stage text, crop_age_days integer, leaf_area_index numeric,
  effective_rainfall_mm numeric, temperature_avg_celsius numeric,
  humidity_avg_percentage numeric, wind_speed_avg_kmh numeric, solar_radiation_mjm2 numeric,
  soil_water_deficit_mm numeric, field_capacity_mm numeric, wilting_point_mm numeric, available_water_mm numeric,
  irrigation_need_mm numeric NOT NULL CHECK (irrigation_need_mm >= 0),
  recommended_volume_liters numeric NOT NULL CHECK (recommended_volume_liters >= 0),
  recommended_duration_minutes integer,
  calculation_method text NOT NULL,
  weather_data_source text, confidence_level numeric,
  ai_adjustment_factor numeric, ai_confidence_score numeric, ai_reasoning text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.water_requirements ADD COLUMN IF NOT EXISTS weather_data jsonb;
CREATE INDEX IF NOT EXISTS water_requirements_zone_date_idx ON public.water_requirements(zone_id, calculation_date, created_at);
ALTER TABLE public.water_requirements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.water_requirements FROM anon;
GRANT SELECT, INSERT ON public.water_requirements TO authenticated;
GRANT ALL ON public.water_requirements TO service_role;
DROP POLICY IF EXISTS water_requirements_owner_read ON public.water_requirements;
CREATE POLICY water_requirements_owner_read ON public.water_requirements FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.irrigation_zones z JOIN public.gardens g ON g.id = z.garden_id WHERE z.id = zone_id AND g.user_id = auth.uid()));
DROP POLICY IF EXISTS water_requirements_owner_insert ON public.water_requirements;
CREATE POLICY water_requirements_owner_insert ON public.water_requirements FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.irrigation_zones z JOIN public.gardens g ON g.id = z.garden_id WHERE z.id = zone_id AND g.user_id = auth.uid()));

ALTER TABLE public.harvest_logs
  ADD COLUMN IF NOT EXISTS field_row_id uuid REFERENCES public.field_rows(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS plant_id uuid REFERENCES public.garden_plants(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS harvest_logs_field_row_idx ON public.harvest_logs(field_row_id, harvest_date);

CREATE OR REPLACE FUNCTION public.validate_harvest_scope() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE task_row uuid; plant_row uuid;
BEGIN
  -- Preserve historical harvests when their garden is removed.
  IF NEW.garden_id IS NULL THEN
    IF TG_OP = 'INSERT' AND (NEW.field_row_id IS NOT NULL OR NEW.plant_id IS NOT NULL) THEN
      RAISE EXCEPTION 'harvest_garden_required' USING ERRCODE = '23514';
    END IF;
    NEW.field_row_id := NULL; NEW.plant_id := NULL;
    RETURN NEW;
  END IF;
  IF NEW.task_id IS NOT NULL THEN
    SELECT t.field_row_id INTO task_row FROM public.garden_tasks t WHERE t.id = NEW.task_id AND t.garden_id = NEW.garden_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'harvest_task_scope_mismatch' USING ERRCODE = '23514'; END IF;
    -- Capture the association at creation; never reassign history when a task moves.
    IF TG_OP = 'INSERT' AND NEW.field_row_id IS NULL THEN NEW.field_row_id := task_row; END IF;
  END IF;
  IF NEW.plant_id IS NOT NULL THEN
    SELECT p.field_row_id INTO plant_row FROM public.garden_plants p WHERE p.id = NEW.plant_id AND p.garden_id = NEW.garden_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'harvest_plant_scope_mismatch' USING ERRCODE = '23514'; END IF;
    IF TG_OP = 'INSERT' AND NEW.field_row_id IS NULL THEN NEW.field_row_id := plant_row; END IF;
    IF TG_OP = 'INSERT' AND plant_row IS DISTINCT FROM NEW.field_row_id THEN RAISE EXCEPTION 'harvest_plant_row_mismatch' USING ERRCODE = '23514'; END IF;
  END IF;
  IF NEW.field_row_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.field_rows r WHERE r.id = NEW.field_row_id AND r.garden_id = NEW.garden_id) THEN
    RAISE EXCEPTION 'harvest_row_scope_mismatch' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS harvest_scope_contract ON public.harvest_logs;
CREATE TRIGGER harvest_scope_contract BEFORE INSERT OR UPDATE OF garden_id, task_id, field_row_id, plant_id ON public.harvest_logs
FOR EACH ROW EXECUTE FUNCTION public.validate_harvest_scope();
COMMIT;
