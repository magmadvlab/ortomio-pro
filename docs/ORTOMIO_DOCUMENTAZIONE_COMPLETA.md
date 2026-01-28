# OrtoMio AI - Documentazione Tecnica Completa

> **Documento basato esclusivamente sul codice sorgente dell'applicazione**
> Ultima analisi: Gennaio 2026

---

## 1. OVERVIEW DEL PROGETTO

**OrtoMio AI** è un'applicazione web professionale per la gestione agricola completa, che include orti, frutteti, vigneti e oliveti. L'applicazione fornisce strumenti AI-powered per la pianificazione, il monitoraggio della salute delle piante, la gestione dei trattamenti e l'analisi predittiva.

### Informazioni di Base

| Attributo | Valore |
|-----------|--------|
| **Nome pacchetto** | `ortomio-ai` |
| **Versione** | `0.0.0` |
| **Tipo** | `module` (ES Modules) |
| **Node.js richiesto** | `>=22.0.0` |
| **npm richiesto** | `>=10.0.0` |
| **Porta di sviluppo** | `3002` |

---

## 2. STACK TECNOLOGICO

### Framework e Librerie Principali

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| **Next.js** | `^16.1.1` | Framework React con App Router |
| **React** | `^19.2.1` | Libreria UI |
| **TypeScript** | `~5.8.2` | Type safety |
| **Tailwind CSS** | `^4.1.17` | Styling utility-first |

### Dipendenze di Produzione

| Pacchetto | Versione | Utilizzo |
|-----------|----------|----------|
| `@google/generative-ai` | `^0.24.1` | Integrazione Google Gemini AI |
| `@supabase/ssr` | `^0.8.0` | Supabase SSR per Next.js |
| `@supabase/supabase-js` | `^2.87.1` | Client Supabase |
| `date-fns` | `^4.1.0` | Manipolazione date |
| `jspdf` | `^2.5.2` | Generazione PDF |
| `jspdf-autotable` | `^3.8.4` | Tabelle in PDF |
| `leaflet` | `^1.9.4` | Mappe interattive |
| `react-leaflet` | `^5.0.0` | Componenti React per Leaflet |
| `lucide-react` | `^0.556.0` | Icone |
| `recharts` | `^3.6.0` | Grafici e visualizzazioni |
| `zod` | `^3.23.8` | Validazione schema |

### Dipendenze di Sviluppo

| Pacchetto | Versione |
|-----------|----------|
| `@tailwindcss/postcss` | `^4.1.18` |
| `@types/node` | `^24.10.3` |
| `@types/react` | `^18.3.17` |
| `autoprefixer` | `^10.4.22` |
| `postcss` | `^8.5.6` |

---

## 3. STRUTTURA DEL PROGETTO

```
ortomio-main/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Route autenticazione (login, register)
│   ├── app/                 # Route applicazione protette
│   │   ├── page.tsx         # Dashboard principale
│   │   ├── garden/          # Gestione giardino
│   │   ├── planner/         # Pianificatore smart AI
│   │   ├── planner-classic/ # Pianificatore tradizionale
│   │   ├── calendar/        # Calendario task con fasi lunari
│   │   ├── journal/         # Diario operativo
│   │   ├── plants/          # Gestione piante individuali
│   │   ├── orchard/         # Gestione frutteto
│   │   ├── vineyard/        # Gestione vigneto
│   │   ├── olives/          # Gestione oliveto
│   │   ├── health/          # Monitoraggio salute piante
│   │   ├── ai-predictions/  # Predizioni AI
│   │   ├── treatments/      # Gestione trattamenti
│   │   ├── nutrition/       # Nutrizione e fertilizzanti
│   │   ├── irrigation/      # Gestione irrigazione
│   │   ├── harvest/         # Log raccolti
│   │   ├── semenzaio/       # Inventario semi
│   │   ├── zones/           # Gestione zone
│   │   ├── certifications/  # Certificazioni
│   │   ├── prescription-maps/ # Mappe prescrizione
│   │   ├── analytics/       # Analytics avanzati
│   │   ├── advice/          # Consigli AI
│   │   ├── settings/        # Impostazioni
│   │   └── ...
│   └── api/                 # API Routes
├── components/              # ~126 componenti React
├── services/                # ~150+ servizi business logic
├── types/                   # ~41 file definizioni TypeScript
├── hooks/                   # 9 custom React hooks
├── lib/                     # Utilities e auth
├── data/                    # ~44 file dati master (~1.8MB)
├── database/                # Schema Supabase e migrazioni
├── config/                  # Feature flags e configurazioni
├── packages/                # Core utilities (storage, context)
├── docs/                    # Documentazione
├── scripts/                 # Script deploy e migrazione
└── public/                  # Asset statici
```

