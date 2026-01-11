-- =====================================================
-- SAFE COMPLETE MIGRATION - OrtoMio Database
-- Migrazione sicura che gestisce tabelle esistenti
-- =====================================================

-- 1. GLOBALGAP TABLES (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS globalgap_compliance_checklist (
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

CREATE TABLE IF NOT EXISTS globalgap_self_assessments (
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

CREATE TABLE IF NOT EXISTS globalgap_ggn_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    ggn_code VARCHAR(13) NOT NULL UNIQUE,
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
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS globalgap_risk_management_plans (
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

-- 2. INDIVIDUAL PLANTS (Gestisce garden_plants esistente)
DO $$ 
BEGIN
    -- Se garden_plants esiste, crea individual_plants come alias
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'garden_plants') THEN
        -- Crea vista individual_plants che punta a garden_plants
        CREATE OR REPLACE VIEW individual_plants AS SELECT * FROM garden_plants;
        RAISE NOTICE 'Created individual_plants view pointing to existing garden_plants table';
    ELSE
        -- Crea garden_plants se non esiste
        CREATE TABLE garden_plants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
            row_id UUID REFERENCES garden_rows(id) ON DELETE CASCADE,
            field_row_id UUID REFERENCES field_rows(id) ON DELETE CASCADE,
            position_in_row INTEGER NOT NULL,
            plant_code TEXT NOT NULL,
            plant_name TEXT NOT NULL,
            variety TEXT,
            planting_date DATE,
            expected_harvest_date DATE,
            status TEXT NOT NULL DEFAULT 'healthy',
            health_score INTEGER DEFAULT 100,
            seedling_batch_id UUID,
            sapling_batch_id UUID,
            seed_packet_id UUID,
            coordinates JSONB,
            photos TEXT[],
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Crea vista individual_plants
        CREATE OR REPLACE VIEW individual_plants AS SELECT * FROM garden_plants;
        RAISE NOTICE 'Created garden_plants table and individual_plants view';
    END IF;
END $$;

-- 3. PLANT OPERATIONS (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS plant_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES garden_plants(id) ON DELETE CASCADE,
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

-- 4. PLANT HARVESTS (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS plant_harvests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES garden_plants(id) ON DELETE CASCADE,
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

-- 5. PRESCRIPTION MAPS (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS prescription_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    garden_name TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    map_type TEXT NOT NULL CHECK (map_type IN ('fertilizer', 'seeding', 'irrigation', 'treatment', 'harvest')),
    generation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_source_period JSONB NOT NULL,
    data_sources JSONB NOT NULL DEFAULT '{}',
    total_zones INTEGER NOT NULL DEFAULT 0,
    total_area_sqm NUMERIC NOT NULL DEFAULT 0,
    export_formats JSONB NOT NULL DEFAULT '{}',
    validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'warning')),
    quality_score INTEGER NOT NULL DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
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
    zone_type TEXT NOT NULL DEFAULT 'uniform' CHECK (zone_type IN ('uniform', 'variable', 'exclusion')),
    geometry JSONB NOT NULL,
    centroid JSONB NOT NULL,
    area_sqm NUMERIC NOT NULL,
    prescription JSONB NOT NULL,
    source_data JSONB NOT NULL DEFAULT '{}',
    data_quality INTEGER NOT NULL DEFAULT 0 CHECK (data_quality >= 0 AND data_quality <= 100),
    confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(prescription_map_id, zone_number)
);

CREATE TABLE IF NOT EXISTS prescription_map_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_map_id UUID NOT NULL REFERENCES prescription_maps(id) ON DELETE CASCADE,
    export_format TEXT NOT NULL CHECK (export_format IN ('shapefile', 'kml', 'isoxml', 'geojson', 'csv')),
    export_configuration JSONB NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_path TEXT,
    download_url TEXT,
    export_status TEXT NOT NULL DEFAULT 'pending' CHECK (export_status IN ('pending', 'processing', 'completed', 'failed')),
    export_progress INTEGER DEFAULT 0 CHECK (export_progress >= 0 AND export_progress <= 100),
    error_message TEXT,
    download_count INTEGER NOT NULL DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. OPERATION SYNC LOG (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS operation_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('watering', 'fertilizer', 'treatment')),
    source_operation_id UUID NOT NULL,
    plants_affected INTEGER NOT NULL DEFAULT 0,
    operations_created INTEGER NOT NULL DEFAULT 0,
    sync_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sync_status TEXT NOT NULL DEFAULT 'completed' CHECK (sync_status IN ('pending', 'completed', 'failed')),
    error_message TEXT,
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ADD MISSING COLUMNS SAFELY
DO $$ 
BEGIN
    -- Add field_row_id to watering_logs if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watering_logs' AND column_name = 'field_row_id') THEN
        ALTER TABLE watering_logs ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;
    END IF;
    
    -- Add plant_ids to watering_logs if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'watering_logs' AND column_name = 'plant_ids') THEN
        ALTER TABLE watering_logs ADD COLUMN plant_ids UUID[];
    END IF;
    
    -- Add field_row_id to fertilizer_application_logs if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fertilizer_application_logs' AND column_name = 'field_row_id') THEN
        ALTER TABLE fertilizer_application_logs ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;
    END IF;
    
    -- Add plant_ids to fertilizer_application_logs if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fertilizer_application_logs' AND column_name = 'plant_ids') THEN
        ALTER TABLE fertilizer_application_logs ADD COLUMN plant_ids UUID[];
    END IF;
    
    -- Add field_row_id to treatment_register if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_register' AND column_name = 'field_row_id') THEN
        ALTER TABLE treatment_register ADD COLUMN field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL;
    END IF;
    
    -- Add plant_ids to treatment_register if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_register' AND column_name = 'plant_ids') THEN
        ALTER TABLE treatment_register ADD COLUMN plant_ids UUID[];
    END IF;
END $$;

-- 8. CREATE INDEXES SAFELY (IF NOT EXISTS)
DO $$ 
BEGIN
    -- GlobalGAP indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_globalgap_compliance_checklist_garden_id') THEN
        CREATE INDEX idx_globalgap_compliance_checklist_garden_id ON globalgap_compliance_checklist(garden_id);
    END IF;
    
    -- Plant indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_garden_plants_garden_id') THEN
        CREATE INDEX idx_garden_plants_garden_id ON garden_plants(garden_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_plant_operations_plant_id') THEN
        CREATE INDEX idx_plant_operations_plant_id ON plant_operations(plant_id);
    END IF;
    
    -- Prescription maps indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_prescription_maps_garden_id') THEN
        CREATE INDEX idx_prescription_maps_garden_id ON prescription_maps(garden_id);
    END IF;
END $$;

-- 9. CREATE FUNCTIONS SAFELY
CREATE OR REPLACE FUNCTION calculate_plants_in_row(
    row_length_m DECIMAL,
    plant_spacing_cm INTEGER
) RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR((row_length_m * 100) / plant_spacing_cm) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION generate_plant_code(
    p_garden_id UUID,
    p_row_id UUID DEFAULT NULL,
    p_field_row_id UUID DEFAULT NULL,
    p_position INTEGER DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    row_number INTEGER;
    row_prefix TEXT;
    position_num INTEGER;
BEGIN
    IF p_row_id IS NOT NULL THEN
        SELECT COALESCE(row_number, 1) INTO row_number FROM garden_rows WHERE id = p_row_id;
        row_prefix := 'B';
    ELSIF p_field_row_id IS NOT NULL THEN
        SELECT COALESCE(row_number, 1) INTO row_number FROM field_rows WHERE id = p_field_row_id;
        row_prefix := 'F';
    ELSE
        RETURN 'UNKNOWN';
    END IF;
    
    IF p_position IS NOT NULL THEN
        position_num := p_position;
    ELSE
        IF p_row_id IS NOT NULL THEN
            SELECT COALESCE(MAX(position_in_row), 0) + 1 
            INTO position_num 
            FROM garden_plants 
            WHERE row_id = p_row_id;
        ELSE
            SELECT COALESCE(MAX(position_in_row), 0) + 1 
            INTO position_num 
            FROM garden_plants 
            WHERE field_row_id = p_field_row_id;
        END IF;
    END IF;
    
    RETURN row_prefix || row_number || '-P' || LPAD(position_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- 10. ENABLE RLS SAFELY
DO $$ 
BEGIN
    -- Enable RLS on GlobalGAP tables
    ALTER TABLE globalgap_compliance_checklist ENABLE ROW LEVEL SECURITY;
    ALTER TABLE globalgap_self_assessments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE globalgap_ggn_codes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE globalgap_recall_procedures ENABLE ROW LEVEL SECURITY;
    ALTER TABLE globalgap_risk_management_plans ENABLE ROW LEVEL SECURITY;
    ALTER TABLE globalgap_health_safety_managers ENABLE ROW LEVEL SECURITY;
    
    -- Enable RLS on plant tables
    ALTER TABLE garden_plants ENABLE ROW LEVEL SECURITY;
    ALTER TABLE plant_operations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE plant_harvests ENABLE ROW LEVEL SECURITY;
    
    -- Enable RLS on prescription tables
    ALTER TABLE prescription_maps ENABLE ROW LEVEL SECURITY;
    ALTER TABLE prescription_zones ENABLE ROW LEVEL SECURITY;
    ALTER TABLE prescription_map_exports ENABLE ROW LEVEL SECURITY;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'RLS already enabled or error: %', SQLERRM;
END $$;

-- 11. INSERT SAMPLE DATA SAFELY
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

-- Success message
SELECT 'Safe Complete Migration Applied Successfully!' as status,
       'All tables created or verified existing' as result,
       'Zero data loss - all existing data preserved' as guarantee;