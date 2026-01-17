-- Advanced Nutrition System Migration
-- Creates comprehensive nutrition and treatment management with products, schedules, and analytics

-- Create fertilizer_products table
CREATE TABLE IF NOT EXISTS fertilizer_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  product_code TEXT,
  
  -- Product Classification
  fertilizer_type TEXT CHECK (fertilizer_type IN ('organic', 'mineral', 'chemical', 'mixed', 'bio_stimulant')) NOT NULL,
  category TEXT CHECK (category IN ('base', 'foliar', 'liquid', 'granular', 'slow_release', 'water_soluble')) NOT NULL,
  
  -- Nutritional Composition
  npk_ratio TEXT, -- e.g., "20-20-20"
  nitrogen_percentage DECIMAL(5,2),
  phosphorus_percentage DECIMAL(5,2),
  potassium_percentage DECIMAL(5,2),
  
  -- Secondary Nutrients
  calcium_percentage DECIMAL(5,2),
  magnesium_percentage DECIMAL(5,2),
  sulfur_percentage DECIMAL(5,2),
  micro_nutrients JSONB, -- array of {element, percentage, form}
  
  -- Application Details
  recommended_dosage DECIMAL(8,2) NOT NULL,
  dosage_unit TEXT CHECK (dosage_unit IN ('g_per_sqm', 'ml_per_liter', 'kg_per_ha', 'l_per_ha')) NOT NULL,
  application_method TEXT CHECK (application_method IN ('soil', 'foliar', 'fertigation', 'granular_broadcast', 'side_dress')) NOT NULL,
  
  -- Compatibility and Restrictions
  ph_range_min DECIMAL(3,1),
  ph_range_max DECIMAL(3,1),
  compatible_products TEXT[], -- array of product IDs
  incompatible_products TEXT[], -- array of product IDs
  organic_approved BOOLEAN DEFAULT FALSE,
  
  -- Inventory Management
  current_stock DECIMAL(10,2) DEFAULT 0,
  stock_unit TEXT CHECK (stock_unit IN ('kg', 'liters', 'bags', 'bottles')),
  cost_per_unit DECIMAL(8,2),
  supplier TEXT,
  purchase_date DATE,
  expiry_date DATE,
  
  -- Usage Guidelines
  application_frequency TEXT,
  seasonal_restrictions TEXT[],
  crop_specific_notes TEXT,
  safety_notes TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatment_products table
CREATE TABLE IF NOT EXISTS treatment_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  product_code TEXT,
  
  -- Product Classification
  treatment_type TEXT CHECK (treatment_type IN ('pesticide', 'fungicide', 'herbicide', 'insecticide', 'bactericide', 'nematicide')) NOT NULL,
  active_ingredient TEXT NOT NULL,
  concentration DECIMAL(8,2) NOT NULL,
  concentration_unit TEXT CHECK (concentration_unit IN ('percentage', 'g_per_liter', 'mg_per_liter')) NOT NULL,
  
  -- Application Details
  recommended_dosage DECIMAL(8,2) NOT NULL,
  dosage_unit TEXT CHECK (dosage_unit IN ('ml_per_liter', 'g_per_liter', 'l_per_ha', 'kg_per_ha')) NOT NULL,
  application_method TEXT CHECK (application_method IN ('spray', 'soil_drench', 'seed_treatment', 'trunk_injection', 'fumigation')) NOT NULL,
  
  -- Target and Efficacy
  target_pests TEXT[],
  target_diseases TEXT[],
  target_weeds TEXT[],
  efficacy_rating INTEGER CHECK (efficacy_rating >= 1 AND efficacy_rating <= 10),
  
  -- Safety and Compliance
  organic_approved BOOLEAN DEFAULT FALSE,
  preharvest_interval_days INTEGER NOT NULL DEFAULT 0,
  reentry_interval_hours INTEGER NOT NULL DEFAULT 0,
  toxicity_class TEXT CHECK (toxicity_class IN ('I', 'II', 'III', 'IV')),
  
  -- Environmental Considerations
  bee_hazard BOOLEAN DEFAULT FALSE,
  aquatic_hazard BOOLEAN DEFAULT FALSE,
  soil_persistence TEXT CHECK (soil_persistence IN ('low', 'medium', 'high')),
  
  -- Resistance Management
  mode_of_action TEXT,
  resistance_group TEXT,
  max_applications_per_season INTEGER,
  
  -- Inventory Management
  current_stock DECIMAL(10,2) DEFAULT 0,
  stock_unit TEXT CHECK (stock_unit IN ('liters', 'kg', 'bottles', 'bags')),
  cost_per_unit DECIMAL(8,2),
  supplier TEXT,
  purchase_date DATE,
  expiry_date DATE,
  
  -- Usage Guidelines
  weather_restrictions TEXT[],
  temperature_range_min DECIMAL(4,1),
  temperature_range_max DECIMAL(4,1),
  wind_speed_limit DECIMAL(4,1),
  rain_fast_hours INTEGER,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition_treatments table
