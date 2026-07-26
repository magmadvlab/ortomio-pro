# Ripristino pianificazione ambientale — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ricollegare alla UI live (tab "Pianificazione" di `GardenView.tsx`) tre capacità mature ma orfane — esposizione solare, finestre di semina ottimali, suggerimenti di successione colturale — oggi raggiungibili solo tramite il componente morto `components/Dashboard.tsx`.

**Architecture:** Nessuna nuova route, nessun nuovo endpoint, nessuna nuova tabella. Un nuovo componente contenitore (`EnvironmentalPlanningSection`) monta tre widget esistenti riusati as-is (`SolarClassificationBadge`, `SunExposureWidget`, `PlantingWindowSuggestions`) più un nuovo componente (`SuccessionSuggestionsPanel`) estratto dal blocco JSX inline di `Dashboard.tsx` con due bug corretti.

**Tech Stack:** Next.js 16 (client components, `'use client'`), React 19, TypeScript, node:test + node:assert/strict per i test (nessuna libreria di test per componenti React presente nel repo — non introdotta in questo piano).

## Global Constraints

- Riuso diretto di `SolarClassificationBadge.tsx`, `SunExposureWidget.tsx`, `PlantingWindowSuggestions.tsx` — **zero modifiche al loro codice**.
- `logic/successionEngine.ts` usa import relativi (`../types`); i nuovi file in `components/sunExposure/` usano l'alias `@/` — seguire la convenzione della cartella di appartenenza, non mescolare stile.
- Nessuna preselezione pianta nel link verso `/app/planner` — verificato che la pagina non supporta oggi alcun query param per questo (solo `tab`), non va inventata.
- Nessun dato simulato in caso di errore/dati insufficienti — mostrare uno stato esplicito ("dati insufficienti"), mai un valore inventato (principio già applicato in tutta la dashboard, blocco M02 del piano master).
- Nessuna libreria di test per componenti React (`@testing-library/react` assente dal repo) — non introdurla in questo piano; i due nuovi componenti React vengono verificati con type-check + lint + revisione manuale del codice, dichiarato esplicitamente, non testati automaticamente.
- `test:release` (script in `package.json`) esegue 9 suite in `__tests__/<nome>/**/*.test.ts` via `tsx --test` (node:test runner) — i nuovi test di logica pura vanno in `__tests__/capabilities/`, che già ospita test di logica dashboard non strettamente legati a feature flag (vedi `dashboardTruthfulness.test.ts` esistente).

---

### Task 1: Aggiungere `removedPlantName` a `SuccessionSuggestion` e correggere il testo duplicato

**Files:**
- Modify: `logic/successionEngine.ts:5-11` (interfaccia `SuccessionSuggestion`), `logic/successionEngine.ts:88-141` (`checkEmptySpaceOpportunity`)
- Test: `__tests__/capabilities/successionSuggestions.test.ts` (nuovo)

**Interfaces:**
- Produce: `SuccessionSuggestion` con nuovo campo `removedPlantName: string`, valorizzato con `removedPlant.commonName` (il nome della pianta appena raccolta, distinto da `plant.commonName` che è il sostituto suggerito)

- [ ] **Step 1: Scrivere il test che fallisce**

Creare `__tests__/capabilities/successionSuggestions.test.ts`:

