-- ============================================================================
-- WEATHER CACHE TABLE FIX - 18 Gennaio 2026
-- Risolve errore 406 nella richiesta weather_cache
-- ============================================================================

-- Create weather_cache table if not exists
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    lat_lng text NOT NULL,
    date date NOT NULL,
    forecast jsonb NOT NULL,
    cached_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT weather_cache_pkey PRIMARY KEY (id),
    CONSTRAINT weather_cache_lat_lng_date_key UNIQUE (lat_lng, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weather_cache_lat_lng_date ON public.weather_cache USING btree (lat_lng, date);
CREATE INDEX IF NOT EXISTS idx_weather_cache_cached_at ON public.weather_cache USING btree (cached_at);

-- Enable Row Level Security
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Weather cache is publicly readable" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can insert weather cache" ON public.weather_cache;

-- Create policies for weather cache (without IF NOT EXISTS)
DO $$
BEGIN
    -- Create read policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'weather_cache' 
        AND policyname = 'Weather cache is publicly readable'
    ) THEN
        CREATE POLICY "Weather cache is publicly readable" 
        ON public.weather_cache FOR SELECT 
        USING (true);
    END IF;
    
    -- Create insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'weather_cache' 
        AND policyname = 'Users can insert weather cache'
    ) THEN
        CREATE POLICY "Users can insert weather cache" 
        ON public.weather_cache FOR INSERT 
        WITH CHECK (true);
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON public.weather_cache TO authenticated;
GRANT ALL ON public.weather_cache TO anon;

-- Verify table creation
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'weather_cache';

-- Verify indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'weather_cache';

-- Verify policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'weather_cache';