-- =====================================================
-- INDIVIDUAL PLANT TRACKING SYSTEM
-- Sistema completo per tracciare ogni singola pianta
-- =====================================================

-- 1. TABELLA PIANTE INDIVIDUALI
-- Ogni pianta ha una posizione precisa nel filare
CREATE TABLE garden_plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Collegamento al filare
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    row_id UUID REFERENCES garden_rows(id) ON DELETE CASCADE,
    field_row_id UUID REFERENCES field_rows(id) ON DELETE CASCADE,
    
    -- Posizione nel filare
    position_in_row INTEGER NOT NULL, -- 1, 2, 3, 4...
    plant_code TEXT NOT NULL, -- "F1-P001", "F2-P015"
    
    -- Informazioni pianta
    plant_name TEXT NOT NULL,
    variety TEXT,
    planting_date DATE,
    expected_harvest_date DATE,
    
    -- Stato e salute
    status TEXT NOT NULL DEFAULT 'healthy', -- 'healthy', 'diseased', 'dead', 'harvested'
    health_score INTEGER DEFAULT 100, -- 0-100
    
    -- Origine tracciabilità
    seedling_batch_id UUID, -- Da quale lotto piantine
    sapling_batch_id UUID,  -- Da quale lotto alberelli
    seed_packet_id UUID,    -- Da quale pacchetto semi
    
    -- Coordinate precise (opzionale per mapping futuro)
    coordinates JSONB, -- {"x": 1.5, "y": 0.3} in metri
    
    -- Media e note
    photos TEXT[], -- Array URLs foto
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_row_reference CHECK (
        (row_id IS NOT NULL AND field_row_id IS NULL) OR 
        (row_id IS NULL AND field_row_id IS NOT NULL)
    ),
    CONSTRAINT valid_status CHECK (status IN ('healthy', 'diseased', 'dead', 'harvested', 'transplanted')),
    CONSTRAINT valid_health_score CHECK (health_score >= 0 AND health_score <= 100),
    CONSTRAINT unique_position_per_row UNIQUE (row_id, position_in_row),
    CONSTRAINT unique_position_per_field_row UNIQUE (field_row_id, position_in_row),
    CONSTRAINT unique_plant_code_per_garden UNIQUE (garden_id, plant_code)
);

-- 2. TABELLA OPERAZIONI PER PIANTA SINGOLA
-- Ogni operazione (irrigazione, fertilizzazione, trattamento) per pianta specifica
CREATE TABLE plant_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Collegamento pianta
    plant_id UUID NOT NULL REFERENCES garden_plants(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Tipo operazione
    operation_type TEXT NOT NULL, -- 'watering', 'fertilizing', 'treatment', 'pruning', 'harvest'
    operation_category TEXT, -- 'irrigation', 'nutrition', 'protection', 'maintenance'
    
    -- Dettagli operazione
    operation_date DATE NOT NULL,
    operation_time TIME,
    
    -- Quantità e prodotti
    quantity DECIMAL(10,3), -- Quantità applicata (litri, grammi, ml)
    unit TEXT, -- 'L', 'ml', 'g', 'kg'
    product_name TEXT, -- Nome fertilizzante/trattamento
    concentration DECIMAL(5,2), -- Concentrazione % o dosaggio
    
    -- Risultati
    effectiveness_score INTEGER, -- 1-10 efficacia
    plant_response TEXT, -- 'positive', 'negative', 'neutral'
    
    -- Condizioni ambientali
    weather_conditions JSONB, -- {"temp": 25, "humidity": 60, "wind": "light"}
    
    -- Media e documentazione
    photos TEXT[], -- Foto prima/dopo operazione
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_operation_type CHECK (operation_type IN (
        'watering', 'fertilizing', 'treatment', 'pruning', 'harvest', 
        'transplanting', 'thinning', 'staking', 'mulching'
    )),
    CONSTRAINT valid_effectiveness CHECK (effectiveness_score IS NULL OR (effectiveness_score >= 1 AND effectiveness_score <= 10)),
    CONSTRAINT valid_response CHECK (plant_response IS NULL OR plant_response IN ('positive', 'negative', 'neutral'))
);

-- 3. TABELLA RACCOLTI PER PIANTA
-- Traccia ogni raccolta da ogni singola pianta
CREATE TABLE plant_harvests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Collegamento pianta
    plant_id UUID NOT NULL REFERENCES garden_plants(id) ON DELETE CASCADE,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Dettagli raccolta
    harvest_date DATE NOT NULL,
    harvest_time TIME,
    
    -- Quantità raccolta
    quantity_kg DECIMAL(8,3) NOT NULL,
    quality_grade TEXT, -- 'excellent', 'good', 'fair', 'poor'
    
    -- Classificazione prodotto
    size_category TEXT, -- 'large', 'medium', 'small'
    ripeness_level TEXT, -- 'unripe', 'perfect', 'overripe'
    
    -- Destinazione
    destination TEXT, -- 'consumption', 'storage', 'processing', 'sale', 'seed'
    market_value DECIMAL(8,2), -- Valore di mercato stimato
    
    -- Condizioni
    weather_conditions JSONB,
    storage_method TEXT, -- 'fresh', 'refrigerated', 'frozen', 'dried'
    
    -- Media
    photos TEXT[],
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_quality CHECK (quality_grade IS NULL OR quality_grade IN ('excellent', 'good', 'fair', 'poor')),
    CONSTRAINT valid_size CHECK (size_category IS NULL OR size_category IN ('large', 'medium', 'small')),
    CONSTRAINT valid_ripeness CHECK (ripeness_level IS NULL OR ripeness_level IN ('unripe', 'perfect', 'overripe')),
    CONSTRAINT positive_quantity CHECK (quantity_kg > 0)
);

