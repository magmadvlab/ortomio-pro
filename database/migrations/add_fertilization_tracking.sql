-- Migration: Add Fertilization Tracking System
-- Pattern: Dual storage (JSONB in task + separate log table) like harvest
-- Created: 2025-12-25

-- Enable UUID extension (se non già abilitato)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. AGGIUNGI CAMPO JSONB AL TASK (come harvest_history)
-- ============================================
ALTER TABLE garden_tasks
ADD COLUMN IF NOT EXISTS fertilization_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN garden_tasks.fertilization_history IS
'Array di applicazioni fertilizzanti per questa pianta (stesso pattern di harvest_history)';

-- ============================================
-- 2. TABELLA FERTILIZER APPLICATION LOGS (come harvest_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS fertilizer_application_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES garden_tasks(id) ON DELETE SET NULL, -- Link al task fertilizzato
  bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,

  -- Prodotto applicato
  fertilizer_product_id TEXT NOT NULL, -- Riferimento a fertilizers.ts
  fertilizer_product_name TEXT NOT NULL,
  fertilizer_type TEXT CHECK (fertilizer_type IN ('organic', 'mineral', 'corrective', 'microelement')),

  -- NPK (se applicabile)
  npk JSONB, -- { n: number, p: number, k: number }

  -- Data applicazione
  application_date DATE NOT NULL,

  -- Dosaggio
  area_sqm DECIMAL(8,2),
  dosage_amount DECIMAL(8,2) NOT NULL,
  dosage_unit TEXT NOT NULL, -- 'g', 'kg', 'ml', 'L'

  -- Metodo applicazione
  method TEXT CHECK (method IN ('incorporated', 'surface', 'fertigation', 'foliar')) NOT NULL,

  -- Fase pianta (opzionale)
  growth_phase TEXT CHECK (growth_phase IN ('Germination', 'Vegetative', 'Flowering', 'Fruiting')),

  -- Condizioni meteo (opzionale)
  weather_conditions JSONB, -- { temp: number, rain: boolean, ... }

  -- ⭐ KEY FEATURE: Scheduling ripetizioni automatiche
  next_application_date DATE, -- Prossima applicazione suggerita
  frequency_days INTEGER, -- Frequenza ripetizione (es. 14 giorni)

  -- Note
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. INDICI
-- ============================================
CREATE INDEX IF NOT EXISTS idx_fert_app_logs_garden ON fertilizer_application_logs(garden_id);
CREATE INDEX IF NOT EXISTS idx_fert_app_logs_task ON fertilizer_application_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_fert_app_logs_date ON fertilizer_application_logs(application_date DESC);
CREATE INDEX IF NOT EXISTS idx_fert_app_logs_next_date ON fertilizer_application_logs(next_application_date)
  WHERE next_application_date IS NOT NULL;

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE fertilizer_application_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their fertilizer applications"
  ON fertilizer_application_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = fertilizer_application_logs.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. COMMENTI ESPLICATIVI
-- ============================================
COMMENT ON TABLE fertilizer_application_logs IS
'Log applicazioni fertilizzanti - pattern dual storage come harvest_logs';

COMMENT ON COLUMN fertilizer_application_logs.next_application_date IS
'Data prossima applicazione - usata da Director per scheduling automatico';

COMMENT ON COLUMN fertilizer_application_logs.frequency_days IS
'Frequenza ripetizione (es. 14 = ogni 2 settimane)';

