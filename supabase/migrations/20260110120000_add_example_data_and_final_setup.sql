-- =====================================================
-- SETUP FINALE E DATI DI ESEMPIO
-- Completa il sistema con dati di esempio e ottimizzazioni
-- =====================================================

-- 1. AGGIORNA TABELLE ESISTENTI PER COMPATIBILITÀ

-- Aggiungi colonna per calcolo automatico piante nei filari esistenti
ALTER TABLE field_rows ADD COLUMN IF NOT EXISTS calculated_plants INTEGER;
ALTER TABLE garden_rows ADD COLUMN IF NOT EXISTS calculated_plants INTEGER;

-- Trigger per calcolare automaticamente il numero di piante quando si aggiorna un filare
CREATE OR REPLACE FUNCTION update_calculated_plants()
RETURNS TRIGGER AS $$
BEGIN
    -- Per field_rows
    IF TG_TABLE_NAME = 'field_rows' THEN
        IF NEW.length_meters IS NOT NULL AND NEW.plant_spacing IS NOT NULL THEN
            NEW.calculated_plants := calculate_plants_in_row(NEW.length_meters, NEW.plant_spacing);
        END IF;
    END IF;
    
    -- Per garden_rows  
    IF TG_TABLE_NAME = 'garden_rows' THEN
        IF NEW.length_meters IS NOT NULL AND NEW.plant_spacing IS NOT NULL THEN
            NEW.calculated_plants := calculate_plants_in_row(NEW.length_meters, NEW.plant_spacing);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger
DROP TRIGGER IF EXISTS update_field_rows_calculated_plants ON field_rows;
CREATE TRIGGER update_field_rows_calculated_plants
    BEFORE INSERT OR UPDATE ON field_rows
    FOR EACH ROW
    EXECUTE FUNCTION update_calculated_plants();

DROP TRIGGER IF EXISTS update_garden_rows_calculated_plants ON garden_rows;
CREATE TRIGGER update_garden_rows_calculated_plants
    BEFORE INSERT OR UPDATE ON garden_rows
    FOR EACH ROW
    EXECUTE FUNCTION update_calculated_plants();

-- 2. FUNZIONI AVANZATE PER GESTIONE PIANTE

