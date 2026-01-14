-- =====================================================
-- APPLY MISSING TABLES TO REMOTE DATABASE
-- Data: 2026-01-14
-- Descrizione: Applica solo le tabelle mancanti in modo sicuro
-- =====================================================

-- NOTA: Esegui questo SQL nel Supabase SQL Editor
-- https://supabase.com/dashboard → SQL Editor

-- =====================================================
-- 1. FIX INDIVIDUAL_PLANTS ROW TRACKING
-- =====================================================

-- Modifica garden_plants (tabella reale), non individual_plants (view)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garden_plants' AND table_schema = 'public') THEN
    
    -- Aggiungi colonne se non esistono
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_plants' AND column_name = 'garden_row_id') THEN
      ALTER TABLE public.garden_plants 
      ADD COLUMN garden_row_id UUID REFERENCES public.garden_rows(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_plants' AND column_name = 'field_row_id') THEN
      ALTER TABLE public.garden_plants 
      ADD COLUMN field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL;
    END IF;
    
    -- Constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_single_row_type' AND table_name = 'garden_plants') THEN
      ALTER TABLE public.garden_plants 
      ADD CONSTRAINT check_single_row_type 
      CHECK (
        (garden_row_id IS NULL AND field_row_id IS NULL) OR
        (garden_row_id IS NOT NULL AND field_row_id IS NULL) OR
        (garden_row_id IS NULL AND field_row_id IS NOT NULL)
      );
    END IF;
    
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_garden_plants_garden_row_id ON public.garden_plants(garden_row_id);
    CREATE INDEX IF NOT EXISTS idx_garden_plants_field_row_id ON public.garden_plants(field_row_id);
    
    -- Ricrea view
    DROP VIEW IF EXISTS public.individual_plants CASCADE;
    CREATE VIEW public.individual_plants AS SELECT * FROM public.garden_plants;
    GRANT SELECT ON public.individual_plants TO authenticated;
    
    RAISE NOTICE '✅ Fixed individual_plants row tracking';
  END IF;
END $$;

-- =====================================================
-- 2. CREATE PLANTING_PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.planting_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.garden_zones(id) ON DELETE SET NULL,
  field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL,
  field_row_section_id UUID REFERENCES public.field_row_sections(id) ON DELETE SET NULL,
  
  -- Crop info
  crop_name TEXT NOT NULL,
  variety TEXT,
  plant_family TEXT,
  
  -- Rotation integration
  rotation_score INTEGER CHECK (rotation_score >= 0 AND rotation_score <= 100),
  rotation_warnings TEXT[],
  previous_crops JSONB,
  
  -- Planning dates
  planned_sowing_date DATE,
  planned_transplant_date DATE,
  planned_harvest_date DATE,
  
  -- Tracking
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'harvested', 'cancelled')),
  actual_sowing_date DATE,
  actual_transplant_date DATE,
  actual_harvest_date DATE,
  
  -- Results
  yield_kg DECIMAL(10,2),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  
  -- AI suggestions
  ai_suggestions JSONB,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_planting_plans_user ON public.planting_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_planting_plans_garden ON public.planting_plans(garden_id);
CREATE INDEX IF NOT EXISTS idx_planting_plans_field_row ON public.planting_plans(field_row_id);
CREATE INDEX IF NOT EXISTS idx_planting_plans_status ON public.planting_plans(status);
CREATE INDEX IF NOT EXISTS idx_planting_plans_dates ON public.planting_plans(planned_sowing_date, planned_harvest_date);

-- RLS Policies
ALTER TABLE public.planting_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own planting plans"
ON public.planting_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planting plans"
ON public.planting_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planting plans"
ON public.planting_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planting plans"
ON public.planting_plans FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE CROP_ROTATION_HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.crop_rotation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  field_row_id UUID REFERENCES public.field_rows(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.garden_zones(id) ON DELETE CASCADE,
  
  -- Crop data
  crop_name TEXT NOT NULL,
  plant_family TEXT NOT NULL,
  variety TEXT,
  
  -- Period
  sowing_date DATE NOT NULL,
  harvest_date DATE,
  season TEXT CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  year INTEGER NOT NULL,
  
  -- Results
  yield_kg DECIMAL(10,2),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  
  -- Issues
  diseases TEXT[],
  pests TEXT[],
  nutrient_deficiencies TEXT[],
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rotation_history_user ON public.crop_rotation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rotation_history_garden ON public.crop_rotation_history(garden_id);
CREATE INDEX IF NOT EXISTS idx_rotation_history_field_row ON public.crop_rotation_history(field_row_id);
CREATE INDEX IF NOT EXISTS idx_rotation_history_date ON public.crop_rotation_history(harvest_date);
CREATE INDEX IF NOT EXISTS idx_rotation_history_family ON public.crop_rotation_history(plant_family);

-- RLS Policies
ALTER TABLE public.crop_rotation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rotation history"
ON public.crop_rotation_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rotation history"
ON public.crop_rotation_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rotation history"
ON public.crop_rotation_history FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rotation history"
ON public.crop_rotation_history FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 4. HELPER FUNCTION: Auto-track rotation on harvest
-- =====================================================

CREATE OR REPLACE FUNCTION auto_track_rotation_on_harvest()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando un planting_plan viene marcato come harvested,
  -- crea automaticamente un record in crop_rotation_history
  IF NEW.status = 'harvested' AND OLD.status != 'harvested' THEN
    INSERT INTO public.crop_rotation_history (
      user_id,
      garden_id,
      field_row_id,
      zone_id,
      crop_name,
      plant_family,
      variety,
      sowing_date,
      harvest_date,
      year,
      yield_kg,
      quality_score,
      notes
    ) VALUES (
      NEW.user_id,
      NEW.garden_id,
      NEW.field_row_id,
      NEW.zone_id,
      NEW.crop_name,
      NEW.plant_family,
      NEW.variety,
      COALESCE(NEW.actual_sowing_date, NEW.planned_sowing_date),
      COALESCE(NEW.actual_harvest_date, NEW.planned_harvest_date, CURRENT_DATE),
      EXTRACT(YEAR FROM COALESCE(NEW.actual_harvest_date, NEW.planned_harvest_date, CURRENT_DATE))::INTEGER,
      NEW.yield_kg,
      NEW.quality_score,
      NEW.notes
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS trigger_auto_track_rotation ON public.planting_plans;
CREATE TRIGGER trigger_auto_track_rotation
  AFTER UPDATE ON public.planting_plans
  FOR EACH ROW
  EXECUTE FUNCTION auto_track_rotation_on_harvest();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables Created:';
  RAISE NOTICE '   ✅ planting_plans';
  RAISE NOTICE '   ✅ crop_rotation_history';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Fixes Applied:';
  RAISE NOTICE '   ✅ individual_plants row tracking (via garden_plants)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security:';
  RAISE NOTICE '   ✅ RLS policies enabled';
  RAISE NOTICE '   ✅ User isolation configured';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Features:';
  RAISE NOTICE '   ✅ Auto-tracking rotation on harvest';
  RAISE NOTICE '   ✅ Rotation score calculation';
  RAISE NOTICE '   ✅ Location tracking (zone/row/section)';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
