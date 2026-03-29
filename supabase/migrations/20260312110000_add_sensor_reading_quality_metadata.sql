ALTER TABLE public.sensor_readings
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS data_quality_score NUMERIC(4,3),
ADD COLUMN IF NOT EXISTS calibration_status TEXT,
ADD COLUMN IF NOT EXISTS battery_level_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS signal_strength NUMERIC(5,2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sensor_readings_data_quality_score_check'
  ) THEN
    ALTER TABLE public.sensor_readings
    ADD CONSTRAINT sensor_readings_data_quality_score_check
    CHECK (
      data_quality_score IS NULL OR
      (data_quality_score >= 0 AND data_quality_score <= 1)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sensor_readings_calibration_status_check'
  ) THEN
    ALTER TABLE public.sensor_readings
    ADD CONSTRAINT sensor_readings_calibration_status_check
    CHECK (
      calibration_status IS NULL OR
      calibration_status IN ('calibrated', 'needs_calibration', 'unknown')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sensor_readings_battery_level_percentage_check'
  ) THEN
    ALTER TABLE public.sensor_readings
    ADD CONSTRAINT sensor_readings_battery_level_percentage_check
    CHECK (
      battery_level_percentage IS NULL OR
      (battery_level_percentage >= 0 AND battery_level_percentage <= 100)
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sensor_readings_signal_strength_check'
  ) THEN
    ALTER TABLE public.sensor_readings
    ADD CONSTRAINT sensor_readings_signal_strength_check
    CHECK (
      signal_strength IS NULL OR
      (signal_strength >= 0 AND signal_strength <= 100)
    );
  END IF;
END $$;
