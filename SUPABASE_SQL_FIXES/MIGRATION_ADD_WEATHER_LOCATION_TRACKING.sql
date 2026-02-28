-- Migration: Add weather location tracking and wind direction to daily_weather_log
-- Date: 2026-02-28
-- Purpose: Add reverse geocoding location name and detailed location coordinates
--          Add wind direction information for better weather tracking

-- =====================================================
-- ADD NEW COLUMNS TO daily_weather_log
-- =====================================================

ALTER TABLE public.daily_weather_log
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_latitude NUMERIC(9,6),
ADD COLUMN IF NOT EXISTS location_longitude NUMERIC(9,6),
ADD COLUMN IF NOT EXISTS wind_direction_dominant TEXT,
ADD COLUMN IF NOT EXISTS wind_gusts_max NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS wind_direction_degrees NUMERIC(6,2);

-- =====================================================
-- CREATE INDEXES FOR LOCATION LOOKUPS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_weather_log_location_name 
ON public.daily_weather_log(location_name);

CREATE INDEX IF NOT EXISTS idx_daily_weather_log_location_coords 
ON public.daily_weather_log(location_latitude, location_longitude);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN public.daily_weather_log.location_name IS 
  'Reverse-geocoded location name from coordinates using OpenStreetMap Nominatim API. 
   Format: "Municipality, Province". Used for UI display and location tracking.';

COMMENT ON COLUMN public.daily_weather_log.location_latitude IS 
  'Latitude coordinate used for reverse geocoding lookup (stored for audit trail).';

COMMENT ON COLUMN public.daily_weather_log.location_longitude IS 
  'Longitude coordinate used for reverse geocoding lookup (stored for audit trail).';

COMMENT ON COLUMN public.daily_weather_log.wind_direction_dominant IS 
  'Dominant wind direction derived from wind direction data when available.
   Values: N, NE, E, SE, S, SW, W, NW';

COMMENT ON COLUMN public.daily_weather_log.wind_gusts_max IS 
  'Maximum wind gust speed in m/s. Useful for identifying severe wind events.';

COMMENT ON COLUMN public.daily_weather_log.wind_direction_degrees IS 
  'Dominant wind direction in compass degrees (0-360). 0° = North, 90° = East, etc.';

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'daily_weather_log'
  AND column_name IN (
    'location_name', 'location_latitude', 'location_longitude',
    'wind_direction_dominant', 'wind_gusts_max', 'wind_direction_degrees'
  )
ORDER BY ordinal_position;
