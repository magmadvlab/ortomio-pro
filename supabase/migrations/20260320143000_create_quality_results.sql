CREATE TABLE IF NOT EXISTS public.quality_results (
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
  harvest_log_id UUID REFERENCES public.harvest_logs(id) ON DELETE SET NULL,
  lot_code TEXT,
  sample_label TEXT,
  sample_size NUMERIC(10,2),
  recorded_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL CHECK (
    source IN ('lab_analysis', 'field_measurement', 'ai_estimate', 'mill_report', 'packing_line', 'manual_entry')
  ),
  quality_grade TEXT CHECK (quality_grade IN ('premium', 'excellent', 'good', 'fair', 'poor')),
  quality_score NUMERIC(5,2) CHECK (quality_score >= 0 AND quality_score <= 100),
  marketable_yield_kg NUMERIC(10,2),
  rejected_yield_kg NUMERIC(10,2),
  brix NUMERIC(6,2),
  acidity NUMERIC(6,2),
  ph NUMERIC(6,2),
  firmness NUMERIC(8,2),
  dry_matter_percentage NUMERIC(6,2),
  oil_content_percentage NUMERIC(6,2),
  oil_yield_percentage NUMERIC(6,2),
  defect_incidence_percentage NUMERIC(6,2),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quality_results_garden_recorded
  ON public.quality_results(garden_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_quality_results_crop_scope
  ON public.quality_results(crop_context_id, scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_quality_results_lot_code
  ON public.quality_results(lot_code)
  WHERE lot_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quality_results_harvest_log
  ON public.quality_results(harvest_log_id)
  WHERE harvest_log_id IS NOT NULL;

ALTER TABLE public.quality_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own quality results" ON public.quality_results;
CREATE POLICY "Users can view their own quality results"
  ON public.quality_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = quality_results.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own quality results" ON public.quality_results;
CREATE POLICY "Users can insert their own quality results"
  ON public.quality_results
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = quality_results.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own quality results" ON public.quality_results;
CREATE POLICY "Users can update their own quality results"
  ON public.quality_results
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = quality_results.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own quality results" ON public.quality_results;
CREATE POLICY "Users can delete their own quality results"
  ON public.quality_results
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = quality_results.garden_id
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
    DROP TRIGGER IF EXISTS update_quality_results_updated_at ON public.quality_results;
    CREATE TRIGGER update_quality_results_updated_at
      BEFORE UPDATE ON public.quality_results
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