```typescript
import assert from 'node:assert/strict'
import test from 'node:test'
import type { Garden, GardenTask } from '../../types'
import { checkEmptySpaceOpportunity } from '../../logic/successionEngine'
import { getAllMasterSheets } from '../../services/plantMasterService'

function garden(overrides: Partial<Garden> = {}): Garden {
  return {
    id: 'garden-1',
    name: 'Orto Test',
    gardenType: 'OpenField',
    coordinates: { latitude: 41.9, longitude: 12.5 },
    ...overrides,
  } as Garden
}

function task(overrides: Partial<GardenTask> = {}): GardenTask {
  return {
    id: 'task-1',
    gardenId: 'garden-1',
    plantName: 'Pomodoro',
    taskType: 'Harvest',
    date: '2026-04-01T08:00:00+02:00',
    completed: false,
    lifecycleState: 'Production',
    ...overrides,
  } as GardenTask
}

test('checkEmptySpaceOpportunity reports the removed plant name distinct from the suggested one', () => {
  const allMasterSheets = getAllMasterSheets()
  const harvestTask = task()
  const suggestion = checkEmptySpaceOpportunity(harvestTask, allMasterSheets, garden(), new Date('2026-04-01T12:00:00+02:00'))

  assert.ok(suggestion, 'expected a succession suggestion for a Solanaceae harvest task')
  // Master sheet data stores commonName uppercase (verified empirically: 'POMODORO')
  assert.equal(suggestion!.removedPlantName, 'POMODORO')
  assert.equal(suggestion!.plant.commonName, 'ZUCCHINA')
  assert.notEqual(suggestion!.removedPlantName, suggestion!.plant.commonName)
})

test('checkEmptySpaceOpportunity returns null when the harvested plant is not in the master sheets', () => {
  const allMasterSheets = getAllMasterSheets()
  const harvestTask = task({ plantName: 'PiantaInesistenteXYZ' })
  const suggestion = checkEmptySpaceOpportunity(harvestTask, allMasterSheets, garden(), new Date('2026-04-01T12:00:00+02:00'))

  assert.equal(suggestion, null)
})
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

Run: `NODE_OPTIONS=--conditions=react-server npx --yes tsx --test __tests__/capabilities/successionSuggestions.test.ts`
Expected: FAIL — `suggestion!.removedPlantName` è `undefined`, non `'Pomodoro'` (la proprietà non esiste ancora sul tipo/oggetto restituito)

- [ ] **Step 3: Implementare il fix minimo**

In `logic/successionEngine.ts`, modificare l'interfaccia (righe 5-11):

```typescript
export interface SuccessionSuggestion {
  plant: PlantMasterSheet;
  removedPlantName: string;
  reason: string;
  startSowingDate: Date;
  transplantDate: Date;
  daysUntilSpaceFree: number;
}
```

Modificare il return di `checkEmptySpaceOpportunity` (righe 134-140):

```typescript
  return {
    plant: suggestion,
    removedPlantName: removedPlant.commonName,
    reason: `Hai liberato uno spazio! È il momento perfetto per mettere ${suggestion.commonName.toLowerCase()}. Essendo di una famiglia diversa (${suggestion.family}), sfrutterà nutrienti diversi e romperà il ciclo delle malattie.`,
    startSowingDate: startSowing,
    transplantDate: transplantDate,
    daysUntilSpaceFree: daysUntilSpaceFree,
  };
```

- [ ] **Step 4: Eseguire il test e verificare che passi**

Run: `NODE_OPTIONS=--conditions=react-server npx --yes tsx --test __tests__/capabilities/successionSuggestions.test.ts`
Expected: PASS su entrambi i test

- [ ] **Step 5: Type-check e lint mirato**

Run: `npx tsc --noEmit`
Expected: nessun nuovo errore (in particolare: nessun consumer esistente di `SuccessionSuggestion` si rompe — l'unico consumer oggi è `Dashboard.tsx`, che non legge `removedPlantName`, quindi l'aggiunta di un campo obbligatorio non rompe nulla lì)

Run: `npx eslint --no-ignore logic/successionEngine.ts`
Expected: nessun nuovo warning

- [ ] **Step 6: Commit**

```bash
git add logic/successionEngine.ts __tests__/capabilities/successionSuggestions.test.ts
git commit -m "feat: track removed plant name in succession suggestions

Fixes a real display bug: the succession suggestion text showed the
same plant name on both sides of the arrow (removed -> suggested)
because SuccessionSuggestion never carried the removed plant's name."
```

---

### Task 2: Estrarre `SuccessionSuggestionsPanel` da `Dashboard.tsx`

**Files:**
- Create: `components/sunExposure/SuccessionSuggestionsPanel.tsx`
- Reference (non modificare): `components/Dashboard.tsx:1467-1523` (blocco JSX sorgente da cui si estrae)

**Interfaces:**
- Consuma: `SuccessionSuggestion` da `logic/successionEngine.ts` (con `removedPlantName`, Task 1), `findAllSuccessionOpportunities` da `logic/successionEngine.ts`
- Produce: `SuccessionSuggestionsPanel({ garden: Garden, tasks: GardenTask[] })` — nessun export di tipi aggiuntivi

- [ ] **Step 1: Creare il componente**

Creare `components/sunExposure/SuccessionSuggestionsPanel.tsx`:

```tsx
'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Sparkles, CalendarCheck, CheckCircle, ArrowRight } from 'lucide-react'
import { Garden, GardenTask } from '@/types'
import { findAllSuccessionOpportunities } from '@/logic/successionEngine'

interface SuccessionSuggestionsPanelProps {
  garden: Garden
  tasks: GardenTask[]
}

