CREATE TABLE IF NOT EXISTS public.phenology_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  crop_context_id TEXT NOT NULL CHECK (crop_context_id IN ('orchard', 'olive', 'vineyard')),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('garden', 'zone', 'field_row', 'tree', 'plant')),
  scope_id TEXT,
  zone_id TEXT,
  field_row_id TEXT,
  tree_id TEXT,
  plant_id TEXT,
  observed_at TIMESTAMPTZ NOT NULL,
  phenology_stage TEXT NOT NULL CHECK (
    phenology_stage IN (
      'dormancy',
      'bud_break',
      'flowering',
      'fruit_set',
      'fruit_growth',
      'fruit_maturation',
      'harvest',
      'leaf_fall',
      'pit_hardening',
      'veraison',
      'shoot_growth',
      'ripening'
    )
  ),
  bbch_code TEXT,
  stage_intensity NUMERIC(4,2) CHECK (stage_intensity >= 0 AND stage_intensity <= 1),
  confidence_level NUMERIC(4,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
  observation_source TEXT NOT NULL CHECK (
    observation_source IN ('visual', 'sensor', 'ai_analysis', 'drone_survey', 'manual_estimate')
  ),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_precision_phenology_garden_observed
  ON public.phenology_observations(garden_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_precision_phenology_crop_scope
  ON public.phenology_observations(crop_context_id, scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_precision_phenology_zone
  ON public.phenology_observations(zone_id)
  WHERE zone_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_precision_phenology_field_row
  ON public.phenology_observations(field_row_id)
  WHERE field_row_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_precision_phenology_tree
  ON public.phenology_observations(tree_id)
  WHERE tree_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_precision_phenology_plant
  ON public.phenology_observations(plant_id)
  WHERE plant_id IS NOT NULL;

ALTER TABLE public.phenology_observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own phenology observations" ON public.phenology_observations;
CREATE POLICY "Users can view their own phenology observations"
  ON public.phenology_observations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = phenology_observations.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own phenology observations" ON public.phenology_observations;
CREATE POLICY "Users can insert their own phenology observations"
  ON public.phenology_observations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = phenology_observations.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own phenology observations" ON public.phenology_observations;
CREATE POLICY "Users can update their own phenology observations"
  ON public.phenology_observations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = phenology_observations.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own phenology observations" ON public.phenology_observations;
CREATE POLICY "Users can delete their own phenology observations"
  ON public.phenology_observations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = phenology_observations.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'update_updated_at_column'
  ) THEN
    DROP TRIGGER IF EXISTS update_phenology_observations_updated_at ON public.phenology_observations;
    CREATE TRIGGER update_phenology_observations_updated_at
      BEFORE UPDATE ON public.phenology_observations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
