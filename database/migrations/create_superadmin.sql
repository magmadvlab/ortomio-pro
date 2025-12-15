-- Migration: Create Superadmin User and Functions
-- This creates a superadmin user and functions to manage users and tiers

-- ============================================
-- SUPERADMIN USER CREATION
-- ============================================

-- Function to create superadmin user
-- Usage: SELECT create_superadmin('admin@ortomio.ai', 'your_secure_password');
CREATE OR REPLACE FUNCTION create_superadmin(
  p_email TEXT,
  p_password TEXT DEFAULT 'SuperAdmin123!'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Create user in auth.users (this would normally be done via Supabase Auth API)
  -- For now, we'll create the profile and mark it as superadmin
  -- Note: The actual auth user must be created via Supabase Auth API first
  
  -- Check if user already exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % does not exist in auth.users. Please create the user via Supabase Auth API first.', p_email;
  END IF;
  
  -- Create or update profile with superadmin tier
  INSERT INTO profiles (id, tier, ai_credits_total, ai_credits_used)
  VALUES (v_user_id, 'PRO_PROFESSIONAL', 999999, 0)
  ON CONFLICT (id) DO UPDATE
  SET tier = 'PRO_PROFESSIONAL',
      ai_credits_total = 999999,
      ai_credits_used = 0;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADMIN FUNCTIONS
-- ============================================

-- Function to set user tier (admin only)
CREATE OR REPLACE FUNCTION set_user_tier(
  p_user_id UUID,
  p_tier TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Validate tier
  IF p_tier NOT IN ('FREE', 'PRO_CONSUMER', 'PRO_PROFESSIONAL') THEN
    RAISE EXCEPTION 'Invalid tier: %. Must be FREE, PRO_CONSUMER, or PRO_PROFESSIONAL', p_tier;
  END IF;
  
  -- Update profile
  INSERT INTO profiles (id, tier)
  VALUES (p_user_id, p_tier::TEXT)
  ON CONFLICT (id) DO UPDATE
  SET tier = p_tier::TEXT,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant credits to user
CREATE OR REPLACE FUNCTION admin_grant_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_credits_total = ai_credits_total + p_amount
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id;
  END IF;
  
  -- Log transaction
  INSERT INTO ai_credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'bonus', 'Admin granted credits');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to list all users (admin view)
CREATE OR REPLACE FUNCTION list_all_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  tier TEXT,
  credits_total INTEGER,
  credits_used INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(p.tier, 'FREE')::TEXT as tier,
    COALESCE(p.ai_credits_total, 0) as credits_total,
    COALESCE(p.ai_credits_used, 0) as credits_used,
    u.created_at
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES FOR ADMIN FUNCTIONS
-- ============================================

-- Allow superadmin to view all profiles (we'll check this in application code)
-- Note: RLS policies are already set to users can only see their own profile
-- Admin functions use SECURITY DEFINER to bypass RLS

-- ============================================
-- CREATE SUPERADMIN (if you have an existing user)
-- ============================================

-- Example: To create superadmin for an existing user
-- First, get the user ID from auth.users:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
-- Then run:
-- SELECT set_user_tier('USER_ID_HERE', 'PRO_PROFESSIONAL');
-- SELECT admin_grant_credits('USER_ID_HERE', 999999);
