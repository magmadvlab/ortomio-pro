-- =====================================================
-- APPLICAZIONE COMPLETA MIGRAZIONI 16 GENNAIO 2026
-- =====================================================
-- Questo file applica tutte e 3 le migrazioni in ordine corretto
-- Copia e incolla questo intero file nel Supabase SQL Editor

-- =====================================================
-- STEP 1: CERTIFICAZIONI BIO
-- =====================================================

-- 1. Tabella principale certificazioni BIO
CREATE TABLE IF NOT EXISTS bio_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Dati azienda (20% compliance)
  company_name TEXT NOT NULL,
  vat_number TEXT,
  address TEXT,
  certification_body TEXT NOT NULL,
  certification_number TEXT,
  certification_date DATE,
  expiry_date DATE,
  
  -- Produzione (20% compliance)
  total_area DECIMAL(10,2) DEFAULT 0,
  organic_area DECIMAL(10,2) DEFAULT 0,
  conversion_area DECIMAL(10,2) DEFAULT 0,
  conventional_area DECIMAL(10,2) DEFAULT 0,
  has_buffer_zones BOOLEAN DEFAULT true,
  buffer_zone_width DECIMAL(5,2) DEFAULT 5,
  
  -- Pratiche agricole (30% compliance) - INVERTED LOGIC
  uses_chemical_fertilizers BOOLEAN DEFAULT false,
  uses_synthetic_pesticides BOOLEAN DEFAULT false,
  uses_gmo BOOLEAN DEFAULT false,
  
  -- Tracciabilità (20% compliance)
  has_traceability_system BOOLEAN DEFAULT true,
  separates_organic_conventional BOOLEAN DEFAULT true,
  keeps_production_records BOOLEAN DEFAULT true,
  
  -- Controlli e ispezioni (10% compliance)
  last_inspection_date DATE,
  next_inspection_date DATE,
  non_conformities TEXT,
  corrective_actions TEXT,
  
  -- Compliance score
  compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'expired')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Vincoli
  CONSTRAINT valid_areas CHECK (
    total_area >= 0 AND 
    organic_area >= 0 AND 
    conversion_area >= 0 AND 
    conventional_area >= 0 AND
    (organic_area + conversion_area + conventional_area) <= total_area
  ),
  CONSTRAINT valid_buffer_zone CHECK (buffer_zone_width >= 0),
  CONSTRAINT valid_dates CHECK (
    (certification_date IS NULL OR expiry_date IS NULL) OR 
    (expiry_date > certification_date)
  ),
  CONSTRAINT valid_inspection_dates CHECK (
    (last_inspection_date IS NULL OR next_inspection_date IS NULL) OR
    (next_inspection_date > last_inspection_date)
  )
);

-- 2. Tabella documenti
CREATE TABLE IF NOT EXISTS bio_certification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_certification_id UUID REFERENCES bio_certifications(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'operations_register', 'purchase_register', 'sales_register',
    'management_plan', 'site_map', 'inspection_report', 'certificate', 'other'
  )),
  document_name TEXT NOT NULL,
  document_description TEXT,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  is_required BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_date TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabella ispezioni
CREATE TABLE IF NOT EXISTS bio_certification_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_certification_id UUID REFERENCES bio_certifications(id) ON DELETE CASCADE NOT NULL,
  inspection_date DATE NOT NULL,
  inspection_type TEXT CHECK (inspection_type IN ('scheduled', 'surprise', 'follow_up')),
  inspector_name TEXT,
  inspector_organization TEXT,
  result TEXT CHECK (result IN ('passed', 'passed_with_conditions', 'failed', 'pending')),
  non_conformities_found TEXT[],
  corrective_actions_required TEXT[],
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_deadline DATE,
  follow_up_completed BOOLEAN DEFAULT false,
  report_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Funzione calcolo compliance score
