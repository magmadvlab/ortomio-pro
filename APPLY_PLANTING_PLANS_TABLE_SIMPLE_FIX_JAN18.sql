-- =====================================================
-- FIX PLANTING_PLANS TABLE MISSING - JAN 18, 2026 (SIMPLE VERSION)
-- =====================================================
-- Risolve l'errore: Could not find the table 'public.planting_plans'
-- Versione semplificata senza blocchi DO $$ per compatibilità

-- Crea la tabella planting_plans se non esiste
CREATE TABLE IF NOT EXISTS public.planting_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
    field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL,
    zone_id UUID REFERENCES public.garden_zones(id) ON DELETE SET NULL,
    
    -- Dati della pianificazione
    plant_name VARCHAR(255) NOT NULL,
    plant_variety VARCHAR(255),
    plant_type VARCHAR(100) NOT NULL DEFAULT 'vegetable',
    
    -- Date pianificazione
    planned_planting_date DATE NOT NULL,
    planned_harvest_date DATE,
    actual_planting_date DATE,
    actual_harvest_date DATE,
    
    -- Quantità e spazio
    quantity INTEGER DEFAULT 1,
    spacing_cm INTEGER,
    area_sqm DECIMAL(10,2),
    
    -- Status e tracking
    status VARCHAR(50) DEFAULT 'planned',
    growth_stage VARCHAR(50) DEFAULT 'seed',
    
    -- Rotazione e companion planting
    rotation_plan_id UUID,
    companion_plants TEXT[],
    previous_crop VARCHAR(255),
    
    -- Note e osservazioni
    notes TEXT,
    care_instructions TEXT,
    expected_yield VARCHAR(100),
    
    -- Metadati
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes per performance
CREATE INDEX IF NOT EXISTS idx_planting_plans_user ON public.planting_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_planting_plans_garden ON public.planting_plans(garden_id);
CREATE INDEX IF NOT EXISTS idx_planting_plans_field_row ON public.planting_plans(field_row_id);
CREATE INDEX IF NOT EXISTS idx_planting_plans_zone ON public.planting_plans(zone_id);
CREATE INDEX IF NOT EXISTS idx_planting_plans_status ON public.planting_plans(status);
CREATE INDEX IF NOT EXISTS idx_planting_plans_planned_date ON public.planting_plans(planned_planting_date);
CREATE INDEX IF NOT EXISTS idx_planting_plans_rotation ON public.planting_plans(rotation_plan_id);

-- Abilita RLS
ALTER TABLE public.planting_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own planting plans" ON public.planting_plans;
CREATE POLICY "Users can view own planting plans"
ON public.planting_plans FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own planting plans" ON public.planting_plans;
CREATE POLICY "Users can insert own planting plans"
ON public.planting_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own planting plans" ON public.planting_plans;
CREATE POLICY "Users can update own planting plans"
ON public.planting_plans FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own planting plans" ON public.planting_plans;
CREATE POLICY "Users can delete own planting plans"
ON public.planting_plans FOR DELETE
USING (auth.uid() = user_id);

-- Funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_planting_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per updated_at
DROP TRIGGER IF EXISTS trigger_update_planting_plans_updated_at ON public.planting_plans;
CREATE TRIGGER trigger_update_planting_plans_updated_at
    BEFORE UPDATE ON public.planting_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_planting_plans_updated_at();

-- Commenti per documentazione
COMMENT ON TABLE public.planting_plans IS 'Pianificazioni delle coltivazioni con tracking completo';
COMMENT ON COLUMN public.planting_plans.status IS 'Status: planned, planted, growing, harvested, failed';
COMMENT ON COLUMN public.planting_plans.growth_stage IS 'Stage: seed, seedling, vegetative, flowering, fruiting, mature';
COMMENT ON COLUMN public.planting_plans.plant_type IS 'Type: vegetable, herb, fruit, flower';

-- Messaggio di successo (verrà mostrato nei log)
SELECT 'planting_plans table created successfully' as status;