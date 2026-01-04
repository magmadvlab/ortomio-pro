-- ============================================
-- Fix Profiles RLS Policy
-- Data: 2026-01-03
-- ============================================
-- The existing policy only has USING clause which blocks INSERT/UPDATE
-- Need to add WITH CHECK clause to allow users to insert/update their own profile

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can only access their own profile" ON public.profiles;

-- Recreate with both USING and WITH CHECK clauses
CREATE POLICY "Users can only access their own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Notifica PostgREST di ricaricare lo schema
NOTIFY pgrst, 'reload schema';
