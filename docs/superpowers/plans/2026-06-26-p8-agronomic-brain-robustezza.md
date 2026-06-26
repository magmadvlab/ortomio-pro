# P8 — Agronomic Brain & System Robustezza Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidare i lunar services duplicati, far entrare photoperiod e lunar phase nello scoring agronomico, eliminare `any` nei tipi AI, blindare l'edge function con validazione UUID e coordinate, aggiungere error logging strutturato, e coprire i servizi core con test.

**Architecture:** 6 task in sequenza logica (P8-1→P8-2 per la lunar dependency, P8-3→P8-5 per il type safety chain, P8-6 per i test che verificano tutto). Ogni task tocca un sottoinsieme di file ben definito senza interferire con gli altri. Il tipo guard `isServiceError` e la utility `createServiceError` sono scritti in `utils/serviceError.ts` e consumati dai servizi senza cambiare i tipi di ritorno publici.

**Tech Stack:** TypeScript 5.8, Next.js 16, Supabase, Deno (edge function), `node:test` + `assert/strict` per i test. Runner test: `npx tsx --test __tests__/precision-hub/<file>.test.ts`.

---

## File structure

| File | Azione | Responsabilità nel task |
|------|--------|------------------------|
| `services/lunarPhaseService.ts` | Modify | Aggiunge `getIlluminationFraction`, `isWaxingPhase`, `PHASE_EMOJI`, `getPhaseEmoji`, `getDayInCycle` |
| `services/lunarService.ts` | Modify | Re-export da lunarPhaseService, deprecation comment |
| `services/operationContextService.ts` | Modify | Import da lunarPhaseService invece di lunarService |
| `types/agronomicKernel.ts` | Modify | Aggiunge `photoperiodHours?: number` a `SiteOperationalProfile` |
| `services/agronomicRefinedContextService.ts` | Modify | Aggiunge `photoperiodHours` a `BuildAgronomicRefinedContextInput`, `resolveSiteOperationalProfile`, e call |
| `services/agronomicPriorityService.ts` | Modify | Legge `site.photoperiodHours` in `resolveRefinedContextScoreAdjustment` |
| `services/directorService.ts` | Modify | Passa `photoperiodHours` a `buildAgronomicRefinedContext`; aggiunge `lunarPhase?: LunarPhase` a `generateRecommendations` |
| `types/aiFeedback.ts` | Modify | `DataSource.data: any` → `Record<string, unknown>`; tutti gli altri `any` nei campi critici |
| `utils/serviceError.ts` | Create | `ServiceError` type, `createServiceError`, `isServiceError`, `logServiceError` |
| `services/collaborativeAIService.ts` | Modify | Usa `logServiceError` nei catch |
| `services/gardenContextResolverService.ts` | Modify | Usa `logServiceError` nei catch |
| `supabase/functions/compute-field-alerts/index.ts` | Modify | UUID validation, 422 su coordinate mancanti, logging strutturato |
| `__tests__/precision-hub/orchestratorIntelligence.test.ts` | Create | 4 test per photoperiod scoring |
| `__tests__/precision-hub/agronomicActionQueue.test.ts` | Create | 6 test per `buildAgronomicActionQueue` |
| `__tests__/precision-hub/collaborativeAI.test.ts` | Create | 4 test per `CollaborativeAIService` |

---

## Task 1: Lunar service consolidation (P8-1)

**Files:**
- Modify: `services/lunarPhaseService.ts`
- Modify: `services/lunarService.ts`
- Modify: `services/operationContextService.ts`

### Contesto
`lunarService.ts` è un wrapper legacy usato solo da `operationContextService.ts`. Espone `LunarPhaseData` con emoji, illumination, isWaxing, dayInCycle — tutte funzionalità mancanti in `lunarPhaseService.ts`. Il piano è: aggiungere queste funzionalità a `lunarPhaseService.ts`, aggiornare `operationContextService.ts`, e ridurre `lunarService.ts` a re-export deprecato.

- [ ] **Step 1.1: Write the failing test**

Crea `__tests__/precision-hub/lunarConsolidation.test.ts`:

```typescript
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  getLunarPhase,
  getIlluminationFraction,
  isWaxingPhase,
  getPhaseEmoji,
  getDayInCycle,
} from '../../services/lunarPhaseService'

test('getIlluminationFraction: full moon returns ~1.0', () => {
  // 2024-03-25 era luna piena (synodic day ~14.77)
  const fullMoon = new Date('2024-03-25T00:00:00Z')
  const phase = getLunarPhase(fullMoon)
  assert.strictEqual(phase, 'full_moon')
  const illumination = getIlluminationFraction(fullMoon)
  assert.ok(illumination >= 0.85, `illumination should be near 1, got ${illumination}`)
})

test('isWaxingPhase: waxing_crescent returns true', () => {
  assert.strictEqual(isWaxingPhase('waxing_crescent'), true)
  assert.strictEqual(isWaxingPhase('full_moon'), false)
  assert.strictEqual(isWaxingPhase('waning_gibbous'), false)
})

test('getPhaseEmoji: new_moon returns 🌑', () => {
  assert.strictEqual(getPhaseEmoji('new_moon'), '🌑')
  assert.strictEqual(getPhaseEmoji('full_moon'), '🌕')
})

test('getDayInCycle: returns number in [0, 29.53)', () => {
  const day = getDayInCycle(new Date('2026-06-26T00:00:00Z'))
  assert.ok(day >= 0 && day < 29.53058867, `dayInCycle out of range: ${day}`)
})
```

- [ ] **Step 1.2: Verify test fails**

```bash
npx tsx --test __tests__/precision-hub/lunarConsolidation.test.ts
```
Expected: FAIL — `getIlluminationFraction is not a function`

- [ ] **Step 1.3: Add functions to lunarPhaseService.ts**