CREATE TABLE IF NOT EXISTS nutrition_treatments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Location Targeting
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
  field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL,
  section_id UUID REFERENCES field_row_sections(id) ON DELETE SET NULL,
  plant_ids UUID[], -- for individual plant treatments
  
  -- Treatment Details
  treatment_type TEXT CHECK (treatment_type IN ('fertilization', 'pest_control', 'disease_control', 'weed_control', 'growth_regulation')) NOT NULL,
  product_id UUID, -- can reference either fertilizer_products or treatment_products
  product_name TEXT NOT NULL, -- denormalized for performance
  product_type TEXT CHECK (product_type IN ('fertilizer', 'treatment')) NOT NULL,
  
  -- Application Configuration
  dosage DECIMAL(8,2) NOT NULL,
  dosage_unit TEXT NOT NULL,
  application_method TEXT NOT NULL,
  mixing_instructions TEXT,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  actual_application_date DATE,
  application_time TIME,
  
  -- Environmental Conditions
  weather_conditions JSONB, -- WeatherConditions object
  soil_conditions JSONB, -- SoilConditions object
  
  -- Execution Details
  operator_id UUID REFERENCES auth.users(id),
  operator_name TEXT,
  equipment_used TEXT,
  application_duration_minutes INTEGER,
  
  -- Quality Control
  calibration_check BOOLEAN DEFAULT FALSE,
  mixing_ratio TEXT,
  actual_coverage DECIMAL(10,2), -- area covered in m²
  
  -- Results and Monitoring
  effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 10),
  side_effects TEXT[],
  plant_response TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  
  -- Compliance and Documentation
  organic_compliant BOOLEAN DEFAULT TRUE,
  certification_notes TEXT,
  photos_before_ids TEXT[],
  photos_after_ids TEXT[],
  
  -- Cost Tracking
  product_cost DECIMAL(8,2),
  labor_cost DECIMAL(8,2),
  equipment_cost DECIMAL(8,2),
  total_cost DECIMAL(8,2),
  
  notes TEXT,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'postponed')) DEFAULT 'planned',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition_schedules table
CREATE TABLE IF NOT EXISTS nutrition_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Target Area
  zone_id UUID REFERENCES garden_zones(id) ON DELETE SET NULL,
  field_row_id UUID REFERENCES field_rows(id) ON DELETE SET NULL,
  section_id UUID REFERENCES field_row_sections(id) ON DELETE SET NULL,
  crop_type TEXT,
  
  -- Schedule Configuration
  schedule_type TEXT CHECK (schedule_type IN ('recurring', 'seasonal', 'growth_stage', 'conditional')) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Recurring Schedule
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')),
  interval_days INTEGER, -- for custom frequency
  days_of_week INTEGER[], -- 0=Sunday
  time_slots TIME[], -- HH:MM format
  
  -- Seasonal Schedule
  start_date DATE,
  end_date DATE,
  seasonal_pattern TEXT CHECK (seasonal_pattern IN ('spring', 'summer', 'autumn', 'winter', 'growing_season')),
  
  -- Growth Stage Schedule
  growth_stages JSONB, -- array of GrowthStageSchedule objects
  
  -- Conditional Triggers
  conditions JSONB, -- ScheduleConditions object
  
  -- Treatment Configuration
  treatments JSONB NOT NULL, -- array of ScheduledTreatment objects
  
  -- Execution Tracking
  last_execution_date DATE,
  next_execution_date DATE,
  execution_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_compatibility table
CREATE TABLE IF NOT EXISTS product_compatibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product1_id UUID NOT NULL,
  product2_id UUID NOT NULL,
  compatibility_type TEXT CHECK (compatibility_type IN ('compatible', 'incompatible', 'caution', 'synergistic')) NOT NULL,
  notes TEXT,
  test_results TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(product1_id, product2_id)
);

