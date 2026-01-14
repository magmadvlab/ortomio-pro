-- =====================================================
-- FIELD ROW SECTIONS (Porzioni di Filari)
-- =====================================================
-- Aggiunge il supporto per porzioni di filari per operazioni precise
-- Esempio: "Filare 1: metri 0-50", "Filare 2: metri 25-75"

-- 1. Tabella per le porzioni di filari
CREATE TABLE IF NOT EXISTS field_row_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_row_id UUID REFERENCES field_rows(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Identificazione porzione
  section_name VARCHAR(100) NOT NULL, -- es. "Sezione A", "Inizio", "Centro", "Fine"
  section_number INTEGER, -- es. 1, 2, 3 per ordinamento
  
  -- Posizione fisica nel filare
  start_position_meters DECIMAL(8,2) NOT NULL DEFAULT 0, -- Inizio porzione in metri
  end_position_meters DECIMAL(8,2) NOT NULL, -- Fine porzione in metri
  length_meters DECIMAL(8,2) GENERATED ALWAYS AS (end_position_meters - start_position_meters) STORED,
  
  -- Caratteristiche agronomiche
  plant_spacing_cm INTEGER, -- Sesto di impianto specifico per questa porzione (se diverso dal filare)
  plant_count INTEGER, -- Numero piante in questa porzione (calcolato automaticamente)
  
  -- Stato e metadati
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vincoli
  CONSTRAINT valid_position CHECK (start_position_meters >= 0 AND end_position_meters > start_position_meters),
  CONSTRAINT unique_section_name_per_row UNIQUE(field_row_id, section_name),
  CONSTRAINT unique_section_number_per_row UNIQUE(field_row_id, section_number)
);

-- 2. Funzione per calcolare automaticamente il numero di piante per porzione
CREATE OR REPLACE FUNCTION calculate_section_plant_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Usa il sesto di impianto della porzione o quello del filare padre
  NEW.plant_count := CASE 
    WHEN NEW.plant_spacing_cm IS NOT NULL AND NEW.plant_spacing_cm > 0 THEN
      FLOOR((NEW.length_meters * 100) / NEW.plant_spacing_cm)
    ELSE
      -- Usa il sesto del filare padre
      FLOOR((NEW.length_meters * 100) / (
        SELECT COALESCE(plant_spacing_cm, 50) 
        FROM field_rows 
        WHERE id = NEW.field_row_id
      ))
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger per calcolo automatico piante
CREATE TRIGGER auto_calc_section_plant_count
  BEFORE INSERT OR UPDATE ON field_row_sections
  FOR EACH ROW
  EXECUTE FUNCTION calculate_section_plant_count();

-- 4. Funzione per validare che le porzioni non si sovrappongano
CREATE OR REPLACE FUNCTION validate_section_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Controlla sovrapposizioni con altre porzioni dello stesso filare
  IF EXISTS (
    SELECT 1 FROM field_row_sections 
    WHERE field_row_id = NEW.field_row_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND is_active = true
    AND (
      (NEW.start_position_meters >= start_position_meters AND NEW.start_position_meters < end_position_meters) OR
      (NEW.end_position_meters > start_position_meters AND NEW.end_position_meters <= end_position_meters) OR
      (NEW.start_position_meters <= start_position_meters AND NEW.end_position_meters >= end_position_meters)
    )
  ) THEN
    RAISE EXCEPTION 'La porzione si sovrappone con un''altra porzione esistente del filare';
  END IF;
  
  -- Controlla che la porzione non ecceda la lunghezza del filare
  IF EXISTS (
    SELECT 1 FROM field_rows 
    WHERE id = NEW.field_row_id 
    AND NEW.end_position_meters > length_meters
  ) THEN
    RAISE EXCEPTION 'La porzione eccede la lunghezza del filare';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger per validazione sovrapposizioni
CREATE TRIGGER validate_section_overlap_trigger
  BEFORE INSERT OR UPDATE ON field_row_sections
  FOR EACH ROW
  EXECUTE FUNCTION validate_section_overlap();

-- 6. Aggiorna tabelle esistenti per supportare porzioni di filari
ALTER TABLE garden_tasks ADD COLUMN IF NOT EXISTS field_row_section_id UUID REFERENCES field_row_sections(id) ON DELETE SET NULL;
ALTER TABLE watering_logs ADD COLUMN IF NOT EXISTS field_row_section_id UUID REFERENCES field_row_sections(id) ON DELETE SET NULL;
ALTER TABLE fertilizer_application_logs ADD COLUMN IF NOT EXISTS field_row_section_id UUID REFERENCES field_row_sections(id) ON DELETE SET NULL;
ALTER TABLE treatment_register ADD COLUMN IF NOT EXISTS field_row_section_id UUID REFERENCES field_row_sections(id) ON DELETE SET NULL;

