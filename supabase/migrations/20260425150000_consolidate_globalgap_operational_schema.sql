-- T3-C GlobalG.A.P. operational schema consolidation
-- Adds the DB surfaces already referenced by GlobalG.A.P. services without
-- replacing existing production tables created by earlier minimal migrations.

ALTER TABLE globalgap_compliance_checklist
  ADD COLUMN IF NOT EXISTS module_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS evidence_reference TEXT,
  ADD COLUMN IF NOT EXISTS last_verified DATE,
  ADD COLUMN IF NOT EXISTS corrective_action TEXT,
  ADD COLUMN IF NOT EXISTS target_completion_date DATE;

UPDATE globalgap_compliance_checklist
SET
  module_code = COALESCE(module_code, split_part(control_point, '.', 1)),
  description = COALESCE(description, control_point_description),
  evidence_reference = COALESCE(evidence_reference, evidence_description),
  last_verified = COALESCE(last_verified, last_assessment_date::date),
  corrective_action = COALESCE(corrective_action, corrective_actions)
WHERE module_code IS NULL
   OR description IS NULL
   OR evidence_reference IS NULL
   OR last_verified IS NULL
   OR corrective_action IS NULL;

CREATE TABLE IF NOT EXISTS globalgap_recall_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES globalgap_recall_procedures(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  test_scenario TEXT NOT NULL,
  simulated_lot_code VARCHAR(255) NOT NULL,
  trace_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  trace_end_time TIMESTAMP WITH TIME ZONE,
  trace_duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (trace_end_time - trace_start_time)) / 60
  ) STORED,
  traced_products JSONB,
  communication_test_results JSONB,
  effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  improvements_identified TEXT,
  test_conducted_by VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_transaction_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  ggn_code_id UUID REFERENCES globalgap_ggn_codes(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_number VARCHAR(255) NOT NULL,
  document_date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  products JSONB NOT NULL,
  total_amount DECIMAL(10,2),
  ggn_reference_included BOOLEAN DEFAULT true,
  certificate_status_mentioned BOOLEAN DEFAULT true,
  document_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_variety_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  crop_name VARCHAR(255) NOT NULL,
  variety_name VARCHAR(255) NOT NULL,
  resistance_traits JSONB NOT NULL,
  selection_criteria TEXT NOT NULL,
  supplier_info JSONB,
  certification_status VARCHAR(100),
  planting_date DATE,
  field_location VARCHAR(255),
  performance_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_ipm_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  monitoring_date DATE NOT NULL,
  field_location VARCHAR(255) NOT NULL,
  pest_species VARCHAR(255) NOT NULL,
  monitoring_method VARCHAR(100) NOT NULL,
  population_level VARCHAR(50) NOT NULL,
  threshold_exceeded BOOLEAN DEFAULT false,
  action_taken TEXT,
  weather_conditions JSONB,
  monitored_by VARCHAR(255) NOT NULL,
  photos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_sprayer_calibrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  equipment_id VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100) NOT NULL,
  calibration_date DATE NOT NULL,
  calibrated_by VARCHAR(255) NOT NULL,
  pressure_settings JSONB NOT NULL,
  nozzle_specifications JSONB NOT NULL,
  flow_rate_measurements JSONB NOT NULL,
  coverage_uniformity_test JSONB,
  calibration_certificate TEXT,
  next_calibration_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'valid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_water_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  sample_date DATE NOT NULL,
  water_source VARCHAR(255) NOT NULL,
  sample_location VARCHAR(255) NOT NULL,
  analysis_type VARCHAR(100) NOT NULL,
  laboratory_name VARCHAR(255) NOT NULL,
  test_parameters JSONB NOT NULL,
  results JSONB NOT NULL,
  compliance_status VARCHAR(50) NOT NULL,
  corrective_actions TEXT,
  certificate_path TEXT,
  next_analysis_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_fertilizer_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  application_date DATE NOT NULL,
  field_location VARCHAR(255) NOT NULL,
  fertilizer_name VARCHAR(255) NOT NULL,
  fertilizer_type VARCHAR(100) NOT NULL,
  npk_content JSONB NOT NULL,
  application_rate DECIMAL(10,3) NOT NULL,
  application_method VARCHAR(100) NOT NULL,
  weather_conditions JSONB,
  soil_conditions TEXT,
  justification TEXT NOT NULL,
  applied_by VARCHAR(255) NOT NULL,
  equipment_used VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_harvest_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  field_location VARCHAR(255) NOT NULL,
  crop_name VARCHAR(255) NOT NULL,
  maturity_indicators JSONB NOT NULL,
  quality_parameters JSONB NOT NULL,
  suitability_decision VARCHAR(50) NOT NULL,
  harvest_authorization BOOLEAN DEFAULT false,
  authorized_by VARCHAR(255),
  quality_defects JSONB,
  estimated_yield DECIMAL(10,2),
  harvest_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_lot_traceability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  lot_code VARCHAR(255) UNIQUE NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  harvest_date DATE NOT NULL,
  field_locations JSONB NOT NULL,
  quantity_harvested DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  quality_grade VARCHAR(100),
  packaging_date DATE,
  storage_conditions JSONB,
  destination JSONB,
  traceability_chain JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_microbiological_risks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  risk_assessment_date DATE NOT NULL,
  site_area VARCHAR(255) NOT NULL,
  risk_source VARCHAR(255) NOT NULL,
  pathogen_types JSONB NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  proximity_to_source DECIMAL(10,2),
  seasonal_variation TEXT,
  mitigation_measures JSONB NOT NULL,
  monitoring_frequency VARCHAR(100) NOT NULL,
  responsible_person VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_microbiological_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  plan_version VARCHAR(50) NOT NULL,
  effective_date DATE NOT NULL,
  identified_risks JSONB NOT NULL,
  control_measures JSONB NOT NULL,
  monitoring_procedures JSONB NOT NULL,
  corrective_actions JSONB NOT NULL,
  verification_methods JSONB NOT NULL,
  training_requirements JSONB,
  record_keeping_procedures TEXT,
  review_frequency VARCHAR(100) NOT NULL,
  next_review_date DATE NOT NULL,
  approved_by VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_foliar_water_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  water_source VARCHAR(255) NOT NULL,
  intended_use VARCHAR(100) NOT NULL,
  days_before_harvest INTEGER NOT NULL,
  laboratory_name VARCHAR(255) NOT NULL,
  microbiological_parameters JSONB NOT NULL,
  chemical_parameters JSONB,
  compliance_status VARCHAR(50) NOT NULL,
  restrictions_applied JSONB,
  certificate_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_harvest_hygiene_risks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  harvest_area VARCHAR(255) NOT NULL,
  risk_factors JSONB NOT NULL,
  contamination_sources JSONB NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  control_measures JSONB NOT NULL,
  monitoring_points JSONB NOT NULL,
  critical_control_points JSONB,
  training_needs JSONB,
  equipment_requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_harvest_procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  procedure_name VARCHAR(255) NOT NULL,
  procedure_version VARCHAR(50) NOT NULL,
  effective_date DATE NOT NULL,
  crop_specific BOOLEAN DEFAULT false,
  applicable_crops JSONB,
  pre_harvest_requirements JSONB NOT NULL,
  worker_hygiene_procedures JSONB NOT NULL,
  equipment_sanitization JSONB NOT NULL,
  container_requirements JSONB NOT NULL,
  field_hygiene_standards JSONB NOT NULL,
  quality_control_checks JSONB NOT NULL,
  documentation_requirements JSONB NOT NULL,
  approved_by VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_hygiene_training (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  training_date DATE NOT NULL,
  training_type VARCHAR(100) NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  participant_role VARCHAR(255) NOT NULL,
  training_topics JSONB NOT NULL,
  training_duration INTEGER NOT NULL,
  trainer_name VARCHAR(255) NOT NULL,
  training_materials JSONB,
  assessment_score INTEGER,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_path TEXT,
  next_training_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_handwashing_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  facility_location VARCHAR(255) NOT NULL,
  facility_type VARCHAR(100) NOT NULL,
  water_source VARCHAR(100) NOT NULL,
  soap_dispenser BOOLEAN DEFAULT true,
  paper_towels BOOLEAN DEFAULT true,
  sanitizer_available BOOLEAN DEFAULT false,
  waste_disposal BOOLEAN DEFAULT true,
  inspection_date DATE NOT NULL,
  condition_status VARCHAR(50) NOT NULL,
  maintenance_notes TEXT,
  distance_to_harvest_area DECIMAL(10,2),
  capacity_workers INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_globalgap_recall_tests_garden ON globalgap_recall_tests(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_transaction_documents_garden ON globalgap_transaction_documents(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_variety_selections_garden ON globalgap_variety_selections(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_ipm_monitoring_garden_date ON globalgap_ipm_monitoring(garden_id, monitoring_date);
CREATE INDEX IF NOT EXISTS idx_globalgap_sprayer_calibrations_garden ON globalgap_sprayer_calibrations(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_water_analyses_garden_date ON globalgap_water_analyses(garden_id, sample_date);
CREATE INDEX IF NOT EXISTS idx_globalgap_fertilizer_records_garden_date ON globalgap_fertilizer_records(garden_id, application_date);
CREATE INDEX IF NOT EXISTS idx_globalgap_harvest_assessments_garden_date ON globalgap_harvest_assessments(garden_id, assessment_date);
CREATE INDEX IF NOT EXISTS idx_globalgap_lot_traceability_code ON globalgap_lot_traceability(lot_code);
CREATE INDEX IF NOT EXISTS idx_globalgap_microbiological_risks_garden ON globalgap_microbiological_risks(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_microbiological_plans_garden ON globalgap_microbiological_plans(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_foliar_water_analyses_garden ON globalgap_foliar_water_analyses(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_harvest_hygiene_risks_garden ON globalgap_harvest_hygiene_risks(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_harvest_procedures_garden ON globalgap_harvest_procedures(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_hygiene_training_garden_date ON globalgap_hygiene_training(garden_id, training_date);
CREATE INDEX IF NOT EXISTS idx_globalgap_handwashing_facilities_garden ON globalgap_handwashing_facilities(garden_id);

ALTER TABLE globalgap_recall_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_transaction_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_variety_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_ipm_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_sprayer_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_water_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_fertilizer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_harvest_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_lot_traceability ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_microbiological_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_microbiological_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_foliar_water_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_harvest_hygiene_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_harvest_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_hygiene_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_handwashing_facilities ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'globalgap_recall_tests',
    'globalgap_transaction_documents',
    'globalgap_variety_selections',
    'globalgap_ipm_monitoring',
    'globalgap_sprayer_calibrations',
    'globalgap_water_analyses',
    'globalgap_fertilizer_records',
    'globalgap_harvest_assessments',
    'globalgap_lot_traceability',
    'globalgap_microbiological_risks',
    'globalgap_microbiological_plans',
    'globalgap_foliar_water_analyses',
    'globalgap_harvest_hygiene_risks',
    'globalgap_harvest_procedures',
    'globalgap_hygiene_training',
    'globalgap_handwashing_facilities'
  ]
  LOOP
    policy_name := table_name || '_garden_owner_policy';
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = table_name
        AND policyname = policy_name
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()))',
        policy_name,
        table_name
      );
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION generate_ggn_code()
RETURNS VARCHAR(13) AS $$
DECLARE
  generated_code VARCHAR(13);
  exists_check INTEGER;
BEGIN
  LOOP
    generated_code := '4000' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
    SELECT COUNT(*) INTO exists_check FROM globalgap_ggn_codes WHERE ggn_code = generated_code;
    EXIT WHEN exists_check = 0;
  END LOOP;

  RETURN generated_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_lot_code(garden_id_param UUID, product_name_param VARCHAR)
RETURNS VARCHAR(255) AS $$
DECLARE
  generated_lot_code VARCHAR(255);
  year_code VARCHAR(4);
  day_code VARCHAR(3);
  sequence_num INTEGER;
BEGIN
  year_code := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  day_code := LPAD(EXTRACT(DOY FROM CURRENT_DATE)::VARCHAR, 3, '0');

  SELECT COALESCE(MAX(
    CASE
      WHEN lot_code ~ ('^[A-Z0-9]+-' || year_code || '-' || day_code || '-[0-9]+$')
      THEN CAST(SPLIT_PART(lot_code, '-', 4) AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM globalgap_lot_traceability
  WHERE garden_id = garden_id_param
    AND product_name = product_name_param
    AND harvest_date = CURRENT_DATE;

  generated_lot_code := UPPER(LEFT(REPLACE(product_name_param, ' ', ''), 3)) || '-' ||
    year_code || '-' || day_code || '-' ||
    LPAD(sequence_num::VARCHAR, 3, '0');

  RETURN generated_lot_code;
END;
$$ LANGUAGE plpgsql;
