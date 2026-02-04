# 🚨 APPLY MIGRATIONS NOW

**Status**: ❌ Migrations NOT applied to database  
**Error**: Functions `get_field_row_history` and `get_rotation_suggestions` do not exist  
**Action Required**: Apply SQL migrations immediately

---

## 🔴 Current Problem

The browser console shows these errors:
```
Error getting field row history: {}
Error getting rotation suggestions: {}
```

**Cause**: The database tables and functions don't exist yet because migrations haven't been applied.

---

## ✅ Solution: Apply Migrations

### Option 1: Supabase Dashboard (RECOMMENDED - 2 minutes)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj
   - Login with your credentials

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Paste**
   - Open file: `apply-crop-rotation-migrations.sql`
   - Copy ALL content (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor

4. **Run Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for completion (should take 5-10 seconds)
   - Check for success message

5. **Verify**
   - Refresh your app at http://localhost:3002
   - Open browser console
   - Errors should be gone! ✅

### Option 2: Supabase CLI (Alternative)

```bash
# Make sure you're in the project root
cd /path/to/ortomio

# Apply migration
supabase db push

# Or apply specific file
psql "postgresql://postgres:[YOUR-PASSWORD]@db.qhmujoivfxftlrcrluaj.supabase.co:5432/postgres" -f apply-crop-rotation-migrations.sql
```

---

## 📋 What Gets Created

### Tables
- ✅ `field_row_crop_history` - Crop rotation history per field row
- ✅ `land_zones` - Fixed macro-zones for land management
- ✅ `soil_memory` - Permanent soil memory independent from rows
- ✅ `garden_rows.land_zone_id` - Link field rows to zones

### Functions
- ✅ `calculate_rotation_score(row_id, crop_family)` - Score 1-100
- ✅ `get_rotation_suggestions(row_id)` - AI suggestions
- ✅ `get_field_row_history(row_id)` - Complete history
- ✅ `get_zone_rotation_suggestions(zone_id)` - Zone suggestions
- ✅ `calculate_zone_soil_health(zone_id)` - Health score
- ✅ `get_zone_history(zone_id)` - Zone history

### Indexes & Policies
- ✅ Performance indexes on all tables
- ✅ RLS policies for user data isolation

---

## 🧪 Verify Migration Success

### Test 1: Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('field_row_crop_history', 'land_zones', 'soil_memory');
```

Expected: 3 rows returned

### Test 2: Check Functions Exist
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('calculate_rotation_score', 'get_rotation_suggestions', 'get_field_row_history');
```

Expected: 3 rows returned

### Test 3: Test in Browser
1. Go to http://localhost:3002/app/garden/rows
2. Click "📜 Storico" on any field row
3. Should see history panel without errors
4. Check browser console - no errors! ✅

---

## 🔧 Troubleshooting

### Error: "relation already exists"
**Solution**: Tables already exist, migration is safe to re-run (uses IF NOT EXISTS)

### Error: "function already exists"
**Solution**: Functions will be replaced (uses CREATE OR REPLACE)

### Error: "permission denied"
**Solution**: Make sure you're logged in as the project owner in Supabase Dashboard

### Error: "connection refused"
**Solution**: You're trying to connect to local database but it's not running. Use Supabase Dashboard instead.

---

## 📝 After Migration

Once migration is applied:

1. **Refresh your app** - Hard refresh (Ctrl+Shift+R)
2. **Test crop history** - Click "Storico" on a field row
3. **Test zone management** - Go to `/app/garden/zones`
4. **Create a zone** - Test zone creation modal
5. **Create field row with zone** - Test zone selection

---

## 🚀 Next Steps After Migration

1. ✅ Verify no console errors
2. ✅ Test crop history panel
3. ✅ Test zone management page
4. ⏳ Implement zone creation modal (see NEXT_STEPS_LAND_ZONES_INTEGRATION.md)
5. ⏳ Add zone selection to field row creation
6. ⏳ Test complete workflow

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase Dashboard logs
2. Check browser console for detailed errors
3. Verify you're connected to the correct database
4. Try re-running the migration (it's idempotent)

---

**IMPORTANT**: Apply this migration NOW to fix the console errors and enable crop rotation features! 🚨