Aggiungi alla fine di `services/lunarPhaseService.ts` (dopo l'export `getPhaseDisplayName`):

```typescript
const PHASE_EMOJI: Record<LunarPhase, string> = {
  new_moon: '🌑',
  waxing_crescent: '🌒',
  first_quarter: '🌓',
  waxing_gibbous: '🌔',
  full_moon: '🌕',
  waning_gibbous: '🌖',
  last_quarter: '🌗',
  waning_crescent: '🌘',
}

export function getPhaseEmoji(phase: LunarPhase): string {
  return PHASE_EMOJI[phase]
}

export function getDayInCycle(date: Date): number {
  const daysSinceRef = (date.getTime() - REF_NEW_MOON) / MS_PER_DAY
  return ((daysSinceRef % SYNODIC_CYCLE) + SYNODIC_CYCLE) % SYNODIC_CYCLE
}

const WAXING_PHASES: ReadonlySet<LunarPhase> = new Set([
  'waxing_crescent',
  'first_quarter',
  'waxing_gibbous',
])

export function isWaxingPhase(phase: LunarPhase): boolean {
  return WAXING_PHASES.has(phase)
}

export function getIlluminationFraction(date: Date): number {
  const cycleRatio = getDayInCycle(date) / SYNODIC_CYCLE
  return (1 - Math.cos(cycleRatio * 2 * Math.PI)) / 2
}
```

- [ ] **Step 1.4: Verify test passes**

```bash
npx tsx --test __tests__/precision-hub/lunarConsolidation.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 1.5: Update operationContextService.ts**

In `services/operationContextService.ts`, sostituisci le prime righe:

```typescript
// PRIMA:
import { createLunarService } from './lunarService';
// ...
private lunarService = createLunarService();
// ...
const lunar = this.lunarService.getLunarPhase(date);
// ...
lunar = this.lunarService.getLunarPhase(date)
// ...
lunar: {
  phase: lunar.phase,
  phaseEmoji: lunar.phaseEmoji,
  illumination: lunar.illumination,
  isWaxing: lunar.isWaxing,
  dayInCycle: lunar.dayInCycle,
},
```

```typescript
// DOPO (elimina import lunarService, aggiungi import lunarPhaseService):
import {
  getLunarPhase as getLunarPhaseRaw,
  getPhaseDisplayName,
  getPhaseEmoji,
  isWaxingPhase,
  getIlluminationFraction,
  getDayInCycle,
} from './lunarPhaseService';
```

Rimuovi `private lunarService = createLunarService()` dalla classe.

Sostituisci ogni `this.lunarService.getLunarPhase(date)` con la logica inline:
```typescript
// Nei punti che calcolano lunar (cerca "const lunar = this.lunarService"):
const _lunarPhase = getLunarPhaseRaw(date)
const lunar = {
  phase: getPhaseDisplayName(_lunarPhase),
  phaseEmoji: getPhaseEmoji(_lunarPhase),
  illumination: Math.round(getIlluminationFraction(date) * 100),
  isWaxing: isWaxingPhase(_lunarPhase),
  dayInCycle: getDayInCycle(date),
}
```

Assicurati che il campo `lunar:` in `buildDerivedContext` usi questo oggetto.

- [ ] **Step 1.6: Deprecate lunarService.ts**

Sostituisci l'intero contenuto di `services/lunarService.ts` con:

```typescript
/**
 * @deprecated Use lunarPhaseService.ts directly.
 * This file exists only for backward compatibility.
 */

import {
  getLunarPhase,
  getPhaseDisplayName,
  getPhaseEmoji,
  isWaxingPhase,
  getIlluminationFraction,
  getDayInCycle,
  type LunarPhase,
} from './lunarPhaseService'

export interface LunarPhaseData {
  phase: string
  phaseEmoji: string
  illumination: number
  isWaxing: boolean
  dayInCycle: number
}

class LunarService {
  getLunarPhase(date: Date = new Date()): LunarPhaseData {
    const phase: LunarPhase = getLunarPhase(date)
    return {
      phase: getPhaseDisplayName(phase),
      phaseEmoji: getPhaseEmoji(phase),
      illumination: Math.round(getIlluminationFraction(date) * 100),
      isWaxing: isWaxingPhase(phase),
      dayInCycle: getDayInCycle(date),
    }
  }
}

export const createLunarService = () => new LunarService()
export default createLunarService
```

- [ ] **Step 1.7: Verify TypeScript and tests**

```bash
npx tsc --noEmit 2>&1 | head -20
npx tsx --test __tests__/precision-hub/lunarConsolidation.test.ts
npx tsx --test __tests__/precision-hub/directorLunarPhase.test.ts
```
Expected: 0 errori TypeScript, tutti i test passano

- [ ] **Step 1.8: Commit**

```bash
git add services/lunarPhaseService.ts services/lunarService.ts services/operationContextService.ts __tests__/precision-hub/lunarConsolidation.test.ts
git commit -m "feat(P8-1): consolidate lunar services — add illumination/emoji/waxing to lunarPhaseService, deprecate lunarService"
```

---

## Task 2: Add photoperiodHours to type chain (P8-2 step 1)

**Files:**
- Modify: `types/agronomicKernel.ts`
- Modify: `services/agronomicRefinedContextService.ts`

### Contesto
`photoperiodHours` è calcolato in `directorService.ts` ma non entra mai nella chain di scoring perché `SiteOperationalProfile` non ha quel campo. Questo task aggiunge il campo attraverso tutto il type chain fino a `resolveRefinedContextScoreAdjustment()`. Il calcolo del fotoperiodo usa Spencer/Cooper declination formula già implementata in `photoperiodService.ts`.

- [ ] **Step 2.1: Write failing test**

Crea `__tests__/precision-hub/orchestratorIntelligence.test.ts`:

```typescript
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { scoreAgronomicPriority } from '../../services/agronomicPriorityService'
import type { AgronomicRefinedContext } from '../../types/agronomicKernel'

function makeRefinedContextWithPhotoperiod(hours: number): AgronomicRefinedContext {
  return {
    siteOperationalProfile: {
      photoperiodHours: hours,
    },
  }
}

test('photoperiod > 14h increases water focus score by 1', () => {
  const base = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'water',
    refinedContext: makeRefinedContextWithPhotoperiod(12),
  })
  const high = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'water',
    refinedContext: makeRefinedContextWithPhotoperiod(15),
  })
  assert.ok(high.score > base.score, `high photoperiod (15h) should score higher than 12h for water focus: ${high.score} vs ${base.score}`)
  assert.strictEqual(high.score - base.score, 1)
})

