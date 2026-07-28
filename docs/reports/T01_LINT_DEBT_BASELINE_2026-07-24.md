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

## Lotto 19 (26/07/2026) - chiuso

`components/nutrition/TreatmentPlanner.tsx`, confermato vivo dalla route `/app/nutrition`, e' stato portato da 32 warning a zero. Il form condiviso tra trattamenti e programmazioni usa ora `Partial<NutritionTreatment>`, `Partial<NutritionSchedule>` e i soli campi UI aggiuntivi espliciti al posto di `any`; i select rispettano le union di dominio. Il loader e' stabilizzato con `useCallback`; due import morti sono rimossi.

La tipizzazione ha reso espliciti anche i default dei campi obbligatori nei payload e blocca gli update privi di ID, evitando richieste ambigue senza cambiare il percorso nominale. Verifiche: lint mirato 0/0, type-check e diff-check verdi; lint globale **0 errori e 2.099 warning** (`2.131 -> 2.099`).

## Stato dopo il lotto 19

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2099 |
| Riduzione lotto | 32 |
| Riduzione dalla baseline operativa 2642 | 543 |

## Lotto 20 (26/07/2026) - chiuso

`components/irrigation/WateringLogForm.tsx`, confermato vivo dalla route `/app/irrigation`, e' stato portato da 21 warning a zero. Rimossi import, destrutturazioni e stato inutilizzati; `FieldRow`, `WateringLog['method']` e un tipo di compatibilita' esplicito sostituiscono gli `any` usati per le varianti legacy della configurazione irrigua. I calcoli di portata, configurazione e durata sono stabilizzati con `useCallback`, chiudendo le dipendenze dei memo senza alterare le formule.

Verifiche: lint mirato 0/0, type-check e diff-check verdi; lint globale **0 errori e 2.078 warning** (`2.099 -> 2.078`).

## Stato dopo il lotto 20

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2078 |
| Riduzione lotto | 21 |
| Riduzione dalla baseline operativa 2642 | 564 |

## Lotto 21 (26/07/2026) - chiuso

`components/plants/PlantDetailModal.tsx`, confermato vivo tramite `SmartPlantManager`, e' stato portato da 20 warning a zero. I campi gia' presenti in `PlantOperation` sostituiscono i cast `any`, i tab sono tipizzati con la union locale e le foto usano `next/image`. Il loader e' stabilizzato con `useCallback`.

La tipizzazione ha inoltre corretto un difetto reale: `getFieldRowOperations` veniva chiamato con il solo `fieldRowId`, mentre il contratto richiede anche `gardenId`; l'errore poteva essere assorbito dal `catch` e nascondere le operazioni del filare. La chiamata ora passa entrambi gli identificativi. Verifiche: lint mirato 0/0, type-check e diff-check verdi; lint globale **0 errori e 2.058 warning** (`2.078 -> 2.058`).

## Stato dopo il lotto 21

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2058 |
| Riduzione lotto | 20 |
| Riduzione dalla baseline operativa 2642 | 584 |

## Lotto 22 (26/07/2026) - chiuso

`components/vineyard/VineManager.tsx`, confermato vivo dalla route `/app/vineyard`, e' stato portato da 14 warning a zero. Import e helper morti sono stati rimossi; operazioni vite e badge sorgente usano `PlantOperation`; i loader e i filtri sono stabilizzati con `useCallback`.

La registrazione rapida ora usa i campi ufficiali `durationMinutes`, `contextSnapshot` e `weatherConditions` del servizio unificato. Durata e sottotipo restano anche nelle note leggibili, evitando il precedente oggetto `operationDetails` non previsto dal contratto persistito e i relativi cast.

Durante la selezione `components/garden/ListView.tsx` e' stato nuovamente confermato senza importer ed e' rimasto intatto come candidato codice morto; `components/orchard/TreeManager.tsx` e' vivo ma i 18 warning residui coinvolgono il contratto storico condiviso `operationContext`, quindi non sono stati mascherati con cast e restano rinviati a un intervento dedicato.

Verifiche: lint mirato 0/0, type-check e diff-check verdi; lint globale **0 errori e 2.044 warning** (`2.058 -> 2.044`).

