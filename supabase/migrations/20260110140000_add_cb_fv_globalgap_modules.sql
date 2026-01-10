-- GlobalG.A.P. IFA V5.2 - CB (Coltivazioni Base) + FV (Frutta/Ortaggi) Modules
-- Completes 100% compliance coverage for professional agriculture

-- CB1.1.1 - Variety Selection (Resistant Varieties)
CREATE TABLE globalgap_variety_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  crop_name VARCHAR(255) NOT NULL,
  variety_name VARCHAR(255) NOT NULL,
  resistance_traits JSONB NOT NULL, -- diseases/pests resistant to
  selection_criteria TEXT NOT NULL,
  supplier_info JSONB,
  certification_status VARCHAR(100),
  planting_date DATE,
  field_location VARCHAR(255),
  performance_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CB4.1.1 - IPM Pest Monitoring
CREATE TABLE globalgap_ipm_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  monitoring_date DATE NOT NULL,
  field_location VARCHAR(255) NOT NULL,
  pest_species VARCHAR(255) NOT NULL,
  monitoring_method VARCHAR(100) NOT NULL, -- visual, trap, etc.
  population_level VARCHAR(50) NOT NULL, -- low, medium, high, critical
  threshold_exceeded BOOLEAN DEFAULT false,
  action_taken TEXT,
  weather_conditions JSONB,
  monitored_by VARCHAR(255) NOT NULL,
  photos JSONB, -- array of photo URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CB4.4.1 - Sprayer Calibration (Annual)