---

## 4. PAGINE E ROUTE DELL'APPLICAZIONE

### Route Autenticazione (`/app/(auth)/`)

| Route | Descrizione |
|-------|-------------|
| `/login` | Pagina di login |
| `/register` | Registrazione nuovo utente |
| `/reset-password` | Reset password |

### Route Applicazione (`/app/app/`)

| Route | File | Descrizione |
|-------|------|-------------|
| `/app` | `page.tsx` | Dashboard principale |
| `/app/garden` | `garden/page.tsx` | Configurazione e gestione giardino |
| `/app/planner` | `planner/page.tsx` | Pianificatore Smart con AI |
| `/app/planner-classic` | `planner-classic/page.tsx` | Pianificatore tradizionale |
| `/app/calendar` | `calendar/page.tsx` | Calendario task con fasi lunari |
| `/app/journal` | `journal/page.tsx` | Diario operativo e timeline |
| `/app/diary` | `diary/page.tsx` | Diario alternativo |
| `/app/plants` | `plants/page.tsx` | Gestione piante individuali |
| `/app/orchard` | `orchard/page.tsx` | Gestione frutteto professionale |
| `/app/vineyard` | `vineyard/page.tsx` | Gestione vigneto |
| `/app/olives` | `olives/page.tsx` | Gestione oliveto |
| `/app/health` | `health/page.tsx` | Monitoraggio salute piante |
| `/app/ai-predictions` | `ai-predictions/page.tsx` | Predizioni AI malattie/resa |
| `/app/treatments` | `treatments/page.tsx` | Gestione trattamenti fitosanitari |
| `/app/nutrition` | `nutrition/page.tsx` | Nutrizione e fertilizzazione |
| `/app/irrigation` | `irrigation/page.tsx` | Gestione irrigazione |
| `/app/harvest` | `harvest/page.tsx` | Log e analisi raccolti |
| `/app/semenzaio` | `semenzaio/page.tsx` | Inventario semi e piantine |
| `/app/zones` | `zones/page.tsx` | Definizione zone del giardino |
| `/app/certifications` | `certifications/page.tsx` | Certificazioni (Bio, GlobalGAP) |
| `/app/prescription-maps` | `prescription-maps/page.tsx` | Mappe prescrizione satellitari |
| `/app/ndvi` | `ndvi/page.tsx` | Indici vegetazione NDVI |
| `/app/analytics` | `analytics/page.tsx` | Dashboard analytics avanzati |
| `/app/advice` | `advice/page.tsx` | Consigli AI personalizzati |
| `/app/smart` | `smart/page.tsx` | Operazioni smart guidate |
| `/app/smart-simple` | `smart-simple/page.tsx` | Operazioni smart semplificate |
| `/app/compare` | `compare/page.tsx` | Confronto stagioni |
| `/app/compare/detailed` | `compare/detailed/page.tsx` | Confronto dettagliato |
| `/app/mechanical-work` | `mechanical-work/page.tsx` | Lavori meccanici |
| `/app/almanacco` | `almanacco/page.tsx` | Almanacco e fasi lunari |
| `/app/pianifica` | `pianifica/page.tsx` | Pianificazione |
| `/app/satellite-config` | `satellite-config/page.tsx` | Configurazione satelliti |
| `/app/export` | `export/page.tsx` | Esportazione dati |
| `/app/reports` | `reports/page.tsx` | Report e stampe |
| `/app/help` | `help/page.tsx` | Aiuto e documentazione |
| `/app/settings` | `settings/page.tsx` | Impostazioni utente e API |
| `/app/admin` | `admin/page.tsx` | Pannello amministrazione |