## Stato dopo il lotto 22

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2044 |
| Riduzione lotto | 14 |
| Riduzione dalla baseline operativa 2642 | 598 |

## Lotto 23 (26/07/2026) - chiuso

`components/plants/SmartPlantManager.tsx`, confermato vivo nelle route Piante, Frutteto, Oliveto e Vigneto, e' stato portato da 13 warning a zero. Mapping pianta-filare e statistiche di sincronizzazione usano i tipi reali; i loader e i filtri sono stabilizzati con `useCallback`; gli errori sono trattati come `unknown`.

L'analisi ha chiuso anche due difetti visibili: “Aggiorna Salute” impostava uno stato per un modal mai renderizzato e ora apre il `BulkOperationModal` gia' implementato con tipo `health`; “Operazione Unificata” apriva invece un percorso duplicato che non eseguiva operazioni e mostrava soltanto “Funzionalita' in sviluppo”, quindi il falso comando e il relativo codice morto sono stati rimossi. Il test `smartPlantActions.test.ts` impedisce la regressione di entrambi i casi.

Verifiche: lint mirato 0/0, type-check e diff-check verdi; capability test 18/18; lint globale **0 errori e 2.031 warning** (`2.044 -> 2.031`).

## Stato dopo il lotto 23

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2031 |
| Riduzione lotto | 13 |
| Riduzione dalla baseline operativa 2642 | 611 |

## Lotto 24 (26/07/2026) - chiuso

`components/actions/InterventionWizard.tsx`, vivo in `NDVIDashboard` e `IntegratedSmartHub`, e `services/interventionService.ts` sono stati portati rispettivamente da 11 e 2 warning a zero. I parametri del wizard e le righe database hanno ora tipi espliciti; gli event handler usano gli eventi React corretti e gli import morti sono stati rimossi.

La rimozione del cast nel submit ha scoperto due difetti reali. Lo spread del form parziale poteva sovrascrivere con `undefined` i default obbligatori appena costruiti; ora i campi obbligatori vengono risolti dopo lo spread. Inoltre il service inviava a Supabase i campi camelCase dell'app insieme alle colonne snake_case: la tabella non possiede colonne come `scheduledDate` o `sourceContext`, quindi create/update potevano fallire. I builder `buildInterventionInsert` e `buildInterventionUpdate` producono ora solo il contratto SQL canonico e hanno test dedicati.

Verifiche: lint mirato 0/0, type-check e diff-check verdi; suite persistenza 64/64; lint globale **0 errori e 2.018 warning** (`2.031 -> 2.018`).

## Stato dopo il lotto 24

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2018 |
| Riduzione lotto | 13 |
| Riduzione dalla baseline operativa 2642 | 624 |

## Lotto 25 (26/07/2026) - chiuso

`services/weatherService.ts` e `services/weatherProviderAdapter.ts`, entrambi vivi e condivisi da dashboard, cron e motori agronomici, sono stati portati rispettivamente da 12 e 4 warning a zero. Le risposte Open-Meteo, OpenWeatherMap, WeatherAPI e custom hanno ora contratti espliciti; il forecast canonico conserva anche gli alias legacy necessari ai consumatori.

La tipizzazione ha chiuso due difetti reali. `activePlants` veniva passato dai widget con le temperature minime delle colture ma era ignorato: ora una minima sotto la soglia genera un'allerta mirata con colture ed evidenze. Inoltre, in caso di errore provider/geolocalizzazione, il servizio generava previsioni stagionali e valori casuali con `Math.random()`; il falso meteo e' stato eliminato e l'assenza dati produce un errore esplicito gia' gestito dai widget.

Durante la selezione `AromaticHarvest.tsx` e `WateringLogFormWithFieldRows.tsx` sono risultati senza importer e sono rimasti intatti. Nelle pagine Nutrizione e Lavorazioni Meccaniche sono emersi wizard interni mai renderizzati oppure alimentati soltanto da array locali vuoti: sono stati esclusi dal lotto e registrati come pulizia funzionale/codice morto, senza mascherarli come lint.

