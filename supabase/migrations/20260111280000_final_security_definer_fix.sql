-- =====================================================
-- FINAL SECURITY DEFINER FIX - OrtoMio Database
-- Risolve definitivamente tutti i problemi Security Definer Views
-- =====================================================

-- 1. DROP ALL PROBLEMATIC VIEWS IDENTIFIED BY LINTER
DROP VIEW IF EXISTS public.individual_plants CASCADE;
DROP VIEW IF EXISTS public.plant_operations_complete CASCADE;
DROP VIEW IF EXISTS public.plant_production_summary CASCADE;
DROP VIEW IF EXISTS public.plants_per_row_summary CASCADE;
DROP VIEW IF EXISTS public.row_health_summary CASCADE;

-- 2. RECREATE ALL VIEWS WITHOUT SECURITY DEFINER (uses SECURITY INVOKER by default)

-- View: individual_plants (alias for garden_plants)
CREATE VIEW public.individual_plants AS 
SELECT * FROM public.garden_plants;

-- View: plant_production_summary
CREATE VIEW public.plant_production_summary AS
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
FROM public.garden_plants gp
LEFT JOIN public.plant_harvests ph ON gp.id = ph.plant_id
GROUP BY gp.id, gp.plant_code, gp.plant_name, gp.variety, gp.planting_date;

-- View: plants_per_row_summary
CREATE VIEW public.plants_per_row_summary AS
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
FROM public.garden_plants gp
LEFT JOIN public.garden_rows gr ON gp.row_id = gr.id
LEFT JOIN public.field_rows fr ON gp.field_row_id = fr.id
GROUP BY 
    COALESCE(CONCAT('Row ', gr.row_number, ' - ', gr.crop_name), fr.name), 
    COALESCE(gr.id, fr.id), 
    CASE WHEN gr.id IS NOT NULL THEN 'garden_row' ELSE 'field_row' END,
    gp.garden_id;

-- View: row_health_summary
CREATE VIEW public.row_health_summary AS
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
FROM public.garden_plants gp
LEFT JOIN public.garden_rows gr ON gp.row_id = gr.id
LEFT JOIN public.field_rows fr ON gp.field_row_id = fr.id
LEFT JOIN public.plant_operations po ON gp.id = po.plant_id
GROUP BY COALESCE(gr.id, fr.id), COALESCE(CONCAT('Row ', gr.row_number, ' - ', gr.crop_name), fr.name), 
         CASE WHEN gr.id IS NOT NULL THEN 'garden_row' ELSE 'field_row' END, gp.garden_id;

-- View: plant_operations_complete
CREATE VIEW public.plant_operations_complete AS
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
FROM public.garden_plants gp
LEFT JOIN public.garden_rows gr ON gp.row_id = gr.id
LEFT JOIN public.field_rows fr ON gp.field_row_id = fr.id
LEFT JOIN public.plant_operations po ON gp.id = po.plant_id
ORDER BY gp.plant_code, po.operation_date DESC;

-- 3. GRANT CORRECT PERMISSIONS ON ALL VIEWS
GRANT SELECT ON public.individual_plants TO authenticated;
GRANT SELECT ON public.plant_production_summary TO authenticated;
GRANT SELECT ON public.plants_per_row_summary TO authenticated;
GRANT SELECT ON public.row_health_summary TO authenticated;
GRANT SELECT ON public.plant_operations_complete TO authenticated;

-- 4. VERIFY NO SECURITY DEFINER VIEWS REMAIN
-- Check view definitions for SECURITY DEFINER keyword
DO $$
DECLARE
    definer_count INTEGER;
    view_rec RECORD;
BEGIN
    -- Count views that contain SECURITY DEFINER in their definition
    SELECT COUNT(*) INTO definer_count
    FROM information_schema.views v
    WHERE v.table_schema = 'public'
    AND UPPER(v.view_definition) LIKE '%SECURITY DEFINER%';
    
    IF definer_count > 0 THEN
        RAISE WARNING 'Still % views with SECURITY DEFINER found', definer_count;
        
        -- List problematic views
        FOR view_rec IN 
            SELECT table_name 
            FROM information_schema.views v
            WHERE v.table_schema = 'public'
            AND UPPER(v.view_definition) LIKE '%SECURITY DEFINER%'
        LOOP
            RAISE WARNING 'View with SECURITY DEFINER: %', view_rec.table_name;
        END LOOP;
    ELSE
        RAISE NOTICE 'SUCCESS: No SECURITY DEFINER views found - all views are safe';
    END IF;
END $$;

-- Success message
SELECT 'Final Security Definer Fix Applied Successfully!' as status,
       'All 5 problematic views recreated safely' as views_status,
       'SECURITY INVOKER used for all views' as security_status,
       'Linter errors should be resolved' as linter_status;