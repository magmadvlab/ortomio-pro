CREATE TABLE IF NOT EXISTS public.garden_soil_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES public.land_zones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compaction NUMERIC(4, 3) NOT NULL DEFAULT 0.5 CHECK (compaction BETWEEN 0 AND 1),
  drainage TEXT NOT NULL DEFAULT 'moderate' CHECK (drainage IN ('poor', 'moderate', 'good', 'excellent')),
  workable_depth_cm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (workable_depth_cm BETWEEN 0 AND 500),
  last_work_date TIMESTAMPTZ,
  last_work_type TEXT CHECK (last_work_type IN ('Plowing', 'Tilling', 'Sarchiatura', 'Rincalzatura')),
  last_rain_date TIMESTAMPTZ,
  last_rain_amount_mm NUMERIC(8, 2) CHECK (last_rain_amount_mm BETWEEN 0 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (garden_id, zone_id)
);

CREATE INDEX IF NOT EXISTS idx_garden_soil_states_garden
  ON public.garden_soil_states(garden_id);

ALTER TABLE public.garden_soil_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage soil states in own gardens" ON public.garden_soil_states;
CREATE POLICY "Users manage soil states in own gardens"
  ON public.garden_soil_states FOR ALL
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = garden_soil_states.garden_id AND g.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.land_zones z
      WHERE z.id = garden_soil_states.zone_id
        AND z.garden_id = garden_soil_states.garden_id
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = garden_soil_states.garden_id AND g.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.land_zones z
      WHERE z.id = garden_soil_states.zone_id
        AND z.garden_id = garden_soil_states.garden_id
    )
  );
