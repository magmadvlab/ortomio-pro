ALTER TABLE public.smart_devices
  ADD COLUMN IF NOT EXISTS last_automation_evaluated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_automation_decision TEXT CHECK (last_automation_decision IN ('open_now', 'close_now', 'hold', 'manual_review')),
  ADD COLUMN IF NOT EXISTS last_automation_trigger TEXT CHECK (last_automation_trigger IN ('water_stress', 'heat_support', 'fungal_block', 'target_reached', 'telemetry_block', 'stability_hold', 'awaiting_data')),
  ADD COLUMN IF NOT EXISTS last_automation_reason TEXT,
  ADD COLUMN IF NOT EXISTS last_automation_confidence TEXT CHECK (last_automation_confidence IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS last_automation_target_liters NUMERIC(10,2);
