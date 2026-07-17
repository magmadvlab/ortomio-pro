-- P6: provenance NDVI reale e isolamento dei dati remoti.
ALTER TABLE public.ndvi_data_cache
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS acquisition_from timestamptz,
  ADD COLUMN IF NOT EXISTS acquisition_to timestamptz,
  ADD COLUMN IF NOT EXISTS bbox jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS cloud_cover_pct numeric CHECK (cloud_cover_pct BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS masked_pixel_pct numeric CHECK (masked_pixel_pct BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS cloud_cover_filter_max numeric CHECK (cloud_cover_filter_max BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS algorithm_version text,
  ADD COLUMN IF NOT EXISTS quality_status text DEFAULT 'warning' CHECK (quality_status IN ('accepted', 'warning', 'rejected')),
  ADD COLUMN IF NOT EXISTS source_kind text DEFAULT 'estimated' CHECK (source_kind IN ('real', 'estimated', 'simulated', 'fallback')),
  ADD COLUMN IF NOT EXISTS statistics jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS input_hash text CHECK (input_hash IS NULL OR char_length(input_hash) = 64);

UPDATE public.ndvi_data_cache cache
SET user_id = garden.user_id
FROM public.gardens garden
WHERE garden.id = cache.garden_id AND cache.user_id IS NULL;
ALTER TABLE public.ndvi_data_cache ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ndvi_cache_provenance ON public.ndvi_data_cache (garden_id, source_kind, quality_status, data_date DESC);
ALTER TABLE public.ndvi_data_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ndvi_cache_owner ON public.ndvi_data_cache;
CREATE POLICY ndvi_cache_owner ON public.ndvi_data_cache FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()))
WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));
GRANT SELECT, INSERT, UPDATE ON public.ndvi_data_cache TO authenticated;

ALTER TABLE public.prescription_maps
  ADD COLUMN IF NOT EXISTS algorithm_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS content_checksum text CHECK (content_checksum IS NULL OR char_length(content_checksum) = 64);

CREATE OR REPLACE FUNCTION public.create_prescription_map_atomic(p_map jsonb, p_zones jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE v_map_id uuid;
BEGIN
  IF jsonb_typeof(p_zones) <> 'array' OR jsonb_array_length(p_zones) = 0 THEN
    RAISE EXCEPTION 'prescription_zones_required';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_zones) zone
    WHERE jsonb_typeof(zone->'geometry') <> 'object'
      OR zone->'geometry'->>'type' <> 'Polygon'
      OR jsonb_typeof(zone->'geometry'->'coordinates') <> 'array'
      OR jsonb_array_length(zone->'geometry'->'coordinates') = 0
      OR COALESCE((zone->>'area_sqm')::numeric, 0) <= 0
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'invalid_prescription_zone_geometry';
  END IF;
  INSERT INTO public.prescription_maps (
    garden_id, garden_name, name, description, map_type, generation_date,
    data_source_period, data_sources, total_zones, total_area_sqm, export_formats,
    validation_status, quality_score, data_completeness, validation_errors,
    cost_analysis, version_number, version_label, root_version_id, parent_version_id,
    export_count, algorithm_metadata, content_checksum, created_by
  ) VALUES (
    (p_map->>'garden_id')::uuid, p_map->>'garden_name', p_map->>'name', p_map->>'description', p_map->>'map_type',
    COALESCE((p_map->>'generation_date')::timestamptz, now()), p_map->'data_source_period', p_map->'data_sources',
    jsonb_array_length(p_zones), COALESCE((p_map->>'total_area_sqm')::numeric, 0), COALESCE(p_map->'export_formats', '{}'::jsonb),
    COALESCE(p_map->>'validation_status', 'pending'), COALESCE((p_map->>'quality_score')::integer, 0),
    COALESCE((p_map->>'data_completeness')::integer, 0), p_map->'validation_errors', p_map->'cost_analysis',
    COALESCE((p_map->>'version_number')::integer, 1), p_map->>'version_label',
    NULLIF(p_map->>'root_version_id', '')::uuid, NULLIF(p_map->>'parent_version_id', '')::uuid,
    COALESCE((p_map->>'export_count')::integer, 0), COALESCE(p_map->'algorithm_metadata', '{}'::jsonb),
    p_map->>'content_checksum', auth.uid()
  ) RETURNING id INTO v_map_id;

  INSERT INTO public.prescription_zones (
    prescription_map_id, zone_number, zone_name, zone_type, geometry, centroid,
    area_sqm, prescription, source_data, data_quality, confidence
  )
  SELECT v_map_id, COALESCE((zone->>'zone_number')::integer, ordinality::integer), zone->>'zone_name',
    COALESCE(zone->>'zone_type', 'uniform'), zone->'geometry', zone->'centroid', (zone->>'area_sqm')::numeric,
    zone->'prescription', COALESCE(zone->'source_data', '{}'::jsonb), COALESCE((zone->>'data_quality')::integer, 0),
    COALESCE((zone->>'confidence')::integer, 0)
  FROM jsonb_array_elements(p_zones) WITH ORDINALITY AS items(zone, ordinality);
  RETURN v_map_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_prescription_map_atomic(jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_prescription_map_atomic(jsonb, jsonb) TO authenticated;
