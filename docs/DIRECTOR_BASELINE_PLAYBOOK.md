# Director Baseline Playbook (Locale)

Questo documento descrive **alla lettera** cosa è stato implementato finora per il Director “proattivo” (baseline stagionale) e come testarlo/estenderlo.

## Obiettivo

- Avere un punto di ingresso proattivo (anche senza task già esistenti) che suggerisce **cosa fare ora**.
- Rendere le azioni **tracciabili** creando `GardenTask` reali (persistiti in locale).
- Rendere la checklist:
  - **dismissabile** (non riproposta)
  - **meteo-aware** (soft)
  - estendibile verso “semi intelligenti” (scelte guidate)

## Stato attuale (implementato)

### 1) Tipi / Contratto dati

File: `types.ts`

- `DailyPlan.baselinePrompts?: DirectorPrompt[]`
- `DirectorPrompt`
  - `id`, `category`, `priority`, `title`, `body`, `options`
- `DirectorPromptOption`
  - `actionType: 'create_task' | 'dismiss'`
  - `createTask?: Omit<GardenTask, 'id'>`
  - `createTasks?: Array<Omit<GardenTask, 'id'>>` (per creare più task con un solo click)

### 2) Generazione prompt (Director)

File: `logic/director.ts`

- Il Director genera `baselinePrompts` solo per orto/misto (**non legnose**, `!isWoodyCrop`).
- Prompt attuali:
  - **Terreno bagnato: aspetta la tempera** (se pioggia prossime 48h >= 8mm)
  - **Pulizia e ripristino dell’orto** (Dic/Gen)
  - **Gestione scarti dell’orto: compost o legna?** (Dic-Mar)
    - scarti verdi → task compost/pacciamatura
    - legna/ramaglie → task gestione legna
    - materiale malato → **2 task** (smaltimento separato + disinfezione)
  - **Concimazione di fondo** (Gen/Feb)
  - **Semina indoor peperoncino** (Gen/Feb)
  - **Controllo attrezzature e irrigazione** (Feb/Mar)

#### Meteo-aware (soft)

- Si usa `getWeatherForecast7Days` e si calcola `next48hRainMm`.
- Se piove molto:
  - aggiunge prompt informativo “aspetta la tempera”
  - abbassa priorità e aggiunge nota meteo a prompt suolo (pulizia/concimazione)

### 3) Rendering + Azioni (UI)

File: `components/shared/HomeDashboard.tsx`

- La sezione **Checklist Stagionale** renderizza `dailyPlan.baselinePrompts`.
- `dismiss`:
  - viene salvato in localStorage per garden:
    - key: `ortomio_baseline_dismissed_${gardenId}`
    - value: JSON `{ [promptId]: dismissedAtIso }`
  - la UI filtra i prompt dismissati.
- `create_task`:
  - se c’è `createTasks` crea tutti i task in sequenza
  - altrimenti crea `createTask`
  - ricarica i task via `storageProvider.getTasks(activeGarden.id)`

## Come testare in locale (checklist)

1. Avvia l’app e vai in Dashboard.
2. Se sei in Dic/Gen/Feb/Mar dovresti vedere la **Checklist Stagionale**.
3. Premi:
   - “Ho materiale malato…” → verifica che vengano creati **2 task**.
   - “Più tardi” → il prompt sparisce e **non torna** ai reload.
4. Simula meteo piovoso (o attendi in base al tuo meteo reale):
   - verifica che compaia “Terreno bagnato: aspetta la tempera”
   - verifica che “Concimazione di fondo” scenda di priorità e includa note meteo.

## Regole di progettazione (da seguire)

- **Ogni prompt baseline deve essere azionabile**:
  - almeno un’opzione che crea un task tracciabile, oppure dismiss.
- **Mai perdere tracciabilità**:
  - quando l’utente dice “lo faccio”, deve diventare un `GardenTask`.
- **Meteo-aware soft**:
  - non blocchiamo, ma aggiungiamo note e abbassiamo priorità.
- **Compatibilità**:
  - usare `createTask` singolo quando basta, `createTasks` quando servono più azioni.

## Prossimi step (da implementare)

### Step A — “Semi intelligenti” (baseline)

Obiettivo: il prompt “Semine indoor” deve proporre più scelte (pomodoro/melanzana/peperone ecc.) e creare task diversi.

Linee guida:
- basarsi su `month`, `latitude`, meteo e preferenze (se presenti)
- generare 1 prompt con 4-6 opzioni
- ogni opzione crea un task `Sowing` con `locationType: 'Tray'` e note operative

### Step B — Collegare prompt ↔ task completati

Obiettivo: evitare riproposte “inutili” quando esiste già un task completato equivalente.

### Step C — Baseline per colture legnose (in futuro)

Solo quando iniziamo a gestire frutteti/oliveti/vigneti come garden dedicati.

## File coinvolti

- `types.ts`
- `logic/director.ts`
- `components/shared/HomeDashboard.tsx`

## Note

- Questo playbook è pensato per il lavoro **in locale**.
- Le migrazioni DB le gestiremo in una fase successiva.
