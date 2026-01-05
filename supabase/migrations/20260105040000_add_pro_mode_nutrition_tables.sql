-- ============================================
-- Migration: Add PRO Mode Nutrition & Treatment Tables
-- Data: 2026-01-05
-- Descrizione: Crea tabelle per gestione fertilizzanti e trattamenti fitosanitari (PRO Mode)
-- ============================================

-- ============================================
-- 1. TREATMENT_REGISTER (Registro Trattamenti Fitosanitari)
-- ============================================

CREATE TABLE IF NOT EXISTS public.treatment_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,

  treatment_date DATE NOT NULL,
  product_name TEXT NOT NULL,
  active_ingredient TEXT,
  dosage NUMERIC(8, 2),
  dosage_unit TEXT CHECK (dosage_unit IN ('ml', 'g', 'kg', 'L')),
  area_treated NUMERIC(8, 2), -- m²
  method TEXT CHECK (method IN ('spray', 'soil', 'seed', 'foliar')),

  reason TEXT CHECK (reason IN ('preventive', 'curative', 'pest_control', 'disease_control', 'nutrient')),
  weather_conditions JSONB, -- {temp: 20, humidity: 60, wind: 'low'}

  operator_name TEXT, -- Chi ha fatto il trattamento
  notes TEXT,

  -- Tracking campi (compatibilità con zone tracking)
  zone_id UUID REFERENCES public.garden_zones(id) ON DELETE SET NULL,
  row_ids UUID[], -- Array di field_row IDs
  bed_ids UUID[], -- Array di garden_bed IDs

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_register_user ON public.treatment_register(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_register_date ON public.treatment_register(treatment_date DESC);
CREATE INDEX IF NOT EXISTS idx_treatment_register_garden ON public.treatment_register(garden_id);
CREATE INDEX IF NOT EXISTS idx_treatment_register_crop ON public.treatment_register(crop_name);
CREATE INDEX IF NOT EXISTS idx_treatment_register_zone ON public.treatment_register(zone_id);

ALTER TABLE public.treatment_register ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own treatments" ON public.treatment_register;
CREATE POLICY "Users can only access their own treatments"
  ON public.treatment_register FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 2. PHYTO_INVENTORY (Inventario Prodotti Fitosanitari)
-- ============================================

CREATE TABLE IF NOT EXISTS public.phyto_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE,

  product_name TEXT NOT NULL,
  active_ingredient TEXT,
  product_type TEXT CHECK (product_type IN ('insecticide', 'fungicide', 'herbicide', 'acaricide', 'bactericide', 'other')),

  quantity NUMERIC(8, 2) NOT NULL,
  quantity_unit TEXT CHECK (quantity_unit IN ('ml', 'L', 'g', 'kg')) NOT NULL,

  purchase_date DATE,
  expiry_date DATE,
  manufacturer TEXT,
  registration_number TEXT, -- Numero registrazione ministeriale

  storage_location TEXT,
  min_stock_alert NUMERIC(8, 2), -- Soglia alert scorte basse

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phyto_inventory_user ON public.phyto_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_phyto_inventory_garden ON public.phyto_inventory(garden_id);
CREATE INDEX IF NOT EXISTS idx_phyto_inventory_type ON public.phyto_inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_phyto_inventory_updated ON public.phyto_inventory(updated_at DESC);

ALTER TABLE public.phyto_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own phyto inventory" ON public.phyto_inventory;
CREATE POLICY "Users can only access their own phyto inventory"
  ON public.phyto_inventory FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 3. FERTILIZER_APPLICATION_LOGS (Registro Applicazioni Fertilizzanti)
-- ============================================

CREATE TABLE IF NOT EXISTS public.fertilizer_application_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE,
  crop_name TEXT,

  application_date DATE NOT NULL,
  fertilizer_name TEXT NOT NULL,
  fertilizer_type TEXT CHECK (fertilizer_type IN ('organic', 'chemical', 'mineral', 'mixed')),

  -- NPK composition
  nitrogen_n NUMERIC(5, 2), -- % Azoto
  phosphorus_p NUMERIC(5, 2), -- % Fosforo
  potassium_k NUMERIC(5, 2), -- % Potassio

  dosage NUMERIC(10, 2) NOT NULL,
  dosage_unit TEXT CHECK (dosage_unit IN ('kg', 'g', 'L', 'ml', 'kg/ha', 'L/ha')) NOT NULL,

  area_applied NUMERIC(10, 2), -- m²
  application_method TEXT CHECK (application_method IN ('broadcast', 'band', 'foliar', 'fertigation', 'manual')),

  weather_conditions JSONB, -- {temp: 20, humidity: 60, wind: 'low', rain: false}
  operator_name TEXT,
  notes TEXT,

  -- Tracking campi
  zone_id UUID REFERENCES public.garden_zones(id) ON DELETE SET NULL,
  row_ids UUID[], -- Array di field_row IDs
  bed_ids UUID[], -- Array di garden_bed IDs

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fertilizer_logs_user ON public.fertilizer_application_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_logs_date ON public.fertilizer_application_logs(application_date DESC);
CREATE INDEX IF NOT EXISTS idx_fertilizer_logs_garden ON public.fertilizer_application_logs(garden_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_logs_crop ON public.fertilizer_application_logs(crop_name);
CREATE INDEX IF NOT EXISTS idx_fertilizer_logs_zone ON public.fertilizer_application_logs(zone_id);

ALTER TABLE public.fertilizer_application_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own fertilizer logs" ON public.fertilizer_application_logs;
CREATE POLICY "Users can only access their own fertilizer logs"
  ON public.fertilizer_application_logs FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 4. FERTILIZER_INVENTORY (Inventario Fertilizzanti)
-- ============================================

CREATE TABLE IF NOT EXISTS public.fertilizer_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE,

  fertilizer_name TEXT NOT NULL,
  fertilizer_type TEXT CHECK (fertilizer_type IN ('organic', 'chemical', 'mineral', 'mixed')) NOT NULL,

  -- NPK composition
  nitrogen_n NUMERIC(5, 2), -- % Azoto
  phosphorus_p NUMERIC(5, 2), -- % Fosforo
  potassium_k NUMERIC(5, 2), -- % Potassio

  -- Secondary nutrients (opzionale)
  calcium_ca NUMERIC(5, 2),
  magnesium_mg NUMERIC(5, 2),
  sulfur_s NUMERIC(5, 2),

  -- Micronutrients (opzionale)
  micronutrients JSONB, -- {Fe: 0.5, Mn: 0.2, Zn: 0.1, etc.}

  quantity NUMERIC(10, 2) NOT NULL,
  quantity_unit TEXT CHECK (quantity_unit IN ('kg', 'g', 'L', 'ml')) NOT NULL,

  purchase_date DATE,
  expiry_date DATE,
  manufacturer TEXT,

  storage_location TEXT,
  min_stock_alert NUMERIC(10, 2), -- Soglia alert scorte basse

  unit_cost NUMERIC(10, 2), -- Costo per unità
  currency TEXT DEFAULT 'EUR',

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fertilizer_inventory_user ON public.fertilizer_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_inventory_garden ON public.fertilizer_inventory(garden_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_inventory_type ON public.fertilizer_inventory(fertilizer_type);
CREATE INDEX IF NOT EXISTS idx_fertilizer_inventory_updated ON public.fertilizer_inventory(updated_at DESC);

ALTER TABLE public.fertilizer_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own fertilizer inventory" ON public.fertilizer_inventory;
CREATE POLICY "Users can only access their own fertilizer inventory"
  ON public.fertilizer_inventory FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.treatment_register TO supabase_auth_admin;
GRANT ALL ON public.treatment_register TO authenticated;

GRANT ALL ON public.phyto_inventory TO supabase_auth_admin;
GRANT ALL ON public.phyto_inventory TO authenticated;

GRANT ALL ON public.fertilizer_application_logs TO supabase_auth_admin;
GRANT ALL ON public.fertilizer_application_logs TO authenticated;

GRANT ALL ON public.fertilizer_inventory TO supabase_auth_admin;
GRANT ALL ON public.fertilizer_inventory TO authenticated;

-- Notifica PostgREST di ricaricare lo schema
NOTIFY pgrst, 'reload schema';

-- ============================================
-- Note:
-- - Tabelle per gestione completa nutrizione e trattamenti (PRO Mode)
-- - treatment_register: registro trattamenti fitosanitari
-- - phyto_inventory: inventario prodotti fitosanitari
-- - fertilizer_application_logs: registro applicazioni fertilizzanti
-- - fertilizer_inventory: inventario fertilizzanti
-- - Tutte con RLS policy per sicurezza
-- - Zone tracking integrato (zone_id, row_ids, bed_ids)
-- - Compatibile con pattern esistente mechanical_work_register
-- ============================================
