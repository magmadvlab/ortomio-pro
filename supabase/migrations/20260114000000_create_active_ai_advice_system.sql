-- =====================================================
-- ACTIVE AI ADVICE SYSTEM
-- Sistema integrato per consigli AI attivi e tracciabili
-- =====================================================

-- =====================================================
-- 1. CROP ROTATION TRACKING
-- =====================================================

-- Tabella per tracciare la storia delle colture per filare
CREATE TABLE IF NOT EXISTS crop_rotation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  field_row_id UUID REFERENCES field_rows(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
  
  -- Dati coltura
  plant_variety_id UUID REFERENCES plant_varieties(id),
  plant_name TEXT NOT NULL,
  plant_family TEXT NOT NULL, -- Solanaceae, Leguminose, Brassicaceae, etc.
  
  -- Periodo coltivazione
  planted_date DATE NOT NULL,
  harvest_date DATE,
  season TEXT NOT NULL, -- Primavera, Estate, Autunno, Inverno
  year INTEGER NOT NULL,
  
  -- Risultati
  yield_kg DECIMAL(10,2),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  
  -- Problemi riscontrati
  diseases TEXT[], -- Array di malattie riscontrate
  pests TEXT[], -- Array di parassiti riscontrati
  nutrient_deficiencies TEXT[], -- Carenze nutrizionali
  
  -- Metadati
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per piani di rotazione suggeriti
CREATE TABLE IF NOT EXISTS crop_rotation_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  field_row_id UUID REFERENCES field_rows(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
  
  -- Piano rotazione
  current_crop TEXT NOT NULL,
  current_family TEXT NOT NULL,
  suggested_next_crops JSONB NOT NULL, -- Array di colture suggerite con score
  rotation_cycle INTEGER NOT NULL DEFAULT 4, -- Anni del ciclo
  
  -- Ragioni
  reasoning TEXT NOT NULL,
  benefits TEXT[],
  risks_to_avoid TEXT[],
  
  -- AI confidence
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'SUGGESTED' CHECK (status IN ('SUGGESTED', 'ACCEPTED', 'REJECTED', 'COMPLETED')),
  accepted_crop TEXT,
  accepted_date DATE,
  
  -- Metadati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. BIOLOGICAL CONTROL CHECKLISTS
-- =====================================================

-- Tabella per checklist controllo biologico
CREATE TABLE IF NOT EXISTS biological_control_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Informazioni checklist
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'INSETTI_BENEFICI', 'TRAPPOLE', 'BARRIERE_FISICHE', 
    'ROTAZIONE', 'CONSOCIAZIONE', 'MONITORAGGIO'
  )),
  
  -- Priorità e frequenza
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  frequency TEXT NOT NULL DEFAULT 'WEEKLY' CHECK (frequency IN (
    'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'SEASONAL', 'YEARLY', 'ONE_TIME'
  )),
  
  -- Periodo applicabilità
  applicable_months INTEGER[], -- Array di mesi (1-12)
  applicable_seasons TEXT[], -- Array di stagioni
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'
  )),
  
  -- Date
  due_date DATE,
  completed_date DATE,
  completed_by TEXT,
  
  -- Risultati
  notes TEXT,
  effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  evidence_photos TEXT[], -- Array di URL foto
  
  -- Certificazione
  required_for_certification BOOLEAN DEFAULT false,
  certification_types TEXT[], -- Array di certificazioni (BIO, GLOBALGAP, etc.)
  
  -- Metadati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sotto-task per checklist
CREATE TABLE IF NOT EXISTS biological_control_subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES biological_control_checklists(id) ON DELETE CASCADE,
  
  -- Task info
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'
  )),
  
  -- Risultati
  completed_date DATE,
  completed_by TEXT,
  notes TEXT,
  evidence_photos TEXT[],
  
  -- Metadati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. COMPOSTER TRACKING
-- =====================================================

