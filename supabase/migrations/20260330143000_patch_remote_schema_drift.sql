-- Emergency patch for production schema drift.
-- Goal: restore compatibility with the current frontend without applying the full
-- backlog of historical migrations on the linked remote project.

-- =====================================================
-- 1. SENSOR READINGS COMPATIBILITY
-- =====================================================

ALTER TABLE IF EXISTS public.sensor_readings
ADD COLUMN IF NOT EXISTS zone_id UUID,
ADD COLUMN IF NOT EXISTS irrigation_zone_id UUID,
ADD COLUMN IF NOT EXISTS reading_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sensor_id TEXT,
ADD COLUMN IF NOT EXISTS is_simulated BOOLEAN NOT NULL DEFAULT false;

UPDATE public.sensor_readings
SET reading_date = COALESCE(reading_date, recorded_at, created_at, NOW())
WHERE reading_date IS NULL;

CREATE OR REPLACE FUNCTION public.sync_sensor_readings_timestamp_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reading_date IS NULL AND NEW.recorded_at IS NULL THEN
    NEW.reading_date = NOW();
    NEW.recorded_at = NEW.reading_date;
  ELSIF NEW.reading_date IS NULL THEN
    NEW.reading_date = NEW.recorded_at;
  ELSIF NEW.recorded_at IS NULL THEN
    NEW.recorded_at = NEW.reading_date;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_sensor_readings_timestamp_columns ON public.sensor_readings;
CREATE TRIGGER sync_sensor_readings_timestamp_columns
  BEFORE INSERT OR UPDATE ON public.sensor_readings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_sensor_readings_timestamp_columns();

CREATE INDEX IF NOT EXISTS idx_sensor_readings_garden_type_reading_date
  ON public.sensor_readings(garden_id, sensor_type, reading_date DESC);

-- =====================================================
-- 2. ACTIVE AI ADVICE TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.crop_rotation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  field_row_id UUID REFERENCES public.field_rows(id) ON DELETE CASCADE,
  zone_id UUID,
  plant_variety_id UUID,
  plant_name TEXT NOT NULL,
  plant_family TEXT NOT NULL,
  planted_date DATE NOT NULL,
  harvest_date DATE,
  season TEXT NOT NULL,
  year INTEGER NOT NULL,
  yield_kg DECIMAL(10,2),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  diseases TEXT[],
  pests TEXT[],
  nutrient_deficiencies TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_rotation_history_garden_id
  ON public.crop_rotation_history(garden_id);
CREATE INDEX IF NOT EXISTS idx_crop_rotation_history_field_row_id
  ON public.crop_rotation_history(field_row_id);

CREATE TABLE IF NOT EXISTS public.crop_rotation_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  field_row_id UUID REFERENCES public.field_rows(id) ON DELETE CASCADE,
  zone_id UUID,
  current_crop TEXT NOT NULL,
  current_family TEXT NOT NULL,
  suggested_next_crops JSONB NOT NULL,
  rotation_cycle INTEGER NOT NULL DEFAULT 4,
  reasoning TEXT NOT NULL,
  benefits TEXT[],
  risks_to_avoid TEXT[],
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  status TEXT NOT NULL DEFAULT 'SUGGESTED' CHECK (status IN ('SUGGESTED', 'ACCEPTED', 'REJECTED', 'COMPLETED')),
  accepted_crop TEXT,
  accepted_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_rotation_plans_garden_id
  ON public.crop_rotation_plans(garden_id);
CREATE INDEX IF NOT EXISTS idx_crop_rotation_plans_field_row_id
  ON public.crop_rotation_plans(field_row_id);

CREATE TABLE IF NOT EXISTS public.biological_control_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'INSETTI_BENEFICI', 'TRAPPOLE', 'BARRIERE_FISICHE',
    'ROTAZIONE', 'CONSOCIAZIONE', 'MONITORAGGIO'
  )),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  frequency TEXT NOT NULL DEFAULT 'WEEKLY' CHECK (frequency IN (
    'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'SEASONAL', 'YEARLY', 'ONE_TIME'
  )),
  applicable_months INTEGER[],
  applicable_seasons TEXT[],
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'
  )),
  due_date DATE,
  completed_date DATE,
  completed_by TEXT,
  notes TEXT,
  effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  evidence_photos TEXT[],
  required_for_certification BOOLEAN DEFAULT false,
  certification_types TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biological_control_checklists_garden_id
  ON public.biological_control_checklists(garden_id);

CREATE TABLE IF NOT EXISTS public.biological_control_subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES public.biological_control_checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'
  )),
  completed_date DATE,
  completed_by TEXT,
  notes TEXT,
  evidence_photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biological_control_subtasks_checklist_id
  ON public.biological_control_subtasks(checklist_id);

