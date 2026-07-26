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

## Lotto 4 (24/07/2026, sera) - chiuso

Prima di scegliere i file: applicata la nuova regola del cluster morto — controllato con grep la raggiungibilita' di ogni candidato prima di aprirlo. Scartati senza indagare oltre: `ListView.tsx` e `AnnualPlanner.tsx` (zero importer), `VisualGardenPlanner.tsx` (importato solo dal cluster morto "AI Planner" gia' registrato). Confermati raggiungibili prima di procedere: `OrganizationManager.tsx` (da `/app/settings`) e `ActivityRegistry.tsx` (da `/app/analytics`).

- `components/settings/OrganizationManager.tsx` (11 -> 0): import morti (icone, tipo `GardenAssignment`, costante `SYSTEM_ROLES`, 3 funzioni servizio mai chiamate); prop `onRefresh` (gia' passata dal chiamante ma mai letta dentro) rimossa dalla destrutturazione di due sotto-componenti (`RolesTab`, `InvitationsTab`), tipo lasciato invariato.
- `components/garden/ActivityRegistry.tsx` (9 -> 0): 8 icone importate mai usate rimosse; prop opzionale `onTaskUpdate` mai letta rimossa dalla destrutturazione.
- **Verifiche:** type-check verde; `test:release` 228/228; build produzione verde.

## Stato dopo il lotto 4

| Regola | Errori | Warning |
|---|---:|---:|
| `@typescript-eslint/no-explicit-any` | 0 | 1273 |
| `@typescript-eslint/no-unused-vars` | 0 | 1013 |
| `react-hooks/exhaustive-deps` | 0 | 174 |
| `@next/next/no-img-element` | 0 | 36 |
| **Totale** | **0** | **2496** |

## Lotto 5 (24/07/2026, sera) - chiuso

`services/aiPredictiveEngine.ts` (13 -> 5), confermato raggiungibile da `/app/ai-predictions` prima di aprirlo.

- Import morto `Garden` rimosso.
- **Gap algoritmico reale trovato (non fake, ma incompleto):** `optimizeWaterUsage()` calcolava `et0` (evapotranspirazione) e `soilWaterCapacity`, entrambi scartati subito dopo — la formula finale usa solo fabbisogno idrico piante e precipitazioni previste, ignorando suolo ed evapotranspirazione nonostante il commento sopra la funzione elencasse entrambi come fattori considerati. Diverso dal caso `costOptimizationService.ts`: qui i numeri usati sono reali, solo la copertura è più stretta di quanto dichiarato. Rimossa la computazione morta e i due metodi privati che l'alimentavano (`calculateEvapotranspiration`, `calculateSoilWaterCapacity`, rimasti orfani), corretto il commento per non promettere piu' di quanto la formula fa; `soil` rimosso dalla firma del metodo e dal chiamante.
- `getDiseaseRules(plantId)`: `plantId` mai usato, la tabella regole malattie e' statica per ogni pianta — ma il commento nel codice lo dichiara gia' onestamente ("Simplified disease rules - in production, this would be ML models"), quindi non e' stato trattato come i casi precedenti. Parametro rimosso, chiamata aggiornata.
- `analyzeWeatherFactors`/`analyzeRiskFactors`: parametro `rule: any` mai usato in nessuna delle due, rimosso da firme e chiamata.
- `calculateYieldFactors`/`calculateQualityScore`: `tasks`/`factors` mai usati nei rispettivi corpi, rimossi da firme e chiamate. **Errore intercettato dal type-check**: la prima rimozione aveva tolto l'argomento dalla chiamata ma non dalla firma della funzione (arieta' 5 vs 4) — `tsc --noEmit` l'ha bloccato subito, corretto prima di procedere.
- **Non toccato deliberatamente:** `optimizeLaborSchedule`/`optimizeEnergyUsage` (righe 824-834) restituiscono `null` con commento esplicito "Not implemented in this version" — stub onesti, non fake data. I loro parametri (`tasks`, `weather`, `plants`) restano non rimossi per documentare quali dati servira' l'implementazione futura; il file chiude quindi a 5 warning residui, non 0.
- **Verifiche:** type-check verde (dopo la correzione dell'arieta'); `test:release` 228/228; build produzione verde.

## Stato dopo il lotto 5

| Regola | Errori | Warning |
|---|---:|---:|
| `@typescript-eslint/no-explicit-any` | 0 | 1271 |
| `@typescript-eslint/no-unused-vars` | 0 | 1005 |
| `react-hooks/exhaustive-deps` | 0 | 174 |
| `@next/next/no-img-element` | 0 | 36 |
| **Totale** | **0** | **2486** |

