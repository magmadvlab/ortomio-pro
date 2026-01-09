-- Migration: Add Custom Crops and Learning Events Tables
-- Supporta colture personalizzate e sistema di apprendimento automatico

-- ============================================
-- CUSTOM CROPS
-- Colture personalizzate aggiunte dall'utente
-- ============================================
CREATE TABLE IF NOT EXISTS custom_crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  family TEXT,
  
  -- Dati iniziali opzionali (il sistema impara)
  initial_data JSONB DEFAULT '{}'::jsonb,
  
  -- Pattern appresi dal sistema
  learned_patterns JSONB DEFAULT '{}'::jsonb,
  
  -- Statistiche
  stats JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CROP LEARNING EVENTS
-- Eventi per apprendimento automatico
-- ============================================
CREATE TABLE IF NOT EXISTS crop_learning_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  custom_crop_id UUID REFERENCES custom_crops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE SET NULL,
  
  event_type TEXT NOT NULL CHECK (event_type IN ('planting', 'harvest', 'work', 'treatment', 'problem', 'fertilize')),
  event_data JSONB NOT NULL,
  outcome JSONB, -- Risultato (es. yield, success/failure)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_custom_crops_user_id ON custom_crops(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_crops_garden_id ON custom_crops(garden_id);
CREATE INDEX IF NOT EXISTS idx_custom_crops_common_name ON custom_crops(common_name);
CREATE INDEX IF NOT EXISTS idx_learning_events_crop_id ON crop_learning_events(custom_crop_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_id ON crop_learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON crop_learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_events_created_at ON crop_learning_events(created_at DESC);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_custom_crops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_custom_crops_timestamp
  BEFORE UPDATE ON custom_crops
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_crops_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE custom_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_learning_events ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (per permettere re-esecuzione sicura)
DROP POLICY IF EXISTS "Users can manage their own custom crops" ON custom_crops;
DROP POLICY IF EXISTS "Users can manage their own learning events" ON crop_learning_events;

CREATE POLICY "Users can manage their own custom crops" ON custom_crops
  FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can manage their own learning events" ON crop_learning_events
  FOR ALL USING ((select auth.uid()) = user_id);

