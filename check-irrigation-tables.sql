-- Check if irrigation system tables exist
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE tablename IN (
  'irrigation_zones',
  'irrigation_systems', 
  'irrigation_logs',
  'irrigation_schedules'
)
ORDER BY tablename;

-- If no results, the tables don't exist and the migration needs to be run