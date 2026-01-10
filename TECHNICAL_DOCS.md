# 🔧 Documentazione Tecnica OrtoMio

<!-- markdownlint-disable MD022 MD032 MD031 MD029 -->
<!-- MD022: Headings senza righe vuote sono accettabili in documentazione tecnica -->
<!-- MD032: Liste senza righe vuote sono accettabili per compattezza -->
<!-- MD031: Code blocks senza righe vuote sono accettabili -->
<!-- MD029: Numerazione liste inconsistente è accettabile per esempi -->

## Indice

1. [Architettura](#architettura)
2. [Stack Tecnologico](#stack-tecnologico)
3. [Struttura Progetto](#struttura-progetto)
4. [Moduli Principali](#moduli-principali)
5. [Data Models](#data-models)
6. [API e Integrazioni](#api-e-integrazioni)
7. [Configurazione](#configurazione)
8. [Deployment](#deployment)
9. [Estensibilità](#estensibilità)

**Nuove Funzionalità**:

- [FERTILIZZER ENGINE](#fertilizerenginets): Prodotti fertilizzanti concreti con dosaggi
- [TILLAGE ENGINE](#tillageenginets): Lavorazioni terra con timing "terreno in tempera"
- [PHYTO ENGINE](#phytoenginets): Prodotti fitofarmaci con timing critico e registro
- [GEOGRAPHIC MATCHING SERVICE](#geographicmatchingservicets): Matching geografico e calcolo fattibilità piante esotiche
- [FUZZY SEARCH SERVICE](#fuzzysearchservicets): Ricerca intelligente con aliases e normalizzazione
- [VITE E OLIVO TOP-LEVEL](#vite-e-olivo-top-level): Sezioni dedicate con wizard migliorati

---

## Architettura

OrtoMio è un'applicazione **Single Page Application (SPA)** costruita con React e TypeScript. L'architettura segue un pattern **component-based** con separazione tra:

- **Components**: UI e logica di presentazione
- **Services**: Integrazioni esterne (AI, meteo, geolocalizzazione)
- **Logic**: Motori di calcolo e business logic
- **Data**: Dati statici e configurazioni
- **Types**: Definizioni TypeScript condivise

### Pattern di Dati

- **State Management**: React useState/useEffect (no Redux)
- **Persistence**: LocalStorage per dati utente
- **API Calls**: Async/await con error handling
- **Data Flow**: Props drilling da App.tsx ai componenti

---

## Stack Tecnologico

### Frontend

- **React 19.2.1**: Framework UI
- **TypeScript 5.8.2**: Type safety
- **Tailwind CSS 3.4.17**: Styling utility-first
- **Vite 6.2.0**: Build tool e dev server
- **Lucide React**: Icone

### AI e Servizi Esterni

- **Google Gemini 2.5 Flash**: AI per suggerimenti e analisi
- **Open-Meteo API**: Previsioni meteo gratuite
- **Browser Geolocation API**: Posizione utente

### Build e Tooling

- **PostCSS**: Processing CSS
- **Autoprefixer**: Compatibilità browser
- **TypeScript Compiler**: Type checking

---

## Struttura Progetto

```text
ortomio-main/
├── components/          # Componenti React
│   ├── Dashboard.tsx    # Home principale
│   ├── Planner.tsx      # Pianificazione semine
│   ├── Journal.tsx      # Diario attività
│   ├── Advice.tsx       # Diagnosi e cura
│   ├── HarvestLog.tsx   # Raccolti e statistiche
│   ├── SmartHub.tsx     # Sensori IoT
│   ├── Navigation.tsx   # Barra navigazione
│   ├── RecipeCard.tsx   # Card ricetta
│   ├── SeedInventory.tsx # Banca semi
│   ├── VacationMode.tsx # Modalità vacanza
│   ├── VisualGardenPlanner.tsx # Planner grafico
│   ├── planner/         # Componenti Planner
│   │   ├── GeographicFeasibilityCard.tsx # Card fattibilità geografica
│   │   ├── VarietySelector.tsx # Selettore varietà
│   │   ├── CultivationSystemSelector.tsx # Selettore sistema coltivazione
│   │   └── AccessoriesSuggestionsSection.tsx # Suggerimenti accessori
│   ├── plants/          # Sistema Tracking Piante Individuali
│   │   ├── SmartPlantManager.tsx # Gestione intelligente piante
│   │   ├── FieldPlantManager.tsx # Configuratore campi automatico
│   │   ├── BulkOperationModal.tsx # Operazioni di massa
│   │   └── PlantHealthHeatmap.tsx # Heatmap salute piante
│   └── shared/          # Componenti condivisi
│       ├── GeographicMatchingWidget.tsx # Widget matching geografico
│       └── SpecializedCropsWidget.tsx # Widget colture specializzate
│
├── logic/               # Motori di calcolo
│   ├── lifecycleEngine.ts      # Fasi crescita
│   ├── nutrientEngine.ts        # Calcolo NPK
│   ├── fertilizerEngine.ts      # Prodotti fertilizzanti concreti
│   ├── healthEngine.ts          # Trattamenti
│   ├── phytoEngine.ts           # Prodotti fitofarmaci concreti
│   ├── tillageEngine.ts         # Lavorazioni terra
│   ├── waterRequirementEngine.ts # Fabbisogno idrico
│   ├── companionPlantingEngine.ts # Consociazioni
│   ├── successionEngine.ts      # Successioni
│   ├── winterPreparationEngine.ts # Lavori invernali
│   ├── vacationEngine.ts        # Piano vacanza
│   ├── lunarCalendar.ts         # Fasi lunari
│   └── gardenLayoutEngine.ts    # Layout orto
│
├── services/            # Servizi esterni
│   ├── geminiService.ts         # Integrazione AI
│   ├── weatherService.ts        # API meteo
│   ├── geolocationService.ts    # GPS
│   ├── plantMasterService.ts    # Database piante
│   ├── plantDatabaseService.ts  # Ricerca piante
│   ├── recipeService.ts         # Ricette AI
│   ├── seedInventoryService.ts  # Gestione semi
│   ├── sunExposureService.ts    # Calcolo esposizione
│   ├── preciseSunCalculator.ts   # Calcolo preciso posizione sole
│   ├── obstacleExtractor.ts     # Estrazione ostacoli da foto 360°
│   ├── fertilizerInventoryService.ts # Inventario fertilizzanti
│   ├── compostService.ts        # Autoproduzione compost
│   ├── phytoInventoryService.ts # Inventario fitofarmaci
│   ├── treatmentRegistryService.ts # Registro trattamenti
│   ├── maceratesService.ts      # Preparati naturali
│   ├── taskCalculationService.ts # Calcoli attività
│   ├── geographicMatchingService.ts # Matching geografico e fattibilità
│   ├── individualPlantService.ts # Calcoli piante individuali
│   └── plantOperationsService.ts # Operazioni su piante individuali
│
├── data/                # Dati statici
│   ├── plantMasterSheets.ts     # Schede master piante (con visualCategory)
│   ├── exoticFruitMasterSheets.ts # Schede frutti esotici con varietà e matching
│   ├── specializedCropMasterSheets.ts # Schede colture specializzate
│   ├── plantVarieties.ts        # Varietà
│   ├── treatments.ts            # Prodotti fitosanitari
│   ├── fertilizers.ts           # Database prodotti fertilizzanti
│   ├── phytoproducts.ts         # Database prodotti fitofarmaci
│   ├── tillageTools.ts          # Database attrezzi lavorazione
│   ├── companionPlanting.ts     # Regole consociazioni
│   ├── bioPrices.ts             # Prezzi bio
│   └── varietyMappings.ts       # Mappature varietà
│
├── types.ts             # Definizioni TypeScript principali
├── types/               # Tipi specializzati
│   ├── exoticFruit.ts   # Tipi frutti esotici (ExoticFruitCrop, ExoticFruitVariety, FeasibilityResult)
│   ├── strawberry.ts    # Tipi fragole
│   ├── fruitTree.ts     # Tipi alberi da frutto
│   ├── aromatic.ts      # Tipi erbe aromatiche
│   ├── olive.ts         # Tipi olivi
│   ├── vine.ts          # Tipi viti
│   ├── accessories.ts   # Tipi accessori giardino
│   └── individualPlant.ts # Tipi tracking piante individuali
├── App.tsx              # Componente root
├── index.tsx            # Entry point
├── index.html           # HTML template
├── index.css            # Stili Tailwind
├── vite.config.ts       # Configurazione Vite
├── tailwind.config.js   # Configurazione Tailwind
├── postcss.config.js    # Configurazione PostCSS
└── package.json         # Dipendenze
```

---

## Moduli Principali

### Logic Engines

#### lifecycleEngine.ts
**Responsabilità**: Determina fase crescita e fornisce consigli

**Funzioni principali**:
- `checkLifecycleStatus()`: Determina fase corrente (Sowing, Germination, Nursing, Transplanting, Production)
- `getLifecycleAdvice()`: Genera consigli basati su fase e giorni attivi
- `checkPhotoReminder()`: Suggerisce foto ogni 15 giorni

**Input**: GardenTask, PlantMasterSheet
**Output**: LifecycleAdvice con fase, messaggio, azioni suggerite

#### nutrientEngine.ts
**Responsabilità**: Calcola fabbisogno NPK dinamico

**Funzioni principali**:
- `calculateNutrientNeeds()`: Calcola fabbisogno basato su categoria pianta, fase fenologica, tipo terreno

**Logica**:
- **Categoria** × **Fase** = Elemento focus (N/P/K)
- **Tipo terreno** = Modificatore dosaggio
- **Esempio**: Pomodoro (FRUITING) in fase Reproductive → Focus Potassio

**Output**: NutrientAdvice con elemento, dosaggio, note

#### healthEngine.ts
**Responsabilità**: Suggerisce trattamenti preventivi e curativi

**Funzioni principali**:
- `calculateHealthStrategy()`: Determina strategia basata su famiglia botanica, stagione, età
- `calculateNextTreatmentDate()`: Calcola prossima data trattamento

**Prodotti supportati**:
- Zeolite Micronizzata (preventivo)
- Olio di Neem (repellente)
- Propoli Agricola (rinforzante)
- Macerato di Ortica (repellente + azoto)
- Sapone Molle Potassico (curativo)

#### waterRequirementEngine.ts
**Responsabilità**: Calcola fabbisogno idrico specifico

**Funzioni principali**:
- `calculateWaterNeeds()`: Per singola pianta in base a fase
- `calculateTotalGardenWaterNeeds()`: Totale per tutto l'orto

**Calcolo**:
- Fase × Tipo pianta × Condizioni meteo = Litri/giorno
- Breakdown per pianta e totale

#### companionPlantingEngine.ts
**Responsabilità**: Gestisce consociazioni tra piante

**Funzioni principali**:
- `suggestCompanions()`: Trova piante compatibili/incompatibili
- `checkCompatibility()`: Verifica relazione tra due piante

**Regole**:
- Beneficial: Piante che si aiutano
- Neutral: Nessun effetto
- Harmful: Piante da evitare vicine

#### successionEngine.ts
**Responsabilità**: Suggerisce successioni colturali

**Funzioni principali**:
- `findAllSuccessionOpportunities()`: Trova spazi disponibili
- `suggestNextCrop()`: Suggerisce cosa piantare dopo

**Logica**:
- Evita stessa famiglia nello stesso punto
- Considera tempi di crescita
- Ottimizza spazio e tempo

#### winterPreparationEngine.ts
**Responsabilità**: Genera piano lavori invernali

**Funzioni principali**:
- `generateWinterPreparationPlan()`: Crea piano strutturato

**Categorie**:
- Soil: Pulizia, lavorazioni
- Fertilization: Concimazione fondo
- Structure: Preparazione tutori, irrigazione
- Planning: Semine indoor, acquisto semi

#### vacationEngine.ts
**Responsabilità**: Genera piano sopravvivenza vacanza

**Funzioni principali**:
- `generateVacationPlan()`: Crea task pre-partenza
- `hasUpcomingVacation()`: Verifica vacanza programmata

**Task generati**:
- Raccolti urgenti
- Irrigazione programmata
- Protezioni (ombreggiature)
- Preparazioni suolo

#### lunarCalendar.ts
**Responsabilità**: Calcola fasi lunari

**Funzioni principali**:
- `calculateMoonPhase()`: Calcola fase corrente
- `isIdealPhaseFor()`: Verifica se fase è ideale per attività
- `getMoonPhaseName()`: Nome fase in italiano

**Fasi**:
- New (Nuova)
- WaxingCrescent (Crescente)
- FirstQuarter (Primo Quarto)
- WaxingGibbous (Gibbosa Crescente)
- Full (Piena)
- WaningGibbous (Gibbosa Calante)
- LastQuarter (Ultimo Quarto)
- WaningCrescent (Calante)

#### gardenLayoutEngine.ts
**Responsabilità**: Gestisce layout grafico orto

**Funzioni principali**:
- `parseSpacing()`: Parsa stringa distanze (es. "40cm x 60cm")
- `calculateFootprint()`: Calcola spazio occupato
- `checkCollision()`: Verifica sovrapposizioni
- `suggestRotation()`: Suggerisce rotazione
- `suggestInitialPosition()`: Suggerisce posizione iniziale

#### mechanicalWorkEngine.ts
**Responsabilità**: Suggerimenti lavorazioni meccaniche per terreni più grandi (> 1000 m²)

**Funzioni principali**:
- `calculateMechanicalWorkTasks()`: Calcola suggerimenti per aratura e fresatura

**Logica**:
- Dimensione terreno: Suggerisce trattore per terreni >= 5000 m², manuale per 1000-5000 m²
- Stagione: Aratura (Ottobre-Febbraio), Fresatura (Marzo-Aprile)
- Condizioni meteo: Verifica previsioni pioggia per evitare lavorazioni con terreno bagnato
- Task completati: Non suggerisce lavorazioni già eseguite

**Output**: Array di `MechanicalWorkAdvice` con data suggerita, priorità, istruzioni

#### treePruningEngine.ts
**Responsabilità**: Suggerimenti potatura alberi da frutto (inclusi agrumi)

**Funzioni principali**:
- `calculateTreePruningTasks()`: Calcola suggerimenti per potatura

**Logica**:
- Tipo albero: Pome, Stone, Citrus, Nut, Berry
- Stagione: Inverno (potatura principale), Primavera (agrumi), Estate (potatura verde)
- Fasi lunari: Preferisce luna calante
- Supporto agrumi: Logica specifica (potatura primaverile invece che invernale)

**Output**: Array di `TreePruningAdvice` con tipo albero, stagione, consiglio lunare

#### calendarTimelineEngine.ts
**Responsabilità**: Genera timeline automatica delle fasi successive quando viene completata una semina

**Funzioni principali**:
- `generateTimelineFromSowing()`: Genera tutti i task suggeriti dalla semina
- `convertToGardenTask()`: Converte suggerimento in task completo

**Logica**:
- Calcola giorni per ogni fase (germinazione, nursing, hardening, trapianto)
- Genera concimazioni periodiche (ogni 20-30 giorni)
- Genera trattamenti preventivi (ogni 15 giorni)
- Calcola raccolta prevista basata su giorni dalla semina
- Integra fasi lunari per ottimizzare date trapianto

**Output**: `CalendarTimeline` con array di `SuggestedCalendarTask` tutti con `isSuggested: true`

#### taskSynchronizer.ts
**Responsabilità**: Sincronizza suggerimenti dell'orchestrator con completamenti reali

**Funzioni principali**:
- `syncTaskCompletion()`: Sincronizza task completato, traccia differenza data suggerita vs effettiva
- `markSuggestionAsCompleted()`: Marca suggerimento completato, crea task con data effettiva se diversa
- `getPendingSuggestions()`: Restituisce suggerimenti non ancora completati
- `updateOrchestratorFromCompletion()`: Determina se ricalcolare suggerimenti usando data effettiva
- `isSuggestionStillValid()`: Verifica se suggerimento è ancora valido (non scaduto)

**Logica critica**:
- Quando un lavoro viene fatto in data diversa da quella suggerita, usa la data effettiva per ricalcolare i prossimi suggerimenti
- Mantiene traccia sia della data suggerita originale che di quella effettiva

#### director.ts (Orchestratore Centrale)
**Responsabilità**: Coordina tutti i motori di calcolo per generare un piano giornaliero ottimizzato

**Gerarchia Priorità**:
1. **Clima** (incontrollabile, blocca operazioni): Gelo, caldo estremo, pioggia intensa
2. **Classificazione Solare** (coordinamento variabili): Classifica tipo orto, valida compatibilità piante, ottimizza finestre impianto
3. **Ciclo Vitale** (cosa fare): Fasi crescita, trapianti, raccolte
4. **Nutrienti** (come farlo): NPK dinamico, fertirrigazione
5. **Salute** (prevenzione): Trattamenti preventivi filtrati per patentino/preferenze utente
6. **Luna** (ottimizzazione tradizionale): Fasi lunari ottimali

**Funzioni principali**:
- `getDailyGardenPlan()`: Genera piano giornaliero completo coordinando tutti i sistemi
- `checkWeatherUrgency()`: Verifica urgenze climatiche
- Integrazione classificazione solare: Valida compatibilità piante esistenti e suggerisce alternative
- Filtro prodotti fitosanitari: Passa UserProfile a `calculateHealthStrategy()` per filtrare prodotti in base a patentino e preferenze

**Soil and Altitude Utilities** (`utils/soilTemperatureUtils.ts`, `utils/altitudeUtils.ts`):
**Responsabilità**: Calcoli per tipo terreno e altitudine che influenzano timing e compatibilità

**Funzioni principali**:
- `calculateSoilWarmingDelay()`: Calcola anticipo/ritardo riscaldamento suolo per tipo terreno
  - Terreni scuri (Clay, Peaty): anticipo 3-7 giorni
  - Terreni chiari (Sandy, Chalky): ritardo 3-7 giorni
- `calculateSoilHeatingRate()`: Calcola temperatura effettiva suolo basata su tipo terreno
- `isSoilReadyForPlanting()`: Verifica se terreno è pronto per semina/trapianto
- `getSoilCompatibility()`: Verifica compatibilità pianta con tipo terreno
- `calculateEffectiveTemperature()`: Calcola temperatura effettiva considerando altitudine (-0.6°C ogni 100m)
- `adjustSeasonalWindows()`: Ritarda finestre stagionali in base ad altitudine
- `calculateAltitudePlantingDelay()`: Calcola ritardo impianto considerando altitudine e tipo pianta

**Integrazione**:
- Director applica aggiustamenti terreno/altitudine alle finestre di impianto
- Lifecycle Engine valida compatibilità terreno e controlla temperatura suolo
- Planting Window Optimizer aggiusta date start/end per terreno e altitudine
- Seasonal Plant Suggestions filtra piante per compatibilità terreno e aggiusta date
- Annual Planner filtra piante e aggiusta date piantagioni previste

**Solar Classification Integration**:
- Calcola classificazione solare stagionale (4 finestre: Feb-Mar, Apr-Mag, Giu-Lug, Ago-Set)
- Classifica tipo orto: Estivo (≥6h sole Giu-Lug), Non Estivo (<6h ma ≥3-4h Mar-Apr), Misto
- Valida compatibilità piante esistenti con tipo orto e genera alert se incompatibili
- Ottimizza timing lifecycle tasks basandosi su finestre di impianto ottimali
- Integra con Annual Planner per filtrare piante suggerite in base al tipo di orto

#### solarClassificationHelper.ts
**Responsabilità**: Helper functions per classificazione solare stagionale

**Funzioni principali**:
- `calculateGardenSolarClassification()`: Calcola classificazione solare completa per un giardino
- `validatePlantCompatibility()`: Verifica se una pianta è compatibile con il tipo di orto
- `getOptimizedPlantSuggestions()`: Ottiene suggerimenti piante ottimizzati per il tipo di orto

**Logica Validazione**:
- Piante estive (Pomodoro, Peperone, ecc.) richiedono orto estivo (≥6h sole Giu-Lug)
- Piante primaverili/autunnali (Lattuga, Spinaci, ecc.) preferiscono orto non estivo
- Genera alert con alternative se pianta non compatibile

#### fertilizerEngine.ts
**Responsabilità**: Converte fabbisogni nutrizionali (da Nutrient Engine) in prodotti fertilizzanti concreti con dosaggi specifici

**Funzioni principali**:
- `calculateFertilizerDosage()`: Calcola dosaggio specifico prodotto per pianta
- `suggestFertilizerProduct()`: Suggerisce prodotto migliore in base a fabbisogno
- `checkIncompatibilities()`: Verifica incompatibilità tra prodotti
- `calculateApplicationTiming()`: Calcola timing ottimale applicazione
- `suggestFertilizerPlan()`: Piano fertilizzazione annuale

**Logica dosaggi**:
- Considera tipo terreno (argilloso trattiene più, sabbioso perde)
- Considera pH terreno (alcuni prodotti non funzionano a pH sbagliato)
- Considera fase pianta (pre-impianto vs copertura vs post-raccolta)
- Calcola quantità totale necessaria per stagione

**Database prodotti**: `data/fertilizers.ts` con organici, minerali, correttivi, microelementi, sovesci

#### tillageEngine.ts
**Responsabilità**: Gestisce tutte le lavorazioni terra: principali, complementari, no-dig

**Funzioni principali**:
- `suggestTillageWork()`: Suggerisce lavorazione per zona
- `calculateTemperaTiming()`: Calcola quando terreno sarà "in tempera"
- `getOptimalWorkWindow()`: Finestra ottimale lavorazione
- `suggestTillageMethod()`: Suggerisce metodo lavorazione (manuale/meccanico)
- `checkTillageProblems()`: Rileva problemi (suola, compattazione)

**Lavorazioni supportate**:
- Principali: Vangatura, Aratura, Fresatura, Scasso
- Complementari: Zappatura, Sarchiatura, Rincalzatura, Erpicatura, Rullatura
- No-dig: Pacciamatura permanente, Cartone+compost

**Timing logica**:
- Integra con `soilTimingEngine.ts` per "terreno in tempera"
- Alert quando terreno diventa lavorabile dopo pioggia
- Evita lavorazioni con terreno bagnato o ghiacciato

**Database attrezzi**: `data/tillageTools.ts` con manuali e meccanici

#### phytoEngine.ts
**Responsabilità**: Converte diagnosi problemi (da Health Engine) in prodotti fitofarmaci concreti con dosaggi e timing critico

**Funzioni principali**:
- `suggestPhytoProduct()`: Suggerisce prodotto in base a problema
- `calculateDosage()`: Calcola dosaggio specifico per gravità problema
- `checkTreatmentTiming()`: Verifica timing critico con raccolta e meteo
- `calculateSafetyInterval()`: Calcola fine periodo carenza
- `checkIncompatibilities()`: Verifica incompatibilità prodotti
- `suggestTreatmentPlan()`: Piano trattamento completo

**Timing critico**:
- Preventivo vs curativo
- Finestra meteo (no pioggia 6-12h dopo)
- Alert dilavamento se piove dopo trattamento
- Considera raccolta imminente vs tempo carenza

**Database prodotti**: `data/phytoproducts.ts` con bio, convenzionali, trappole

### Services

#### geminiService.ts
**Responsabilità**: Integrazione con Google Gemini AI

**Funzioni principali**:
- `getSeasonalSuggestions()`: Suggerimenti stagionali
- `getSpecificPlantDetails()`: Dettagli pianta specifica
- `getTreatmentAdvice()`: Consigli trattamenti
- `diagnosePlantHealth()`: Diagnosi da descrizione
- `analyzePlantImage()`: Analisi foto
- `checkHarvestReadiness()`: Verifica maturazione (Brix)
- `analyzeSensorData()`: Analisi dati sensori

**Configurazione**:
- Model: `gemini-2.5-flash`
- System Instructions: Personalizzate per contesto
- Response Schema: Strutturato per parsing

#### weatherService.ts
**Responsabilità**: Integrazione Open-Meteo API

**Funzioni principali**:
- `getWeatherForecast()`: Previsioni per coordinate
- `checkTransplantConditions()`: Verifica condizioni trapianto
- `checkCriticalWeatherAlerts()`: Allarmi (gelate, caldo, pioggia)

**API**: Open-Meteo (gratuita, no API key)

#### geolocationService.ts
**Responsabilità**: Gestione posizione GPS

**Funzioni principali**:
- `getCurrentPositionWithRetry()`: Ottiene posizione con retry
- `getDefaultCoordinates()`: Coordinate default (Italia centrale)

**Fallback**: Coordinate default se GPS non disponibile

#### geoClimateService.ts
**Responsabilità**: Inferenza informazioni geoclimatiche da coordinate

**Funzioni principali**:
- `inferGeoClimate()`: Inferisce altitudine, ritardo semina, temperatura da coordinate
- `getAltitudeFromOpenElevation()`: Helper per fallback API Open-Elevation

**Metodo**:
- Prima scelta: Gemini AI per inferenza intelligente
- Fallback: Open-Elevation API (gratuita) per altitudine precisa
- Cache: Risultati cachati per 24h per coordinate

**Validazione**: Range altitudine 0-5000m per Italia, coordinate validate per Italia

#### geographicMatchingService.ts
**Responsabilità**: Calcolo fattibilità geografica per piante esotiche e matching zona climatica

**Funzioni principali**:
- `calculateFeasibility()`: Calcola score fattibilità (0-100) per pianta esotica basato su posizione utente
- `detectUsdaZone()`: Auto-detect zona USDA da coordinate geografiche
- `estimateUsdaZone()`: Stima zona USDA da latitudine e altitudine
- `getLocalClimateData()`: Ottiene dati climatici locali (date gelate, temperature medie, precipitazioni)
- `getUserLocationProfile()`: Crea profilo completo posizione utente con zona USDA e dati climatici

**Algoritmo Fattibilità**:
- Score iniziale: 100
- Penalità zona USDA: -40 se non compatibile, -20 se borderline
- Penalità altitudine: -30 se supera limite massimo
- Penalità distanza mare: -15 se pianta beneficia mare ma troppo lontana
- Determina sistema consigliato: openField / container / greenhouse
- Suggerisce varietà migliore basata su cold hardiness e container-friendly

**Zone USDA**:
- Mapping zone 7a-11 per Italia
- Calcolo basato su latitudine e altitudine
- Fallback a coordinate default se GPS non disponibile

**Componenti UI**:
- `GeographicFeasibilityCard`: Mostra score, protezioni necessarie, warnings
- `VarietySelector`: Selettore varietà con filtri clima/vaso/nane
- `CultivationSystemSelector`: Selettore sistema coltivazione (piena terra/vaso/serra)
- `GeographicMatchingWidget`: Widget dashboard con piante ideali/opportunità/warnings

#### sunExposureService.ts
**Responsabilità**: Calcolo esposizione solare con supporto ostacoli 3D

**Funzioni principali**:
- `calculateSunExposure()`: Calcola esposizione con ostacoli opzionali e data specifica
- `getGardenSunExposure()`: Ottiene esposizione per giardino
- `getGardenOptimalPeriod()`: Calcola periodo ottimale per coltivare

**Metodo**:
- Se ostacoli presenti: usa `preciseSunCalculator` per calcolo preciso
- Altrimenti: usa stima stagionale basata su latitudine (backward compatibility)

#### preciseSunCalculator.ts
**Responsabilità**: Calcolo preciso posizione sole e ore di sole diretto giorno-per-giorno

**Funzioni principali**:
- `calculateSunPosition()`: Calcola azimut ed elevazione sole per data/ora
- `calculateDailySunHours()`: Calcola ore sole per un giorno considerando ostacoli
- `calculateMonthlySunHours()`: Calcola media mensile
- `calculateOptimalPeriod()`: Trova periodo migliore dell'anno

**Formule**:
- Declinazione solare: `23.45 * sin(360 * (284 + dayOfYear) / 365)`
- Elevazione: `asin(sin(lat) * sin(decl) + cos(lat) * cos(decl) * cos(hourAngle))`
- Verifica blocco: confronta elevazione sole con `atan2(height, distance)` dell'ostacolo

**Performance**: Calcola ogni 10 minuti (6:00-18:00) = 72 calcoli per giorno

#### obstacleExtractor.ts
**Responsabilità**: Estrazione ostacoli 3D da foto 360° o input manuale

**Funzioni principali**:
- `extractObstaclesFrom360()`: Estrae ostacoli da foto panoramica usando AI
- `parseObstaclesFromManualInput()`: Crea ostacolo da input manuale
- `mergeNearbyObstacles()`: Combina ostacoli vicini nella stessa direzione
- `formatObstacleDescription()`: Formatta per visualizzazione

**Metodo**:
- Usa `analyzePanoramic360()` per identificare ostacoli con AI
- Stima altezza basata su tipo e categoria (Low/Medium/High)
- Stima distanza basata su altezza e dimensione apparente

#### plantMasterService.ts
**Responsabilità**: Accesso database piante

**Funzioni principali**:
- `getMasterSheet()`: Scheda master per pianta
- `getAllMasterSheets()`: Tutte le schede

**Dati**: `data/plantMasterSheets.ts` con schede complete

#### fertilizerInventoryService.ts
**Responsabilità**: Gestisce inventario prodotti fertilizzanti, scorte, alert

**Funzioni principali**:
- `getFertilizerInventory()`: Recupera inventario
- `addFertilizerProduct()`: Aggiunge prodotto
- `updateFertilizerQuantity()`: Aggiorna quantità
- `checkLowStock()`: Verifica scorte basse
- `getFertilizerAlerts()`: Alert scorte insufficienti

**Alert logica**:
- Verifica scorte vs necessità stagione
- Alert se prodotto necessario ma scorte < 20% necessità
- Suggerisce acquisto con timing

#### compostService.ts
**Responsabilità**: Gestisce autoproduzione compost: tradizionale, lombrico, bokashi

**Funzioni principali**:
- `calculateCNRatio()`: Calcola rapporto C/N materiali
- `suggestCompostMaterials()`: Suggerisce materiali per rapporto C/N ottimale
- `estimateMaturityDate()`: Stima data maturazione compost
- `getCompostInstructions()`: Istruzioni per tipo compost
- `trackCompostProduction()`: Traccia produzione compost

**Tipi compost**:
- Compost tradizionale (rapporto C/N 25-30:1)
- Lombricompost (più ricco, rapporto C/N 15-20:1)
- Bokashi (fermentazione anaerobica, più veloce)

#### phytoInventoryService.ts
**Responsabilità**: Gestisce inventario prodotti fitofarmaci, scorte, scadenze

**Funzioni principali**:
- `getPhytoInventory()`: Recupera inventario
- `addPhytoProduct()`: Aggiunge prodotto
- `checkExpiryAlerts()`: Alert prodotti in scadenza
- `checkLowStock()`: Verifica scorte basse
- `getRequiredProducts()`: Prodotti necessari per trattamenti pianificati

#### treatmentRegistryService.ts
**Responsabilità**: Registro trattamenti fitosanitari per professionisti (obbligatorio)

**Funzioni principali**:
- `registerTreatment()`: Registra trattamento
- `getTreatmentHistory()`: Storico trattamenti
- `checkSafetyInterval()`: Verifica se ancora in carenza
- `getActiveSafetyIntervals()`: Trattamenti ancora in periodo carenza
- `exportRegistry()`: Esporta registro (PDF, CSV)

**Struttura registro**:
- Data trattamento
- Prodotto e dosaggio
- Pianta trattata
- Condizioni meteo
- Fine periodo carenza

#### maceratesService.ts
**Responsabilità**: Gestisce preparati naturali: macerati, decotti, infusi

**Funzioni principali**:
- `getMacerateRecipe()`: Ricetta macerato (ortica, aglio, equiseto, tanaceto)
- `calculatePreparationTime()`: Tempo preparazione
- `getDosageAndApplication()`: Dosaggio e modalità applicazione
- `getStorageInstructions()`: Come conservare
- `trackMacerateProduction()`: Traccia produzione

**Macerati supportati**:
- Macerato ortica: Azoto + repellente afidi
- Macerato aglio: Fungicida leggero
- Decotto equiseto: Silicio, anticrittogamico
- Infuso tanaceto: Repellente insetti

#### recipeService.ts
**Responsabilità**: Generazione ricette AI

**Funzioni principali**:
- `getRecipesForHarvest()`: Genera ricette per raccolto

**Schema ricetta**:
- Nome
- Ingredienti (array)
- Istruzioni (array)

### Utils

#### areaConverter.ts
**Responsabilità**: Conversione unità di misura superficie

**Funzioni principali**:
- `convertToSqMeters()`: Converte da qualsiasi unità a metri quadri (per calcoli interni)
- `convertFromSqMeters()`: Converte da metri quadri a unità target (per display)
- `formatArea()`: Formatta valore con unità per visualizzazione (formato italiano)
- `getRecommendedUnit()`: Suggerisce unità più appropriata in base alla dimensione

**Unità supportate**: m² (sqm), are, ettari (hectare)
**Conversioni**: 1 are = 100 m², 1 ettaro = 10.000 m² = 100 are
- Porzioni (opzionale)
- Tempo preparazione (opzionale)

**Fallback**: Ricette predefinite se AI non disponibile

---

## Data Models

### Garden
```typescript
interface Garden {
  id: string;
  name: string;
  coordinates?: GeoLocation;
  sizeSqMeters: number;
  soilType?: 'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty';
  soilPh?: number;
  sunExposure?: 'FullSun' | 'PartSun' | 'Shade';
  dailySunHours?: number;
  aspectDirection?: 'North' | 'South' | 'East' | 'West' | 'Flat';
  obstacles?: Array<{
    azimuth: number;        // 0-360°
    height: number;         // metri
    distance: number;       // metri
    widthDegrees: number;  // gradi
    type?: 'Building' | 'Tree' | 'Mountain' | 'Other';
  }>;
  vacationMode?: VacationPlan;
  createdAt: string;
}
```

### GardenTask
```typescript
interface GardenTask {
  id: string;
  gardenId: string;
  plantName: string;
  variety?: string;
  taskType: 'Sowing' | 'Transplant' | 'Harvest' | 'Treatment' | 'Other';
  plantingMethod?: 'Seed' | 'Seedling';
  date: string;
  completed: boolean;
  season?: 'Summer' | 'Winter';
  locationType?: 'Pot' | 'Ground' | 'RaisedBed';
  quantity?: number;
  notes?: string;
  images?: string[];
  harvestHistory?: HarvestLogData[];
  finalHarvest?: HarvestLogData;
  lifecycleState?: LifecyclePhase;
  userResponses?: Record<string, boolean>;
  // ... altri campi
}
```

### PlantMasterSheet
```typescript
interface PlantMasterSheet {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  nutrientCategory: 'LEAFY' | 'FRUITING' | 'ROOT' | 'LEGUME' | 'GENERIC';
  germination: {
    // ... campi standard
    alternativeMethod?: { // Metodo alternativo (es. Scottex per Solanacee)
      name: string;
      description: string;
      instructions: string[];
      advantages?: string[];
    };
    moldPrevention?: string; // Istruzioni prevenzione muffa
  };
  seedlingCare: {
    // ... campi standard
    wateringTiming?: string; // Quando innaffiare (es. "fine giornata per evitare effetto lente")
    soilCare?: string; // Cura terreno (es. "smuovi con forchetta quando secco")
    commonIssues?: {
      trappedCotyledons?: { // Cotiledoni imprigionati
        problem: string;
        solution: string;
        prevention?: string;
      };
    };
  };
  transplanting: { /* ... */ };
  baseInstructions: {
    // ... campi standard
    growthNotes?: string[]; // Note crescita (es. forma a Y, potatura)
    seedExtraction?: { // Estrazione semi
      instructions: string[];
      drying?: {
        method: string;
        steps: string[];
      };
    };
  };
  susceptibility: { /* ... */ };
  irrigationDetails?: IrrigationDetails;
  
  // NEW: Visual category for UI filtering
  visualCategory?: 'Orto' | 'Frutteto' | 'Vigneto' | 'Uliveto' | 
                   'Agrumeto' | 'PiccoliFrutti' | 'Aromatiche' | 
                   'Ornamentali' | 'Cereali' | 'Leguminose' | 
                   'Industriali' | 'Foraggere' | 'Forestali' | 'Esotici';
  
  // NEW: AI metadata for intelligent suggestions
  aiMetadata?: {
    harvestedOrgan?: 'Leaf' | 'Fruit' | 'Root' | 'Bulb' | 'Flower' | 'Seed' | 'Stem';
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    compatibleSystems?: Array<'Soil' | 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'Indoor'>;
    lifecycle?: 'Annual' | 'Biennial' | 'Perennial';
    climateNeeds?: { /* ... */ };
    timeline?: { /* ... */ };
    rotation?: { /* ... */ };
    companionships?: { /* ... */ };
  };
  
  // ... altri campi
}
```

**Note**: I nuovi campi opzionali (`alternativeMethod`, `moldPrevention`, `wateringTiming`, `soilCare`, `commonIssues`, `growthNotes`, `seedExtraction`) sono stati aggiunti per supportare guide di coltivazione dettagliate replicate tra famiglie botaniche simili (es. Solanacee). Vedi [Replicabilità Informazioni Piante](docs/REPLICABILITA_INFORMAZIONI_PIANTE.md) per dettagli.

### ExoticFruitCrop (extends PlantMasterSheet)
```typescript
interface ExoticFruitCrop extends PlantMasterSheet {
  cropType: 'ExoticFruit';
  fruitType: 'Tropical' | 'Subtropical' | 'MediterraneanExotic';
  
  // Varieties available
  varieties?: ExoticFruitVariety[];
  
  // Universal climate compatibility
  climateCompatibility?: {
    usdaZones: number[];
    optimalUsdaZones: number[];
    tempMinSurvival: number;
    tempMinGrowth: number;
    tempOptimal: { min: number; max: number };
    tempMax: number;
    maxAltitudeMeters?: number;
    benefitsFromSea?: boolean;
    seaDistanceKm?: number;
  };
  
  // Cultivation systems
  cultivationSystems?: {
    openField: { possible: boolean; requires: { /* ... */ }; };
    container: { possible: boolean; minSizeLiters?: number; /* ... */ };
    greenhouse: { required: boolean; type: 'Cold' | 'Warm' | 'Tropical'; /* ... */ };
  };
  
  // Runtime calculated feasibility result
  feasibilityResult?: FeasibilityResult;
}
```

### ExoticFruitVariety
```typescript
interface ExoticFruitVariety {
  id: string;
  name: string;
  coldHardiness: number; // °C minimum survival
  heatTolerance: number; // °C maximum tolerance
  containerFriendly: boolean;
  dwarf?: boolean;
  maturityYears: number;
  harvestMonths: number[];
  bestUsdaZones: number[];
  notes?: string;
}
```

### FeasibilityResult
```typescript
interface FeasibilityResult {
  feasibility: 'Ideal' | 'Possible' | 'Difficult' | 'NotRecommended';
  score: number; // 0-100
  requiredProtections: string[];
  recommendedVariety?: string;
  recommendedSystem: 'openField' | 'container' | 'greenhouse';
  warnings: string[];
  personalizedTimeline?: {
    sowingDate?: string;
    transplantDate?: string;
    harvestStart?: string;
    harvestEnd?: string;
  };
}
```

Vedi `types.ts` e `types/exoticFruit.ts` per tutte le definizioni complete.

---

## API e Integrazioni

### Google Gemini AI

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

**Autenticazione**: API Key via header `x-goog-api-key`

**Uso**:
- Suggerimenti stagionali
- Dettagli piante specifiche
- Diagnosi problemi
- Analisi foto
- Generazione ricette
- Analisi sensori

**Configurazione**:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### Open-Meteo API

**Endpoint**: `https://api.open-meteo.com/v1/forecast`

**Parametri**:
- `latitude`, `longitude`: Coordinate
- `current`: Dati correnti
- `daily`: Previsioni giornaliere
- `temperature_2m`: Temperatura
- `precipitation`: Pioggia

**Gratuita**: No API key required

### Browser APIs

**Geolocation API**:
```typescript
navigator.geolocation.getCurrentPosition()
```

**LocalStorage API**:
```typescript
localStorage.setItem('ortoGardens', JSON.stringify(gardens))
localStorage.getItem('ortoGardens')
```

---

## Configurazione

### File di Configurazione

#### vite.config.ts
```typescript
export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } }
})
```

#### tailwind.config.js
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: { extend: {} },
  plugins: [],
}
```

#### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Variabili d'Ambiente

Crea file `.env` nella root:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

**Importante**: Prefisso `VITE_` è obbligatorio per esporre variabili al frontend.

---

## Deployment

### Build Produzione

```bash
npm run build
```

Output in `dist/`:
- `index.html`
- `assets/index-*.js` (bundle JavaScript)
- `assets/index-*.css` (bundle CSS)

### Vercel

1. Collega repository GitHub
2. Vercel rileva automaticamente:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Configura Environment Variables:
   - `VITE_GEMINI_API_KEY`
4. Deploy automatico su push

### Altri Hosting

Qualsiasi hosting statico supporta:
- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

**Nota**: Assicurati che le variabili d'ambiente siano configurate correttamente.

---

## Fuzzy Search Service

### Panoramica

Il servizio di ricerca fuzzy (`services/fuzzySearchService.ts`) implementa una pipeline completa di ricerca per colture con supporto per aliases, normalizzazione testo e matching intelligente.

### Architettura

**Pipeline di Ricerca:**
1. **Pre-processing**: Normalizzazione testo e generazione varianti
2. **Exact Match**: Ricerca esatta su crops e aliases
3. **Fuzzy Match**: Ricerca approssimativa con soglia dinamica
4. **Fallback**: Griglia archetipi se nessun match

### Componenti Principali

#### Text Normalizer (`utils/textNormalizer.ts`)

**Funzioni:**
- `normalizeText()`: Normalizzazione base (lowercase, rimozione accenti, punteggiatura)
- `normalizeFruitTreeName()`: Normalizzazione specifica per alberi da frutto
- `normalizeVineOliveName()`: Normalizzazione specifica per vitigni e cultivar olivo
- `similarity()`: Calcolo similarità Levenshtein
- `getFuzzyThreshold()`: Soglia dinamica basata su lunghezza query

**Esempi Normalizzazione:**
```typescript
normalizeText("Lattùga!") → "lattuga"
normalizeFruitTreeName("mela golden") → { normalized: "golden", possibleVarieties: [...] }
normalizeVineOliveName("nero d'avola") → { normalized: "nerodavola", possibleVarieties: [...] }
```

#### Aliases Database

**File:**
- `data/fruitTreeAliases.ts` - Aliases per alberi da frutto
- `data/vineOliveAliases.ts` - Aliases per vitigni e cultivar olivo (50+ entries)

**Struttura Alias:**
```typescript
interface CropAlias {
  aliasText: string;              // Nome locale/dialettale
  archetypeId: ArchetypeId;       // Archetipo target (L1, L2, L3, etc.)
  confidence: number;             // 0.0-1.0 (1.0 = confermato)
  defaultVarietyType?: 'Wine' | 'Table' | 'Oil' | 'Dual-purpose'; // Per L1/L2
  region?: string;                // Opzionale: geolocalizzazione
  province?: string;              // Opzionale: geolocalizzazione
}
```

**Esempi Aliases Vite:**
- "aglianico" → L1 (Vite), defaultVarietyType: 'Wine'
- "primitivo" → L1 (Vite), defaultVarietyType: 'Wine'
- "italia" → L1 (Vite), defaultVarietyType: 'Table'

**Esempi Aliases Olivo:**
- "coratina" → L2 (Olivo), defaultVarietyType: 'Oil'
- "frantoio" → L2 (Olivo), defaultVarietyType: 'Oil'
- "nocellara del belice" → L2 (Olivo), defaultVarietyType: 'Table'

#### Fuzzy Search Service (`services/fuzzySearchService.ts`)

**Funzione Principale:**
```typescript
searchCropWithFuzzy(
  storageProvider: IStorageProvider,
  query: string,
  region?: string,
  province?: string
): Promise<FuzzySearchResult>
```

**Risultato:**
```typescript
interface FuzzySearchResult {
  exactMatch: SearchResult | null;
  fuzzyMatches: SearchResult[];
  shouldShowArchetypeGrid: boolean;
}

interface SearchResult {
  type: 'exact_crop' | 'exact_alias' | 'fuzzy_crop' | 'fuzzy_alias';
  name: string;
  archetypeId: ArchetypeId;
  score: number; // 0-1
  defaultVarietyType?: 'Wine' | 'Table' | 'Oil' | 'Dual-purpose';
}
```

**Algoritmo:**
1. Normalizza query e genera varianti
2. Verifica se query potrebbe essere vite/olivo/frutteto
3. Exact match su crops ufficiali
4. Exact match su aliases predefiniti (priorità vite/olivo)
5. Exact match su aliases database
6. Fuzzy match su crops (top 200)
7. Fuzzy match su aliases (confidence >= 0.7)
8. Ordina per score e rimuovi duplicati
9. Ritorna top 5 risultati

**Boost Score:**
- Aliases con confidence >= 0.9: +0.05
- Aliases locali (stessa regione): +0.1
- Aliases locali (stessa provincia): +0.15

### Integrazione con Wizard

Il wizard di aggiunta colture (`components/crops/AddCropWizard.tsx`) usa fuzzy search per:
- Riconoscere automaticamente colture legnose (L1/L2/L3)
- Precompilare `defaultVarietyType` quando disponibile
- Aprire wizard dedicato per vite/olivo/frutteto

Il wizard colture legnose (`components/crops/AddWoodyCropWizard.tsx`) usa `defaultVarietyType` per:
- Precompilare tipo utilizzo (Vino/Tavola per vite, Olio/Mensa per olivo)
- Migliorare UX riducendo tempo inserimento

### Estensibilità

**Aggiungere Nuovi Aliases:**
1. Apri `data/vineOliveAliases.ts` o `data/fruitTreeAliases.ts`
2. Aggiungi entry seguendo il pattern esistente
3. Specifica `defaultVarietyType` se applicabile (L1/L2)
4. Testa con ricerca fuzzy

**Aggiungere Normalizzazione Personalizzata:**
1. Aggiungi funzione in `utils/textNormalizer.ts`
2. Integra nel pre-processing di `fuzzySearchService.ts`
3. Testa con varianti comuni

---

## Vite e Olivo Top-Level

### Panoramica

Vite e Olivo sono ora **sezioni top-level** nella navigazione PRO, separate da A12 (Colture legnose). Questo migliora l'accessibilità e l'organizzazione delle funzionalità dedicate.

### Architettura Navigazione

**Struttura Precedente:**
- Orto (A1-A10)
- Piccoli Frutti (A11)
- Colture Legnose (A12) → L1 (Vite), L2 (Olivo), L3 (Frutteto)

**Struttura Attuale:**
- Orto (A1-A10)
- Piccoli Frutti (A11)
- Frutteto (A12 → solo L3)
- **Vite** (L1, sezione dedicata top-level)
- **Olivo** (L2, sezione dedicata top-level)

### Componenti

**Sidebar Navigation (`components/professional/Sidebar.tsx`):**
```typescript
const menuItems = [
  // ...
  { icon: TreePine, label: 'Frutteto', path: '/app/orchard', tier: 'PRO' },
  { icon: Grape, label: 'Vite', path: '/app/vineyard', tier: 'PRO' },
  { icon: CircleDot, label: 'Olivo', path: '/app/olives', tier: 'PRO' },
  // ...
];
```

**Pagine Dedicare:**
- `app/(dashboard)/app/vineyard/page.tsx` - Pagina gestione vite
- `app/(dashboard)/app/olives/page.tsx` - Pagina gestione olivo

### Wizard Migliorati

**AddWoodyCropWizard (`components/crops/AddWoodyCropWizard.tsx`):**

**Miglioramenti Vite:**
- Campo "Tipo Utilizzo" (Vino/Tavola) con precompilazione da aliases
- Mostra suggerimento quando precompilato da ricerca
- Wizard più rapido (30-60 secondi)

**Miglioramenti Olivo:**
- Campo "Tipo Utilizzo" (Olio/Mensa/Dual-purpose) con precompilazione da aliases
- Mostra suggerimento quando precompilato da ricerca
- Wizard più rapido

**Precompilazione:**
```typescript
interface AddWoodyCropWizardProps {
  defaultVarietyType?: 'Wine' | 'Table' | 'Oil' | 'Dual-purpose';
  // ...
}
```

Quando `defaultVarietyType` è fornito (da fuzzy search), il wizard:
1. Salta step selezione tipo coltura se `initialCropType` è già fornito
2. Precompila campo "Tipo Utilizzo" con valore suggerito
3. Mostra indicatore visivo che valore è stato precompilato

### Integrazione con Fuzzy Search

Il flusso completo:
1. Utente cerca "aglianico" nel wizard aggiunta coltura
2. Fuzzy search riconosce alias → L1 (Vite), defaultVarietyType: 'Wine'
3. Sistema apre wizard dedicato vite con:
   - `initialCropType: 'Vine'`
   - `defaultVarietyType: 'Wine'`
4. Wizard precompila "Tipo Utilizzo: Da Vino"
5. Utente completa solo varietà e dettagli impianto

### Benefici

1. **UX Migliorata**: Accesso diretto a vite e olivo senza navigare in A12
2. **Ricerca Potenziata**: Riconosce 50+ vitigni e cultivar olivo italiani comuni
3. **Wizard Più Veloce**: Precompilazione automatica riduce tempo inserimento del 50-70%
4. **Coerenza**: Stesso pattern usato per frutteti, facile da mantenere
5. **Scalabilità**: Facile aggiungere nuovi aliases in futuro

---

## Estensibilità

### Aggiungere Nuova Pianta

1. Aggiungi scheda in `data/plantMasterSheets.ts`:
```typescript
{
  id: 'nuova-pianta',
  commonName: 'NOME',
  scientificName: 'Nome scientifico',
  // ... campi obbligatori
  
  // Campi opzionali per guide dettagliate (vedi REPLICABILITA_INFORMAZIONI_PIANTE.md):
  germination: {
    // ... campi standard
    alternativeMethod?: { /* Metodo alternativo (es. Scottex) */ },
    moldPrevention?: string, // Istruzioni prevenzione muffa
  },
  seedlingCare: {
    // ... campi standard
    wateringTiming?: string, // Quando innaffiare (es. "fine giornata")
    soilCare?: string, // Cura terreno (es. "smuovi con forchetta")
    commonIssues?: {
      trappedCotyledons?: { /* Problema cotiledoni imprigionati */ },
    },
  },
  baseInstructions: {
    // ... campi standard
    growthNotes?: string[], // Note crescita
    seedExtraction?: { /* Estrazione semi */ },
  },
  family: 'Famiglia',
  nutrientCategory: 'LEAFY' | 'FRUITING' | 'ROOT' | 'LEGUME',
  // ... altri campi
}
```

2. Aggiungi varietà in `data/plantVarieties.ts` (opzionale)
3. Aggiungi prezzo in `data/bioPrices.ts` (per analisi economica)

### Aggiungere Nuovo Prodotto Fitosanitario

1. Aggiungi in `data/treatments.ts`:
```typescript
{
  id: 'nuovo-prodotto',
  name: 'Nome Prodotto',
  type: 'PREVENTIVE' | 'CURATIVE' | 'REPELLENT',
  allowedInOrganic: true,
  target: ['Afidi', 'Oidio'],
  frequencyDays: 15,
  dosage: '5ml per litro',
  notes: 'Note importanti'
}
```

2. Il sistema lo userà automaticamente in `healthEngine.ts`

### Aggiungere Nuova Regola Consociazione

1. Aggiungi in `data/companionPlanting.ts`:
```typescript
{
  plant1: 'Pomodoro',
  plant2: 'Basilico',
  relationship: 'Beneficial',
  reason: 'Il basilico allontana gli insetti',
  spacingModifier: 0.8
}
```

### Creare Nuovo Engine

1. Crea file in `logic/`:
```typescript
// logic/nuovoEngine.ts
export const nuovaFunzione = (input: TipoInput): TipoOutput => {
  // Logica
  return output;
}
```

2. Importa dove necessario
3. Aggiungi tipi in `types.ts` se necessario

### Aggiungere Nuovo Componente

1. Crea file in `components/`:
```typescript
// components/NuovoComponente.tsx
import React from 'react';

interface Props {
  // ...
}

const NuovoComponente: React.FC<Props> = ({ ... }) => {
  return (
    // JSX
  );
};

export default NuovoComponente;
```

2. Importa in `App.tsx` o componente padre
3. Aggiungi navigazione se necessario

### Aggiungere Nuova Pianta Esotica con Matching Geografico

1. Aggiungi scheda in `data/exoticFruitMasterSheets.ts`:
```typescript
{
  id: 'nuovo-frutto-esotico',
  commonName: 'NOME FRUTTO',
  cropType: 'ExoticFruit',
  visualCategory: 'Esotici',
  
  // Varietà disponibili
  varieties: [
    {
      id: 'varieta-1',
      name: 'Varietà Nome',
      coldHardiness: 5,
      heatTolerance: 35,
      containerFriendly: true,
      dwarf: true,
      maturityYears: 3,
      harvestMonths: [7, 8, 9],
      bestUsdaZones: [9, 10],
      notes: 'Varietà nano, ideale per vaso'
    }
  ],
  
  // Compatibilità climatica
  climateCompatibility: {
    usdaZones: [9, 10, 11],
    optimalUsdaZones: [10, 11],
    tempMinSurvival: 5,
    tempMinGrowth: 10,
    tempOptimal: { min: 24, max: 30 },
    tempMax: 40,
    maxAltitudeMeters: 300,
    benefitsFromSea: true,
    seaDistanceKm: 50
  },
  
  // Sistemi di coltivazione
  cultivationSystems: {
    openField: {
      possible: true,
      requires: {
        minUsdaZone: 10,
        protection: 'Temporary',
        protectionType: 'TNT'
      }
    },
    container: {
      possible: true,
      minSizeLiters: 100,
      moveableIndoor: true,
      indoorMonths: [11, 12, 1, 2]
    },
    greenhouse: {
      required: false,
      type: 'Warm',
      heatingRequired: true,
      minTempGreenhouse: 10
    }
  },
  
  // ... altri campi standard PlantMasterSheet
}
```

2. Il sistema calcolerà automaticamente la fattibilità quando l'utente cerca la pianta nel Planner
3. I componenti UI (GeographicFeasibilityCard, VarietySelector, CultivationSystemSelector) si attiveranno automaticamente
4. Il widget GeographicMatchingWidget nella Dashboard mostrerà la pianta nelle sezioni appropriate (Ideali/Opportunità/Warnings)

---

## Microirrigazione e Sistemi Avanzati

### Architettura Irrigazione

OrtoMio supporta **microirrigazione per singolo filare** con configurazione precisa e calcoli automatici attraverso un sistema modulare:

#### Componenti Principali

**IrrigationSystemModal (`components/irrigation/IrrigationSystemModal.tsx`)**:
- Form completo per configurazione sistema
- Validazione parametri (pressione 0-10 bar)
- Supporto timer e elettrovalvole
- Gestione fonti acqua multiple

**IrrigationSystemWizard (`components/irrigation/IrrigationSystemWizard.tsx`)**:
- Wizard guidato per setup sistema
- Configurazione per tipo coltivazione
- Selezione filari e aiuole specifiche
- Calcoli automatici portata e durata

**IrrigationSystemCard (`components/irrigation/IrrigationSystemCard.tsx`)**:
- Visualizzazione sistema configurato
- Monitoraggio stato componenti
- Gestione modifica/eliminazione

#### Tipi Irrigazione Supportati

```typescript
type IrrigationType = 'Manual' | 'Drip' | 'Sprinkler' | 'Micro' | 'Soaker';

interface IrrigationSystem {
  type: IrrigationType;
  waterSource: 'Municipal' | 'Consortium' | 'Well' | 'Rainwater' | 'River' | 'Pond';
  pressureBar: number;
  hasTimer: boolean;
  hasValve: boolean;
  cultivationType?: 'orto' | 'frutteto' | 'uliveto' | 'vigneto' | 'serra' | 'giardino';
  bedIds?: string[]; // Aiuole collegate
  rowIds?: string[]; // Filari collegati
}
```

#### Configurazione per Tipo Coltivazione

**Orto (Verdure/Ortaggi)**:
- Raccomandato: Drip (efficienza Alta), Micro (efficienza Alta)
- Pressione ottimale: 1.5-3 bar
- Usa filari per tracciabilità precisa

**Frutteto (Alberi)**:
- Raccomandato: Drip per adulti, Micro per giovani
- Pressione ottimale: 2-4 bar
- Configurazione per settori e varietà

**Vigneto/Uliveto**:
- Standard: Drip (efficienza Alta)
- Controllo preciso per qualità
- Gestione per filari e età piante

#### Calcoli Automatici

**Portata per Metro**:
```typescript
// Esempio configurazione filare
interface RowIrrigationConfig {
  flowRatePerMeterLph: number; // L/h per metro lineare
  dripperSpacingCm: number;    // Distanza gocciolatori
  dripperFlowRate: number;     // Portata singolo gocciolatore
}

// Calcolo durata irrigazione
const calculateIrrigationDuration = (
  rowLengthM: number,
  flowRatePerMeterLph: number,
  targetLiters: number
): number => {
  const totalFlowRate = rowLengthM * flowRatePerMeterLph;
  return (targetLiters / totalFlowRate) * 60; // minuti
};
```

### Gestione Avanzata Fertilizzanti

#### Fertilizer Engine (`logic/fertilizerEngine.ts`)

**Conversione NPK in Prodotti Concreti**:
```typescript
interface FertilizerProduct {
  id: string;
  name: string;
  type: 'organic' | 'mineral' | 'corrective' | 'micronutrient';
  npkRatio: { n: number; p: number; k: number };
  dosageRange: { min: number; max: number }; // g/m²
  applicationTiming: string[];
  soilCompatibility: SoilType[];
  phRange: { min: number; max: number };
}

// Calcolo dosaggio specifico
const calculateFertilizerDosage = (
  plantCategory: NutrientCategory,
  phenologicalPhase: PhenologicalPhase,
  soilType: SoilType,
  product: FertilizerProduct
): FertilizerAdvice => {
  // Logica calcolo basata su:
  // - Fabbisogno pianta (da Nutrient Engine)
  // - Ritenzione terreno (argilloso +20%, sabbioso -15%)
  // - Fase crescita (pre-impianto, vegetativa, riproduttiva)
  // - pH compatibilità prodotto
};
```

#### Fertilizer Inventory Service (`services/fertilizerInventoryService.ts`)

**Gestione Scorte Intelligente**:
```typescript
interface FertilizerInventoryItem {
  productId: string;
  currentQuantityKg: number;
  expiryDate: string;
  costPerKg: number;
  supplier: string;
  storageLocation: string;
}

// Alert scorte basse
const checkLowStock = (gardenId: string): FertilizerAlert[] => {
  // Calcola fabbisogno stagionale
  // Verifica scorte vs necessità
  // Genera alert se < 20% necessità
};
```

#### Compost Service (`services/compostService.ts`)

**Autoproduzione con Calcoli C/N**:
```typescript
interface CompostMaterial {
  name: string;
  carbonNitrogenRatio: number;
  category: 'green' | 'brown';
  decompositionRate: 'fast' | 'medium' | 'slow';
}

const calculateOptimalCNRatio = (
  materials: Array<{ material: CompostMaterial; quantityKg: number }>
): CompostAnalysis => {
  // Calcola rapporto C/N risultante
  // Suggerisce aggiustamenti per 25-30:1 ottimale
  // Stima tempo maturazione
};
```

### Tillage Engine - Lavorazioni Terra

#### Timing "Terreno in Tempera" (`logic/tillageEngine.ts`)

**Calcolo Condizioni Ottimali**:
```typescript
interface SoilCondition {
  soilType: SoilType;
  lastRainDate: string;
  temperatureRange: { min: number; max: number };
  isWorkable: boolean;
  optimalWorkingWindow: { start: string; end: string };
}

const calculateTemperaTiming = (
  soilType: SoilType,
  weatherHistory: WeatherData[]
): SoilWorkabilityAdvice => {
  // Argilloso: 4-5 giorni dopo pioggia
  // Sabbioso: 2-3 giorni dopo pioggia
  // Franco: 3-4 giorni dopo pioggia
  // Considera temperatura (no lavori se < 5°C)
};
```

#### Lavorazioni per Dimensione Campo

**Suggerimenti Automatici**:
```typescript
const suggestTillageMethod = (areaSqMeters: number): TillageAdvice => {
  if (areaSqMeters < 200) {
    return {
      method: 'manual',
      tools: ['Vanga', 'Zappa manuale'],
      estimatedHours: areaSqMeters / 10 // 10 m²/ora manuale
    };
  } else if (areaSqMeters < 1000) {
    return {
      method: 'mechanical_small',
      tools: ['Motozappa', 'Fresa rotativa'],
      estimatedHours: areaSqMeters / 100 // 100 m²/ora motozappa
    };
  } else {
    return {
      method: 'mechanical_large',
      tools: ['Trattore', 'Aratro', 'Fresatrice'],
      estimatedHours: areaSqMeters / 500 // 500 m²/ora trattore
    };
  }
};
```

### Phyto Engine - Gestione Fitofarmaci

#### Phyto Engine (`logic/phytoEngine.ts`)

**Timing Critico e Registro**:
```typescript
interface PhytoProduct {
  id: string;
  name: string;
  activeIngredient: string;
  safetyIntervalDays: number;
  maxApplicationsPerSeason: number;
  weatherConstraints: {
    maxWindKmh: number;
    noRainHours: number;
    tempRange: { min: number; max: number };
  };
  organicCertified: boolean;
  requiresLicense: boolean;
}

const checkTreatmentTiming = (
  product: PhytoProduct,
  harvestDate: string,
  weatherForecast: WeatherData[]
): TreatmentTimingAdvice => {
  // Verifica periodo carenza vs raccolta
  // Controlla condizioni meteo
  // Suggerisce finestra ottimale
};
```

#### Treatment Registry Service (`services/treatmentRegistryService.ts`)

**Registro Obbligatorio per Professionisti**:
```typescript
interface TreatmentRecord {
  id: string;
  date: string;
  productId: string;
  dosageMlPerLiter: number;
  areaM2: number;
  weatherConditions: {
    temperature: number;
    humidity: number;
    windKmh: number;
  };
  safetyIntervalEnd: string;
  operatorLicense: string;
  fieldRowIds: string[];
}

// Export per compliance
const exportTreatmentRegistry = (
  gardenId: string,
  format: 'csv' | 'pdf'
): Promise<Blob> => {
  // Genera documento per audit
  // Include tutti i trattamenti con dettagli
  // Formattazione per certificazioni
};
```

### Seed Inventory Service Avanzato

#### Gestione Intelligente Semi (`services/seedInventoryService.ts`)

**Consumo Automatico**:
```typescript
interface SeedPacket {
  id: string;
  speciesName: string;
  varietyName: string;
  initialQuantity?: number;
  currentQuantity?: number;
  quantityRemaining: 'High' | 'Medium' | 'Low' | 'Empty';
  expiryYear: number;
  supplier: string;
  isOpen: boolean;
}

const consumeSeedsForSowing = (
  gardenId: string,
  varietyName: string,
  seedsUsed: number
): SeedConsumptionResult => {
  // Trova pacchetto corrispondente
  // Scala quantità automaticamente
  // Aggiorna stato (High/Medium/Low/Empty)
  // Marca come aperto dopo primo uso
};
```

**Statistiche Germinazione**:
```typescript
const recordGerminationResult = (
  gardenId: string,
  batchId: string,
  seedsPlanted: number,
  seedlingsGerminated: number
): GerminationStats => {
  const germinationRate = (seedlingsGerminated / seedsPlanted) * 100;
  
  // Determina efficienza
  const efficiency = germinationRate >= 80 ? 'Ottima' :
                    germinationRate >= 60 ? 'Buona' :
                    germinationRate >= 40 ? 'Media' : 'Scarsa';
  
  // Salva per analisi future
  return { germinationRate, efficiency };
};
```

### Vivaio (Semenzaio) Professionale

#### Struttura Modulare

**Pagina Principale (`app/(dashboard)/app/semenzaio/page.tsx`)**:
```typescript
const VivaioPage = () => {
  const [activeTab, setActiveTab] = useState<'semi' | 'piantine' | 'alberelli'>('semi');
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <TabButton icon="📦" label="Semi" active={activeTab === 'semi'} />
        <TabButton icon="🌱" label="Piantine" active={activeTab === 'piantine'} />
        <TabButton icon="🌳" label="Alberelli" active={activeTab === 'alberelli'} />
      </div>
      
      {/* Content per tab */}
      {activeTab === 'semi' && <SeedInventoryManager />}
      {activeTab === 'piantine' && <SeedlingBatchManager />}
      {activeTab === 'alberelli' && <SaplingManager />}
    </div>
  );
};
```

#### Gestione Lotti Avanzata

**Collegamento Semi → Piantine**:
```typescript
interface SeedlingBatch {
  id: string;
  seedPacketId: string; // Collegamento a banca semi
  seedsUsed: number;
  sowingDate: string;
  expectedGerminationDate: string;
  expectedTransplantDate: string;
  currentPhase: 'germination' | 'nursing' | 'hardening' | 'ready';
  germinationRate?: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  photos: string[];
  notes: string;
}

// Calcoli automatici
const calculateTransplantReadiness = (batch: SeedlingBatch): TransplantAdvice => {
  // Considera fase crescita
  // Verifica condizioni meteo
  // Calcola finestra ottimale trapianto
};
```

### Multi-Garden Management Avanzato

#### Weather Service Multi-Location (`services/weatherService.ts`)

**Cache Separata per Posizione**:
```typescript
interface WeatherCache {
  [gardenId: string]: {
    coordinates: { lat: number; lng: number };
    forecast: WeatherData[];
    lastUpdate: string;
    alerts: WeatherAlert[];
  };
}

const getWeatherForGarden = async (gardenId: string): Promise<WeatherData[]> => {
  // Usa coordinate specifiche giardino
  // Cache separata per ogni posizione
  // Calcola allarmi localizzati
};
```

#### Multi-Garden Widget (`components/WeatherLunarWidget.tsx`)

**Selettore Intelligente**:
```typescript
const WeatherLunarWidget = ({ gardens }: { gardens: Garden[] }) => {
  const [selectedGardenId, setSelectedGardenId] = useState(gardens[0]?.id);
  
  // Desktop: bottoni affiancati
  // Mobile: dropdown compatto
  // Icone automatiche per tipo orto
  
  return (
    <div className="space-y-4">
      {gardens.length > 1 && (
        <GardenSelector
          gardens={gardens}
          selected={selectedGardenId}
          onChange={setSelectedGardenId}
          responsive={true}
        />
      )}
      
      <WeatherForecast gardenId={selectedGardenId} />
      <LunarPhaseAdvice />
    </div>
  );
};
```

### AI Integration e Query Personalizzate

#### Gemini Service Avanzato (`services/geminiService.ts`)

**Query AI Personalizzate**:
```typescript
const getPersonalizedAdvice = async (
  query: string,
  gardenContext: GardenContext
): Promise<PersonalizedAdvice> => {
  const prompt = `
    CONTESTO ORTO:
    - Posizione: ${gardenContext.coordinates}
    - Tipo terreno: ${gardenContext.soilType}
    - Dimensione: ${gardenContext.sizeSqMeters}m²
    - Piante attuali: ${gardenContext.activePlants.join(', ')}
    - Stagione: ${gardenContext.currentSeason}
    
    DOMANDA: ${query}
    
    Fornisci consigli specifici per questo orto.
  `;
  
  // Usa schema strutturato per risposta
  return await generateStructuredResponse(prompt, personalizedAdviceSchema);
};
```

**Riconoscimento Problemi da Foto**:
```typescript
const diagnosePlantFromImage = async (
  imageBase64: string,
  plantName: string
): Promise<PlantDiagnosis> => {
  // Analisi AI dell'immagine
  // Identificazione sintomi visivi
  // Diagnosi problema e gravità
  // Suggerimenti trattamento
};
```

### Smart Features e IoT Integration

#### Sensor Integration (In Sviluppo)

**Smart Hub Simulation**:
```typescript
interface SensorReading {
  sensorId: string;
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'light';
  value: number;
  unit: string;
  timestamp: string;
  gardenId: string;
  location: { lat: number; lng: number };
}

const analyzeSensorData = async (
  readings: SensorReading[]
): Promise<SmartAdvice> => {
  // Analisi AI dei dati sensori
  // Correlazione con condizioni meteo
  // Suggerimenti irrigazione automatica
  // Alert condizioni critiche
};
```

#### Predictive Analytics (Roadmap)

**Previsioni Resa**:
```typescript
interface YieldPrediction {
  plantId: string;
  expectedYieldKg: number;
  confidenceLevel: number;
  harvestWindow: { start: string; end: string };
  factors: {
    weather: number;
    soilConditions: number;
    plantHealth: number;
    careQuality: number;
  };
}

// Modelli predittivi basati su:
// - Storico rese per varietà
// - Condizioni meteo attuali/previste
// - Qualità cure fornite
// - Salute piante monitorata
```

---

## Best Practices

### Codice

- **TypeScript strict**: Usa tipi espliciti
- **Componenti funzionali**: Preferisci function components
- **Hooks**: Usa useState, useEffect per state management
- **Error handling**: Try/catch per chiamate async
- **Naming**: Nomi descrittivi in italiano per UI, inglese per codice

### Performance

- **Lazy loading**: Considera per componenti pesanti
- **Memoization**: useMemo/useCallback quando necessario
- **Code splitting**: Vite lo fa automaticamente
- **Image optimization**: Comprimi immagini prima di caricare

### Manutenibilità

- **Separazione concerns**: Logic in `logic/`, UI in `components/`
- **DRY**: Evita duplicazione codice
- **Documentazione**: Commenta logica complessa
- **Type safety**: Usa TypeScript per prevenire errori

---

## Troubleshooting

### Build Fallisce

1. Verifica dipendenze: `npm install`
2. Controlla errori TypeScript: `npm run build`
3. Verifica configurazione Tailwind/PostCSS
4. Controlla import mancanti

### AI Non Funziona

1. Verifica `VITE_GEMINI_API_KEY` in `.env`
2. Controlla console browser per errori API
3. Verifica quota API Gemini
4. Fallback: Sistema usa dati predefiniti

### Meteo Non Carica

1. Verifica permessi geolocalizzazione
2. Controlla coordinate in impostazioni orto
3. Verifica connessione internet
4. API Open-Meteo potrebbe essere temporaneamente down

### Stili Non Appaiono

1. Verifica `index.css` importato in `index.tsx`
2. Controlla `tailwind.config.js` content paths
3. Verifica build CSS generato
4. Hard refresh browser (Ctrl+Shift+R)

---

## Contribuire

1. Fork repository
2. Crea branch feature
3. Implementa modifiche
4. Testa localmente
5. Commit e push
6. Crea Pull Request

### Linee Guida

- Segui struttura esistente
- Aggiungi tipi TypeScript
- Documenta funzioni complesse
- Testa su browser multipli
- Mantieni compatibilità mobile

---

## Sistema Tracking Piante Individuali

### Architettura Database

Il sistema di tracking individuale utilizza **3 migrazioni Supabase** per creare uno schema completo:

#### Migrazione 1: Schema Base (`20260110100000_create_individual_plant_tracking.sql`)

**Tabelle principali**:

```sql
-- Piante individuali con posizione precisa
CREATE TABLE garden_plants (
    id UUID PRIMARY KEY,
    garden_id UUID NOT NULL,
    row_id UUID REFERENCES garden_rows(id),
    field_row_id UUID REFERENCES field_rows(id),
    position_in_row INTEGER NOT NULL,
    plant_code TEXT NOT NULL, -- F1-P001, F2-P015
    plant_name TEXT NOT NULL,
    variety TEXT,
    status TEXT DEFAULT 'healthy',
    health_score INTEGER DEFAULT 100,
    coordinates JSONB, -- {"x": 1.5, "y": 0.3}
    photos TEXT[],
    notes TEXT,
    -- Constraints per unicità posizione e codice
    CONSTRAINT unique_position_per_row UNIQUE (row_id, position_in_row),
    CONSTRAINT unique_plant_code_per_garden UNIQUE (garden_id, plant_code)
);

-- Operazioni per pianta singola
CREATE TABLE plant_operations (
    id UUID PRIMARY KEY,
    plant_id UUID NOT NULL REFERENCES garden_plants(id),
    operation_type TEXT NOT NULL, -- 'watering', 'fertilizing', 'treatment'
    operation_date DATE NOT NULL,
    quantity DECIMAL(10,3),
    unit TEXT,
    product_name TEXT,
    effectiveness_score INTEGER, -- 1-10
    plant_response TEXT, -- 'positive', 'negative', 'neutral'
    photos TEXT[],
    notes TEXT
);

-- Raccolti per pianta singola
CREATE TABLE plant_harvests (
    id UUID PRIMARY KEY,
    plant_id UUID NOT NULL REFERENCES garden_plants(id),
    harvest_date DATE NOT NULL,
    quantity_kg DECIMAL(8,3) NOT NULL,
    quality_grade TEXT, -- 'excellent', 'good', 'fair', 'poor'
    market_value DECIMAL(8,2),
    photos TEXT[]
);
```

**Funzioni di calcolo**:

```sql
-- Calcola numero piante in un filare
CREATE FUNCTION calculate_plants_in_row(
    row_length_m DECIMAL,
    plant_spacing_cm INTEGER
) RETURNS INTEGER;

-- Genera codice pianta automatico (F1-P001)
CREATE FUNCTION generate_plant_code(
    p_garden_id UUID,
    p_row_id UUID,
    p_field_row_id UUID,
    p_position INTEGER
) RETURNS TEXT;

-- Auto-genera tutte le piante in un filare
CREATE FUNCTION auto_generate_plants_in_row(
    p_garden_id UUID,
    p_row_id UUID,
    p_field_row_id UUID,
    p_plant_name TEXT,
    p_variety TEXT,
    p_planting_date DATE,
    p_plant_spacing_cm INTEGER
) RETURNS INTEGER;
```

#### Migrazione 2: Estensioni Operazioni (`20260110110000_extend_operations_for_individual_plants.sql`)

**Estende tabelle esistenti** per supportare operazioni su piante individuali:

```sql
-- Aggiunge colonne alle tabelle operazioni esistenti
ALTER TABLE mechanical_works ADD COLUMN plant_ids UUID[];
ALTER TABLE watering_logs ADD COLUMN plant_ids UUID[];
ALTER TABLE fertilizer_applications ADD COLUMN plant_ids UUID[];
ALTER TABLE treatment_applications ADD COLUMN plant_ids UUID[];

-- Funzioni helper per operazioni di massa
CREATE FUNCTION get_plants_in_row(
    p_row_id UUID,
    p_field_row_id UUID,
    p_status TEXT
) RETURNS TABLE (plant_id UUID, plant_code TEXT, ...);

CREATE FUNCTION apply_operation_to_row_plants(
    p_operation_type TEXT,
    p_row_id UUID,
    p_field_row_id UUID,
    p_quantity DECIMAL,
    p_product_name TEXT
) RETURNS INTEGER;
```

#### Migrazione 3: Setup e Dati Esempio (`20260110120000_add_example_data_and_final_setup.sql`)

**Funzioni avanzate e ottimizzazioni**:

```sql
-- Statistiche complete per filare
CREATE FUNCTION get_complete_row_stats(
    p_row_id UUID,
    p_field_row_id UUID
) RETURNS JSONB;

-- Crea campo di esempio (1000 piante)
CREATE FUNCTION create_example_tomato_field(
    p_garden_id UUID
) RETURNS JSONB;

-- Viste ottimizzate per dashboard
CREATE VIEW garden_plants_dashboard AS
SELECT 
    garden_id,
    COUNT(*) as total_plants,
    COUNT(*) FILTER (WHERE status = 'healthy') as healthy_plants,
    AVG(health_score) as avg_health_score,
    COUNT(DISTINCT plant_name) as plant_varieties
FROM garden_plants
GROUP BY garden_id;
```

### Tipi TypeScript

#### types/individualPlant.ts

**Interfacce principali**:

```typescript
export interface GardenPlant {
  id: string;
  gardenId: string;
  rowId?: string;
  fieldRowId?: string;
  positionInRow: number;
  plantCode: string; // F1-P001
  plantName: string;
  variety?: string;
  status: 'healthy' | 'diseased' | 'dead' | 'harvested';
  healthScore: number; // 0-100
  coordinates?: { x: number; y: number };
  photos: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlantOperation {
  id: string;
  plantId: string;
  gardenId: string;
  operationType: 'watering' | 'fertilizing' | 'treatment' | 'pruning';
  operationDate: string;
  quantity?: number;
  unit?: string;
  productName?: string;
  effectivenessScore?: number; // 1-10
  plantResponse?: 'positive' | 'negative' | 'neutral';
  photos: string[];
  notes?: string;
}

export interface FieldConfiguration {
  gardenId: string;
  zoneName: string;
  rowCount: number;
  rowLengthMeters: number;
  plantSpacingCm: number;
  rowSpacingCm: number;
  totalPlants: number; // Calcolato automaticamente
  plantsPerRow: number;
  totalAreaSqm: number;
  plantsPerSqMeter: number;
  plantName: string;
  variety?: string;
  plantingDate: string;
}
```

### Servizi

#### services/individualPlantService.ts

**Calcoli automatici**:

```typescript
export const plantCalculations = {
  // Calcola numero massimo piante in un filare
  maxPlantsInRow: (lengthMeters: number, spacingCm: number): number => {
    return Math.floor((lengthMeters * 100) / spacingCm) + 1;
  },

  // Calcola area totale campo
  totalArea: (rowCount: number, rowLength: number, rowSpacing: number): number => {
    return rowLength * ((rowCount - 1) * (rowSpacing / 100) + 0.5);
  },

  // Calcola piante per metro quadro
  plantsPerSqMeter: (plantSpacing: number, rowSpacing: number): number => {
    const plantsPerMeterRow = 100 / plantSpacing;
    const rowsPerMeter = 100 / rowSpacing;
    return plantsPerMeterRow * rowsPerMeter;
  }
};

// Configurazione campo automatica
export const calculateFieldConfiguration = (
  config: Partial<FieldWizardConfig>
): FieldConfiguration => {
  const plantsPerRow = plantCalculations.maxPlantsInRow(
    config.rowLengthMeters, 
    config.plantSpacingCm
  );
  const totalPlants = plantsPerRow * config.rowCount;
  const totalAreaSqm = plantCalculations.totalArea(
    config.rowCount, 
    config.rowLengthMeters, 
    config.rowSpacingCm
  );
  
  return {
    // ... configurazione completa calcolata
  };
};
```

#### services/plantOperationsService.ts

**Operazioni di massa**:

```typescript
export const createBulkOperation = async (
  operation: BulkRowOperation,
  photos?: File[]
): Promise<BulkOperationResult> => {
  const plantIds = operation.plantIds || [];
  const operationsCreated: string[] = [];
  
  // Upload foto se presenti
  let photoUrls: string[] = [];
  if (photos && photos.length > 0) {
    photoUrls = await uploadPhotos(photos);
  }

  // Crea operazioni per ogni pianta
  for (const plantId of plantIds) {
    const plantOperation = await createPlantOperation(plantId, '', {
      operationType: operation.operationType,
      operationDate: operation.operationDate,
      quantity: operation.quantityPerPlant,
      unit: operation.unit,
      productName: operation.productName,
      photos: photoUrls
    });
    
    operationsCreated.push(plantOperation.id);
  }

  return {
    success: true,
    operationsCreated: operationsCreated.length,
    plantsAffected: plantIds.length,
    operationIds: operationsCreated
  };
};

// Strategie foto intelligenti
export const selectRepresentativePlants = (
  plants: GardenPlant[],
  count: number = 10
): GardenPlant[] => {
  // Seleziona piante rappresentative per ogni stato di salute
  const healthRanges = [
    { min: 90, max: 100, label: 'excellent' },
    { min: 70, max: 89, label: 'good' },
    { min: 50, max: 69, label: 'fair' },
    { min: 0, max: 49, label: 'poor' }
  ];
  
  const representative: GardenPlant[] = [];
  const plantsPerRange = Math.ceil(count / healthRanges.length);
  
  for (const range of healthRanges) {
    const plantsInRange = plants.filter(p => 
      p.healthScore >= range.min && p.healthScore <= range.max
    );
    
    if (plantsInRange.length > 0) {
      const step = Math.max(1, Math.floor(plantsInRange.length / plantsPerRange));
      for (let i = 0; i < plantsInRange.length && representative.length < count; i += step) {
        representative.push(plantsInRange[i]);
      }
    }
  }
  
  return representative.slice(0, count);
};
```

### Componenti React

#### components/plants/SmartPlantManager.tsx

**Gestione intelligente con selezione multipla**:

```typescript
type SelectionMode = 'single' | 'group' | 'row' | 'problems' | 'healthy';
type ViewMode = 'grid' | 'heatmap' | 'list';

interface PlantSelection {
  mode: SelectionMode;
  plantIds: string[];
  criteria?: {
    healthScoreMin?: number;
    healthScoreMax?: number;
    status?: string[];
  };
}

const SmartPlantManager: React.FC<SmartPlantManagerProps> = ({ garden }) => {
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [selection, setSelection] = useState<PlantSelection>({
    mode: 'single',
    plantIds: []
  });
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');

  // Modalità selezione intelligente
  const handleSelectionModeChange = (mode: SelectionMode) => {
    setSelection({
      mode,
      plantIds: [],
      criteria: mode === 'problems' ? { healthScoreMax: 70 } :
                mode === 'healthy' ? { healthScoreMin: 80 } : undefined
    });
  };

  // Operazioni di massa
  const handleBulkOperation = async (operation: BulkRowOperation, photos?: File[]) => {
    const result = await createBulkOperation(operation, photos);
    
    if (result.success) {
      alert(`✅ ${result.operationsCreated} operazioni su ${result.plantsAffected} piante`);
      await loadPlants(); // Ricarica dati
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiche rapide */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-xl font-bold text-green-700">
            {plants.filter(p => p.status === 'healthy').length}
          </p>
          <p className="text-sm text-green-600">Sane</p>
        </div>
        {/* ... altre statistiche */}
      </div>

      {/* Modalità selezione */}
      <div className="grid grid-cols-5 gap-3">
        {(['single', 'group', 'row', 'problems', 'healthy'] as SelectionMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => handleSelectionModeChange(mode)}
            className={`p-3 rounded-lg border-2 ${
              selection.mode === mode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            {/* Icona e label per modalità */}
          </button>
        ))}
      </div>

      {/* Vista piante */}
      {viewMode === 'heatmap' && (
        <PlantHealthHeatmap
          plants={filteredPlants}
          onPlantSelect={(plant) => {
            if (selection.mode === 'single') {
              setSelection({ ...selection, plantIds: [plant.id] });
            }
          }}
        />
      )}

      {/* Azioni di massa */}
      {selection.plantIds.length > 0 && (
        <div className="flex gap-3">
          <button onClick={() => setShowOperationModal(true)}>
            💧 Irrigazione ({selection.plantIds.length})
          </button>
          {/* ... altre operazioni */}
        </div>
      )}
    </div>
  );
};
```

#### components/plants/BulkOperationModal.tsx

**Modal per operazioni di massa con foto strategiche**:

```typescript
interface BulkOperationModalProps {
  operationType: 'watering' | 'fertilizing' | 'treatment' | 'health';
  selectedPlants: GardenPlant[];
  onSubmit: (operation: BulkRowOperation, photos?: File[]) => Promise<void>;
}

const BulkOperationModal: React.FC<BulkOperationModalProps> = ({
  operationType,
  selectedPlants,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    quantityPerPlant: '',
    unit: '',
    productName: '',
    photoStrategy: 'sample' as 'none' | 'sample' | 'problems' | 'all'
  });

  // Strategia foto intelligente
  const getPhotoStrategy = () => {
    switch (formData.photoStrategy) {
      case 'none':
        return { label: 'Nessuna Foto', recommended: selectedPlants.length > 100 };
      case 'sample':
        return { 
          label: 'Foto Campione', 
          description: `${Math.min(10, Math.ceil(selectedPlants.length / 20))} foto`,
          recommended: selectedPlants.length > 20 && selectedPlants.length <= 500 
        };
      case 'problems':
        const problemPlants = selectedPlants.filter(p => p.status === 'diseased' || p.healthScore < 70);
        return { 
          label: 'Solo Problemi', 
          description: `${problemPlants.length} foto`,
          recommended: problemPlants.length > 0 && problemPlants.length < 50 
        };
      case 'all':
        return { 
          label: 'Tutte le Piante', 
          description: `${selectedPlants.length} foto`,
          recommended: selectedPlants.length <= 20 
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="bg-white rounded-lg max-w-2xl mx-auto mt-20 p-6">
        {/* Statistiche selezione */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{selectedPlants.length}</p>
            <p className="text-sm text-gray-600">Totali</p>
          </div>
          {/* ... altre statistiche */}
        </div>

        {/* Strategia foto */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['none', 'sample', 'problems', 'all'] as const).map((strategy) => {
            const strategyInfo = getPhotoStrategy();
            const isRecommended = strategy === 'sample' && selectedPlants.length > 20;
            
            return (
              <button
                key={strategy}
                onClick={() => setFormData({ ...formData, photoStrategy: strategy })}
                className={`p-3 border-2 rounded-lg ${
                  formData.photoStrategy === strategy ? 'border-blue-500' : 'border-gray-200'
                } ${isRecommended ? 'ring-2 ring-green-200' : ''}`}
              >
                {isRecommended && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Consigliata
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Riepilogo operazione */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Riepilogo</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>{selectedPlants.length} piante</strong> coinvolte</p>
            <p>• <strong>{formData.quantityPerPlant} {formData.unit}</strong> per pianta</p>
            <p>• Totale: <strong>
              {(parseFloat(formData.quantityPerPlant) * selectedPlants.length).toFixed(1)} {formData.unit}
            </strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### components/plants/PlantHealthHeatmap.tsx

**Visualizzazione heatmap con drill-down**:

```typescript
const PlantHealthHeatmap: React.FC<PlantHealthHeatmapProps> = ({
  plants,
  onPlantSelect
}) => {
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'overview' | 'detailed'>('overview');

  // Organizza piante per filare
  const heatmapData = useMemo(() => {
    const rows: { [key: string]: GardenPlant[] } = {};
    
    plants.forEach(plant => {
      const rowMatch = plant.plantCode.match(/F(\d+)-P/);
      const rowNumber = rowMatch ? parseInt(rowMatch[1]) : 1;
      const rowKey = `row_${rowNumber}`;
      
      if (!rows[rowKey]) rows[rowKey] = [];
      rows[rowKey].push(plant);
    });

    // Ordina piante per posizione
    Object.keys(rows).forEach(rowKey => {
      rows[rowKey].sort((a, b) => a.positionInRow - b.positionInRow);
    });

    return rows;
  }, [plants]);

  const getHealthColor = (healthScore: number) => {
    if (healthScore >= 90) return 'rgba(34, 197, 94, 1)'; // green-500
    if (healthScore >= 70) return 'rgba(234, 179, 8, 1)'; // yellow-500
    if (healthScore >= 50) return 'rgba(249, 115, 22, 1)'; // orange-500
    return 'rgba(239, 68, 68, 1)'; // red-500
  };

  return (
    <div className="space-y-4">
      {/* Statistiche */}
      <div className="grid grid-cols-5 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{plants.length}</p>
          <p className="text-sm text-gray-600">Totali</p>
        </div>
        {/* ... altre statistiche */}
      </div>

      {/* Heatmap per filare */}
      <div className="space-y-4">
        {Object.keys(heatmapData).sort().map((rowKey) => {
          const rowNumber = parseInt(rowKey.split('_')[1]);
          const rowPlants = heatmapData[rowKey];
          
          return (
            <div key={rowKey} className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium w-20">Filare {rowNumber}</span>
                <div className="text-xs text-gray-500">
                  {rowPlants.length} piante • 
                  Media: {Math.round(rowPlants.reduce((sum, p) => sum + p.healthScore, 0) / rowPlants.length)}%
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {rowPlants.map((plant) => (
                  <div
                    key={plant.id}
                    className={`${zoomLevel === 'overview' ? 'w-3 h-3' : 'w-6 h-6'} rounded-sm cursor-pointer transition-all`}
                    style={{ backgroundColor: getHealthColor(plant.healthScore) }}
                    onClick={() => {
                      setSelectedPlant(plant);
                      onPlantSelect?.(plant);
                    }}
                    title={`${plant.plantCode} - ${plant.healthScore}% - ${plant.status}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dettagli pianta selezionata */}
      {selectedPlant && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-lg">{selectedPlant.plantCode}</h5>
              <p className="text-gray-600">{selectedPlant.plantName} - {selectedPlant.variety}</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Salute:</span>
                  <span className="font-medium">{selectedPlant.healthScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stato:</span>
                  <span className="font-medium capitalize">{selectedPlant.status}</span>
                </div>
              </div>
            </div>
            
            <div>
              {selectedPlant.photos && selectedPlant.photos.length > 0 && (
                <div>
                  <h6 className="font-medium mb-2">Foto Recenti</h6>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPlant.photos.slice(0, 3).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${selectedPlant.plantCode} foto ${index + 1}`}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### Integrazione con Sistema Esistente

#### Pagina Principale

```typescript
// app/(dashboard)/app/plants/page.tsx
export default function PlantsPage() {
  const { activeGarden } = useGarden();
  const [activeTab, setActiveTab] = useState<'smart' | 'field'>('smart');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('smart')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'smart' ? 'bg-white shadow-sm' : ''
          }`}
        >
          🎯 Smart Manager
        </button>
        <button
          onClick={() => setActiveTab('field')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'field' ? 'bg-white shadow-sm' : ''
          }`}
        >
          🔧 Field Manager
        </button>
      </div>

      {activeTab === 'smart' && <SmartPlantManager garden={activeGarden} />}
      {activeTab === 'field' && <FieldPlantManager garden={activeGarden} />}
    </div>
  );
}
```

### Scalabilità e Performance

#### Ottimizzazioni Database

```sql
-- Indici per performance
CREATE INDEX idx_garden_plants_garden_status ON garden_plants(garden_id, status);
CREATE INDEX idx_garden_plants_row_position ON garden_plants(COALESCE(row_id, field_row_id), position_in_row);
CREATE INDEX idx_plant_operations_plant_date ON plant_operations(plant_id, operation_date DESC);

-- Viste materializzate per statistiche
CREATE VIEW plants_per_row_summary AS
SELECT 
    COALESCE(gr.name, fr.name) as row_name,
    COUNT(*) as total_plants,
    COUNT(*) FILTER (WHERE gp.status = 'healthy') as healthy_plants,
    AVG(gp.health_score) as avg_health_score
FROM garden_plants gp
LEFT JOIN garden_rows gr ON gp.row_id = gr.id
LEFT JOIN field_rows fr ON gp.field_row_id = fr.id
GROUP BY COALESCE(gr.name, fr.name);
```

#### Ottimizzazioni Frontend

```typescript
// Lazy loading per grandi dataset
const PlantGrid = React.lazy(() => import('./PlantGrid'));

// Virtualizzazione per migliaia di piante
import { FixedSizeGrid as Grid } from 'react-window';

const VirtualizedPlantGrid = ({ plants }: { plants: GardenPlant[] }) => (
  <Grid
    columnCount={20}
    columnWidth={20}
    height={600}
    rowCount={Math.ceil(plants.length / 20)}
    rowHeight={20}
    itemData={plants}
  >
    {({ columnIndex, rowIndex, style, data }) => {
      const plantIndex = rowIndex * 20 + columnIndex;
      const plant = data[plantIndex];
      
      return plant ? (
        <div style={style} className="plant-cell">
          {/* Render pianta */}
        </div>
      ) : null;
    }}
  </Grid>
);
```

### Testing e Validazione

#### Test Calcoli

```typescript
// Test calcoli automatici
describe('Plant Calculations', () => {
  test('calcola correttamente piante per filare', () => {
    const result = plantCalculations.maxPlantsInRow(40, 40); // 40m, 40cm
    expect(result).toBe(101); // (40*100)/40 + 1 = 101
  });

  test('calcola area totale campo', () => {
    const result = plantCalculations.totalArea(10, 40, 150); // 10 filari, 40m, 150cm
    expect(result).toBe(600); // 40 * (9*1.5 + 0.5) = 600 m²
  });
});
```

#### Test Componenti

```typescript
// Test componenti React
import { render, screen, fireEvent } from '@testing-library/react';
import SmartPlantManager from '../SmartPlantManager';

test('mostra statistiche piante', () => {
  const mockPlants = [
    { id: '1', status: 'healthy', healthScore: 95 },
    { id: '2', status: 'diseased', healthScore: 45 }
  ];

  render(<SmartPlantManager garden={mockGarden} plants={mockPlants} />);
  
  expect(screen.getByText('1')).toBeInTheDocument(); // Piante sane
  expect(screen.getByText('1')).toBeInTheDocument(); // Piante malate
});
```

---

**Documentazione Tecnica OrtoMio** - Versione 1.0
