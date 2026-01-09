-- OrtoMio AI - Professional Tier Schema
-- This schema adds professional analytics and treatment register

-- ============================================
-- PROFESSIONAL ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS professional_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('Summer', 'Winter')),
  year INTEGER NOT NULL,
  
  -- Metriche produzione
  total_kg DECIMAL(10, 2),
  total_revenue DECIMAL(10, 2),
  total_costs DECIMAL(10, 2),
  roi_percentage DECIMAL(5, 2),
  yield_per_sqm DECIMAL(8, 2),
  
  -- Dettagli costi
  costs_breakdown JSONB, -- {seeds: 10, fertilizer: 50, water: 20, labor: 100}
  
  -- Dettagli produzione
  production_breakdown JSONB, -- {variety1: {kg: 50, revenue: 200}, ...}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professional_analytics_user ON professional_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_analytics_garden ON professional_analytics(garden_id);
CREATE INDEX IF NOT EXISTS idx_professional_analytics_year ON professional_analytics(year);
CREATE INDEX IF NOT EXISTS idx_professional_analytics_crop ON professional_analytics(crop_name);

-- ============================================
-- TREATMENT REGISTER (Registro Trattamenti)
-- ============================================
CREATE TABLE IF NOT EXISTS treatment_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  
  treatment_date DATE NOT NULL,
  product_name TEXT NOT NULL,
  active_ingredient TEXT,
  dosage DECIMAL(8, 2),
  dosage_unit TEXT CHECK (dosage_unit IN ('ml', 'g', 'kg', 'L')),
  area_treated DECIMAL(8, 2), -- m²
  method TEXT CHECK (method IN ('spray', 'soil', 'seed', 'foliar')),
  
  reason TEXT CHECK (reason IN ('preventive', 'curative', 'pest_control', 'disease_control', 'nutrient')),
  weather_conditions JSONB, -- {temp: 20, humidity: 60, wind: 'low'}
  
  operator_name TEXT, -- Chi ha fatto il trattamento
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_register_user ON treatment_register(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_register_date ON treatment_register(treatment_date DESC);
CREATE INDEX IF NOT EXISTS idx_treatment_register_garden ON treatment_register(garden_id);
CREATE INDEX IF NOT EXISTS idx_treatment_register_crop ON treatment_register(crop_name);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE professional_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_register ENABLE ROW LEVEL SECURITY;

-- Professional Analytics: Users can only access their own analytics
DROP POLICY IF EXISTS "Users can only access their own analytics" ON professional_analytics;
CREATE POLICY "Users can only access their own analytics"
  ON professional_analytics FOR ALL
  USING (auth.uid() = user_id);

-- Treatment Register: Users can only access their own treatments
DROP POLICY IF EXISTS "Users can only access their own treatments" ON treatment_register;
CREATE POLICY "Users can only access their own treatments"
  ON treatment_register FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- MECHANICAL WORK REGISTER (Registro Lavorazioni Meccaniche)
-- ============================================
CREATE TABLE IF NOT EXISTS mechanical_work_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Work types: Suolo, Chioma, Generale
  work_type TEXT NOT NULL CHECK (work_type IN (
    -- Suolo (esistenti)
    'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp', 'Mulching', 'PostSowingRolling',
    -- Preparazione Terreno (nuove)
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
  work_date DATE NOT NULL,
  area_m2 DECIMAL(10, 2) NOT NULL, -- Area lavorata in m²
  depth_cm DECIMAL(5, 2), -- Profondità lavorazione in cm
  
  -- Equipment types: Trattore, Piccoli mezzi, Elettrificati, Manuale
  equipment_type TEXT CHECK (equipment_type IN (
    -- Trattore e attrezzi trattore
    'Tractor', 'RotaryHarrow', 'Shredder', 'FertilizerSpreader', 'Seeder', 
    'Topper', 'Defoliator', 'PrePruner', 'Thinner',
    -- Piccoli mezzi
    'Rototiller', 'Cultivator', 'Mower', 'BrushCutter', 'TrackedCart', 'BackpackSprayer',
    -- Attrezzi elettrificati
    'ElectricTier', 'ElectricPruner', 'TelescopicPruner',
    -- Manuale
    'Manual'
  )),
  equipment_attachment TEXT, -- Attrezzo specifico quando equipment_type = 'Tractor'
  
  -- Metadati lavorazione (categoria, periodo, attrezzatura, costo, coltura)
  work_metadata JSONB, -- {
  --   category: 'Soil' | 'Canopy' | 'General',
  --   cropId?: string,
  --   cropName?: string,
  --   period?: { month: number[], phenologicalPhase?: string, daysAfterSowing?: number },
  --   equipment?: string[],
  --   standardCost?: number,
  --   description?: string
  -- }
  
  weather_conditions JSONB, -- {temp: 20, humidity: 60, wind: 'low', rain: false}
  operator_name TEXT, -- Chi ha fatto la lavorazione
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mechanical_work_user ON mechanical_work_register(user_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_date ON mechanical_work_register(work_date DESC);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_garden ON mechanical_work_register(garden_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_type ON mechanical_work_register(work_type);

-- Enable RLS
ALTER TABLE mechanical_work_register ENABLE ROW LEVEL SECURITY;

-- Mechanical Work Register: Users can only access their own work
DROP POLICY IF EXISTS "Users can only access their own mechanical work" ON mechanical_work_register;
CREATE POLICY "Users can only access their own mechanical work"
  ON mechanical_work_register FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- CROP MECHANICAL WORKS (Mapping Coltura-Lavorazioni)
-- ============================================
CREATE TABLE IF NOT EXISTS crop_mechanical_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id TEXT NOT NULL, -- Riferimento a plantMasterSheets.id
  crop_name TEXT NOT NULL,
  work_type TEXT NOT NULL, -- Riferimento a mechanical_work_register.work_type
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10), -- Priorità suggerimento (0-10)
  timing JSONB, -- { month: number[], phase?: string, daysAfterSowing?: number }
  equipment_suggested TEXT[], -- Attrezzature consigliate
  critical BOOLEAN DEFAULT false, -- Se è essenziale per quella coltura
  frequency TEXT, -- "Ogni 7-10 giorni", "Una volta", ecc.
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_crop_id ON crop_mechanical_works(crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_work_type ON crop_mechanical_works(work_type);
CREATE INDEX IF NOT EXISTS idx_crop_mechanical_works_priority ON crop_mechanical_works(priority DESC);

-- Enable RLS
ALTER TABLE crop_mechanical_works ENABLE ROW LEVEL SECURITY;

-- Crop Mechanical Works: Public read (mapping standard per tutte le colture)
DROP POLICY IF EXISTS "Crop mechanical works are publicly readable" ON crop_mechanical_works;
CREATE POLICY "Crop mechanical works are publicly readable"
  ON crop_mechanical_works FOR SELECT
  USING (true);








