CREATE TABLE IF NOT EXISTS public.smart_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Sensor', 'Valve', 'Hub')),
  provider TEXT CHECK (provider IN ('manual', 'tuya', 'thingsboard')),
  device_category TEXT CHECK (device_category IN ('moisture_sensor', 'irrigation_valve', 'weather_station', 'ph_sensor', 'ec_sensor')),
  connection_type TEXT CHECK (connection_type IN ('wifi', 'bluetooth', 'zigbee', 'lora', 'cloud')),
  external_device_id TEXT,
  sensor_id TEXT,
  scope_type TEXT CHECK (scope_type IN ('zone', 'field_row', 'tree', 'plant')),
  scope_id TEXT,
  zone_id TEXT,
  field_row_id TEXT,
  tree_id TEXT,
  plant_id TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  last_telemetry_at TIMESTAMPTZ,
  last_command_at TIMESTAMPTZ,
  last_command_status TEXT CHECK (last_command_status IN ('idle', 'pending', 'confirmed', 'timeout', 'failed')),
  last_commanded_valve_state BOOLEAN,
  last_confirmed_valve_state BOOLEAN,
  last_confirmed_valve_at TIMESTAMPTZ,
  last_command_error TEXT,
  last_command_latency_ms INTEGER,
  last_irrigation_started_at TIMESTAMPTZ,
  last_irrigation_completed_at TIMESTAMPTZ,
  last_irrigation_baseline_moisture NUMERIC(6,2),
  last_irrigation_delta_moisture NUMERIC(6,2),
  last_irrigation_outcome TEXT CHECK (last_irrigation_outcome IN ('nominal', 'warning', 'critical')),
  flow_rate_actual_lpm NUMERIC(10,2),
  line_pressure_bar NUMERIC(6,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  moisture NUMERIC(6,2) NOT NULL DEFAULT 0,
  is_valve_open BOOLEAN NOT NULL DEFAULT FALSE,
  flow_rate_lpm NUMERIC(10,2) NOT NULL DEFAULT 0,
  session_liters NUMERIC(10,2) NOT NULL DEFAULT 0,
  target_liters NUMERIC(10,2) NOT NULL DEFAULT 0,
  auto_threshold NUMERIC(6,2) NOT NULL DEFAULT 0,
  auto_mode BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smart_devices_garden_id ON public.smart_devices(garden_id);
CREATE INDEX IF NOT EXISTS idx_smart_devices_provider ON public.smart_devices(provider);
CREATE INDEX IF NOT EXISTS idx_smart_devices_scope ON public.smart_devices(scope_type, scope_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_smart_devices_external_device_id
  ON public.smart_devices(external_device_id)
  WHERE external_device_id IS NOT NULL;

ALTER TABLE public.smart_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own smart devices" ON public.smart_devices;
CREATE POLICY "Users can view their own smart devices"
  ON public.smart_devices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = smart_devices.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own smart devices" ON public.smart_devices;
CREATE POLICY "Users can insert their own smart devices"
  ON public.smart_devices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = smart_devices.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own smart devices" ON public.smart_devices;
CREATE POLICY "Users can update their own smart devices"
  ON public.smart_devices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = smart_devices.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own smart devices" ON public.smart_devices;
CREATE POLICY "Users can delete their own smart devices"
  ON public.smart_devices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = smart_devices.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'update_updated_at_column'
  ) THEN
    DROP TRIGGER IF EXISTS update_smart_devices_updated_at ON public.smart_devices;
    CREATE TRIGGER update_smart_devices_updated_at
      BEFORE UPDATE ON public.smart_devices
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
