#!/bin/bash
# Script to run the Precision Agriculture migration
# This creates the garden_zones table and related tables

set -e

echo "🚀 Running Precision Agriculture Migration..."
echo ""

# Check if Supabase is running
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client tools."
    exit 1
fi

# Default connection (adjust if needed)
DB_URL="${DB_URL:-postgresql://postgres:postgres@localhost:54322/postgres}"

# Check if we can connect
echo "📡 Testing database connection..."
if ! psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Cannot connect to database at $DB_URL"
    echo ""
    echo "Please ensure:"
    echo "1. Supabase is running (run: supabase start)"
    echo "2. Database port is correct (check: supabase status)"
    echo ""
    echo "To get the correct connection string, run:"
    echo "  supabase status"
    echo ""
    echo "Then update DB_URL or run:"
    echo "  DB_URL='postgresql://postgres:postgres@localhost:PORT/postgres' ./scripts/run_precision_agriculture_migration.sh"
    exit 1
fi

echo "✅ Connected to database"
echo ""

# Check if required tables exist
echo "🔍 Checking prerequisites..."
if ! psql "$DB_URL" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gardens');" | grep -q t; then
    echo "❌ ERROR: The 'gardens' table does not exist!"
    echo ""
    echo "This migration requires the base schema to be run first."
    echo "Please run the base schema.sql file before running this migration:"
    echo ""
    echo "  psql \"$DB_URL\" -f database/schema.sql"
    echo ""
    exit 1
fi

if ! psql "$DB_URL" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'garden_tasks');" | grep -q t; then
    echo "❌ ERROR: The 'garden_tasks' table does not exist!"
    echo ""
    echo "This migration requires the base schema to be run first."
    echo "Please run the base schema.sql file before running this migration:"
    echo ""
    echo "  psql \"$DB_URL\" -f database/schema.sql"
    echo ""
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_FILE="$PROJECT_ROOT/database/migrations/add_precision_agriculture_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Running migration: $MIGRATION_FILE"
echo ""

# Run the migration
psql "$DB_URL" -f "$MIGRATION_FILE"

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "Created tables:"
echo "  - garden_zones"
echo "  - soil_analysis"
echo "  - vegetation_indices"
echo "  - yield_predictions"
echo "  - irrigation_zones"
echo "  - sensor_readings"
echo ""
echo "You can now refresh your app and the error should be resolved."

