-- Migration: Add Notification Preferences
-- Crea tabella per gestire preferenze notifiche utente

-- ============================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Preferenze generali
  email_enabled BOOLEAN DEFAULT true,
  
  -- Preferenze specifiche per tipo
  task_reminders BOOLEAN DEFAULT true,
  weather_alerts BOOLEAN DEFAULT true,
  challenge_notifications BOOLEAN DEFAULT true,
  harvest_notifications BOOLEAN DEFAULT true,
  seed_notifications BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
  ON notification_preferences(user_id);

-- ============================================
-- TRIGGER: Update updated_at
-- ============================================

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete their own notification preferences"
  ON notification_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Get or create default preferences
-- ============================================

CREATE OR REPLACE FUNCTION get_or_create_notification_preferences(p_user_id UUID)
RETURNS notification_preferences AS $$
DECLARE
  v_prefs notification_preferences;
BEGIN
  -- Cerca preferenze esistenti
  SELECT * INTO v_prefs
  FROM notification_preferences
  WHERE user_id = p_user_id;

  -- Se non esistono, crea default
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_prefs;
  END IF;

  RETURN v_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Create default preferences on user creation
-- ============================================

CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger quando viene creato un nuovo utente
DROP TRIGGER IF EXISTS on_user_created_notification_prefs ON auth.users;
CREATE TRIGGER on_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();





