-- =====================================================
-- ZONE DIMENSIONS AND FIELD ROW RELATIONSHIPS - V2 FIXED
-- =====================================================
-- Aggiorna garden_zones per includere dimensioni e migliora relazioni con field_rows

-- STEP 0: Drop viste che dipendono da garden_zones
DROP VIEW IF EXISTS garden_zones_with_stats CASCADE;
DROP VIEW IF EXISTS garden_zones_area_usage CASCADE;

-- STEP 1: Aggiungi colonne a field_rows PRIMA di creare funzioni/viste
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'field_rows' AND column_name = 'row_width_meters') THEN
    ALTER TABLE field_rows ADD COLUMN row_width_meters DECIMAL(5,2) DEFAULT 1.0;
    COMMENT ON COLUMN field_rows.row_width_meters IS 'Larghezza del filare in metri';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'field_rows' AND column_name = 'plant_spacing_cm') THEN
    ALTER TABLE field_rows ADD COLUMN plant_spacing_cm INTEGER;
    COMMENT ON COLUMN field_rows.plant_spacing_cm IS 'Sesto di impianto in centimetri';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'field_rows' AND column_name = 'plant_count') THEN
    ALTER TABLE field_rows ADD COLUMN plant_count INTEGER;
    COMMENT ON COLUMN field_rows.plant_count IS 'Numero di piante nel filare';
  END IF;
END $$;

-- STEP 2: Aggiungi colonne a garden_zones
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'area_sqm') THEN
    ALTER TABLE garden_zones ADD COLUMN area_sqm DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'perimeter_meters') THEN
    ALTER TABLE garden_zones ADD COLUMN perimeter_meters DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'shape_type') THEN
    ALTER TABLE garden_zones ADD COLUMN shape_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'coordinates') THEN
    ALTER TABLE garden_zones ADD COLUMN coordinates JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'soil_type') THEN
    ALTER TABLE garden_zones ADD COLUMN soil_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'irrigation_type') THEN
    ALTER TABLE garden_zones ADD COLUMN irrigation_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'sun_exposure') THEN
    ALTER TABLE garden_zones ADD COLUMN sun_exposure TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'slope_percentage') THEN
    ALTER TABLE garden_zones ADD COLUMN slope_percentage DECIMAL(5,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'is_active') THEN
    ALTER TABLE garden_zones ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'garden_zones' AND column_name = 'notes') THEN
    ALTER TABLE garden_zones ADD COLUMN notes TEXT;
  END IF;
END $$;

