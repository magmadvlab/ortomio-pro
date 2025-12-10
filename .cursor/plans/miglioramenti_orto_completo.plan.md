# Piano di Implementazione: Miglioramenti Completi OrtoMio

## Obiettivo
Implementare funzionalità avanzate per rendere l'app un assistente agronomo completo, con focus su: lavori invernali/preparazione, consociazioni, distanze ottimizzate, fabbisogno idrico, e altre migliorie.

---

## FASE 1: Lavori Invernali e Preparazione Orto Estivo

### 1.1 Creare Engine Lavori Preparatori
**File**: `logic/winterPreparationEngine.ts` (NUOVO)
**Obiettivo**: Calcolare i lavori necessari in inverno per preparare l'orto estivo

#### Micro-step 1.1.1: Definire tipi dati
- Creare interfaccia `WinterPreparationTask`
  - `id: string`
  - `category: 'Soil' | 'Fertilization' | 'Structure' | 'Planning'`
  - `title: string`
  - `description: string`
  - `priority: 'Critical' | 'High' | 'Medium' | 'Low'`
  - `dueMonth: number` (1-12)
  - `estimatedTime: string`
  - `materials?: string[]`
  - `instructions: string[]`

#### Micro-step 1.1.2: Creare funzione principale
- Funzione `generateWinterPreparationPlan(garden: Garden, targetSeason: 'Summer' | 'Winter')`
- Parametri: giardino e stagione target
- Logica:
  - Se siamo in inverno (Dicembre-Febbraio) e target è Estate → genera lavori preparatori
  - Se siamo in estate (Giugno-Agosto) e target è Inverno → genera lavori preparatori
  - Basarsi su tipo terreno, pH, dimensioni orto

#### Micro-step 1.1.3: Logica per terreno sabbioso
- Task: "Pacciamatura e miglioramento struttura"
- Task: "Concimazione organica (compost/letame)"
- Task: "Preparazione buche per trapianti estivi"
- Calcolare quantità materiali in base a m²

#### Micro-step 1.1.4: Logica per terreno argilloso
- Task: "Lavorazione profonda (vangatura)"
- Task: "Aggiunta sabbia/ghiaia per drenaggio"
- Task: "Baulatura per orto invernale"
- Task: "Concimazione di fondo"

#### Micro-step 1.1.5: Logica per concimazione di fondo
- Calcolare quantità letame/compost necessaria
- Formula: `garden.sizeSqMeters * 2-3 kg/m²` per letame
- Formula: `garden.sizeSqMeters * 1-2 kg/m²` per compost
- Suggerire timing: Gennaio-Febbraio per orto estivo

#### Micro-step 1.1.6: Logica per preparazione strutturale
- Task: "Installazione tutori/pali" (se necessario)
- Task: "Preparazione sistema irrigazione"
- Task: "Pulizia residui colture precedenti"
- Task: "Preparazione semenzai indoor"

### 1.2 Integrare in Dashboard
**File**: `components/Dashboard.tsx`

#### Micro-step 1.2.1: Aggiungere import
- Importare `generateWinterPreparationPlan` da `logic/winterPreparationEngine.ts`

#### Micro-step 1.2.2: Aggiungere stato
- `const [winterTasks, setWinterTasks] = useState<WinterPreparationTask[]>([])`
- `const [showWinterPrep, setShowWinterPrep] = useState(false)`

#### Micro-step 1.2.3: Calcolare lavori in useEffect
- Quando cambia `activeGarden` o mese corrente
- Se siamo in inverno (Novembre-Febbraio), generare piano
- Chiamare `generateWinterPreparationPlan(activeGarden, 'Summer')`

#### Micro-step 1.2.4: Creare sezione UI
- Card "Lavori Preparatori Invernali"
- Mostrare solo se `winterTasks.length > 0`
- Lista task ordinata per priorità e mese
- Badge per categoria (Suolo, Concimazione, Struttura)
- Checkbox per marcare completati

#### Micro-step 1.2.5: Aggiungere azioni
- Bottone "Aggiungi al Diario" per ogni task
- Convertire task preparatori in `GardenTask` con tipo appropriato
- Salvare in localStorage

