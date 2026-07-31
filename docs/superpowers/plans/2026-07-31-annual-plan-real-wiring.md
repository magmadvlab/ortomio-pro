# Annual Plan Real Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake/mock planting logic inside `logic/annualPlannerEngine.ts` with real planting windows (already computed elsewhere in the app), and wire the resulting `AnnualPlan` into `HomeDashboard.tsx`'s existing call to `directorService.getLegacyDailyPlanBridge`, which today always passes `undefined` for this argument.

**Architecture:** `AnnualPlan` gains a `plantingWindows: PlantingWindow[]` field. `generateAnnualPlan` accepts real `PlantingWindow[]` (instead of internally fabricating mock windows) and uses each window's real `recommendedPlants` + real date range to build per-month plantings, replacing the current `.slice(0, 2)` repeated-every-month logic. `suggestSuccessions`'s signature stays unchanged — it reads `currentPlan.plantingWindows` internally instead of returning arbitrary catalog plants. A new client-side helper `fetchPlantingWindowsForGarden` in `services/plantingWindowOptimizer.ts` calls the existing `/api/garden/sun-exposure/planting-windows` endpoint (same one `SunExposureDetailModal.tsx` already calls) to get real windows for a garden. `HomeDashboard.tsx` fetches those windows, builds the `AnnualPlan` via `useMemo`, and passes it as the 4th argument where it's `undefined` today. `logic/director.ts` is not touched.

**Tech Stack:** Next.js, TypeScript, React (client components), no new dependencies.

## Global Constraints

- No new npm dependencies.
- `logic/director.ts` must not be modified — it already correctly consumes `AnnualPlan.quarters[Q].plantings` and calls `suggestSuccessions(harvestDate, bed, currentPlan)`; both keep working unchanged once real data flows in.
- `suggestSuccessions`'s public signature (`harvestDate: string, bed: string, currentPlan: AnnualPlan`) must not change — `director.ts:1342` calls it with exactly 3 arguments and must not need editing.
- If `plantingWindows` is unavailable (garden has no coordinates, or the fetch fails), `generateAnnualPlan` must fall back to its current soil-only-filtered behavior — no regression for gardens without solar/obstacle data.
- Do not populate `AnnualPlan.rotations`, `.projections`, or `QuarterPlan.harvests`/`.maintenance` with real data — verified they have no live consumer (only the already-dead `components/AnnualPlanner.tsx` reads them). Leave `calculateProjections` and `optimizeRotations` untouched.
- `components/professional/ProfessionalDashboard.tsx` (the other live caller of `getLegacyDailyPlanBridge`) is out of scope — do not modify it.
- Verification for every code task: `npx tsc --noEmit` clean. Final task additionally requires `npm run build` green and `npm run test:release` passing with no regression from the current baseline (229/229 as of the last verified run in this session).

---

### Task 1: Add `plantingWindows` field to `AnnualPlan` and thread it through `generateAnnualPlan`/`generateQuarterPlan`

**Files:**
- Modify: `logic/annualPlannerEngine.ts`

**Interfaces:**
- Consumes: `PlantingWindow` type from `services/plantingWindowOptimizer.ts` (existing, unchanged): `{ category: 'Estivo' | 'Primaverile' | 'Autunnale' | 'FogliaEstiva', startDate: Date, endDate: Date, method: 'Seed' | 'Seedling', recommendedPlants: string[], reason: string, cycles: number, adjustedStartDate?: Date, soilAdjustedDate?: Date, altitudeAdjustedDate?: Date, finalAdjustedDate?: Date }`.
- Produces: `AnnualPlan.plantingWindows: PlantingWindow[]` (new field), `generateAnnualPlan(garden: Garden, preferences?: { preferredPlants?: string[]; targetYield?: number }, plantingWindows?: PlantingWindow[]): AnnualPlan` (changed signature — 3rd param is now `plantingWindows`, replacing the old `solarClassification` param). Both consumed by Task 2 (`suggestSuccessions`) and Task 3 (`HomeDashboard.tsx`).

