-- =====================================================
-- UNIFIED CERTIFICATIONS SYSTEM
-- Sistema unificato per tutte le certificazioni
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BASE CERTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'GLOBALGAP', 'HACCP', 'ORGANIC_EU', 'ORGANIC_ICEA', 'ORGANIC_CCPB',
        'BRC', 'IFS', 'ISO22000', 'GRASP', 'RAINFOREST', 'FAIRTRADE'
    )),
    status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT', 'EXPIRED', 'SUSPENDED'
    )),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    certifying_body TEXT,
    certificate_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint per garden e tipo
    UNIQUE(garden_id, type)
);

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_certifications_garden_id ON certifications(garden_id);
CREATE INDEX IF NOT EXISTS idx_certifications_type ON certifications(type);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(status);
CREATE INDEX IF NOT EXISTS idx_certifications_valid_until ON certifications(valid_until);

-- =====================================================
-- HACCP SYSTEM TABLES
-- =====================================================

-- HACCP Team Members
CREATE TABLE IF NOT EXISTS haccp_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    qualifications TEXT[] DEFAULT '{}',
    responsibilities TEXT[] DEFAULT '{}',
    contact_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hazard Analysis
CREATE TABLE IF NOT EXISTS haccp_hazard_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    process_step TEXT NOT NULL,
    hazard_type TEXT NOT NULL CHECK (hazard_type IN ('BIOLOGICAL', 'CHEMICAL', 'PHYSICAL')),
    hazard_description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    likelihood TEXT NOT NULL CHECK (likelihood IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    preventive_measures TEXT[] DEFAULT '{}',
    is_ccp BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Critical Control Points
CREATE TABLE IF NOT EXISTS haccp_critical_control_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    hazard_analysis_id UUID REFERENCES haccp_hazard_analysis(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    hazard TEXT NOT NULL,
    critical_limit TEXT NOT NULL,
    monitoring_procedure TEXT NOT NULL,
    frequency TEXT NOT NULL,
    responsibility TEXT NOT NULL,
    corrective_action TEXT NOT NULL,
    verification TEXT NOT NULL,
    records TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HACCP Systems (main table)
CREATE TABLE IF NOT EXISTS haccp_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    team_leader TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT', 'EXPIRED', 'SUSPENDED'
    )),
    last_review TIMESTAMPTZ DEFAULT NOW(),
    next_review TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
    record_retention_period TEXT DEFAULT '3 anni',
    storage_location TEXT DEFAULT 'Ufficio amministrativo',
    access_control TEXT DEFAULT 'Solo personale autorizzato',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique per garden
    UNIQUE(garden_id)
);

-- =====================================================
-- ORGANIC CERTIFICATION TABLES
-- =====================================================

-- Organic Certifications
CREATE TABLE IF NOT EXISTS organic_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    certifying_body TEXT NOT NULL CHECK (certifying_body IN (
        'ICEA', 'CCPB', 'BIOAGRICERT', 'SUOLO_E_SALUTE', 'OTHER'
    )),
    certificate_number TEXT NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    scope TEXT[] DEFAULT '{"CROP_PRODUCTION"}',
    conversion_status TEXT NOT NULL DEFAULT 'CONVENTIONAL' CHECK (conversion_status IN (
        'CONVENTIONAL', 'IN_CONVERSION_1', 'IN_CONVERSION_2', 'IN_CONVERSION_3', 'ORGANIC'
    )),
    conversion_start_date TIMESTAMPTZ,
    conversion_end_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT', 'EXPIRED', 'SUSPENDED'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique per garden
    UNIQUE(garden_id)
);

-- Organic Inputs Register
CREATE TABLE IF NOT EXISTS organic_inputs_register (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('SEED', 'FERTILIZER', 'PESTICIDE', 'EQUIPMENT', 'SERVICE')),
    product TEXT NOT NULL,
    supplier TEXT NOT NULL,
    certificate TEXT,
    quantity TEXT NOT NULL,
    cost DECIMAL(10,2),
    field TEXT,
    purpose TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organic Sales Register
