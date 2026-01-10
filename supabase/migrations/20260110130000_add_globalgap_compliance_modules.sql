-- GlobalG.A.P. IFA V5.2 Compliance Modules
-- Implements the 5 missing Major Requirements for complete compliance

-- 1. AF 1.2.2 - Risk Management Plan
CREATE TABLE globalgap_risk_management_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  risk_assessment_date DATE NOT NULL,
  plan_implementation_date DATE NOT NULL,
  identified_risks JSONB NOT NULL, -- Array of risks from AF 1.2.1
  control_procedures JSONB NOT NULL, -- Mitigation strategies
  monitoring_schedule JSONB NOT NULL, -- How often to review
  effectiveness_evidence TEXT,
  responsible_person VARCHAR(255) NOT NULL,
  next_review_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AF 2.2 - Internal Self-Assessment Checklist
CREATE TABLE globalgap_self_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  assessor_name VARCHAR(255) NOT NULL,
  assessor_role VARCHAR(255) NOT NULL,
  total_control_points INTEGER DEFAULT 163,
  compliant_points INTEGER DEFAULT 0,
  non_compliant_points INTEGER DEFAULT 0,
  not_applicable_points INTEGER DEFAULT 0,
  checklist_data JSONB NOT NULL, -- Full 163-point checklist with comments
  overall_compliance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN (compliant_points + not_applicable_points) > 0 
      THEN (compliant_points::decimal / (total_control_points - not_applicable_points) * 100)
      ELSE 0 
    END
  ) STORED,
  corrective_actions JSONB, -- Actions for non-compliant points
  next_assessment_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AF 4.5.1 - Health & Safety Responsible Person
CREATE TABLE globalgap_health_safety_managers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  responsible_person_name VARCHAR(255) NOT NULL,
  position_title VARCHAR(255) NOT NULL,
  qualifications TEXT,
  appointment_date DATE NOT NULL,
  digital_signature TEXT, -- Base64 encoded signature
  responsibilities JSONB NOT NULL, -- List of H&S responsibilities
  training_records JSONB, -- Training completed
  contact_info JSONB, -- Phone, email, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AF 9.1 - Product Recall/Withdrawal Procedures
CREATE TABLE globalgap_recall_procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  procedure_version VARCHAR(50) NOT NULL,
  last_updated DATE NOT NULL,
  trigger_events JSONB NOT NULL, -- Events that could trigger recall
  decision_makers JSONB NOT NULL, -- People with authority to initiate recall
  communication_plan JSONB NOT NULL, -- How to notify supply chain
  traceability_method TEXT NOT NULL,
  stock_reconciliation_method TEXT NOT NULL,
  annual_test_date DATE,
  test_results JSONB, -- Results of annual effectiveness test
  test_documentation TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AF 11.1 - GGN Code Management
