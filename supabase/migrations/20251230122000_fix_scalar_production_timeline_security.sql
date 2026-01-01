-- ============================================
-- Fix Security Definer View: scalar_production_timeline
-- ============================================

DROP VIEW IF EXISTS public.scalar_production_timeline;

CREATE VIEW public.scalar_production_timeline
WITH (security_invoker = true)
AS
SELECT
  pb.garden_id,
  pb.field_row_id,
  fr.zone_id,
  pb.batch_number,
  pb.plant_name,
  pb.variety,
  pb.plants_count,
  pb.sowing_date,
  pb.transplanting_date,
  pb.expected_harvest_date,
  pb.status,
  pb.current_quantity,
  fr.name as field_row_name,
  gz.name as zone_name
FROM planting_batches pb
JOIN field_rows fr ON fr.id = pb.field_row_id
LEFT JOIN garden_zones gz ON gz.id = fr.zone_id
ORDER BY
  COALESCE(pb.sowing_date, pb.transplanting_date, pb.expected_harvest_date);
