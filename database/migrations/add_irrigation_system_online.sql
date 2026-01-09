-- ============================================
-- Aggiungi Irrigation System Tables Online
-- ============================================
-- Questo script crea le tabelle per il sistema di irrigazione
-- che mancano nel database online
-- ============================================

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
  valve_id UUID, -- Riferimento a smart_devices se presente
  bed_ids UUID[] DEFAULT '{}',
  plant_task_ids UUID[] DEFAULT '{}',
  notes TEXT,
  calculated_from_components BOOLEAN DEFAULT false,
  -- Configurazione specifica per metodo (JSONB per flessibilità)
  manual_config JSONB,
  dripline_config JSONB,
  drippers_config JSONB,
  micro_sprinkler_config JSONB,
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
  dripper_flow_rate_lph DECIMAL(10, 2), -- L/h per gocciolatore
  quantity INTEGER,
  flow_rate_lph DECIMAL(10, 2), -- L/h per unità
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
  duration_minutes DECIMAL(6, 2) NOT NULL,
  liters_applied DECIMAL(8, 2) NOT NULL,
  method TEXT CHECK (method IN ('Manual', 'Automatic', 'Timer')) NOT NULL DEFAULT 'Manual',
  notes TEXT,
  valve_id UUID,
  completed BOOLEAN DEFAULT true,
  actual_duration_minutes DECIMAL(6, 2), -- Per interruzioni
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watering_logs_zone ON watering_logs(zone_id);
CREATE INDEX IF NOT EXISTS idx_watering_logs_date ON watering_logs(date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE irrigation_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE watering_logs ENABLE ROW LEVEL SECURITY;

-- Irrigation Systems: Users can only access systems in their gardens
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'irrigation_systems' AND policyname = 'Users can access irrigation systems in their gardens'
  ) THEN
    CREATE POLICY "Users can access irrigation systems in their gardens"
      ON irrigation_systems FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM gardens
          WHERE gardens.id = irrigation_systems.garden_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Irrigation Zones: Users can only access zones in their systems
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'irrigation_zones' AND policyname = 'Users can access irrigation zones in their systems'
  ) THEN
    CREATE POLICY "Users can access irrigation zones in their systems"
      ON irrigation_zones FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM irrigation_systems
          JOIN gardens ON gardens.id = irrigation_systems.garden_id
          WHERE irrigation_systems.id = irrigation_zones.system_id
          AND gardens.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Irrigation Components: Users can only access components in their zones
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'irrigation_components' AND policyname = 'Users can access irrigation components in their zones'
  ) THEN
    CREATE POLICY "Users can access irrigation components in their zones"
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
  END IF;
END $$;

-- Watering Logs: Users can only access logs in their zones
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'watering_logs' AND policyname = 'Users can access watering logs in their zones'
  ) THEN
    CREATE POLICY "Users can access watering logs in their zones"
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
  END IF;
END $$;

-- ============================================
-- TRIGGERS
-- ============================================
-- Assicurati che la funzione update_updated_at_column esista
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_irrigation_systems_updated_at ON irrigation_systems;
CREATE TRIGGER update_irrigation_systems_updated_at BEFORE UPDATE ON irrigation_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_irrigation_zones_updated_at ON irrigation_zones;
CREATE TRIGGER update_irrigation_zones_updated_at BEFORE UPDATE ON irrigation_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICA CREAZIONE
-- ============================================
SELECT 
  'irrigation_systems' as table_name,
  COUNT(*) as row_count
FROM irrigation_systems
UNION ALL
SELECT 
  'irrigation_zones' as table_name,
  COUNT(*) as row_count
FROM irrigation_zones
UNION ALL
SELECT 
  'irrigation_components' as table_name,
  COUNT(*) as row_count
FROM irrigation_components
UNION ALL
SELECT 
  'watering_logs' as table_name,
  COUNT(*) as row_count
FROM watering_logs;

