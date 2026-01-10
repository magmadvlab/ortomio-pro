-- =====================================================
-- ESTENSIONE OPERAZIONI PER PIANTE INDIVIDUALI
-- Aggiunge supporto per operazioni su piante singole
-- =====================================================

-- 1. AGGIUNGI COLONNE ALLE TABELLE OPERAZIONI ESISTENTI

-- Lavorazioni meccaniche per pianta singola
ALTER TABLE mechanical_work_register ADD COLUMN plant_ids UUID[] DEFAULT NULL;
ALTER TABLE mechanical_work_register ADD COLUMN plants_affected INTEGER DEFAULT NULL;
COMMENT ON COLUMN mechanical_work_register.plant_ids IS 'Array di IDs delle piante specifiche su cui è stata fatta l operazione';
COMMENT ON COLUMN mechanical_work_register.plants_affected IS 'Numero totale di piante coinvolte nell operazione';

-- Irrigazioni per pianta singola
ALTER TABLE watering_logs ADD COLUMN plant_ids UUID[] DEFAULT NULL;
ALTER TABLE watering_logs ADD COLUMN plants_affected INTEGER DEFAULT NULL;
ALTER TABLE watering_logs ADD COLUMN water_per_plant_liters DECIMAL(6,2) DEFAULT NULL;
COMMENT ON COLUMN watering_logs.plant_ids IS 'Array di IDs delle piante specifiche irrigate';
COMMENT ON COLUMN watering_logs.plants_affected IS 'Numero totale di piante irrigate';
COMMENT ON COLUMN watering_logs.water_per_plant_liters IS 'Litri d acqua per singola pianta';

-- Fertilizzazioni per pianta singola
ALTER TABLE fertilizer_application_logs ADD COLUMN plant_ids UUID[] DEFAULT NULL;
ALTER TABLE fertilizer_application_logs ADD COLUMN plants_affected INTEGER DEFAULT NULL;
ALTER TABLE fertilizer_application_logs ADD COLUMN fertilizer_per_plant_grams DECIMAL(8,2) DEFAULT NULL;
COMMENT ON COLUMN fertilizer_application_logs.plant_ids IS 'Array di IDs delle piante specifiche fertilizzate';
COMMENT ON COLUMN fertilizer_application_logs.plants_affected IS 'Numero totale di piante fertilizzate';
COMMENT ON COLUMN fertilizer_application_logs.fertilizer_per_plant_grams IS 'Grammi di fertilizzante per singola pianta';

-- Trattamenti per pianta singola
ALTER TABLE treatment_register ADD COLUMN plant_ids UUID[] DEFAULT NULL;
ALTER TABLE treatment_register ADD COLUMN plants_affected INTEGER DEFAULT NULL;
ALTER TABLE treatment_register ADD COLUMN product_per_plant_ml DECIMAL(8,2) DEFAULT NULL;
COMMENT ON COLUMN treatment_register.plant_ids IS 'Array di IDs delle piante specifiche trattate';
COMMENT ON COLUMN treatment_register.plants_affected IS 'Numero totale di piante trattate';
COMMENT ON COLUMN treatment_register.product_per_plant_ml IS 'Millilitri di prodotto per singola pianta';

-- 2. FUNZIONI HELPER PER OPERAZIONI SU PIANTE

