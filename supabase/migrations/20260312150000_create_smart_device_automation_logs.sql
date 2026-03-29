CREATE TABLE IF NOT EXISTS public.smart_device_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES public.gardens(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.smart_devices(id) ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('manual', 'tuya', 'thingsboard')),
  event_type TEXT NOT NULL CHECK (event_type IN ('decision', 'command_sent', 'command_result', 'telemetry', 'outcome')),
  source TEXT NOT NULL CHECK (source IN ('automation', 'manual', 'telemetry', 'simulation')),
  event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scope_type TEXT CHECK (scope_type IN ('zone', 'field_row', 'tree', 'plant')),
  scope_id TEXT,
  zone_id TEXT,
  field_row_id TEXT,
  tree_id TEXT,
  plant_id TEXT,
  decision TEXT CHECK (decision IN ('open_now', 'close_now', 'hold', 'manual_review')),
  trigger TEXT CHECK (trigger IN ('water_stress', 'heat_support', 'fungal_block', 'target_reached', 'telemetry_block', 'stability_hold', 'awaiting_data')),
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
  reason TEXT,
  command_status TEXT CHECK (command_status IN ('idle', 'pending', 'confirmed', 'timeout', 'failed')),
  commanded_valve_state BOOLEAN,
  confirmed_valve_state BOOLEAN,
  target_liters NUMERIC(10,2),
  session_liters NUMERIC(10,2),
  moisture NUMERIC(6,2),
  irrigation_delta_moisture NUMERIC(6,2),
  irrigation_outcome TEXT CHECK (irrigation_outcome IN ('nominal', 'warning', 'critical')),
  flow_rate_actual_lpm NUMERIC(10,2),
  line_pressure_bar NUMERIC(6,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smart_device_automation_logs_garden_id
  ON public.smart_device_automation_logs(garden_id);
CREATE INDEX IF NOT EXISTS idx_smart_device_automation_logs_device_id
  ON public.smart_device_automation_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_smart_device_automation_logs_event_at
  ON public.smart_device_automation_logs(event_at DESC);

ALTER TABLE public.smart_device_automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own smart device automation logs" ON public.smart_device_automation_logs;
CREATE POLICY "Users can view their own smart device automation logs"
  ON public.smart_device_automation_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = smart_device_automation_logs.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own smart device automation logs" ON public.smart_device_automation_logs;
CREATE POLICY "Users can insert their own smart device automation logs"
  ON public.smart_device_automation_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = smart_device_automation_logs.garden_id
        AND gardens.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own smart device automation logs" ON public.smart_device_automation_logs;
CREATE POLICY "Users can delete their own smart device automation logs"
  ON public.smart_device_automation_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.gardens
      WHERE gardens.id = smart_device_automation_logs.garden_id
        AND gardens.user_id = auth.uid()
    )
  );
