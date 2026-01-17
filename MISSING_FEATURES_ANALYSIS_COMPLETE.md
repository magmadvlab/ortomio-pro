# ANALISI COMPLETA FUNZIONALITÀ MANCANTI

## STATO ATTUALE DOPO ANALISI

### ✅ FUNZIONALITÀ GIÀ PRESENTI NELLA NUOVA APP
- **Agronomist System**: ✅ Completo (`components/AgronomistManager.tsx`, `services/agronomistService.ts`)
- **Multi-tenancy System**: ✅ Completo (appena implementato)
- **API Keys Management**: ✅ Completo (appena implementato)
- **Componenti Seedling**: ✅ Parziali (`components/seedling/SeedlingDashboard.tsx`, `components/seedling/SeedingProgressCard.tsx`)

### ❌ FUNZIONALITÀ CRITICHE MANCANTI

## 1. BANCA DEI SEMI (SEED BANK) - PRIORITÀ CRITICA 🔴

### Cosa manca:
- **Route dedicata**: `/app/semenzaio` non esiste nella nuova app
- **Componente SeedInventory**: Non presente nella nuova app
- **Servizio seedInventoryService**: Non presente nella nuova app
- **Gestione pacchetti semi**: Sistema completo di inventario semi

### Funzionalità della vecchia app:
```typescript
// Dalla vecchia app: vcchiortomio/vecchia app/app/(dashboard)/app/semenzaio/page.tsx
- 📦 Banca dei Semi completa
- 🌱 Gestione lotti piantine  
- 🌳 Gestione alberelli
- Integrazione con planner per consumo semi
- Tracking scadenze e quantità
- Sistema di avvisi per semi in scadenza
```

### Componenti da portare:
1. `SeedInventory.tsx` - Gestione inventario semi
2. `SeedlingDashboard.tsx` - Dashboard piantine (già presente ma non integrato)
3. `SaplingDashboard.tsx` - Gestione alberelli
4. `seedInventoryService.ts` - Servizio gestione semi
5. Route `/app/semenzaio` - Pagina principale vivaio

## 2. SISTEMA REGISTRAZIONE PIANTINE - PRIORITÀ CRITICA 🔴

### Cosa manca:
- **PlantingWizard**: Sistema step-by-step per registrazione materiale
- **Selezione materiale**: Seed/Seedling/Sapling nel planner
- **Integrazione banca semi**: Consumo automatico semi dal planner
- **Batch tracking**: Sistema lotti piantine con fasi crescita

### Funzionalità della vecchia app:
```typescript
// Dalla vecchia app: components/PlantingWizard.tsx
- Wizard 4 step per registrazione piante
- Selezione metodo: Seme/Piantina/Alberello
- Integrazione con banca semi
- Selezione stagione (Estivo/Invernale)
- Selezione posizione (Terra/Vaso/Vassoio/Letto)
- Calcolo automatico task type (Sowing/Transplant)
```

### Componenti da portare:
1. `PlantingWizard.tsx` - Wizard registrazione completo
2. Integrazione nel planner per selezione materiale
3. Sistema batch tracking piantine
4. Collegamento banca semi → planner → semenzaio

## 3. PAGINE SPECIALIZZATE MANCANTI - PRIORITÀ ALTA 🟠

### Frutteto (`/app/orchard`) - Solo placeholder
**Vecchia app aveva:**
- Wizard creazione frutteto completo
- Gestione alberi da frutto specifici
- Task specifici per frutteto (potatura, raccolta)
- Gestione varietà e portinnesti

### Vigneto (`/app/vineyard`) - Solo placeholder  
**Vecchia app aveva:**
- Wizard creazione vigneto completo
- Gestione viti e varietà
- Task specifici vigneto (potatura, vendemmia)
- Gestione filari e zone

### Oliveto (`/app/olives`) - Solo placeholder
**Vecchia app aveva:**
- Wizard creazione oliveto completo
- Gestione olivi e varietà
- Task specifici oliveto (potatura, raccolta)
- Gestione impianti

## 4. FUNZIONALITÀ AVANZATE MANCANTI - PRIORITÀ MEDIA 🟡

### AI Predictions UI
- **Servizio presente**: ✅ `services/aiPredictiveEngine.ts`
- **UI mancante**: ❌ Route `/app/ai-predictions`
- **Componenti**: Predizioni malattie, resa, confidence score