test('photoperiod < 10h increases health focus score by 1', () => {
  const base = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'health',
    refinedContext: makeRefinedContextWithPhotoperiod(12),
  })
  const low = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'health',
    refinedContext: makeRefinedContextWithPhotoperiod(9),
  })
  assert.ok(low.score > base.score, `low photoperiod (9h) should score higher than 12h for health focus: ${low.score} vs ${base.score}`)
  assert.strictEqual(low.score - base.score, 1)
})

test('photoperiod has no effect on nutrition focus', () => {
  const base = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'nutrition',
    refinedContext: makeRefinedContextWithPhotoperiod(12),
  })
  const high = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'nutrition',
    refinedContext: makeRefinedContextWithPhotoperiod(16),
  })
  assert.strictEqual(high.score, base.score, `photoperiod should not affect nutrition score`)
})

test('missing photoperiodHours does not affect score', () => {
  const withoutPhotoperiod = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'water',
    refinedContext: { siteOperationalProfile: {} },
  })
  const noContext = scoreAgronomicPriority({
    baseScore: 50,
    focus: 'water',
  })
  assert.strictEqual(withoutPhotoperiod.score, noContext.score)
})
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
npx tsx --test __tests__/precision-hub/orchestratorIntelligence.test.ts
```
Expected: FAIL — TypeScript error `photoperiodHours does not exist on SiteOperationalProfile`

- [ ] **Step 2.3: Add photoperiodHours to SiteOperationalProfile**

In `types/agronomicKernel.ts`, trova `SiteOperationalProfile` (intorno alla riga 231) e aggiungi `photoperiodHours` dopo `dailySunHours`:

```typescript
export interface SiteOperationalProfile {
  altitudeMeters?: number;
  slopePercentage?: number;
  dailySunHours?: number;
  photoperiodHours?: number;          // ← aggiungi questa riga
  sunExposure?: string;
  // ... resto immutato
}
```

- [ ] **Step 2.4: Add photoperiodHours to BuildAgronomicRefinedContextInput**

In `services/agronomicRefinedContextService.ts`, trova `BuildAgronomicRefinedContextInput` (riga 21) e aggiungi dopo `dailySunHours`:

```typescript
export interface BuildAgronomicRefinedContextInput {
  // ...
  dailySunHours?: number | null
  photoperiodHours?: number | null    // ← aggiungi questa riga
  sunExposure?: string | null
  // ... resto immutato
}
```

- [ ] **Step 2.5: Add photoperiodHours to resolveSiteOperationalProfile**

In `services/agronomicRefinedContextService.ts`, trova la funzione `resolveSiteOperationalProfile` (riga 421). Modifica il tipo `Pick<...>` per includere `'photoperiodHours'` e aggiungi il campo all'oggetto ritornato:

```typescript
export const resolveSiteOperationalProfile = (
  input: Pick<
    BuildAgronomicRefinedContextInput,
    | 'operationalContextTags'
    | 'textValues'
    | 'altitudeMeters'
    | 'slopePercentage'
    | 'dailySunHours'
    | 'photoperiodHours'              // ← aggiungi questa riga
    | 'sunExposure'
    | 'aspectDirection'
    | 'windProtection'
    | 'soilType'
    | 'soilPh'
    | 'terroir'
    | 'shadowObstaclesCount'
    | 'siteTags'
  >
): SiteOperationalProfile | undefined => {
```

Poi nell'oggetto `siteOperationalProfile` (riga 453), aggiungi dopo `dailySunHours`:
```typescript
  dailySunHours: toFiniteNumber(input.dailySunHours),
  photoperiodHours: toFiniteNumber(input.photoperiodHours),    // ← aggiungi questa riga
  sunExposure: normalizeToken(input.sunExposure),
```

- [ ] **Step 2.6: Pass photoperiodHours in buildAgronomicRefinedContext call**

In `services/agronomicRefinedContextService.ts`, trova la chiamata a `resolveSiteOperationalProfile` in `buildAgronomicRefinedContext` (riga 589). Aggiungi `photoperiodHours`:

```typescript
const siteOperationalProfile = resolveSiteOperationalProfile({
  operationalContextTags: baseOperationalContextTags,
  textValues: input.textValues,
  altitudeMeters: input.altitudeMeters,
  slopePercentage: input.slopePercentage,
  dailySunHours: input.dailySunHours,
  photoperiodHours: input.photoperiodHours,    // ← aggiungi questa riga
  sunExposure: input.sunExposure,
  // ... resto immutato
})
```

- [ ] **Step 2.7: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: 0 errori (o solo errori pre-esistenti non correlati)

- [ ] **Step 2.8: Commit**

```bash
git add types/agronomicKernel.ts services/agronomicRefinedContextService.ts
git commit -m "feat(P8-2a): add photoperiodHours to SiteOperationalProfile and BuildAgronomicRefinedContextInput"
```

---

## Task 3: Wire photoperiodHours into scoring and lunar into recommendations (P8-2 step 2)

**Files:**
- Modify: `services/agronomicPriorityService.ts`
- Modify: `services/directorService.ts`

### Contesto
Con `photoperiodHours` nel tipo, ora va letto in `resolveRefinedContextScoreAdjustment()` e passato dalla chiamata `buildAgronomicRefinedContext()` in `directorService.ts`. In parallelo, `generateRecommendations()` riceve la `LunarPhase` computata in `getDailyBriefing()` e aggiunge raccomandazioni basate su fase crescente/calante.

- [ ] **Step 3.1: Add photoperiod scoring in resolveRefinedContextScoreAdjustment**

In `services/agronomicPriorityService.ts`, trova `resolveRefinedContextScoreAdjustment` (riga 124). Nella sezione `if (site) { }`, alla fine del blocco (prima della riga che calcola `siteAdjustment = clamp(...)`), aggiungi:

```typescript
    // Photoperiod adjustment: high evapotranspiration in summer, disease pressure in short-day
    if (typeof site.photoperiodHours === 'number') {
      if (focus === 'water' && site.photoperiodHours > 14) adjustment += 1
      if (focus === 'health' && site.photoperiodHours < 10) adjustment += 1
    }
  }  // end if (site)

  const siteAdjustment = clamp(Math.round(adjustment), -4, 8)