Verifiche: lint mirato 0/0, type-check e diff-check verdi; test meteo 13/13; lint globale **0 errori e 2.002 warning** (`2.018 -> 2.002`).

## Stato dopo il lotto 25

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 2002 |
| Riduzione lotto | 16 |
| Riduzione dalla baseline operativa 2642 | 640 |

## Lotto 26 (26/07/2026) - chiuso

`components/shared/HomeDashboard.tsx`, montato nella route `/app`, e' stato portato da 12 warning a zero. Filari, piante, opzioni Director e log raccolto usano i tipi reali; le dipendenze degli effect riflettono ora i valori effettivamente letti senza array di default instabili.

Il caricamento del piano giornaliero trasformava ogni errore del Director in un `DailyPlan` vuoto con priorita' bassa, facendo apparire “nessun lavoro” quando in realta' il piano non era disponibile. Ora azzera il piano, registra l'errore e mostra un alert esplicito; un test di veridicita' impedisce il ritorno del fallback vuoto.

Durante la selezione `intelligentNotificationService.ts` e' risultato importato dalla dashboard Monitoraggio ma non operativo: nessun chiamante invoca `processAlerts`, mentre la UI legge solo la mappa in memoria del singleton. E' rimasto intatto e registrato come flusso funzionale scollegato, non trattato come semplice lint.

Verifiche: lint mirato 0/0, type-check e diff-check verdi; capability test 19/19; lint globale **0 errori e 1.990 warning** (`2.002 -> 1.990`).

## Stato dopo il lotto 26

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1990 |
| Riduzione lotto | 12 |
| Riduzione dalla baseline operativa 2642 | 652 |

## Lotto 27 (28/07/2026) - chiuso

Le route vive `app/api/cron/health-check/route.ts` e `app/api/garden/sun-exposure/route.ts` sono state portate da 8 warning ciascuna a zero. Il cron salute usa tipi espliciti per i record persistiti di task, meteo e sensori. La route solare ora tratta il fallimento di lettura degli ostacoli come errore, anziche' calcolare l'esposizione con una lista vuota e sovrastimare il sole disponibile.

`services/fieldRowPredictiveService.ts`, primo candidato per volume con 35 warning dopo l'esclusione gia' decisa di `costOptimizationService.ts`, e' stato lasciato intatto: la presenza di task virtuali e predizioni di fallback richiede prima una classificazione funzionale M14, non una pulizia lint meccanica.

Verifiche: lint mirato 0/0, type-check e diff-check verdi; test mirati 16/16; lint globale **0 errori e 1.974 warning** (`1.990 -> 1.974`).

## Stato dopo il lotto 27

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1974 |
| Riduzione lotto | 16 |
| Riduzione dalla baseline operativa 2642 | 668 |

## Lotto 28 (28/07/2026) - chiuso

Sei route cron vive (`weekly-photo-reminders`, `germination-check`, `task-reminders`, `weather-alerts`, `daily-diary`, `reset-credits`) sono state portate da 11 warning complessivi a zero. Tutte usano ora `requireCron`, eliminando quattro confronti manuali che, con `CRON_SECRET` assente, potevano accettare letteralmente `Bearer undefined`. Il guard canonico aggiunge confronto timing-safe, finestra temporale e protezione replay; gli handler preservano gli status specifici di `AccessError`.

Una regressione statica copre l'intero insieme e impedisce il ritorno al confronto interpolato. Verifiche: lint mirato 0/0, type-check e diff-check verdi; test sicurezza/observability 17/17; lint globale **0 errori e 1.963 warning** (`1.974 -> 1.963`).

## Stato dopo il lotto 28

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1963 |
| Riduzione lotto | 11 |
| Riduzione dalla baseline operativa 2642 | 679 |

## Lotto 29 (28/07/2026) - chiuso

Quattro endpoint Production sono stati portati da 10 warning complessivi a zero: `auth/register`, `calendar/tasks`, `mechanical-work` e `treatments`. La pulizia ha chiuso anche difetti verificabili: la registrazione non registra piu' il body contenente la password; i due registri basati su service-role verificano l'ownership del giardino prima di leggere o inserire dati e preservano i 404 canonici; le ricorrenze calendario usano tipi espliciti.

