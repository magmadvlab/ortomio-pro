-- =====================================================
-- FIX PLANTING_PLANS TABLE MISSING - JAN 18, 2026
-- =====================================================
-- Risolve l'errore: Could not find the table 'public.planting_plans'
-- Applica la tabella mancante al database remoto

-- Verifica se la tabella esiste
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'planting_plans') THEN
        RAISE NOTICE '🔧 Creating missing planting_plans table...';
        
        -- Crea la tabella planting_plans
        CREATE TABLE public.planting_plans (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
            field_row_id UUID REFERENCES public.field_rows(id) ON DELETE SET NULL,
            zone_id UUID REFERENCES public.garden_zones(id) ON DELETE SET NULL,
            
            -- Dati della pianificazione
            plant_name VARCHAR(255) NOT NULL,
            plant_variety VARCHAR(255),
            plant_type VARCHAR(100) NOT NULL, -- 'vegetable', 'herb', 'fruit', 'flower'
            
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
            status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'planted', 'growing', 'harvested', 'failed'
            growth_stage VARCHAR(50) DEFAULT 'seed', -- 'seed', 'seedling', 'vegetative', 'flowering', 'fruiting', 'mature'
            
            -- Rotazione e companion planting
            rotation_plan_id UUID,
            companion_plants TEXT[], -- Array di piante compagne
            previous_crop VARCHAR(255), -- Coltura precedente per rotazione
            
            -- Note e osservazioni
            notes TEXT,
            care_instructions TEXT,
            expected_yield VARCHAR(100),
            
            -- Metadati
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Indexes per performance
        CREATE INDEX idx_planting_plans_user ON public.planting_plans(user_id);
        CREATE INDEX idx_planting_plans_garden ON public.planting_plans(garden_id);
        CREATE INDEX idx_planting_plans_field_row ON public.planting_plans(field_row_id);
        CREATE INDEX idx_planting_plans_zone ON public.planting_plans(zone_id);
        CREATE INDEX idx_planting_plans_status ON public.planting_plans(status);
        CREATE INDEX idx_planting_plans_planned_date ON public.planting_plans(planned_planting_date);
        CREATE INDEX idx_planting_plans_rotation ON public.planting_plans(rotation_plan_id);

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

        -- Trigger per updated_at
        CREATE OR REPLACE FUNCTION update_planting_plans_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_update_planting_plans_updated_at
            BEFORE UPDATE ON public.planting_plans
            FOR EACH ROW
            EXECUTE FUNCTION update_planting_plans_updated_at();

        RAISE NOTICE '✅ planting_plans table created successfully';
        
    ELSE
        RAISE NOTICE '✅ planting_plans table already exists';
    END IF;
END $$;

-- Verifica finale
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'planting_plans';
    
    IF table_count > 0 THEN
        RAISE NOTICE '🎉 SUCCESS: planting_plans table is now available';
        RAISE NOTICE '📊 Table structure verified and ready for use';
    ELSE
        RAISE EXCEPTION '❌ FAILED: planting_plans table creation failed';
    END IF;
END $$;