## Lotto 6 (24/07/2026, sera) - chiuso

`components/GardenOnboarding.tsx` (11 -> 1), confermato raggiungibile (usato da `GardenTypeWizard.tsx`, `OrchardWizard.tsx`, `GardenEditModal.tsx`, `consumer/Dashboard.tsx`, `OnboardingBanner.tsx`).

Trovati **due** gap funzionali reali in questo file, non solo lint:

1. **Calibrazione bussola calcolata e mai usata** (`offset` in `analyzePanoramicPhotoWithOffset`): `handlePanoramicPhotoChange` costruisce un offset Nord tramite 3 fallback (orientamento dispositivo, EXIF, calibratore manuale a bussola), poi chiama `analyzePanoramicPhotoWithOffset(file, offset)` che riceve il parametro ma non lo usa mai — passa solo la foto a `analyzePanoramic360(base64)`, la cui firma (`services/photoAnalysisService.ts:297`) non accetta nemmeno un offset. **Lasciato intenzionalmente non toccato** (una sola delle due opzioni proposte e' stata scelta dall'utente) — resta 1 warning residuo (`offset`, riga ~544) e va registrato come debito da decidere.
2. **Wizard "input visivo" mai collegato**: `VisualSunInput` (componente) e `convertVisualInputToSunHours` (utility) erano importati ma mai usati in JSX; gli state `visualSunInput`/`useVisualInput`/`estimatedHoursFromVisual` venivano letti in `handleComplete` ma i loro setter non erano mai chiamati — un utente nuovo non poteva mai attivare questa modalita'. **Sistemato su richiesta esplicita dell'utente**: aggiunto un toggle "Semplice"/"Avanzata" nello Step 6 (Microclima) che alterna tra il nuovo `<VisualSunInput>` (con `onChange` che aggiorna `visualSunInput` e ricalcola `estimatedHoursFromVisual` via `convertVisualInputToSunHours`) e il preesistente `<AdvancedSunExposureWizard>`. Nessuna verifica visiva in browser eseguita (nessun `launch.json` in questo worktree, wizard a 6 step con autenticazione reale necessaria per raggiungere lo step 6) — solo type-check, lint, `test:release` e build.
- Rimossi anche 3 import morti (`getCurrentPositionWithRetry`, `convertToSqMeters`, `ProFeatureGate`) e 2 getter di stato morti con setter vivo (`noonPhoto`, `horizonPhoto`, ridotti a solo setter — il flusso di analisi foto usa gia' la variabile locale `file`, non rilegge questi state).
- **Verifiche:** type-check verde; `test:release` 228/228; build produzione verde. **UI non verificata dal vivo — dichiarato esplicitamente, non assunto.**

## Stato dopo il lotto 6

| Regola | Errori | Warning |
|---|---:|---:|
| `@typescript-eslint/no-explicit-any` | 0 | 1271 |
| `@typescript-eslint/no-unused-vars` | 0 | 995 |
| `react-hooks/exhaustive-deps` | 0 | 174 |
| `@next/next/no-img-element` | 0 | 36 |
| **Totale** | **0** | **2476** |

## Lotti 7-13

I dettagli e le decisioni dei lotti 7-13 sono registrati nella voce canonica `T01` del piano master. La sequenza verificata e' stata: 2476 -> 2453 -> 2429 -> 2413 -> 2386 -> 2344 -> 2329 -> 2298. Il cluster AI Planner morto e `costOptimizationService.ts` restano esclusi dalla pulizia meccanica per le decisioni gia' documentate.

## Lotto 14 (26/07/2026) - chiuso

Quattro file vivi sono stati verificati prima della modifica e portati complessivamente da 31 warning a zero:

- `components/irrigation/IrrigationZoneManager.tsx` 10 -> 0: import morti rimossi, loader stabilizzato con `useCallback`, cast `any` sostituiti con le union di `ZoneFormData`;
- `components/nutrition/ProductManager.tsx` 9 -> 0: import e setter filtri morti rimossi, loader stabilizzato, form tipizzato esplicitamente;
- `components/plants/BulkOperationModal.tsx` 7 -> 0: import e variabile locale morti rimossi, tipo operazione preservato senza cast, preview foto migrata a `next/image`;
- `components/seedling/SeedlingDashboard.tsx` 5 -> 0: import e prop destrutturata mai usati rimossi, payload costruito senza binding ignorato.

La branch di completamento era ferma prima dei lotti T01 gia' confluiti in `main`: prima della misura finale e' stata riallineata a `origin/main`, evitando una baseline falsa. Verifiche: lint mirato 0/0, type-check verde, lint globale reale **0 errori e 2.267 warning**.

## Stato dopo il lotto 14

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2267 |
| Riduzione lotto | 31 |
| Riduzione dalla baseline operativa 2642 | 375 |

## Prossimo lotto

Ripetere il metodo, saltando `costOptimizationService.ts`, il cluster AI Planner e O45 come gia' deciso; verificare sempre la raggiungibilita' dei candidati prima di modificarli.

## Lotto 15 (26/07/2026) - chiuso

Tre componenti vivi, tutti raggiungibili da flussi applicativi, sono stati portati complessivamente da 30 warning a zero:

- `components/fertilizer/FertilizerApplicationModal.tsx` 10 -> 0: callback di caricamento stabilizzate, import morto rimosso, cast `any` eliminati; il dosaggio ora usa `areaSqMeters` del letto selezionato e la fase viene limitata ai valori ammessi dal log di fertilizzazione;
- `components/harvest/QuickHarvestForm.tsx` 10 -> 0: provider, select e opzioni qualita' tipizzati, import morti rimossi, anteprima foto migrata a `next/image`;
- `components/nutrition/InventoryManager.tsx` 10 -> 0: callback di caricamento stabilizzata, import morti rimossi, stati stock/scadenza e tipo movimento tipizzati.

Verifiche: lint mirato 0/0, type-check verde, lint globale reale **0 errori e 2.237 warning**.

## Stato dopo il lotto 15

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2237 |
| Riduzione lotto | 30 |
| Riduzione dalla baseline operativa 2642 | 405 |

## Lotto 16 (26/07/2026) - chiuso

Due componenti vivi sono stati portati complessivamente da 22 warning a zero:

- `components/health/HealthAlertSystem.tsx` 11 -> 0: provider irrigazione/trattamenti usato tramite il contratto tipizzato, conversioni data rese esplicite, builder stabilizzati con `useCallback`; rimossi gli stati `alerts` e `loading`, che venivano scritti ma mai letti in questo componente non visuale;
- `components/diary/DiaryPlannerIntegration.tsx` 11 -> 0: `Garden`, `GardenTask`, `DiaryEvent` e `DiaryAnalytics` sostituiscono i cast generici, aggregazione problemi tipizzata, caricamento stabilizzato e import morti rimossi.

Verifiche: lint mirato 0/0, type-check verde, lint globale reale **0 errori e 2.215 warning**.

## Stato dopo il lotto 16

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2215 |
| Riduzione lotto | 22 |
| Riduzione dalla baseline operativa 2642 | 427 |

## Lotto 17 (26/07/2026) - chiuso

`components/advice/CropRotationPlanner.tsx`, vivo nelle route Planner e Consigli, e' stato portato da 10 warning a zero: import morti rimossi, righe e zone tipizzate con `FieldRow`, loader stabilizzati con `useCallback` e dipendenze degli effect rese esplicite.

`components/AnnualPlanner.tsx` e' risultato senza importer durante la selezione ed e' rimasto intatto in attesa della classificazione O45. `GardenEditModal.tsx`, vivo ma molto esteso, e' stato rinviato a un lotto dedicato per evitare una retipizzazione superficiale.

Verifiche: lint mirato 0/0, type-check verde, lint globale reale **0 errori e 2.205 warning**.

## Stato dopo il lotto 17

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2205 |
| Riduzione lotto | 10 |
| Riduzione dalla baseline operativa 2642 | 437 |

## Lotto 18 (26/07/2026) - chiuso

`components/settings/GardenEditModal.tsx`, confermato vivo dalla route `/app/settings`, e' stato portato da 9 warning a zero. Il tipo reale `FieldRow` ora sostituisce gli array e lo stato di editing `any`; le compatibilita' snake_case del provider remoto restano esplicite nel tipo locale. I select di orientamento, irrigazione e frequenza usano le rispettive union; l'import morto `Ruler` e' stato rimosso; `loadGardenStructures` e' stabilizzato con `useCallback`.

Prima della modifica, la baseline corrente di `origin/main` e' stata rimisurata con lo stesso comando globale ed era gia' **0 errori e 2.140 warning**: la differenza rispetto ai 2.205 del lotto 17 deriva dalle PR funzionali confluite nel frattempo e non viene attribuita artificialmente a questo lotto. Dopo il lotto 18 la misura e' **0 errori e 2.131 warning** (`2.140 -> 2.131`). Lint mirato, type-check e `git diff --check` sono verdi.

## Stato dopo il lotto 18

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2131 |
| Riduzione lotto | 9 |
| Riduzione dalla baseline operativa 2642 | 511 |