-- Funzione per ottenere piante in un filare
CREATE OR REPLACE FUNCTION get_plants_in_row(
    p_row_id UUID DEFAULT NULL,
    p_field_row_id UUID DEFAULT NULL,
    p_status TEXT DEFAULT NULL
) RETURNS TABLE (
    plant_id UUID,
    plant_code TEXT,
    position_in_row INTEGER,
    plant_name TEXT,
    variety TEXT,
    status TEXT,
    health_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gp.id,
        gp.plant_code,
        gp.position_in_row,
        gp.plant_name,
        gp.variety,
        gp.status,
        gp.health_score
    FROM garden_plants gp
    WHERE 
        (p_row_id IS NULL OR gp.row_id = p_row_id) AND
        (p_field_row_id IS NULL OR gp.field_row_id = p_field_row_id) AND
        (p_status IS NULL OR gp.status = p_status)
    ORDER BY gp.position_in_row;
END;
$$ LANGUAGE plpgsql;

-- Funzione per applicare operazione a tutte le piante di un filare
CREATE OR REPLACE FUNCTION apply_operation_to_row_plants(
    p_operation_type TEXT,
    p_row_id UUID DEFAULT NULL,
    p_field_row_id UUID DEFAULT NULL,
    p_operation_date DATE DEFAULT CURRENT_DATE,
    p_quantity DECIMAL DEFAULT NULL,
    p_unit TEXT DEFAULT NULL,
    p_product_name TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    plant_record RECORD;
    operations_created INTEGER := 0;
BEGIN
    -- Itera su tutte le piante del filare
    FOR plant_record IN 
        SELECT * FROM get_plants_in_row(p_row_id, p_field_row_id, 'healthy')
    LOOP
        INSERT INTO plant_operations (
            plant_id,
            garden_id,
            operation_type,
            operation_date,
            quantity,
            unit,
            product_name,
            notes
        ) 
        SELECT 
            plant_record.plant_id,
            gp.garden_id,
            p_operation_type,
            p_operation_date,
            p_quantity,
            p_unit,
            p_product_name,
            p_notes
        FROM garden_plants gp 
        WHERE gp.id = plant_record.plant_id;
        
        operations_created := operations_created + 1;
    END LOOP;
    
    RETURN operations_created;
END;
$$ LANGUAGE plpgsql;

-- Funzione per calcolare statistiche operazioni per filare
CREATE OR REPLACE FUNCTION get_row_operation_stats(
    p_row_id UUID DEFAULT NULL,
    p_field_row_id UUID DEFAULT NULL,
    p_operation_type TEXT DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
) RETURNS TABLE (
    operation_type TEXT,
    total_operations BIGINT,
    plants_affected BIGINT,
    total_quantity DECIMAL,
    avg_quantity_per_plant DECIMAL,
    last_operation_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.operation_type,
        COUNT(*) as total_operations,
        COUNT(DISTINCT po.plant_id) as plants_affected,
        COALESCE(SUM(po.quantity), 0) as total_quantity,
        COALESCE(AVG(po.quantity), 0) as avg_quantity_per_plant,
        MAX(po.operation_date) as last_operation_date
    FROM plant_operations po
    JOIN garden_plants gp ON po.plant_id = gp.id
    WHERE 
        (p_row_id IS NULL OR gp.row_id = p_row_id) AND
        (p_field_row_id IS NULL OR gp.field_row_id = p_field_row_id) AND
        (p_operation_type IS NULL OR po.operation_type = p_operation_type) AND
        (p_date_from IS NULL OR po.operation_date >= p_date_from) AND
        (p_date_to IS NULL OR po.operation_date <= p_date_to)
    GROUP BY po.operation_type
    ORDER BY po.operation_type;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGER PER SINCRONIZZAZIONE AUTOMATICA

-- Trigger per aggiornare contatori quando si aggiungono operazioni su piante
CREATE OR REPLACE FUNCTION sync_plant_operations_to_main_tables()
RETURNS TRIGGER AS $$
DECLARE
    affected_plants INTEGER;
    total_quantity DECIMAL;
    garden_id_val UUID;
    row_id_val UUID;
    field_row_id_val UUID;
BEGIN
    -- Ottieni informazioni sulla pianta
    SELECT gp.garden_id, gp.row_id, gp.field_row_id 
    INTO garden_id_val, row_id_val, field_row_id_val
    FROM garden_plants gp 
    WHERE gp.id = NEW.plant_id;
    
    -- Conta operazioni simili nello stesso giorno per lo stesso filare
    SELECT COUNT(DISTINCT po.plant_id), COALESCE(SUM(po.quantity), 0)
    INTO affected_plants, total_quantity
    FROM plant_operations po
    JOIN garden_plants gp ON po.plant_id = gp.id
    WHERE po.operation_type = NEW.operation_type
    AND po.operation_date = NEW.operation_date
    AND (
        (row_id_val IS NOT NULL AND gp.row_id = row_id_val) OR
        (field_row_id_val IS NOT NULL AND gp.field_row_id = field_row_id_val)
    );
    
    -- Aggiorna o crea record nella tabella principale appropriata
    IF NEW.operation_type = 'watering' THEN
        INSERT INTO watering_logs (
            garden_id, row_id, field_row_id, watering_date,
            plants_affected, total_water_liters, water_per_plant_liters,
            notes, created_at
        ) VALUES (
            garden_id_val, row_id_val, field_row_id_val, NEW.operation_date,
            affected_plants, total_quantity, NEW.quantity,
            'Auto-generato da operazioni piante individuali', NOW()
        )
        ON CONFLICT (garden_id, COALESCE(row_id, field_row_id), watering_date) 
        DO UPDATE SET
            plants_affected = affected_plants,
            total_water_liters = total_quantity,
            updated_at = NOW();
            
    ELSIF NEW.operation_type = 'fertilizing' THEN
        INSERT INTO fertilizer_applications (
            garden_id, row_id, field_row_id, application_date,
            plants_affected, fertilizer_per_plant_grams,
            fertilizer_name, notes, created_at
        ) VALUES (
            garden_id_val, row_id_val, field_row_id_val, NEW.operation_date,
            affected_plants, NEW.quantity,
            NEW.product_name, 'Auto-generato da operazioni piante individuali', NOW()
        )
        ON CONFLICT (garden_id, COALESCE(row_id, field_row_id), application_date, fertilizer_name) 
        DO UPDATE SET
            plants_affected = affected_plants,
            fertilizer_per_plant_grams = NEW.quantity,
            updated_at = NOW();
            
    ELSIF NEW.operation_type = 'treatment' THEN
        INSERT INTO treatment_applications (
            garden_id, row_id, field_row_id, application_date,
            plants_affected, product_per_plant_ml,
            product_name, notes, created_at
        ) VALUES (
            garden_id_val, row_id_val, field_row_id_val, NEW.operation_date,
            affected_plants, NEW.quantity,
            NEW.product_name, 'Auto-generato da operazioni piante individuali', NOW()
        )
        ON CONFLICT (garden_id, COALESCE(row_id, field_row_id), application_date, product_name) 
        DO UPDATE SET
            plants_affected = affected_plants,
            product_per_plant_ml = NEW.quantity,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger
CREATE TRIGGER sync_plant_operations_trigger
    AFTER INSERT ON plant_operations
    FOR EACH ROW
    EXECUTE FUNCTION sync_plant_operations_to_main_tables();

-- 4. VISTE PER ANALISI AVANZATE

-- Vista operazioni complete per pianta
CREATE VIEW plant_operations_complete AS
SELECT 
    gp.id as plant_id,
    gp.plant_code,
    gp.plant_name,
    gp.variety,
    gp.position_in_row,
    COALESCE(CONCAT('Row ', gr.row_number, ' - ', gr.crop_name), fr.name) as row_name,
    po.operation_type,
    po.operation_date,
    po.quantity,
    po.unit,
    po.product_name,
    po.effectiveness_score,
    po.plant_response,
    po.notes,
    po.created_at
FROM garden_plants gp
LEFT JOIN garden_rows gr ON gp.row_id = gr.id
LEFT JOIN field_rows fr ON gp.field_row_id = fr.id
LEFT JOIN plant_operations po ON gp.id = po.plant_id
ORDER BY gp.plant_code, po.operation_date DESC;

-- Vista riassunto salute per filare
CREATE VIEW row_health_summary AS
SELECT 
    COALESCE(gr.id, fr.id) as row_id,
    COALESCE(CONCAT('Row ', gr.row_number, ' - ', gr.crop_name), fr.name) as row_name,
    CASE WHEN gr.id IS NOT NULL THEN 'garden_row' ELSE 'field_row' END as row_type,
    gp.garden_id,
    COUNT(*) as total_plants,
    AVG(gp.health_score) as avg_health_score,
    COUNT(*) FILTER (WHERE gp.status = 'healthy') as healthy_count,
    COUNT(*) FILTER (WHERE gp.status = 'diseased') as diseased_count,
    COUNT(*) FILTER (WHERE gp.status = 'dead') as dead_count,
    -- Operazioni recenti (ultimi 30 giorni)
    COUNT(DISTINCT po.id) FILTER (WHERE po.operation_date >= CURRENT_DATE - INTERVAL '30 days') as recent_operations,
    MAX(po.operation_date) as last_operation_date
FROM garden_plants gp
LEFT JOIN garden_rows gr ON gp.row_id = gr.id
LEFT JOIN field_rows fr ON gp.field_row_id = fr.id
LEFT JOIN plant_operations po ON gp.id = po.plant_id
GROUP BY COALESCE(gr.id, fr.id), COALESCE(CONCAT('Row ', gr.row_number, ' - ', gr.crop_name), fr.name), 
         CASE WHEN gr.id IS NOT NULL THEN 'garden_row' ELSE 'field_row' END, gp.garden_id;

-- 5. INDICI AGGIUNTIVI PER PERFORMANCE

CREATE INDEX idx_mechanical_work_register_plant_ids ON mechanical_work_register USING GIN(plant_ids);
CREATE INDEX idx_watering_logs_plant_ids ON watering_logs USING GIN(plant_ids);
CREATE INDEX idx_fertilizer_application_logs_plant_ids ON fertilizer_application_logs USING GIN(plant_ids);
CREATE INDEX idx_treatment_register_plant_ids ON treatment_register USING GIN(plant_ids);

-- 6. FUNZIONE DI ESEMPIO PER IL TUO SCENARIO

-- Funzione per creare 10 filari di pomodori con 100 piante ciascuno
CREATE OR REPLACE FUNCTION create_tomato_field_example(
    p_garden_id UUID,
    p_zone_name TEXT DEFAULT 'Campo Pomodori',
    p_variety TEXT DEFAULT 'San Marzano'
) RETURNS JSONB AS $$
DECLARE
    zone_id UUID;
    row_id UUID;
    i INTEGER;
    total_plants INTEGER := 0;
    result JSONB;
BEGIN
    -- Crea zona
    INSERT INTO garden_zones (garden_id, name, description, size_sq_meters)
    VALUES (p_garden_id, p_zone_name, 'Campo con 10 filari di pomodori', 600)
    RETURNING id INTO zone_id;
    
    -- Crea 10 filari
    FOR i IN 1..10 LOOP
        INSERT INTO field_rows (
            garden_id, zone_id, name, row_number, 
            length_meters, distance_from_previous_row, plant_spacing,
            cultivar, orientation, is_active
        ) VALUES (
            p_garden_id, zone_id, 'Filare Pomodori ' || i, i,
            40.0, 150, 40, -- 40m lunghezza, 150cm tra filari, 40cm tra piante
            'Pomodoro ' || p_variety, 'N-S', true
        ) RETURNING id INTO row_id;
        
        -- Genera 100 piante per filare
        total_plants := total_plants + auto_generate_plants_in_row(
            p_garden_id, NULL, row_id, 'Pomodoro', p_variety, CURRENT_DATE, 40
        );
    END LOOP;
    
    -- Prepara risultato
    result := jsonb_build_object(
        'zone_id', zone_id,
        'total_rows', 10,
        'total_plants', total_plants,
        'area_sqm', 600,
        'plant_spacing_cm', 40,
        'row_spacing_cm', 150,
        'plants_per_row', total_plants / 10
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_tomato_field_example IS 'Esempio: crea 10 filari di pomodori con 100 piante ciascuno (1000 piante totali) nel tuo scenario specifico';