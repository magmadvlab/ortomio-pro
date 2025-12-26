-- ============================================
-- ADD USER PREFERENCES TO PROFILES
-- Data: 2025-12-26
-- Descrizione: Aggiunge colonna preferences (JSONB) alla tabella profiles
-- ============================================

-- Add preferences column if it doesn't exist
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Create index for better query performance on preferences keys
CREATE INDEX IF NOT EXISTS idx_profiles_preferences
  ON profiles USING gin(preferences);

COMMENT ON COLUMN profiles.preferences IS 'User preferences stored as JSON (theme, notifications, etc.)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ User preferences column added to profiles table successfully!';
END $$;
