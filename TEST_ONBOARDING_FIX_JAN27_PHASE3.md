# Testing Instructions - Onboarding Fix Phase 3

**Date**: January 27, 2026  
**Commit**: 16b5996  
**Status**: ✅ PUSHED - READY FOR TESTING

## What Was Fixed

The database save was moved from `app/page.tsx` to `GardenTypeWizard.tsx` because the original location wasn't executing. The save now happens at the correct point in the component hierarchy.

## CRITICAL: Hard Refresh Required

**You MUST perform a hard refresh to load the new JavaScript code!**

### Mac
```
Cmd + Shift + R
```

### Windows/Linux
```
Ctrl + Shift + R
```

### Alternative: Clear Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## Testing Steps

### 1. Hard Refresh Browser
- Press **Cmd + Shift + R** (Mac) or **Ctrl + Shift + R** (Windows/Linux)
- Wait for page to fully reload
- Open DevTools Console (F12)

### 2. Create Test Garden
1. Click "Crea il tuo orto" button
2. Select "Orto" (vegetable garden)
3. Complete wizard steps:
   - Name: "test garden 4" (or any name)
   - Type: Already selected (Orto)
   - Location: Use GPS or enter manually
   - Size: Configure dimensions
   - Soil: Select soil type and pH
   - Microclimate: Select sun exposure
4. Click "Completa" to finish

### 3. Watch Console Logs

You should see these logs in order:

```
[GardenTypeWizard] Rendered - selectedType: vegetable createdGarden: null
✅ Garden created from GardenOnboarding: {id: '...', name: 'test garden 4', ...}
📊 Storage provider available: true
🔐 About to save garden to database...
Creating garden for user: [user_id] Garden name: test garden 4
💾 Garden saved to database successfully: [garden_id]
🎉 Vegetable garden complete, calling onComplete
✅ Garden saved and returned from wizard: [garden_id]
🚀 Optimistic update: Adding garden to state
🔄 Starting background refresh with retry...
🔄 Refresh attempt 1/3
✅ Refresh successful: 1 gardens found
✅ Confirmed garden [garden_id] in database
```

### 4. Verify Database

Open Supabase and run:

```sql
SELECT id, name, created_at, user_id, size_sq_meters
FROM gardens 
ORDER BY created_at DESC 
LIMIT 5;
```

You should see your new garden in the results.

### 5. Verify Persistence

1. Refresh the page (F5)
2. Garden should still be visible
3. Dashboard should load with garden data
4. No "No gardens found" message

## Expected Results

### ✅ Success Indicators
- Console shows all database save logs
- Garden appears in Supabase database
- Garden persists after page refresh
- Dashboard loads correctly
- No errors in console

### ❌ Failure Indicators
- Missing database save logs
- Garden not in Supabase database
- "No gardens found" after refresh
- Errors in console

## Troubleshooting

### If logs don't appear:
1. Verify you did a hard refresh (Cmd+Shift+R)
2. Clear browser cache completely
3. Close and reopen browser
4. Try incognito/private mode

### If garden doesn't save:
1. Check console for error messages
2. Verify Supabase connection
3. Check RLS policies in Supabase
4. Verify user is authenticated

### If garden disappears on refresh:
1. Check Supabase database for garden entry
2. Verify user_id matches authenticated user
3. Check RLS policies allow SELECT

## What Changed

### Before (Phase 2)
```typescript
// app/app/page.tsx
onComplete={async (garden) => {
  // This handler was never executing!
  const savedGarden = await storageProvider.createGarden(garden)
  // ...
}}
```

### After (Phase 3)
```typescript
// components/GardenTypeWizard.tsx
const handleGardenCreated = async (garden: Garden) => {
  // Database save happens HERE now ✅
  const savedGarden = await storageProvider.createGarden(garden)
  onComplete(savedGarden) // Pass saved garden to parent
}

// app/app/page.tsx
onComplete={async (garden) => {
  // Garden is already saved, just update UI
  setGardens(prev => [...prev, garden])
  // ...
}}
```

## Data Flow

```
User completes wizard
  ↓
GardenOnboarding.handleComplete()
  - Creates garden object
  - Calls onComplete(garden)
  ↓
GardenTypeWizard.handleGardenCreated() ← DATABASE SAVE HERE ✅
  - await storageProvider.createGarden(garden)
  - Gets savedGarden with DB ID
  - Calls onComplete(savedGarden)
  ↓
app/page.tsx onComplete
  - Receives saved garden
  - Adds to React state
  - Triggers background refresh
  - Dashboard appears
```

## Files Modified

- `components/GardenTypeWizard.tsx` - Added database save logic
- `app/app/page.tsx` - Simplified onComplete handler

## Related Documentation

- `ONBOARDING_FIX_PHASE3_COMPLETE.md` - Complete fix documentation
- `PUSH_SUCCESS_JAN27_ONBOARDING_FIX_PHASE3.md` - Push confirmation
- `ONBOARDING_DEBUG_ANALYSIS.md` - Root cause analysis
- `.kiro/specs/onboarding-fix/tasks.md` - Task tracking

## Next Steps

1. ✅ Hard refresh browser
2. ✅ Create test garden
3. ✅ Verify console logs
4. ✅ Check Supabase database
5. ✅ Verify persistence
6. ✅ Report results

---

**Status**: Ready for testing  
**Priority**: CRITICAL  
**Action Required**: Hard refresh and test
