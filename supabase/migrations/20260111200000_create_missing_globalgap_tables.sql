-- =====================================================
-- GLOBALGAP_TABLES
-- Auto-generated migration for missing database objects
-- Generated: 2026-01-11T13:34:02.626Z
-- =====================================================

-- MISSING TABLES
-- The following tables are missing and will be created:
-- - globalgap_compliance_checklist
-- - globalgap_self_assessments
-- - globalgap_ggn_codes
-- - globalgap_recall_procedures
-- - globalgap_risk_management_plans
-- - globalgap_health_safety_managers

-- Migration: Create Missing GlobalGAP Tables
-- Fixes 404 errors for GlobalGAP compliance system

-- Enable RLS
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- 1. GlobalGAP Compliance Checklist
CREATE TABLE IF NOT EXISTS public.globalgap_compliance_checklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    control_point VARCHAR(20) NOT NULL,
    control_point_description TEXT NOT NULL,
    compliance_criteria TEXT NOT NULL,
    compliance_status VARCHAR(20) DEFAULT 'pending' CHECK (compliance_status IN ('compliant', 'non_compliant', 'not_applicable', 'pending')),
    evidence_type VARCHAR(50),
    evidence_description TEXT,
    evidence_file_url TEXT,
    last_assessment_date TIMESTAMPTZ,
    next_assessment_due TIMESTAMPTZ,
    responsible_person VARCHAR(255),
    corrective_actions TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GlobalGAP Self Assessments
CREATE TABLE IF NOT EXISTS public.globalgap_self_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assessor_name VARCHAR(255) NOT NULL,
    assessor_qualification VARCHAR(255),
    assessment_type VARCHAR(50) DEFAULT 'internal' CHECK (assessment_type IN ('internal', 'external', 'pre_audit')),
    overall_compliance_score DECIMAL(5,2) CHECK (overall_compliance_score >= 0 AND overall_compliance_score <= 100),
    total_control_points INTEGER DEFAULT 0,
    compliant_points INTEGER DEFAULT 0,
    non_compliant_points INTEGER DEFAULT 0,
    not_applicable_points INTEGER DEFAULT 0,
    major_non_conformities INTEGER DEFAULT 0,
    minor_non_conformities INTEGER DEFAULT 0,
    recommendations TEXT,
    corrective_action_plan TEXT,
    next_assessment_date TIMESTAMPTZ,
    certification_status VARCHAR(50) DEFAULT 'in_progress' CHECK (certification_status IN ('in_progress', 'compliant', 'non_compliant', 'suspended')),
    certificate_number VARCHAR(100),
    certificate_expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GlobalGAP GGN Codes
CREATE TABLE IF NOT EXISTS public.globalgap_ggn_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    ggn_code VARCHAR(13) NOT NULL UNIQUE, -- Format: 4049928000000
    producer_name VARCHAR(255) NOT NULL,
    producer_address TEXT,
    product_scope TEXT NOT NULL,
    certification_body VARCHAR(255),
    certificate_number VARCHAR(100),
    issue_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    suspension_reason TEXT,
    suspension_date TIMESTAMPTZ,
    reinstatement_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GlobalGAP Recall Procedures
CREATE TABLE IF NOT EXISTS public.globalgap_recall_procedures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    procedure_name VARCHAR(255) NOT NULL,
    procedure_version VARCHAR(20) DEFAULT '1.0',
    responsible_person VARCHAR(255) NOT NULL,
    contact_details TEXT NOT NULL,
    trigger_criteria TEXT NOT NULL,
    notification_process TEXT NOT NULL,
    traceability_requirements TEXT NOT NULL,
    recall_team_members JSONB, -- Array of team member objects
    communication_plan TEXT,
    documentation_requirements TEXT,
    testing_frequency VARCHAR(50) DEFAULT 'annual',
    last_test_date TIMESTAMPTZ,
    next_test_date TIMESTAMPTZ,
    test_results TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GlobalGAP Risk Management Plans
CREATE TABLE IF NOT EXISTS public.globalgap_risk_management_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    risk_category VARCHAR(100) NOT NULL,
    risk_description TEXT NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    probability_score INTEGER CHECK (probability_score >= 1 AND probability_score <= 5),
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 5),
    risk_score INTEGER GENERATED ALWAYS AS (probability_score * impact_score) STORED,
    mitigation_measures TEXT NOT NULL,
    responsible_person VARCHAR(255),
    implementation_date TIMESTAMPTZ,
    review_frequency VARCHAR(50) DEFAULT 'quarterly',
    last_review_date TIMESTAMPTZ,
    next_review_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'accepted', 'transferred')),
    monitoring_indicators TEXT,
    contingency_plan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GlobalGAP Health & Safety Managers