-- Create treatment_history table
CREATE TABLE IF NOT EXISTS treatment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_id UUID NOT NULL REFERENCES nutrition_treatments(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Historical Data
  application_date DATE NOT NULL,
  product_used TEXT NOT NULL,
  dosage_applied DECIMAL(8,2) NOT NULL,
  areas_treated TEXT[] NOT NULL,
  
  -- Results
  effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 10) NOT NULL,
  cost_incurred DECIMAL(8,2) NOT NULL,
  side_effects_observed TEXT[],
  
  -- Environmental Impact
  weather_at_application JSONB,
  soil_conditions_at_application JSONB,
  
  -- Follow-up
  follow_up_observations JSONB, -- array of FollowUpObservation objects
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_inventory table
CREATE TABLE IF NOT EXISTS product_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL, -- can reference fertilizer_products or treatment_products
  product_name TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('fertilizer', 'treatment')) NOT NULL,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_unit TEXT NOT NULL,
  minimum_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  maximum_stock DECIMAL(10,2),
  average_usage_per_month DECIMAL(10,2) DEFAULT 0,
  
  last_restock_date DATE,
  next_restock_date DATE,
  supplier TEXT,
  cost_per_unit DECIMAL(8,2),
  total_value DECIMAL(10,2) GENERATED ALWAYS AS (current_stock * COALESCE(cost_per_unit, 0)) STORED,
  
  expiry_date DATE,
  storage_location TEXT,
  storage_conditions TEXT,
  safety_requirements TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  movement_type TEXT CHECK (movement_type IN ('purchase', 'usage', 'waste', 'transfer', 'adjustment')) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  date DATE NOT NULL,
  reference TEXT, -- treatment ID, purchase order, etc.
  notes TEXT,
  operator_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compliance_records table
CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  certification_type TEXT CHECK (certification_type IN ('organic', 'globalgap', 'brc', 'ifs', 'custom')) NOT NULL,
  
  -- Compliance Tracking
  compliance_score DECIMAL(5,2) DEFAULT 100,
  last_audit_date DATE,
  next_audit_date DATE,
  
  -- Violations and Issues
  violations JSONB DEFAULT '[]'::jsonb, -- array of ComplianceViolation objects
  corrective_actions JSONB DEFAULT '[]'::jsonb, -- array of CorrectiveAction objects
  
  -- Documentation
  certificates TEXT[], -- file IDs
  audit_reports TEXT[], -- file IDs
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fertilizer_products_garden_id ON fertilizer_products(garden_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_products_type ON fertilizer_products(fertilizer_type);
CREATE INDEX IF NOT EXISTS idx_fertilizer_products_active ON fertilizer_products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_fertilizer_products_organic ON fertilizer_products(organic_approved) WHERE organic_approved = TRUE;

CREATE INDEX IF NOT EXISTS idx_treatment_products_garden_id ON treatment_products(garden_id);
CREATE INDEX IF NOT EXISTS idx_treatment_products_type ON treatment_products(treatment_type);
CREATE INDEX IF NOT EXISTS idx_treatment_products_active ON treatment_products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_treatment_products_organic ON treatment_products(organic_approved) WHERE organic_approved = TRUE;

CREATE INDEX IF NOT EXISTS idx_nutrition_treatments_garden_id ON nutrition_treatments(garden_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_treatments_zone_id ON nutrition_treatments(zone_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_treatments_scheduled_date ON nutrition_treatments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_treatments_status ON nutrition_treatments(status);
CREATE INDEX IF NOT EXISTS idx_nutrition_treatments_type ON nutrition_treatments(treatment_type);

CREATE INDEX IF NOT EXISTS idx_nutrition_schedules_garden_id ON nutrition_schedules(garden_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_schedules_active ON nutrition_schedules(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_nutrition_schedules_next_execution ON nutrition_schedules(next_execution_date) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_treatment_history_treatment_id ON treatment_history(treatment_id);
CREATE INDEX IF NOT EXISTS idx_treatment_history_garden_id ON treatment_history(garden_id);
CREATE INDEX IF NOT EXISTS idx_treatment_history_date ON treatment_history(application_date);

CREATE INDEX IF NOT EXISTS idx_product_inventory_garden_id ON product_inventory(garden_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_product_type ON product_inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_product_inventory_low_stock ON product_inventory(garden_id, current_stock, minimum_stock) WHERE current_stock <= minimum_stock;

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_garden_id ON stock_movements(garden_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);

CREATE INDEX IF NOT EXISTS idx_compliance_records_garden_id ON compliance_records(garden_id);
CREATE INDEX IF NOT EXISTS idx_compliance_records_type ON compliance_records(certification_type);
CREATE INDEX IF NOT EXISTS idx_compliance_records_active ON compliance_records(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE fertilizer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fertilizer_products
CREATE POLICY "Users can view their own fertilizer products" ON fertilizer_products
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own fertilizer products" ON fertilizer_products
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own fertilizer products" ON fertilizer_products
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own fertilizer products" ON fertilizer_products
  FOR DELETE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for treatment_products
CREATE POLICY "Users can view their own treatment products" ON treatment_products
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own treatment products" ON treatment_products
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own treatment products" ON treatment_products
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own treatment products" ON treatment_products
  FOR DELETE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for nutrition_treatments
CREATE POLICY "Users can view their own nutrition treatments" ON nutrition_treatments
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own nutrition treatments" ON nutrition_treatments
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own nutrition treatments" ON nutrition_treatments
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own nutrition treatments" ON nutrition_treatments
  FOR DELETE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for nutrition_schedules
CREATE POLICY "Users can view their own nutrition schedules" ON nutrition_schedules
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own nutrition schedules" ON nutrition_schedules
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own nutrition schedules" ON nutrition_schedules
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own nutrition schedules" ON nutrition_schedules
  FOR DELETE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for treatment_history
CREATE POLICY "Users can view their own treatment history" ON treatment_history
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own treatment history" ON treatment_history
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for product_inventory
CREATE POLICY "Users can view their own product inventory" ON product_inventory
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own product inventory" ON product_inventory
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own product inventory" ON product_inventory
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own product inventory" ON product_inventory
  FOR DELETE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for stock_movements
CREATE POLICY "Users can view their own stock movements" ON stock_movements
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own stock movements" ON stock_movements
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for compliance_records
CREATE POLICY "Users can view their own compliance records" ON compliance_records
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own compliance records" ON compliance_records
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own compliance records" ON compliance_records
  FOR UPDATE USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_fertilizer_products_updated_at BEFORE UPDATE ON fertilizer_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_products_updated_at BEFORE UPDATE ON treatment_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_treatments_updated_at BEFORE UPDATE ON nutrition_treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_schedules_updated_at BEFORE UPDATE ON nutrition_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_inventory_updated_at BEFORE UPDATE ON product_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_records_updated_at BEFORE UPDATE ON compliance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create utility functions for nutrition calculations

-- Function to calculate treatment cost
CREATE OR REPLACE FUNCTION calculate_treatment_cost(
  dosage DECIMAL,
  area_sqm DECIMAL,
  product_cost_per_unit DECIMAL,
  labor_hours DECIMAL DEFAULT 1,
  labor_rate_per_hour DECIMAL DEFAULT 15
) RETURNS DECIMAL AS $$
DECLARE
  product_cost DECIMAL;
  labor_cost DECIMAL;
  total_cost DECIMAL;
BEGIN
  -- Calculate product cost based on dosage and area
  product_cost := (dosage * area_sqm / 10000) * product_cost_per_unit; -- convert m² to ha
  
  -- Calculate labor cost
  labor_cost := labor_hours * labor_rate_per_hour;
  
  -- Total cost
  total_cost := product_cost + labor_cost;
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to check product compatibility
CREATE OR REPLACE FUNCTION check_product_compatibility(
  product1_id UUID,
  product2_id UUID
) RETURNS TEXT AS $$
DECLARE
  compatibility_result TEXT;
BEGIN
  SELECT compatibility_type INTO compatibility_result
  FROM product_compatibility
  WHERE (product1_id = product1_id AND product2_id = product2_id)
     OR (product1_id = product2_id AND product2_id = product1_id)
  LIMIT 1;
  
  -- If no specific compatibility record found, assume compatible
  RETURN COALESCE(compatibility_result, 'compatible');
END;
$$ LANGUAGE plpgsql;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(garden_id_param UUID)
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  product_type TEXT,
  current_stock DECIMAL,
  minimum_stock DECIMAL,
  stock_unit TEXT,
  days_until_empty INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.product_id,
    pi.product_name,
    pi.product_type,
    pi.current_stock,
    pi.minimum_stock,
    pi.stock_unit,
    CASE 
      WHEN pi.average_usage_per_month > 0 
      THEN CEIL((pi.current_stock / pi.average_usage_per_month) * 30)::INTEGER
      ELSE NULL
    END as days_until_empty
  FROM product_inventory pi
  WHERE pi.garden_id = garden_id_param
    AND pi.current_stock <= pi.minimum_stock
  ORDER BY (pi.current_stock / NULLIF(pi.minimum_stock, 0)) ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate organic compliance percentage
CREATE OR REPLACE FUNCTION calculate_organic_compliance(garden_id_param UUID, date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days')
RETURNS DECIMAL AS $$
DECLARE
  total_treatments INTEGER;
  organic_treatments INTEGER;
  compliance_percentage DECIMAL;
BEGIN
  -- Count total treatments in period
  SELECT COUNT(*) INTO total_treatments
  FROM nutrition_treatments
  WHERE garden_id = garden_id_param
    AND actual_application_date >= date_from
    AND status = 'completed';
  
  -- Count organic compliant treatments
  SELECT COUNT(*) INTO organic_treatments
  FROM nutrition_treatments
  WHERE garden_id = garden_id_param
    AND actual_application_date >= date_from
    AND status = 'completed'
    AND organic_compliant = TRUE;
  
  -- Calculate percentage
  IF total_treatments > 0 THEN
    compliance_percentage := (organic_treatments::DECIMAL / total_treatments::DECIMAL) * 100;
  ELSE
    compliance_percentage := 100; -- No treatments = 100% compliant
  END IF;
  
  RETURN compliance_percentage;
END;
$$ LANGUAGE plpgsql;