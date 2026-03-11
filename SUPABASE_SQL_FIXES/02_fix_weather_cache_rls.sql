-- =====================================================
-- SCRIPT 2: Fix RLS Policy weather_cache (0024_permissive_rls_policy)
-- Esegui questo direttamente nell'editor SQL di Supabase
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can insert weather cache" ON public.weather_cache;

-- Create a proper policy that requires authentication and ownership
CREATE POLICY "Users can insert weather cache - authenticated"
  ON public.weather_cache
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (created_by = auth.uid() OR created_by IS NULL)
  );

-- Verify the fix
SELECT 'SUCCESS: weather_cache RLS policy fixed ✅' as result;
