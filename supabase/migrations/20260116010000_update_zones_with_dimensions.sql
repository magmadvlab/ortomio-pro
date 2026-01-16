-- =====================================================
-- ZONE DIMENSIONS AND FIELD ROW RELATIONSHIPS
-- =====================================================
-- Aggiorna garden_zones per includere dimensioni e migliora relazioni con field_rows

-- STEP 0: Aggiungi colonne a field_rows PRIMA di creare funzioni/viste che le usano
DO $
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
END $;

-- 1. Aggiungi colonna area_sqm se non esiste
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS area_sqm DECIMAL(10,2);

-- 2. Aggiungi colonne per geometria e coordinate (opzionale per future features)
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS perimeter_meters DECIMAL(10,2);
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS shape_type TEXT CHECK (shape_type IN ('rectangle', 'circle', 'polygon', 'irregular'));
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS coordinates JSONB; -- Per memorizzare coordinate poligono

-- 3. Aggiungi colonne per caratteristiche agronomiche
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS soil_type TEXT;
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS irrigation_type TEXT CHECK (irrigation_type IN ('drip', 'sprinkler', 'flood', 'manual', 'none'));
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS sun_exposure TEXT CHECK (sun_exposure IN ('full_sun', 'partial_shade', 'full_shade'));
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS slope_percentage DECIMAL(5,2);

