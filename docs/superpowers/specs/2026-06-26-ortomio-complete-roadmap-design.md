# Ortomio Complete Improvement Roadmap — Design Spec

**Data:** 2026-06-26
**Stato globale:** 0% (piani 1–3 pending, P8 da creare)
**Autore:** Analisi automatica + revisione umana

---

## Obiettivo

Portare Ortomio da uno stato di "funzionante con debito tecnico accumulato" a uno stato di "robusto, testato e intelligente". Il lavoro è organizzato in 4 piani eseguiti in sequenza con dipendenze esplicite.

---

## Architettura dell'intervento

### Principi guida
- **Stabilità prima dell'intelligenza**: bug che rompono la produzione hanno priorità assoluta
- **Un piano = un branch = una PR**: ogni piano è isolato e reversibile
- **Test prima di mergeability**: nessun piano si considera completo senza test che passano
- **Chirurgia, non refactoring**: si interviene solo dove indicato, senza riorganizzare strutture non coinvolte

### Sequenza e dipendenze

```
plan-3 (Storage Integrity)
  └─ SSR crash SupabaseStorageProvider rimosso
  └─ Zone update reso pseudo-atomico
        │
        ▼
plan-2 (Service Logic Correctness)
  └─ unifiedOperationsService: tipi, stub, date filter, gardenId
  └─ plantMonitoringService: writeStore quota, gardenId vuoto
        │
        ▼ (servizi base corretti → error handling ha senso)
P8 (Agronomic Brain & Robustezza)
  └─ Lunar service dedup
  └─ Orchestrator intelligence (photoperiod + lunar → scoring)
  └─ Type safety aiFeedback.ts
  └─ Edge function hardening
  └─ Error handling strutturato
  └─ Test coverage orchestrator core
        │
        ▼ (dati attendibili → UI può essere corretta)
plan-1 (Component Quality)
  └─ Memory leak React cleanup
  └─ useMemo su servizi in SmartPlantManager
  └─ Rimozione console.log debug
```

**Dipendenze critiche:**
- `plan-2` usa `IStorageProvider` → richiede `plan-3` completo
- `P8 Task P8-5` (error handling) → richiede servizi corretti da `plan-2`
- `plan-1` consuma dati calcolati → richiede `P8` per avere valori attendibili

---

## Piano P8 — Agronomic Brain & System Robustezza

### Scope
Colmare i gap non coperti dai piani esistenti: intelligenza dell'orchestrator, type safety, robustezza edge functions, test dell'orchestrator core.

### Task in sequenza

#### P8-1: Consolidare lunar services (30 min)
**Problema:** `services/lunarService.ts` (wrapper legacy) e `services/lunarPhaseService.ts` (implementazione corrente) coesistono. Altri servizi importano dal vecchio wrapper con formule diverse.

**Soluzione:** Deprecare `lunarService.ts`. Aggiungere a `lunarPhaseService.ts` le funzionalità mancanti (`illuminationFraction`, `isWaxing`/`isWaning`). Aggiornare tutti gli import.

**File:**
- Modify: `services/lunarPhaseService.ts`
- Modify: `services/lunarService.ts` → eliminare o ridurre a re-export
- Update: tutti i file che importano da `lunarService.ts`

**Test:** verificare che `getLunarPhase()` e `getLunarActivities()` producano risultati coerenti con i test esistenti in `directorLunarPhase.test.ts`

---

#### P8-2: Orchestrator intelligence (3h)
**Problema:** `photoperiod_hours` e `lunarPhase` vengono calcolati ma non entrano mai in `scoreAgronomicPriority()` né in `generateRecommendations()`. Sono "cosmetic output".

**Soluzione:**
- `scoreAgronomicPriority()` in `agronomicPriorityService.ts` riceve `photoperiodHours?: number` → aggiustamento score: focus `water` +1 se photoperiod > 14h (alta evapotraspirazione), focus `health` +1 se photoperiod < 10h (rischio funghi per umidità)
- `generateRecommendations()` in `directorService.ts` usa `lunarPhase.phase` per filtrare raccomandazioni: luna calante → priorità potatura/trattamenti, luna crescente → priorità semina/trapianto
- `buildAgronomicRefinedContext()` riceve `photoperiodHours` come parametro esplicito nel `SubSystemContext`

**File:**
- Modify: `services/agronomicPriorityService.ts`
- Modify: `services/directorService.ts`
- Modify: `services/agronomicRefinedContextService.ts`
- Modify: `types/agronomicKernel.ts` (aggiungere `photoperiodHours?` a SubSystemContext)

**Test:** `__tests__/precision-hub/orchestratorIntelligence.test.ts` — verifica che score cambi con photoperiod alto/basso

---

#### P8-3: Type safety in aiFeedback.ts (2h)
**Problema:** `DataSource.data: any`, `suggested_parameters: Record<string, any>` rendono impossibile la validazione degli input AI.