CREATE TABLE IF NOT EXISTS organic_sales_register (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    product TEXT NOT NULL,
    quantity TEXT NOT NULL,
    unit TEXT NOT NULL,
    buyer TEXT NOT NULL,
    certificate TEXT,
    price DECIMAL(10,2),
    field TEXT,
    harvest_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT AND INSPECTION TABLES
-- =====================================================

-- Audit Schedules
CREATE TABLE IF NOT EXISTS audit_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    certification_type TEXT NOT NULL,
    audit_type TEXT NOT NULL CHECK (audit_type IN ('INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'RECERTIFICATION')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    auditor TEXT NOT NULL,
    scope TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN (
        'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Checklist Items
CREATE TABLE IF NOT EXISTS audit_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audit_schedules(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    requirement TEXT NOT NULL,
    evidence TEXT,
    conformity TEXT CHECK (conformity IN ('COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE', 'OBSERVATION')),
    notes TEXT,
    corrective_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRAINING AND COMPETENCE TABLES
-- =====================================================

-- Training Programs
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    certification_types TEXT[] DEFAULT '{}',
    mandatory BOOLEAN DEFAULT FALSE,
    frequency TEXT DEFAULT 'Annuale',
    duration TEXT,
    trainer TEXT,
    status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN (
        'PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Materials
CREATE TABLE IF NOT EXISTS training_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DOCUMENT', 'VIDEO', 'PRESENTATION', 'QUIZ')),
    url TEXT,
    mandatory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Participants
CREATE TABLE IF NOT EXISTS training_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    completion_date TIMESTAMPTZ,
    score INTEGER,
    certificate TEXT,
    status TEXT NOT NULL DEFAULT 'ENROLLED' CHECK (status IN (
        'ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOCUMENT MANAGEMENT TABLES
-- =====================================================

-- Certification Documents
CREATE TABLE IF NOT EXISTS certification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    certification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('PROCEDURE', 'RECORD', 'CERTIFICATE', 'REPORT', 'MANUAL')),
    version TEXT DEFAULT '1.0',
    approved_by TEXT,
    approval_date TIMESTAMPTZ DEFAULT NOW(),
    effective_date TIMESTAMPTZ DEFAULT NOW(),
    review_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'OBSOLETE')),
    file_path TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUPPLIER MANAGEMENT TABLES
-- =====================================================

-- Certified Suppliers
CREATE TABLE IF NOT EXISTS certified_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('SEED', 'FERTILIZER', 'PESTICIDE', 'EQUIPMENT', 'SERVICE')),
    status TEXT NOT NULL DEFAULT 'APPROVED' CHECK (status IN (
        'APPROVED', 'CONDITIONAL', 'SUSPENDED', 'REJECTED'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Certifications
CREATE TABLE IF NOT EXISTS supplier_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES certified_suppliers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    certificate_number TEXT NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    certifying_body TEXT NOT NULL,
    scope TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'EXPIRED', 'SUSPENDED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- HACCP indexes
CREATE INDEX IF NOT EXISTS idx_haccp_team_members_garden_id ON haccp_team_members(garden_id);
CREATE INDEX IF NOT EXISTS idx_haccp_hazard_analysis_garden_id ON haccp_hazard_analysis(garden_id);
CREATE INDEX IF NOT EXISTS idx_haccp_ccp_garden_id ON haccp_critical_control_points(garden_id);
CREATE INDEX IF NOT EXISTS idx_haccp_systems_garden_id ON haccp_systems(garden_id);

-- Organic indexes
CREATE INDEX IF NOT EXISTS idx_organic_certifications_garden_id ON organic_certifications(garden_id);
CREATE INDEX IF NOT EXISTS idx_organic_inputs_garden_id ON organic_inputs_register(garden_id);
CREATE INDEX IF NOT EXISTS idx_organic_inputs_date ON organic_inputs_register(date);
CREATE INDEX IF NOT EXISTS idx_organic_sales_garden_id ON organic_sales_register(garden_id);
CREATE INDEX IF NOT EXISTS idx_organic_sales_date ON organic_sales_register(date);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_audit_schedules_garden_id ON audit_schedules(garden_id);
CREATE INDEX IF NOT EXISTS idx_audit_schedules_date ON audit_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_audit_checklist_audit_id ON audit_checklist_items(audit_id);

-- Training indexes
CREATE INDEX IF NOT EXISTS idx_training_programs_garden_id ON training_programs(garden_id);
CREATE INDEX IF NOT EXISTS idx_training_materials_program_id ON training_materials(program_id);
CREATE INDEX IF NOT EXISTS idx_training_participants_program_id ON training_participants(program_id);

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_certification_documents_garden_id ON certification_documents(garden_id);
CREATE INDEX IF NOT EXISTS idx_certification_documents_type ON certification_documents(certification_type);

-- Supplier indexes
CREATE INDEX IF NOT EXISTS idx_certified_suppliers_garden_id ON certified_suppliers(garden_id);
CREATE INDEX IF NOT EXISTS idx_supplier_certifications_supplier_id ON supplier_certifications(supplier_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE haccp_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE haccp_hazard_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE haccp_critical_control_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE haccp_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_inputs_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_sales_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE certified_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_certifications ENABLE ROW LEVEL SECURITY;

-- Create policies for garden-based access
CREATE POLICY "Users can manage certifications for their gardens" ON certifications
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage HACCP team members for their gardens" ON haccp_team_members
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage HACCP hazard analysis for their gardens" ON haccp_hazard_analysis
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage HACCP CCPs for their gardens" ON haccp_critical_control_points
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage HACCP systems for their gardens" ON haccp_systems
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage organic certifications for their gardens" ON organic_certifications
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage organic inputs for their gardens" ON organic_inputs_register
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage organic sales for their gardens" ON organic_sales_register
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage audits for their gardens" ON audit_schedules
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage audit checklist items" ON audit_checklist_items
    FOR ALL USING (
        audit_id IN (
            SELECT id FROM audit_schedules WHERE garden_id IN (
                SELECT id FROM gardens WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage training programs for their gardens" ON training_programs
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage training materials" ON training_materials
    FOR ALL USING (
        program_id IN (
            SELECT id FROM training_programs WHERE garden_id IN (
                SELECT id FROM gardens WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage training participants" ON training_participants
    FOR ALL USING (
        program_id IN (
            SELECT id FROM training_programs WHERE garden_id IN (
                SELECT id FROM gardens WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage certification documents for their gardens" ON certification_documents
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage certified suppliers for their gardens" ON certified_suppliers
    FOR ALL USING (
        garden_id IN (
            SELECT id FROM gardens WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage supplier certifications" ON supplier_certifications
    FOR ALL USING (
        supplier_id IN (
            SELECT id FROM certified_suppliers WHERE garden_id IN (
                SELECT id FROM gardens WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Function to update certification status based on HACCP system
CREATE OR REPLACE FUNCTION update_haccp_certification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update base certification when HACCP system changes
    INSERT INTO certifications (garden_id, type, status, updated_at)
    VALUES (NEW.garden_id, 'HACCP', NEW.status, NOW())
    ON CONFLICT (garden_id, type)
    DO UPDATE SET 
        status = NEW.status,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for HACCP system updates
DROP TRIGGER IF EXISTS trigger_update_haccp_certification ON haccp_systems;
CREATE TRIGGER trigger_update_haccp_certification
    AFTER INSERT OR UPDATE ON haccp_systems
    FOR EACH ROW
    EXECUTE FUNCTION update_haccp_certification_status();

-- Function to update certification status based on organic certification
CREATE OR REPLACE FUNCTION update_organic_certification_status()
RETURNS TRIGGER AS $$
DECLARE
    cert_type TEXT;
BEGIN
    -- Determine certification type based on certifying body
    cert_type := CASE NEW.certifying_body
        WHEN 'ICEA' THEN 'ORGANIC_ICEA'
        WHEN 'CCPB' THEN 'ORGANIC_CCPB'
        ELSE 'ORGANIC_EU'
    END;
    
    -- Update base certification
    INSERT INTO certifications (garden_id, type, status, valid_from, valid_until, certifying_body, certificate_number, updated_at)
    VALUES (NEW.garden_id, cert_type, NEW.status, NEW.valid_from, NEW.valid_until, NEW.certifying_body, NEW.certificate_number, NOW())
    ON CONFLICT (garden_id, type)
    DO UPDATE SET 
        status = NEW.status,
        valid_from = NEW.valid_from,
        valid_until = NEW.valid_until,
        certifying_body = NEW.certifying_body,
        certificate_number = NEW.certificate_number,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for organic certification updates
DROP TRIGGER IF EXISTS trigger_update_organic_certification ON organic_certifications;
CREATE TRIGGER trigger_update_organic_certification
    AFTER INSERT OR UPDATE ON organic_certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_organic_certification_status();

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Function to initialize default certifications for existing gardens
CREATE OR REPLACE FUNCTION initialize_default_certifications()
RETURNS void AS $$
DECLARE
    garden_record RECORD;
BEGIN
    -- Loop through all existing gardens
    FOR garden_record IN SELECT id FROM gardens LOOP
        -- Initialize GlobalG.A.P. as compliant (already implemented)
        INSERT INTO certifications (garden_id, type, status)
        VALUES (garden_record.id, 'GLOBALGAP', 'COMPLIANT')
        ON CONFLICT (garden_id, type) DO NOTHING;
        
        -- Initialize HACCP as in progress
        INSERT INTO certifications (garden_id, type, status)
        VALUES (garden_record.id, 'HACCP', 'IN_PROGRESS')
        ON CONFLICT (garden_id, type) DO NOTHING;
        
        -- Initialize Organic as not started
        INSERT INTO certifications (garden_id, type, status)
        VALUES (garden_record.id, 'ORGANIC_EU', 'NOT_STARTED')
        ON CONFLICT (garden_id, type) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute initialization
SELECT initialize_default_certifications();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE certifications IS 'Base table for all certification types and their status';
COMMENT ON TABLE haccp_systems IS 'HACCP system implementation and management';
COMMENT ON TABLE organic_certifications IS 'Organic certification management and compliance';
COMMENT ON TABLE audit_schedules IS 'Audit and inspection scheduling and tracking';
COMMENT ON TABLE training_programs IS 'Training and competence management';
COMMENT ON TABLE certification_documents IS 'Document management for certifications';
COMMENT ON TABLE certified_suppliers IS 'Supplier qualification and certification tracking';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================