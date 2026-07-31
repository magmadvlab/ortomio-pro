# Design: collegare l'AnnualPlan reale a director.ts via HomeDashboard

## Contesto

`logic/director.ts::getDailyGardenPlan` accetta un 4° parametro opzionale `annualPlan?: AnnualPlan`, usato in due punti: rilevare scostamenti dal piano annuale (piantagioni previste per il mese non ancora eseguite) e suggerire successioni colturali dopo un raccolto. Nessun chiamante vivo lo valorizza mai — né `HomeDashboard.tsx` né `ProfessionalDashboard.tsx` (gli unici due chiamanti reali di `directorService.getLegacyDailyPlanBridge`) passano un 4° argomento.

## Scoperta 1 — il motore che genererebbe l'AnnualPlan produce dati quasi interamente finti

`logic/annualPlannerEngine.ts::generateAnnualPlan` non è "intelligenza spenta da ricollegare": è largamente non pronta.

- Le piantagioni (`quarters[Q].plantings`) prendono le prime 2 piante di una lista filtrata con `.slice(0, 2)`, ripetute identiche per ogni mese del trimestre.
- `harvests` e `maintenance` (dentro `QuarterPlan`) sono **sempre array vuoti** — mai popolati in nessun ramo del codice.
- `rotations` è sempre `[]` — c'è un `// TODO: Implementare logica aiuole se disponibile` mai risolto.
- `calculateProjections` usa `yieldPerPlant = 1` fisso, `avgPricePerKg = 5` fisso, `initialCosts = 100` fisso, per qualunque specie/orto.
- `suggestSuccessions` ritorna le prime 2 piante del catalogo generale per i mesi successivi, senza alcun filtro di compatibilità.

## Scoperta 2 — quei campi finti non hanno comunque consumatori vivi

Verificato con grep su tutto il repo: `harvests`, `maintenance`, `rotations`, `projections` di `AnnualPlan` sono letti **solo** da `components/AnnualPlanner.tsx`, che è già codice morto (zero importer, sostituito da `ClassicPlannerWithRotation.tsx`, che calcola le proprie proiezioni reali da `HarvestLogData` per una via completamente separata). L'unico consumatore vivo di `AnnualPlan` è `director.ts`, e legge **solo** `quarters[Q].plantings` (mese + nome pianta) e chiama `suggestSuccessions`.

Questo restringe lo scope: non serve costruire harvests/maintenance/rotations/projections per davvero — nessun consumatore vivo li guarda. Serve solo che `plantings` e `suggestSuccessions` producano scelte sensate.

## Scoperta 3 — esiste già un motore reale riusabile per le finestre di impianto

`services/plantingWindowOptimizer.ts::findPlantingWindows` calcola finestre di impianto reali (date, ore di sole, categoria Estivo/Primaverile/Autunnale/FogliaEstiva) con liste di piante consigliate reali per categoria, già usato in produzione (endpoint `POST /api/garden/sun-exposure/planting-windows`, chiamato oggi da `components/sunExposure/SunExposureDetailModal.tsx`). Il campo `PlantMasterSheet.season` che sembrerebbe la scorciatoia ovvia non è invece mai popolato per nessuna pianta nel dataset reale (verificato: 0 occorrenze) — quindi non è una via percorribile.

## Scoperta 4 — `ClassicPlannerWithRotation.tsx` non chiama mai `director.ts`

Il piano originale ipotizzava di costruire l'`AnnualPlan` dentro `ClassicPlannerWithRotation.tsx`, ma quel componente non chiama mai `directorService`/`getDailyGardenPlan` — è dedicato solo a rotazioni e proiezioni storiche. L'unico punto di aggancio reale è `HomeDashboard.tsx` (dove oggi il 4° argomento è esplicitamente `undefined`, riga ~422).

## Obiettivo

Costruire un `AnnualPlan` con piantagioni realmente sensate (derivate dalle finestre di impianto reali già calcolate altrove) e passarlo da `HomeDashboard.tsx` alla chiamata esistente di `getLegacyDailyPlanBridge`, senza inventare nuovi dati e senza toccare `director.ts`.

## Modifiche

### 1. `logic/annualPlannerEngine.ts`