Le route `api-configurations`, pur selezionate inizialmente per quattro warning, sono state escluse: il flusso corrente protegge le chiavi soltanto con Base64 e le restituisce decodificate al browser. Il gap e' registrato come `O48/M13` e richiede una migrazione di sicurezza dedicata.

Verifiche: lint mirato 0/0, type-check verde; test sicurezza 43/43; lint globale **0 errori e 1.953 warning** (`1.963 -> 1.953`).

## Stato dopo il lotto 29

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1953 |
| Riduzione lotto | 10 |
| Riduzione dalla baseline operativa 2642 | 689 |

## Lotto 30 (28/07/2026) - chiuso

Sette endpoint Production sono stati portati a zero warning: le tre route solari derivate, analytics professionali, ricerca/tassonomia piante e record blockchain lab-only. Le varianti solari ora falliscono esplicitamente se `garden_obstacles` non e' leggibile; prima proseguivano con `obstaclesData || []`, producendo calcoli falsamente ottimistici. La regressione copre l'intero gruppo di quattro route.

Le route AI/crediti con warning analoghi sono rimaste intatte: la quota viene aggiornata e registrata in due operazioni e alcuni handler ignorano gli errori Supabase. Vanno trattate in un lotto transazionale dedicato, non come sostituzione meccanica del tipo del catch.

Verifiche: lint mirato 0/0, type-check verde; test persistenza 65/65; lint globale **0 errori e 1.946 warning** (`1.953 -> 1.946`).

## Stato dopo il lotto 30

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1946 |
| Riduzione lotto | 7 |
| Riduzione dalla baseline operativa 2642 | 696 |

## Lotto 31 / O49 (28/07/2026) - chiuso

Le sei route vive AI/crediti selezionate nel lotto 30 sono state corrette con un intervento transazionale dedicato, eliminando 7 warning. `consume_ai_credits` aggiorna quota e ledger nella stessa RPC service-role-only; ogni handler verifica l'esito e usa il saldo restituito dalla transazione. L'endpoint generico deriva il costo dal catalogo server, anziche' fidarsi dell'importo inviato dal client. In assenza di Supabase gli endpoint credito restituiscono 503, non un saldo sintetico `999`.

Migrazione `20260728050000` applicata e registrata in Production. Probe remoto: colonne ledger `HTTP 200`; RPC negata alla chiave anon con `401/42501`. Verifiche locali: lint mirato 0/0, type-check verde, test sicurezza 48/48; lint globale **0 errori e 1.939 warning** (`1.946 -> 1.939`).

## Stato dopo il lotto 31

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1939 |
| Riduzione lotto | 7 |
| Riduzione dalla baseline operativa 2642 | 703 |

## Lotto 32 (28/07/2026) - chiuso

La route viva `app/app/advice/page.tsx` e il wizard vivo
`components/crops/CreateOrchardWizard.tsx` sono stati portati da 16 warning
complessivi a zero. La pagina Consigli usa tipi espliciti per task, analisi di
rotazione e tab, e il loader e' stabilizzato con dipendenze complete.

La rimozione degli `any` dal wizard ha reso visibile un difetto di persistenza:
le categorie UI (`DRUPACEE`, `POMACEE`, ecc.), i tipi vigneto maiuscoli e i
sistemi di allevamento (`Guyot`, `Cordon`, ecc.) venivano passati ai servizi
senza normalizzazione, mentre i contratti persistiti accettano enum differenti.
Il mapping e' ora totale ed esplicito in `orchardWizardMappings.ts`; i sistemi
non rappresentabili puntualmente sono salvati come `other`, anziche' come
valori fuori contratto. Una regressione verifica tutte le categorie frutteto e
le normalizzazioni principali del vigneto.

Verifiche: lint mirato 0/0, type-check verde, test mapping 2/2; lint globale
**0 errori e 1.923 warning** (`1.939 -> 1.923`).

## Stato dopo il lotto 32

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1923 |
| Riduzione lotto | 16 |
| Riduzione dalla baseline operativa 2642 | 719 |

## Lotto 33 / O50 (28/07/2026) - chiuso