CREATE TABLE globalgap_sprayer_calibrations (
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

-- CB5.1.1 - Irrigation Water Analysis (Microbiological)
CREATE TABLE globalgap_water_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  sample_date DATE NOT NULL,
  water_source VARCHAR(255) NOT NULL,
  sample_location VARCHAR(255) NOT NULL,
  analysis_type VARCHAR(100) NOT NULL, -- microbiological, chemical, physical
  laboratory_name VARCHAR(255) NOT NULL,
  test_parameters JSONB NOT NULL, -- E.coli, Salmonella, etc.
  results JSONB NOT NULL,
  compliance_status VARCHAR(50) NOT NULL, -- compliant, non_compliant, marginal
  corrective_actions TEXT,
  certificate_path TEXT,
  next_analysis_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CB5.2.1 - Fertilizer Records (NPK detailed)
CREATE TABLE globalgap_fertilizer_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  application_date DATE NOT NULL,
  field_location VARCHAR(255) NOT NULL,
  fertilizer_name VARCHAR(255) NOT NULL,
  fertilizer_type VARCHAR(100) NOT NULL, -- organic, mineral, foliar
  npk_content JSONB NOT NULL, -- N%, P%, K% and other nutrients
  application_rate DECIMAL(10,3) NOT NULL, -- kg/ha or L/ha
  application_method VARCHAR(100) NOT NULL,
  weather_conditions JSONB,
  soil_conditions TEXT,
  justification TEXT NOT NULL,
  applied_by VARCHAR(255) NOT NULL,
  equipment_used VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CB7.1.1 - Harvest Suitability Assessment
CREATE TABLE globalgap_harvest_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  field_location VARCHAR(255) NOT NULL,
  crop_name VARCHAR(255) NOT NULL,
  maturity_indicators JSONB NOT NULL, -- color, size, firmness, etc.
  quality_parameters JSONB NOT NULL,
  suitability_decision VARCHAR(50) NOT NULL, -- suitable, not_suitable, conditional
  harvest_authorization BOOLEAN DEFAULT false,
  authorized_by VARCHAR(255),
  quality_defects JSONB,
  estimated_yield DECIMAL(10,2),
  harvest_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CB7.6.1 - Unique Lot Traceability
CREATE TABLE globalgap_lot_traceability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  lot_code VARCHAR(255) UNIQUE NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  harvest_date DATE NOT NULL,
  field_locations JSONB NOT NULL, -- array of field/row identifiers
  quantity_harvested DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  quality_grade VARCHAR(100),
  packaging_date DATE,
  storage_conditions JSONB,
  destination JSONB, -- customer, market, storage
  traceability_chain JSONB NOT NULL, -- full chain from seed to sale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FV1.1.1 - Microbiological Site Risks
CREATE TABLE globalgap_microbiological_risks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  risk_assessment_date DATE NOT NULL,
  site_area VARCHAR(255) NOT NULL,
  risk_source VARCHAR(255) NOT NULL, -- animals, water, soil, etc.
  pathogen_types JSONB NOT NULL, -- E.coli, Salmonella, Listeria, etc.
  risk_level VARCHAR(50) NOT NULL, -- low, medium, high, critical
  proximity_to_source DECIMAL(10,2), -- distance in meters
  seasonal_variation TEXT,
  mitigation_measures JSONB NOT NULL,
  monitoring_frequency VARCHAR(100) NOT NULL,
  responsible_person VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FV1.1.2 - Microbiological Management Plan
CREATE TABLE globalgap_microbiological_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  plan_version VARCHAR(50) NOT NULL,
  effective_date DATE NOT NULL,
  identified_risks JSONB NOT NULL, -- from microbiological_risks
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

-- FV4.1.2a - Pre-harvest Foliar Water Analysis
CREATE TABLE globalgap_foliar_water_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  water_source VARCHAR(255) NOT NULL,
  intended_use VARCHAR(100) NOT NULL, -- foliar spray, washing, etc.
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

-- FV5.1.1 - Harvest Hygiene Risk Assessment
CREATE TABLE globalgap_harvest_hygiene_risks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  harvest_area VARCHAR(255) NOT NULL,
  risk_factors JSONB NOT NULL, -- worker hygiene, equipment, environment
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

-- FV5.1.2 - Documented Harvest Hygiene Procedures
CREATE TABLE globalgap_harvest_procedures (
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

-- FV5.1.4 - Annual Hygiene Training
CREATE TABLE globalgap_hygiene_training (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  training_date DATE NOT NULL,
  training_type VARCHAR(100) NOT NULL, -- initial, refresher, specialized
  participant_name VARCHAR(255) NOT NULL,
  participant_role VARCHAR(255) NOT NULL,
  training_topics JSONB NOT NULL,
  training_duration INTEGER NOT NULL, -- minutes
  trainer_name VARCHAR(255) NOT NULL,
  training_materials JSONB,
  assessment_score INTEGER, -- 0-100
  certificate_issued BOOLEAN DEFAULT false,
  certificate_path TEXT,
  next_training_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FV5.2.1 - Hand Washing Access During Harvest
CREATE TABLE globalgap_handwashing_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  facility_location VARCHAR(255) NOT NULL,
  facility_type VARCHAR(100) NOT NULL, -- permanent, portable, temporary
  water_source VARCHAR(100) NOT NULL,
  soap_dispenser BOOLEAN DEFAULT true,
  paper_towels BOOLEAN DEFAULT true,
  sanitizer_available BOOLEAN DEFAULT false,
  waste_disposal BOOLEAN DEFAULT true,
  inspection_date DATE NOT NULL,
  condition_status VARCHAR(50) NOT NULL, -- excellent, good, needs_repair
  maintenance_notes TEXT,
  distance_to_harvest_area DECIMAL(10,2), -- meters
  capacity_workers INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional compliance tracking
CREATE TABLE globalgap_compliance_checklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  module_code VARCHAR(10) NOT NULL, -- AF, CB, FV
  control_point VARCHAR(20) NOT NULL, -- e.g., CB4.1.1
  description TEXT NOT NULL,
  compliance_status VARCHAR(50) NOT NULL, -- compliant, non_compliant, not_applicable
  evidence_type VARCHAR(100), -- document, record, observation
  evidence_reference TEXT,
  last_verified DATE,
  verified_by VARCHAR(255),
  notes TEXT,
  corrective_action TEXT,
  target_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(garden_id, control_point)
);

-- Indexes for performance
CREATE INDEX idx_variety_selections_garden ON globalgap_variety_selections(garden_id);
CREATE INDEX idx_ipm_monitoring_garden_date ON globalgap_ipm_monitoring(garden_id, monitoring_date);
CREATE INDEX idx_sprayer_calibrations_garden ON globalgap_sprayer_calibrations(garden_id);
CREATE INDEX idx_water_analyses_garden_date ON globalgap_water_analyses(garden_id, sample_date);
CREATE INDEX idx_fertilizer_records_garden_date ON globalgap_fertilizer_records(garden_id, application_date);
CREATE INDEX idx_harvest_assessments_garden_date ON globalgap_harvest_assessments(garden_id, assessment_date);
CREATE INDEX idx_lot_traceability_code ON globalgap_lot_traceability(lot_code);
CREATE INDEX idx_microbiological_risks_garden ON globalgap_microbiological_risks(garden_id);
CREATE INDEX idx_microbiological_plans_garden ON globalgap_microbiological_plans(garden_id);
CREATE INDEX idx_foliar_water_analyses_garden ON globalgap_foliar_water_analyses(garden_id);
CREATE INDEX idx_harvest_hygiene_risks_garden ON globalgap_harvest_hygiene_risks(garden_id);
CREATE INDEX idx_harvest_procedures_garden ON globalgap_harvest_procedures(garden_id);
CREATE INDEX idx_hygiene_training_garden_date ON globalgap_hygiene_training(garden_id, training_date);
CREATE INDEX idx_handwashing_facilities_garden ON globalgap_handwashing_facilities(garden_id);
CREATE INDEX idx_compliance_checklist_garden_module ON globalgap_compliance_checklist(garden_id, module_code);

-- RLS Policies
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
ALTER TABLE globalgap_compliance_checklist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for garden-based access
CREATE POLICY "Users can manage their garden's variety selections" ON globalgap_variety_selections
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's IPM monitoring" ON globalgap_ipm_monitoring
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's sprayer calibrations" ON globalgap_sprayer_calibrations
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's water analyses" ON globalgap_water_analyses
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's fertilizer records" ON globalgap_fertilizer_records
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's harvest assessments" ON globalgap_harvest_assessments
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's lot traceability" ON globalgap_lot_traceability
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's microbiological risks" ON globalgap_microbiological_risks
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's microbiological plans" ON globalgap_microbiological_plans
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's foliar water analyses" ON globalgap_foliar_water_analyses
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's harvest hygiene risks" ON globalgap_harvest_hygiene_risks
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's harvest procedures" ON globalgap_harvest_procedures
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's hygiene training" ON globalgap_hygiene_training
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's handwashing facilities" ON globalgap_handwashing_facilities
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's compliance checklist" ON globalgap_compliance_checklist
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

-- Function to auto-generate lot codes
CREATE OR REPLACE FUNCTION generate_lot_code(garden_id_param UUID, product_name_param VARCHAR)
RETURNS VARCHAR(255) AS $$
DECLARE
  lot_code VARCHAR(255);
  year_code VARCHAR(4);
  day_code VARCHAR(3);
  sequence_num INTEGER;
  exists_check INTEGER;
BEGIN
  year_code := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  day_code := LPAD(EXTRACT(DOY FROM CURRENT_DATE)::VARCHAR, 3, '0');
  
  -- Get next sequence number for this garden/product/date
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
  
  -- Generate lot code: PRODUCT-YYYY-DDD-SEQ
  lot_code := UPPER(LEFT(REPLACE(product_name_param, ' ', ''), 3)) || '-' || 
              year_code || '-' || day_code || '-' || 
              LPAD(sequence_num::VARCHAR, 3, '0');
  
  RETURN lot_code;
END;
$$ LANGUAGE plpgsql;

-- Insert default compliance checklist for CB and FV modules
-- Note: Skipping template insert as it requires a valid garden_id
-- Users will create compliance checklists through the application interface

COMMENT ON TABLE globalgap_variety_selections IS 'CB1.1.1 - Selection of resistant varieties';
COMMENT ON TABLE globalgap_ipm_monitoring IS 'CB4.1.1 - IPM pest monitoring records';
COMMENT ON TABLE globalgap_sprayer_calibrations IS 'CB4.4.1 - Annual sprayer calibration certificates';
COMMENT ON TABLE globalgap_water_analyses IS 'CB5.1.1 - Microbiological water analysis for irrigation';
COMMENT ON TABLE globalgap_fertilizer_records IS 'CB5.2.1 - Detailed NPK fertilizer application records';
COMMENT ON TABLE globalgap_harvest_assessments IS 'CB7.1.1 - Harvest suitability assessment';
COMMENT ON TABLE globalgap_lot_traceability IS 'CB7.6.1 - Unique lot traceability system';
COMMENT ON TABLE globalgap_microbiological_risks IS 'FV1.1.1 - Microbiological site risk assessment';
COMMENT ON TABLE globalgap_microbiological_plans IS 'FV1.1.2 - Microbiological management plan';
COMMENT ON TABLE globalgap_foliar_water_analyses IS 'FV4.1.2a - Pre-harvest foliar water analysis';
COMMENT ON TABLE globalgap_harvest_hygiene_risks IS 'FV5.1.1 - Harvest hygiene risk assessment';
COMMENT ON TABLE globalgap_harvest_procedures IS 'FV5.1.2 - Documented harvest hygiene procedures';
COMMENT ON TABLE globalgap_hygiene_training IS 'FV5.1.4 - Annual hygiene training records';
COMMENT ON TABLE globalgap_handwashing_facilities IS 'FV5.2.1 - Hand washing facilities access during harvest';