---

## FASE 2: Sistema Consociazioni (Companion Planting)

### 2.1 Creare Database Consociazioni
**File**: `data/companionPlanting.ts` (NUOVO)

#### Micro-step 2.1.1: Definire struttura dati
- Interfaccia `CompanionRule`
  - `plant1: string` (nome specie)
  - `plant2: string` (nome specie)
  - `relationship: 'Beneficial' | 'Neutral' | 'Harmful'`
  - `reason: string`
  - `spacingModifier?: number` (cm aggiuntivi o ridotti)

#### Micro-step 2.1.2: Popolare database base
- Pomodoro + Basilico → Beneficial
- Pomodoro + Fagioli → Beneficial
- Pomodoro + Patate → Harmful (stessa famiglia)
- Fagioli + Cipolle → Harmful
- Lattuga + Ravanelli → Beneficial
- Zucchina + Mais → Beneficial
- Carote + Cipolle → Beneficial
- Almeno 20-30 regole base

#### Micro-step 2.1.3: Aggiungere regole per famiglie
- Funzione helper: `areSameFamily(plant1, plant2)`
- Regola generica: stesse famiglia → spesso Harmful (rotazione)
- Eccezioni: alcune famiglie possono stare insieme

### 2.2 Creare Engine Consociazioni
**File**: `logic/companionPlantingEngine.ts` (NUOVO)

#### Micro-step 2.2.1: Funzione verifica compatibilità
- `checkCompanionCompatibility(plant1: PlantMasterSheet, plant2: PlantMasterSheet)`
- Cerca regola specifica nel database
- Se non trovata, usa regola famiglia
- Restituisce: `{ compatible: boolean, reason: string, spacingAdjustment?: number }`

#### Micro-step 2.2.2: Funzione suggerimenti
- `suggestCompanions(targetPlant: PlantMasterSheet, allPlants: PlantMasterSheet[])`
- Filtra piante compatibili
- Ordina per beneficio
- Restituisce top 3-5 suggerimenti

#### Micro-step 2.2.3: Funzione avvisi
- `getCompanionWarnings(task1: GardenTask, task2: GardenTask, masterData1, masterData2)`
- Verifica se due piante posizionate sono compatibili
- Genera messaggio di warning se Harmful

### 2.3 Integrare in Visual Garden Planner
**File**: `components/VisualGardenPlanner.tsx`

#### Micro-step 2.3.1: Importare engine
- Importare `checkCompanionCompatibility` e `getCompanionWarnings`

#### Micro-step 2.3.2: Estendere collision detection
- In `checkAllCollisions`, aggiungere controllo consociazioni
- Se due piante sono Harmful, aggiungere warning specifico
- Mostrare icona diversa per incompatibilità consociazioni

#### Micro-step 2.3.3: Aggiungere suggerimenti
- Quando si posiziona una pianta, mostrare suggerimenti consociazioni
- Tooltip o sidebar con "Piante consigliate vicine"
- Bottone per aggiungere automaticamente pianta consociata

### 2.4 Integrare in Planner
**File**: `components/Planner.tsx`

#### Micro-step 2.4.1: Mostrare suggerimenti consociazioni
- Quando si seleziona una pianta, mostrare card "Piante Consigliate"
- Lista di 3-5 piante compatibili con breve motivo
- Bottone per aggiungere al piano

---

## FASE 3: Calcolo Fabbisogno Idrico Specifico

### 3.1 Estendere PlantMasterSheet
**File**: `types.ts` e `data/plantMasterSheets.ts`

#### Micro-step 3.1.1: Aggiungere campo irrigazione dettagliata
- In `PlantMasterSheet`, aggiungere `irrigationDetails?: IrrigationDetails`
- Interfaccia `IrrigationDetails`:
  - `litersPerPlantPerDay: { germination: number, vegetative: number, production: number }`
  - `frequency: { germination: string, vegetative: string, production: string }`
  - `method: 'Drip' | 'Sprinkler' | 'Manual' | 'Flood'`
  - `criticalPeriods?: { phase: string, days: number[], multiplier: number }[]`