---

## 5. FUNZIONALITA' PRINCIPALI (Feature Flags)

### Fase 1 - Moduli Critici (ATTIVI)

| Feature Flag | Route | Descrizione |
|--------------|-------|-------------|
| `AI_PREDICTIONS` | `/app/ai-predictions` | Predizioni malattie e resa basate su AI |
| `JOURNAL` | `/app/journal` | Diario operativo con timeline attività |
| `INDIVIDUAL_PLANTS` | `/app/plants` | Gestione piante singole con tracking |
| `ORCHARD` | `/app/orchard` | Gestione completa frutteto |
| `VINEYARD` | `/app/vineyard` | Gestione completa vigneto |
| `OLIVE_GROVE` | `/app/olives` | Gestione completa oliveto |

### Funzionalità Sempre Attive

| Feature Flag | Descrizione |
|--------------|-------------|
| `PROFESSIONAL_DASHBOARD` | Dashboard professionale |
| `COLLABORATIVE_AI` | Sistema AI collaborativo |
| `PLANNER_BASE` | Pianificatore modulare base |
| `ANALYTICS` | Analytics avanzati |
| `CERTIFICATIONS_BASE` | Sistema certificazioni base |
| `IRRIGATION_BASE` | Irrigazione base |
| `NUTRITION_BASE` | Nutrizione base |
| `MECHANICAL_WORK_BASE` | Lavori meccanici base |
| `ADVICE_BASE` | Consigli AI base |

### Fase 2 - Moduli Alta Priorità (NON ATTIVI)

| Feature Flag | Descrizione |
|--------------|-------------|
| `IRRIGATION_ZONES` | Gestione zone irrigazione |
| `IRRIGATION_SCHEDULING` | Programmazione automatica |
| `IRRIGATION_ANALYTICS` | Analytics consumo acqua |
| `NUTRITION_INVENTORY` | Inventario prodotti |
| `NUTRITION_DOSE_CALCULATOR` | Calcolo dosi per zona |
| `NUTRITION_COMPATIBILITY` | Compatibilità prodotti |

### Fase 3 - Moduli Media Priorità (NON ATTIVI)

| Feature Flag | Descrizione |
|--------------|-------------|
| `EQUIPMENT_MANAGEMENT` | Gestione attrezzature |
| `MAINTENANCE_SCHEDULER` | Calendario manutenzioni |
| `OPERATIONAL_COSTS` | Costi operativi |
| `ADVANCED_CERTIFICATIONS` | Documenti avanzati |
| `SEASONAL_ADVICE` | Consigli stagionali |
| `PLANNER_WIZARD_EXTENDED` | Wizard piantagione esteso |
| `PLANNER_MATERIAL_SELECTOR` | Selezione materiale |
| `PLANNER_SEED_BANK` | Collegamento banca semi |

---

## 6. MODELLI DATI E DATABASE

### Database: Supabase (PostgreSQL)

#### Tabelle Principali

| Tabella | Descrizione |
|---------|-------------|
| `gardens` | Configurazioni giardini utente |
| `garden_beds` | Aiuole/contenitori nel giardino |
| `bed_planting_history` | Storico rotazione colture |
| `profiles` | Profili utente con tier |
| `calendar_tasks` | Task e attività programmate |
| `harvest_logs` | Log dei raccolti |
| `photo_logs` | Log fotografici |
| `seed_inventory` | Inventario semi |
| `seedling_batches` | Lotti piantine |

#### Tabelle Professionali

| Tabella | Descrizione |
|---------|-------------|
| `treatment_register` | Registro trattamenti fitosanitari |
| `mechanical_work_register` | Registro lavori meccanici |
| `professional_analytics` | Analytics professionali |
| `ai_credit_transactions` | Transazioni crediti AI |

#### Tabelle Sistema Archetipi

| Tabella | Descrizione |
|---------|-------------|
| `crop_archetypes` | Sistema classificazione 3 livelli |
| `crop_profiles` | Profili coltura (ET0, Kc) |
| `crop_aliases` | Alias regionali piante |

