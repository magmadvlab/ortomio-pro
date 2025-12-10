# OrtoMio AI - Architettura

## Panoramica

OrtoMio AI è un'applicazione React TypeScript che fornisce assistenza agronomica personalizzata per giardinieri italiani. L'architettura è progettata per supportare sia una versione Free (localStorage) che Pro (Supabase cloud).

## Architettura a Livelli

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                              │
│  Dashboard | Planner | Journal | HarvestLog | etc.      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 Feature Flags Layer                     │
│              TierProvider (FREE/PRO)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Storage Abstraction Layer                  │
│  IStorageProvider → LocalStorageProvider                │
│                    ↓ SupabaseStorageProvider            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Logic Engines                          │
│  Director | Nutrient | Health | Lifecycle | etc.       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Data Layer                                  │
│  localStorage (Free) | Supabase (Pro)                   │
└─────────────────────────────────────────────────────────┘
```

## Componenti Principali

### Storage Abstraction

L'app usa un'interfaccia `IStorageProvider` che permette di switchare tra localStorage (Free) e Supabase (Pro) senza modificare il codice dell'applicazione.

**File:**
- `packages/core/storage/interface.ts` - Interfaccia
- `packages/storage-local/LocalStorageProvider.ts` - Implementazione localStorage
- `packages/storage-cloud/SupabaseStorageProvider.ts` - Implementazione Supabase
- `packages/core/storage/factory.ts` - Factory per creare provider

### Feature Flags (Tier System)

Il sistema di tier permette di abilitare/disabilitare funzionalità in base alla versione (Free/Pro).

**File:**
- `packages/core/config/tiers.ts` - Configurazione tier
- `packages/core/context/TierContext.tsx` - React Context
- `packages/core/hooks/useTier.ts` - Hook per accesso tier

### Logic Engines

Motori logici puri (pure functions) che calcolano consigli agronomici:

- **Director** (`logic/director.ts`) - Orchestratore centrale
- **Nutrient Engine** (`logic/nutrientEngine.ts`) - Calcolo fabbisogni NPK
- **Health Engine** (`logic/healthEngine.ts`) - Prevenzione malattie
- **Lifecycle Engine** (`logic/lifecycleEngine.ts`) - Gestione fasi crescita
- **Rotation Engine** (`logic/rotationEngine.ts`) - Rotazione culturale
- **Companion Engine** (`logic/companionEngine.ts`) - Consociazioni
- **Seasonal Engine** (`logic/seasonalEngine.ts`) - Consigli stagionali

## Flusso Dati Free vs Pro

### Free Tier
1. Dati salvati in `localStorage`
2. `LocalStorageProvider` gestisce CRUD
3. Nessuna sincronizzazione cloud
4. Limiti: 1 orto, 50 task, 20 semi

### Pro Tier
1. Dati salvati in Supabase PostgreSQL
2. `SupabaseStorageProvider` gestisce CRUD
3. Sincronizzazione automatica
4. Nessun limite
5. Features aggiuntive: time-lapse, analytics, meteo avanzato

## Database Schema (Supabase)

Vedi `database/schema.sql` per schema completo.

Tabelle principali:
- `gardens` - Orti utente
- `garden_tasks` - Task e attività
- `garden_beds` - Aiuole
- `bed_planting_history` - Storico rotazioni
- `harvest_logs` - Raccolti
- `photo_logs` - Foto time-lapse (Pro)
- `seed_inventory` - Inventario semi
- `weather_cache` - Cache previsioni meteo

## Security

- **Row Level Security (RLS)** su tutte le tabelle Supabase
- Ogni utente può accedere solo ai propri dati
- Validazione input lato client e server

## Performance

- **Caching intelligente**: Weather cache (24h), calcoli ripetuti
- **Lazy loading**: Componenti Pro caricati solo se necessario
- **Code splitting**: Possibile con dynamic imports

## Estendibilità

L'architettura è progettata per essere facilmente estendibile:
- Nuovi motori logici: aggiungere in `logic/`
- Nuove features Pro: aggiungere in tier config
- Nuovi storage providers: implementare `IStorageProvider`

