-- Migration: Add sapling_batches table
-- Aggiunge tabella per gestire alberelli (frutteti, uliveti, vigneti)
-- Data: 2025-01-XX
-- Descrizione: Tabella per tracciare piccoli arbusti acquistati e messi a dimora

CREATE TABLE IF NOT EXISTS sapling_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  plant_name TEXT NOT NULL,
  variety TEXT,
  sapling_type TEXT CHECK (sapling_type IN ('FruitTree', 'Olive', 'Vine')) NOT NULL,
  purchase_date DATE NOT NULL,
  planting_date DATE,
  quantity INTEGER NOT NULL,
  location TEXT NOT NULL, -- Nome area/letto dove piantare
  phase TEXT CHECK (phase IN ('Purchased', 'Planted', 'Establishing', 'Growing', 'ReadyToOrchard')) DEFAULT 'Purchased',
  current_quantity INTEGER,
  expected_establishment_date DATE,
  rootstock TEXT, -- Portinnesto (per frutteti)
  spacing TEXT, -- Distanza tra piante (es: "3m x 4m")
  notes TEXT,
  photo_log JSONB DEFAULT '[]'::jsonb,
  specialized_crop_id UUID, -- Collegamento a impianto specializzato (quando creato)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sapling_batches_garden_id ON sapling_batches(garden_id);
CREATE INDEX IF NOT EXISTS idx_sapling_batches_purchase_date ON sapling_batches(purchase_date);
CREATE INDEX IF NOT EXISTS idx_sapling_batches_phase ON sapling_batches(phase);
CREATE INDEX IF NOT EXISTS idx_sapling_batches_sapling_type ON sapling_batches(sapling_type);

-- RLS Policies for sapling_batches
ALTER TABLE sapling_batches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sapling_batches' 
    AND policyname = 'Users can access sapling batches in their gardens'
  ) THEN
    CREATE POLICY "Users can access sapling batches in their gardens"
      ON sapling_batches FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = sapling_batches.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_sapling_batches_updated_at'
  ) THEN
    CREATE TRIGGER update_sapling_batches_updated_at BEFORE UPDATE ON sapling_batches
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Aggiungi commenti
COMMENT ON TABLE sapling_batches IS 'Batch di alberelli per frutteti, uliveti, vigneti';
COMMENT ON COLUMN sapling_batches.sapling_type IS 'Tipo di alberello: FruitTree, Olive, Vine';
COMMENT ON COLUMN sapling_batches.phase IS 'Fase del ciclo vitale: Purchased, Planted, Establishing, Growing, ReadyToOrchard';
COMMENT ON COLUMN sapling_batches.rootstock IS 'Portinnesto (solo per frutteti, es: M9, 1103P)';
COMMENT ON COLUMN sapling_batches.spacing IS 'Distanza tra piante (es: "3m x 4m")';
COMMENT ON COLUMN sapling_batches.specialized_crop_id IS 'Collegamento a impianto specializzato quando creato';

