BEGIN;

CREATE TABLE IF NOT EXISTS public.season_adjustment_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id uuid NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_year integer NOT NULL CHECK (season_year BETWEEN 2000 AND 2200),
  season text NOT NULL CHECK (season IN ('Summer', 'Winter')),
  adjustments jsonb NOT NULL CHECK (jsonb_typeof(adjustments) = 'array' AND jsonb_array_length(adjustments) > 0),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (garden_id, season_year, season)
);

ALTER TABLE public.season_adjustment_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS season_adjustment_owner_all ON public.season_adjustment_decisions;
CREATE POLICY season_adjustment_owner_all
  ON public.season_adjustment_decisions
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = garden_id AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.gardens g
      WHERE g.id = garden_id AND g.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.season_adjustment_decisions TO authenticated;

COMMIT;
