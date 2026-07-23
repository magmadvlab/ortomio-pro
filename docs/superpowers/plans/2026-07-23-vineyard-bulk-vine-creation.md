# Vineyard Bulk Vine Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring vineyard vine creation to parity with orchard tree creation — single-vine add wired to a real form, and bulk "create a whole row (or several)" creation, so someone onboarding an already-existing vineyard doesn't have to click "add" hundreds of times.

**Architecture:** The data layer already supports everything needed (`vineyardService.bulkCreateVines()`, `VineyardVine.fieldRowId`/`rowNumber`, generic `FieldRow` with `zoneId`). The gap is entirely in the UI layer: `components/vineyard/VineManager.tsx` accepts `onCreateVine`/`onEditVine` callback props but nothing renders them, and no bulk-creation modal exists for vines at all. This plan ports the proven pattern already shipping in `components/orchard/TreeManager.tsx` (`BatchAddTreeModal` + `handleBatchAddTrees`), adapted to vine terminology and `vineyardService`, and wires it into `VineManager.tsx` and `app/app/vineyard/page.tsx`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, existing `IStorageProvider` abstraction (`getFieldRows`/`createFieldRow`/`updateFieldRow`), `vineyardService` (Supabase-backed).

## Global Constraints

- Follow the existing code style in `components/vineyard/VineManager.tsx` and `components/orchard/TreeManager.tsx` (Tailwind utility classes, no new UI library).
- No new tests exist for these UI components in the current codebase (`components/orchard/TreeManager.tsx` has zero test coverage) — verify each task with `npm run type-check`, `npm run build`, and the existing `npm run test:release` suite (confirms nothing else broke), plus the manual click-through steps described in each task. Do not introduce a new testing pattern unilaterally.
- Never fabricate data: if `vineyardService.bulkCreateVines()` or `storageProvider.createFieldRow()` fails, surface the real error (`alert(...)`, matching existing pattern) — do not silently swallow it or show a fake success state.
- Row/zone concepts must reuse the existing generic `FieldRow` type (`types/fieldRow.ts`) — do not invent a vineyard-specific row type. `FieldRow.zoneId` already exists, satisfying "filari e zone" without new schema work.

---

### Task 1: Extract shared field-row constants for reuse (DRY prep)

**Files:**
- Modify: `types/fieldRow.ts` (add exports)
- Modify: `components/orchard/TreeManager.tsx:44-54` (replace local definitions with imports)

**Interfaces:**
- Produces: `FieldRowAxis` type and `FIELD_ROW_ORDERING_OPTIONS` const, both exported from `types/fieldRow.ts`, consumed by Task 3.

`components/orchard/TreeManager.tsx` currently defines `FieldRowAxis` and `FIELD_ROW_ORDERING_OPTIONS` as local, unexported symbols (lines 44-54). The new vine batch-creation modal needs the exact same row-orientation/ordering options. Rather than duplicate 15 lines in a second file, move them to the shared type file both components already import from.

- [ ] **Step 1: Add the two exports to `types/fieldRow.ts`**

Open `types/fieldRow.ts` and add near the top (after the `FieldRowOrdering` type definition, wherever that already lives in the file):

```typescript
export type FieldRowAxis = '' | 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'

export const FIELD_ROW_ORDERING_OPTIONS: Array<{
  value: FieldRowOrdering
  label: string
}> = [
  { value: 'west_to_east', label: 'Ovest -> Est' },
  { value: 'east_to_west', label: 'Est -> Ovest' },
  { value: 'north_to_south', label: 'Nord -> Sud' },
  { value: 'south_to_north', label: 'Sud -> Nord' },
]
```

- [ ] **Step 2: Update `components/orchard/TreeManager.tsx` to import instead of define**

Replace:

```typescript
type FieldRowAxis = '' | 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'

const FIELD_ROW_ORDERING_OPTIONS: Array<{
  value: FieldRowOrdering
  label: string
}> = [
  { value: 'west_to_east', label: 'Ovest -> Est' },
  { value: 'east_to_west', label: 'Est -> Ovest' },
  { value: 'north_to_south', label: 'Nord -> Sud' },
  { value: 'south_to_north', label: 'Sud -> Nord' },
]
```

with nothing (delete these lines), and change the existing import line:

```typescript
import type { FieldRow, FieldRowOrdering } from '@/types/fieldRow'
```

to:

```typescript
import type { FieldRow, FieldRowOrdering, FieldRowAxis } from '@/types/fieldRow'
import { FIELD_ROW_ORDERING_OPTIONS } from '@/types/fieldRow'
```

