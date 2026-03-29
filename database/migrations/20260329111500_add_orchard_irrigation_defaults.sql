ALTER TABLE orchard_configurations
ADD COLUMN IF NOT EXISTS irrigation_defaults jsonb;
