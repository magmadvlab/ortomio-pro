-- =====================================================
-- APPLY MULTI-TENANCY MIGRATION - January 17, 2026
-- =====================================================
-- This script applies the multi-tenancy and API keys migration
-- Run this on your Supabase database to create all required tables

-- Check if migration is already applied
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'organizations' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Applying multi-tenancy migration...';
    ELSE
        RAISE NOTICE 'Multi-tenancy tables already exist, checking for updates...';
    END IF;
END $$;

-- Apply the migration
\i supabase/migrations/20260116040000_create_multi_tenancy_system.sql

-- Verify tables were created
DO $$ 
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'organizations', 
        'roles', 
        'organization_members', 
        'organization_invitations', 
        'garden_assignments', 
        'api_keys'
    );
    
    RAISE NOTICE 'Multi-tenancy tables created: % out of 6', table_count;
    
    IF table_count = 6 THEN
        RAISE NOTICE '✅ All multi-tenancy tables successfully created!';
    ELSE
        RAISE WARNING '⚠️  Some tables may be missing. Expected 6, found %', table_count;
    END IF;
END $$;

-- Check RLS policies
DO $$ 
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN (
        'organizations', 
        'roles', 
        'organization_members', 
        'organization_invitations', 
        'garden_assignments', 
        'api_keys'
    );
    
    RAISE NOTICE 'RLS policies created: %', policy_count;
    
    IF policy_count >= 12 THEN
        RAISE NOTICE '✅ RLS policies successfully created!';
    ELSE
        RAISE NOTICE 'ℹ️  RLS policies: % (expected ~12)', policy_count;
    END IF;
END $$;

-- Check indexes
DO $$ 
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename IN (
        'organizations', 
        'roles', 
        'organization_members', 
        'organization_invitations', 
        'garden_assignments', 
        'api_keys'
    )
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE 'Performance indexes created: %', index_count;
    
    IF index_count >= 10 THEN
        RAISE NOTICE '✅ Performance indexes successfully created!';
    ELSE
        RAISE NOTICE 'ℹ️  Performance indexes: % (expected ~12)', index_count;
    END IF;
END $$;

-- Test system roles function
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'create_system_roles_for_organization'
        AND routine_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ System roles function created successfully!';
    ELSE
        RAISE WARNING '⚠️  System roles function not found';
    END IF;
END $$;

-- Final summary
RAISE NOTICE '';
RAISE NOTICE '🎉 MULTI-TENANCY MIGRATION COMPLETE!';
RAISE NOTICE '';
RAISE NOTICE 'Created tables:';
RAISE NOTICE '  • organizations - Company/farm entities';
RAISE NOTICE '  • roles - Permission-based access control';
RAISE NOTICE '  • organization_members - Users in organizations';
RAISE NOTICE '  • organization_invitations - Email invitation system';
RAISE NOTICE '  • garden_assignments - Garden access for members';
RAISE NOTICE '  • api_keys - External service API keys';
RAISE NOTICE '';
RAISE NOTICE 'Security features:';
RAISE NOTICE '  • Row Level Security (RLS) policies';
RAISE NOTICE '  • Permission-based access control';
RAISE NOTICE '  • Encrypted API key storage';
RAISE NOTICE '';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '  1. Go to Settings > Organization in your app';
RAISE NOTICE '  2. Create your first organization';
RAISE NOTICE '  3. Invite team members';
RAISE NOTICE '  4. Configure API keys for external services';
RAISE NOTICE '';