CREATE OR REPLACE FUNCTION calculate_bio_compliance_score(cert_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  cert RECORD;
BEGIN
  SELECT * INTO cert FROM bio_certifications WHERE id = cert_id;
  IF cert IS NULL THEN RETURN 0; END IF;
  
  -- Company data (20 points)
  IF cert.company_name IS NOT NULL AND cert.company_name != '' THEN score := score + 4; END IF;
  IF cert.certification_body IS NOT NULL AND cert.certification_body != '' THEN score := score + 4; END IF;
  IF cert.certification_number IS NOT NULL AND cert.certification_number != '' THEN score := score + 4; END IF;
  IF cert.certification_date IS NOT NULL THEN score := score + 4; END IF;
  IF cert.expiry_date IS NOT NULL THEN score := score + 4; END IF;
  
  -- Production (20 points)
  IF cert.total_area > 0 THEN score := score + 5; END IF;
  IF cert.organic_area > 0 THEN score := score + 5; END IF;
  IF cert.has_buffer_zones = true THEN score := score + 5; END IF;
  IF cert.buffer_zone_width >= 3 THEN score := score + 5; END IF;
  
  -- Practices (30 points) - INVERTED
  IF cert.uses_chemical_fertilizers = false THEN score := score + 10; END IF;
  IF cert.uses_synthetic_pesticides = false THEN score := score + 10; END IF;
  IF cert.uses_gmo = false THEN score := score + 10; END IF;
  
  -- Traceability (20 points)
  IF cert.has_traceability_system = true THEN score := score + 7; END IF;
  IF cert.separates_organic_conventional = true THEN score := score + 7; END IF;
  IF cert.keeps_production_records = true THEN score := score + 6; END IF;
  
  -- Controls (10 points)
  IF cert.last_inspection_date IS NOT NULL THEN score := score + 5; END IF;
  IF cert.next_inspection_date IS NOT NULL THEN score := score + 5; END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger aggiornamento score
CREATE OR REPLACE FUNCTION update_bio_compliance_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.compliance_score := calculate_bio_compliance_score(NEW.id);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_update_bio_compliance_score ON bio_certifications;
CREATE TRIGGER auto_update_bio_compliance_score
  BEFORE INSERT OR UPDATE ON bio_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_bio_compliance_score();

-- 6. Funzione readiness
CREATE OR REPLACE FUNCTION get_bio_certification_readiness(cert_id UUID)
RETURNS TEXT AS $$
DECLARE
  score INTEGER;
BEGIN
  SELECT compliance_score INTO score FROM bio_certifications WHERE id = cert_id;
  IF score IS NULL THEN RETURN 'not_ready';
  ELSIF score >= 80 THEN RETURN 'ready';
  ELSIF score >= 60 THEN RETURN 'partially_ready';
  ELSE RETURN 'not_ready';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Vista con readiness
CREATE OR REPLACE VIEW bio_certifications_with_readiness AS
SELECT 
  bc.*,
  get_bio_certification_readiness(bc.id) as readiness_status,
  g.name as garden_name,
  g.size_sqm as garden_size,
  CASE WHEN bc.expiry_date IS NOT NULL AND bc.expiry_date < CURRENT_DATE THEN true ELSE false END as is_expired,
  CASE WHEN bc.expiry_date IS NOT NULL AND bc.expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN true ELSE false END as expires_soon,
  (SELECT COUNT(*) FROM bio_certification_documents WHERE bio_certification_id = bc.id) as document_count,
  (SELECT COUNT(*) FROM bio_certification_inspections WHERE bio_certification_id = bc.id) as inspection_count,
  (SELECT MAX(inspection_date) FROM bio_certification_inspections WHERE bio_certification_id = bc.id) as last_inspection
FROM bio_certifications bc
LEFT JOIN gardens g ON bc.garden_id = g.id;

-- 8. Indici
CREATE INDEX IF NOT EXISTS idx_bio_certifications_garden ON bio_certifications(garden_id);
CREATE INDEX IF NOT EXISTS idx_bio_certifications_status ON bio_certifications(status);
CREATE INDEX IF NOT EXISTS idx_bio_certifications_expiry ON bio_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_bio_certifications_score ON bio_certifications(compliance_score);
CREATE INDEX IF NOT EXISTS idx_bio_cert_docs_certification ON bio_certification_documents(bio_certification_id);
CREATE INDEX IF NOT EXISTS idx_bio_cert_docs_type ON bio_certification_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_bio_cert_inspections_certification ON bio_certification_inspections(bio_certification_id);
CREATE INDEX IF NOT EXISTS idx_bio_cert_inspections_date ON bio_certification_inspections(inspection_date);

-- 9. RLS
ALTER TABLE bio_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_certification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_certification_inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bio certifications" ON bio_certifications;
CREATE POLICY "Users can view own bio certifications" ON bio_certifications FOR SELECT
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own bio certifications" ON bio_certifications;
CREATE POLICY "Users can insert own bio certifications" ON bio_certifications FOR INSERT
  WITH CHECK (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own bio certifications" ON bio_certifications;
CREATE POLICY "Users can update own bio certifications" ON bio_certifications FOR UPDATE
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own bio certifications" ON bio_certifications;
CREATE POLICY "Users can delete own bio certifications" ON bio_certifications FOR DELETE
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

-- Policies per documenti e ispezioni (simili)
DROP POLICY IF EXISTS "Users can view own bio certification documents" ON bio_certification_documents;
CREATE POLICY "Users can view own bio certification documents" ON bio_certification_documents FOR SELECT
  USING (bio_certification_id IN (SELECT id FROM bio_certifications WHERE garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can insert own bio certification documents" ON bio_certification_documents;
CREATE POLICY "Users can insert own bio certification documents" ON bio_certification_documents FOR INSERT
  WITH CHECK (bio_certification_id IN (SELECT id FROM bio_certifications WHERE garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can update own bio certification documents" ON bio_certification_documents;
CREATE POLICY "Users can update own bio certification documents" ON bio_certification_documents FOR UPDATE
  USING (bio_certification_id IN (SELECT id FROM bio_certifications WHERE garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can delete own bio certification documents" ON bio_certification_documents;
CREATE POLICY "Users can delete own bio certification documents" ON bio_certification_documents FOR DELETE
  USING (bio_certification_id IN (SELECT id FROM bio_certifications WHERE garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can view own bio certification inspections" ON bio_certification_inspections;
CREATE POLICY "Users can view own bio certification inspections" ON bio_certification_inspections FOR SELECT
  USING (bio_certification_id IN (SELECT id FROM bio_certifications WHERE garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can insert own bio certification inspections" ON bio_certification_inspections;
CREATE POLICY "Users can insert own bio certification inspections" ON bio_certification_inspections FOR INSERT
  WITH CHECK (bio_certification_id IN (SELECT id FROM bio_certifications WHERE garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can update own bio certification inspections" ON bio_certification_inspections;
CREATE POLICY "Users can update own bio certification inspections" ON bio_certification_inspections FOR UPDATE
  USING (bio_certification_id IN (SELECT id FROM bio_certifications WHERE garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can delete own bio certification inspections" ON bio_certification_inspections;
CREATE POLICY "Users can delete own bio certification inspections" ON bio_certification_inspections FOR DELETE
  USING (bio_certification_id IN (SELECT id FROM bio_certifications WHERE garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())));

-- =====================================================
-- STEP 2: ZONE CON DIMENSIONI
-- =====================================================

-- 1. Aggiungi colonne a garden_zones
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS area_sqm DECIMAL(10,2);
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS perimeter_meters DECIMAL(10,2);
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS shape_type TEXT CHECK (shape_type IN ('rectangle', 'circle', 'polygon', 'irregular'));
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS coordinates JSONB;
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS soil_type TEXT;
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS irrigation_type TEXT CHECK (irrigation_type IN ('drip', 'sprinkler', 'flood', 'manual', 'none'));
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS sun_exposure TEXT CHECK (sun_exposure IN ('full_sun', 'partial_shade', 'full_shade'));
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS slope_percentage DECIMAL(5,2);
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE garden_zones ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Funzione calcolo area da filari
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

-- 3. Trigger aggiornamento automatico area
CREATE OR REPLACE FUNCTION auto_update_zone_area()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE garden_zones 
    SET area_sqm = calculate_zone_area_from_rows(OLD.zone_id), updated_at = NOW()
    WHERE id = OLD.zone_id;
    RETURN OLD;
  ELSE
    UPDATE garden_zones 
    SET area_sqm = calculate_zone_area_from_rows(NEW.zone_id), updated_at = NOW()
    WHERE id = NEW.zone_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_update_zone_area_on_row_change ON field_rows;
CREATE TRIGGER auto_update_zone_area_on_row_change
  AFTER INSERT OR UPDATE OR DELETE ON field_rows
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_zone_area();

-- 4. Vista zone con statistiche
CREATE OR REPLACE VIEW garden_zones_with_stats AS
SELECT 
  gz.*,
  COUNT(DISTINCT fr.id) as field_row_count,
  COALESCE(SUM(fr.length_meters), 0) as total_row_length,
  COUNT(DISTINCT frs.id) as section_count,
  g.name as garden_name,
  g.size_sqm as garden_size
FROM garden_zones gz
LEFT JOIN gardens g ON gz.garden_id = g.id
LEFT JOIN field_rows fr ON fr.zone_id = gz.id AND fr.is_active = true
LEFT JOIN field_row_sections frs ON frs.field_row_id = fr.id AND frs.is_active = true
GROUP BY gz.id, g.name, g.size_sqm;

-- 5. Vista utilizzo area
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

-- 6. Vincoli
ALTER TABLE garden_zones DROP CONSTRAINT IF EXISTS valid_area;
ALTER TABLE garden_zones ADD CONSTRAINT valid_area CHECK (area_sqm IS NULL OR area_sqm >= 0);
ALTER TABLE garden_zones DROP CONSTRAINT IF EXISTS valid_perimeter;
ALTER TABLE garden_zones ADD CONSTRAINT valid_perimeter CHECK (perimeter_meters IS NULL OR perimeter_meters >= 0);
ALTER TABLE garden_zones DROP CONSTRAINT IF EXISTS valid_slope;
ALTER TABLE garden_zones ADD CONSTRAINT valid_slope CHECK (slope_percentage IS NULL OR (slope_percentage >= 0 AND slope_percentage <= 100));

-- 7. Indici
CREATE INDEX IF NOT EXISTS idx_garden_zones_area ON garden_zones(area_sqm);
CREATE INDEX IF NOT EXISTS idx_garden_zones_active ON garden_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_garden_zones_irrigation ON garden_zones(irrigation_type);
CREATE INDEX IF NOT EXISTS idx_garden_zones_sun ON garden_zones(sun_exposure);

-- =====================================================
-- STEP 3: FIX ERRORI
-- =====================================================

-- 1. Aggiungi colonne mancanti a field_rows
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'field_rows' AND column_name = 'plant_spacing_cm') THEN
    ALTER TABLE field_rows ADD COLUMN plant_spacing_cm INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'field_rows' AND column_name = 'row_width_meters') THEN
    ALTER TABLE field_rows ADD COLUMN row_width_meters DECIMAL(5,2) DEFAULT 1.0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'field_rows' AND column_name = 'plant_count') THEN
    ALTER TABLE field_rows ADD COLUMN plant_count INTEGER;
  END IF;
END $$;

-- 2. Ricrea vista garden_zones_with_stats con tutte le colonne
DROP VIEW IF EXISTS garden_zones_with_stats CASCADE;
CREATE OR REPLACE VIEW garden_zones_with_stats AS
SELECT 
  gz.*,
  COUNT(DISTINCT fr.id) as field_row_count,
  COALESCE(SUM(fr.length_meters), 0) as total_row_length,
  COALESCE(SUM(fr.plant_count), 0) as total_plant_count,
  COALESCE(AVG(fr.plant_spacing_cm), 0) as avg_plant_spacing,
  COUNT(DISTINCT frs.id) as section_count,
  g.name as garden_name,
  g.size_sqm as garden_size
FROM garden_zones gz
LEFT JOIN gardens g ON gz.garden_id = g.id
LEFT JOIN field_rows fr ON fr.zone_id = gz.id AND fr.is_active = true
LEFT JOIN field_row_sections frs ON frs.field_row_id = fr.id AND frs.is_active = true
GROUP BY gz.id, g.name, g.size_sqm;

-- =====================================================
-- VERIFICA FINALE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migrazioni applicate con successo!';
  RAISE NOTICE '📊 Tabelle create: bio_certifications, bio_certification_documents, bio_certification_inspections';
  RAISE NOTICE '📏 Colonne aggiunte a garden_zones: area_sqm, soil_type, irrigation_type, sun_exposure, etc.';
  RAISE NOTICE '🔧 Colonne aggiunte a field_rows: plant_spacing_cm, row_width_meters, plant_count';
  RAISE NOTICE '👁️ Viste create: bio_certifications_with_readiness, garden_zones_with_stats, garden_zones_area_usage';
  RAISE NOTICE '⚡ Trigger attivi: auto_update_bio_compliance_score, auto_update_zone_area_on_row_change';
END $$;
