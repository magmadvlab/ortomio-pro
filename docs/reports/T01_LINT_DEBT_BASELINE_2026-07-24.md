# T01 - Debito lint storico

## Metodo

`npm run lint` con `--format json` per contare per regola, non a occhio. Ogni lotto: leggere il file coinvolto per intero prima di rimuovere qualunque binding — un warning "unused" non e' mai stato rimosso alla cieca in questo lotto. Import mai usati e blocchi `catch` senza binding sono rimossi. Un getter di `useState` mai letto ma il cui setter e' ancora chiamato viene omesso dalla destrutturazione (`const [, setX] = useState(...)`), non eliminato — cambiare la logica di fetch/stato e' una decisione di prodotto separata, fuori da un lotto di pulizia lint.

## Baseline all'apertura di T01 (24/07/2026, sera)

| Regola | Errori | Warning |
|---|---:|---:|
| `@typescript-eslint/no-explicit-any` | 0 | 1277 |
| `@typescript-eslint/no-unused-vars` | 0 | 1151 |
| `react-hooks/exhaustive-deps` | 0 | 174 |
| `@next/next/no-img-element` | 0 | 36 |
| `import/no-anonymous-default-export` | 0 | 4 |
| `prefer-const` | 1 | 0 |
| **Totale** | **1** | **2642** |

## Lotto 1 (24/07/2026, sera) - chiuso

