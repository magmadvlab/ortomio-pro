DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT con.conname
  INTO constraint_name
  FROM pg_constraint con
  INNER JOIN pg_class rel ON rel.oid = con.conrelid
  INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'sensor_readings'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%sensor_type%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.sensor_readings DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE public.sensor_readings
ADD CONSTRAINT sensor_readings_sensor_type_check
CHECK (
  sensor_type IN (
    'moisture',
    'temperature_soil',
    'temperature_air',
    'temperature_water',
    'humidity_air',
    'leaf_wetness',
    'dew_point',
    'vpd',
    'soil_moisture_10cm',
    'soil_moisture_30cm',
    'soil_moisture_60cm',
    'soil_tension_kpa',
    'canopy_temperature',
    'ph',
    'ec',
    'flow_rate_actual',
    'line_pressure',
    'dissolved_oxygen',
    'reservoir_level',
    'salinity',
    'water_salinity',
    'water_ph',
    'water_bicarbonates',
    'orp',
    'ammonia',
    'nitrite',
    'nitrate',
    'light',
    'wind',
    'rain_gauge_local',
    'solar_radiation',
    'par'
  )
);