- [ ] **Step 1: Add the import and the new `AnnualPlan` field**

In `logic/annualPlannerEngine.ts`, add to the top-of-file imports (currently lines 6-14):

```typescript
import { PlantingWindow } from '../services/plantingWindowOptimizer';
```

Then modify the `AnnualPlan` interface (currently lines 46-61) to add the new field, right after `gardenId: string;`:

```typescript
export interface AnnualPlan {
  year: number;
  gardenId: string;
  plantingWindows: PlantingWindow[];
  quarters: {
```

- [ ] **Step 2: Change `generateAnnualPlan`'s signature and remove the mock-windows block**

Replace the current function (lines 66-135) with:

```typescript
export const generateAnnualPlan = (
  garden: Garden,
  preferences?: {
    preferredPlants?: string[];
    targetYield?: number;
  },
  plantingWindows: PlantingWindow[] = []
): AnnualPlan => {
  const currentYear = new Date().getFullYear();

  const masterSheets = getAllMasterSheets();
  let availablePlants = preferences?.preferredPlants ||
    masterSheets.map(p => p.commonName);

  // Filtra per compatibilità terreno
  availablePlants = availablePlants.filter(plantName => {
    const soilCompatibility = getSoilCompatibility(plantName, garden.soilType);
    return soilCompatibility.compatible;
  });

  // Determina stagioni per quarters
  const latitude = garden.coordinates?.latitude || 0;
  const q1Season = getSeasonForDate(new Date(currentYear, 0, 15), latitude); // Gennaio
  const q2Season = getSeasonForDate(new Date(currentYear, 3, 15), latitude); // Aprile
  const q3Season = getSeasonForDate(new Date(currentYear, 6, 15), latitude); // Luglio
  const q4Season = getSeasonForDate(new Date(currentYear, 9, 15), latitude); // Ottobre

  // Genera quarters
  const quarters = {
    Q1: generateQuarterPlan(1, 3, q1Season, availablePlants, plantingWindows),
    Q2: generateQuarterPlan(4, 6, q2Season, availablePlants, plantingWindows),
    Q3: generateQuarterPlan(7, 9, q3Season, availablePlants, plantingWindows),
    Q4: generateQuarterPlan(10, 12, q4Season, availablePlants, plantingWindows)
  };

  // Genera rotazioni per ogni aiuola
  const rotations: BedRotation[] = [];
  // TODO: Implementare logica aiuole se disponibile

  // Calcola proiezioni
  const projections = calculateProjections(quarters, garden);

  return {
    year: currentYear,
    gardenId: garden.id,
    plantingWindows,
    quarters,
    rotations,
    projections
  };
};
```

Note: `solarClassification`, `validatePlantCompatibility`, and the inline `mockWindows` array are removed entirely — remove their now-unused imports too. After this step, `import { validatePlantCompatibility } from './solarClassificationHelper';` (currently line 11) and `import { GardenClassification } from '../services/seasonalSunWindows';` (currently line 10) become unused — remove both import lines.

- [ ] **Step 2b: Verify no other unused imports remain**

Check the remaining imports at the top of the file (`Season, getSeasonForDate`, `BedRotation, optimizeBedRotation`, `getAllMasterSheets`, `getSoilCompatibility`, `adjustPlantingDates, calculateAltitudePlantingDelay`, `adjustDateForSoilType`) — these are used elsewhere in the file (`optimizeRotations`, `calculateProjections`, or were already unused before this task and are out of scope to clean up). Only remove `validatePlantCompatibility` and `GardenClassification` — nothing else.

- [ ] **Step 3: Rewrite `generateQuarterPlan` to use real planting windows**

Replace the current function (lines 140-180, the version that does `.slice(0, 2)` every month) with:

```typescript
const generateQuarterPlan = (
  startMonth: number,
  endMonth: number,
  season: Season,
  availablePlants: string[],
  plantingWindows: PlantingWindow[]
): QuarterPlan => {
  const plantings: PlannedPlanting[] = [];
  const harvests: PlannedHarvest[] = [];
  const maintenance: PlannedMaintenance[] = [];

  const relevantWindows = plantingWindows.filter(window => {
    const windowStartMonth = window.startDate.getMonth() + 1;
    const windowEndMonth = window.endDate.getMonth() + 1;
    return windowStartMonth <= endMonth && windowEndMonth >= startMonth;
  });

  if (relevantWindows.length > 0) {
    for (const window of relevantWindows) {
      const windowStartMonth = Math.max(startMonth, window.startDate.getMonth() + 1);
      const windowEndMonth = Math.min(endMonth, window.endDate.getMonth() + 1);

      const suitablePlants = window.recommendedPlants.filter(recommended =>
        availablePlants.some(available => available.toUpperCase() === recommended.toUpperCase())
      );

      if (suitablePlants.length === 0) continue;

      for (let month = windowStartMonth; month <= windowEndMonth; month++) {
        for (const plantName of suitablePlants) {
          plantings.push({
            plantName,
            month,
            method: window.method,
            quantity: 10
          });
        }
      }
    }
  } else {
    // Fallback: nessuna finestra reale disponibile (es. orto senza coordinate).
    // Comportamento precedente: distribuisce le prime 2 piante disponibili su ogni mese.
    const seasonalPlants = availablePlants.slice(0, 2);
    for (let month = startMonth; month <= endMonth; month++) {
      for (const plantName of seasonalPlants) {
        plantings.push({
          plantName,
          month,
          method: 'Seed',
          quantity: 10
        });
      }
    }
  }

  return {
    season,
    plantings,
    harvests,
    maintenance
  };
};
```

- [ ] **Step 4: Update `suggestSuccessions` to read `currentPlan.plantingWindows`**

Replace the current function (lines 244-272) with:

```typescript
export const suggestSuccessions = (
  harvestDate: string,
  bed: string,
  currentPlan: AnnualPlan
): PlannedPlanting[] => {
  const harvestMonth = new Date(harvestDate).getMonth() + 1;
  const suggestions: PlannedPlanting[] = [];

  const nextMonths = harvestMonth < 10 ? [harvestMonth + 1, harvestMonth + 2] : [];
  if (nextMonths.length === 0) return suggestions;

  const masterSheets = getAllMasterSheets();
  const availableCommonNames = masterSheets.map(p => p.commonName);

  for (const month of nextMonths) {
    const window = currentPlan.plantingWindows.find(w => {
      const windowStartMonth = w.startDate.getMonth() + 1;
      const windowEndMonth = w.endDate.getMonth() + 1;
      return month >= windowStartMonth && month <= windowEndMonth;
    });

    if (!window) continue;

    const suitablePlants = window.recommendedPlants.filter(recommended =>
      availableCommonNames.some(available => available.toUpperCase() === recommended.toUpperCase())
    );

    for (const plantName of suitablePlants.slice(0, 2)) {
      suggestions.push({
        plantName,
        month,
        method: window.method,
        quantity: 10,
        bed
      });
    }
  }

  return suggestions;
};
```

- [ ] **Step 5: Verify with tsc**

Run: `npx tsc --noEmit`
Expected: clean. If there are errors about unused imports (`GardenClassification`, `validatePlantCompatibility`), confirm they were removed per Step 2b.

- [ ] **Step 6: Commit**

```bash
git add logic/annualPlannerEngine.ts
git commit -m "feat: usa finestre di impianto reali invece di dati finti in annualPlannerEngine"
```

---

### Task 2: Add `fetchPlantingWindowsForGarden` client helper

**Files:**
- Modify: `services/plantingWindowOptimizer.ts`