- `prefer-const` (1 errore): `app/api/calendar/tasks/route.ts:24`, variabile mai riassegnata.
- `import/no-anonymous-default-export` (4 warning): `services/geoClimateService.ts`, `services/individualPlantService.ts`, `services/plantMonitoringService.ts`, `services/plantOperationsService.ts` - assegnato l'oggetto a una costante nominata prima di `export default`.
- `@typescript-eslint/no-unused-vars` in `components/shared/HomeDashboard.tsx` (49 -> 0 in questo file): icone e componenti importati mai usati rimossi (inclusi import di modali mai wirati: `IntegratedFieldOperationsModal`, `QuickOperationModal`, `TraditionalCropsWidget`, `OliveHarvest`, `VineHarvest`, `IrrigationZonesWidget` - stesso pattern di stato-morto gia' visto altrove nel progetto); `useTier()` rimosso perche' nessun valore del suo ritorno era letto; 4 coppie di stato completamente morte rimosse (`isGardenSelectorOpen`, `showIntegratedOperationsModal`, `selectedFieldRowsForOperations`, `showQuickOperationModal`/`quickOperationType` - setter mai chiamati, verificato con grep prima di rimuovere); 5 coppie con getter morto ma setter ancora in uso portate a `const [, setX] = useState(...)` senza toccare la logica di fetch (`irrigationZones`, `loadingIrrigationZones`, `weather`, `weatherLoading`, `loadingPlan`); 6 blocchi `catch (e) {}`/`catch (error) {}` con binding mai letto convertiti a `catch {}`; 2 parametri `id` mai usati rimossi da callback inline dove il tipo di destinazione ammette meno parametri (assegnazione strutturale di funzione, nessuna rottura).
- **Verifiche:** type-check verde; `test:release` 228/228; build produzione verde; lint del file target sceso da 49 a 0 voci `no-unused-vars` (restano solo `exhaustive-deps` e `no-explicit-any`, deliberatamente non toccati in questo lotto).

## Stato dopo il lotto 1

| Regola | Errori | Warning |
|---|---:|---:|
| `@typescript-eslint/no-explicit-any` | 0 | 1277 |
| `@typescript-eslint/no-unused-vars` | 0 | 1102 |
| `react-hooks/exhaustive-deps` | 0 | 174 |
| `@next/next/no-img-element` | 0 | 36 |
| **Totale** | **0** | **2589** |

## Cosa NON e' stato toccato e perche'

- **`react-hooks/exhaustive-deps` (174):** in `HomeDashboard.tsx` sono deliberatamente soppressi con commenti espliciti nel codice ("Only re-run when garden ID changes" ecc.) per evitare loop di render. Aggiungere le dipendenze mancanti senza verificare ogni caso rischia di introdurre loop infiniti o fetch ridondanti - richiede lotto dedicato con test di regressione mirati, non una pulizia meccanica.
- **`@typescript-eslint/no-explicit-any` (1277):** ogni istanza richiede scegliere/scrivere un tipo corretto, non e' un'operazione meccanica. Lotto separato, probabilmente il piu' grande e piu' lento dei quattro.
- **`@next/next/no-img-element` (36):** sostituire `<img>` con `next/image` richiede verificare dimensioni e dominio remoto per ogni immagine, non solo cambiare il tag.

## Lotto 2 (24/07/2026, sera) - chiuso

- `components/monitoring/ContinuousMonitoringDashboard.tsx` (26 -> 0 `no-unused-vars` in questo file): 18 icone importate mai usate rimosse; 2 prop mai lette (`plants`, `onUpdatePlant`) rimosse dalla destrutturazione (restano nell'interfaccia, un chiamante futuro puo' ancora passarle); coppia di stato `selectedAlert`/`setSelectedAlert` completamente morta rimossa (nessun uso, verificato con grep); getter morto ma setter vivo (`selectedPlant`) ridotto a `const [, setSelectedPlant]`; **2 funzioni completamente morte rimosse** (`handleStartMonitoring`, `handleStopMonitoring` — chiamavano davvero `monitoringService.start()/stop()`, non erano stub finti come nel lotto precedente, ma non erano wirate a nessun bottone, confermato con grep zero altri riferimenti); di conseguenza anche `setIsMonitoring` e' diventato senza chiamanti e il suo state e' stato ridotto a `const [isMonitoring] = useState(false)` (il getter resta, mostrato nel badge di stato).
- **Scoperta collaterale (non un fix, solo annotata):** l'intero componente `ContinuousMonitoringDashboard` non e' importato da nessun'altra parte del repo (verificato con grep) — e' irraggiungibile da qualunque route. A differenza del caso `costOptimizationService.ts` non presenta dati finti a un utente reale (nessun utente puo' vederlo), quindi non e' stato bloccante per il lotto lint; resta pero' un candidato per la classificazione "codice morto" di M05 se in futuro si decide di rimuoverlo per intero.
- **Verifiche:** type-check verde; `test:release` 228/228; build produzione verde.

## Stato dopo il lotto 2

| Regola | Errori | Warning |
|---|---:|---:|
| `@typescript-eslint/no-explicit-any` | 0 | 1277 |
| `@typescript-eslint/no-unused-vars` | 0 | 1076 |
| `react-hooks/exhaustive-deps` | 0 | 174 |
| `@next/next/no-img-element` | 0 | 36 |
| **Totale** | **0** | **2563** |

## Lotto 3 (24/07/2026, sera) - chiuso

- `components/plants/PlantLifecycleManager.tsx` (24 -> 0): import morti (icone, funzioni mai chiamate) e 2 prop mai lette (`onUpdatePlant`, `onAddHarvest`) rimosse dalla destrutturazione.
- `components/Planner.tsx` (19 -> 0): import morti (icone, tipi, 2 componenti mai renderizzati `PHCompatibilityChecker`/`FertigationPlanner`, 3 funzioni mai chiamate); `limit` rimosso dalla destrutturazione di `useTier()`; `activeTasksCount`/`tasksLimit`/`checkLimit` rimossi in cascata (calcolavano un valore mai letto altrove); `loadingDailyPlan` ridotto a solo setter; 3 blocchi `catch (fallbackError: any) {}` con binding mai letto convertiti a `catch {}` (chiude anche 3 `no-explicit-any` in bonus); `newTasks` (array costruito e mai popolato ne' letto) rimosso.
  - **Bug funzionale trovato e sistemato, non solo lint** (su richiesta esplicita dell'utente): i bottoni "☀️ Estive"/"❄️ Invernali" nella sezione "Popolari in questo periodo" costruivano una lista di piante nell'`onClick` e non facevano nulla con essa — bottoni cliccabili senza effetto, stesso pattern del bug Vigneto gia' visto in sessioni precedenti. Le due liste (gia' scritte, non dati finti: sono gli stessi tag statici gia' usati nel fallback invernale esistente) sono state promosse a costanti di modulo (`SUMMER_POPULAR_PLANTS`, `WINTER_POPULAR_PLANTS`); aggiunto uno stato `popularPlantsSeasonOverride` che i due bottoni impostano/togglano (click di nuovo = torna ai suggerimenti automatici) e che la prop `plants` di `PopularPlantsTags` ora rispetta con priorita' sui suggerimenti stagionali automatici.
- **Verifiche:** type-check verde; `test:release` 228/228; build produzione verde.

## Stato dopo il lotto 3

| Regola | Errori | Warning |
|---|---:|---:|
| `@typescript-eslint/no-explicit-any` | 0 | 1273 |
| `@typescript-eslint/no-unused-vars` | 0 | 1033 |
| `react-hooks/exhaustive-deps` | 0 | 174 |
| `@next/next/no-img-element` | 0 | 36 |
| **Totale** | **0** | **2516** |

## Cluster escluso da T01 (24/07/2026): sotto-sistema "AI Planner" morto

Durante la selezione del lotto 4, `services/aiPlanningService.ts` (41 `no-unused-vars`, il piu' alto dopo `costOptimizationService.ts`) ha portato alla scoperta che l'intero cluster che lo consuma e' irraggiungibile: `components/Planner.tsx` (2569 righe — incluso nel lotto 3 di questo stesso documento, fix ancora corretto ma su codice morto), `components/PlannerWithAI.tsx`, `components/ai/AIPlanningWizard.tsx`, `components/ai/PlanPreviewModal.tsx`, `components/planner/tabs/PlannerSuggestions.tsx`, `components/planner/tabs/PlannerSearch.tsx`, `components/ai/FloatingAIWidget.tsx`. Verifica esaustiva registrata in `ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`, sezione M05. **Decisione dell'utente: lasciare il cluster intatto** — nessun lint fix, nessuna rimozione in questa sessione. T01 prosegue saltando questi file.

## Prossimo lotto

Ripetere il metodo: `npm run lint -- --format json`, ordinare per file con piu' occorrenze della stessa regola, **saltare `costOptimizationService.ts` e l'intero cluster "AI Planner" sopra**, leggere il file intero prima di modificarlo, verificare grep di ogni identificatore prima di rimuoverlo — **se un parametro di funzione (non import/variabile locale) risulta inutilizzato, leggere il corpo della funzione per escludere che sia uno stub che finge di calcolare qualcosa**; **se una variabile costruita in un `onClick`/handler non e' mai letta, verificare se il controllo e' collegato a qualcosa in UI**; **se un file/componente intero e' oggetto del lotto, verificare con grep che sia davvero importato da qualche parte prima di investire tempo a ripulirlo (vedi questo cluster)** — poi type-check + `test:release` + build dopo ogni lotto.