### Tipi di Giardino Supportati

```typescript
type GardenType =
  | 'OpenField'    // Campo aperto
  | 'Greenhouse'   // Serra
  | 'Tunnel'       // Tunnel
  | 'RaisedBed'    // Aiuola rialzata
  | 'Indoor'       // Interno
  | 'Hydroponic'   // Idroponico
  | 'Aquaponic'    // Acquaponico
  | 'Aeroponic'    // Aeroponico
  | 'NFT'          // Nutrient Film Technique
  | 'DWC'          // Deep Water Culture
  | 'EbbFlow'      // Ebb and Flow
  | 'Drip'         // A goccia
  | 'Wick'         // Wick system
  | 'Kratky'       // Metodo Kratky
```

### Tipi di Frutteto

```typescript
type OrchardType =
  | 'mixed'     // Misto
  | 'apple'     // Melo
  | 'pear'      // Pero
  | 'peach'     // Pesco
  | 'apricot'   // Albicocco
  | 'cherry'    // Ciliegio
  | 'plum'      // Susino
  | 'citrus'    // Agrumi
  | 'olive'     // Olivo
  | 'walnut'    // Noce
  | 'hazelnut'  // Nocciolo
  | 'almond'    // Mandorlo
  | 'tropical'  // Tropicali
```

---

## 7. TIPI TYPESCRIPT PRINCIPALI

### File Types Disponibili (41 file)

| File | Contenuto |
|------|-----------|
| `orchard.ts` | OrchardConfiguration, OrchardTree, PhenologicalObservation, PruningSchedule, HarvestSchedule, TreeTreatment |
| `vineyard.ts` | VineyardConfiguration, VineRow, VineBudLoad |
| `olive.ts` | OliveTreeConfiguration, OliveHarvestData |
| `irrigation.ts` | IrrigationZone, IrrigationSystem, IrrigationLog, IrrigationSchedule, WaterRequirement, IrrigationSensor |
| `nutrition.ts` | FertilizerProduct, TreatmentProduct, NutritionTreatment, NutritionSchedule, ProductCompatibility |
| `individualPlant.ts` | Tracking piante individuali con fenologia |
| `plantMonitoring.ts` | HealthAlert, DiseaseDetection |
| `activeAIAdvice.ts` | Sistema raccomandazioni AI |
| `auth.ts` | RegistrationData, UserProfile, AuthError |
| `gardenBed.ts` | Definizioni aiuole |
| `seedInventory.ts` | Inventario semi |
| `certifications.ts` | Certificazioni agricole |
| `prescriptionMaps.ts` | Mappe prescrizione |
| `healthAlert.ts` | Alert salute piante |
| `fruitTree.ts` | Alberi da frutto |
| `aromatic.ts` | Piante aromatiche |
| `strawberry.ts` | Fragole |
| `raspberry.ts` | Lamponi |
| `vine.ts` | Viti |
| `greenhouse.ts` | Configurazioni serra |
| `indoorGrowing.ts` | Coltivazione indoor |
| `customCrop.ts` | Colture personalizzate |
| `archetypes.ts` | Sistema archetipi |

### Interfaccia Orchard Tree

```typescript
interface OrchardTree {
  id: string
  orchardId: string
  gardenId: string

  // Identificazione
  treeNumber: string
  qrCode?: string

  // Posizione
  zoneId?: string
  rowNumber?: number
  positionInRow?: number
  gpsLatitude?: number
  gpsLongitude?: number

  // Caratteristiche
  variety: string
  rootstock?: string
  plantingDate?: string
  treeAgeYears?: number

  // Dimensioni
  trunkDiameterCm?: number
  treeHeightM?: number
  canopyWidthM?: number
  trainingSystem?: string

  // Stato
  healthStatus: 'healthy' | 'stressed' | 'diseased' | 'pest_damage' | 'weather_damage' | 'dead'
  vigorLevel: TreeVigorLevel
  productivityStatus: TreeProductivityStatus

  // Produzione
  expectedYieldKg?: number
  lastHarvestKg?: number
  cumulativeYieldKg: number

  // Flag gestione
  needsPruning: boolean
  needsTreatment: boolean
  needsReplacement: boolean
  isActive: boolean
}
```