- `AnnualPlan` guadagna un campo `plantingWindows: PlantingWindow[]` (tipo importato da `services/plantingWindowOptimizer.ts`).
- `generateAnnualPlan(garden, preferences?, plantingWindows?: PlantingWindow[])`: il parametro `solarClassification: GardenClassification` (usato oggi solo per il filtro con finestre mock) viene sostituito da `plantingWindows` reali, opzionali. Il valore ricevuto (o `[]` se assente) viene salvato su `AnnualPlan.plantingWindows`.
- `generateQuarterPlan` riceve `plantingWindows` e, per ogni finestra che copre mesi del trimestre (derivato da `window.startDate`/`window.endDate`), distribuisce le sue `recommendedPlants` (filtrate contro `availablePlants`, già filtrata per compatibilità suolo) sui mesi che la finestra effettivamente copre — non più lo stesso `slice(0, 2)` ripetuto identico ogni mese.
- Se `plantingWindows` è assente o vuoto (orto senza coordinate/ostacoli noti), il comportamento resta quello attuale (fallback su `availablePlants` filtrata per suolo, distribuzione best-effort) — nessuna regressione per questi orti.
- `suggestSuccessions(harvestDate, bed, currentPlan)`: firma **invariata**. Internamente, invece di prendere le prime 2 piante del catalogo generale, cerca in `currentPlan.plantingWindows` la finestra che copre il mese successivo al raccolto (`harvestMonth + 1`) e sceglie da `recommendedPlants` di quella finestra.

### 2. `services/plantingWindowOptimizer.ts`

- Nuovo helper client-side `fetchPlantingWindowsForGarden(gardenId: string, year?: number): Promise<PlantingWindow[] | null>` che effettua la stessa chiamata `POST /api/garden/sun-exposure/planting-windows` già usata in `SunExposureDetailModal.tsx` (stesso body, stessa deserializzazione delle date da stringa a `Date`), ritorna `null` se la richiesta fallisce o il giardino non ha coordinate. Centralizza il pattern di fetch già esistente per un secondo chiamante, senza modificare `SunExposureDetailModal.tsx`.

### 3. `components/shared/HomeDashboard.tsx`

- Nuovo state `plantingWindows: PlantingWindow[] | null`.
- Nuovo `useEffect`, keyed su `activeGarden?.id`, che chiama `fetchPlantingWindowsForGarden` una volta quando il giardino attivo cambia (guardia: solo se `activeGarden?.coordinates` esiste, stesso pattern già usato altrove nel repo per questa stessa chiamata).
- `annualPlan` costruito con `useMemo(() => activeGarden ? generateAnnualPlan(activeGarden, undefined, plantingWindows || undefined) : undefined, [activeGarden, plantingWindows])`, per evitare ricalcoli a ogni render.
- Il 4° argomento (oggi `undefined`, riga ~422) della chiamata esistente a `directorService.getLegacyDailyPlanBridge` diventa `annualPlan`.

### Non incluso

- `components/professional/ProfessionalDashboard.tsx` (l'altro chiamante vivo di `getLegacyDailyPlanBridge`) non viene toccato — stesso miglioramento potenzialmente applicabile in un secondo momento, non richiesto ora.
- `harvests`, `maintenance`, `rotations`, `projections` di `AnnualPlan` restano inerti (mai popolati per davvero) — nessun consumatore vivo li legge (solo `AnnualPlanner.tsx`, già morto, non toccato).
- `logic/director.ts` — nessuna modifica. Continua a chiamare `getDailyGardenPlan` e `suggestSuccessions` esattamente come oggi; ora riceve dati reali invece di `undefined`/finti.
- `calculateProjections` e `optimizeRotations` in `annualPlannerEngine.ts` — non toccati, restano con dati finti ma inutilizzati da qualunque consumatore vivo.

## Verifica

- `tsc --noEmit` pulito.
- `next build` verde.
- `test:release` verde (nessuna regressione).
- Verifica manuale (se possibile): con un giardino che ha coordinate reali, controllare che dopo il caricamento di `HomeDashboard` gli alert di scostamento/successione (se applicabili al mese corrente) riflettano piante plausibili per la stagione, non ripetizioni casuali.