-- 4. FUNZIONI DI CALCOLO AUTOMATICO

-- Funzione per calcolare numero piante in un filare
CREATE OR REPLACE FUNCTION calculate_plants_in_row(
    row_length_m DECIMAL,
    plant_spacing_cm INTEGER
) RETURNS INTEGER AS $$
BEGIN
    -- Converte lunghezza in cm e calcola numero piante
    -- Sottrae uno spazio perché la prima pianta è a 0cm
    RETURN FLOOR((row_length_m * 100) / plant_spacing_cm) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Funzione per calcolare lunghezza minima filare
CREATE OR REPLACE FUNCTION calculate_min_row_length(
    plants_count INTEGER,
    plant_spacing_cm INTEGER
) RETURNS DECIMAL AS $$
BEGIN
    -- Calcola lunghezza minima in metri
    RETURN ((plants_count - 1) * plant_spacing_cm) / 100.0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Funzione per generare codice pianta automatico
CREATE OR REPLACE FUNCTION generate_plant_code(
    p_garden_id UUID,
    p_row_id UUID DEFAULT NULL,
    p_field_row_id UUID DEFAULT NULL,
    p_position INTEGER DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    row_number INTEGER;
    row_prefix TEXT;
    position_num INTEGER;
BEGIN
    -- Determina il numero del filare
    IF p_row_id IS NOT NULL THEN
        SELECT COALESCE(row_number, 1) INTO row_number FROM garden_rows WHERE id = p_row_id;
        row_prefix := 'B'; -- Bed row
    ELSIF p_field_row_id IS NOT NULL THEN
        SELECT COALESCE(row_number, 1) INTO row_number FROM field_rows WHERE id = p_field_row_id;
        row_prefix := 'F'; -- Field row
    ELSE
        RETURN 'UNKNOWN';
    END IF;
    
    -- Usa la posizione fornita o calcola la prossima
    IF p_position IS NOT NULL THEN
        position_num := p_position;
    ELSE
        -- Trova la prossima posizione disponibile
        IF p_row_id IS NOT NULL THEN
            SELECT COALESCE(MAX(position_in_row), 0) + 1 
            INTO position_num 
            FROM garden_plants 
            WHERE row_id = p_row_id;
        ELSE
            SELECT COALESCE(MAX(position_in_row), 0) + 1 
            INTO position_num 
            FROM garden_plants 
            WHERE field_row_id = p_field_row_id;
        END IF;
    END IF;
    
    -- Genera codice: F1-P001, B2-P015, etc.
    RETURN row_prefix || row_number || '-P' || LPAD(position_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Funzione per auto-generare piante in un filare
CREATE OR REPLACE FUNCTION auto_generate_plants_in_row(
    p_garden_id UUID,
    p_row_id UUID DEFAULT NULL,
    p_field_row_id UUID DEFAULT NULL,
    p_plant_name TEXT DEFAULT 'Pianta',
    p_variety TEXT DEFAULT NULL,
    p_planting_date DATE DEFAULT CURRENT_DATE,
    p_plant_spacing_cm INTEGER DEFAULT 30
) RETURNS INTEGER AS $$
DECLARE
    row_length DECIMAL;
    max_plants INTEGER;
    i INTEGER;
    plant_code TEXT;
    plants_created INTEGER := 0;
BEGIN
    -- Ottieni lunghezza filare
    IF p_row_id IS NOT NULL THEN
        SELECT length_meters INTO row_length FROM garden_rows WHERE id = p_row_id;
    ELSIF p_field_row_id IS NOT NULL THEN
        SELECT length_meters INTO row_length FROM field_rows WHERE id = p_field_row_id;
    ELSE
        RAISE EXCEPTION 'Deve essere specificato row_id o field_row_id';
    END IF;
    
    -- Calcola numero massimo piante
    max_plants := calculate_plants_in_row(row_length, p_plant_spacing_cm);
    
    -- Genera piante
    FOR i IN 1..max_plants LOOP
        plant_code := generate_plant_code(p_garden_id, p_row_id, p_field_row_id, i);
        
        INSERT INTO garden_plants (
            garden_id,
            row_id,
            field_row_id,
            position_in_row,
            plant_code,
            plant_name,
            variety,
            planting_date,
            coordinates
        ) VALUES (
            p_garden_id,
            p_row_id,
            p_field_row_id,
            i,
            plant_code,
            p_plant_name,
            p_variety,
            p_planting_date,
            jsonb_build_object(
                'x', (i - 1) * (p_plant_spacing_cm / 100.0),
                'y', 0
            )
        );
        
        plants_created := plants_created + 1;
    END LOOP;
    
    RETURN plants_created;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER PER AUTO-UPDATE

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_garden_plants_updated_at
    BEFORE UPDATE ON garden_plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_operations_updated_at
    BEFORE UPDATE ON plant_operations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. INDICI PER PERFORMANCE

CREATE INDEX idx_garden_plants_garden_id ON garden_plants(garden_id);
CREATE INDEX idx_garden_plants_row_id ON garden_plants(row_id);
CREATE INDEX idx_garden_plants_field_row_id ON garden_plants(field_row_id);
CREATE INDEX idx_garden_plants_status ON garden_plants(status);
CREATE INDEX idx_garden_plants_planting_date ON garden_plants(planting_date);
CREATE INDEX idx_garden_plants_plant_name ON garden_plants(plant_name);

CREATE INDEX idx_plant_operations_plant_id ON plant_operations(plant_id);
CREATE INDEX idx_plant_operations_garden_id ON plant_operations(garden_id);
CREATE INDEX idx_plant_operations_operation_type ON plant_operations(operation_type);
CREATE INDEX idx_plant_operations_operation_date ON plant_operations(operation_date);

CREATE INDEX idx_plant_harvests_plant_id ON plant_harvests(plant_id);
CREATE INDEX idx_plant_harvests_garden_id ON plant_harvests(garden_id);
CREATE INDEX idx_plant_harvests_harvest_date ON plant_harvests(harvest_date);

-- 7. VISTE UTILI PER REPORTING

-- Vista riassuntiva piante per filare
CREATE VIEW plants_per_row_summary AS
SELECT 
    COALESCE(CONCAT('Row ', gr.row_number, ' - ', gr.crop_name), fr.name) as row_name,
    COALESCE(gr.id, fr.id) as row_id,
    CASE WHEN gr.id IS NOT NULL THEN 'garden_row' ELSE 'field_row' END as row_type,
    gp.garden_id,
    COUNT(*) as total_plants,
    COUNT(*) FILTER (WHERE gp.status = 'healthy') as healthy_plants,
    COUNT(*) FILTER (WHERE gp.status = 'diseased') as diseased_plants,
    COUNT(*) FILTER (WHERE gp.status = 'dead') as dead_plants,
    AVG(gp.health_score) as avg_health_score,
    MIN(gp.planting_date) as first_planting_date,
    MAX(gp.planting_date) as last_planting_date
FROM garden_plants gp
LEFT JOIN garden_rows gr ON gp.row_id = gr.id
LEFT JOIN field_rows fr ON gp.field_row_id = fr.id
GROUP BY 
    COALESCE(CONCAT('Row ', gr.row_number, ' - ', gr.crop_name), fr.name), 
    COALESCE(gr.id, fr.id), 
    CASE WHEN gr.id IS NOT NULL THEN 'garden_row' ELSE 'field_row' END,
    gp.garden_id;

-- Vista produzioni per pianta
CREATE VIEW plant_production_summary AS
SELECT 
    gp.id as plant_id,
    gp.plant_code,
    gp.plant_name,
    gp.variety,
    gp.planting_date,
    COUNT(ph.id) as total_harvests,
    COALESCE(SUM(ph.quantity_kg), 0) as total_production_kg,
    COALESCE(AVG(ph.quantity_kg), 0) as avg_harvest_kg,
    COALESCE(SUM(ph.market_value), 0) as total_value,
    MIN(ph.harvest_date) as first_harvest_date,
    MAX(ph.harvest_date) as last_harvest_date
FROM garden_plants gp
LEFT JOIN plant_harvests ph ON gp.id = ph.plant_id
GROUP BY gp.id, gp.plant_code, gp.plant_name, gp.variety, gp.planting_date;

-- 8. COMMENTI DOCUMENTAZIONE

COMMENT ON TABLE garden_plants IS 'Tracciamento individuale di ogni singola pianta nell orto con posizione precisa nel filare';
COMMENT ON TABLE plant_operations IS 'Registro di tutte le operazioni eseguite su ogni singola pianta (irrigazione, fertilizzazione, trattamenti)';
COMMENT ON TABLE plant_harvests IS 'Registro di tutti i raccolti da ogni singola pianta con quantità e qualità';

COMMENT ON FUNCTION calculate_plants_in_row IS 'Calcola il numero massimo di piante che possono stare in un filare data la lunghezza e la distanza tra piante';
COMMENT ON FUNCTION auto_generate_plants_in_row IS 'Genera automaticamente tutte le piante in un filare con codici progressivi e coordinate';