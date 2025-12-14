-- Migration: Add garden_obstacles table for precise sun exposure calculation
-- Date: 2024

-- ============================================
-- GARDEN OBSTACLES (Ostacoli per calcolo esposizione solare)
-- ============================================
CREATE TABLE IF NOT EXISTS garden_obstacles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  
  -- Posizione e dimensioni ostacolo
  azimuth DECIMAL(5, 2) NOT NULL CHECK (azimuth >= 0 AND azimuth <= 360), -- Direzione (0-360°, 0=Nord)
  height_meters DECIMAL(6, 2) NOT NULL CHECK (height_meters > 0), -- Altezza in metri
  distance_meters DECIMAL(6, 2) NOT NULL CHECK (distance_meters > 0), -- Distanza orizzontale in metri
  width_degrees DECIMAL(5, 2) DEFAULT 30 CHECK (width_degrees > 0 AND width_degrees <= 180), -- Larghezza angolare
  
  -- Tipo e sorgente
  type TEXT CHECK (type IN ('Building', 'Tree', 'Mountain', 'Other')) DEFAULT 'Other',
  source TEXT CHECK (source IN ('photo_360', 'manual', 'ai_analysis')) DEFAULT 'manual',
  
  -- Metadati
  description TEXT, -- Descrizione opzionale
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_garden_obstacles_garden_id ON garden_obstacles(garden_id);
CREATE INDEX IF NOT EXISTS idx_garden_obstacles_azimuth ON garden_obstacles(azimuth);

-- RLS Policies
ALTER TABLE garden_obstacles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view obstacles in their gardens"
  ON garden_obstacles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create obstacles in their gardens"
  ON garden_obstacles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update obstacles in their gardens"
  ON garden_obstacles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete obstacles in their gardens"
  ON garden_obstacles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = garden_obstacles.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Trigger per updated_at
CREATE TRIGGER update_garden_obstacles_updated_at BEFORE UPDATE ON garden_obstacles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