#### Micro-step 3.1.2: Popolare dati per piante principali
- Pomodoro: 2-3L/pianta/giorno in produzione
- Zucchina: 3-4L/pianta/giorno in produzione
- Lattuga: 0.5-1L/pianta/giorno
- Fagioli: 1-2L/pianta/giorno
- Almeno 10 piante principali

### 3.2 Creare Engine Calcolo Idrico
**File**: `logic/waterRequirementEngine.ts` (NUOVO)

#### Micro-step 3.2.1: Funzione calcolo per pianta
- `calculateWaterNeeds(task: GardenTask, masterData: PlantMasterSheet, garden: Garden)`
- Calcola fase corrente (germination/vegetative/production)
- Recupera `litersPerPlantPerDay` per fase
- Moltiplica per `currentQuantity` o `initialQuantity`
- Applica modificatori: terreno (sabbioso +20%), temperatura (>30°C +30%)

#### Micro-step 3.2.2: Funzione calcolo totale orto
- `calculateTotalGardenWaterNeeds(tasks: GardenTask[], garden: Garden)`
- Somma fabbisogno di tutte le piante attive
- Restituisce: `{ totalLitersPerDay: number, breakdown: Array<{plant, liters}> }`

#### Micro-step 3.2.3: Funzione suggerimenti
- `getWateringSchedule(task: GardenTask, masterData: PlantMasterSheet, weather: WeatherForecast)`
- Combina fabbisogno pianta + meteo
- Suggerisce: "Innaffia X litri ogni Y giorni"
- Considera pioggia prevista

### 3.3 Integrare in Dashboard
**File**: `components/Dashboard.tsx`

#### Micro-step 3.3.1: Aggiungere sezione "Fabbisogno Idrico"
- Card che mostra totale litri/giorno per l'orto
- Breakdown per pianta
- Confronto con capacità serbatoio (se configurato)

#### Micro-step 3.3.2: Migliorare consigli irrigazione
- Sostituire `getIrrigationAdvice` generico con calcolo specifico
- Mostrare litri esatti da dare
- Considerare piante in fase critica (fioritura, fruttificazione)

---

## FASE 4: Miglioramenti Distanze e Layout

### 4.1 Estendere gardenLayoutEngine
**File**: `logic/gardenLayoutEngine.ts`

#### Micro-step 4.1.1: Funzione calcolo capacità
- `calculateMaxPlants(masterData: PlantMasterSheet, gardenSizeSqMeters: number)`
- Calcola layout a file vs quadrato
- Restituisce: `{ maxPlants: number, layout: 'rows' | 'square', efficiency: number }`

#### Micro-step 4.1.2: Funzione layout ottimale
- `suggestOptimalLayout(masterData, gardenWidth, gardenHeight)`
- Calcola orientamento file (orizzontale/verticale)
- Restituisce diagramma testuale

#### Micro-step 4.1.3: Funzione densità ottimale
- `calculateOptimalDensity(masterData, currentQuantity, gardenSizeSqMeters)`
- Verifica se si può aumentare o diminuire
- Suggerisce quantità ottimale

#### Micro-step 4.1.4: Funzione consociazioni spacing
- `checkCompanionSpacing(plant1, plant2)`
- Verifica se distanze sono compatibili
- Suggerisce spacing modificato se necessario

### 4.2 Migliorare Visual Garden Planner
**File**: `components/VisualGardenPlanner.tsx`

#### Micro-step 4.2.1: Mostrare griglia con distanze
- Overlay griglia che mostra distanze sulla fila e tra file
- Linee guida quando si trascina una pianta
- Snap to grid opzionale

#### Micro-step 4.2.2: Mostrare capacità massima
- Info box: "Puoi mettere fino a X piante di [nome]"
- Calcolo in tempo reale mentre si aggiungono piante

#### Micro-step 4.2.3: Suggerimento layout automatico
- Bottone "Layout Ottimale" che posiziona automaticamente tutte le piante
- Rispetta distanze e consociazioni

### 4.3 Integrare in Planner
**File**: `components/Planner.tsx`

