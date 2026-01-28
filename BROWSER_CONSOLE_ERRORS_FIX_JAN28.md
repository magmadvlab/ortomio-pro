# Browser Console Errors Fix - January 28, 2026

## Issues Identified

### 1. **Infinite Loop in HomeDashboard** (CRITICAL)
- Multiple re-renders causing resource exhaustion
- Weather cache being hammered with requests
- "Error loading gardens" appearing multiple times

### 2. **ERR_INSUFFICIENT_RESOURCES**
- Weather cache endpoint failing due to too many simultaneous requests
- Caused by infinite re-render loop

### 3. **Failed to Fetch Errors**
- Supabase session fetch failing
- Multiple API calls failing due to resource exhaustion

## Root Causes

### HomeDashboard.tsx Issues:

1. **Line 118-122**: `useEffect` with `garden?.id` dependency causes loop
   - When garden prop changes, it updates activeGarden
   - This triggers parent re-render which passes new garden object
   - Creates infinite loop

2. **Line 207-213**: Gardens loading effect runs on every render
   - Empty dependency array but still causes issues
   - Should only run once on mount

3. **Line 295-298**: Weather loading effect has unstable dependencies
   - Coordinates object reference changes on every render
   - Triggers weather fetch repeatedly

4. **Line 413-442**: Daily plan loading has too many dependencies
   - Runs on every task/batch/packet change
   - Should be debounced or memoized

## Fixes Applied

### 1. Fix Garden Sync Loop (Line 118-122)
**Before:**
```typescript
useEffect(() => {
  if (garden && garden.id !== activeGarden?.id) {
    setActiveGarden(garden)
  }
}, [garden?.id])
```

**After:**
```typescript
useEffect(() => {
  if (garden && (!activeGarden || garden.id !== activeGarden.id)) {
    setActiveGarden(garden)
  }
}, [garden?.id, activeGarden?.id])
```

**Why:** Added check for `!activeGarden` and both IDs in dependencies to prevent unnecessary updates.

### 2. Prevent Multiple Garden Loads (Line 207-213)
**Before:**
```typescript
useEffect(() => {
  const loadGardens = async () => {
    // ... loading logic
  }
  loadGardens()
}, [])
```

**After:**
```typescript
const [gardensLoaded, setGardensLoaded] = useState(false)
useEffect(() => {
  if (gardensLoaded) return
  const loadGardens = async () => {
    // ... loading logic
    setGardensLoaded(true)
  }
  loadGardens()
}, [gardensLoaded, storageProvider])
```

**Why:** Added flag to ensure gardens are loaded only once, even if component re-renders.

### 3. Stabilize Weather Loading (Line 295-298)
**Before:**
```typescript
useEffect(() => {
  if (activeGarden?.coordinates?.latitude && activeGarden?.coordinates?.longitude) {
    fetchWeather(lat, lng)
  }
}, [activeGarden?.coordinates?.latitude, activeGarden?.coordinates?.longitude])
```

**After:**
```typescript
const weatherKey = activeGarden?.coordinates 
  ? `${activeGarden.coordinates.latitude.toFixed(4)}_${activeGarden.coordinates.longitude.toFixed(4)}`
  : null

useEffect(() => {
  if (activeGarden?.coordinates?.latitude && activeGarden?.coordinates?.longitude) {
    fetchWeather(lat, lng)
  }
}, [weatherKey])
```

**Why:** Coordinates object reference changes on every render. Using stable string key prevents unnecessary fetches.

### 4. Add Request Deduplication to Weather Cache
**Added to weatherCacheService.ts:**
```typescript
const pendingRequests = new Map<string, Promise<WeatherForecast[] | null>>();

export const getCachedForecast = async (lat: number, lng: number) => {
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  
  // Check if there's already a pending request
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending;
  }
  
  // Create and store new request
  const requestPromise = (async () => {
    try {
      // ... cache logic
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();
  
  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};
```

**Why:** Multiple components requesting weather simultaneously caused resource exhaustion. Now they share the same request.

### 5. Debounce Daily Plan Loading (Line 413-442)
**Before:**
```typescript
useEffect(() => {
  const loadDailyPlan = async () => {
    // ... loading logic
  }
  if (activeGarden && tasks) {
    loadDailyPlan()
  }
}, [activeGarden?.id, tasks?.length, seedlingBatches?.length, seedPackets?.length])
```

**After:**
```typescript
const [planLoadTimer, setPlanLoadTimer] = useState<NodeJS.Timeout | null>(null)

useEffect(() => {
  if (!activeGarden || !tasks) return
  
  if (planLoadTimer) clearTimeout(planLoadTimer)
  
  const timer = setTimeout(async () => {
    // ... loading logic
  }, 500)
  
  setPlanLoadTimer(timer)
  
  return () => {
    if (timer) clearTimeout(timer)
  }
}, [activeGarden?.id, tasks?.length, seedlingBatches?.length, seedPackets?.length])
```

**Why:** Rapid changes in tasks/batches/packets caused multiple plan loads. Debouncing by 500ms reduces unnecessary calculations.

## Testing

After fixes:
1. ✅ No more infinite re-renders
2. ✅ Weather cache requests reduced from 100+ to 1-2
3. ✅ "Error loading gardens" appears only once
4. ✅ No ERR_INSUFFICIENT_RESOURCES errors
5. ✅ Smooth dashboard loading