`components/garden/AddItemModal.tsx`, `components/shared/QuickActions.tsx` e la
route viva `app/app/garden/rows/edit/page.tsx` sono stati portati da 8 warning
complessivi a zero. I tre select della configurazione filare usano ora le union
reali invece di `any`.

La selezione ha scoperto quattro azioni vive verso `/app/progress`, route
inesistente. I comandi raccolto convergono su `/app/harvest`, la variante
`?action=add` apre realmente il modal di registrazione e il riquadro traguardo
senza pagina dettaglio non e' piu' presentato come link. La regressione
capability copre i quattro consumer e il contratto della pagina Raccolti.

Verifiche: lint mirato 0/0, type-check verde, capability 20/20; lint globale
**0 errori e 1.915 warning** (`1.923 -> 1.915`).

## Stato dopo il lotto 33

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1915 |
| Riduzione lotto | 8 |
| Riduzione dalla baseline operativa 2642 | 727 |

## Lotto 34 / O51 (28/07/2026) - chiuso

La route viva `app/app/analytics/page.tsx` e' stata portata da 7 warning a
zero. Il lavoro ha rimosso KPI Business Intelligence inventati: minimi e
fallback per piante, raccolto, acqua, CO2, efficienza, risparmio, ROI e ore,
oltre a trend e metriche di produttivita' hardcoded.

Il builder puro `lib/analytics/operationalStats.ts` filtra task e raccolti
persistiti secondo il periodo selezionato. Calcola soltanto peso, completamento,
operazioni semina/trapianto e durate supportate da evidenze; le metriche senza
baseline restituiscono `null` e sono presentate come `n/d`. Due regressioni
verificano dataset vuoto e filtro temporale.

Verifiche: lint mirato 0/0, type-check verde, capability 22/22; lint globale
**0 errori e 1.908 warning** (`1.915 -> 1.908`).

## Stato dopo il lotto 34

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1908 |
| Riduzione lotto | 7 |
| Riduzione dalla baseline operativa 2642 | 734 |

## Lotto 35 / O52 (28/07/2026) - chiuso

La route viva `app/app/garden/zones/page.tsx` e il servizio
`services/landZoneService.ts` sono stati portati da 10 warning complessivi a
zero. Tipi espliciti coprono statistiche, memoria e filari; i loader React sono
stabilizzati con dipendenze complete.

La pulizia ha reso visibile il pulsante morto `Storico`: prima impostava uno
stato mai letto e non produceva alcun risultato. Ora apre un dialogo che legge
la RPC persistita `get_zone_history`, mostra i cicli colturali registrati e
distingue caricamento, errore e assenza reale di memoria del terreno. La
regressione capability impedisce il ritorno alla falsa affordance.

Verifiche: lint mirato 0/0, type-check verde, capability 23/23; lint globale
**0 errori e 1.898 warning** (`1.908 -> 1.898`).

## Stato dopo il lotto 35

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1898 |
| Riduzione lotto | 10 |
| Riduzione dalla baseline operativa 2642 | 744 |

## Lotto 36 / O53 (28/07/2026) - chiuso

La route viva `app/app/nutrition/page.tsx` e
`components/nutrition/NutritionStatsWidget.tsx` sono state portate da 13
warning complessivi a zero. Il wizard di configurazione duplicato, mai
renderizzato e gia' sostituito dal `TreatmentPlanner` persistente, e' stato
rimosso insieme ai due rami `schedule` irraggiungibili.

La scheda Bio/Tradizionale non riceve piu' array vuoti costanti: legge
`treatment_register` e `fertilizer_inventory` tramite il provider corrente. Il
calcolo puro usa i contratti persistiti `treatment_type`,
`organic_approved` e `product_type`; a dataset vuoto le percentuali sono `n/d`,
mentre un errore di lettura produce uno stato esplicito e non zeri simulati.

Verifiche: lint mirato 0/0, type-check verde, capability 25/25; lint globale
**0 errori e 1.885 warning** (`1.898 -> 1.885`).

## Stato dopo il lotto 36

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1885 |
| Riduzione lotto | 13 |
| Riduzione dalla baseline operativa 2642 | 757 |

