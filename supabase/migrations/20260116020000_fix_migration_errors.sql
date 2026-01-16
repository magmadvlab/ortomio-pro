-- =====================================================
-- FIX MIGRATION ERRORS
-- =====================================================
-- Risolve errori nelle migrazioni precedenti

-- 1. Fix trigger già esistente per field_row_sections
-- Drop e ricrea solo se necessario
DROP TRIGGER IF EXISTS auto_calc_section_plant_count ON field_row_sections;
DROP TRIGGER IF EXISTS validate_section_overlap_trigger ON field_row_sections;

-- Ricrea trigger con controllo esistenza
CREATE TRIGGER auto_calc_section_plant_count
  BEFORE INSERT OR UPDATE ON field_row_sections
  FOR EACH ROW
  EXECUTE FUNCTION calculate_section_plant_count();

CREATE TRIGGER validate_section_overlap_trigger
  BEFORE INSERT OR UPDATE ON field_row_sections
  FOR EACH ROW
  EXECUTE FUNCTION validate_section_overlap();

-- 2. Fix vista bio_certifications_with_readiness
-- Rimuovi riferimento a g.size_sqm che non esiste
DROP VIEW IF EXISTS bio_certifications_with_readiness CASCADE;

CREATE OR REPLACE VIEW bio_certifications_with_readiness AS
SELECT 
  bc.*,
  get_bio_certification_readiness(bc.id) as readiness_status,
  g.name as garden_name,
  CASE 
    WHEN bc.expiry_date IS NOT NULL AND bc.expiry_date < CURRENT_DATE THEN true
    ELSE false
  END as is_expired,
  CASE 
    WHEN bc.expiry_date IS NOT NULL AND bc.expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN true
    ELSE false
  END as expires_soon,
  (SELECT COUNT(*) FROM bio_certification_documents WHERE bio_certification_id = bc.id) as document_count,
  (SELECT COUNT(*) FROM bio_certification_inspections WHERE bio_certification_id = bc.id) as inspection_count,
  (SELECT MAX(inspection_date) FROM bio_certification_inspections WHERE bio_certification_id = bc.id) as last_inspection
FROM bio_certifications bc
LEFT JOIN gardens g ON bc.garden_id = g.id;

-- 3. Fix vista garden_zones_with_stats
-- Rimuovi riferimento a fr.plant_spacing_cm che potrebbe non esistere
DROP VIEW IF EXISTS garden_zones_with_stats CASCADE;

CREATE OR REPLACE VIEW garden_zones_with_stats AS
SELECT 
  gz.*,
  COUNT(DISTINCT fr.id) as field_row_count,
  COALESCE(SUM(fr.length_meters), 0) as total_row_length,
  COALESCE(SUM(fr.plant_count), 0) as total_plant_count,
  COUNT(DISTINCT frs.id) as section_count,
  g.name as garden_name,
  g.size_sqm as garden_size
FROM garden_zones gz
LEFT JOIN gardens g ON gz.garden_id = g.id
LEFT JOIN field_rows fr ON fr.zone_id = gz.id AND fr.is_active = true
LEFT JOIN field_row_sections frs ON frs.field_row_id = fr.id AND frs.is_active = true
GROUP BY gz.id, g.name, g.size_sqm;

-- 4. Verifica e aggiungi colonna plant_spacing_cm a field_rows se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'field_rows' AND column_name = 'plant_spacing_cm'
  ) THEN
    ALTER TABLE field_rows ADD COLUMN plant_spacing_cm INTEGER;
    COMMENT ON COLUMN field_rows.plant_spacing_cm IS 'Sesto di impianto in centimetri';
  END IF;
END $$;

-- 5. Verifica e aggiungi colonna row_width_meters a field_rows se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'field_rows' AND column_name = 'row_width_meters'
  ) THEN
    ALTER TABLE field_rows ADD COLUMN row_width_meters DECIMAL(5,2) DEFAULT 1.0;
    COMMENT ON COLUMN field_rows.row_width_meters IS 'Larghezza del filare in metri';
  END IF;
END $$;

-- 6. Verifica e aggiungi colonna plant_count a field_rows se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'field_rows' AND column_name = 'plant_count'
  ) THEN
    ALTER TABLE field_rows ADD COLUMN plant_count INTEGER;
    COMMENT ON COLUMN field_rows.plant_count IS 'Numero di piante nel filare';
  END IF;
END $$;

-- 7. Ricrea vista garden_zones_with_stats con tutte le colonne corrette
DROP VIEW IF EXISTS garden_zones_with_stats CASCADE;

CREATE OR REPLACE VIEW garden_zones_with_stats AS
SELECT 
  gz.*,
  COUNT(DISTINCT fr.id) as field_row_count,
  COALESCE(SUM(fr.length_meters), 0) as total_row_length,
  COALESCE(SUM(fr.plant_count), 0) as total_plant_count,
  COALESCE(AVG(fr.plant_spacing_cm), 0) as avg_plant_spacing,
  COUNT(DISTINCT frs.id) as section_count,
  g.name as garden_name
