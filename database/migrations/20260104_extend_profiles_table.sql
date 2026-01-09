-- Migration: Extend profiles table for enhanced authentication
-- Date: 2026-01-04
-- Description: Add personal information, system status, and GDPR compliance fields

-- Add personal information columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add system status columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add GDPR compliance columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;

-- Add preferences JSONB column with default notification settings
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
  "language": "it",
  "timezone": "Europe/Rome",
  "units": "metric",
  "notifications": {
    "email": true,
    "push": true,
    "sms": false,
    "weatherAlerts": true,
    "taskReminders": true,
    "harvestNotifications": true
  }
}'::jsonb;

-- Add constraints for data validation
ALTER TABLE profiles 
ADD CONSTRAINT check_first_name_length CHECK (first_name IS NULL OR length(first_name) <= 50),
ADD CONSTRAINT check_last_name_length CHECK (last_name IS NULL OR length(last_name) <= 50),
ADD CONSTRAINT check_company_length CHECK (company IS NULL OR length(company) <= 100),
ADD CONSTRAINT check_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'),
ADD CONSTRAINT check_birth_date_range CHECK (birth_date IS NULL OR (birth_date >= '1900-01-01' AND birth_date <= CURRENT_DATE - INTERVAL '13 years'));

-- Create performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON profiles(phone_verified);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_tier_email_verified ON profiles(tier, email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status ON profiles(onboarding_completed, email_verified);

-- Add indexes for garden_tasks performance optimization
CREATE INDEX IF NOT EXISTS idx_garden_tasks_garden_completed_date ON garden_tasks(garden_id, completed, date);
CREATE INDEX IF NOT EXISTS idx_garden_tasks_plant_season ON garden_tasks(plant_name, season) WHERE plant_name IS NOT NULL;

-- Add indexes for harvest_logs performance optimization  
CREATE INDEX IF NOT EXISTS idx_harvest_logs_garden_date ON harvest_logs(garden_id, harvest_date);
CREATE INDEX IF NOT EXISTS idx_harvest_logs_plant_quantity ON harvest_logs(plant_name, quantity) WHERE plant_name IS NOT NULL;

-- Add indexes for seed_inventory performance optimization
CREATE INDEX IF NOT EXISTS idx_seed_inventory_garden_species ON seed_inventory(garden_id, species_name);
CREATE INDEX IF NOT EXISTS idx_seed_inventory_expiry ON seed_inventory(expiry_year, expiry_month) WHERE expiry_year IS NOT NULL;

-- Update existing profiles to have default preferences if NULL
UPDATE profiles 
SET preferences = '{
  "language": "it",
  "timezone": "Europe/Rome", 
  "units": "metric",
  "notifications": {
    "email": true,
    "push": true,
    "sms": false,
    "weatherAlerts": true,
    "taskReminders": true,
    "harvestNotifications": true
  }
}'::jsonb
WHERE preferences IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.first_name IS 'User first name for personalization';
COMMENT ON COLUMN profiles.last_name IS 'User last name for personalization';
COMMENT ON COLUMN profiles.phone IS 'User phone number in international format';
COMMENT ON COLUMN profiles.birth_date IS 'User birth date for age-appropriate features';
COMMENT ON COLUMN profiles.company IS 'User company name for professional features';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile picture';
COMMENT ON COLUMN profiles.email_verified IS 'Whether user email has been verified';
COMMENT ON COLUMN profiles.phone_verified IS 'Whether user phone has been verified';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed initial setup';
COMMENT ON COLUMN profiles.terms_accepted_at IS 'Timestamp when user accepted terms and conditions';
COMMENT ON COLUMN profiles.privacy_accepted_at IS 'Timestamp when user accepted privacy policy';
COMMENT ON COLUMN profiles.marketing_consent IS 'Whether user consented to marketing communications';
COMMENT ON COLUMN profiles.preferences IS 'User preferences and notification settings in JSON format';