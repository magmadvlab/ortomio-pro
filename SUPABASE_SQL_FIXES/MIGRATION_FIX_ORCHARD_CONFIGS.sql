-- ============================================================================
-- FIX: Orchard Configuration Errors
-- Data: 2026-02-28
-- 
-- Risolve 3 errori:
-- 1) PATCH 406 su gardens: le colonne orchard_config, olive_grove_config, 
--    vineyard_config non esistevano nella tabella gardens
-- 2) 400 su orchard_configurations: la tabella non esisteva o mancava is_active
-- 3) Error saving orchard config: update vuoto causava PGRST116
-- ============================================================================

-- ============================================================================
-- STEP 1: Aggiungi colonne JSONB per configurazioni a gardens
-- ============================================================================
ALTER TABLE gardens 
ADD COLUMN IF NOT EXISTS orchard_config JSONB,
ADD COLUMN IF NOT EXISTS olive_grove_config JSONB,
ADD COLUMN IF NOT EXISTS vineyard_config JSONB;

-- Indici GIN per ricerca efficiente su JSONB
CREATE INDEX IF NOT EXISTS idx_gardens_orchard_config ON gardens USING GIN (orchard_config);
CREATE INDEX IF NOT EXISTS idx_gardens_olive_grove_config ON gardens USING GIN (olive_grove_config);
CREATE INDEX IF NOT EXISTS idx_gardens_vineyard_config ON gardens USING GIN (vineyard_config);

-- Commenti documentazione
COMMENT ON COLUMN gardens.orchard_config IS 'Configurazione frutteto: categoria, data impianto, numero alberi, varietà';
COMMENT ON COLUMN gardens.olive_grove_config IS 'Configurazione oliveto: tipo (OIL/TABLE/DUAL), data impianto, numero alberi, varietà';
COMMENT ON COLUMN gardens.vineyard_config IS 'Configurazione vigneto: tipo (WINE/TABLE), sistema allevamento, data impianto, numero viti, varietà';

-- ============================================================================
-- STEP 2: Crea tabella orchard_configurations se non esiste
-- ============================================================================
CREATE TABLE IF NOT EXISTS orchard_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Basic Configuration
    name VARCHAR(255) NOT NULL,
    description TEXT,
    orchard_type VARCHAR(50) NOT NULL DEFAULT 'mixed',
    
    -- Planting Information
    established_date DATE,
    total_area_sqm DECIMAL(10,2),
    total_trees INTEGER DEFAULT 0,
    trees_per_hectare DECIMAL(8,2),
    
    -- Layout Configuration
    row_spacing_m DECIMAL(5,2),
    tree_spacing_m DECIMAL(5,2),
    training_system VARCHAR(100),
    
    -- Varieties and Rootstocks
    main_varieties JSONB DEFAULT '[]'::jsonb,
    rootstock_types JSONB DEFAULT '[]'::jsonb,
    
    -- Climate and Soil
    climate_zone VARCHAR(50),
    soil_type VARCHAR(100),
    irrigation_system VARCHAR(100),
    
    -- Management Settings
    organic_certified BOOLEAN DEFAULT false,
    precision_management BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Aggiungi is_active se la tabella già esiste ma la colonna no
ALTER TABLE orchard_configurations 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================================
-- STEP 3: Crea tabella orchard_trees se non esiste
-- ============================================================================
CREATE TABLE IF NOT EXISTS orchard_trees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orchard_id UUID NOT NULL REFERENCES orchard_configurations(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    tree_number VARCHAR(50) NOT NULL,
    qr_code VARCHAR(100),
    
    zone_id UUID,
    field_row_id UUID,
    section_id UUID,
    
    row_number INTEGER,
    position_in_row INTEGER,
    gps_latitude DECIMAL(10,8),
    gps_longitude DECIMAL(11,8),
    
    variety VARCHAR(255) NOT NULL,
    rootstock VARCHAR(255),
    planting_date DATE,
    tree_age_years INTEGER,
    
    trunk_diameter_cm DECIMAL(5,2),
    tree_height_m DECIMAL(4,2),
    canopy_width_m DECIMAL(4,2),
    training_system VARCHAR(100),
    
    health_status VARCHAR(50) DEFAULT 'healthy',
    vigor_level VARCHAR(50) DEFAULT 'normal',
    productivity_status VARCHAR(50) DEFAULT 'productive',
    
    expected_yield_kg DECIMAL(6,2),
    last_harvest_kg DECIMAL(6,2),
    last_harvest_date DATE,
    cumulative_yield_kg DECIMAL(8,2) DEFAULT 0,
    
    notes TEXT,
    special_requirements TEXT,
    
    needs_pruning BOOLEAN DEFAULT false,
    needs_treatment BOOLEAN DEFAULT false,
    needs_replacement BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(orchard_id, tree_number)
);

-- ============================================================================
-- STEP 4: RLS Policies per orchard_configurations
-- ============================================================================
ALTER TABLE orchard_configurations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their orchard configurations" ON orchard_configurations;
CREATE POLICY "Users can view their orchard configurations" ON orchard_configurations
    FOR SELECT USING (
        garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can create orchard configurations" ON orchard_configurations;
CREATE POLICY "Users can create orchard configurations" ON orchard_configurations
    FOR INSERT WITH CHECK (
        garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their orchard configurations" ON orchard_configurations;
CREATE POLICY "Users can update their orchard configurations" ON orchard_configurations
    FOR UPDATE USING (
        garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete their orchard configurations" ON orchard_configurations;
CREATE POLICY "Users can delete their orchard configurations" ON orchard_configurations
    FOR DELETE USING (
        garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
    );

-- ============================================================================
-- STEP 5: RLS Policies per orchard_trees
-- ============================================================================
ALTER TABLE orchard_trees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their orchard trees" ON orchard_trees;
CREATE POLICY "Users can view their orchard trees" ON orchard_trees
    FOR SELECT USING (
        garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can create orchard trees" ON orchard_trees;
CREATE POLICY "Users can create orchard trees" ON orchard_trees
    FOR INSERT WITH CHECK (
        garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their orchard trees" ON orchard_trees;
CREATE POLICY "Users can update their orchard trees" ON orchard_trees
    FOR UPDATE USING (
        garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete their orchard trees" ON orchard_trees;
CREATE POLICY "Users can delete their orchard trees" ON orchard_trees
    FOR DELETE USING (
        garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
    );

-- ============================================================================
-- STEP 6: Indici per performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_orchard_configurations_garden_id ON orchard_configurations(garden_id);
CREATE INDEX IF NOT EXISTS idx_orchard_configurations_is_active ON orchard_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_orchard_trees_orchard_id ON orchard_trees(orchard_id);
CREATE INDEX IF NOT EXISTS idx_orchard_trees_garden_id ON orchard_trees(garden_id);
CREATE INDEX IF NOT EXISTS idx_orchard_trees_is_active ON orchard_trees(is_active);

-- ============================================================================
-- STEP 7: Trigger per updated_at automatico
-- ============================================================================
CREATE OR REPLACE FUNCTION update_orchard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orchard_configurations_updated_at ON orchard_configurations;
CREATE TRIGGER trigger_orchard_configurations_updated_at
    BEFORE UPDATE ON orchard_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_orchard_updated_at();

DROP TRIGGER IF EXISTS trigger_orchard_trees_updated_at ON orchard_trees;
CREATE TRIGGER trigger_orchard_trees_updated_at
    BEFORE UPDATE ON orchard_trees
    FOR EACH ROW
    EXECUTE FUNCTION update_orchard_updated_at();
