-- ============================================================================
-- WEATHER CACHE TABLE FIX - VERSIONE SEMPLICE - 18 Gennaio 2026
-- Risolve errore 406 nella richiesta weather_cache
-- ============================================================================

-- Create weather_cache table if not exists
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    lat_lng text NOT NULL,
    date date NOT NULL,
    forecast jsonb NOT NULL,
    cached_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add primary key if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'weather_cache_pkey'
    ) THEN
        ALTER TABLE public.weather_cache 
        ADD CONSTRAINT weather_cache_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- Add unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'weather_cache_lat_lng_date_key'
    ) THEN
        ALTER TABLE public.weather_cache 
        ADD CONSTRAINT weather_cache_lat_lng_date_key UNIQUE (lat_lng, date);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weather_cache_lat_lng_date 
ON public.weather_cache USING btree (lat_lng, date);

CREATE INDEX IF NOT EXISTS idx_weather_cache_cached_at 
ON public.weather_cache USING btree (cached_at);

-- Enable Row Level Security
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe)
DROP POLICY IF EXISTS "Weather cache is publicly readable" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can insert weather cache" ON public.weather_cache;

-- Create policies (simple version)
CREATE POLICY "Weather cache is publicly readable" 
ON public.weather_cache FOR SELECT 
USING (true);

CREATE POLICY "Users can insert weather cache" 
ON public.weather_cache FOR INSERT 
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.weather_cache TO authenticated;
GRANT ALL ON public.weather_cache TO anon;

-- Test the table works
INSERT INTO public.weather_cache (lat_lng, date, forecast) 
VALUES ('test_40.3609_16.6863', '2026-01-18', '{"test": true}')
ON CONFLICT (lat_lng, date) DO NOTHING;

-- Verify table creation and data
SELECT 
    'weather_cache table created successfully' as status,
    count(*) as total_records
FROM public.weather_cache;

-- Clean up test data
DELETE FROM public.weather_cache WHERE lat_lng = 'test_40.3609_16.6863';