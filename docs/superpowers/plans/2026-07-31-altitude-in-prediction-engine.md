# Altitude In Prediction Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `services/agronomicPredictionPipelineService.ts`'s harvest-window prediction account for garden altitude, using the real, already-established agronomic rule in `utils/altitudeUtils.ts` (5 days delay per 100m elevation), instead of a fixed 60-day harvest window for every garden regardless of elevation.

**Architecture:** `CanonicalPredictionInput` gains an `altitudeMeters?: number` field. `loadCanonicalPredictionInput` fetches it from the `gardens` table (a query this function doesn't currently make) alongside its existing parallel queries. `buildYieldPredictions` adds `calculateAltitudeDelay(input.altitudeMeters ?? 0)` (existing, unmodified utility function) to the base 60-day harvest window instead of using a fixed 60.

**Tech Stack:** TypeScript, Supabase, `node:test` (project's existing test runner — see `__tests__/health-predictions-monitoring/p5Semantics.test.ts` for the established pattern).

## Global Constraints

- No new npm dependencies.
- Reuse `utils/altitudeUtils.ts::calculateAltitudeDelay` exactly as it exists today — do not modify that function or invent a different day-per-100m rate.
- Do not add per-plant-type (early/standard/late) altitude modifiers to the harvest-window calculation — the prediction pipeline has no plant-earliness classification data today; the delay applies uniformly to `harvestDays`.
- Do not modify `services/plantingWindowOptimizer.ts` or the `/api/garden/sun-exposure/planting-windows` endpoint — that's a separate, out-of-scope gap noted during design.
- Do not modify `hashPredictionInput`/`canonicalize` — the new field is automatically included in the existing generic hash.
- Verification for every code task: `npx tsc --noEmit` clean. Final task additionally requires `npm run build` green and `npm run test:release` passing with no regression (424/424 across the 9 sub-suites as of the last verified run in this session — `test:release` is a 9-script aggregate; sum the pass counts across all 9 sub-scripts, don't just read the last one's tail output).

---

### Task 1: Add `altitudeMeters` to `CanonicalPredictionInput` and fetch it in `loadCanonicalPredictionInput`

**Files:**
- Modify: `services/agronomicPredictionPipelineService.ts`

**Interfaces:**
- Consumes: `gardens` table, column `altitude_meters` (INTEGER, nullable — `supabase/migrations/20251201000000_initial_schema.sql:36`).
- Produces: `CanonicalPredictionInput.altitudeMeters?: number` (new field), populated by `loadCanonicalPredictionInput`. Consumed by Task 2 (`buildYieldPredictions`).

- [ ] **Step 1: Add the field to `CanonicalPredictionInput`**

In `services/agronomicPredictionPipelineService.ts`, modify the `CanonicalPredictionInput` type (currently lines 16-28) to add the new field right after `gardenId: string`:

```typescript
export type CanonicalPredictionInput = {
  gardenId: string
  asOf: string
  altitudeMeters?: number
  weather?: WeatherData
  soil?: SoilData
  plants: PlantHealthData[]
  tasks: GardenTask[]
  provenance: {
    weatherRecordedAt?: string
    soilRecordedAt?: string
    plantRecordedAt?: string
    sensorBacked: boolean
  }
}
```

- [ ] **Step 2: Add the `gardens` query to `loadCanonicalPredictionInput`**

In `loadCanonicalPredictionInput` (currently starting at line 276), the function currently runs 5 parallel queries via `Promise.all` (currently lines 281-287). Add a 6th query for the garden's altitude, and destructure its result:

```typescript
  const [tasksResult, weatherResult, soilResult, plantsResult, sensorsResult, gardenResult] = await Promise.all([
    supabase.from('garden_tasks').select('*').eq('garden_id', gardenId).order('date', { ascending: false }).limit(500),
    supabase.from('daily_weather_log').select('*').eq('garden_id', gardenId).order('log_date', { ascending: false }).limit(15),
    supabase.from('soil_analysis').select('*').eq('garden_id', gardenId).order('analysis_date', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('garden_plants').select('*').eq('garden_id', gardenId).neq('status', 'harvested').neq('status', 'dead').limit(1000),
    supabase.from('sensor_readings').select('*').eq('garden_id', gardenId).gte('recorded_at', new Date(asOf.getTime() - 48 * 3_600_000).toISOString()).order('recorded_at', { ascending: false }).limit(200),
    supabase.from('gardens').select('altitude_meters').eq('id', gardenId).maybeSingle(),
  ])
```

- [ ] **Step 3: Map the fetched altitude into the returned object**

In the same function, find the `return { ... }` statement at the end (currently lines 346-360). Add `altitudeMeters` to the returned object, right after `gardenId`:

```typescript
  return {
    gardenId,
    asOf: asOf.toISOString(),
    altitudeMeters: finite((gardenResult.data as { altitude_meters?: number | string | null } | null)?.altitude_meters),
    weather,
    soil,
    plants,
    tasks,
    provenance: {
      weatherRecordedAt: latestWeather?.log_date ? `${latestWeather.log_date}T12:00:00.000Z` : undefined,
      soilRecordedAt: soilRow?.analysis_date ? `${soilRow.analysis_date}T12:00:00.000Z` : undefined,
      plantRecordedAt: plants.map(plant => plant.lastUpdate).sort().at(-1),
      sensorBacked: Boolean(humiditySensor && moistureSensor),
    },
  }
```

Note: `finite` is the existing helper function already defined earlier in this same file (currently lines 214-220) — it's already used elsewhere in this function (e.g. `finite(row.quantity)`, `finite(soilRow.ph_value)`), so no new import or helper is needed.

- [ ] **Step 4: Verify with tsc**

Run: `npx tsc --noEmit`
Expected: clean, no errors.

- [ ] **Step 5: Commit**

```bash
git add services/agronomicPredictionPipelineService.ts
git commit -m "feat: recupera altitudeMeters del giardino nella pipeline predittiva"
```

---

### Task 2: Use `altitudeMeters` to adjust `harvestDays` in `buildYieldPredictions`

**Files:**
- Modify: `services/agronomicPredictionPipelineService.ts`
- Test: `__tests__/health-predictions-monitoring/p5Semantics.test.ts`

**Interfaces:**
- Consumes: `CanonicalPredictionInput.altitudeMeters` (Task 1), `calculateAltitudeDelay(altitudeMeters: number): number` from `utils/altitudeUtils.ts` (existing, unmodified — returns `0` for `altitudeMeters <= 0`, otherwise `Math.round((altitudeMeters / 100) * 5)`).
- Produces: `buildYieldPredictions`'s `harvestWindow` now varies with `input.altitudeMeters` — no new exports, this is the terminal behavioral change.

- [ ] **Step 1: Write the failing test**

Add this test to `__tests__/health-predictions-monitoring/p5Semantics.test.ts`, after the existing `test('prediction outcomes calculate reproducible yield and disease calibration', ...)` block (find it, then add the new test right after its closing `})`):

```typescript
test('harvest window shifts later for gardens at higher altitude', () => {
  const seaLevelBundle = buildPredictionBundle({ ...input, altitudeMeters: 0 })
  const highAltitudeBundle = buildPredictionBundle({ ...input, altitudeMeters: 800 })

  const seaLevelYield = seaLevelBundle.yieldPredictions[0]
  const highAltitudeYield = highAltitudeBundle.yieldPredictions[0]

  const seaLevelOptimal = new Date(seaLevelYield.harvestWindow.optimal)
  const highAltitudeOptimal = new Date(highAltitudeYield.harvestWindow.optimal)
  const dayDifference = Math.round((highAltitudeOptimal.getTime() - seaLevelOptimal.getTime()) / 86_400_000)

  // calculateAltitudeDelay(800) = Math.round((800/100) * 5) = 40 giorni
  assert.equal(dayDifference, 40)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `NODE_OPTIONS=--conditions=react-server npx --yes tsx --test __tests__/health-predictions-monitoring/p5Semantics.test.ts`
Expected: FAIL on the new test — `dayDifference` will be `0` (both bundles currently use the same fixed `harvestDays = 60`, since `altitudeMeters` isn't read yet).

- [ ] **Step 3: Implement the minimal change**

In `services/agronomicPredictionPipelineService.ts`, add the import at the top of the file (alongside the existing imports, currently lines 1-12):

```typescript
import { calculateAltitudeDelay } from '@/utils/altitudeUtils'
```

Then in `buildYieldPredictions` (currently starting at line 108), find `const harvestDays = 60` (currently line 137) and replace it with:

```typescript
    const harvestDays = 60 + calculateAltitudeDelay(input.altitudeMeters ?? 0)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `NODE_OPTIONS=--conditions=react-server npx --yes tsx --test __tests__/health-predictions-monitoring/p5Semantics.test.ts`
Expected: PASS, including the new test and all pre-existing tests in this file.

- [ ] **Step 5: Run the full health-predictions-monitoring suite**

Run: `npm run test:health-predictions-monitoring`
Expected: all tests pass, no regressions in this suite.

- [ ] **Step 6: Verify with tsc**

Run: `npx tsc --noEmit`
Expected: clean, no errors.

- [ ] **Step 7: Commit**

```bash
git add services/agronomicPredictionPipelineService.ts __tests__/health-predictions-monitoring/p5Semantics.test.ts
git commit -m "feat: allunga la finestra di raccolto in base all'altitudine del giardino"
```

---

### Task 3: Full verification and master plan update

**Files:**
- Modify: `docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`

**Interfaces:**
- Consumes: all prior tasks' output.
- Produces: nothing further downstream — terminal verification task.

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: build completes successfully, no errors.

- [ ] **Step 3: Full release test suite**

Run: `npm run test:release`
Expected: all 9 sub-suites pass, sum of pass counts is 424 or higher (a lower total means a test was lost — investigate, don't proceed). `test:release` chains `test:security`, `test:capabilities`, `test:persistence`, `test:physical-operations`, `test:health-predictions-monitoring`, `test:remote-data-isolation`, `test:regulatory-exports-admin`, `test:rollout-observability`, `test:precision-hub` — read the `ℹ pass`/`ℹ fail` line after each sub-script, not just the last one's tail output.

- [ ] **Step 4: Append a completion note to the master plan doc**

In `docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`, find the section discussing the predictive engine gap (M14 — altitude/sun/obstacles never used, fixed 60-day harvest window, registered during the 31/07/2026 M05 closeout session — search for "altitudine" and "harvestDays" or "M14" to find it). Append a closing note there, in Italian matching the doc's existing style, stating: the altitude portion of this gap is closed. `services/agronomicPredictionPipelineService.ts::buildYieldPredictions` now extends `harvestDays` using `utils/altitudeUtils.ts::calculateAltitudeDelay` (the existing, already-validated "5 giorni ogni 100m" rule, previously used only for planting-date delay), fed by a new `CanonicalPredictionInput.altitudeMeters` field populated from the `gardens.altitude_meters` column (a real user-input field from `GardenOnboarding.tsx`, not a phantom field). Sun exposure and obstacles remain unused by the predictive engine — this was scoped to altitude only, per explicit user decision; those two gaps and the fixed disease-prediction rules remain open, unrelated to this change.

- [ ] **Step 5: Commit**

```bash
git add docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md
git commit -m "docs: chiudi la porzione altitudine del gap M14 nel piano master"
```
