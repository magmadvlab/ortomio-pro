-- =====================================================
-- PRESCRIPTION MAPS SCHEMA
-- Sistema completo per generazione mappe prescrizione
-- =====================================================

-- 1. CREATE PRESCRIPTION MAPS TABLE
CREATE TABLE prescription_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Garden context
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  garden_name TEXT NOT NULL,
  
  -- Map metadata
  name TEXT NOT NULL,
  description TEXT,
  map_type TEXT NOT NULL CHECK (map_type IN ('fertilizer', 'seeding', 'irrigation', 'treatment', 'harvest')),
  
  -- Generation parameters
  generation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_source_period JSONB NOT NULL, -- {startDate, endDate}
  
  -- Data sources used
  data_sources JSONB NOT NULL DEFAULT '{}', -- {ndviData, plantLevelData, rowLevelData, soilData, weatherData}
  
  -- Zones summary
  total_zones INTEGER NOT NULL DEFAULT 0,
  total_area_sqm NUMERIC NOT NULL DEFAULT 0,
  
  -- Export formats available
  export_formats JSONB NOT NULL DEFAULT '{}', -- {shapefile, kml, isoxml, geojson, csv}
  
  -- Validation and quality
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'warning')),
  quality_score INTEGER NOT NULL DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  validation_errors JSONB,
  
  -- Cost analysis
  cost_analysis JSONB, -- Full cost analysis object
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID -- Could reference users table if available
);

-- 2. CREATE PRESCRIPTION ZONES TABLE
CREATE TABLE prescription_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_map_id UUID NOT NULL REFERENCES prescription_maps(id) ON DELETE CASCADE,
  
  -- Zone identification
  zone_number INTEGER NOT NULL,
  zone_name TEXT NOT NULL,
  zone_type TEXT NOT NULL DEFAULT 'uniform' CHECK (zone_type IN ('uniform', 'variable', 'exclusion')),
  
  -- Geographic data (stored as GeoJSON)
  geometry JSONB NOT NULL, -- GeoJSON Polygon
  centroid JSONB NOT NULL, -- {latitude, longitude}
  area_sqm NUMERIC NOT NULL,
  
  -- Prescription data
  prescription JSONB NOT NULL, -- Full prescription object
  
  -- Source data for this zone
  source_data JSONB NOT NULL DEFAULT '{}', -- {avgNdvi, plantCount, avgPlantHealth, etc.}
  
  -- Quality metrics
  data_quality INTEGER NOT NULL DEFAULT 0 CHECK (data_quality >= 0 AND data_quality <= 100),
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(prescription_map_id, zone_number)
);

-- 3. CREATE VARIABLE RATE APPLICATIONS TABLE
CREATE TABLE variable_rate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links to prescription
  prescription_map_id UUID NOT NULL REFERENCES prescription_maps(id) ON DELETE CASCADE,
  prescription_zone_id UUID REFERENCES prescription_zones(id) ON DELETE CASCADE,
  
  -- Application details
  application_date TIMESTAMPTZ NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT,
  
  -- Rate information
  planned_rate NUMERIC NOT NULL,
  actual_rate NUMERIC,
  unit TEXT NOT NULL,
  
  -- Application area
  area_applied_sqm NUMERIC,
  total_product_used NUMERIC,
  
  -- Machinery information
  machinery_used TEXT,
  operator_name TEXT,
  
  -- GPS tracking
  gps_track JSONB, -- Array of GPS points with timestamps
  application_accuracy NUMERIC, -- Percentage accuracy vs prescription
  
  -- Results and feedback
  application_quality INTEGER CHECK (application_quality >= 1 AND application_quality <= 5),
  notes TEXT,
  weather_conditions JSONB,
  
  -- Cost tracking
  product_cost NUMERIC,
  application_cost NUMERIC,
  total_cost NUMERIC,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CREATE MACHINERY COMPATIBILITY TABLE