### Interfaccia Irrigation Zone

```typescript
interface IrrigationZone {
  id: string
  gardenId: string
  name: string
  description?: string
  areaSqm: number
  soilType: 'clay' | 'loam' | 'sand' | 'mixed'
  slopePercentage: number
  sunExposure: 'full' | 'partial' | 'shade'
  drainageQuality: 'excellent' | 'good' | 'fair' | 'poor'
  waterRetention: 'high' | 'medium' | 'low'
  phLevel?: number
  organicMatterPercentage?: number
  isActive: boolean
  systems?: IrrigationSystem[]
}
```

### Interfaccia User Profile

```typescript
interface UserProfile {
  id: string

  // Informazioni personali
  firstName: string
  lastName: string
  phone?: string
  birthDate?: Date
  company?: string
  avatarUrl?: string

  // Stato sistema
  tier: 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE'
  emailVerified: boolean
  phoneVerified: boolean
  onboardingCompleted: boolean

  // AI e crediti
  aiCreditsTotal: number
  aiCreditsUsed: number

  // Preferenze
  preferences: {
    language: string
    timezone: string
    units: 'metric' | 'imperial'
    notifications: NotificationPreferences
  }
}
```

---

## 8. SERVIZI E BUSINESS LOGIC

### Servizi AI (~150+ file in `/services/`)

| Servizio | Dimensione | Descrizione |
|----------|------------|-------------|
| `geminiService.ts` | 43KB | Integrazione Google Gemini AI |
| `aiPredictiveEngine.ts` | - | Predizioni malattie e resa |
| `aiPlanningService.ts` | - | Pianificazione AI-powered |
| `aiSuggestionsService.ts` | - | Suggerimenti contestuali |
| `collaborativeAIService.ts` | - | Assistenza AI team |
| `aiProxyService.ts` | - | Proxy multi-provider AI |
| `contextAwareAIService.ts` | - | AI context-aware |
| `enhancedPromptService.ts` | - | Prompt engineering |

### Servizi Dominio Specializzati

| Servizio | Dimensione | Descrizione |
|----------|------------|-------------|
| `orchardService.ts` | 44KB | Operazioni frutteto |
| `vineyardService.ts` | - | Gestione vigneto |
| `oliveyardService.ts` | - | Gestione oliveto |
| `dailyDiaryService.ts` | 40KB | Gestione diario |
| `plantTrackingService.ts` | - | Tracking piante |
| `individualPlantService.ts` | - | Piante individuali |

### Servizi Irrigazione

| Servizio | Dimensione | Descrizione |
|----------|------------|-------------|
| `advancedIrrigationService.ts` | 41KB | Irrigazione avanzata |
| `irrigationCalculatorService.ts` | - | Calcoli ET0 e fabbisogno |
| `irrigationService.ts` | - | Core irrigazione |

### Servizi Nutrizione e Trattamenti

| Servizio | Dimensione | Descrizione |
|----------|------------|-------------|
| `advancedNutritionService.ts` | 37KB | Nutrizione avanzata |
| `biologicalControlService.ts` | - | Controllo biologico |
| `composterService.ts` | - | Gestione compost |
| `treatmentRegistryService.ts` | - | Registro trattamenti |
| `unifiedOperationsService.ts` | 40KB | Operazioni unificate |

### Servizi Analytics e Reporting

| Servizio | Dimensione | Descrizione |
|----------|------------|-------------|
| `costOptimizationService.ts` | 26KB | Ottimizzazione costi |
| `harvestTrackingService.ts` | - | Tracking raccolti |
| `historicalComparisonService.ts` | - | Confronto storico |
| `ndviSatelliteService.ts` | - | Analisi immagini satellitari |
| `diaryPredictiveEngine.ts` | 30KB | Engine predittivo diario |

### Servizi Integrazione

| Servizio | Dimensione | Descrizione |
|----------|------------|-------------|
| `droneIntegrationService.ts` | 25KB | Integrazione droni |
| `blockchainTraceabilityService.ts` | 23KB | Tracciabilità blockchain |
| `continuousMonitoringService.ts` | 23KB | Monitoraggio continuo |
| `photoAnalysisService.ts` | - | Analisi immagini |