-- Funzione per ottenere statistiche complete di un filare
CREATE OR REPLACE FUNCTION get_complete_row_stats(
    p_row_id UUID DEFAULT NULL,
    p_field_row_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    row_info RECORD;
    plant_stats RECORD;
    operation_stats RECORD;
    harvest_stats RECORD;
    result JSONB;
BEGIN
    -- Ottieni info filare
    IF p_row_id IS NOT NULL THEN
        SELECT name, length_meters, plant_spacing, calculated_plants, cultivar
        INTO row_info
        FROM garden_rows WHERE id = p_row_id;
    ELSIF p_field_row_id IS NOT NULL THEN
        SELECT name, length_meters, plant_spacing, calculated_plants, cultivar
        INTO row_info
        FROM field_rows WHERE id = p_field_row_id;
    END IF;
    
    -- Statistiche piante
    SELECT 
        COUNT(*) as total_plants,
        COUNT(*) FILTER (WHERE status = 'healthy') as healthy_plants,
        COUNT(*) FILTER (WHERE status = 'diseased') as diseased_plants,
        COUNT(*) FILTER (WHERE status = 'dead') as dead_plants,
        AVG(health_score) as avg_health_score,
        MIN(planting_date) as first_planting,
        MAX(planting_date) as last_planting
    INTO plant_stats
    FROM garden_plants
    WHERE (p_row_id IS NOT NULL AND row_id = p_row_id) 
       OR (p_field_row_id IS NOT NULL AND field_row_id = p_field_row_id);
    
    -- Statistiche operazioni (ultimi 30 giorni)
    SELECT 
        COUNT(*) as total_operations,
        COUNT(DISTINCT operation_type) as operation_types,
        MAX(operation_date) as last_operation
    INTO operation_stats
    FROM plant_operations po
    JOIN garden_plants gp ON po.plant_id = gp.id
    WHERE po.operation_date >= CURRENT_DATE - INTERVAL '30 days'
      AND ((p_row_id IS NOT NULL AND gp.row_id = p_row_id) 
           OR (p_field_row_id IS NOT NULL AND gp.field_row_id = p_field_row_id));
    
    -- Statistiche raccolti
    SELECT 
        COUNT(*) as total_harvests,
        COALESCE(SUM(quantity_kg), 0) as total_production_kg,
        COALESCE(AVG(quantity_kg), 0) as avg_harvest_kg
    INTO harvest_stats
    FROM plant_harvests ph
    JOIN garden_plants gp ON ph.plant_id = gp.id
    WHERE (p_row_id IS NOT NULL AND gp.row_id = p_row_id) 
       OR (p_field_row_id IS NOT NULL AND gp.field_row_id = p_field_row_id);
    
    -- Costruisci risultato JSON
    result := jsonb_build_object(
        'row_info', jsonb_build_object(
            'name', row_info.name,
            'length_meters', row_info.length_meters,
            'plant_spacing', row_info.plant_spacing,
            'calculated_plants', row_info.calculated_plants,
            'cultivar', row_info.cultivar
        ),
        'plant_stats', jsonb_build_object(
            'total_plants', COALESCE(plant_stats.total_plants, 0),
            'healthy_plants', COALESCE(plant_stats.healthy_plants, 0),
            'diseased_plants', COALESCE(plant_stats.diseased_plants, 0),
            'dead_plants', COALESCE(plant_stats.dead_plants, 0),
            'avg_health_score', COALESCE(plant_stats.avg_health_score, 0),
            'health_percentage', CASE 
                WHEN COALESCE(plant_stats.total_plants, 0) > 0 
                THEN (COALESCE(plant_stats.healthy_plants, 0) * 100.0 / plant_stats.total_plants)
                ELSE 0 
            END,
            'first_planting', plant_stats.first_planting,
            'last_planting', plant_stats.last_planting
        ),
        'operation_stats', jsonb_build_object(
            'total_operations_30d', COALESCE(operation_stats.total_operations, 0),
            'operation_types', COALESCE(operation_stats.operation_types, 0),
            'last_operation', operation_stats.last_operation
        ),
        'harvest_stats', jsonb_build_object(
            'total_harvests', COALESCE(harvest_stats.total_harvests, 0),
            'total_production_kg', COALESCE(harvest_stats.total_production_kg, 0),
            'avg_harvest_kg', COALESCE(harvest_stats.avg_harvest_kg, 0)
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNZIONE PER CREARE DATI DI ESEMPIO (IL TUO SCENARIO)

-- Funzione per creare l'esempio completo: 10 filari × 100 piante = 1000 piante
CREATE OR REPLACE FUNCTION create_example_tomato_field(
    p_garden_id UUID
) RETURNS JSONB AS $$
DECLARE
    zone_id UUID;
    row_ids UUID[];
    row_id UUID;
    i INTEGER;
    j INTEGER;
    plants_created INTEGER := 0;
    operations_created INTEGER := 0;
    harvests_created INTEGER := 0;
    result JSONB;
BEGIN
    -- 1. Crea zona "Campo Pomodori"
    INSERT INTO garden_zones (
        garden_id, name, description, size_sq_meters,
        primary_cultivar, crop_type, soil_type, sun_exposure
    ) VALUES (
        p_garden_id, 
        'Campo Pomodori - Esempio',
        'Campo dimostrativo con 10 filari di pomodori San Marzano (1000 piante totali)',
        600, -- 40m × 15m
        'Pomodoro San Marzano',
        'Vegetables',
        'Loamy',
        'FullSun'
    ) RETURNING id INTO zone_id;
    
    -- 2. Crea 10 filari
    FOR i IN 1..10 LOOP
        INSERT INTO field_rows (
            garden_id, zone_id, name, row_number,
            length_meters, distance_from_previous_row, plant_spacing,
            cultivar, orientation, is_active, planted_date
        ) VALUES (
            p_garden_id, zone_id, 
            'Filare Pomodori ' || i, 
            i,
            40.0,  -- 40 metri di lunghezza
            150,   -- 150cm tra filari
            40,    -- 40cm tra piante
            'Pomodoro San Marzano',
            'N-S',
            true,
            CURRENT_DATE - INTERVAL '60 days' -- Piantato 60 giorni fa
        ) RETURNING id INTO row_id;
        
        row_ids := array_append(row_ids, row_id);
        
        -- 3. Genera 100 piante per filare (calcolo automatico)
        plants_created := plants_created + auto_generate_plants_in_row(
            p_garden_id, NULL, row_id, 'Pomodoro', 'San Marzano', 
            CURRENT_DATE - INTERVAL '60 days', 40
        );
    END LOOP;
    
    -- 4. Aggiungi operazioni di esempio per alcune piante
    -- Irrigazione settimanale per tutte le piante
    FOR i IN 1..8 LOOP -- 8 settimane di irrigazione
        operations_created := operations_created + apply_operation_to_row_plants(
            'watering',
            NULL, -- row_id
            row_ids[1], -- Primo filare come esempio
            CURRENT_DATE - INTERVAL '7 days' * i,
            3.0, -- 3 litri per pianta
            'L',
            NULL,
            'Irrigazione settimanale automatica'
        );
    END LOOP;
    
    -- Fertilizzazione mensile
    FOR i IN 1..2 LOOP -- 2 fertilizzazioni
        operations_created := operations_created + apply_operation_to_row_plants(
            'fertilizing',
            NULL,
            row_ids[1],
            CURRENT_DATE - INTERVAL '30 days' * i,
            25.0, -- 25g per pianta
            'g',
            'NPK 10-10-10',
            'Fertilizzazione mensile'
        );
    END LOOP;
    
    -- 5. Aggiungi alcuni raccolti di esempio
    -- Simula raccolti per le prime 50 piante del primo filare
    INSERT INTO plant_harvests (
        plant_id, garden_id, harvest_date, quantity_kg, 
        quality_grade, destination, market_value
    )
    SELECT 
        gp.id,
        gp.garden_id,
        CURRENT_DATE - INTERVAL '1 day' * (random() * 10)::integer, -- Raccolti negli ultimi 10 giorni
        (random() * 2 + 0.5)::numeric(8,3), -- 0.5-2.5 kg per pianta
        CASE 
            WHEN random() > 0.8 THEN 'excellent'
            WHEN random() > 0.5 THEN 'good'
            ELSE 'fair'
        END,
        'consumption',
        (random() * 6 + 2)::numeric(8,2) -- €2-8 per kg
    FROM garden_plants gp
    WHERE gp.field_row_id = row_ids[1]
      AND gp.position_in_row <= 50
      AND random() > 0.3; -- 70% delle piante hanno prodotto
    
    GET DIAGNOSTICS harvests_created = ROW_COUNT;
    
    -- 6. Aggiorna stato salute di alcune piante
    UPDATE garden_plants 
    SET 
        health_score = CASE 
            WHEN random() > 0.9 THEN 95 + (random() * 5)::integer
            WHEN random() > 0.7 THEN 80 + (random() * 15)::integer
            WHEN random() > 0.9 THEN 60 + (random() * 20)::integer
            ELSE 90 + (random() * 10)::integer
        END,
        status = CASE 
            WHEN random() > 0.95 THEN 'diseased'
            WHEN random() > 0.98 THEN 'dead'
            ELSE 'healthy'
        END
    WHERE garden_id = p_garden_id;
    
    -- 7. Prepara risultato
    result := jsonb_build_object(
        'success', true,
        'zone_id', zone_id,
        'zone_name', 'Campo Pomodori - Esempio',
        'rows_created', 10,
        'plants_created', plants_created,
        'operations_created', operations_created,
        'harvests_created', harvests_created,
        'configuration', jsonb_build_object(
            'row_count', 10,
            'row_length_m', 40,
            'plant_spacing_cm', 40,
            'row_spacing_cm', 150,
            'total_area_sqm', 600,
            'plants_per_row', plants_created / 10,
            'plants_per_sqm', plants_created / 600.0
        ),
        'summary', jsonb_build_object(
            'total_plants', plants_created,
            'area_sqm', 600,
            'density', 'Alta densità - ideale per pomodori',
            'tracking_level', 'Completo - ogni pianta tracciata individualmente'
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. VISTE OTTIMIZZATE PER DASHBOARD

-- Vista dashboard piante per giardino
CREATE OR REPLACE VIEW garden_plants_dashboard AS
SELECT 
    g.id as garden_id,
    g.name as garden_name,
    COUNT(gp.id) as total_plants,
    COUNT(gp.id) FILTER (WHERE gp.status = 'healthy') as healthy_plants,
    COUNT(gp.id) FILTER (WHERE gp.status = 'diseased') as diseased_plants,
    COUNT(gp.id) FILTER (WHERE gp.status = 'dead') as dead_plants,
    ROUND(AVG(gp.health_score), 1) as avg_health_score,
    COUNT(DISTINCT gp.plant_name) as plant_varieties,
    COUNT(DISTINCT COALESCE(gp.row_id, gp.field_row_id)) as active_rows,
    -- Operazioni recenti (ultimi 7 giorni)
    COUNT(DISTINCT po.id) FILTER (WHERE po.operation_date >= CURRENT_DATE - INTERVAL '7 days') as recent_operations,
    -- Raccolti recenti (ultimi 7 giorni)
    COUNT(DISTINCT ph.id) FILTER (WHERE ph.harvest_date >= CURRENT_DATE - INTERVAL '7 days') as recent_harvests,
    COALESCE(SUM(ph.quantity_kg) FILTER (WHERE ph.harvest_date >= CURRENT_DATE - INTERVAL '7 days'), 0) as recent_harvest_kg
FROM gardens g
LEFT JOIN garden_plants gp ON g.id = gp.garden_id
LEFT JOIN plant_operations po ON gp.id = po.plant_id
LEFT JOIN plant_harvests ph ON gp.id = ph.plant_id
GROUP BY g.id, g.name;

-- 5. INDICI OTTIMIZZATI PER PERFORMANCE

-- Indici compositi per query frequenti
CREATE INDEX IF NOT EXISTS idx_garden_plants_garden_status ON garden_plants(garden_id, status);
CREATE INDEX IF NOT EXISTS idx_garden_plants_row_position ON garden_plants(COALESCE(row_id, field_row_id), position_in_row);
CREATE INDEX IF NOT EXISTS idx_plant_operations_plant_date ON plant_operations(plant_id, operation_date DESC);
CREATE INDEX IF NOT EXISTS idx_plant_harvests_plant_date ON plant_harvests(plant_id, harvest_date DESC);

-- Indici per ricerche full-text
CREATE INDEX IF NOT EXISTS idx_garden_plants_plant_name_gin ON garden_plants USING gin(to_tsvector('italian', plant_name));
CREATE INDEX IF NOT EXISTS idx_garden_plants_variety_gin ON garden_plants USING gin(to_tsvector('italian', COALESCE(variety, '')));

-- 6. FUNZIONI DI UTILITÀ

-- Funzione per backup dati piante
CREATE OR REPLACE FUNCTION backup_plant_data(p_garden_id UUID)
RETURNS JSONB AS $$
DECLARE
    backup_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'timestamp', NOW(),
        'garden_id', p_garden_id,
        'plants', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'plant_code', plant_code,
                    'plant_name', plant_name,
                    'variety', variety,
                    'position_in_row', position_in_row,
                    'status', status,
                    'health_score', health_score,
                    'planting_date', planting_date,
                    'coordinates', coordinates,
                    'notes', notes
                )
            )
            FROM garden_plants 
            WHERE garden_id = p_garden_id
        ),
        'operations', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'plant_code', gp.plant_code,
                    'operation_type', po.operation_type,
                    'operation_date', po.operation_date,
                    'quantity', po.quantity,
                    'unit', po.unit,
                    'product_name', po.product_name,
                    'notes', po.notes
                )
            )
            FROM plant_operations po
            JOIN garden_plants gp ON po.plant_id = gp.id
            WHERE gp.garden_id = p_garden_id
        ),
        'harvests', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'plant_code', gp.plant_code,
                    'harvest_date', ph.harvest_date,
                    'quantity_kg', ph.quantity_kg,
                    'quality_grade', ph.quality_grade,
                    'market_value', ph.market_value
                )
            )
            FROM plant_harvests ph
            JOIN garden_plants gp ON ph.plant_id = gp.id
            WHERE gp.garden_id = p_garden_id
        )
    ) INTO backup_data;
    
    RETURN backup_data;