-- 4. Aggiungi colonne per tracking
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Funzione per calcolare area da field rows
CREATE OR REPLACE FUNCTION calculate_zone_area_from_rows(zone_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_area DECIMAL(10,2);
BEGIN
  -- Calcola area totale sommando (lunghezza × larghezza) di tutti i filari
  SELECT COALESCE(SUM(length_meters * COALESCE(row_width_meters, 1.0)), 0)
  INTO total_area
  FROM field_rows
  WHERE zone_id = calculate_zone_area_from_rows.zone_id
  AND is_active = true;
  
  RETURN total_area;
END;
$$ LANGUAGE plpgsql;

-- 6. Funzione per aggiornare automaticamente area zona quando cambiano i filari
CREATE OR REPLACE FUNCTION auto_update_zone_area()
RETURNS TRIGGER AS $$
BEGIN
  -- Aggiorna area della zona quando un filare viene modificato
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

-- 7. Trigger per aggiornamento automatico area
DROP TRIGGER IF EXISTS auto_update_zone_area_on_row_change ON field_rows;
CREATE TRIGGER auto_update_zone_area_on_row_change
  AFTER INSERT OR UPDATE OR DELETE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_zone_area();

-- 8. Vista completa zone con statistiche
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

-- 9. Funzione per creare zone standard per un giardino
CREATE OR REPLACE FUNCTION create_standard_zones_for_garden(p_garden_id UUID)
RETURNS VOID AS $$
DECLARE
  garden_area DECIMAL(10,2);
  zone_names TEXT[] := ARRAY['Zona Nord', 'Zona Sud', 'Zona Est', 'Zona Ovest'];
  zone_name TEXT;
BEGIN
  -- Ottieni area giardino
  SELECT size_sq_meters INTO garden_area FROM gardens WHERE id = p_garden_id;
  
  IF garden_area IS NULL THEN
    RAISE EXCEPTION 'Garden not found';
  END IF;
  
  -- Crea 4 zone standard
  FOREACH zone_name IN ARRAY zone_names LOOP
    INSERT INTO garden_zones (
      garden_id,
      name,
      area_sqm,
      is_active
    ) VALUES (
      p_garden_id,
      zone_name,
      garden_area / 4.0, -- Dividi area equamente
      true
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 10. Aggiorna zone esistenti con area calcolata dai filari
DO $$
DECLARE
  zone_record RECORD;
BEGIN
  FOR zone_record IN SELECT id FROM garden_zones WHERE area_sqm IS NULL LOOP
    UPDATE garden_zones 
    SET area_sqm = calculate_zone_area_from_rows(zone_record.id)
    WHERE id = zone_record.id;
  END LOOP;
END $$;

-- 11. Aggiungi vincoli
ALTER TABLE garden_zones ADD CONSTRAINT valid_area CHECK (area_sqm IS NULL OR area_sqm >= 0);
ALTER TABLE garden_zones ADD CONSTRAINT valid_perimeter CHECK (perimeter_meters IS NULL OR perimeter_meters >= 0);
ALTER TABLE garden_zones ADD CONSTRAINT valid_slope CHECK (slope_percentage IS NULL OR (slope_percentage >= 0 AND slope_percentage <= 100));

-- 12. Indici per performance
CREATE INDEX IF NOT EXISTS idx_garden_zones_area ON garden_zones(area_sqm);
CREATE INDEX IF NOT EXISTS idx_garden_zones_active ON garden_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_garden_zones_irrigation ON garden_zones(irrigation_type);
CREATE INDEX IF NOT EXISTS idx_garden_zones_sun ON garden_zones(sun_exposure);

-- 13. Funzione per validare che i filari non eccedano l'area della zona
CREATE OR REPLACE FUNCTION validate_field_row_fits_in_zone()
RETURNS TRIGGER AS $$
DECLARE
  zone_area DECIMAL(10,2);
  total_rows_area DECIMAL(10,2);
BEGIN
  -- Ottieni area zona
  SELECT area_sqm INTO zone_area 
  FROM garden_zones 
  WHERE id = NEW.zone_id;
  
  -- Se zona non ha area definita, skip validation
  IF zone_area IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calcola area totale filari (incluso quello nuovo)
  SELECT COALESCE(SUM(length_meters * COALESCE(row_width_meters, 1.0)), 0) + 
         (NEW.length_meters * COALESCE(NEW.row_width_meters, 1.0))
  INTO total_rows_area
  FROM field_rows
  WHERE zone_id = NEW.zone_id
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND is_active = true;
  
  -- Verifica che non ecceda area zona (con margine 10%)
  IF total_rows_area > zone_area * 1.1 THEN
    RAISE WARNING 'I filari eccedono l''area della zona (%.2f m² > %.2f m²)', total_rows_area, zone_area;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Trigger per validazione (warning only, non blocca)
DROP TRIGGER IF EXISTS validate_field_row_area ON field_rows;
CREATE TRIGGER validate_field_row_area
  BEFORE INSERT OR UPDATE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION validate_field_row_fits_in_zone();

-- 15. Vista per zone con utilizzo area
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

-- 16. Funzione per ottimizzare layout filari in una zona
CREATE OR REPLACE FUNCTION suggest_field_row_layout(
  p_zone_id UUID,
  p_row_spacing_meters DECIMAL DEFAULT 1.5,
  p_row_width_meters DECIMAL DEFAULT 1.0
) RETURNS TABLE (
  suggested_row_count INTEGER,
  suggested_row_length DECIMAL,
  total_area_used DECIMAL,
  area_efficiency_percentage DECIMAL
) AS $$
DECLARE
  zone_area DECIMAL(10,2);
  zone_shape TEXT;
BEGIN
  -- Ottieni info zona
  SELECT area_sqm, shape_type INTO zone_area, zone_shape
  FROM garden_zones
  WHERE id = p_zone_id;
  
  IF zone_area IS NULL THEN
    RAISE EXCEPTION 'Zone not found or has no area defined';
  END IF;
  
  -- Calcolo semplificato per forma rettangolare
  -- Assumiamo zona quadrata per semplicità
  RETURN QUERY
  SELECT 
    FLOOR(SQRT(zone_area) / (p_row_spacing_meters + p_row_width_meters))::INTEGER as suggested_row_count,
    SQRT(zone_area) as suggested_row_length,
    (FLOOR(SQRT(zone_area) / (p_row_spacing_meters + p_row_width_meters)) * SQRT(zone_area) * p_row_width_meters) as total_area_used,
    ROUND(((FLOOR(SQRT(zone_area) / (p_row_spacing_meters + p_row_width_meters)) * SQRT(zone_area) * p_row_width_meters) / zone_area * 100)::numeric, 2) as area_efficiency_percentage;
END;
$$ LANGUAGE plpgsql;

-- 17. Commenti per documentazione
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