export function SuccessionSuggestionsPanel({ garden, tasks }: SuccessionSuggestionsPanelProps) {
  const opportunities = useMemo(() => {
    const gardenTasks = tasks.filter(task => task.gardenId === garden.id)
    return findAllSuccessionOpportunities(gardenTasks, garden)
  }, [tasks, garden])

  if (opportunities.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
        <Sparkles size={20} className="text-purple-600" />
        Prossime Successioni
      </h3>
      <div className="space-y-3">
        {opportunities.map((suggestion, idx) => {
          const startSowingStr = suggestion.startSowingDate.toLocaleDateString('it-IT')
          const transplantStr = suggestion.transplantDate.toLocaleDateString('it-IT')

          return (
            <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-800 mb-1">
                    {suggestion.removedPlantName.toLowerCase()} → {suggestion.plant.commonName.toLowerCase()}
                  </h4>
                  <p className="text-sm text-gray-600">{suggestion.reason}</p>
                </div>
                <span className="text-xs font-bold uppercase bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {suggestion.daysUntilSpaceFree} giorni
                </span>
              </div>

              <div className="bg-white/60 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarCheck size={16} className="text-purple-600" />
                  <span className="font-medium text-gray-700">
                    Semina: <span className="font-bold text-purple-700">{startSowingStr}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm mt-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-medium text-gray-700">
                    Trapianto: <span className="font-bold text-green-700">{transplantStr}</span>
                  </span>
                </div>
              </div>

              <Link
                href="/app/planner"
                className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-3 text-sm"
              >
                <ArrowRight size={16} />
                Pianifica Successione
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

Nota sui due bug corretti rispetto all'originale in `Dashboard.tsx`:
1. `suggestion.removedPlantName.toLowerCase()} → {suggestion.plant.commonName.toLowerCase()}` — non più lo stesso nome due volte (dipende da Task 1)
2. Il bottone `<button onClick={() => console.log(...)}>` diventa un `<Link href="/app/planner">` reale — nessuna preselezione pianta (non supportata dal planner oggi), stesso pattern del link "Apri Planner AI" già presente in `GardenView.tsx:201-207`

- [ ] **Step 2: Type-check e lint**

Run: `npx tsc --noEmit`
Expected: nessun errore

Run: `npx eslint --no-ignore components/sunExposure/SuccessionSuggestionsPanel.tsx`
Expected: 0 warning

- [ ] **Step 3: Commit**

```bash
git add components/sunExposure/SuccessionSuggestionsPanel.tsx
git commit -m "feat: extract SuccessionSuggestionsPanel from dead Dashboard.tsx

Standalone reusable component, previously inline JSX only reachable
through the unmounted Dashboard.tsx. Wires the previously-dead
'Pianifica Successione' button to a real navigation link."
```

---

### Task 3: Creare `EnvironmentalPlanningSection`

**Files:**
- Create: `components/sunExposure/EnvironmentalPlanningSection.tsx`
- Reference: `logic/solarClassificationHelper.ts:30-36` (firma di `calculateGardenSolarClassification`), `components/settings/GardenEditModal.tsx` (destinazione della CTA coordinate mancanti, via `/app/settings`)

**Interfaces:**
- Consuma: `calculateGardenSolarClassification(garden: Garden, currentDate?: Date, historicalWeather?: any, seedlingBatches?: SeedlingBatch[]): Promise<SolarClassificationData | null>` da `@/logic/solarClassificationHelper`; `SolarClassificationData` da `@/types` (campi: `classification: GardenClassification`, `plantingWindows: PlantingWindow[]`, `optimizedSuggestions: PlantSuggestionForWindow[]`)
- Consuma: `SolarClassificationBadge` (prop `classification: GardenClassification`), `SunExposureWidget` (prop `garden: Garden`), `PlantingWindowSuggestions` (prop `plantingWindows`, `plantSuggestions`, `classification`, `gardenId?`), `SuccessionSuggestionsPanel` (Task 2, prop `garden`, `tasks`)
- Produce: `EnvironmentalPlanningSection({ garden: Garden, tasks: GardenTask[] })`

- [ ] **Step 1: Creare il componente**

Creare `components/sunExposure/EnvironmentalPlanningSection.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Loader2 } from 'lucide-react'
import { Garden, GardenTask, SolarClassificationData } from '@/types'
import { calculateGardenSolarClassification } from '@/logic/solarClassificationHelper'
import SolarClassificationBadge from './SolarClassificationBadge'
import { SunExposureWidget } from './SunExposureWidget'
import PlantingWindowSuggestions from './PlantingWindowSuggestions'
import { SuccessionSuggestionsPanel } from './SuccessionSuggestionsPanel'

interface EnvironmentalPlanningSectionProps {
  garden: Garden
  tasks: GardenTask[]
}

export function EnvironmentalPlanningSection({ garden, tasks }: EnvironmentalPlanningSectionProps) {
  const [classificationData, setClassificationData] = useState<SolarClassificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!garden.coordinates) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setFailed(false)

    calculateGardenSolarClassification(garden)
      .then(result => {
        if (cancelled) return
        setClassificationData(result)
        setFailed(result === null)
      })
      .catch(error => {
        if (cancelled) return
        console.error('Error calculating garden solar classification:', error)
        setFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [garden])

  if (!garden.coordinates) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
        <MapPin className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-amber-900">Posizione non configurata</h3>
          <p className="text-sm text-amber-800 mt-1">
            Aggiungi le coordinate del tuo orto per vedere esposizione solare, finestre di semina ottimali e suggerimenti di successione.
          </p>
          <Link
            href="/app/settings"
            className="inline-block mt-3 text-sm font-medium text-amber-900 underline hover:no-underline"
          >
            Vai a Impostazioni → Gestisci
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600 p-4">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Calcolo pianificazione ambientale...</span>
      </div>
    )
  }

  if (failed || !classificationData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600">
        Dati insufficienti per calcolare la pianificazione ambientale di questo orto.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SolarClassificationBadge classification={classificationData.classification} />
      <SunExposureWidget garden={garden} />
      <PlantingWindowSuggestions
        plantingWindows={classificationData.plantingWindows}
        plantSuggestions={classificationData.optimizedSuggestions}
        classification={classificationData.classification}
        gardenId={garden.id}
      />
      <SuccessionSuggestionsPanel garden={garden} tasks={tasks} />
    </div>
  )
}
```

Note di design rispettate dalla spec:
- Gate su `garden.coordinates` mancanti → CTA esplicita verso `/app/settings` (dove vive il pulsante "Gestisci" di `GardenEditModal.tsx`), non un buco silenzioso
- `calculateGardenSolarClassification` è `async` → serve `useEffect`+stato (a differenza di `SuccessionSuggestionsPanel` che è sincrono e usa `useMemo`)
- Cleanup con `cancelled` flag per evitare `setState` dopo unmount, pattern già usato altrove nel codebase (es. `services/aiProxyService` consumer pattern)
- `failed || !classificationData` → messaggio "dati insufficienti" esplicito, mai un fallback inventato

- [ ] **Step 2: Type-check e lint**

Run: `npx tsc --noEmit`
Expected: nessun errore — verificare in particolare che `SolarClassificationData` sia effettivamente esportato da `@/types` (confermato: `types.ts:158`) e che i nomi dei campi (`classification`, `plantingWindows`, `optimizedSuggestions`) corrispondano esattamente

Run: `npx eslint --no-ignore components/sunExposure/EnvironmentalPlanningSection.tsx`
Expected: 0 warning

- [ ] **Step 3: Commit**

```bash
git add components/sunExposure/EnvironmentalPlanningSection.tsx
git commit -m "feat: add EnvironmentalPlanningSection container

Orchestrates the reconnected sun exposure, planting window, and
succession widgets behind a single coordinates gate and loading/error
state. Not yet wired into any live page (next task)."
```

---

### Task 4: Montare `EnvironmentalPlanningSection` nel tab "Pianificazione"

**Files:**
- Modify: `components/garden/GardenView.tsx:189-222` (blocco `activeTab === 'planning'`), riga 17 (import)

**Interfaces:**
- Consuma: `EnvironmentalPlanningSection({ garden, tasks })` da Task 3

- [ ] **Step 1: Aggiungere l'import**

In `components/garden/GardenView.tsx`, dopo la riga `import Link from 'next/link'` (riga 17), aggiungere:

```typescript
import { EnvironmentalPlanningSection } from '@/components/sunExposure/EnvironmentalPlanningSection'
```

- [ ] **Step 2: Montare il componente nel tab planning**

Sostituire il blocco (righe 189-222):

```tsx
        {activeTab === 'planning' && (
          <div className="space-y-6">
            {/* AI Planning Integration */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="text-purple-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Pianificazione AI Professionale</h3>
                    <p className="text-sm text-gray-600">Ottimizza il calendario con intelligenza artificiale e dati reali</p>
                  </div>
                </div>
                <Link
                  href="/app/planner"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-3"
                >
                  <Bot size={16} />
                  Apri Planner AI
                </Link>
              </div>
            </div>

            <CalendarTabView
              garden={garden}
              tasks={tasks}
              onUpdateTask={onUpdateTask}
              onAddTask={onAddTask}
              onDateClick={() => {
                // Switch to operations view
                onTabChange('operations')
              }}
            />
          </div>
        )}
```

con:

```tsx
        {activeTab === 'planning' && (
          <div className="space-y-6">
            {/* AI Planning Integration */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="text-purple-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Pianificazione AI Professionale</h3>
                    <p className="text-sm text-gray-600">Ottimizza il calendario con intelligenza artificiale e dati reali</p>
                  </div>
                </div>
                <Link
                  href="/app/planner"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-3"
                >
                  <Bot size={16} />
                  Apri Planner AI
                </Link>
              </div>
            </div>

            <EnvironmentalPlanningSection garden={garden} tasks={tasks} />

            <CalendarTabView
              garden={garden}
              tasks={tasks}
              onUpdateTask={onUpdateTask}
              onAddTask={onAddTask}
              onDateClick={() => {
                // Switch to operations view
                onTabChange('operations')
              }}
            />
          </div>
        )}
```

- [ ] **Step 3: Type-check completo**

Run: `npx tsc --noEmit`
Expected: nessun errore in tutto il progetto

- [ ] **Step 4: Lint mirato**

Run: `npx eslint --no-ignore components/garden/GardenView.tsx`
Expected: nessun nuovo warning rispetto a prima della modifica

- [ ] **Step 5: Commit**

```bash
git add components/garden/GardenView.tsx
git commit -m "feat: mount EnvironmentalPlanningSection in the Pianificazione tab

Restores sun exposure, planting windows, and succession suggestions
to a live screen. These were reachable only through the now-dead
components/Dashboard.tsx before this change."
```

---

### Task 5: Verifica finale e aggiornamento documentazione

**Files:**
- Modify: `docs/superpowers/specs/2026-07-25-environmental-planning-restoration-design.md` (stato)

**Interfaces:** nessuna nuova

- [ ] **Step 1: Type-check completo**

Run: `npx tsc --noEmit`
Expected: 0 errori

- [ ] **Step 2: Lint completo (verifica nessuna regressione sul totale T01)**

Run: `npx eslint --no-ignore app components services lib hooks config --ext .ts,.tsx,.js,.jsx`
Expected: 0 errori; il totale warning non deve aumentare rispetto al valore registrato nell'ultimo lotto T01 nel piano master (`docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`, cercare l'ultima cifra nella riga T01)

- [ ] **Step 3: Suite di test completa**

Run: `npm run test:release`
Expected: tutti i test passano, incluso il nuovo `__tests__/capabilities/successionSuggestions.test.ts`

- [ ] **Step 4: Aggiornare lo stato della spec**

In `docs/superpowers/specs/2026-07-25-environmental-planning-restoration-design.md`, cambiare la riga di stato:

```markdown
- **Stato:** approvato, in attesa di piano di implementazione
```

in:

```markdown
- **Stato:** implementato 25/07/2026 — vedi `docs/superpowers/plans/2026-07-25-environmental-planning-restoration.md` per il piano eseguito. Verifica visiva in browser non effettuata (nessun `.claude/launch.json` in questo worktree, come dichiarato nella sezione 8 della spec).
```

- [ ] **Step 5: Commit finale**

```bash
git add docs/superpowers/specs/2026-07-25-environmental-planning-restoration-design.md
git commit -m "docs: mark environmental planning restoration spec as implemented"
```

- [ ] **Step 6: Push**

```bash
git push origin HEAD:main
git push origin HEAD:claude/indice-aggiornato-afd2cd
```

Expected: entrambi i push completano senza conflitti (fast-forward), dato che questo branch era già allineato a `origin/main` prima di iniziare questo piano.

---

## Note per chi esegue

- **Nessuna verifica visiva in browser possibile in questo worktree** (nessun `.claude/launch.json` configurato) — dichiararlo esplicitamente a fine lavoro, non dare per scontato che l'interfaccia funzioni solo perché type-check e test passano.
- Il gap separato scoperto durante l'analisi (la pipeline di predizioni AI live `services/agronomicPredictionPipelineService.ts` ignora altitudine/sole/ostacoli) **non fa parte di questo piano** — è registrato a parte in M14 nel piano master, rimandato su richiesta esplicita dell'utente.
- `components/Dashboard.tsx` stesso non viene toccato da questo piano — resta candidato per l'eliminazione finale in O45, decisione rimandata a fine sessione.
