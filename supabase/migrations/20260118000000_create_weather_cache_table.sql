-- Create weather_cache table if not exists
-- This table is used to cache weather forecast data to reduce API calls

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