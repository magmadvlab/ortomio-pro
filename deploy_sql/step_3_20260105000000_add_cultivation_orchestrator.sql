-- ============================================
-- ORTOMIO - ORCHESTRATORE COLTIVAZIONE
-- Aggiunge tabelle per gestire il ciclo completo
-- ============================================

-- 1. TABELLA PIANI DI COLTIVAZIONE
CREATE TABLE IF NOT EXISTS cultivation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Identificazione pianta
    archetype_id TEXT NOT NULL,
    archetype_category TEXT NOT NULL CHECK (archetype_category IN ('vegetable', 'aromatic', 'berry', 'tree')),
    plant_name TEXT NOT NULL,
    variety_name TEXT,
    
    -- Materiale di partenza
    starting_material TEXT NOT NULL CHECK (starting_material IN ('seed', 'seedling', 'sapling', 'cutting', 'bulb')),
    
    -- Riferimenti alle banche
    seed_inventory_id UUID REFERENCES seed_inventory(id),
    seedling_batch_id UUID REFERENCES seedling_batches(id),
    sapling_inventory_id UUID, -- Riferimento futuro
    
    -- Stato attuale
    current_phase TEXT NOT NULL CHECK (current_phase IN (
        'planning', 'preparation', 'sowing', 'germination', 'nursing', 
        'hardening', 'transplanting', 'growing', 'flowering', 'fruiting', 
        'harvesting', 'composting'
    )),
    current_location TEXT NOT NULL,
    current_quantity INTEGER NOT NULL DEFAULT 1,
    
    -- Date
    planned_start_date DATE NOT NULL,
    actual_start_date DATE,
    estimated_harvest_date DATE,
    actual_harvest_date DATE,
    
    -- Tracking
    phase_history JSONB DEFAULT '[]'::jsonb,
    
    -- Metadati
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELLA INVENTARIO ALBERELLI (per frutteti/oliveti)
CREATE TABLE IF NOT EXISTS sapling_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Identificazione
    species_name TEXT NOT NULL,
    variety_name TEXT NOT NULL,
    rootstock TEXT, -- Portainnesto per alberi da frutto
    
    -- Dettagli acquisto
    supplier TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(8,2),
    
    -- Stato fisico
    age_years INTEGER,
    height_cm INTEGER,
    pot_size_liters INTEGER,
    
    -- Stato inventario
    quantity_available INTEGER NOT NULL DEFAULT 1,
    quantity_planted INTEGER DEFAULT 0,
    
    -- Metadati
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELLA TRANSIZIONI FASI (log dettagliato)
CREATE TABLE IF NOT EXISTS phase_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cultivation_plan_id UUID NOT NULL REFERENCES cultivation_plans(id) ON DELETE CASCADE,
    
    -- Transizione
    from_phase TEXT,
    to_phase TEXT NOT NULL,
    transition_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Dettagli
    location TEXT NOT NULL,
    quantity_before INTEGER,
    quantity_after INTEGER,
    
    -- Dati specifici per fase
    phase_data JSONB DEFAULT '{}'::jsonb,
    
    -- Documentazione
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    weather_conditions JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ESTENDI TABELLA GARDENS per supportare categorie
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS cultivation_category TEXT 
CHECK (cultivation_category IN ('orto', 'frutteto', 'oliveto', 'vigneto', 'misto'));

-- Aggiorna gardens esistenti
UPDATE gardens SET cultivation_category = 'orto' WHERE cultivation_category IS NULL;

-- 5. INDICI per performance
CREATE INDEX IF NOT EXISTS idx_cultivation_plans_garden_active ON cultivation_plans(garden_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cultivation_plans_phase ON cultivation_plans(current_phase);
CREATE INDEX IF NOT EXISTS idx_cultivation_plans_archetype ON cultivation_plans(archetype_id);
CREATE INDEX IF NOT EXISTS idx_phase_transitions_plan ON phase_transitions(cultivation_plan_id);
CREATE INDEX IF NOT EXISTS idx_sapling_inventory_garden ON sapling_inventory(garden_id);

-- 6. RLS POLICIES
ALTER TABLE cultivation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sapling_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_transitions ENABLE ROW LEVEL SECURITY;

-- Cultivation Plans Policies
CREATE POLICY "Users can view own cultivation plans" ON cultivation_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cultivation plans" ON cultivation_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cultivation plans" ON cultivation_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cultivation plans" ON cultivation_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Sapling Inventory Policies
CREATE POLICY "Users can view own sapling inventory" ON sapling_inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sapling inventory" ON sapling_inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sapling inventory" ON sapling_inventory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sapling inventory" ON sapling_inventory
    FOR DELETE USING (auth.uid() = user_id);

-- Phase Transitions Policies (read-only per utenti)
CREATE POLICY "Users can view own phase transitions" ON phase_transitions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cultivation_plans 
            WHERE id = phase_transitions.cultivation_plan_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert phase transitions" ON phase_transitions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cultivation_plans 
            WHERE id = phase_transitions.cultivation_plan_id 
            AND user_id = auth.uid()
        )
    );