### Servizi Utility

| Servizio | Descrizione |
|----------|-------------|
| `weatherService.ts` | Dati meteo e previsioni |
| `geoClimateService.ts` | Dati geografici e climatici |
| `fuzzySearchService.ts` | Ricerca intelligente |
| `plantMasterService.ts` | Database piante |
| `geolocationService.ts` | Servizi geolocalizzazione |
| `authErrorHandler.ts` | Gestione errori auth centralizzata |

---

## 9. CUSTOM HOOKS

| Hook | File | Descrizione |
|------|------|-------------|
| `useGarden` | `hooks/useGarden.ts` | Stato corrente giardino |
| `useWeather` | `hooks/useWeather.ts` | Dati meteo |
| `useFeature` | `hooks/useFeature.ts` | Controllo feature flags |
| `useAICredits` | `hooks/useAICredits.ts` | Gestione crediti AI |
| `useUserLocation` | `hooks/useUserLocation.ts` | Geolocalizzazione |
| `useDeviceOrientation` | `hooks/useDeviceOrientation.ts` | Orientamento device |
| `useOnboarding` | `hooks/useOnboarding.ts` | Flusso onboarding |
| `useProductCards` | `hooks/useProductCards.ts` | UI product cards |
| `useChallengeNotifications` | `hooks/useChallengeNotifications.ts` | Notifiche sfide |

---

## 10. COMPONENTI PRINCIPALI

### Componenti per Dominio (~126 totali)

| Directory | Componenti | Scopo |
|-----------|------------|-------|
| `/professional/` | TreatmentRegister, etc. | UI professionale |
| `/planner/` | DailyTip, etc. | Interfacce pianificazione |
| `/orchard/` | OrchardManagement | UI frutteto |
| `/vineyard/` | VineyardManagement | UI vigneto |
| `/garden/` | HarvestView, PlantCard, ManualTaskModal | Configurazione giardino |
| `/gardens/` | BedManager, BedForm, StructuresEditor | Gestione aiuole |
| `/plants/` | PlantManager | Tracking piante |
| `/calendar/` | CalendarTaskItem, DayView, WeekView | Viste calendario |
| `/treatments/` | TreatmentManager | Tracking trattamenti |
| `/ai/` | AIActionButton, AIAssistantWidget, FloatingAIWidget | Interfacce AI |
| `/health/` | HealthAlertSystem | Monitoraggio salute |
| `/analytics/` | PredictiveDashboard, UnifiedDashboard, YieldOptimizer | Analytics |
| `/auth/` | AuthGuard, LoginForm | UI autenticazione |
| `/ui/` | Button, Modal, Table, Select, ProgressBar | Primitivi UI |
| `/fertilizer/` | FertilizerInventory, FertilizerRecommendation | Gestione fertilizzanti |
| `/compliance/` | RiskManagementPlan, SelfAssessmentForm | Compliance |
| `/camera/` | PhotoCaptureModal | Cattura foto |
| `/chat/` | GardenChat | Chat AI |

### Componenti Standalone Principali

| Componente | Descrizione |
|------------|-------------|
| `Advice.tsx` | Interfaccia consigli AI (45KB) |
| `SeedInventory.tsx` | Gestione inventario semi |
| `SeedlingManager.tsx` | Gestione piantine |
| `WeatherWidget.tsx` | Widget meteo |
| `HarvestAnalytics.tsx` | Analytics raccolti |
| `DiseaseDiagnosis.tsx` | Diagnosi malattie |
| `PruningWizard.tsx` | Wizard potatura |
| `PlantingWizard.tsx` | Wizard piantagione |
| `PhotoTimelapse.tsx` | Timelapse fotografico |
| `GardenOnboarding.tsx` | Onboarding giardino |
| `GardenTypeWizard.tsx` | Wizard tipo giardino |

---

## 11. SISTEMA DI AUTENTICAZIONE

### Flusso Registrazione

1. Validazione email
2. Controllo forza password
3. Accettazione termini e privacy
4. Creazione profilo in tabella `profiles`
5. Verifica email (opzionale)