**Soluzione:**
- `DataSource.data` → `Record<string, string | number | boolean | null>`
- `suggested_parameters` → `Record<string, string | number | boolean | null | string[]>`
- Aggiungere type guard `isValidAISuggestion(obj: unknown): obj is AISuggestion` usato nella entry point `suggestionToAction()`

**File:**
- Modify: `types/aiFeedback.ts`
- Modify: `services/directorService.ts` (aggiungere guard a `suggestionToAction`)

**Test:** verificare che `tsc --noEmit` passi; aggiungere test per il type guard

---

#### P8-4: Edge function hardening (1h)
**Problema:** `compute-field-alerts` accetta `gardenId` senza validare UUID; coordinate Roma hardcoded come fallback.

**Soluzione:**
- Aggiungere UUID regex validation su `gardenId` → rispondere 400 se malformato
- Rimuovere coordinate fallback hardcoded → rispondere 422 se garden non ha coordinate
- Aggiungere logging strutturato (`console.error(JSON.stringify({ code, context }))`) invece di `catch { weather = null }`

**File:**
- Modify: `supabase/functions/compute-field-alerts/index.ts`

**Test:** curl con UUID non valido → 400; curl con garden senza coordinate → 422

---

#### P8-5: Error handling strutturato (3h)
**Problema:** Pattern `catch (err) { console.error(err); return null }` in 30+ punti. Il client non distingue "servizio down" da "dati vuoti".

**Soluzione:**
- Creare `utils/serviceError.ts` con `createServiceError(code: string, context: object)` e tipo `ServiceError`
- Sostituire il pattern catch-return-null nei 3 servizi critici: `directorService`, `collaborativeAIService`, `gardenContextResolverService`
- I metodi che possono fallire ritornano `T | ServiceError` invece di `T | null`

**File:**
- Create: `utils/serviceError.ts`
- Modify: `services/directorService.ts` (boundary errors)
- Modify: `services/collaborativeAIService.ts`
- Modify: `services/gardenContextResolverService.ts`

**Test:** mock di Supabase che lancia errore → verificare che il caller riceva `ServiceError` con code corretto

---

#### P8-6: Test coverage orchestrator core (4h)
**Problema:** `directorService`, `collaborativeAIService`, `agronomicActionQueueService` hanno 0 test.

**Soluzione:**
- `__tests__/precision-hub/agronomicActionQueue.test.ts` — 6 test per `buildAgronomicActionQueue()`: empty input, mixed sources, priority ordering
- `__tests__/precision-hub/collaborativeAI.test.ts` — 4 test con mock Supabase: insert, fetch, error path
- `__tests__/precision-hub/orchestratorIntelligence.test.ts` — 4 test per il nuovo scoring con photoperiod

**File:**
- Create: 3 nuovi file test

---

### Stima P8
| Task | Effort | Dipendenze |
|------|--------|-----------|
| P8-1 Lunar dedup | 30 min | nessuna |
| P8-2 Orchestrator intelligence | 3h | P8-1 |
| P8-3 Type safety | 2h | nessuna |
| P8-4 Edge function | 1h | nessuna |
| P8-5 Error handling | 3h | P8-3 |
| P8-6 Test coverage | 4h | P8-2, P8-5 |
| **Totale** | **~13h** | |

---

## Acceptance criteria per fase

### plan-3 completo quando:
- `npx tsc --noEmit` → 0 errori
- `SupabaseStorageProvider` non chiama `localStorage` direttamente
- Update zona è pseudo-atomico (insert before delete)
- SSR rendering di qualsiasi pagina non crasha

### plan-2 completo quando:
- `unifiedOperationsService`: nessun `any`, stub ritornano dati reali, gardenId non è stringa vuota
- `plantMonitoringService`: writeStore ha try/catch, gardenId corretto
- `plantOperationLineage.test.ts` → tutti i test passano

### P8 completo quando:
- `lunarService.ts` → deprecato o rimosso
- `scoreAgronomicPriority()` legge `photoperiodHours` e aggiusta score
- `types/aiFeedback.ts` → 0 `any` nei campi critici
- `compute-field-alerts` → risponde 400/422 su input invalidi
- 3 servizi core coperti da test
- `npx tsc --noEmit` → 0 errori

### plan-1 completo quando:
- 0 memory leak React (useEffect con cleanup)
- 0 `console.log` rimasti in Dashboard.tsx, HomeDashboard.tsx, SmartPlantManager.tsx
- `useMemo` su servizi in SmartPlantManager
- Prop drilling Dashboard ridotto tramite context

---

## Note di esecuzione

- **Branch per piano:** `fix/plan-3-storage`, `fix/plan-2-service-logic`, `feat/plan-p8-intelligence`, `fix/plan-1-components`
- **Metodo:** `superpowers:subagent-driven-development` per ogni piano
- **PR:** una PR per piano verso `main`; non mergeabile finché acceptance criteria non soddisfatti
- **Ordine stretto:** non iniziare piano N+1 finché piano N non è mergeato