- [ ] **Step 3: Verify**

Run: `npm run type-check`
Expected: clean, no errors (TreeManager.tsx's usages of `FieldRowAxis`/`FIELD_ROW_ORDERING_OPTIONS` now resolve via import instead of local definition — behavior identical).

- [ ] **Step 4: Commit**

```bash
git add types/fieldRow.ts components/orchard/TreeManager.tsx
git commit -m "refactor: share FieldRowAxis/FIELD_ROW_ORDERING_OPTIONS from types/fieldRow.ts"
```

---

### Task 2: Wire single-vine creation end to end

**Files:**
- Modify: `components/vineyard/VineManager.tsx` (add `gardenId` prop, add `AddVineModal`, wire `onCreateVine`)
- Modify: `app/app/vineyard/page.tsx:299` (pass `gardenId` prop)

**Interfaces:**
- Consumes: `vineyardService.createVine(vine: Omit<VineyardVine, 'id'|'createdAt'|'updatedAt'>): Promise<VineyardVine>` (already exists, `services/vineyardService.ts:169`).
- Produces: `VineManager` now accepts `gardenId: string` (new required prop), used again by Task 3.

Currently `VineManager` receives `onCreateVine?: () => void` and conditionally renders a "Nuova Vite" button only if that prop is passed — but `app/app/vineyard/page.tsx:299` renders `<VineManager vineyardId={selectedVineyard.id} />` with no such prop, so the button never appears at all. This task makes single-vine creation actually work, as the minimal useful increment before Task 3's bulk flow.

- [ ] **Step 1: Add `gardenId` to `VineManagerProps` and wire local state for the add modal**

In `components/vineyard/VineManager.tsx`, find:

```typescript
interface VineManagerProps {
  vineyardId: string
  onCreateVine?: () => void
  onEditVine?: (vine: VineyardVine) => void
}

export default function VineManager({ vineyardId, onCreateVine, onEditVine }: VineManagerProps) {
```

Replace with:

```typescript
interface VineManagerProps {
  vineyardId: string
  gardenId: string
}

export default function VineManager({ vineyardId, gardenId }: VineManagerProps) {
```

(The `onCreateVine`/`onEditVine` callback-prop pattern is being replaced by state owned inside `VineManager` itself, matching how `TreeManager` owns its own `showAddModal`/`showBatchModal` state rather than delegating to the parent page — this avoids yet another unwired-callback bug like the one just found.)

Then, near the other `useState` declarations in the component body, add:

```typescript
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
```

- [ ] **Step 2: Replace every `onCreateVine?.()` / `onCreateVine &&` usage with the new local state**

Search the file for `onCreateVine` (two call sites: the toolbar "Nuova Vite" button and the empty-state button, both identified earlier at lines ~491 and ~682). For each:

```typescript
{onCreateVine && (
  <button onClick={onCreateVine} ...>
    ...Nuova Vite...
  </button>
)}
```

becomes:

```typescript
<button onClick={() => setShowAddModal(true)} ...>
  ...Nuova Vite...
</button>
```

(unconditional now — the button always renders, since creation is always possible).

Also search for any `onEditVine` usage and replace `onEditVine?.(vine)` calls with local state the same way (add `const [editingVine, setEditingVine] = useState<VineyardVine | null>(null)` and set it instead of calling the removed prop).

- [ ] **Step 3: Add the `AddVineModal` component at the bottom of the file, and a `handleCreateVine` handler inside `VineManager`**

Add this handler inside the `VineManager` function body (near `loadVines`/other handlers):

```typescript
  const handleCreateVine = async (data: {
    vineNumber: string
    variety: string
    rootstock: string
    plantingDate: string
    rowNumber?: number
    positionInRow?: number
  }) => {
    try {
      const created = await vineyardService.createVine({
        vineyardId,
        gardenId,
        vineNumber: data.vineNumber,
        variety: data.variety,
        rootstock: data.rootstock || undefined,
        plantingDate: data.plantingDate || undefined,
        rowNumber: data.rowNumber,
        positionInRow: data.positionInRow,
        healthStatus: 'healthy',
        vigorLevel: 'normal',
        productivityStatus: 'young',
        isActive: true,
        needsPruning: false,
        needsTreatment: false,
        needsReplacement: false,
        cumulativeYieldKg: 0,
      })
      setVines(prev => [...prev, created])
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating vine:', error)
      alert(`Errore nella creazione della vite: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
```

Add the import at the top of the file:

```typescript
import { vineyardService } from '@/services/vineyardService'
```

Render the modal near the other modals at the bottom of `VineManager`'s JSX return:

```typescript
      {showAddModal && (
        <AddVineModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreateVine}
        />
      )}
