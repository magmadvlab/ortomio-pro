CREATE TABLE IF NOT EXISTS public.variable_rate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_map_id UUID NOT NULL REFERENCES public.prescription_maps(id) ON DELETE CASCADE,
  prescription_zone_id UUID REFERENCES public.prescription_zones(id) ON DELETE CASCADE,
  application_date TIMESTAMPTZ NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT,
  planned_rate NUMERIC NOT NULL,
  actual_rate NUMERIC,
  unit TEXT NOT NULL,
  area_applied_sqm NUMERIC,
  total_product_used NUMERIC,
  machinery_used TEXT,
  operator_name TEXT,
  gps_track JSONB,
  application_accuracy NUMERIC,
  application_quality INTEGER CHECK (application_quality >= 1 AND application_quality <= 5),
  notes TEXT,
  weather_conditions JSONB,
  product_cost NUMERIC,
  application_cost NUMERIC,
  total_cost NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.variable_rate_applications
  ADD COLUMN IF NOT EXISTS planned_area_sqm NUMERIC,
  ADD COLUMN IF NOT EXISTS execution_status TEXT NOT NULL DEFAULT 'planned'
    CHECK (execution_status IN ('planned', 'completed', 'partial', 'missed')),
  ADD COLUMN IF NOT EXISTS execution_scope_type TEXT
    CHECK (execution_scope_type IN ('garden', 'zone', 'field_row', 'tree', 'plant')),
  ADD COLUMN IF NOT EXISTS execution_scope_id TEXT,
  ADD COLUMN IF NOT EXISTS source_operation_type TEXT
    CHECK (source_operation_type IN ('irrigation', 'fertilization', 'treatment', 'manual')),
  ADD COLUMN IF NOT EXISTS source_operation_id TEXT,
  ADD COLUMN IF NOT EXISTS smart_device_id TEXT;

CREATE INDEX IF NOT EXISTS idx_variable_rate_applications_map_id
  ON public.variable_rate_applications(prescription_map_id);
CREATE INDEX IF NOT EXISTS idx_variable_rate_applications_zone_id
  ON public.variable_rate_applications(prescription_zone_id);
CREATE INDEX IF NOT EXISTS idx_variable_rate_applications_date
  ON public.variable_rate_applications(application_date);
CREATE INDEX IF NOT EXISTS idx_variable_rate_applications_status
  ON public.variable_rate_applications(execution_status);
CREATE INDEX IF NOT EXISTS idx_variable_rate_applications_scope
  ON public.variable_rate_applications(execution_scope_type, execution_scope_id);
CREATE INDEX IF NOT EXISTS idx_variable_rate_applications_source_operation
  ON public.variable_rate_applications(source_operation_type, source_operation_id);

ALTER TABLE public.variable_rate_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own prescription executions" ON public.variable_rate_applications;
CREATE POLICY "Users can view their own prescription executions"
  ON public.variable_rate_applications
  FOR SELECT
  USING (
    prescription_map_id IN (
      SELECT pm.id
      FROM public.prescription_maps pm
      JOIN public.gardens g ON pm.garden_id = g.id
      WHERE g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their own prescription executions" ON public.variable_rate_applications;
CREATE POLICY "Users can manage their own prescription executions"
  ON public.variable_rate_applications
  FOR ALL
  USING (
    prescription_map_id IN (
      SELECT pm.id
      FROM public.prescription_maps pm
      JOIN public.gardens g ON pm.garden_id = g.id
      WHERE g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    prescription_map_id IN (
      SELECT pm.id
      FROM public.prescription_maps pm
      JOIN public.gardens g ON pm.garden_id = g.id
      WHERE g.user_id = auth.uid()
    )
  );
