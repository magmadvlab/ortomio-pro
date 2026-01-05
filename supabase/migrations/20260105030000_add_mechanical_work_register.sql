-- ============================================
-- Migration: Add Mechanical Work Register Table
-- Data: 2026-01-05
-- Descrizione: Crea tabella mechanical_work_register per tracking lavorazioni meccaniche (PRO Mode)
-- ============================================

-- Create mechanical_work_register table
CREATE TABLE IF NOT EXISTS public.mechanical_work_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE,

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
  area_m2 NUMERIC(10, 2) NOT NULL, -- Area lavorata in m²
  depth_cm NUMERIC(5, 2), -- Profondità lavorazione in cm

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

  -- Tracking campi (aggiunti per compatibilità con sistemi esistenti)
  zone_id UUID REFERENCES public.garden_zones(id) ON DELETE SET NULL,
  row_ids UUID[], -- Array di field_row IDs
  bed_ids UUID[], -- Array di garden_bed IDs
  area_covered_sqm NUMERIC(10, 2), -- Area coperta (alias per area_m2)
  duration_minutes INTEGER, -- Durata lavorazione in minuti

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mechanical_work_user ON public.mechanical_work_register(user_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_date ON public.mechanical_work_register(work_date DESC);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_garden ON public.mechanical_work_register(garden_id);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_type ON public.mechanical_work_register(work_type);
CREATE INDEX IF NOT EXISTS idx_mechanical_work_zone ON public.mechanical_work_register(zone_id);

-- Enable RLS
ALTER TABLE public.mechanical_work_register ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own mechanical work records
DROP POLICY IF EXISTS "Users can only access their own mechanical work" ON public.mechanical_work_register;
CREATE POLICY "Users can only access their own mechanical work"
  ON public.mechanical_work_register FOR ALL
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.mechanical_work_register TO supabase_auth_admin;
GRANT ALL ON public.mechanical_work_register TO authenticated;

-- Notifica PostgREST di ricaricare lo schema
NOTIFY pgrst, 'reload schema';

-- ============================================
-- Note:
-- - Tabella per tracking completo lavorazioni meccaniche (PRO Mode)
-- - Compatibile con pattern esistenti (irrigation, fertilization, treatments)
-- - RLS policy per sicurezza: ogni utente vede solo i propri dati
-- - Campi opzionali: zone_id, row_ids, bed_ids per tracking dettagliato
-- - work_metadata JSONB per flessibilità future espansioni
-- ============================================