-- Tabella per compostiere
CREATE TABLE IF NOT EXISTS composters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Informazioni compostiera
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('HEAP', 'BIN', 'TUMBLER', 'WORM', 'BOKASHI')),
  capacity_liters INTEGER NOT NULL,
  location TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FULL', 'MATURING', 'READY', 'INACTIVE')),
  
  -- Date
  started_date DATE NOT NULL,
  estimated_ready_date DATE,
  
  -- Metadati
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per aggiunte al compost
CREATE TABLE IF NOT EXISTS composter_additions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  composter_id UUID NOT NULL REFERENCES composters(id) ON DELETE CASCADE,
  
  -- Materiale aggiunto
  material_type TEXT NOT NULL CHECK (material_type IN (
    'GREEN_WASTE', 'BROWN_WASTE', 'FOOD_SCRAPS', 'MANURE', 
    'PAPER', 'CARDBOARD', 'WOOD_CHIPS', 'LEAVES', 'GRASS', 'OTHER'
  )),
  material_description TEXT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  
  -- Classificazione C/N ratio
  carbon_nitrogen_ratio TEXT CHECK (carbon_nitrogen_ratio IN ('HIGH_CARBON', 'HIGH_NITROGEN', 'BALANCED')),
  
  -- Sicurezza
  is_diseased BOOLEAN DEFAULT false,
  disease_type TEXT,
  is_treated_chemically BOOLEAN DEFAULT false,
  treatment_type TEXT,
  
  -- Validazione AI
  ai_validated BOOLEAN DEFAULT false,
  ai_warning TEXT,
  ai_recommendation TEXT,
  
  -- Data
  added_date DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT,
  
  -- Metadati
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per monitoraggio compost
CREATE TABLE IF NOT EXISTS composter_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  composter_id UUID NOT NULL REFERENCES composters(id) ON DELETE CASCADE,
  
  -- Misurazioni
  temperature_celsius DECIMAL(5,2),
  moisture_level TEXT CHECK (moisture_level IN ('TOO_DRY', 'OPTIMAL', 'TOO_WET')),
  odor TEXT CHECK (odor IN ('NONE', 'EARTHY', 'AMMONIA', 'ROTTEN', 'OTHER')),
  
  -- Attività
  turned BOOLEAN DEFAULT false,
  watered BOOLEAN DEFAULT false,
  material_added BOOLEAN DEFAULT false,
  
  -- Osservazioni
  observations TEXT,
  issues TEXT[],
  actions_taken TEXT[],
  
  -- AI analysis
  ai_health_score INTEGER CHECK (ai_health_score >= 0 AND ai_health_score <= 100),
  ai_recommendations TEXT[],
  
  -- Data
  monitoring_date DATE NOT NULL DEFAULT CURRENT_DATE,
  monitored_by TEXT,
  
  -- Metadati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. WINTER PROTECTION CHECKLISTS
-- =====================================================

-- Tabella per checklist protezione invernale
CREATE TABLE IF NOT EXISTS winter_protection_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
  field_row_id UUID REFERENCES field_rows(id) ON DELETE CASCADE,
  
  -- Trigger
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('MANUAL', 'WEATHER_FORECAST', 'TEMPERATURE_ALERT', 'SEASONAL')),
  trigger_details JSONB, -- Dettagli meteo che hanno triggerato
  
  -- Informazioni protezione
  protection_type TEXT NOT NULL CHECK (protection_type IN (
    'FROST_CLOTH', 'MULCHING', 'COLD_FRAME', 'GREENHOUSE', 
    'ROW_COVER', 'CLOCHES', 'SOIL_COVER', 'PRUNING', 'OTHER'
  )),
  
  -- Urgenza
  urgency TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  frost_date DATE, -- Data prevista gelata
  min_temperature_expected DECIMAL(5,2),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'
  )),
  
  -- Date
  due_date DATE NOT NULL,
  completed_date DATE,
  completed_by TEXT,
  
  -- Risultati
  effectiveness TEXT CHECK (effectiveness IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'FAILED')),
  damage_assessment TEXT,
  notes TEXT,
  photos TEXT[],
  
  -- Metadati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sotto-task per protezione invernale
CREATE TABLE IF NOT EXISTS winter_protection_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES winter_protection_checklists(id) ON DELETE CASCADE,
  
  -- Task info
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  
  -- Materiali necessari
  materials_needed TEXT[],
  estimated_time_minutes INTEGER,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED'
  )),
  
  -- Risultati
  completed_date DATE,
  completed_by TEXT,
  notes TEXT,
  photos TEXT[],
  
  -- Metadati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Crop rotation indexes
CREATE INDEX idx_crop_rotation_history_garden ON crop_rotation_history(garden_id);
CREATE INDEX idx_crop_rotation_history_row ON crop_rotation_history(field_row_id);
CREATE INDEX idx_crop_rotation_history_year ON crop_rotation_history(year);
CREATE INDEX idx_crop_rotation_plans_garden ON crop_rotation_plans(garden_id);
CREATE INDEX idx_crop_rotation_plans_status ON crop_rotation_plans(status);

-- Biological control indexes
CREATE INDEX idx_biological_control_garden ON biological_control_checklists(garden_id);
CREATE INDEX idx_biological_control_status ON biological_control_checklists(status);
CREATE INDEX idx_biological_control_category ON biological_control_checklists(category);
CREATE INDEX idx_biological_control_subtasks_checklist ON biological_control_subtasks(checklist_id);

-- Composter indexes
CREATE INDEX idx_composters_garden ON composters(garden_id);
CREATE INDEX idx_composters_status ON composters(status);
CREATE INDEX idx_composter_additions_composter ON composter_additions(composter_id);
CREATE INDEX idx_composter_additions_date ON composter_additions(added_date);
CREATE INDEX idx_composter_monitoring_composter ON composter_monitoring(composter_id);
CREATE INDEX idx_composter_monitoring_date ON composter_monitoring(monitoring_date);