### Tipi di Errore Autenticazione

```typescript
enum RegistrationErrorType {
  INVALID_EMAIL = 'INVALID_EMAIL'
  WEAK_PASSWORD = 'WEAK_PASSWORD'
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD'
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS'
  TERMS_NOT_ACCEPTED = 'TERMS_NOT_ACCEPTED'
  PRIVACY_NOT_ACCEPTED = 'PRIVACY_NOT_ACCEPTED'
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH'
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

### File Chiave Autenticazione

| File | Scopo |
|------|-------|
| `lib/auth.server.ts` | Utility auth server-side |
| `lib/auth-bypass.ts` | Bypass sviluppo |
| `lib/session-manager.ts` | Gestione sessione |
| `services/authErrorHandler.ts` | Gestione errori centralizzata |
| `types/auth.ts` | Tipi TypeScript auth |

---

## 12. INTEGRAZIONI ESTERNE

### Supabase (Backend)

| Variabile Ambiente | Descrizione |
|--------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave pubblica |
| `SUPABASE_SERVICE_ROLE_KEY` | Chiave server-only |

**Funzionalità**: Database PostgreSQL, Autenticazione, Real-time

### Google Gemini AI

| Variabile Ambiente | Descrizione |
|--------------------|-------------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | API Key Google Gemini |

**Utilizzo**: Identificazione piante, diagnosi malattie, consigli trattamenti

### Provider AI Alternativi (Opzionali)

| Provider | Variabile Ambiente |
|----------|-------------------|
| OpenRouter | `NEXT_PUBLIC_OPENROUTER_API_KEY` |
| Groq | `NEXT_PUBLIC_GROQ_API_KEY` |
| HuggingFace | `NEXT_PUBLIC_HUGGINGFACE_API_KEY` |
| Mistral | `NEXT_PUBLIC_MISTRAL_API_KEY` |
| OpenAI | `NEXT_PUBLIC_OPENAI_API_KEY` |

---

## 13. DATI MASTER E REFERENCE

### File Dati Principali (`/data/` ~1.8MB)

| File | Dimensione | Contenuto |
|------|------------|-----------|
| `plantMasterSheets.ts` | 306KB | Database completo piante |
| `fruitTreeMasterSheets.ts` | 82KB | Varietà alberi da frutto |
| `exoticFruitMasterSheets.ts` | 46KB | Frutti esotici |
| `strawberryMasterSheets.ts` | 34KB | Varietà fragole |
| `varietyMappings.ts` | 20KB | Mappature varietà |
| `almanacco-database.ts` | 46KB | Dati calendario lunare |

### Reference Data

| File | Contenuto |
|------|-----------|
| `plantAliases.ts` | Nomi regionali piante |
| `plantVarieties.ts` | Varietà colture |
| `archetypeProfiles.ts` | Definizioni archetipi |
| `diseaseDatabase.ts` | Database malattie e parassiti |
| `companionPlanting.ts` | Regole consociazione |
| `phytoproducts.ts` | Database prodotti fitosanitari |
| `fertilizers.ts` | Specifiche fertilizzanti |
| `fruitTreeProfiles.ts` | Profili alberi da frutto |
| `irrigationTemplates.ts` | Template irrigazione |

---

## 14. SCRIPT E COMANDI

### Script NPM Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia sviluppo (porta 3002) |
| `npm run dev:turbo` | Sviluppo con Turbopack |
| `npm run build` | Build produzione |
| `npm start` | Avvia server produzione |
| `npm run type-check` | Verifica TypeScript |
| `npm run type-check:watch` | Verifica TypeScript watch |
| `npm run check` | Type-check + build |
| `npm run pre-deploy` | Validazione pre-deploy |
| `npm run pre-deploy:fast` | Pre-deploy senza build |

### Script Utility (`/scripts/`)

| Script | Descrizione |
|--------|-------------|
| `pre-deploy-check.js` | Validazione pre-deployment |
| `generatePlantTaxonomyMigration.ts` | Generazione migrazione tassonomia |
| `applyPlantTaxonomyMigration.ts` | Applicazione migrazione |
| `test-health-check.ts` | Test health check |

---

## 15. SISTEMA TIER UTENTE

### Tier Disponibili

| Tier | Descrizione |
|------|-------------|
| `FREE` | Piano gratuito |
| `PROFESSIONAL` | Piano professionale |
| `ENTERPRISE` | Piano enterprise |

**Nota**: L'applicazione attualmente opera con tier PRO unico con tutte le funzionalità abilitate.

### Funzionalità per Tier (PRO)

- Giardini, task, log raccolti illimitati
- Analytics avanzati
- Registro trattamenti
- Rotazione colture
- Export CSV/PDF
- Sync cloud
- Tracciabilità blockchain

---

## 16. VARIABILI D'AMBIENTE

```env
# AI - Richiesto
NEXT_PUBLIC_GEMINI_API_KEY=

