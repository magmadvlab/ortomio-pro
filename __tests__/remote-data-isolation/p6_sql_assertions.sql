SET ROLE authenticated;
SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
INSERT INTO ndvi_data_cache (
  garden_id, user_id, latitude, longitude, ndvi_value, data_date, data_quality,
  source_kind, quality_status, algorithm_version, input_hash
) VALUES (
  '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
  41.95, 12.55, 0.62, '2026-07-17', 95, 'real', 'accepted', 'sentinel-statistics-ndvi-v1', repeat('a', 64)
);
DO $$ BEGIN
  BEGIN
    INSERT INTO ndvi_data_cache (garden_id, user_id, latitude, longitude, ndvi_value, data_date, source_kind, quality_status)
    VALUES ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 42, 12, 0.5, '2026-07-17', 'real', 'accepted');
    RAISE EXCEPTION 'foreign NDVI accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;

SELECT create_prescription_map_atomic(
  '{"garden_id":"10000000-0000-0000-0000-000000000001","garden_name":"Garden","name":"Map","map_type":"irrigation","data_source_period":{"startDate":"2026-07-01","endDate":"2026-07-17"},"data_sources":{"ndviData":true},"total_area_sqm":1000,"quality_score":90,"data_completeness":95,"algorithm_metadata":{"algorithmVersion":"v2"},"content_checksum":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}'::jsonb,
  '[{"zone_number":1,"zone_name":"Z1","zone_type":"variable","geometry":{"type":"Polygon","coordinates":[[[12.5,41.9],[12.6,41.9],[12.6,42.0],[12.5,41.9]]]},"centroid":{"latitude":41.95,"longitude":12.55},"area_sqm":1000,"prescription":{"applicationRate":10,"unit":"L/ha"},"source_data":{"avgNdvi":0.62},"data_quality":95,"confidence":90}]'::jsonb
);
DO $$
DECLARE before_count integer; after_count integer;
BEGIN
  SELECT count(*) INTO before_count FROM prescription_maps;
  BEGIN
    PERFORM create_prescription_map_atomic(
      '{"garden_id":"10000000-0000-0000-0000-000000000001","garden_name":"Garden","name":"Broken","map_type":"irrigation","data_source_period":{},"data_sources":{},"total_area_sqm":100}'::jsonb,
      '[{"zone_number":1,"zone_name":"Broken","zone_type":"variable","geometry":null,"centroid":{},"prescription":{}}]'::jsonb
    );
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  SELECT count(*) INTO after_count FROM prescription_maps;
  IF before_count <> after_count THEN RAISE EXCEPTION 'atomic RPC left orphan map'; END IF;
END $$;
RESET ROLE;
SELECT 'P6 SQL assertions passed' AS result;
