-- =====================================================
-- MINIMAL SAFE MIGRATION - OrtoMio Database
-- Migrazione minima e sicura senza funzioni complesse
-- =====================================================

-- 1. GLOBALGAP TABLES (CRITICAL - Fixes 404 errors)
CREATE TABLE IF NOT EXISTS globalgap_compliance_checklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    control_point VARCHAR(20) NOT NULL,
    control_point_description TEXT NOT NULL,
    compliance_criteria TEXT NOT NULL,
    compliance_status VARCHAR(20) DEFAULT 'pending',
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

CREATE TABLE IF NOT EXISTS globalgap_self_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assessor_name VARCHAR(255) NOT NULL,
    assessor_qualification VARCHAR(255),
    assessment_type VARCHAR(50) DEFAULT 'internal',
    overall_compliance_score DECIMAL(5,2),
    total_control_points INTEGER DEFAULT 0,
    compliant_points INTEGER DEFAULT 0,
    non_compliant_points INTEGER DEFAULT 0,
    not_applicable_points INTEGER DEFAULT 0,
    major_non_conformities INTEGER DEFAULT 0,
    minor_non_conformities INTEGER DEFAULT 0,
    recommendations TEXT,
    corrective_action_plan TEXT,
    next_assessment_date TIMESTAMPTZ,
    certification_status VARCHAR(50) DEFAULT 'in_progress',
    certificate_number VARCHAR(100),
    certificate_expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_ggn_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    ggn_code VARCHAR(13) NOT NULL,
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