FROM garden_zones gz
LEFT JOIN gardens g ON gz.garden_id = g.id
LEFT JOIN field_rows fr ON fr.zone_id = gz.id AND fr.is_active = true
LEFT JOIN field_row_sections frs ON frs.field_row_id = fr.id AND frs.is_active = true
GROUP BY gz.id, g.name;

-- 8. Aggiorna funzione calculate_zone_area_from_rows per gestire colonne mancanti
CREATE OR REPLACE FUNCTION calculate_zone_area_from_rows(zone_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_area DECIMAL(10,2);
  has_row_width BOOLEAN;
BEGIN
  -- Verifica se esiste la colonna row_width_meters
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'field_rows' AND column_name = 'row_width_meters'
  ) INTO has_row_width;
  
  IF has_row_width THEN
    -- Calcola area totale sommando (lunghezza × larghezza) di tutti i filari
    SELECT COALESCE(SUM(length_meters * COALESCE(row_width_meters, 1.0)), 0)
    INTO total_area
    FROM field_rows
    WHERE zone_id = calculate_zone_area_from_rows.zone_id
    AND is_active = true;
  ELSE
    -- Usa solo lunghezza se row_width_meters non esiste
    SELECT COALESCE(SUM(length_meters), 0)
    INTO total_area
    FROM field_rows
    WHERE zone_id = calculate_zone_area_from_rows.zone_id
    AND is_active = true;
  END IF;
  
  RETURN total_area;
END;
$$ LANGUAGE plpgsql;

-- 9. Aggiorna funzione validate_field_row_fits_in_zone per gestire colonne mancanti
CREATE OR REPLACE FUNCTION validate_field_row_fits_in_zone()
RETURNS TRIGGER AS $$
DECLARE
  zone_area DECIMAL(10,2);
  total_rows_area DECIMAL(10,2);
  new_row_area DECIMAL(10,2);
  has_row_width BOOLEAN;
BEGIN
  -- Ottieni area zona
  SELECT area_sqm INTO zone_area 
  FROM garden_zones 
  WHERE id = NEW.zone_id;
  
  -- Se zona non ha area definita, skip validation
  IF zone_area IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Verifica se esiste la colonna row_width_meters
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'field_rows' AND column_name = 'row_width_meters'
  ) INTO has_row_width;
  
  IF has_row_width THEN
    -- Calcola area nuovo filare
    new_row_area := NEW.length_meters * COALESCE(NEW.row_width_meters, 1.0);
    
    -- Calcola area totale filari esistenti
    SELECT COALESCE(SUM(length_meters * COALESCE(row_width_meters, 1.0)), 0)
    INTO total_rows_area
    FROM field_rows
    WHERE zone_id = NEW.zone_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND is_active = true;
  ELSE
    -- Usa solo lunghezza
    new_row_area := NEW.length_meters;
    
    SELECT COALESCE(SUM(length_meters), 0)
    INTO total_rows_area
    FROM field_rows
    WHERE zone_id = NEW.zone_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND is_active = true;
  END IF;
  
  -- Verifica che non ecceda area zona (con margine 10%)
  IF (total_rows_area + new_row_area) > zone_area * 1.1 THEN
    RAISE WARNING 'I filari eccedono l''area della zona (%.2f m² > %.2f m²)', 
      (total_rows_area + new_row_area), zone_area;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Ricrea trigger con le funzioni aggiornate
DROP TRIGGER IF EXISTS auto_update_zone_area_on_row_change ON field_rows;
CREATE TRIGGER auto_update_zone_area_on_row_change
  AFTER INSERT OR UPDATE OR DELETE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_zone_area();

DROP TRIGGER IF EXISTS validate_field_row_area ON field_rows;
CREATE TRIGGER validate_field_row_area
  BEFORE INSERT OR UPDATE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION validate_field_row_fits_in_zone();

-- 11. Commenti per documentazione
COMMENT ON VIEW bio_certifications_with_readiness IS 'Vista certificazioni BIO con readiness status e statistiche (fixed: rimosso g.location)';
COMMENT ON VIEW garden_zones_with_stats IS 'Vista zone con statistiche filari e sezioni (fixed: gestione colonne opzionali)';
COMMENT ON FUNCTION calculate_zone_area_from_rows(UUID) IS 'Calcola area zona da filari (fixed: gestione row_width_meters opzionale)';
COMMENT ON FUNCTION validate_field_row_fits_in_zone() IS 'Valida che filari non eccedano area zona (fixed: gestione colonne opzionali)';

-- 12. Verifica finale
DO $$
BEGIN
  RAISE NOTICE 'Migration fix completata con successo';
  RAISE NOTICE 'Trigger ricreati: auto_calc_section_plant_count, validate_section_overlap_trigger';
  RAISE NOTICE 'Viste ricreate: bio_certifications_with_readiness, garden_zones_with_stats';
  RAISE NOTICE 'Funzioni aggiornate: calculate_zone_area_from_rows, validate_field_row_fits_in_zone';
END $$;