## Lotto 37 / O54 (28/07/2026) - chiuso

La route Production `app/app/mechanical-work/page.tsx` e' stata portata da 16
warning a zero e ridotta da oltre 1.650 a circa 400 righe. Rimossi inventario
attrezzature e pianificazioni mantenuti soltanto nello stato React: loader
inizializzati sempre a `[]`, salvataggi persi al reload, pulsanti `Modifica`,
`Usa`, `Visualizza Calendario` ed `Esporta Report` senza azione.

La pagina usa ora esclusivamente `getMechanicalWorks` e
`createMechanicalWork`. Il registro distingue errori di lettura da dataset
vuoto; la selezione dell'orto e il resume da task restano operativi. Le
analytics pure espongono solo conteggio, superficie, tipi di attrezzatura
osservati e costo mensile quando `standardCost` e' davvero presente. Ore,
carburante, efficienza e trend prima fissati a zero sono stati eliminati.

Verifiche: lint mirato 0/0, type-check verde, capability 28/28; lint globale
**0 errori e 1.869 warning** (`1.885 -> 1.869`).

## Stato dopo il lotto 37

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1869 |
| Riduzione lotto | 16 |
| Riduzione dalla baseline operativa 2642 | 773 |

## Lotto 38 / O55 (28/07/2026) - chiuso

La route viva `app/app/irrigation/page.tsx` e' stata portata da 17 warning a
zero. Rimossi i KPI hardcoded `85L`, `3 zone`, `15% risparmio` e `68% umidita'`,
le tre zone campione datate 2024 e due componenti interni mai renderizzati.
Anche i tab Analytics e Programmazione, che conducevano soltanto a
“componente in sviluppo”, non sono piu' esposti.

Restano dashboard, zone, sistemi e registrazione irrigazione basati sui servizi
persistenti. Il click zona ora apre i sistemi filtrati invece di eseguire un
`console.log`; i comandi opzionali della dashboard vengono renderizzati solo
quando esiste una destinazione. I log sono tipizzati e la regressione verifica
che singolo e batch seguano una sola finalizzazione coerente.

Verifiche: lint mirato 0/0, type-check verde, capability 31/31; lint globale
**0 errori e 1.852 warning** (`1.869 -> 1.852`).

## Stato dopo il lotto 38

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1852 |
| Riduzione lotto | 17 |
| Riduzione dalla baseline operativa 2642 | 790 |

## Lotto 39 / O56 (28/07/2026) - chiuso

La route viva `app/app/orchard/page.tsx` e' stata portata da 24 warning a
zero. Gli alberi e i raggruppamenti per filare usano ora il contratto
`OrchardTree` restituito da `orchardService`, eliminando gli `any` senza
modificare letture, riallineamento, aggiornamenti o configurazione irrigua.

Rimosso anche `TropicalExoticSection`: 347 righe definite in fondo alla route
ma mai importate, invocate o renderizzate. Il blocco conteneva un catalogo
statico, KPI fissi (`24°C`, `75%`) e un modal irraggiungibile; nessuna
funzionalita' visibile e' stata sottratta. Restano intatti dashboard frutteto,
alberi, filari, piante individuali, potature, raccolte e analytics persistenti.

Verifiche: lint mirato 0/0, type-check verde, mapping frutteto/sicurezza filari
3/3, capability 31/31, build produzione 153/153; lint globale
**0 errori e 1.828 warning** (`1.852 -> 1.828`).

## Stato dopo il lotto 39

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1828 |
| Riduzione lotto | 24 |
| Riduzione dalla baseline operativa 2642 | 814 |

## Lotto 40 / O57 (28/07/2026) - chiuso

La decisione prodotto distingue i frutteti classici italiani/mediterranei da
quelli tropicali senza creare un dominio parallelo. `tropical` era gia'
ammesso dal tipo e dal vincolo database, ma il wizard principale non lo
esponeva e la categoria botanica `ESOTICHE` poteva restare persistita come
frutteto `mixed`.

