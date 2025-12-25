-- OrtoMio AI - Credits System Schema
-- This schema adds AI credits management and professional tier support

-- ============================================
-- PROFILES (User Profiles with Tier and Credits)
-- ============================================
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PRO_CONSUMER', 'PRO_PROFESSIONAL')),
  
  -- AI Credits
  ai_credits_total INTEGER DEFAULT 0,
  ai_credits_used INTEGER DEFAULT 0,
  ai_credits_reset_date DATE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to existing profiles table if it exists
DO $$ 
BEGIN
  -- Add tier column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'tier') THEN
    ALTER TABLE profiles ADD COLUMN tier TEXT DEFAULT 'FREE' 
      CHECK (tier IN ('FREE', 'PRO_CONSUMER', 'PRO_PROFESSIONAL'));
  END IF;
  
  -- Add credits columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'ai_credits_total') THEN
    ALTER TABLE profiles ADD COLUMN ai_credits_total INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'ai_credits_used') THEN
    ALTER TABLE profiles ADD COLUMN ai_credits_used INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'ai_credits_reset_date') THEN
    ALTER TABLE profiles ADD COLUMN ai_credits_reset_date DATE 
      DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::DATE;
  END IF;
END $$;

-- ============================================
-- AI CREDIT TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS ai_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,  -- Positivo = acquisto, Negativo = utilizzo
  type TEXT NOT NULL CHECK (type IN ('monthly_grant', 'purchase', 'usage', 'bonus', 'refund')),
  feature TEXT,  -- 'chat', 'diagnose', 'recipe', ecc.
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON ai_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON ai_credit_transactions(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to deduct credits (atomic)
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_used = ai_credits_used + p_amount
  WHERE id = p_user_id
    AND (ai_credits_total - ai_credits_used) >= p_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to grant credits
CREATE OR REPLACE FUNCTION grant_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for welcome bonus (3 credits FREE alla signup)
CREATE OR REPLACE FUNCTION handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure profile exists
  INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (NEW.id, 'FREE', 3, 0)
  ON CONFLICT (id) DO NOTHING;
  
  -- Grant 3 free credits if profile was just created
  IF NOT EXISTS (SELECT 1 FROM ai_credit_transactions 
                 WHERE user_id = NEW.id AND type = 'bonus' AND description LIKE '%Welcome%') THEN
    PERFORM grant_credits(NEW.id, 3);
    
    INSERT INTO ai_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'bonus', 'Welcome bonus - 3 free AI credits');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_user_created_credits ON auth.users;
CREATE TRIGGER on_user_created_credits
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_credits();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY IF NOT EXISTS "Users can only access their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

-- Credit Transactions: Users can only access their own transactions
CREATE POLICY IF NOT EXISTS "Users can only access their own transactions"
  ON ai_credit_transactions FOR ALL
  USING (auth.uid() = user_id);



















