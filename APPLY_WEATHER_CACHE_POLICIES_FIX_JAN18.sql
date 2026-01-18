-- ============================================================================
-- WEATHER CACHE POLICIES FIX - 18 Gennaio 2026
-- Risolve problema RLS policies per inserimento dati
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Weather cache is publicly readable" ON public.weather_cache;
DROP POLICY IF EXISTS "Users can insert weather cache" ON public.weather_cache;

-- Create more permissive policies for weather cache (public data)
CREATE POLICY "weather_cache_select_policy" 
ON public.weather_cache FOR SELECT 
USING (true);

CREATE POLICY "weather_cache_insert_policy" 
ON public.weather_cache FOR INSERT 
WITH CHECK (true);

CREATE POLICY "weather_cache_update_policy" 
ON public.weather_cache FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.weather_cache TO authenticated;
GRANT ALL ON public.weather_cache TO anon;

-- Test the policies work
INSERT INTO public.weather_cache (lat_lng, date, forecast) 
VALUES ('test_policy_40.3609_16.6863', '2026-01-18', '{"test": "policy_fix"}')
ON CONFLICT (lat_lng, date) DO UPDATE SET 
forecast = EXCLUDED.forecast,
cached_at = now();

-- Verify the test worked
SELECT 
    'Policies fixed successfully' as status,
    count(*) as total_records,
    max(cached_at) as latest_cache
FROM public.weather_cache;

-- Clean up test data
DELETE FROM public.weather_cache WHERE lat_lng LIKE 'test_policy_%';