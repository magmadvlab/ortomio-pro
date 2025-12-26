#!/bin/bash

# Deploy Field Rows Migration to Supabase
# Usage: ./database/deploy_field_rows.sh

echo "🚀 Deploying field_rows migration to Supabase..."

# Check if Supabase is running
if ! curl -s http://127.0.0.1:54321/health > /dev/null; then
  echo "❌ Supabase is not running. Start it with: supabase start"
  exit 1
fi

echo "✅ Supabase is running"

# Apply migration via SQL Editor API
echo "📦 Applying migration: add_field_rows_system.sql"

# Read the SQL file
SQL_CONTENT=$(cat database/migrations/add_field_rows_system.sql)

# Execute via psql (requires connection string)
echo "$SQL_CONTENT" | psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Migration applied successfully!"
  echo ""
  echo "Tables created:"
  echo "  - garden_zones"
  echo "  - field_rows"
  echo "  - planting_batches"
  echo ""
  echo "You can verify in Supabase Studio: http://127.0.0.1:54326"
else
  echo "❌ Migration failed. Check errors above."
  echo ""
  echo "💡 Manual solution:"
  echo "1. Open http://127.0.0.1:54326"
  echo "2. Go to SQL Editor"
  echo "3. Copy content from: database/migrations/add_field_rows_system.sql"
  echo "4. Paste and run the query"
  exit 1
fi
