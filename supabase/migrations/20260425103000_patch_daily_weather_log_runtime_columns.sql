-- Patch daily_weather_log runtime columns used by weather/diary services.
-- The Supabase migration created a compact weather table, while the diary
-- services read the richer operational schema from database/migrations.

ALTER TABLE public.daily_weather_log
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS temp_min DECIMAL(4,1),
  ADD COLUMN IF NOT EXISTS temp_max DECIMAL(4,1),
  ADD COLUMN IF NOT EXISTS temp_avg DECIMAL(4,1),
  ADD COLUMN IF NOT EXISTS humidity_min INTEGER,
  ADD COLUMN IF NOT EXISTS humidity_max INTEGER,
  ADD COLUMN IF NOT EXISTS humidity_avg INTEGER,
  ADD COLUMN IF NOT EXISTS weather_conditions TEXT,
  ADD COLUMN IF NOT EXISTS precipitation_type TEXT,
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'api',
  ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS wind_speed_max DECIMAL(4,1),
  ADD COLUMN IF NOT EXISTS wind_speed_avg DECIMAL(4,1),
  ADD COLUMN IF NOT EXISTS wind_direction TEXT,
  ADD COLUMN IF NOT EXISTS solar_radiation_mj DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS uv_index_max DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS daylight_hours DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS pressure_hpa INTEGER,
  ADD COLUMN IF NOT EXISTS eto_mm DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS frost_occurred BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS frost_hours INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS heat_stress_hours INTEGER DEFAULT 0;

UPDATE public.daily_weather_log AS weather
SET user_id = gardens.user_id
FROM public.gardens
WHERE weather.garden_id = gardens.id
  AND weather.user_id IS NULL;

UPDATE public.daily_weather_log
SET
  temp_min = COALESCE(temp_min, temperature_min::DECIMAL(4,1)),
  temp_max = COALESCE(temp_max, temperature_max::DECIMAL(4,1)),
  temp_avg = COALESCE(
    temp_avg,
    CASE
      WHEN temperature_min IS NOT NULL AND temperature_max IS NOT NULL
        THEN ((temperature_min + temperature_max) / 2)::DECIMAL(4,1)
      ELSE NULL
    END
  ),
  raw_data = CASE
    WHEN raw_data IS NULL OR raw_data = '{}'::jsonb THEN jsonb_strip_nulls(jsonb_build_object(
      'temperature_min', temperature_min,
      'temperature_max', temperature_max,
      'weather_code', weather_code,
      'notes', notes
    ))
    ELSE raw_data
  END
WHERE temp_min IS NULL
   OR temp_max IS NULL
   OR temp_avg IS NULL
   OR raw_data IS NULL
   OR raw_data = '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_daily_weather_log_user_date
  ON public.daily_weather_log(user_id, log_date DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_daily_weather_log_frost
  ON public.daily_weather_log(garden_id, frost_occurred)
  WHERE frost_occurred = true;