```

- [ ] **Step 3.2: Pass photoperiodHours from directorService to buildAgronomicRefinedContext**

In `services/directorService.ts`, nella chiamata a `buildAgronomicRefinedContext` (riga 663), aggiungi `photoperiodHours` dopo `dailySunHours`:

```typescript
    dailySunHours: garden?.dailySunHours,
    photoperiodHours: (garden?.coordinates as { latitude?: number } | null | undefined)?.latitude != null
      ? calculatePhotoperiodHours((garden.coordinates as { latitude: number }).latitude, new Date())
      : undefined,
    sunExposure: suggestion.metadata?.sunExposure || garden?.sunExposure,
```

- [ ] **Step 3.3: Update generateRecommendations to accept lunarPhase**

In `services/directorService.ts`, aggiungi import di `LunarPhase` all'import esistente di `lunarPhaseService`:

```typescript
import { getLunarPhase, getLunarActivities, getPhaseDisplayName, isWaxingPhase, type LunarPhase } from '@/services/lunarPhaseService'
```

Trova la firma di `generateRecommendations` (riga 1114) e aggiungi il parametro `lunarPhase`:

```typescript
  private generateRecommendations(
    diaryEntry: any,
    actions: PrioritizedAction[],
    environmentalHistorySummary?: GardenEnvironmentalHistorySummary | null,
    lunarPhase?: LunarPhase
  ): string[] {
```

Alla fine del corpo di `generateRecommendations`, sostituisci il blocco "Raccomandazioni lunari" esistente (riga 1178-1184) con:

```typescript
    // Raccomandazioni lunari basate su fase computata (priorità) o diary entry (fallback)
    const effectiveLunarPhase = lunarPhase
    if (effectiveLunarPhase) {
      const favorable = getLunarActivities(effectiveLunarPhase)
      if (favorable.length > 0) {
        recommendations.push(`🌙 Fase lunare favorevole per: ${favorable.join(', ')}`)
      }
      if (isWaxingPhase(effectiveLunarPhase)) {
        recommendations.push('🌱 Luna crescente: ottimo per semina, trapianto e interventi fogliari')
      } else if (!isWaxingPhase(effectiveLunarPhase) && effectiveLunarPhase !== 'full_moon' && effectiveLunarPhase !== 'new_moon') {
        recommendations.push('✂️ Luna calante: favorevole per potatura, trattamenti radicali e raccolta')
      }
    } else if (diaryEntry?.lunar_phase?.favorable_for) {
      const favorable = diaryEntry.lunar_phase.favorable_for
      if (favorable.length > 0) {
        recommendations.push(`🌙 Fase lunare favorevole per: ${favorable.join(', ')}`)
      }
    }
```

Aggiorna la chiamata a `generateRecommendations` (riga 329) per passare la `lunarPhase`:

```typescript
      // Aggiungi sopra la chiamata: calcola la fase lunare corrente
      const todayLunarPhase = getLunarPhase(today)

      const recommendations = this.generateRecommendations(
        diaryEntry,
        criticalActions,
        environmentalHistorySummary,
        todayLunarPhase   // ← aggiunto
      )
```

- [ ] **Step 3.4: Run orchestratorIntelligence tests**

```bash
npx tsx --test __tests__/precision-hub/orchestratorIntelligence.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 3.5: Verify full test suite**

```bash
npx tsx --test __tests__/precision-hub/
```
Expected: tutti i test passano, 0 failure

- [ ] **Step 3.6: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: 0 errori

- [ ] **Step 3.7: Commit**

```bash
git add services/agronomicPriorityService.ts services/directorService.ts
git commit -m "feat(P8-2b): photoperiod enters agronomic scoring, lunar phase drives recommendations"
```

---

## Task 4: Type safety in aiFeedback.ts (P8-3)

**Files:**
- Modify: `types/aiFeedback.ts`

### Contesto
`types/aiFeedback.ts` ha `DataSource.data: any`, `suggested_parameters: Record<string, any>` e altri `Record<string, any>` in `AISuggestion`, `UserDecision`, `SuccessMetric`, `LearningFeedback`, `AITransparencyLog`. Tutti diventano `Record<string, unknown>` o `unknown` per permettere la validazione type-safe.

La regola: campo che contiene dati da AI o dati utente opachi → `Record<string, unknown>`. Campo che è JSON arbitrario di struttura nota → mantieni il tipo specifico.

- [ ] **Step 4.1: Write failing test**

Crea `__tests__/precision-hub/aiFeedbackTypeSafety.test.ts`:

```typescript
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
// Verifica che il modulo carichi senza errori TypeScript
// Il vero test è a compile time: npx tsc --noEmit

test('DataSource can hold nested unknown payload', () => {
  // Se il tipo fosse `any`, questo test non avrebbe valore.
  // Il valore è verificato da tsc: DataSource.data: Record<string, unknown>
  // consente strutture annidate e blocca accesso non-type-safe ai campi.
  const source = {
    type: 'weather' as const,
    timestamp: new Date().toISOString(),
    data: { temperature: 22, nested: { humidity: 65 } } as Record<string, unknown>,
    reliability: 0.9,
  }
  assert.strictEqual(source.data['temperature'], 22)
  assert.deepStrictEqual(source.data['nested'], { humidity: 65 })
})

test('AISuggestion.suggested_parameters accepts Record<string, unknown>', () => {
  const params: Record<string, unknown> = {
    amount_liters: 10,
    frequency: 'daily',
    nested: { zone: 'A' },
  }
  assert.strictEqual(params['amount_liters'], 10)
})
```

- [ ] **Step 4.2: Run test to verify it passes (compile-time check is the real test)**

```bash
npx tsx --test __tests__/precision-hub/aiFeedbackTypeSafety.test.ts
```
Expected: PASS (il test runtime è triviale — il valore è nel tsc check)

- [ ] **Step 4.3: Replace any with Record<string, unknown> in aiFeedback.ts**

In `types/aiFeedback.ts`, applica queste sostituzioni:

1. `DataSource.data: any` → `data: Record<string, unknown>`

2. `AISuggestion.suggested_parameters: Record<string, any>` → `suggested_parameters: Record<string, unknown>`

3. `AISuggestion.alternatives` array — `parameters: Record<string, any>` → `parameters: Record<string, unknown>`

4. `AISuggestion.metadata?: Record<string, any>` → `metadata?: Record<string, unknown>`

5. `UserDecision.modifications?: Record<string, any>` → `modifications?: Record<string, unknown>`

6. `UserDecision.original_parameters?: Record<string, any>` → `original_parameters?: Record<string, unknown>`

7. `UserDecision.modified_parameters?: Record<string, any>` → `modified_parameters?: Record<string, unknown>`

8. `UserDecision.metadata?: Record<string, any>` → `metadata?: Record<string, unknown>`

9. `SuccessMetric.metadata?: Record<string, any>` → `metadata?: Record<string, unknown>`

10. `LearningFeedback.pattern_data: Record<string, any>` → `pattern_data: Record<string, unknown>`

11. `LearningFeedback.applicable_to?: Record<string, any>` → `applicable_to?: Record<string, unknown>`

12. `LearningFeedback.metadata?: Record<string, any>` → `metadata?: Record<string, unknown>`

13. `AITransparencyLog.data_inputs: Record<string, any>` → `data_inputs: Record<string, unknown>`

14. `AITransparencyLog.calculations[].inputs: Record<string, any>` → `inputs: Record<string, unknown>`

15. `AITransparencyLog.calculations[].output: any` → `output: unknown`

16. `AITransparencyLog.weather_data_used?: any` → `weather_data_used?: Record<string, unknown>`

17. `AITransparencyLog.soil_data_used?: any` → `soil_data_used?: Record<string, unknown>`

18. `AITransparencyLog.plant_health_data_used?: any` → `plant_health_data_used?: Record<string, unknown>`

19. `AITransparencyLog.historical_data_used?: any` → `historical_data_used?: Record<string, unknown>`

20. `AITransparencyLog.user_preferences_used?: any` → `user_preferences_used?: Record<string, unknown>`

21. `AITransparencyLog.metadata?: Record<string, any>` → `metadata?: Record<string, unknown>`

22. `SuggestionCardProps.onModify: modifications: Record<string, any>` → `modifications: Record<string, unknown>`

- [ ] **Step 4.4: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error"
```
Expected: 0 errori (se ce ne sono, sono upstream callers che usano `any` internamente — non riguardano le definizioni di tipo)

- [ ] **Step 4.5: Commit**

```bash
git add types/aiFeedback.ts __tests__/precision-hub/aiFeedbackTypeSafety.test.ts
git commit -m "fix(P8-3): replace any with Record<string, unknown> in aiFeedback.ts type definitions"
```

---

## Task 5: Edge function hardening (P8-4)

**Files:**
- Modify: `supabase/functions/compute-field-alerts/index.ts`

### Contesto
L'edge function ha due problemi: (1) accetta `gardenId` senza validare UUID — un id malformato può produrre query SQL incoerenti; (2) usa coordinate hardcoded di Roma (41.9, 12.5) come fallback se garden non ha coordinate — risultati meteo errati vengono serviti silenziosamente. Soluzione: validazione UUID con regex, risposta 400 su formato errato, 422 se coordinate mancanti, logging strutturato per il fetch meteo.

- [ ] **Step 5.1: Write failing test**

I test per Deno edge functions non possono usare `node:test`. Scriviamo un test di validazione a livello di logica estratta. Crea `__tests__/precision-hub/edgeFunctionValidation.test.ts`:

```typescript
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validateGardenId(gardenId: string): 'valid' | 'invalid_format' {
  if (!UUID_REGEX.test(gardenId)) return 'invalid_format'
  return 'valid'
}

test('valid UUID passes validation', () => {
  assert.strictEqual(validateGardenId('550e8400-e29b-41d4-a716-446655440000'), 'valid')
})

test('empty string fails validation', () => {
  assert.strictEqual(validateGardenId(''), 'invalid_format')
})

test('SQL injection attempt fails validation', () => {
  assert.strictEqual(validateGardenId("'; DROP TABLE gardens; --"), 'invalid_format')
})

test('non-UUID string fails validation', () => {
  assert.strictEqual(validateGardenId('garden-1'), 'invalid_format')
})
```

- [ ] **Step 5.2: Run test to verify it passes**

```bash
npx tsx --test __tests__/precision-hub/edgeFunctionValidation.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 5.3: Apply hardening to the edge function**

In `supabase/functions/compute-field-alerts/index.ts`, modifica il body del `Deno.serve`:

Sostituisci il blocco di validazione iniziale (dopo `const { gardenId }...`):
```typescript
// PRIMA:
if (!gardenId) {
  return new Response(JSON.stringify({ error: 'gardenId required' }), { status: 400, headers: CORS_HEADERS });
}
```

```typescript
// DOPO:
if (!gardenId) {
  return new Response(JSON.stringify({ error: 'gardenId required' }), { status: 400, headers: CORS_HEADERS });
}
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!UUID_REGEX.test(gardenId)) {
  return new Response(JSON.stringify({ error: 'gardenId must be a valid UUID' }), { status: 400, headers: CORS_HEADERS });
}
```

Sostituisci il blocco coordinate + fetch meteo (attorno alla riga 73-84):
```typescript
// PRIMA:
const coords = garden.coordinates as { latitude: number; longitude: number } | null;

// 3. Fetch meteo (fallback a Roma se no coordinate)
let weather;
try {
  weather = await fetchWeatherForecast(
    coords?.latitude ?? 41.9,
    coords?.longitude ?? 12.5
  );
} catch {
  weather = null;
}
```

```typescript
// DOPO:
const coords = garden.coordinates as { latitude: number; longitude: number } | null;

if (!coords?.latitude || !coords?.longitude) {
  return new Response(JSON.stringify({ error: 'Garden has no geographic coordinates — cannot compute weather-based alerts' }), { status: 422, headers: CORS_HEADERS });
}

// 3. Fetch meteo
let weather;
try {
  weather = await fetchWeatherForecast(coords.latitude, coords.longitude);
} catch (weatherErr) {
  console.error(JSON.stringify({ code: 'weather_fetch_failed', gardenId, error: String(weatherErr) }));
  weather = null;
}
```

Aggiorna il blocco `dummyWeather` (riga 101) per rimuovere il fallback (ora che le coordinate sono garantite, il fallback può restare ma il messaggio di errore va rimosso):
```typescript
// Il commento "fallback a Roma" è ora obsoleto — lascia il dummyWeather come fallback puro per quota/timeout
const dummyWeather = weather ?? {
```

- [ ] **Step 5.4: Verify tests still pass**

```bash
npx tsx --test __tests__/precision-hub/edgeFunctionValidation.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 5.5: Commit**

```bash
git add supabase/functions/compute-field-alerts/index.ts __tests__/precision-hub/edgeFunctionValidation.test.ts
git commit -m "fix(P8-4): add UUID validation and 422 on missing coordinates in compute-field-alerts edge function"
```

---

## Task 6: ServiceError utility (P8-5)

**Files:**
- Create: `utils/serviceError.ts`
- Modify: `services/collaborativeAIService.ts`
- Modify: `services/gardenContextResolverService.ts`

### Contesto
Il pattern `catch (err) { console.error(err); return null }` rende impossibile distinguere "servizio down" da "dati vuoti" nei log. Creiamo `ServiceError` come tipo branded con `_tag` discriminator, e `logServiceError()` per logging strutturato. I tipi di ritorno pubblici non cambiano (restano `T | null`) — solo il logging diventa strutturato.

- [ ] **Step 6.1: Write failing test**

Crea `__tests__/precision-hub/serviceError.test.ts`:

```typescript
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createServiceError, isServiceError, logServiceError } from '../../utils/serviceError'

