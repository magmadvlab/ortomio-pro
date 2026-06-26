# Ortomio — Master Execution Plan

> Piano di orchestrazione per i 4 cicli di miglioramento. Aggiornare lo stato manualmente o via subagent dopo ogni piano completato.

**Ultimo aggiornamento:** 2026-06-26
**Stato globale:** `░░░░░░░░░░` 0% — nessun piano eseguito

---

## Sequenza e dipendenze

```
┌─────────────────────────────────┐
│  FASE 1 — plan-3                │  ◄ INIZIA QUI
│  Storage Provider Integrity     │
│  [ ] pending                    │
│  Branch: fix/plan-3-storage     │
└────────────────┬────────────────┘
                 │ richiesto da plan-2
                 ▼
┌─────────────────────────────────┐
│  FASE 2 — plan-2                │
│  Service Logic Correctness      │
│  [ ] pending                    │
│  Branch: fix/plan-2-service     │
└────────────────┬────────────────┘
                 │ servizi base corretti
                 ▼
┌─────────────────────────────────┐
│  FASE 3 — P8                    │
│  Agronomic Brain & Robustezza   │
│  [ ] pending                    │
│  Branch: feat/p8-intelligence   │
└────────────────┬────────────────┘
                 │ dati attendibili
                 ▼
┌─────────────────────────────────┐
│  FASE 4 — plan-1                │
│  Component Quality              │
│  [ ] pending                    │
│  Branch: fix/plan-1-components  │
└─────────────────────────────────┘
```

---

## FASE 1 — plan-3: Storage Provider Integrity

**Priorità:** CRITICA — SSR crash in produzione
**Piano:** [`docs/superpowers/plans/2026-06-22-storage-provider-integrity.md`](plans/2026-06-22-storage-provider-integrity.md)
**Stato:** `[ ] pending`

### Perché prima
`SupabaseStorageProvider` chiama `localStorage` direttamente → `ReferenceError` in SSR Next.js su qualsiasi pagina che tocca dispositivi smart. Blocca utenti in produzione.

### Cosa fa
- Rimuove `getLocalStoredDevices`, `saveLocalStoredDevices` e analoghi da `SupabaseStorageProvider`
- Rende `updatePrescriptionMap` pseudo-atomico (insert-then-delete per le zone)

### Acceptance criteria
- [ ] `SupabaseStorageProvider` non referenzia `localStorage` in nessun metodo
- [ ] `npx tsc --noEmit` → 0 errori
- [ ] SSR rendering non crasha su pagine con dispositivi smart
- [ ] Zone update non lascia dati parziali in caso di errore

### File modificati
- `packages/storage-cloud/SupabaseStorageProvider.ts`

---

## FASE 2 — plan-2: Service Logic Correctness

**Priorità:** ALTA — perdita dati silente, bug in produzione
**Piano:** [`docs/superpowers/plans/2026-06-22-service-logic-correctness.md`](plans/2026-06-22-service-logic-correctness.md)
**Stato:** `[ ] pending`
**Dipende da:** FASE 1 completata e mergeata

### Perché seconda
`unifiedOperationsService` e `plantMonitoringService` hanno gardenId vuoto hardcodato, stub che tornano sempre null, e filtri data che fanno full-table-scan. Bug silenti che causano perdita di dati operativi.

### Cosa fa
- Tipizza `storageProvider: any` → `IStorageProvider` in `UnifiedOperationsService`
- Corregge `zoneId` non propagato nei record operativi
- Sostituisce stub con implementazioni reali
- Aggiunge filtro data nelle query di history
- Fix `writeStore` quota in `plantMonitoringService`
- Corregge `gardenId: ''` hardcodato

### Acceptance criteria
- [ ] `unifiedOperationsService`: 0 `any`, stub ritornano dati reali
- [ ] `gardenId` non è mai stringa vuota nelle operazioni
- [ ] Filtri data presenti nelle query di history
- [ ] `plantOperationLineage.test.ts` → tutti i test passano
- [ ] `npx tsc --noEmit` → 0 errori

### File modificati
- `services/unifiedOperationsService.ts`
- `services/plantMonitoringService.ts`
- `__tests__/precision-hub/plantOperationLineage.test.ts`

---

## FASE 3 — P8: Agronomic Brain & System Robustezza

**Priorità:** ALTA — intelligenza prodotto + robustezza sistema
**Piano:** [`docs/superpowers/plans/2026-06-26-p8-agronomic-brain-robustezza.md`](plans/2026-06-26-p8-agronomic-brain-robustezza.md) *(da creare)*
**Stato:** `[ ] pending`
**Dipende da:** FASE 2 completata e mergeata

