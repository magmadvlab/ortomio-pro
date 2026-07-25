# Ripristino pianificazione ambientale (esposizione solare + finestre di semina + successione colturale)

- **Data:** 25 luglio 2026
- **Stato:** approvato, in attesa di piano di implementazione
- **Origine:** durante T01 (debito lint), verificando 6 candidati "codice morto" a zero importer segnalati dall'utente come possibili doppioni, è emerso che l'intera catena "finestre di semina ottimali + suggerimenti di successione" era raggiungibile solo tramite `components/Dashboard.tsx`, sostituito da `components/shared/HomeDashboard.tsx` senza ereditare queste funzionalità.

## 1. Problema

L'onboarding di OrtoMio Pro (`AdvancedSunExposureWizard.tsx`, live, agganciato a `GardenOnboarding.tsx`) raccoglie dati ambientali ricchi per ogni orto: coordinate GPS, tipo di suolo, altitudine, ostacoli 3D per il calcolo dell'irraggiamento. Questi dati vengono salvati ma **non vengono mai riutilizzati da nessuna schermata dopo l'onboarding**:

- `services/plantingWindowOptimizer.ts::findPlantingWindows()` — calcola finestre di semina/trapianto ottimali usando lat/lng/suolo/altitudine/ostacoli — è chiamato solo da `logic/solarClassificationHelper.ts` (zero chiamanti a sua volta) e da una route API il cui unico consumer frontend è a sua volta morto.
- `logic/successionEngine.ts::findAllSuccessionOpportunities()` — suggerisce cosa piantare quando un'area si libera dopo un raccolto, rispettando la rotazione delle famiglie botaniche — zero chiamanti live.
- `components/sunExposure/SunExposureWidget.tsx`, `SunExposureDetailModal.tsx`, `PlantingWindowSuggestions.tsx`, `SolarClassificationBadge.tsx` — componenti UI maturi (nessun mock/TODO trovato) montati solo dentro `Dashboard.tsx`, morto.

Verificato: nessuno di questi pezzi è codice acerbo o stub. `successionEngine` usa logica agronomica reale (evita stessa famiglia botanica per rotazione, calcola stagione da `garden.coordinates.latitude`). `plantingWindowOptimizer` è client-side puro, nessuna dipendenza server oltre a quelle già usate altrove nell'app.

Trovati anche 2 bug reali nell'unica implementazione esistente (dentro `Dashboard.tsx`), da correggere durante l'estrazione, non da preservare:
1. Riga 1484: il testo del suggerimento mostra lo stesso nome pianta due volte (`{suggestion.plant.commonName} → {suggestion.plant.commonName}`) invece di "pianta rimossa → pianta suggerita".
2. Il bottone "Pianifica Successione" non fa nulla — solo `console.log`, con un commento che ammette la mancanza ("richiederebbe una callback").

## 2. Obiettivo

Ricollegare le tre capacità (esposizione solare, finestre di semina, suggerimenti di successione) alla UI live, riusando il codice esistente così com'è dove possibile, senza introdurre nuovi endpoint, nuove tabelle o nuovi round-trip server.

## 3. Decisioni prese con l'utente

- **Scope**: tutte e tre le capacità insieme, stesso lotto di lavoro (non prioritizzate separatamente).
- **Collocazione**: dentro il tab "Pianificazione" già esistente in `components/garden/GardenView.tsx` (`activeTab === 'planning'`), non nella Home né in una nuova pagina.
- **Approccio**: riuso diretto dei componenti esistenti (`SunExposureWidget`, `SolarClassificationBadge`, `PlantingWindowSuggestions`) più estrazione mirata del blocco successione da `Dashboard.tsx` in un componente dedicato, con i due bug corretti durante l'estrazione. Scartata l'alternativa di una card unificata con un solo calcolo condiviso (più pulita ma più lavoro) per restare aderenti allo stile "intervento mirato" tenuto in tutta la sessione.

## 4. Architettura

Nessuna nuova route, nessun nuovo endpoint API, nessuna nuova tabella Supabase. Tutto client-side, dentro il tab "Pianificazione" già montato con `garden: Garden` e `tasks: GardenTask[]` come prop.

```
GardenView (activeTab === 'planning')
  └── EnvironmentalPlanningSection (nuovo)
        ├── SunExposureWidget (riusato as-is)
        ├── SolarClassificationBadge (riusato as-is)
        ├── PlantingWindowSuggestions (riusato as-is)
        └── SuccessionSuggestionsPanel (nuovo, estratto da Dashboard.tsx)
```

## 5. Componenti

### Nuovi

**`components/sunExposure/EnvironmentalPlanningSection.tsx`**
- Props: `garden: Garden`, `tasks: GardenTask[]`
- Owns: `useState` per `SolarClassificationData | null`, `loading`, chiamata a `calculateGardenSolarClassification(garden)` in un `useEffect` (dipendenza: `garden.id`, coerente col pattern `useCallback` + `useEffect` usato in tutti i lotti T01 di oggi)
- Gate su `!garden.coordinates`: mostra una CTA verso Impostazioni → "Gestisci" (stesso pulsante già esistente in `GardenEditModal.tsx` per aggiungere coordinate a un orto creato senza), non un buco silenzioso
- Se la classificazione risulta `null` nonostante le coordinate ci siano (fallimento calcolo): messaggio "dati insufficienti", stesso principio già applicato al resto della dashboard nel blocco M02
- Renderizza in sequenza: `SolarClassificationBadge` (classificazione compatta), `SunExposureWidget` (ore di sole oggi, con la sua modale di dettaglio già esistente), `PlantingWindowSuggestions` (finestre semina/trapianto), `SuccessionSuggestionsPanel`

