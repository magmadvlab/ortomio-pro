-- Migration: Align Garden Zones Schema for Greenhouse Integration
-- Aggiunge campi mancanti a garden_zones per supportare:
-- - zone_kind (distinguere OpenField/Greenhouse/Indoor)
-- - coordinate/position/color/order_index (per ZoneMappingTool)
-- - metadata aggiuntivi (colture, suolo, esposizione, dimensioni)
-- Mantiene compatibilità con field_rows e planting_batches esistenti

-- ============================================
-- 1. Estensione garden_zones con campi mancanti
-- ============================================
ALTER TABLE garden_zones 
ADD COLUMN IF NOT EXISTS zone_kind TEXT CHECK (zone_kind IN ('OpenField', 'Greenhouse', 'Indoor')) DEFAULT 'OpenField',
ADD COLUMN IF NOT EXISTS coordinates JSONB, -- Array di punti [{x, y}, ...] in cm relativi al Visual Planner
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6', -- Colore per visualizzazione
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0, -- Ordine visualizzazione
ADD COLUMN IF NOT EXISTS position JSONB, -- {x: 0-100, y: 0-100} percentuale layout
ADD COLUMN IF NOT EXISTS primary_cultivar TEXT, -- Coltura principale zona
ADD COLUMN IF NOT EXISTS crop_type TEXT CHECK (crop_type IN ('Vegetables', 'Fruits', 'Herbs', 'Mixed')),
ADD COLUMN IF NOT EXISTS soil_type TEXT CHECK (soil_type IN ('Clay', 'Sandy', 'Loamy', 'Peaty', 'Chalky', 'Silty')),
ADD COLUMN IF NOT EXISTS soil_ph DECIMAL(3, 1) CHECK (soil_ph >= 0 AND soil_ph <= 14),
ADD COLUMN IF NOT EXISTS sun_exposure TEXT CHECK (sun_exposure IN ('FullSun', 'PartSun', 'Shade')),
ADD COLUMN IF NOT EXISTS dimensions JSONB, -- {length: number, width: number} in metri
ADD COLUMN IF NOT EXISTS greenhouse_type TEXT, -- Tipologia serra (se zone_kind = Greenhouse)
ADD COLUMN IF NOT EXISTS covering_type TEXT, -- Copertura serra
ADD COLUMN IF NOT EXISTS heating_type TEXT, -- Riscaldamento serra
ADD COLUMN IF NOT EXISTS ventilation_type TEXT; -- Ventilazione serra

-- ============================================
-- 2. Indici per performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_garden_zones_garden_id_kind ON garden_zones(garden_id, zone_kind);
CREATE INDEX IF NOT EXISTS idx_garden_zones_order ON garden_zones(garden_id, order_index);
CREATE INDEX IF NOT EXISTS idx_garden_zones_primary_cultivar ON garden_zones(primary_cultivar);

-- ============================================
-- 3. RLS Policies per garden_zones (se mancanti)
-- ============================================
ALTER TABLE garden_zones ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own garden zones
CREATE POLICY "Users can view their own garden zones"
  ON garden_zones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM gardens 
    WHERE gardens.id = garden_zones.garden_id 
    AND gardens.user_id = auth.uid()
  ));

-- Policy: Users can insert their own garden zones
CREATE POLICY "Users can insert their own garden zones"
  ON garden_zones FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM gardens 
    WHERE gardens.id = garden_zones.garden_id 
    AND gardens.user_id = auth.uid()
  ));

-- Policy: Users can update their own garden zones
CREATE POLICY "Users can update their own garden zones"
  ON garden_zones FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM gardens 
    WHERE gardens.id = garden_zones.garden_id 
    AND gardens.user_id = auth.uid()
  ));

-- Policy: Users can delete their own garden zones
CREATE POLICY "Users can delete their own garden zones"
  ON garden_zones FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM gardens 
    WHERE gardens.id = garden_zones.garden_id 
    AND gardens.user_id = auth.uid()
  ));

-- ============================================
-- 4. Trigger per updated_at (se mancante)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_garden_zones_updated_at 
  BEFORE UPDATE ON garden_zones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Commenti per documentazione
-- ============================================
COMMENT ON TABLE garden_zones IS 'Zone di coltivazione gerarchiche: OpenField, Greenhouse, Indoor. Supporta mapping visivo e tracking micro-zone.';
COMMENT ON COLUMN garden_zones.zone_kind IS 'Tipo zona: OpenField (pieno campo), Greenhouse (serra), Indoor (coltura protetta interna)';
COMMENT ON COLUMN garden_zones.coordinates IS 'Coordinate poligonali per Visual Planner (array punti in cm relativi)';
COMMENT ON COLUMN garden_zones.color IS 'Colore hex per visualizzazione mappa zone';
COMMENT ON COLUMN garden_zones.order_index IS 'Ordine visualizzazione (per UI drag & drop)';
COMMENT ON COLUMN garden_zones.position IS 'Posizione percentuale {x,y} per layout rapido';
COMMENT ON COLUMN garden_zones.primary_cultivar IS 'Coltura principale della zona (es. Pomodoro, Lattuga)';
COMMENT ON COLUMN garden_zones.crop_type IS 'Categoria coltura: Vegetables, Fruits, Herbs, Mixed';
COMMENT ON COLUMN garden_zones.greenhouse_type IS 'Tipologia serra: Arched, Tunnel, ColdFrame, Polytunnel';
COMMENT ON COLUMN garden_zones.covering_type IS 'Copertura serra: Polyethylene, Polycarbonate, Glass, Netting';
COMMENT ON COLUMN garden_zones.heating_type IS 'Riscaldamento: None, Electric, Gas, Geothermal, Biomass';
COMMENT ON COLUMN garden_zones.ventilation_type IS 'Ventilazione: Natural, Forced, Automatic, Fog';