-- 7. Indici per performance
CREATE INDEX idx_field_row_sections_field_row ON field_row_sections(field_row_id);
CREATE INDEX idx_field_row_sections_garden ON field_row_sections(garden_id);
CREATE INDEX idx_field_row_sections_active ON field_row_sections(is_active);
CREATE INDEX idx_field_row_sections_position ON field_row_sections(field_row_id, start_position_meters, end_position_meters);

-- 8. RLS Policies
ALTER TABLE field_row_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own field row sections"
  ON field_row_sections FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own field row sections"
  ON field_row_sections FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own field row sections"
  ON field_row_sections FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own field row sections"
  ON field_row_sections FOR DELETE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- 9. Vista per operazioni con dettagli completi di localizzazione
CREATE OR REPLACE VIEW operations_with_location AS
SELECT 
  o.*,
  g.name as garden_name,
  gz.name as zone_name,
  fr.name as field_row_name,
  fr.length_meters as field_row_length,
  frs.section_name,
  frs.start_position_meters,
  frs.end_position_meters,
  frs.length_meters as section_length,
  CASE 
    WHEN frs.id IS NOT NULL THEN 
      CONCAT(fr.name, ' - ', frs.section_name, ' (', frs.start_position_meters, '-', frs.end_position_meters, 'm)')
    WHEN fr.id IS NOT NULL THEN 
      CONCAT(fr.name, ' (', fr.length_meters, 'm)')
    WHEN gz.id IS NOT NULL THEN 
      gz.name
    ELSE 
      'Posizione non specificata'
  END as full_location_name
FROM garden_tasks o
LEFT JOIN gardens g ON o.garden_id = g.id
LEFT JOIN garden_zones gz ON o.zone_id = gz.id
LEFT JOIN field_rows fr ON o.field_row_id = fr.id
LEFT JOIN field_row_sections frs ON o.field_row_section_id = frs.id;

-- 10. Funzione helper per creare porzioni standard
CREATE OR REPLACE FUNCTION create_standard_field_row_sections(
  p_field_row_id UUID,
  p_section_count INTEGER DEFAULT 3
) RETURNS VOID AS $$
DECLARE
  row_length DECIMAL(8,2);
  section_length DECIMAL(8,2);
  i INTEGER;
  section_names TEXT[] := ARRAY['Inizio', 'Centro', 'Fine'];
BEGIN
  -- Ottieni lunghezza del filare
  SELECT length_meters INTO row_length 
  FROM field_rows 
  WHERE id = p_field_row_id;
  
  IF row_length IS NULL THEN
    RAISE EXCEPTION 'Filare non trovato';
  END IF;
  
  -- Calcola lunghezza per sezione
  section_length := row_length / p_section_count;
  
  -- Crea le porzioni
  FOR i IN 1..p_section_count LOOP
    INSERT INTO field_row_sections (
      field_row_id,
      garden_id,
      section_name,
      section_number,
      start_position_meters,
      end_position_meters
    )
    SELECT 
      p_field_row_id,
      fr.garden_id,
      CASE 
        WHEN p_section_count <= 3 THEN section_names[i]
        ELSE 'Sezione ' || i
      END,
      i,
      (i - 1) * section_length,
      i * section_length
    FROM field_rows fr
    WHERE fr.id = p_field_row_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 11. Commenti per documentazione
COMMENT ON TABLE field_row_sections IS 'Porzioni di filari per operazioni precise su sezioni specifiche';
COMMENT ON COLUMN field_row_sections.start_position_meters IS 'Posizione di inizio della porzione in metri dall''inizio del filare';
COMMENT ON COLUMN field_row_sections.end_position_meters IS 'Posizione di fine della porzione in metri dall''inizio del filare';
COMMENT ON COLUMN field_row_sections.length_meters IS 'Lunghezza della porzione in metri (calcolata automaticamente)';
COMMENT ON COLUMN field_row_sections.plant_count IS 'Numero di piante nella porzione (calcolato automaticamente)';

-- 12. Dati di esempio (opzionale - solo per testing)
-- Uncomment per creare dati di test
/*
DO $$
DECLARE
  test_garden_id UUID;
  test_field_row_id UUID;
BEGIN
  -- Trova un giardino di test
  SELECT id INTO test_garden_id FROM gardens LIMIT 1;
  
  IF test_garden_id IS NOT NULL THEN
    -- Crea un filare di test
    INSERT INTO field_rows (garden_id, name, length_meters, plant_spacing_cm)
    VALUES (test_garden_id, 'Filare Test Porzioni', 100, 50)
    RETURNING id INTO test_field_row_id;
    
    -- Crea porzioni standard
    PERFORM create_standard_field_row_sections(test_field_row_id, 3);
    
    RAISE NOTICE 'Creato filare di test con porzioni: %', test_field_row_id;
  END IF;
END $$;
*/