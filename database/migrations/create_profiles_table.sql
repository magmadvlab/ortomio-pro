-- Crea tabella profiles se non esiste
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

-- Rimuovi policy se esiste già, poi creala
DROP POLICY IF EXISTS "Users can only access their own profile" ON profiles;

CREATE POLICY "Users can only access their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);