-- 7. FUNZIONI HELPER

-- Funzione per avanzare fase
CREATE OR REPLACE FUNCTION advance_cultivation_phase(
    plan_id UUID,
    new_phase TEXT,
    new_location TEXT DEFAULT NULL,
    new_quantity INTEGER DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    photos JSONB DEFAULT NULL
) RETURNS cultivation_plans AS $$
DECLARE
    plan cultivation_plans;
    old_phase TEXT;
    old_quantity INTEGER;
BEGIN
    -- Ottieni piano corrente
    SELECT * INTO plan FROM cultivation_plans WHERE id = plan_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Piano coltivazione non trovato';
    END IF;
    
    -- Salva stato precedente
    old_phase := plan.current_phase;
    old_quantity := plan.current_quantity;
    
    -- Aggiorna piano
    UPDATE cultivation_plans SET
        current_phase = new_phase,
        current_location = COALESCE(new_location, current_location),
        current_quantity = COALESCE(new_quantity, current_quantity),
        updated_at = NOW()
    WHERE id = plan_id;
    
    -- Registra transizione
    INSERT INTO phase_transitions (
        cultivation_plan_id,
        from_phase,
        to_phase,
        location,
        quantity_before,
        quantity_after,
        notes,
        photos
    ) VALUES (
        plan_id,
        old_phase,
        new_phase,
        COALESCE(new_location, plan.current_location),
        old_quantity,
        COALESCE(new_quantity, old_quantity),
        notes,
        photos
    );
    
    -- Ritorna piano aggiornato
    SELECT * INTO plan FROM cultivation_plans WHERE id = plan_id;
    RETURN plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere materiali disponibili
CREATE OR REPLACE FUNCTION get_available_materials(
    garden_id_param UUID,
    archetype_id_param TEXT
) RETURNS JSONB AS $$
DECLARE
    result JSONB := '{"seeds": [], "seedlings": [], "saplings": []}'::jsonb;
    seeds JSONB;
    seedlings JSONB;
    saplings JSONB;
BEGIN
    -- Semi disponibili
    SELECT COALESCE(jsonb_agg(to_jsonb(si.*)), '[]'::jsonb) INTO seeds
    FROM seed_inventory si
    WHERE si.garden_id = garden_id_param
    AND si.quantity_remaining != 'Empty';
    
    -- Piantine disponibili
    SELECT COALESCE(jsonb_agg(to_jsonb(sb.*)), '[]'::jsonb) INTO seedlings
    FROM seedling_batches sb
    WHERE sb.garden_id = garden_id_param
    AND sb.phase IN ('ReadyToTransplant', 'Hardening');
    
    -- Alberelli disponibili
    SELECT COALESCE(jsonb_agg(to_jsonb(sap.*)), '[]'::jsonb) INTO saplings
    FROM sapling_inventory sap
    WHERE sap.garden_id = garden_id_param
    AND sap.quantity_available > 0;
    
    -- Costruisci risultato
    result := jsonb_build_object(
        'seeds', seeds,
        'seedlings', seedlings,
        'saplings', saplings
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGER per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cultivation_plans_updated_at
    BEFORE UPDATE ON cultivation_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sapling_inventory_updated_at
    BEFORE UPDATE ON sapling_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. COMMENTI per documentazione
COMMENT ON TABLE cultivation_plans IS 'Piani di coltivazione completi dal seme/piantina alla raccolta';
COMMENT ON TABLE sapling_inventory IS 'Inventario alberelli per frutteti, oliveti, vigneti';
COMMENT ON TABLE phase_transitions IS 'Log dettagliato delle transizioni tra fasi di coltivazione';

COMMENT ON COLUMN cultivation_plans.archetype_category IS 'Categoria: vegetable, aromatic, berry, tree';
COMMENT ON COLUMN cultivation_plans.starting_material IS 'Materiale di partenza: seed, seedling, sapling, cutting, bulb';
COMMENT ON COLUMN cultivation_plans.current_phase IS 'Fase attuale del ciclo di coltivazione';
COMMENT ON COLUMN cultivation_plans.phase_history IS 'Storico completo delle fasi attraversate';

COMMENT ON COLUMN gardens.cultivation_category IS 'Categoria coltivazione: orto, frutteto, oliveto, vigneto, misto';