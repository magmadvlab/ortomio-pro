CREATE SCHEMA auth;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE anon NOLOGIN;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE TABLE gardens (id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id));
CREATE TABLE ndvi_data_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), garden_id uuid NOT NULL REFERENCES gardens(id),
  latitude numeric NOT NULL, longitude numeric NOT NULL, ndvi_value numeric NOT NULL CHECK (ndvi_value BETWEEN -1 AND 1),
  data_date date NOT NULL, data_quality integer NOT NULL DEFAULT 100, data_source text NOT NULL DEFAULT 'sentinel_hub',
  resolution_meters numeric, processed_at timestamptz DEFAULT now(), cache_expires_at timestamptz DEFAULT now() + interval '7 days',
  UNIQUE(garden_id, latitude, longitude, data_date)
);
CREATE TABLE prescription_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), garden_id uuid NOT NULL REFERENCES gardens(id), garden_name text NOT NULL,
  name text NOT NULL, description text, map_type text NOT NULL, generation_date timestamptz NOT NULL DEFAULT now(),
  data_source_period jsonb NOT NULL, data_sources jsonb NOT NULL DEFAULT '{}', total_zones integer NOT NULL DEFAULT 0,
  total_area_sqm numeric NOT NULL DEFAULT 0, export_formats jsonb NOT NULL DEFAULT '{}', validation_status text NOT NULL DEFAULT 'pending',
  quality_score integer NOT NULL DEFAULT 0, data_completeness integer NOT NULL DEFAULT 0, validation_errors jsonb, cost_analysis jsonb,
  version_number integer NOT NULL DEFAULT 1, version_label text, root_version_id uuid, parent_version_id uuid,
  export_count integer NOT NULL DEFAULT 0, created_by uuid, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE prescription_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), prescription_map_id uuid NOT NULL REFERENCES prescription_maps(id) ON DELETE CASCADE,
  zone_number integer NOT NULL, zone_name text NOT NULL, zone_type text NOT NULL, geometry jsonb NOT NULL, centroid jsonb NOT NULL,
  area_sqm numeric NOT NULL, prescription jsonb NOT NULL, source_data jsonb NOT NULL DEFAULT '{}', data_quality integer NOT NULL DEFAULT 0,
  confidence integer NOT NULL DEFAULT 0, UNIQUE(prescription_map_id, zone_number)
);
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
INSERT INTO gardens VALUES
 ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002');
ALTER TABLE prescription_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY map_owner ON prescription_maps FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()))
 WITH CHECK (created_by = auth.uid() AND EXISTS (SELECT 1 FROM gardens g WHERE g.id = garden_id AND g.user_id = auth.uid()));
CREATE POLICY zone_owner ON prescription_zones FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM prescription_maps m JOIN gardens g ON g.id=m.garden_id WHERE m.id=prescription_map_id AND g.user_id=auth.uid()))
 WITH CHECK (EXISTS (SELECT 1 FROM prescription_maps m JOIN gardens g ON g.id=m.garden_id WHERE m.id=prescription_map_id AND g.user_id=auth.uid()));
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
GRANT SELECT ON gardens TO authenticated;
GRANT SELECT, INSERT, UPDATE ON prescription_maps, prescription_zones TO authenticated;
