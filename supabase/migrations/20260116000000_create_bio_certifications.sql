-- =====================================================
-- BIO CERTIFICATIONS (Certificazioni Biologiche EU 2018/848)
-- =====================================================
-- Sistema completo per gestione certificazioni biologiche

-- 1. Tabella principale certificazioni BIO
CREATE TABLE IF NOT EXISTS bio_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Dati azienda (20% compliance)
  company_name TEXT NOT NULL,
  vat_number TEXT,
  address TEXT,
  certification_body TEXT NOT NULL, -- ICEA, CCPB, Bioagricert, etc.
  certification_number TEXT,
  certification_date DATE,
  expiry_date DATE,
  
  -- Produzione (20% compliance)
  total_area DECIMAL(10,2) DEFAULT 0, -- Superficie totale in ettari
  organic_area DECIMAL(10,2) DEFAULT 0, -- Superficie biologica
  conversion_area DECIMAL(10,2) DEFAULT 0, -- Superficie in conversione
  conventional_area DECIMAL(10,2) DEFAULT 0, -- Superficie convenzionale
  has_buffer_zones BOOLEAN DEFAULT true,
  buffer_zone_width DECIMAL(5,2) DEFAULT 5, -- Larghezza zone tampone in metri
  
  -- Pratiche agricole (30% compliance) - INVERTED LOGIC
  uses_chemical_fertilizers BOOLEAN DEFAULT false, -- Deve essere FALSE
  uses_synthetic_pesticides BOOLEAN DEFAULT false, -- Deve essere FALSE
  uses_gmo BOOLEAN DEFAULT false, -- Deve essere FALSE
  
  -- Tracciabilità (20% compliance)
  has_traceability_system BOOLEAN DEFAULT true, -- Deve essere TRUE
  separates_organic_conventional BOOLEAN DEFAULT true, -- Deve essere TRUE
  keeps_production_records BOOLEAN DEFAULT true, -- Deve essere TRUE
  
  -- Controlli e ispezioni (10% compliance)
  last_inspection_date DATE,
  next_inspection_date DATE,
  non_conformities TEXT,
  corrective_actions TEXT,
  
  -- Compliance score (calcolato automaticamente)
  compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  
  -- Status workflow
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