CREATE TABLE IF NOT EXISTS globalgap_recall_procedures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    procedure_name VARCHAR(255) NOT NULL,
    procedure_version VARCHAR(20) DEFAULT '1.0',
    responsible_person VARCHAR(255) NOT NULL,
    contact_details TEXT NOT NULL,
    trigger_criteria TEXT NOT NULL,
    notification_process TEXT NOT NULL,
    traceability_requirements TEXT NOT NULL,
    recall_team_members JSONB,
    communication_plan TEXT,
    documentation_requirements TEXT,
    testing_frequency VARCHAR(50) DEFAULT 'annual',
    last_test_date TIMESTAMPTZ,
    next_test_date TIMESTAMPTZ,
    test_results TEXT,
    effectiveness_rating INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_risk_management_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    risk_category VARCHAR(100) NOT NULL,
    risk_description TEXT NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'medium',
    probability_score INTEGER,
    impact_score INTEGER,
    risk_score INTEGER,
    mitigation_measures TEXT NOT NULL,
    responsible_person VARCHAR(255),
    implementation_date TIMESTAMPTZ,
    review_frequency VARCHAR(50) DEFAULT 'quarterly',
    last_review_date TIMESTAMPTZ,
    next_review_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    monitoring_indicators TEXT,
    contingency_plan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_health_safety_managers (
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
    training_records JSONB,
    contact_details JSONB NOT NULL,
    emergency_contact_details JSONB,
    is_active BOOLEAN DEFAULT true,
    termination_date TIMESTAMPTZ,
    termination_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLANT OPERATIONS (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS plant_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    operation_type TEXT NOT NULL,
    operation_category TEXT,
    operation_date DATE NOT NULL,
    operation_time TIME,
    quantity DECIMAL(10,3),
    unit TEXT,
    product_name TEXT,
    concentration DECIMAL(5,2),
    effectiveness_score INTEGER,
    plant_response TEXT,
    weather_conditions JSONB,
    photos TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PLANT HARVESTS (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS plant_harvests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    harvest_date DATE NOT NULL,
    harvest_time TIME,
    quantity_kg DECIMAL(8,3) NOT NULL,
    quality_grade TEXT,
    size_category TEXT,
    ripeness_level TEXT,
    destination TEXT,
    market_value DECIMAL(8,2),
    weather_conditions JSONB,
    storage_method TEXT,
    photos TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRESCRIPTION MAPS (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS prescription_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    garden_name TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    map_type TEXT NOT NULL,
    generation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_source_period JSONB NOT NULL,
    data_sources JSONB NOT NULL DEFAULT '{}',
    total_zones INTEGER NOT NULL DEFAULT 0,
    total_area_sqm NUMERIC NOT NULL DEFAULT 0,
    export_formats JSONB NOT NULL DEFAULT '{}',
    validation_status TEXT NOT NULL DEFAULT 'pending',
    quality_score INTEGER NOT NULL DEFAULT 0,
    validation_errors JSONB,
    cost_analysis JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID
);

CREATE TABLE IF NOT EXISTS prescription_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_map_id UUID NOT NULL REFERENCES prescription_maps(id) ON DELETE CASCADE,
    zone_number INTEGER NOT NULL,
    zone_name TEXT NOT NULL,
    zone_type TEXT NOT NULL DEFAULT 'uniform',
    geometry JSONB NOT NULL,
    centroid JSONB NOT NULL,
    area_sqm NUMERIC NOT NULL,
    prescription JSONB NOT NULL,
    source_data JSONB NOT NULL DEFAULT '{}',
    data_quality INTEGER NOT NULL DEFAULT 0,
    confidence INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescription_map_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_map_id UUID NOT NULL REFERENCES prescription_maps(id) ON DELETE CASCADE,
    export_format TEXT NOT NULL,
    export_configuration JSONB NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_path TEXT,
    download_url TEXT,
    export_status TEXT NOT NULL DEFAULT 'pending',
    export_progress INTEGER DEFAULT 0,
    error_message TEXT,
    download_count INTEGER NOT NULL DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. OPERATION SYNC LOG (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS operation_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL,
    source_operation_id UUID NOT NULL,
    plants_affected INTEGER NOT NULL DEFAULT 0,
    operations_created INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sync_status TEXT NOT NULL DEFAULT 'completed',
    error_message TEXT,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ADD MISSING COLUMNS SAFELY (Only if they don't exist)
DO $$ 
BEGIN
    -- Add field_row_id to watering_logs if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watering_logs' AND column_name = 'field_row_id') THEN
        ALTER TABLE watering_logs ADD COLUMN field_row_id UUID;
    END IF;
    
    -- Add plant_ids to watering_logs if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watering_logs' AND column_name = 'plant_ids') THEN
        ALTER TABLE watering_logs ADD COLUMN plant_ids UUID[];
    END IF;
    
    -- Add field_row_id to fertilizer_application_logs if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fertilizer_application_logs' AND column_name = 'field_row_id') THEN
        ALTER TABLE fertilizer_application_logs ADD COLUMN field_row_id UUID;
    END IF;
    
    -- Add plant_ids to fertilizer_application_logs if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fertilizer_application_logs' AND column_name = 'plant_ids') THEN
        ALTER TABLE fertilizer_application_logs ADD COLUMN plant_ids UUID[];
    END IF;
    
    -- Add field_row_id to treatment_register if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_register' AND column_name = 'field_row_id') THEN
        ALTER TABLE treatment_register ADD COLUMN field_row_id UUID;
    END IF;
    
    -- Add plant_ids to treatment_register if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_register' AND column_name = 'plant_ids') THEN
        ALTER TABLE treatment_register ADD COLUMN plant_ids UUID[];
    END IF;
END $$;

-- 7. CREATE INDIVIDUAL_PLANTS VIEW (if garden_plants exists)
DO $$ 
BEGIN
    -- If garden_plants exists, create individual_plants view
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garden_plants') THEN
        CREATE OR REPLACE VIEW individual_plants AS SELECT * FROM garden_plants;
        RAISE NOTICE 'Created individual_plants view pointing to existing garden_plants table';
    END IF;
END $$;

-- 8. INSERT SAMPLE DATA SAFELY
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

-- Success message
SELECT 'Minimal Safe Migration Applied Successfully!' as status,
       'All critical tables created' as result,
       'GlobalGAP compliance system ready' as globalgap_status,
       'Plant operations system ready' as plant_status,
       'Prescription maps system ready' as prescription_status;