-- =====================================================
-- 3. FIELD ROW HISTORY TABLE + RPC + VIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.field_row_crop_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_row_id UUID NOT NULL REFERENCES public.garden_rows(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  crop_variety TEXT,
  crop_family TEXT,
  crop_type TEXT,
  planting_date TIMESTAMPTZ NOT NULL,
  harvest_date TIMESTAMPTZ,
  days_to_harvest INTEGER,
  planting_context JSONB DEFAULT '{}'::jsonb,
  yield_kg DECIMAL(10,2),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  health_issues JSONB DEFAULT '[]'::jsonb,
  irrigation_method TEXT,
  fertilization_type TEXT,
  treatments_count INTEGER DEFAULT 0,
  notes TEXT,
  success_factors JSONB DEFAULT '[]'::jsonb,
  problems JSONB DEFAULT '[]'::jsonb,
  ai_recommendations JSONB DEFAULT '{}'::jsonb,
  rotation_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_row_id
  ON public.field_row_crop_history(garden_row_id);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_garden_id
  ON public.field_row_crop_history(garden_id);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_user_id
  ON public.field_row_crop_history(user_id);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_dates
  ON public.field_row_crop_history(planting_date, harvest_date);
CREATE INDEX IF NOT EXISTS idx_field_row_crop_history_crop_family
  ON public.field_row_crop_history(crop_family);

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_crop_rotation_history_updated_at ON public.crop_rotation_history;
CREATE TRIGGER update_crop_rotation_history_updated_at
  BEFORE UPDATE ON public.crop_rotation_history
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_crop_rotation_plans_updated_at ON public.crop_rotation_plans;
CREATE TRIGGER update_crop_rotation_plans_updated_at
  BEFORE UPDATE ON public.crop_rotation_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_biological_control_checklists_updated_at ON public.biological_control_checklists;
CREATE TRIGGER update_biological_control_checklists_updated_at
  BEFORE UPDATE ON public.biological_control_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_biological_control_subtasks_updated_at ON public.biological_control_subtasks;
CREATE TRIGGER update_biological_control_subtasks_updated_at
  BEFORE UPDATE ON public.biological_control_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_field_row_crop_history_updated_at ON public.field_row_crop_history;
CREATE TRIGGER update_field_row_crop_history_updated_at
  BEFORE UPDATE ON public.field_row_crop_history
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE OR REPLACE FUNCTION public.get_field_row_history(row_id UUID)
RETURNS TABLE (
  crop_name TEXT,
  crop_family TEXT,
  planting_date TIMESTAMPTZ,
  harvest_date TIMESTAMPTZ,
  days_to_harvest INTEGER,
  yield_kg DECIMAL,
  quality_rating INTEGER,
  rotation_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.crop_name,
    h.crop_family,
    h.planting_date,
    h.harvest_date,
    h.days_to_harvest,
    h.yield_kg,
    h.quality_rating,
    h.rotation_score
  FROM public.field_row_crop_history h
  WHERE h.garden_row_id = row_id
  ORDER BY h.planting_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.calculate_rotation_score(
  row_id UUID,
  new_crop_family TEXT
)
RETURNS INTEGER AS $$
DECLARE
  last_crop_family TEXT;
  last_planting_date TIMESTAMPTZ;
  months_since_last INTEGER;
  score INTEGER := 100;
BEGIN
  SELECT crop_family, planting_date
  INTO last_crop_family, last_planting_date
  FROM public.field_row_crop_history
  WHERE garden_row_id = row_id
    AND crop_family = new_crop_family
  ORDER BY planting_date DESC
  LIMIT 1;

  IF last_crop_family IS NULL THEN
    RETURN 100;
  END IF;

  months_since_last := (
    EXTRACT(YEAR FROM AGE(NOW(), last_planting_date))::INTEGER * 12
  ) + EXTRACT(MONTH FROM AGE(NOW(), last_planting_date))::INTEGER;

  IF months_since_last < 6 THEN
    score := 20;
  ELSIF months_since_last < 12 THEN
    score := 50;
  ELSIF months_since_last < 24 THEN
    score := 80;
  ELSE
    score := 100;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_rotation_suggestions(row_id UUID)
RETURNS JSONB AS $$
DECLARE
  last_families TEXT[];
  suggestions JSONB := '[]'::jsonb;
BEGIN
  SELECT ARRAY_AGG(crop_family ORDER BY planting_date DESC)
  INTO last_families
  FROM (
    SELECT DISTINCT crop_family, planting_date
    FROM public.field_row_crop_history
    WHERE garden_row_id = row_id
    ORDER BY planting_date DESC
    LIMIT 3
  ) sub;

  IF last_families IS NULL OR array_length(last_families, 1) = 0 THEN
    suggestions := jsonb_build_array(
      jsonb_build_object('family', 'Leguminose', 'reason', 'Arricchiscono il terreno di azoto', 'score', 100)
    );
  ELSIF last_families[1] = 'Solanacee' THEN
    suggestions := jsonb_build_array(
      jsonb_build_object('family', 'Leguminose', 'reason', 'Ripristinano l''azoto consumato dalle solanacee', 'score', 95),
      jsonb_build_object('family', 'Crucifere', 'reason', 'Buona alternativa, radici diverse', 'score', 85)
    );
  ELSIF last_families[1] = 'Leguminose' THEN
    suggestions := jsonb_build_array(
      jsonb_build_object('family', 'Crucifere', 'reason', 'Sfruttano l''azoto lasciato dalle leguminose', 'score', 95),
      jsonb_build_object('family', 'Cucurbitacee', 'reason', 'Beneficiano del terreno arricchito', 'score', 90)
    );
  ELSIF last_families[1] = 'Crucifere' THEN
    suggestions := jsonb_build_array(
      jsonb_build_object('family', 'Cucurbitacee', 'reason', 'Completano il ciclo di rotazione', 'score', 95),
      jsonb_build_object('family', 'Solanacee', 'reason', 'Iniziano un nuovo ciclo', 'score', 85)
    );
  ELSE
    suggestions := jsonb_build_array(
      jsonb_build_object('family', 'Solanacee', 'reason', 'Iniziano un nuovo ciclo di rotazione', 'score', 90),
      jsonb_build_object('family', 'Leguminose', 'reason', 'Sempre una buona scelta per arricchire', 'score', 95)
    );
  END IF;

  RETURN suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE VIEW public.field_row_rotation_analysis AS
SELECT
  gr.id AS row_id,
  COALESCE(gr.crop_name, gz.name, 'Filare ' || gr.row_number::TEXT) AS row_name,
  gz.garden_id,
  COUNT(h.id) AS total_crops,
  COUNT(DISTINCT h.crop_family) AS families_used,
  MAX(h.planting_date) AS last_planting,
  AVG(h.rotation_score) AS avg_rotation_score,
  AVG(h.quality_rating) AS avg_quality,
  SUM(h.yield_kg) AS total_yield_kg
FROM public.garden_rows gr
LEFT JOIN public.garden_zones gz ON gz.id = gr.garden_zone_id
LEFT JOIN public.field_row_crop_history h ON h.garden_row_id = gr.id
GROUP BY gr.id, gr.crop_name, gz.name, gr.row_number, gz.garden_id;

CREATE OR REPLACE VIEW public.crop_performance_by_family AS
SELECT
  crop_family,
  COUNT(*) AS plantings_count,
  AVG(days_to_harvest) AS avg_days_to_harvest,
  AVG(yield_kg) AS avg_yield_kg,
  AVG(quality_rating) AS avg_quality,
  AVG(rotation_score) AS avg_rotation_score
FROM public.field_row_crop_history
WHERE harvest_date IS NOT NULL
GROUP BY crop_family
ORDER BY avg_quality DESC, avg_yield_kg DESC;

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

ALTER TABLE public.crop_rotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_rotation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biological_control_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biological_control_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_row_crop_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crop_rotation_history_manage_own_gardens ON public.crop_rotation_history;
CREATE POLICY crop_rotation_history_manage_own_gardens
  ON public.crop_rotation_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens g
      WHERE g.id = crop_rotation_history.garden_id
        AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.gardens g
      WHERE g.id = crop_rotation_history.garden_id
        AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS crop_rotation_plans_manage_own_gardens ON public.crop_rotation_plans;
CREATE POLICY crop_rotation_plans_manage_own_gardens
  ON public.crop_rotation_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens g
      WHERE g.id = crop_rotation_plans.garden_id
        AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.gardens g
      WHERE g.id = crop_rotation_plans.garden_id
        AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS biological_control_checklists_manage_own_gardens ON public.biological_control_checklists;
CREATE POLICY biological_control_checklists_manage_own_gardens
  ON public.biological_control_checklists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens g
      WHERE g.id = biological_control_checklists.garden_id
        AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.gardens g
      WHERE g.id = biological_control_checklists.garden_id
        AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS biological_control_subtasks_manage_own_gardens ON public.biological_control_subtasks;
CREATE POLICY biological_control_subtasks_manage_own_gardens
  ON public.biological_control_subtasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.biological_control_checklists c
      JOIN public.gardens g ON g.id = c.garden_id
      WHERE c.id = biological_control_subtasks.checklist_id
        AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.biological_control_checklists c
      JOIN public.gardens g ON g.id = c.garden_id
      WHERE c.id = biological_control_subtasks.checklist_id
        AND g.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS field_row_crop_history_manage_own_rows ON public.field_row_crop_history;
CREATE POLICY field_row_crop_history_manage_own_rows
  ON public.field_row_crop_history
  FOR ALL
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.gardens g
      WHERE g.id = field_row_crop_history.garden_id
        AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.gardens g
      WHERE g.id = field_row_crop_history.garden_id
        AND g.user_id = auth.uid()
    )
  );
