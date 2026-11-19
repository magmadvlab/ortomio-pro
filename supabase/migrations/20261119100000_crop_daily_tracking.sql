BEGIN;
CREATE TABLE public.crop_daily_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  garden_id uuid NOT NULL REFERENCES public.gardens ON DELETE CASCADE,
  cultivation_id uuid NOT NULL REFERENCES public.garden_tasks ON DELETE CASCADE,
  tracking_date date NOT NULL,
  daily_gdd numeric NOT NULL, accumulated_gdd numeric NOT NULL,
  daily_chill_hours numeric, accumulated_chill_hours numeric,
  cold_stress_index numeric, heat_stress_index numeric, water_stress_index numeric,
  phenological_stage text, growth_rate_estimate numeric,
  UNIQUE (cultivation_id, tracking_date)
);
CREATE INDEX crop_daily_tracking_garden_date ON public.crop_daily_tracking(garden_id, tracking_date);
ALTER TABLE public.crop_daily_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY crop_tracking_owner ON public.crop_daily_tracking FOR ALL TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM public.gardens g JOIN public.garden_tasks t ON t.garden_id = g.id
  WHERE g.user_id = auth.uid() AND g.id = crop_daily_tracking.garden_id AND t.id = cultivation_id
));
GRANT SELECT, INSERT, UPDATE ON public.crop_daily_tracking TO authenticated, service_role;
COMMIT;