### Diario Operativo Route
- **Componente presente**: ✅ `components/diary/OperationalDiary.tsx`
- **Route mancante**: ❌ `/app/journal`

### Piante Individuali Route  
- **Componenti presenti**: ✅ Sistema plant monitoring completo
- **Route mancante**: ❌ `/app/plants`

### NDVI e Prescription Maps UI
- **Servizi presenti**: ✅ `services/ndviSatelliteService.ts`, `services/prescriptionMapsService.ts`
- **UI dedicate mancanti**: ❌ Route specifiche

## PIANO DI IMPLEMENTAZIONE PRIORITARIO

### FASE 1: BANCA SEMI E SEMENZAIO (CRITICA)
1. ✅ Creare route `/app/semenzaio`
2. ✅ Portare `SeedInventory.tsx` dalla vecchia app
3. ✅ Creare `seedInventoryService.ts`
4. ✅ Integrare `SeedlingDashboard.tsx` esistente
5. ✅ Portare `SaplingDashboard.tsx`

### FASE 2: PLANTING WIZARD (CRITICA)
1. ✅ Portare `PlantingWizard.tsx` dalla vecchia app
2. ✅ Integrare nel planner per selezione materiale
3. ✅ Collegare banca semi con planner
4. ✅ Sistema batch tracking piantine

### FASE 3: PAGINE SPECIALIZZATE (ALTA)
1. ✅ Implementare wizard frutteto completo
2. ✅ Implementare wizard vigneto completo  
3. ✅ Implementare wizard oliveto completo
4. ✅ Task specifici per ogni tipo impianto

### FASE 4: UI MANCANTI (MEDIA)
1. ✅ Route AI Predictions con UI dedicata
2. ✅ Route Journal per diario operativo
3. ✅ Route Plants per piante individuali
4. ✅ UI NDVI e Prescription Maps

## DETTAGLI TECNICI IMPLEMENTAZIONE

### File da creare/modificare:

#### Nuove route:
- `app/app/semenzaio/page.tsx` - Pagina vivaio completa
- `app/app/journal/page.tsx` - Diario operativo
- `app/app/plants/page.tsx` - Piante individuali
- `app/app/ai-predictions/page.tsx` - Predizioni AI

#### Nuovi componenti:
- `components/SeedInventory.tsx` - Inventario semi
- `components/PlantingWizard.tsx` - Wizard registrazione
- `components/SaplingDashboard.tsx` - Gestione alberelli
- `components/orchard/OrchardWizard.tsx` - Wizard frutteto
- `components/vineyard/VineyardWizard.tsx` - Wizard vigneto
- `components/olives/OliveGroveWizard.tsx` - Wizard oliveto

#### Nuovi servizi:
- `services/seedInventoryService.ts` - Gestione inventario semi
- `services/seedlingService.ts` - Gestione lotti piantine
- `services/saplingService.ts` - Gestione alberelli

#### Tipi da aggiungere:
- `types/seedInventory.ts` - Tipi per banca semi
- `types/seedling.ts` - Tipi per piantine (già parzialmente presente)
- `types/sapling.ts` - Tipi per alberelli

#### Migrazioni database:
- Tabelle per inventario semi
- Tabelle per lotti piantine
- Tabelle per alberelli
- Relazioni con gardens e tasks

## STIMA IMPLEMENTAZIONE

### Fase 1 (Banca Semi): 2-3 giorni
### Fase 2 (Planting Wizard): 2-3 giorni  
### Fase 3 (Pagine Specializzate): 3-4 giorni
### Fase 4 (UI Mancanti): 2-3 giorni

**TOTALE: 9-13 giorni di sviluppo**

## CONCLUSIONI

La nuova app ha un'architettura molto più moderna e modulare, ma manca di alcune funzionalità chiave che erano presenti nella vecchia app:

1. **Sistema Banca Semi completo** - Fondamentale per gestione professionale
2. **Planting Wizard con selezione materiale** - Essenziale per workflow completo
3. **Pagine specializzate per frutteti/vigneti/oliveti** - Necessarie per utenti professionali
4. **UI per servizi già implementati** - Molti servizi esistono ma mancano le interfacce

La priorità assoluta è implementare la **Banca Semi** e il **Planting Wizard** perché sono funzionalità core che gli utenti si aspettano di trovare.