#### Micro-step 4.3.1: Mostrare info distanze
- Quando si seleziona pianta, card con:
  - Distanze (sulla fila, tra file)
  - Capacità massima nel tuo orto
  - Layout suggerito

---

## FASE 5: Resa Prevista vs Reale

### 5.1 Estendere PlantMasterSheet
**File**: `types.ts` e `data/plantMasterSheets.ts`

#### Micro-step 5.1.1: Aggiungere campo resa attesa
- `expectedYield?: { min: number, max: number, unit: 'kg' | 'g' | 'units', perPlant: boolean }`
- Es. Pomodoro: 2-5kg per pianta
- Es. Lattuga: 0.3-0.5kg per pianta

### 5.2 Creare Engine Resa
**File**: `logic/yieldEngine.ts` (NUOVO)

#### Micro-step 5.2.1: Funzione calcolo resa prevista
- `calculateExpectedYield(task: GardenTask, masterData: PlantMasterSheet)`
- Usa `expectedYield` da master sheet
- Moltiplica per numero piante
- Restituisce range min-max

#### Micro-step 5.2.2: Funzione confronto
- `compareYield(expected: {min, max}, actual: number)`
- Calcola percentuale rispetto al range
- Restituisce: `{ percentage: number, status: 'Below' | 'Average' | 'Above', message: string }`

### 5.3 Integrare in HarvestLog
**File**: `components/HarvestLog.tsx`

#### Micro-step 5.3.1: Mostrare resa prevista
- Per ogni coltura, mostrare range previsto
- Confronto con resa reale
- Grafico o indicatore visivo

---

## FASE 6: Export/Backup Dati

### 6.1 Creare servizio export
**File**: `services/exportService.ts` (NUOVO)

#### Micro-step 6.1.1: Funzione export JSON
- `exportGardenData(gardens, tasks, devices)`
- Crea oggetto con tutti i dati
- Converte in JSON
- Trigger download file

#### Micro-step 6.1.2: Funzione export CSV
- `exportHarvestsToCSV(tasks)`
- Crea CSV con raccolti
- Colonne: Data, Pianta, Quantità, Unità, Qualità

#### Micro-step 6.1.3: Funzione import
- `importGardenData(jsonString)`
- Valida struttura
- Merge o replace dati esistenti
- Backup automatico prima di import

### 6.2 Integrare in Dashboard
**File**: `components/Dashboard.tsx`

#### Micro-step 6.2.1: Aggiungere menu export
- Bottone "Esporta Dati" in settings
- Dropdown: JSON completo, CSV raccolti, Solo statistiche

#### Micro-step 6.2.2: Aggiungere import
- Bottone "Importa Dati"
- File picker
- Preview dati prima di import
- Conferma con warning

---

## FASE 7: Database Malattie Avanzato

### 7.1 Creare database malattie
**File**: `data/diseasesDatabase.ts` (NUOVO)

#### Micro-step 7.1.1: Interfaccia malattia
- `PlantDisease`
  - `id: string`
  - `name: string`
  - `scientificName?: string`
  - `affectedPlants: string[]` (nomi specie)
  - `symptoms: string[]`
  - `causes: string[]`
  - `prevention: string[]`
  - `treatment: { organic: string[], chemical: string[] }`
  - `seasonRisk: { Spring: number, Summer: number, Autumn: number, Winter: number }`
  - `images?: string[]` (URL o base64)

#### Micro-step 7.1.2: Popolare database
- Oidio (mal bianco) - Cucurbitacee, Solanacee
- Peronospora - Solanacee
- Afidi - Tutte
- Cimici - Solanacee
- Cavolaia - Brassicacee
- Almeno 15-20 malattie comuni

### 7.2 Estendere healthEngine
**File**: `logic/healthEngine.ts`

#### Micro-step 7.2.1: Funzione rischio stagionale
- `calculateSeasonalDiseaseRisk(plant: PlantMasterSheet, season: string)`
- Cerca malattie nel database per quella pianta
- Calcola rischio in base a `seasonRisk`
- Restituisce top 3 malattie a rischio

