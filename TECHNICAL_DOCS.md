# 🔧 Documentazione Tecnica OrtoMio

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

```
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
│   └── VisualGardenPlanner.tsx # Planner grafico
│
├── logic/               # Motori di calcolo
│   ├── lifecycleEngine.ts      # Fasi crescita
│   ├── nutrientEngine.ts        # Calcolo NPK
│   ├── healthEngine.ts          # Trattamenti
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
│   └── taskCalculationService.ts # Calcoli attività
│
├── data/                # Dati statici
│   ├── plantMasterSheets.ts     # Schede master piante
│   ├── plantVarieties.ts        # Varietà
│   ├── treatments.ts            # Prodotti fitosanitari
│   ├── companionPlanting.ts     # Regole consociazioni
│   ├── bioPrices.ts             # Prezzi bio
│   └── varietyMappings.ts       # Mappature varietà
│
├── types.ts             # Definizioni TypeScript
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

#### plantMasterService.ts
**Responsabilità**: Accesso database piante

**Funzioni principali**:
- `getMasterSheet()`: Scheda master per pianta
- `getAllMasterSheets()`: Tutte le schede

**Dati**: `data/plantMasterSheets.ts` con schede complete

#### recipeService.ts
**Responsabilità**: Generazione ricette AI

**Funzioni principali**:
- `getRecipesForHarvest()`: Genera ricette per raccolto

**Schema ricetta**:
- Nome
- Ingredienti (array)
- Istruzioni (array)
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
  sunExposure?: 'FullSun' | 'PartialSun' | 'PartialShade' | 'FullShade';
  sunHours?: number;
  orientation?: 'North' | 'South' | 'East' | 'West' | ...;
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
  germination: { /* ... */ };
  seedling: { /* ... */ };
  transplanting: { /* ... */ };
  baseInstructions: { /* ... */ };
  susceptibility: { /* ... */ };
  irrigationDetails?: IrrigationDetails;
  // ... altri campi
}
```

Vedi `types.ts` per tutte le definizioni complete.

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

## Estensibilità

### Aggiungere Nuova Pianta

1. Aggiungi scheda in `data/plantMasterSheets.ts`:
```typescript
{
  id: 'nuova-pianta',
  commonName: 'NOME',
  scientificName: 'Nome scientifico',
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

**Documentazione Tecnica OrtoMio** - Versione 1.0

