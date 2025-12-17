-- ============================================
-- GRUPPO 2: USER & PROFILES
-- ============================================
-- Sistema di gestione profili utente e tier
-- 
-- Include:
-- - profiles (tier system, credits)
-- - create_superadmin
-- - fix login errors
-- 
-- ORDINE: Dopo core schema (01)

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PRO_CONSUMER', 'PRO_PROFESSIONAL')),
  ai_credits_total INTEGER DEFAULT 0,
  ai_credits_used INTEGER DEFAULT 0,
  ai_credits_reset_date DATE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can only access their own profile'
  ) THEN
    CREATE POLICY "Users can only access their own profile"
      ON profiles FOR ALL
      USING (auth.uid() = id);
  END IF;
END $$;

-- Trigger per updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