CREATE TABLE machinery_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Machinery information
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tractor', 'sprayer', 'seeder', 'fertilizer_spreader', 'harvester')),
  
  -- Supported formats
  supported_formats JSONB NOT NULL DEFAULT '{}', -- {shapefile, kml, isoxml, etc.}
  
  -- Technical specifications
  gps_accuracy NUMERIC, -- meters
  variable_rate_capable BOOLEAN NOT NULL DEFAULT false,
  min_application_rate NUMERIC,
  max_application_rate NUMERIC,
  working_width NUMERIC, -- meters
  
  -- Integration details
  connection_type TEXT CHECK (connection_type IN ('usb', 'bluetooth', 'wifi', 'cellular', 'manual')),
  software_required TEXT,
  firmware_version TEXT,
  
  -- Validation status
  tested BOOLEAN NOT NULL DEFAULT false,
  last_tested_date DATE,
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  
  -- User feedback
  user_rating NUMERIC CHECK (user_rating >= 1 AND user_rating <= 5),
  user_comments JSONB, -- Array of comments
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(brand, model)
);

-- 5. CREATE PRESCRIPTION MAP EXPORTS TABLE
CREATE TABLE prescription_map_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links
  prescription_map_id UUID NOT NULL REFERENCES prescription_maps(id) ON DELETE CASCADE,
  
  -- Export details
  export_format TEXT NOT NULL CHECK (export_format IN ('shapefile', 'kml', 'isoxml', 'geojson', 'csv')),
  export_configuration JSONB NOT NULL, -- Full export config
  
  -- File information
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_path TEXT, -- Storage path
  download_url TEXT, -- Temporary download URL
  
  -- Export status
  export_status TEXT NOT NULL DEFAULT 'pending' CHECK (export_status IN ('pending', 'processing', 'completed', 'failed')),
  export_progress INTEGER DEFAULT 0 CHECK (export_progress >= 0 AND export_progress <= 100),
  error_message TEXT,
  
  -- Usage tracking
  download_count INTEGER NOT NULL DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  
  -- Expiration
  expires_at TIMESTAMPTZ, -- For temporary downloads
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CREATE NDVI DATA CACHE TABLE (for performance)
CREATE TABLE ndvi_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Geographic reference
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Spatial data
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  
  -- NDVI data
  ndvi_value NUMERIC NOT NULL CHECK (ndvi_value >= -1 AND ndvi_value <= 1),
  data_date DATE NOT NULL,
  data_quality INTEGER NOT NULL DEFAULT 100 CHECK (data_quality >= 0 AND data_quality <= 100),
  
  -- Source information
  data_source TEXT NOT NULL DEFAULT 'sentinel_hub',
  resolution_meters NUMERIC,
  
  -- Processing metadata
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Spatial index will be added below
  UNIQUE(garden_id, latitude, longitude, data_date)
);

-- 7. CREATE INDEXES FOR PERFORMANCE

-- Prescription maps indexes
CREATE INDEX idx_prescription_maps_garden_id ON prescription_maps(garden_id);
CREATE INDEX idx_prescription_maps_map_type ON prescription_maps(map_type);
CREATE INDEX idx_prescription_maps_generation_date ON prescription_maps(generation_date);
CREATE INDEX idx_prescription_maps_validation_status ON prescription_maps(validation_status);

-- Prescription zones indexes
CREATE INDEX idx_prescription_zones_map_id ON prescription_zones(prescription_map_id);
CREATE INDEX idx_prescription_zones_zone_number ON prescription_zones(prescription_map_id, zone_number);

-- Variable rate applications indexes
CREATE INDEX idx_variable_rate_applications_map_id ON variable_rate_applications(prescription_map_id);
CREATE INDEX idx_variable_rate_applications_zone_id ON variable_rate_applications(prescription_zone_id);
CREATE INDEX idx_variable_rate_applications_date ON variable_rate_applications(application_date);