### Perché terza
Con i servizi base corretti, è sicuro aggiungere intelligenza e robustezza. I dati calcolati (photoperiod, lunar, rootstock) diventano input reali dello scoring invece di output cosmetic.

### Task interni (sequenza)

| # | Task | Effort | Dipendenze |
|---|------|--------|-----------|
| P8-1 | Lunar service dedup | 30 min | — |
| P8-2 | Orchestrator intelligence (photoperiod + lunar → scoring) | 3h | P8-1 |
| P8-3 | Type safety `aiFeedback.ts` (elimina `any`) | 2h | — |
| P8-4 | Edge function hardening (UUID validation, no hardcode) | 1h | — |
| P8-5 | Error handling strutturato (`ServiceError` utility) | 3h | P8-3 |
| P8-6 | Test coverage orchestrator core (3 servizi, 14+ test) | 4h | P8-2, P8-5 |

### Acceptance criteria
- [ ] `lunarService.ts` deprecato, zero import verso di esso
- [ ] `scoreAgronomicPriority()` legge `photoperiodHours` e modifica score
- [ ] `generateRecommendations()` usa `lunarPhase.phase` per pesare raccomandazioni
- [ ] `types/aiFeedback.ts` → 0 `any` nei campi `DataSource.data` e `suggested_parameters`
- [ ] `compute-field-alerts` → risponde 400 su UUID malformato, 422 su coordinate mancanti
- [ ] `directorService`, `collaborativeAIService`, `agronomicActionQueueService` hanno test (≥14 totali)
- [ ] `npx tsc --noEmit` → 0 errori
- [ ] Suite precision-hub → tutti i test passano

### File modificati (attesi)
- `services/lunarPhaseService.ts`, `services/lunarService.ts`
- `services/agronomicPriorityService.ts`
- `services/directorService.ts`
- `services/agronomicRefinedContextService.ts`
- `types/agronomicKernel.ts`
- `types/aiFeedback.ts`
- `utils/serviceError.ts` *(nuovo)*
- `services/collaborativeAIService.ts`
- `services/gardenContextResolverService.ts`
- `supabase/functions/compute-field-alerts/index.ts`
- `__tests__/precision-hub/agronomicActionQueue.test.ts` *(nuovo)*
- `__tests__/precision-hub/collaborativeAI.test.ts` *(nuovo)*
- `__tests__/precision-hub/orchestratorIntelligence.test.ts` *(nuovo)*

---

## FASE 4 — plan-1: Component Quality

**Priorità:** MEDIA — qualità UX e performance React
**Piano:** [`docs/superpowers/plans/2026-06-22-component-quality.md`](plans/2026-06-22-component-quality.md)
**Stato:** `[ ] pending`
**Dipende da:** FASE 3 completata e mergeata

### Perché ultima
I component devono consumare dati attendibili (forniti da P8) prima di essere ottimizzati. Refactoring UI su dati non corretti è lavoro sprecato.

### Cosa fa
- Fix memory leak React in `Dashboard.tsx` (`Promise.all` senza cleanup)
- `useMemo` su servizi ricreati ogni render in `SmartPlantManager.tsx`
- Rimozione 623+ `console.log` debug in components
- Timer cleanup con `useRef` in `HomeDashboard.tsx`

### Acceptance criteria
- [ ] 0 `console.log` in `Dashboard.tsx`, `HomeDashboard.tsx`, `SmartPlantManager.tsx`
- [ ] `useEffect` con `Promise.all` ha cleanup con flag `cancelled`
- [ ] `SmartPlantManager`: `unifiedOperationsService` e `plantRowSyncService` in `useMemo`
- [ ] Timer in `HomeDashboard` pulito al unmount
- [ ] Nessuna regressione nei test esistenti

### File modificati
- `components/Dashboard.tsx`
- `components/shared/HomeDashboard.tsx`
- `components/plants/SmartPlantManager.tsx`

---

## Riepilogo effort totale

| Fase | Piano | Effort stimato |
|------|-------|---------------|
| 1 | plan-3 Storage | ~2h |
| 2 | plan-2 Service Logic | ~4h |
| 3 | P8 Intelligence | ~13h |
| 4 | plan-1 Components | ~3h |
| **Totale** | | **~22h** |

---

## Come eseguire

```bash
# Per ogni fase:
git checkout -b <branch-name> main
# Eseguire il piano con superpowers:subagent-driven-development
# Aprire PR verso main
# Verificare acceptance criteria
# Mergeare prima di iniziare la fase successiva
```

**Non iniziare mai una fase se la precedente non è mergeata su main.**

---

*Design spec completo: [`docs/superpowers/specs/2026-06-26-ortomio-complete-roadmap-design.md`](specs/2026-06-26-ortomio-complete-roadmap-design.md)*