#### Micro-step 7.2.2: Integrare in calculateHealthStrategy
- Aggiungere controllo rischio stagionale
- Se rischio alto, suggerire trattamento preventivo specifico

---

## FASE 8: Calcolo Fabbisogno Nutrienti Stagionale

### 8.1 Estendere nutrientEngine
**File**: `logic/nutrientEngine.ts`

#### Micro-step 8.1.1: Funzione piano stagionale
- `generateSeasonalFertilizationPlan(tasks: GardenTask[], garden: Garden, season: 'Summer' | 'Winter')`
- Raggruppa tutte le piante attive
- Calcola fabbisogno NPK totale
- Genera timeline concimazioni

#### Micro-step 8.1.2: Funzione lista acquisti
- `generateFertilizerShoppingList(plan: FertilizationPlan)`
- Raggruppa per tipo concime
- Calcola quantità totale necessaria
- Restituisce lista: "Compost: 50kg, Sangue di bue: 5kg, etc."

### 8.2 Integrare in Dashboard
**File**: `components/Dashboard.tsx`

#### Micro-step 8.2.1: Sezione "Piano Concimazione Stagionale"
- Card che mostra piano completo
- Timeline con date
- Lista acquisti concimi

---

## FASE 9: Miglioramenti UI/UX

### 9.1 Notifiche visive migliorate
**File**: `components/Dashboard.tsx` e `components/Journal.tsx`

#### Micro-step 9.1.1: Sistema toast migliorato
- Toast stack (più notifiche sovrapposte)
- Auto-dismiss con timer
- Categorie: Info, Success, Warning, Error

### 9.2 Statistiche avanzate
**File**: `components/HarvestLog.tsx`

#### Micro-step 9.2.1: Grafici resa
- Grafico a barre: resa per mese
- Grafico a linee: trend stagionale
- Confronto anno su anno (se dati disponibili)

---

## File da Creare (Nuovi)

1. `logic/winterPreparationEngine.ts` - Lavori invernali
2. `data/companionPlanting.ts` - Database consociazioni
3. `logic/companionPlantingEngine.ts` - Engine consociazioni
4. `logic/waterRequirementEngine.ts` - Calcolo idrico
5. `logic/yieldEngine.ts` - Resa prevista
6. `services/exportService.ts` - Export/import
7. `data/diseasesDatabase.ts` - Database malattie

## File da Modificare

1. `types.ts` - Estendere interfacce
2. `data/plantMasterSheets.ts` - Aggiungere dati irrigazione e resa
3. `components/Dashboard.tsx` - Lavori invernali, fabbisogno idrico, piano concimazione
4. `components/Planner.tsx` - Info distanze, consociazioni
5. `components/VisualGardenPlanner.tsx` - Consociazioni, layout ottimale
6. `components/HarvestLog.tsx` - Resa prevista, grafici
7. `logic/gardenLayoutEngine.ts` - Funzioni distanze avanzate
8. `logic/healthEngine.ts` - Rischio malattie stagionale
9. `logic/nutrientEngine.ts` - Piano stagionale

## Priorità di Implementazione

**Alta Priorità:**
1. Lavori Invernali (Fase 1) - Funzionalità mancante critica
2. Consociazioni (Fase 2) - Evita errori comuni
3. Fabbisogno Idrico (Fase 3) - Utilità pratica immediata

**Media Priorità:**
4. Distanze Ottimizzate (Fase 4) - Migliora Visual Planner
5. Resa Prevista (Fase 5) - Analisi performance
6. Export/Backup (Fase 6) - Sicurezza dati

**Bassa Priorità:**
7. Database Malattie (Fase 7) - Miglioramento incrementale
8. Piano Nutrienti Stagionale (Fase 8) - Nice to have
9. UI/UX (Fase 9) - Polish finale

## Note Tecniche

- Tutte le nuove funzionalità devono essere retrocompatibili
- I dati mancanti devono avere fallback sensati
- Le funzioni devono gestire edge cases (orto vuoto, dati mancanti, etc.)
- Performance: calcoli pesanti devono essere memoizzati o lazy-loaded
- UI: tutte le nuove sezioni devono essere responsive

