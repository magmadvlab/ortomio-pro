-- ============================================
-- INDIVIDUAL PLANT OPERATIONS TRACKING
-- Data: 2026-02-07
-- Descrizione: Tabella per tracciare operazioni su singole piante (anche virtuali)
-- ============================================

CREATE TABLE IF NOT EXISTS individual_plant_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Riferimenti
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Identificativo Pianta (Testuale per supportare piante virtuali generate da batch)
  plant_id TEXT NOT NULL, 
  
  -- Riferimento all'operazione padre (opzionale)
  parent_operation_id UUID, -- Es. id in watering_logs o fertilization_logs
  parent_operation_table TEXT, -- 'watering_logs', 'fertilization_logs', etc.
  
  -- Dettagli Operazione
  operation_type TEXT NOT NULL CHECK (
    operation_type IN (
      'watering', 'fertilizing', 'treatment', 'pruning', 'harvest', 
      'transplanting', 'thinning', 'staking', 'mulching', 'work', 'health'
    )
  ),
  
  operation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  operation_time TIME,
  
  -- Quantità precisa per questa pianta
  quantity NUMERIC(10, 3), -- Supporta decimali (es. 0.333 L)
  unit TEXT, -- 'L', 'g', 'ml', etc.
  
  -- Dettagli aggiuntivi
  product_name TEXT,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_ipo_garden ON individual_plant_operations(garden_id);
CREATE INDEX idx_ipo_plant ON individual_plant_operations(plant_id);
CREATE INDEX idx_ipo_date ON individual_plant_operations(operation_date);
CREATE INDEX idx_ipo_type ON individual_plant_operations(operation_type);
CREATE INDEX idx_ipo_parent ON individual_plant_operations(parent_operation_id);

-- RLS Policy
ALTER TABLE individual_plant_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plant operations"
  ON individual_plant_operations FOR SELECT
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own plant operations"
  ON individual_plant_operations FOR INSERT
  WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own plant operations"
  ON individual_plant_operations FOR UPDATE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own plant operations"
  ON individual_plant_operations FOR DELETE
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE individual_plant_operations IS 'Operazioni dettagliate per singola pianta (scalare o specifica)';
COMMENT ON COLUMN individual_plant_operations.plant_id IS 'Codice univoco pianta (es. F1-P001)';