-- STEP 3: Aggiungi CHECK constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'garden_zones_shape_type_check') THEN
    ALTER TABLE garden_zones ADD CONSTRAINT garden_zones_shape_type_check 
      CHECK (shape_type IS NULL OR shape_type IN ('rectangle', 'circle', 'polygon', 'irregular'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'garden_zones_irrigation_type_check') THEN
    ALTER TABLE garden_zones ADD CONSTRAINT garden_zones_irrigation_type_check 
      CHECK (irrigation_type IS NULL OR irrigation_type IN ('drip', 'sprinkler', 'flood', 'manual', 'none'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'garden_zones_sun_exposure_check') THEN
    ALTER TABLE garden_zones ADD CONSTRAINT garden_zones_sun_exposure_check 
      CHECK (sun_exposure IS NULL OR sun_exposure IN ('full_sun', 'partial_shade', 'full_shade'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_area') THEN
    ALTER TABLE garden_zones ADD CONSTRAINT valid_area CHECK (area_sqm IS NULL OR area_sqm >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_perimeter') THEN
    ALTER TABLE garden_zones ADD CONSTRAINT valid_perimeter CHECK (perimeter_meters IS NULL OR perimeter_meters >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_slope') THEN
    ALTER TABLE garden_zones ADD CONSTRAINT valid_slope CHECK (slope_percentage IS NULL OR (slope_percentage >= 0 AND slope_percentage <= 100));
  END IF;
END $$;

-- STEP 4: Funzione per calcolare area da field rows
CREATE OR REPLACE FUNCTION calculate_zone_area_from_rows(zone_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_area DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(length_meters * COALESCE(row_width_meters, 1.0)), 0)
  INTO total_area
  FROM field_rows
  WHERE zone_id = calculate_zone_area_from_rows.zone_id
  AND is_active = true;
  
  RETURN total_area;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Funzione per aggiornare automaticamente area zona
CREATE OR REPLACE FUNCTION auto_update_zone_area()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE garden_zones 
    SET area_sqm = calculate_zone_area_from_rows(OLD.zone_id),
        updated_at = NOW()
    WHERE id = OLD.zone_id;
    RETURN OLD;
  ELSE
    UPDATE garden_zones 
    SET area_sqm = calculate_zone_area_from_rows(NEW.zone_id),
        updated_at = NOW()
    WHERE id = NEW.zone_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Trigger per aggiornamento automatico area
DROP TRIGGER IF EXISTS auto_update_zone_area_on_row_change ON field_rows;
CREATE TRIGGER auto_update_zone_area_on_row_change
  AFTER INSERT OR UPDATE OR DELETE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_zone_area();

-- STEP 7: Vista completa zone con statistiche
CREATE OR REPLACE VIEW garden_zones_with_stats AS
SELECT 
  gz.*,
  COUNT(DISTINCT fr.id) as field_row_count,
  COALESCE(SUM(fr.length_meters), 0) as total_row_length,
  COUNT(DISTINCT frs.id) as section_count,
  g.name as garden_name
FROM garden_zones gz
LEFT JOIN gardens g ON gz.garden_id = g.id
LEFT JOIN field_rows fr ON fr.zone_id = gz.id AND fr.is_active = true
LEFT JOIN field_row_sections frs ON frs.field_row_id = fr.id AND frs.is_active = true
GROUP BY gz.id, g.name;

-- STEP 8: Vista utilizzo area
CREATE OR REPLACE VIEW garden_zones_area_usage AS
SELECT 
  gz.id,
  gz.name,
  gz.garden_id,
  gz.area_sqm as total_area,
  COALESCE(SUM(fr.length_meters * COALESCE(fr.row_width_meters, 1.0)), 0) as used_area,
  gz.area_sqm - COALESCE(SUM(fr.length_meters * COALESCE(fr.row_width_meters, 1.0)), 0) as available_area,
  CASE 
    WHEN gz.area_sqm > 0 THEN 
      ROUND((COALESCE(SUM(fr.length_meters * COALESCE(fr.row_width_meters, 1.0)), 0) / gz.area_sqm * 100)::numeric, 2)
    ELSE 0
  END as usage_percentage,
  COUNT(fr.id) as field_row_count
FROM garden_zones gz
LEFT JOIN field_rows fr ON fr.zone_id = gz.id AND fr.is_active = true
GROUP BY gz.id, gz.name, gz.garden_id, gz.area_sqm;

-- STEP 9: Indici per performance
CREATE INDEX IF NOT EXISTS idx_garden_zones_area ON garden_zones(area_sqm);
CREATE INDEX IF NOT EXISTS idx_garden_zones_active ON garden_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_garden_zones_irrigation ON garden_zones(irrigation_type);
CREATE INDEX IF NOT EXISTS idx_garden_zones_sun ON garden_zones(sun_exposure);

-- STEP 10: Commenti per documentazione
COMMENT ON COLUMN garden_zones.area_sqm IS 'Area della zona in metri quadrati (calcolata automaticamente dai filari o inserita manualmente)';
COMMENT ON COLUMN garden_zones.perimeter_meters IS 'Perimetro della zona in metri';
COMMENT ON COLUMN garden_zones.shape_type IS 'Forma geometrica della zona (rectangle, circle, polygon, irregular)';
COMMENT ON COLUMN garden_zones.coordinates IS 'Coordinate JSON del poligono della zona per visualizzazione su mappa';
COMMENT ON COLUMN garden_zones.soil_type IS 'Tipo di terreno predominante nella zona';
COMMENT ON COLUMN garden_zones.irrigation_type IS 'Tipo di irrigazione utilizzato nella zona';
COMMENT ON COLUMN garden_zones.sun_exposure IS 'Esposizione solare della zona';
COMMENT ON COLUMN garden_zones.slope_percentage IS 'Pendenza del terreno in percentuale';
COMMENT ON VIEW garden_zones_with_stats IS 'Vista completa zone con statistiche filari e sezioni';
COMMENT ON VIEW garden_zones_area_usage IS 'Vista utilizzo area zone con percentuale occupazione';