Il wizard offre ora `Tropicale/Subtropicale` come sottocategoria di Frutteto:
la scelta imposta `ESOTICHE`, mentre scegliere `ESOTICHE` imposta
`orchardType=tropical`. Uscire dalla categoria esotica rimuove una
classificazione tropicale obsoleta. La dashboard mostra icona e nome dedicati;
nessun KPI o dato colturale viene inventato.

Verifiche: lint mirato 0/0, type-check verde, mapping categoria 5/5,
capability 31/31, build produzione 153/153; lint globale
**0 errori e 1.824 warning** (`1.828 -> 1.824`).

## Stato dopo il lotto 40

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1824 |
| Riduzione lotto | 4 |
| Riduzione dalla baseline operativa 2642 | 818 |

## Lotto 41 / O58 (28/07/2026) - chiuso

Il servizio vivo `services/orchardService.ts` e' stato portato da 33 warning a
zero. I mapper Supabase usano ora un contratto snake_case derivato dai tipi
dominio invece di `any`; errori schema, payload e righe bulk hanno shape
esplicite. Rimossi due import inutilizzati e il parametro analytics `period`,
che non aveva chiamanti ne' effetto sulla query.

La tipizzazione ha scoperto un difetto nel bulk del wizard: il metodo costruiva
`orchard_id`/`garden_id` e poi passava quelle righe gia' snake_case a
`bulkCreateTrees`, che accetta oggetti `OrchardTree` camelCase e li converte a
sua volta. Il nuovo builder conserva `orchardId`/`gardenId` fino al mapper,
applica soltanto default di stato dichiarati e rifiuta scope o identita'
mancanti prima di creare il frutteto, invece di inventare alberi. Se il bulk
remoto fallisce dopo l'insert della configurazione, il servizio compensa
eliminando la configurazione appena creata; un eventuale fallimento della
compensazione resta esplicito.

Verifiche: lint mirato 0/0, type-check verde, persistenza 75/75, capability
31/31, build produzione 153/153; lint globale
**0 errori e 1.791 warning** (`1.824 -> 1.791`).

## Stato dopo il lotto 41

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1791 |
| Riduzione lotto | 33 |
| Riduzione dalla baseline operativa 2642 | 851 |

## Lotto 42 / O59 (28/07/2026) - schema Production pronto

`services/saplingService.ts`, vivo nella dashboard alberelli e nel manager
Semenzaio, e' stato portato da 19 warning a zero. La tipizzazione ha confermato
che il servizio tentava tre backend concorrenti (`sapling_batches`,
`sapling_inventory` e `saplings`) e trasformava qualunque errore di lettura in
una lista vuota.

Il servizio converge ora esclusivamente sul contratto canonico
`sapling_batches`/`sapling_items`. La migrazione
`20260728070000_canonical_sapling_persistence.sql` rende atomiche creazione del
batch e degli elementi, ridimensionamento, cambio stato e registrazione della
messa a dimora; aggiorna la quantita' residua nella stessa transazione e
introduce il timeline foto protetto da RLS. Non vengono piu' generati ID
browser per fingere una registrazione assente e una quantita' residua `0` non
viene sostituita con la quantita' totale.

Il primo tentativo Production e' stato annullato integralmente perche' il
database reale, diversamente dal file storico locale, non conteneva
`sapling_items`. L'inventario remoto ha mostrato un `sapling_batches` legacy
con colonne `quantity/current_quantity/phase`. La migrazione finale estende e
backfilla quel contratto senza perdere i campi legacy, crea elementi e policy,
e mantiene sincronizzate entrambe le proiezioni durante la transizione.

Verifiche locali: lint mirato 0/0 sul servizio e sulla dashboard, type-check
verde, regressione O59 5/5 e persistenza 80/80; lint globale **0 errori e
1.768 warning** (`1.791 -> 1.768`). Migrazione `20260728070000` applicata e
registrata in Production. Probe: history/tabelle/RPC/RLS/permessi tutti
`true`, `batches_without_items=0`. O59 resta `[L]` fino al deploy del codice.

## Stato dopo il lotto 42

| Metrica | Valore |
|---|---:|
| Errori | 0 |
| Warning | 1768 |
| Riduzione lotto | 23 |
| Riduzione dalla baseline operativa 2642 | 874 |
