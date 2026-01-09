#!/bin/bash

# Script per fixare breaking changes rowId → bedRowId
# Dopo la migration 20260104000000_add_field_rows_to_operations.sql

echo "🔧 Fixing rowId → bedRowId breaking changes..."

# File da modificare
FILES_TO_FIX=(
  "app/(dashboard)/app/mechanical-work/page.tsx"
  "app/(dashboard)/app/nutrition/page.tsx"
  "components/fertilizer/FertilizerApplicationModal.tsx"
  "packages/storage-cloud/SupabaseStorageProvider.ts"
)

# Pattern da sostituire
# row_id → bed_row_id (SQL style)
# rowId → bedRowId (TypeScript style)

for file in "${FILES_TO_FIX[@]}"; do
  if [ -f "$file" ]; then
    echo "  📝 Fixing $file..."

    # TypeScript: rowId → bedRowId (ma NON fieldRowId!)
    sed -i.bak 's/\browId\b/bedRowId/g' "$file"

    # SQL/DB: row_id → bed_row_id (ma NON field_row_id!)
    sed -i.bak 's/\brow_id\b/bed_row_id/g' "$file"

    # Rimuovi backup
    rm "${file}.bak" 2>/dev/null || true

    echo "  ✅ Fixed $file"
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ Breaking changes fixed!"
echo ""
echo "Next steps:"
echo "1. Review the changes with: git diff"
echo "2. Test the application"
echo "3. Commit changes: git add . && git commit -m 'fix: Breaking changes rowId → bedRowId after field_rows migration'"