CREATE TABLE globalgap_ggn_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  ggn_code VARCHAR(13) UNIQUE NOT NULL, -- 13-digit GGN format
  certificate_holder_name VARCHAR(255) NOT NULL,
  certificate_status VARCHAR(50) DEFAULT 'valid',
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  scope_products JSONB NOT NULL, -- Products covered by certificate
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recall Test Simulations (for AF 9.1 annual testing)
CREATE TABLE globalgap_recall_tests (
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
  traced_products JSONB, -- Products successfully traced
  communication_test_results JSONB, -- Results of communication test
  effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  improvements_identified TEXT,
  test_conducted_by VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Documents with GGN (for AF 11.1)
CREATE TABLE globalgap_transaction_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  ggn_code_id UUID REFERENCES globalgap_ggn_codes(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'invoice', 'delivery_note', 'certificate'
  document_number VARCHAR(255) NOT NULL,
  document_date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  products JSONB NOT NULL, -- Products with GGN status
  total_amount DECIMAL(10,2),
  ggn_reference_included BOOLEAN DEFAULT true,
  certificate_status_mentioned BOOLEAN DEFAULT true,
  document_path TEXT, -- Path to generated PDF
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_risk_management_plans_garden ON globalgap_risk_management_plans(garden_id);
CREATE INDEX idx_risk_management_plans_status ON globalgap_risk_management_plans(status);
CREATE INDEX idx_self_assessments_garden ON globalgap_self_assessments(garden_id);
CREATE INDEX idx_self_assessments_date ON globalgap_self_assessments(assessment_date);
CREATE INDEX idx_health_safety_managers_garden ON globalgap_health_safety_managers(garden_id);
CREATE INDEX idx_health_safety_managers_active ON globalgap_health_safety_managers(is_active);
CREATE INDEX idx_recall_procedures_garden ON globalgap_recall_procedures(garden_id);
CREATE INDEX idx_recall_procedures_status ON globalgap_recall_procedures(status);
CREATE INDEX idx_ggn_codes_garden ON globalgap_ggn_codes(garden_id);
CREATE INDEX idx_ggn_codes_active ON globalgap_ggn_codes(is_active);
CREATE INDEX idx_ggn_codes_code ON globalgap_ggn_codes(ggn_code);
CREATE INDEX idx_recall_tests_garden ON globalgap_recall_tests(garden_id);
CREATE INDEX idx_recall_tests_date ON globalgap_recall_tests(test_date);
CREATE INDEX idx_transaction_documents_garden ON globalgap_transaction_documents(garden_id);
CREATE INDEX idx_transaction_documents_ggn ON globalgap_transaction_documents(ggn_code_id);

-- RLS Policies
ALTER TABLE globalgap_risk_management_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_self_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_health_safety_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_recall_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_ggn_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_recall_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_transaction_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for garden-based access
CREATE POLICY "Users can manage their garden's risk management plans" ON globalgap_risk_management_plans
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's self assessments" ON globalgap_self_assessments
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's health safety managers" ON globalgap_health_safety_managers
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's recall procedures" ON globalgap_recall_procedures
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's GGN codes" ON globalgap_ggn_codes
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's recall tests" ON globalgap_recall_tests
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their garden's transaction documents" ON globalgap_transaction_documents
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

-- Function to generate GGN codes (13-digit format)
CREATE OR REPLACE FUNCTION generate_ggn_code()
RETURNS VARCHAR(13) AS $$
DECLARE
  ggn_code VARCHAR(13);
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate 13-digit GGN: 4000 (prefix) + 9 random digits
    ggn_code := '4000' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_check FROM globalgap_ggn_codes WHERE ggn_code = ggn_code;
    
    -- Exit loop if unique
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN ggn_code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate compliance percentage
CREATE OR REPLACE FUNCTION calculate_compliance_percentage(
  compliant INTEGER,
  total INTEGER,
  not_applicable INTEGER DEFAULT 0
)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  IF (total - not_applicable) = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((compliant::DECIMAL / (total - not_applicable)) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Insert default GlobalG.A.P. checklist template (163 control points)
-- Note: Skipping template insert as it requires a valid garden_id
-- Users will create assessments through the application interface

COMMENT ON TABLE globalgap_risk_management_plans IS 'AF 1.2.2 - Risk management plans for identified site risks';
COMMENT ON TABLE globalgap_self_assessments IS 'AF 2.2 - Annual internal self-assessments against GlobalG.A.P. standard';
COMMENT ON TABLE globalgap_health_safety_managers IS 'AF 4.5.1 - Designated management responsible for worker health and safety';
COMMENT ON TABLE globalgap_recall_procedures IS 'AF 9.1 - Documented product recall/withdrawal procedures with annual testing';
COMMENT ON TABLE globalgap_ggn_codes IS 'AF 11.1 - GGN codes for transaction document identification';
COMMENT ON TABLE globalgap_recall_tests IS 'Annual effectiveness tests for recall procedures';
COMMENT ON TABLE globalgap_transaction_documents IS 'Transaction documents with GGN references for compliance';