-- Machinery compatibility indexes
CREATE INDEX idx_machinery_compatibility_type ON machinery_compatibility(type);
CREATE INDEX idx_machinery_compatibility_brand_model ON machinery_compatibility(brand, model);

-- Export tracking indexes
CREATE INDEX idx_prescription_map_exports_map_id ON prescription_map_exports(prescription_map_id);
CREATE INDEX idx_prescription_map_exports_format ON prescription_map_exports(export_format);
CREATE INDEX idx_prescription_map_exports_status ON prescription_map_exports(export_status);

-- NDVI cache indexes
CREATE INDEX idx_ndvi_data_cache_garden_id ON ndvi_data_cache(garden_id);
CREATE INDEX idx_ndvi_data_cache_date ON ndvi_data_cache(data_date);
CREATE INDEX idx_ndvi_data_cache_expires ON ndvi_data_cache(cache_expires_at);
CREATE INDEX idx_ndvi_data_cache_location ON ndvi_data_cache(latitude, longitude);

-- 8. CREATE FUNCTIONS FOR PRESCRIPTION MAP OPERATIONS

-- Function to calculate zone statistics
CREATE OR REPLACE FUNCTION calculate_zone_statistics(
  p_prescription_map_id UUID
) RETURNS TABLE (
  total_zones INTEGER,
  total_area NUMERIC,
  avg_quality_score NUMERIC,
  min_application_rate NUMERIC,
  max_application_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_zones,
    SUM(area_sqm) as total_area,
    AVG(data_quality) as avg_quality_score,
    MIN((prescription->>'applicationRate')::NUMERIC) as min_application_rate,
    MAX((prescription->>'applicationRate')::NUMERIC) as max_application_rate
  FROM prescription_zones
  WHERE prescription_map_id = p_prescription_map_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get NDVI data for area
CREATE OR REPLACE FUNCTION get_ndvi_data_for_area(
  p_garden_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_min_lat NUMERIC DEFAULT NULL,
  p_max_lat NUMERIC DEFAULT NULL,
  p_min_lon NUMERIC DEFAULT NULL,
  p_max_lon NUMERIC DEFAULT NULL
) RETURNS TABLE (
  latitude NUMERIC,
  longitude NUMERIC,
  ndvi_value NUMERIC,
  data_date DATE,
  data_quality INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ndc.latitude,
    ndc.longitude,
    ndc.ndvi_value,
    ndc.data_date,
    ndc.data_quality
  FROM ndvi_data_cache ndc
  WHERE ndc.garden_id = p_garden_id
    AND ndc.data_date BETWEEN p_start_date AND p_end_date
    AND ndc.cache_expires_at > NOW()
    AND (p_min_lat IS NULL OR ndc.latitude >= p_min_lat)
    AND (p_max_lat IS NULL OR ndc.latitude <= p_max_lat)
    AND (p_min_lon IS NULL OR ndc.longitude >= p_min_lon)
    AND (p_max_lon IS NULL OR ndc.longitude <= p_max_lon)
  ORDER BY ndc.data_date DESC, ndc.latitude, ndc.longitude;
END;
$$ LANGUAGE plpgsql;

-- Function to update prescription map statistics
CREATE OR REPLACE FUNCTION update_prescription_map_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total zones and area when zones are modified
  IF TG_TABLE_NAME = 'prescription_zones' THEN
    UPDATE prescription_maps 
    SET 
      total_zones = (
        SELECT COUNT(*) 
        FROM prescription_zones 
        WHERE prescription_map_id = COALESCE(NEW.prescription_map_id, OLD.prescription_map_id)
      ),
      total_area_sqm = (
        SELECT COALESCE(SUM(area_sqm), 0) 
        FROM prescription_zones 
        WHERE prescription_map_id = COALESCE(NEW.prescription_map_id, OLD.prescription_map_id)
      ),
      updated_at = NOW()
    WHERE id = COALESCE(NEW.prescription_map_id, OLD.prescription_map_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 9. CREATE TRIGGERS

-- Trigger to update prescription map statistics
CREATE TRIGGER trigger_update_prescription_map_stats
  AFTER INSERT OR UPDATE OR DELETE ON prescription_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_prescription_map_stats();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prescription_maps_updated_at
  BEFORE UPDATE ON prescription_maps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_prescription_zones_updated_at
  BEFORE UPDATE ON prescription_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_variable_rate_applications_updated_at
  BEFORE UPDATE ON variable_rate_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_machinery_compatibility_updated_at
  BEFORE UPDATE ON machinery_compatibility
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_prescription_map_exports_updated_at
  BEFORE UPDATE ON prescription_map_exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. INSERT SAMPLE MACHINERY COMPATIBILITY DATA
INSERT INTO machinery_compatibility (
  brand, model, type, supported_formats, gps_accuracy, variable_rate_capable,
  min_application_rate, max_application_rate, working_width, connection_type,
  tested, compatibility_score
) VALUES 
-- John Deere
('John Deere', '8R Series', 'tractor', '{"shapefile": true, "isoxml": true, "kml": false, "geojson": false, "csv": true}', 0.3, true, 10, 500, 12, 'usb', true, 95),
('John Deere', 'R4030', 'sprayer', '{"shapefile": true, "isoxml": true, "kml": false, "geojson": false, "csv": true}', 0.2, true, 5, 200, 24, 'usb', true, 98),

-- Case IH
('Case IH', 'Magnum', 'tractor', '{"shapefile": true, "isoxml": true, "kml": true, "geojson": false, "csv": true}', 0.5, true, 15, 400, 10, 'usb', true, 90),
('Case IH', 'FLX4510', 'sprayer', '{"shapefile": true, "isoxml": true, "kml": true, "geojson": false, "csv": true}', 0.3, true, 8, 180, 30, 'usb', true, 92),

-- New Holland
('New Holland', 'T8', 'tractor', '{"shapefile": true, "isoxml": true, "kml": true, "geojson": true, "csv": true}', 0.4, true, 12, 450, 11, 'bluetooth', true, 88),

-- Fendt
('Fendt', '1000 Vario', 'tractor', '{"shapefile": true, "isoxml": true, "kml": false, "geojson": false, "csv": true}', 0.2, true, 8, 600, 14, 'usb', true, 96),

-- Massey Ferguson
('Massey Ferguson', '8S', 'tractor', '{"shapefile": true, "isoxml": false, "kml": true, "geojson": false, "csv": true}', 0.6, false, 20, 300, 9, 'manual', true, 75),

-- Generic/Universal
('Generic', 'GPS Universal', 'tractor', '{"shapefile": true, "isoxml": false, "kml": true, "geojson": true, "csv": true}', 1.0, false, 0, 1000, 0, 'manual', true, 60);

-- 11. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE prescription_maps IS 'Main table for prescription maps with metadata and generation parameters';
COMMENT ON TABLE prescription_zones IS 'Individual zones within prescription maps with geographic and prescription data';
COMMENT ON TABLE variable_rate_applications IS 'Tracking of actual applications based on prescription maps';
COMMENT ON TABLE machinery_compatibility IS 'Database of agricultural machinery and their format compatibility';
COMMENT ON TABLE prescription_map_exports IS 'Tracking of exported prescription maps in various formats';
COMMENT ON TABLE ndvi_data_cache IS 'Cached NDVI data for performance optimization';

COMMENT ON FUNCTION calculate_zone_statistics(UUID) IS 'Calculate summary statistics for zones in a prescription map';
COMMENT ON FUNCTION get_ndvi_data_for_area(UUID, DATE, DATE, NUMERIC, NUMERIC, NUMERIC, NUMERIC) IS 'Retrieve NDVI data for a specific area and time period';

-- Migration completed successfully
SELECT 'Prescription Maps Schema Created Successfully' as status;