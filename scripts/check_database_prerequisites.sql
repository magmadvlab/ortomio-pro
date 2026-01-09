-- Diagnostic script to check database prerequisites for precision agriculture migration

-- Check if gardens table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gardens')
    THEN '✅ gardens table exists'
    ELSE '❌ gardens table DOES NOT EXIST - Run database/schema.sql first!'
  END AS gardens_status;

-- Check if gardens table has id column
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'gardens' 
      AND column_name = 'id'
    )
    THEN '✅ gardens.id column exists'
    ELSE '❌ gardens.id column DOES NOT EXIST'
  END AS gardens_id_status;

-- Check if garden_tasks table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'garden_tasks')
    THEN '✅ garden_tasks table exists'
    ELSE '❌ garden_tasks table DOES NOT EXIST - Run database/schema.sql first!'
  END AS garden_tasks_status;

-- Check if photo_logs table exists (needed for vegetation_indices)
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'photo_logs')
    THEN '✅ photo_logs table exists'
    ELSE '⚠️ photo_logs table does not exist (may be optional)'
  END AS photo_logs_status;

-- List all tables in public schema
SELECT 
  'Tables in public schema:' AS info,
  string_agg(table_name, ', ' ORDER BY table_name) AS table_list
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

