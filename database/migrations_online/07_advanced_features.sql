-- ============================================
-- GRUPPO 7: ADVANCED FEATURES
-- ============================================
-- Feature avanzate per utenti PRO
-- 
-- Include:
-- - fertilizer_inventory
-- - phyto_inventory
-- - treatment_registry
-- - mechanical_work_register
-- - pesticide_license (modifiche a profiles)
-- - custom_crops
-- - crop_learning_events
-- 
-- ORDINE: Dopo core schema (01) e garden features (04)

-- ============================================
-- FERTILIZER INVENTORY
-- ============================================
CREATE TABLE IF NOT EXISTS fertilizer_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('organic', 'mineral', 'corrective', 'microelement')) NOT NULL,
  category TEXT NOT NULL,
  npk JSONB,
  quantity DECIMAL(8, 2) NOT NULL,
  unit TEXT CHECK (unit IN ('kg', 'L', 'bags')) NOT NULL,
  expiry_date DATE,
  cost_per_unit DECIMAL(8, 2),
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fertilizer_inventory_garden_id ON fertilizer_inventory(garden_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_inventory_expiry ON fertilizer_inventory(expiry_date) WHERE expiry_date IS NOT NULL;

-- ============================================
-- PHYTO INVENTORY
-- ============================================
CREATE TABLE IF NOT EXISTS phyto_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('bio', 'conventional')) NOT NULL,
  category TEXT NOT NULL,
  active_ingredient TEXT,
  quantity DECIMAL(8, 2) NOT NULL,
  unit TEXT CHECK (unit IN ('L', 'kg', 'units')) NOT NULL,
  expiry_date DATE,
  safety_interval_days INTEGER,
  requires_license BOOLEAN DEFAULT false,
  allowed_in_organic BOOLEAN DEFAULT true,
  cost_per_unit DECIMAL(8, 2),
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phyto_inventory_garden_id ON phyto_inventory(garden_id);
CREATE INDEX IF NOT EXISTS idx_phyto_inventory_expiry ON phyto_inventory(expiry_date) WHERE expiry_date IS NOT NULL;

-- ============================================
-- TREATMENT REGISTRY (per professionisti)
-- ============================================
CREATE TABLE IF NOT EXISTS treatment_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,
  treatment_date DATE NOT NULL,
  product_name TEXT NOT NULL,
  product_id UUID REFERENCES phyto_inventory(id) ON DELETE SET NULL,
  active_ingredient TEXT,
  dosage DECIMAL(8, 2) NOT NULL,
  dosage_unit TEXT CHECK (dosage_unit IN ('ml', 'g', 'L', 'kg')) NOT NULL,
  application_method TEXT CHECK (application_method IN ('spray', 'drip', 'soil', 'foliar', 'seed_treatment')) NOT NULL,
  target_pest_disease TEXT,
  weather_conditions JSONB,
  safety_interval_days INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_registry_user_id ON treatment_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_registry_garden_id ON treatment_registry(garden_id);
CREATE INDEX IF NOT EXISTS idx_treatment_registry_treatment_date ON treatment_registry(treatment_date);