-- 2. Funzione per calcolare compliance score automaticamente
CREATE OR REPLACE FUNCTION calculate_bio_compliance_score(cert_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  cert RECORD;
BEGIN
  SELECT * INTO cert FROM bio_certifications WHERE id = cert_id;
  
  IF cert IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Company data (20 points total, 4 points each)
  IF cert.company_name IS NOT NULL AND cert.company_name != '' THEN
    score := score + 4;
  END IF;
  IF cert.certification_body IS NOT NULL AND cert.certification_body != '' THEN
    score := score + 4;
  END IF;
  IF cert.certification_number IS NOT NULL AND cert.certification_number != '' THEN
    score := score + 4;
  END IF;
  IF cert.certification_date IS NOT NULL THEN
    score := score + 4;
  END IF;
  IF cert.expiry_date IS NOT NULL THEN
    score := score + 4;
  END IF;
  
  -- Production (20 points total, 5 points each)
  IF cert.total_area > 0 THEN
    score := score + 5;
  END IF;
  IF cert.organic_area > 0 THEN
    score := score + 5;
  END IF;
  IF cert.has_buffer_zones = true THEN
    score := score + 5;
  END IF;
  IF cert.buffer_zone_width >= 3 THEN
    score := score + 5;
  END IF;
  
  -- Practices (30 points total, 10 points each) - INVERTED LOGIC
  IF cert.uses_chemical_fertilizers = false THEN
    score := score + 10;
  END IF;
  IF cert.uses_synthetic_pesticides = false THEN
    score := score + 10;
  END IF;
  IF cert.uses_gmo = false THEN
    score := score + 10;
  END IF;
  
  -- Traceability (20 points total, 6-7 points each)
  IF cert.has_traceability_system = true THEN
    score := score + 7;
  END IF;
  IF cert.separates_organic_conventional = true THEN
    score := score + 7;
  END IF;
  IF cert.keeps_production_records = true THEN
    score := score + 6;
  END IF;
  
  -- Controls (10 points total, 5 points each)
  IF cert.last_inspection_date IS NOT NULL THEN
    score := score + 5;
  END IF;
  IF cert.next_inspection_date IS NOT NULL THEN
    score := score + 5;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger per aggiornare compliance score automaticamente
CREATE OR REPLACE FUNCTION update_bio_compliance_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.compliance_score := calculate_bio_compliance_score(NEW.id);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_bio_compliance_score
  BEFORE INSERT OR UPDATE ON bio_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_bio_compliance_score();

-- 4. Funzione per determinare readiness status
CREATE OR REPLACE FUNCTION get_bio_certification_readiness(cert_id UUID)
RETURNS TEXT AS $$
DECLARE
  score INTEGER;
BEGIN
  SELECT compliance_score INTO score FROM bio_certifications WHERE id = cert_id;
  
  IF score IS NULL THEN
    RETURN 'not_ready';
  ELSIF score >= 80 THEN
    RETURN 'ready';
  ELSIF score >= 60 THEN
    RETURN 'partially_ready';
  ELSE
    RETURN 'not_ready';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Tabella per documenti certificazione
CREATE TABLE IF NOT EXISTS bio_certification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_certification_id UUID REFERENCES bio_certifications(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo documento
  document_type TEXT NOT NULL CHECK (document_type IN (
    'operations_register', -- Registro operazioni colturali
    'purchase_register', -- Registro acquisti
    'sales_register', -- Registro vendite
    'management_plan', -- Piano gestione biologica
    'site_map', -- Planimetria
    'inspection_report', -- Rapporto ispezione
    'certificate', -- Certificato
    'other' -- Altro
  )),
  
  -- Dettagli documento
  document_name TEXT NOT NULL,
  document_description TEXT,
  file_url TEXT, -- URL del file (storage)
  file_size INTEGER, -- Dimensione in bytes
  mime_type TEXT,
  
  -- Metadata
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  is_required BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_date TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabella per storico ispezioni
CREATE TABLE IF NOT EXISTS bio_certification_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_certification_id UUID REFERENCES bio_certifications(id) ON DELETE CASCADE NOT NULL,
  
  -- Dettagli ispezione
  inspection_date DATE NOT NULL,
  inspection_type TEXT CHECK (inspection_type IN ('scheduled', 'surprise', 'follow_up')),
  inspector_name TEXT,
  inspector_organization TEXT,
  
  -- Risultati
  result TEXT CHECK (result IN ('passed', 'passed_with_conditions', 'failed', 'pending')),
  non_conformities_found TEXT[],
  corrective_actions_required TEXT[],
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_deadline DATE,
  follow_up_completed BOOLEAN DEFAULT false,
  
  -- Documenti
  report_url TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Vista per certificazioni con readiness
CREATE OR REPLACE VIEW bio_certifications_with_readiness AS
SELECT 
  bc.*,
  get_bio_certification_readiness(bc.id) as readiness_status,
  g.name as garden_name,
  g.size_sqm as garden_size,
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

-- 8. Indici per performance
CREATE INDEX idx_bio_certifications_garden ON bio_certifications(garden_id);
CREATE INDEX idx_bio_certifications_status ON bio_certifications(status);
CREATE INDEX idx_bio_certifications_expiry ON bio_certifications(expiry_date);
CREATE INDEX idx_bio_certifications_score ON bio_certifications(compliance_score);
CREATE INDEX idx_bio_cert_docs_certification ON bio_certification_documents(bio_certification_id);
CREATE INDEX idx_bio_cert_docs_type ON bio_certification_documents(document_type);
CREATE INDEX idx_bio_cert_inspections_certification ON bio_certification_inspections(bio_certification_id);
CREATE INDEX idx_bio_cert_inspections_date ON bio_certification_inspections(inspection_date);

-- 9. RLS Policies
ALTER TABLE bio_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_certification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_certification_inspections ENABLE ROW LEVEL SECURITY;

-- Policies per bio_certifications
CREATE POLICY "Users can view own bio certifications"
  ON bio_certifications FOR SELECT
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own bio certifications"
  ON bio_certifications FOR INSERT
  WITH CHECK (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own bio certifications"
  ON bio_certifications FOR UPDATE
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own bio certifications"
  ON bio_certifications FOR DELETE
  USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

-- Policies per bio_certification_documents
CREATE POLICY "Users can view own bio certification documents"
  ON bio_certification_documents FOR SELECT
  USING (bio_certification_id IN (
    SELECT id FROM bio_certifications WHERE garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert own bio certification documents"
  ON bio_certification_documents FOR INSERT
  WITH CHECK (bio_certification_id IN (
    SELECT id FROM bio_certifications WHERE garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update own bio certification documents"
  ON bio_certification_documents FOR UPDATE
  USING (bio_certification_id IN (
    SELECT id FROM bio_certifications WHERE garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete own bio certification documents"
  ON bio_certification_documents FOR DELETE
  USING (bio_certification_id IN (
    SELECT id FROM bio_certifications WHERE garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  ));

-- Policies per bio_certification_inspections
CREATE POLICY "Users can view own bio certification inspections"
  ON bio_certification_inspections FOR SELECT
  USING (bio_certification_id IN (
    SELECT id FROM bio_certifications WHERE garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert own bio certification inspections"
  ON bio_certification_inspections FOR INSERT
  WITH CHECK (bio_certification_id IN (
    SELECT id FROM bio_certifications WHERE garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update own bio certification inspections"
  ON bio_certification_inspections FOR UPDATE
  USING (bio_certification_id IN (
    SELECT id FROM bio_certifications WHERE garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete own bio certification inspections"
  ON bio_certification_inspections FOR DELETE
  USING (bio_certification_id IN (
    SELECT id FROM bio_certifications WHERE garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  ));

-- 10. Funzione helper per creare certificazione da template
CREATE OR REPLACE FUNCTION create_bio_certification_from_garden(p_garden_id UUID)
RETURNS UUID AS $$
DECLARE
  new_cert_id UUID;
  garden_info RECORD;
BEGIN
  -- Ottieni info giardino
  SELECT * INTO garden_info FROM gardens WHERE id = p_garden_id;
  
  IF garden_info IS NULL THEN
    RAISE EXCEPTION 'Garden not found';
  END IF;
  
  -- Crea certificazione con dati base dal giardino
  INSERT INTO bio_certifications (
    garden_id,
    company_name,
    total_area,
    has_buffer_zones,
    buffer_zone_width,
    uses_chemical_fertilizers,
    uses_synthetic_pesticides,
    uses_gmo,
    has_traceability_system,
    separates_organic_conventional,
    keeps_production_records
  ) VALUES (
    p_garden_id,
    COALESCE(garden_info.name, 'Azienda Agricola'),
    COALESCE(garden_info.size_sqm / 10000.0, 0), -- Converti m² in ettari
    true,
    5.0,
    false,
    false,
    false,
    true,
    true,
    true
  )
  RETURNING id INTO new_cert_id;
  
  RETURN new_cert_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Commenti per documentazione
COMMENT ON TABLE bio_certifications IS 'Certificazioni biologiche EU 2018/848 con calcolo automatico compliance score';
COMMENT ON COLUMN bio_certifications.compliance_score IS 'Score 0-100 calcolato automaticamente: Company(20) + Production(20) + Practices(30) + Traceability(20) + Controls(10)';
COMMENT ON COLUMN bio_certifications.uses_chemical_fertilizers IS 'DEVE essere FALSE per certificazione biologica';
COMMENT ON COLUMN bio_certifications.uses_synthetic_pesticides IS 'DEVE essere FALSE per certificazione biologica';
COMMENT ON COLUMN bio_certifications.uses_gmo IS 'DEVE essere FALSE per certificazione biologica';
COMMENT ON COLUMN bio_certifications.has_traceability_system IS 'DEVE essere TRUE per certificazione biologica';
COMMENT ON COLUMN bio_certifications.separates_organic_conventional IS 'DEVE essere TRUE se si hanno entrambe le produzioni';
COMMENT ON COLUMN bio_certifications.keeps_production_records IS 'DEVE essere TRUE per certificazione biologica';
COMMENT ON TABLE bio_certification_documents IS 'Documenti richiesti per certificazione biologica';
COMMENT ON TABLE bio_certification_inspections IS 'Storico ispezioni per certificazione biologica';