-- Winter protection indexes
CREATE INDEX idx_winter_protection_garden ON winter_protection_checklists(garden_id);
CREATE INDEX idx_winter_protection_status ON winter_protection_checklists(status);
CREATE INDEX idx_winter_protection_urgency ON winter_protection_checklists(urgency);
CREATE INDEX idx_winter_protection_tasks_checklist ON winter_protection_tasks(checklist_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE crop_rotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_rotation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE biological_control_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE biological_control_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE composters ENABLE ROW LEVEL SECURITY;
ALTER TABLE composter_additions ENABLE ROW LEVEL SECURITY;
ALTER TABLE composter_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE winter_protection_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE winter_protection_tasks ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for authenticated users - refine based on garden ownership)
CREATE POLICY "Users can manage crop rotation history" ON crop_rotation_history FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage crop rotation plans" ON crop_rotation_plans FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage biological control" ON biological_control_checklists FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage biological control subtasks" ON biological_control_subtasks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage composters" ON composters FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage composter additions" ON composter_additions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage composter monitoring" ON composter_monitoring FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage winter protection" ON winter_protection_checklists FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage winter protection tasks" ON winter_protection_tasks FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Funzione per calcolare il prossimo raccolto suggerito basato sulla storia
CREATE OR REPLACE FUNCTION suggest_next_crop_rotation(
  p_field_row_id UUID,
  p_garden_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_history JSONB;
  v_last_families TEXT[];
  v_suggestions JSONB;
BEGIN
  -- Get last 3 crops from history
  SELECT ARRAY_AGG(plant_family ORDER BY harvest_date DESC)
  INTO v_last_families
  FROM crop_rotation_history
  WHERE (field_row_id = p_field_row_id OR (field_row_id IS NULL AND garden_id = p_garden_id))
  AND harvest_date IS NOT NULL
  LIMIT 3;
  
  -- Build suggestions based on rotation rules
  -- This is simplified - in production would use ML model
  v_suggestions := jsonb_build_object(
    'avoid_families', v_last_families,
    'recommended_families', ARRAY['Leguminose', 'Brassicaceae', 'Cucurbitaceae'],
    'reasoning', 'Rotazione consigliata per evitare depauperamento del suolo'
  );
  
  RETURN v_suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per validare materiale compost
CREATE OR REPLACE FUNCTION validate_compost_material(
  p_material_description TEXT,
  p_is_diseased BOOLEAN,
  p_is_treated_chemically BOOLEAN
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_warning TEXT;
  v_recommendation TEXT;
BEGIN
  -- Check for diseased material
  IF p_is_diseased THEN
    v_warning := 'ATTENZIONE: Materiale infetto rilevato. Non aggiungere al compost.';
    v_recommendation := 'Smaltire il materiale infetto separatamente per evitare diffusione malattie.';
  END IF;
  
  -- Check for chemically treated material
  IF p_is_treated_chemically THEN
    v_warning := COALESCE(v_warning || ' ', '') || 'ATTENZIONE: Materiale trattato chimicamente.';
    v_recommendation := COALESCE(v_recommendation || ' ', '') || 'Evitare materiale trattato per compost biologico.';
  END IF;
  
  v_result := jsonb_build_object(
    'is_safe', NOT (p_is_diseased OR p_is_treated_chemically),
    'warning', v_warning,
    'recommendation', v_recommendation
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per creare checklist protezione invernale da previsioni meteo
CREATE OR REPLACE FUNCTION create_winter_protection_from_forecast(
  p_garden_id UUID,
  p_min_temperature DECIMAL,
  p_frost_date DATE
) RETURNS UUID AS $$
DECLARE
  v_checklist_id UUID;
  v_urgency TEXT;
BEGIN
  -- Determine urgency based on temperature
  IF p_min_temperature <= -5 THEN
    v_urgency := 'CRITICAL';
  ELSIF p_min_temperature <= -2 THEN
    v_urgency := 'HIGH';
  ELSIF p_min_temperature <= 0 THEN
    v_urgency := 'MEDIUM';
  ELSE
    v_urgency := 'LOW';
  END IF;
  
  -- Create checklist
  INSERT INTO winter_protection_checklists (
    garden_id,
    triggered_by,
    trigger_details,
    protection_type,
    urgency,
    frost_date,
    min_temperature_expected,
    due_date
  ) VALUES (
    p_garden_id,
    'WEATHER_FORECAST',
    jsonb_build_object(
      'min_temperature', p_min_temperature,
      'frost_date', p_frost_date
    ),
    'FROST_CLOTH',
    v_urgency,
    p_frost_date,
    p_min_temperature,
    p_frost_date - INTERVAL '1 day'
  )
  RETURNING id INTO v_checklist_id;
  
  -- Create default tasks
  INSERT INTO winter_protection_tasks (checklist_id, title, description, order_index)
  VALUES
    (v_checklist_id, 'Preparare tessuto non tessuto', 'Verificare disponibilità e condizioni del tessuto', 1),
    (v_checklist_id, 'Coprire piante sensibili', 'Coprire pomodori, peperoni, melanzane', 2),
    (v_checklist_id, 'Proteggere radici con pacciamatura', 'Aggiungere strato di paglia o foglie', 3),
    (v_checklist_id, 'Verificare copertura', 'Controllare che tutte le piante siano protette', 4);
  
  RETURN v_checklist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
