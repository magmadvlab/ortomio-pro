-- Migration: Add FERTILIZER, PHYTO, TILLAGE tables
-- Created: 2024

-- FERTILIZER INVENTORY
CREATE TABLE IF NOT EXISTS fertilizer_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('organic', 'mineral', 'corrective', 'microelement')) NOT NULL,
  category TEXT NOT NULL,
  npk JSONB, -- {n: number, p: number, k: number}
  quantity DECIMAL(8, 2) NOT NULL,
  unit TEXT CHECK (unit IN ('kg', 'L', 'bags')) NOT NULL,
  expiry_date DATE,
  cost_per_unit DECIMAL(8, 2),
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fertilizer_inventory_garden_id ON fertilizer_inventory(garden_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_inventory_expiry ON fertilizer_inventory(expiry_date) WHERE expiry_date IS NOT NULL;

-- PHYTO INVENTORY
CREATE TABLE IF NOT EXISTS phyto_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('bio', 'conventional')) NOT NULL,
  category TEXT NOT NULL,
  active_ingredient TEXT,
  quantity DECIMAL(8, 2) NOT NULL,
  unit TEXT CHECK (unit IN ('L', 'kg', 'units')) NOT NULL,
  expiry_date DATE,
  safety_interval_days INTEGER,
  requires_license BOOLEAN DEFAULT false,
  allowed_in_organic BOOLEAN DEFAULT true,
  cost_per_unit DECIMAL(8, 2),
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phyto_inventory_garden_id ON phyto_inventory(garden_id);
CREATE INDEX IF NOT EXISTS idx_phyto_inventory_expiry ON phyto_inventory(expiry_date) WHERE expiry_date IS NOT NULL;

-- TREATMENT REGISTRY (per professionisti)
CREATE TABLE IF NOT EXISTS treatment_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL,
  product_id UUID REFERENCES phyto_inventory(id) ON DELETE SET NULL,
  plant_name TEXT NOT NULL,
  treatment_date DATE NOT NULL,
  dosage TEXT NOT NULL,
  application_method TEXT NOT NULL,
  target_pest_disease TEXT NOT NULL,
  weather_conditions JSONB,
  safety_interval_end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_registry_garden_id ON treatment_registry(garden_id);
CREATE INDEX IF NOT EXISTS idx_treatment_registry_plant_name ON treatment_registry(plant_name);
CREATE INDEX IF NOT EXISTS idx_treatment_registry_date ON treatment_registry(treatment_date);
CREATE INDEX IF NOT EXISTS idx_treatment_registry_safety_interval ON treatment_registry(safety_interval_end_date);

-- COMPOST PRODUCTION LOG
CREATE TABLE IF NOT EXISTS compost_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  compost_type TEXT CHECK (compost_type IN ('compost', 'worm_compost', 'bokashi')) NOT NULL,
  start_date DATE NOT NULL,
  materials JSONB NOT NULL,
  cn_ratio DECIMAL(4, 2),
  maturity_date DATE,
  quantity_produced DECIMAL(8, 2),
  unit TEXT CHECK (unit IN ('kg', 'L')) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compost_logs_garden_id ON compost_logs(garden_id);
CREATE INDEX IF NOT EXISTS idx_compost_logs_maturity_date ON compost_logs(maturity_date) WHERE maturity_date IS NOT NULL;

-- RLS Policies
ALTER TABLE fertilizer_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own fertilizer inventory" ON fertilizer_inventory
  FOR ALL USING (EXISTS (SELECT 1 FROM gardens WHERE gardens.id = fertilizer_inventory.garden_id AND gardens.user_id = auth.uid()));

ALTER TABLE phyto_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own phyto inventory" ON phyto_inventory
  FOR ALL USING (EXISTS (SELECT 1 FROM gardens WHERE gardens.id = phyto_inventory.garden_id AND gardens.user_id = auth.uid()));

ALTER TABLE treatment_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own treatment registry" ON treatment_registry
  FOR ALL USING (EXISTS (SELECT 1 FROM gardens WHERE gardens.id = treatment_registry.garden_id AND gardens.user_id = auth.uid()));

ALTER TABLE compost_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own compost logs" ON compost_logs
  FOR ALL USING (EXISTS (SELECT 1 FROM gardens WHERE gardens.id = compost_logs.garden_id AND gardens.user_id = auth.uid()));