# AI - Opzionali (fallback)
NEXT_PUBLIC_OPENROUTER_API_KEY=
NEXT_PUBLIC_GROQ_API_KEY=
NEXT_PUBLIC_HUGGINGFACE_API_KEY=
NEXT_PUBLIC_MISTRAL_API_KEY=
NEXT_PUBLIC_OPENAI_API_KEY=

# Database - Richiesto
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Feature Flags - Override opzionali
NEXT_PUBLIC_FEATURE_AI_PREDICTIONS=
NEXT_PUBLIC_FEATURE_JOURNAL=
NEXT_PUBLIC_FEATURE_INDIVIDUAL_PLANTS=
NEXT_PUBLIC_FEATURE_ORCHARD=
NEXT_PUBLIC_FEATURE_VINEYARD=
NEXT_PUBLIC_FEATURE_OLIVE_GROVE=
```

---

## 17. RIEPILOGO FUNZIONALITA'

### Gestione Terreno

- **Giardini multipli** con diversi tipi (campo aperto, serra, tunnel, idroponico, etc.)
- **Aiuole e contenitori** con configurazione dimensioni e esposizione
- **Zone** per organizzazione del terreno
- **Rotazione colture** con storico per aiuola

### Pianificazione

- **Smart Planner** con suggerimenti AI
- **Pianificatore classico** per approccio tradizionale
- **Calendario task** con fasi lunari
- **Almanacco** agricolo integrato

### Monitoraggio Piante

- **Tracking piante individuali** con fenologia
- **Monitoraggio salute** con alert malattie
- **Diagnosi AI** tramite foto
- **Predizioni** malattie e resa

### Colture Specializzate

- **Frutteto** - gestione albero per albero
- **Vigneto** - tracking fenologico viti
- **Oliveto** - gestione ulivi

### Operazioni

- **Diario operativo** con timeline
- **Trattamenti fitosanitari** con registro
- **Irrigazione** con calcolo fabbisogno
- **Nutrizione** e fertilizzazione
- **Lavori meccanici**

### Analytics e Report

- **Dashboard analytics** avanzati
- **Confronto stagioni**
- **Export** CSV e PDF
- **Mappe prescrizione** satellitari
- **Indici NDVI**

### Certificazioni

- **Biologico**
- **GlobalGAP**
- **Tracciabilità** blockchain

---

## 18. ARCHITETTURA TECNICA

### Pattern Utilizzati

- **Next.js App Router** - Routing moderno file-based
- **Service Layer Pattern** - Separazione business logic
- **Context API** - State management React
- **Storage Abstraction** - Provider storage flessibili
- **Feature Flags** - Rollout progressivo funzionalità
- **Type-Safe Queries** - TypeScript throughout

### Struttura Componenti

```
components/
├── ui/           # Primitivi UI riutilizzabili
├── shared/       # Componenti condivisi
├── [domain]/     # Componenti per dominio
└── [feature].tsx # Componenti feature standalone
```

### Struttura Servizi

```
services/
├── *Service.ts      # Servizi dominio
├── *Engine.ts       # Engine computazionali
├── *Calculator.ts   # Calcolatori specifici
└── *Handler.ts      # Handler errori/eventi
```

---

*Documento generato analizzando il codice sorgente di OrtoMio AI*
*Tutti i dati sono estratti direttamente dai file del progetto*