CREATE TABLE IF NOT EXISTS public.globalgap_health_safety_managers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    manager_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    qualification_level VARCHAR(100) NOT NULL,
    certification_body VARCHAR(255),
    certificate_number VARCHAR(100),
    certificate_expiry_date TIMESTAMPTZ,
    appointment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responsibilities TEXT NOT NULL,
    training_records JSONB, -- Array of training record objects
    contact_details JSONB NOT NULL, -- Phone, email, etc.
    emergency_contact_details JSONB,
    is_active BOOLEAN DEFAULT true,
    termination_date TIMESTAMPTZ,
    termination_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_globalgap_compliance_checklist_garden_id ON globalgap_compliance_checklist(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_compliance_checklist_control_point ON globalgap_compliance_checklist(control_point);
CREATE INDEX IF NOT EXISTS idx_globalgap_compliance_checklist_status ON globalgap_compliance_checklist(compliance_status);

CREATE INDEX IF NOT EXISTS idx_globalgap_self_assessments_garden_id ON globalgap_self_assessments(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_self_assessments_date ON globalgap_self_assessments(assessment_date DESC);

CREATE INDEX IF NOT EXISTS idx_globalgap_ggn_codes_garden_id ON globalgap_ggn_codes(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_ggn_codes_ggn ON globalgap_ggn_codes(ggn_code);
CREATE INDEX IF NOT EXISTS idx_globalgap_ggn_codes_active ON globalgap_ggn_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_globalgap_recall_procedures_garden_id ON globalgap_recall_procedures(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_recall_procedures_updated ON globalgap_recall_procedures(last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_globalgap_risk_management_plans_garden_id ON globalgap_risk_management_plans(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_risk_management_plans_level ON globalgap_risk_management_plans(risk_level);
CREATE INDEX IF NOT EXISTS idx_globalgap_risk_management_plans_score ON globalgap_risk_management_plans(risk_score DESC);

CREATE INDEX IF NOT EXISTS idx_globalgap_health_safety_managers_garden_id ON globalgap_health_safety_managers(garden_id);
CREATE INDEX IF NOT EXISTS idx_globalgap_health_safety_managers_active ON globalgap_health_safety_managers(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE globalgap_compliance_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_self_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_ggn_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_recall_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_risk_management_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE globalgap_health_safety_managers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Compliance Checklist Policies
CREATE POLICY "Users can view their garden's compliance checklist" ON globalgap_compliance_checklist
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their garden's compliance checklist" ON globalgap_compliance_checklist
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- Self Assessments Policies
CREATE POLICY "Users can view their garden's self assessments" ON globalgap_self_assessments
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their garden's self assessments" ON globalgap_self_assessments
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- GGN Codes Policies
CREATE POLICY "Users can view their garden's GGN codes" ON globalgap_ggn_codes
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their garden's GGN codes" ON globalgap_ggn_codes
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- Recall Procedures Policies
CREATE POLICY "Users can view their garden's recall procedures" ON globalgap_recall_procedures
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their garden's recall procedures" ON globalgap_recall_procedures
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- Risk Management Plans Policies
CREATE POLICY "Users can view their garden's risk management plans" ON globalgap_risk_management_plans
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their garden's risk management plans" ON globalgap_risk_management_plans
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- Health & Safety Managers Policies
CREATE POLICY "Users can view their garden's health safety managers" ON globalgap_health_safety_managers
    FOR SELECT USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their garden's health safety managers" ON globalgap_health_safety_managers
    FOR ALL USING (
        garden_id IN (
            SELECT g.id FROM gardens g 
            WHERE g.user_id = auth.uid()
        )
    );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_globalgap_compliance_checklist_updated_at 
    BEFORE UPDATE ON globalgap_compliance_checklist 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_globalgap_self_assessments_updated_at 
    BEFORE UPDATE ON globalgap_self_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_globalgap_ggn_codes_updated_at 
    BEFORE UPDATE ON globalgap_ggn_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_globalgap_risk_management_plans_updated_at 
    BEFORE UPDATE ON globalgap_risk_management_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_globalgap_health_safety_managers_updated_at 
    BEFORE UPDATE ON globalgap_health_safety_managers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO globalgap_compliance_checklist (garden_id, control_point, control_point_description, compliance_criteria, compliance_status)
SELECT 
    g.id,
    'AF.1.1.1',
    'Risk Assessment Documentation',
    'Documented risk assessment covering all production activities',
    'compliant'
FROM gardens g
WHERE g.user_id IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO globalgap_compliance_checklist (garden_id, control_point, control_point_description, compliance_criteria, compliance_status)
SELECT 
    g.id,
    'AF.2.1.1',
    'Traceability System',
    'Complete traceability system from field to customer',
    'pending'
FROM gardens g
WHERE g.user_id IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'GlobalGAP tables created successfully!';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- globalgap_compliance_checklist';
    RAISE NOTICE '- globalgap_self_assessments';
    RAISE NOTICE '- globalgap_ggn_codes';
    RAISE NOTICE '- globalgap_recall_procedures';
    RAISE NOTICE '- globalgap_risk_management_plans';
    RAISE NOTICE '- globalgap_health_safety_managers';
END $$;
-- Migration completed
SELECT 'Migration completed successfully' as status;