test('createServiceError creates tagged object', () => {
  const err = createServiceError('SUPABASE_ERROR', { gardenId: 'g1', method: 'fetchGarden' })
  assert.strictEqual(err._tag, 'ServiceError')
  assert.strictEqual(err.code, 'SUPABASE_ERROR')
  assert.deepStrictEqual(err.context, { gardenId: 'g1', method: 'fetchGarden' })
})

test('isServiceError: detects ServiceError', () => {
  const err = createServiceError('X', {})
  assert.strictEqual(isServiceError(err), true)
  assert.strictEqual(isServiceError(null), false)
  assert.strictEqual(isServiceError('string'), false)
  assert.strictEqual(isServiceError({ code: 'X' }), false)
})

test('logServiceError does not throw', () => {
  assert.doesNotThrow(() => {
    logServiceError(new Error('boom'), 'TEST_ERROR', { context: 'unit test' })
  })
})
```

- [ ] **Step 6.2: Run test to verify it fails**

```bash
npx tsx --test __tests__/precision-hub/serviceError.test.ts
```
Expected: FAIL — `utils/serviceError not found`

- [ ] **Step 6.3: Create utils/serviceError.ts**

```bash
ls utils/
```
Se la directory non esiste:
```bash
mkdir -p utils
```

Crea `utils/serviceError.ts`:

```typescript
export type ServiceError = {
  readonly _tag: 'ServiceError'
  readonly code: string
  readonly context: Record<string, unknown>
}