**`components/sunExposure/SuccessionSuggestionsPanel.tsx`**
- Props: `garden: Garden`, `tasks: GardenTask[]`
- Estrae `findAllSuccessionOpportunities(tasks.filter(t => t.gardenId === garden.id), garden)` in un `useMemo` (non serve `useEffect`/stato: calcolo sincrono puro, a differenza della classificazione solare che nell'originale era dietro un `useEffect` solo perché condivideva il ciclo di vita col resto di `Dashboard.tsx`)
- Fix bug 1: il testo diventa "pianta rimossa → pianta suggerita" — richiede propagare anche il nome della pianta rimossa nel tipo `SuccessionSuggestion` (oggi non c'è, va aggiunto un campo `removedPlantName: string` all'interfaccia in `logic/successionEngine.ts` e valorizzato in `checkEmptySpaceOpportunity`)
- Fix bug 2: il bottone "Pianifica Successione" diventa un `<Link href="/app/planner">`, navigazione semplice senza preselezione — verificato che `/app/planner` non supporta oggi alcun query param di preselezione pianta (solo `tab`), quindi non viene inventata una funzionalità che il planner non ha; stesso pattern del link "Apri Planner AI" già presente nello stesso tab
- Se `opportunities.length === 0`: la sezione non si renderizza affatto (non è un errore, è normale non avere spazi liberi)

### Riusati integralmente, zero modifiche al codice

`SunExposureWidget.tsx`, `SolarClassificationBadge.tsx`, `PlantingWindowSuggestions.tsx` (e transitivamente `SunExposureDetailModal.tsx`, già usato internamente da `SunExposureWidget`). Le interfacce props sono già compatibili con quanto disponibile in `GardenView` — verificato campo per campo.

## 6. Data flow

`GardenView` (ha già `garden`, `tasks`) → passa entrambi a `EnvironmentalPlanningSection` → questo chiama `calculateGardenSolarClassification(garden)` (client-side puro, già usato altrove nell'app) e passa il risultato (`classification`, `plantingWindows`, `optimizedSuggestions`) a `SolarClassificationBadge`/`PlantingWindowSuggestions`; `SunExposureWidget` fa la sua chiamata autonoma già esistente a `/api/garden/sun-exposure` (route già live, non toccata); `SuccessionSuggestionsPanel` calcola in autonomia da `tasks`+`garden`.

Nessuno stato condiviso fra i due calcoli (classificazione solare e successione) — sono indipendenti, come lo erano in `Dashboard.tsx`.

## 7. Gestione errori e stati vuoti

| Caso | Comportamento |
|---|---|
| `garden.coordinates` assente | CTA esplicita verso Impostazioni → Gestisci, non un buco silenzioso |
| Coordinate presenti ma classificazione fallisce (es. eccezione in `calculateGardenSolarClassification`) | Messaggio "dati insufficienti", loggato in console, coerente col principio M02 (mai dato simulato) |
| Zero opportunità di successione | Sezione `SuccessionSuggestionsPanel` omessa, non è un errore |
| `SunExposureWidget`: API `/api/garden/sun-exposure` fallisce | Comportamento già esistente e non toccato: fallback a `garden.dailySunHours` se disponibile |

## 8. Testing

Nessun test esistente copre oggi `successionEngine.ts`, `solarClassificationHelper.ts` o `plantingWindowOptimizer.ts` (verificato: zero file `.test.ts`/`.test.tsx` li referenziano). Aggiungere:
- Test mirato sul fix del bug 1 (testo `removedPlantName → plant.commonName`, non più duplicato)
- Test mirato sul gate coordinate mancanti in `EnvironmentalPlanningSection` (mostra CTA, non tenta il calcolo)
- Type-check, lint, suite release esistente (228+ test) — stesso standard di verifica tenuto in tutti i lotti T01 di questa sessione

**Limite dichiarato onestamente**: questo worktree non ha `.claude/launch.json` configurato, quindi non sarà possibile una verifica visiva reale in browser durante l'implementazione — verrà dichiarato esplicitamente a fine lavoro, non dato per buono senza prova.

## 9. Fuori scope (deliberatamente)

- Non si tocca `Dashboard.tsx` stesso (resta candidato O45 per l'eliminazione finale, decisione rimandata a fine sessione)
- Non si implementa una preselezione pianta nel planner (il planner non la supporta oggi, aggiungerla è una feature separata)
- Non si tocca il gap già noto e registrato di `historicalWeather` ignorato in `plantingWindowOptimizer.ts` (T01 lotto 12) — resta un gap dichiarato, non bloccante per questo ripristino
- Non si tocca `cultivationOrchestrator.ts` né gli altri item di O45
