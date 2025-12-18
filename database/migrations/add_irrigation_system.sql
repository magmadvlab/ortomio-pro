-- Migration: Add Irrigation System Tables
-- Supporta gestione zone irrigue con portate e calcolo minuti

-- Enable UUID extension (se non già abilitato)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- IRRIGATION SYSTEMS
-- ============================================
CREATE TABLE IF NOT EXISTS irrigation_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_irrigation_systems_garden ON irrigation_systems(garden_id);

-- ============================================
-- IRRIGATION ZONES
-- ============================================
CREATE TABLE IF NOT EXISTS irrigation_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id UUID REFERENCES irrigation_systems(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Manual', 'Hose', 'Dripline', 'Drippers', 'MicroSprinkler', 'Sprinkler', 'Mixed')),
  flow_rate_lph DECIMAL(10, 2) NOT NULL,
  valve_id UUID, -- Riferimento opzionale a smart_devices se presente
  bed_ids UUID[] DEFAULT '{}',
  plant_task_ids UUID[] DEFAULT '{}',
  notes TEXT,
  calculated_from_components BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_irrigation_zones_system ON irrigation_zones(system_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_zones_valve ON irrigation_zones(valve_id) WHERE valve_id IS NOT NULL;

-- ============================================
-- IRRIGATION COMPONENTS (Livello Pro)
-- ============================================
CREATE TABLE IF NOT EXISTS irrigation_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID REFERENCES irrigation_zones(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Dripline', 'Dripper', 'MicroSprinkler', 'MainLine', 'SecondaryLine', 'Filter', 'Reducer')),
  length_meters DECIMAL(10, 2),
  flow_rate_per_meter_lph DECIMAL(10, 2),
  dripper_spacing DECIMAL(10, 2), -- cm tra gocciolatori
  dripper_flow_rate_lph DECIMAL(10, 2),
  quantity INTEGER,
  flow_rate_lph DECIMAL(10, 2),
  brand TEXT,
  model TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_irrigation_components_zone ON irrigation_components(zone_id);

-- ============================================
-- WATERING LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS watering_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID REFERENCES irrigation_zones(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  liters_applied DECIMAL(10, 2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Manual', 'Automatic', 'Timer')),
  notes TEXT,
  valve_id UUID, -- Riferimento opzionale a smart_devices se presente
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watering_logs_zone ON watering_logs(zone_id);
CREATE INDEX IF NOT EXISTS idx_watering_logs_zone_date ON watering_logs(zone_id, date);
CREATE INDEX IF NOT EXISTS idx_watering_logs_date ON watering_logs(date);

-- ============================================
-- TRIGGERS per updated_at
-- ============================================
-- La funzione update_updated_at_column() dovrebbe già esistere da database/schema.sql
-- Se non esiste, verrà creata automaticamente quando necessario
-- Qui creiamo solo i trigger

DROP TRIGGER IF EXISTS update_irrigation_systems_updated_at ON irrigation_systems;
CREATE TRIGGER update_irrigation_systems_updated_at 
  BEFORE UPDATE ON irrigation_systems 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_irrigation_zones_updated_at ON irrigation_zones;
CREATE TRIGGER update_irrigation_zones_updated_at 
  BEFORE UPDATE ON irrigation_zones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE irrigation_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE watering_logs ENABLE ROW LEVEL SECURITY;

-- Irrigation Systems: Users can only access systems in their gardens
CREATE POLICY "Users can only access irrigation systems in their gardens"
  ON irrigation_systems FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gardens
      WHERE gardens.id = irrigation_systems.garden_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Irrigation Zones: Users can only access zones in their systems
CREATE POLICY "Users can only access irrigation zones in their systems"
  ON irrigation_zones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM irrigation_systems
      JOIN gardens ON gardens.id = irrigation_systems.garden_id
      WHERE irrigation_systems.id = irrigation_zones.system_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Irrigation Components: Users can only access components in their zones
CREATE POLICY "Users can only access irrigation components in their zones"
  ON irrigation_components FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM irrigation_zones
      JOIN irrigation_systems ON irrigation_systems.id = irrigation_zones.system_id
      JOIN gardens ON gardens.id = irrigation_systems.garden_id
      WHERE irrigation_zones.id = irrigation_components.zone_id
      AND gardens.user_id = auth.uid()
    )
  );

-- Watering Logs: Users can only access logs in their zones
CREATE POLICY "Users can only access watering logs in their zones"
  ON watering_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM irrigation_zones
      JOIN irrigation_systems ON irrigation_systems.id = irrigation_zones.system_id
      JOIN gardens ON gardens.id = irrigation_systems.garden_id
      WHERE irrigation_zones.id = watering_logs.zone_id
      AND gardens.user_id = auth.uid()
    )
  );