END;
$$ LANGUAGE plpgsql;

-- 7. COMMENTI FINALI E DOCUMENTAZIONE

COMMENT ON FUNCTION create_example_tomato_field IS 'Crea un campo di esempio con 10 filari di pomodori (1000 piante totali) per dimostrare il sistema di tracking individuale';
COMMENT ON FUNCTION get_complete_row_stats IS 'Ottiene statistiche complete di un filare incluse piante, operazioni e raccolti';
COMMENT ON VIEW garden_plants_dashboard IS 'Vista dashboard ottimizzata per mostrare statistiche piante per giardino';

-- 8. MESSAGGIO FINALE
DO $$
BEGIN
    RAISE NOTICE '
    =====================================================
    🌱 SISTEMA TRACKING PIANTA-PER-PIANTA COMPLETATO! 
    =====================================================
    
    ✅ Database schema creato con successo
    ✅ Funzioni di calcolo automatico implementate  
    ✅ Sistema operazioni per pianta singola attivo
    ✅ Viste e indici ottimizzati
    
    🚀 PRONTO PER IL TUO SCENARIO:
    • 10 filari × 40 metri = 400 metri lineari
    • 100 piante per filare × 10 filari = 1000 piante
    • Distanza piante: 40cm | Distanza filari: 150cm
    • Area totale: 600 m² (40m × 15m)
    • Densità: 1.67 piante/m²
    
    📊 FUNZIONALITÀ DISPONIBILI:
    • Tracking individuale ogni pianta (F1-P001, F1-P002...)
    • Operazioni per pianta: irrigazione, fertilizzazione, trattamenti
    • Raccolti tracciati per singola pianta
    • Calcoli automatici fabbisogni
    • Dashboard statistiche avanzate
    
    🔧 PER TESTARE:
    SELECT create_example_tomato_field(''your-garden-id'');
    
    =====================================================
    ';
END $$;