-- ============================================
-- MECHANICAL WORK REGISTER
-- ============================================
CREATE TABLE IF NOT EXISTS mechanical_work_register (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  work_date DATE NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN (
    -- Suolo
    'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp', 'Mulching', 'PostSowingRolling',
    -- Preparazione Terreno
    'Clearing', 'Stumping', 'StoneRemoval', 'Leveling', 'DeepSubsoiling',
    'Digging', 'DeepHarrowing', 'Crumbling', 'Scraping', 'SurfaceLeveling',
    -- Tecniche Moderne
    'MinimumTillage', 'StripTillage', 'NoTill',
    -- Chioma
    'FormativePruning', 'MaintenancePruning', 'RejuvenationPruning', 'SummerPruning', 'WinterPruning', 
    'Thinning', 'Suckering', 'Defoliation', 'Tying', 'OliveShredding', 'RunnerManagement', 
    'StrawberryMulching', 'StrawberryCleaning', 'CaneRemoval', 'TipPruning', 'RaspberryTying', 
    'SuckerThinning', 'FruitBagging', 'ExoticThinning', 'Shredding',
    -- Generale
    'Topping', 'Pruning'
  )),
  equipment_type TEXT CHECK (equipment_type IN (
    'Tractor', 'RotaryHarrow', 'Shredder', 'FertilizerSpreader', 'Seeder', 
    'Topper', 'Defoliator', 'PrePruner', 'Thinner',
    'Rototiller', 'Cultivator', 'Mower', 'BrushCutter', 'TrackedCart', 'BackpackSprayer',
    'ElectricTier', 'ElectricPruner', 'TelescopicPruner',
    'Manual'
  )),
  equipment_attachment TEXT,
  work_metadata JSONB,
  area_sqm DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mechanical_work_user_id ON mechanical_work_register(user_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_garden_id ON mechanical_work_register(garden_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_work_date ON mechanical_work_register(work_date);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_work_type ON mechanical_work_register(work_type);

-- ============================================
-- CROP MECHANICAL WORKS
-- ============================================
CREATE TABLE IF NOT EXISTS crop_mechanical_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  work_type TEXT NOT NULL,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
  timing JSONB,
  equipment_suggested TEXT[],
  critical BOOLEAN DEFAULT false,
  frequency TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_crop_id ON crop_mechanical_works(crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_work_type ON crop_mechanical_works(work_type);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_priority ON crop_mechanical_works(priority DESC);

-- ============================================
-- CUSTOM CROPS
-- ============================================
CREATE TABLE IF NOT EXISTS custom_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  family TEXT,
  initial_data JSONB DEFAULT '{}'::jsonb,
  learned_patterns JSONB DEFAULT '{}'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_crops_user_id ON custom_crops(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_crops_garden_id ON custom_crops(garden_id);
CREATE INDEX IF NOT EXISTS idx_custom_crops_common_name ON custom_crops(common_name);

-- ============================================
-- CROP LEARNING EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS crop_learning_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('planting', 'harvest', 'work', 'treatment', 'problem', 'fertilize')),
  event_data JSONB NOT NULL,
  outcome JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_events_crop_id ON crop_learning_events(custom_crop_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_id ON crop_learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON crop_learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_events_created_at ON crop_learning_events(created_at DESC);

-- ============================================
-- MODIFICHE A PROFILES (Pesticide License)
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'pesticide_license_number') THEN
    ALTER TABLE profiles ADD COLUMN pesticide_license_number TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'pesticide_license_expiry') THEN
    ALTER TABLE profiles ADD COLUMN pesticide_license_expiry DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'preferred_treatment_type') THEN
    ALTER TABLE profiles ADD COLUMN preferred_treatment_type TEXT DEFAULT 'organic' 
      CHECK (preferred_treatment_type IN ('organic', 'classic', 'mixed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_pesticide_license_expiry 
ON profiles(pesticide_license_expiry) 
WHERE pesticide_license_expiry IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE fertilizer_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE phyto_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanical_work_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_mechanical_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_learning_events ENABLE ROW LEVEL SECURITY;

-- Policies per fertilizer_inventory
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'fertilizer_inventory' AND policyname = 'Users can access fertilizer inventory in their gardens'
  ) THEN
    CREATE POLICY "Users can access fertilizer inventory in their gardens"
      ON fertilizer_inventory FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = fertilizer_inventory.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policies per phyto_inventory
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'phyto_inventory' AND policyname = 'Users can access phyto inventory in their gardens'
  ) THEN
    CREATE POLICY "Users can access phyto inventory in their gardens"
      ON phyto_inventory FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = phyto_inventory.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policies per treatment_registry
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'treatment_registry' AND policyname = 'Users can only access their own treatments'
  ) THEN
    CREATE POLICY "Users can only access their own treatments"
      ON treatment_registry FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies per mechanical_work_register
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mechanical_work_register' AND policyname = 'Users can only access their own mechanical work'
  ) THEN
    CREATE POLICY "Users can only access their own mechanical work"
      ON mechanical_work_register FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies per crop_mechanical_works (pubblico)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crop_mechanical_works' AND policyname = 'Crop mechanical works are publicly readable'
  ) THEN
    CREATE POLICY "Crop mechanical works are publicly readable"
      ON crop_mechanical_works FOR SELECT
      USING (true);
  END IF;
END $$;

-- Policies per custom_crops
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'custom_crops' AND policyname = 'Users can manage their own custom crops'
  ) THEN
    CREATE POLICY "Users can manage their own custom crops" ON custom_crops
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies per crop_learning_events
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crop_learning_events' AND policyname = 'Users can manage their own learning events'
  ) THEN
    CREATE POLICY "Users can manage their own learning events" ON crop_learning_events
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_fertilizer_inventory_updated_at ON fertilizer_inventory;
CREATE TRIGGER update_fertilizer_inventory_updated_at BEFORE UPDATE ON fertilizer_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_phyto_inventory_updated_at ON phyto_inventory;
CREATE TRIGGER update_phyto_inventory_updated_at BEFORE UPDATE ON phyto_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_custom_crops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_custom_crops_timestamp ON custom_crops;
CREATE TRIGGER update_custom_crops_timestamp
  BEFORE UPDATE ON custom_crops
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_crops_updated_at();

