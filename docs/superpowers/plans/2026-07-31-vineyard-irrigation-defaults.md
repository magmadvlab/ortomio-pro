# Vineyard Irrigation Defaults Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Profilo standard nuovi impianti" (default irrigation profile) panel to the vineyard rows view, mirroring the existing orchard feature, and fix the underlying DB migration gap that currently makes the orchard version silently fall back to browser-local storage.

**Architecture:** Add a `irrigation_defaults JSONB` column to both `orchard_configurations` and `vineyard_configurations` tables via a single migration. Add the matching `irrigationDefaults?: OrchardIrrigationDefaults` field to `VineyardConfiguration` (reusing the existing orchard type — no duplication). Extend `vineyardService.ts`'s DB mapping functions. Port the existing orchard UI panel (form + two action buttons: save profile, bulk-apply to unconfigured rows) into `VineyardRowsView.tsx`, reusing the same visual style and interaction pattern already used for the per-row irrigation modal in that same file.

**Tech Stack:** Next.js, TypeScript, Supabase (Postgres), React (client components), no new dependencies.

## Global Constraints

- No new npm dependencies.
- Reuse `types/orchard.ts`'s `OrchardIrrigationDefaults` type directly for the vineyard field — do not duplicate the type.
- The migration must use `ADD COLUMN IF NOT EXISTS` (idempotent, matches the project's existing migration style).
- After applying the migration, verify column existence in production the same way used earlier in this session for the olive migration gate: attempt to reapply idempotently, then confirm via Supabase Table Editor/dashboard — do not trust the "Migrations" history view alone (it produced a false negative earlier in this session).
- Verification for every code task: `npx tsc --noEmit` clean, and for the final task also `npm run build` green and `npm run test:release` passing.

---

### Task 1: Database migration — add `irrigation_defaults` to both tables

**Files:**
- Create: `supabase/migrations/20260731000000_add_irrigation_defaults_orchard_vineyard.sql`

**Interfaces:**
- Produces: DB column `orchard_configurations.irrigation_defaults` (JSONB, nullable) and `vineyard_configurations.irrigation_defaults` (JSONB, nullable), consumed by Task 4 (vineyardService mapping) and already consumed as-is by the existing `orchardService.ts` code (no orchard service changes needed — its fallback path becomes dead-but-harmless once the column exists).

- [ ] **Step 1: Write the migration file**

```sql
-- ============================================================================
-- Add irrigation_defaults column to orchard_configurations and
-- vineyard_configurations. The orchard column was referenced by
-- services/orchardService.ts since the orchard advanced-features work but
-- was never actually created by a migration; the service has been silently
-- falling back to browser localStorage on every write. This migration adds
-- the real column for both crops so the "default irrigation profile" panel
-- persists correctly.
-- ============================================================================

ALTER TABLE orchard_configurations ADD COLUMN IF NOT EXISTS irrigation_defaults JSONB;
ALTER TABLE vineyard_configurations ADD COLUMN IF NOT EXISTS irrigation_defaults JSONB;
```

- [ ] **Step 2: Apply the migration to production and verify**

This step is manual (same procedure used earlier in this session for the olive migration gate `20260119020000`, since the local worktree cannot reach production Supabase directly):

1. Open the Supabase SQL Editor for project `qhmujoivfxftlrcrluaj` (ortomiopro, `main`/production).
2. Paste and run the SQL from Step 1.
3. Expected: both `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements succeed with no error (this is idempotent — safe even if a column already exists).
4. Confirm via Table Editor (or `SELECT column_name FROM information_schema.columns WHERE table_name IN ('orchard_configurations', 'vineyard_configurations') AND column_name = 'irrigation_defaults';` in SQL Editor) that both tables now have the column.

- [ ] **Step 3: Commit the migration file**

```bash
git add supabase/migrations/20260731000000_add_irrigation_defaults_orchard_vineyard.sql
git commit -m "feat: aggiungi colonna irrigation_defaults a orchard e vineyard configurations"
```

---

### Task 2: Add `irrigationDefaults` field to `VineyardConfiguration`

**Files:**
- Modify: `types/vineyard.ts:43-69` (the `VineyardConfiguration` interface)

**Interfaces:**
- Consumes: `OrchardIrrigationDefaults` type from `types/orchard.ts` (already defined: `{ lineType: 'Dripline' | 'PipeWithDrippers' | 'MicroSprinkler', pipeDiameterMm?: number, emitterSpacingCm?: number, emitterFlowRateLph?: number }`).
- Produces: `VineyardConfiguration.irrigationDefaults?: OrchardIrrigationDefaults`, consumed by Task 3 (service mapping) and Task 4 (UI component).

- [ ] **Step 1: Add the import and field**

In `types/vineyard.ts`, add an import at the top of the file (find the existing import block and add to it, or add a new import line if `types/orchard.ts` isn't already imported):

```typescript
import type { OrchardIrrigationDefaults } from '@/types/orchard'
```

Then add the field to `VineyardConfiguration`, right after `irrigationSystem?: string` (currently line 63):

```typescript
  irrigationSystem?: string
  irrigationDefaults?: OrchardIrrigationDefaults
```

- [ ] **Step 2: Verify with tsc**

Run: `npx tsc --noEmit`
Expected: no new errors related to `types/vineyard.ts`.

- [ ] **Step 3: Commit**

```bash
git add types/vineyard.ts
git commit -m "feat: aggiungi campo irrigationDefaults a VineyardConfiguration"
```

---

### Task 3: Map `irrigationDefaults` in `vineyardService.ts`

**Files:**
- Modify: `services/vineyardService.ts:465-490` (`mapVineyardConfigurationFromDatabase`)
- Modify: `services/vineyardService.ts` (`mapVineyardConfigurationToDatabase` — locate by searching for the function, it mirrors the "From" function's field list in snake_case)

**Interfaces:**
- Consumes: `VineyardConfiguration.irrigationDefaults` (Task 2), DB column `vineyard_configurations.irrigation_defaults` (Task 1).
- Produces: `vineyardService.getVineyardConfigurations()`/`updateVineyardConfiguration()` now round-trip `irrigationDefaults` correctly, consumed by Task 4.

- [ ] **Step 1: Update `mapVineyardConfigurationFromDatabase`**

In `services/vineyardService.ts`, inside `mapVineyardConfigurationFromDatabase` (starts at line 465), add the field to the returned object, right after `irrigationSystem: data.irrigation_system,` (currently line 483):

```typescript
      irrigationSystem: data.irrigation_system,
      irrigationDefaults: data.irrigation_defaults,
```

- [ ] **Step 2: Update `mapVineyardConfigurationToDatabase`**

Find `mapVineyardConfigurationToDatabase` in the same file (search for `private mapVineyardConfigurationToDatabase`). It has the same field list as the "From" function but in snake_case, going the other direction. Add, in the corresponding spot (next to the `irrigation_system` mapping):

```typescript
      irrigation_system: config.irrigationSystem,
      irrigation_defaults: config.irrigationDefaults,
```

- [ ] **Step 3: Verify with tsc**

Run: `npx tsc --noEmit`
Expected: clean, no new errors.

- [ ] **Step 4: Commit**

```bash
git add services/vineyardService.ts
git commit -m "feat: mappa irrigationDefaults nel service vigneto"
```

---

### Task 4: Add the "Profilo standard nuovi impianti" panel to `VineyardRowsView.tsx`

**Files:**
- Modify: `components/vineyard/VineyardRowsView.tsx`

**Interfaces:**
- Consumes: `vineyard.irrigationDefaults` (Task 2/3), `vineyardService.updateVineyardConfiguration(id, updates)` (existing method, signature `(id: string, updates: Partial<VineyardConfiguration>) => Promise<VineyardConfiguration>`), `storageProvider.updateFieldRow` (already used elsewhere in this file), `sortedRows` (already computed in this file, each entry has `{ key, row: FieldRow | null, rowNumber, vines: VineyardVine[], isRealFieldRow: boolean }`).
- Produces: new prop `onVineyardUpdate: (vineyard: VineyardConfiguration) => void` on `VineyardRowsViewProps`, consumed by Task 5 (the page wiring this component).

- [ ] **Step 1: Add the new prop to `VineyardRowsViewProps`**

In `components/vineyard/VineyardRowsView.tsx`, modify the props interface (currently lines 29-35):

```typescript
interface VineyardRowsViewProps {
  vineyard: VineyardConfiguration
  vineyardId: string
  gardenId: string
  onVineyardUpdate: (vineyard: VineyardConfiguration) => void
  onNavigateToVine: () => void
  onSelectVine: (vineId: string) => void
}
```

And update the component signature (currently line 47):

```typescript
export default function VineyardRowsView({ vineyard, vineyardId, gardenId, onVineyardUpdate, onNavigateToVine, onSelectVine }: VineyardRowsViewProps) {
```

- [ ] **Step 2: Add state for the defaults form, saving, and bulk-apply loading**

After the existing `irrigationForm` state (currently lines 66-71), add:

```typescript
  const [vineyardDefaultsForm, setVineyardDefaultsForm] = useState({
    lineType: vineyard.irrigationDefaults?.lineType || 'Dripline' as IrrigationLineType,
    pipeDiameterMm: String(vineyard.irrigationDefaults?.pipeDiameterMm || 16),
    emitterSpacingCm: String(vineyard.irrigationDefaults?.emitterSpacingCm || 30),
    emitterFlowRateLph: String(vineyard.irrigationDefaults?.emitterFlowRateLph || 2),
  })
  const [vineyardDefaultsSaving, setVineyardDefaultsSaving] = useState(false)
  const [applyDefaultsLoading, setApplyDefaultsLoading] = useState(false)
```

- [ ] **Step 3: Add the `realRowsWithoutIrrigation` filter and keep the defaults form in sync with prop changes**

Immediately after the existing `sortedRows` computation (currently ends at line 297, right before `const rowsNeedingAlignment = ...` at line 299), add:

```typescript
  const realRowsWithoutIrrigation = sortedRows.filter(({ row, isRealFieldRow }) =>
    Boolean(isRealFieldRow && row && !row.irrigationLine)
  )
```

Then, right after the existing `useEffect` that sets `rowsAnimated` (currently lines 308-319), add a new effect to keep the form synced when the `vineyard` prop changes (mirrors the orchard file's equivalent effect):

```typescript
  useEffect(() => {
    setVineyardDefaultsForm({
      lineType: vineyard.irrigationDefaults?.lineType || 'Dripline',
      pipeDiameterMm: String(vineyard.irrigationDefaults?.pipeDiameterMm || 16),
      emitterSpacingCm: String(vineyard.irrigationDefaults?.emitterSpacingCm || 30),
      emitterFlowRateLph: String(vineyard.irrigationDefaults?.emitterFlowRateLph || 2),
    })
  }, [vineyard.id, vineyard.irrigationDefaults])
```

- [ ] **Step 4: Add the two handler functions**

Right after `handleOpenIrrigationModal` (currently ends at line 331, before `handleSaveIrrigationConfig`), add:

```typescript
  const handleSaveVineyardDefaults = async () => {
    try {
      setVineyardDefaultsSaving(true)
      const updatedVineyard = await vineyardService.updateVineyardConfiguration(vineyard.id, {
        irrigationDefaults: {
          lineType: vineyardDefaultsForm.lineType,
          pipeDiameterMm: parseFloat(vineyardDefaultsForm.pipeDiameterMm) || undefined,
          emitterSpacingCm: parseFloat(vineyardDefaultsForm.emitterSpacingCm) || undefined,
          emitterFlowRateLph: parseFloat(vineyardDefaultsForm.emitterFlowRateLph) || undefined,
        }
      })
      onVineyardUpdate(updatedVineyard)
      setIrrigationMessage(`Default irrigui aggiornati per ${updatedVineyard.name}.`)
    } catch (error) {
      console.error('Error updating vineyard irrigation defaults:', error)
      alert('Errore durante il salvataggio dei default irrigui del vigneto')
    } finally {
      setVineyardDefaultsSaving(false)
    }
  }

  const handleApplyDefaultsToRows = async () => {
    if (!storageProvider?.updateFieldRow) {
      alert('Aggiornamento filari non disponibile')
      return
    }

    if (!vineyard.irrigationDefaults) {
      alert('Salva prima i default irrigui del vigneto')
      return
    }

    if (realRowsWithoutIrrigation.length === 0) {
      alert('Non ci sono filari reali senza irrigazione da aggiornare')
      return
    }

    try {
      setApplyDefaultsLoading(true)
      await Promise.all(
        realRowsWithoutIrrigation.map(({ row }) =>
          storageProvider.updateFieldRow(row!.id, {
            irrigationLine: vineyard.irrigationDefaults
          })
        )
      )
      await loadVines()
      setIrrigationMessage(`Default irrigui applicati a ${realRowsWithoutIrrigation.length} filari non configurati.`)
    } catch (error) {
      console.error('Error applying vineyard defaults to field rows:', error)
      alert('Errore durante l’applicazione dei default irrigui ai filari')
    } finally {
      setApplyDefaultsLoading(false)
    }
  }
```

- [ ] **Step 5: Add the UI panel**

In the JSX, right after the `{irrigationMessage && (...)}` block (currently lines 625-629) and before the `{rowsNeedingAlignment.length > 0 && (...)}` block (currently starting line 631), add:

```tsx
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-cyan-900">Profilo standard nuovi impianti</h3>
            <p className="text-sm text-cyan-800 mt-1">
              Viene usato solo per nuovi filari, riallineamento legacy e filari ancora senza impianto. Non modifica i filari gia configurati.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyDefaultsToRows}
              disabled={applyDefaultsLoading || !vineyard.irrigationDefaults || realRowsWithoutIrrigation.length === 0}
              className="shrink-0 px-4 py-2 bg-white text-cyan-700 border border-cyan-300 rounded-lg hover:bg-cyan-100 disabled:opacity-50 transition-colors"
            >
              {applyDefaultsLoading ? 'Assegnazione...' : `Assegna a ${realRowsWithoutIrrigation.length} senza impianto`}
            </button>
            <button
              type="button"
              onClick={handleSaveVineyardDefaults}
              disabled={vineyardDefaultsSaving}
              className="shrink-0 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {vineyardDefaultsSaving ? 'Salvataggio...' : 'Salva Profilo'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Tipo linea</label>
            <select
              value={vineyardDefaultsForm.lineType}
              onChange={(e) => setVineyardDefaultsForm((prev) => ({ ...prev, lineType: e.target.value as IrrigationLineType }))}
              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              <option value="Dripline">Goccia a goccia</option>
              <option value="PipeWithDrippers">Tubo con gocciolatori</option>
              <option value="MicroSprinkler">Micro-sprinkler</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Diametro linea (mm)</label>
            <select
              value={vineyardDefaultsForm.pipeDiameterMm}
              onChange={(e) => setVineyardDefaultsForm((prev) => ({ ...prev, pipeDiameterMm: e.target.value }))}
              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
            >
              <option value="12">12 mm</option>
              <option value="16">16 mm</option>
              <option value="20">20 mm</option>
              <option value="25">25 mm</option>
              <option value="32">32 mm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Passo erogatori (cm)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={vineyardDefaultsForm.emitterSpacingCm}
              onChange={(e) => setVineyardDefaultsForm((prev) => ({ ...prev, emitterSpacingCm: e.target.value }))}
              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Portata erogatore (L/h)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={vineyardDefaultsForm.emitterFlowRateLph}
              onChange={(e) => setVineyardDefaultsForm((prev) => ({ ...prev, emitterFlowRateLph: e.target.value }))}
              className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white"
            />
          </div>
        </div>

        <div className="text-xs text-cyan-900 bg-white/80 border border-cyan-200 rounded-lg px-3 py-2">
          Profilo standard: <strong>{getIrrigationTypeLabel(vineyardDefaultsForm.lineType)}</strong>
          {vineyardDefaultsForm.emitterSpacingCm ? ` • ${vineyardDefaultsForm.emitterSpacingCm} cm` : ''}
          {vineyardDefaultsForm.emitterFlowRateLph ? ` • ${vineyardDefaultsForm.emitterFlowRateLph} L/h` : ''}
          {vineyardDefaultsForm.pipeDiameterMm ? ` • ${vineyardDefaultsForm.pipeDiameterMm} mm` : ''}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-cyan-900">
          <div className="bg-white/80 border border-cyan-200 rounded-lg px-3 py-2">
            Filari reali senza impianto: <strong>{realRowsWithoutIrrigation.length}</strong>
          </div>
        </div>
      </div>
```

- [ ] **Step 6: Update the stale header comment**

Replace the file-header comment (currently lines 20-28), which today documents the feature as absent:

```typescript
// ============================================================================
// VINEYARD ROWS VIEW - Gestione Filari del Vigneto
// Adattamento di components/orchard/OrchardRowsView.tsx per VineyardVine/
// VineyardConfiguration.
// ============================================================================
```

- [ ] **Step 7: Verify with tsc**

Run: `npx tsc --noEmit`
Expected: clean. Pay attention to any error about `onVineyardUpdate` missing on the call site — that's expected until Task 5 is done; if Task 5 is done in the same pass, this should be fully clean.

- [ ] **Step 8: Commit**

```bash
git add components/vineyard/VineyardRowsView.tsx
git commit -m "feat: aggiungi pannello profilo standard irrigazione al vigneto"
```

---

### Task 5: Wire the new prop in `app/app/vineyard/page.tsx`

**Files:**
- Modify: `app/app/vineyard/page.tsx:302-310` (the `<VineyardRowsView>` render)

**Interfaces:**
- Consumes: `VineyardRowsViewProps.onVineyardUpdate` (Task 4), existing `setSelectedVineyard` state setter (already defined in this file at line 28, signature `(vineyard: VineyardConfiguration) => void` — matches exactly).

- [ ] **Step 1: Add the prop**

In `app/app/vineyard/page.tsx`, modify the `<VineyardRowsView>` call (currently lines 302-310):

```tsx
          <VineyardRowsView
            vineyard={selectedVineyard}
            vineyardId={selectedVineyard.id}
            gardenId={selectedGardenId}
            onVineyardUpdate={setSelectedVineyard}
            onNavigateToVine={() => setViewMode('vines')}
            onSelectVine={(vineId) => {
              setFocusedVineId(vineId)
              setViewMode('vines')
            }}
          />
```

- [ ] **Step 2: Verify with tsc**

Run: `npx tsc --noEmit`
Expected: clean, no errors.

- [ ] **Step 3: Commit**

```bash
git add app/app/vineyard/page.tsx
git commit -m "feat: collega onVineyardUpdate alla pagina vigneto"
```

---

### Task 6: Full verification and master plan update

**Files:**
- Modify: `docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md` (append a status note)

**Interfaces:**
- Consumes: all prior tasks' output.
- Produces: nothing further downstream — this is the terminal verification task.

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: build completes successfully, no errors.

- [ ] **Step 3: Full release test suite**

Run: `npm run test:release`
Expected: all tests pass (229/229 as of the last verified baseline in this session — a lower count is acceptable only if no test was deleted; a failure is not).

- [ ] **Step 4: Manual smoke check (if a browser session is available)**

Navigate to `/app/vineyard`, select a vineyard, switch to the "Filari" (rows) view. Confirm the new "Profilo standard nuovi impianti" panel renders, the form fields are editable, "Salva Profilo" succeeds without a console error, and (if there are real field rows without irrigation configured) "Assegna a N senza impianto" becomes enabled after saving a profile.

- [ ] **Step 5: Append a completion note to the master plan doc**

In `docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`, find the section discussing `VineyardConfiguration` lacking `irrigationDefaults` (added during the 31/07/2026 M05 closeout) and append a short note stating: the gap is closed, `irrigationDefaults` now exists on both `OrchardConfiguration`/`VineyardConfiguration`, the underlying missing DB column for both crops was found and fixed via migration `20260731000000_add_irrigation_defaults_orchard_vineyard.sql`, and the vineyard rows view now has the same bulk-assign panel as the orchard.

- [ ] **Step 6: Commit**

```bash
git add docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md
git commit -m "docs: chiudi gap irrigationDefaults vigneto nel piano master"
```