**Interfaces:**
- Consumes: existing `POST /api/garden/sun-exposure/planting-windows` endpoint (unchanged — `app/api/garden/sun-exposure/planting-windows/route.ts`), which accepts `{ gardenId: string, year?: number }` and returns `{ plantingWindows: Array<PlantingWindow with startDate/endDate/adjustedStartDate as ISO strings instead of Date>, classification: GardenClassification }` on success, or a non-200 status on error.
- Produces: `fetchPlantingWindowsForGarden(gardenId: string, year?: number): Promise<PlantingWindow[] | null>`, consumed by Task 3 (`HomeDashboard.tsx`).

- [ ] **Step 1: Add the helper function**

At the end of `services/plantingWindowOptimizer.ts` (after the existing `adjustForPlantingMethod` function, which ends the file), add:

```typescript
/**
 * Recupera le finestre di impianto reali per un giardino dall'endpoint API
 * (stesso endpoint gia' usato da components/sunExposure/SunExposureDetailModal.tsx).
 * Ritorna null se il giardino non ha coordinate, la richiesta fallisce, o la risposta
 * non e' ok — mai un errore lanciato, per permettere ai chiamanti un fallback silenzioso.
 */
export async function fetchPlantingWindowsForGarden(
  gardenId: string,
  year?: number
): Promise<PlantingWindow[] | null> {
  try {
    const response = await fetch('/api/garden/sun-exposure/planting-windows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gardenId, year }),
    })

    if (!response.ok) return null

    const data = await response.json()
    const windows: PlantingWindow[] = (data.plantingWindows || []).map((w: any) => ({
      ...w,
      startDate: new Date(w.startDate),
      endDate: new Date(w.endDate),
      adjustedStartDate: w.adjustedStartDate ? new Date(w.adjustedStartDate) : undefined,
    }))

    return windows
  } catch (error) {
    console.error('Error fetching planting windows:', error)
    return null
  }
}
```

- [ ] **Step 2: Verify with tsc**

Run: `npx tsc --noEmit`
Expected: clean, no new errors.

- [ ] **Step 3: Commit**

```bash
git add services/plantingWindowOptimizer.ts
git commit -m "feat: aggiungi helper client fetchPlantingWindowsForGarden"
```

---

### Task 3: Wire `annualPlan` into `HomeDashboard.tsx`

**Files:**
- Modify: `components/shared/HomeDashboard.tsx`

**Interfaces:**
- Consumes: `fetchPlantingWindowsForGarden(gardenId, year?)` (Task 2), `generateAnnualPlan(garden, preferences?, plantingWindows?)` (Task 1), `AnnualPlan` type (Task 1), existing `directorService.getLegacyDailyPlanBridge(garden, tasks, currentDate, annualPlan?, userProfile?, seedlingBatches?, storageProvider?, seedInventory?)` (unchanged signature, from `services/directorService.ts`).

- [ ] **Step 1: Add the imports**

In `components/shared/HomeDashboard.tsx`, add near the top import block (after the existing imports, e.g. near line 38 where `ReadingForm` is imported):

```typescript
import { generateAnnualPlan, AnnualPlan } from '@/logic/annualPlannerEngine'
import { fetchPlantingWindowsForGarden } from '@/services/plantingWindowOptimizer'
import type { PlantingWindow } from '@/services/plantingWindowOptimizer'
```

- [ ] **Step 2: Add state for planting windows**

Find where other `useState` declarations for `activeGarden`-dependent data live in the component (near the top of the component body, before the `useEffect` at line 404 that loads the daily plan) and add:

```typescript
  const [plantingWindows, setPlantingWindows] = useState<PlantingWindow[] | null>(null)
```

- [ ] **Step 3: Add the fetch effect**

Right before the existing `useEffect` that loads the daily plan (currently starting at line 404, `useEffect(() => { if (!activeGarden) return ...`), add a new effect:

```typescript
  useEffect(() => {
    if (!activeGarden?.coordinates) {
      setPlantingWindows(null)
      return
    }

    let cancelled = false
    fetchPlantingWindowsForGarden(activeGarden.id).then(windows => {
      if (!cancelled) setPlantingWindows(windows)
    })

    return () => {
      cancelled = true
    }
  }, [activeGarden?.id, activeGarden?.coordinates])
```

- [ ] **Step 4: Build the `annualPlan` with `useMemo`**

Immediately after the effect added in Step 3, add:

```typescript
  const annualPlan: AnnualPlan | undefined = React.useMemo(() => {
    if (!activeGarden) return undefined
    return generateAnnualPlan(activeGarden, undefined, plantingWindows || undefined)
  }, [activeGarden, plantingWindows])
```

- [ ] **Step 5: Pass `annualPlan` into the existing `getLegacyDailyPlanBridge` call**

In the existing `useEffect` (currently lines 404-436), find the call (currently lines 418-427):

```typescript
        const plan = await directorService.getLegacyDailyPlanBridge(
          activeGarden,
          currentTasks,
          new Date(),
          undefined,
          undefined,
          seedlingBatches || [],
          storageProvider,
          seedPackets || []
        )
```

Change the first `undefined` (the 4th argument, `annualPlan`) to `annualPlan`:

```typescript
        const plan = await directorService.getLegacyDailyPlanBridge(
          activeGarden,
          currentTasks,
          new Date(),
          annualPlan,
          undefined,
          seedlingBatches || [],
          storageProvider,
          seedPackets || []
        )
```

Also add `annualPlan` to this effect's dependency array (find the array at the end of the effect, after the `}, 500)` debounce and the effect's own closing `}, [...])` — it currently depends on things like `activeGarden`, `currentTasks`, etc.; add `annualPlan` to that list so the plan reloads when the annual plan becomes available after the initial fetch completes).

- [ ] **Step 6: Verify with tsc**

Run: `npx tsc --noEmit`
Expected: clean, no errors.

- [ ] **Step 7: Commit**

```bash
git add components/shared/HomeDashboard.tsx
git commit -m "feat: collega AnnualPlan reale alla chiamata getDailyGardenPlan in HomeDashboard"
```

---

### Task 4: Full verification and master plan update

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
Expected: all tests pass, no fewer than the current baseline (229/229 as of the last verified run this session; if the count differs, confirm no test was deleted rather than assuming it's fine).

- [ ] **Step 4: Manual smoke check (if a browser session is available)**

Navigate to the app's home dashboard for a garden that has coordinates set. Confirm no console errors appear related to `fetchPlantingWindowsForGarden` or `generateAnnualPlan`. If the garden has an overdue expected planting or a recent harvest for the current month, confirm any resulting alert message names a plausible, season-appropriate plant (not the same 1-2 species regardless of month).

- [ ] **Step 5: Append a completion note to the master plan doc**

In `docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`, find the section discussing `logic/annualPlannerEngine.ts` being imported by `director.ts` for a parameter never valorized (registered during the 31/07/2026 M05 closeout). Append a note stating: the gap is closed — `generateAnnualPlan` now builds plantings from real planting windows (`services/plantingWindowOptimizer.ts::findPlantingWindows`, the same engine already live for solar-exposure suggestions) instead of fabricated data; `HomeDashboard.tsx` now fetches those windows and passes a real `AnnualPlan` into `getDailyGardenPlan`'s previously-always-`undefined` 4th argument; `suggestSuccessions` now recommends season-appropriate plants instead of arbitrary catalog entries; `logic/director.ts` was not modified; `ProfessionalDashboard.tsx` (the other live caller) was intentionally left unchanged and could receive the same wiring in a future session; `AnnualPlan.rotations`/`.projections`/`QuarterPlan.harvests`/`.maintenance` remain unpopulated as they have no live consumer.

- [ ] **Step 6: Commit**

```bash
git add docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md
git commit -m "docs: chiudi gap annualPlannerEngine nel piano master"
```