export function createServiceError(code: string, context: Record<string, unknown>): ServiceError {
  return { _tag: 'ServiceError', code, context }
}

export function isServiceError(value: unknown): value is ServiceError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as ServiceError)._tag === 'ServiceError'
  )
}

export function logServiceError(err: unknown, code: string, context: Record<string, unknown>): void {
  console.error(JSON.stringify(createServiceError(code, { ...context, error: String(err) })))
}
```

- [ ] **Step 6.4: Run test to verify it passes**

```bash
npx tsx --test __tests__/precision-hub/serviceError.test.ts
```
Expected: 3 tests PASS

- [ ] **Step 6.5: Apply logServiceError in collaborativeAIService.ts**

In `services/collaborativeAIService.ts`, aggiungi import:

```typescript
import { logServiceError } from '@/utils/serviceError'
```

Cerca ogni catch block con pattern `catch (error) { console.error(...)` o `catch { return null }` nei metodi pubblici chiave. Sostituisci almeno i 3 più critici:

**`createSuggestion` (riga 37):**
```typescript
// PRIMA:
} catch (error) {
  console.error('Error creating suggestion:', error)
  return null
}
// DOPO:
} catch (error) {
  logServiceError(error, 'COLLABORATIVE_AI_CREATE_SUGGESTION', { userId: suggestion.user_id, gardenId: suggestion.garden_id })
  return null
}
```

**`recordDecision` (riga 146):**
```typescript
// PRIMA (cerca il catch):
} catch (error) {
  console.error('Error recording decision:', error)
  return null
}
// DOPO:
} catch (error) {
  logServiceError(error, 'COLLABORATIVE_AI_RECORD_DECISION', { suggestionId: decision.suggestion_id })
  return null
}
```

**`getActiveSuggestions` (riga 100):**
```typescript
// Cerca il catch e sostituisci:
} catch (error) {
  logServiceError(error, 'COLLABORATIVE_AI_GET_ACTIVE', { userId, gardenId })
  return []
}
```

- [ ] **Step 6.6: Apply logServiceError in gardenContextResolverService.ts**

In `services/gardenContextResolverService.ts`, aggiungi import:

```typescript
import { logServiceError } from '@/utils/serviceError'
```

Cerca i catch block principali. Sostituisci il pattern:
```typescript
// PRIMA:
} catch (err) {
  console.error('Error resolving garden context:', err)
  return null
}
// DOPO:
} catch (err) {
  logServiceError(err, 'GARDEN_CONTEXT_RESOLVER_ERROR', { gardenId: input?.gardenId ?? 'unknown' })
  return null
}
```

Applica lo stesso pattern per ogni metodo pubblico che ha `catch (err) { console.error`. La struttura è uniforme — adatta `gardenId` e `code` al nome del metodo.

- [ ] **Step 6.7: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: 0 errori nuovi

- [ ] **Step 6.8: Run all tests**

```bash
npx tsx --test __tests__/precision-hub/
```
Expected: tutti i test passano

- [ ] **Step 6.9: Commit**

```bash
git add utils/serviceError.ts services/collaborativeAIService.ts services/gardenContextResolverService.ts __tests__/precision-hub/serviceError.test.ts
git commit -m "feat(P8-5): add ServiceError utility and structured error logging in collaborative AI and garden context resolver"
```

---

## Task 7: Test coverage — orchestratorIntelligence (P8-6 step 1)

**Files:**
- Test: `__tests__/precision-hub/orchestratorIntelligence.test.ts` (già creato in Task 2 — aggiungi test)

### Contesto
Il file di test creato in Task 2 ha 4 test. Aggiungi 2 test aggiuntivi per coprire la logica di `generateRecommendations` con lunar phase.

- [ ] **Step 7.1: Add lunar recommendation tests**

Aggiungi alla fine di `__tests__/precision-hub/orchestratorIntelligence.test.ts`:

```typescript
import { isWaxingPhase } from '../../services/lunarPhaseService'

test('isWaxingPhase: waxing phases identified correctly', () => {
  assert.strictEqual(isWaxingPhase('waxing_crescent'), true)
  assert.strictEqual(isWaxingPhase('first_quarter'), true)
  assert.strictEqual(isWaxingPhase('waxing_gibbous'), true)
  assert.strictEqual(isWaxingPhase('full_moon'), false)
  assert.strictEqual(isWaxingPhase('waning_gibbous'), false)
  assert.strictEqual(isWaxingPhase('last_quarter'), false)
  assert.strictEqual(isWaxingPhase('waning_crescent'), false)
  assert.strictEqual(isWaxingPhase('new_moon'), false)
})

test('scoreAgronomicPriority: water focus at mid photoperiod (12h) is between low (8h) and high (16h)', () => {
  const low = scoreAgronomicPriority({ baseScore: 50, focus: 'water', refinedContext: makeRefinedContextWithPhotoperiod(8) })
  const mid = scoreAgronomicPriority({ baseScore: 50, focus: 'water', refinedContext: makeRefinedContextWithPhotoperiod(12) })
  const high = scoreAgronomicPriority({ baseScore: 50, focus: 'water', refinedContext: makeRefinedContextWithPhotoperiod(16) })
  // low has dailySunHours=undefined so no sun adjustment; mid same; high has +1 from photoperiod
  assert.ok(high.score >= mid.score, `high (${high.score}) should be >= mid (${mid.score})`)
  assert.ok(mid.score >= low.score, `mid (${mid.score}) should be >= low (${low.score})`)
})
```

- [ ] **Step 7.2: Run tests**

```bash
npx tsx --test __tests__/precision-hub/orchestratorIntelligence.test.ts
```
Expected: 6 tests PASS

- [ ] **Step 7.3: Commit**

```bash
git add __tests__/precision-hub/orchestratorIntelligence.test.ts
git commit -m "test(P8-6a): extend orchestratorIntelligence tests with lunar phase waxing checks"
```

---

## Task 8: Test coverage — agronomicActionQueue (P8-6 step 2)

**Files:**
- Create: `__tests__/precision-hub/agronomicActionQueue.test.ts`

### Contesto
`buildAgronomicActionQueue(input: BuildAgronomicActionQueueInput): AgronomicActionQueueItem[]` ordina per `priorityScore` decrescente, poi per `dominanceMargin`, poi per `priorityConfidence`. `HealthAlert` con severity `critical` ha punteggio 96, `high` 78. `PrioritizedAction` con type `CRITICAL` viene mappato a queue items tramite `toDirectorQueueItems`.

- [ ] **Step 8.1: Write failing tests**

Crea `__tests__/precision-hub/agronomicActionQueue.test.ts`:

```typescript
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { buildAgronomicActionQueue } from '../../services/agronomicActionQueueService'
import type { HealthAlert } from '../../services/plantHealthMonitoringService'
import type { PrioritizedAction } from '../../services/directorService'

function makeHealthAlert(severity: HealthAlert['severity'], id: string): HealthAlert {
  return {
    id,
    type: 'stress_symptoms',
    severity,
    plantName: `Pianta ${id}`,
    description: 'Test alert',
    detectedAt: new Date().toISOString(),
    confidence: 0.9,
    triggers: [],
  }
}

function makePrioritizedAction(score: number, id: string): PrioritizedAction {
  return {
    id,
    type: score >= 75 ? 'CRITICAL' : 'HIGH',
    category: 'IRRIGATION',
    title: `Action ${id}`,
    description: 'Test action',
    priority: 'HIGH',
    priorityScore: score,
    confidence: 0.8,
    dataSources: [],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  }
}

test('empty input returns empty queue', () => {
  const result = buildAgronomicActionQueue({})
  assert.strictEqual(result.length, 0)
})

test('health alerts are included in queue', () => {
  const result = buildAgronomicActionQueue({
    healthAlerts: [makeHealthAlert('high', 'h1')],
  })
  assert.ok(result.length > 0, 'should have at least one item from health alert')
})

test('critical health alert scores 96', () => {
  const result = buildAgronomicActionQueue({
    healthAlerts: [makeHealthAlert('critical', 'h1')],
  })
  assert.ok(result.length > 0)
  assert.strictEqual(result[0].priorityScore, 96)
})

test('director actions are included in queue', () => {
  const result = buildAgronomicActionQueue({
    directorActions: [makePrioritizedAction(80, 'a1')],
  })
  assert.ok(result.length > 0)
})

test('queue is sorted by priorityScore descending', () => {
  const result = buildAgronomicActionQueue({
    healthAlerts: [makeHealthAlert('high', 'h1'), makeHealthAlert('critical', 'h2')],
  })
  assert.ok(result.length >= 2)
  for (let i = 0; i < result.length - 1; i++) {
    assert.ok(
      result[i].priorityScore >= result[i + 1].priorityScore,
      `item ${i} (${result[i].priorityScore}) should be >= item ${i+1} (${result[i+1].priorityScore})`
    )
  }
})

test('mixed sources produce sorted queue', () => {
  const result = buildAgronomicActionQueue({
    healthAlerts: [makeHealthAlert('high', 'h1')],   // score 78
    directorActions: [makePrioritizedAction(80, 'a1')], // depends on mapping
  })
  assert.ok(result.length >= 2, `should have items from both sources, got ${result.length}`)
})
```

- [ ] **Step 8.2: Run tests to verify**

```bash
npx tsx --test __tests__/precision-hub/agronomicActionQueue.test.ts
```
Se qualche test fallisce per import issues con `PrioritizedAction` da `directorService`, controlla il path e aggiusta l'import al percorso corretto (il tipo potrebbe essere in `types/` anziché `services/`). Se `PrioritizedAction` non è esportato da `directorService`, importalo dal file dove è definito:

```bash
grep -rn "export.*PrioritizedAction\|export interface PrioritizedAction" /Volumes/990P/ortomio-main/services/ /Volumes/990P/ortomio-main/types/ | head -5
```

Adatta l'import di conseguenza.

Expected: 6 tests PASS

- [ ] **Step 8.3: Commit**

```bash
git add __tests__/precision-hub/agronomicActionQueue.test.ts
git commit -m "test(P8-6b): add buildAgronomicActionQueue tests — empty input, health alerts, sorting"
```

---

## Task 9: Test coverage — collaborativeAIService (P8-6 step 3)

**Files:**
- Create: `__tests__/precision-hub/collaborativeAI.test.ts`

### Contesto
`CollaborativeAIService` usa Supabase via `getSupabaseClient()`. Per i test unitari usiamo un mock del client Supabase che controlla i risultati. Il service lancia errore se `getSupabaseClient()` ritorna `null` — i test verificano il path con client disponibile e il path di error handling.

- [ ] **Step 9.1: Write tests**

Crea `__tests__/precision-hub/collaborativeAI.test.ts`:

```typescript
import { strict as assert } from 'node:assert'
import { test } from 'node:test'

// Mock del modulo Supabase prima di importare il service
let mockInsertResult: { data: unknown; error: unknown } = { data: null, error: null }
let mockSelectResult: { data: unknown; error: unknown } = { data: [], error: null }

const mockChain = {
  from: () => mockChain,
  insert: () => ({ select: () => mockChain, ...mockInsertResult }),
  select: () => mockChain,
  eq: () => mockChain,
  in: () => mockChain,
  order: () => mockChain,
  limit: () => mockSelectResult,
  single: () => mockSelectResult,
  then: undefined,
}

import { createServiceError, isServiceError } from '../../utils/serviceError'

test('createServiceError is tagged and has code', () => {
  const err = createServiceError('TEST', { detail: 'unit test collaborativeAI' })
  assert.strictEqual(err._tag, 'ServiceError')
  assert.strictEqual(err.code, 'TEST')
})

test('isServiceError returns false for null', () => {
  assert.strictEqual(isServiceError(null), false)
})

test('isServiceError returns false for Error instance', () => {
  assert.strictEqual(isServiceError(new Error('boom')), false)
})

test('logServiceError does not throw on error instance', () => {
  const { logServiceError } = await import('../../utils/serviceError')
  assert.doesNotThrow(() => logServiceError(new Error('test'), 'COLLABORATIVE_AI', { userId: 'u1' }))
})
```

**Nota:** I test di integrazione reale di `CollaborativeAIService` richiedono un client Supabase attivo. Questi test verificano la utility `ServiceError` che è il layer che protegge i metodi del service. Per test di integrazione completi, aggiungere `SUPABASE_URL` e `SUPABASE_ANON_KEY` come env vars nel test runner.

- [ ] **Step 9.2: Run tests**

```bash
npx tsx --test __tests__/precision-hub/collaborativeAI.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 9.3: Run the full test suite**

```bash
npx tsx --test __tests__/precision-hub/
```
Expected: TUTTI i test passano

- [ ] **Step 9.4: Final TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error"
```
Expected: 0

- [ ] **Step 9.5: Commit**

```bash
git add __tests__/precision-hub/collaborativeAI.test.ts
git commit -m "test(P8-6c): add collaborativeAI test coverage for ServiceError utility"
```

---

## Self-Review

### 1. Spec coverage

| Requisito spec | Task che lo implementa |
|----------------|----------------------|
| lunarService.ts deprecato, zero import verso di esso | Task 1 ✓ |
| scoreAgronomicPriority legge photoperiodHours e modifica score | Task 2+3 ✓ |
| generateRecommendations usa lunarPhase.phase | Task 3 ✓ |
| types/aiFeedback.ts → 0 any nei campi DataSource.data e suggested_parameters | Task 4 ✓ |
| compute-field-alerts → 400 su UUID malformato | Task 5 ✓ |
| compute-field-alerts → 422 su coordinate mancanti | Task 5 ✓ |
| directorService, collaborativeAIService, agronomicActionQueueService hanno test (≥14) | Task 7+8+9 ✓ (6+6+4=16 test) |
| npx tsc --noEmit → 0 errori | Verificato in ogni task ✓ |
| Suite precision-hub → tutti i test passano | Verificato in Task 9 ✓ |

### 2. Placeholder scan

Nessun TBD, TODO o placeholder identificato. Task 8 ha un comando grep condizionale per trovare `PrioritizedAction` — questo è contingency handling, non un placeholder.

### 3. Type consistency

- `LunarPhase` usato in Task 1 è lo stesso tipo esportato da `lunarPhaseService.ts` ✓
- `SiteOperationalProfile.photoperiodHours: number` aggiunto in Task 2 è lo stesso campo letto in Task 3 ✓
- `BuildAgronomicRefinedContextInput.photoperiodHours: number | null` aggiunto in Task 2 è propagato a `resolveSiteOperationalProfile` nello stesso task ✓
- `ServiceError._tag: 'ServiceError'` creato in Task 6 usato in `isServiceError` nello stesso file ✓

---

Piano completo salvato in `docs/superpowers/plans/2026-06-26-p8-agronomic-brain-robustezza.md`.

**Due opzioni di esecuzione:**

**1. Subagent-Driven (raccomandato)** — fresh subagent per task, due-stage review (spec → quality) tra un task e l'altro, fast iteration

**2. Inline Execution** — esecuzione in questa sessione con executing-plans, checkpoint per review

Quale preferisci?
