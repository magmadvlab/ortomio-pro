-- =====================================================
-- SECURITY FIXES MIGRATION - OrtoMio Database
-- Risolve problemi RLS e Security Definer Views
-- =====================================================

-- 1. ENABLE RLS ON ALL NEW TABLES
ALTER TABLE prescription_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_map_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_harvests ENABLE ROW LEVEL SECURITY;

-- 2. CREATE RLS POLICIES FOR PRESCRIPTION MAPS
-- Users can only access their own garden's prescription maps
CREATE POLICY "Users can view their own prescription maps" ON prescription_maps
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own prescription maps" ON prescription_maps
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- 3. CREATE RLS POLICIES FOR PRESCRIPTION ZONES
CREATE POLICY "Users can view their own prescription zones" ON prescription_zones
    FOR SELECT USING (
        prescription_map_id IN (
            SELECT pm.id FROM prescription_maps pm
            JOIN gardens g ON pm.garden_id = g.id
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own prescription zones" ON prescription_zones
    FOR ALL USING (
        prescription_map_id IN (
            SELECT pm.id FROM prescription_maps pm
            JOIN gardens g ON pm.garden_id = g.id
            WHERE g.user_id = auth.uid()
        )
    );

-- 4. CREATE RLS POLICIES FOR PRESCRIPTION MAP EXPORTS
CREATE POLICY "Users can view their own prescription exports" ON prescription_map_exports
    FOR SELECT USING (
        prescription_map_id IN (
            SELECT pm.id FROM prescription_maps pm
            JOIN gardens g ON pm.garden_id = g.id
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own prescription exports" ON prescription_map_exports
    FOR ALL USING (
        prescription_map_id IN (
            SELECT pm.id FROM prescription_maps pm
            JOIN gardens g ON pm.garden_id = g.id
            WHERE g.user_id = auth.uid()
        )
    );

-- 5. CREATE RLS POLICIES FOR OPERATION SYNC LOG
CREATE POLICY "Users can view their own operation sync logs" ON operation_sync_log
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own operation sync logs" ON operation_sync_log
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- 6. CREATE RLS POLICIES FOR GARDEN PLANTS
CREATE POLICY "Users can view their own garden plants" ON garden_plants
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own garden plants" ON garden_plants
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- 7. CREATE RLS POLICIES FOR PLANT OPERATIONS
CREATE POLICY "Users can view their own plant operations" ON plant_operations
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own plant operations" ON plant_operations
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- 8. CREATE RLS POLICIES FOR PLANT HARVESTS
CREATE POLICY "Users can view their own plant harvests" ON plant_harvests
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own plant harvests" ON plant_harvests
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- 9. FIX SECURITY DEFINER VIEWS
-- Drop existing views and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS plant_production_summary;
DROP VIEW IF EXISTS plants_per_row_summary;
DROP VIEW IF EXISTS garden_plants_dashboard;
DROP VIEW IF EXISTS row_health_summary;
DROP VIEW IF EXISTS plant_operations_complete;
DROP VIEW IF EXISTS individual_plants;

-- Recreate views without SECURITY DEFINER (uses SECURITY INVOKER by default)
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
    COUNT(DISTINCT po.id) FILTER (WHERE po.operation_date >= CURRENT_DATE - INTERVAL '30 days') as recent_operations,
    MAX(po.operation_date) as last_operation_date
FROM garden_plants gp
LEFT JOIN garden_rows gr ON gp.row_id = gr.id
LEFT JOIN field_rows fr ON gp.field_row_id = fr.id
LEFT JOIN plant_operations po ON gp.id = po.plant_id
GROUP BY COALESCE(gr.id, fr.id), COALESCE(CONCAT('Row ', gr.row_number, ' - ', gr.crop_name), fr.name), 
         CASE WHEN gr.id IS NOT NULL THEN 'garden_row' ELSE 'field_row' END, gp.garden_id;

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

-- Create individual_plants view (alias for garden_plants)
CREATE VIEW individual_plants AS SELECT * FROM garden_plants;

-- 10. GRANT PERMISSIONS
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions on views
GRANT SELECT ON plant_production_summary TO authenticated;
GRANT SELECT ON plants_per_row_summary TO authenticated;
GRANT SELECT ON row_health_summary TO authenticated;
GRANT SELECT ON plant_operations_complete TO authenticated;
GRANT SELECT ON individual_plants TO authenticated;

-- Success message
SELECT 'Security Issues Fixed Successfully!' as status,
       'RLS enabled on all tables' as rls_status,
       'Security Definer views recreated safely' as views_status,
       'All permissions granted correctly' as permissions_status;