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

CREATE INDEX idx_irrigation_systems_garden ON irrigation_systems(garden_id);

-- ============================================
-- IRRIGATION ZONES
-- ============================================
CREATE TABLE IF NOT EXISTS irrigation_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id UUID REFERENCES irrigation_systems(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Manual', 'Hose', 'Dripline', 'Drippers', 'MicroSprinkler', 'Sprinkler', 'Mixed')),
  flow_rate_lph DECIMAL(10, 2) NOT NULL,
  valve_id UUID REFERENCES smart_devices(id),
  bed_ids UUID[] DEFAULT '{}',
  plant_task_ids UUID[] DEFAULT '{}',
  notes TEXT,
  calculated_from_components BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_irrigation_zones_system ON irrigation_zones(system_id);
CREATE INDEX idx_irrigation_zones_valve ON irrigation_zones(valve_id) WHERE valve_id IS NOT NULL;

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

CREATE INDEX idx_irrigation_components_zone ON irrigation_components(zone_id);

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
  valve_id UUID REFERENCES smart_devices(id),
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_watering_logs_zone ON watering_logs(zone_id);
CREATE INDEX idx_watering_logs_zone_date ON watering_logs(zone_id, date);
CREATE INDEX idx_watering_logs_date ON watering_logs(date);

-- ============================================
-- TRIGGERS per updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_irrigation_systems_updated_at 
  BEFORE UPDATE ON irrigation_systems 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irrigation_zones_updated_at 
  BEFORE UPDATE ON irrigation_zones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

