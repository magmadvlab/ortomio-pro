-- =====================================================
-- SCRIPT 3: Move pg_trgm extension (0014_extension_in_public)
-- Esegui questo direttamente nell'editor SQL di Supabase
-- =====================================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;
COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions';

-- Move pg_trgm extension from public to extensions schema
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Verify the move
SELECT 'SUCCESS: pg_trgm extension moved to extensions schema ✅' as result;
