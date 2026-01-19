-- Apply irrigation system migration if tables don't exist
-- Run this if you're getting irrigation dashboard errors

-- Check if tables exist first
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'irrigation_zones') THEN
        RAISE NOTICE 'Irrigation tables not found. Please run the migration: supabase/migrations/20260117010000_create_advanced_irrigation_system.sql';
    ELSE
        RAISE NOTICE 'Irrigation tables already exist.';
    END IF;
END $$;

-- To apply the migration, run:
-- psql -d your_database -f supabase/migrations/20260117010000_create_advanced_irrigation_system.sql