```

Then add the `AddVineModal` component itself after `VineManager`'s closing brace (mirroring `TreeManager.tsx`'s single-add modal style — check `components/orchard/TreeManager.tsx` for its equivalent single-tree-add modal component to match field layout and styling conventions exactly):

```typescript
interface AddVineModalProps {
  onClose: () => void
  onCreate: (data: {
    vineNumber: string
    variety: string
    rootstock: string
    plantingDate: string
    rowNumber?: number
    positionInRow?: number
  }) => Promise<void>
}

function AddVineModal({ onClose, onCreate }: AddVineModalProps) {
  const [vineNumber, setVineNumber] = useState('')
  const [variety, setVariety] = useState('')
  const [rootstock, setRootstock] = useState('')
  const [plantingDate, setPlantingDate] = useState('')
  const [rowNumber, setRowNumber] = useState('')
  const [positionInRow, setPositionInRow] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vineNumber.trim() || !variety.trim()) {
      alert('Inserisci numero vite e varietà')
      return
    }
    setLoading(true)
    try {
      await onCreate({
        vineNumber: vineNumber.trim(),
        variety: variety.trim(),
        rootstock: rootstock.trim(),
        plantingDate,
        rowNumber: rowNumber ? parseInt(rowNumber, 10) : undefined,
        positionInRow: positionInRow ? parseInt(positionInRow, 10) : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppModal isOpen onClose={onClose} fullScreenOnMobile panelClassName="bg-white shadow-2xl w-full max-w-lg sm:rounded-2xl">
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-green-600 text-white px-6 py-4 flex items-center justify-between sm:rounded-t-2xl">
        <h2 className="text-xl font-bold">Nuova Vite</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numero Vite *</label>
          <input type="text" required value={vineNumber} onChange={(e) => setVineNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="es. A1-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Varietà *</label>
          <input type="text" required value={variety} onChange={(e) => setVariety(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="es. Sangiovese" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fila</label>
            <input type="number" value={rowNumber} onChange={(e) => setRowNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posizione in fila</label>
            <input type="number" value={positionInRow} onChange={(e) => setPositionInRow(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" min="1" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portinnesto</label>
          <input type="text" value={rootstock} onChange={(e) => setRootstock(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="es. 1103 Paulsen" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Impianto</label>
          <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Annulla
          </button>
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creazione...' : 'Crea Vite'}
          </button>
        </div>
      </form>
    </AppModal>
  )
}
```

- [ ] **Step 4: Update `app/app/vineyard/page.tsx` to pass `gardenId`**

Find:

```typescript
            <VineManager vineyardId={selectedVineyard.id} />
```

Replace with:

```typescript
            <VineManager vineyardId={selectedVineyard.id} gardenId={selectedGardenId} />
```

- [ ] **Step 5: Verify**

Run: `npm run type-check`
Expected: clean.

Run: `npm run build`
Expected: clean, no new errors.

Manual click-through (requires a real `SUPABASE_SERVICE_ROLE_KEY` locally, or test against a preview deploy): open a vineyard's "Viti" tab, click "Nuova Vite", fill the form, submit, confirm the new vine appears in the list without a page reload.

- [ ] **Step 6: Commit**

```bash
git add components/vineyard/VineManager.tsx app/app/vineyard/page.tsx
git commit -m "feat: wire single-vine creation in VineManager (was completely unwired)"
```

---

### Task 3: Bulk row/vine creation ("Crea Fila" equivalent)

**Files:**
- Modify: `components/vineyard/VineManager.tsx` (add `BatchAddVineModal`, `handleBatchAddVines`, toolbar button)

**Interfaces:**
- Consumes: `vineyardService.bulkCreateVines()` (`services/vineyardService.ts:221`), `storageProvider.getFieldRows`/`createFieldRow`/`updateFieldRow` (`packages/core/storage/interface.ts:362-365`), `FieldRowAxis`/`FIELD_ROW_ORDERING_OPTIONS` from Task 1.
- Produces: nothing consumed elsewhere — this is the terminal task for the vine-creation feature.

This ports `BatchAddTreeModal` + `handleBatchAddTrees` from `components/orchard/TreeManager.tsx` (read that file's current versions in full before starting — Task 1 already changed its import line) almost field-for-field, replacing tree concepts with vine concepts:

| TreeManager (orchard) | VineManager (vineyard) |
|---|---|
| `OrchardTree` | `VineyardVine` |
| `orchardService.bulkCreateTrees` | `vineyardService.bulkCreateVines` |
| `orchardId` | `vineyardId` |
| `treeNumber` | `vineNumber` |
| `orchardConfig?.treeSpacingM` / `rowSpacingM` | `vineyardConfig?.vineSpacingM` / `rowSpacingM` — **note**: `VineManager` does not currently receive a `VineyardConfiguration` prop the way `TreeManager` receives `orchardConfig`. Skip the config-driven spacing defaults for this task (leave `plantSpacingCm`/`distanceFromPreviousRowCm` starting empty, user fills them in) rather than threading a new prop through — YAGNI unless a later task actually needs it. |

- [ ] **Step 1: Add `showBatchModal` toggle to the toolbar**

Near the "Nuova Vite" button added in Task 2, add a second button:

```typescript
<button onClick={() => setShowBatchModal(true)}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  <Upload size={18} />
  Crea Fila
</button>
```

Add `Upload` to the existing `lucide-react` import list at the top of the file if not already present.

Also update the empty-state button (the one shown when `vines.length === 0`, analogous to `TreeManager`'s "Aggiungi Primo Albero" / this file's own empty state) to offer both options, matching the two-button layout already visible on the orchard/olive pages in the screenshots reviewed this session.

- [ ] **Step 2: Implement `handleBatchAddVines` inside `VineManager`**

Add this handler in the `VineManager` function body, alongside `handleCreateVine`:

```typescript
  const handleBatchAddVines = async (batchData: {
    startRowNumber: number
    rowsCount: number
    vinesPerRow: number
    variety: string
    rootstock: string
    plantingDate: string
    prefix: string
    plantSpacingCm?: number
    distanceFromPreviousRowCm?: number
    orientation?: FieldRowAxis
    rowOrdering?: FieldRowOrdering
    plantOrderingInRow?: FieldRowOrdering
  }) => {
    try {
      if (!storageProvider?.getFieldRows || !storageProvider?.createFieldRow) {
        throw new Error('Storage provider non supporta la gestione dei filari reali')
      }

      const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100
      const calculateRowLengthMeters = (vineCount: number, plantSpacingCm: number) =>
        roundToTwoDecimals((vineCount * plantSpacingCm) / 100)

      const vinesToCreate: Omit<VineyardVine, 'id' | 'createdAt' | 'updatedAt'>[] = []
      const nextPositionByRow = new Map<number, number>()
      const rowIdByRowNumber = new Map<number, string>()
      const existingFieldRows = await storageProvider.getFieldRows(gardenId)
      const fieldRowByNumber = new Map<number, FieldRow>()

      vines.forEach((vine) => {
        if (!vine.rowNumber) return
        const rowNumber = vine.rowNumber
        const nextPosition = (vine.positionInRow || 0) + 1
        const currentMax = nextPositionByRow.get(rowNumber) || 1
        nextPositionByRow.set(rowNumber, Math.max(currentMax, nextPosition))
      })

      existingFieldRows.forEach((row) => {
        if (!fieldRowByNumber.has(row.rowNumber)) {
          fieldRowByNumber.set(row.rowNumber, row)
        }
      })

      for (let rowOffset = 0; rowOffset < batchData.rowsCount; rowOffset++) {
        const currentRow = batchData.startRowNumber + rowOffset
        const rowStartPosition = nextPositionByRow.get(currentRow) || 1
        const totalVinesAfterBatch = rowStartPosition + batchData.vinesPerRow - 1
        let linkedFieldRow = fieldRowByNumber.get(currentRow)

        if (!linkedFieldRow) {
          if (!batchData.plantSpacingCm || batchData.plantSpacingCm <= 0) {
            throw new Error(`Manca la distanza piante per creare il filare ${currentRow}`)
          }

          linkedFieldRow = await storageProvider.createFieldRow({
            gardenId,
            name: `Fila ${currentRow}`,
            rowNumber: currentRow,
            lengthMeters: calculateRowLengthMeters(totalVinesAfterBatch, batchData.plantSpacingCm),
            distanceFromPreviousRow: batchData.distanceFromPreviousRowCm,
            plantSpacing: batchData.plantSpacingCm,
            cultivar: batchData.variety,
            plantCount: totalVinesAfterBatch,
            orientation: batchData.orientation || undefined,
            rowOrdering: batchData.rowOrdering,
            plantOrderingInRow: batchData.plantOrderingInRow,
            plantedDate: batchData.plantingDate || undefined,
            isActive: true,
            notes: 'Creato automaticamente dal batch viti del vigneto'
          })

          fieldRowByNumber.set(currentRow, linkedFieldRow)
        } else if (storageProvider.updateFieldRow) {
          const spacingForLength = linkedFieldRow.plantSpacing || batchData.plantSpacingCm
          const updates: Partial<FieldRow> = {}

          if (spacingForLength && (!linkedFieldRow.lengthMeters || calculateRowLengthMeters(totalVinesAfterBatch, spacingForLength) > linkedFieldRow.lengthMeters)) {
            updates.lengthMeters = calculateRowLengthMeters(totalVinesAfterBatch, spacingForLength)
          }
          if (!linkedFieldRow.plantSpacing && batchData.plantSpacingCm) {
            updates.plantSpacing = batchData.plantSpacingCm
          }
          if (!linkedFieldRow.distanceFromPreviousRow && batchData.distanceFromPreviousRowCm) {
            updates.distanceFromPreviousRow = batchData.distanceFromPreviousRowCm
          }
          if (!linkedFieldRow.orientation && batchData.orientation) {
            updates.orientation = batchData.orientation
          }
          if (!linkedFieldRow.rowOrdering && batchData.rowOrdering) {
            updates.rowOrdering = batchData.rowOrdering
          }
          if (!linkedFieldRow.plantOrderingInRow && batchData.plantOrderingInRow) {
            updates.plantOrderingInRow = batchData.plantOrderingInRow
          }
          if (!linkedFieldRow.cultivar && batchData.variety) {
            updates.cultivar = batchData.variety
          }
          if (!linkedFieldRow.plantedDate && batchData.plantingDate) {
            updates.plantedDate = batchData.plantingDate
          }
          if (!linkedFieldRow.plantCount || linkedFieldRow.plantCount < totalVinesAfterBatch) {
            updates.plantCount = totalVinesAfterBatch
          }

          if (Object.keys(updates).length > 0) {
            linkedFieldRow = await storageProvider.updateFieldRow(linkedFieldRow.id, updates)
            fieldRowByNumber.set(currentRow, linkedFieldRow)
          }
        }

        if (linkedFieldRow?.id) {
          rowIdByRowNumber.set(currentRow, linkedFieldRow.id)
        }

        for (let i = 0; i < batchData.vinesPerRow; i++) {
          const pos = rowStartPosition + i
          vinesToCreate.push({
            vineyardId,
            gardenId,
            vineNumber: `${batchData.prefix}${currentRow}-${pos}`,
            variety: batchData.variety,
            rootstock: batchData.rootstock || undefined,
            plantingDate: batchData.plantingDate || undefined,
            fieldRowId: rowIdByRowNumber.get(currentRow),
            rowNumber: currentRow,
            positionInRow: pos,
            healthStatus: 'healthy',
            vigorLevel: 'normal',
            productivityStatus: 'young',
            isActive: true,
            needsPruning: false,
            needsTreatment: false,
            needsReplacement: false,
            cumulativeYieldKg: 0,
          })
        }

        nextPositionByRow.set(currentRow, rowStartPosition + batchData.vinesPerRow)
      }

      const created = await vineyardService.bulkCreateVines(vinesToCreate)
      setVines(prev => [...prev, ...created])
      setShowBatchModal(false)
    } catch (error) {
      console.error('Error batch creating vines:', error)
      alert(`Errore nella creazione batch: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
```

Add `FieldRow` to the file's type imports if not already present:

```typescript
import type { FieldRow, FieldRowOrdering, FieldRowAxis } from '@/types/fieldRow'
import { FIELD_ROW_ORDERING_OPTIONS } from '@/types/fieldRow'
```

- [ ] **Step 3: Add the `BatchAddVineModal` component**

Copy `BatchAddTreeModal` from `components/orchard/TreeManager.tsx` (the full component, from its `interface BatchAddTreeModalProps` through its closing `}`) into `components/vineyard/VineManager.tsx`, and make these renames throughout the copy:
- `BatchAddTreeModal` -> `BatchAddVineModal`
- `BatchAddTreeModalProps` -> `BatchAddVineModalProps`
- `existingTrees` -> `existingVines`, typed `VineyardVine[]` instead of `OrchardTree[]`
- `treesPerRow` -> `vinesPerRow`
- `totalTrees` -> `totalVines`
- `onBatchAdd` stays the same name, but its type signature's `treesPerRow` field becomes `vinesPerRow`
- Every user-facing string containing "alberi"/"albero"/"fila di alberi" -> "viti"/"vite"/"fila di viti" (e.g. "Crea Fila di Alberi" -> "Crea Fila di Viti", "Genera automaticamente una fila intera" stays as-is, "Numero Alberi" -> "Numero Viti", "Massimo 5.000 alberi per singola operazione batch" -> "Massimo 5.000 viti per singola operazione batch")
- Remove the `orchardConfig` prop and the `useEffect` that seeds `plantSpacingCm`/`distanceFromPreviousRowCm` from it (per the Task 3 header note — no vineyard config prop is threaded through in this plan)
- Remove the "Default irrigui frutteto" preview line (`orchardConfig?.irrigationDefaults` block) — no vineyard equivalent exists yet

Pass `existingVines={vines}` and `existingFieldRows={fieldRows}` (the field-rows state already loaded by `VineManager`'s existing `loadVines`/similar effect — confirm the exact state variable name when reading the file, it may need its own `fieldRows` state + loading call added if `VineManager` doesn't already track `FieldRow[]` the way `TreeManager` does; if absent, add `const [fieldRows, setFieldRows] = useState<FieldRow[]>([])` and populate it in the existing data-loading `useEffect` via `storageProvider.getFieldRows(gardenId)`, mirroring `TreeManager.tsx`'s `loadTrees`).

Render it next to the `AddVineModal` render from Task 2:

```typescript
      {showBatchModal && (
        <BatchAddVineModal
          existingVines={vines}
          existingFieldRows={fieldRows}
          onClose={() => setShowBatchModal(false)}
          onBatchAdd={handleBatchAddVines}
        />
      )}
```

- [ ] **Step 4: Verify**

Run: `npm run type-check`
Expected: clean. Pay particular attention to `VineyardVine` field names not matching `OrchardTree`'s exactly (e.g. `productivityStatus: 'young'` vs orchard's `'productive'` default — `VineProductivityStatus` includes `'young'` per `types/vineyard.ts:87-92`, which is more correct for freshly-planted vines than copying orchard's `'productive'` default verbatim).

Run: `npm run build`
Expected: clean.

Run: `npm run test:release`
Expected: 228 tests, 9 suites, 0 failures (confirms nothing elsewhere broke).

Manual click-through: open a vineyard's "Viti" tab, click "Crea Fila", fill in row number, consecutive rows count, vines per row, variety, plant spacing, submit. Confirm the preview panel shows the right total, confirm the vines and field rows actually appear after submit.

- [ ] **Step 5: Commit**

```bash
git add components/vineyard/VineManager.tsx
git commit -m "feat: add bulk row/vine creation to VineManager (parity with orchard TreeManager)"
```

---

## Self-Review Notes (from the planning pass)

**Spec coverage:**
- "filari zone" (rows and zones) — `FieldRow.zoneId` already exists in the type; this plan does not add a zone-picker UI to the batch modal since the ported `BatchAddTreeModal` doesn't have one either (orchard has the same gap). If the user wants zone assignment in the creation form specifically, that is a 4th task, not covered here — flag this explicitly rather than silently deferring it.
- "poter decidere quante piante ci sono" (decide vine count) — covered by Task 3's `vinesPerRow` × `rowsCount` fields.
- "chi deve aggiungere vigneti già esistenti" (onboarding an existing vineyard) — covered: after `VineyardWizard` creates the empty vineyard config, the user lands on `VineManager` and can now use "Crea Fila" repeatedly to populate it, matching how orchard onboarding already works today.
- "stessa cosa per vigneti, serve un sistema simile a orto e frutteto" — this plan brings vineyard to parity with **frutteto/orchard** specifically (the explicit comparison point), not "orto" (regular garden), which is a structurally different concept (no rows of individual woody plants).

**Explicitly out of scope for this plan** (flag to the user before starting, don't silently expand scope):
- `VineyardWizard.tsx`'s `vineData: []` gap (initial-creation wizard never generates vines) is left as-is — Task 3's "Crea Fila" in `VineManager` achieves the same end result without duplicating generation logic in two places. Confirm this tradeoff is acceptable before executing.
- No zone-picker added to the creation forms (see above).
- No CSV/bulk-import-from-file path (the ask was "decide quantity", not "import a file") — if that's actually wanted, that is a separate, larger spec.
